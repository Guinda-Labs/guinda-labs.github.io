// Importa una portada .docx en el navegador (todo local): lector ZIP mínimo + XML mínimo → HTML de hoja carta.
// Sin dependencias; usa DecompressionStream('deflate-raw') (navegadores actuales y Node ≥ 18).
// El HTML guardado lleva marcadores {{campo}} que se llenan con los valores del front matter (llenarPortada).

const MAX_TOTAL = 24 * 1024 * 1024;
const dec = new TextDecoder('utf-8');
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// ---------- ZIP ----------
/** bytes de un .zip → Map nombre → Uint8Array (store y deflate). */
export async function leerZip(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 22 - 65535); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('No es un archivo ZIP/.docx válido');
  const n = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const out = new Map(); let total = 0;
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Directorio ZIP dañado');
    const metodo = dv.getUint16(p + 10, true), comp = dv.getUint32(p + 20, true), real = dv.getUint32(p + 24, true);
    const ln = dv.getUint16(p + 28, true), le = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const nombre = dec.decode(u8.subarray(p + 46, p + 46 + ln));
    p += 46 + ln + le + lc;
    if (nombre.endsWith('/')) continue;
    total += real;
    if (total > MAX_TOTAL) throw new Error('El .docx descomprimido es demasiado grande');
    if (dv.getUint32(off, true) !== 0x04034b50) throw new Error('Entrada ZIP dañada: ' + nombre);
    const ini = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
    const datos = u8.subarray(ini, ini + comp);
    if (metodo === 0) out.set(nombre, datos.slice());
    else if (metodo === 8) out.set(nombre, await inflar(datos, real));
    else throw new Error(`Método de compresión ${metodo} no soportado (${nombre})`);
  }
  return out;
}
async function inflar(datos, esperado) {
  if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador no puede descomprimir .docx (falta DecompressionStream)');
  const flujo = new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const r = new Uint8Array(await new Response(flujo).arrayBuffer());
  if (esperado && r.length !== esperado) throw new Error('Tamaño descomprimido inesperado');
  return r;
}

// ---------- XML mínimo ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const desescapar = (t) => t.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m));
export function parseXML(xml) {
  const raiz = { n: '#', a: {}, c: [] }; const pila = [raiz];
  for (const m of xml.matchAll(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g)) {
    const cur = pila[pila.length - 1];
    if (m[1] !== undefined) cur.c.push({ n: '#t', t: m[1] });
    else if (m[3]) {
      if (m[2]) { if (pila.length > 1) pila.pop(); continue; }
      const a = {};
      for (const x of m[4].matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) a[x[1]] = desescapar(x[2] ?? x[3]);
      const nodo = { n: m[3], a, c: [] }; cur.c.push(nodo);
      if (!m[5]) pila.push(nodo);
    } else if (m[6] !== undefined) cur.c.push({ n: '#t', t: desescapar(m[6]) });
  }
  return raiz;
}
const hijos = (x, n) => x.c.filter((h) => h.n === n);
const hijo = (x, n) => x.c.find((h) => h.n === n);
const buscar = (x, n, out = []) => { for (const h of x.c || []) { if (h.n === n) out.push(h); buscar(h, n, out); } return out; };

// ---------- docx → HTML ----------
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp' };
const aBase64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); };
const activo = (el) => !!el && el.a['w:val'] !== '0' && el.a['w:val'] !== 'false' && el.a['w:val'] !== 'none';

