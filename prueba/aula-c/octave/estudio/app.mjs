import {leerTextos, traducir} from './textos.mjs';
import {analizarWhos, snapshotCode, seccionActual} from './variables.mjs';
import {NucleoWeb} from './nucleo.mjs';
import {decodificarImagen,rutaProyecto,guardarArchivo,leerBinario,pngDesdeRaw,instalarPDI,iniciarPDI} from './archivos.mjs';
import {analizarFiguras,PestanasFiguras} from './figuras.mjs';

const $ = id => document.getElementById(id);
const response = await fetch('./contenido/textos/es.toml');
if (!response.ok) throw Error(String(response.status));
const textos = leerTextos(await response.text()), t = (key,data) => traducir(textos,key,data);
for (const node of document.querySelectorAll('[data-text]')) node.textContent = t(node.dataset.text);
for (const node of document.querySelectorAll('[data-label]')) node.setAttribute('aria-label',t(node.dataset.label));
for (const node of document.querySelectorAll('[data-title]')) node.title = t(node.dataset.title);
document.title = t('app.title');

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key,value) { try { localStorage.setItem(key,value); } catch (error) { console.warn(error); } }
};
let editor, model, codeConsole, busy = true, generation = 0, historyIndex = 0, draft = '';
const history = [], renderers = new Map();
const frame = $('runtime');
const kernel = new NucleoWeb({frame,t});
const tabs = new PestanasFiguras($('figure-tabs'),$('figures'),document), project = new Map();
let downloads = [], streamTail = '';
function contents() {return kernel.app.serviceManager.contents;}
kernel.preparar=()=>{
  const filename=$('filename').textContent;
  const folder=filename.includes('/')?rutaProyecto(filename).split('/').slice(0,-1).join('/'):'';
  const path=`/drive/${folder}`.replaceAll("'","''");
  return kernel.ejecutar(`${iniciarPDI} if exist('${path}','dir'), cd('${path}'); endif`,()=>{},true);
};
const code = () => model ? model.sharedModel.getSource() : $('fallback').value;
function setCode(value) { if (model) model.sharedModel.setSource(value); else $('fallback').value = value; saveDraft(); }
function saveDraft() { storage.set('aulac-octave-code',code()); storage.set('aulac-octave-name',$('filename').textContent); }
$('fallback').value = storage.get('aulac-octave-code') ?? t('example.code');
$('filename').textContent = storage.get('aulac-octave-name') || t('example.name');
$('fallback').oninput = saveDraft;
function setBusy(value,key = value ? 'state.busy' : 'state.ready') {
  busy = value; $('state').textContent = t(key);
  for (const node of document.querySelectorAll('[data-action="run"], [data-action="run-section"], #send, #command')) node.disabled = value;
}
function output(value,type = '') {
  const span = document.createElement('span'); span.className = type; span.textContent = value;
  $('console').append(span); $('console').scrollTop = $('console').scrollHeight;
}
function formatearResultado(value) {
  const match=value.match(/^([A-Za-z_]\w*)\s*=\s*([^\n]*)(?:\n([\s\S]*))?$/);
  if(!match) return value;
  const rows=[match[2],...(match[3] || '').split(/\r?\n/)].map(line=>line.trim()).filter(Boolean);
  if(rows.length<2) return value;
  return `${match[1]} =\n\n${rows.map(line=>'   '+line.split(/\s+/).join('   ')).join('\n')}`;
}
function failure(error) { console.error(error); output(error.message+'\n','error'); $('state').textContent=t('state.error'); }
function syncTheme() {
  const theme = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  const doc = frame.contentDocument;
  if (doc) doc.documentElement.dataset.theme = theme;
}
const savedTheme = storage.get('aulac-octave-theme');
if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.dataset.theme = savedTheme;
function theme() {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  storage.set('aulac-octave-theme',document.documentElement.dataset.theme); syncTheme();
  if(!busy && tabs.entries.size) {
    setBusy(true);
    captureFigures().catch(failure).finally(()=>setBusy(false));
  }
}
$('theme').onclick = theme;
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',syncTheme);

