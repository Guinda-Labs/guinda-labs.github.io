import {simbolos} from './circuito.mjs';
import {arteFisico,viewBoxArteFisico} from './arte-fisico.mjs';
// Estado compartido por catálogo y riel. El almacenamiento puede estar bloqueado.
export function nombreCatalogo(b){return b.dataset.nombre||b.dataset.libraryId||'';}
export function simboloCatalogo(payload=''){
 const [type,variant]=payload.split(':');
 return simbolos[variant==='PNP'?'PNP':type]||'M-30-22H30V22H-30ZM-40-12H-30M-40 12H-30M30 0H40';
}
// Pieza mínima para dibujar una ficha o la vista previa a partir de su carga («R», «D:led», «Q:PNP», «X:LM358», «PB830»).
export function piezaDePayload(payload='',definicion=()=>null){
 const [type,variant]=String(payload||'').split(':');
 if(/^PB(830|400)$/.test(payload))return {tablero:Number(payload.slice(2))};
 const p={id:'preview',type:type||'R',value:1000};
 if(type==='Q'){if(variant)p.polarity=variant;}else if(type==='X'){p.definition=definicion(variant)||undefined;}else if(variant)p.appearance=variant;
 return p;
}
// Protoboard en miniatura: placa con dos bandas de agujeros y rieles.
function tableroMini(size){
 const w=size===400?96:130,x=-w/2,puntos=[];
 for(let f=0;f<5;f++)for(let c=0;c<(size===400?10:14);c++)puntos.push('<circle cx="'+(x+12+c*(w-24)/((size===400?10:14)-1))+'" cy="'+(-14+f*7)+'" r="1.6" fill="#454c50"/>');
 return '<rect x="'+x+'" y="-34" width="'+w+'" height="68" rx="7" fill="#f5f4ef" stroke="#b8bab4"/><path d="M'+(x+8)+' -28H'+(-x-8)+'" stroke="#d54c4c"/><path d="M'+(x+8)+' 28H'+(-x-8)+'" stroke="#367aba"/>'+puntos.join('');
}
export function arteCatalogo(p,vista='esquematico',definicion=()=>null){
 const art=document.createElement('span');art.className='catalogo-arte'+(vista==='fisico'?' fisico':'');art.setAttribute('aria-hidden','true');
 const pieza=piezaDePayload(p.payload||p.id,definicion);
 if(pieza.tablero)art.innerHTML='<svg viewBox="-67 -35 134 70" focusable="false">'+tableroMini(pieza.tablero)+'</svg>';
 else if(vista==='fisico')art.innerHTML='<svg viewBox="'+viewBoxArteFisico(pieza)+'" focusable="false">'+arteFisico(pieza)+'</svg>';
 else art.innerHTML='<svg viewBox="-45 -36 90 72" focusable="false"><path d="'+simboloCatalogo(p.payload)+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>';
 return art;
}
export function preferenciasCatalogo(storage){
 let data;try{data=JSON.parse(storage?.getItem('lab.catalogo.v2')||'null');}catch{}
 let favoritos=Array.isArray(data?.favoritos)?[...new Set(data.favoritos.filter(x=>typeof x==='string'))].slice(0,6):['R','C','D'];
 let recientes=Array.isArray(data?.recientes)?data.recientes.filter(x=>typeof x==='string').slice(0,4):[];
 let vista=data?.vista==='fisico'?'fisico':'esquematico';
 let teclas=data?.teclas&&typeof data.teclas==='object'?Object.fromEntries(Object.entries(data.teclas).filter(([k,v])=>/^[a-z]$/.test(k)&&typeof v==='string')):{r:'R',c:'C',l:'L',v:'V',i:'I',g:'G',d:'D',q:'QN'};
 const guardar=()=>{try{storage?.setItem('lab.catalogo.v2',JSON.stringify({favoritos,recientes,teclas,vista}));}catch{}};
 return {get favoritos(){return [...favoritos];},get recientes(){return [...recientes];},get teclas(){return {...teclas};},get vista(){return vista;},fijarVista(v){vista=v==='fisico'?'fisico':'esquematico';guardar();},
  fijar(id){if(favoritos.includes(id))favoritos=favoritos.filter(x=>x!==id);else if(favoritos.length===6)return false;else favoritos.push(id);guardar();return true;},
  quitarTecla(id){for(const k of Object.keys(teclas))if(teclas[k]===id)delete teclas[k];guardar();},
  mover(id,antes){favoritos=favoritos.filter(x=>x!==id);favoritos.splice(Math.max(0,favoritos.indexOf(antes)),0,id);guardar();},
  usar(id){recientes=[id,...recientes.filter(x=>x!==id)].slice(0,4);guardar();},
  asignar(key,id,reemplazar=false){key=key.toLowerCase();if(!/^[a-z]$/.test(key))return {error:'Usa una letra de A a Z'};const previo=teclas[key];if(previo&&previo!==id&&!reemplazar)return {conflicto:previo};for(const k of Object.keys(teclas))if(teclas[k]===id)delete teclas[k];teclas[key]=id;guardar();return {ok:true};}
 };
}
const normal=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function filtrarCatalogo(piezas,q='',categoria='Todas'){return piezas.filter(p=>(categoria==='Todas'||p.categoria===categoria)&&normal(p.nombre+' '+p.id).includes(normal(q)));}
// Una pausa distingue una letra asignada de una palabra; dos letras siempre buscan.
export function resolverConsulta(q,teclas){return q.length===1&&teclas[q.toLowerCase()]?{insertar:teclas[q.toLowerCase()]}:{buscar:q};}
export function catalogoUI({catalog,paleta,controlador,storage,insertar,status,riel,definicion=()=>null}){
 const prefs=preferenciasCatalogo(storage),d=document.createElement('dialog');d.className='catalogo-popup';d.setAttribute('aria-label','Catálogo de componentes');
 const make=(tag,parent,txt)=>{const e=document.createElement(tag);if(txt)e.textContent=txt;parent.append(e);return e;};
 const head=make('header',d);make('strong',head,'Componentes');const cerrar=make('button',head,'Cerrar · Esc');cerrar.onclick=()=>d.close();
 const search=make('input',d);search.type='search';search.placeholder='Escribe un nombre o pulsa R, C, L…';search.setAttribute('aria-label','Buscar componentes');
 const conmutador=make('div',d);conmutador.className='catalogo-vista';conmutador.setAttribute('role','group');conmutador.setAttribute('aria-label','Vista de las fichas');
 const categorias=make('nav',d);categorias.setAttribute('aria-label','Categorías');const lista=make('div',d);lista.className='catalogo-lista';
 const advanced=make('details',d);make('summary',advanced,'Biblioteca y paquetes');const pie=make('p',d,'Una tecla inserta; dos letras buscan. Arrastra tus favoritas en la barra para ordenarlas.');pie.className='catalogo-pie';document.body.append(d);
 let categoria='Todas',timer,previo,asignando=null,conflicto=null,mensaje=null,modoTexto=false;
 const originales=()=>[...catalog.querySelectorAll('button:not([data-proxy])')].map(b=>{let payload; b.ondragstart?.({dataTransfer:{setData:(k,v)=>payload=v}});return {id:b.dataset.libraryId||payload||b.dataset.id,nombre:nombreCatalogo(b),payload,categoria:b.dataset.categoria||(payload?.startsWith('X:')?'Integrados':/^[VI]/.test(payload)?'Fuentes':/^[DQ]/.test(payload)?'Semiconductores':'Básicos'),b};});
 const elegir=p=>{if(!p)return;clearTimeout(timer);prefs.usar(p.id);d.close();insertar?insertar(p):controlador().elegir(p.b);pintarRiel();};
 function pintar(){
  const piezas=originales();lista.replaceChildren();categorias.replaceChildren();conmutador.replaceChildren();
  for(const [valor,texto] of [['esquematico','Esquemático'],['fisico','Físico']]){const b=make('button',conmutador,texto);b.type='button';b.setAttribute('aria-pressed',String(prefs.vista===valor));b.onclick=()=>{prefs.fijarVista(valor);pintar();};}
  for(const name of ['Todas','Básicos','Fuentes','Semiconductores','Integrados','Montaje','Medición']){const b=make('button',categorias,name);b.setAttribute('aria-pressed',String(categoria===name));b.onclick=()=>{categoria=name;pintar();};}
  const grupos=[];if(!search.value&&categoria==='Todas'&&prefs.recientes.length)grupos.push(['Recientes',prefs.recientes.map(id=>piezas.find(p=>p.id===id)).filter(Boolean)]);
  grupos.push([search.value?'Resultados':categoria,filtrarCatalogo(piezas,search.value,categoria)]);
  for(const [titulo,items] of grupos){make('h3',lista,titulo);const grid=make('div',lista);grid.className='catalogo-grid';for(const p of items){const card=make('article',grid);card.dataset.tipo=p.id;const b=make('button',card);b.className='catalogo-insertar';b.append(arteCatalogo(p,prefs.vista,definicion));make('span',b,p.nombre);make('kbd',b,Object.entries(prefs.teclas).find(([,id])=>id===p.id)?.[0].toUpperCase()||'');b.onclick=()=>elegir(p);
   const fixed=prefs.favoritos.includes(p.id),pin=make('button',card,fixed?'★ Fijada ✓':'★ Fijar en la barra');pin.setAttribute('aria-pressed',String(fixed));pin.onclick=()=>{mensaje=prefs.fijar(p.id)?null:p.id;pintar();pintarRiel();};
   const key=make('button',card,'⌨ Tecla');key.title='Asignar tecla…';key.onclick=()=>{asignando=p.id;conflicto=null;pintar();};
   if(mensaje===p.id)make('p',card,'Máximo 6 fijadas: quita una de la barra').setAttribute('role','alert');
   if(asignando===p.id){const input=make('input',card);input.maxLength=1;input.setAttribute('aria-label','Tecla para '+p.nombre);make('p',card,'Pulsa la letra que quieres asignar');input.onkeydown=e=>{if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();prefs.quitarTecla(p.id);asignando=null;conflicto=null;pintar();}};input.oninput=()=>{clearTimeout(timer);const r=prefs.asignar(input.value,p.id);if(r.conflicto){conflicto={key:input.value,id:p.id,previo:r.conflicto};pintar();}else if(r.ok){asignando=null;pintar();}else status(r.error);};if(conflicto?.id===p.id){const nombre=piezas.find(x=>x.id===conflicto.previo)?.nombre||conflicto.previo;make('p',card,conflicto.key.toUpperCase()+' ya es '+nombre.replace(/^[A-Z]+ · /,'')+': ¿reemplazar?');const si=make('button',card,'Reemplazar');si.onclick=()=>{prefs.asignar(conflicto.key,p.id,true);asignando=null;conflicto=null;pintar();};const no=make('button',card,'Cancelar');no.onclick=()=>{asignando=null;conflicto=null;pintar();};}else input.focus();}
  }}
  if(d.open&&!d.contains(document.activeElement))search.focus();
 }
 function pintarRiel(){if(!riel)return;riel.replaceChildren();for(const id of prefs.favoritos){const p=originales().find(p=>p.id===id);if(!p)continue;const b=make('button',riel);b.title=p.nombre;b.dataset.favorito=id;b.setAttribute('aria-label',p.nombre);b.append(arteCatalogo(p));make('span',b,p.nombre);make('kbd',b,Object.entries(prefs.teclas).find(([,value])=>value===id)?.[0].toUpperCase()||'');b.onclick=()=>elegir(p);b.draggable=true;b.ondragstart=e=>{e.dataTransfer.setData('application/x-aulac-favorito',id);p.b.ondragstart?.(e);};b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const origen=e.dataTransfer.getData('application/x-aulac-favorito');if(prefs.favoritos.includes(origen)){prefs.mover(origen,id);pintarRiel();}};}}
 search.onclick=()=>{modoTexto=true;clearTimeout(timer);};
 search.oninput=()=>{clearTimeout(timer);if(search.value.length>1)modoTexto=true;asignando=null;pintar();const r=resolverConsulta(search.value,prefs.teclas);if(r.insertar&&!modoTexto)timer=setTimeout(()=>elegir(originales().find(p=>p.id===r.insertar)),350);};
 search.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(timer);const r=resolverConsulta(search.value,prefs.teclas);elegir(r.insertar&&!modoTexto?originales().find(p=>p.id===r.insertar):filtrarCatalogo(originales(),search.value,categoria)[0]);}};
 d.addEventListener('keydown',e=>{if(/^[a-z]$/i.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();search.value+=e.key;search.focus();search.oninput();}if(e.key==='Escape'){clearTimeout(timer);d.close();}if(e.key==='Tab'){const items=[...d.querySelectorAll('button,input,summary,select')].filter(x=>{if(x.disabled)return false;for(let p=x.parentElement;p&&p!==d;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open&&p.children[0]!==x)return false;return true;});const i=items.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();items.at(-1)?.focus();}else if(!e.shiftKey&&i===items.length-1){e.preventDefault();items[0]?.focus();}}});
 d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
 d.addEventListener('close',()=>{clearTimeout(timer);pintarRiel();previo?.focus();});
 new MutationObserver(()=>{if(d.open)pintar();pintarRiel();}).observe(catalog,{childList:true,subtree:true});
 pintarRiel();return {prefs,abrir(){previo=document.activeElement;search.value='';modoTexto=false;asignando=null;categoria='Todas';for(const selector of ['.library-controls','details.avanzado']){const controles=paleta.querySelector(selector);if(controles)advanced.append(controles);}pintar();if(!d.open)d.showModal();search.focus();},cerrar(){if(d.open)d.close();},get abierta(){return d.open;},get vista(){return prefs.vista;},quitar(id){if(prefs.favoritos.includes(id))prefs.fijar(id);pintarRiel();},fijar(id){if(!prefs.favoritos.includes(id)&&!prefs.fijar(id))status('Máximo 6 fijadas: quita una de la barra');pintarRiel();}};
}
