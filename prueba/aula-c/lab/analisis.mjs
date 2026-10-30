import {MNA} from './motor/mna.mjs';
import {compilar,ruta,terminal} from './circuito.mjs';

// Las caras se recorren sobre segmentos partidos en sus uniones. Los cruces
// entre redes distintas no son uniones eléctricas y no admiten este recorrido.
export function analizarMallas(esquema,simulacion=null,componentes=null){
 const model=compilar(esquema),c=componentes||model.components;
 if(esquema.mode==='board')throw Error('Mallas requiere un esquema plano con coordenadas.');
 if(c.some(p=>!['R','V','I'].includes(p.type)))throw Error('Mallas de CD requiere resistencias y fuentes; no admite elementos reactivos, no lineales ni modelos.');
 if(c.length!==model.components.length||c.some(p=>!model.components.some(q=>q.id===p.id&&q.a===p.a&&q.b===p.b)))throw Error('Mallas requiere que las fuentes y ramas coincidan con el esquema.');
 const segments=[],key=p=>p.join(','),cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
 const add=(a,b,id=null,net=null)=>{if(key(a)!==key(b))segments.push({a,b,id,net,cuts:[a,b]});};
 for(const p of c)add(terminal(esquema,p.id+':0'),terminal(esquema,p.id+':1'),p.id);
 for(const w of esquema.wires){const points=ruta(esquema,w);for(let i=1;i<points.length;i++)add(points[i-1],points[i],null,model.node(w.a));}
 const on=(p,s)=>Math.abs(cross(sub(p,s.a),sub(s.b,s.a)))<1e-7&&sub(p,s.a).reduce((v,x,i)=>v+x*(p[i]-s.b[i]),0)<=1e-7;
 for(let i=0;i<segments.length;i++)for(let j=0;j<i;j++){
  const s=segments[i],t=segments[j],u=sub(s.b,s.a),v=sub(t.b,t.a),d=cross(u,v);let hits=[];
  if(Math.abs(d)>1e-7){const k=cross(sub(t.a,s.a),v)/d,p=[s.a[0]+k*u[0],s.a[1]+k*u[1]];if(on(p,s)&&on(p,t))hits=[p];}
  else hits=[s.a,s.b,t.a,t.b].filter(p=>on(p,s)&&on(p,t));
  for(const p of hits){
   const inner=s=>key(p)!==key(s.a)&&key(p)!==key(s.b);
   if((s.id&&inner(s))||(t.id&&inner(t))||(!s.id&&!t.id&&s.net!==t.net))throw Error('El esquema no es plano: hay ramas o cables que se cruzan sin unión. Reacomoda el trazado para analizar sus mallas.');
   s.cuts.push(p);t.cuts.push(p);
  }
 }
 const edges=[],unique=new Set(),vertices=new Map();
 for(const s of segments){const points=[...new Map(s.cuts.map(p=>[key(p),p])).values()].sort((a,b)=>sub(a,s.a).reduce((v,x,i)=>v+x*(s.b[i]-s.a[i]),0)-sub(b,s.a).reduce((v,x,i)=>v+x*(s.b[i]-s.a[i]),0));
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],k=[key(a),key(b)].sort().join('|');if(unique.has(k)){if(s.id)throw Error('El esquema no es plano: hay ramas superpuestas.');continue;}unique.add(k);const index=edges.length;edges.push({a,b,id:s.id});for(const [p,q,sign] of [[a,b,1],[b,a,-1]]){const k=key(p);if(!vertices.has(k))vertices.set(k,[]);vertices.get(k).push({index,sign,angle:Math.atan2(q[1]-p[1],q[0]-p[0])});}}
 }
 for(const list of vertices.values())list.sort((a,b)=>a.angle-b.angle);
 const used=new Set(),meshes=[];
 for(let index=0;index<edges.length;index++)for(const sign of [1,-1]){
  if(used.has(index+':'+sign))continue;let step={index,sign},points=[],coeff=Object.fromEntries(c.map(p=>[p.id,0]));
  do{const k=step.index+':'+step.sign;if(used.has(k))throw Error('No se pudo cerrar una malla del esquema.');used.add(k);const e=edges[step.index],a=step.sign===1?e.a:e.b,b=step.sign===1?e.b:e.a;points.push(a);if(e.id)coeff[e.id]+=step.sign;const next=vertices.get(key(b)),reverse=next.findIndex(t=>t.index===step.index&&t.sign===-step.sign);step=next[(reverse+next.length-1)%next.length];}while(step.index!==index||step.sign!==sign);
  const area=points.reduce((v,p,i)=>v+cross(p,points[(i+1)%points.length]),0)/2;
  if(area>1e-7&&Object.values(coeff).some(Boolean))meshes.push({points,coeff,area});
 }
 meshes.sort((a,b)=>Math.min(...a.points.map(p=>p[0]))-Math.min(...b.points.map(p=>p[0]))||Math.min(...a.points.map(p=>p[1]))-Math.min(...b.points.map(p=>p[1])));
 const n=meshes.length;if(!n)throw Error('El esquema no tiene mallas cerradas.');
 const B=c.map(p=>meshes.map(m=>m.coeff[p.id])),R=meshes.map((_,i)=>meshes.map((_,j)=>c.reduce((v,p,k)=>v+(p.type==='R'?B[k][i]*p.value*B[k][j]:0),0))),V=meshes.map((_,i)=>-c.reduce((v,p,k)=>v+(p.type==='V'?B[k][i]*dcValue(p):0),0));
 const uf=grupos(Array.from({length:n+1},(_,i)=>i)),sources=c.map((p,k)=>({p,k})).filter(({p})=>p.type==='I');
 for(const {k} of sources){const adjacent=B[k].flatMap((v,i)=>v?[i]:[]);if(adjacent.length===1)adjacent.push(n);if(adjacent.length===2)uf.join(...adjacent);}
 const matrix=[],rhs=[],kinds=[];
 for(const group of new Set(meshes.map((_,i)=>uf.root(i)))){if(group===uf.root(n))continue;const members=meshes.flatMap((_,i)=>uf.root(i)===group?[i]:[]);matrix.push(meshes.map((_,j)=>members.reduce((v,i)=>v+R[i][j],0)));rhs.push(members.reduce((v,i)=>v+V[i],0));kinds.push(members.length>1?'KVL de supermalla':'KVL');}
 for(const {p,k} of sources){matrix.push(B[k]);rhs.push(dcValue(p));kinds.push('Restricción '+p.id);}
 // Eliminación con pivoteo; las restricciones de corriente conservan amperios.
 const a=matrix.map((row,i)=>[...row,rhs[i]]);if(a.length!==n)throw Error('Las fuentes de corriente no determinan un sistema de mallas independiente.');
 for(let j=0;j<n;j++){let pivot=j;for(let i=j+1;i<n;i++)if(Math.abs(a[i][j])>Math.abs(a[pivot][j]))pivot=i;if(Math.abs(a[pivot][j])<1e-12)throw Error('Sistema de mallas singular: revisa las fuentes ideales y las conexiones.');[a[j],a[pivot]]=[a[pivot],a[j]];for(let i=j+1;i<n;i++){const q=a[i][j]/a[j][j];for(let k=j;k<=n;k++)a[i][k]-=q*a[j][k];}}
 const currents=Array(n).fill(0);for(let i=n-1;i>=0;i--)currents[i]=(a[i][n]-currents.reduce((v,x,j)=>v+(j>i?a[i][j]*x:0),0))/a[i][i];
 const dc=simulacion||new MNA(c).dc(),branches=c.map((p,k)=>({id:p.id,coeff:B[k],current:B[k].reduce((v,b,i)=>v+b*currents[i],0)}));
 for(const branch of branches){const actual=dc.currents[branch.id]?.[0];if(!Number.isFinite(actual)||Math.abs(actual-branch.current)>Math.max(1e-9,Math.abs(actual)*.001))throw Error('La corriente de '+branch.id+' no coincide con la simulación: mallas '+branch.current+' A; simulación '+actual+' A.');}
 return {meshes,currents,branches,matrix,rhs,kinds,dc};
}

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
