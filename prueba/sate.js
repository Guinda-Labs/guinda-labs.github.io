/* Ventana común del marcador; extracción y cupos conservan sus implementaciones. */
(()=>{
  const textos={"sate.cupos.alumno_actualizado": "Datos del SAES actualizados a las {hora}", "sate.cupos.alumno_error": "No se pudieron actualizar tus datos del SAES. Los cupos siguen disponibles; vuelve a consultar para reintentar.", "sate.cupos.resumen_titulo": "Unidades de aprendizaje elegidas", "sate.cupos.resumen_riesgo": "{n} grupos con cupo limitado o agotado · Ver alternativas", "sate.cupos.sugerencias": "Ver grupos alternativos", "sate.cupos.misma_materia": "Otro grupo de la misma unidad de aprendizaje", "sate.cupos.mismo_horario": "Otras unidades de aprendizaje disponibles", "sate.cupos.mismo_horario_ayuda": "Grupos que caben en el hueco o no chocan con tu selección.", "sate.cupos.recomendada": "Recomendada", "sate.cupos.tipo_misma_materia": "Misma materia, otro grupo", "sate.cupos.tipo_mismo_horario": "Mismo horario", "sate.cupos.tipo_ocupa_hueco": "Ocupa el hueco", "sate.cupos.todas_disponibles": "Ver todas las disponibles · {n}", "sate.cupos.cambiar": "Cambiar", "sate.cupos.ver_horario": "Ver mi horario", "sate.cupos.cambio_carga": "La carga queda fuera de los límites conocidos: {n} créditos; mínima {min}, máxima autorizada {max}.", "sate.cupos.tu_horario_cupos": "Tu horario con cupos", "sate.cupos.buscar_sin_llenos": "Buscar horarios con cupo disponible", "sate.cupos.oferta_completa": "Toda la oferta con cupos", "sate.cupos.abrir_completo": "Abrir SATE completo", "sate.cupos.en_riesgo": "En riesgo", "sate.cupos.pocos": "Pocos lugares (menos de 10)", "sate.cupos.con_lugar": "Con lugar", "sate.cupos.conectado_saes": "conectado al SAES", "sate.cupos.consulta_local": "consulta guardada", "sate.cupos.cambiar_grupo": "Cambiar a este grupo", "sate.cupos.deshacer": "Deshacer", "sate.cupos.cambio_listo": "Tu horario se actualizó. Puedes deshacer este cambio.", "sate.cupos.cambio_deshecho": "Se restauró tu horario anterior.", "sate.cupos.deshacer_conflicto": "Tu horario cambió después. Revisa la selección actual antes de reemplazarla.", "sate.cupos.choque_con": "Choca con {nombre}", "sate.cupos.sin_alternativas": "No hay otro grupo de esta materia con lugar en la consulta.", "sate.cupos.sin_riesgo": "Tus grupos no tienen alertas de cupo en esta consulta. Revisa también los grupos sin dato.", "sate.cupos.horario_vacio_vista": "Arma tu horario en SATE completo para explorar alternativas aquí.", "sate.cupos.opcion_vista": "Opción {n}", "sate.cupos.usar_opcion": "Usar esta opción", "sate.cupos.sin_opciones": "No se encontró un horario completo sin grupos llenos con tus preferencias actuales. Puedes revisar la oferta o ajustar las preferencias en SATE completo.", "sate.cupos.error_busqueda": "No se pudo buscar el horario. Intenta de nuevo.", "sate.cupos.modo_saes": "En esta pestaña", "sate.cupos.modo_ventana": "En otra ventana", "sate.cupos.ver_cupos": "Ver cupos", "sate.cupos.avisos_mas": "Avisos y más", "sate.cupos.config_titulo": "Avisos y consulta", "sate.cupos.ritmo_ayuda": "Consulta manual: cada 15 s como mínimo. Automática: cada minuto o más, durante 30 min. Solo lectura del SAES.", "sate.cupos.auto_consulta": "Consulta automática", "sate.cupos.intervalo_aria": "Cada cuánto consultar", "sate.cupos.cada_n": "{n, plural, one {Cada # minuto} other {Cada # minutos}}", "sate.cupos.auto_activa_cada": "Consulta automática activa · {n, plural, one {cada # minuto} other {cada # minutos}}", "sate.cupos.auto_sin_conexion": "La consulta automática empieza cuando esta ventana esté conectada al SAES.", "sate.cupos.auto_en_saes": "En esta pestaña la consulta automática se activa desde el panel del marcador.", "sate.cupos.ultima_hace": "Última consulta {hora} · {n, plural, =0 {justo ahora} one {hace # minuto} other {hace # minutos}}", "sate.cupos.antigua_aviso": "Los lugares pueden haber cambiado; consulta de nuevo.", "sate.cupos.ocupados": "{inscritos} de {cupo} ocupados", "sate.cupos.tus_grupos": "Tus grupos", "sate.cupos.otros_lugar": "Otros con lugar", "sate.cupos.hoja_titulo": "Cupos · {carrera}", "sate.cupos.resumen_plegado": "Cupos · {hora} · {n} de tus grupos con lugar", "sate.cupos.resumen_sin_contexto": "Cupos · {hora} · sin grupos sincronizados", "sate.cupos.revision_titulo": "Revisión local de cupos · datos ficticios", "sate.cupos.revision_menu": "Ventana del marcador", "sate.cupos.revision_sin_nombre": "Ventana sin nombre", "sate.cupos.revision_sin_datos": "Ventana sin datos", "sate.cupos.ventana_titulo": "SATE · {unidad}", "sate.cupos.ventana_saludo": "Hola, {nombre}", "sate.cupos.ventana_listos": "Boleta {boleta} · tus datos del SAES están listos", "sate.cupos.ventana_sin_boleta": "no disponible", "sate.cupos.ventana_leyendo": "Leyendo tus datos del SAES (solo lectura)…", "sate.cupos.ventana_sin_datos": "No se encontraron datos del SAES; revisa tu sesión y vuelve a ejecutar el marcador.", "sate.cupos.ventana_privacidad": "Se leyó en tu navegador; no se envió a ningún servidor.", "sate.cupos.ventana_copiar": "Copiar mis datos", "sate.cupos.ventana_abrir": "Abrir SATE", "sate.cupos.ventana_copiar_detalle": "Copia tus datos para pegarlos en SATE.", "sate.cupos.ventana_abrir_detalle": "Revisa tu trayectoria y arma tu horario.", "sate.cupos.ventana_cupos_detalle": "Consulta los lugares disponibles en tus grupos.", "sate.cupos.ventana_volver": "← Volver", "sate.cupos.ventana_copiado": "Datos copiados. En SATE pulsa «Traer datos del SAES» y pégalos.", "sate.cupos.ventana_error_copia": "No se pudieron copiar tus datos. Permite el acceso al portapapeles y vuelve a intentarlo.", "sate.cupos.revision_hoja": "Hoja desplegada", "sate.cupos.revision_plegada": "Hoja plegada", "sate.cupos.revision_contexto": "Sin contexto", "sate.cupos.revision_tema": "Claro / oscuro", "sate.cupos.plegar": "Ocultar cupos", "sate.cupos.desplegar": "Ver cupos", "sate.cupos.abrir_detalle": "Abrir en SATE", "sate.cupos.movil_pausa": "Se detiene si cambias de pestaña o bloqueas el teléfono. Al volver, consulta si ya pasó el minuto.", "sate.cupos.sin_contexto": "Abre SATE una vez para sincronizar tu carrera, plan y grupos elegidos. Mientras tanto, consulta la tabla y usa el filtro.", "sate.cupos.contexto_sesion": "Grupos de tu última sincronización con SATE en esta sesión. Abre SATE para actualizar tu selección.", "sate.cupos.detalle_unico": "Esta consulta se recibió una sola vez. Vuelve a la pestaña del SAES para seguir consultando.", "sate.cupos.marcador": "SATE", "sate.cupos.guardar": "Guarda el marcador SATE:", "sate.cupos.paso_datos": "pulsa el marcador «SATE» y después «Copiar mis datos».", "sate.cupos.traer": "Traer mis datos del SAES", "sate.cupos.que_hace": "Consulta los lugares disponibles en el SAES y compáralos con tu horario de SATE. Es solo lectura; no realiza inscripciones.", "sate.cupos.paso_instalar": "Arrastra este marcador a tu barra de marcadores: ", "sate.cupos.paso_saes": "Abre el SAES de tu unidad académica e inicia sesión.", "sate.cupos.paso_consultar": "Pulsa el marcador «SATE» y elige «Consultar cupos».", "sate.cupos.conectando": "Conectando con la ventana de SATE…", "sate.cupos.conectado": "Conectado a SATE", "sate.cupos.conectada": "Última consulta {hora} · conectado a SATE", "sate.cupos.cerrada": "Ventana de SATE cerrada", "sate.cupos.reabrir": "Abrir ventana de SATE", "sate.cupos.cuenta": "Consultar en {n, plural, one {# segundo} other {# segundos}}", "sate.cupos.profesor": "Profesor", "sate.cupos.horario": "Horario", "sate.cupos.detalle": "Detalle del grupo", "sate.cupos.dias": "Lun|Mar|Mié|Jue|Vie|Sáb|Dom", "sate.cupos.error_oferta": "No se pudo cargar la oferta de SATE para mostrar profesores y horarios. Vuelve a abrir esta ventana.", "sate.cupos.auto": "Actualizar cada minuto", "sate.cupos.auto_breve": "Cada minuto", "sate.cupos.sonido": "Sonido", "sate.cupos.notificacion": "Notificación", "sate.cupos.auto_activa": "Consulta automática activa · 60 s", "sate.cupos.auto_pausa": "Consulta automática en pausa mientras esta pestaña está oculta.", "sate.cupos.auto_fin": "Terminó la consulta automática de 30 min. Puedes continuar cuando lo necesites.", "sate.cupos.auto_apagada": "Consulta automática desactivada.", "sate.cupos.seguir": "Seguir 30 min más", "sate.cupos.aviso": "{materia} · {grupo}: {n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.titulo_avisos": "{n, plural, one {(#) Cupos} other {(#) Cupos}}", "sate.cupos.permitir": "Permitir notificaciones", "sate.cupos.permiso_listo": "Notificaciones permitidas.", "sate.cupos.permiso_panel": "Las notificaciones no están permitidas o no están disponibles. Los cambios seguirán apareciendo aquí; el sonido depende de tu casilla «Sonido» y de que la pestaña esté visible.", "sate.cupos.titulo": "Cupos", "sate.cupos.cerrar": "Cerrar Cupos", "sate.cupos.carrera": "Carrera", "sate.cupos.plan": "Plan", "sate.cupos.grupo": "Grupo", "sate.cupos.materia": "Unidad de aprendizaje", "sate.cupos.cupo": "Cupo", "sate.cupos.inscritos": "Inscritos", "sate.cupos.disponibles": "Disponibles", "sate.cupos.cambio": "Cambio", "sate.cupos.actualizar": "Actualizar", "sate.cupos.abrir_sate": "Ver en SATE", "sate.cupos.consultar": "Consultar cupos", "sate.cupos.actualizar_consulta": "Actualizar cupos", "sate.cupos.filtro": "Filtrar materia o grupo", "sate.cupos.elegidos": "Grupos elegidos en SATE", "sate.cupos.todos": "Disponibilidad de los grupos", "sate.cupos.sin_coincidencias": "No hay grupos que coincidan con la selección o el filtro.", "sate.cupos.lleno": "Sin lugares", "sate.cupos.lugares": "{n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.hace": "hace {n, plural, one {# minuto} other {# minutos}}", "sate.cupos.sin_actualizar": "sin actualizar", "sate.cupos.omitir": "Omitir grupos llenos", "sate.cupos.ayuda": "Instala el marcador «SATE», inicia sesión en el SAES y pulsa «Consultar cupos» en la ventana del marcador.", "sate.cupos.limites": "Solo lectura del periodo actual. Los lugares pueden cambiar antes de tu reinscripción. Consulta manual cada 15 s; automática cada 60 s.", "sate.cupos.inicio": "Elige carrera y plan y pulsa «Consultar cupos».", "sate.cupos.consultando": "Consultando disponibilidad…", "sate.cupos.ultima": "Última consulta: {hora}", "sate.cupos.antigua": "Consulta antigua", "sate.cupos.antigua_ayuda": "Pasó más de una hora: «Omitir grupos llenos» queda desmarcada. Actualiza la consulta antes de usar ese filtro.", "sate.cupos.dejar_abierta": "Mantén abierta esta ventana mientras consultas en el SAES.", "sate.cupos.grupos": "{n, plural, one {# grupo} other {# grupos}}", "sate.cupos.esperando": "Esperando tu consulta desde el marcador SATE.", "sate.cupos.esperar": "Espera al menos 15 s entre consultas.", "sate.cupos.nube_guardada": "Consulta guardada en OneDrive.", "sate.cupos.error_nube": "La consulta está en este navegador. No se pudo sincronizar con OneDrive; vuelve a sincronizar tu cuenta.", "sate.cupos.horario_lleno": "Tu horario tiene grupos llenos según la última consulta.", "sate.cupos.alternativas": "Buscar alternativas con lugar", "sate.cupos.tu_horario": "Tu horario", "sate.cupos.tu_grupo": "Tu grupo", "sate.cupos.nivel": "Nivel", "sate.cupos.todos_niveles": "Todos", "sate.cupos.orden": "Orden por lugares", "sate.cupos.orden_mas": "Más lugares primero", "sate.cupos.orden_menos": "Menos lugares primero", "sate.cupos.sin_dato": "Sin dato en esta consulta", "sate.cupos.sin_horas": "Sin horario para comprobar choques", "sate.cupos.con_choque": "Choca con tu horario", "sate.cupos.sin_choque": "Sin choque con tu horario", "sate.cupos.solo_saes": "Ejecuta Cupos dentro del SAES de tu unidad académica, con tu sesión iniciada.", "sate.cupos.ventana": "El navegador bloqueó la ventana de SATE. En la barra de direcciones, permite las ventanas emergentes para el SAES y pulsa «Abrir ventana de SATE».", "sate.cupos.sin_sitio": "No se encontró la dirección de SATE para recibir los cupos. Instala el marcador desde el sitio de SATE.", "sate.cupos.error_sesion": "Inicia sesión en el SAES y vuelve a elegir «Consultar cupos» en el marcador SATE.", "sate.cupos.error_vacia": "El SAES no muestra grupos para esta consulta. Revisa carrera y plan y vuelve a actualizar.", "sate.cupos.error_columnas": "La tabla del SAES tiene columnas distintas. No se interpretaron los cupos; informa este cambio para revisar el marcador.", "sate.cupos.error_numeros": "La tabla contiene valores de cupo no válidos. No se actualizaron los datos.", "sate.cupos.error_http": "El SAES no pudo responder la consulta. Vuelve a pulsar «Actualizar».", "sate.cupos.error_seleccion": "El SAES no confirmó la carrera o el plan elegidos. Revisa los selectores y vuelve a consultar.", "sate.cupos.error_plan": "El plan elegido no corresponde a esta carrera. Se cargaron sus planes; elige uno y vuelve a actualizar.", "sate.cupos.error_red": "No se pudo consultar el SAES. Revisa tu conexión y vuelve a pulsar «Actualizar».", "componentes.cerrar": "Cerrar", "componentes.descartar": "Descartar", "componentes.barra.etiqueta": "Secciones", "componentes.ayuda.boton": "Ayuda", "componentes.ayuda.titulo": "Ayuda", "componentes.estado.ok": "Todo en orden", "componentes.estado.aviso": "Atención", "componentes.estado.error": "Requiere acción", "componentes.estado.info": "Información", "componentes.migas": "Ruta de navegación", "componentes.volver_a": "Volver a {destino}", "componentes.buscar_borrar": "Borrar búsqueda", "componentes.pestana_nueva": "Se abre en una pestaña nueva"},tx=k=>textos['sate.cupos.'+k]||k;
  function leer(resultadoSate=window.IPNTSateResultado){(async function () {
var TOOL = 'horarios-upiita.html';
var resultado = window.IPNTSateResultado;
if (typeof resultadoSate === 'function') resultado = resultadoSate;
var UM = location.hostname.match(/(?:^|\.)saes\.([a-z0-9-]+)\.ipn\.mx$/i);
if (!UM) {
resultado(null, TOOL, '');
return;
}
var UNIDAD = UM[1].toLowerCase();
var SIG = {"cicsma": "CICS Milpa Alta", "enba": "ENBA", "encb": "ENCB", "enmh": "ENMH", "escasto": "ESCA Santo Tomás", "escatep": "ESCA Tepepan", "escom": "ESCOM", "ese": "ESE", "eseo": "ESEO", "esfm": "ESFM", "esiat": "ESIA Ticomán", "esiatec": "ESIA Tecamachalco", "esiaz": "ESIA Zacatenco", "esimeazc": "ESIME Azcapotzalco", "esimecul": "ESIME Culhuacán", "esimetic": "ESIME Ticomán", "esimez": "ESIME Zacatenco", "esime-zac": "ESIME Zacatenco", "esiqie": "ESIQIE", "esit": "ESIT", "esm": "ESM", "est": "EST", "upibi": "UPIBI", "upiem": "UPIEM", "upiic": "UPIIC", "upiicsa": "UPIICSA", "upiig": "UPIIG", "upiih": "UPIIH", "upiip": "UPIIP", "upiit": "UPIIT", "upiita": "UPIITA", "upiiz": "UPIIZ"}[UNIDAD] || UNIDAD.toUpperCase();
if (TOOL) TOOL = TOOL.replace(/horarios(-[a-z]+)?\.html$/, ["upiita", "escom", "upibi"].includes(UNIDAD) ? 'horarios-' + UNIDAD + '.html' : 'sate/index.html?sateUnidad=' + UNIDAD);
// claves: letra + 3 dígitos (B101) o con letras (optativas de la ESCOM); siempre con al menos un dígito
var CLAVE = /^(?=[A-Z0-9]*\d)[A-Z][A-Z0-9]{2,6}$/i;
var byId = function (d, id) { return d.querySelector('[id$="mainCopy_' + id + '"]'); };
var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
var num = function (s) { var m = clean(s).replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; };
var getRaw = async function (path) {
var r = await fetch(path, { credentials: 'same-origin' });
return new DOMParser().parseFromString(await r.text(), 'text/html');
};
var get = async function (path) {
var d = await getRaw(path);
if (!byId(d, 'Lbl_Nombre') && !d.querySelector('[id*="Lbl_Kardex"]')) throw new Error('sesion');
return d;
};
var pairs = function (d) {
var out = {};
d.querySelectorAll('table').forEach(function (t) {
var rows = Array.prototype.slice.call(t.rows);
for (var i = 0; i < rows.length - 1; i++) {
var h = Array.prototype.map.call(rows[i].cells, function (c) { return clean(c.textContent); });
var v = Array.prototype.map.call(rows[i + 1].cells, function (c) { return clean(c.textContent); });
if (h.length > 1 && h.length === v.length && h.every(function (x) { return /[a-z]/i.test(x) && !/^\d/.test(x); })) {
h.forEach(function (k, j) { if (!(k in out)) out[k] = v[j]; });
}
}
});
return out;
};
var pick = function (o, re) { for (var k in o) if (re.test(k)) return o[k]; return null; };
var label = function (d, re) {
var cells = d.querySelectorAll('td');
for (var i = 0; i < cells.length - 1; i++) if (re.test(clean(cells[i].textContent))) return clean(cells[i + 1].textContent) || null;
return null;
};
resultado(undefined, TOOL, SIG);
try {
var cita = await get('/Alumnos/Reinscripciones/fichas_reinscripcion.aspx');
var kx = await get('/Alumnos/boleta/kardex.aspx');
var gen = clean((byId(cita, 'Lbl_General') || {}).textContent);
var p = pairs(cita);
var acred = [], kxRep = [], materias = {}, creditosMaterias = {};
var materia = function (k, n, s) {
if (!CLAVE.test(k || '')) return;
k = k.toUpperCase();
var anterior = materias[k] || [k, null];
materias[k] = [clean(n) || anterior[0], s > 0 ? s : anterior[1]];
};
var semestreTitulo = function (s) {
s = clean(s).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
var m = s.match(/^(?:(?:SEMESTRE|NIVEL)\s*:?)?\s*(\d{1,2})[º°.o]?(?:\s*(?:SEMESTRE|NIVEL))?$/);
if (m) return +m[1] || null;
var ordinales = ['PRIMER','SEGUNDO','TERCER','CUARTO','QUINTO','SEXTO','SEPTIMO','OCTAVO','NOVENO','DECIMO','UNDECIMO','DUODECIMO'];
m = s.match(/^(\w+)\s+(?:SEMESTRE|NIVEL)$/);
var ordinal = m ? m[1].replace(/^PRIMERO$/, 'PRIMER').replace(/^TERCERO$/, 'TERCER') : '';
return ordinales.indexOf(ordinal) >= 0 ? ordinales.indexOf(ordinal) + 1 : null;
};
var ordenTabla = 0;
kx.querySelectorAll('[id*="Lbl_Kardex"] table').forEach(function (tabla) {
var filas = Array.prototype.slice.call(tabla.rows).filter(function (tr) { return tr.closest('table') === tabla; });
if (!filas.some(function (tr) { return tr.cells.length >= 6 && CLAVE.test(clean(tr.cells[0].textContent)); })) return;
ordenTabla++;
var titulo = tabla.caption ? semestreTitulo(tabla.caption.textContent) : null;
filas.forEach(function (tr) { titulo = semestreTitulo(tr.textContent) || titulo; });
var previo = tabla.previousElementSibling;
while (previo && !clean(previo.textContent)) previo = previo.previousElementSibling;
if (!titulo && previo && previo.tagName !== 'TABLE') titulo = semestreTitulo(previo.textContent);
var semestre = titulo || ordenTabla;
// Algunas unidades informan créditos; solo se leen si el encabezado identifica la columna.
var columnaCreditos = -1;
var columnasKardex = {cal: 5, periodo: 3, forma: 4};
filas.forEach(function (tr) {
Array.prototype.forEach.call(tr.cells, function (celda, i) {
if (/^cr[eé]ditos$/i.test(clean(celda.textContent))) columnaCreditos = i;
if (/^calificaci[oó]n$/i.test(clean(celda.textContent))) columnasKardex.cal = i;
if (/^periodo$/i.test(clean(celda.textContent))) columnasKardex.periodo = i;
if (/^forma\s+eval/i.test(clean(celda.textContent))) columnasKardex.forma = i;
});
});
filas.forEach(function (tr) {
var c = Array.prototype.map.call(tr.cells, function (x) { return clean(x.textContent); });
if (c.length >= 6 && CLAVE.test(c[0])) {
materia(c[0], c[1], semestre);
var creditos = columnaCreditos >= 0 ? num(c[columnaCreditos]) : null;
if (creditos !== null && creditos >= 0) creditosMaterias[c[0].toUpperCase()] = creditos;
var cal = num(c[columnasKardex.cal]);
if (cal !== null && cal >= 6) acred.push([c[0].toUpperCase(), cal, c[columnasKardex.periodo], c[columnasKardex.forma]]);
else if (cal !== null && cal >= 0) kxRep.push([c[0].toUpperCase(), cal, c[columnasKardex.periodo], c[columnasKardex.forma]]);   // reprobadas que aparecen en el kárdex (cuentan en el promedio oficial)
}
});
});
var repro = [];
cita.querySelectorAll('table').forEach(function (t) {
var rows = Array.prototype.slice.call(t.rows), on = false;
rows.forEach(function (r) {
var c = Array.prototype.map.call(r.cells, function (x) { return clean(x.textContent); });
if (/^descripci/i.test(c[0] || '')) { on = true; return; }
if (on && c.length >= 2 && !/total/i.test(c[0]) && num(c[1]) !== null) repro.push([c[0], num(c[1])]);
});
});
var estado = [], curso = [], horario = [], secc = { reprobadas: [], no_cursadas: [], desfasadas: [] };
try {
var est = await getRaw('/Alumnos/boleta/Estado_Alumno.aspx'), sec = 'reprobadas';
est.querySelectorAll('[id*="mainCopy_"]').forEach(function (el) {
var t = clean(el.value || (el.tagName === 'TABLE' ? '' : el.textContent));
if (el.tagName !== 'TABLE' && !el.closest('[id*="GV_"]') && !el.querySelector('table') && /^MATERIAS\s/i.test(t)) { sec = /NO CURSADAS/i.test(t) ? 'no_cursadas' : /DESFASADAS/i.test(t) ? 'desfasadas' : 'reprobadas'; return; }
if (el.tagName !== 'TABLE' || !/GV_/i.test(el.id)) return;
var dest = /Reprobadas/i.test(el.id) ? 'reprobadas' : sec;   // UPIITA: GV_Reprobadas
Array.prototype.slice.call(el.rows, 1).forEach(function (r) {
var c = Array.prototype.map.call(r.cells, function (x) { return clean(x.textContent); });
if (CLAVE.test(c[1] || '')) {
secc[dest].push([c[1].toUpperCase(), c[3] || null, num(c[4]), num(c[0])]);
materia(c[1], c[2], num(c[0]));
}
});
});
estado = secc.reprobadas.map(function (r) { return r.slice(0, 3); });
} catch (e) { estado = null; secc = null; }
try {
var hor = await getRaw('/Alumnos/Informacion_semestral/Horario_Alumno.aspx');
hor.querySelectorAll('[id*="GV_Horario"] [id*="Lbl_Materia"]').forEach(function (s) {
var m = clean(s.textContent).match(/^((?=[A-Z0-9]*\d)[A-Z][A-Z0-9]{2,6})\b/i);
if (m) { curso.push(m[1].toUpperCase()); materia(m[1], clean(s.textContent).slice(m[0].length).replace(/^\s*-\s*/, ''), null); }
});
var gvh = byId(hor, 'GV_Horario');
if (gvh && gvh.rows.length > 1) {
var DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
var hdr = Array.prototype.map.call(gvh.rows[0].cells, function (c) { return clean(c.textContent).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); });
var mins = function (t) { var x = t.split(':'); return +x[0] * 60 + +x[1]; };
Array.prototype.slice.call(gvh.rows, 1).forEach(function (r) {
var c = Array.prototype.map.call(r.cells, function (x) { return clean(x.textContent); });
var m = (c[1] || '').match(/^((?=[A-Z0-9]*\d)[A-Z][A-Z0-9]{2,6})\s*-\s*(.*)$/i);
if (!m) return;
materia(m[1], m[2], null);
if (curso.indexOf(m[1].toUpperCase()) < 0) curso.push(m[1].toUpperCase());
var ses = [];
hdr.forEach(function (h, i) {
var d = DIAS.indexOf(h), t = (c[i] || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
if (d >= 0 && t) ses.push([d, mins(t[1]), mins(t[2])]);
});
horario.push([c[0], m[1].toUpperCase(), m[2], c[2] || '', ses]);
});
}
} catch (e) { curso = null; horario = null; }
var agenda = [];
try {
var MES = { ene: 0, jan: 0, feb: 1, mar: 2, abr: 3, apr: 3, may: 4, jun: 5, jul: 6, ago: 7, aug: 7, sep: 8, oct: 9, nov: 10, dic: 11, dec: 11 };
var fecha = function (s) {
var m = clean(s).toLowerCase().match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
return m && MES[m[1]] != null ? m[3] + '-' + String(MES[m[1]] + 1).padStart(2, '0') + '-' + String(+m[2]).padStart(2, '0') : null;
};
var ag = byId(await getRaw('/Academica/agenda_escolar.aspx'), 'GVAgenda');
if (ag) Array.prototype.slice.call(ag.rows, 1).forEach(function (r) {
var c = Array.prototype.map.call(r.cells, function (x) { return clean(x.textContent); });
if (c[0]) agenda.push([c[0], fecha(c[1]), fecha(c[2])]);
});
} catch (e) { agenda = null; }
var freq = {}; acred.forEach(function (a) { freq[a[0][0]] = (freq[a[0][0]] || 0) + 1; });
var claveCar = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; })[0] || null;
var data = {
upiita_saes: 1,
unidad: UNIDAD,
materias: materias,
leido: new Date().toISOString(),
boleta: (gen.match(/BOLETA:\s*(\d{10})/i) || [])[1] || ((label(cita, /^BOLETA:?$/i) || '').match(/\d{10}/) || [])[0] || null,
nombre: (gen.match(/NOMBRE:\s*(.+?)\s*(CARRERA|PLAN|$)/i) || [])[1] || label(cita, /^NOMBRE:?$/i) || clean((byId(cita, 'Lbl_Nombre') || {}).textContent),
carrera: claveCar,
carrera_nombre: clean((cita.querySelector('[id$="mainCopy_DpdCarrera"] option:checked') || {}).textContent),
plan: (cita.querySelector('[id$="mainCopy_dpdPlanEstudios"] option:checked') || {}).value || null,
// el promedio aparece en la cita de reinscripción; si no está publicada, se busca en el kárdex («PROMEDIO: 8.14»)
promedio: num(pick(p, /^promedio/i)) ?? num(label(kx, /^promedio/i)) ??
num(((clean(kx.body ? kx.body.textContent : kx.textContent) || '').match(/PROMEDIO(?:\s+GENERAL)?\s*:?\s*(\d{1,2}(?:\.\d{1,2})?)/i) || [])[1]),
reprobadas_num: num(pick(p, /reprobadas$/i)),
cita: { inicio: pick(p, /fecha inscrip/i), fin: pick(p, /caducidad/i) },
carga: {
total: num(pick(p, /^total de creditos$/i)), max: num(pick(p, /m.xima de creditos/i)),
media: num(pick(p, /media de creditos/i)), min: num(pick(p, /m.nima de creditos/i)),
duracion: num(pick(p, /duraci.n de la carrera en/i)), duracion_max: num(pick(p, /duraci.n m.xima/i))
},
avance: {
obtenidos: num(pick(p, /has obtenido/i)), faltan: num(pick(p, /te faltan/i)),
cursados: num(pick(p, /que cursaste/i)), disponibles: num(pick(p, /disponibles/i)),
autorizada: pick(p, /carga autorizada/i)
},
reprobadas: repro,
desfase_saes: pick(p, /reprobadas de \d/i),
reprobadas_periodo: estado,
no_cursadas: secc ? secc.no_cursadas : null,
desfasadas_saes: secc ? secc.desfasadas : null,
en_curso: curso,
horario_inscrito: horario,
acreditadas: acred,
creditos_materias: creditosMaterias,
kardex_reprobadas: kxRep,
agenda: agenda,
lector: '99b185c'
};
resultado(data, TOOL, SIG);
} catch (e) {
console.warn('SATE: lectura no disponible', {unidad: UNIDAD, codigo: e.message === 'sesion' ? 'sesion' : 'lectura'});
resultado(null, TOOL, SIG);
}
})();}
  function cupos(){/* Cupos: lectura de ocupabilidad y funciones compartidas con SATE. */
(function(raiz){
  'use strict';
  const origenSaes=o=>/^https:\/\/(www\.)?saes\.[a-z0-9]+\.ipn\.mx$/.test(o);
  const origenSate=(o,url)=>!!url&&o===new URL(url).origin;
  const clave=f=>f.grupo+'|'+f.materia;
  // «Pocos lugares»: menos de POCOS (decisión del dueño, 2026-10-14). Única fuente para SATE y el marcador.
  const POCOS=10,CASI=3,pocos=n=>n>0&&n<POCOS;
  function parsear(doc){
    if(doc.querySelector('input[type="password"]'))throw new Error('sesion');
    const tabla=doc.querySelector('#ctl00_mainCopy_GrvOcupabilidad');
    if(!tabla)throw new Error('vacia');
    const rows=[...tabla.querySelectorAll('tr')];
    const normal=s=>s.trim().replace(/\s+/g,' ').toLowerCase();
    const headers=['grupo','materia','nombre de la materia','semestre','cupo','inscritos','disponibles'];
    if(!rows.length||[...rows[0].children].map(c=>normal(c.textContent)).join('|')!==headers.join('|'))throw new Error('columnas');
    const filas=rows.slice(1).filter(r=>r.children.length===7).map(r=>{
      const c=[...r.children].map(x=>x.textContent.trim());
      if(!c.slice(4).every(x=>/^\d+$/.test(x)))throw new Error('numeros');
      return {grupo:c[0],materia:c[1],nombre:c[2],nivel:c[3],cupo:+c[4],inscritos:+c[5],disponibles:+c[6]};
    });
    if(!filas.length)throw new Error('vacia');
    if(rows.slice(1).some(r=>r.children.length!==7))throw new Error('columnas');
    return filas;
  }
  function validar(d){
    return d?.tipo==='ipnt.cupos.datos'&&d.v===1&&typeof d.unidad==='string'&&/^[a-z0-9]+$/.test(d.unidad)&&
      typeof d.carrera==='string'&&d.carrera.length<=40&&typeof d.plan==='string'&&d.plan.length<=40&&typeof d.hora==='string'&&Number.isFinite(Date.parse(d.hora))&&
      Date.parse(d.hora)<=Date.now()+60000&&Array.isArray(d.filas)&&d.filas.length<=5000&&d.filas.every(f=>
        f&&typeof f.grupo==='string'&&f.grupo.length<=40&&typeof f.materia==='string'&&f.materia.length<=40&&
        ['nombre','nivel'].every(k=>f[k]===undefined||typeof f[k]==='string'&&f[k].length<=500)&&
        ['cupo','inscritos','disponibles'].every(k=>Number.isSafeInteger(f[k])&&f[k]>=0));
  }
  const antigua=d=>!d||Date.now()-Date.parse(d.hora)>3600000;
  const limpiar=d=>({tipo:'ipnt.cupos.datos',v:1,unidad:d.unidad,carrera:d.carrera,plan:d.plan,hora:d.hora,
    filas:d.filas.map(({grupo,materia,cupo,inscritos,disponibles,nombre,nivel})=>({grupo,materia,cupo,inscritos,disponibles,...(nombre===undefined?{}:{nombre}),...(nivel===undefined?{}:{nivel})}))});
  const reciente=(a,b)=>validar(b)&&(!validar(a)||Date.parse(b.hora)>Date.parse(a.hora))?b:a;
  const fecha=d=>new Date(d.hora).toLocaleString('es-MX',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  function cambios(antes,despues,grupos){
    if(!antes||antes.carrera!==despues.carrera||antes.plan!==despues.plan)return [];
    const prev=new Map(antes.filas.map(f=>[clave(f),f.disponibles])),propios=new Set(grupos.map(clave));
    return despues.filas.filter(f=>{const a=prev.get(clave(f)),n=f.disponibles;
      return propios.has(clave(f))&&a!==undefined&&a!==n&&(a===0&&n>0||n===0||a>=POCOS&&n<POCOS||n<=CASI);
    });
  }
  function tarjetas(datos,seleccion,oferta){return seleccion.map(s=>({...s,fila:datos.filas.find(f=>clave(f)===clave(s)),alternativas:datos.filas.filter(f=>f.materia===s.materia&&f.grupo!==s.grupo&&f.disponibles>0).map(f=>{
    const o=oferta.find(o=>clave(o)===clave(f));
    return {...f,choque:!o?null:seleccion.some(t=>t.materia!==s.materia&&t.horas.some(a=>o.horas.some(b=>a[0]===b[0]&&a[1]<b[2]&&b[1]<a[2])))};
  })}))}
  async function consultar({fetch:pedir,parser,url,carrera,plan,opciones}){
    async function leer(body){
      let r;
      try{r=await pedir(url,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',redirect:'manual',
        ...(body?{headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()}:{})})}
      catch(e){throw Object.assign(new Error('red'),{etapa:body?.get('__EVENTTARGET')||'GET'})}
      if(r.type==='opaqueredirect'||r.status>=300&&r.status<400)throw Object.assign(new Error('sesion'),{etapa:body?.get('__EVENTTARGET')||'GET',estado:r.status});
      if(new URL(r.url||url).origin!==new URL(url).origin||!/\/Academica\/Ocupabilidad_grupos\.aspx$/i.test(new URL(r.url||url).pathname))throw new Error('sesion');
      if(!r.ok)throw Object.assign(new Error('http'),{etapa:body?.get('__EVENTTARGET')||'GET',estado:r.status});
      const doc=parser(await r.text());if(doc.querySelector('input[type="password"]'))throw new Error('sesion');return doc;
    }
    let doc=await leer();
    const select=id=>doc.querySelector('[name="ctl00$mainCopy$'+id+'"]');
    async function post(target,val){
      const body=new URLSearchParams();
      for(const el of doc.querySelectorAll('input[type="hidden"],select'))if(el.name&&!el.disabled)body.set(el.name,el.value);
      body.set('ctl00$mainCopy$rblEsquema','1');body.set('__EVENTTARGET','ctl00$mainCopy$'+target);body.set('__EVENTARGUMENT','');body.set('__LASTFOCUS','');
      if(target!=='rblEsquema$0')body.set('ctl00$mainCopy$'+target,val);doc=await leer(body);
    }
    // El SAES muestra carrera y plan solo después de elegir «Periodo Escolar Actual» (verificado con sesión real, 2026-10-14).
    await post('rblEsquema$0','1');
    if(!select('dpdcarrera')||!select('dpdplan'))throw new Error('sesion');
    if(['Chkespecialidad','ChkSemestre','Chkgrupo','Chkmateria'].some(k=>doc.querySelector('[name="ctl00$mainCopy$'+k+'"]:checked')))await post('dpdcarrera',select('dpdcarrera').value);
    carrera=carrera||select('dpdcarrera').value;
    if(![...select('dpdcarrera').options].some(o=>o.value===carrera))throw new Error('seleccion');
    await post('dpdcarrera',carrera);
    const planes=[...select('dpdplan').options];
    if(plan&&!planes.some(o=>o.value===plan)){opciones(doc);throw new Error('plan')}
    plan=plan||select('dpdplan').value;
    if(select('dpdplan').value!==plan)await post('dpdplan',plan);
    opciones(doc);
    if(select('dpdcarrera').value!==carrera||select('dpdplan').value!==plan||!doc.querySelector('[name="ctl00$mainCopy$rblEsquema"][value="1"]:checked'))throw new Error('seleccion');
    return {carrera,plan,filas:parsear(doc)};
  }
  function texto(textos,k,v={}){
    const s=textos['sate.cupos.'+k]||k;
    return s.replace(/\{(\w+),\s*plural,\s*((?:[^{}]*\{[^{}]*\})+)\s*\}/g,(_,key,cuerpo)=>{
      const n=Number(v[key]),op={};cuerpo.replace(/(=?\w+)\s*\{([^{}]*)\}/g,(_,c,t)=>{op[c]=t});
      return (op['='+n]??op[new Intl.PluralRules('es-MX').select(n)]??op.other??'').replace(/#/g,new Intl.NumberFormat('es-MX').format(n));
    }).replace(/\{(\w+)\}/g,(_,key)=>v[key]??'');
  }
  function notificar(titulo,opciones){
    if(typeof raiz.Notification!=='function'||raiz.Notification.permission!=='granted')return;
    const directo=()=>{try{const n=new raiz.Notification(titulo,opciones);n.onclick=()=>{raiz.focus();n.close()}}catch(e){/* Algunas plataformas solo admiten notificaciones persistentes. */}};
    const sw=raiz.navigator?.serviceWorker;
    if(sw?.getRegistration)Promise.resolve().then(()=>sw.getRegistration()).then(r=>r?sw.ready:null).then(r=>r?.showNotification?r.showNotification(titulo,opciones):directo()).catch(()=>{});
    else directo();
  }
  raiz.IPNCupos={POCOS,pocos,texto,origenSaes,origenSate,clave,parsear,validar,limpiar,antigua,reciente,fecha,tarjetas,consultar,cambios,notificar};
})(typeof window==='undefined'?globalThis:window);

/*__CUPOS_PANEL__*/
window.IPNCuposMontar=function(revision){
  'use strict';
  window.IPNCuposCerrar?.();
  const contenedor=revision?.contenedor||window.IPNTSateContenedor;delete window.IPNTSateContenedor;
  const leerAlumno=window.IPNTSateLeer;
  let alumno,lectorError=false,lecturaAlumno=0;
  const URL_SATE="",textos={"sate.cupos.alumno_actualizado": "Datos del SAES actualizados a las {hora}", "sate.cupos.alumno_error": "No se pudieron actualizar tus datos del SAES. Los cupos siguen disponibles; vuelve a consultar para reintentar.", "sate.cupos.resumen_titulo": "Unidades de aprendizaje elegidas", "sate.cupos.resumen_riesgo": "{n} grupos con cupo limitado o agotado · Ver alternativas", "sate.cupos.sugerencias": "Ver grupos alternativos", "sate.cupos.misma_materia": "Otro grupo de la misma unidad de aprendizaje", "sate.cupos.mismo_horario": "Otras unidades de aprendizaje disponibles", "sate.cupos.mismo_horario_ayuda": "Grupos que caben en el hueco o no chocan con tu selección.", "sate.cupos.recomendada": "Recomendada", "sate.cupos.tipo_misma_materia": "Misma materia, otro grupo", "sate.cupos.tipo_mismo_horario": "Mismo horario", "sate.cupos.tipo_ocupa_hueco": "Ocupa el hueco", "sate.cupos.todas_disponibles": "Ver todas las disponibles · {n}", "sate.cupos.cambiar": "Cambiar", "sate.cupos.ver_horario": "Ver mi horario", "sate.cupos.cambio_carga": "La carga queda fuera de los límites conocidos: {n} créditos; mínima {min}, máxima autorizada {max}.", "sate.cupos.tu_horario_cupos": "Tu horario con cupos", "sate.cupos.buscar_sin_llenos": "Buscar horarios con cupo disponible", "sate.cupos.oferta_completa": "Toda la oferta con cupos", "sate.cupos.abrir_completo": "Abrir SATE completo", "sate.cupos.en_riesgo": "En riesgo", "sate.cupos.pocos": "Pocos lugares (menos de 10)", "sate.cupos.con_lugar": "Con lugar", "sate.cupos.conectado_saes": "conectado al SAES", "sate.cupos.consulta_local": "consulta guardada", "sate.cupos.cambiar_grupo": "Cambiar a este grupo", "sate.cupos.deshacer": "Deshacer", "sate.cupos.cambio_listo": "Tu horario se actualizó. Puedes deshacer este cambio.", "sate.cupos.cambio_deshecho": "Se restauró tu horario anterior.", "sate.cupos.deshacer_conflicto": "Tu horario cambió después. Revisa la selección actual antes de reemplazarla.", "sate.cupos.choque_con": "Choca con {nombre}", "sate.cupos.sin_alternativas": "No hay otro grupo de esta materia con lugar en la consulta.", "sate.cupos.sin_riesgo": "Tus grupos no tienen alertas de cupo en esta consulta. Revisa también los grupos sin dato.", "sate.cupos.horario_vacio_vista": "Arma tu horario en SATE completo para explorar alternativas aquí.", "sate.cupos.opcion_vista": "Opción {n}", "sate.cupos.usar_opcion": "Usar esta opción", "sate.cupos.sin_opciones": "No se encontró un horario completo sin grupos llenos con tus preferencias actuales. Puedes revisar la oferta o ajustar las preferencias en SATE completo.", "sate.cupos.error_busqueda": "No se pudo buscar el horario. Intenta de nuevo.", "sate.cupos.modo_saes": "En esta pestaña", "sate.cupos.modo_ventana": "En otra ventana", "sate.cupos.ver_cupos": "Ver cupos", "sate.cupos.avisos_mas": "Avisos y más", "sate.cupos.config_titulo": "Avisos y consulta", "sate.cupos.ritmo_ayuda": "Consulta manual: cada 15 s como mínimo. Automática: cada minuto o más, durante 30 min. Solo lectura del SAES.", "sate.cupos.auto_consulta": "Consulta automática", "sate.cupos.intervalo_aria": "Cada cuánto consultar", "sate.cupos.cada_n": "{n, plural, one {Cada # minuto} other {Cada # minutos}}", "sate.cupos.auto_activa_cada": "Consulta automática activa · {n, plural, one {cada # minuto} other {cada # minutos}}", "sate.cupos.auto_sin_conexion": "La consulta automática empieza cuando esta ventana esté conectada al SAES.", "sate.cupos.auto_en_saes": "En esta pestaña la consulta automática se activa desde el panel del marcador.", "sate.cupos.ultima_hace": "Última consulta {hora} · {n, plural, =0 {justo ahora} one {hace # minuto} other {hace # minutos}}", "sate.cupos.antigua_aviso": "Los lugares pueden haber cambiado; consulta de nuevo.", "sate.cupos.ocupados": "{inscritos} de {cupo} ocupados", "sate.cupos.tus_grupos": "Tus grupos", "sate.cupos.otros_lugar": "Otros con lugar", "sate.cupos.hoja_titulo": "Cupos · {carrera}", "sate.cupos.resumen_plegado": "Cupos · {hora} · {n} de tus grupos con lugar", "sate.cupos.resumen_sin_contexto": "Cupos · {hora} · sin grupos sincronizados", "sate.cupos.revision_titulo": "Revisión local de cupos · datos ficticios", "sate.cupos.revision_menu": "Ventana del marcador", "sate.cupos.revision_sin_nombre": "Ventana sin nombre", "sate.cupos.revision_sin_datos": "Ventana sin datos", "sate.cupos.ventana_titulo": "SATE · {unidad}", "sate.cupos.ventana_saludo": "Hola, {nombre}", "sate.cupos.ventana_listos": "Boleta {boleta} · tus datos del SAES están listos", "sate.cupos.ventana_sin_boleta": "no disponible", "sate.cupos.ventana_leyendo": "Leyendo tus datos del SAES (solo lectura)…", "sate.cupos.ventana_sin_datos": "No se encontraron datos del SAES; revisa tu sesión y vuelve a ejecutar el marcador.", "sate.cupos.ventana_privacidad": "Se leyó en tu navegador; no se envió a ningún servidor.", "sate.cupos.ventana_copiar": "Copiar mis datos", "sate.cupos.ventana_abrir": "Abrir SATE", "sate.cupos.ventana_copiar_detalle": "Copia tus datos para pegarlos en SATE.", "sate.cupos.ventana_abrir_detalle": "Revisa tu trayectoria y arma tu horario.", "sate.cupos.ventana_cupos_detalle": "Consulta los lugares disponibles en tus grupos.", "sate.cupos.ventana_volver": "← Volver", "sate.cupos.ventana_copiado": "Datos copiados. En SATE pulsa «Traer datos del SAES» y pégalos.", "sate.cupos.ventana_error_copia": "No se pudieron copiar tus datos. Permite el acceso al portapapeles y vuelve a intentarlo.", "sate.cupos.revision_hoja": "Hoja desplegada", "sate.cupos.revision_plegada": "Hoja plegada", "sate.cupos.revision_contexto": "Sin contexto", "sate.cupos.revision_tema": "Claro / oscuro", "sate.cupos.plegar": "Ocultar cupos", "sate.cupos.desplegar": "Ver cupos", "sate.cupos.abrir_detalle": "Abrir en SATE", "sate.cupos.movil_pausa": "Se detiene si cambias de pestaña o bloqueas el teléfono. Al volver, consulta si ya pasó el minuto.", "sate.cupos.sin_contexto": "Abre SATE una vez para sincronizar tu carrera, plan y grupos elegidos. Mientras tanto, consulta la tabla y usa el filtro.", "sate.cupos.contexto_sesion": "Grupos de tu última sincronización con SATE en esta sesión. Abre SATE para actualizar tu selección.", "sate.cupos.detalle_unico": "Esta consulta se recibió una sola vez. Vuelve a la pestaña del SAES para seguir consultando.", "sate.cupos.marcador": "SATE", "sate.cupos.guardar": "Guarda el marcador SATE:", "sate.cupos.paso_datos": "pulsa el marcador «SATE» y después «Copiar mis datos».", "sate.cupos.traer": "Traer mis datos del SAES", "sate.cupos.que_hace": "Consulta los lugares disponibles en el SAES y compáralos con tu horario de SATE. Es solo lectura; no realiza inscripciones.", "sate.cupos.paso_instalar": "Arrastra este marcador a tu barra de marcadores: ", "sate.cupos.paso_saes": "Abre el SAES de tu unidad académica e inicia sesión.", "sate.cupos.paso_consultar": "Pulsa el marcador «SATE» y elige «Consultar cupos».", "sate.cupos.conectando": "Conectando con la ventana de SATE…", "sate.cupos.conectado": "Conectado a SATE", "sate.cupos.conectada": "Última consulta {hora} · conectado a SATE", "sate.cupos.cerrada": "Ventana de SATE cerrada", "sate.cupos.reabrir": "Abrir ventana de SATE", "sate.cupos.cuenta": "Consultar en {n, plural, one {# segundo} other {# segundos}}", "sate.cupos.profesor": "Profesor", "sate.cupos.horario": "Horario", "sate.cupos.detalle": "Detalle del grupo", "sate.cupos.dias": "Lun|Mar|Mié|Jue|Vie|Sáb|Dom", "sate.cupos.error_oferta": "No se pudo cargar la oferta de SATE para mostrar profesores y horarios. Vuelve a abrir esta ventana.", "sate.cupos.auto": "Actualizar cada minuto", "sate.cupos.auto_breve": "Cada minuto", "sate.cupos.sonido": "Sonido", "sate.cupos.notificacion": "Notificación", "sate.cupos.auto_activa": "Consulta automática activa · 60 s", "sate.cupos.auto_pausa": "Consulta automática en pausa mientras esta pestaña está oculta.", "sate.cupos.auto_fin": "Terminó la consulta automática de 30 min. Puedes continuar cuando lo necesites.", "sate.cupos.auto_apagada": "Consulta automática desactivada.", "sate.cupos.seguir": "Seguir 30 min más", "sate.cupos.aviso": "{materia} · {grupo}: {n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.titulo_avisos": "{n, plural, one {(#) Cupos} other {(#) Cupos}}", "sate.cupos.permitir": "Permitir notificaciones", "sate.cupos.permiso_listo": "Notificaciones permitidas.", "sate.cupos.permiso_panel": "Las notificaciones no están permitidas o no están disponibles. Los cambios seguirán apareciendo aquí; el sonido depende de tu casilla «Sonido» y de que la pestaña esté visible.", "sate.cupos.titulo": "Cupos", "sate.cupos.cerrar": "Cerrar Cupos", "sate.cupos.carrera": "Carrera", "sate.cupos.plan": "Plan", "sate.cupos.grupo": "Grupo", "sate.cupos.materia": "Unidad de aprendizaje", "sate.cupos.cupo": "Cupo", "sate.cupos.inscritos": "Inscritos", "sate.cupos.disponibles": "Disponibles", "sate.cupos.cambio": "Cambio", "sate.cupos.actualizar": "Actualizar", "sate.cupos.abrir_sate": "Ver en SATE", "sate.cupos.consultar": "Consultar cupos", "sate.cupos.actualizar_consulta": "Actualizar cupos", "sate.cupos.filtro": "Filtrar materia o grupo", "sate.cupos.elegidos": "Grupos elegidos en SATE", "sate.cupos.todos": "Disponibilidad de los grupos", "sate.cupos.sin_coincidencias": "No hay grupos que coincidan con la selección o el filtro.", "sate.cupos.lleno": "Sin lugares", "sate.cupos.lugares": "{n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.hace": "hace {n, plural, one {# minuto} other {# minutos}}", "sate.cupos.sin_actualizar": "sin actualizar", "sate.cupos.omitir": "Omitir grupos llenos", "sate.cupos.ayuda": "Instala el marcador «SATE», inicia sesión en el SAES y pulsa «Consultar cupos» en la ventana del marcador.", "sate.cupos.limites": "Solo lectura del periodo actual. Los lugares pueden cambiar antes de tu reinscripción. Consulta manual cada 15 s; automática cada 60 s.", "sate.cupos.inicio": "Elige carrera y plan y pulsa «Consultar cupos».", "sate.cupos.consultando": "Consultando disponibilidad…", "sate.cupos.ultima": "Última consulta: {hora}", "sate.cupos.antigua": "Consulta antigua", "sate.cupos.antigua_ayuda": "Pasó más de una hora: «Omitir grupos llenos» queda desmarcada. Actualiza la consulta antes de usar ese filtro.", "sate.cupos.dejar_abierta": "Mantén abierta esta ventana mientras consultas en el SAES.", "sate.cupos.grupos": "{n, plural, one {# grupo} other {# grupos}}", "sate.cupos.esperando": "Esperando tu consulta desde el marcador SATE.", "sate.cupos.esperar": "Espera al menos 15 s entre consultas.", "sate.cupos.nube_guardada": "Consulta guardada en OneDrive.", "sate.cupos.error_nube": "La consulta está en este navegador. No se pudo sincronizar con OneDrive; vuelve a sincronizar tu cuenta.", "sate.cupos.horario_lleno": "Tu horario tiene grupos llenos según la última consulta.", "sate.cupos.alternativas": "Buscar alternativas con lugar", "sate.cupos.tu_horario": "Tu horario", "sate.cupos.tu_grupo": "Tu grupo", "sate.cupos.nivel": "Nivel", "sate.cupos.todos_niveles": "Todos", "sate.cupos.orden": "Orden por lugares", "sate.cupos.orden_mas": "Más lugares primero", "sate.cupos.orden_menos": "Menos lugares primero", "sate.cupos.sin_dato": "Sin dato en esta consulta", "sate.cupos.sin_horas": "Sin horario para comprobar choques", "sate.cupos.con_choque": "Choca con tu horario", "sate.cupos.sin_choque": "Sin choque con tu horario", "sate.cupos.solo_saes": "Ejecuta Cupos dentro del SAES de tu unidad académica, con tu sesión iniciada.", "sate.cupos.ventana": "El navegador bloqueó la ventana de SATE. En la barra de direcciones, permite las ventanas emergentes para el SAES y pulsa «Abrir ventana de SATE».", "sate.cupos.sin_sitio": "No se encontró la dirección de SATE para recibir los cupos. Instala el marcador desde el sitio de SATE.", "sate.cupos.error_sesion": "Inicia sesión en el SAES y vuelve a elegir «Consultar cupos» en el marcador SATE.", "sate.cupos.error_vacia": "El SAES no muestra grupos para esta consulta. Revisa carrera y plan y vuelve a actualizar.", "sate.cupos.error_columnas": "La tabla del SAES tiene columnas distintas. No se interpretaron los cupos; informa este cambio para revisar el marcador.", "sate.cupos.error_numeros": "La tabla contiene valores de cupo no válidos. No se actualizaron los datos.", "sate.cupos.error_http": "El SAES no pudo responder la consulta. Vuelve a pulsar «Actualizar».", "sate.cupos.error_seleccion": "El SAES no confirmó la carrera o el plan elegidos. Revisa los selectores y vuelve a consultar.", "sate.cupos.error_plan": "El plan elegido no corresponde a esta carrera. Se cargaron sus planes; elige uno y vuelve a actualizar.", "sate.cupos.error_red": "No se pudo consultar el SAES. Revisa tu conexión y vuelve a pulsar «Actualizar».", "componentes.cerrar": "Cerrar", "componentes.descartar": "Descartar", "componentes.barra.etiqueta": "Secciones", "componentes.ayuda.boton": "Ayuda", "componentes.ayuda.titulo": "Ayuda", "componentes.estado.ok": "Todo en orden", "componentes.estado.aviso": "Atención", "componentes.estado.error": "Requiere acción", "componentes.estado.info": "Información", "componentes.migas": "Ruta de navegación", "componentes.volver_a": "Volver a {destino}", "componentes.buscar_borrar": "Borrar búsqueda", "componentes.pestana_nueva": "Se abre en una pestaña nueva"};
  const C=window.IPNCupos,tx=(k,v)=>C.texto(textos,k,v),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(document.getElementById('ipnt-cupos')){document.getElementById('ipnt-cupos').focus();return}
  const permitido=C.origenSaes(location.origin),unidad=permitido?location.hostname.match(/saes\.([a-z0-9]+)\.ipn\.mx$/)[1]:'',origin=URL_SATE?new URL(URL_SATE).origin:null;
  let sate=null,datos=null,carrera='',plan='',contexto='',busy=false,destruido=false,ultima=window.IPNCuposUltimaConsulta??null;
  let automatico=false,hasta=0,proxima=0,conectado=false,consultaInicial=false;
  let modo=window.matchMedia?.('(min-width: 900px) and (pointer: fine)').matches?'ventana':'saes',seleccion=null,envioPendiente=false,audio=null,avisos=0,plegada=false;
  const tituloOriginal=document.title;
  try{const p=localStorage.getItem('ipnt.cupos.modo');if(['saes','ventana'].includes(p))modo=p}catch(e){}
  try{const s=JSON.parse(sessionStorage.getItem('ipnt.cupos.contexto'));if(s&&typeof s.carrera==='string'&&s.carrera.length<=40&&typeof s.plan==='string'&&s.plan.length<=40&&Array.isArray(s.grupos)&&s.grupos.length<=500&&s.grupos.every(g=>g&&typeof g.grupo==='string'&&typeof g.materia==='string')){seleccion=s;carrera=s.carrera;plan=s.plan}}catch(e){}
  if(revision){modo='saes';seleccion=revision.seleccion;datos=revision.datos;carrera=datos.carrera;plan=datos.plan;plegada=!!revision.plegada}
  const panel=document.createElement('section');panel.id='ipnt-cupos';panel.tabIndex=-1;panel.setAttribute('aria-label',tx('titulo'));
  const estilo=document.createElement('style');estilo.textContent=`
  #ipnt-cupos,#ipnt-cupos *{all:revert;box-sizing:border-box;font:inherit;color:inherit}
  #ipnt-cupos{--ipn-texto:#29252b;--ipn-superficie:#fff;--ipn-linea:#ded8dc;--ipn-acento:#71334c;color-scheme:light dark;position:fixed;z-index:2147483646;right:12px;bottom:12px;max-width:calc(100vw - 24px);background:var(--ipn-superficie);color:var(--ipn-texto);border:1px solid var(--ipn-linea);border-radius:16px;padding:8px 16px;box-shadow:0 4px 20px #0003;font:14px/1.5 system-ui;display:flex;flex-wrap:wrap;align-items:center;gap:8px;box-sizing:border-box}
  @media(prefers-color-scheme:dark){#ipnt-cupos{--ipn-texto:#eee8eb;--ipn-superficie:#211e22;--ipn-linea:#61565e;--ipn-acento:#efb7ce}}
  #ipnt-cupos button,#ipnt-cupos input,#ipnt-cupos select{font:inherit;color:inherit;background:var(--ipn-superficie);border:1px solid var(--ipn-linea);border-radius:8px;padding:8px;min-height:44px;max-width:100%;box-sizing:border-box}#ipnt-cupos button{cursor:pointer}#ipnt-cupos label{display:flex;align-items:center;gap:8px;min-height:44px}#ipnt-cupos :focus-visible{outline:3px solid var(--ipn-acento);outline-offset:2px}#ipnt-cupos [hidden]{display:none!important}
  #ipnt-cupos[data-modo="saes"]{left:8px;right:8px;bottom:0;width:calc(100% - 16px);max-width:48rem;max-height:calc(100vh - 16px);max-height:calc(100dvh - 16px);overflow:auto;margin:auto;padding-bottom:max(12px,env(safe-area-inset-bottom));border-radius:16px 16px 0 0}
  #ipnt-cupos [data-c="hoja"]{flex-basis:100%;min-width:0;max-height:60vh;max-height:60dvh;overflow:auto;overscroll-behavior:contain;padding-right:8px;scrollbar-gutter:stable}
  #ipnt-cupos article{border:1px solid var(--ipn-linea);border-radius:8px;padding:16px;margin:8px 0;overflow-wrap:anywhere}#ipnt-cupos header{display:grid;grid-template-columns:minmax(0,1fr) 7rem;gap:8px}#ipnt-cupos strong{text-align:right}#ipnt-cupos .ipnt-tabla{max-width:100%;overflow:auto}#ipnt-cupos table{border-collapse:collapse;width:100%}#ipnt-cupos td,#ipnt-cupos th{padding:8px;text-align:left;border-bottom:1px solid var(--ipn-linea)}#ipnt-cupos td:last-child,#ipnt-cupos th:last-child{position:sticky;right:0;min-width:7rem;background:var(--ipn-superficie)}#ipnt-cupos [data-c="aviso"]{color:var(--ipn-acento);font-weight:600;overflow-wrap:anywhere}
  #ipnt-cupos .ipnt-cabecera{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%}#ipnt-cupos h2{font-size:18px;font-weight:650;margin:0;overflow-wrap:anywhere;overflow-wrap:anywhere}#ipnt-cupos h3{font-weight:650;margin:16px 0 8px}#ipnt-cupos p{margin:8px 0;font-size:13px}#ipnt-cupos p:empty{display:none}
  #ipnt-cupos [data-c="ultima"]{font-size:12px;opacity:.75}#ipnt-cupos [data-c="cerrar"]{border:0;font-size:24px;width:44px;flex:none;padding:0}
  #ipnt-cupos .ipnt-asa{width:100%;border:0;padding:0;min-height:44px;touch-action:none;display:grid;place-items:center;gap:8px}#ipnt-cupos .ipnt-tirador{display:block;width:40px;height:4px;background:var(--ipn-linea);border-radius:8px}#ipnt-cupos [data-c="resumen"]{display:none}
  #ipnt-cupos[data-plegada="true"] [data-c="resumen"]{display:block;padding:8px 0;font-size:13px}#ipnt-cupos[data-plegada="true"] .ipnt-tirador{display:none}
  #ipnt-cupos .ipnt-selectores{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin:8px 0 16px}#ipnt-cupos .ipnt-selectores label,#ipnt-cupos .ipnt-filtro{display:grid;gap:8px;font-size:13px}#ipnt-cupos select,#ipnt-cupos input[type="search"]{width:100%;font-size:16px;padding:8px}
  #ipnt-cupos .ipnt-acciones{display:flex;align-items:center;gap:8px;margin-bottom:8px}#ipnt-cupos .ipnt-primario{flex:1;background:var(--ipn-acento);color:var(--ipn-superficie);border-color:transparent;padding:8px;font-weight:600}#ipnt-cupos input[type="checkbox"]{accent-color:var(--ipn-acento);width:20px;min-height:20px;height:20px;padding:0}#ipnt-cupos .ipnt-switch{font-size:13px;white-space:nowrap}
  #ipnt-cupos summary{display:list-item;cursor:pointer;min-height:44px;padding:8px 0;font-weight:600}#ipnt-cupos details{border-top:1px solid var(--ipn-linea);margin-top:16px}#ipnt-cupos .ipnt-extras{display:grid;gap:8px}#ipnt-cupos [data-c="estado"],#ipnt-cupos [data-c="automatico"]{display:block;font-size:13px}#ipnt-cupos [data-c="automatico"]:empty{display:none}
  #ipnt-cupos[data-modo="ventana"] [data-c="hoja"]{display:block;max-height:none}#ipnt-cupos[data-modo="ventana"] .ipnt-selectores,#ipnt-cupos[data-modo="ventana"] details,#ipnt-cupos[data-modo="ventana"] .ipnt-filtro,#ipnt-cupos[data-modo="ventana"] [data-c="tabla"],#ipnt-cupos[data-modo="ventana"] [data-c="grupos"],#ipnt-cupos[data-modo="ventana"] [data-c="otros"],#ipnt-cupos[data-modo="ventana"] [data-c="sincronizar"]{display:none}
  @media(min-width:600px){#ipnt-cupos .ipnt-selectores{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}`;

  (contenedor?.getRootNode?.()||document.head).appendChild(estilo);
  panel.innerHTML=`<button data-c="plegar" class="ipnt-asa" aria-expanded="true" aria-label="${esc(tx('plegar'))}"><span class="ipnt-tirador"></span><span data-c="resumen"></span></button>
    <div data-c="cabecera" class="ipnt-cabecera"><div><h2 data-c="titulo">${esc(tx('titulo'))}</h2><span data-c="ultima"></span></div><button data-c="cerrar" aria-label="${esc(tx('cerrar'))}">×</button></div>
    <div data-c="hoja" hidden>
      <div class="ipnt-selectores"><label>${esc(tx('carrera'))}<select data-c="carrera"></select></label><label>${esc(tx('plan'))}<select data-c="plan"></select></label></div>
      <div data-c="acciones" class="ipnt-acciones"><button data-c="actualizar" class="ipnt-primario">${esc(tx('consultar'))}</button><label class="ipnt-switch"><input type="checkbox" role="switch" data-c="auto">${esc(tx('auto_breve'))}</label></div>
      <span data-c="estado" role="status" aria-live="polite">${esc(tx('conectando'))}</span><button data-c="abrir" hidden>${esc(tx('reabrir'))}</button>
      <span data-c="automatico" role="status"></span><button data-c="seguir" hidden>${esc(tx('seguir'))}</button>
      <p data-c="sincronizar"></p><p data-c="aviso" role="status" aria-live="polite"></p>
      <div data-c="grupos"></div><div data-c="otros"></div>
      <label class="ipnt-filtro">${esc(tx('filtro'))}<input type="search" data-c="filtro"></label><div data-c="tabla" class="ipnt-tabla"></div>
      <details><summary>${esc(tx('avisos_mas'))}</summary><div class="ipnt-extras"><label><input type="checkbox" data-c="sonido">${esc(tx('sonido'))}</label><button data-c="permitir" hidden>${esc(tx('permitir'))}</button><button data-c="detalle">${esc(tx('abrir_detalle'))}</button><p>${esc(tx('movil_pausa'))}</p></div></details>
    </div>`;
  if(contenedor){
    estilo.textContent+='#ipnt-sate #ipnt-cupos{--ipn-texto:inherit;--ipn-superficie:inherit;--ipn-linea:inherit;--ipn-acento:inherit}';
    estilo.textContent+=`#ipnt-sate #ipnt-cupos{position:static;width:100%;max-width:100%;max-height:none;margin:0;padding:8px 0;border:0;border-radius:12px;box-shadow:none;display:flex;flex-wrap:wrap;gap:8px;background:var(--ipn-superficie);color:var(--ipn-texto)}#ipnt-sate #ipnt-cupos [data-c="hoja"]{flex-basis:100%;min-width:0;max-height:none;overflow:visible}#ipnt-sate #ipnt-cupos [data-c="plegar"],#ipnt-sate #ipnt-cupos [data-c="cerrar"]{display:none}#ipnt-sate #ipnt-cupos button,#ipnt-sate #ipnt-cupos article{border-radius:12px}`;
    contenedor.appendChild(panel);
  }else document.body.appendChild(panel);
  panel.focus();const el=k=>panel.querySelector('[data-c="'+k+'"]');
  function enviar(d){if(sate&&!sate.closed)sate.postMessage(d,origin)}
  function preferencias(){enviar({tipo:'ipnt.cupos.avisos',v:1,unidad,hasta:automatico?hasta:0,notificacion:automatico})}
  function enviarDatos(completar=false){if(datos&&conectado&&(modo==='ventana'||envioPendiente||completar)){enviar({...C.limpiar(datos),...(alumno?{alumno}:{}),...(lectorError?{lectorError:true}:{})});envioPendiente=false}}
  function pintar(){
    panel.setAttribute('data-modo',modo);el('hoja').hidden=modo==='saes'&&plegada;el('plegar').hidden=modo!=='saes';panel.setAttribute('data-plegada',String(plegada));el('cabecera').hidden=modo==='saes'&&plegada;el('plegar').setAttribute?.('aria-expanded',String(!plegada));el('plegar').setAttribute?.('aria-label',tx(plegada?'desplegar':'plegar'));
    el('permitir').hidden=typeof window.Notification!=='function'||window.Notification.permission!=='default';
    el('sincronizar').textContent=seleccion?tx('contexto_sesion'):tx('sin_contexto');
    el('sincronizar').hidden=!!seleccion;
    const hora=datos?new Date(datos.hora).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}):tx('sin_actualizar');
    const nombre=el('carrera').selectedOptions?.[0]?.textContent||carrera;
    el('titulo').textContent=tx('hoja_titulo',{carrera:nombre.replace(/^ingenier[ií]a (en )?/i,'')});
    const grupos=seleccion&&datos&&seleccion.carrera===datos.carrera&&seleccion.plan===datos.plan?seleccion.grupos:[];
    const n=datos?grupos.filter(g=>datos.filas.some(f=>C.clave(f)===C.clave(g)&&f.disponibles>0)).length:0;
    el('resumen').textContent=tx(seleccion?'resumen_plegado':'resumen_sin_contexto',{hora,n});
    if(!datos)return;
    el('ultima').textContent=tx('ultima',{hora:C.fecha(datos)});
    const propios=seleccion?.carrera===datos.carrera&&seleccion?.plan===datos.plan?seleccion.grupos:[];
    const fila=f=>`<header><span>${esc(f.nombre||f.materia)} · ${esc(f.grupo)}</span><strong>${esc(f.disponibles===undefined?tx('sin_dato'):tx('lugares',{n:f.disponibles}))}</strong></header>`;
    el('grupos').innerHTML=propios.length?`<h3>${esc(tx('tus_grupos'))}</h3>`+C.tarjetas(datos,propios,[]).map(s=>`<article>${fila({...s,...s.fila})}</article>`).join(''):'';
    const otros=datos.filas.filter(f=>f.disponibles>0&&!propios.some(g=>C.clave(g)===C.clave(f)));
    el('otros').innerHTML=otros.length?`<h3>${esc(tx('otros_lugar'))}</h3>`+otros.map(f=>`<article>${fila(f)}</article>`).join(''):'';
    const q=(el('filtro').value||'').toLocaleLowerCase();
    el('tabla').innerHTML=`<table><caption>${esc(tx('todos'))}</caption><thead><tr><th>${esc(tx('materia'))}</th><th>${esc(tx('disponibles'))}</th></tr></thead><tbody>`+datos.filas.filter(f=>(f.grupo+' '+f.materia+' '+f.nombre).toLocaleLowerCase().includes(q)).map(f=>`<tr><td>${esc(f.nombre||f.materia)} · ${esc(f.grupo)}</td><td>${esc(tx('lugares',{n:f.disponibles}))}</td></tr>`).join('')+'</tbody></table>';
  }
  function alertar(antes){if(!automatico||modo!=='saes'||seleccion?.carrera!==datos.carrera||seleccion?.plan!==datos.plan)return;
    const cambios=C.cambios(antes,datos,seleccion.grupos);if(!cambios.length)return;
    avisos+=cambios.length;document.title=tx('titulo_avisos',{n:avisos});el('aviso').textContent=cambios.map(f=>tx('aviso',{...f,n:f.disponibles})).join(' · ');
    try{window.navigator?.vibrate?.([150,80,150])}catch(e){}
    for(const f of cambios)C.notificar(tx('titulo'),{body:tx('aviso',{...f,n:f.disponibles}),tag:unidad+'|'+C.clave(f)});
    if(!document.hidden&&audio?.state==='running'&&el('sonido').checked)try{const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=660;g.gain.value=.04;o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.2)}catch(e){}
    // Un registro del SAES no puede usar el service worker de otro origen (SATE).
  }
  function estado(){
    if(modo==='saes')return true;
    if(sate?.closed){conectado=false;el('estado').textContent=tx('cerrada');el('abrir').hidden=false;return false}
    return !!sate;
  }
  function abrir(){
    if(revision)return;
    if(!permitido){el('estado').textContent=tx('solo_saes');return}
    if(!URL_SATE){el('estado').textContent=tx('sin_sitio');return}
    const url=new URL(URL_SATE);url.searchParams.set('unidad',unidad);if(modo==='saes')url.searchParams.set('modo','saes');conectado=false;envioPendiente=modo==='saes';
    sate=window.open(url.href,'sate-cupos','width=1024,height=760');
    el('abrir').hidden=modo==='saes'||!!sate;el('estado').textContent=tx(sate?'conectando':'ventana');
    if(sate)enviar({tipo:'ipnt.cupos.hola',v:1,unidad});
  }
  function detener(vencido=false){automatico=false;el('auto').checked=false;preferencias();el('automatico').textContent=tx(vencido?'auto_fin':'auto_apagada');el('seguir').hidden=!vencido}
  function activar(){automatico=true;hasta=Date.now()+30*60000;proxima=Math.max(Date.now(),(ultima??0)+60000);el('auto').checked=true;el('seguir').hidden=true;preferencias();pulso()}
  async function actualizar(){
    if(revision||busy||destruido||!permitido||!estado()||modo==='ventana'&&!conectado)return;
    if(ultima!==null&&Date.now()-ultima<15000){cuenta();return}
    busy=true;ultima=Date.now();window.IPNCuposUltimaConsulta=ultima;proxima=ultima+60000;el('actualizar').disabled=true;el('estado').textContent=tx('consultando');
    alumno=undefined;lectorError=false;
    const lectura=++lecturaAlumno;
    // La lectura personal no retrasa los cupos. Si termina después, completa la misma consulta.
    let cuposListos=false;
    if(leerAlumno)Promise.resolve().then(leerAlumno).then(d=>{
      if(destruido||lectura!==lecturaAlumno)return;alumno=d;lectorError=!d;
      if(lectorError)el('aviso').textContent=tx('alumno_error');
      if(cuposListos)enviarDatos(true);
    }).catch(e=>{if(destruido||lectura!==lecturaAlumno)return;lectorError=true;console.warn('SATE Cupos: lectura del alumno fallida',{unidad,error:e.message,pila:e.stack});el('aviso').textContent=tx('alumno_error');if(cuposListos)enviarDatos(true)});
    try{
      const r=await C.consultar({fetch:window.fetch.bind(window),parser:s=>new DOMParser().parseFromString(s,'text/html'),url:location.origin+'/Academica/Ocupabilidad_grupos.aspx',carrera,plan,
        opciones(doc){const opciones=Object.fromEntries(['carrera','plan'].map(k=>{const s=doc.querySelector('[name="ctl00$mainCopy$dpd'+k+'"]');return [k,s?[...s.options].map(o=>({valor:o.value,texto:o.textContent,elegido:o.value===s.value})):[]]}));for(const k of ['carrera','plan']){el(k).innerHTML=opciones[k].map(o=>`<option value="${esc(o.valor)}">${esc(o.texto)}</option>`).join('');el(k).value=opciones[k].find(o=>o.elegido)?.valor||''}enviar({tipo:'ipnt.cupos.opciones',v:1,unidad,opciones})}});
      if(destruido)return;
      const nuevos={tipo:'ipnt.cupos.datos',v:1,unidad,...r,hora:new Date().toISOString()};
      const antes=datos;datos=nuevos;carrera=r.carrera;plan=r.plan;pintar();alertar(antes);
      cuposListos=true;
      enviarDatos();if(estado())el('estado').textContent=modo==='saes'?'':tx('conectada',{hora:new Date(datos.hora).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})});
    }catch(e){console.warn('IPN Cupos: consulta fallida',{unidad,carrera,plan,codigo:e.message,etapa:e.etapa,estado:e.estado,pila:e.stack});el('estado').textContent=tx('error_'+(textos['sate.cupos.error_'+e.message]?e.message:'red'))}
    finally{busy=false;if(!destruido)cuenta()}
  }
  function cuenta(){const n=ultima===null?0:Math.max(0,Math.ceil((15000-Date.now()+ultima)/1000));el('actualizar').textContent=tx(n?'cuenta':'consultar',{n});el('actualizar').disabled=busy||n>0;enviar({tipo:'ipnt.cupos.ritmo',v:1,unidad,n,busy})}
  function pulso(){
    if(destruido)return;cuenta();estado();
    if(!conectado&&sate&&!sate.closed)enviar({tipo:'ipnt.cupos.hola',v:1,unidad});
    if(!automatico)return;if(Date.now()>=hasta){detener(true);return}
    el('automatico').textContent=tx(document.hidden?'auto_pausa':'auto_activa');
    if(!document.hidden&&Date.now()>=proxima&&(modo==='saes'||conectado)&&estado())return actualizar();
  }
  function mensaje(e){
    if(!C.origenSate(e.origin,URL_SATE)||e.source!==sate)return;const d=e.data;
    if(d?.tipo==='ipnt.cupos.hola'){conectado=true;el('estado').textContent=datos?tx('conectada',{hora:new Date(datos.hora).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}):tx('conectado');preferencias();enviarDatos()}
    if(d?.tipo==='ipnt.cupos.seleccion'&&d.v===1&&Array.isArray(d.grupos)&&d.grupos.length<=500){
      const nuevo=JSON.stringify([d.carrera,d.plan]);
      if(contexto!==nuevo){contexto=nuevo;if(typeof d.carrera==='string'&&d.carrera.length<=40)carrera=d.carrera;if(typeof d.plan==='string'&&d.plan.length<=40)plan=d.plan}
      for(const k of ['texto','superficie','linea','acento'])if(/^#[a-f0-9]{3,8}$/i.test(d.tokens?.[k]||''))panel.style.setProperty('--ipn-'+k,d.tokens[k]);
      seleccion={carrera:typeof d.carrera==='string'?d.carrera:'',plan:typeof d.plan==='string'?d.plan:'',grupos:d.grupos.filter(g=>g&&typeof g.grupo==='string'&&typeof g.materia==='string').map(g=>({grupo:g.grupo,materia:g.materia,nombre:typeof g.nombre==='string'?g.nombre.slice(0,500):g.materia}))};
      if(!seleccion.carrera||!seleccion.plan)seleccion=null;
      try{sessionStorage.setItem('ipnt.cupos.contexto',JSON.stringify(seleccion))}catch(e){console.warn('IPN Cupos: contexto de sesión no disponible',{unidad,error:e.message})}pintar();
      if(!consultaInicial){consultaInicial=true;actualizar()}
    }
    if(d?.tipo==='ipnt.cupos.consultar'&&d.v===1){if(typeof d.carrera==='string'&&typeof d.plan==='string'&&d.carrera.length<=40&&d.plan.length<=40){carrera=d.carrera;plan=d.plan;actualizar()}}

  }
  window.addEventListener('message',mensaje);el('actualizar').onclick=actualizar;el('abrir').onclick=abrir;
  el('auto').onchange=()=>el('auto').checked?activar():detener();el('seguir').onclick=activar;
  el('detalle').onclick=abrir;el('filtro').oninput=pintar;
  el('permitir').onclick=async()=>{try{if(typeof window.Notification?.requestPermission==='function')await window.Notification.requestPermission();el('aviso').textContent=tx(window.Notification?.permission==='granted'?'permiso_listo':'permiso_panel')}catch(e){el('aviso').textContent=tx('permiso_panel')}pintar()};
  el('carrera').onchange=()=>{carrera=el('carrera').value;plan='';el('plan').innerHTML=''};el('plan').onchange=()=>{plan=el('plan').value};
  let inicioY=null,arrastre=false;
  el('plegar').onclick=()=>{if(arrastre){arrastre=false;return}plegada=!plegada;pintar()};
  el('plegar').onpointerdown=e=>{inicioY=e.clientY;arrastre=false;el('plegar').setPointerCapture?.(e.pointerId)};
  el('plegar').onpointerup=e=>{if(inicioY!==null&&Math.abs(e.clientY-inicioY)>24){arrastre=true;plegada=e.clientY>inicioY;pintar()}inicioY=null};
  el('plegar').onpointercancel=()=>{inicioY=null;arrastre=false};
  el('sonido').onchange=()=>{try{const A=window.AudioContext||window.webkitAudioContext;if(A&&el('sonido').checked){audio=audio||new A();audio.resume().catch(()=>{})}}catch(e){}};
  window.IPNCuposCambiarModo=m=>{modo=m;pintar();if(modo==='ventana')abrir();else{el('abrir').hidden=true;actualizar()}};
  document.addEventListener('visibilitychange',pulso);const reloj=setInterval(pulso,1000);
  function cerrar(){detener();destruido=true;delete window.IPNCuposCambiarModo;delete window.IPNCuposCerrar;document.title=tituloOriginal;clearInterval(reloj);document.removeEventListener('visibilitychange',pulso);window.removeEventListener('message',mensaje);panel.remove();estilo.remove()}
  window.IPNCuposCerrar=cerrar;
  el('cerrar').onclick=cerrar;panel.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar()});if(revision){
    for(const k of ['carrera','plan']){el(k).innerHTML=revision.opciones[k].map(o=>`<option value="${esc(o.valor)}">${esc(o.texto)}</option>`).join('');el(k).value=datos[k]}
    el('detalle').onclick=()=>{};el('permitir').onclick=()=>{};
  }
  pintar();if(revision){el('estado').textContent='';return}if(modo==='ventana')abrir();else{el('estado').textContent=seleccion?tx('inicio'):'';actualizar()}
};
/*__CUPOS_INICIO__*/
window.IPNCuposMontar();
}
  window.IPNTSate=accion=>{
    window.IPNCuposCerrar?.();document.getElementById('ipnt-sate')?.remove();
    const host=document.createElement('div');host.id='ipnt-sate';
    const raiz=host.attachShadow({mode:'open'});
    const box=document.createElement('section');box.id='ipnt-sate';box.tabIndex=-1;
    box.setAttribute('role','dialog');box.setAttribute('aria-labelledby','ipnt-sate-titulo');
    box.innerHTML=`<style>
      #ipnt-sate,#ipnt-sate *{all:revert;box-sizing:border-box;font:inherit;color:inherit}
      :host{all:initial;--ipn-linea:#ded8dc;--ipn-superficie:#fff;--ipn-texto:#29252b;--ipn-acento:#71334c;color-scheme:light dark;position:fixed;z-index:2147483647}
      #ipnt-sate{position:fixed;right:16px;top:16px;width:560px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 32px);overflow:auto;padding:16px;border:1px solid var(--ipn-linea);border-radius:12px;background:var(--ipn-superficie);color:var(--ipn-texto);box-shadow:0 8px 32px #0003;font:15px/1.5 system-ui;overflow-wrap:anywhere}
      @media(prefers-color-scheme:dark){:host{--ipn-texto:#eee8eb;--ipn-superficie:#211e22;--ipn-linea:#61565e;--ipn-acento:#efb7ce}}
      #ipnt-sate [hidden]{display:none!important}
      #ipnt-sate .sate-cabecera{display:flex;align-items:center;justify-content:space-between;gap:8px}
      #ipnt-sate h2{font-size:18px;font-weight:650;margin:0}
      #ipnt-sate p{margin:8px 0}#ipnt-sate small{display:block;font-size:12px;opacity:.8}
      #ipnt-sate button{min-height:44px;border:1px solid var(--ipn-linea);border-radius:12px;padding:8px 12px;background:var(--ipn-superficie);cursor:pointer}
      #ipnt-sate [data-s="cerrar"]{border:0;font-size:24px;width:44px;padding:0}
      #ipnt-sate .sate-funciones{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:16px 0}
      #ipnt-sate .sate-funciones button{text-align:left;display:grid;grid-template-columns:24px minmax(0,1fr);gap:4px 8px;padding:12px}
      #ipnt-sate .sate-funciones strong{font-weight:650}#ipnt-sate .sate-funciones small{grid-column:2}
      #ipnt-sate .sate-funciones .primario{background:var(--ipn-acento);color:var(--ipn-superficie);border-color:transparent}
      #ipnt-sate fieldset{display:flex;flex-wrap:wrap;gap:8px;min-width:0;border:0;margin:8px 0;padding:0;font-size:12px}
      #ipnt-sate legend{font-size:12px}#ipnt-sate [aria-pressed="true"]{border-color:var(--ipn-acento);font-weight:650}
      #ipnt-sate :focus-visible{outline:3px solid var(--ipn-acento);outline-offset:2px}
      @media(max-width:599px){#ipnt-sate .sate-funciones{grid-template-columns:minmax(0,1fr)}}
    </style><div class="sate-cabecera"><h2 id="ipnt-sate-titulo"></h2><button type="button" data-s="cerrar">×</button></div>
    <div data-s="inicio"><p data-s="saludo"></p><p data-s="estado" role="status"></p><small data-s="privacidad"></small><div class="sate-funciones" data-s="funciones"></div><p data-s="mensaje" role="status" aria-live="polite"></p></div>
    <div data-s="cupos" hidden><button type="button" data-s="volver"></button><fieldset data-s="modos"><legend></legend></fieldset><div data-s="panel"></div></div>`;
    const el=k=>box.querySelector('[data-s="'+k+'"]');
    let datos=null,url='',vista=accion==='cupos';
    const unidad=location.hostname.match(/saes\.([a-z0-9-]+)\.ipn\.mx$/i)?.[1]||'';
    box.querySelector('h2').textContent=tx('ventana_titulo').replace('{unidad}',unidad.toUpperCase());
    el('cerrar').setAttribute('aria-label',tx('cerrar'));el('privacidad').textContent=tx('ventana_privacidad');el('estado').textContent=tx('ventana_leyendo');
    el('volver').textContent=tx('ventana_volver');el('modos').querySelector('legend').textContent=tx('ver_cupos');
    function cerrar(){window.IPNCuposCerrar?.();host.remove()}
    el('cerrar').onclick=cerrar;box.onkeydown=e=>{if(e.key==='Escape')cerrar()};
    function mostrar(){el('inicio').hidden=vista;el('cupos').hidden=!vista}
    function consultar(){vista=true;mostrar();window.IPNTSateContenedor=el('panel');cupos();modos();el('volver').focus()}
    el('volver').onclick=()=>{window.IPNCuposCerrar?.();vista=false;mostrar();el('funciones').querySelector('button')?.focus()};
    function modos(){
      let modo=window.matchMedia?.('(min-width: 900px) and (pointer: fine)').matches?'ventana':'saes';
      try{const m=localStorage.getItem('ipnt.cupos.modo');if(['saes','ventana'].includes(m))modo=m}catch(e){}
      for(const b of el('modos').querySelectorAll('button'))b.remove();
      for(const m of ['saes','ventana']){const b=document.createElement('button');b.type='button';b.textContent=tx('modo_'+m);b.setAttribute('aria-pressed',String(m===modo));
        b.onclick=()=>{try{localStorage.setItem('ipnt.cupos.modo',m)}catch(e){}window.IPNCuposCambiarModo?.(m);for(const n of el('modos').querySelectorAll('button'))n.setAttribute('aria-pressed',String(n===b))};el('modos').appendChild(b)}
    }
    async function copiar(){
      const json=JSON.stringify(datos);
      try{await navigator.clipboard.writeText(json)}catch(e){const t=document.createElement('textarea');t.value=json;t.readOnly=true;t.style.cssText='position:fixed;width:1px;height:1px;opacity:0';box.appendChild(t);let ok=false;try{t.select();ok=document.execCommand('copy')}catch(e){}finally{t.remove()}if(!ok){el('mensaje').textContent=tx('ventana_error_copia');return}}
      el('mensaje').textContent=tx('ventana_copiado');
    }
    const funciones=[
      {id:'copiar',icono:'⧉',texto:'ventana_copiar',accion:copiar,requiereDatos:true},
      {id:'abrir',icono:'↗',texto:'ventana_abrir',accion:()=>{if(url)window.open(url,'_blank','noopener')}},
      {id:'cupos',icono:'▦',texto:'consultar',accion:consultar}
    ];
    function botones(){el('funciones').replaceChildren();for(const f of funciones){if(f.requiereDatos&&!datos)continue;const b=document.createElement('button');b.type='button';b.setAttribute('data-funcion',f.id);if(f.id==='copiar')b.className='primario';
      const icono=document.createElement('span');icono.textContent=f.icono;icono.setAttribute('aria-hidden','true');const titulo=document.createElement('strong');titulo.textContent=tx(f.texto);const detalle=document.createElement('small');detalle.textContent=tx('ventana_'+f.id+'_detalle');b.appendChild(icono);b.appendChild(titulo);b.appendChild(detalle);b.onclick=f.accion;el('funciones').appendChild(b)}}
    // El lector captura este receptor antes de esperar la red; una respuesta tardía no afecta otra instancia.
    window.IPNTSateResultado=(d,tool,sig)=>{
      datos=d;url=tool;if(sig)box.querySelector('h2').textContent=tx('ventana_titulo').replace('{unidad}',sig);
      const nombre=String(d?.nombre||'').trim();el('saludo').textContent=nombre?tx('ventana_saludo').replace('{nombre}',nombre.split(/\s+/)[0]):'';
      el('estado').textContent=d===undefined?tx('ventana_leyendo'):d?tx('ventana_listos').replace('{boleta}',d.boleta||tx('ventana_sin_boleta')):tx('ventana_sin_datos');botones();
    };
    const resultado=window.IPNTSateResultado;
    window.IPNTSateLeer=()=>new Promise(resolve=>leer((d,tool,sig)=>{resultado(d,tool,sig);if(d!==undefined)resolve(d)}));
    raiz.appendChild(box);document.body.appendChild(host);botones();mostrar();box.focus();if(vista)consultar();leer();
  };
  window.IPNTSate(window.IPNTSateAccion);delete window.IPNTSateAccion;
})();
