// Unidades, números y evaluación de valores vivos. Módulo puro (sin DOM).

const PREFIJOS = { T: 1e12, G: 1e9, M: 1e6, k: 1e3, '': 1, m: 1e-3, 'µ': 1e-6, u: 1e-6, n: 1e-9, p: 1e-12 };
const BASES = ['Hz', 'V', 'A', 'Ω', 'W', 'F', 'H', 's'];

/** Devuelve {base, f} para una unidad como «mA», «kΩ», «V»; null si no se conoce. */
export function infoUnidad(u) {
  if (u == null || u === '') return { base: '', f: 1 };
  u = String(u).trim();
  if (u === '%') return { base: '%', f: 1 };
  if (u === 'ohm') u = 'Ω';
  for (const b of BASES) {
    if (u === b) return { base: b, f: 1 };
    if (u.length > b.length && u.endsWith(b)) {
      const p = u.slice(0, u.length - b.length);
      if (PREFIJOS[p] !== undefined && p !== '') return { base: b, f: PREFIJOS[p] };
    }
  }
  return null;
}

export const unidadValida = (u) => infoUnidad(u) !== null;

/** Convierte v de la unidad `de` a la unidad `a`; null si son incompatibles. */
export function convertir(v, de, a) {
  const x = infoUnidad(de), y = infoUnidad(a);
  if (!x || !y || x.base !== y.base) return null;
  return (v * x.f) / y.f;
}

/** «470», «1k», «4.7meg», «10u» → número. null si no es válido. */
export function parseValor(s) {
  const m = String(s).trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(meg|[TGkKMmunpµ])?(?:Ω|ohm|[VAFHWs])?$/i);
  if (!m) return null;
  const mult = { meg: 1e6, t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, 'µ': 1e-6, n: 1e-9, p: 1e-12 };
  const suf = m[2] ? (m[2].toLowerCase() === 'meg' ? 'meg' : m[2] === 'M' ? 'meg' : m[2].toLowerCase()) : null;
  return Number(m[1]) * (suf ? mult[suf] : 1);
}

/** Formato numérico con signo menos tipográfico. */
export function formatear(valor, cifras = 3, { signo = false } = {}) {
  if (!Number.isFinite(valor)) return '—';
  const t = valor.toFixed(cifras);
  if (valor !== 0 && Number(t) === 0) return '≈ 0';
  if (valor === 0) return '0';
  const neg = t.startsWith('-');
  return (neg ? '−' : signo && valor > 0 ? '+' : '') + (neg ? t.slice(1) : t);
}

export const partirEsc = (clave) => {
  const i = clave.indexOf('@');
  return i < 0 ? { base: clave, esc: '' } : { base: clave.slice(0, i), esc: clave.slice(i + 1) };
};

const FORMULAS = {
  err: { origen: 'Fórmula · |medido − referencia| / |referencia| × 100', unidad: '%' },
  desv: { origen: 'Fórmula · (medido − propuesto) / propuesto × 100', unidad: '%' },
};

/** Texto breve de una clave de valor vivo para mensajes. */
export const nombreVivo = (v) =>
  v.k === 'formula' ? `=${v.fn}(${v.arg})` : v.k === 'color' ? `color:${v.valor}` : v.clave + (v.escenario ? '@' + v.escenario : '') + (v.origen === 'med' ? ' (medido)' : '');

/**
 * Evalúa un valor vivo contra `variables` ({clave:{valor,unidad,origen}}).
 * Estados: ok · pendiente · unidad (unidad incompatible).
 * Claves: «PR1» (calculado), «PR1@nominal», «PR1@medido» (simulación), «PR1:med» (medido a mano).
 */
export function evaluar(v, vars = {}) {
  if (v.k === 'color') return { estado: 'ok', tipo: 'color' };
  let ent; // {valor, unidad, origen}
  if (v.k === 'formula' && (v.fn === 'err' || v.fn === 'desv')) {
    const { base } = partirEsc(v.arg);
    const med = vars[base + ':med'];
    const ref = vars[v.arg];
    if (!med || !ref || !Number.isFinite(med.valor) || !Number.isFinite(ref.valor) || ref.valor === 0) return { estado: 'pendiente', razon: `falta ${!med ? base + ':med' : v.arg}` };
    let m = med.valor;
    if (med.unidad && ref.unidad && med.unidad !== ref.unidad) {
      const c = convertir(m, med.unidad, ref.unidad);
      if (c === null) return { estado: 'unidad', razon: `${med.unidad} ≠ ${ref.unidad}` };
      m = c;
    }
    const valor = v.fn === 'err' ? (Math.abs(m - ref.valor) / Math.abs(ref.valor)) * 100 : ((m - ref.valor) / ref.valor) * 100;
    return { estado: 'ok', valor, unidad: '%', cifras: v.cifras ?? 2, signo: v.fn === 'desv', origen: FORMULAS[v.fn].origen };
  }
  let clave;
  if (v.k === 'formula') clave = `${v.fn}(${v.arg})`;
  else clave = v.clave + (v.escenario ? '@' + v.escenario : '') + (v.origen === 'med' ? ':med' : '');
  ent = vars[clave];
  if (!ent || !Number.isFinite(ent.valor)) return { estado: 'pendiente', razon: `falta ${clave}` };
  let valor = ent.valor, unidad = ent.unidad || v.unidad || '';
  if (v.unidad && ent.unidad && v.unidad !== ent.unidad) {
    const c = convertir(valor, ent.unidad, v.unidad);
    if (c === null) return { estado: 'unidad', razon: `${ent.unidad} no se convierte a ${v.unidad}` };
    valor = c; unidad = v.unidad;
  } else if (v.unidad) unidad = v.unidad;
  return { estado: 'ok', valor, unidad, cifras: v.cifras ?? 3, origen: [ent.origen, ent.escenario && !/@/.test(clave) ? ent.escenario : ''].filter(Boolean).join(' · ') || clave };
}

// ---- código de colores de resistencias (4 bandas) ----
const COLORES = [
  ['negro', '#222222'], ['café', '#7b4a24'], ['rojo', '#c62828'], ['naranja', '#e8801a'], ['amarillo', '#e6c200'],
  ['verde', '#2e8b3e'], ['azul', '#1f5fbf'], ['violeta', '#7a3fa0'], ['gris', '#808890'], ['blanco', '#f4f4f4'],
];
/** Bandas de una resistencia de 5 %: [{nombre,color}] o null. */
export function bandasColor(ohm) {
  const r = typeof ohm === 'number' ? ohm : parseValor(ohm);
  if (!r || r <= 0) return null;
  let exp = Math.floor(Math.log10(r)) - 1;
  let dig = Math.round(r / 10 ** exp);
  if (dig >= 100) { dig = Math.round(dig / 10); exp += 1; }
  if (exp < -2 || exp > 9) return null;
  const mult = exp >= 0 ? COLORES[exp] : exp === -1 ? ['oro', '#c9a227'] : ['plata', '#b8bcc4'];
  const [d1, d2] = [Math.floor(dig / 10), dig % 10];
  return [COLORES[d1], COLORES[d2], mult, ['oro', '#c9a227']].map(([nombre, color]) => ({ nombre, color }));
}
