// Análisis de valores con prefijos SI para el inspector flotante (sin DOM; probado en Node).
export const PREFIJOS=[['p',1e-12],['n',1e-9],['µ',1e-6],['m',1e-3],['k',1e3],['M',1e6]];
const FACTOR={p:1e-12,n:1e-9,u:1e-6,'µ':1e-6,'μ':1e-6,m:1e-3,k:1e3,K:1e3,M:1e6,G:1e9};
export const UNIDAD_PIEZA={R:'Ω',C:'F',L:'H',V:'V',I:'A'};
// «4.7k», «4k7», «4700», «2.2u», «2.2µ», «10m», «1M», «100n». Distingue m (mili) de M (mega).
export function analizarValor(texto,{positivo=true}={}){
 let s=String(texto??'').trim().replace(/\s+/g,'').replace(',','.');
 if(!s)return {ok:false,error:'Escriba un valor, por ejemplo 4.7k'};
 s=s.replace(/(?:ohmios?|ohms?|Ω|Hz|H|F|V|A)$/i,'');
 let m=s.match(/^([+-]?\d+)([pnuµμmkKMG])(\d+)$/)||null,num,factor=1;
 if(m){num=Number(m[1]+'.'+m[3]);factor=FACTOR[m[2]];}
 else{m=s.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([pnuµμmkKMG]?)$/);
  if(!m)return {ok:false,error:'Valor no válido: use un número con prefijo opcional (p n µ m k M)'};
  num=Number(m[1]);factor=m[2]?FACTOR[m[2]]:1;}
 let v=num*factor;
 if(!Number.isFinite(v))return {ok:false,error:'Valor fuera de rango'};
 if(positivo&&!(v>0))return {ok:false,error:'El valor debe ser positivo'};
 return {ok:true,valor:Number(v.toPrecision(12))};
}
// Número para mostrar en el campo: mantisa y prefijo por separado (4.7 + k).
export function descomponer(v){
 if(!Number.isFinite(v)||v===0)return {numero:String(v||0),prefijo:''};
 let e=Math.max(-12,Math.min(9,Math.floor(Math.log10(Math.abs(v))/3)*3)),n=Number((v/10**e).toPrecision(4));
 if(Math.abs(n)>=1000&&e<9){n/=1000;e+=3;}
 return {numero:String(n),prefijo:({'-12':'p','-9':'n','-6':'µ','-3':'m','0':'','3':'k','6':'M','9':'G'})[e]};
}
export const unidadDe=p=>UNIDAD_PIEZA[p?.type]??'';
// Cambia el prefijo de un texto de campo a un toque: «4.7k» + «m» → «4.7m».
export function conPrefijo(texto,prefijo){
 let m=String(texto).trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/);
 return m?m[1]+prefijo:prefijo?('1'+prefijo):'1';
}
// Rango de la perilla: logarítmico (década arriba y abajo) para R, C, L; lineal para fuentes.
export function rangoPerilla(p){
 let v=Number(p.value)||1;
 return 'RCL'.includes(p.type)?{log:true,min:v/10,max:v*10}:{log:false,min:Math.min(0,v*2),max:Math.max(v*2,1)};
}
export const aPosicion=(r,v)=>r.log?(Math.log10(v)-Math.log10(r.min))/(Math.log10(r.max)-Math.log10(r.min)):(v-r.min)/(r.max-r.min);
export const deParametro=(r,t)=>Number((r.log?10**(Math.log10(r.min)+t*(Math.log10(r.max)-Math.log10(r.min))):r.min+t*(r.max-r.min)).toPrecision(4));

// Ganancia de las hojas de datos: AD620 G=1+49.4k/RG; INA128 G=1+50k/RG (RG entre las patillas 1 y 8).
export const CHIPS_INA={AD620:49400,INA128:50000};
export const otroChip=id=>id==='AD620'?'INA128':id==='INA128'?'AD620':null;
// Sustituir solo la definición conserva las terminales, el montaje y la resistencia externa.
export function cambiarChip(c,id,definicion){
 let p=c.components.find(p=>p.id===id);
 if(!p||otroChip(p.definition?.id)!==definicion?.id)throw Error('Cambio de chip incompatible');
 p.definition=structuredClone(definicion);
 let rg=rgConectada(c,id),ganancia=gananciaINA(p.definition.id,rg?.value||0);
 console.info('[AULA-C cambiar chip]',{pieza:id,modelo:p.definition.id,rg:rg?.id,resistencia:rg?.value,ganancia});
 return ganancia;
}
export function gananciaINA(chip,rg){if(!(chip in CHIPS_INA))return null;if(!(rg>0))return Infinity;return 1+CHIPS_INA[chip]/rg;}
// Resistencia conectada entre XI:0 y XI:7 (R_G física), buscándola en los cables del circuito.
export function rgConectada(c,id){
 let toca=(k)=>c.wires.filter(w=>w.a===k||w.b===k).map(w=>w.a===k?w.b:w.a),pins=n=>new Set(toca(id+':'+n));
 for(let r of c.components.filter(p=>p.type==='R')){let a=toca(r.id+':0').concat(toca(r.id+':1')),u=a.includes(id+':0'),v=a.includes(id+':7');if(u&&v)return r;}
 return null;
}
