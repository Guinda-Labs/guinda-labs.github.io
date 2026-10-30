// Evaluador mínimo de un subconjunto de Octave (sin Octave real): escalares, matrices, + - * / \ ^ ', indexado,
// printf/fprintf/disp y unas pocas funciones. Sirve para los cálculos lineales de las prácticas (M\b).
// ejecutarOctave(codigo) → {espacio:{nombre:valor}, salida:texto}. Lanza Error con «línea N».

const M = (filas) => ({ m: filas });
const esM = (v) => v && typeof v === 'object' && Array.isArray(v.m);
const aM = (v) => (esM(v) ? v.m : [[v]]);
const dims = (v) => { const a = aM(v); return [a.length, a[0] ? a[0].length : 0]; };
const simplificar = (a) => (a.length === 1 && a[0].length === 1 ? a[0][0] : M(a));
const plano = (v) => { const a = aM(v), out = []; for (let j = 0; j < (a[0] || []).length; j++) for (let i = 0; i < a.length; i++) out.push(a[i][j]); return out; };

function elementwise(a, b, f, nombre) {
  const A = aM(a), B = aM(b);
  const [ra, ca] = dims(a), [rb, cb] = dims(b);
  if (ra === 1 && ca === 1) return simplificar(B.map((f_) => f_.map((x) => f(A[0][0], x))));
  if (rb === 1 && cb === 1) return simplificar(A.map((f_) => f_.map((x) => f(x, B[0][0]))));
  if (ra !== rb || ca !== cb) throw Error(`operador ${nombre}: dimensiones no coinciden (${ra}x${ca} y ${rb}x${cb})`);
  return simplificar(A.map((fila, i) => fila.map((x, j) => f(x, B[i][j]))));
}
function producto(a, b) {
  const [ra, ca] = dims(a), [rb, cb] = dims(b);
  if ((ra === 1 && ca === 1) || (rb === 1 && cb === 1)) return elementwise(a, b, (x, y) => x * y, '*');
  if (ca !== rb) throw Error(`operador *: dimensiones no coinciden (${ra}x${ca} y ${rb}x${cb})`);
  const A = aM(a), B = aM(b);
  return simplificar(Array.from({ length: ra }, (_, i) => Array.from({ length: cb }, (_, j) => A[i].reduce((s, x, k) => s + x * B[k][j], 0))));
}
/** Resuelve A·x = b por eliminación gaussiana con pivoteo parcial. */
export function resolver(Am, bm) {
  const A = aM(Am).map((f) => [...f]), B = aM(bm).map((f) => [...f]);
  const n = A.length;
  if (!n || A[0].length !== n) throw Error('A\\b: A debe ser cuadrada');
  if (B.length !== n) throw Error('A\\b: dimensiones no coinciden');
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-12) throw Error('A\\b: matriz singular');
    [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      for (let k = 0; k < B[r].length; k++) B[r][k] -= f * B[c][k];
    }
  }
  const X = Array.from({ length: n }, () => Array(B[0].length).fill(0));
  for (let k = 0; k < B[0].length; k++) for (let i = n - 1; i >= 0; i--) {
    let s = B[i][k];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * X[j][k];
    X[i][k] = s / A[i][i];
  }
  return simplificar(X);
}
const transponer = (v) => { const a = aM(v); return simplificar(a[0].map((_, j) => a.map((f) => f[j]))); };

