import {compilar,validar} from './circuito.mjs';
import {avisos} from './protoboard.mjs';
import {MNA,valor} from './motor/mna.mjs';
import {alimentar,autoescala,canal,pasos125} from './instrumentos.mjs';

// La excitación lenta es la señal de interés, aunque el modo común sea mayor.
export function frecuenciaPractica(c){
 const frequencies=c.components.map(p=>p.wave?.type==='sin'?p.wave.args[2]:p.wave?.type==='pulse'?1/p.wave.args[6]:NaN).filter(f=>Number.isFinite(f)&&f>0);
 return frequencies.length?Math.min(...frequencies):c.b309.practice==='i-fase'?60:0;
}
export function autoescalaPractica(c,result,controls,option){
 const probes=sondasPractica(c);
 for(const [i,node] of [[1,probes.input],[2,probes.output]]){
  asignarDivision(controls[i===1?'vdiv':'vdiv2'],autoescala(canal(result.tran,node,probes.coupling),[node],true),option);
  controls['position'+i].value='0';
 }
 const frequency=frecuenciaPractica(c),span=result.tran.at(-1).t-result.tran[0].t;
 const candidates=pasos125.filter(v=>v*10<=span*(1+1e-9)&&v*10*frequency>=2&&v*10*frequency<=4);
 const duration=frequency?Math.min(span,3/frequency):span;
 asignarDivision(controls.tdiv,candidates.length?candidates.reduce((a,b)=>Math.abs(b*10-duration)<Math.abs(a*10-duration)?b:a):duration/10,option);
}

// Un select descarta silenciosamente valores que no pertenecen a sus opciones.
export function asignarDivision(select,value,option=(label,value)=>new Option(label,value)){
 const exact=String(value);
 if(![...select.options].some(o=>o.value===exact))select.add(option(exact,exact));
 select.value=exact;
}
export function numeroControl(name,value){
 try{const n=valor(value);if(!Number.isFinite(n))throw Error();return n;}
 catch{throw Error(`Control ${name}: valor inválido ${JSON.stringify(value)}`);}
}
export function configurarAnalisis(controls,analysis,option){
 controls.dt.value=String(analysis.dt);asignarDivision(controls.tdiv,analysis.stop/10,option);
 controls.fstart.value=String(analysis.start);controls.fstop.value=String(analysis.end);
}
// Ruta del botón: documento → validación → compilación → motor inyectado.
export async function simularDocumento(c,settings,{engine='ngspice',request=fetch}={}){
 for(const p of c.components){
  if(!Number.isFinite(p.value)||('RCL'.includes(p.type)&&p.value<=0))throw Error(`Componente ${p.id}: valor inválido ${JSON.stringify(p.value)}`);
  if(p.wave&&(!['sin','pulse'].includes(p.wave.type)||!Array.isArray(p.wave.args)||!p.wave.args.every(Number.isFinite)))throw Error(`Componente ${p.id}: fuente inválida ${JSON.stringify(p.wave)}`);
 }
 validar(c);const warnings=avisos(c);if(warnings.length)throw Error(warnings.join('; '));
 if(!c.components.length)throw Error('Agregue componentes');
 if(engine==='mna'&&c.components.some(p=>p.definition))throw Error('Los componentes SPICE requieren seleccionar ngspice.');
 let components=compilar(c).components,supply=null;
 if(settings.psuEnabled){
  if(components.some(p=>p.definition))throw Error('Para componentes SPICE use una fuente V en el circuito; desconecte el límite de banco MNA.');
  supply=alimentar(components,settings.psuSource,numeroControl('Fuente V',settings.psuVoltage),numeroControl('Límite A',settings.psuLimit),MNA);components=supply.components;
 }
 const dt=numeroControl('Paso (s)',settings.dt),stop=10*numeroControl('s/div',settings.tdiv),ac={start:numeroControl('Desde Hz',settings.fstart),stop:numeroControl('Hasta Hz',settings.fstop)};
 let result;
 if(engine==='mna'){const motor=new MNA(components);result={dc:motor.dc(),tran:motor.transitorio({dt,stop}),ac:motor.ac(ac)};}
 else{const response=await request('./simular',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({components,dt,stop,ac})});if(!response.ok)throw Error(await response.text());result=await response.json();}
 return {result,supply};
}

export function sondasPractica(c){
 const model=compilar(c),[input,output]=c.b309.probes.map(pin=>model.node(pin));
 return {input,output,instrument:c.b309.practice==='i-aislamiento'?'meter':c.b309.practice==='v-sallen-key'?'bode':'scope',coupling:['iii-emisor-comun','iv-fuente-comun','v-instrumentacion'].includes(c.b309.practice)?'AC':'DC'};
}
