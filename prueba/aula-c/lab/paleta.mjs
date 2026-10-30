// Paleta de componentes (R19): lógica pura (probada en Node) y controlador de DOM.
const CLAVE='lab.recientes.v1',MAX=6;
export function crearRecientes(storage,max=MAX){
 const leer=()=>{try{let v=JSON.parse(storage?.getItem(CLAVE)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,max):[];}catch{return [];}};
 return {leer,agregar(id){if(!id)return leer();let v=[id,...leer().filter(x=>x!==id)].slice(0,max);try{storage?.setItem(CLAVE,JSON.stringify(v));}catch{}return v;}};
}
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
// piezas: [{id,nombre,grupo:'activo'|'resto'}]. Sin consulta: Recientes, activo y resto plegado. Con consulta: busca en todo.
export function agrupar({piezas,recientes=[],consulta=''}){
 const q=norm(consulta).trim();
 if(q)return [{clave:'resultados',titulo:'Resultados',plegada:false,piezas:piezas.filter(p=>norm(p.nombre).includes(q)||norm(p.id).includes(q))}];
 const porId=new Map(piezas.map(p=>[p.id,p])),rec=recientes.map(id=>porId.get(id)).filter(Boolean).slice(0,MAX),s=[];
 if(rec.length)s.push({clave:'recientes',titulo:'Recientes',plegada:false,piezas:rec});
 s.push({clave:'activo',titulo:'',plegada:false,piezas:piezas.filter(p=>p.grupo!=='resto')});
 s.push({clave:'resto',titulo:'Resto de la biblioteca',plegada:true,piezas:piezas.filter(p=>p.grupo==='resto')});
 return s;
}
export function moverSeleccion(i,n,tecla){if(!n)return -1;if(tecla==='ArrowDown')return i<0?0:(i+1)%n;if(tecla==='ArrowUp')return i<0?n-1:(i-1+n)%n;return i;}

// Controlador de DOM: reordena los botones del catálogo, maneja ↑↓/Enter y la pieza pegada al cursor.
// vistaPrevia(origen, carga) puede devolver {svg, tam()} con la pieza al tamaño real del lienzo; board es el lienzo físico.
export function paletaUI({catalog,search,scheme,board=null,storage,cerrar,status=()=>{},vistaPrevia=null}){
 const rec=crearRecientes(storage),nombre=b=>b.dataset.nombre||b.dataset.libraryId||'',clave=b=>b.dataset.libraryId||nombre(b);
 let armada=null,fantasma=null,real=null,idx=-1,busy=false;
 const piezasDe=()=>[...catalog.querySelectorAll('button:not([data-proxy])')].map(b=>({id:clave(b),nombre:nombre(b),grupo:b.dataset.grupo||(b.closest('details.resto')?'resto':'activo'),b}));
 const visibles=()=>[...catalog.querySelectorAll('button')].filter(b=>!b.hidden&&!b.closest('details:not([open])'));
 function marcar(){let v=visibles();v.forEach((b,i)=>b.setAttribute('aria-selected',String(i===idx)));v[idx]?.scrollIntoView?.({block:'nearest'});}
 function refrescar(){
  if(busy)return;busy=true;try{
   let piezas=piezasDe(),mapa=new Map(piezas.map(p=>[p.id,p.b])),head=catalog.querySelector(':scope>strong')?.cloneNode(true);
   let secciones=agrupar({piezas,recientes:rec.leer(),consulta:search.value}),nodos=[];
   for(let s of secciones){
    if(s.clave==='recientes'){let h=document.createElement('strong');h.textContent=s.titulo;nodos.push(h);for(let p of s.piezas){let o=mapa.get(p.id),b=o.cloneNode(true);b.dataset.proxy='1';b.onclick=()=>o.click();b.draggable=true;b.ondragstart=e=>o.ondragstart?.(e);b.proxyDe=o;nodos.push(b);}}
    else if(s.clave==='resto'){if(!s.piezas.length)continue;let d=document.createElement('details');d.className='resto';let sm=document.createElement('summary');sm.textContent=s.titulo;d.append(sm,...s.piezas.map(p=>mapa.get(p.id)));nodos.push(d);}
    else if(s.clave==='resultados'){let h=document.createElement('strong');h.textContent=s.titulo;nodos.push(h,...s.piezas.map(p=>mapa.get(p.id)));}
    else{if(head)nodos.push(head);nodos.push(...s.piezas.map(p=>mapa.get(p.id)));}
   }
   for(let b of mapa.values())b.hidden=false;
   catalog.replaceChildren(...nodos);idx=-1;marcar();
  }finally{busy=false;}
 }
 function payload(b){let e={dataTransfer:{setData:(k,v)=>{e.v=v;}}};b.ondragstart?.(e);return e.v;}
 function cancelar(){armada=null;fantasma?.remove();fantasma=null;real=null;scheme.classList.remove('colocando');board?.classList?.remove('colocando');}
 function elegir(b){
  let origen=b.proxyDe||b;rec.agregar(clave(origen));let v=payload(origen);cerrar?.();
  if(!v){origen.click();return;}
  cancelar();armada=v;scheme.classList.add('colocando');board?.classList?.add('colocando');
  fantasma=document.createElement('div');fantasma.className='pieza-pegada';
  try{real=vistaPrevia?vistaPrevia(origen,v):null;}catch{real=null;}
  if(real){fantasma.className='pieza-pegada real';fantasma.append(real.svg);}else{let svg=origen.querySelector('svg');if(svg)fantasma.append(svg.cloneNode(true));}
  fantasma.hidden=true;document.body.append(fantasma);
  status('Haga clic en el lienzo para colocar «'+nombre(origen)+'». Esc cancela.');
 }
 document.addEventListener('pointermove',e=>{if(!fantasma)return;fantasma.hidden=false;if(real){const [w,h]=real.tam();fantasma.style.transform=`translate(${e.clientX-w/2}px,${e.clientY-h/2}px)`;}else fantasma.style.transform=`translate(${e.clientX+8}px,${e.clientY+8}px)`;});
 scheme.addEventListener('click',e=>{if(!armada)return;e.stopPropagation();e.preventDefault();let v=armada;cancelar();scheme.ondrop?.({clientX:e.clientX,clientY:e.clientY,preventDefault(){},dataTransfer:{getData:()=>v}});},true);
 board?.addEventListener('click',e=>{if(!armada)return;e.stopPropagation();e.preventDefault();let v=armada;cancelar();
  try{const dt=new DataTransfer();dt.setData('text/plain',v);board.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,clientX:e.clientX,clientY:e.clientY,dataTransfer:dt}));}
  catch{board.ondrop?.({clientX:e.clientX,clientY:e.clientY,preventDefault(){},dataTransfer:{getData:()=>v}});}
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&armada){cancelar();status('Colocación cancelada.');}},true);
 catalog.addEventListener('click',e=>{let b=e.target.closest('button');if(b)rec.agregar(clave(b.proxyDe||b));});
 search.oninput=refrescar;
 search.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();idx=moverSeleccion(idx,visibles().length,e.key);marcar();}
  else if(e.key==='Enter'){e.preventDefault();let v=visibles(),b=v[idx]||v[0];if(b)elegir(b);}
  else if(e.key==='Escape'){cancelar();cerrar?.();}
 });
 return {refrescar,elegir,cancelar,get armada(){return armada;},recientes:rec};
}
