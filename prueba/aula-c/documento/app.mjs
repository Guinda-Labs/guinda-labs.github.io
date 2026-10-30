// Interfaz del prototipo: abre un .aulac.md, muestra fuente + verificación a la izquierda y el documento a la derecha.
// Calcula en el navegador: celdas Octave (evaluador JS), medidos desde las tablas y simulación DC (ngspice-web o MNA).
import { parse, verificar } from './formato.mjs';
import { renderDocumento, ESTILOS, activarEscenarios, ajustarPaginas } from './render.mjs';
import { calcularOctave, medidosDeTablas, propuestos, simularCircuito, componentes, sustituciones, reemplazarCelda } from './simulacion.mjs';
import { importarDocx, camposDePortada } from './portada-docx.mjs';
import { motorMNA, motorNgspice } from './motores.mjs';
import { MotorNgspiceWeb } from '../lab/motor/ngspice-web.mjs';

const $ = (s) => document.querySelector(s);
const fuente = $('#fuente'), lista = $('#verif'), hoja = $('#doc'), estado = $('#estado'), resumen = $('#resumen'), der = $('.der');
const VER = 3; // sube al cambiar los ejemplos para no restaurar copias viejas
const CLAVE = 'aulac-documento', CLAVE_ZOOM = 'aulac-zoom', CLAVE_PORTADAS = 'aulac-portadas';
let baseVars = {}, esquemas = {}, nombre = 'sin-titulo.aulac.md', origen = 'archivo', temporizador = 0;
const cache = new Map(); // clave de circuito+valores → {vars, diag, motor, hora}
const simEstado = {}; // idCircuito → {estado, motor, hora, mensaje}
let motorElegido = null, clienteNgspice = null, genSim = 0;

const almacen = {
  leer(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
};

const estilo = document.createElement('style');
estilo.textContent = ESTILOS;
document.head.appendChild(estilo);
activarEscenarios(hoja);

// ---------- portadas importadas (.docx), solo en este navegador ----------
let portadas = almacen.leer(CLAVE_PORTADAS);
if (!portadas || typeof portadas.items !== 'object' || !portadas.items) portadas = { sel: '', items: {} };
function dibujarGaleria() {
  const g = $('#galeria'); g.replaceChildren();
  const opcion = (valor, texto) => {
    const l = document.createElement('label'); l.className = 'chip';
    const r = document.createElement('input'); r.type = 'radio'; r.name = 'portada'; r.value = valor; r.checked = (portadas.sel || '') === valor;
    r.addEventListener('change', () => { portadas.sel = valor; almacen.guardar(CLAVE_PORTADAS, portadas); dibujar(false); });
    l.append(r, document.createTextNode(' ' + texto)); g.append(l);
  };
  opcion('', 'Clásica UPIITA');
  for (const n of Object.keys(portadas.items)) opcion(n, n);
}
async function importarPortada(f) {
  try {
    const doc = parse(fuente.value);
    const r = await importarDocx(new Uint8Array(await f.arrayBuffer()), camposDePortada(doc.meta.portada));
    portadas.items[f.name] = r.html; portadas.sel = f.name;
    almacen.guardar(CLAVE_PORTADAS, portadas);
    dibujarGaleria(); dibujar(false);
    estado.textContent = `Portada «${f.name}» importada · campos: ${r.campos.join(', ') || 'ninguno'}${r.avisos.length ? ' · ' + r.avisos.join('; ') : ''}`;
  } catch (e) { estado.textContent = 'No se pudo importar la portada: ' + e.message; }
}
$('#portada-docx').addEventListener('change', (e) => { if (e.target.files[0]) importarPortada(e.target.files[0]); e.target.value = ''; });

const ICONO = { error: '✗', aviso: '⚠', ok: '✓' };

// ---------- zoom ----------
let zoom = almacen.leer(CLAVE_ZOOM) ?? 'ajustar'; // 'ajustar' o porcentaje
const PASOS = [50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200];
const ANCHO_HOJA = 816; // 8.5 in a 96 dpi
function escalaActual() {
  if (zoom !== 'ajustar') return zoom / 100;
  if (matchMedia('(max-width:8.9in)').matches) return 1; // en pantallas angostas la hoja ya es fluida
  return Math.min(1, Math.max(0.3, (der.clientWidth - 24) / ANCHO_HOJA));
}
function aplicarZoom() {
  const e = escalaActual();
  hoja.style.zoom = String(e);
  $('#zoomval').textContent = zoom === 'ajustar' ? `Ancho · ${Math.round(e * 100)} %` : `${Math.round(e * 100)} %`;
  $('#zoomfit').setAttribute('aria-pressed', String(zoom === 'ajustar'));
}
function paso(dir) {
  const pct = Math.round(escalaActual() * 100);
  const sig = dir > 0 ? PASOS.find((p) => p > pct) ?? PASOS.at(-1) : [...PASOS].reverse().find((p) => p < pct) ?? PASOS[0];
  zoom = sig; almacen.guardar(CLAVE_ZOOM, zoom); aplicarZoom();
}
$('#zoommas').addEventListener('click', () => paso(1));
$('#zoommenos').addEventListener('click', () => paso(-1));
$('#zoomfit').addEventListener('click', () => { zoom = 'ajustar'; almacen.guardar(CLAVE_ZOOM, zoom); aplicarZoom(); });
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { if (zoom === 'ajustar') aplicarZoom(); }).observe(der);
window.addEventListener('beforeprint', () => { hoja.style.zoom = '1'; });
window.addEventListener('afterprint', aplicarZoom);

