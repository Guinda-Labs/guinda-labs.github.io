import {MNA} from './motor/mna.mjs';

export function admitirCD(c){
 const invalid=c.filter(p=>!['R','C','L','V','I'].includes(p.type));
 if(invalid.length)throw Error('Análisis de CD inactivo: hay elementos no lineales o modelos no admitidos ('+invalid.map(p=>p.id).join(', ')+').');
 return c.some(p=>'LC'.includes(p.type))?'Análisis de CD: L se sustituye por un corto; C, por un circuito abierto.':'';
}
const dcValue=c=>c.type==='L'?0:c.wave?.args[0]??c.value;
function grupos(nodes){const parent=new Map(nodes.map(n=>[n,n]));const root=n=>parent.get(n)===n?n:root(parent.get(n));return {root,join(a,b){a=root(a);b=root(b);if(a===b)return false;parent.set(a,b);return true;}};}

export function analizarNodos(c,simulacion=null){
 const aviso=admitirCD(c),motor=new MNA(c);motor.captureSystem=true;
 const calculado=motor.dc(),s=motor.system,nodes=s.nodes,links=c.filter(p=>'VL'.includes(p.type)),uf=grupos(['0',...nodes]),tree=[];
 for(const p of links)if(uf.join(p.a,p.b))tree.push(p);
 // Una fuente a tierra fija todos los potenciales conectados por fuentes ideales.
 const known={'0':0};let pending=true;
 while(pending){pending=false;for(const p of tree){if(known[p.a]!==undefined&&known[p.b]===undefined){known[p.b]=known[p.a]-dcValue(p);pending=true;}else if(known[p.b]!==undefined&&known[p.a]===undefined){known[p.a]=known[p.b]+dcValue(p);pending=true;}}}
 const unknown=nodes.filter(n=>known[n]===undefined),groups=[...new Set(unknown.map(uf.root))],G=[],I=[],kinds=[];
 for(const group of groups){const members=nodes.filter(n=>uf.root(n)===group),row=nodes.map((_,j)=>members.reduce((v,n)=>v+s.A[nodes.indexOf(n)][j],0)),rhs=members.reduce((v,n)=>v+s.z[nodes.indexOf(n)],0)-nodes.reduce((v,n,j)=>v+(known[n]===undefined?0:row[j]*known[n]),0);
  G.push(unknown.map(n=>row[nodes.indexOf(n)]*1000));I.push(rhs*1000);kinds.push(members.length>1?'KCL del supernodo':'KCL');
 }
 for(const p of tree)if(known[p.a]===undefined&&known[p.b]===undefined){G.push(unknown.map(n=>(n===p.a?1:0)-(n===p.b?1:0)));I.push(dcValue(p));kinds.push('Restricción (V)');}
 const dc=simulacion||calculado;
 for(const n of nodes){const actual=dc.voltages[n]?.[0],expected=calculado.voltages[n][0];if(!Number.isFinite(actual)||Math.abs(actual-expected)>Math.max(1e-7,Math.abs(expected)*.001))throw Error('El análisis de CD no coincide con la simulación en el nodo '+n+'.');}
 return {nodes,unknown,known,G,I,kinds,dc,aviso,system:s};
}

export function thevenin(c,A,B,carga=null){
 admitirCD(c);const nodes=['0',...new Set(c.flatMap(p=>[p.a,p.b]))];
 if(A===B||!nodes.includes(A)||!nodes.includes(B))throw Error('Elige dos nodos distintos para A y B.');
 const load=c.find(p=>p.id===carga);
 if(carga&&(!load||load.type!=='R'||!((load.a===A&&load.b===B)||(load.a===B&&load.b===A))))throw Error('La carga debe ser una resistencia entre A y B.');
 const open=c.filter(p=>p.id!==carga),oc=new MNA(open).dc(),Vth=oc.voltages[A][0]-oc.voltages[B][0];
 // Contraer cortos exactos evita resistencias artificiales y lazos de fuentes de 0 V.
 const uf=grupos(nodes);for(const p of open)if('VL'.includes(p.type))uf.join(p.a,p.b);
 const a=uf.root(A),b=uf.root(B);let Rth=0;
 if(a!==b){const resistors=open.filter(p=>p.type==='R').map(p=>({...p,a:uf.root(p.a),b:uf.root(p.b)})).filter(p=>p.a!==p.b),seen=new Set([a]);let changed=true;
  while(changed){changed=false;for(const p of resistors)if(seen.has(p.a)!==seen.has(p.b)){seen.add(p.a);seen.add(p.b);changed=true;}}
  if(!seen.has(b))Rth=Infinity;
  else {const rename=n=>n===b?'0':'t_'+n,passive=resistors.filter(p=>seen.has(p.a)).map(p=>({...p,a:rename(p.a),b:rename(p.b)}));let id='I_prueba';while(c.some(p=>p.id===id))id+='_';passive.push({id,type:'I',a:'0',b:rename(a),value:.001});Rth=new MNA(passive).dc().voltages[rename(a)][0]/.001;}
 }
 const In=Rth===0?null:Vth/Rth,full=load?new MNA(c).dc():null;
 return {A,B,carga,Vth,Rth,In,oc,load,full,current:load?Vth/(Rth+load.value):null};
}
