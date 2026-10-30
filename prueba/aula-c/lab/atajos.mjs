// Atajos del laboratorio (R19). Devuelve la acción, sin tocar el DOM.
export const ATAJOS=[
 ['a','paleta','A','Buscar componentes'],['/','paleta','/','Buscar componentes'],['r','rotar','R','Girar'],
 ['w','cable','W','Cable'],['s','sonda','S','Sonda'],['m','mover','M','Seleccionar y mover'],
 ['Delete','borrar','Supr','Borrar'],['Backspace','borrar','Retroceso','Borrar'],['Escape','salir','Esc','Cancelar'],['Enter','propiedades','Enter','Propiedades'],
 ['Ctrl+c','copiar','Ctrl+C','Copiar'],['Ctrl+v','pegar','Ctrl+V','Pegar'],['Ctrl+d','duplicar','Ctrl+D','Duplicar'],['Ctrl+a','todo','Ctrl+A','Seleccionar todo'],
 ['Ctrl+z','deshacer','Ctrl+Z','Deshacer'],['Ctrl+y','rehacer','Ctrl+Y','Rehacer'],['Ctrl+Shift+z','rehacer','Ctrl+Mayús+Z','Rehacer'],
 ['Alt+n','nuevo','Alt+N','Nuevo laboratorio'],['Ctrl+s','guardar','Ctrl+S','Guardar'],['Ctrl+o','abrir','Ctrl+O','Abrir'],['Ctrl+Enter','simular','Ctrl+Enter','Simular / Pausar'],
 ['p','corriente','P','Pausar corriente'],['i','instrumentos','I','Instrumentos'],
 ['1','distribucion:armar','1','Esquemático'],['2','distribucion:protoboard','2','Protoboard'],['3','distribucion:medir','3','Medir'],['4','distribucion:analizar','4','Analizar'],
 ['Shift+Digit1','centrar','Mayús+1','Volver a centrar'],['Shift+Digit2','seleccion','Mayús+2','Centrar en la selección'],['Shift+Digit0','real','Mayús+0','100 %'],
 ['Home','centrar','Inicio','Volver a centrar'],['+','acercar','+','Acercar'],['-','alejar','−','Alejar'],['?','ayuda','?','Atajos de teclado'],['F1','ayuda','F1','Atajos de teclado']
];
export const AYUDA=[...ATAJOS.map(([, ,key,label])=>[key,label]),['Espacio + arrastre / botón central','Desplazar'],['Rueda / pellizco','Zoom en el cursor'],['Mayús+R','Girar a la izquierda'],['Menú / Mayús+F10','Menú contextual de la selección'],['Mayús+clic derecho','Menú del navegador siempre disponible'],['Mostrar el menú del navegador','El siguiente clic derecho abre el menú nativo una sola vez']];
export function accionTecla(e){
 let key=String(e.key),ctrl=e.ctrlKey||e.metaKey;
 if(key.length===1)key=key.toLowerCase();
 if(ctrl)key='Ctrl+'+(e.shiftKey?'Shift+':'')+key;
 else if(e.altKey)key='Alt+'+(e.shiftKey?'Shift+':'')+key;
 else if(e.shiftKey&&/^Digit[012]$/.test(e.code))key='Shift+'+e.code;
 return ATAJOS.find(a=>a[0]===key)?.[1]??null;
}
