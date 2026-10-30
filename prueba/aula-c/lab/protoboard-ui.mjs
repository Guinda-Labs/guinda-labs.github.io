import {navegar} from './navegacion.mjs';
import {FILAS,agujerosTabla,tablasDe,DESPLAZAMIENTO_TABLA,punto,grupo,anclar,colocar,sincronizar,avisos,cantidad,redFisica,estadoLed} from './protoboard.mjs';
import {puntosEncapsulado} from './componentes.mjs';
import {posicionLibre} from './montaje-libre.mjs';
// Patillas de una pieza suelta (montaje sin protoboard): misma convención que las colocadas en agujeros.
export function puntosLibres(p,[x,y]){
 if(p.definition){const t=puntosEncapsulado(p.definition.package);return t.map(q=>[x+q[0]-t[0][0],y+q[1]-t[0][1]]);}
 const n=cantidad(p),paso=n===2?56:14;return Array.from({length:n},(_,i)=>[x+i*paso,y]);
}
import {etiqueta,compilar} from './circuito.mjs';
import {arteFisico,geometriaFisica,patillasFisicas} from './arte-fisico.mjs';
const NS='http://www.w3.org/2000/svg';
// Reserva las franjas de numeración y todos los cuerpos antes de colocar placas.
// En montajes densos usa espacio bajo la tablilla en lugar de tapar otra placa.
export function ubicarRotulos(items){
 const overlap=(a,b)=>a.x<b.x+b.width+4&&a.x+a.width+4>b.x&&a.y<b.y+b.height+4&&a.y+a.height+4>b.y;
 const right=items.some(p=>p.mid[0]>945)?1185:935,used=[{x:25,y:57,width:920,height:20},{x:25,y:247,width:920,height:20},...items.map(p=>p.box)];
 return items.map(p=>{let lines=String(p.text).match(/.{1,38}(?:\s|$)|.{1,38}/gu).map(s=>s.trim()),width=Math.max(...lines.map(s=>[...s].length))*8.5+16,height=lines.length*17+10,b=p.box;
  let candidates=[{x:b.x+b.width+10,y:p.mid[1]-height/2},{x:b.x-width-10,y:p.mid[1]-height/2},{x:p.mid[0]-width/2,y:b.y-height-10},{x:p.mid[0]-width/2,y:b.y+b.height+10}];
  let fits=r=>r.x>=40&&r.x+width<=right&&r.y>=20&&!used.some(b=>overlap({...r,width,height},b));
  let at=candidates.find(fits);
  if(!at){for(let y=330;!at;y+=24)for(let x=40;x+width<=935;x+=28)if(fits({x,y})){at={x,y};break;}}
  let rect={...at,width,height};used.push(rect);return {...rect,id:p.id,mid:p.mid,lines};
 });
}
export function editorFisico(svg,{circuito,seleccion,elegir,cambio,error,editar,color,span,resultado,definicion=()=>null}){
 const botonCable=svg.ownerDocument.getElementById?.('wire');
 let pending=null,moving=null,previous=null,showLabels=true,labelBottom=440;
 function actualizarAgujeros(){let m=svg.getScreenCTM?.();if(!m)return;let scale=Math.min(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d));if(!scale)return;for(let t of svg.querySelectorAll('.hole-hit'))t.remove();for(let hole of svg.querySelectorAll('[data-hole]:not(.hole-hit)')){let [x,y]=puntoCircuito(hole.dataset.hole),hit=el('circle',{cx:x,cy:y,r:12/scale,class:'hole-hit','data-hole':hole.dataset.hole,'data-node':hole.dataset.node,fill:'transparent','pointer-events':'none'});hit.onclick=hole.onclick;}}
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(actualizarAgujeros).observe(svg);
 function limites(){let c=circuito(),libre=!!c.physical?.sinTabla,tray=libre?0:c.components.filter(p=>!c.physical?.placements[p.id]).length,extras=(c.physical?.extras||[]).length,filas=libre?Math.ceil(c.components.length/5):0;return [15,5,tray?1200:950,Math.max(440+extras*DESPLAZAMIENTO_TABLA,tray*85+130,filas*140+140,showLabels?labelBottom:0)];}
 const navigation=navegar(svg,{ajuste:limites,cambio:actualizarAgujeros,cancelarMovimiento:()=>{moving=null;pending=null;},seleccion:()=>{const g=svg.querySelector('[data-physical="'+seleccion()+'"]');if(!g)return null;const b=g.getBBox();return [b.x-30,b.y-30,b.width+60,b.height+60];},bloqueado:()=>svg.classList?.contains?.('wiring')});
 function fit(force=false){navigation.fit(force);}
 function zoom(f,anchor){navigation.zoom(f,anchor);}
 function luces(){let r=resultado?.();for(let p of circuito().components.filter(p=>p.appearance==='led')){let state=estadoLed(r?.currents[p.id]?.[0]??0),body=svg.querySelector('[data-led="'+p.id+'"]');if(body){body.setAttribute('fill',state.quemado?'#332a29':state.encendido?'#ff4934':'#963b34');body.parentElement.querySelector('[data-led-halo]').setAttribute('opacity',String(state.brillo*.65));body.setAttribute('data-state',state.quemado?'quemado':state.encendido?'encendido':'apagado');}}}

 const el=(tag,attrs,parent=svg)=>{if(parent===svg&&tag!=='defs'&&!attrs['data-hole']&&!attrs['data-physical']&&!attrs['data-physical-wire'])attrs={'pointer-events':'none',...attrs};let e=svg.ownerDocument.createElementNS(NS,tag);for(let [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;},label=(x,y,s,parent=svg)=>{let t=el('text',{x,y,'pointer-events':'none',fill:'#1c2630','font-size':13},parent);t.textContent=s;return t;};
 const pinPos=new Map();
 const puntoCircuito=h=>{let c=circuito(),id=h.includes('/')?h.slice(0,h.indexOf('/')):'p1',t=tablasDe(c).find(t=>t.id===id);return punto(h,t?.size||830);};
 function cerca(e){let m=svg.getScreenCTM(),q=point(e),best=null,d=12;for(let h of agujerosTabla(circuito())){let [x,y]=puntoCircuito(h),r=Math.hypot(m.a*(x-q.x)+m.c*(y-q.y),m.b*(x-q.x)+m.d*(y-q.y));if(r<=d){d=r;best=h;}}return best;}
 // Montaje sin protoboard: las patillas sueltas se eligen como «pin:R1:0».
 function cercaPin(e){if(!circuito().physical?.sinTabla)return null;let m=svg.getScreenCTM(),q=point(e),best=null,d=14;for(let [k,[x,y]] of pinPos){let r=Math.hypot(m.a*(x-q.x)+m.c*(y-q.y),m.b*(x-q.x)+m.d*(y-q.y));if(r<=d){d=r;best='pin:'+k;}}return best;}
 const esPin=k=>typeof k==='string'&&k.startsWith('pin:');
 const ubicar=k=>esPin(k)?pinPos.get(k.slice(4)):puntoCircuito(k);
 function elegirAgujero(h){if(!pending){pending=h;if(!esPin(h))svg.querySelector('[data-hole="'+h+'"]')?.classList.add('hole-pending');}else{let a=pending;pending=null;if(a===h)return;if(esPin(a)&&esPin(h))mutate(()=>{let f=circuito().physical;(f.directos||(f.directos=[])).push({id:'pd'+Date.now(),a:a.slice(4),b:h.slice(4),color:color()});});else if(!esPin(a)&&!esPin(h))mutate(()=>circuito().physical.wires.push({id:'pw'+Date.now(),a,b:h,color:color()}));else error(Error('Une patilla con patilla o agujero con agujero'));}}
 svg.addEventListener('pointerdown',e=>{if(navigation.mano||e.isPrimary===false||e.button>0||botonCable?.getAttribute('aria-pressed')!=='true'||circuito().mode!=='board')return;let h=cercaPin(e)||cerca(e);if(!h)return;e.preventDefault();e.stopImmediatePropagation();elegirAgujero(h);},true);
 svg.addEventListener('click',e=>{if(botonCable?.getAttribute('aria-pressed')==='true'){e.preventDefault();e.stopImmediatePropagation();}},true);
 svg.addEventListener('pointermove',e=>{if(botonCable?.getAttribute('aria-pressed')!=='true')return;let h=cercaPin(e)||cerca(e);for(let dot of svg.querySelectorAll('[data-hole]'))dot.classList.toggle('hole-pending',dot.dataset.hole===h||dot.dataset.hole===pending);svg.querySelector('.physical-wire-draft')?.remove();if(pending){let q=point(e),a=ubicar(pending),b=h?ubicar(h):[q.x,q.y];if(a)el('path',{d:'M'+a+'L'+b,class:'physical-wire-draft','pointer-events':'none',fill:'none',stroke:color(),'stroke-width':2,'stroke-dasharray':'6 4','vector-effect':'non-scaling-stroke',opacity:.8});}});
 function point(e){let p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
 function mutate(fn){try{fn();sincronizar(circuito());cambio();}catch(e){error(e);draw();}}
 function insert(id,h){let c=circuito(),p=c.components.find(p=>p.id===id),v=c.physical.placements[id];colocar(c,id,h,v?.rotation??0,p.type==='Q'?1:v?.span??span());}
 let ghost=null,dragType='R',dragVariant='';
 svg.ownerDocument.querySelector('#catalog').addEventListener('dragstart',e=>{[dragType,dragVariant]=e.dataTransfer.getData('text/plain').split(':');});
 function clearGhost(){ghost?.remove();ghost=null;}
 svg.ondragleave=clearGhost;
 svg.addEventListener('drop',clearGhost);
 svg.ondragover=e=>{if(circuito().mode!=='board')return;e.preventDefault();if(circuito().physical.sinTabla)return;let q=point(e),h=anclar(q.x,q.y,circuito());clearGhost();ghost=el('g',{class:'placement-ghost','pointer-events':'none',opacity:.55,'data-anchor':h||''});let p={id:'preview',type:dragType,appearance:dragVariant||undefined,value:1000,...(dragType==='X'?{definition:definicion(dragVariant)}:{})},pts=[[q.x,q.y],[q.x+span()*14,q.y]];try{if(!h)throw Error('Fuera de la tablilla');let c=circuito(),preview={...c,components:[...c.components,p],physical:{...c.physical,placements:{...c.physical.placements}}};pts=colocar(preview,p.id,h,0,p.type==='Q'?1:p.definition?.package.drawing.span||span()).map(puntoCircuito);ghost.setAttribute('data-valid','true');}catch{ghost.setAttribute('data-valid','false');}let {mid,angle}=geometriaFisica(p,pts);for(let [i,d] of patillasFisicas(p,pts,mid,angle).entries())el('path',{d,stroke:p.appearance==='battery'?(i?'#242b32':'#e04436'):'#a6adb0','stroke-width':3,fill:'none'},ghost);let body=el('g',{transform:`translate(${mid}) rotate(${angle})`},ghost);body.innerHTML=arteFisico(p);for(let pt of pts)el('circle',{cx:pt[0],cy:pt[1],r:6,stroke:'#21b897',fill:'none','stroke-width':2},ghost);};
 svg.ondrop=e=>{e.preventDefault();let c=circuito();if(c.mode!=='board')return;let q=point(e),h=anclar(q.x,q.y,circuito()),libre=!!c.physical.sinTabla;if(!libre&&(!h||!agujerosTabla(c).includes(h)))return error(Error('Suelte sobre un agujero de la protoboard'));let [type,variant]=e.dataTransfer.getData('text/plain').split(':');if(type==='X')return;if(!'RCLVIGDQ'.includes(type)||type.length!==1)return;mutate(()=>{let i=1;while(c.components.some(p=>p.id===type+i))i++;let id=type+i,p={id,type,value:({R:1000,C:1e-6,L:.01,V:9,I:.001,G:0,D:0,Q:0})[type],x:60+((c.components.length)%7)*125,y:390+Math.floor(c.components.length/7)*110,rotation:0,tray:true,...(variant&&type==='Q'?{polarity:variant}:{appearance:variant})};if(variant==='led')Object.assign(p,{Is:1e-17,n:2});c.components.push(p);if(libre){(c.physical.libres||(c.physical.libres={}))[id]={x:Math.max(30,Math.round(q.x/14)*14),y:Math.max(30,Math.round(q.y/14)*14)};}else try{insert(id,h);}catch(e){c.components.pop();throw e;}elegir(id);});};
 let moved=false;
 svg.onpointerup=e=>{if(!moving)return;let id=moving;moving=null;if(!moved)return;let q=point(e),c=circuito();if(c.physical?.sinTabla){let [ox,oy]=posicionLibre(c,id);mutate(()=>{(c.physical.libres||(c.physical.libres={}))[id]={x:Math.max(30,Math.round((ox+q.x-movingStart[0])/14)*14),y:Math.max(30,Math.round((oy+q.y-movingStart[1])/14)*14)};});return;}let h=anclar(q.x,q.y,c);if(h&&agujerosTabla(c).includes(h))mutate(()=>insert(id,h));else draw();};
 svg.onpointermove=e=>{if(moving){let q=point(e);if(!moved&&Math.hypot(q.x-movingStart[0],q.y-movingStart[1])<2)return;moved=true;let h=circuito().physical?.sinTabla?null:anclar(q.x,q.y,circuito()),pt=h?puntoCircuito(h):[q.x,q.y],g=svg.querySelector('[data-physical="'+moving+'"]');if(g){g.style.opacity='.5';g.setAttribute('transform',`translate(${pt[0]-movingStart[0]} ${pt[1]-movingStart[1]})`);}}};
 let movingStart=[0,0];
 // Doble pulsación propia: draw() recrea los <g> entre pulsaciones y el navegador no emite dblclick.
 let toque={id:null,t:-1e9};
 function draw(){let c=circuito(),autoFit=previous!==c;svg.replaceChildren();if(autoFit){previous=c;fit();}else navigation.apply();svg.setAttribute('aria-label','Protoboard física, paso 2.54 mm');if(c.mode!=='board'){label(40,70,'Solo esquemático: este circuito no tiene documento físico.').setAttribute('class','board-notice');label(40,96,'Agrega una protoboard o pulsa «Montaje libre» para unir piezas con cables directos.').setAttribute('class','board-notice');return;}
 let logical=compilar(c),net=redFisica(c),nodeNames=new Map();for(let p of c.components)for(let i=0;i<cantidad(p);i++)nodeNames.set(net.node(p.id+':'+i),logical.node(p.id+':'+i));
 let defs=el('defs',{});defs.innerHTML='<pattern id="plastic" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#f5f4ef"/><path d="M0 1h1M3 4h1" stroke="#deded8" stroke-width=".5"/></pattern><symbol id="socket" viewBox="-5 -5 10 10"><rect x="-4.5" y="-4.5" width="9" height="9" rx="2" fill="#d3d3cd"/><rect x="-3.1" y="-3.1" width="6.2" height="6.2" rx="1" fill="currentColor"/><path d="M-3 3v-6h6" stroke="#9c9f99" stroke-width=".8" fill="none"/></symbol>';
 const mesas=tablasDe(c),libre=!!c.physical.sinTabla;
 for(const t of mesas){const dy=(Number(t.id.slice(1))-1)*DESPLAZAMIENTO_TABLA,corta=t.size===400;el('rect',{x:25,y:15+dy,width:corta?458:920,height:300,rx:12,fill:'url(#plastic)',stroke:'#b8bab4',class:'board-plastic'});el('rect',{x:36,y:146+dy,width:corta?437:899,height:25,rx:3,fill:'#c4c5bf'});if(t.id!=='p1')label(30,dy+10,'Protoboard '+t.id.slice(1));}
 for(const t of mesas){const pre=t.id==='p1'?'':t.id+'/',ultimo=t.size===400?25:50;for(let [f,col] of [['t+','#d54c4c'],['t-','#367aba'],['b+','#d54c4c'],['b-','#367aba']]){let [x0,y]=punto(pre+f+':1',t.size),[x1]=punto(pre+f+':'+ultimo,t.size);el('path',{d:`M${x0-12} ${y-6}H${x1+12}`,stroke:col,fill:'none'});label(30,y+3,f[1]);}}
 let occupied=new Set([...Object.values(c.physical.placements).flatMap(v=>v.holes),...c.physical.wires.flatMap(w=>[w.a,w.b])]),groups=new Map(),active=[];
 const clearHover=()=>{for(let dot of active)dot.classList.remove('hole-connected');active=[];};
 const todos=agujerosTabla(c);for(const t of mesas)for(let f of [...FILAS,'t+','t-','b+','b-']){const pre=t.id==='p1'?'':t.id+'/',dy=(Number(t.id.slice(1))-1)*DESPLAZAMIENTO_TABLA;if(f.length===1){label(30,punto(pre+f+':1',t.size)[1]+4,f);label(t.size===400?469:931,punto(pre+f+':1',t.size)[1]+4,f);}for(let h of todos.filter(h=>h.startsWith(pre+f+':'))){let i=Number(h.split(':')[1]),[x,y]=punto(h,t.size),key=net.holeNode(h),hole=el('use',{href:'#socket',x:x-5,y:y-5,width:10,height:10,class:occupied.has(h)?'hole occupied':'hole','data-hole':h,'data-group':grupo(h),'data-node':nodeNames.get(key)||'',tabindex:0,role:'button','aria-label':'Agujero '+h+(occupied.has(h)?' ocupado':' libre')});if(!groups.has(key))groups.set(key,[]);groups.get(key).push(hole);let hover=()=>{clearHover();active=groups.get(key);for(let dot of active)dot.classList.add('hole-connected');};hole.onpointerenter=hole.onfocus=hover;hole.onpointerleave=hole.onblur=clearHover;hole.onclick=()=>{if(!pending){pending=h;hole.classList.add('hole-pending');}else{let a=pending;pending=null;if(a!==h)mutate(()=>c.physical.wires.push({id:'pw'+Date.now(),a,b:h,color:color()}));}};hole.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hole.onclick();}};if(f==='a'&&(i===1||i%5===0)){label(x-5,72+dy,''+i);label(x-5,263+dy,''+i);}}}
 if(!libre&&c.components.some(p=>!c.physical.placements[p.id]))label(970,35,'Bandeja por colocar');
 pinPos.clear();if(libre)for(const p of c.components)puntosLibres(p,posicionLibre(c,p.id)).forEach((q,k)=>pinPos.set(p.id+':'+k,q));
 for(let w of c.physical.wires){let a=puntoCircuito(w.a),b=puntoCircuito(w.b),lift=Math.max(20,Math.abs(a[0]-b[0])*.14),wire=el('path',{d:`M${a}C${a[0]} ${a[1]-lift} ${b[0]} ${b[1]-lift} ${b}`,fill:'none',stroke:w.color,'stroke-width':4,'data-physical-wire':w.id,tabindex:0,role:'button','aria-label':`Cable ${w.a} a ${w.b}`});wire.onclick=e=>{e.stopPropagation();elegir(w.id);};}
 for(let w of c.physical.directos||[]){let a=pinPos.get(w.a),b=pinPos.get(w.b);if(!a||!b)continue;let lift=Math.max(16,Math.abs(a[0]-b[0])*.12),wire=el('path',{d:`M${a}C${a[0]} ${a[1]-lift} ${b[0]} ${b[1]-lift} ${b}`,fill:'none',stroke:w.color,'stroke-width':3.5,'stroke-linecap':'round','data-physical-wire':w.id,tabindex:0,role:'button','aria-label':`Cable directo ${w.a} a ${w.b}`});wire.onclick=e=>{e.stopPropagation();elegir(w.id);};}
 let trayIndex=0,labels=[],owners=new Map();for(let p of c.components){let index=c.physical.placements[p.id]||libre?0:trayIndex++;let v=c.physical.placements[p.id],pts=v?.holes.map(puntoCircuito)||(libre?puntosLibres(p,posicionLibre(c,p.id)):undefined),a=pts?.[0]??[985,75+index*85],b=pts?.[1]??[a[0]+70,a[1]],{mid,angle}=geometriaFisica({...p,physicalRotation:v?.rotation||0},pts||[a,b]),g=el('g',{'data-physical':p.id,class:'component'+(seleccion()===p.id?' selected':''),tabindex:0,role:'button','aria-label':etiqueta(p)});
  if(pts)for(let [i,d] of patillasFisicas(p,pts,mid,angle).entries())el('path',{d,stroke:p.appearance==='battery'?(i?'#242b32':'#e04436'):'#a6adb0','stroke-width':3,fill:'none',class:'physical-lead'},g);
  if(libre&&pts)pts.forEach((q,k)=>el('circle',{cx:q[0],cy:q[1],r:5,class:'pin-libre','data-pin-libre':p.id+':'+k,fill:'#fff8df',stroke:'#21b897','stroke-width':2,'pointer-events':'none'},g));
  let body=el('g',{transform:`translate(${mid}) rotate(${angle})`},g);
  body.innerHTML=arteFisico(p);let led=body.querySelector('[data-led]');if(led)led.setAttribute('data-led',p.id);
  let pkg=p.definition?.package,kind=p.definition?.appearance||p.appearance||({R:'resistor',D:'diode',C:'electrolytic',L:'inductor',Q:'transistor',V:'bench',I:'bench'})[p.type],size=({resistor:[27,12],diode:[24,12],inductor:[27,15],led:[17,45],ceramic:[19,26],electrolytic:[18,32],transistor:[25,32],battery:[31,63],bench:[60,39],generator:[60,39],pot:[25,24]})[kind]||[28,38],halfX=size[0],halfY=size[1];
  if(pkg&&['dip','sip'].includes(pkg.art)){halfX=Math.max(...pkg.pins.map(pin=>pin.x))*7+12;halfY=Math.max(...pkg.pins.map(pin=>pin.y))*7+15;}
  if(angle%180)[halfX,halfY]=[halfY,halfX];
  labels.push({id:p.id,text:etiqueta(p),mid,box:{x:mid[0]-halfX,y:mid[1]-halfY,width:halfX*2,height:halfY*2}});owners.set(p.id,g);
  g.onpointerdown=e=>{if(e.button!==0)return;e.stopPropagation();if(toque.id===p.id&&e.timeStamp-toque.t<450){toque={id:null,t:-1e9};moving=null;editar(p,g);return;}toque={id:p.id,t:e.timeStamp};elegir(p.id,false);moving=p.id;moved=false;let q=point(e);movingStart=[q.x,q.y];g.setPointerCapture(e.pointerId);}
 }
 let plates=showLabels?ubicarRotulos(labels):[];labelBottom=Math.max(440,...plates.map(r=>r.y+r.height+20));
 for(let r of plates){let g=el('g',{class:'physical-label','pointer-events':'none','data-label-for':r.id},owners.get(r.id));el('path',{d:`M${r.mid}L${r.x+r.width/2} ${r.y+r.height/2}`,stroke:'#687d91','stroke-width':1,fill:'none','pointer-events':'none'},g);el('rect',{x:r.x,y:r.y,width:r.width,height:r.height,rx:5,fill:'#fff8df',stroke:'#687d91','stroke-width':1},g);r.lines.forEach((s,i)=>label(r.x+8,r.y+18+i*17,s,g).setAttribute('font-family','monospace'));}
 if(autoFit)fit();
 svg.setAttribute('data-avisos',avisos(c).join('; '));actualizarAgujeros();luces();
 }
 return {draw,fit,zoom,navigation,luces,rotulos(visible){showLabels=visible;draw();fit();},cancel(){pending=null;moving=null;svg.querySelector('.physical-wire-draft')?.remove();for(let h of svg.querySelectorAll('.hole-pending'))h.classList.remove('hole-pending');}};
}
