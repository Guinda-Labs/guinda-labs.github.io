// Parser puro de .aulac (ver coordinacion/ipn-folio/diseno/r21-doc/FORMATO.md).
// parse(texto) → {meta, bloques, diagnosticos, vivos, circuitos, tablas, nombres}
// verificar(doc, variables) → lista [{nivel:'error'|'aviso'|'ok', linea, mensaje}]
import { errorLatex } from './mathml.mjs';
import { parseValor, unidadValida, evaluar, partirEsc, nombreVivo } from './valores.mjs';

export const CAMPOS_PORTADA = ['numero', 'subtitulo', 'grupo', 'curso', 'alumno', 'profesora', 'carrera', 'unidad', 'fecha'];
export const PLANTILLAS_PORTADA = ['clasica-upiita', 'institucional', 'minima'];

// ---------- YAML mínimo (mapas anidados, listas planas, mapas/listas en línea) ----------
function escalar(v) {
  v = v.trim();
  if (v === '') return '';
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v.startsWith('{') && v.endsWith('}')) {
    const o = {};
    for (const par of partirNivel(v.slice(1, -1))) {
      const k = par.indexOf(':');
      if (k > 0) o[par.slice(0, k).trim()] = escalar(par.slice(k + 1));
    }
    return o;
  }
  if (v.startsWith('[') && v.endsWith(']')) return partirNivel(v.slice(1, -1)).map(escalar);
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}
function partirNivel(s, sep = ',') {
  const out = []; let d = 0, q = '', cur = '';
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = ''; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if ('([{'.includes(ch)) d++;
    if (')]}'.includes(ch)) d--;
    if (ch === sep && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
function yaml(lineas, base, aviso) {
  const filas = lineas.map((t, k) => ({ t, n: base + k })).filter((x) => x.t.trim() && !x.t.trim().startsWith('#'));
  let p = 0;
  const sangria = (t) => t.match(/^ */)[0].length;
  function mapa(ind) {
    const o = {};
    while (p < filas.length && sangria(filas[p].t) === ind) {
      const { t, n } = filas[p++];
      const m = t.trim().match(/^([\w.-]+)\s*:\s*(.*)$/);
      if (!m) { aviso(n, `Front matter: línea no entendida «${t.trim()}»`); continue; }
      if (m[2] === '' && p < filas.length && sangria(filas[p].t) > ind) o[m[1]] = mapa(sangria(filas[p].t));
      else o[m[1]] = escalar(m[2]);
    }
    return o;
  }
  return filas.length ? mapa(sangria(filas[0].t)) : {};
}

// ---------- utilidades ----------
function atributos(s) {
  const a = {};
  for (const m of (s || '').matchAll(/([\w-]+)(?:=("[^"]*"|\S+))?/g)) a[m[1]] = m[2] === undefined ? true : m[2].replace(/^"|"$/g, '');
  return a;
}
const tokens = (s) => s.match(/(?:[\w-]+=)?"[^"]*"|\S+/g) || [];
export const partirFila = (l) => {
  let t = l.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  return t.split(/(?<!\\)\|/).map((c) => c.trim().replaceAll('\\|', '|'));
};
const RE_INICIO = /^(#{1,6}\s|```|:::|\||!\[|<!--|\s*(?:[-*]|\d+\.)\s+)/;

// ---------- valores vivos y matemáticas dentro de un texto ----------
export function parseVivo(contenido) {
  const c = contenido.trim();
  if (c.startsWith('color:')) return { k: 'color', valor: c.slice(6).trim() };
  if (c[0] === '=') {
    const [expr, unidad, cifras] = c.slice(1).split(':').map((x) => x.trim());
    const m = expr.match(/^(\w+)\((.*)\)$/);
    return { k: 'formula', fn: m ? m[1] : expr, arg: m ? m[2].trim() : '', unidad: unidad || '', cifras: cifras !== undefined && cifras !== '' ? parseInt(cifras, 10) : undefined, crudo: c };
  }
  const partes = c.split(':').map((x) => x.trim());
  const { base, esc } = partirEsc(partes[0]);
  const resto = partes.slice(1);
  let origen = 'calc';
  if (resto[0] === 'calc' || resto[0] === 'med') origen = resto.shift();
  let unidad = '', cifras;
  if (resto.length && !/^\d+$/.test(resto[0])) unidad = resto.shift();
  if (resto.length && /^\d+$/.test(resto[0])) cifras = parseInt(resto[0], 10);
  return { k: 'var', clave: base, escenario: esc, origen, unidad, cifras, crudo: c };
}

/** Parte un texto en segmentos: texto, vivo ({{…}}) y mate ($…$ / $$…$$). */
export function segmentos(texto) {
  const out = []; let ult = 0;
  for (const m of texto.matchAll(/\{\{([^}]*)\}\}|\$\$([\s\S]+?)\$\$|(?<!\\)\$([^$\n]+?)(?<!\\)\$/g)) {
    if (m.index > ult) out.push({ t: 'texto', v: texto.slice(ult, m.index) });
    if (m[1] !== undefined) out.push({ t: 'vivo', v: parseVivo(m[1]), crudo: m[0] });
    else if (m[2] !== undefined) out.push({ t: 'mate', v: m[2].trim(), display: true });
    else out.push({ t: 'mate', v: m[3].trim(), display: false });
    ult = m.index + m[0].length;
  }
  if (ult < texto.length) out.push({ t: 'texto', v: texto.slice(ult) });
  return out;
}

// ---------- circuito ----------
function partirEscenarios(s) {
  return partirNivel(s).map((e) => {
    const m = e.match(/^(\w+)\s*(?:\((.*)\))?$/);
    if (!m) return { nombre: e, sust: [], crudo: e };
    const sust = m[2] ? partirNivel(m[2]).map((x) => { const [v, ref] = x.split('=').map((y) => y.trim()); return { variable: v, ref: ref || '' }; }) : [];
    return { nombre: m[1], sust };
  });
}

function parseCircuito(cuerpo, l0, attrs, err, av) {
  const c = { id: attrs.id || '', analisis: attrs.analisis || 'dc', escenarios: [], elementos: [], sondas: [], nodos: new Set(), archivo: attrs.archivo || '' };
  const texto = cuerpo.join('\n').trim();
  if (c.archivo && !texto) { av(l0, `Circuito «${c.id}»: esquema externo «${c.archivo}» no se verifica aquí`); return c; }
  if (texto.startsWith('{')) {
    try {
      const j = JSON.parse(texto);
      for (const e of j.elementos || []) c.elementos.push({ nombre: e.nombre, nodos: e.nodos, valor: typeof e.valor === 'number' ? e.valor : parseValor(String(e.valor)), valorTexto: String(e.valor), linea: l0 });
      for (const s of j.sondas || []) c.sondas.push({ nombre: s.nombre, medida: s.medida, ...medidaSonda(s.medida), ref: s.ref || '', dir: s.dir || '', linea: l0 });
      if (j.escenarios) c.escenarios = partirEscenarios(Array.isArray(j.escenarios) ? j.escenarios.join(', ') : j.escenarios);
    } catch (e) { err(l0, `Circuito «${c.id}»: JSON de esquema inválido (${e.message})`); }
  } else {
    cuerpo.forEach((raw, k) => {
      const linea = l0 + k;
      const t = raw.replace(/;.*$/, '').trim();
      if (!t) return;
      if (/^escenarios\s*:/i.test(t)) { c.escenarios = partirEscenarios(t.replace(/^escenarios\s*:/i, '')); return; }
      const tk = tokens(t);
      if (tk[0].startsWith('.')) {
        if (tk[0] === '.sonda') {
          const m = medidaSonda(tk[2] || '');
          if (!tk[1] || !m.tipo) { err(linea, `Sonda inválida «${t}»: use .sonda NOMBRE i(ELEM) | v(NODO)`); return; }
          const at = atributos(tk.slice(3).join(' '));
          c.sondas.push({ nombre: tk[1], medida: tk[2], ...m, ref: at.ref || '', dir: at.dir || '', linea });
        } else av(linea, `Directiva ${tk[0]} no soportada, se ignora`);
        return;
      }
      if (tk.length < 4) { err(linea, `Elemento incompleto «${t}»: se espera NOMBRE nodo nodo valor`); return; }
      const valor = parseValor(tk[3]);
      if (valor === null) { err(linea, `Valor no válido «${tk[3]}» en ${tk[0]}`); return; }
      c.elementos.push({ nombre: tk[0], nodos: [tk[1], tk[2]], valor, valorTexto: tk[3], linea });
    });
  }
  const nombres = new Set(), cuenta = {};
  for (const e of c.elementos) {
    if (nombres.has(e.nombre)) err(e.linea, `Elemento «${e.nombre}» repetido`);
    nombres.add(e.nombre);
    for (const n of e.nodos || []) { c.nodos.add(n); cuenta[n] = (cuenta[n] || 0) + 1; }
  }
  if (!c.elementos.length) err(l0, `Circuito «${c.id}» sin elementos`);
  else if (![...c.nodos].some((n) => /^(gnd|0)$/i.test(n))) err(l0, `Circuito «${c.id}» sin tierra (nodo gnd o 0)`);
  for (const [n, k] of Object.entries(cuenta)) if (k === 1 && !/^(gnd|0)$/i.test(n)) av(c.elementos.find((e) => e.nodos.includes(n)).linea, `Circuito «${c.id}»: el nodo «${n}» tiene una sola conexión`);
  for (const s of c.sondas) {
    const ok = s.tipo === 'i' ? nombres.has(s.objetivo) : c.nodos.has(s.objetivo) || nombres.has(s.objetivo);
    if (!ok) err(s.linea, `Sonda ${s.nombre}: «${s.objetivo}» no existe en el circuito «${c.id}»`);
    if (s.ref && !c.nodos.has(s.ref)) err(s.linea, `Sonda ${s.nombre}: referencia «${s.ref}» no existe`);
  }
  return c;
}
function medidaSonda(m) {
  const x = String(m).match(/^([iv])\(([\w.]+)\)$/i);
  return x ? { tipo: x[1].toLowerCase(), objetivo: x[2] } : { tipo: '', objetivo: '' };
}

// ---------- desarrollo ----------
function parseDesarrollo(cuerpo, l0, err) {
  const items = [];
  let cur = null;
  const cierra = () => { if (cur) { items.push(cur); cur = null; } };
  cuerpo.forEach((raw, k) => {
    const m = raw.match(/^-\s+(.*)$/);
    if (m) { cierra(); cur = { texto: m[1], linea: l0 + k }; }
    else if (cur && raw.trim()) cur.texto += '\n' + raw.trim();
  });
  cierra();
  return items.map((it) => {
    const t = it.texto, linea = it.linea;
    let m;
    if ((m = t.match(/^ramas\s*:\s*(.*)$/s))) {
      return { tipo: 'ramas', linea, ramas: partirNivel(m[1], ';').map((r) => { const x = r.match(/^(\w+)\s*=\s*(\w+)\s*(?:\((.*)\))?$/); return x ? { corriente: x[1], sonda: x[2], detalle: x[3] || '' } : { corriente: r, sonda: '', detalle: '' }; }) };
    }
    if ((m = t.match(/^lkv\s+(\S+)\s+"([^"]*)"\s*:\s*(.*)$/s))) return { tipo: 'lkv', id: m[1], elementos: m[2], ecuacion: m[3].trim(), linea };
    if ((m = t.match(/^lck\s+nodos\s*:\s*(.*)$/s))) return { tipo: 'lck-nodos', nodos: m[1].split(',').map((x) => x.trim()).filter(Boolean), linea };
    if ((m = t.match(/^lck\s+(\S+?)\s*:\s*(.*)$/s))) return { tipo: 'lck', id: m[1], ecuacion: m[2].trim(), linea };
    if ((m = t.match(/^sistema\s*(?:\(([^)]*)\))?\s*:\s*(.*)$/s))) {
      const at = atributos(m[2]); const o = { tipo: 'sistema', nota: m[1] || '', linea, resuelve: at.resuelve || '' };
      try { o.matriz = JSON.parse(at.matriz); } catch { err(linea, 'Sistema: matriz no es JSON válido'); o.matriz = []; }
      try { o.rhs = JSON.parse(at.rhs); } catch { err(linea, 'Sistema: rhs no es JSON válido'); o.rhs = []; }
      o.incognitas = String(at.incognitas || '').replace(/^\[|\]$/g, '').split(',').map((x) => x.trim()).filter(Boolean);
      if (o.matriz.length && (o.matriz.length !== o.incognitas.length || o.matriz.some((f) => f.length !== o.incognitas.length) || o.rhs.length !== o.incognitas.length)) err(linea, `Sistema: dimensiones incoherentes (${o.matriz.length} filas, ${o.incognitas.length} incógnitas, rhs ${o.rhs.length})`);
      return o;
    }
    if ((m = t.match(/^ohm\s*:\s*(.*)$/s))) {
      const r = m[1].trim().match(/^([A-Za-z]+)(\d+)\.\.\1?(\d+)$/);
      const lista = r ? Array.from({ length: +r[3] - +r[2] + 1 }, (_, i) => r[1] + (+r[2] + i)) : m[1].split(',').map((x) => x.trim()).filter(Boolean);
      return { tipo: 'ohm', elementos: lista, linea };
    }
    if ((m = t.match(/^caracteristicas\s*:\s*(.*)$/s))) return { tipo: 'caracteristicas', alcance: m[1].trim(), linea };
    if ((m = t.match(/^reduccion\b(.*)$/s))) return { tipo: 'reduccion', atributos: atributos(m[1].replace(/:.*$/s, '')), linea };
    err(linea, `Desarrollo: línea no reconocida «${t.slice(0, 40)}»`);
    return { tipo: 'desconocido', texto: t, linea };
  });
}

// ---------- parser principal ----------
export function parse(texto) {
  const L = String(texto).replace(/\r\n?/g, '\n').split('\n');
  const diagnosticos = [];
  const err = (linea, mensaje) => diagnosticos.push({ nivel: 'error', linea, mensaje });
  const av = (linea, mensaje) => diagnosticos.push({ nivel: 'aviso', linea, mensaje });
  const doc = { meta: {}, bloques: [], diagnosticos, vivos: [], circuitos: [], tablas: [], codigos: [], nombres: new Set(), lineas: L.length };
  const refs = []; // vivos por validar al final
  let i = 0;

  if (L[0] && L[0].trim() === '---') {
    let j = 1;
    while (j < L.length && L[j].trim() !== '---') j++;
    if (j >= L.length) { err(1, 'Front matter sin cerrar (falta la segunda línea ---)'); i = 1; }
    else { doc.meta = yaml(L.slice(1, j), 2, av); i = j + 1; }
  }

  const registrar = (txt, linea, fuente) => {
    if (!txt) return;
    const sinPares = txt.replace(/\\\$/g, '').replace(/\$\$[\s\S]*?\$\$/g, '');
    if ((sinPares.match(/\$/g) || []).length % 2) err(linea, 'Signo $ sin cerrar (fórmula incompleta)');
    for (const s of segmentos(txt)) {
      if (s.t === 'vivo') { const r = { ...s.v, linea, fuente }; doc.vivos.push(r); refs.push(r); }
    }
    for (const m of txt.matchAll(/\{\{(?![^}]*\}\})/g)) err(linea, 'Valor vivo {{ sin cerrar');
  };

  while (i < L.length) {
    const lin = L[i], linea = i + 1, t = lin.trim();
    if (!t) { i++; continue; }

    if (t.startsWith('<!--')) { // comentario
      while (i < L.length && !L[i].includes('-->')) i++;
      i++; continue;
    }

    let m;
    if ((m = t.match(/^```(\w+)?\s*(.*)$/))) { // cerco de código
      const lang = (m[1] || 'texto').toLowerCase(), attrs = atributos(m[2]);
      const cuerpo = []; let j = i + 1;
      while (j < L.length && !L[j].trim().startsWith('```')) cuerpo.push(L[j++]);
      if (j >= L.length) err(linea, `Cerco \`\`\`${lang} sin cerrar`);
      if (lang === 'circuito') {
        const c = parseCircuito(cuerpo, linea + 1, attrs, err, av);
        if (!c.id) { c.id = `circ${doc.circuitos.length + 1}`; av(linea, `Circuito sin id: se usa «${c.id}»`); }
        doc.circuitos.push(c);
        doc.bloques.push({ tipo: 'circuito', linea, circuito: c, codigo: cuerpo.join('\n') });
      } else {
        const produce = String(attrs.produce || '').split(/[\s,]+/).filter(Boolean);
        for (const c of cuerpo.slice(0, 5)) { const mm = c.match(/^\s*(?:%|#|\/\/)\s*produce\s*:\s*(.+)$/i); if (mm) for (const p of mm[1].split(',')) produce.push(p.trim().replace(/\[.*$/, '')); }
        const b = { tipo: 'codigo', lenguaje: lang, nombre: attrs.nombre && attrs.nombre !== true ? attrs.nombre : '', produce, pliega: !!attrs.pliega, ejecuta: !!attrs.ejecuta, codigo: cuerpo.join('\n'), linea };
        doc.codigos.push(b);
        for (const p of produce) doc.nombres.add(p);
        doc.bloques.push(b);
      }
      i = j + 1; continue;
    }

    if ((m = t.match(/^:::\s*(\w+)?\s*(.*?)\s*:::\s*$/)) && t.length > 3) { // contenedor de una línea
      const nombre = m[1] || '';
      doc.bloques.push({ tipo: nombre === 'campo' ? 'campo' : 'respuesta', nombre, atributos: atributos(m[2]), linea });
      i++; continue;
    }
    if ((m = t.match(/^:::\s*(\w+)\s*(.*)$/))) { // contenedor de varias líneas
      const cuerpo = []; let j = i + 1;
      while (j < L.length && L[j].trim() !== ':::') cuerpo.push(L[j++]);
      if (j >= L.length) err(linea, `Contenedor ::: ${m[1]} sin cerrar`);
      const attrs = atributos(m[2]);
      if (m[1] === 'desarrollo') {
        const items = parseDesarrollo(cuerpo, linea + 1, err);
        for (const it of items) { if (it.ecuacion) registrar(it.ecuacion, it.linea, 'desarrollo'); }
        doc.bloques.push({ tipo: 'desarrollo', n: parseInt(attrs.n, 10) || 1, circuito: attrs.circuito || '', items, linea });
      } else {
        const txt = cuerpo.join('\n').trim();
        registrar(txt, linea + 1, m[1]);
        doc.bloques.push({ tipo: 'contenedor', nombre: m[1], atributos: attrs, texto: txt, linea });
      }
      i = j + 1; continue;
    }

    if ((m = t.match(/^(#{1,6})\s+(.*)$/))) {
      const nivel = m[1].length;
      const b = { tipo: 'titulo', nivel, texto: m[2].trim(), linea };
      registrar(b.texto, linea, 'titulo');
      doc.bloques.push(b);
      i++;
      if (nivel === 1) {
        const sig = L[i];
        if (sig && sig.trim() && !RE_INICIO.test(sig) && !sig.trim().startsWith('$')) { b.subtitulo = sig.trim(); registrar(b.subtitulo, i + 1, 'subtitulo'); i++; }
      }
      continue;
    }

    if (t.startsWith('|')) { // tabla
      const filas = []; const ini = i;
      while (i < L.length && L[i].trim().startsWith('|')) { filas.push({ linea: i + 1, celdas: partirFila(L[i]) }); i++; }
      const tb = { tipo: 'tabla', encabezado: [], filas: [], pie: '', id: '', linea, identificacion: false };
      if (filas.length > 1 && filas[1].celdas.every((c) => /^:?-{2,}:?$/.test(c) || c === '')) { tb.encabezado = filas[0].celdas; tb.filas = filas.slice(2); }
      else tb.filas = filas;
      tb.identificacion = tb.encabezado.length > 0 && tb.encabezado.every((c) => !c);
      if (tb.identificacion) tb.encabezado = [];
      const n = tb.encabezado.length || (tb.filas[0] && tb.filas[0].celdas.length) || 0;
      for (const f of tb.filas) if (f.celdas.length !== n && n) av(f.linea, `Fila con ${f.celdas.length} celdas; la tabla tiene ${n}`);
      if (L[i] && /^:\s+\S/.test(L[i])) {
        let pie = L[i].slice(1).trim();
        const mid = pie.match(/\{#([\w-]+)\}\s*$/);
        if (mid) { tb.id = mid[1]; pie = pie.replace(/\s*\{#[\w-]+\}\s*$/, ''); }
        tb.pie = pie; registrar(pie, i + 1, 'pie de tabla'); i++;
      }
      tb.encabezado.forEach((c) => registrar(c, linea, 'tabla'));
      tb.filas.forEach((f) => f.celdas.forEach((c) => registrar(c, f.linea, 'tabla')));
      doc.tablas.push(tb); doc.bloques.push(tb);
      continue;
    }

    if ((m = t.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/))) { // figura
      const dest = m[2];
      const d = dest.match(/^(captura-viva|captura):([\w-]+)(?:#(\w+))?(?:@(\w+))?$/);
      const b = { tipo: 'figura', alt: m[1], destino: dest, pie: m[3] || '', linea };
      if (d) Object.assign(b, { modo: d[1], circuitoId: d[2], analisis: d[3] || '', escenario: d[4] || 'nominal' });
      else b.imagen = dest;
      registrar(b.pie, linea, 'figura');
      doc.bloques.push(b); i++; continue;
    }

    if (/^(?:[-*]|\d+\.)\s+/.test(t)) { // lista
      const ordenada = /^\d+\./.test(t); const items = [];
      while (i < L.length && /^\s*(?:[-*]|\d+\.)\s+/.test(L[i])) {
        let txt = L[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''); const l0 = i + 1; i++;
        while (i < L.length && L[i].trim() && /^\s{2,}\S/.test(L[i]) && !/^\s*(?:[-*]|\d+\.)\s+/.test(L[i])) txt += ' ' + L[i++].trim();
        registrar(txt, l0, 'lista'); items.push({ texto: txt, linea: l0 });
      }
      doc.bloques.push({ tipo: 'lista', ordenada, items, linea }); continue;
    }

    // párrafo (puede contener $$ en varias líneas)
    const par = []; const ini = i;
    while (i < L.length && L[i].trim() && !(par.length && RE_INICIO.test(L[i]))) {
      par.push(L[i].trim()); i++;
      const joined = par.join('\n');
      if ((joined.replace(/\\\$/g, '').match(/\$\$/g) || []).length % 2 === 1) { // $$ abierto
        while (i < L.length && !L[i].includes('$$')) par.push(L[i++].trim());
        if (i < L.length) par.push(L[i++].trim());
      }
    }
    const txt = par.join('\n');
    registrar(txt, ini + 1, 'párrafo');
    doc.bloques.push({ tipo: 'parrafo', texto: txt, linea: ini + 1 });
  }

  // ---- nombres válidos ----
  const elementos = new Set(); const sondas = new Set();
  for (const c of doc.circuitos) { for (const e of c.elementos) { elementos.add(e.nombre); doc.nombres.add(e.nombre); } for (const s of c.sondas) { sondas.add(s.nombre); doc.nombres.add(s.nombre); } }
  doc.elementos = elementos; doc.sondas = sondas;
  const idsT = new Set(doc.tablas.map((x) => x.id).filter(Boolean));

  const existe = (nombre) => doc.nombres.has(nombre) || elementos.has(nombre);
  const valida = (n) => {
    const f = n.match(/^(\w+)\((\w+)\)$/);
    return f ? elementos.has(f[2]) || doc.nombres.has(f[2]) : existe(n);
  };
  const vistos = new Set();
  for (const r of refs) {
    const dedup = `${r.linea}|${r.crudo || r.valor}`;
    if (vistos.has(dedup)) continue; vistos.add(dedup);
    if (r.k === 'color') { if (parseValor(r.valor) === null) err(r.linea, `Código de colores: valor «${r.valor}» no válido`); continue; }
    if (r.unidad && !unidadValida(r.unidad)) err(r.linea, `Unidad desconocida «${r.unidad}» en {{${r.crudo}}}`);
    if (r.k === 'var') {
      if (!valida(r.clave)) err(r.linea, `Clave o sonda inexistente: ${r.clave}`);
      if (r.escenario && !doc.circuitos.some((c) => !c.escenarios.length ? r.escenario === 'nominal' : c.escenarios.some((e) => e.nombre === r.escenario))) err(r.linea, `Escenario «${r.escenario}» no definido en ningún circuito`);
    } else if (r.k === 'formula') {
      if (['err', 'desv'].includes(r.fn)) { const { base } = partirEsc(r.arg); if (!valida(base)) err(r.linea, `Clave o sonda inexistente: ${base}`); }
    }
  }
  // referencias de bloques
  const idsC = new Set(doc.circuitos.map((c) => c.id));
  const nombresCod = new Set(doc.codigos.map((c) => c.nombre).filter(Boolean));
  for (const b of doc.bloques) {
    if (b.tipo === 'figura' && b.circuitoId) {
      if (!idsC.has(b.circuitoId)) {
        if (b.circuitoId === 'circuito' && doc.circuitos.length) b.circuitoId = doc.circuitos[0].id;
        else err(b.linea, `Figura: no existe el circuito «${b.circuitoId}»`);
      }
    }
    if (b.tipo === 'desarrollo') {
      if (b.circuito && !idsC.has(b.circuito)) err(b.linea, `Desarrollo: no existe el circuito «${b.circuito}»`);
      const c = doc.circuitos.find((x) => x.id === b.circuito);
      for (const it of b.items) {
        if (it.tipo === 'sistema' && it.resuelve && !nombresCod.has(it.resuelve)) err(it.linea, `Sistema: la celda «${it.resuelve}» no existe`);
        if (it.tipo === 'ramas' && c) for (const r of it.ramas) if (r.sonda && !c.sondas.some((s) => s.nombre === r.sonda)) err(it.linea, `Rama ${r.corriente}: la sonda «${r.sonda}» no existe`);
      }
    }
  }
  for (const c of doc.circuitos) for (const e of c.escenarios) for (const s of e.sust) {
    const tid = s.ref.split('.')[0];
    if (tid && !idsT.has(tid)) err(c.elementos[0]?.linea || 1, `Escenario «${e.nombre}»: no existe la tabla «${tid}» (use el pie {#${tid}})`);
  }

  // ---- portada ----
  const p = doc.meta.portada;
  if (p !== undefined) {
    const mapa = typeof p === 'string' ? { plantilla: p } : p;
    const pl = mapa.plantilla || mapa.archivo;
    if (mapa.archivo) av(1, `Portada desde archivo «${mapa.archivo}»: impórtela con «Importar mi portada (.docx)»; mientras tanto se usa la clásica`);
    else if (pl && !PLANTILLAS_PORTADA.includes(pl)) err(1, `Plantilla de portada «${pl}» no existe (${PLANTILLAS_PORTADA.join(', ')})`);
    for (const k of ['numero', 'alumno', 'grupo', 'fecha']) if (mapa[k] === undefined || mapa[k] === '') av(1, `Campo de portada sin dato: ${k}`);
  }
  if (doc.meta.aulac === undefined) av(1, 'Falta «aulac: 1» en el front matter');

  // producidas y no usadas
  const usados = new Set(refs.filter((r) => r.k === 'var').map((r) => r.clave));
  const textoTotal = doc.bloques.map((b) => (b.texto || '') + (b.items ? JSON.stringify(b.items) : '')).join(' ');
  for (const c of doc.codigos) for (const pn of c.produce) if (!usados.has(pn) && !new RegExp(`\\b${pn}\\b`).test(textoTotal) && !doc.bloques.some((b) => b.tipo === 'desarrollo' && b.items.some((it) => it.resuelve === c.nombre))) av(c.linea, `Variable producida y no usada: ${pn}`);

  diagnosticos.sort((a, b) => a.linea - b.linea);
  return doc;
}

// ---------- verificación con variables (lista tipo «importar.html») ----------
/** Cuenta los valores medidos de la tabla para un escenario con sustituciones. */
export function estadoEscenario(doc, esc) {
  let total = 0, con = 0; const faltan = [];
  for (const s of esc.sust) {
    const [tid, col] = s.ref.split('.');
    const tb = doc.tablas.find((x) => x.id === tid);
    if (!tb) continue;
    const fila = tb.filas.find((f) => /medid/i.test(f.celdas[0] || ''));
    tb.encabezado.forEach((h, k) => {
      const nombre = h.trim();
      const pert = nombre === s.variable || nombre === col || (s.variable.length === 1 && new RegExp(`^${s.variable}\\d+$`).test(nombre) && (!col || col === s.variable));
      if (!pert || !fila) return;
      total++;
      const v = (fila.celdas[k] || '').trim();
      if (/^[−+-]?\d[\d.,]*(\s*\S+)?$/.test(v)) con++; else faltan.push(nombre);
    });
  }
  return { total, con, faltan };
}

export function verificar(doc, variables = {}, { ejecutadas = new Set(), extra = [], portadas = null } = {}) {
  const out = [...doc.diagnosticos.map((d) => ({ ...d })).filter((d) => !(portadas && /^Portada desde archivo/.test(d.mensaje) && portadas.items && portadas.items[doc.meta.portada && doc.meta.portada.archivo])), ...extra.map((d) => ({ linea: 1, ...d }))];
  const ok = (linea, mensaje) => out.push({ nivel: 'ok', linea, mensaje });
  for (const c of doc.circuitos) {
    const errs = doc.diagnosticos.filter((d) => d.nivel === 'error' && d.mensaje.includes(`«${c.id}»`));
    if (!errs.length && c.elementos.length) {
      const sinRes = c.sondas.filter((s) => !(variables[s.nombre] || variables[s.nombre + '@nominal']));
      ok(c.elementos[0].linea, `Circuito «${c.id}» válido · ${c.elementos.length} elementos · ${c.sondas.length} sondas${c.sondas.length ? (sinRes.length ? ` (${c.sondas.length - sinRes.length} con valor)` : ' resueltas') : ''}`);
    }
    for (const e of c.escenarios) if (e.sust.length) {
      const st = estadoEscenario(doc, e);
      if (st.total && st.con < st.total) out.push({ nivel: 'aviso', linea: c.elementos[0]?.linea || 1, mensaje: `Escenario «${e.nombre}»: esperando la Tabla · ${st.con} de ${st.total} valores${st.faltan.length ? ' (faltan ' + st.faltan.join(', ') + ')' : ''}` });
      else if (st.total) ok(c.elementos[0].linea, `Escenario «${e.nombre}» con los ${st.total} valores`);
    }
  }
  const dedup = new Set();
  let resueltos = 0, pendientes = 0;
  for (const r of doc.vivos) {
    const k = `${r.linea}|${r.crudo || r.valor}`;
    if (dedup.has(k)) continue; dedup.add(k);
    if (r.k === 'color') continue;
    const e = evaluar(r, variables);
    if (e.estado === 'ok') resueltos++;
    else if (e.estado === 'unidad') out.push({ nivel: 'aviso', linea: r.linea, mensaje: `Unidad distinta a la de la clave en {{${r.crudo}}}: ${e.razon}` });
    else { pendientes++; out.push({ nivel: 'aviso', linea: r.linea, mensaje: `Valor pendiente {{${r.crudo}}} (${e.razon})` }); }
  }
  const porMedir = [];
  for (const t of doc.tablas) for (const f of t.filas) for (const c of f.celdas) if (c.trim() === '?') porMedir.push(f.linea);
  if (porMedir.length) out.push({ nivel: 'aviso', linea: porMedir[0], mensaje: `${porMedir.length} ${porMedir.length === 1 ? 'valor «por medir» (?)' : 'valores «por medir» (?)'} en las tablas` });
  // LaTeX que el visor no soporta: se avisa en vez de caer a código en silencio
  const malos = new Map();
  const revisar = (latex, linea) => { const e = errorLatex(latex); if (e && !malos.has(e)) malos.set(e, { linea, ej: latex }); };
  const recorrer = (v, linea, clave) => {
    if (typeof v === 'string') {
      if (clave === 'ecuacion' && !v.includes('$')) { revisar(v, linea); return; }
      for (const sg of segmentos(v)) if (sg.t === 'mate') revisar(sg.v, linea);
    } else if (Array.isArray(v)) v.forEach((x) => recorrer(x, linea, clave));
    else if (v && typeof v === 'object' && !(v instanceof Set)) for (const [k, x] of Object.entries(v)) if (k !== 'codigo' && k !== 'circuito') recorrer(x, typeof v.linea === 'number' ? v.linea : linea, k);
  };
  for (const b of doc.bloques) recorrer(b, b.linea || 1, '');
  for (const [e, { linea, ej }] of malos) out.push({ nivel: 'aviso', linea, mensaje: `Ecuación no soportada (${e}): se muestra como código · ${ej.length > 40 ? ej.slice(0, 40) + '…' : ej}` });
  for (const c of doc.codigos) {
    if (c.produce.length && !ejecutadas.has(c.nombre)) ok(c.linea, `Celda ${c.nombre || c.lenguaje} produce ${c.produce.join(', ')}${Object.keys(variables).length ? '' : ''}`);
    if (c.ejecuta && ejecutadas.has(c.nombre)) continue;
    if (c.ejecuta && !c.produce.length) out.push({ nivel: 'aviso', linea: c.linea, mensaje: `Celda ${c.nombre || c.lenguaje} sin «produce»: nada que enlazar` });
    if (c.ejecuta) out.push({ nivel: 'aviso', linea: c.linea, mensaje: `Celda ${c.nombre || c.lenguaje} sin ejecutar (prototipo: se usan variables de ejemplo)` });
  }
  if (resueltos) ok(1, `${resueltos} valores vivos resueltos${pendientes ? `, ${pendientes} pendientes` : ''}`);
  const peso = { error: 0, aviso: 1, ok: 2 };
  return out.sort((a, b) => peso[a.nivel] - peso[b.nivel] || a.linea - b.linea);
}

export { nombreVivo };
