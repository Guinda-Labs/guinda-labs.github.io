// TODO Tauri: sustituir este adaptador por ventanas nativas con las mismas claves.
export function abrirVentana(tipo,url=`/${tipo}/`){
 const ventana=window.open(url,`aulac-${tipo}`,'width=1440,height=960,resizable=yes,scrollbars=yes');
 ventana?.focus();return ventana;
}