async function showFigure(msg) {
  const data = msg.content.data || {}, mime = 'application/vnd.plotly.v1+json';
  if (!data[mime] && !data['image/svg+xml'] && !data['image/png']) return false;
  const id = msg.content.transient?.display_id || crypto.randomUUID();
  if ($('figures').firstElementChild?.tagName === 'P') $('figures').replaceChildren();
  let entry = renderers.get(id);
  if (data[mime]) {
    // Esta versión del renderer ignora renderModel si ya contiene una gráfica.
    // Recrearlo permite que update_display_data sustituya la figura real.
    entry?.renderer?.dispose();
    const container=entry?.container || tabs.obtener(id,data[mime]?.layout?.title?.text || t('figures.alt',{n:renderers.size+1}));
    const renderer=codeConsole.rendermime.createRenderer(mime);
    container.replaceChildren(renderer.node);
    entry={renderer,container}; renderers.set(id,entry);
    const plot=structuredClone(data[mime]);
    plot.layout={...plot.layout,autosize:true}; delete plot.layout.width;
    plot.config={...plot.config,responsive:true,displayModeBar:false};
    await renderer.renderModel({data:{...data,[mime]:plot},metadata:msg.content.metadata || {},trusted:true,setData:()=>{}});
  } else {
    const image = document.createElement('img');
    image.alt = t('figures.alt',{n:renderers.size+1});
    image.src = data['image/svg+xml'] ? 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(data['image/svg+xml']) : 'data:image/png;base64,'+data['image/png'];
    if (entry) entry.container.replaceChildren(image);
    else { const container=tabs.obtener(id,image.alt); container.append(image); renderers.set(id,{container}); }
  }
  return true;
}
function clearFigures() {
  for (const entry of renderers.values()) entry.renderer?.dispose();
  renderers.clear(); tabs.limpiar();
}
async function captureFigures() {
  let source='';
  await kernel.ejecutar('aulac_figuras();',msg=>{if(msg.header.msg_type==='stream')source+=msg.content.text;},true,{silent:false});
  const figures=analizarFiguras(source), active=tabs.active;
  // Si se cerraron todas las figuras nativas, tampoco deben quedar pestañas antiguas.
  if(!figures.length) {clearFigures();return;}
  const captured=figures.filter(f=>f.axes.length);
  if(!captured.length) return;
  clearFigures();
  for(const figure of captured) {
    const container=tabs.obtener(figure.id,figure.name); container.className='figure-capture';
    const ordered=[...figure.axes].sort((a,b)=>(b.position[1]-a.position[1]) || (a.position[0]-b.position[0]));
    const columns=ordered.length===6 ? 3 : ordered.length===2 ? 2 : 1;
    for(const [index,ax] of ordered.entries()) {
      const cell=document.createElement('section'), heading=document.createElement('p'); heading.textContent=ax.title;
      const [x,y,w,h]=ax.position;
      const rows=Math.ceil(ordered.length/columns);
      const layoutPosition=ordered.length>1 ? [(index%columns)/columns,1-(Math.floor(index/columns)+1)/rows,1/columns,1/rows] : [x,y,w,h];
      Object.assign(cell.style,{left:`${layoutPosition[0]*100}%`,top:`${(1-layoutPosition[1]-layoutPosition[3])*100}%`,width:`${layoutPosition[2]*100}%`,height:`${layoutPosition[3]*100}%`});
      cell.append(heading); container.append(cell);
      if(ax.kind==='image') {
        const image=document.createElement('img'), url=URL.createObjectURL(await pngDesdeRaw(await leerBinario(contents(),ax.path)));
        image.src=url; image.alt=ax.title; image.onload=()=>URL.revokeObjectURL(url); cell.append(image);
      } else {
        cell.classList.add('surface-cell');
        const file=await contents().get(ax.path,{format:'text',content:true});
        const matrix=file.content.trim().split(/\r?\n/).map(line=>line.split(',').map(Number)), n=matrix.length/3;
        const colorFile=await contents().get(ax.path+'.map',{format:'text',content:true});
        const colors=colorFile.content.trim().split(/\r?\n/).map(line=>line.split(',').map(Number));
        const dark=document.documentElement.dataset.theme!=='light';
        const colorscale=colors.map((rgb,i)=>[i/Math.max(1,colors.length-1),`rgb(${rgb.map(c=>Math.round((dark ? 55+200*c : 255*c))).join(',')})`]);
        const renderer=codeConsole.rendermime.createRenderer('application/vnd.plotly.v1+json'); cell.append(renderer.node);
        renderers.set(`${figure.id}:${ax.path}`,{renderer,container:cell});
        const background=getComputedStyle(document.documentElement).getPropertyValue('--aulac-fondo').trim();
        const foreground=getComputedStyle(document.documentElement).color;
        await renderer.renderModel({data:{'application/vnd.plotly.v1+json':{data:[{type:'surface',x:matrix.slice(0,n),y:matrix.slice(n,2*n),z:matrix.slice(2*n),colorscale,showscale:false,contours:{z:{show:true,usecolormap:false,color:foreground,width:1}}, lighting:{ambient:0.8,diffuse:0.9}, lightposition:{x:100,y:200,z:100}}],layout:{autosize:false,width:cell.clientWidth,height:Math.min(cell.clientHeight-heading.offsetHeight,cell.clientWidth*1.1),paper_bgcolor:background,plot_bgcolor:background,scene:{bgcolor:background,aspectmode:'manual',aspectratio:{x:1,y:1,z:0.5},camera:{eye:{x:1.35,y:1.35,z:1.1},projection:{type:'orthographic'}},xaxis:{color:foreground,gridcolor:foreground,showbackground:false},yaxis:{color:foreground,gridcolor:foreground,showbackground:false},zaxis:{color:foreground,gridcolor:foreground,showbackground:false}},margin:{l:0,r:0,t:0,b:0}},config:{responsive:true,displayModeBar:false}}},metadata:{},trusted:true,setData:()=>{}});
        const fit=()=>{
          const width=renderer.node._fullLayout?.width || renderer.node.scrollWidth;
          if(!width || !cell.clientWidth) return;
          renderer.node.style.flex='none'; renderer.node.style.width=`${width}px`;
          renderer.node.style.transformOrigin='top left';
          renderer.node.style.transform=`scale(${Math.min(1,cell.clientWidth/width)})`;
        };
        fit(); new ResizeObserver(fit).observe(cell);
        if(ax.reduced) {const notice=document.createElement('small');notice.textContent=t('figures.reduced');cell.append(notice);}
      }
    }
  }
  if(tabs.entries.has(active)) tabs.seleccionar(active);
}
async function offerDownloads() {
  for(const path of downloads.splice(0)) {
    const blob=await pngDesdeRaw(await leerBinario(contents(),path)), link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download=path.replace(/^\.aulac\/out\//,'').replace(/\.raw$/,'').replace(/\.[^.\/]+$/,'')+'.png';
    link.textContent=t('files.download',{name:link.download}); $('downloads').append(link);
  }
}
async function snapshot() {
  let source = '';
  await kernel.ejecutar(snapshotCode,msg => { if (msg.header.msg_type === 'stream') source += msg.content.text; },true,{silent:false});
  const rows = analizarWhos(source);
  $('variables').replaceChildren(...rows.map(row => {
    const tr = document.createElement('tr');
    const displayValue=row.value || (row.size.reduce((a,b)=>a*b,1)===1 && ['double','single','logical','int8','uint8','int16','uint16','int32','uint32','int64','uint64'].includes(row.class) ? '1' : `[${row.size.join('×')} ${row.class}]`);
    for (const value of [row.name,row.size.join('×'),row.class,displayValue]) { const td=document.createElement('td'); td.textContent=value; tr.append(td); }
    if(row.class==='uint8' && (row.size.length===2 || row.size.length===3 && row.size[2]===3)) {
      tr.title=t('workspace.preview'); tr.ondblclick=()=>execute(`figure('Name','${row.name}'); imshow(${row.name});`);
    }
    return tr;
  }));
  $('empty').hidden = rows.length > 0;
}
async function refreshWorkspace() {
  try { await snapshot(); }
  catch (error) { failure(error); }
}
async function execute(source) {
  if (busy || !source.trim()) return;
  const hadAnsBefore=[...$('variables').rows].some(row=>row.cells[0]?.textContent==='ans');
  setBusy(true); const current = generation, figures = []; let failed = false;
  streamTail='';
  history.push(source); historyIndex = history.length; draft = '';
  const item=document.createElement('li'), button=document.createElement('button');
  button.textContent=source; button.onclick=()=>{ $('command').value=source; $('command').focus(); }; item.append(button); $('history').append(item);
  output(($('console').textContent && !$('console').textContent.endsWith('\n') ? '\n' : '')+'>> '+source+'\n');
  try {
    await kernel.ejecutar(source,msg => {
      switch (msg.header.msg_type) {
        case 'stream':
          {const lines=(streamTail+msg.content.text).split(/\r?\n/); streamTail=lines.pop();
          for(const line of lines) if(line.startsWith('__AULAC_DOWNLOAD__')) downloads.push(line.slice(18));}
          output(msg.content.text,msg.content.name === 'stderr' ? 'error' : ''); break;
        case 'error': console.error(msg.content); break;
        case 'clear_output': clearFigures(); break;
        case 'display_data': case 'update_display_data': case 'execute_result':
          figures.push(showFigure(msg).catch(failure));
          if (msg.content.data?.['text/plain'] && !msg.content.data?.['application/vnd.plotly.v1+json']) output(formatearResultado(msg.content.data['text/plain']).trimEnd());
          break;
      }
    });
  } catch (error) { failed = true; if (current === generation) failure(error); }
  finally {
    if (current === generation) {
      try { await Promise.all(figures); } catch(error) { failed = true; failure(error); }
      const lastStatement=source.split(/\r?\n/).map(line=>line.replace(/%.*$/,'').trim()).filter(Boolean).at(-1) || '';
      const internalAns=!/\bans\b/.test(source) && !hadAnsBefore && (lastStatement.endsWith(';') || /(?:^|[;\n])\s*[A-Za-z_]\w*\s*=(?!=)/m.test(source));
      try { await snapshot(); } catch(error) { failed = true; failure(error); }
      if(kernel.preparar) {
        try { await captureFigures(); await offerDownloads(); } catch(error) { failed=true; failure(error); }
      }
      if(internalAns && [...$('variables').rows].some(row=>row.cells[0]?.textContent==='ans')) {
        await kernel.ejecutar('clear ans;',()=>{},true);
        for(const row of [...$('variables').rows]) if(row.cells[0]?.textContent==='ans') row.remove();
      }
      setBusy(false,failed ? 'state.error' : 'state.ready');
    }
  }
}
async function stop() {
  if (!kernel.kernel) return;
  ++generation; setBusy(true,'state.loading'); $('stop').disabled=true;
  try { await kernel.reiniciar(); $('variables').replaceChildren(); $('empty').hidden=false; clearFigures(); output(t('state.restart')+'\n'); setBusy(false,'state.restart'); }
  catch(error) { failure(error); }
  finally { $('stop').disabled=false; }
}
function download() {
  const blob = new Blob([code()],{type:'text/plain;charset=utf-8'}), a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=$('filename').textContent; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
const actions = {
  folder:()=>{if(!busy){$('folder').value='';$('folder').click();}},
  upload:()=>{if(!busy){$('uploads').value='';$('uploads').click();}},
  new:()=>{ if (code() && !confirm(t('notice.replace'))) return; $('filename').textContent=t('example.name'); setCode(''); },
  open:()=>{ $('file').value=''; $('file').click(); }, save:download,
  run:()=>execute(code()), 'run-section':()=>execute(seccionActual(code(),cursorLine())),
  section:()=>{
    const source=code(), line=cursorLine(), lines=source.split('\n');
    lines.splice(line,0,'%% '); setCode(lines.join('\n'));
    editor?.setCursorPosition({line,column:3}); editor?.focus();
  },
  palette:openPalette, stop, theme, clear:()=>{ $('console').replaceChildren(); },
  undo:()=>editor?.undo(), redo:()=>editor?.redo(), about:()=>alert(t('notice.about'))
};
function cursorLine() {
  return editor ? editor.getCursorPosition().line : $('fallback').value.slice(0,$('fallback').selectionStart).split('\n').length-1;
}
function openPalette() {
  if ($('palette').open) return;
  $('palette-search').value=''; filterPalette(); $('palette').showModal(); $('palette-search').focus();
}
function filterPalette() {
  const query=$('palette-search').value.toLocaleLowerCase(), seen=new Set();
  $('palette-list').replaceChildren();
  for (const original of document.querySelectorAll('.menus [data-action]')) {
    const action=original.dataset.action;
    if(action==='palette' || seen.has(action)) continue;
    seen.add(action);
    if(!original.textContent.toLocaleLowerCase().includes(query)) continue;
    const button=document.createElement('button'); button.textContent=original.textContent; button.disabled=original.disabled;
    button.onclick=()=>{ $('palette').close(); Promise.resolve(actions[action]()).catch(failure); };
    $('palette-list').append(button);
  }
}
$('palette-search').oninput=filterPalette;
$('palette-search').onkeydown=event=>{
  if(event.key==='Enter') {event.preventDefault(); document.querySelector('#palette-list button:not(:disabled)')?.click();}
};
for(const menu of document.querySelectorAll('.menus details')) menu.addEventListener('toggle',()=>{
  if(menu.open) for(const other of document.querySelectorAll('.menus details')) if(other!==menu) other.open=false;
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]'); if (!button) return;
  for(const menu of document.querySelectorAll('.menus details')) menu.open=false;
  Promise.resolve(actions[button.dataset.action]?.()).catch(failure);
});
$('file').onchange=async()=>{
  const file=$('file').files[0]; if (!file) return;
  if (!/\.m$/i.test(file.name)) return failure(Error(t('error.file')));
  if (code() && !confirm(t('notice.replace'))) return;
  await importFiles([file]);
};
async function importFiles(files, stripRoot=false) {
  if(busy || !files.length) return;
  setBusy(true);
  try {
    for(const file of files) {
      let path=file.webkitRelativePath || file.name;
      if(stripRoot && path.includes('/')) path=path.slice(path.indexOf('/')+1);
      path=rutaProyecto(path);
      const bytes=new Uint8Array(await file.arrayBuffer());
      // Decodificar primero evita dejar un original sin su compañero RAW si falla.
      const raw=/\.(jpe?g|png|bmp|gif|webp)$/i.test(path)?await decodificarImagen(file):null;
      await guardarArchivo(contents(),path,bytes);
      if(raw) await guardarArchivo(contents(),`.aulac/img/${path}.raw`,raw);
      project.set(path,{path});
      console.info({event:'project-file',path,bytes:bytes.length,rawBytes:raw?.length || 0});
    }
    await listProject();
    const first=[...files].find(f=>/\.m$/i.test(f.name));
    if(first) {
      let path=first.webkitRelativePath || first.name;
      if(stripRoot && path.includes('/')) path=path.slice(path.indexOf('/')+1);
      await openProject(path);
    }
    setBusy(false);
  } catch(error) {setBusy(false);failure(error);}
}
async function openProject(path) {
  const file=await contents().get(path,{format:'text',content:true});
  $('filename').textContent=path; setCode(file.content);
  const folder=path.includes('/')?path.slice(0,path.lastIndexOf('/')):'';
  await kernel.ejecutar(`cd('/drive/${folder.replaceAll("'","''")}');`,()=>{},true);
}
async function listProject() {
  project.clear();
  async function visit(path='') {
    const dir=await contents().get(path,{content:true});
    for(const item of dir.content) {
      if(item.name==='.aulac') continue;
      if(item.type==='directory') await visit(item.path); else project.set(item.path,item);
    }
  }
  await visit();
  $('project-files').replaceChildren(...[...project.keys()].sort().map(path=>{
    const item=document.createElement('li'), button=document.createElement('button');
    button.textContent=path; button.disabled=!/\.m$/i.test(path);
    button.onclick=async()=>{if(busy)return;setBusy(true);try{await openProject(path);setBusy(false);}catch(error){setBusy(false);failure(error);}};
    item.append(button);return item;
  }));
}
$('uploads').onchange=()=>importFiles([...$('uploads').files]);
$('folder').onchange=()=>importFiles([...$('folder').files],true);
function dragFiles(event) {if(event.dataTransfer?.types.includes('Files'))event.preventDefault();}
function dropFiles(event) {if(event.dataTransfer?.files.length){event.preventDefault();importFiles([...event.dataTransfer.files]);}}
document.addEventListener('dragover',dragFiles);
document.addEventListener('drop',dropFiles);
$('command-form').onsubmit=event=>{ event.preventDefault(); if(busy)return; const source=$('command').value; $('command').value=''; execute(source); };
$('command').onkeydown=event=>{
  if (!['ArrowUp','ArrowDown'].includes(event.key)) return;
  event.preventDefault(); if(historyIndex===history.length)draft=$('command').value;
  historyIndex=Math.max(0,Math.min(history.length,historyIndex+(event.key==='ArrowUp'?-1:1)));
  $('command').value=historyIndex===history.length?draft:history[historyIndex];
};
function shortcut(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); event.stopImmediatePropagation(); if(!$('palette').open) execute(event.shiftKey ? seccionActual(code(),cursorLine()) : code()); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {event.preventDefault(); event.stopImmediatePropagation(); openPalette();}
  if(event.key==='Escape') {
    if($('palette').open) {$('palette').close(); return;}
    for(const menu of document.querySelectorAll('.menus details')) menu.open=false;
    if(busy && kernel.kernel && !$('stop').disabled) stop();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); download(); }
}
document.addEventListener('keydown',shortcut,true);

