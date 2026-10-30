// Montaje físico sin protoboard (R23-UX5): las piezas quedan sueltas y se unen con cables directos
// entre patillas. La red es la misma que la del esquemático: solo cambia cómo se dibuja.
import {documento} from './protoboard.mjs';
import {patillas,terminal} from './circuito.mjs';

export const COLOR_DIRECTO='#39a67b';

export function montajeSinTabla(c){
 if(c.mode==='board')throw Error('El circuito ya tiene documento físico');
 const parent=new Map(),find=a=>{if(!parent.has(a))parent.set(a,a);if(parent.get(a)!==a)parent.set(a,find(parent.get(a)));return parent.get(a);},join=(a,b)=>parent.set(find(a),find(b));
 const claves=c.components.flatMap(p=>Array.from({length:patillas(p)},(_,i)=>p.id+':'+i));
 for(const w of c.wires)join(w.a,w.b);
 // Terminales en el mismo punto del esquema ya estaban unidas al compilar.
 const en=new Map();
 for(const k of claves){const pos=terminal(c,k).join(',');if(en.has(pos))join(k,en.get(pos));else en.set(pos,k);}
 for(const w of c.wires)for(const k of [w.a,w.b])if(/^@/.test(k)&&en.has(k.slice(1)))join(k,en.get(k.slice(1)));
 const clases=new Map();for(const k of claves){const r=find(k);if(!clases.has(r))clases.set(r,[]);clases.get(r).push(k);}
 const directos=[];let n=0;
 for(const pins of clases.values())for(let i=1;i<pins.length;i++)directos.push({id:'pd'+(++n),a:pins[0],b:pins[i],color:COLOR_DIRECTO});
 c.logicalRequest=structuredClone(c.wires);
 c.physical={...documento(),sinTabla:true,preservarEsquema:true,directos,libres:{}};
 c.mode='board';
 return c;
}

// Posición suelta de una pieza en el lienzo físico (rejilla de 14 px). Sin posición guardada, filas ordenadas.
export function posicionLibre(c,id){
 const guardada=c.physical?.libres?.[id];if(guardada)return [guardada.x,guardada.y];
 const i=Math.max(0,c.components.findIndex(p=>p.id===id));
 return [90+(i%5)*168,100+Math.floor(i/5)*140];
}
