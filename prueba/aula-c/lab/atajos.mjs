// Atajos del laboratorio (R19). Devuelve la acción, sin tocar el DOM.
export const AYUDA=[
 ['A o /','Paleta de componentes'],['R · C · L','Insertar resistencia, capacitor, inductor'],['W','Cable'],['S','Sonda'],
 ['M','Mover piezas'],['Ctrl+R','Rotar la pieza seleccionada'],['Supr','Borrar selección'],['Esc','Salir de cualquier modo y quitar la selección'],
 ['Ctrl+Z / Ctrl+Y','Deshacer / rehacer'],['?','Esta ayuda'],['Clic en el valor','Editar con prefijos: 4.7k, 4k7, 2.2u, 100n']
];
export function accionTecla(e){
 let k=String(e.key).toLowerCase(),ctrl=e.ctrlKey||e.metaKey;
 if(ctrl){if(k==='r')return 'rotar';if(k==='z')return e.shiftKey?'rehacer':'deshacer';if(k==='y')return 'rehacer';return null;}
 if(e.altKey)return null;
 if(e.key==='Delete')return 'borrar';
 if(e.key==='Escape')return 'salir';
 if(k==='a'||e.key==='/')return 'paleta';
 if(k==='w')return 'cable';
 if(k==='s')return 'sonda';
 if(k==='m')return 'mover';
 if(['r','c','l'].includes(k))return 'insertar:'+k.toUpperCase();
 if(e.key==='?')return 'ayuda';
 return null;
}
