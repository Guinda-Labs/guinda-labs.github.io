export function copiarSeleccion(c,ids){
 const elegidos=new Set(ids),components=c.components.filter(p=>elegidos.has(p.id));
 const permitido=k=>k.startsWith('@')||elegidos.has(k.split(':')[0]);
 let wires=c.wires.filter(w=>permitido(w.a)&&permitido(w.b));
 // Una unión libre puede formar varios tramos internos; las colas sin seleccionar se descartan.
 let cambio=true;while(cambio){const grados=new Map();for(const w of wires)for(const k of [w.a,w.b])grados.set(k,(grados.get(k)||0)+1);const siguientes=wires.filter(w=>elegidos.has(w.id)||![w.a,w.b].some(k=>k.startsWith('@')&&grados.get(k)===1));cambio=siguientes.length!==wires.length;wires=siguientes;}
 const alcanzados=new Set(wires.flatMap(w=>[w.a,w.b]).filter(k=>!k.startsWith('@')));cambio=true;while(cambio){cambio=false;for(const w of wires)if(alcanzados.has(w.a)||alcanzados.has(w.b)){for(const k of [w.a,w.b])if(!alcanzados.has(k)){alcanzados.add(k);cambio=true;}}}
 wires=wires.filter(w=>alcanzados.has(w.a)||elegidos.has(w.id));
 return structuredClone({components,wires,pegados:0});
}
export function pegarSeleccion(c,clip,{bandeja=false}={}){
 if(!clip?.components?.length)return [];
 const offset=20*(++clip.pegados),map=new Map(),ids=new Set([...c.components,...c.wires].map(p=>p.id));
 const nuevo=prefix=>{let n=1;while(ids.has(prefix+n))n++;const id=prefix+n;ids.add(id);return id;};
 const components=structuredClone(clip.components).map(p=>{const id=nuevo(p.id.replace(/\d+$/,'')||p.type);map.set(p.id,id);return {...p,id,x:p.x+offset,y:p.y+offset,tray:bandeja};});
 const extremo=k=>{if(k.startsWith('@'))return '@'+k.slice(1).split(',').map(v=>Number(v)+offset).join(',');const [id,pin]=k.split(':');return map.has(id)?map.get(id)+':'+pin:null;};
 const wires=structuredClone(clip.wires).flatMap(w=>{const a=extremo(w.a),b=extremo(w.b);return a&&b?[{...w,id:nuevo('w'),a,b,...(w.points?{points:w.points.map(p=>p.map(v=>v+offset))}:{})}]:[];});
 c.components.push(...components);if(!bandeja)c.wires.push(...wires);return components.map(p=>p.id);
}
export const OPCIONES_CONTEXTO={pieza:['girar','voltear','copiar','pegar','duplicar','borrar','editar','sonda','protoboard','fijar'],cable:['borrar','nodo','sonda'],lienzo:['pegar','insertar','todo','centrar'],favorito:['quitar']};
export function permisoContexto(){let nativo=false;return {permitir(){nativo=true;},consumir(e){if(e.shiftKey){nativo=false;return true;}if(nativo){nativo=false;return true;}return false;}};}
export function menuContextual({lienzos,objeto,acciones,status}){
 const gate=permisoContexto(),labels={quitar:'Quitar del riel',girar:'Girar R',voltear:'Voltear',copiar:'Copiar · Ctrl+C',pegar:'Pegar · Ctrl+V',duplicar:'Duplicar · Ctrl+D',borrar:'Borrar · Supr',editar:'Editar valor…',sonda:'Poner sonda aquí',protoboard:'Ver en protoboard',fijar:'Fijar tipo en el riel',nodo:'Agregar nodo',insertar:'Insertar componente A',todo:'Seleccionar todo · Ctrl+A',centrar:'Volver a centrar'};let menu=null,previo;
 const cerrar=()=>{menu?.remove();menu=null;};
 function abrir(e,svg,teclado=false){cerrar();if(!teclado&&gate.consumir(e))return;const obj=objeto(e,teclado);if(!obj)return;e.preventDefault();previo=document.activeElement;const r=obj.rect||svg.getBoundingClientRect(),x=teclado?r.left+r.width/2:e.clientX,y=teclado?r.top+r.height/2:e.clientY;menu=document.createElement('div');menu.className='contexto-lab';menu.setAttribute('role','menu');menu.setAttribute('aria-label','Acciones del '+obj.tipo);document.body.append(menu);
  for(const id of [...OPCIONES_CONTEXTO[obj.tipo],'nativo']){const b=document.createElement('button');b.setAttribute('role','menuitem');const atajos={girar:'R',copiar:'Ctrl+C',pegar:'Ctrl+V',duplicar:'Ctrl+D',borrar:'Supr',insertar:'A',todo:'Ctrl+A'};b.textContent=id==='nativo'?'Mostrar el menú del navegador':labels[id].replace(/(?: · )?(?:Ctrl\+[CVDA]|Supr)$| [RA]$/,'');if(atajos[id]){const key=document.createElement('kbd');key.textContent=atajos[id];b.append(key);}if(['copiar','borrar','editar','protoboard','nativo'].includes(id))b.dataset.separador='';menu.append(b);b.onclick=()=>{cerrar();if(id==='nativo'){gate.permitir();const aviso=document.createElement('output');aviso.className='contexto-aviso';aviso.textContent='El siguiente clic derecho abrirá el menú del navegador';Object.assign(aviso.style,{left:Math.min(x,innerWidth-260)+'px',top:Math.min(y,innerHeight-80)+'px'});document.body.append(aviso);setTimeout(()=>aviso.remove(),5000);status(aviso.textContent);}else acciones[id]?.(obj,{clientX:x,clientY:y});previo?.focus();};}
  Object.assign(menu.style,{left:Math.max(8,Math.min(x,innerWidth-menu.offsetWidth-8))+'px',top:Math.max(8,Math.min(y,innerHeight-menu.offsetHeight-8))+'px',maxHeight:'calc(100dvh - 16px)'});menu.firstChild.focus();menu.onkeydown=ev=>{const bs=[...menu.children],i=bs.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Tab'].includes(ev.key)){ev.preventDefault();bs[(i+(ev.key==='ArrowUp'||ev.shiftKey?-1:1)+bs.length)%bs.length].focus();}if(ev.key==='Escape'){cerrar();previo?.focus();}};
 }
 document.addEventListener('contextmenu',e=>{if(!lienzos.some(svg=>svg.contains(e.target)))gate.consumir(e);});
 for(const svg of lienzos){svg.addEventListener('contextmenu',e=>abrir(e,svg));svg.addEventListener('keydown',e=>{if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.stopPropagation();abrir(e,svg,true);}});}
 document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target))cerrar();});return {cerrar};
}
