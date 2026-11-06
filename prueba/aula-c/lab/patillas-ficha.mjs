export function buscarPieza(datos,id){return datos?.piezas?.find(p=>p.id===id)||null;}
export function buscarPatilla(datos,id,numero){return buscarPieza(datos,id)?.patillas?.find(p=>p.numero===numero)||null;}
export function estadoPatilla({datos,pieza,numero,nodo=null,patillas=[]}){
 const parte=pieza?.definition?.id||pieza?.type,info=buscarPatilla(datos,parte,numero);
 const nombre=info?.nombre_hoja||pieza?.definition?.package?.pins?.[numero-1]?.name||'';
 const conectada=patillas.filter(p=>p.key!==pieza?.id+':'+(numero-1));
 const alimentacion=!!info&&(info.tipo==='P'||/^VCC$|^VEE$|^V\+$|^V−$|^V-$/.test(nombre));
 const nc=!!info&&/^NC$/i.test(info.nombre_hoja||nombre);
 return {parte,info,nombre,nodo,patillas:conectada,avisos:[...(alimentacion&&!nodo?['Patilla de alimentación sin conectar.']:[]),...(nc&&nodo?['La hoja indica NC; esta patilla tiene una conexión.']:[])]};
}
