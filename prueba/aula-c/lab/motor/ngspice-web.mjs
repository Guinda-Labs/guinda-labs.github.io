export class MotorNgspiceWeb {
 id='ngspice';
 constructor({crearWorker=()=>new Worker(new URL('./ngspice-web.worker.mjs',import.meta.url),{type:'module'}),estado=()=>{},peso=0}={}){this.crearWorker=crearWorker;this.estado=estado;this.peso=peso;this.pending=new Map();this.sequence=0;this.generation=0;this.listo=false;}
 conectar(){
  if(this.worker)return;
  this.worker=this.crearWorker();
  this.worker.onmessage=({data})=>{const p=this.pending.get(data.id);if(!p)return;clearTimeout(p.timer);this.pending.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result);};
  this.worker.onerror=e=>this.detener(Error('Worker ngspice: '+e.message));
 }
 llamar(method,args,limiteMs=60000){
  this.conectar();const id=++this.sequence;
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>this.detener(Error(`ngspice excedió ${limiteMs} ms (${method})`)),limiteMs);this.pending.set(id,{resolve,reject,timer});this.worker.postMessage({id,method,args});});
 }
 async iniciar(){
  if(!this.starting){const generation=this.generation;this.estado('Motor ngspice: descargando'+(this.peso?' '+(this.peso/1e6).toFixed(1)+' MB':'')+'…');this.starting=this.llamar('iniciar').then(()=>{if(generation!==this.generation)throw Error('Inicio cancelado');this.listo=true;this.estado('Motor ngspice: listo');}).catch(e=>{if(generation===this.generation){this.starting=null;this.estado('Motor ngspice: no disponible · '+e.message);}throw e;});}
  return this.starting;
 }
 async info(){return {...await this.llamar('info'),peso:this.peso};}
 async ejecutar(args){await this.iniciar();return this.llamar('ejecutar',args,args.limiteMs??60000);}
 async variables(){return this.llamar('variables');}
 async request(route,{body}={}){await this.iniciar();try{const result=await this.llamar(route.endsWith('validar-modelo')?'validar':'simular',JSON.parse(body));return {ok:true,json:async()=>result};}catch(e){return {ok:false,text:async()=>e.message};}}
 detener(error=Error('Simulación cancelada; se reinició el motor')){++this.generation;this.worker?.terminate();this.worker=null;this.listo=false;this.starting=null;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();}
 async cancelar(){this.detener();await this.iniciar();return {reiniciado:true};}
 async cerrar(){this.detener(Error('Motor cerrado'));}
}
