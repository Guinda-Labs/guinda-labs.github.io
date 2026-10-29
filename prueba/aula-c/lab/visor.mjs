import {medir} from './instrumentos.mjs';
// Visor de ondas (R19): solo existe cuando hay trazas. Hasta 4, un carril por traza.
export const MAX_TRAZAS=4;
export function crearTrazas(max=MAX_TRAZAS){
 let lista=[];
 return {
  get lista(){return [...lista];},
  tiene:n=>lista.includes(n),
  // Alterna: quita si existe; agrega si hay lugar. Devuelve 'quitada' | 'agregada' | 'llena'.
  alternar(n){if(lista.includes(n)){lista=lista.filter(x=>x!==n);return 'quitada';}if(lista.length>=max)return 'llena';lista.push(n);return 'agregada';},
  limpiar(){lista=[];},
  get visible(){return lista.length>0;}
 };
}
export function medidasTraza(tran,nodo){let m=medir(tran,nodo);return {vpp:m.vpp,vrms:m.vrms,frecuencia:m.frequency};}
export function puntosTraza(tran,nodo,ancho=600,alto=60){
 let y=tran.map(r=>r.voltages[nodo][0]),lo=Math.min(...y),hi=Math.max(...y),span=hi-lo||1,t0=tran[0].t,t1=tran.at(-1).t||1;
 return tran.map((r,i)=>[((r.t-t0)/((t1-t0)||1)*ancho).toFixed(1),(alto-4-(y[i]-lo)/span*(alto-8)).toFixed(1)]);
}
export function crearVisor({destino,formato,trazas,quitar,resultado}){
 const el=(t,c,p,txt)=>{let e=document.createElement(t);if(c)e.className=c;if(txt)e.textContent=txt;p?.append(e);return e;};
 let raiz=el('section','visor',destino);raiz.hidden=true;raiz.setAttribute('aria-label','Visor de ondas');
 let cab=el('header','',raiz),titulo=el('strong','',cab,'Ondas'),plegar=el('button','',cab,'Plegar');plegar.type='button';plegar.setAttribute('aria-expanded','true');
 let cuerpo=el('div','visor-cuerpo',raiz),ca=0.25,cb=0.75;
 let cur=el('div','visor-cursores',raiz);
 for(let [n,v,f] of [['A',ca,x=>ca=x],['B',cb,x=>cb=x]]){let l=el('label','',cur,'Cursor '+n+' '),r=el('input','',l);r.type='range';r.min=0;r.max=1000;r.value=v*1000;r.oninput=()=>{f(r.value/1000);dibujar();};}
 plegar.onclick=()=>{let a=cuerpo.hidden;cuerpo.hidden=!a;cur.hidden=!a;plegar.textContent=a?'Plegar':'Desplegar';plegar.setAttribute('aria-expanded',String(a));};
 function dibujar(){
  raiz.hidden=!trazas.visible;cuerpo.replaceChildren();if(!trazas.visible)return;
  let r=resultado();titulo.textContent='Ondas · '+trazas.lista.length+' de '+MAX_TRAZAS;
  trazas.lista.forEach((n,i)=>{
   let carril=el('div','visor-carril',cuerpo),info=el('div','visor-info',carril),q=el('button','',info,'×');q.type='button';q.setAttribute('aria-label','Quitar traza '+n);q.onclick=()=>quitar(n);
   el('strong','',info,'V('+n+')').style.color=`var(--aulac-canal${i+1})`;
   if(!r?.tran?.length){el('span','',info,'Pulse Simular');return;}
   let m=medidasTraza(r.tran,n);el('span','',info,`Vpp ${formato(m.vpp,'V')} · Vrms ${formato(m.vrms,'V')} · f ${Number.isFinite(m.frecuencia)?formato(m.frecuencia,'Hz'):'—'}`);
   let NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 600 60');svg.setAttribute('preserveAspectRatio','none');
   let p=document.createElementNS(NS,'polyline');p.setAttribute('points',puntosTraza(r.tran,n).map(q=>q.join(',')).join(' '));p.setAttribute('fill','none');p.setAttribute('stroke',`var(--aulac-canal${i+1})`);p.setAttribute('stroke-width','2');p.setAttribute('vector-effect','non-scaling-stroke');svg.append(p);
   for(let [x,c] of [[ca,'A'],[cb,'B']]){let l=document.createElementNS(NS,'line');l.setAttribute('x1',x*600);l.setAttribute('x2',x*600);l.setAttribute('y1',0);l.setAttribute('y2',60);l.setAttribute('stroke','var(--aulac-tenue)');l.setAttribute('stroke-dasharray','4 3');l.setAttribute('vector-effect','non-scaling-stroke');svg.append(l);}
   carril.append(svg);
  });
  if(r?.tran?.length){let t0=r.tran[0].t,t1=r.tran.at(-1).t;cur.querySelector('span')?.remove();el('span','',cur,`Δt ${formato(Math.abs(cb-ca)*(t1-t0),'s')}`);}
 }
 return {dibujar,raiz};
}
