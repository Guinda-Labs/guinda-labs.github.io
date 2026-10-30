// Escala en píxeles por unidad: resize conserva centro y escala del alumno.
export function encuadre(inicial=[0,0,960,420]){
 let frame=[...inicial],auto=true,size=[960,420],bounds=[...inicial],oculto=0;
 // El viewBox conserva el tamaño total; el circuito se centra antes de la zona tapada.
 const fit=f=>{const visible=size[0]-oculto,s=Math.min(2,visible/f[2],size[1]/f[3]),w=size[0]/s,h=size[1]/s;return [f[0]+(f[2]-visible/s)/2,f[1]+(f[3]-h)/2,w,h];};
 return {
  get frame(){return [...frame];},get auto(){return auto;},get escala(){return size[0]/frame[2];},
  ajustar(f){bounds=[...f];if(auto){const dentro=f[0]>=frame[0]&&f[1]>=frame[1]&&f[0]+f[2]<=frame[0]+frame[2]&&f[1]+f[3]<=frame[1]+frame[3];if(!dentro)frame=fit(f);}return this.frame;},
  centrar(f){auto=true;bounds=[...f];frame=fit(f);return this.frame;},
  zoom(f,a=[frame[0]+frame[2]/2,frame[1]+frame[3]/2]){const scale=this.escala,next=Math.max(.1,Math.min(8,scale/f)),r=scale/next;frame=[a[0]+(frame[0]-a[0])*r,a[1]+(frame[1]-a[1])*r,frame[2]*r,frame[3]*r];auto=false;return this.frame;},
  mover(dx,dy){for(const [axis,d] of [[0,dx],[1,dy]]){const overlap=Math.min(bounds[axis+2],frame[axis+2])*.25;frame[axis]=Math.max(bounds[axis]+overlap-frame[axis+2],Math.min(bounds[axis]+bounds[axis+2]-overlap,frame[axis]+d));}auto=false;return this.frame;},
  resize(w,h,derecha=0){if(!(w>0&&h>0))return this.frame;const cx=frame[0]+frame[2]/2,cy=frame[1]+frame[3]/2,s=this.escala;size=[w,h];oculto=Math.max(0,Math.min(w-1,derecha));if(!auto)frame=[cx-w/s/2,cy-h/s/2,w/s,h/s];else if(size[0]/frame[2]>2)frame=fit(bounds);return this.frame;},
  seleccionar(f){auto=false;frame=fit(f);return this.frame;}
 };
}
export function navegar(svg,{ajuste,seleccion=()=>null,bloqueado=()=>false,cambio=()=>{},cancelarMovimiento=()=>{},controles=true}={}){
 const state=encuadre((svg.getAttribute?.('viewBox')||'0 0 960 420').split(/\s+/).map(Number));
 let space=false,drag=null,pinch=null,moved=false;const touches=new Map(),doc=svg.ownerDocument;
 const point=(x,y)=>{const p=svg.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(svg.getScreenCTM().inverse());return [q.x,q.y];};
 let pct=null;
 const apply=()=>{svg.setAttribute('viewBox',state.frame.join(' '));if(pct)pct.textContent=Math.round(state.escala*100)+' % ▾';cambio();};
 const work=svg.closest?.('.work');
 const resize=()=>{const panel=work?.querySelector?.('#instrumentoPanel'),r=svg.getBoundingClientRect?.(),p=panel&&!panel.hidden&&work.classList.contains('panel-flotante')?panel.getBoundingClientRect():null;state.resize(svg.clientWidth,svg.clientHeight,r&&p?occlusionDerecha(r,p):0);};
 const fit=(force=false)=>{resize();if(force)state.centrar(ajuste());else if(state.auto)state.ajustar(ajuste());apply();};
 const run=action=>{if(action==='centrar')fit(true);else if(action==='seleccion'){const f=seleccion();if(f){state.seleccionar(f);apply();}}else{state.zoom(action==='real'?state.escala:action==='acercar'?.8:1.25);apply();}};
 svg.setAttribute('tabindex','0');if(svg.style)svg.style.touchAction='none';
 svg.addEventListener('wheel',e=>{e.preventDefault();if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))state.mover((e.deltaX||e.deltaY)/state.escala,0);else state.zoom(Math.exp(Math.max(-500,Math.min(500,e.deltaY))*.002),point(e.clientX,e.clientY));apply();},{passive:false});
 doc.addEventListener?.('keydown',e=>{if(e.code==='Space'&&!/^(INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY|A)$/.test(e.target.tagName)&&!e.target.isContentEditable){space=true;e.preventDefault();}});
 doc.addEventListener?.('keyup',e=>{if(e.code==='Space')space=false;});
 doc.defaultView?.addEventListener('blur',()=>{space=false;touches.clear();drag=pinch=null;});
 const foreground='[data-component],[data-pin],[data-wire],[data-hole],[data-physical],[data-physical-wire]';
 // Antes del cableado del SVG: un segundo dedo debe poder iniciar el pellizco.
 const surface=svg.parentElement||svg;
 surface.addEventListener('pointerdown',e=>{
  if(surface!==svg&&!svg.contains(e.target))return;
  if(e.button===2)return;touches.set(e.pointerId,[e.clientX,e.clientY]);
  if(touches.size===2){drag=null;cancelarMovimiento();pinch=[...touches.values()];e.preventDefault();e.stopImmediatePropagation();}
  else if(space||e.button===1||!bloqueado()&&!e.target.closest(foreground)){drag=[e.clientX,e.clientY];moved=false;e.preventDefault();e.stopImmediatePropagation();}
  else return;
  svg.focus({preventScroll:true});svg.setPointerCapture(e.pointerId);
 },true);
 svg.addEventListener('pointermove',e=>{
  if(!touches.has(e.pointerId))return;touches.set(e.pointerId,[e.clientX,e.clientY]);
  if(touches.size===2){const pts=[...touches.values()],mid=p=>[(p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2],dist=p=>Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch){const a=mid(pinch),b=mid(pts),d=dist(pts);if(d)state.zoom(dist(pinch)/d,point(...a));state.mover((a[0]-b[0])/state.escala,(a[1]-b[1])/state.escala);apply();}pinch=pts;moved=true;e.stopImmediatePropagation();}
  else if(drag){const dx=e.clientX-drag[0],dy=e.clientY-drag[1];if(dx||dy){state.mover(-dx/state.escala,-dy/state.escala);apply();moved=true;}drag=[e.clientX,e.clientY];e.stopImmediatePropagation();}
 },true);
 for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(name,e=>{touches.delete(e.pointerId);if(drag||pinch){drag=pinch=null;e.stopImmediatePropagation();}},true);
 svg.addEventListener('click',e=>{if(moved){moved=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 svg.addEventListener('dblclick',e=>{if(!bloqueado()&&!e.target.closest(foreground)){e.preventDefault();fit(true);}});
 if(controles&&doc.createElement){
  const bar=doc.createElement('div');bar.className='zoom-lienzo';bar.setAttribute('aria-label','Zoom');
  const button=(label,action,title)=>{const b=doc.createElement('button');b.type='button';b.textContent=label;b.title=title||label;b.setAttribute('aria-label',title||label);b.onclick=()=>run(action);bar.append(b);return b;};
  button('−','alejar','Alejar');const details=doc.createElement('details'),summary=doc.createElement('summary');pct=summary;details.append(summary);bar.append(details);
  for(const [label,action] of [['Volver a centrar','centrar'],['Centrar en la selección','seleccion'],['100 %','real']]){const b=button(label,action);b.onclick=()=>{run(action);details.open=false;};details.append(b);}
  button('+','acercar','Acercar');const b=button('⤢','centrar','Volver a centrar (Mayús+1)'),span=doc.createElement('span');span.textContent=' Volver a centrar';b.append(span);svg.parentElement.append(bar);
 }
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>fit()).observe(svg);
 if(work&&typeof MutationObserver!=='undefined')new MutationObserver(()=>fit()).observe(work,{attributes:true,attributeFilter:['class','style']});
 state.resize(svg.clientWidth,svg.clientHeight);fit();return {state,fit,run,apply,get mano(){return space;},zoom:(f,a)=>{state.zoom(f,a);apply();}};
}
export function occlusionDerecha(r,p){return p.top<r.bottom&&p.bottom>r.top&&p.right>r.left&&p.left<r.right?Math.max(0,r.right-Math.max(r.left,p.left-12)):0;}
