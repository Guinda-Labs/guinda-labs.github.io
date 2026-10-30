// La magnitud ilustra corriente; no representa velocidad física de electrones.
export function velocidadCorriente(current,max,speed=.5){
 if(!Number.isFinite(current)||!Number.isFinite(max)||Math.abs(current)<=1e-12||max<=1e-12)return 0;
 return Math.sign(current)*Math.min(60,Math.max(6,40*Math.sqrt(Math.abs(current)/max)))*speed;
}
export function preferenciasCorriente(storage,guardar){
 const defecto={speed:.5,paused:false};
 try{
  const s=storage(),p=guardar??JSON.parse(s?.getItem('lab.corriente.v1')||'null');
  const value={speed:[.25,.5,1,2].includes(p?.speed)?p.speed:.5,paused:p?.paused===true};
  if(guardar)s?.setItem('lab.corriente.v1',JSON.stringify(value));
  return value;
 }catch(error){console.warn('[AULA-C corriente: almacenamiento]',error.message);return guardar??defecto;}
}
export function posicionMenu(button,width,height,viewportWidth,viewportHeight){
 const margin=8,w=Math.min(width,Math.max(0,viewportWidth-2*margin)),h=Math.min(height,Math.max(0,viewportHeight-2*margin));
 return {left:Math.max(margin,Math.min(button.right-w,viewportWidth-margin-w)),top:Math.max(margin,Math.min(button.bottom+4,viewportHeight-margin-h)),width:w,maxHeight:viewportHeight-2*margin};
}
// Un único instante interpolado conserva LCK: todas las corrientes usan el mismo peso.
export function muestraCorriente(rows,t){
 if(!rows?.length)return null;
 let lo=0,hi=rows.length-1;
 if(t<=rows[lo].t)return rows[lo];if(t>=rows[hi].t)return rows[hi];
 while(hi-lo>1){const mid=(lo+hi)>>1;if(rows[mid].t<=t)lo=mid;else hi=mid;}
 const a=rows[lo],b=rows[hi],u=(t-a.t)/(b.t-a.t),mix=(x,y)=>Array.isArray(x)?x.map((v,i)=>mix(v,y[i])):x+(y-x)*u;
 const field=key=>Object.fromEntries(Object.entries(a[key]??{}).map(([id,v])=>[id,mix(v,b[key][id])]));
 return {t,voltages:field('voltages'),currents:field('currents'),terminalCurrents:field('terminalCurrents')};
}
export function escalaTiempo(circuit){
 const f=Math.max(0,...circuit.components.map(p=>p.wave?.type==='sin'?p.wave.args[2]:p.wave?.type==='pulse'?1/p.wave.args[6]:0).filter(Number.isFinite));
 return f>2?2*f:1;
}
// Corte orientado a→b del árbol de cables: incluye todas las patillas del nodo.
// En lazos ideales el reparto es indeterminado y se oculta la animación.
function terminalesCorte(w,model,wires){
 let seen=new Set([w.a]),todo=[w.a];
 while(todo.length){let a=todo.pop();for(let edge of wires){if(edge===w)continue;let b=edge.a===a?edge.b:edge.b===a?edge.a:null;if(b&&!seen.has(b)){seen.add(b);todo.push(b);}}}
 if(seen.has(w.b))return [];
 return model.components.flatMap(p=>(p.nodes??(p.type==='Q'?[p.a,p.b,p.e]:[p.a,p.b])).flatMap((_,i)=>seen.has(p.id+':'+i)?[{id:p.id,i}]:[]));
}
function sumarCorte(terminals,r){return terminals.reduce((sum,{id,i})=>{const value=r.terminalCurrents?.[id]?.[i]??((r.currents[id]?.[0]??0)*(i===0?1:-1));return sum-(Array.isArray(value)?value[0]:value);},0);}
export function corrienteCable(w,r,model,wires){return sumarCorte(terminalesCorte(w,model,wires),r);}
export function flujosCorriente(model,wires){
 const cuts=wires.map(w=>[w.id,terminalesCorte(w,model,wires)]);
 return row=>new Map(cuts.map(([id,terminals])=>[id,sumarCorte(terminals,row)]));
}
export function medir(rows,node){
 let y=rows.map(r=>r.voltages[node][0]),min=Math.min(...y),max=Math.max(...y),level=(min+max)/2,cross=[];
 for(let i=1;i<y.length;i++)if(y[i-1]<level&&y[i]>=level)cross.push(rows[i-1].t+(rows[i].t-rows[i-1].t)*(level-y[i-1])/(y[i]-y[i-1]));
 let period=cross.length>1?(cross.at(-1)-cross[0])/(cross.length-1):NaN;
 return {vpp:max-min,vrms:Math.sqrt(y.reduce((s,v)=>s+v*v,0)/y.length),frequency:1/period,cross};
}
export function desfase(rows,a,b){let x=medir(rows,a),y=medir(rows,b);if(!x.cross.length||!y.cross.length||!Number.isFinite(x.frequency))return NaN;let d=-360*(y.cross.at(-1)-x.cross.at(-1))*x.frequency;return ((d+180)%360+360)%360-180;}
export const pasos125=Array.from({length:16},(_,i)=>i-12).flatMap(e=>[1,2,5].map(n=>Number((n*10**e).toPrecision(12))));
export function paso125(v){if(!(Number.isFinite(v)&&v>0))throw Error('Escala positiva requerida');return pasos125.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a);}
export function division(v,unit){let e=Math.max(-12,Math.min(3,Math.floor(Math.log10(v)/3)*3)),prefix={[-12]:'p',[-9]:'n',[-6]:'µ',[-3]:'m',0:'',3:'k'};return `${Number((v/10**e).toPrecision(10))} ${prefix[e]}${unit}/div`;}
export function autoescala(rows,nodes,segura=false){let peak=0;for(const r of rows)for(const n of nodes)peak=Math.max(peak,Math.abs(r.voltages[n][0]));if(!segura)return paso125(peak?peak/3.4:1);return peak?(pasos125.find(v=>peak/v<=3.6)??pasos125.at(-1)):1;}
export function barrer(components,{id,desde,hasta,pasos,frequency,input,output},MNA){
 if(!components.some(c=>c.id===id&&['R','C','L'].includes(c.type))||!(desde>0&&hasta>desde&&Number.isInteger(pasos)&&pasos>=2&&pasos<=50&&frequency>0)||!Number.isFinite(hasta))throw Error('Barrido inválido: componente R/C/L, rango positivo y 2–50 pasos');
 return Array.from({length:pasos},(_,i)=>{let value=desde+(hasta-desde)*i/(pasos-1),copy=components.map(c=>({...c,...(c.id===id?{value}:{})})),r=new MNA(copy).ac({start:frequency,stop:frequency*1.001,points:2})[0],a=r.voltages[input],b=r.voltages[output];if(!a||!b||Math.hypot(...a)<1e-15)throw Error('Sondas inválidas o entrada nula');return {value,gain:Math.hypot(...b)/Math.hypot(...a)};});
}
export function alimentar(components,id,voltage,limit,MNA){
 if(!(Number.isFinite(voltage)&&voltage>=0&&Number.isFinite(limit)&&limit>0)||!components.some(c=>c.id===id&&c.type==='V'&&!c.wave))throw Error('Fuente DC, voltaje ≥ 0 y límite > 0 requeridos');
 let solve=v=>{let copy=components.map(c=>c.id===id?{...c,value:v}:c),dc=new MNA(copy).dc();return {components:copy,dc,current:Math.abs(dc.currents[id][0]),voltage:v};},r=solve(voltage);
 if(r.current<=limit)return {...r,limited:false};let lo=0,hi=voltage;r=solve(0);if(r.current>limit)throw Error('Otra fuente impide limitar la corriente');for(let i=0;i<35;i++){let mid=(lo+hi)/2,q=solve(mid);if(q.current>limit)hi=mid;else{lo=mid;r=q;}}return {...r,limited:true};
}
export function canal(rows,node,coupling='DC'){
 let mean=coupling==='AC'?rows.reduce((s,r)=>s+r.voltages[node][0],0)/rows.length:0;
 return rows.map(r=>({...r,voltages:{...r.voltages,[node]:[r.voltages[node][0]-mean,0]}}));
}
export function ganancia(rows,a,b){let input=medir(rows,a).vpp,output=medir(rows,b).vpp,g=input>1e-15?output/input:NaN;return {vv:g,db:20*Math.log10(g),phase:desfase(rows,a,b)};}
export function disparo(rows,node,level=0,edge='up'){for(let i=1;i<rows.length;i++){let a=rows[i-1].voltages[node][0],b=rows[i].voltages[node][0];if(edge==='up'?a<level&&b>=level:a>level&&b<=level)return rows[i-1].t+(rows[i].t-rows[i-1].t)*(level-a)/(b-a);}return rows[0]?.t??0;}
export function resistencia(components,plus,minus,MNA){
 if(plus===minus)return 0;
 if(components.some(c=>['D','Q'].includes(c.type)))throw Error('Ω disponible para redes lineales sin alimentación; retire semiconductores');
 // Fuentes independientes anuladas: tensión en corto, corriente abierta.
 let passive=components.filter(c=>c.type!=='I').map(c=>c.type==='V'?{...c,value:0,wave:undefined}:c);
 let m=new MNA([...passive,{id:'I_OHM',type:'I',a:minus,b:plus,value:1}]),r=m.dc();return r.voltages[plus][0]-r.voltages[minus][0];
}
