import {FILAS,agujerosTabla,punto,grupo,anclar,colocar,sincronizar,avisos,cantidad,redFisica,estadoLed} from './protoboard.mjs';
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
 let pending=null,moving=null,previous=null,view=[15,5,950,320],pan=null,showLabels=true,labelBottom=440;
 const applyView=()=>{svg.setAttribute('viewBox',view.join(' '));actualizarAgujeros();};
 function actualizarAgujeros(){let m=svg.getScreenCTM?.();if(!m)return;let scale=Math.min(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d));if(!scale)return;for(let t of svg.querySelectorAll('.hole-hit'))t.remove();for(let hole of svg.querySelectorAll('[data-hole]:not(.hole-hit)')){let [x,y]=punto(hole.dataset.hole),hit=el('circle',{cx:x,cy:y,r:12/scale,class:'hole-hit','data-hole':hole.dataset.hole,'data-node':hole.dataset.node,fill:'transparent','pointer-events':'none'});hit.onclick=hole.onclick;}}
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(actualizarAgujeros).observe(svg);
 function fit(){let c=circuito(),tray=c.components.filter(p=>!c.physical?.placements[p.id]).length;view=[15,5,tray?1200:950,Math.max(440,tray*85+130,showLabels?labelBottom:0)];applyView();}
 function zoom(f,anchor){let a=anchor??[view[0]+view[2]/2,view[1]+view[3]/2],width=Math.max(120,Math.min(4000,view[2]*f)),ratio=width/view[2];view=[a[0]+(view[0]-a[0])*ratio,a[1]+(view[1]-a[1])*ratio,width,view[3]*ratio];applyView();}
 svg.addEventListener('wheel',e=>{e.preventDefault();let q=point(e);zoom(Math.exp(e.deltaY*.002),[q.x,q.y]);},{passive:false});
 const touches=new Map();let pinch=null;
 svg.addEventListener('pointerdown',e=>{touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){moving=null;pan=null;pinch=Math.hypot(...[...touches.values()][0].map((v,i)=>v-[...touches.values()][1][i]));}else if(!e.target.closest('[data-hole],[data-physical],[data-physical-wire]'))pan=[e.clientX,e.clientY,...view];svg.setPointerCapture(e.pointerId);});
 svg.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){let pts=[...touches.values()],d=Math.hypot(pts[0][0]-pts[1][0],pts[0][1]-pts[1][1]);if(pinch&&d)zoom(pinch/d);pinch=d;}else if(pan){let scale=Math.min(svg.clientWidth/pan[4],svg.clientHeight/pan[5]);view=[pan[2]-(e.clientX-pan[0])/scale,pan[3]-(e.clientY-pan[1])/scale,pan[4],pan[5]];applyView();}});
 for(let name of ['pointerup','pointercancel'])svg.addEventListener(name,e=>{touches.delete(e.pointerId);pan=null;pinch=null;});
 function luces(){let r=resultado?.();for(let p of circuito().components.filter(p=>p.appearance==='led')){let state=estadoLed(r?.currents[p.id]?.[0]??0),body=svg.querySelector('[data-led="'+p.id+'"]');if(body){body.setAttribute('fill',state.quemado?'#332a29':state.encendido?'#ff4934':'#963b34');body.parentElement.querySelector('[data-led-halo]').setAttribute('opacity',String(state.brillo*.65));body.setAttribute('data-state',state.quemado?'quemado':state.encendido?'encendido':'apagado');}}}

 const el=(tag,attrs,parent=svg)=>{if(parent===svg&&tag!=='defs'&&!attrs['data-hole']&&!attrs['data-physical']&&!attrs['data-physical-wire'])attrs={'pointer-events':'none',...attrs};let e=svg.ownerDocument.createElementNS(NS,tag);for(let [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;},label=(x,y,s,parent=svg)=>{let t=el('text',{x,y,'pointer-events':'none',fill:'#1c2630','font-size':13},parent);t.textContent=s;return t;};
 function cerca(e){let m=svg.getScreenCTM(),q=point(e),best=null,d=12;for(let h of agujerosTabla(circuito())){let [x,y]=punto(h),r=Math.hypot(m.a*(x-q.x)+m.c*(y-q.y),m.b*(x-q.x)+m.d*(y-q.y));if(r<=d){d=r;best=h;}}return best;}
 function elegirAgujero(h){if(!pending){pending=h;svg.querySelector('[data-hole="'+h+'"]')?.classList.add('hole-pending');}else{let a=pending;pending=null;if(a!==h)mutate(()=>circuito().physical.wires.push({id:'pw'+Date.now(),a,b:h,color:color()}));}}
 svg.addEventListener('pointerdown',e=>{if(e.button>0||svg.ownerDocument.getElementById('wire')?.getAttribute('aria-pressed')!=='true'||circuito().mode!=='board')return;let h=cerca(e);if(!h)return;e.preventDefault();e.stopImmediatePropagation();elegirAgujero(h);},true);
 svg.addEventListener('click',e=>{if(svg.ownerDocument.getElementById('wire')?.getAttribute('aria-pressed')==='true'){e.preventDefault();e.stopImmediatePropagation();}},true);
 svg.addEventListener('pointermove',e=>{if(svg.ownerDocument.getElementById('wire')?.getAttribute('aria-pressed')!=='true')return;let h=cerca(e);for(let dot of svg.querySelectorAll('[data-hole]'))dot.classList.toggle('hole-pending',dot.dataset.hole===h||dot.dataset.hole===pending);svg.querySelector('.physical-wire-draft')?.remove();if(pending){let q=point(e),a=punto(pending),b=h?punto(h):[q.x,q.y];el('path',{d:'M'+a+'L'+b,class:'physical-wire-draft','pointer-events':'none',fill:'none',stroke:color(),'stroke-width':3,'stroke-dasharray':'6 4'});}});
 function point(e){let p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
 function mutate(fn){try{fn();sincronizar(circuito());cambio();}catch(e){error(e);draw();}}
 function insert(id,h){let c=circuito(),p=c.components.find(p=>p.id===id),v=c.physical.placements[id];colocar(c,id,h,v?.rotation??0,p.type==='Q'?1:v?.span??span());}
 let ghost=null,dragType='R',dragVariant='';
 svg.ownerDocument.querySelector('#catalog').addEventListener('dragstart',e=>{[dragType,dragVariant]=e.dataTransfer.getData('text/plain').split(':');});
 function clearGhost(){ghost?.remove();ghost=null;}
 svg.ondragleave=clearGhost;
 svg.addEventListener('drop',clearGhost);
 svg.ondragover=e=>{if(circuito().mode!=='board')return;e.preventDefault();let q=point(e),h=anclar(q.x,q.y);clearGhost();ghost=el('g',{class:'placement-ghost','pointer-events':'none',opacity:.55,'data-anchor':h||''});let p={id:'preview',type:dragType,appearance:dragVariant||undefined,value:1000,...(dragType==='X'?{definition:definicion(dragVariant)}:{})},pts=[[q.x,q.y],[q.x+span()*14,q.y]];try{if(!h)throw Error('Fuera de la tablilla');let c=circuito(),preview={...c,components:[...c.components,p],physical:{...c.physical,placements:{...c.physical.placements}}};pts=colocar(preview,p.id,h,0,p.type==='Q'?1:p.definition?.package.drawing.span||span()).map(punto);ghost.setAttribute('data-valid','true');}catch{ghost.setAttribute('data-valid','false');}let {mid,angle}=geometriaFisica(p,pts);for(let [i,d] of patillasFisicas(p,pts,mid,angle).entries())el('path',{d,stroke:p.appearance==='battery'?(i?'#242b32':'#e04436'):'#a6adb0','stroke-width':3,fill:'none'},ghost);let body=el('g',{transform:`translate(${mid}) rotate(${angle})`},ghost);body.innerHTML=arteFisico(p);for(let pt of pts)el('circle',{cx:pt[0],cy:pt[1],r:6,stroke:'#21b897',fill:'none','stroke-width':2},ghost);};
 svg.ondrop=e=>{e.preventDefault();let c=circuito();if(c.mode!=='board')return;let q=point(e),h=anclar(q.x,q.y);if(!h||!agujerosTabla(c).includes(h))return error(Error('Suelte sobre un agujero de la protoboard'));let [type,variant]=e.dataTransfer.getData('text/plain').split(':');if(type==='X')return;if(!'RCLVIGDQ'.includes(type)||type.length!==1)return;mutate(()=>{let i=1;while(c.components.some(p=>p.id===type+i))i++;let id=type+i,p={id,type,value:({R:1000,C:1e-6,L:.01,V:9,I:.001,G:0,D:0,Q:0})[type],x:60+((c.components.length)%7)*125,y:390+Math.floor(c.components.length/7)*110,rotation:0,tray:true,...(variant&&type==='Q'?{polarity:variant}:{appearance:variant})};if(variant==='led')Object.assign(p,{Is:1e-17,n:2});c.components.push(p);try{insert(id,h);}catch(e){c.components.pop();throw e;}elegir(id);});};
 let moved=false;
 svg.onpointerup=e=>{if(!moving)return;let id=moving;moving=null;if(!moved)return;let q=point(e),h=anclar(q.x,q.y);if(h&&agujerosTabla(circuito()).includes(h))mutate(()=>insert(id,h));else draw();};
 svg.onpointermove=e=>{if(moving){let q=point(e);if(!moved&&Math.hypot(q.x-movingStart[0],q.y-movingStart[1])<2)return;moved=true;let h=anclar(q.x,q.y),pt=h?punto(h):[q.x,q.y],g=svg.querySelector('[data-physical="'+moving+'"]');if(g){g.style.opacity='.5';g.setAttribute('transform',`translate(${pt[0]-movingStart[0]} ${pt[1]-movingStart[1]})`);}}};
 let movingStart=[0,0];
 // Doble pulsación propia: draw() recrea los <g> entre pulsaciones y el navegador no emite dblclick.
 let toque={id:null,t:-1e9};
 function draw(){let c=circuito(),autoFit=previous!==c;svg.replaceChildren();if(autoFit){previous=c;fit();}else applyView();svg.setAttribute('aria-label','Protoboard física, paso 2.54 mm');if(c.mode!=='board'){label(40,70,'Solo esquemático: este circuito no tiene documento físico.');return;}
 let logical=compilar(c),net=redFisica(c),nodeNames=new Map();for(let p of c.components)for(let i=0;i<cantidad(p);i++)nodeNames.set(net.node(p.id+':'+i),logical.node(p.id+':'+i));
 let defs=el('defs',{});defs.innerHTML='<pattern id="plastic" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#f5f4ef"/><path d="M0 1h1M3 4h1" stroke="#deded8" stroke-width=".5"/></pattern><symbol id="socket" viewBox="-5 -5 10 10"><rect x="-4.5" y="-4.5" width="9" height="9" rx="2" fill="#d3d3cd"/><rect x="-3.1" y="-3.1" width="6.2" height="6.2" rx="1" fill="currentColor"/><path d="M-3 3v-6h6" stroke="#9c9f99" stroke-width=".8" fill="none"/></symbol>';
 el('rect',{x:25,y:15,width:c.physical.size===400?458:920,height:300,rx:12,fill:'url(#plastic)',stroke:'#b8bab4',class:'board-plastic'});el('rect',{x:36,y:146,width:c.physical.size===400?437:899,height:25,rx:3,fill:'#c4c5bf'});
 for(let [f,col] of [['t+','#d54c4c'],['t-','#367aba'],['b+','#d54c4c'],['b-','#367aba']]){let [,y]=punto(f+':1');el('path',{d:`M42 ${y-6}H${c.physical.size===400?468:930}`,stroke:col,fill:'none'});label(30,y+3,f[1]);}
 let occupied=new Set([...Object.values(c.physical.placements).flatMap(v=>v.holes),...c.physical.wires.flatMap(w=>[w.a,w.b])]),groups=new Map(),active=[];
 const clearHover=()=>{for(let dot of active)dot.classList.remove('hole-connected');active=[];};
 for(let f of [...FILAS,'t+','t-','b+','b-']){if(f.length===1){label(30,punto(f+':1')[1]+4,f);label(c.physical.size===400?469:931,punto(f+':1')[1]+4,f);}for(let h of agujerosTabla(c).filter(h=>h.startsWith(f+':'))){let i=Number(h.split(':')[1]),[x,y]=punto(h),key=net.holeNode(h),hole=el('use',{href:'#socket',x:x-5,y:y-5,width:10,height:10,class:occupied.has(h)?'hole occupied':'hole','data-hole':h,'data-group':grupo(h),'data-node':nodeNames.get(key)||'',tabindex:0,role:'button','aria-label':'Agujero '+h+(occupied.has(h)?' ocupado':' libre')});if(!groups.has(key))groups.set(key,[]);groups.get(key).push(hole);let hover=()=>{clearHover();active=groups.get(key);for(let dot of active)dot.classList.add('hole-connected');};hole.onpointerenter=hole.onfocus=hover;hole.onpointerleave=hole.onblur=clearHover;hole.onclick=()=>{if(!pending){pending=h;hole.classList.add('hole-pending');}else{let a=pending;pending=null;if(a!==h)mutate(()=>c.physical.wires.push({id:'pw'+Date.now(),a,b:h,color:color()}));}};hole.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hole.onclick();}};if(f==='a'&&(i===1||i%5===0)){label(x-5,72,''+i);label(x-5,263,''+i);}}}
 if(c.components.some(p=>!c.physical.placements[p.id]))label(970,35,'Bandeja por colocar');
 for(let w of c.physical.wires){let a=punto(w.a),b=punto(w.b),lift=Math.max(20,Math.abs(a[0]-b[0])*.14),wire=el('path',{d:`M${a}C${a[0]} ${a[1]-lift} ${b[0]} ${b[1]-lift} ${b}`,fill:'none',stroke:w.color,'stroke-width':4,'data-physical-wire':w.id,tabindex:0,role:'button','aria-label':`Cable ${w.a} a ${w.b}`});wire.onclick=e=>{e.stopPropagation();elegir(w.id);};}
 let trayIndex=0,labels=[],owners=new Map();for(let p of c.components){let index=c.physical.placements[p.id]?0:trayIndex++;let v=c.physical.placements[p.id],pts=v?.holes.map(punto),a=pts?.[0]??[985,75+index*85],b=pts?.[1]??[a[0]+70,a[1]],{mid,angle}=geometriaFisica({...p,physicalRotation:v?.rotation||0},pts||[a,b]),g=el('g',{'data-physical':p.id,class:'component'+(seleccion()===p.id?' selected':''),tabindex:0,role:'button','aria-label':etiqueta(p)});
  if(pts)for(let [i,d] of patillasFisicas(p,pts,mid,angle).entries())el('path',{d,stroke:p.appearance==='battery'?(i?'#242b32':'#e04436'):'#a6adb0','stroke-width':3,fill:'none',class:'physical-lead'},g);
  let body=el('g',{transform:`translate(${mid}) rotate(${angle})`},g);
  body.innerHTML=arteFisico(p);let led=body.querySelector('[data-led]');if(led)led.setAttribute('data-led',p.id);
  let pkg=p.definition?.package,kind=p.definition?.appearance||p.appearance||({R:'resistor',D:'diode',C:'electrolytic',L:'inductor',Q:'transistor',V:'bench',I:'bench'})[p.type],size=({resistor:[27,12],diode:[24,12],inductor:[27,15],led:[17,45],ceramic:[19,26],electrolytic:[18,32],transistor:[25,32],battery:[31,63],bench:[60,39],generator:[60,39],pot:[25,24]})[kind]||[28,38],halfX=size[0],halfY=size[1];
  if(pkg&&['dip','sip'].includes(pkg.art)){halfX=Math.max(...pkg.pins.map(pin=>pin.x))*7+12;halfY=Math.max(...pkg.pins.map(pin=>pin.y))*7+15;}
  if(angle%180)[halfX,halfY]=[halfY,halfX];
  labels.push({id:p.id,text:etiqueta(p),mid,box:{x:mid[0]-halfX,y:mid[1]-halfY,width:halfX*2,height:halfY*2}});owners.set(p.id,g);
  g.onpointerdown=e=>{e.stopPropagation();if(toque.id===p.id&&e.timeStamp-toque.t<450){toque={id:null,t:-1e9};moving=null;editar(p,g);return;}toque={id:p.id,t:e.timeStamp};elegir(p.id,false);moving=p.id;moved=false;let q=point(e);movingStart=[q.x,q.y];g.setPointerCapture(e.pointerId);}
 }
 let plates=showLabels?ubicarRotulos(labels):[];labelBottom=Math.max(440,...plates.map(r=>r.y+r.height+20));
 for(let r of plates){let g=el('g',{class:'physical-label','pointer-events':'none','data-label-for':r.id},owners.get(r.id));el('path',{d:`M${r.mid}L${r.x+r.width/2} ${r.y+r.height/2}`,stroke:'#687d91','stroke-width':1,fill:'none','pointer-events':'none'},g);el('rect',{x:r.x,y:r.y,width:r.width,height:r.height,rx:5,fill:'#fff8df',stroke:'#687d91','stroke-width':1},g);r.lines.forEach((s,i)=>label(r.x+8,r.y+18+i*17,s,g).setAttribute('font-family','monospace'));}
 if(autoFit)fit();
 svg.setAttribute('data-avisos',avisos(c).join('; '));actualizarAgujeros();luces();
 }
 return {draw,fit,zoom,luces,rotulos(visible){showLabels=visible;draw();fit();},cancel(){pending=null;moving=null;svg.querySelector('.physical-wire-draft')?.remove();for(let h of svg.querySelectorAll('.hole-pending'))h.classList.remove('hole-pending');}};
}
