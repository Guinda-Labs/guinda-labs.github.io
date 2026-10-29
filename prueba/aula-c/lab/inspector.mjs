import {analizarValor,descomponer,conPrefijo,unidadDe,rangoPerilla,aPosicion,deParametro,PREFIJOS} from './valor-ui.mjs';
// Inspector flotante: no ocupa lugar en la rejilla, así que no mueve ni achica el lienzo.
const NOMBRES={R:'Resistencia',C:'Capacitor',L:'Inductor',V:'Fuente de voltaje',I:'Fuente de corriente',D:'Diodo',Q:'Transistor'};
const PREF_NOMBRE={p:' (pico)',n:' (nano)','µ':' (micro)',m:' (mili)',k:' (kilo)',M:' (mega)'};
export function crearInspector({circuito,seleccion,aplicar,cambiar,vivo,modelo,formato,fallo,chip=null}){
 const nodo=(tag,texto,padre,attrs={})=>{let e=document.createElement(tag);if(texto)e.textContent=texto;for(let [k,v] of Object.entries(attrs))e.setAttribute(k,v);padre?.append(e);return e;};
 let raiz=null,idActual=null;
 function ocultar(){raiz?.remove();raiz=null;idActual=null;}
 function error(msg,texto){msg.textContent=texto;msg.className='inspector-msg error';}
 function limpio(msg,campo){msg.textContent='';msg.className='inspector-msg';campo.removeAttribute('aria-invalid');}
 function mostrar(p,{foco=false}={}){
  if(!p||p.type==='G'){ocultar();return;}
  ocultar();idActual=p.id;
  raiz=nodo('aside','',document.body,{class:'inspector',role:'group','aria-label':'Propiedades de '+p.id});
  let cab=nodo('header','',raiz);nodo('strong',p.id,cab);nodo('span',NOMBRES[p.type]||p.definition?.name||'Componente',cab);
  let cerrar=nodo('button','×',cab,{type:'button','aria-label':'Cerrar propiedades',class:'inspector-cerrar'});cerrar.onclick=ocultar;
  let msg=nodo('output','',raiz,{class:'inspector-msg',role:'status'});
  raiz.onkeydown=e=>{e.stopPropagation();if(e.key!=='Escape')return;let inp=raiz.querySelector('.inspector-valor');if(inp&&inp.value!==inp.dataset.original){inp.value=inp.dataset.original;limpio(msg,inp);}else ocultar();};
  if(p.definition){
   if(chip&&chip.es(p)){let g=chip.ganancia(p);nodo('p',g===null?'':'Ganancia con la R_G conectada: '+(g===Infinity?'sin R_G (G = 1)':'G = '+Number(g.toPrecision(4))),raiz,{class:'inspector-ayuda'});let c=nodo('button','Cambiar chip → '+chip.otro(p),raiz,{type:'button'});c.onclick=()=>{chip.cambiar(p);};}
   let b=nodo('button','Editar modelo',raiz,{type:'button'});b.onclick=()=>modelo(p.definition);}
  else if(unidadDe(p)&&!p.wave)numerico(p,msg,foco);
  else textual(p,msg,foco);
 }
 function numerico(p,msg,foco){
  let fila=nodo('div','',raiz,{class:'inspector-fila'}),campo=nodo('input','',fila,{type:'text',class:'inspector-valor','aria-label':'Valor de '+p.id,autocomplete:'off',spellcheck:'false'});
  nodo('span',unidadDe(p),fila,{class:'inspector-unidad'});
  let pref=nodo('div','',raiz,{class:'inspector-prefijos',role:'group','aria-label':'Prefijos SI'});
  const escribir=v=>{let d=descomponer(v);campo.value=d.numero+d.prefijo;campo.dataset.original=campo.value;};
  escribir(p.value);
  const intentar=()=>{let r=analizarValor(campo.value,{positivo:'RCL'.includes(p.type)});if(!r.ok){campo.setAttribute('aria-invalid','true');error(msg,r.error);return null;}limpio(msg,campo);return r.valor;};
  const aplicarValor=v=>{try{aplicar(p,String(v));}catch(e){error(msg,e.message);fallo(e);return false;}return true;};
  const confirmar=()=>{let v=intentar();if(v!==null&&aplicarValor(v)){cambiar();escribir(v);ajustarPerilla(v);}};
  campo.oninput=intentar;
  campo.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();confirmar();}};
  for(let s of PREFIJOS.map(x=>x[0])){let b=nodo('button',s,pref,{type:'button','aria-label':'Prefijo '+s+PREF_NOMBRE[s]});b.onclick=()=>{campo.value=conPrefijo(campo.value,s);confirmar();campo.focus();};}
  let r=rangoPerilla(p),perilla=nodo('input','',raiz,{type:'range',min:0,max:1000,step:1,class:'inspector-perilla','aria-label':'Variar '+p.id+' en vivo'});
  function ajustarPerilla(v){r=rangoPerilla({type:p.type,value:v});perilla.value=Math.round(aPosicion(r,v)*1000);}
  perilla.value=500;
  perilla.oninput=()=>{let v=deParametro(r,perilla.value/1000);if(!(v>0)&&'RCL'.includes(p.type))return;if(aplicarValor(v)){escribir(v);limpio(msg,campo);vivo();}};
  perilla.onchange=()=>ajustarPerilla(p.value);
  if(foco){campo.focus();campo.select();}
 }
 function textual(p,msg,foco){
  let nl=['D','Q'].includes(p.type),fila=nodo('div','',raiz,{class:'inspector-fila'}),campo=nodo('input','',fila,{type:'text',class:'inspector-valor','aria-label':nl?'Modelo Is n'+(p.type==='Q'?' beta':''):'Valor o forma de onda de '+p.id,autocomplete:'off',spellcheck:'false'});
  campo.value=nl?`${p.Is??(p.type==='D'?2.52e-9:1e-14)} ${p.n??(p.type==='D'?1.752:1)}${p.type==='Q'?' '+(p.beta??100):''}`:p.wave?`${p.wave.type.toUpperCase()}(${p.wave.args.join(' ')})`:formato(p.value).replace(/ /g,'');campo.dataset.original=campo.value;
  nodo('small',nl?'Is n'+(p.type==='Q'?' beta':'')+', todos positivos':'DC 1 · SIN(0 1 1000) · PULSE(0 1 0 1u 1u 1m 2m)',raiz,{class:'inspector-ayuda'});
  campo.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();try{aplicar(p,campo.value);limpio(msg,campo);cambiar();campo.dataset.original=campo.value;}catch(err){campo.setAttribute('aria-invalid','true');error(msg,err.message);fallo(err);}}};
  if(foco){campo.focus();campo.select();}
 }
 // Se llama tras cada render: sigue la selección sin reconstruir mientras se escribe.
 function sincronizar(){
  let p=circuito().components.find(q=>q.id===seleccion());
  if(!p){ocultar();return;}
  if(p.id!==idActual||!raiz){mostrar(p);return;}
  if(raiz.contains(document.activeElement))return;
  let campo=raiz.querySelector('.inspector-valor');
  if(campo&&unidadDe(p)&&!p.wave){let d=descomponer(p.value);campo.value=d.numero+d.prefijo;campo.dataset.original=campo.value;}
 }
 return {mostrar,ocultar,sincronizar,get abierto(){return !!raiz;},get id(){return idActual;}};
}

// Pregunta corta flotante (sustituye a window.prompt): Enter acepta, Esc cancela.
export function preguntarTexto(titulo,inicial,aceptar){
 document.querySelector('.inspector-pregunta')?.remove();
 let f=document.createElement('form'),l=document.createElement('label'),i=document.createElement('input'),m=document.createElement('output');
 f.className='inspector inspector-pregunta';l.textContent=titulo;i.className='inspector-valor';i.value=inicial;i.setAttribute('autocomplete','off');m.className='inspector-msg';
 l.append(i);f.append(l,m);document.body.append(f);
 f.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape')f.remove();};
 f.onsubmit=e=>{e.preventDefault();try{aceptar(i.value);f.remove();}catch(err){m.textContent=err.message;m.className='inspector-msg error';}};
 i.focus();i.select();
}