// ---------- simulación ----------
const claveCircuito = (doc, c) => JSON.stringify([c.id, componentes(c), c.sondas.map((s) => [s.nombre, s.medida, s.ref]), c.escenarios.map((e) => [e.nombre, sustituciones(doc, e).valores])]);

async function motor() {
  if (!motorElegido) {
    motorElegido = (async () => {
      clienteNgspice ||= new MotorNgspiceWeb();
      const ng = motorNgspice(clienteNgspice);
      if (await ng.disponible()) return { motor: ng, aviso: null };
      return { motor: motorMNA(), aviso: `ngspice-web no disponible (${ng.error}); se usó MNA` };
    })();
  }
  return motorElegido;
}

async function simularPendientes(doc) {
  const mi = ++genSim;
  const pendientes = doc.circuitos.filter((c) => !cache.has(claveCircuito(doc, c)));
  if (!pendientes.length) return;
  for (const c of pendientes) simEstado[c.id] = { estado: 'ejecutando' };
  dibujar(false);
  for (const c of pendientes) {
    try {
      const { motor: m, aviso } = await motor();
      const r = await simularCircuito(doc, c, m);
      if (aviso) r.diag.unshift({ nivel: 'aviso', mensaje: aviso });
      cache.set(claveCircuito(doc, c), r);
      simEstado[c.id] = { estado: 'listo', motor: r.motor, hora: r.hora };
    } catch (e) {
      simEstado[c.id] = { estado: 'error', mensaje: e.message };
    }
    if (mi !== genSim) return; // llegó una edición más nueva: ella relanzará lo que falte
  }
  dibujar(false);
}

// ---------- dibujo ----------
function dibujar(simular = true) {
  const doc = parse(fuente.value);
  const oct = calcularOctave(doc);
  const simVars = {}, simDiag = [];
  for (const c of doc.circuitos) {
    const r = cache.get(claveCircuito(doc, c));
    if (r) { Object.assign(simVars, r.vars); simDiag.push(...r.diag.map((d) => ({ linea: c.elementos[0]?.linea || 1, ...d }))); }
  }
  const sondas = new Set(doc.sondas);
  const base = Object.fromEntries(Object.entries(baseVars).filter(([k]) => !(k.includes('@') && sondas.has(k.split('@')[0]))));
  const variables = { ...base, ...propuestos(doc), ...medidosDeTablas(doc), ...oct.vars, ...simVars };
  const items = verificar(doc, variables, { ejecutadas: oct.ejecutadas, extra: [...oct.diag, ...simDiag], portadas });
  const y = der.scrollTop;
  hoja.innerHTML = renderDocumento(doc, { variables, esquemas, salidas: oct.salidas, simulacion: simEstado, portadas });
  requestAnimationFrame(() => { ajustarPaginas(hoja); aplicarZoom(); der.scrollTop = y; });
  const cuenta = (n) => items.filter((x) => x.nivel === n).length;
  resumen.textContent = `${cuenta('error')} errores · ${cuenta('aviso')} avisos · ${cuenta('ok')} correctos`;
  lista.replaceChildren(...items.map((it) => {
    const li = document.createElement('li');
    li.className = it.nivel;
    li.innerHTML = `<span class="ic" aria-hidden="true">${ICONO[it.nivel]}</span><span class="msg"></span><button type="button" class="ln" title="Ir a la línea">L${it.linea}</button>`;
    li.querySelector('.msg').textContent = it.mensaje;
    li.querySelector('.ln').addEventListener('click', () => irALinea(it.linea));
    return li;
  }));
  $('#nombre').textContent = nombre;
  estado.textContent = `${doc.bloques.length} bloques · ${Object.keys(variables).length} variables`;
  almacen.guardar(CLAVE, { ver: VER, origen, nombre, texto: fuente.value, vars: origen === 'ejemplo' ? undefined : baseVars });
  if (simular && doc.circuitos.length) simularPendientes(doc);
}

