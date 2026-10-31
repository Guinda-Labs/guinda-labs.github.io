import {leerTextos, traducir} from './textos.mjs';
import {analizarWhos, snapshotCode, seccionActual} from './variables.mjs';
import {NucleoWeb} from './nucleo.mjs';

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
    const container=entry?.container || document.createElement('div');
    const renderer=codeConsole.rendermime.createRenderer(mime);
    container.replaceChildren(renderer.node); if(!entry)$('figures').append(container);
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
    else { const container=document.createElement('div'); container.append(image); $('figures').append(container); renderers.set(id,{container}); }
  }
  return true;
}
function clearFigures() {
  for (const entry of renderers.values()) entry.renderer?.dispose();
  renderers.clear(); $('figures').replaceChildren();
}
async function snapshot() {
  let source = '';
  await kernel.ejecutar(snapshotCode,msg => { if (msg.header.msg_type === 'stream') source += msg.content.text; },true,{silent:false});
  const rows = analizarWhos(source);
  $('variables').replaceChildren(...rows.map(row => {
    const tr = document.createElement('tr');
    for (const value of [row.name,row.size.join('×'),row.class,row.value]) { const td=document.createElement('td'); td.textContent=value; tr.append(td); }
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
  setBusy(true); const current = generation, figures = []; let failed = false;
  history.push(source); historyIndex = history.length; draft = '';
  const item=document.createElement('li'), button=document.createElement('button');
  button.textContent=source; button.onclick=()=>{ $('command').value=source; $('command').focus(); }; item.append(button); $('history').append(item);
  output('>> '+source+'\n');
  try {
    await kernel.ejecutar(source,msg => {
      switch (msg.header.msg_type) {
        case 'stream': output(msg.content.text,msg.content.name === 'stderr' ? 'error' : ''); break;
        case 'error': console.error(msg.content); break;
        case 'clear_output': clearFigures(); break;
        case 'display_data': case 'update_display_data': case 'execute_result':
          figures.push(showFigure(msg).catch(failure));
          if (msg.content.data?.['text/plain'] && !msg.content.data?.['application/vnd.plotly.v1+json']) output(msg.content.data['text/plain']+'\n');
          break;
      }
    });
  } catch (error) { failed = true; if (current === generation) failure(error); }
  finally {
    if (current === generation) {
      try { await Promise.all(figures); } catch(error) { failed = true; failure(error); }
      try { await snapshot(); } catch(error) { failed = true; failure(error); }
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
  $('filename').textContent=file.name; setCode(await file.text());
};
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
  const doc=frame.contentDocument;
  const tokens=doc.createElement('link'); tokens.rel='stylesheet'; tokens.href=new URL('./tokens.css',location.href).href; doc.head.append(tokens);
  const style=doc.createElement('link'); style.rel='stylesheet'; style.href=new URL('./editor.css',location.href).href; doc.head.append(style);
  const host=doc.createElement('div'); host.id='aulac-editor'; doc.body.append(host);
  model=codeConsole.modelFactory.createCodeCell(); model.mimeType='text/x-octave';
  model.sharedModel.setSource($('fallback').value);
  editor=codeConsole.contentFactory.editorFactory({host,model,config:{lineNumbers:true,lineWrap:false,readOnly:false}});
  model.sharedModel.changed.connect(saveDraft);
  doc.addEventListener('keydown',shortcut,true);
  frame.style.visibility='visible'; $('fallback').hidden=true; syncTheme();
  await refreshWorkspace(); setBusy(false); editor.refresh?.();
} catch(error) { failure(error); }
