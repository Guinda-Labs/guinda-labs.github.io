import {estadoPatilla,buscarPieza} from './patillas-ficha.mjs';

export async function crearPatillasUI({circuito,nodoActual,patillasNodo}){
 let datos=null;
 const mk=(tag,text,parent,attrs={})=>{const e=document.createElement(tag);if(text)e.textContent=text;for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent?.append(e);return e;};
 let ficha=null,completa=null;
 function cerrar(){ficha?.remove();ficha=null;}
 function verCompleto(p,numero){
  completa?.remove();const parte=p.definition?.id,fuente=buscarPieza(datos,parte);completa=mk('section','',document.body,{class:'patillaje-completo',role:'dialog','aria-modal':'false','aria-label':'Patillaje completo '+(p.definition?.name||p.id),tabindex:'-1'});
  const head=mk('header','',completa);mk('h2',p.definition?.name||p.id,head);const close=mk('button','Cerrar',head,{type:'button'});close.onclick=()=>{completa.remove();completa=null;};
  const body=mk('div','',completa,{class:'patillaje-cuerpo'}),svg=mk('svg','',body,{viewBox:'0 0 220 280','aria-label':'Encapsulado visto desde arriba'});
  const dip=mk('rect','',svg,{x:61,y:23,width:98,height:232,rx:10,class:'patillaje-chip'});mk('path','',svg,{d:'M96 23 A14 14 0 0 1 124 23',fill:'none',stroke:'currentColor','stroke-width':3});mk('circle','',svg,{cx:75,cy:39,r:5,fill:'currentColor'});
  const pins=p.definition?.package?.pins||[],count=pins.length,half=Math.ceil(count/2);
  pins.forEach((pin,i)=>{const side=i<half?'left':'right',row=side==='left'?i:i-half,x=side==='left'?42:178,y=48+row*(185/Math.max(1,half-1)),sel=pin.number===numero;mk('circle','',svg,{cx:x,cy:y,r:sel?12:9,class:sel?'patillaje-pin seleccionada':'patillaje-pin'});mk('text',String(pin.number),svg,{x:side==='left'?24:196,y:y+4,'text-anchor':side==='left'?'end':'start'});});
  const table=mk('div','',body,{class:'patillaje-tabla',role:'list','aria-label':'Tabla de patillas'});
  pins.forEach(pin=>{const row=mk('button','',table,{type:'button',class:'patillaje-fila'+(pin.number===numero?' seleccionada':''),'aria-current':pin.number===numero?'true':'false'});const info=fuente?.patillas?.find(x=>x.numero===pin.number);mk('strong',`${pin.number} · ${info?.nombre_hoja||pin.name}`,row);mk('span',info?.funcion_es||'Sin dato verificado de la hoja',row);row.onclick=()=>verCompleto(p,pin.number);});
  if(fuente){const a=mk('a',`Hoja ${fuente.hoja} de ${fuente.fabricante}, p. ${fuente.pagina_tabla}`,completa,{href:fuente.url,target:'_blank',rel:'noopener'});}
  completa.focus();
 }
 function abrir(key,anchor){const [id,index]=key.split(':');const p=circuito().components.find(x=>x.id===id),numero=Number(index)+1;if(!p?.definition)return;
  cerrar();const current=nodoActual(key),others=patillasNodo(key,current),state=estadoPatilla({datos,pieza:p,numero,nodo:current,patillas:others});
  ficha=mk('aside','',document.body,{class:'ficha-patilla',role:'dialog','aria-label':`Patilla ${numero} ${state.nombre}`});mk('strong',`${numero} · ${state.nombre||'Sin dato verificado de la hoja'}`,ficha,{class:'ficha-titulo'});
  if(state.info){mk('p',state.info.funcion_es||'Sin dato verificado de la hoja',ficha);mk('p',state.info.funcion_literal||'Sin dato verificado de la hoja',ficha,{class:'ficha-literal'});mk('h3','Qué se conecta aquí',ficha);mk('p',state.info.que_conectar||'Sin dato verificado de la hoja',ficha);if(state.info.maximo) {mk('h3','Máximo',ficha);mk('p',state.info.maximo,ficha);}}
  else mk('p','Sin dato verificado de la hoja',ficha);
  mk('h3','Conexión actual',ficha);const componentes=circuito().components,visible=key=>{const [id,index]=key.split(':').length===2?key.split(':'):[key,'0'],piece=componentes.find(x=>x.id===id);if(!piece)return null;const n=Number(index),label=piece.definition?`${piece.id} · ${piece.definition.name}`:piece.label||piece.id;if(piece.type==='V')return `borne ${n===0?'+':'−'} de la fuente ${piece.label||piece.id}`;const terminal=piece.definition?.package?.pins?.[n]?.name;return `${label}${terminal?` (patilla ${n+1} · ${terminal})`:piece.type==='R'?` (extremo ${n+1})`:''}`;},destinos=others.map(x=>visible(x.key)).filter(Boolean),supply=current&&/^(VCC|VEE):/.test(current)?`borne ${current.startsWith('VCC')?'+':'−'} de la fuente ${current.split(':')[0]}`:null;mk('p',destinos.length?`Conectada a: ${destinos.join(', ')}`:supply?`Conectada a: ${supply}`:current?'Conectada a un nodo':'Sin conexión',ficha);if(current&&/\s/.test(current))mk('small',`Nodo: ${current}`,ficha,{class:'ficha-nodo-secundario'});
  for(const aviso of state.avisos)mk('p',aviso,ficha,{class:'ficha-aviso',role:'status'});
  const source=buscarPieza(datos,state.parte);if(source)mk('a',`Hoja ${source.hoja} de ${source.fabricante}, p. ${source.pagina_tabla}`,ficha,{href:source.url,target:'_blank',rel:'noopener'});else mk('p','Sin dato verificado de la hoja',ficha);
  const all=mk('button','Ver patillaje completo',ficha,{type:'button'});all.onclick=()=>verCompleto(p,numero);if(['LM741','TL081'].includes(state.parte)){const datasheet=mk('button','Ver hoja de datos',ficha,{type:'button'});datasheet.onclick=()=>{if(abrirHoja)abrirHoja(state.parte,p);else document.dispatchEvent(new CustomEvent('aulac:abrir-hoja-datos',{detail:{parte:state.parte,pieza:p}}));};}const rect=anchor.getBoundingClientRect();ficha.style.left=`${Math.max(8,Math.min(innerWidth-352,rect.left))}px`;ficha.style.top=`${Math.max(8,Math.min(innerHeight-240,rect.bottom+8))}px`;
 }
 document.addEventListener('click',e=>{const pin=e.target.closest('#scheme .terminal-hit, #scheme .terminal, #board [data-pin]');if(pin?.dataset.pin){e.stopPropagation();abrir(pin.dataset.pin,pin);}else if(!e.target.closest('.ficha-patilla,.patillaje-completo'))cerrar();},true);
 document.addEventListener('pointerdown',e=>{const pin=e.target.closest('#scheme .terminal-hit, #scheme .terminal, #board [data-pin]');if(pin?.dataset.pin){if(document.getElementById('wire')?.getAttribute('aria-pressed')!=='true')e.stopPropagation();abrir(pin.dataset.pin,pin);}},true);
 document.addEventListener('keydown',e=>{const pin=e.target.closest('#scheme .terminal-hit, #scheme .terminal, #board [data-pin]');if(pin&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();abrir(pin.dataset.pin,pin);}if(e.key==='Escape'){cerrar();completa?.remove();completa=null;}});
 let abrirHoja=null;
 datos=await(await fetch('./datos/patillas.json')).json();
 return {abrirComponente(p){verCompleto(p,1);},abrir,establecerHojaDatos(fn){abrirHoja=fn;}};
}
