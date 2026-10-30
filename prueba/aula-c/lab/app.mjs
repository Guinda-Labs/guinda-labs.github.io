import {navegar} from './navegacion.mjs';
import {crearAnalisis} from './analisis-ui.mjs';
var analisisCtl=null;
const HERRAMIENTAS=[...INSTRUMENTOS,{id:'mallas',nombre:'Mallas',selectores:['#analisisContenido']},{id:'nodos',nombre:'Nodos',selectores:['#analisisContenido']},{id:'thevenin',nombre:'Thévenin',selectores:['#analisisContenido']},{id:'campo',nombre:'Campo',selectores:['#analisisContenido']}];
import {crearBarra} from './menus.mjs';
var schemeNavigation=null,schemeBounds=null,distribuir=null;
import {MotorNgspiceWeb} from './motor/ngspice-web.mjs';
import {velocidadCorriente,preferenciasCorriente,posicionMenu,muestraCorriente,escalaTiempo,flujosCorriente} from './instrumentos.mjs';
import {bibliotecaUI} from './componentes-ui.mjs';
import {paletaUI} from './paleta.mjs';
import {catalogoUI,piezaDePayload,simboloCatalogo} from './catalogo.mjs';
import {montajeSinTabla} from './montaje-libre.mjs';
import {copiarSeleccion,pegarSeleccion,menuContextual} from './edicion.mjs';
var catalogoCtl=null;
var instrumentosUno=null;
import {asignarDivision,configurarAnalisis,simularDocumento,sondasPractica,autoescalaPractica,lecturasSondas} from './simulacion-ui.mjs';
import {prepararEsquema,simboloPractica,rotuloEsquema,encuadreEsquema,cajasEsquema,distribuirEtiquetas,unidades,objetivos,cargarCuaderno,seleccionarINA} from './b309-presentacion.mjs';
import {simboloEncapsulado,validarComponente,etiquetaCorta} from './componentes.mjs';
import {editorFisico} from './protoboard-ui.mjs';
import {arteFisico} from './arte-fisico.mjs';
import {gananciaINA,otroChip,rgConectada,cambiarChip} from './valor-ui.mjs';
import {crearInspector,preguntarTexto} from './inspector.mjs';
import {crearTrazas,crearVisor} from './visor.mjs';
import {accionTecla,AYUDA} from './atajos.mjs';
import {selectorUno,INSTRUMENTOS,aplicarVisibilidad,mostrarPuntas} from './instrumentos-uno.mjs';
import {estadoLed,documento,agregarProtoboard,agregarTablaExtra,ejemploFisico,sincronizar,avisos,colocar,agujero,anclar,redFisica} from './protoboard.mjs';
import {abrirVentana} from './ventanas.mjs';
import {leerAulac,escribirAulac} from './nucleo/aulac-archivo.mjs';
import {MNA,valor} from './motor/mna.mjs';
import {medir,desfase,autoescala,disparo,resistencia} from './instrumentos.mjs';
import {amplificador,simbolos,ruta,terminal,libre,extremo,patillas} from './circuito.mjs';
import {canal,ganancia} from './instrumentos.mjs';
import {pasos125,paso125,division,barrer,alimentar} from './instrumentos.mjs';
import {ejemplo,compilar,texto,editar,validar,bandas,formato,etiqueta,montaje} from './circuito.mjs';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const webStatic=window.AULAC_WEB===true;
const webMotor=webStatic?new MotorNgspiceWeb({peso:window.AULAC_MOTOR?.bytes,estado:message=>{$('aulac-state').textContent=message;}}):null;
let webReady=null;
if(webStatic){
 webReady=webMotor.iniciar();
 webReady.then(()=>{engine.value='ngspice';if(result&&!dirty&&!calculando)simulate();}).catch(e=>console.warn('[ngspice web]',e.message));
 if('serviceWorker' in navigator){const previo=navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!previo||document.getElementById('aulac-version-nueva'))return;const b=document.createElement('button');b.id='aulac-version-nueva';b.type='button';b.textContent='Versión nueva del laboratorio · Recargar';b.style.cssText='position:fixed;right:16px;bottom:40px;z-index:50';b.onclick=()=>location.reload();document.body.append(b);});navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('[Caché lab]',e.message));}
}
const vacio=()=>({version:1,mode:'scheme',components:[],wires:[]});
let circuit=vacio(),modificado=false,selected=null,wiring=false,pending=null,drag=null,result=null,dirty=true,paused=false,calculando=false,phase=0,last=0;
var seleccionMultiple=null;
let animationResult=null,animationMax=0,animationScale=1,animationFlows=()=>new Map();
const desplazamientos=new Map();
const movimiento=preferenciasCorriente(()=>localStorage),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function el(tag,attrs={},parent){if(['scheme','board'].includes(parent?.id)&&tag!=='g'&&!attrs['data-wire']&&!attrs['data-node']&&!attrs['data-pin'])attrs={'pointer-events':'none',...attrs};let e=document.createElementNS(NS,tag);for(let [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent?.append(e);return e;}
function text(parent,x,y,s,attrs={}){let e=el('text',{x,y,'pointer-events':'none',...attrs},parent);e.textContent=s;return e;}
function status(s){let burned=result&&circuit.components.filter(p=>p.appearance==='led'&&estadoLed(result.dc.currents[p.id]?.[0]).quemado).map(p=>p.id);$('status').textContent=s+(burned?.length?' · LED quemado: '+burned.join(', ')+' supera 30 mA. Aumente la resistencia.':'');}
function fail(e){status('Error: '+e.message);console.error('[AULA-C Lab]',{error:e.message,netlist:texto(circuit),dt:$('dt').value,tiempoDivision:$('tdiv').value});}
function change(){modificado=true;dirty=true;result=null;$('simulate').textContent='▶ Simular';render();status('Circuito modificado. Pulse Simular para actualizar instrumentos.');$('meter').textContent='Resultados pendientes';$('scope').replaceChildren();$('bode').replaceChildren();}
function pin(key){if((circuit.components.find(p=>p.id===key.split(':')[0])?.definition||circuit.components.find(p=>p.id===key.split(':')[0])?.flipped))return terminal(circuit,key);let [id,index]=key.split(':'),p=circuit.components.find(p=>p.id===id),a=p.rotation*Math.PI/180,d=p.type==='G'?0:(Number(index)?40:-40);return [p.x+Math.cos(a)*d,p.y+Math.sin(a)*d];}
function path(a,b){return `M${a[0]} ${a[1]}H${(a[0]+b[0])/2}V${b[1]}H${b[0]}`;}
function choose(id,redraw=true){seleccionMultiple?.clear();selected=id;if(redraw)render();else{for(let e of document.querySelectorAll('[data-component],[data-physical]'))e.classList.toggle('selected',(e.dataset.component||e.dataset.physical)===id);$('selection').textContent=id;}}
function render(){let svg=$('scheme');svg.replaceChildren();let defs=el('defs',{},svg),pat=el('pattern',{id:'grid',width:20,height:20,patternUnits:'userSpaceOnUse'},defs);el('path',{d:'M20 0H0V20',fill:'none',stroke:'var(--aulac-superficie2)'},pat);el('rect',{width:960,height:420,fill:'url(#grid)'},svg);let model=compilar(circuit);
 for(let w of circuit.wires){let points=ruta(circuit,w),d=points.map((q,i)=>(i?'L':'M')+q.join(' ')).join(''),hit=el('path',{d,class:'wire-hit','data-wire':w.id},svg);hit.onclick=e=>{e.stopPropagation();if(wiring)cableEnCable(w,point(e));else choose(w.id)};let p=el('path',{d,class:'wire'+(selected===w.id?' selected':''),'data-wire':w.id},svg);p.dataset.node=model.node(w.a);p.onclick=e=>{e.stopPropagation();if(wiring)cableEnCable(w,point(e));else choose(w.id)};for(let i=0;i<6;i++)el('path',{class:'dot','data-dot':w.id,'data-offset':i/6},svg);}
 let ends=circuit.wires.flatMap(w=>[w.a,w.b]);for(let key of new Set(ends)){if(libre(key)&&ends.filter(k=>k===key).length<3)continue;let [x,y]=extremo(circuit,key);el('circle',{cx:x,cy:y,r:3.5,fill:'var(--aulac-texto)',class:'junction','data-node':model.node(key)},svg);}
 for(let p of circuit.components){let g=el('g',{class:'component'+(selected===p.id?' selected':''),'data-component':p.id},svg),s=el('g',{transform:`translate(${p.x} ${p.y}) rotate(${p.rotation})`,class:'body',stroke:'var(--aulac-texto)','stroke-width':2,fill:'none'},g);let shapes={R:'M-40 0H-24L-20-10L-12 10L-4-10L4 10L12-10L20 10L24 0H40',C:'M-40 0H-6M-6-20V20M6-20V20M6 0H40',L:'M-40 0H-30C-30-25-10-25-10 0C-10-25 10-25 10 0C10-25 30-25 30 0H40',V:'M-40 0H-22M22 0H40',I:'M-40 0H-22M22 0H40M-10 0H10L3-7M10 0L3 7',G:'M0 0V12M-20 12H20M-12 20H12M-5 28H5'};if(p.definition)s.innerHTML=simboloEncapsulado(p.definition.package,p.definition.name);else el('path',{d:shapes[p.type]},s);if('VI'.includes(p.type))el('circle',{r:22},s);if(p.type==='V'&&!p.definition){let a=p.rotation*Math.PI/180,at=d=>[p.x+Math.cos(a)*d,p.y+Math.sin(a)*d],[px,py]=at(-11),[mx,my]=at(11);el('path',{d:`M${px-5} ${py}H${px+5}M${px} ${py-5}V${py+5}M${mx-5} ${my}H${mx+5}`,stroke:'var(--aulac-texto)','stroke-width':2.5,fill:'none',class:'polarity','pointer-events':'none'},g);}let external=p.definition?p.id+' · '+etiquetaCorta(p.definition.name,14):etiqueta(p).split(' · ')[0],vertical=p.rotation%180!==0,bodyHeight=p.definition?Math.max(32,(Math.ceil(p.definition.package.pins.length/2)-1)*18+20):0,labelX=p.x+(vertical?(p.definition?bodyHeight/2+20:35):0),labelY=p.y+(vertical?(p.definition?0:-15):p.definition?-bodyHeight/2-20:-38);let label=text(g,labelX,labelY,external,{'text-anchor':vertical?'start':'middle',class:'component-label'});if(p.wave){let line=el('tspan',{x:p.x+(p.rotation%180?35:0),dy:30},label);line.textContent=etiqueta(p).split(' · ')[1];}for(let i=0;i<(p.definition?.package.pins.length??(p.type==='G'?1:2));i++){let key=p.id+':'+i,[x,y]=pin(key);let terminal=el('circle',{cx:x,cy:y,r:6,class:'terminal','data-pin':key},g);let pinDef=p.definition?.package.pins[i];if(pinDef)el('title',{},terminal).textContent=pinDef.number+' · '+pinDef.name;terminal.onclick=e=>{e.stopPropagation();if(wiring){cableClic(key);}else{choose(p.id);status('Terminal '+key+' · nodo '+model.node(key));}};terminal.dataset.node=model.node(key);if($('nodes').checked)text(g,x+8,y+22,model.node(key),{'font-size':26});}let bb=s.getBBox?.();if(bb){let hit=el('rect',{x:bb.x-6,y:bb.y-6,width:bb.width+12,height:bb.height+12,fill:'transparent',stroke:'none',class:'hit-area'},s);s.prepend(hit);}g.onpointerdown=e=>{if(e.button!==0||e.target.hasAttribute('data-pin')||wiring)return;if(dobleToque(p.id,e.timeStamp)){drag=null;selected=p.id;edit(p);return;}choose(p.id,false);inspector?.sincronizar();let q=point(e);drag={p,dx:q.x-p.x,dy:q.y-p.y,x:p.x,y:p.y,tray:p.tray};svg.setPointerCapture(e.pointerId);};}
 $('selection').textContent=selected||'Sin selección';board();options(model);inspector?.sincronizar();}
// Doble pulsación propia: el <g> se recrea entre pulsaciones y el navegador no emite dblclick sobre él.
let toque={id:null,t:-1e9};
function dobleToque(id,t){let doble=toque.id===id&&t-toque.t<450;toque=doble?{id:null,t:-1e9}:{id,t};return doble;}
// Cableado estilo xschem: cada clic fija un vértice; entre vértices, tramo horizontal y luego vertical.
let draft=null;
const malla=v=>Math.round(v/10)*10;
function terminalCerca(q){let best=null,d=12,m=$('scheme').getScreenCTM();for(let p of circuit.components)for(let i=0;i<patillas(p);i++){let k=p.id+':'+i,[x,y]=pin(k),r=Math.hypot(m.a*(x-q.x)+m.c*(y-q.y),m.b*(x-q.x)+m.d*(y-q.y));if(r<=d){d=r;best=k;}}return best;}
function codo(pts,q){let z=pts.at(-1);if(z[0]===q[0]&&z[1]===q[1])return pts;return [...pts,...(z[0]!==q[0]&&z[1]!==q[1]?[[q[0],z[1]]]:[]),q];}
function libreEn(q){for(let w of circuit.wires)for(let k of [w.a,w.b])if(libre(k)&&k==='@'+q.join(','))return k;return null;}
function cableClic(key,q){if(key===null){key=terminalCerca(q);}let pos=key?pin(key):[malla(q.x),malla(q.y)];if(!draft){draft={a:key||libreEn(pos)||'@'+pos.join(','),points:[pos]};status('Cable desde '+draft.a+': clic para doblar; termine en una terminal o un cable, doble clic o Enter; Esc cancela');boceto();return;}draft.points=codo(draft.points,pos);let fin=key||libreEn(pos);if(fin)terminarCable(fin);else boceto();}
function terminarCable(b){if(!draft)return;let a=draft.a,pts=draft.points;b=b||'@'+pts.at(-1).join(',');draft=null;$('wire-draft')?.remove();if(a===b||pts.length<2){status('Cable vacío descartado');return;}circuit.wires.push({id:next('w'),a,b,points:pts,manual:true});change();status('Cable '+a+' → '+b+'. Siga con otro clic o pulse Esc');}
function cableEnCable(w,q){let pts=ruta(circuit,w),best=null;for(let i=1;i<pts.length;i++){let [a,b]=[pts[i-1],pts[i]],h=a[1]===b[1],lo=h?Math.min(a[0],b[0]):Math.min(a[1],b[1]),hi=h?Math.max(a[0],b[0]):Math.max(a[1],b[1]),t=Math.max(lo,Math.min(hi,malla(h?q.x:q.y))),P=h?[t,a[1]]:[a[0],t],d=Math.hypot(P[0]-q.x,P[1]-q.y);if(!best||d<best.d)best={i,P,d};}if(!best)return;let {i,P}=best,k;if(P[0]===pts[0][0]&&P[1]===pts[0][1])k=w.a;else if(P[0]===pts.at(-1)[0]&&P[1]===pts.at(-1)[1])k=w.b;else{k='@'+P.join(',');let resto={id:next('w'),a:k,b:w.b,points:[P,...pts.slice(i)],manual:true};Object.assign(w,{b:k,points:[...pts.slice(0,i),P],manual:true});circuit.wires.push(resto);}if(!draft){draft={a:k,points:[P]};change();boceto();status('Cable desde la unión '+k+': clic para doblar; Esc cancela');return;}draft.points=codo(draft.points,P);terminarCable(k);}
function boceto(q){let svg=$('scheme');$('wire-draft')?.remove();if(!draft)return;let pts=q?codo(draft.points,q):draft.points;let d=pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join('');let g=el('g',{id:'wire-draft'},svg);el('circle',{cx:pts.at(-1)[0],cy:pts.at(-1)[1],r:3,class:'wire-draft-punto'},g);el('path',{d:pts.length>1?d:d+'h0.01',class:'wire-draft'},g);}
// Captura antes de cables y piezas: la terminal más cercana tiene prioridad.
$('scheme').addEventListener('pointerdown',e=>{if(!wiring||e.button>0||schemeNavigation?.mano||e.isPrimary===false)return;e.preventDefault();e.stopImmediatePropagation();let q=point(e),key=terminalCerca(q),w=circuit.wires.find(w=>w.id===e.target.closest('[data-wire]')?.dataset.wire);console.info('[AULA-C cable]',{pantalla:[e.clientX,e.clientY],lienzo:[q.x,q.y],terminal:key,cable:w?.id,desde:draft?.a});if(key)cableClic(key);else if(w)cableEnCable(w,q);else cableClic(null,q);},true);
$('scheme').addEventListener('click',e=>{if(wiring){e.preventDefault();e.stopImmediatePropagation();}},true);
$('scheme').addEventListener('dblclick',e=>{if(wiring&&draft){e.preventDefault();terminarCable();}});
$('scheme').addEventListener('pointermove',e=>{if(!wiring)return;let q=point(e),k=terminalCerca(q);for(let t of $('scheme').querySelectorAll('.terminal'))t.classList.toggle('terminal-destino',t.dataset.pin===k);if(draft)boceto(k?pin(k):[q.x,q.y]);});
document.addEventListener('keydown',e=>{if(!wiring||!draft||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Escape'){draft=null;$('wire-draft')?.remove();}else if(e.key==='Enter'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();terminarCable();}},true);
function next(prefix){let i=1;while([...circuit.components,...circuit.wires].some(p=>p.id===prefix+i))i++;return prefix+i;}
function point(e){let p=$('scheme').createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform($('scheme').getScreenCTM().inverse());}
$('scheme').onpointermove=e=>{if(drag){let q=point(e);if(Math.hypot(q.x-drag.dx-drag.x,q.y-drag.dy-drag.y)<3)return;drag.p.tray=false;drag.p.x=Math.max(40,Math.min(920,Math.round((q.x-drag.dx)/20)*20));drag.p.y=Math.max(40,Math.min(380,Math.round((q.y-drag.dy)/20)*20));render();}};
$('scheme').onpointerup=()=>{if(drag){let moved=drag.p.x!==drag.x||drag.p.y!==drag.y;if(!moved)drag.p.tray=drag.tray;drag=null;if(moved)change();}};
$('scheme').onpointercancel=$('scheme').onpointerup;
function add(type,x=470,y=200){circuit.components.push({id:next(type),type,value:({R:1000,C:1e-6,L:.01,V:1,I:.001,G:0})[type],x,y,rotation:0});selected=circuit.components.at(-1).id;change();}
for(let [type,name] of Object.entries({R:'Resistencia',C:'Capacitor',L:'Inductor',V:'Fuente V',I:'Fuente I',G:'Tierra'})){let b=document.createElement('button');b.dataset.nombre=name;b.textContent=type+' · '+name;b.draggable=true;b.ondragstart=e=>e.dataTransfer.setData('text/plain',type);b.onclick=()=>add(type);$('catalog').append(b);}
$('scheme').ondragover=e=>e.preventDefault();$('scheme').ondrop=e=>{e.preventDefault();let type=e.dataTransfer.getData('text/plain');if(['R','C','L','V','I','G'].includes(type)){let q=point(e);add(type,Math.round(q.x/20)*20,Math.round(q.y/20)*20);}};
function edit(p=circuit.components.find(p=>p.id===selected)){if(!p||p.type==='G')return;inspector.mostrar(p,{foco:true});}
var inspector=crearInspector({circuito:()=>circuit,seleccion:()=>selected,aplicar:(p,t)=>editar(p,t),cambiar:()=>change(),vivo:()=>{let tenia=!!result;change();if(tenia)simulate();},modelo:d=>customLibrary?.open(d),formato,fallo:e=>fail(e),chip:{es:p=>p.id==='XI'&&p.definition&&['AD620','INA128'].includes(p.definition.id),otro:p=>otroChip(p.definition.id),ganancia:p=>{let r=rgConectada(circuit,p.id);return gananciaINA(p.definition.id,r?r.value:0);},cambiar:p=>{let d=customLibrary?.get(otroChip(p.definition.id));if(!d)return fail(Error('Biblioteca de componentes aún cargando'));cambiarChip(circuit,p.id,d);change();inspector.mostrar(p);}}});
function remove(){circuit.components=circuit.components.filter(p=>p.id!==selected);circuit.wires=circuit.wires.filter(w=>w.id!==selected&&!w.a.startsWith(selected+':')&&!w.b.startsWith(selected+':'));selected=null;change();}
function rotate(direction=1){let p=circuit.components.find(p=>p.id===selected);if(p){p.rotation=(p.rotation+90*direction+360)%360;change();}}
$('delete').onclick=remove;$('rotate').onclick=rotate;$('edit').onclick=()=>edit();document.addEventListener('keydown',e=>{if(e.target.closest('dialog')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Escape'){physicalEditor.cancel();pending=null;wiring=false;draft=null;$('wire-draft')?.remove();$('scheme').classList.remove('wiring');$('board').classList.remove('wiring');for(let t of $('scheme').querySelectorAll('.terminal-destino'))t.classList.remove('terminal-destino');botonCable0.setAttribute('aria-pressed','false');status('Cable cancelado');}});
const botonCable0=$('wire');botonCable0.onclick=()=>{wiring=!wiring;modoSonda=false;sondaBoton.setAttribute('aria-pressed','false');physicalEditor.cancel();$('wire-draft')?.remove();for(let t of $('scheme').querySelectorAll('.terminal-destino'))t.classList.remove('terminal-destino');$('board').classList.toggle('wiring',wiring);pending=null;botonCable0.setAttribute('aria-pressed',wiring);draft=null;$('scheme').classList.toggle('wiring',wiring);status(wiring?'Cable: clic en terminales o donde quiera doblar; termina en terminal o cable, doble clic o Enter; Esc cancela':'Selección y movimiento');};
function highlight(node){for(let svg of [$('scheme'),$('board')])for(let e of svg.querySelectorAll('[data-node]'))e.classList.toggle('node-active',e.dataset.node===node);}
function board(){}
function options(model){let nodes=['0',...new Set(model.components.flatMap(p=>p.nodes||[p.a,p.b,...(p.e?[p.e]:[])]).filter(n=>n!=='0'))];for(let id of ['ch1','ch2','plus','minus','amp']){let sel=$(id),old=sel.value,values=id==='amp'?model.components.map(p=>p.id):nodes;sel.replaceChildren(...values.map(v=>new Option(v,v)));sel.value=values.includes(old)?old:id==='ch1'||id==='plus'?model.node('V1:0'):id==='ch2'?model.node('C1:0'):'0';if(sel.selectedIndex<0)sel.selectedIndex=0;}}
$('tabs').onclick=e=>{let view=e.target.dataset.view;if(view){$('views').className=view;for(let b of $('tabs').querySelectorAll('[role=tab]'))b.setAttribute('aria-selected',b===e.target);if(view==='board')physicalEditor.fit();}};
$('save').onclick=async()=>{try{let data=await escribirAulac({documento:'# Circuito\n',circuitos:{'circuito.json':circuit}}),url=URL.createObjectURL(new Blob([data],{type:'application/vnd.aulac+zip'})),a=document.createElement('a');a.href=url;a.download='circuito.aulac';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(err){fail(err);}};
$('open').onchange=async e=>{try{let f=e.target.files[0];if(!f)return;if(f.size>200000)throw Error('Archivo demasiado grande');let c;if(f.name.toLowerCase().endsWith('.json'))c=JSON.parse(await f.text());else{let archivo=await leerAulac(new Uint8Array(await f.arrayBuffer()));if(archivo.tipo==='zip'){let primero=Object.values(archivo.circuitos)[0];if(!primero)throw Error('El archivo AULA-C no contiene circuitos');c=primero;}else{let texto=archivo.documento.trim(),datos;try{datos=JSON.parse(texto);}catch{let bloque=texto.match(/```(?:json)?\s*([\s\S]*?)```/i);if(bloque)try{datos=JSON.parse(bloque[1]);}catch{}}let circuitos=datos?.circuitos;c=Array.isArray(circuitos)?circuitos[0]:circuitos&&typeof circuitos==='object'?Object.values(circuitos)[0]:datos?.components?datos:null;if(!c)throw Error('El archivo AULA-C de texto no contiene circuitos JSON');}}circuit=validar(c);rememberRecent(f.name,webStatic?'./':'/lab/');selected=null;change();}catch(err){fail(err);}e.target.value='';};
$('example').onclick=()=>{circuit=ejemplo();selected=null;change();simulate();};$('netlist').onclick=()=>alert('* AULA-C · netlist lineal\n'+texto(circuit)+'\n.end');
function grid(id){let s=$(id);s.replaceChildren();for(let i=0;i<=10;i++)el('path',{d:`M${40+i*52} 20V260`,stroke:'var(--aulac-superficie2)'},s);for(let i=0;i<=8;i++)el('path',{d:`M40 ${20+i*30}H560`,stroke:'var(--aulac-superficie2)'},s);return s;}
function plot(s,points,color){let id=s.id+'-clip';if(!s.querySelector('clipPath')){let defs=el('defs',{},s),clip=el('clipPath',{id},defs);el('rect',{x:40,y:20,width:520,height:240},clip);}el('path',{d:points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(''),fill:'none',stroke:color,'stroke-width':2,'clip-path':`url(#${id})`},s);}
function instruments(){if(!result)return;let {dc,tran,ac}=result,ch1=$('ch1').value,ch2=$('ch2').value,vd=valor($('vdiv').value),td=valor($('tdiv').value);if(!(vd>0&&td>0))return;let s=grid('scope');[ch1,ch2].forEach((n,i)=>plot(s,tran.filter(r=>r.t<=td*10).map(r=>[40+r.t/(td*10)*520,140-r.voltages[n][0]/vd*30]),i?'var(--aulac-canal1)':'var(--aulac-canal2)'));text(s,42,285,`0 → ${formato(td*10,'s')} · ±${formato(vd*4,'V')}`);let times=[$('ca'),$('cb')].map(c=>Number(c.value)/1000*td*10);for(let t of times)el('path',{d:`M${40+t/(td*10)*520} 20V260`,stroke:'var(--aulac-canal3)','stroke-dasharray':'4 4'},s);let at=t=>tran.reduce((best,row)=>Math.abs(row.t-t)<Math.abs(best.t-t)?row:best,tran[0]);$('cursor').textContent=`Δt ${formato(times[1]-times[0],'s')} · CH2 A ${formato(at(times[0]).voltages[ch2][0],'V')} · B ${formato(at(times[1]).voltages[ch2][0],'V')}`;
 $('meter').textContent=`${formato(dc.voltages[$('plus').value][0]-dc.voltages[$('minus').value][0],'V')} DC\n${formato(dc.currents[$('amp').value]?.[0]??0,'A')} (${ $('amp').value }, a → b)`;
 s=grid('bode');let valid=ac.map(r=>{let a=r.voltages[ch1],b=r.voltages[ch2],den=a[0]**2+a[1]**2;if(den<1e-30)return null;let re=(b[0]*a[0]+b[1]*a[1])/den,im=(b[1]*a[0]-b[0]*a[1])/den;return {f:r.f,db:20*Math.log10(Math.max(1e-12,Math.hypot(re,im))),phase:Math.atan2(im,re)*180/Math.PI};});let points=valid.filter(Boolean);if(points.length){let lo=Math.min(-20,...points.map(p=>p.db)),hi=Math.max(20,...points.map(p=>p.db)),x=f=>40+520*Math.log(f/ac[0].f)/Math.log(ac.at(-1).f/ac[0].f);plot(s,points.map(p=>[x(p.f),260-(p.db-lo)/(hi-lo)*240]),'var(--aulac-canal2)');plot(s,points.map(p=>[x(p.f),140-p.phase/180*120]),'var(--aulac-octave)');text(s,42,16,`${hi.toFixed(1)} / ${lo.toFixed(1)} dB (azul) · fase ±180° (ámbar)`);for(let i=0;i<=5;i++)text(s,40+i*100,285,formato(ac[0].f*(ac.at(-1).f/ac[0].f)**(i/5),'Hz'),{'font-size':13});}else text(s,50,140,'CH1 sin excitación AC');}
function simulate(){try{let start=performance.now(),components=compilar(circuit).components,supply=null;if(webStatic){const unsupported=components.filter(p=>!['R','C','L','V','I','D','Q'].includes(p.type));if(unsupported.length)throw Error('MNA web no modela: '+unsupported.map(p=>p.id+' ('+(p.definition?.name||p.type)+')').join(', ')+'. Elija un circuito RLC, diodos o BJT.');}if($('psuEnabled')?.checked){supply=alimentar(components,$('psuSource').value,valor($('psuVoltage').value),valor($('psuLimit').value),MNA);components=supply.components;}let motor=new MNA(components),dt=valor($('dt').value),stop=10*valor($('tdiv').value),dc=motor.dc(),tran=motor.transitorio({dt,stop}),ac=motor.ac({start:valor($('fstart').value),stop:valor($('fstop').value)});result={dc,tran,ac};dirty=false;instruments();if($('psuReading'))$('psuReading').textContent=supply?`${supply.limited?'CC':'CV'} · ${formato(supply.voltage,'V')} · límite DC calculado por MNA`:'Fuente de banco desconectada';status(`${webStatic?'Simulación en tu navegador (motor MNA)':'mna'} · DC / ${tran.length} pasos / ${ac.length} frecuencias · ${(performance.now()-start).toFixed(1)} ms · Euler hacia atrás`);}catch(e){result=null;fail(e);}}
$('simulate').onclick=simulate;for(let id of ['ch1','ch2','plus','minus','amp','vdiv','ca','cb'])$(id).oninput=instruments;for(let id of ['dt','tdiv','fstart','fstop'])$(id).onchange=()=>{result=null;dirty=true;$('scope').replaceChildren();$('bode').replaceChildren();$('meter').textContent='Resultados pendientes';status('Parámetros modificados. Pulse Simular.');};$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'Reanudar corriente':'Pausar corriente';};
function animate(now){
 physicalEditor.luces();let delta=Math.min(.1,(now-last)/1000);last=now;
 const quiet=paused||movimiento.paused||reducedMotion.matches;
 if(animationResult!==result){
  animationResult=result;animationMax=0;animationScale=escalaTiempo(circuit);desplazamientos.clear();
  phase=result?.tran[0]?.t??0;
  animationFlows=flujosCorriente(compilar(circuit),circuit.wires);
  for(const row of result?.tran??[]){
   for(const value of animationFlows(row).values())animationMax=Math.max(animationMax,Math.abs(value));
   for(const value of Object.values(row.currents))animationMax=Math.max(animationMax,Math.abs(value[0]));
   for(const terminals of Object.values(row.terminalCurrents??{}))for(const value of terminals)animationMax=Math.max(animationMax,Math.abs(Array.isArray(value)?value[0]:value));
  }
  if(result)console.info('[AULA-C corriente]',{ramas:circuit.wires.length,muestras:result.tran.length,referenciaA:animationMax,escalaTiempo:animationScale,multiplicador:movimiento.speed});
 }
 const rows=result?.tran,start=rows?.[0]?.t??0,end=rows?.at(-1)?.t??0;
 if(!quiet&&end>start)phase=start+(phase-start+delta/animationScale)%(end-start);
 if(end>start)$('time').value=1000*(phase-start)/(end-start);
 let r=muestraCorriente(rows,phase);
 $('instant').textContent=r?`t = ${formato(r.t,'s')}`:'Sin simulación';
 $('currentTimeScale').textContent=animationScale>1?`×1/${Math.round(animationScale)} tiempo real`:'×1 tiempo real';
 const currents=r?animationFlows(r):new Map();
 const max=animationMax;
 for(const [id,current] of currents)if(!quiet)desplazamientos.set(id,(desplazamientos.get(id)||0)+delta*velocidadCorriente(current,max,movimiento.speed));
 for(let s of [$('scheme'),$('board')])for(let d of s.querySelectorAll('[data-dot]')){
  let p=s.querySelector(`path.wire[data-wire="${d.dataset.dot}"]`),current=currents.get(d.dataset.dot)||0;
  if(!p)continue;
  let length=p.getTotalLength();if(!length)continue;
  const matrix=s.getScreenCTM();if(!matrix)continue;
  const scale=Math.hypot(matrix.a,matrix.b)||1;
  let distance=(((desplazamientos.get(d.dataset.dot)||0)/scale+Number(d.dataset.offset)*length)%length+length)%length;
  let q=p.getPointAtLength(distance),a=p.getPointAtLength(Math.max(0,distance-1)),b=p.getPointAtLength(Math.min(length,distance+1));
  let angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+(current<0?180:0);
  d.setAttribute('d',reducedMotion.matches?'M-5 -4L5 0L-5 4Z':'M-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0');
  d.setAttribute('transform',`translate(${q.x} ${q.y}) rotate(${angle})`);
  const count=max>0?Math.min(6,Math.ceil(6*Math.abs(current)/max)):0;
  d.setAttribute('opacity',!dirty&&Math.abs(current)>1e-12&&Math.round(Number(d.dataset.offset)*6)<count?'1':'0');
 }
 requestAnimationFrame(animate);
}
$('time').oninput=()=>{const rows=result?.tran;if(rows?.length)phase=rows[0].t+Number($('time').value)/1000*(rows.at(-1).t-rows[0].t);};
// Controles R16 conservan el editor y la misma representación eléctrica.
function control(parent,tag,id,label,attrs={}){let e=document.createElement(tag);e.id=id;Object.assign(e,attrs);e.textContent=label;parent.append(e);return e;}
let controls=document.querySelector('.scope-panel .controls');
$('speed').value=String(movimiento.speed);
const guardarMovimiento=()=>preferenciasCorriente(()=>localStorage,movimiento);
$('speed').onchange=()=>{movimiento.speed=Number($('speed').value);guardarMovimiento();};
const pausaCorriente=()=>{$('pause').textContent=movimiento.paused?'Reanudar corriente':'Pausar corriente';$('pause').setAttribute('aria-pressed',String(movimiento.paused));};
pausaCorriente();
$('vdiv').parentElement.firstChild.textContent='CH1 V/div ';
for(let [id,label,value] of [['vdiv2','CH2 V/div ','500m'],['position1','CH1 posición (div) ','0'],['position2','CH2 posición (div) ','0']]){let l=control(controls,'label',id+'Label',label);control(l,'input',id,'',{value,type:'text'}).oninput=()=>instruments();}
for(let i of [1,2]){let l=control(controls,'label','couplingLabel'+i,`CH${i} acoplamiento `),s=control(l,'select','coupling'+i,'');for(let v of ['AC','DC'])s.add(new Option(v,v));s.oninput=()=>instruments();}
control(controls,'button','autoscale','Autoescala');
control(controls,'label','triggerLabel','Disparo CH1 (V) ').append(control(document.createElement('span'),'input','trigger','',{value:'0',type:'number',step:'.1'}));
let edge=control(controls,'select','edge','');edge.setAttribute('aria-label','Flanco de disparo');edge.add(new Option('Ascendente','up'));edge.add(new Option('Descendente','down'));
control($('scope').parentElement,'output','measurements','');
control(document.querySelector('header'),'button','commonEmitter','Amplificador en emisor común').onclick=()=>{circuit=amplificador();selected=null;change();let m=compilar(circuit);$('ch1').value=m.node('V2:0');$('ch2').value=m.node('RL:0');for(let i of [1,2])$('coupling'+i).value='AC';$('tdiv').value='0.0005';$('dt').value='2u';simulate();};
control(document.querySelector('header'),'button','octave','Llevar a Octave').onclick=async()=>{let target;try{if(!result)throw Error('Simule primero');if(location.pathname.startsWith('/lab/'))target=abrirVentana('ide','/ide/?aviso=sim');let response=await fetch('./exportar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({result,input:$('ch1').value,output:$('ch2').value})});if(!response.ok)throw Error(await response.text());let url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download='simulacion.m';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);if(response.headers.get('X-Aulac-Sim')){if(target)target.location.href='/ide/?aviso=sim';status('sim cargada');}else status('Simulación descargada; ejecútela en el IDE.');}catch(e){fail(e);}};
let search=control($('catalog').parentElement,'input','search','',{placeholder:'Buscar componentes',type:'search'});$('catalog').before(search);search.setAttribute('aria-label','Buscar componentes');search.oninput=()=>{for(let b of $('catalog').children)b.hidden=!b.textContent.toLowerCase().includes(search.value.toLowerCase());};
for(let [label,type,polarity] of [['Diodo 1N4148','D'],['NPN 2N2222','Q','NPN'],['PNP 2N3906','Q','PNP']]){let b=control($('catalog'),'button','cat'+label.split(' ')[0],label);b.dataset.nombre=label;b.draggable=true;b.ondragstart=e=>e.dataTransfer.setData('text/plain',type+':'+(polarity||''));b.onclick=()=>place(type,polarity);}
function place(type,polarity,x=470,y=200){let p={id:next(type),type,value:0,x,y,rotation:0,polarity};circuit.components.push(p);selected=p.id;change();}
let oldDrop=$('scheme').ondrop;$('scheme').ondrop=e=>{let [type,polarity]=e.dataTransfer.getData('text/plain').split(':');if(['D','Q'].includes(type)){e.preventDefault();let q=point(e);place(type,polarity,q.x,q.y);}else oldDrop(e);};
for(let b of $('catalog').children){let svg=el('svg',{viewBox:'-45 -30 90 60',width:55,height:36,'aria-hidden':'true'});el('path',{d:simbolos[b.textContent.startsWith('Diodo')?'D':/NPN|PNP/.test(b.textContent)?'Q':b.textContent[0]]||'M-40 0H-20V-15H20V15H-20V0M20 0H40',stroke:'currentColor',fill:'none','stroke-width':2},svg);b.prepend(svg);}
let mode=control($('meter').parentElement,'select','meterMode','');for(let s of ['V','I','Ω'])mode.add(new Option(s,s));mode.setAttribute('aria-label','Modo del multímetro');
let probe=control($('meter').parentElement,'select','probe','');for(let [s,v] of [['Selección normal',''],['Colocar punta +','plus'],['Colocar punta −','minus']])probe.add(new Option(s,v));probe.setAttribute('aria-label','Punta del multímetro');
for(let id of ['scheme','board'])$(id).addEventListener('click',e=>{let n=e.target.closest('[data-node]')?.dataset.node;if(n&&probe.value){$(probe.value).value=n;instruments();e.stopImmediatePropagation();}},true);
let originalPin=pin;pin=key=>{let [id,i]=key.split(':'),p=circuit.components.find(c=>c.id===id);if(p?.type!=='Q')return originalPin(key);let [x,y]=[[35,-30],[-40,0],[35,30]][Number(i)],a=p.rotation*Math.PI/180;return [p.x+x*Math.cos(a)-y*Math.sin(a),p.y+x*Math.sin(a)+y*Math.cos(a)];};
let originalRender=render;render=()=>{originalRender();let model=compilar(circuit),layout=montaje(circuit);for(let p of circuit.components.filter(c=>['D','Q'].includes(c.type))){let g=$('scheme').querySelector(`[data-component="${p.id}"]`),body=g.querySelector('.body');body.replaceChildren();el('path',{d:simbolos[p.type]},body);let bb=body.getBBox?.();if(bb)body.prepend(el('rect',{x:bb.x-6,y:bb.y-6,width:bb.width+12,height:bb.height+12,fill:'transparent',stroke:'none',class:'hit-area'},body));if(p.type==='Q'){let key=p.id+':2',[x,y]=pin(key),t=el('circle',{cx:x,cy:y,r:6,class:'terminal','data-pin':key,'data-node':model.node(key)},g);t.onclick=e=>{e.stopPropagation();if(wiring)cableClic(key);else choose(p.id);};for(let [i,name] of ['C','B','E'].entries()){let q=pin(p.id+':'+i);text(g,q[0]+8,q[1]-8,name);}}}};
let originalInstruments=instruments;instruments=()=>{originalInstruments();if(!result)return;let {tran,dc}=result,a=$('ch1').value,b=$('ch2').value,vd=valor($('vdiv').value),td=valor($('tdiv').value),start=disparo(tran,a,Number($('trigger').value),edge.value),s=grid('scope'),visible=tran.filter(r=>r.t>=start&&r.t<=start+td*10),clipped=false;
for(let [i,n] of [a,b].entries()){clipped||=visible.some(r=>Math.abs(r.voltages[n][0])>vd*4);plot(s,visible.map(r=>[40+(r.t-start)/(td*10)*520,140-r.voltages[n][0]/vd*30]),i?'var(--aulac-canal1)':'var(--aulac-canal2)');}
text(s,42,285,`${formato(vd,'V')}/div · ${formato(td,'s')}/div · ${clipped?'RECORTE':start>0?'Disparado':'Sin cruce de disparo'}`);
for(let id of ['ca','cb']){let t=Number($(id).value)/1000*td*10;el('path',{d:`M${40+t/(td*10)*520} 20V260`,stroke:'var(--aulac-canal3)','stroke-dasharray':'4 4'},s);}
let times=['ca','cb'].map(id=>start+Number($(id).value)/1000*td*10),at=t=>tran.reduce((a,b)=>Math.abs(a.t-t)<Math.abs(b.t-t)?a:b);$('cursor').textContent=`Δt ${formato(times[1]-times[0],'s')} · CH2 A ${formato(at(times[0]).voltages[b][0],'V')} · B ${formato(at(times[1]).voltages[b][0],'V')}`;
$('measurements').textContent=[a,b].map((n,i)=>{let m=medir(tran,n);return `CH${i+1}: Vpp ${formato(m.vpp,'V')}, Vrms ${formato(m.vrms,'V')}, f ${formato(m.frequency,'Hz')}`;}).join(' | ')+` | CH2−CH1 ${formato(desfase(tran,a,b),'°')}`;
try{$('meter').textContent=mode.value==='V'?formato(dc.voltages[$('plus').value][0]-dc.voltages[$('minus').value][0],'V'):mode.value==='I'?formato(dc.currents[$('amp').value]?.[0],'A')+' · '+$('amp').value:formato(resistencia(compilar(circuit).components,$('plus').value,$('minus').value,MNA),'Ω');}catch(e){$('meter').textContent=e.message;}
};
$('autoscale').onclick=()=>{if(result){if(circuit.b309){autoescalaPractica(circuit,result,Object.fromEntries(['vdiv','vdiv2','position1','position2','tdiv'].map(id=>[id,$(id)])));instruments();return;}for(let i of [1,2]){let n=$('ch'+i).value,rows=canal(result.tran,n,$('coupling'+i).value);asignarDivision($(i===1?'vdiv':'vdiv2'),autoescala(rows,[n]));$('position'+i).value='0';}let span=result.tran.at(-1).t-result.tran[0].t;asignarDivision($('tdiv'),paso125(span/10));instruments();}};
for(let e of [edge,$('trigger'),mode])e.oninput=instruments;
let originalSimulate=simulate;simulate=()=>{let first=dirty;originalSimulate();if(first&&result)$('autoscale').click();};$('simulate').onclick=simulate;
let drawSemiconductors=render;render=()=>{drawSemiconductors();for(let p of circuit.components.filter(p=>p.type==='Q'&&p.polarity==='PNP'))$('scheme').querySelector(`[data-component="${p.id}"] .body path`).setAttribute('d',simbolos.PNP);};
let pnpIcon=$('catPNP').querySelector('path');pnpIcon.setAttribute('d',simbolos.PNP);
// Puntas del multímetro: aro con rótulo junto a la terminal («+ V» rojo, «COM» azul).
function drawProbeMarks(){let activo=mostrarPuntas({hayMultimetro:circuit.multimetro===true||circuit.components.some(p=>p.type==='MM'),panelAbierto:instrumentosUno?.actual==='multimetro',positiva:$('plus').value,negativa:$('minus').value}),model=compilar(circuit),layout=montaje(circuit);for(let id of ['scheme','board']){let svg=$(id);for(let e of svg.querySelectorAll('.probe-mark'))e.remove();if(!activo)continue;for(let [name,color,rotulo] of [['plus','var(--aulac-error)','+ V'],['minus','var(--aulac-canal2)','COM']]){let node=$(name).value,key=Object.keys(layout.pins).find(k=>model.node(k)===node);if(!key||id==='board'&&!layout.pins[key].placed)continue;let [x,y]=id==='scheme'?pin(key):[layout.pins[key].x,layout.pins[key].y],g=el('g',{class:'probe-mark','pointer-events':'none'},svg);el('circle',{cx:x,cy:y,r:9,fill:'none',stroke:color,'stroke-width':2.5},g);text(g,x+13,y-11,rotulo,{class:'probe-label',style:'fill:'+color});}}}
let renderWithModels=render;render=()=>{renderWithModels();drawProbeMarks();};let measureWithModels=instruments;instruments=()=>{measureWithModels();drawProbeMarks();if(!result)return;
 let s=grid('scope'),td=valor($('tdiv').value),a=$('ch1').value,b=$('ch2').value,rows1=canal(result.tran,a,$('coupling1').value),start=disparo(rows1,a,Number($('trigger').value),edge.value),labels=[];
 for(let i of [1,2]){let n=$('ch'+i).value,rows=canal(result.tran,n,$('coupling'+i).value),vd=valor($(i===1?'vdiv':'vdiv2').value),pos=Number($('position'+i).value);if(!(vd>0&&Number.isFinite(pos)))continue;let visible=rows.filter(r=>r.t>=start&&r.t<=start+td*10),clip=visible.some(r=>Math.abs(r.voltages[n][0]/vd+pos)>4);plot(s,visible.map(r=>[40+(r.t-start)/(td*10)*520,140-(r.voltages[n][0]/vd+pos)*30]),i===1?'var(--aulac-canal2)':'var(--aulac-canal1)');labels.push(`CH${i} ${formato(vd,'V')}/div ${$('coupling'+i).value}${clip?' RECORTE':''}`);}
 text(s,42,285,labels.join(' · '),{'font-size':13});
 let times=['ca','cb'].map(id=>start+Number($(id).value)/1000*td*10),rows2=canal(result.tran,b,$('coupling2').value),at=t=>rows2.reduce((a,b)=>Math.abs(a.t-t)<Math.abs(b.t-t)?a:b);for(let t of times)el('path',{d:`M${40+(t-start)/(td*10)*520} 20V260`,stroke:'var(--aulac-canal3)','stroke-dasharray':'4 4'},s);
 $('cursor').textContent=`Δt ${formato(times[1]-times[0],'s')} · CH2 A ${formato(at(times[0]).voltages[b][0],'V')} · B ${formato(at(times[1]).voltages[b][0],'V')}`;
 let g=ganancia(result.tran,a,b);$('measurements').textContent=[a,b].map((n,j)=>{let m=medir(canal(result.tran,n,$('coupling'+(j+1)).value),n);return `CH${j+1}: Vpp ${formato(m.vpp,'V')}, Vrms ${formato(m.vrms,'V')}, f ${formato(m.frequency,'Hz')}`;}).join(' | ')+` | Ganancia CH2/CH1 ${g.vv.toFixed(2)} V/V (${g.db.toFixed(2)} dB) · desfase ${g.phase.toFixed(1)}°`;
};
for(let id of ['ch1','ch2','plus','minus','amp','vdiv','ca','cb','edge','trigger','meterMode'])$(id).oninput=()=>instruments();
let renderFinal=render;render=()=>{renderFinal();let model=compilar(circuit),s=$('scheme'),routes=circuit.wires.map(w=>({node:model.node(w.a),points:ruta(circuit,w)})),seen=new Set();for(let r of routes)for(let p of r.points){let dirs=new Set();for(let other of routes.filter(o=>o.node===r.node))for(let i=1;i<other.points.length;i++){let a=other.points[i-1],b=other.points[i];if(a[0]===b[0]&&p[0]===a[0]&&p[1]>=Math.min(a[1],b[1])&&p[1]<=Math.max(a[1],b[1])){if(p[1]>Math.min(a[1],b[1]))dirs.add('up');if(p[1]<Math.max(a[1],b[1]))dirs.add('down');}if(a[1]===b[1]&&p[1]===a[1]&&p[0]>=Math.min(a[0],b[0])&&p[0]<=Math.max(a[0],b[0])){if(p[0]>Math.min(a[0],b[0]))dirs.add('left');if(p[0]<Math.max(a[0],b[0]))dirs.add('right');}}let key=p.join();if(dirs.size>=3&&!seen.has(key)){seen.add(key);el('circle',{cx:p[0],cy:p[1],r:4,fill:'var(--aulac-exito)',class:'junction','data-node':r.node},s);}}
 for(let p of circuit.components.filter(p=>p.type==='Q')){let label=s.querySelector(`[data-component="${p.id}"] .component-label`);label.textContent=p.id+' '+(p.polarity||'NPN');label.setAttribute('x',p.x-65);label.setAttribute('y',p.y+85);}
};
// Cada cambio confirmado conserva una instantánea; arrastrar crea una sola operación.
let undoStack=[],redoStack=[],snapshot=JSON.stringify(circuit),restoring=false;
let changeLab4=change;change=()=>{let next=JSON.stringify(circuit);if(!restoring&&next!==snapshot){undoStack.push(snapshot);if(undoStack.length>100)undoStack.shift();redoStack=[];}snapshot=next;changeLab4();if($('sweepPlot'))$('sweepPlot').replaceChildren();syncBench();};
function history(back){let from=back?undoStack:redoStack,to=back?redoStack:undoStack;if(!from.length)return;to.push(snapshot);circuit=JSON.parse(from.pop());selected=null;pending=null;drag=null;restoring=true;change();restoring=false;status(back?'Cambio deshecho':'Cambio rehecho');}
for(let [id,label,tip,action] of [['undo','Deshacer','Ctrl+Z',()=>history(true)],['redo','Rehacer','Ctrl+Y',()=>history(false)]])control($('selection').parentElement,'button',id,label,{title:tip}).onclick=action;
for(let [id,tip] of [['rotate','R: girar'],['delete','Supr: borrar'],['wire','W: cable; Esc: cancelar']])$(id).title=tip;
document.addEventListener('keydown',e=>{if(e.target.closest('dialog')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;let k=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&['z','y'].includes(k)){e.preventDefault();history(k==='z'&&!e.shiftKey);}});
for(let [id,unit] of [['vdiv','V'],['vdiv2','V'],['tdiv','s']]){let old=$(id),sel=document.createElement('select'),value=valor(old.value);sel.id=id;sel.title='Selector 1–2–5';for(let v of pasos125)sel.add(new Option(division(v,unit),String(v)));sel.value=String(paso125(value));sel.oninput=old.oninput;sel.onchange=old.onchange;old.replaceWith(sel);}
// El botón del ejemplo debe asignar el valor numérico de la opción del selector.
for(let [name,ids] of [['CH1',['ch1','vdiv','coupling1','position1']],['CH2',['ch2','vdiv2','coupling2','position2']],['Horizontal',['tdiv','dt','autoscale']],['Disparo',['trigger','edge']]]){let group=document.createElement('details'),legend=document.createElement('summary');legend.textContent=name;group.append(legend);group.className=name.toLowerCase();for(let id of ids){let e=$(id);group.append(e.closest('label')||e);}controls.append(group);}
for(const [id,label] of [['vdiv','V/div '],['vdiv2','V/div '],['coupling1','Acopl. '],['coupling2','Acopl. '],['position1','Pos. '],['position2','Pos. ']])$(id).closest('label').firstChild.textContent=label;
let bench=document.createElement('section');bench.className='bench';document.querySelector('.instruments').after(bench);
function instrument(id,title){let a=control(bench,'article',id,'');control(a,'h2',id+'Title',title);return a;}
function field(parent,id,label,value){let l=control(parent,'label',id+'Label',label);return control(l,'input',id,'',{value,type:'text'});}
function selectField(parent,id,label){let l=control(parent,'label',id+'Label',label);return control(l,'select',id,'');}
let gen=instrument('generator','Generador de funciones'),source=selectField(gen,'genSource','Fuente'),shape=selectField(gen,'genShape','Forma');for(let [n,v] of [['Seno','sin'],['Cuadrada','pulse'],['Triangular','triangle'],['DC','dc']])shape.add(new Option(n,v));
field(gen,'genFrequency','Frecuencia (Hz)','1000');field(gen,'genAmplitude','Amplitud pico (V)','10m');field(gen,'genOffset','Offset (V)','0');
control(gen,'button','genApply','Aplicar al circuito').onclick=()=>{try{let p=circuit.components.find(c=>c.id===source.value),f=valor($('genFrequency').value),a=valor($('genAmplitude').value),o=valor($('genOffset').value);if(!p||!(f>0&&a>=0&&[f,a,o].every(Number.isFinite)))throw Error('Fuente, frecuencia y amplitud inválidas');p.value=o;p.wave=shape.value==='dc'?undefined:shape.value==='sin'?{type:'sin',args:[o,a,f]}:{type:'pulse',args:[o-a,o+a,0,shape.value==='triangle'?.5/f:1e-9,shape.value==='triangle'?.5/f:1e-9,shape.value==='triangle'?0:.5/f,1/f]};change();simulate();}catch(e){fail(e);}};
let psu=instrument('powerSupply','Fuente de alimentación');selectField(psu,'psuSource','Fuente DC');field(psu,'psuVoltage','Voltaje (V)','12');field(psu,'psuLimit','Límite (A)','100m');let enabled=field(psu,'psuEnabled','Conectar','');enabled.type='checkbox';control(psu,'button','psuApply','Aplicar').onclick=()=>{dirty=true;simulate();};control(psu,'output','psuReading','Fuente de banco desconectada');
let sweep=instrument('parameterSweep','Barrido de parámetro');selectField(sweep,'sweepComponent','Componente');field(sweep,'sweepFrom','Desde (SI)','100');field(sweep,'sweepTo','Hasta (SI)','2.2k');field(sweep,'sweepSteps','Pasos','5');field(sweep,'sweepFrequency','Frecuencia AC (Hz)','1000');control(sweep,'button','sweepRun','Barrer ganancia');let sweepPlot=el('svg',{id:'sweepPlot',viewBox:'0 0 600 300',role:'img','aria-label':'Ganancia frente al parámetro'},sweep);control(sweep,'output','sweepReading','Ganancia CH2/CH1 en pequeña señal');
$('sweepRun').onclick=()=>{try{let config={id:$('sweepComponent').value,desde:valor($('sweepFrom').value),hasta:valor($('sweepTo').value),pasos:Number($('sweepSteps').value),frequency:valor($('sweepFrequency').value),input:$('ch1').value,output:$('ch2').value},components=compilar(circuit).components;if(enabled.checked)components=alimentar(components,$('psuSource').value,valor($('psuVoltage').value),valor($('psuLimit').value),MNA).components;let rows=barrer(components,config,MNA),s=grid('sweepPlot'),max=Math.max(...rows.map(r=>r.gain),1e-12);plot(s,rows.map((r,i)=>[40+i/(rows.length-1)*520,260-r.gain/max*220]),'var(--aulac-exito)');text(s,40,285,`${config.id}: ${formato(config.desde)} → ${formato(config.hasta)} · máximo ${max.toPrecision(4)} V/V`);$('sweepReading').textContent=rows.map(r=>`${formato(r.value)}: ${r.gain.toPrecision(4)} V/V`).join(' | ');console.info('[LAB5 barrido]',{...config,rows});}catch(e){$('sweepPlot').replaceChildren();fail(e);}};
function syncBench(){for(let [id,predicate] of [['genSource',c=>c.type==='V'],['psuSource',c=>c.type==='V'&&!c.wave],['sweepComponent',c=>['R','C','L'].includes(c.type)]]){let s=$(id);if(!s)continue;let old=s.value,cs=circuit.components.filter(predicate);s.replaceChildren(...cs.map(c=>new Option(c.id,c.id)));if(cs.some(c=>c.id===old))s.value=old;}}
// R16-LAB6: documento físico independiente y motor de sesión.
let physicalChange=false,lastCircuit=circuit,lastWires=JSON.stringify(circuit.wires);
let physicalEditor=editorFisico($('board'),{circuito:()=>circuit,seleccion:()=>selected,elegir:choose,cambio:()=>{physicalChange=true;if(circuit.logicalRequest&&!avisos(circuit).some(s=>s.startsWith('Falta')||s.startsWith('Sobra')))delete circuit.logicalRequest;change();physicalChange=false;},error:fail,editar:editPhysical,color:()=>$('wireColor').value,resultado:()=>result?.dc,definicion:id=>customLibrary?.get(id),span:()=>Number($('leadSpan').value)});
let physicalControls=document.createElement('div');physicalControls.className='physical-controls';$('boardPane').prepend(physicalControls);
for(let [id,label,action] of [['boardPlus','+',()=>physicalEditor.zoom(.8)],['boardMinus','−',()=>physicalEditor.zoom(1.25)],['boardFit','Ajustar',()=>physicalEditor.fit()]])control(physicalControls,'button',id,label).onclick=action;physicalControls.title='Rueda o pellizco: zoom. Arrastre el fondo: desplazar. Cable: pulse dos agujeros. Paso 2.54 mm; bloques a-e y f-j independientes.';
function agregarTabla(size=830){try{const adicional=circuit.mode==='board'&&!circuit.physical.sinTabla;if(adicional)agregarTablaExtra(circuit,size);else agregarProtoboard(circuit,size);physicalEditor.cancel();change();document.querySelector('[data-view=board]').click();physicalEditor.fit();status(adicional?'Protoboard '+size+' agregada: el montaje tiene '+(1+(circuit.physical.extras?.length||0))+' placas.':'Protoboard '+size+' puntos agregada. Inserte las piezas de la bandeja; el esquema se conserva.');}catch(e){fail(e);}}
function montarLibre(){try{if(circuit.mode==='board'){status('Este circuito ya tiene documento físico');return;}montajeSinTabla(circuit);physicalEditor.cancel();change();document.querySelector('[data-view=board]').click();physicalEditor.fit();status('Montaje libre: arrastra las piezas y une las patillas con Cable (W).');}catch(e){fail(e);}}
control(physicalControls,'button','montajeLibre','Montaje libre').onclick=montarLibre;
control(physicalControls,'button','addBoard','Agregar protoboard').onclick=()=>agregarTabla();
for(let size of [830,400]){let b=control($('catalog'),'button','boardCat'+size,'Protoboard '+size);b.dataset.nombre='Protoboard '+size;b.dataset.id='PB'+size;b.dataset.categoria='Montaje';b.onclick=()=>agregarTabla(size);}
let labelToggle=control(physicalControls,'button','boardLabels','Rótulos');labelToggle.setAttribute('aria-pressed','true');labelToggle.onclick=()=>{let show=labelToggle.getAttribute('aria-pressed')!=='true';labelToggle.setAttribute('aria-pressed',String(show));physicalEditor.rotulos(show);};
let wireColor=control(physicalControls,'input','wireColor','',{type:'color',value:'#39a67b'});wireColor.setAttribute('aria-label','Color del cable físico');
let spanLabel=control(physicalControls,'label','leadSpanLabel','Separación de patillas (×2.54 mm) ');let leadSpan=control(spanLabel,'input','leadSpan','',{type:'number',min:1,max:62,value:4});
control(physicalControls,'button','setGround','Referencia 0').onclick=()=>{if(circuit.mode!=='board')return;preguntarTexto('Agujero de referencia 0, por ejemplo a:15 o b-:1',circuit.physical.ground||'b-:1',h=>{try{agujero(h);circuit.physical.ground=h;physicalChange=true;sincronizar(circuit);change();physicalChange=false;}catch(e){physicalChange=false;fail(e);throw e;}});};
let header=document.querySelector('header'),engine=control(header,'select','engine','');engine.setAttribute('aria-label','Motor de simulación');engine.add(new Option('mna propio','mna'));engine.add(new Option('ngspice 47','ngspice'));
if(webStatic){engine.value=webMotor.listo?'ngspice':'mna';}else fetch('./motor').then(r=>r.ok?r.json():{}).then(info=>{engine.dataset.disponible=String(!!info.ngspice);if(engine.dataset.automatico!=='false')engine.value=info.ngspice?'ngspice':'mna';dirty=true;simulate();}).catch(e=>console.info('[Motor local]',e.message));
engine.onchange=()=>{dirty=true;result=null;status('Motor cambiado. Pulse Simular.');};
let createMode=control(header,'select','createMode','');createMode.setAttribute('aria-label','Modo del circuito nuevo');createMode.add(new Option('Solo esquemático','scheme'));createMode.add(new Option('Protoboard','board'));
control(header,'button','newCircuit','Nuevo circuito').onclick=()=>{circuit={version:1,mode:createMode.value,components:[],wires:[],...(createMode.value==='board'?{physical:documento()}: {})};selected=null;physicalEditor.cancel();change();};
for(let [id,label,led] of [['ledExample','LED + resistencia + pila 9 V',true],['dividerExample','Divisor en protoboard',false]])control(header,'button',id,label).onclick=()=>{circuit=ejemploFisico(led);selected=null;physicalEditor.cancel();change();simulate();};
for(let [label,type,appearance,value] of [['LED','D','led',0],['Cerámico','C','ceramic',1e-8],['Electrolítico','C','electrolytic',1e-5],['Pila 9 V','V','battery',9],['Generador con caimanes','V','generator',0],['Fuente de banco','V','bench',12]]){let b=control($('catalog'),'button','physicalCat'+appearance,label);b.dataset.nombre=label;b.draggable=true;b.ondragstart=e=>e.dataTransfer.setData('text/plain',type+':'+appearance);b.onclick=()=>{add(type);let p=circuit.components.at(-1);p.appearance=appearance;p.value=value;if(appearance==='led')Object.assign(p,{Is:1e-17,n:2});change();};}
for(let b of $('catalog').children){if(!b.ondragstart)continue;let event={dataTransfer:{setData:(key,value)=>event.value=value}};b.ondragstart(event);let [type,variant]=event.value.split(':');b.querySelector('svg')?.remove();let thumb=el('svg',{viewBox:'-72 -72 144 155','aria-hidden':'true'});thumb.innerHTML=arteFisico({type,appearance:type==='Q'?undefined:variant||undefined,value:1000});b.prepend(thumb);}
// Un solo panel acoplado, sin construir el antiguo banco.
const work=document.querySelector('.work');
const instrumentosDock=control(work,'section','instrumentoPanel','',{hidden:true});
instrumentosDock.className='instrumento-panel';instrumentosDock.setAttribute('aria-label','Instrumento');
const panelCab=control(instrumentosDock,'div','instrumentoCab',''),panelTitulo=control(panelCab,'strong','instrumentoTitulo','');
const panelCerrar=control(panelCab,'button','instrumentoCerrar','×',{type:'button'});panelCerrar.setAttribute('aria-label','Cerrar instrumento');
const panelPlegar=control(panelCab,'button','instrumentoPlegar','Plegar',{type:'button'});panelPlegar.setAttribute('aria-expanded','true');
panelPlegar.onclick=()=>{const plegado=work.classList.toggle('panel-plegado');panelPlegar.textContent=plegado?'Mostrar instrumento':'Plegar';panelPlegar.setAttribute('aria-expanded',String(!plegado));};
const instrumentoContenido=control(instrumentosDock,'div','instrumentoContenido','');
instrumentoContenido.append(document.querySelector('.instruments'),document.querySelector('.bench'));
const instrumentosMenu=control(work,'nav','instrumentosRail','');instrumentosMenu.className='instrumentos-rail';instrumentosMenu.setAttribute('aria-label','Instrumentos');
const panelTabs=control(instrumentosDock,'nav','panelTabs','');panelTabs.setAttribute('aria-label','Paneles abiertos');panelTabs.setAttribute('role','tablist');
instrumentosDock.append(panelTabs,instrumentoContenido);
let ultimoAnalisis=null,ultimoInstrumento=null;
instrumentosUno=selectorUno(HERRAMIENTAS,id=>{
 if(!id){ultimoAnalisis=null;ultimoInstrumento=null;}else if(['nodos','thevenin','mallas','campo'].includes(id))ultimoAnalisis=id;else ultimoInstrumento=id;
 panelTabs.replaceChildren();
 for(const abierto of [ultimoAnalisis,ultimoInstrumento].filter(Boolean)){const b=control(panelTabs,'button','',abierto===ultimoAnalisis?'Análisis':INSTRUMENTOS.find(i=>i.id===abierto).nombre,{type:'button'});b.setAttribute('role','tab');b.setAttribute('aria-selected',String(abierto===id));b.onclick=()=>instrumentosUno.abrir(abierto);}
 work.classList.toggle('panel-plegado',false);panelPlegar.textContent='Plegar';panelPlegar.setAttribute('aria-expanded','true');
 aplicarVisibilidad(instrumentoContenido,HERRAMIENTAS,id);instrumentosDock.hidden=!id;work.classList.toggle('con-instrumento',!!id);
 if(['nodos','thevenin','mallas','campo'].includes(id)){
  if(wiring)botonCable0.click();if(modoSonda)sondaBoton.click();
  if($('views').classList.contains('board'))document.querySelector('#tabs [data-view="scheme"]').click();
 }
 analisisCtl?.seleccionar(id);work.classList.toggle('con-analisis',!!analisisCtl?.activo);
 panelTitulo.textContent=['nodos','thevenin','mallas','campo'].includes(id)?'Análisis':INSTRUMENTOS.find(i=>i.id===id)?.nombre||'';
 for(let b of instrumentosMenu.querySelectorAll('button'))if(b.dataset.instrumento)b.setAttribute('aria-pressed',String(b.dataset.instrumento===id));
 if(id)instruments();requestAnimationFrame(()=>{fitPractice();physicalEditor.fit();});
});
const dibujos=['M3 12h3l3-6 5 12 3-6h4','M3 12q3-10 6 0t6 0t6 0','M5 8h8m-4-4v8m6 4h5','M5 3h14v18H5zM8 7h8M9 12h6M12 12v5','M4 3v17h17M7 8h6l7 9','M3 18l4-4v4l5-9v9l5-13v13l4-7'];
for(let [n,i] of HERRAMIENTAS.entries()){
 let b=control(instrumentosMenu,'button','instr-'+i.id,'',{type:'button',title:i.nombre});b.dataset.instrumento=i.id;b.setAttribute('aria-label',i.nombre);b.setAttribute('aria-pressed','false');
 let svg=el('svg',{viewBox:'0 0 24 24','aria-hidden':'true'},b);el('path',{d:dibujos[n]||(i.id==='mallas'?'M3 5h18v14H3zM12 5v14M9 10a3 3 0 1 0 0 5m-3-1 3 1-1-3':i.id==='nodos'?'M12 3v6m0 6v6M3 12h6m6 0h6M9 9h6v6H9z':i.id==='campo'?'M4 12a8 4 0 0 1 16 0M4 12a8 4 0 0 0 16 0M12 4v16':'M3 6h5m8 0h5M8 3h8v6H8zM3 18h18M5 6v12')},svg);b.onclick=()=>instrumentosUno.alternar(i.id);
}
panelCerrar.onclick=()=>instrumentosUno.cerrar();
instrumentosDock.addEventListener('keydown',e=>{if(e.key==='Escape'&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))instrumentosUno.cerrar();});
aplicarVisibilidad(instrumentoContenido,INSTRUMENTOS,null);
// Lienzo primero (R19): paleta y ayuda flotantes, cerradas al abrir; la pestaña activa es la que se ve.
const paleta=document.querySelector('main>aside');paleta.classList.add('paleta');paleta.hidden=true;
const paletaBoton=control($('selection').parentElement,'button','paletaBtn','Componentes (A)',{type:'button'}),ayudaBoton=control($('selection').parentElement,'button','ayudaBtn','?',{type:'button'}),ayuda=control(document.body,'div','ayudaPanel','',{hidden:true});
ayuda.className='inspector ayuda-panel';ayuda.setAttribute('role','dialog');ayuda.setAttribute('aria-label','Atajos de teclado');ayuda.innerHTML='<header><strong>Atajos</strong></header>'+AYUDA.map(([k,t])=>`<div class="atajo"><kbd>${k}</kbd><span>${t}</span></div>`).join('');
ayudaBoton.setAttribute('aria-label','Ayuda de atajos');
// Paleta (R19): Recientes, paquete activo, resto plegado, ↑↓ Enter, pieza pegada al cursor; Crear/Importar/Exportar en «Avanzado».
let paletaCtl=null;
// Vista previa al colocar: la pieza con el tamaño que tendrá en el lienzo activo, al zoom actual.
function vistaPreviaPieza(origen,carga){
 if(!carga)return null;
 const sobreBoard=activeView==='board',fisico=sobreBoard||catalogoCtl?.vista==='fisico',lienzo=$(sobreBoard?'board':'scheme'),pieza=piezaDePayload(carga,id=>customLibrary?.get(id));
 const caja=fisico?[-72,-72,144,155]:[-45,-36,90,72],svg=el('svg',{viewBox:caja.join(' '),'aria-hidden':'true',focusable:'false'});svg.style.overflow='visible';
 svg.innerHTML=fisico?arteFisico(pieza):'<path d="'+simboloCatalogo(carga)+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>';
 const tam=()=>{const m=lienzo.getScreenCTM?.(),k=m?Math.hypot(m.a,m.b)||1:1,w=caja[2]*k,h=caja[3]*k;svg.setAttribute('width',String(w));svg.setAttribute('height',String(h));return [w,h];};
 tam();return {svg,tam};
}
function organizarPaleta(){
 if(!paletaCtl)paletaCtl=paletaUI({catalog:$('catalog'),search:document.getElementById('search'),scheme:$('scheme'),board:$('board'),storage:(()=>{try{return localStorage;}catch{return null;}})(),cerrar:()=>alternarPaleta(false),status,vistaPrevia:vistaPreviaPieza});
 let controles=paleta.querySelector('.library-controls');
 if(controles&&!paleta.querySelector('details.avanzado')){let d=document.createElement('details');d.className='avanzado';let sm=document.createElement('summary');sm.textContent='Avanzado';d.append(sm,...[...controles.children].filter(x=>!x.querySelector?.('select')));$('catalog').after(d);}
 paletaCtl.refrescar();
}
function alternarPaleta(v=catalogoCtl?!catalogoCtl.abierta:paleta.hidden){if(catalogoCtl){v?catalogoCtl.abrir():catalogoCtl.cerrar();return;}paleta.hidden=!v;paletaBoton.setAttribute('aria-pressed',String(v));document.querySelector('.work').classList.toggle('con-paleta',v);requestAnimationFrame(()=>{fitPractice();physicalEditor.fit();});if(v)document.getElementById('search')?.focus();}
function alternarAyuda(v=ayuda.hidden){ayuda.hidden=!v;ayudaBoton.setAttribute('aria-pressed',String(v));}
paletaBoton.onclick=()=>alternarPaleta();ayudaBoton.onclick=()=>alternarAyuda();
paleta.addEventListener('click',e=>{if(e.target.closest('[data-library-id],#catalog button'))alternarPaleta(false);});
document.addEventListener('keydown',e=>{if(e.target.closest('dialog')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable||e.target.closest('.inspector')||catalogoCtl?.abierta)return;let a=accionTecla(e);if(!a)return;if(['copiar','pegar','duplicar','todo'].includes(a)){e.preventDefault();editarSeleccion(a);return;}
 if(a==='rotar'){e.preventDefault();rotate(e.shiftKey?-1:1);}else if(a==='paleta'){e.preventDefault();alternarPaleta();}else if(a==='ayuda'){alternarAyuda();}
 else if(a==='cable'){e.preventDefault();botonCable0.click();}
 else if(a==='sonda'){e.preventDefault();if(nodoActual)alternarSonda(nodoActual);else sondaBoton.click();}
 else if(a==='mover'){if(wiring)botonCable0.click();status('Mover: arrastre una pieza; Esc para salir');}
 else if(a==='borrar'){e.preventDefault();remove();}
 else if(a==='propiedades'){if(!wiring)edit();}
 else if(a==='guardar'){e.preventDefault();$('save').click();}
 else if(a==='nuevo'){e.preventDefault();distribuir?.nuevo?.();}
 else if(a==='abrir'){e.preventDefault();$('open').click();}
 else if(a==='simular'){e.preventDefault();simularPausar();}
 else if(a==='corriente')$('pause').click();
 else if(a==='instrumentos')instrumentosUno.alternar('osciloscopio');
 else if(a.startsWith('distribucion:')){e.preventDefault();distribuir?.(a.split(':')[1]);}
 else if(['centrar','seleccion','real','acercar','alejar'].includes(a)){e.preventDefault();(activeView==='board'?physicalEditor.navigation:schemeNavigation)?.run(a);}
 else if(a==='salir'){alternarPaleta(false);alternarAyuda(false);modoSonda=false;sondaBoton.setAttribute('aria-pressed','false');instrumentosUno.cerrar();if(selected){selected=null;render();}inspector.ocultar();}});

// Visor de ondas (R19): solo con trazas. Sonda: clic en nodo + S, o «Sonda (S)» y tocar el nodo.
const trazas=crearTrazas();let nodoActual=null,modoSonda=false;
const visor=crearVisor({destino:document.querySelector('.work'),formato,trazas,quitar:n=>alternarSonda(n),resultado:()=>result});
const sondaBoton=control($('selection').parentElement,'button','sondaBtn','Sonda (S)',{type:'button'});sondaBoton.setAttribute('aria-pressed','false');
function alternarSonda(n){let r=trazas.alternar(n);status(r==='llena'?'Máximo 4 trazas: quite una con S sobre su nodo':r==='agregada'?'Traza agregada en el nodo '+n:'Traza quitada del nodo '+n);visor.dibujar();}
sondaBoton.onclick=()=>{if(wiring)botonCable0.click();modoSonda=!modoSonda;sondaBoton.setAttribute('aria-pressed',String(modoSonda));status(modoSonda?'Sonda: toque un nodo (Esc cancela)':'Sonda cancelada');};
for(let id of ['scheme','board'])$(id).addEventListener('click',e=>{let n=e.target.closest('[data-node]')?.dataset.node;if(!n)return;nodoActual=n;if(modoSonda){modoSonda=false;sondaBoton.setAttribute('aria-pressed','false');alternarSonda(n);}},true);
{let base=instruments;instruments=function(){base();visor.dibujar();};let c0=change;change=()=>{c0();visor.dibujar();};}
document.querySelector('[data-view=scheme]').click();

function editPhysical(p,g){edit(p);}
let dropLogical=$('scheme').ondrop;$('scheme').ondrop=e=>{let [type,appearance]=e.dataTransfer.getData('text/plain').split(':');if(!['led','ceramic','electrolytic','battery','generator','bench'].includes(appearance))return dropLogical(e);e.preventDefault();let q=point(e),p={id:next(type),type,appearance,value:type==='V'?appearance==='battery'?9:12:type==='C'?1e-6:0,x:Math.round(q.x/20)*20,y:Math.round(q.y/20)*20,rotation:0};if(appearance==='led')Object.assign(p,{Is:1e-17,n:2});circuit.components.push(p);selected=p.id;change();};
let changeLogical=change;change=()=>{if(circuit===lastCircuit&&circuit.mode==='board'&&!physicalChange&&lastWires!==JSON.stringify(circuit.wires))circuit.logicalRequest=structuredClone(circuit.wires);lastCircuit=circuit;lastWires=JSON.stringify(circuit.wires);changeLogical();};
let renderPhysical=render;render=()=>{renderPhysical();$('views').classList.remove('scheme-only');$('addBoard').hidden=circuit.mode==='board';$('montajeLibre').hidden=circuit.mode==='board';physicalEditor.draw();drawProbeMarks();let height=Math.max(420,...circuit.components.map(p=>p.y+100));$('scheme').setAttribute('viewBox',`0 0 960 ${height}`);if(circuit.components.some(p=>p.tray)){let warning=text($('scheme'),20,350,'Bandeja por acomodar: arrastre los componentes');warning.setAttribute('class','tray-warning');}};
let removeLogical=remove;remove=()=>{if(circuit.mode==='board'){if(circuit.physical.directos?.some(w=>w.id===selected)){circuit.physical.directos=circuit.physical.directos.filter(w=>w.id!==selected);selected=null;physicalChange=true;change();physicalChange=false;return;}if(circuit.physical.directos)circuit.physical.directos=circuit.physical.directos.filter(w=>!w.a.startsWith(selected+':')&&!w.b.startsWith(selected+':'));if(circuit.physical.libres)delete circuit.physical.libres[selected];if(circuit.physical.wires.some(w=>w.id===selected)){circuit.physical.wires=circuit.physical.wires.filter(w=>w.id!==selected);sincronizar(circuit);physicalChange=true;change();physicalChange=false;return;}delete circuit.physical.placements[selected];if(circuit.logicalRequest)circuit.logicalRequest=circuit.logicalRequest.filter(w=>!w.a.startsWith(selected+':')&&!w.b.startsWith(selected+':'));}removeLogical();};$('delete').onclick=remove;
let activeView='scheme';for(let id of ['scheme','board'])for(let event of ['pointerdown','focusin'])$(id==='scheme'?'schemePane':'boardPane').addEventListener(event,()=>{activeView=id;},true);let rotateLogical=rotate;rotate=(direction=1)=>{if(circuit.mode==='board'&&circuit.physical.placements[selected]&&activeView==='board'){try{let v=circuit.physical.placements[selected];colocar(circuit,selected,v.holes[0],(v.rotation+90*direction+360)%360,v.span);physicalChange=true;sincronizar(circuit);change();physicalChange=false;}catch(e){physicalChange=false;fail(e);}}else rotateLogical(direction);};$('rotate').onclick=()=>rotate();
leadSpan.onchange=()=>{let v=circuit.physical?.placements[selected];if(v){try{colocar(circuit,selected,v.holes[0],v.rotation,Number(leadSpan.value));sincronizar(circuit);physicalChange=true;change();physicalChange=false;}catch(e){fail(e);}}};
let simulationTicket=0;
simulate=async()=>{let ticket=++simulationTicket;try{
 if(!circuit.components.length){result=null;dirty=true;calculando=false;$('simulate').textContent='▶ Simular';status('Sin componentes: pulsa A para agregar y vuelve a simular');return;}

 const snapshot=JSON.stringify(circuit),settings=Object.fromEntries(['dt','tdiv','fstart','fstop','psuSource','psuVoltage','psuLimit'].map(id=>[id,$(id).value]));settings.psuEnabled=$('psuEnabled').checked;
 // La ventana del osciloscopio no acorta la adquisición ni elimina el asentamiento.
 if(circuit.b309?.analysis)settings.tdiv=String(Math.max(Number(settings.tdiv),circuit.b309.analysis.stop/10));
 calculando=true;$('simulate').textContent='▶ Simular';paused=false;status('Calculando el circuito…');
 if(webStatic&&engine.dataset.automatico!=='false'){
  const needsSpice=compilar(circuit).components.some(p=>p.definition);
  if(needsSpice&&!webMotor.listo){status('Esperando al motor ngspice…');await webReady;if(ticket!==simulationTicket)return;}
  engine.value=webMotor.listo?'ngspice':'mna';
 }
 const {result:data,supply}=await simularDocumento(circuit,settings,{engine:engine.value,...(webStatic?{request:webMotor.request.bind(webMotor)}:{})});
 if(ticket!==simulationTicket)return;
 if(snapshot!==JSON.stringify(circuit)){$('simulate').textContent='▶ Simular';return;}
 result=data;const first=dirty;dirty=false;
 if(circuit.b309){configurePracticeInstruments(circuit);autoescalaPractica(circuit,result,Object.fromEntries(['vdiv','vdiv2','position1','position2','tdiv'].map(id=>[id,$(id)])));instruments();}
 else {configurePracticeInstruments(circuit);if(first&&sondasPractica(circuit).instrument!=='meter')$('autoscale').click();else instruments();}
 $('psuReading').textContent=supply?`${supply.limited?'CC':'CV'} · ${formato(supply.voltage,'V')} · límite DC calculado por MNA`:'Fuente de banco desconectada';
 $('simulate').textContent='▶ Simular';status(paused?'Pausado':webStatic?'Simulación en tu navegador (motor '+engine.value+') · resultados listos':'Simulando · resultados listos');console.info('[AULA-C simulación]',{motor:engine.value,pasos:data.tran.length,frecuencias:data.ac.length,ticket});
 }catch(e){if(ticket!==simulationTicket)return;result=null;$('simulate').textContent='▶ Simular';if(webStatic&&e.message.includes('requiere modelos de servidor'))status('Aviso: '+e.message);else fail(e);}finally{if(ticket===simulationTicket)calculando=false;}};$('simulate').onclick=simulate;
let customLibrary=null;
function addDefined(def,x=470,y=200,hole=null){let p={id:next('X'),type:'X',definition:structuredClone(validarComponente(def)),value:0,x,y,rotation:0,tray:circuit.mode==='board'};try{circuit.components.push(p);if(hole){colocar(circuit,p.id,hole,0,p.definition.package.drawing.span||1);sincronizar(circuit);}selected=p.id;engine.value='ngspice';change();}catch(e){circuit.components=circuit.components.filter(c=>c!==p);fail(e);}}
const libraryReady=bibliotecaUI({catalog:$('catalog'),status,add:addDefined}).then(lib=>{customLibrary=lib;organizarPaleta();return lib;});libraryReady.catch(fail);
let dropWithLibrary=$('scheme').ondrop;$('scheme').ondrop=e=>{let [type,id]=e.dataTransfer.getData('text/plain').split(':');if(type!=='X')return dropWithLibrary(e);e.preventDefault();let def=customLibrary?.get(id);if(def){let q=point(e);addDefined(def,Math.round(q.x/20)*20,Math.round(q.y/20)*20);}};
$('board').addEventListener('drop',e=>{let [type,id]=e.dataTransfer.getData('text/plain').split(':');if(type!=='X'||circuit.mode!=='board')return;e.preventDefault();let def=customLibrary?.get(id);if(!def)return;let svg=$('board'),q=svg.createSVGPoint();q.x=e.clientX;q.y=e.clientY;q=q.matrixTransform(svg.getScreenCTM().inverse());if(circuit.physical.sinTabla){addDefined(def,470,390);const nuevo=circuit.components.at(-1);(circuit.physical.libres||(circuit.physical.libres={}))[nuevo.id]={x:Math.max(30,Math.round(q.x/14)*14),y:Math.max(30,Math.round(q.y/14)*14)};render();return;}let h=anclar(q.x,q.y,circuit);if(!h)return status('Suelte el componente sobre un agujero');addDefined(def,470,390,h);});
const resize=new ResizeObserver(entries=>{for(let {target} of entries){let scale=Math.min(target.clientWidth/target.viewBox.baseVal.width,target.clientHeight/target.viewBox.baseVal.height);if(scale>0)target.style.setProperty('--svg-font',`${13/scale}px`);}});for(let id of ['board','scope','bode','sweepPlot'])resize.observe($(id));$('nodes').onchange=render;syncBench();render();if(circuit.components.length)simulate();requestAnimationFrame(animate);

const cellId=webStatic?null:new URLSearchParams(location.search).get('celda');
if(cellId){fetch('./api/circuito?id='+encodeURIComponent(cellId)).then(r=>{if(!r.ok)throw Error('No se pudo abrir el circuito');return r.json();}).then(async c=>{if(c.components){validar(c);circuit=c;if(c.b309){await libraryReady;customLibrary.activate(c.b309.package);configurePractice(c,c.b309.analysis);}else if(c.analysis)configurePractice(c,c.analysis);else change();}}).catch(fail);
const saveDownload=$('save').onclick;$('save').onclick=async()=>{try{const r=await fetch('./api/circuito',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:cellId,circuit})});if(!r.ok)throw Error(await r.text());saveDownload();status('Celda de circuito actualizada');}catch(e){fail(e);}};}

// Toda simulación del escritorio publica sim por la misma cola de Octave.
const simulateIntegrated=simulate;
function publishSimulation(){if(!webStatic&&result&&location.pathname.startsWith('/lab/'))fetch('./api/sim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({result,input:$('ch1').value,output:$('ch2').value})}).then(async r=>{if(!r.ok)throw Error(await r.text());}).catch(fail);}

// Las prácticas y los cuadernos conservan referencias de terminal, no nombres n1/n2 frágiles.
function configurePractice(c,analysis){
 prepararEsquema(c);
 distribuir?.('medir');
 engine.value='ngspice';$('psuEnabled').checked=false;
 if(analysis)configurarAnalisis(Object.fromEntries(['dt','tdiv','fstart','fstop'].map(id=>[id,$(id)])),analysis);
 change();const model=compilar(c);
 if(c.b309?.probes){$('ch1').value=model.node(c.b309.probes[0]);$('ch2').value=model.node(c.b309.probes[1]);}
 requestAnimationFrame(fitPractice);
}
function configurePracticeInstruments(c){
 const {input,output,instrument,coupling}=sondasPractica(c);
 $('ch1').value=input;$('ch2').value=output;$('plus').value=output;$('minus').value='0';$('meterMode').value='V';
 for(const i of [1,2]){$('coupling'+i).value=coupling;$('position'+i).value='0';}
 for(const id of ['meter','bode'])$(id).closest('details').open=id===instrument;
 // La práctica abre SU instrumento (uno a la vez); el banco ya no se abre solo.
 instrumentosUno.abrir(instrument==='bode'?'bode':instrument==='meter'?'multimetro':'osciloscopio');
}
const examplesMenu=control(header,'details','examplesMenu','');control(examplesMenu,'summary','examplesSummary','Ejemplos y prácticas ▾');
header.querySelector('strong').textContent='LAB';$('save').textContent='Guardar';$('newCircuit').textContent='Nuevo';$('tabs').append($('octave'));
const exampleGroup=control(examplesMenu,'div','exampleGroup','');control(exampleGroup,'strong','examplesTitle','Ejemplos');
for(const id of ['example','commonEmitter','ledExample','dividerExample']){const b=$(id),action=b.onclick;b.onclick=()=>{practiceCard.hidden=true;examplesMenu.open=false;action();};exampleGroup.append(b);}
const practiceMenu=control(examplesMenu,'select','b309Practice','');practiceMenu.setAttribute('aria-label','Elegir práctica');practiceMenu.add(new Option('Elegir práctica',''));
const tcGroup=control(practiceMenu,'optgroup','tcPractices','',{label:'Teoría de los Circuitos'});tcGroup.append(new Option('TC · Leyes de Kirchhoff','tc-kirchhoff'));
const b309Group=control(practiceMenu,'optgroup','b309Practices','',{label:'B309 · Electrónica Analógica y de Potencia'});
const practiceCard=control(document.querySelector('.work'),'details','practiceCard','');practiceCard.hidden=true;document.querySelector('.work').prepend(practiceCard);
const practiceSummary=control(practiceCard,'summary','practiceSummary','');
const practiceView=selectField(practiceCard,'b309View','Montaje');practiceView.setAttribute('aria-label','Montaje de práctica B309');practiceView.add(new Option('Esquemático','esquema.aulac.json'));practiceView.add(new Option('Protoboard manual','protoboard.aulac.json'));
const practiceInfo=control(header,'a','b309Info','Guía B309');practiceInfo.href='./b309/README.md';practiceInfo.target='_blank';
const practiceChip=selectField(practiceCard,'b309Chip','Amplificador de instrumentación');
for(const chip of ['INA3','AD620','INA128'])practiceChip.add(new Option(chip==='INA3'?'INA3 · tres op-amps':chip,chip));
practiceInfo.className='button';
for(const [id,title] of [['engine','Motor'],['createMode','Modo']]){const input=$(id),label=control(header,'label',id+'HeaderLabel',title);input.before(label);label.append(input);}
const practiceTitle=control(practiceCard,'strong','practiceTitle',''),practiceObjective=control(practiceCard,'p','practiceObjective',''),practiceUnit=control(practiceCard,'p','practiceUnit',''),practiceNotebook=control(practiceCard,'a','practiceNotebook','Abrir cuaderno de la práctica ↗');
practiceSummary.append(practiceTitle);control(practiceSummary,'span','practiceObjectiveToggle','Objetivo ▾');
practiceNotebook.target='_blank';
const practiceNotice=control(practiceCard,'output','b309Notice','');practiceNotice.setAttribute('role','status');
function showPractice(c){const p=practiceIndex.find(p=>p.id===c.b309?.practice);practiceCard.hidden=!p;if(!p)return;practiceChip.parentElement.hidden=p.id!=='v-instrumentacion';if(p.id==='v-instrumentacion')practiceChip.value=c.components.find(p=>p.id==='XI').definition.id;practiceTitle.textContent=p.unit+' · '+p.title;practiceObjective.textContent=objetivos[p.id];practiceUnit.textContent='Unidad '+p.unit+' · «'+unidades[p.unit]+'»';practiceNotebook.href='/cuaderno/';practiceNotebook.onclick=async e=>{e.preventDefault();const target=abrirVentana('cuaderno','about:blank');try{const url=await cargarCuaderno(p.unit);if(target)target.location.href=url;else location.href=url;}catch(error){target?.close();fail(error);}};}
const renderPresentation=render;render=()=>{prepararEsquema(circuit);renderPresentation();showPractice(circuit);const svg=$('scheme');svg.classList.toggle('practice-scheme',!!circuit.b309);if(!circuit.b309)return;for(const p of circuit.components){const g=svg.querySelector(`[data-component="${p.id}"]`),symbol=simboloPractica(p);if(symbol){let body=g.querySelector('.body');body.innerHTML=symbol.svg;let b=body.getBBox();body.prepend(el('rect',{x:b.x-6,y:b.y-6,width:b.width+12,height:b.height+12,fill:'transparent',stroke:'none',class:'hit-area'}));}for(const t of g.querySelectorAll(':scope > text'))t.remove();const r=rotuloEsquema(p);text(g,r.x,r.y,r.text,{'text-anchor':'middle',class:'component-label'});}svg.setAttribute('viewBox',encuadreEsquema(circuit).join(' '));};
function fitPractice(){
 const svg=$('scheme');svg.querySelectorAll('.label-guide').forEach(e=>e.remove());
 // Las etiquetas escalan con el símbolo: compensarlas por el zoom causa solapamientos.
 svg.style?.setProperty('--svg-font','20px');
 const elements=[...svg.querySelectorAll('text')].filter(e=>!e.closest('.body,.analisis-equivalente'));
 const labels=elements.map(e=>{e.removeAttribute('transform');const b=e.getBBox(),pad=e.closest('.analisis-chip')?8:3;return {x:b.x-pad,y:b.y-pad,width:b.width+2*pad,height:b.height+2*pad};});
 const obstacles=cajasEsquema(circuit).filter(b=>b.kind==='symbol');
 for(const w of circuit.wires){const pts=ruta(circuit,w);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];obstacles.push({x:Math.min(a[0],b[0])-2,y:Math.min(a[1],b[1])-2,width:Math.abs(a[0]-b[0])+4,height:Math.abs(a[1]-b[1])+4});}}
 const placed=distribuirEtiquetas(labels,obstacles);
 placed.forEach((b,i)=>{elements[i].setAttribute('transform',`translate(${b.dx} ${b.dy})`);if(Math.hypot(b.dx,b.dy)>12){const a=labels[i],x=a.x+a.width/2,y=a.y+a.height/2;const guia=el('path',{d:`M${x} ${y}L${Math.max(b.x,Math.min(x,b.x+b.width))} ${Math.max(b.y,Math.min(y,b.y+b.height))}`,class:'label-guide'},svg),dueno=elements[i].closest('[data-component]');if(dueno){dueno.addEventListener('pointerenter',()=>guia.classList.add('visible'));dueno.addEventListener('pointerleave',()=>guia.classList.remove('visible'));}}});
 svg.setAttribute('viewBox',encuadreEsquema(circuit,placed).join(' '));
 schemeBounds=encuadreEsquema(circuit,placed);if(schemeNavigation){schemeNavigation.state.ajustar(schemeBounds);schemeNavigation.apply();}
 if(svg.style&&svg.clientWidth&&svg.clientHeight){
  const frame=encuadreEsquema(circuit,placed),scale=Math.min(svg.clientWidth/frame[2],svg.clientHeight/frame[3]);
  const font=Number.parseFloat(svg.style.getPropertyValue('--svg-font'));
  if(font*scale>16){svg.style.setProperty('--svg-font',`${16/scale}px`);}
 }
}
control($('tabs'),'button','schemeFit','Ajustar a la vista').onclick=fitPractice;
new ResizeObserver(()=>fitPractice()).observe($('schemePane'));
let practiceIndex=[];
async function openPractice(){if(!practiceMenu.value)return;try{
 if(practiceMenu.value==='tc-kirchhoff'){const response=await fetch('./tc-kirchhoff/esquema.aulac.json');if(!response.ok)throw Error('No se pudo abrir TC · Leyes de Kirchhoff');circuit=validar(await response.json());selected=null;physicalEditor.cancel();configurePractice(circuit,circuit.analysis);examplesMenu.open=false;status('TC · Leyes de Kirchhoff: pulse Simular; las ocho sondas indican su referencia.');return;}
 const [id,variant]=practiceMenu.value.split(':');const p=practiceIndex.find(p=>p.id===id);if(!p)throw Error('Práctica desconocida');
 if(!p.board)practiceView.value='esquema.aulac.json';practiceView.disabled=!p.board;
 const file=variant==='media'?(practiceView.value==='protoboard.aulac.json'?'media-onda-protoboard.aulac.json':'media-onda.aulac.json'):practiceView.value;
 const response=await fetch(`./b309/${p.id}/${file}`);if(!response.ok)throw Error('No se pudo abrir la práctica');
 let nextCircuit=validar(await response.json());await libraryReady;customLibrary.activate(p.package);
 practiceChip.parentElement.hidden=p.id!=='v-instrumentacion';
 if(p.id==='v-instrumentacion')nextCircuit=validar(seleccionarINA(nextCircuit,practiceChip.value,customLibrary.get(practiceChip.value)));
 circuit=nextCircuit;selected=null;result=null;physicalEditor.cancel();configurePractice(circuit,p.analysis);
 practiceInfo.href=`./b309/${p.id}/README.md`;showPractice(circuit);examplesMenu.open=false;practiceNotice.textContent=p.id==='i-fase'?'127 V: solo simulación. Nunca conectar a protoboard.':'Propuesta AULA-C';status('Práctica preparada. Pulse Simular.');
 }catch(e){fail(e);}}
practiceMenu.onchange=openPractice;practiceView.onchange=openPractice;
practiceChip.onchange=()=>{if(circuit.b309?.practice==='v-instrumentacion')practiceMenu.value='v-instrumentacion';openPractice();};
fetch('./b309/indice.json').then(async r=>{if(!r.ok)throw Error('No se pudo leer el índice B309');practiceIndex=await r.json();for(const unit of Object.keys(unidades)){for(const p of practiceIndex.filter(p=>p.unit===unit)){b309Group.append(new Option(unit+' · '+p.title,p.id));if(p.id==='ii-rectificador')b309Group.append(new Option('II · Rectificador de media onda',p.id+':media'));}}showPractice(circuit);const requested=new URLSearchParams(location.search).get('practica');if(requested&&[...practiceMenu.options].some(p=>p.value===requested)){practiceMenu.value=requested;await openPractice();}}).catch(fail);
simulate=async()=>{await simulateIntegrated();publishSimulation();};
$('simulate').onclick=simulate;
if(!cellId)publishSimulation();

function rememberRecent(title,url){try{let items=JSON.parse(localStorage.getItem('aulac-recientes')||'[]');if(!Array.isArray(items))items=[];localStorage.setItem('aulac-recientes',JSON.stringify([{title,url},...items.filter(p=>p&&!(p.title===title&&p.url===url))].slice(0,8)));}catch(error){console.warn('[AULA-C recientes]',error.message);}}

// Valores DC sobre el esquemático (como xschem tras un .op) y multímetro que mide la pieza seleccionada.
const dcLabel=document.createElement('label');dcLabel.innerHTML='<input id="dcValues" type="checkbox">Valores DC';$('nodes').parentElement.after(dcLabel);
const meterPick=document.createElement('p');meterPick.id='meterPick';$('meter').before(meterPick);
function anotarDC(){let svg=$('scheme');svg.querySelectorAll('.dc-label').forEach(e=>e.remove());let dc=result?.dc;if(!$('dcValues').checked||!dc||circuit.mode==='board')return;let model=compilar(circuit),seen=new Set();
 for(let p of circuit.components){for(let i=0;i<patillas(p);i++){let k=p.id+':'+i,n=model.node(k);if(n==='0'||seen.has(n)||!dc.voltages[n])continue;seen.add(n);let [x,y]=pin(k);text(svg,x+8,y-10,formato(dc.voltages[n][0],'V'),{class:'dc-label dc-volt'});}
  if(p.type==='G'||p.definition||!dc.currents[p.id])continue;let v=p.rotation%180!==0;text(svg,p.x+(v?32:0),p.y+(v?4:34),'I '+formato(dc.currents[p.id][0],'A'),{class:'dc-label dc-amp','text-anchor':v?'start':'middle'});}}
let medida=null;
function medirSeleccion(){let p=circuit.components.find(q=>q.id===selected),dc=result?.dc;if(!p||p.type==='G'||patillas(p)!==2||circuit.mode==='board'){meterPick.textContent='Clic en una pieza para medir su voltaje, corriente y potencia; o elija puntas + y − sobre los nodos.';medida=null;return;}let model=compilar(circuit),a=model.node(p.id+':0'),b=model.node(p.id+':1');if(medida!==p.id){medida=p.id;for(let [id,v] of [['plus',a],['minus',b],['amp',p.id]])if([...$(id).options].some(o=>o.value===v))$(id).value=v;if(dc)instruments();}
 if(!dc){meterPick.textContent=`${p.id}: puntas en ${a} (+) y ${b} (−). Pulse Simular para medir.`;return;}let V=(dc.voltages[a]?.[0]??0)-(dc.voltages[b]?.[0]??0),I=dc.currents[p.id]?.[0]??0;meterPick.textContent=`${p.id} · ${a} (+) → ${b} (−)\nV = ${formato(V,'V')} · I = ${formato(I,'A')} · P = ${formato(V*I,'W')} absorbida`;}
let renderSinDC=render;render=()=>{renderSinDC();anotarDC();medirSeleccion();};
let instrumentsSinDC=instruments;instruments=()=>{instrumentsSinDC();anotarDC();medirSeleccion();};
$('dcValues').onchange=()=>{anotarDC();fitPractice();if($('dcValues').checked&&!result)status('Pulse Simular para ver los valores DC');};
medirSeleccion();

function dibujarSondas(){
 const svg=$('scheme');svg.querySelectorAll('.practice-probe').forEach(e=>e.remove());
 let table=$('probeReadings');if(!table){table=control($('meter').parentElement,'table','probeReadings','');table.className='probe-readings';}
 table.replaceChildren();const readings=lecturasSondas(circuit,result?.dc);table.hidden=!readings.length;
 if(readings.length){control(table,'caption','','Lecturas DC de sondas');const head=control(table,'thead','',''),row=control(head,'tr','','');for(const title of ['Sonda','Referencia / sentido','Lectura']){const cell=control(row,'th','',title);cell.scope='col';}const body=control(table,'tbody','','');for(const p of readings){const row=control(body,'tr','','');control(row,'th','',p.id).scope='row';control(row,'td','',p.kind==='current'?p.direction:`${p.plus} (+), ${p.minus} (−)`);control(row,'td','',p.value===null?'Pendiente':formato(p.value,p.unit));}}
 if(circuit.mode==='board'){fitPractice();return;}
 for(const p of readings){
  const direction=p.kind==='current'?(p.direction.includes('GND')?'↓':'→'):'+';
  const label=`${p.id} ${direction}`+(p.value===null?'':` ${formato(p.value,p.unit)}`);
  const t=text(svg,p.x,p.y,label,{class:'practice-probe',fill:'var(--aulac-canal2)','text-anchor':'middle','font-size':13});
  const title=el('title',{},t);title.textContent=p.kind==='current'?p.direction:`${p.plus} (+), ${p.minus} (−)`;
 }
 fitPractice();
}
const renderSinSondas=render;render=()=>{renderSinSondas();dibujarSondas();};
const instrumentsSinSondas=instruments;instruments=()=>{instrumentsSinSondas();dibujarSondas();};

function actualizarTerminales(){let svg=$('scheme'),m=svg.getScreenCTM();if(!m)return;let scale=Math.min(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d));if(!scale)return;for(let t of svg.querySelectorAll('.terminal-hit'))t.remove();for(let t of svg.querySelectorAll('.terminal')){let hit=el('circle',{cx:t.getAttribute('cx'),cy:t.getAttribute('cy'),r:12/scale,class:'terminal-hit','data-pin':t.dataset.pin,'data-node':t.dataset.node,fill:'transparent','pointer-events':'all'},svg);hit.onclick=t.onclick;}}
{let base=render;render=()=>{base();actualizarTerminales();};}
new ResizeObserver(actualizarTerminales).observe($('scheme'));
new MutationObserver(actualizarTerminales).observe($('scheme'),{attributes:true,attributeFilter:['viewBox']});
actualizarTerminales();

// Entrega 1: Variante A, menús planos y navegación compartida.
schemeNavigation=navegar($('scheme'),{ajuste:()=>schemeBounds||encuadreEsquema(circuit),cancelarMovimiento:()=>{drag=null;},seleccion:()=>{const g=$('scheme').querySelector('[data-component="'+selected+'"],[data-wire="'+selected+'"]');if(!g)return null;const b=g.getBBox();return [b.x-50,b.y-50,b.width+100,b.height+100];},bloqueado:()=>wiring});
const renderNavegacion=render;render=()=>{schemeBounds=null;renderNavegacion();schemeNavigation.fit();fitPractice();};
for(const id of ['boardPlus','boardMinus','boardFit','schemeFit'])$(id)?.remove();
const botonesOriginales={};for(const id of ['save','newCircuit','undo','redo','rotate','edit','delete','netlist','octave','example','commonEmitter','ledExample','dividerExample','addBoard'])botonesOriginales[id]=$(id);
$('save').addEventListener('click',()=>{modificado=false;});$('open').addEventListener('change',()=>setTimeout(()=>{modificado=false;},300));
const oldNetlist=botonesOriginales.netlist;oldNetlist.onclick=()=>{const d=document.createElement('dialog'),pre=document.createElement('pre');pre.textContent='* AULA-C\n'+texto(circuit)+'\n.end';d.append(pre);for(const [label,fn] of [['Copiar',()=>navigator.clipboard.writeText(pre.textContent).catch(fail)],['Descargar .cir',()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([pre.textContent],{type:'text/plain'}));a.href=url;a.download='circuito.cir';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}],['Cerrar',()=>d.close()]]){const b=document.createElement('button');b.textContent=label;b.onclick=fn;d.append(b);}d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();};
function simularPausar(){if(calculando&&webStatic){++simulationTicket;calculando=false;webReady=webMotor.cancelar();webReady.catch(fail);status('Simulación cancelada');}else if(result&&!dirty){paused=!paused;status(paused?'Pausado':'Simulando');}else simulate();}
$('simulate').onclick=()=>simulate();$('simulate').textContent='▶ Simular';
$('pause').onclick=()=>{movimiento.paused=!movimiento.paused;pausaCorriente();guardarMovimiento();};
$('tabs').addEventListener('click',e=>{if(['scheme','board'].includes(e.target.dataset.view))activeView=e.target.dataset.view;});
// Etiquetas del riel (R23-UX5): solo íconos con tooltip o ícono y nombre; se recuerda en localStorage.
const CLAVE_ETIQUETAS_RIEL='lab.riel.etiquetas.v1';
let etiquetasVisibles=true;try{etiquetasVisibles=localStorage.getItem(CLAVE_ETIQUETAS_RIEL)!=='0';}catch{}
const aplicarEtiquetasRiel=()=>{$('instrumentosRail').classList.toggle('sin-etiquetas',!etiquetasVisibles);work.classList.toggle('riel-angosto',!etiquetasVisibles);};
const etiquetasRiel={visible:()=>etiquetasVisibles,alternar(){etiquetasVisibles=!etiquetasVisibles;aplicarEtiquetasRiel();try{localStorage.setItem(CLAVE_ETIQUETAS_RIEL,etiquetasVisibles?'1':'0');}catch{}requestAnimationFrame(()=>{fitPractice();physicalEditor.fit();});}};
aplicarEtiquetasRiel();
distribuir=await crearBarra({work,paleta,paletaBoton,ayudaBoton,sondaBoton,botonCable:botonCable0,visor,instrumentosUno,alternarPaleta,alternarAyuda,botones:botonesOriginales,createMode,examplesMenu,practiceMenu,practiceInfo,physicalControls,engine,simularPausar,openPractice,agregarTabla,montajeLibre:montarLibre,web:webStatic,abrirVentana,sinGuardar:()=>modificado&&circuit.components.length>0,limpio:()=>{modificado=false;},etiquetasRiel,edicion:editarSeleccion,zoom:a=>(activeView==='board'?physicalEditor.navigation:schemeNavigation).run(a),status});

if(circuit.b309||circuit.analysis)distribuir('medir');

// Entrega 2: el portapapeles pertenece al documento y sobrevive a las pestañas.
let portapapeles=null;seleccionMultiple=new Set();
function idsSeleccion(){return seleccionMultiple.size?[...seleccionMultiple]:selected?[selected]:[];}
function editarSeleccion(accion){
 try{
  if(accion==='izquierda'){rotate(-1);return;}
  if(accion==='todo'){seleccionMultiple=new Set(circuit.components.map(p=>p.id));selected=circuit.components[0]?.id;render();return;}
  if(accion==='copiar'||accion==='duplicar'){portapapeles=copiarSeleccion(circuit,idsSeleccion());status('Copiadas '+portapapeles.components.length+' piezas con sus cables internos');}
  if(accion==='pegar'||accion==='duplicar'){
   const ids=pegarSeleccion(circuit,portapapeles,{bandeja:activeView==='board'});if(!ids.length)return status('Primero selecciona y copia una pieza');
   seleccionMultiple=new Set(ids);selected=ids[0];change();status('Pegadas '+ids.length+' piezas · desplazamiento '+portapapeles.pegados*20+' px');
  }
 }catch(e){console.error('[AULA-C edición]',{accion,seleccion:idsSeleccion(),pegados:portapapeles?.pegados,error:e.message});fail(e);}
}
const borrarUna=remove;remove=()=>{const ids=idsSeleccion();seleccionMultiple.clear();for(const id of ids){selected=id;borrarUna();}};$('delete').onclick=remove;
const renderSeleccion=render;render=()=>{seleccionMultiple=new Set([...seleccionMultiple].filter(id=>circuit.components.some(p=>p.id===id)));if(!selected)seleccionMultiple.clear();renderSeleccion();for(const g of document.querySelectorAll('[data-component],[data-physical]'))if(seleccionMultiple.has(g.dataset.component||g.dataset.physical))g.classList.add('selected');};
for(const svg of [$('scheme'),$('board')])svg.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;const id=e.target.closest('[data-component],[data-physical]')?.dataset;const key=id?.component||id?.physical;
 if(e.shiftKey&&key){e.preventDefault();e.stopImmediatePropagation();if(!seleccionMultiple.size&&selected)seleccionMultiple.add(selected);seleccionMultiple.has(key)?seleccionMultiple.delete(key):seleccionMultiple.add(key);selected=[...seleccionMultiple][0]||null;render();}
},true);
// Los controles originales conservan acciones e iconos; el riel solo los agrupa.
const rail=$('instrumentosRail');rail.setAttribute('aria-label','Herramientas del laboratorio');
const grupo=(nombre)=>{const g=document.createElement('section'),h=document.createElement('strong');h.textContent=nombre;g.append(h);rail.append(g);return g;};
const instrumentosExistentes=[...rail.querySelectorAll('button')];rail.replaceChildren();
const construir=grupo('Construir');
for(const [b,label,icon] of [[paletaBoton,'Componentes A','⊞'],[botonCable0,'Cable W','⌁'],[sondaBoton,'Sonda S','⌖']]){b.replaceChildren();const i=document.createElement('b');i.textContent=icon;const s=document.createElement('span');s.textContent=label;b.append(i,s);b.title=label;b.setAttribute('aria-label',label);construir.append(b);}
const favoritos=document.createElement('div');favoritos.className='riel-favoritos';construir.append(favoritos);
const masFavoritos=document.createElement('button');masFavoritos.className='riel-mas';masFavoritos.textContent='Más ▾';masFavoritos.title='Favoritos';masFavoritos.setAttribute('aria-expanded','false');construir.append(masFavoritos);
masFavoritos.onclick=()=>{const abierto=rail.classList.toggle('favoritos-abiertos');masFavoritos.setAttribute('aria-expanded',String(abierto));};
document.addEventListener('click',e=>{if(!e.target.closest('.riel-favoritos,.riel-mas')){rail.classList.remove('favoritos-abiertos');masFavoritos.setAttribute('aria-expanded','false');}});
const instrumentsGroup=grupo('Instrumentos'),analysisGroup=grupo('Análisis');
for(const b of instrumentosExistentes){const i=HERRAMIENTAS.find(i=>i.id===b.dataset.instrumento);const s=document.createElement('span');s.textContent=i.nombre;b.append(s);(['bode','barrido','nodos','thevenin','mallas','campo'].includes(i.id)?analysisGroup:instrumentsGroup).append(b);}
function abrirDistribucion(){
 const menu=document.querySelector('.lab-barra .menu-barra.distribucion');if(innerWidth>=600){menu?.querySelector('summary').click();return;}
 // La fila no existe visualmente en móvil; reutilizar sus acciones evita un control inerte.
 const d=document.createElement('dialog'),h=document.createElement('header'),titulo=document.createElement('strong'),cerrar=document.createElement('button');titulo.textContent='Distribución';cerrar.textContent='Cerrar';cerrar.onclick=()=>d.close();h.append(titulo,cerrar);d.append(h);
 for(const original of menu.querySelectorAll('.menu-popup button')){const b=original.cloneNode(true);b.onclick=()=>{original.click();d.close();};d.append(b);}d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();
}
const ver=grupo('Ver');for(const [label,icon,fn] of [['Volver a centrar','⤢',()=> (activeView==='board'?physicalEditor.navigation:schemeNavigation).run('centrar')],['Distribución','▦',abrirDistribucion]]){const b=document.createElement('button'),s=document.createElement('span'),i=document.createElement('b');s.textContent=label;i.textContent=icon;b.append(i,s);b.title=label;b.setAttribute('aria-label',label);b.onclick=fn;ver.append(b);}
document.querySelector('.lienzo-fichas')?.remove();
// La leyenda comparte el pie del lienzo y deja libre la zona de zoom.
$('schemePane').append(document.querySelector('.current-legend'));
await libraryReady;
catalogoCtl=catalogoUI({catalog:$('catalog'),paleta,controlador:()=>paletaCtl,storage:(()=>{try{return localStorage;}catch{return null;}})(),status,riel:favoritos,definicion:id=>customLibrary?.get(id)});
paleta.hidden=true;work.classList.remove('con-paleta');
// En móvil las pestañas usan la barra inferior; los botones de distribución conservan su acción.
const inferior=document.querySelector('.distribuciones');
for(const [id,label] of [['both','Ambas'],['board','Protoboard'],['scheme','Esquema']]){const b=document.createElement('button');b.textContent=label;b.dataset.view=id;b.onclick=()=>document.querySelector('#tabs [data-view='+id+']').click();inferior.prepend(b);}
for(const b of [...inferior.children])if(['armar','protoboard'].includes(b.dataset.distribution))b.remove();
const menu=menuContextual({lienzos:[$('scheme'),$('board'),rail],status,objeto:(e,teclado)=>{
 if(e.currentTarget===rail){const id=e.target.closest('[data-favorito]')?.dataset.favorito;return id?{tipo:'favorito',id}:{tipo:'riel'};}
 const target=e.target.closest('[data-component],[data-physical],[data-wire],[data-physical-wire]'),id=teclado?selected:target?.dataset.component||target?.dataset.physical||target?.dataset.wire||target?.dataset.physicalWire;
 const p=circuit.components.find(p=>p.id===id),w=(activeView==='board'?circuit.physical?.wires||circuit.wires:circuit.wires).find(w=>w.id===id);
 if(id&&!seleccionMultiple.has(id))choose(id);
 const anchor=teclado&&id?e.currentTarget.querySelector('[data-component="'+id+'"],[data-physical="'+id+'"],[data-wire="'+id+'"],[data-physical-wire="'+id+'"]'):null;
 return {tipo:p?'pieza':w?'cable':'lienzo',p,w,id,rect:anchor?.getBoundingClientRect(),view:e.currentTarget?.id||activeView};
},acciones:{
 quitar:({id})=>catalogoCtl.quitar(id),etiquetas:()=>etiquetasRiel.alternar(),girar:()=>rotate(),voltear:({p})=>{p.flipped=!p.flipped;change();},copiar:()=>editarSeleccion('copiar'),pegar:()=>editarSeleccion('pegar'),duplicar:()=>editarSeleccion('duplicar'),
 borrar:()=>remove(),editar:({p})=>edit(p),
 sonda:({p,w})=>{let key=p?p.id+':0':w?.a;if(w&&circuit.physical?.wires.includes(w)){const red=redFisica(circuit),node=red.holeNode(w.a);key=circuit.components.flatMap(p=>Array.from({length:patillas(p)},(_,i)=>p.id+':'+i)).find(k=>red.node(k)===node);}if(key)alternarSonda(compilar(circuit).node(key));else status('Este cable aún no conecta ninguna terminal para medir');},
 protoboard:()=>document.querySelector('#tabs [data-view=board]').click(),
 fijar:({p})=>catalogoCtl.fijar(p.definition?.id||({led:'LED',ceramic:'CER',electrolytic:'EL',battery:'BAT',generator:'GEN',bench:'PSU'}[p.appearance])||(p.type==='Q'?(p.polarity==='PNP'?'QP':'QN'):p.type)),nodo:({w},e)=>{try{if(circuit.physical?.wires.includes(w)){const svg=$('board'),q=svg.createSVGPoint();q.x=e.clientX;q.y=e.clientY;const at=q.matrixTransform(svg.getScreenCTM().inverse()),h=anclar(at.x,at.y,circuit);if(!h)return status('Agrega el nodo sobre un agujero de la protoboard');if(h===w.a||h===w.b)return;let n=1;while(circuit.physical.wires.some(w=>w.id==='pw'+n))n++;circuit.physical.wires.push({...w,id:'pw'+n,a:h});w.b=h;sincronizar(circuit);physicalChange=true;change();physicalChange=false;}else{cableEnCable(w,point(e));draft=null;$('wire-draft')?.remove();}status('Nodo agregado al cable '+w.id);}catch(error){physicalChange=false;fail(error);}},
 insertar:()=>catalogoCtl.abrir(),todo:()=>editarSeleccion('todo'),centrar:()=> (activeView==='board'?physicalEditor.navigation:schemeNavigation).run('centrar')
}});
// Voltear cambia el dibujo y la geometría de las patillas en la misma operación.
const renderVolteo=render;render=()=>{renderVolteo();for(const p of circuit.components){if(!p.flipped)continue;const body=$('scheme').querySelector('[data-component="'+p.id+'"] .body');if(body)body.setAttribute('transform',body.getAttribute('transform')+' scale(1 -1)');}};
analisisCtl=crearAnalisis({contenedor:instrumentoContenido,svg:$('scheme'),leer:()=>{
 let components=compilar(circuit).components;
 if($('psuEnabled').checked)components=alimentar(components,$('psuSource').value,valor($('psuVoltage').value),valor($('psuLimit').value),MNA).components;
 return {components,dc:result?.dc,esquema:circuit};
},fit:()=>fitPractice(),estado:id=>instrumentosUno.abrir(id)});
const renderAnalisis=render;render=()=>{renderAnalisis();analisisCtl.actualizar();if(analisisCtl.activo)fitPractice();};
const instrumentosAnalisis=instruments;instruments=()=>{instrumentosAnalisis();analisisCtl.actualizar();if(analisisCtl.activo)fitPractice();};
// Lienzo en blanco (R23-UX5): una sola línea discreta, sin tarjetas.
const lienzoVacio=document.createElement('p');lienzoVacio.className='lienzo-vacio';lienzoVacio.textContent='Pulsa A para agregar componentes';$('schemePane').append(lienzoVacio);
const actualizarVacio=()=>{lienzoVacio.hidden=circuit.components.length>0;};
const renderVacio=render;render=()=>{renderVacio();actualizarVacio();};actualizarVacio();