/** Reglas por defecto: texto genérico de portada → campo del front matter. */
export const REGLAS_CAMPOS = [
  [/Pr[aá]ctica\s*#?\s*\d+/i, 'Práctica #{{numero}}', 'numero'],
  [/Nombre del alumno|Nombre del estudiante/i, '{{alumno}}', 'alumno'],
  [/Nombre de la profesora|Nombre del profesor(?:a)?/i, '{{profesora}}', 'profesora'],
  [/Nombre de la carrera/i, '{{carrera}}', 'carrera'],
  [/Nombre de la (?:materia|asignatura|unidad de aprendizaje)/i, '{{curso}}', 'curso'],
  [/Subt[ií]tulo(?: de la pr[aá]ctica)?/i, '{{subtitulo}}', 'subtitulo'],
  [/\bGrupo\s+\w*\d\w*/i, '{{grupo}}', 'grupo'],
  [/\d{1,2}\s+de\s+[a-záéíóúñ]+\s+de\s+\d{4}/i, '{{fecha}}', 'fecha'],
];
function cambiarTexto(txt, valores, usados) {
  let t = txt;
  // textos que ya coinciden con valores del documento (de más largo a más corto)
  const vs = Object.entries(valores || {}).filter(([, v]) => String(v ?? '').trim().length >= 3).sort((a, b) => String(b[1]).length - String(a[1]).length);
  for (const [k, v] of vs) { const val = String(v).trim(); if (t.includes(val)) { t = t.replaceAll(val, `{{${k}}}`); usados.add(k); } }
  for (const [re, nuevo, campo] of REGLAS_CAMPOS) {
    const g = new RegExp(re.source, re.flags.replace('g', '') + 'g');
    const sin = t.replace(/\{\{\w+\}\}/g, '');
    if (g.test(sin)) {
      // reemplazar solo fuera de marcadores ya puestos
      t = t.split(/(\{\{\w+\}\})/).map((trozo) => (trozo.startsWith('{{') ? trozo : trozo.replace(g, nuevo))).join('');
      usados.add(campo);
    }
  }
  for (const m of t.matchAll(/\{\{(\w+)\}\}/g)) usados.add(m[1]);
  return t;
}

function fuenteDe(r) {
  const pr = hijo(r, 'w:rPr');
  const f = { b: false, i: false, u: false, sz: 0, fam: '', color: '' };
  if (pr) {
    f.b = activo(hijo(pr, 'w:b')); f.i = activo(hijo(pr, 'w:i')); f.u = activo(hijo(pr, 'w:u'));
    const sz = hijo(pr, 'w:sz'); if (sz) f.sz = (+sz.a['w:val'] || 0) / 2;
    const rf = hijo(pr, 'w:rFonts'); if (rf) f.fam = (rf.a['w:ascii'] || rf.a['w:hAnsi'] || '').replace(/[^\w \-]/g, '');
    const co = hijo(pr, 'w:color'); if (co && /^[0-9a-f]{6}$/i.test(co.a['w:val'] || '')) f.color = '#' + co.a['w:val'];
  }
  return f;
}
function runs(p, ctx) {
  const salida = [];
  for (const r of buscar(p, 'w:r')) {
    const f = fuenteDe(r);
    for (const h of r.c) {
      if (h.n === 'w:t') salida.push({ f, t: h.c.map((x) => x.t || '').join('') });
      else if (h.n === 'w:tab') salida.push({ f, t: '\t' });
      else if (h.n === 'w:br' || h.n === 'w:cr') salida.push({ f, br: true });
      else if (h.n === 'w:drawing' || h.n === 'mc:AlternateContent') {
        const bl = buscar(h, 'a:blip')[0];
        const id = bl && (bl.a['r:embed'] || bl.a['r:link']);
        const ext = buscar(h, 'wp:extent')[0];
        if (id && ctx.rels[id]) {
          const ruta = ctx.rels[id], datos = ctx.zip.get(ruta);
          const e = (ruta.split('.').pop() || '').toLowerCase();
          if (datos && MIME[e]) salida.push({ img: `data:${MIME[e]};base64,${aBase64(datos)}`, w: ext ? Math.round((+ext.a.cx || 0) / 9525) : 0 });
          else ctx.avisos.push(`Imagen «${ruta}» no se pudo leer o su formato no se admite`);
        }
      }
    }
  }
  return salida;
}
const igualF = (a, b) => a.b === b.b && a.i === b.i && a.u === b.u && a.sz === b.sz && a.fam === b.fam && a.color === b.color;

function parrafo(p, ctx) {
  const pr = hijo(p, 'w:pPr');
  const jc = pr && hijo(pr, 'w:jc')?.a['w:val'];
  const align = { center: 'center', right: 'right', end: 'right', both: 'justify', left: 'left', start: 'left' }[jc] || '';
  const sp = pr && hijo(pr, 'w:spacing');
  const antes = sp ? (+sp.a['w:before'] || 0) / 20 : 0, desp = sp ? (+sp.a['w:after'] || 0) / 20 : 0;
  // fusionar runs de texto con el mismo formato (Word los parte arbitrariamente)
  const fus = [];
  for (const r of runs(p, ctx)) {
    const u = fus[fus.length - 1];
    if (r.t !== undefined && u && u.t !== undefined && igualF(u.f, r.f)) u.t += r.t; else fus.push({ ...r });
  }
  let html = '';
  for (const r of fus) {
    if (r.img) { html += `<img src="${r.img}" alt=""${r.w ? ` style="width:${Math.min(r.w, 624)}px;max-width:100%;height:auto"` : ' style="max-width:100%;height:auto"'}>`; continue; }
    if (r.br) { html += '<br>'; continue; }
    const t = cambiarTexto(r.t, ctx.valores, ctx.usados);
    if (!t) continue;
    const st = [];
    if (r.f.b) st.push('font-weight:700');
    if (r.f.i) st.push('font-style:italic');
    if (r.f.u) st.push('text-decoration:underline');
    if (r.f.sz) st.push(`font-size:${r.f.sz}pt`);
    if (r.f.fam) st.push(`font-family:'${r.f.fam}',sans-serif`);
    if (r.f.color) st.push(`color:${r.f.color}`);
    const txt = esc(t).replaceAll('\t', '&emsp;');
    html += st.length ? `<span style="${st.join(';')}">${txt}</span>` : txt;
  }
  const st = [`margin:${antes}pt 0 ${desp}pt`];
  if (align) st.push(`text-align:${align}`);
  return `<p style="${st.join(';')}">${html || '&nbsp;'}</p>`;
}
function tabla(t, ctx) {
  const bordes = hijo(hijo(t, 'w:tblPr') || { c: [] }, 'w:tblBorders');
  const hay = !!bordes && bordes.c.some((b) => b.a['w:val'] && b.a['w:val'] !== 'nil' && b.a['w:val'] !== 'none');
  const filas = hijos(t, 'w:tr').map((tr) => `<tr>${hijos(tr, 'w:tc').map((tc) => {
    const gs = hijo(hijo(tc, 'w:tcPr') || { c: [] }, 'w:gridSpan');
    return `<td${gs ? ` colspan="${+gs.a['w:val'] || 1}"` : ''} style="${hay ? 'border:1px solid #000;' : ''}padding:2pt 6pt;vertical-align:top">${contenido(tc, ctx)}</td>`;
  }).join('')}</tr>`).join('');
  return `<table style="border-collapse:collapse;width:100%;margin:6pt 0">${filas}</table>`;
}
function contenido(x, ctx) {
  let h = '';
  for (const e of x.c) {
    if (e.n === 'w:p') h += parrafo(e, ctx);
    else if (e.n === 'w:tbl') h += tabla(e, ctx);
    else if (e.n === 'w:sdt') { const sc = hijo(e, 'w:sdtContent'); if (sc) h += contenido(sc, ctx); }
  }
  return h;
}

/**
 * Entradas del ZIP → {html, campos, avisos}. `valores` (opcional): {campo: valor} del front matter para
 * reconocer textos que ya coinciden con los datos del documento.
 */
export function docxAHTML(zip, valores = {}) {
  const doc = zip.get('word/document.xml');
  if (!doc) throw new Error('El archivo no tiene word/document.xml: ¿es un .docx?');
  const rels = {};
  const rx = zip.get('word/_rels/document.xml.rels');
  if (rx) for (const r of buscar(parseXML(dec.decode(rx)), 'Relationship')) if (r.a.Id && r.a.Target) rels[r.a.Id] = r.a.Target.startsWith('/') ? r.a.Target.slice(1) : 'word/' + r.a.Target.replace(/^\.\//, '');
  const ctx = { zip, rels, valores, usados: new Set(), avisos: [] };
  const cuerpo = buscar(parseXML(dec.decode(doc)), 'w:body')[0];
  if (!cuerpo) throw new Error('word/document.xml no tiene cuerpo');
  const html = contenido(cuerpo, ctx);
  if (!html.trim()) ctx.avisos.push('La portada importada quedó vacía');
  return { html, campos: [...ctx.usados], avisos: ctx.avisos };
}

/** Bytes de un .docx → {html, campos, avisos}. */
export async function importarDocx(bytes, valores = {}) { return docxAHTML(await leerZip(bytes), valores); }

// ---------- sustitución de campos ----------
/** Valores de portada del front matter (meta.portada) → {campo: texto}. */
export function camposDePortada(p) {
  const o = typeof p === 'object' && p ? p : {};
  return Object.fromEntries(['numero', 'subtitulo', 'grupo', 'curso', 'alumno', 'profesora', 'carrera', 'unidad', 'fecha'].filter((k) => o[k] !== undefined && o[k] !== '').map((k) => [k, String(o[k])]));
}
/** Sustituye {{campo}} por el valor (escapado). Campos sin dato quedan como marca gris editable. */
export function llenarPortada(html, campos) {
  return html.replace(/\{\{(\w+)\}\}/g, (m, k) => (campos[k] !== undefined && campos[k] !== ''
    ? `<span contenteditable="plaintext-only" data-campo="${k}">${esc(campos[k])}</span>`
    : `<span contenteditable="plaintext-only" data-campo="${k}" data-ph="${esc(k)}"></span>`));
}
/** Portada importada de este documento: «archivo:» del front matter si existe; si no, la elegida en la galería. */
export function portadaImportada(meta, almacen) {
  const items = (almacen && almacen.items) || {};
  const p = meta && meta.portada;
  const archivo = p && typeof p === 'object' ? p.archivo : '';
  if (archivo && items[archivo]) return { nombre: archivo, html: items[archivo] };
  const sel = almacen && almacen.sel;
  if (!archivo && sel && items[sel]) return { nombre: sel, html: items[sel] };
  return null;
}
