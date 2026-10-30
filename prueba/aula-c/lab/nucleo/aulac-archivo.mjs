// Formato de documento AULA-C: ZIP local, o Markdown UTF-8 heredado.
const dec = new TextDecoder('utf-8', { fatal: true });
const enc = new TextEncoder();
const MIME = 'application/vnd.aulac+zip';
const MAX_TOTAL = 64 * 1024 * 1024;
const sig = (b, p) => p >= 0 && p + 4 <= b.length ? new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(p, true) : 0;

const tablaCRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = tablaCRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
async function transformar(bytes, formato, compresion) {
  if (typeof globalThis[formato] !== 'function') throw new Error(`${formato} no disponible para ZIP AULA-C`);
  const flujo = new Blob([bytes]).stream().pipeThrough(new globalThis[formato](compresion));
  return new Uint8Array(await new Response(flujo).arrayBuffer());
}

/** Lee ZIP store/deflate y devuelve sus archivos como Map<string, Uint8Array>. */
export async function leerZip(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 65535); i--) if (sig(b, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('ZIP AULA-C corrupto: falta el directorio final');
  if (eocd + 22 + dv.getUint16(eocd + 20, true) > b.length) throw new Error('ZIP AULA-C corrupto: directorio final truncado');
  const n = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true), total = 0;
  if (p + n * 46 > eocd) throw new Error('ZIP AULA-C corrupto: directorio central truncado');
  const out = new Map();
  for (let k = 0; k < n; k++) {
    if (sig(b, p) !== 0x02014b50 || p + 46 > b.length) throw new Error('ZIP AULA-C corrupto: directorio central inválido');
    const metodo = dv.getUint16(p + 10, true), crc = dv.getUint32(p + 16, true), comp = dv.getUint32(p + 20, true), real = dv.getUint32(p + 24, true);
    const ln = dv.getUint16(p + 28, true), le = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    if (p + 46 + ln + le + lc > b.length) throw new Error('ZIP AULA-C corrupto: nombre o extensiones truncados');
    const nombre = dec.decode(b.subarray(p + 46, p + 46 + ln)); p += 46 + ln + le + lc;
    if (nombre.endsWith('/')) continue;
    total += real; if (total > MAX_TOTAL) throw new Error('ZIP AULA-C excede el tamaño descomprimido permitido');
    if (sig(b, off) !== 0x04034b50 || off + 30 > b.length) throw new Error(`ZIP AULA-C corrupto: entrada inválida (${nombre})`);
    const ini = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
    if (ini + comp > b.length) throw new Error(`ZIP AULA-C corrupto: entrada truncada (${nombre})`);
    const packed = b.subarray(ini, ini + comp);
    let data;
    try { data = metodo === 0 ? packed.slice() : metodo === 8 ? await transformar(packed, 'DecompressionStream', 'deflate-raw') : null; }
    catch (e) { throw new Error(`ZIP AULA-C corrupto: no se pudo descomprimir ${nombre} (${e.message})`); }
    if (!data) throw new Error(`ZIP AULA-C: método ${metodo} no soportado (${nombre})`);
    if (data.length !== real || crc32(data) !== crc) throw new Error(`ZIP AULA-C corrupto: tamaño o CRC incorrecto (${nombre})`);
    out.set(nombre, data);
  }
  return out;
}

