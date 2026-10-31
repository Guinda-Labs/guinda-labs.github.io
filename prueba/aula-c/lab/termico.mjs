// Capa experimental determinista; la ruta Ideal no modifica componentes ni resultados.
export function dispersar(componentes, semilla, tolerancias = {}) {
 let estado = Number(semilla) >>> 0 || 1;
 const aleatorio = () => { estado = (1664525 * estado + 1013904223) >>> 0; return estado / 4294967296; };
 return componentes.map(p => {
  const tol = Number(tolerancias[p.id] ?? (p.type === 'R' ? 0.05 : p.type === 'C' ? 0.1 : p.type === 'L' ? 0.1 : 0));
  return {...p, value: p.value * (1 + (aleatorio() * 2 - 1) * tol)};
 });
}
export function ajustarTemperatura(componentes, ambiente = 25) {
 const delta=Number(ambiente)-25;
 return componentes.map(p=>{
  if(p.type==='R')return {...p,value:p.value*(1+(p.tempco??100e-6)*delta)};
  if(p.type==='D')return {...p,tempC:Number(ambiente),Is:(p.Is??2.52e-9)*((Number(ambiente)+273.15)/298.15)**3*Math.exp(-1.11/8.617333262e-5*(1/(Number(ambiente)+273.15)-1/298.15))};
  return p;
 });
}
export function termica(componentes, dc, potenciaNominal = {}, muestras = [], barrido = []) {
 return componentes.map(p => {
  const puntos=muestras.length?muestras:[dc];
  let sum=0,v=0,i=0;
  for(const r of puntos){const vr=(r.voltages[p.a]?.[0]??0)-(r.voltages[p.b]?.[0]??0),ir=(r.currents[p.id]?.[0]??0);v+=vr;i+=ir;sum+=Math.max(0,vr*ir);}
  const transientWatts=sum/puntos.length,dcVoltage=(dc.voltages[p.a]?.[0]??0)-(dc.voltages[p.b]?.[0]??0),dcCurrent=dc.currents[p.id]?.[0]??0,dcWatts=Math.max(0,dcVoltage*dcCurrent),w=Math.max(dcWatts,transientWatts),voltage=v/puntos.length,current=i/puntos.length, nominal=Number(potenciaNominal[p.id]??p.watt??(p.type==='R'?.25:Infinity));
  const acWatts=barrido.length?barrido.reduce((sum,r)=>{const vr=[(r.voltages[p.a]?.[0]??0)-(r.voltages[p.b]?.[0]??0),(r.voltages[p.a]?.[1]??0)-(r.voltages[p.b]?.[1]??0)],ir=r.currents[p.id]??[0,0];return sum+Math.max(0,(vr[0]*ir[0]+vr[1]*ir[1])/2);},0)/barrido.length:0;
  return {id:p.id,watts:w,dcWatts,transientWatts,acWatts,nominal,excedida:Math.max(w,acWatts)>nominal,voltage,current};
 });
}
