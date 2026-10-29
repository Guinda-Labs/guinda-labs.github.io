import {redFisica,validarFisico,punto} from './protoboard.mjs';
import {valor,netlist} from './motor/mna.mjs';
import {validarComponente,instanciaSpice,terminalEncapsulado} from './componentes.mjs';
export const patillas=p=>p.definition?.package.pins.length??(p.type==='G'?1:p.type==='Q'?3:2);
export const simbolos={R:'M-40 0H-24L-20-10L-12 10L-4-10L4 10L12-10L20 10L24 0H40',C:'M-40 0H-6M-6-20V20M6-20V20M6 0H40',L:'M-40 0H-30C-30-25-10-25-10 0C-10-25 10-25 10 0C10-25 30-25 30 0H40',V:'M-40 0H-20A20 20 0 1 1 20 0A20 20 0 1 1-20 0M20 0H40M-8 0H8M0-8V8',I:'M-40 0H-20A20 20 0 1 1 20 0A20 20 0 1 1-20 0M20 0H40M-10 0H10L3-7M10 0L3 7',G:'M0-20V0M-20 0H20M-12 8H12M-5 16H5',D:'M-40 0H-15M-15-15L15 0L-15 15ZM15-16V16M15 0H40',Q:'M-40 0H-10M-10-24V24M-10-12L35-30M-10 12L35 30M20 14L28 25L15 24',PNP:'M-40 0H-10M-10-24V24M-10-12L35-30M-10 12L35 30M12 12L0 16L10 25'};
export function formato(v,unidad=''){
 if(!Number.isFinite(v))return '—';
 let prefixes=['p','n','µ','m','','k','M','G'],e=v===0?0:Math.max(-12,Math.min(9,Math.floor(Math.log10(Math.abs(v))/3)*3));
 let n=Number((v/10**e).toPrecision(4));if(Math.abs(n)>=1000&&e<9){n/=1000;e+=3;}
 return `${n} ${prefixes[e/3+4]}${unidad}`.trim();
}
export function etiqueta(p){
 if(p.definition)return p.id+' '+p.definition.name;
 if(p.type==='D')return `${p.id} ${p.appearance==='led'?'LED':'1N4148'}`;
 if(p.type==='Q')return `${p.id} ${p.polarity==='PNP'?'2N3906 PNP':'2N2222 NPN'}`;
 if(p.type==='G')return `${p.id} Tierra`;
 let u={R:'Ω',L:'H',C:'F',V:'V',I:'A'}[p.type];
 if(p.wave?.type==='sin')return `${p.id} ${formato(p.wave.args[1],u)} · seno ${formato(p.wave.args[2],'Hz')}`;
 if(p.wave?.type==='pulse')return `${p.id} ${formato(p.wave.args[0],u)} / ${formato(p.wave.args[1],u)} · pulso ${formato(p.wave.args[6],'s')}`;
 return `${p.id} ${formato(p.value,u)}`;
}
// Coordenadas de vista para selección y sondas; los pendientes viven fuera de la placa.
export function montaje(c){
 let pins={},model=compilar(c);for(let [j,p] of c.components.entries())for(let i=0;i<patillas(p);i++){let h=c.physical?.placements[p.id]?.holes[i],[x,y]=h?punto(h):[980+j*105,80+i*18];pins[p.id+':'+i]={x,y,node:model.node(p.id+':'+i),placed:!!h};}
 return {pins,groups:[],bridges:[],width:1280};
}
export function ejemplo(){return {version:1,mode:'scheme',components:[{id:'V1',type:'V',value:0,wave:{type:'sin',args:[0,1,11862.709]},x:150,y:200,rotation:90},{id:'R1',type:'R',value:220,x:330,y:100,rotation:0},{id:'L1',type:'L',value:.01,x:550,y:100,rotation:0},{id:'C1',type:'C',value:18e-9,x:730,y:200,rotation:90},{id:'G1',type:'G',value:0,x:450,y:320,rotation:0}],wires:[{id:'w1',a:'V1:0',b:'R1:0',points:[[150,160],[150,100],[290,100]]},{id:'w2',a:'R1:1',b:'L1:0',points:[[370,100],[510,100]]},{id:'w3',a:'L1:1',b:'C1:0',points:[[590,100],[730,100],[730,160]]},{id:'w4',a:'C1:1',b:'V1:1',points:[[730,240],[730,320],[150,320],[150,240]]},{id:'w5',a:'G1:0',b:'V1:1',points:[[450,320],[150,320],[150,240]]}]};}
export function compilar(c){let physical=c.mode==='board'?redFisica(c):null;let parent=new Map(),find=a=>{if(!parent.has(a))parent.set(a,a);if(parent.get(a)!==a)parent.set(a,find(parent.get(a)));return parent.get(a)},join=(a,b)=>parent.set(find(a),find(b));for(let p of c.components){for(let i=0;i<patillas(p);i++)find(p.id+':'+i);if(p.type==='G')join(p.id+':0','0');}for(let w of physical?.wires||c.wires)join(w.a,w.b);if(!physical){let at=new Map();for(let p of c.components)for(let i=0;i<patillas(p);i++){let k=p.id+':'+i,pos=terminal(c,k).join(',');if(at.has(pos))join(k,at.get(pos));else at.set(pos,k);}for(let w of c.wires)for(let k of [w.a,w.b])if(libre(k)&&at.has(k.slice(1)))join(k,at.get(k.slice(1)));}if(physical?.ground)join(physical.ground,'0');let names=new Map([[find('0'),'0']]),count=0,node=a=>{let r=find(a);if(!names.has(r))names.set(r,'n'+(++count));return names.get(r)};let components=c.components.filter(p=>p.type!=='G').map(p=>({...p,a:node(p.id+':0'),b:node(p.id+':1'),...(p.type==='Q'?{e:node(p.id+':2')}: {}),...(p.definition?{nodes:p.definition.package.pins.map((_,i)=>node(p.id+':'+i))}:{})}));return {components,node};}
export function texto(c){return compilar(c).components.map(p=>p.definition?instanciaSpice(p.definition,p.id,p.nodes)+'\n'+p.definition.spice.text:`${p.id} ${p.a} ${p.b} ${p.type==='D'?'1N4148 Is='+(p.Is??2.52e-9)+' n='+(p.n??1.752):p.type==='Q'?p.e+' '+(p.polarity==='PNP'?'2N3906':'2N2222'):p.wave?p.wave.type.toUpperCase()+'('+p.wave.args.join(' ')+')':p.value}`).join('\n');}
export function editar(p,s){if(p.definition)throw Error('Edite el modelo desde el editor de componentes');if(['D','Q'].includes(p.type)){let [Is,n,beta]=s.split(/[ ,]+/).map(Number);if(!(Is>0&&n>0&&(p.type!=='Q'||beta>0)))throw Error('Use Is n [beta], positivos');Object.assign(p,{Is,n,...(p.type==='Q'?{beta}:{})});return;}let parsed=netlist(`${p.type}1 a 0 ${s}`)[0];if('RCL'.includes(p.type)&&parsed.value<=0)throw Error('El valor debe ser positivo');p.value=parsed.value;p.wave=parsed.wave;}
export function amplificador(){
 let specs=[['V1','V',12,80,130,270],['V2','V',0,180,280,270],['R1','R',47000,350,130,90],['R2','R',10000,350,300,90],['RC','R',2200,555,130,90],['RE','R',1000,555,300,90],['CE','C',100e-6,700,300,90],['C1','C',1e-6,260,220,0],['C2','C',10e-6,740,190,0],['RL','R',10000,860,280,90],['Q1','Q',0,520,220,0],['G1','G',0,450,380,0]],nets=[['V1:0','R1:0','RC:0'],['V1:1','V2:1','R2:1','RE:1','CE:1','RL:1','G1:0'],['V2:0','C1:0'],['C1:1','R1:1','R2:0','Q1:1'],['RC:1','Q1:0','C2:0'],['RE:0','Q1:2','CE:0'],['C2:1','RL:0']],k=0;
 let c={version:1,mode:'scheme',components:specs.map(([id,type,value,x,y,rotation])=>({id,type,value:id==='C1'?10e-6:value,x,y,rotation:type==='V'?90:rotation,...(id==='V2'?{wave:{type:'sin',args:[0,.01,1000]}}:{}),...(type==='Q'?{polarity:'NPN'}:{})})),wires:nets.flatMap(ns=>ns.slice(1).map(b=>({id:'w'+(++k),a:ns[0],b})))};
 let bends=[[[80,40],[350,40]],[[80,40],[555,40]],[[80,370],[180,370]],[[80,370],[350,370]],[[80,370],[555,370]],[[80,370],[700,370]],[[80,370],[860,370]],[[80,380]],[[180,220]],[[350,220]],[[350,220]],[],[],[[620,170],[620,190]],[],[[555,250],[700,250]],[[860,190]]];
 c.wires.forEach((w,i)=>{w.points=[terminal(c,w.a),...bends[i],terminal(c,w.b)];});return c;
}
export function terminal(c,key){let [id,i]=key.split(':'),p=c.components.find(p=>p.id===id),a=p.rotation*Math.PI/180,[x,y]=p.schematic?.pins?.[+i]??(p.definition?terminalEncapsulado(p.definition.package,+i):p.type==='Q'?[[35,-30],[-40,0],[35,30]][+i]:[p.type==='G'?0:(+i?40:-40),0]);return [Math.round(p.x+x*Math.cos(a)-y*Math.sin(a)),Math.round(p.y+x*Math.sin(a)+y*Math.cos(a))];}
// Extremos de cable: terminal «R1:0» o punto libre «@x,y» (uniones y cables trazados a mano, como en xschem).
export const libre=k=>/^@-?\d+,-?\d+$/.test(k);
export function extremo(c,k){return libre(k)?k.slice(1).split(',').map(Number):terminal(c,k);}
// Cable manual: conserva sus vértices y, si una terminal se movió, la alcanza con un codo horizontal-vertical.
export function ajustar(points,a,b){let p=points.map(q=>[...q]);if(p[0][0]!==a[0]||p[0][1]!==a[1])p=[a,[p[0][0],a[1]],...p];let z=p.at(-1);if(z[0]!==b[0]||z[1]!==b[1])p.push([b[0],z[1]],b);p=p.filter((q,i)=>!i||q[0]!==p[i-1][0]||q[1]!==p[i-1][1]);return p.filter((q,i)=>!i||i===p.length-1||!((p[i-1][0]===q[0]&&q[0]===p[i+1][0])||(p[i-1][1]===q[1]&&q[1]===p[i+1][1])));}
// Visibility graph: symbols are closed obstacles, including the endpoint bodies.
// Terminal leads remain outside these boxes and may turn without entering a body.
export function ruta(c,w){
 if(w.points!==undefined&&(!Array.isArray(w.points)||w.points.length>200||w.points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))||w.points.some((p,i)=>i&&p[0]!==w.points[i-1][0]&&p[1]!==w.points[i-1][1])))throw Error('Ruta de cable inválida: '+w.id);
 if(w.manual&&w.points?.length>1)return ajustar(w.points,extremo(c,w.a),extremo(c,w.b));
 if(w.points?.length&&w.points[0].every((v,i)=>v===extremo(c,w.a)[i])&&w.points.at(-1).every((v,i)=>v===extremo(c,w.b)[i]))return w.points;
 let a=extremo(c,w.a),b=extremo(c,w.b),boxes=c.components.filter(p=>p.type!=='G').map(p=>{let vertical=p.rotation%180!==0,rx=p.type==='Q'?24:vertical?27:28,ry=p.type==='Q'?25:vertical?28:27;return [p.x-rx,p.y-ry,p.x+rx,p.y+ry];});
 let xs=[...new Set([a[0],b[0],20,940,...boxes.flatMap(r=>[r[0]-10,r[2]+10])])].sort((a,b)=>a-b),ys=[...new Set([a[1],b[1],20,390,...boxes.flatMap(r=>[r[1]-10,r[3]+10])])].sort((a,b)=>a-b);
 let clear=(p,q)=>!boxes.some(([l,t,r,d])=>p[0]===q[0]?p[0]>l&&p[0]<r&&Math.max(p[1],q[1])>t&&Math.min(p[1],q[1])<d:p[1]>t&&p[1]<d&&Math.max(p[0],q[0])>l&&Math.min(p[0],q[0])<r);
 let key=(x,y)=>x+','+y,start=key(...a),end=key(...b),queue=[[0,a]],dist=new Map([[start,0]]),prev=new Map();
 while(queue.length){queue.sort((a,b)=>b[0]-a[0]);let [cost,p]=queue.pop(),k=key(...p);if(cost!==dist.get(k))continue;if(k===end)break;let xi=xs.indexOf(p[0]),yi=ys.indexOf(p[1]);for(let q of [[xs[xi-1],p[1]],[xs[xi+1],p[1]],[p[0],ys[yi-1]],[p[0],ys[yi+1]]]){if(q.some(v=>v===undefined)||!clear(p,q))continue;let next=key(...q),d=cost+Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])+1;if(d<(dist.get(next)??Infinity)){dist.set(next,d);prev.set(next,p);queue.push([d,q]);}}}
 if(!dist.has(end))throw Error(`No hay ruta libre para ${w.id}: ${w.a} → ${w.b}`);
 let points=[b],p=b;while(key(...p)!==start){p=prev.get(key(...p));points.unshift(p);}return points.filter((p,i)=>!i||i===points.length-1||!((points[i-1][0]===p[0]&&p[0]===points[i+1][0])||(points[i-1][1]===p[1]&&p[1]===points[i+1][1])));
}
export function validar(c){if(c?.version!==1||!Array.isArray(c.components)||!Array.isArray(c.wires)||c.components.length>100||c.wires.length>300)throw Error('JSON de circuito inválido o demasiado grande');let ids=new Set(),pins=new Set();for(let p of c.components){if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(p.id)||ids.has(p.id)||!'RCLVIGDQX'.includes(p.type)||p.type.length!==1||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.rotation)||!Number.isFinite(p.value))throw Error('Componente inválido');if(p.type==='X')validarComponente(p.definition);else if(p.definition)throw Error('Modelo sólo permitido en componentes X');ids.add(p.id);for(let i=0;i<patillas(p);i++)pins.add(p.id+':'+i);if('RCL'.includes(p.type)&&p.value<=0)throw Error('Pasivo no positivo');for(let k of ['Is','n','beta'])if(p[k]!==undefined&&!(Number.isFinite(p[k])&&p[k]>0))throw Error('Modelo inválido: '+k);if(p.type==='Q'&&p.polarity!==undefined&&!['NPN','PNP'].includes(p.polarity))throw Error('Polaridad inválida');if(p.wave&&(!['sin','pulse'].includes(p.wave.type)||!Array.isArray(p.wave.args)||!p.wave.args.every(Number.isFinite)))throw Error('Fuente inválida');}for(let w of c.wires){if(!/^w\d+$/.test(w.id)||ids.has(w.id)||!(pins.has(w.a)||libre(w.a))||!(pins.has(w.b)||libre(w.b))||w.a===w.b)throw Error('Cable inválido');ids.add(w.id);}return validarFisico(c);}
export function bandas(v){let colors=['#151515','#814624','#e84949','#f39639','#e5d453','#4caa70','#4985cf','#a169bf','#a0a0a0','#eeeeee'];let e=Math.floor(Math.log10(v))-1,d=Math.round(v/10**e);if(d>=100){d=10;e++;}return [colors[Math.floor(d/10)],colors[d%10],e===-1?'#c9aa53':e===-2?'#bcc0c4':colors[e]||'#c9aa53','#c9aa53'];}