function nombreSeguro(n) { return /^(documento\.md|circuitos\/[\w.-]+\.json|capturas\/[\w.-]+\.(?:png|svg))$/.test(n) && !n.split('/').includes('..'); }
export async function leerAulac(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (sig(b, 0) !== 0x04034b50) return { tipo: 'texto', documento: dec.decode(b), manifiesto: null, circuitos: {}, capturas: {} };
  const z = await leerZip(b);
  if (dec.decode(z.get('mimetype') || new Uint8Array()) !== MIME) throw new Error('ZIP AULA-C inválido: mimetype ausente o incorrecto');
  let manifiesto;
  try { manifiesto = JSON.parse(dec.decode(z.get('manifiesto.json') || new Uint8Array())); }
  catch { throw new Error('ZIP AULA-C inválido: manifiesto.json ausente o corrupto'); }
  if (manifiesto.formato !== 'aulac' || manifiesto.version !== 1 || manifiesto.documento !== 'documento.md') throw new Error('ZIP AULA-C inválido: formato o versión de manifiesto no compatibles');
  const doc = z.get('documento.md'); if (!doc) throw new Error('ZIP AULA-C inválido: falta documento.md');
  const circuitos = {}, capturas = {};
  for (const [n, v] of z) if (n !== 'mimetype' && n !== 'manifiesto.json' && n !== 'documento.md') {
    if (!nombreSeguro(n)) throw new Error(`ZIP AULA-C: ruta o tipo de archivo no permitido (${n})`);
    const circuito = n.startsWith('circuitos/'), grupo = circuito ? circuitos : capturas;
    const clave = n.slice(n.indexOf('/') + 1).replace(circuito ? /\.json$/ : /$^/, '');
    grupo[clave] = circuito ? JSON.parse(dec.decode(v)) : v;
  }
  return { tipo: 'zip', documento: dec.decode(doc), manifiesto, circuitos, capturas };
}

function u16(d, p, v) { d.setUint16(p, v, true); }
function u32(d, p, v) { d.setUint32(p, v >>> 0, true); }
function cabeceraLocal(nombre, data, method, packed, crc) {
  const n = enc.encode(nombre), b = new Uint8Array(30 + n.length + packed.length), d = new DataView(b.buffer);
  u32(d, 0, 0x04034b50); u16(d, 4, 20); u16(d, 8, method); u32(d, 14, crc); u32(d, 18, packed.length); u32(d, 22, data.length); u16(d, 26, n.length); b.set(n, 30); b.set(packed, 30 + n.length); return b;
}
export async function escribirAulac({ documento, circuitos = {}, capturas = {} }) {
  const ahora = new Date().toISOString(), archivos = [
    ['mimetype', enc.encode(MIME), false],
    ['manifiesto.json', enc.encode(JSON.stringify({ formato: 'aulac', version: 1, documento: 'documento.md', creado: ahora, modificado: ahora }, null, 2) + '\n'), true],
    ['documento.md', enc.encode(documento), true],
  ];
  for (const [n, v] of Object.entries(circuitos)) { let path = n.startsWith('circuitos/') ? n : `circuitos/${n}`; if (!path.endsWith('.json')) path += '.json'; if (!nombreSeguro(path)) throw new Error(`Nombre de circuito no permitido: ${n}`); archivos.push([path, enc.encode(JSON.stringify(v)), true]); }
  for (const [n, v] of Object.entries(capturas)) { const path = n.startsWith('capturas/') ? n : `capturas/${n}`; if (!nombreSeguro(path)) throw new Error(`Nombre de captura no permitido: ${n}`); archivos.push([path, v instanceof Uint8Array ? v : enc.encode(String(v)), true]); }
  const locals = [], centrals = []; let offset = 0;
  for (const [name, data, compressible] of archivos) {
    let packed = data, method = 0;
    if (compressible && typeof CompressionStream === 'function') { try { packed = await transformar(data, 'CompressionStream', 'deflate-raw'); method = 8; } catch { packed = data; method = 0; } }
    const crc = crc32(data), local = cabeceraLocal(name, data, method, packed, crc), n = enc.encode(name), c = new Uint8Array(46 + n.length), d = new DataView(c.buffer);
    u32(d, 0, 0x02014b50); u16(d, 4, 20); u16(d, 6, 20); u16(d, 10, method); u32(d, 16, crc); u32(d, 20, packed.length); u32(d, 24, data.length); u16(d, 28, n.length); u32(d, 42, offset); c.set(n, 46);
    locals.push(local); centrals.push(c); offset += local.length;
  }
  const centralSize = centrals.reduce((s, x) => s + x.length, 0), end = new Uint8Array(22), ed = new DataView(end.buffer);
  u32(ed, 0, 0x06054b50); u16(ed, 8, archivos.length); u16(ed, 10, archivos.length); u32(ed, 12, centralSize); u32(ed, 16, offset);
  const out = new Uint8Array(offset + centralSize + end.length); let p = 0;
  for (const x of locals) { out.set(x, p); p += x.length; } for (const x of centrals) { out.set(x, p); p += x.length; } out.set(end, p); return out;
}