function irALinea(n) {
  const lineas = fuente.value.split('\n');
  let pos = 0;
  for (let k = 0; k < n - 1 && k < lineas.length; k++) pos += lineas[k].length + 1;
  fuente.focus();
  fuente.setSelectionRange(pos, pos + (lineas[n - 1] || '').length);
  const alto = parseFloat(getComputedStyle(fuente).lineHeight) || 18;
  fuente.scrollTop = Math.max(0, (n - 4) * alto);
}

function programar() { clearTimeout(temporizador); temporizador = setTimeout(dibujar, 250); }
fuente.addEventListener('input', programar);

// Celdas «Valor medido» editables en el documento → se reescribe la fuente y se recalcula.
hoja.addEventListener('focusout', (e) => {
  const ed = e.target.closest && e.target.closest('.ed');
  if (!ed) return;
  const nuevo = ed.textContent.trim().replace(/\s+/g, ' ');
  if (nuevo === (ed.dataset.orig === 'nominal' || ed.dataset.orig === '?' ? '' : ed.dataset.orig)) return;
  fuente.value = reemplazarCelda(fuente.value, +ed.dataset.linea, +ed.dataset.col, nuevo || (ed.dataset.orig === '?' ? '?' : 'nominal'));
  dibujar();
});
hoja.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.closest && e.target.closest('.ed')) { e.preventDefault(); e.target.blur(); } });
hoja.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('.sim-btn');
  if (!b) return;
  const doc = parse(fuente.value);
  for (const c of doc.circuitos) cache.delete(claveCircuito(doc, c));
  motorElegido = null; // reintenta ngspice-web
  simularPendientes(doc);
});

// ---------- archivos ----------
async function abrirArchivo(f) {
  const texto = await f.text();
  if (/\.json$/i.test(f.name)) { try { baseVars = JSON.parse(texto); } catch { alert('El JSON de variables no es válido.'); return; } }
  else { fuente.value = texto; nombre = f.name; origen = 'archivo'; esquemas = {}; }
  dibujar();
}
$('#abrir').addEventListener('change', (e) => { if (e.target.files[0]) abrirArchivo(e.target.files[0]); e.target.value = ''; });
$('#vars').addEventListener('change', (e) => { if (e.target.files[0]) abrirArchivo(e.target.files[0]); e.target.value = ''; });
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => { e.preventDefault(); for (const f of e.dataTransfer.files) abrirArchivo(f); });
$('#pdf').addEventListener('click', () => window.print());
$('#ejemplo').addEventListener('click', () => cargarEjemplo(true));

async function cargarEjemplo(conTexto = true) {
  try {
    const [md, vars, svg] = await Promise.all([
      conTexto ? fetch('ejemplos/kirchhoff.aulac.md').then((r) => r.text()) : Promise.resolve(null),
      fetch('ejemplos/kirchhoff.variables.json').then((r) => r.json()),
      fetch('ejemplos/kirchhoff.circ1.svg').then((r) => r.text()),
    ]);
    if (md !== null) { fuente.value = md; nombre = 'kirchhoff.aulac.md'; }
    baseVars = vars; esquemas = { circ1: svg }; origen = 'ejemplo';
    dibujar();
  } catch {
    estado.textContent = 'No se pudo leer el ejemplo: abra esta página desde un servidor estático (no file://).';
  }
}

// ---------- arranque: último documento o ejemplo ----------
const previo = almacen.leer(CLAVE);
aplicarZoom();
dibujarGaleria();
if (previo && previo.ver === VER && typeof previo.texto === 'string' && previo.texto.trim()) {
  fuente.value = previo.texto; nombre = previo.nombre || nombre; origen = previo.origen || 'archivo';
  if (origen === 'ejemplo') cargarEjemplo(false); else { baseVars = previo.vars || {}; dibujar(); }
} else cargarEjemplo(true);
