// Cálculo del documento: valores medidos desde las tablas, celdas Octave (evaluador JS) y simulación DC de los
// circuitos (ngspice-web del lab o MNA). Sin DOM. Los motores se inyectan (ver motores.mjs).
import { parseValor, partirEsc } from './valores.mjs';
import { ejecutarOctave, producidas } from './octave.mjs';
import { partirFila } from './formato.mjs';

const UNIDAD_ELEM = { R: 'Ω', V: 'V', I: 'A', C: 'F', L: 'H' };
export const hhmm = (d = new Date()) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const num = (t) => { const s = String(t).trim().replace(/[−–]/g, '-').replace(',', '.'); return /^[+-]?\d*\.?\d+(?:e[+-]?\d+)?$/i.test(s) ? Number(s) : null; };
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

/** Valor numérico de una celda de usuario («473», «473 Ω», «12 V») o null si no es un número. */
export function numeroDeCelda(t) {
  const m = String(t).trim().replace(/[−–]/g, '-').match(/^([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\s*(\S*)$/i);
  if (!m) return null;
  let valor = Number(m[1]), unidad = m[2] || '';
  const p = unidad.match(/^(k|K|M|meg)(Ω|ohm)?$/);
  if (p) { valor *= p[1] === 'k' || p[1] === 'K' ? 1e3 : 1e6; unidad = p[2] ? 'Ω' : ''; }
  return { valor, unidad };
}

/** Ids de tabla que usa algún escenario (tabla1 en «medido(R=tabla1.R …)»). */
export const tablasDeEscenarios = (doc) => new Set(doc.circuitos.flatMap((c) => c.escenarios.flatMap((e) => e.sust.map((s) => s.ref.split('.')[0]))).filter(Boolean));
export const filaMedida = (tb) => tb.filas.find((f) => /^(valor\s+)?medid[oa]s?$/i.test((f.celdas[0] || '').trim()));

/** Nombres válidos de la columna según su encabezado («PR5 (nodo 2)», «XMM1 (VR2)», «Nodo 1»). */
function nombreColumna(h, validos) {
  const t = String(h).trim();
  const cand = [t, norm(t), ...t.split(/[^A-Za-z0-9]+/).filter(Boolean)];
  for (const c of cand) { const n = [...validos].find((v) => v === c || norm(v) === norm(c)); if (n) return n; }
  return null;
}

/**
 * Valores medidos a mano que están en las tablas: filas «Medido» / «Valor medido».
 * → {vars:{'R1:med':{valor,unidad,origen}}, medidos:{R1:473}}
 */
export function medidosDeTablas(doc) {
  const validos = new Set([...doc.sondas, ...doc.elementos]);
  const vars = {};
  for (const tb of doc.tablas) {
    const fila = filaMedida(tb);
    if (!fila || !tb.encabezado.length) continue;
    const ud0 = (tb.encabezado[0].match(/·\s*(\S+)\s*$/) || [])[1];
    tb.encabezado.forEach((h, k) => {
      if (!k) return;
      const nombre = nombreColumna(h, validos);
      const cel = numeroDeCelda(fila.celdas[k] || '');
      if (!nombre || !cel) return;
      const sonda = [...doc.circuitos.flatMap((c) => c.sondas)].find((s) => s.nombre === nombre);
      const el = doc.circuitos.flatMap((c) => c.elementos).find((e) => e.nombre === nombre);
      const unidad = cel.unidad || ud0 || (sonda ? (sonda.tipo === 'i' ? 'mA' : 'V') : el ? UNIDAD_ELEM[nombre[0].toUpperCase()] || '' : '');
      vars[`${nombre}:med`] = { valor: cel.valor, unidad, origen: `Medido · ${tb.id || 'tabla'}` };
    });
  }
  return vars;
}

/** Para un escenario: valores sustituidos desde la tabla del documento. */
export function sustituciones(doc, esc) {
  const reales = {}, faltan = []; let total = 0;
  for (const s of esc.sust) {
    const [tid, col] = s.ref.split('.');
    const tb = doc.tablas.find((x) => x.id === tid);
    if (!tb) continue;
    const fila = filaMedida(tb);
    tb.encabezado.forEach((h, k) => {
      const nombre = h.trim();
      const pert = nombre === s.variable || nombre === col || (s.variable.length === 1 && new RegExp(`^${s.variable}\\d+$`).test(nombre) && (!col || col === s.variable));
      if (!pert || !k) return;
      total++;
      const cel = fila ? numeroDeCelda(fila.celdas[k] || '') : null;
      if (cel) {
        reales[nombre] = cel.valor;
      } else faltan.push(nombre);
    });
  }
  return { valores: reales, faltan, total, con: Object.keys(reales).length };
}

/** Elementos del circuito como componentes de motor (gnd → «0»). */
export function componentes(c, cambios = {}) {
  const nodo = (n) => (/^(gnd|0)$/i.test(n) ? '0' : n);
  return c.elementos.map((e) => ({ id: e.nombre, type: e.nombre[0].toUpperCase(), a: nodo(e.nodos[0]), b: nodo(e.nodos[1]), value: cambios[e.nombre] ?? e.valor }));
}

function leerSonda(c, s, res) {
  const v = (n) => (/^(gnd|0)$/i.test(n) ? 0 : (res.voltages[n] ?? res.voltages[n.toLowerCase()] ?? [NaN])[0]);
  if (s.tipo === 'i') {
    const i = res.currents[s.objetivo];
    return i ? { valor: i[0] * 1e3, unidad: 'mA' } : null;
  }
  if (c.nodos.has(s.objetivo)) return { valor: v(s.objetivo) - (s.ref ? v(s.ref) : 0), unidad: 'V' };
  const e = c.elementos.find((x) => x.nombre === s.objetivo);
  return e ? { valor: v(e.nodos[0]) - v(e.nodos[1]), unidad: 'V' } : null;
}

/**
 * Simula en DC los escenarios de un circuito. motor = {nombre, dc(componentes)}.
 * → {vars, diag:[{nivel,mensaje}], motor, hora}
 */
export async function simularCircuito(doc, c, motor, { ahora = new Date() } = {}) {
  const vars = {}, diag = [], hora = hhmm(ahora);
  const escenarios = c.escenarios.length ? c.escenarios : [{ nombre: 'nominal', sust: [] }];
  for (const esc of escenarios) {
    let cambios = {};
    if (esc.sust.length) {
      const st = sustituciones(doc, esc);
      cambios = st.valores;
      if (st.faltan.length) diag.push({ nivel: 'aviso', mensaje: `Escenario «${esc.nombre}»: faltan ${st.faltan.join(', ')}; se usa el valor nominal (${st.con} de ${st.total} medidos)` });
    }
    try {
      const res = await motor.dc(componentes(c, cambios));
      let n = 0;
      for (const s of c.sondas) {
        const r = leerSonda(c, s, res);
        if (!r || !Number.isFinite(r.valor)) { diag.push({ nivel: 'aviso', mensaje: `Sonda ${s.nombre}: sin lectura en el escenario «${esc.nombre}»` }); continue; }
        vars[`${s.nombre}@${esc.nombre}`] = { ...r, origen: `${motor.nombre} · DC ${hora} · ${esc.nombre}`, escenario: esc.nombre };
        n++;
      }
      diag.push({ nivel: 'ok', mensaje: `${motor.nombre} · DC «${esc.nombre}» (${c.id}): ${n} sondas · ${hora}` });
    } catch (e) {
      diag.push({ nivel: 'error', mensaje: `${motor.nombre}: falló el escenario «${esc.nombre}» de ${c.id} (${e.message})` });
    }
  }
  return { vars, diag, motor: motor.nombre, hora };
}

/** Ejecuta las celdas octave marcadas «ejecuta» y enlaza ramas del desarrollo (I1=PR1) a las sondas. */
export function calcularOctave(doc) {
  const vars = {}, salidas = {}, diag = [], ejecutadas = new Set();
  for (const b of doc.codigos) {
    if (b.lenguaje !== 'octave' || !b.ejecuta) continue;
    const nombre = b.nombre || `celda@${b.linea}`;
    try {
      const r = ejecutarOctave(b.codigo);
      salidas[b.nombre] = r.salida.trimEnd();
      const p = producidas(b.produce, r);
      for (const n of b.produce) {
        if (!p[n]) { diag.push({ nivel: 'aviso', linea: b.linea, mensaje: `Celda ${nombre}: no produjo «${n}»` }); continue; }
        vars[n] = { ...p[n], origen: `Octave (sin Octave: evaluador JS) · celda ${nombre}` };
      }
      ejecutadas.add(b.nombre);
      diag.push({ nivel: 'ok', linea: b.linea, mensaje: `Celda ${nombre} calculada en el navegador (sin Octave): ${Object.keys(p).join(', ')}` });
    } catch (e) {
      diag.push({ nivel: 'error', linea: b.linea, mensaje: `Celda ${nombre}: ${e.message}` });
    }
  }
  for (const d of doc.bloques.filter((x) => x.tipo === 'desarrollo')) {
    for (const it of d.items) if (it.tipo === 'ramas') for (const r of it.ramas) if (vars[r.corriente] && r.sonda) vars[r.sonda] = { ...vars[r.corriente], origen: vars[r.corriente].origen + ` · ${r.corriente}` };
  }
  return { vars, salidas, diag, ejecutadas };
}

/**
 * Elementos del netlist como variables propuestas («R1»: 470 Ω).
 * Si un elemento se repite en varios circuitos, cada circuito conserva el suyo bajo «id/R1»;
 * la clave sin prefijo es la del primer circuito que lo define (no la pisa el último).
 */
export function propuestos(doc) {
  const vars = {};
  for (const c of doc.circuitos) for (const e of c.elementos) {
    if (!Number.isFinite(e.valor)) continue;
    const v = { valor: e.valor, unidad: UNIDAD_ELEM[e.nombre[0].toUpperCase()] || '', origen: `Netlist ${c.id}` };
    if (!(e.nombre in vars)) vars[e.nombre] = v;
    if (c.id) vars[`${c.id}/${e.nombre}`] = v;
  }
  return vars;
}

// ---------- edición de celdas en la fuente ----------
/** Cambia la celda `col` de la línea `linea` (1-based) de la fuente; devuelve el texto nuevo. */
export function reemplazarCelda(fuente, linea, col, valor) {
  const L = fuente.split('\n');
  const celdas = partirFila(L[linea - 1]);
  if (col >= celdas.length) return fuente;
  celdas[col] = String(valor).replace(/\|/g, '\\|').trim();
  L[linea - 1] = '| ' + celdas.join(' | ') + ' |';
  return L.join('\n');
}
export { partirEsc };
