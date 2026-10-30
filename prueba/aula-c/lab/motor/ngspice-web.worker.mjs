import {analizarRaw,comprobarAnalisis,MotorNgspiceBase} from './spice-compartido.mjs';
import {MotorComponentesBase,deckPrueba} from './modelos-compartido.mjs';

// El proveedor se importa sólo dentro del Worker. No bloquea el editor ni MNA.
export function crearRuntime({cargar=()=>import('../vendor/eecircuit-engine/eecircuit-engine.mjs')}={}){
 let simulation,starting,version='sin verificar',lastVariables={};
 async function iniciar(){
  if(!starting)starting=(async()=>{const {Simulation}=await cargar();simulation=new Simulation();await simulation.start();version=simulation.getInitInfo().match(/ngspice[-\s]+([\w.]+)/i)?.[1]||'sin verificar';})();
  try{await starting;}catch(e){starting=null;throw e;}
 }
 async function ejecutar({codigo,limiteMs=60000}){
  const start=performance.now();let stdout='',stderr='';
  try{
   if(typeof codigo!=='string'||codigo.length>2000000)throw Error('Deck inválido o mayor de 2 MB');
   await iniciar();
   // Contrato público EEcircuit: start → setNetList → runSim.
   const control=codigo.match(/\.control\s*\n([\s\S]*?)\.endc/i);
   if(!control)throw Error('Se requiere un deck AULA-C con bloque .control');
   const command=control[1].split(/\r?\n/).find(line=>/^(?:op|ac|tran)\b/i.test(line));
   if(!command)throw Error('Análisis SPICE desconocido');
   const save=control[1].split(/\r?\n/).find(line=>/^save /i.test(line))||'save all';
   // EEcircuit administra su bucle interactivo. quit terminaría ese bucle.
   // Su lector binario calcula offsets con caracteres: el título debe ser ASCII.
   await simulation.setNetList(codigo.replace(/^[^\n]*/, 'AULA-C WASM').replace(/\.control\b[\s\S]*?\.endc/i,`.${save}\n.${command}`));
   const output=await simulation.runSim();
   stdout=simulation.getInfo();
   stderr=simulation.getError().join('\n');
   if(stdout.length+stderr.length>2000000)throw Error('ngspice excedió 2 MB de salida');
   comprobarAnalisis(stdout+'\n'+stderr);
   version=(stdout+'\n'+stderr).match(/ngspice[-\s]+([\w.]+)/i)?.[1]||version;
   let data=output.data;
   if(!Array.isArray(data)||!data.length||!output.numPoints)throw Error('EEcircuit no devolvió vectores válidos');
   if(command.startsWith('tran ')&&/\blinearize\b/.test(control[1])){
    const [,dtText,stopText]=command.split(/\s+/),dt=Number(dtText),stop=Number(stopText),time=data[0].values;
    const times=Array.from({length:Math.floor(stop/dt+1e-8)+1},(_,i)=>i*dt);
    let k=0;const segments=times.map(t=>{while(k+1<time.length-1&&time[k+1]<t)k++;return [k,(t-time[k])/(time[k+1]-time[k])];});
    data=data.map((v,i)=>({...v,values:i===0?times:segments.map(([k,w])=>v.values[k]+w*(v.values[k+1]-v.values[k]))}));
   }
   const complex=output.dataType==='complex',points=data[0].values.length;
   const raw=['Title: AULA-C WASM','Plotname: '+command,'Flags: '+(complex?'complex':'real'),'No. Variables: '+data.length,'No. Points: '+points,'Variables:',...data.map((v,i)=>`${i}\t${v.name}\t${v.type}`),'Values:',...Array.from({length:points},(_,j)=>data.map((v,i)=>{const value=v.values[j];return (i===0?j+'\t':'\t')+(complex?`${value.real},${value.img}`:value);}).join('\n'))].join('\n');
   const rows=analizarRaw(raw),variables={};
   for(const name of Object.keys(rows[0]||{}))variables[name]={type:complex?'complex':'real',shape:[rows.length,1],data:rows.map(r=>r[name][0]),...(complex?{imag:rows.map(r=>r[name][1])}:{})};
   lastVariables=variables;
   if(performance.now()-start>limiteMs)throw Error('ngspice excedió el límite de tiempo');
   return {ok:true,stdout,stderr,variables,graficas:[],archivos:{'resultado.raw':new TextEncoder().encode(raw)},medidas:{ms:performance.now()-start}};
  }catch(e){console.error('[ngspice WASM]',{error:e.message,codigo,limiteMs,stdout:stdout.slice(-4000),stderr:stderr.slice(-4000)});return {ok:false,stdout,stderr,variables:{},graficas:[],archivos:{},error:{mensaje:e.message},medidas:{ms:performance.now()-start}};}
 }
 async function raw(codigo){const r=await ejecutar({codigo});if(!r.ok)throw Error(r.error.mensaje);return analizarRaw(new TextDecoder().decode(r.archivos['resultado.raw']));}
 async function simular({components,dt,stop,ac}){
  const m=new (components.some(p=>p.definition)?MotorComponentesBase:MotorNgspiceBase)(components);
  m.raw=command=>raw(m.deck(command));
  return {dc:await m.dc(),tran:await m.transitorio({dt,stop}),ac:await m.ac(ac)};
 }
 return {iniciar,ejecutar,simular,async validar(component){await raw(deckPrueba(component));return {ok:true};},async info(){return {disponible:simulation?.isInitialized()??false,version,plataforma:'wasm'};},async variables(){return Object.entries(lastVariables).map(([nombre,{type,shape}])=>({nombre,type,shape}));}};
}

export function conectarWorker(port,runtime=crearRuntime()){
 let queue=Promise.resolve();
 port.onmessage=({data:{id,method,args}})=>{
  queue=queue.then(async()=>{try{if(!Object.hasOwn(runtime,method))throw Error('Operación de motor desconocida');port.postMessage({id,result:await runtime[method](args)});}catch(e){port.postMessage({id,error:e.message});}});
 };
}
if(typeof WorkerGlobalScope!=='undefined'&&globalThis instanceof WorkerGlobalScope)conectarWorker(globalThis);
