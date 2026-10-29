// Instrumentos de a uno: abrir uno cierra el anterior. La lógica no toca el DOM (probada en Node).
export const INSTRUMENTOS=[
 {id:'osciloscopio',nombre:'Osciloscopio',selectores:['.scope-panel']},
 {id:'generador',nombre:'Generador',selectores:['#generator']},
 {id:'fuente',nombre:'Fuente',selectores:['#powerSupply']},
 {id:'multimetro',nombre:'Multímetro',selectores:['.aux-panel','.aux-panel details:nth-of-type(1)']},
 {id:'bode',nombre:'Bode',selectores:['.aux-panel','.aux-panel details:nth-of-type(2)']},
 {id:'barrido',nombre:'Barrido',selectores:['#parameterSweep']}
];
export function selectorUno(lista=INSTRUMENTOS,alCambiar=()=>{}){
 let actual=null;
 const ids=lista.map(i=>i.id);
 return {
  get actual(){return actual;},
  abrir(id){if(!ids.includes(id))throw Error('Instrumento desconocido: '+id);if(actual===id)return;actual=id;alCambiar(actual);},
  cerrar(){if(actual===null)return;actual=null;alCambiar(null);},
  alternar(id){if(actual===id)this.cerrar();else this.abrir(id);}
 };
}
// Muestra solo los elementos del instrumento elegido (o ninguno) dentro del contenedor del banco.
export function aplicarVisibilidad(contenedor,lista,id){
 for(let i of lista)for(let sel of i.selectores)for(let e of contenedor.querySelectorAll(sel))e.hidden=true;
 let elegido=lista.find(i=>i.id===id);if(!elegido)return;
 for(let sel of elegido.selectores)for(let e of contenedor.querySelectorAll(sel)){e.hidden=false;if(e.tagName==='DETAILS')e.open=true;}
}
