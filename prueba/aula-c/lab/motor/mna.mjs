// Complejos [real, imaginario]; todas las corrientes van de a hacia b.
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]], neg=a=>[-a[0],-a[1]], mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]], div=(a,b)=>{let d=b[0]**2+b[1]**2;return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]};
export function valor(s){if(typeof s==='number')return s;let m=String(s).trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([kmunµM]?)(?:Ω|H|F|V|A)?$/);if(!m)throw Error('Valor inválido: '+s);return Number(m[1])*({'':1,k:1e3,m:1e-3,u:1e-6,'µ':1e-6,n:1e-9,M:1e6}[m[2]]);}
export function netlist(text){return text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('*')&&!l.startsWith('.')).map(l=>{let [id,a,b,...v]=l.split(/\s+/),type=id[0].toUpperCase(),s=v.join(' '),w=s.match(/^(SIN|PULSE)\((.*)\)$/i);if(!'RCLVI'.includes(type))throw Error('Componente no admitido: '+id);return {id,type,a,b,value:w?0:valor(s.replace(/^DC\s+/i,'')),wave:w?{type:w[1].toLowerCase(),args:w[2].trim().split(/[ ,]+/).map(valor)}:undefined};});}
function signal(c,t){let w=c.wave;if(!w)return c.value;if(w.type==='sin'){let [offset=0,amplitude=1,f=1000,delay=0,phase=0]=w.args;return offset+amplitude*Math.sin(2*Math.PI*f*Math.max(0,t-delay)+phase*Math.PI/180);}let [lo=0,hi=1,delay=0,rise=0,fall=0,width=1,period=2]=w.args,p=(t-delay)%period;if(t<delay)return lo;if(p<rise)return lo+(hi-lo)*p/rise;if(p<rise+width)return hi;if(p<rise+width+fall)return hi+(lo-hi)*(p-rise-width)/fall;return lo;}
function solve(A,z){let n=z.length;for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.hypot(...A[i][k])>Math.hypot(...A[p][k]))p=i;if(Math.hypot(...A[p][k])<1e-22)throw Error('Matriz singular: revise tierra, nodos flotantes o fuentes ideales incompatibles');[A[k],A[p]]=[A[p],A[k]];[z[k],z[p]]=[z[p],z[k]];for(let i=k+1;i<n;i++){let q=div(A[i][k],A[k][k]);for(let j=k;j<n;j++)A[i][j]=add(A[i][j],neg(mul(q,A[k][j])));z[i]=add(z[i],neg(mul(q,z[k])));}}let x=Array(n);for(let i=n-1;i>=0;i--){let s=z[i];for(let j=i+1;j<n;j++)s=add(s,neg(mul(A[i][j],x[j])));x[i]=div(s,A[i][i]);}return x;}
export class Motor {dc(){throw Error('Implementar DC');} ac(){throw Error('Implementar AC');} transitorio(){throw Error('Implementar transitorio');}}
export class Ngspice extends Motor {
 constructor(c){super();if(!c)throw Error('Circuito pendiente');this.c=c;}
 async motor(){throw Error('Use MotorNgspiceWeb para ngspice en web');}
 async dc(){return (await this.motor()).dc();}async ac(o){return (await this.motor()).ac(o);}async transitorio(o){return (await this.motor()).transitorio(o);}
}
class Lineal extends Motor {
 constructor(circuit){super();this.c=typeof circuit==='string'?netlist(circuit):circuit;let ids=new Set();for(let c of this.c){if(ids.has(c.id)||!'RCLVI'.includes(c.type)||!Number.isFinite(c.value)||('RCL'.includes(c.type)&&c.value<=0))throw Error('Componente inválido: '+c.id);if(c.wave){let {type,args}=c.wave;if(!['sin','pulse'].includes(type)||!Array.isArray(args)||!args.every(Number.isFinite)||(type==='sin'&&(args.length<3||args[2]<0))||(type==='pulse'&&(args.length<7||args[3]<0||args[4]<0||args[5]<0||args[6]<=0)))throw Error('Señal inválida: '+c.id);}ids.add(c.id);}}
 step(mode,{f=0,t=0,dt=1,state={}}={}){let nodes=[...new Set([...this.c.flatMap(c=>[c.a,c.b]),...(this.extraNodes||[])])].filter(n=>n!=='0'),branches=this.c.filter(c=>c.type==='V'||c.type==='L'),n=nodes.length+branches.length,A=Array.from({length:n},()=>Array.from({length:n},()=>[0,0])),z=Array.from({length:n},()=>[0,0]),idx=a=>nodes.indexOf(a),stamp=(i,j,v)=>{if(i>=0&&j>=0)A[i][j]=add(A[i][j],v)},rhs=(i,v)=>{if(i>=0)z[i]=add(z[i],v)},ys={};
 for(let {terminals,v,i,jac} of this.extra||[])for(let k=0;k<terminals.length;k++){let eq=i[k];for(let j=0;j<terminals.length;j++){stamp(idx(terminals[k]),idx(terminals[j]),[jac[j][k],0]);eq-=jac[j][k]*v[j];}if(mode!=='ac')rhs(idx(terminals[k]),[-eq,0]);}
 for(let c of this.c){let a=idx(c.a),b=idx(c.b),y=[0,0],old=state[c.id]||{v:0,i:0};if(c.type==='R')y=[1/c.value,0];if(c.type==='C')y=mode==='ac'?[0,2*Math.PI*f*c.value]:mode==='tran'?[c.value/dt,0]:[0,0];if(c.type==='R'||c.type==='C'){ys[c.id]=y;stamp(a,a,y);stamp(b,b,y);stamp(a,b,neg(y));stamp(b,a,neg(y));if(c.type==='C'&&mode==='tran'){rhs(a,[y[0]*old.v,0]);rhs(b,[-y[0]*old.v,0]);}}
 if(c.type==='V'||c.type==='L'){let k=nodes.length+branches.indexOf(c);stamp(a,k,[1,0]);stamp(b,k,[-1,0]);stamp(k,a,[1,0]);stamp(k,b,[-1,0]);if(c.type==='V')rhs(k,[mode==='ac'?(c.ac??c.wave?.args[1]??c.value):mode==='tran'?signal(c,t):c.wave?.args[0]??c.value,0]);else if(mode==='ac')stamp(k,k,[0,-2*Math.PI*f*c.value]);else if(mode==='tran'){stamp(k,k,[-c.value/dt,0]);rhs(k,[-c.value/dt*old.i,0]);}}
 if(c.type==='I'){let v=mode==='ac'?(c.ac??c.wave?.args[1]??c.value):mode==='tran'?signal(c,t):c.wave?.args[0]??c.value;rhs(a,[-v,0]);rhs(b,[v,0]);}}
 // Guardar antes de la eliminación: el panel deriva sus ecuaciones de los mismos sellos.
 if(mode==='dc'&&this.captureSystem)this.system={nodes:[...nodes],branches:branches.map(c=>c.id),A:A.map(r=>r.map(v=>v[0])),z:z.map(v=>v[0])};
 let x=solve(A,z),voltages={'0':[0,0]},currents={};nodes.forEach((a,i)=>voltages[a]=x[i]);for(let c of this.c){let v=add(voltages[c.a],neg(voltages[c.b]));currents[c.id]=branches.includes(c)?x[nodes.length+branches.indexOf(c)]:c.type==='I'?[mode==='tran'?signal(c,t):mode==='ac'?(c.ac??c.wave?.args[1]??c.value):c.wave?.args[0]??c.value,0]:mul(ys[c.id],c.type==='C'&&mode==='tran'?add(v,[-(state[c.id]?.v||0),0]):v);}return {t,f,voltages,currents};}
 dc(){return this.step('dc');}
 ac({start=10,stop=1e6,points=161}={}){if(!(start>0&&stop>start&&points>=2&&points<=2000))throw Error('Barrido AC inválido');return Array.from({length:points},(_,i)=>this.step('ac',{f:start*(stop/start)**(i/(points-1))}));}
 transitorio({dt=1e-6,stop=.002,inicial='dc'}={}){if(!(dt>0&&stop>0&&stop/dt<=50000))throw Error('Paso inválido o más de 50000 pasos');let state={},out=[];if(inicial==='dc'){let d=this.dc();for(let c of this.c)state[c.id]={v:d.voltages[c.a][0]-d.voltages[c.b][0],i:d.currents[c.id][0]};}for(let k=0;k<=Math.floor(stop/dt);k++){let r=this.step('tran',{t:k*dt,dt,state});out.push(r);for(let c of this.c)state[c.id]={v:r.voltages[c.a][0]-r.voltages[c.b][0],i:r.currents[c.id][0]};}return out;}
}
// Corrientes terminales de Ebers-Moll: a=C, b=B, e=E; D: a=ánodo.
export function semiconductor(c,v){
 const Is=c.Is??(c.type==='D'?2.52e-9:1e-14),n=c.n??(c.type==='D'?1.752:1),vt=8.617333262e-5*((c.tempC??25)+273.15)*n;
 if(!(Is>0&&n>0))throw Error('Is y n deben ser positivos: '+c.id);
 const junction=x=>Is*Math.expm1(Math.max(-80,Math.min(40,x/vt)));
 if(c.type==='D'){let i=junction(v[0]-v[1]);return [i,-i];}
 let s=c.polarity==='PNP'?-1:1,be=junction(s*(v[1]-v[2])),bc=junction(s*(v[1]-v[0])),af=(c.beta??100)/(1+(c.beta??100)),ar=.5;
 let ic=s*(af*be-bc),ie=s*(-be+ar*bc);return [ic,-ic-ie,ie];
}
export class MNA extends Lineal {
 constructor(circuit){
  let c=typeof circuit==='string'?circuit.split(/\r?\n/).flatMap(l=>{
   let p=l.trim().split(/\s+/);if(!/^[DQ]/i.test(p[0]))return netlist(l);
   let [id,a,b,...rest]=p,type=id[0].toUpperCase(),e=type==='Q'?rest.shift():undefined,model=rest.shift();
   let params=Object.fromEntries(rest.map(s=>{let [k,v]=s.split('=');return [k,Number(v)];}));
   return [{id,type,a,b,e,value:0,polarity:model==='2N3906'||model==='PNP'?'PNP':'NPN',...params}];
  }):circuit;
  let ids=new Set();for(let p of c){if(ids.has(p.id))throw Error('Componente duplicado: '+p.id);ids.add(p.id);if(['D','Q'].includes(p.type)){for(let k of ['Is','n','beta'])if(p[k]!==undefined&&!(Number.isFinite(p[k])&&p[k]>0))throw Error('Modelo inválido: '+p.id+' '+k);if(p.type==='Q'&&(!p.e||p.polarity&&!['NPN','PNP'].includes(p.polarity)))throw Error('BJT inválido: '+p.id);}}
  super(c.filter(p=>!['D','Q'].includes(p.type)));this.c=c;this.nonlinear=c.filter(p=>['D','Q'].includes(p.type));this.guess={};
 }
 step(mode,opts={}){
  if(!this.nonlinear.length)return super.step(mode,opts);
  let nodes=[...new Set(this.c.flatMap(c=>c.type==='Q'?[c.a,c.b,c.e]:[c.a,c.b]))],guess={...this.guess},iterations=mode==='ac'?1:250;
  if(mode==='ac')guess=this.dc().voltages;
  for(let iteration=0;iteration<iterations;iteration++){
   let base=this.c.filter(c=>!['D','Q'].includes(c.type)),stamps=[];
   for(let c of this.nonlinear){let terminals=c.type==='Q'?[c.a,c.b,c.e]:[c.a,c.b],v=terminals.map(n=>guess[n]?.[0]??0),i=semiconductor(c,v),jac=v.map((_,j)=>{let w=[...v];w[j]+=1e-6;return semiconductor(c,w).map((q,k)=>(q-i[k])/1e-6);});
    stamps.push({c,terminals,v,i,jac});
   }
   // Controlled currents are stamped directly in the same MNA matrix through an internal hook.
   let linear=new Lineal(base);linear.extra=stamps;linear.extraNodes=nodes;
   let r=linear.step(mode,opts),error=0;
   for(let n of nodes){let old=guess[n]?.[0]??0,d=r.voltages[n][0]-old;error=Math.max(error,Math.abs(d));guess[n]=[old+Math.max(-.15,Math.min(.15,d)),0];}
   if(mode==='ac'||error<1e-7){for(let c of this.nonlinear){let ts=c.type==='Q'?[c.a,c.b,c.e]:[c.a,c.b],i=semiconductor(c,ts.map(n=>r.voltages[n][0]));r.terminalCurrents??={};if(mode==='ac'){let {jac}=stamps.find(s=>s.c===c),currents=ts.map((_,k)=>ts.reduce((sum,n,j)=>add(sum,mul([jac[j][k],0],r.voltages[n])),[0,0]));r.currents[c.id]=currents[0];r.terminalCurrents[c.id]=currents;}else{r.currents[c.id]=[i[0],0];r.terminalCurrents[c.id]=i;}}if(mode!=='ac')this.guess=r.voltages;return {...r,iterations:iteration+1};}
  }
  let message=`Newton-Raphson no converge (${mode}, t=${opts.t??0}, 250 iteraciones)`;console.error('[MNA]',message);throw Error(message);
 }
}
export const motores={mna:MNA,ngspice:Ngspice};