const narrowView = matchMedia('(max-width: 767px)'), mediumView = matchMedia('(min-width: 768px) and (max-width: 1199px)');
function showPanels(view) {
  view ||= narrowView.matches ? 'script' : 'workspace';
  const selected = document.querySelector(`.panel-tabs [data-view="${view}"]`);
  if (!selected) view = 'script';
  for (const button of document.querySelectorAll('.panel-tabs [data-view]')) {
    button.setAttribute('aria-selected',String(button.dataset.view === view));
  }
  if (narrowView.matches) {
    for (const panel of document.querySelectorAll('main .panel')) panel.hidden = panel.classList.contains(view) === false;
  } else if (mediumView.matches) {
    for (const name of ['script','console']) document.querySelector(`.${name}`).hidden = false;
    document.querySelector('.workspace').hidden = view === 'figures';
    document.querySelector('.figures').hidden = view !== 'figures';
  } else {
    for (const panel of document.querySelectorAll('main .panel')) panel.hidden = false;
  }
  editor?.refresh?.();
}
document.querySelector('.panel-tabs').addEventListener('click',event=>{
  const button=event.target.closest('[data-view]'); if(button) showPanels(button.dataset.view);
});
for (const query of [narrowView,mediumView]) query.addEventListener('change',()=>showPanels());
showPanels();

