// Genera ejemplos/portada-prueba.docx: portada SINTÉTICA (texto ficticio, logo PNG generado) para probar el importador.
// Uso: D:/Tools/nodejs/node.exe documento/ejemplos/generar-portada-prueba.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const TABLA = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export const crc32 = (u8) => { let c = 0xffffffff; for (const b of u8) c = TABLA[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

/** ZIP sin compresión (store). entradas: [[nombre, Uint8Array]] */
export function zipStore(entradas) {
  const partes = [], central = []; let off = 0;
  const enc = new TextEncoder();
  for (const [nombre, datos] of entradas) {
    const nb = enc.encode(nombre), crc = crc32(datos);
    const loc = Buffer.alloc(30); loc.writeUInt32LE(0x04034b50, 0); loc.writeUInt16LE(20, 4); loc.writeUInt16LE(0x0800, 6); loc.writeUInt32LE(crc, 14); loc.writeUInt32LE(datos.length, 18); loc.writeUInt32LE(datos.length, 22); loc.writeUInt16LE(nb.length, 26);
    partes.push(loc, nb, Buffer.from(datos));
    const ce = Buffer.alloc(46); ce.writeUInt32LE(0x02014b50, 0); ce.writeUInt16LE(20, 4); ce.writeUInt16LE(20, 6); ce.writeUInt16LE(0x0800, 8); ce.writeUInt32LE(crc, 16); ce.writeUInt32LE(datos.length, 20); ce.writeUInt32LE(datos.length, 24); ce.writeUInt16LE(nb.length, 28); ce.writeUInt32LE(off, 42);
    central.push(ce, nb);
    off += 30 + nb.length + datos.length;
  }
  const cd = Buffer.concat(central);
  const fin = Buffer.alloc(22); fin.writeUInt32LE(0x06054b50, 0); fin.writeUInt16LE(entradas.length, 8); fin.writeUInt16LE(entradas.length, 10); fin.writeUInt32LE(cd.length, 12); fin.writeUInt32LE(off, 16);
  return Buffer.concat([...partes, cd, fin]);
}

/** PNG 64x64: cuadrado guinda con franja blanca (logo ficticio). */
export function pngLogo() {
  const W = 64, H = 64, filas = [];
  for (let y = 0; y < H; y++) { const f = Buffer.alloc(1 + W * 3); for (let x = 0; x < W; x++) { const franja = y >= 28 && y < 36; f[1 + x * 3] = franja ? 255 : 0x7a; f[2 + x * 3] = franja ? 255 : 0x1f; f[3 + x * 3] = franja ? 255 : 0x45; } filas.push(f); }
  const chunk = (tipo, datos) => { const b = Buffer.alloc(12 + datos.length); b.writeUInt32BE(datos.length, 0); b.write(tipo, 4, 'ascii'); datos.copy(b, 8); b.writeUInt32BE(crc32(b.subarray(4, 8 + datos.length)), 8 + datos.length); return b; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(filas))), chunk('IEND', Buffer.alloc(0))]);
}

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';
const par = (texto, { jc = 'left', b = false, sz = 24, antes = 0, despues = 120 } = {}) =>
  `<w:p><w:pPr><w:jc w:val="${jc}"/><w:spacing w:before="${antes}" w:after="${despues}"/></w:pPr>${texto === '' ? '' : `<w:r><w:rPr>${b ? '<w:b/>' : ''}<w:sz w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${texto}</w:t></w:r>`}</w:p>`;
const EMU = 64 * 9525;
const logo = `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline><wp:extent cx="${EMU}" cy="${EMU}"/><a:graphic><a:graphicData><a:pic><a:blipFill><a:blip r:embed="rId1"/></a:blipFill></a:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
const celda = (t, b) => `<w:tc><w:tcPr/>${par(t, { b, sz: 22, despues: 40 })}</w:tc>`;
const tabla = `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single"/><w:bottom w:val="single"/><w:left w:val="single"/><w:right w:val="single"/><w:insideH w:val="single"/><w:insideV w:val="single"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol/><w:gridCol/></w:tblGrid>` +
  `<w:tr>${celda('Materia', true)}${celda('Nombre de la materia')}</w:tr><w:tr>${celda('Profesora', true)}${celda('Nombre de la profesora')}</w:tr></w:tbl>`;
const documento = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>` +
  logo +
  par('Instituto Politécnico Nacional', { jc: 'center', b: true, sz: 40, antes: 120 }) +
  par('Unidad Profesional Interdisciplinaria en Ingeniería y Tecnologías Avanzadas', { jc: 'center', sz: 22, despues: 480 }) +
  par('Práctica #1', { jc: 'center', b: true, sz: 56, antes: 480 }) +
  par('Subtítulo de la práctica', { jc: 'center', sz: 32, despues: 480 }) +
  par('Nombre del alumno', { jc: 'center', sz: 28 }) +
  par('Grupo 2XX0', { jc: 'center', sz: 24, despues: 360 }) +
  tabla +
  par('', {}) +
  par('Ciudad de México a 29 de octubre de 2026.', { jc: 'right', sz: 22, antes: 960 }) +
  `<w:sectPr/></w:body></w:document>`;

export function construirDocx() {
  const enc = new TextEncoder();
  return zipStore([
    ['[Content_Types].xml', enc.encode('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="png" ContentType="image/png"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')],
    ['_rels/.rels', enc.encode('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')],
    ['word/document.xml', enc.encode(documento)],
    ['word/_rels/document.xml.rels', enc.encode('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>')],
    ['word/media/logo.png', pngLogo()],
  ]);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll('\\', '/').split('/').pop())) {
  const destino = new URL('./portada-prueba.docx', import.meta.url);
  writeFileSync(destino, construirDocx());
  console.log('Escrito', destino.pathname);
}
