/* Entrada única. Las acciones conservan sus implementaciones independientes. */
(()=>{
  const textos={"sate.cupos.marcador": "SATE", "sate.cupos.guardar": "Guarda el marcador SATE:", "sate.cupos.paso_datos": "pulsa el marcador «SATE», elige «Traer mis datos del SAES» y después «Copiar mis datos».", "sate.cupos.traer": "Traer mis datos del SAES", "sate.cupos.cerrar_menu": "Cerrar menú", "sate.cupos.que_hace": "Consulta los lugares disponibles en el SAES y compáralos con tu horario de SATE. Es solo lectura; no realiza inscripciones.", "sate.cupos.paso_instalar": "Arrastra este marcador a tu barra de marcadores: ", "sate.cupos.paso_saes": "Abre el SAES de tu unidad académica e inicia sesión.", "sate.cupos.paso_consultar": "Pulsa el marcador «SATE» y elige «Consultar cupos».", "sate.cupos.conectando": "Conectando con la ventana de SATE…", "sate.cupos.conectado": "Conectado a SATE", "sate.cupos.conectada": "Última consulta {hora} · conectado a SATE", "sate.cupos.cerrada": "Ventana de SATE cerrada", "sate.cupos.reabrir": "Abrir ventana de SATE", "sate.cupos.cuenta": "Consultar en {n, plural, one {# segundo} other {# segundos}}", "sate.cupos.profesor": "Profesor", "sate.cupos.horario": "Horario", "sate.cupos.detalle": "Detalle del grupo", "sate.cupos.dias": "Lun|Mar|Mié|Jue|Vie|Sáb|Dom", "sate.cupos.error_oferta": "No se pudo cargar la oferta de SATE para mostrar profesores y horarios. Vuelve a abrir esta ventana.", "sate.cupos.auto": "Actualizar cada minuto", "sate.cupos.sonido": "Sonido", "sate.cupos.notificacion": "Notificación", "sate.cupos.auto_activa": "Consulta automática activa · 60 s", "sate.cupos.auto_pausa": "Consulta automática en pausa mientras esta pestaña está oculta.", "sate.cupos.auto_fin": "Terminó la consulta automática de 30 min. Puedes continuar cuando lo necesites.", "sate.cupos.auto_apagada": "Consulta automática desactivada.", "sate.cupos.seguir": "Seguir 30 min más", "sate.cupos.aviso": "{materia} · {grupo}: {n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.titulo_avisos": "{n, plural, one {(#) Cupos} other {(#) Cupos}}", "sate.cupos.permitir": "Permitir notificaciones", "sate.cupos.permiso_listo": "Notificaciones permitidas.", "sate.cupos.permiso_panel": "Las notificaciones no están permitidas o no están disponibles. Los cambios seguirán apareciendo en esta ventana; el sonido depende de tu casilla Sonido.", "sate.cupos.titulo": "Cupos", "sate.cupos.cerrar": "Cerrar Cupos", "sate.cupos.carrera": "Carrera", "sate.cupos.plan": "Plan", "sate.cupos.grupo": "Grupo", "sate.cupos.materia": "Materia", "sate.cupos.cupo": "Cupo", "sate.cupos.inscritos": "Inscritos", "sate.cupos.disponibles": "Disponibles", "sate.cupos.cambio": "Cambio", "sate.cupos.actualizar": "Actualizar", "sate.cupos.abrir_sate": "Ver en SATE", "sate.cupos.consultar": "Consultar cupos", "sate.cupos.filtro": "Filtrar materia o grupo", "sate.cupos.elegidos": "Grupos elegidos en SATE", "sate.cupos.todos": "Disponibilidad de los grupos", "sate.cupos.sin_coincidencias": "No hay grupos que coincidan con la selección o el filtro.", "sate.cupos.lleno": "Sin lugares", "sate.cupos.lugares": "{n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.hace": "hace {n, plural, one {# minuto} other {# minutos}}", "sate.cupos.sin_actualizar": "sin actualizar", "sate.cupos.omitir": "Omitir grupos llenos", "sate.cupos.ayuda": "Instala el marcador «SATE», abre el SAES con sesión y elige «Consultar cupos» en el menú del marcador.", "sate.cupos.limites": "Solo lectura del periodo actual. Los lugares pueden cambiar antes de tu reinscripción. Consulta manual cada 15 s; automática cada 60 s.", "sate.cupos.inicio": "Elige carrera y plan y pulsa «Consultar cupos».", "sate.cupos.consultando": "Consultando disponibilidad…", "sate.cupos.ultima": "Última consulta: {hora}", "sate.cupos.antigua": "Consulta antigua", "sate.cupos.antigua_ayuda": "Pasó más de una hora: «Omitir grupos llenos» queda desmarcada. Actualiza la consulta antes de usar ese filtro.", "sate.cupos.dejar_abierta": "Esta ventana recibe los cupos y debe quedar abierta mientras consultas desde el SAES.", "sate.cupos.grupos": "{n, plural, one {# grupo} other {# grupos}}", "sate.cupos.esperando": "Esperando tu consulta desde el marcador SATE.", "sate.cupos.esperar": "Espera al menos 15 s entre consultas.", "sate.cupos.nube_guardada": "Consulta guardada en OneDrive.", "sate.cupos.error_nube": "La consulta está en este navegador. No se pudo sincronizar con OneDrive; vuelve a sincronizar tu cuenta.", "sate.cupos.horario_lleno": "Tu horario tiene grupos llenos según la última consulta.", "sate.cupos.alternativas": "Buscar alternativas con lugar", "sate.cupos.tu_horario": "Tu horario", "sate.cupos.tu_grupo": "Tu grupo", "sate.cupos.nivel": "Nivel", "sate.cupos.todos_niveles": "Todos", "sate.cupos.orden": "Orden por lugares", "sate.cupos.orden_mas": "Más lugares primero", "sate.cupos.orden_menos": "Menos lugares primero", "sate.cupos.sin_dato": "Sin dato en esta consulta", "sate.cupos.sin_horas": "Sin horario para comprobar choques", "sate.cupos.con_choque": "Choca con tu horario", "sate.cupos.sin_choque": "Sin choque con tu horario", "sate.cupos.solo_saes": "Ejecuta Cupos dentro del SAES de tu unidad académica, con tu sesión iniciada.", "sate.cupos.ventana": "El navegador bloqueó la ventana de SATE. En la barra de direcciones, permite las ventanas emergentes para el SAES y pulsa «Abrir ventana de SATE».", "sate.cupos.sin_sitio": "No se encontró la dirección de SATE para recibir los cupos. Instala el marcador desde el sitio de SATE.", "sate.cupos.error_sesion": "Inicia sesión en el SAES y vuelve a elegir «Consultar cupos» en el marcador SATE.", "sate.cupos.error_vacia": "El SAES no muestra grupos para esta consulta. Revisa carrera y plan y vuelve a actualizar.", "sate.cupos.error_columnas": "La tabla del SAES tiene columnas distintas. No se interpretaron los cupos; informa este cambio para revisar el marcador.", "sate.cupos.error_numeros": "La tabla contiene valores de cupo no válidos. No se actualizaron los datos.", "sate.cupos.error_http": "El SAES no pudo responder la consulta. Vuelve a pulsar «Actualizar».", "sate.cupos.error_seleccion": "El SAES no confirmó la carrera o el plan elegidos. Revisa los selectores y vuelve a consultar.", "sate.cupos.error_plan": "El plan elegido no corresponde a esta carrera. Se cargaron sus planes; elige uno y vuelve a actualizar.", "sate.cupos.error_red": "No se pudo consultar el SAES. Revisa tu conexión y vuelve a pulsar «Actualizar».", "componentes.cerrar": "Cerrar", "componentes.descartar": "Descartar", "componentes.barra.etiqueta": "Secciones", "componentes.ayuda.boton": "Ayuda", "componentes.ayuda.titulo": "Ayuda", "componentes.estado.ok": "Todo en orden", "componentes.estado.aviso": "Atención", "componentes.estado.error": "Requiere acción", "componentes.estado.info": "Información"},tx=k=>textos['sate.cupos.'+k]||k;
  window.IPNTSate=accion=>{
    document.getElementById('ipnt-sate-menu')?.remove();
    if(accion==='lector'){(async function () {
var TOOL = 'https://guinda-labs.github.io/prueba/horarios-upiita.html';
var UM = location.hostname.match(/(?:^|\.)saes\.([a-z0-9-]+)\.ipn\.mx$/i);
if (!UM) {
alert('Abre este marcador dentro del SAES de tu unidad (por ejemplo, saes.upiita.ipn.mx), con tu sesión iniciada.');
return;
}
var UNIDAD = UM[1].toLowerCase();
var SIG = {"cicsma": "CICS Milpa Alta", "enba": "ENBA", "encb": "ENCB", "enmh": "ENMH", "escasto": "ESCA Santo Tomás", "escatep": "ESCA Tepepan", "escom": "ESCOM", "ese": "ESE", "eseo": "ESEO", "esfm": "ESFM", "esiat": "ESIA Ticomán", "esiatec": "ESIA Tecamachalco", "esiaz": "ESIA Zacatenco", "esimeazc": "ESIME Azcapotzalco", "esimecul": "ESIME Culhuacán", "esimetic": "ESIME Ticomán", "esimez": "ESIME Zacatenco", "esime-zac": "ESIME Zacatenco", "esiqie": "ESIQIE", "esit": "ESIT", "esm": "ESM", "est": "EST", "upibi": "UPIBI", "upiem": "UPIEM", "upiic": "UPIIC", "upiicsa": "UPIICSA", "upiig": "UPIIG", "upiih": "UPIIH", "upiip": "UPIIP", "upiit": "UPIIT", "upiita": "UPIITA", "upiiz": "UPIIZ"}[UNIDAD] || UNIDAD.toUpperCase();
if (TOOL) TOOL = TOOL.replace(/horarios(-[a-z]+)?\.html$/, ["upiita", "escom", "upibi"].includes(UNIDAD) ? 'horarios-' + UNIDAD + '.html' : 'sate/index.html?sateUnidad=' + UNIDAD);
// claves: letra + 3 dígitos (B101) o con letras (optativas de la ESCOM); siempre con al menos un dígito
var CLAVE = /^(?=[A-Z0-9]*\d)[A-Z][A-Z0-9]{2,6}$/i;
var byId = function (d, id) { return d.querySelector('[id$="mainCopy_' + id + '"]'); };
var old = document.getElementById('upiita-lector');
if (old) old.remove();
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
var box = document.createElement('div');
box.id = 'upiita-lector';
box.setAttribute('role', 'dialog');
box.setAttribute('aria-label', 'SATE · ' + SIG);
box.style.cssText = 'position:fixed;z-index:2147483647;right:16px;top:16px;width:min(420px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;background:#fff;color:#18181b;border:1px solid #d9d9de;border-radius:12px;box-shadow:0 18px 50px -12px rgba(0,0,0,.35);font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;padding:16px';
box.innerHTML = '<b style="font-size:16px">SATE · ' + SIG + '</b><p style="margin:6px 0 0;color:#52525b">Leyendo tu Kárdex y tu Cita de reinscripción (solo lectura)…</p>';
document.body.appendChild(box);
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
lector: '2606ffd'
};
var json = JSON.stringify(data);
var row = function (k, v) { return '<tr><td style="color:#52525b;padding:2px 12px 2px 0">' + k + '</td><td style="font-weight:600">' + (v == null || v === '' ? '—' : v) + '</td></tr>'; };
box.innerHTML = '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:16px">SATE · ' + SIG + '</b><button id="ul-x" style="border:0;background:none;font-size:20px;cursor:pointer" aria-label="Cerrar">×</button></div>' +
'<p style="margin:4px 0 10px;color:#52525b">Resumen de la información consultada en el SAES. No se envió a ningún servidor.</p>' +
'<table style="border-collapse:collapse;font-size:13px">' +
row('Boleta', data.boleta) + row('Carrera', data.carrera_nombre + (data.plan ? ' (plan ' + data.plan + ')' : '')) +
row('Promedio', data.promedio) + row('Materias acreditadas', acred.length) + row('Materias en curso', curso ? curso.length : null) +
row('Créditos obtenidos', data.avance.obtenidos) + row('Periodos cursados', data.avance.cursados) +
row('Carga autorizada', data.avance.autorizada) + row('Reprobadas', repro.length ? repro.map(function (r) { return r[0].toLowerCase(); }).join(', ') : 'ninguna') +
row('Cita de reinscripción', data.cita.inicio) + '</table>' +
'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' +
'<button id="ul-copy" style="background:#750946;color:#fff;border:0;border-radius:999px;padding:8px 16px;font-weight:600;cursor:pointer">Copiar mis datos</button>' +
(TOOL ? '<a id="ul-open" href="' + TOOL + '" target="_blank" rel="noopener" style="border:1px solid #d9d9de;border-radius:999px;padding:8px 16px;color:#18181b;text-decoration:none;font-weight:500">Abrir SATE ' + SIG + '</a>' : '') + '</div>' +
'<p id="ul-msg" style="margin:10px 0 0;color:#52525b;font-size:13px">Después, en la herramienta, pulsa <b>Traer mis datos del SAES</b> y pega con Ctrl+V.</p>' +
'<textarea id="ul-txt" readonly style="position:absolute;left:-9999px;width:1px;height:1px"></textarea>';
document.getElementById('ul-x').onclick = function () { box.remove(); };
document.getElementById('ul-copy').onclick = async function () {
var msg = document.getElementById('ul-msg');
try { await navigator.clipboard.writeText(json); }
catch (e) { var t = document.getElementById('ul-txt'); t.value = json; t.select(); document.execCommand('copy'); }
msg.innerHTML = '<b style="color:#15803d">Copiado.</b> Ahora abre la herramienta, pulsa <b>Traer mis datos del SAES</b> y pega con Ctrl+V.';
};
} catch (e) {
box.innerHTML = '<b style="font-size:16px">SATE · ' + SIG + '</b><p style="margin:6px 0 0">' +
(e.message === 'sesion' ? 'No se detectó una sesión activa del SAES. Inicia sesión y ejecuta nuevamente el marcador.' : 'No fue posible leer la información: ' + e.message) +
'</p><button onclick="this.parentNode.remove()" style="margin-top:10px;border:1px solid #d9d9de;background:#fff;border-radius:999px;padding:6px 14px;cursor:pointer">Cerrar</button>';
}
})();return}
    if(accion==='cupos'){/* Cupos: lectura de ocupabilidad y funciones compartidas con SATE. */
(function(raiz){
  'use strict';
  const origenSaes=o=>/^https:\/\/(www\.)?saes\.[a-z0-9]+\.ipn\.mx$/.test(o);
  const origenSate=(o,url)=>!!url&&o===new URL(url).origin;
  const clave=f=>f.grupo+'|'+f.materia;
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
      return propios.has(clave(f))&&a!==undefined&&a!==n&&(a===0&&n>0||n===0||n<=3);
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
  raiz.IPNCupos={texto,origenSaes,origenSate,clave,parsear,validar,limpiar,antigua,reciente,fecha,tarjetas,consultar,cambios};
})(typeof window==='undefined'?globalThis:window);

/*__CUPOS_PANEL__*/
(function(){
  'use strict';
  const URL_SATE="https://guinda-labs.github.io/prueba/sate/cupos.html",textos={"sate.cupos.marcador": "SATE", "sate.cupos.guardar": "Guarda el marcador SATE:", "sate.cupos.paso_datos": "pulsa el marcador «SATE», elige «Traer mis datos del SAES» y después «Copiar mis datos».", "sate.cupos.traer": "Traer mis datos del SAES", "sate.cupos.cerrar_menu": "Cerrar menú", "sate.cupos.que_hace": "Consulta los lugares disponibles en el SAES y compáralos con tu horario de SATE. Es solo lectura; no realiza inscripciones.", "sate.cupos.paso_instalar": "Arrastra este marcador a tu barra de marcadores: ", "sate.cupos.paso_saes": "Abre el SAES de tu unidad académica e inicia sesión.", "sate.cupos.paso_consultar": "Pulsa el marcador «SATE» y elige «Consultar cupos».", "sate.cupos.conectando": "Conectando con la ventana de SATE…", "sate.cupos.conectado": "Conectado a SATE", "sate.cupos.conectada": "Última consulta {hora} · conectado a SATE", "sate.cupos.cerrada": "Ventana de SATE cerrada", "sate.cupos.reabrir": "Abrir ventana de SATE", "sate.cupos.cuenta": "Consultar en {n, plural, one {# segundo} other {# segundos}}", "sate.cupos.profesor": "Profesor", "sate.cupos.horario": "Horario", "sate.cupos.detalle": "Detalle del grupo", "sate.cupos.dias": "Lun|Mar|Mié|Jue|Vie|Sáb|Dom", "sate.cupos.error_oferta": "No se pudo cargar la oferta de SATE para mostrar profesores y horarios. Vuelve a abrir esta ventana.", "sate.cupos.auto": "Actualizar cada minuto", "sate.cupos.sonido": "Sonido", "sate.cupos.notificacion": "Notificación", "sate.cupos.auto_activa": "Consulta automática activa · 60 s", "sate.cupos.auto_pausa": "Consulta automática en pausa mientras esta pestaña está oculta.", "sate.cupos.auto_fin": "Terminó la consulta automática de 30 min. Puedes continuar cuando lo necesites.", "sate.cupos.auto_apagada": "Consulta automática desactivada.", "sate.cupos.seguir": "Seguir 30 min más", "sate.cupos.aviso": "{materia} · {grupo}: {n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.titulo_avisos": "{n, plural, one {(#) Cupos} other {(#) Cupos}}", "sate.cupos.permitir": "Permitir notificaciones", "sate.cupos.permiso_listo": "Notificaciones permitidas.", "sate.cupos.permiso_panel": "Las notificaciones no están permitidas o no están disponibles. Los cambios seguirán apareciendo en esta ventana; el sonido depende de tu casilla Sonido.", "sate.cupos.titulo": "Cupos", "sate.cupos.cerrar": "Cerrar Cupos", "sate.cupos.carrera": "Carrera", "sate.cupos.plan": "Plan", "sate.cupos.grupo": "Grupo", "sate.cupos.materia": "Materia", "sate.cupos.cupo": "Cupo", "sate.cupos.inscritos": "Inscritos", "sate.cupos.disponibles": "Disponibles", "sate.cupos.cambio": "Cambio", "sate.cupos.actualizar": "Actualizar", "sate.cupos.abrir_sate": "Ver en SATE", "sate.cupos.consultar": "Consultar cupos", "sate.cupos.filtro": "Filtrar materia o grupo", "sate.cupos.elegidos": "Grupos elegidos en SATE", "sate.cupos.todos": "Disponibilidad de los grupos", "sate.cupos.sin_coincidencias": "No hay grupos que coincidan con la selección o el filtro.", "sate.cupos.lleno": "Sin lugares", "sate.cupos.lugares": "{n, plural, =0 {Sin lugares} one {# lugar} other {# lugares}}", "sate.cupos.hace": "hace {n, plural, one {# minuto} other {# minutos}}", "sate.cupos.sin_actualizar": "sin actualizar", "sate.cupos.omitir": "Omitir grupos llenos", "sate.cupos.ayuda": "Instala el marcador «SATE», abre el SAES con sesión y elige «Consultar cupos» en el menú del marcador.", "sate.cupos.limites": "Solo lectura del periodo actual. Los lugares pueden cambiar antes de tu reinscripción. Consulta manual cada 15 s; automática cada 60 s.", "sate.cupos.inicio": "Elige carrera y plan y pulsa «Consultar cupos».", "sate.cupos.consultando": "Consultando disponibilidad…", "sate.cupos.ultima": "Última consulta: {hora}", "sate.cupos.antigua": "Consulta antigua", "sate.cupos.antigua_ayuda": "Pasó más de una hora: «Omitir grupos llenos» queda desmarcada. Actualiza la consulta antes de usar ese filtro.", "sate.cupos.dejar_abierta": "Esta ventana recibe los cupos y debe quedar abierta mientras consultas desde el SAES.", "sate.cupos.grupos": "{n, plural, one {# grupo} other {# grupos}}", "sate.cupos.esperando": "Esperando tu consulta desde el marcador SATE.", "sate.cupos.esperar": "Espera al menos 15 s entre consultas.", "sate.cupos.nube_guardada": "Consulta guardada en OneDrive.", "sate.cupos.error_nube": "La consulta está en este navegador. No se pudo sincronizar con OneDrive; vuelve a sincronizar tu cuenta.", "sate.cupos.horario_lleno": "Tu horario tiene grupos llenos según la última consulta.", "sate.cupos.alternativas": "Buscar alternativas con lugar", "sate.cupos.tu_horario": "Tu horario", "sate.cupos.tu_grupo": "Tu grupo", "sate.cupos.nivel": "Nivel", "sate.cupos.todos_niveles": "Todos", "sate.cupos.orden": "Orden por lugares", "sate.cupos.orden_mas": "Más lugares primero", "sate.cupos.orden_menos": "Menos lugares primero", "sate.cupos.sin_dato": "Sin dato en esta consulta", "sate.cupos.sin_horas": "Sin horario para comprobar choques", "sate.cupos.con_choque": "Choca con tu horario", "sate.cupos.sin_choque": "Sin choque con tu horario", "sate.cupos.solo_saes": "Ejecuta Cupos dentro del SAES de tu unidad académica, con tu sesión iniciada.", "sate.cupos.ventana": "El navegador bloqueó la ventana de SATE. En la barra de direcciones, permite las ventanas emergentes para el SAES y pulsa «Abrir ventana de SATE».", "sate.cupos.sin_sitio": "No se encontró la dirección de SATE para recibir los cupos. Instala el marcador desde el sitio de SATE.", "sate.cupos.error_sesion": "Inicia sesión en el SAES y vuelve a elegir «Consultar cupos» en el marcador SATE.", "sate.cupos.error_vacia": "El SAES no muestra grupos para esta consulta. Revisa carrera y plan y vuelve a actualizar.", "sate.cupos.error_columnas": "La tabla del SAES tiene columnas distintas. No se interpretaron los cupos; informa este cambio para revisar el marcador.", "sate.cupos.error_numeros": "La tabla contiene valores de cupo no válidos. No se actualizaron los datos.", "sate.cupos.error_http": "El SAES no pudo responder la consulta. Vuelve a pulsar «Actualizar».", "sate.cupos.error_seleccion": "El SAES no confirmó la carrera o el plan elegidos. Revisa los selectores y vuelve a consultar.", "sate.cupos.error_plan": "El plan elegido no corresponde a esta carrera. Se cargaron sus planes; elige uno y vuelve a actualizar.", "sate.cupos.error_red": "No se pudo consultar el SAES. Revisa tu conexión y vuelve a pulsar «Actualizar».", "componentes.cerrar": "Cerrar", "componentes.descartar": "Descartar", "componentes.barra.etiqueta": "Secciones", "componentes.ayuda.boton": "Ayuda", "componentes.ayuda.titulo": "Ayuda", "componentes.estado.ok": "Todo en orden", "componentes.estado.aviso": "Atención", "componentes.estado.error": "Requiere acción", "componentes.estado.info": "Información"};
  const C=window.IPNCupos,tx=(k,v)=>C.texto(textos,k,v),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(document.getElementById('ipnt-cupos')){document.getElementById('ipnt-cupos').focus();return}
  const permitido=C.origenSaes(location.origin),unidad=permitido?location.hostname.match(/saes\.([a-z0-9]+)\.ipn\.mx$/)[1]:'',origin=URL_SATE?new URL(URL_SATE).origin:null;
  let sate=null,datos=null,carrera='',plan='',contexto='',busy=false,destruido=false,ultima=window.IPNCuposUltimaConsulta??null;
  let automatico=false,hasta=0,proxima=0,conectado=false,consultaInicial=false;
  const panel=document.createElement('section');panel.id='ipnt-cupos';panel.tabIndex=-1;panel.setAttribute('aria-label',tx('titulo'));
  const estilo=document.createElement('style');estilo.textContent=`
  #ipnt-cupos{--ipn-texto:#29252b;--ipn-superficie:#fff;--ipn-linea:#ded8dc;--ipn-acento:#71334c;position:fixed;z-index:2147483646;right:12px;bottom:12px;max-width:calc(100vw - 24px);background:var(--ipn-superficie);color:var(--ipn-texto);border:1px solid var(--ipn-linea);border-radius:12px;padding:10px 12px;box-shadow:0 4px 20px #0003;font:14px/1.5 system-ui;display:flex;flex-wrap:wrap;align-items:center;gap:8px;box-sizing:border-box}
  @media(prefers-color-scheme:dark){#ipnt-cupos{--ipn-texto:#eee8eb;--ipn-superficie:#211e22;--ipn-linea:#61565e;--ipn-acento:#efb7ce}}
  #ipnt-cupos button{font:inherit;color:inherit;background:var(--ipn-superficie);border:1px solid var(--ipn-linea);border-radius:8px;padding:6px;cursor:pointer}#ipnt-cupos :focus-visible{outline:3px solid var(--ipn-acento);outline-offset:2px}#ipnt-cupos [hidden]{display:none}`;
  document.head.appendChild(estilo);
  panel.innerHTML=`<span data-c="estado" role="status" aria-live="polite">${esc(tx('conectando'))}</span>
    <button data-c="actualizar">${esc(tx('consultar'))}</button><button data-c="abrir" hidden>${esc(tx('reabrir'))}</button>
    <label><input type="checkbox" data-c="auto"> ${esc(tx('auto'))}</label>
    <span data-c="automatico" role="status"></span><button data-c="seguir" hidden>${esc(tx('seguir'))}</button>
    <button data-c="cerrar" aria-label="${esc(tx('cerrar'))}">×</button>`;
  document.body.appendChild(panel);panel.focus();const el=k=>panel.querySelector('[data-c="'+k+'"]');
  function enviar(d){if(sate&&!sate.closed)sate.postMessage(d,origin)}
  function preferencias(){enviar({tipo:'ipnt.cupos.avisos',v:1,unidad,hasta:automatico?hasta:0,notificacion:automatico})}
  function enviarDatos(){if(datos)enviar(C.limpiar(datos))}
  function estado(){
    if(sate?.closed){conectado=false;el('estado').textContent=tx('cerrada');el('abrir').hidden=false;return false}
    return !!sate;
  }
  function abrir(){
    if(!permitido){el('estado').textContent=tx('solo_saes');return}
    if(!URL_SATE){el('estado').textContent=tx('sin_sitio');return}
    const url=new URL(URL_SATE);url.searchParams.set('unidad',unidad);conectado=false;
    sate=window.open(url.href,'sate-cupos','width=1024,height=760');
    el('abrir').hidden=!!sate;el('estado').textContent=tx(sate?'conectando':'ventana');
    if(sate)enviar({tipo:'ipnt.cupos.hola',v:1,unidad});
  }
  function detener(vencido=false){automatico=false;el('auto').checked=false;preferencias();el('automatico').textContent=tx(vencido?'auto_fin':'auto_apagada');el('seguir').hidden=!vencido}
  function activar(){automatico=true;hasta=Date.now()+30*60000;proxima=Math.max(Date.now(),(ultima??0)+60000);el('auto').checked=true;el('seguir').hidden=true;preferencias();pulso()}
  async function actualizar(){
    if(busy||destruido||!permitido||!estado()||!conectado)return;
    if(ultima!==null&&Date.now()-ultima<15000){cuenta();return}
    busy=true;ultima=Date.now();window.IPNCuposUltimaConsulta=ultima;proxima=ultima+60000;el('actualizar').disabled=true;el('estado').textContent=tx('consultando');
    try{
      const r=await C.consultar({fetch:window.fetch.bind(window),parser:s=>new DOMParser().parseFromString(s,'text/html'),url:location.origin+'/Academica/Ocupabilidad_grupos.aspx',carrera,plan,
        opciones(doc){enviar({tipo:'ipnt.cupos.opciones',v:1,unidad,opciones:Object.fromEntries(['carrera','plan'].map(k=>{const s=doc.querySelector('[name="ctl00$mainCopy$dpd'+k+'"]');return [k,s?[...s.options].map(o=>({valor:o.value,texto:o.textContent,elegido:o.value===s.value})):[]]}))})}});
      if(destruido)return;
      const nuevos={tipo:'ipnt.cupos.datos',v:1,unidad,...r,hora:new Date().toISOString()};
      datos=nuevos;carrera=r.carrera;plan=r.plan;
      enviarDatos();if(estado())el('estado').textContent=tx('conectada',{hora:new Date(datos.hora).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})});
    }catch(e){console.warn('IPN Cupos: consulta fallida',{unidad,carrera,plan,codigo:e.message,etapa:e.etapa,estado:e.estado,pila:e.stack});el('estado').textContent=tx('error_'+(textos['sate.cupos.error_'+e.message]?e.message:'red'))}
    finally{busy=false;if(!destruido)cuenta()}
  }
  function cuenta(){const n=ultima===null?0:Math.max(0,Math.ceil((15000-Date.now()+ultima)/1000));el('actualizar').textContent=tx(n?'cuenta':'consultar',{n});el('actualizar').disabled=busy||n>0;enviar({tipo:'ipnt.cupos.ritmo',v:1,unidad,n,busy})}
  function pulso(){
    if(destruido)return;cuenta();estado();
    if(!conectado&&sate&&!sate.closed)enviar({tipo:'ipnt.cupos.hola',v:1,unidad});
    if(!automatico)return;if(Date.now()>=hasta){detener(true);return}
    el('automatico').textContent=tx(document.hidden?'auto_pausa':'auto_activa');
    if(!document.hidden&&Date.now()>=proxima&&conectado&&estado())return actualizar();
  }
  function mensaje(e){
    if(!C.origenSate(e.origin,URL_SATE)||e.source!==sate)return;const d=e.data;
    if(d?.tipo==='ipnt.cupos.hola'){conectado=true;el('estado').textContent=datos?tx('conectada',{hora:new Date(datos.hora).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}):tx('conectado');preferencias();enviarDatos()}
    if(d?.tipo==='ipnt.cupos.seleccion'&&d.v===1&&Array.isArray(d.grupos)&&d.grupos.length<=500){
      const nuevo=JSON.stringify([d.carrera,d.plan]);
      if(contexto!==nuevo){contexto=nuevo;if(typeof d.carrera==='string'&&d.carrera.length<=40)carrera=d.carrera;if(typeof d.plan==='string'&&d.plan.length<=40)plan=d.plan}
      for(const k of ['texto','superficie','linea','acento'])if(/^#[a-f0-9]{3,8}$/i.test(d.tokens?.[k]||''))panel.style.setProperty('--ipn-'+k,d.tokens[k]);
      if(!consultaInicial){consultaInicial=true;actualizar()}
    }
    if(d?.tipo==='ipnt.cupos.consultar'&&d.v===1){if(typeof d.carrera==='string'&&typeof d.plan==='string'&&d.carrera.length<=40&&d.plan.length<=40){carrera=d.carrera;plan=d.plan;actualizar()}}

  }
  window.addEventListener('message',mensaje);el('actualizar').onclick=actualizar;el('abrir').onclick=abrir;
  el('auto').onchange=()=>el('auto').checked?activar():detener();el('seguir').onclick=activar;
  document.addEventListener('visibilitychange',pulso);const reloj=setInterval(pulso,1000);
  function cerrar(){detener();destruido=true;clearInterval(reloj);document.removeEventListener('visibilitychange',pulso);window.removeEventListener('message',mensaje);panel.remove();estilo.remove()}
  el('cerrar').onclick=cerrar;panel.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar()});abrir();
})();
return}
    const menu=document.createElement('section');menu.id='ipnt-sate-menu';
    menu.setAttribute('aria-label',tx('marcador'));
    menu.style.cssText='position:fixed;z-index:2147483647;right:12px;bottom:12px;padding:12px;border:1px solid var(--ipn-linea,#888);border-radius:12px;background:var(--ipn-superficie,Canvas);color:var(--ipn-texto,CanvasText);box-shadow:0 4px 20px #0003;font:14px system-ui;display:grid;gap:8px;max-width:calc(100vw - 24px)';
    for(const [id,clave] of [['lector','traer'],['cupos','consultar'],['cerrar','cerrar_menu']]){
      const b=document.createElement('button');b.type='button';b.textContent=tx(clave);
      b.style.cssText='font:inherit;padding:10px;border:1px solid var(--ipn-linea,#888);border-radius:8px;background:inherit;color:inherit;cursor:pointer';
      b.onclick=()=>id==='cerrar'?menu.remove():window.IPNTSate(id);menu.appendChild(b);
    }
    menu.onkeydown=e=>{if(e.key==='Escape')menu.remove()};document.body.appendChild(menu);menu.querySelector('button').focus();
  };
  window.IPNTSate(window.IPNTSateAccion);delete window.IPNTSateAccion;
})();
