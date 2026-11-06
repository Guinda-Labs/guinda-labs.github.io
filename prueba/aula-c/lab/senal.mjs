import {analizarValor} from './valor-ui.mjs';

const positivo=(texto)=>analizarValor(texto,{positivo:true});
const cualquiera=(texto)=>analizarValor(texto,{positivo:false});
export function amplitudPico(valor,unidad){if(!(Number.isFinite(valor)&&valor>=0))throw Error('La amplitud debe ser cero o positiva');return valor*(unidad==='Vpp'?0.5:unidad==='Vrms'?Math.SQRT2:1);}
export function formaDesdeWave(wave){
 if(!wave)return {forma:'cd',frecuencia:1000,amplitud:0,unidad:'Vp',offset:0,fase:0,ciclo:50};
 const a=wave.args||[];
 if(wave.type==='sin')return {forma:'seno',frecuencia:a[2]||1000,amplitud:Math.abs(a[1]||0),unidad:'Vp',offset:a[0]||0,fase:a[4]||a[5]||0,ciclo:50};
 if(wave.type==='pulse') {let periodo=a[6]||.001,duty=periodo?100*(a[5]||0)/periodo:50;return {forma:wave.shape==='triangle'?'triangular':wave.shape==='square'?'cuadrada':'pulso',frecuencia:1/periodo,amplitud:Math.abs((a[1]||0)-(a[0]||0))/2,unidad:'Vp',offset:((a[1]||0)+(a[0]||0))/2,fase:0,ciclo:Number.isFinite(duty)?duty:50};}
 return {forma:'cd',frecuencia:1000,amplitud:Math.abs(a[1]||0),unidad:'Vp',offset:a[0]||0,fase:0,ciclo:50};
}
export function waveDesdeSenal(s){
 const amp=amplitudPico(s.amplitud,s.unidad),f=s.frecuencia,o=s.offset;
 if(s.forma==='cd')return {value:o};
 if(s.forma==='seno')return {value:o,wave:{type:'sin',args:[o,amp,f,0,s.fase]}};
 const duty=(s.forma==='cuadrada'||s.forma==='pulso')?s.ciclo/100:.5,periodo=1/f,edge=s.forma==='triangular'?periodo/2:Math.min(periodo*.001,periodo*duty/10,periodo*(1-duty)/10),low=o-amp,high=o+amp,width=s.forma==='triangular'?0:periodo*duty;
 return {value:o,wave:{type:'pulse',shape:s.forma==='triangular'?'triangle':s.forma==='cuadrada'?'square':'pulse',args:[low,high,0,edge,edge,width,periodo]}};
}
export function validarSenal(raw){
 const e={},frequency=positivo(raw.frecuencia),amplitude=cualquiera(raw.amplitud),offset=cualquiera(raw.offset),phase=cualquiera(raw.fase),duty=cualquiera(raw.ciclo);
 if(raw.forma!=='cd'&&!frequency.ok)e.frecuencia=frequency.error;
 if(!amplitude.ok||amplitude.valor<0)e.amplitud=amplitude.ok?'La amplitud debe ser cero o positiva':amplitude.error;
 if(!offset.ok)e.offset=offset.error;if(!phase.ok)e.fase=phase.error;
 if(['cuadrada','pulso'].includes(raw.forma)&&(!duty.ok||duty.valor<=0||duty.valor>=100))e.ciclo=duty.ok?'Use un ciclo entre 0 y 100 %':duty.error;
 if(Object.keys(e).length)return {ok:false,errores:e};
 const s={forma:raw.forma,frecuencia:raw.forma==='cd'?frequency.valor:frequency.valor,amplitud:amplitude.valor,unidad:raw.unidad,offset:offset.valor,fase:phase.valor,ciclo:duty.ok?duty.valor:50};
 return {ok:true,senal:s,...waveDesdeSenal(s)};
}
export function muestra(s, puntos=120){let f=s.forma==='cd'?1:s.frecuencia,amp=amplitudPico(s.amplitud,s.unidad),periodo=1/f;return Array.from({length:puntos+1},(_,i)=>{let t=2*periodo*i/puntos,x=(t/periodo)%1,v;if(s.forma==='cd')v=s.offset;else if(s.forma==='seno')v=s.offset+amp*Math.sin(2*Math.PI*x+s.fase*Math.PI/180);else if(s.forma==='cuadrada'||s.forma==='pulso')v=s.offset+(x<s.ciclo/100?amp:-amp);else if(s.forma==='triangular')v=s.offset+amp*(1-4*Math.abs(x-.5));else v=s.offset;return {t,v};});}