async function offline() {
  if (!('serviceWorker' in navigator)) return;
  const sizes=await (await fetch('../recursos.json')).json();
  if (!storage.get('aulac-octave-notice')) { $('first').hidden=false; $('first-text').textContent=t('notice.first',{mb:Math.ceil(sizes.bytes/1000000)}); }
  $('dismiss').onclick=()=>{storage.set('aulac-octave-notice','1'); $('first').hidden=true;};
  navigator.serviceWorker.addEventListener('message',event=>{
    if(event.data?.type==='aulac-offline') $('offline').textContent=t(event.data.ok?'state.offline':'state.cacheError');
  });
  const registration=await navigator.serviceWorker.register('../sw.js',{scope:'../'});
  await navigator.serviceWorker.ready;
  $('offline').textContent=t('state.cache');
  registration.active?.postMessage({type:'aulac-cache'});
}
offline().catch(error=>{console.warn(error);$('offline').textContent=t('state.cacheError');});

try {
  codeConsole=await kernel.iniciar();
  await instalarPDI(contents()); await kernel.preparar();
  await kernel.ejecutar('clear ans;',()=>{},true);
  await listProject();
  const doc=frame.contentDocument;
  const tokens=doc.createElement('link'); tokens.rel='stylesheet'; tokens.href=new URL('./tokens.css',location.href).href; doc.head.append(tokens);
  const style=doc.createElement('link'); style.rel='stylesheet'; style.href=new URL('./editor.css',location.href).href; doc.head.append(style);
  const host=doc.createElement('div'); host.id='aulac-editor'; doc.body.append(host);
  model=codeConsole.modelFactory.createCodeCell(); model.mimeType='text/x-octave';
  model.sharedModel.setSource($('fallback').value);
  editor=codeConsole.contentFactory.editorFactory({host,model,config:{lineNumbers:true,lineWrap:false,readOnly:false}});
  model.sharedModel.changed.connect(saveDraft);
  doc.addEventListener('keydown',shortcut,true);
  doc.addEventListener('dragover',dragFiles);
  doc.addEventListener('drop',dropFiles);
  frame.style.visibility='visible'; $('fallback').hidden=true; syncTheme();
  await refreshWorkspace();
  await kernel.ejecutar('clear ans;',()=>{},true);
  for(const row of [...$('variables').rows]) if(row.cells[0]?.textContent==='ans') row.remove();
  setBusy(false); editor.refresh?.();
} catch(error) { failure(error); }