// ---------- formato printf ----------
function formatear(fmt, args) {
  const esc = (s) => s.replace(/\\(n|t|\\|"|'|%)/g, (m, c) => ({ n: '\n', t: '\t', '\\': '\\', '"': '"', "'": "'", '%': '%%' }[c]));
  const f = esc(fmt);
  const specs = [...f.matchAll(/%(?!%)[-+ 0#]*\d*(?:\.\d+)?[dfgeisu]/g)];
  const datos = args.flatMap((a) => (typeof a === 'string' ? [a] : plano(a)));
  const una = (idx) => {
    let k = idx;
    const out = f.replace(/%%|%([-+ 0#]*)(\d*)(?:\.(\d+))?([dfgeisu])/g, (m, flag, ancho, prec, tipo) => {
      if (m === '%%') return '%';
      const v = datos[k++];
      let t;
      if (v === undefined) return '';
      if (tipo === 's') t = String(v);
      else if (tipo === 'd' || tipo === 'i' || tipo === 'u') t = Number.isInteger(v) ? String(v) : String(+v.toPrecision(prec ? +prec : 6));
      else if (tipo === 'f') t = Number(v).toFixed(prec === undefined ? 6 : +prec);
      else if (tipo === 'e') t = Number(v).toExponential(prec === undefined ? 6 : +prec);
      else t = String(+Number(v).toPrecision(prec === undefined ? 6 : Math.max(1, +prec)));
      t = t.replace('-', '-');
      if (ancho) t = flag.includes('-') ? t.padEnd(+ancho) : t.padStart(+ancho);
      return t;
    });
    return [out, k];
  };
  if (!specs.length) return una(0)[0];
  let k = 0, texto = '';
  do { const [s, nk] = una(k); texto += s; k = nk; } while (k < datos.length);
  return texto;
}

// ---------- léxico ----------
function tokenizar(src, linea) {
  const t = [];
  let i = 0;
  const previoOperando = () => { const u = t[t.length - 1]; return u && (u.k === 'num' || u.k === 'id' || u.k === 'cad' || (u.k === 'op' && [')', ']', "'"].includes(u.v))); };
  while (i < src.length) {
    const c = src[i];
    const sp = i > 0 && /\s/.test(src[i - 1]);
    if (/\s/.test(c)) { i++; continue; }
    let m;
    if ((m = src.slice(i).match(/^(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)/))) { t.push({ k: 'num', v: Number(m[1]), sp }); i += m[1].length; continue; }
    if ((m = src.slice(i).match(/^[A-Za-z_]\w*/))) { t.push({ k: 'id', v: m[0], sp }); i += m[0].length; continue; }
    if (c === '"' || (c === "'" && !previoOperando())) {
      let j = i + 1; let s = '';
      while (j < src.length && src[j] !== c) { if (src[j] === '\\' && c === '"') { s += src[j] + src[j + 1]; j += 2; } else s += src[j++]; }
      if (j >= src.length) throw Error(`línea ${linea}: cadena sin cerrar`);
      t.push({ k: 'cad', v: s, sp }); i = j + 1; continue;
    }
    if ((m = src.slice(i).match(/^(\.\*|\.\/|\.\^|==|~=|!=|<=|>=)/))) { t.push({ k: 'op', v: m[1], sp }); i += m[1].length; continue; }
    if ('+-*/\\^()[],;=\':<>'.includes(c)) { t.push({ k: 'op', v: c, sp }); i++; continue; }
    throw Error(`línea ${linea}: carácter no admitido «${c}»`);
  }
  t.forEach((x, n) => { const s = t[n + 1]; x.spDespues = s ? s.sp : false; });
  return t;
}

// ---------- sintaxis y evaluación ----------
function evaluarExpr(tokens, ctx, linea) {
  let p = 0, enMatriz = 0;
  const pk = () => tokens[p];
  const es = (v) => pk() && pk().k === 'op' && pk().v === v;
  const falla = (m) => { throw Error(`línea ${linea}: ${m}`); };
  const sumaRes = () => {
    let a = mulDiv();
    while (pk() && pk().k === 'op' && (pk().v === '+' || pk().v === '-')) {
      if (enMatriz && pk().sp && !pk().spDespues) break; // «a -b» dentro de [] son dos elementos
      const op = tokens[p++].v, b = mulDiv();
      a = elementwise(a, b, op === '+' ? (x, y) => x + y : (x, y) => x - y, op);
    }
    return a;
  };
  const mulDiv = () => {
    let a = unario();
    while (pk() && pk().k === 'op' && ['*', '/', '\\', '.*', './'].includes(pk().v)) {
      const op = tokens[p++].v, b = unario();
      if (op === '*') a = producto(a, b);
      else if (op === '.*') a = elementwise(a, b, (x, y) => x * y, op);
      else if (op === './') a = elementwise(a, b, (x, y) => x / y, op);
      else if (op === '/') { if (dims(b).join() === '1,1') a = elementwise(a, b, (x, y) => x / y, op); else a = transponer(resolver(transponer(b), transponer(a))); }
      else a = resolver(a, b);
    }
    return a;
  };
  const unario = () => {
    if (es('-')) { p++; const v = unario(); return elementwise(v, -1, (x, y) => x * y, '-'); }
    if (es('+')) { p++; return unario(); }
    return potencia();
  };
  const potencia = () => {
    let a = postfijo();
    while (pk() && pk().k === 'op' && (pk().v === '^' || pk().v === '.^')) {
      p++; const b = unario();
      if (dims(a).join() !== '1,1' || dims(b).join() !== '1,1') falla('solo se admite potencia de escalares');
      a = aM(a)[0][0] ** aM(b)[0][0];
    }
    return a;
  };
  const postfijo = () => {
    let a = primario();
    while (es("'")) { p++; a = transponer(a); }
    return a;
  };
  const argumentos = () => {
    const out = [];
    const guardado = enMatriz; enMatriz = 0;
    if (es(')')) { p++; enMatriz = guardado; return out; }
    for (;;) {
      out.push(sumaRes());
      if (es(',')) { p++; continue; }
      if (es(')')) { p++; break; }
      falla('se esperaba , o )');
    }
    enMatriz = guardado;
    return out;
  };
  const primario = () => {
    const t = tokens[p++];
    if (!t) falla('expresión incompleta');
    if (t.k === 'num') return t.v;
    if (t.k === 'cad') return t.v;
    if (t.k === 'op' && t.v === '(') {
      const g = enMatriz; enMatriz = 0;
      const v = sumaRes();
      if (!es(')')) falla('falta )');
      p++; enMatriz = g; return v;
    }
    if (t.k === 'op' && t.v === '[') return matriz();
    if (t.k === 'id') {
      if (es('(') && !(ctx.vars[t.v] === undefined && !ctx.funciones[t.v])) {
        p++; const args = argumentos();
        if (ctx.vars[t.v] !== undefined) return indexar(ctx.vars[t.v], args, falla);
        return ctx.funciones[t.v](args);
      }
      if (ctx.vars[t.v] !== undefined) return ctx.vars[t.v];
      if (ctx.funciones[t.v]) { if (es('(')) { p++; return ctx.funciones[t.v](argumentos()); } return ctx.funciones[t.v]([]); }
      if (t.v === 'pi') return Math.PI;
      falla(`variable no definida «${t.v}»`);
    }
    falla(`símbolo inesperado «${t.v}»`);
  };
  const matriz = () => {
    enMatriz++;
    const filas = [[]];
    for (;;) {
      if (!pk()) falla('falta ]');
      if (es(']')) { p++; break; }
      if (es(';')) { p++; filas.push([]); continue; }
      if (es(',')) { p++; continue; }
      const v = sumaRes();
      for (const fila of aM(v)) { /* bloques dentro de matrices: se concatenan por filas */ }
      filas[filas.length - 1].push(v);
    }
    enMatriz--;
    const reales = filas.filter((f) => f.length);
    if (!reales.length) return M([[]]);
    const construidas = reales.map((f) => {
      const alto = Math.max(...f.map((v) => dims(v)[0]));
      return Array.from({ length: alto }, (_, i) => f.flatMap((v) => (dims(v)[0] === 1 && alto > 1 ? aM(v)[0] : aM(v)[i] || [])));
    }).flat();
    const ancho = construidas[0].length;
    if (construidas.some((f) => f.length !== ancho)) falla('filas de distinta longitud en la matriz');
    return simplificar(construidas);
  };
  const r = sumaRes();
  if (p < tokens.length) falla(`sobra «${tokens[p].v}»`);
  return r;
}

function indexar(v, args, falla) {
  const a = aM(v);
  const idx = (x) => { const n = aM(x)[0][0]; if (!Number.isInteger(n) || n < 1) falla(`índice no válido ${n}`); return n; };
  if (args.length === 1) {
    const f = plano(v), n = idx(args[0]);
    if (n > f.length) falla(`índice ${n} fuera de rango (${f.length})`);
    return f[n - 1];
  }
  if (args.length === 2) {
    const i = idx(args[0]), j = idx(args[1]);
    if (i > a.length || j > a[0].length) falla(`índice (${i},${j}) fuera de rango`);
    return a[i - 1][j - 1];
  }
  return falla('indexado no admitido');
}

function dividirSentencias(codigo) {
  const out = [];
  let cur = '', prof = 0, ini = 1, linea = 1, comilla = '';
  const cierra = () => { if (cur.trim()) out.push({ texto: cur.trim(), linea: ini, silencio: false }); cur = ''; };
  for (let i = 0; i < codigo.length; i++) {
    const c = codigo[i];
    if (comilla) { cur += c; if (c === comilla && codigo[i - 1] !== '\\') comilla = ''; if (c === '\n') linea++; continue; }
    if (c === '"') { comilla = c; cur += c; continue; }
    if (c === "'" && !/[\w)\]']\s*$/.test(cur)) { comilla = c; cur += c; continue; }
    if (c === '%' || c === '#') { while (i < codigo.length && codigo[i] !== '\n') i++; i--; continue; }
    if ('([{'.includes(c)) prof++;
    if (')]}'.includes(c)) prof--;
    if (c === '\n') {
      linea++;
      if (prof > 0) { cur += ';'; continue; }
      cierra(); ini = linea; continue;
    }
    if (c === ';' && prof === 0) { cierra(); ini = linea; continue; }
    if (!cur.trim()) ini = linea;
    cur += c;
  }
  cierra();
  return out;
}

export function ejecutarOctave(codigo) {
  const vars = {};
  let salida = '';
  const funciones = {
    printf: (a) => { salida += formatear(String(a[0]), a.slice(1)); return 0; },
    fprintf: (a) => { const b = typeof a[0] === 'number' ? a.slice(1) : a; salida += formatear(String(b[0]), b.slice(1)); return 0; },
    disp: (a) => { salida += (typeof a[0] === 'string' ? a[0] : aM(a[0]).map((f) => f.map((x) => +x.toPrecision(6)).join('  ')).join('\n')) + '\n'; return 0; },
    sqrt: (a) => elementwise(a[0], 0, (x) => Math.sqrt(x), 'sqrt'),
    abs: (a) => elementwise(a[0], 0, (x) => Math.abs(x), 'abs'),
    zeros: (a) => M(Array.from({ length: aM(a[0])[0][0] }, () => Array(aM(a[1] ?? a[0])[0][0]).fill(0))),
    ones: (a) => M(Array.from({ length: aM(a[0])[0][0] }, () => Array(aM(a[1] ?? a[0])[0][0]).fill(1))),
    eye: (a) => { const n = aM(a[0])[0][0]; return M(Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))); },
    inv: (a) => { const n = dims(a[0])[0]; return resolver(a[0], funciones.eye([n])); },
    numel: (a) => plano(a[0]).length,
    length: (a) => Math.max(...dims(a[0])),
  };
  const ctx = { vars, funciones };
  for (const s of dividirSentencias(String(codigo))) {
    try {
      const m = s.texto.match(/^([A-Za-z_]\w*)\s*=(?!=)\s*([\s\S]*)$/);
      if (m) vars[m[1]] = evaluarExpr(tokenizar(m[2], s.linea), ctx, s.linea);
      else evaluarExpr(tokenizar(s.texto, s.linea), ctx, s.linea);
    } catch (e) {
      throw Error(/^línea \d+/.test(e.message) ? e.message : `línea ${s.linea}: ${e.message}`);
    }
  }
  return { espacio: vars, salida };
}

/** Extrae {nombre:{valor,unidad}} de las variables escalares y de líneas «NOMBRE = valor unidad» de la salida. */
export function producidas(nombres, resultado) {
  const out = {};
  for (const n of nombres) {
    const linea = resultado.salida.match(new RegExp(`^\\s*${n}\\s*=\\s*([-+]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*([^\\s\\d][^\\s]*)?`, 'm'));
    const v = resultado.espacio[n];
    if (linea) out[n] = { valor: Number(linea[1]), unidad: linea[2] || '' };
    else if (typeof v === 'number') out[n] = { valor: v, unidad: '' };
  }
  return out;
}
