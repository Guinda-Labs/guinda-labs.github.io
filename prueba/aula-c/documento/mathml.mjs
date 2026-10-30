// LaTeX (subconjunto) → MathML. Sin dependencias. Si algo no se entiende, devuelve <code> con el texto.
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const GRIEGAS = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', omega: 'ω', Delta: 'Δ', Omega: 'Ω', Sigma: 'Σ', Phi: 'Φ', Pi: 'Π' };
const OPERADORES = { cdot: '·', times: '×', pm: '±', Rightarrow: '⇒', rightarrow: '→', to: '→', Leftrightarrow: '⇔', approx: '≈', leq: '≤', geq: '≥', le: '≤', ge: '≥', neq: '≠', infty: '∞', partial: '∂', sum: '∑', prod: '∏', ldots: '…', parallel: '∥', dots: '…', circ: '∘', angle: '∠', deg: '°' };
const ESPACIOS = { ',': '0.17em', ':': '0.22em', ';': '0.28em', ' ': '0.28em', quad: '1em', qquad: '2em', '!': '-0.17em' };

/** Convierte y devuelve {mathml, error}: error es el motivo si el LaTeX no se soporta (null si todo bien). */
export function convertirLatex(latex, display = false) {
  const s = String(latex);
  let i = 0;
  const peek = () => s[i];
  const grupo = () => {
    while (s[i] === ' ') i++;
    if (s[i] === '{') { i++; const r = fila('}'); if (s[i++] !== '}') throw Error('llave'); return /^<(mn|mi|mo)[^>]*>[^<]*<\/(?:mn|mi|mo)>$/.test(r) ? r : `<mrow>${r}</mrow>`; }
    return atomo();
  };
  const cmdNombre = () => { const m = s.slice(i).match(/^[A-Za-z]+/); if (m) { i += m[0].length; return m[0]; } return s[i++]; };
  const atomo = () => {
    while (s[i] === ' ') i++;
    const c = s[i++];
    if (c === undefined) throw Error('fin');
    if (c === '\\') {
      const n = cmdNombre();
      if (n === 'frac' || n === 'dfrac') return `<mfrac>${grupo()}${grupo()}</mfrac>`;
      if (n === 'sqrt') return `<msqrt>${grupo()}</msqrt>`;
      if (n === 'mathrm' || n === 'operatorname' || n === 'mathbf' || n === 'mathit') {
        const g = grupo().replace(/<[^>]+>/g, '');
        return `<mi mathvariant="${n === 'mathbf' ? 'bold' : n === 'mathit' ? 'italic' : 'normal'}">${g}</mi>`;
      }
      if (n === 'text') return `<mtext>${grupo().replace(/<[^>]+>/g, '')}</mtext>`;
      if (n === 'left' || n === 'right') { const d = s[i++]; return d === '.' ? '' : `<mo fence="true">${esc(d)}</mo>`; }
      if (n === 'begin' || n === 'end') throw Error('entorno');
      if (GRIEGAS[n]) return `<mi>${GRIEGAS[n]}</mi>`;
      if (OPERADORES[n]) return `<mo>${OPERADORES[n]}</mo>`;
      if (ESPACIOS[n] !== undefined) return `<mspace width="${ESPACIOS[n]}"/>`;
      if ('{}%&#_$'.includes(n)) return `<mo>${esc(n)}</mo>`;
      throw Error('comando ' + n);
    }
    if (c === '{') { i--; return grupo(); }
    if (/[0-9]/.test(c)) { let t = c; while (/[0-9.]/.test(s[i] || '') && !(s[i] === '.' && !/[0-9]/.test(s[i + 1] || ''))) t += s[i++]; return `<mn>${t}</mn>`; }
    if (/\p{L}/u.test(c)) return `<mi>${esc(c)}</mi>`;
    if (c === '-') return '<mo>−</mo>';
    if (c === '&' || c === '\\') return '';
    return `<mo>${esc(c)}</mo>`;
  };
  const fila = (fin) => {
    let r = '';
    while (i < s.length && peek() !== fin) {
      if (/\s/.test(peek())) { i++; continue; }
      let a = atomo(), sub = null, sup = null;
      while (s[i] === '_' || s[i] === '^') { const op = s[i++]; const g = grupo(); if (op === '_') sub = g; else sup = g; }
      a = sub && sup ? `<msubsup>${a}${sub}${sup}</msubsup>` : sub ? `<msub>${a}${sub}</msub>` : sup ? `<msup>${a}${sup}</msup>` : a;
      r += a;
    }
    return r;
  };
  try {
    const cuerpo = fila(undefined);
    return { mathml: `<math xmlns="http://www.w3.org/1998/Math/MathML" display="${display ? 'block' : 'inline'}" aria-label="${esc(s.trim())}"><mrow>${cuerpo}</mrow></math>`, error: null };
  } catch (e) {
    return { mathml: `<code class="mate-error">${esc(s)}</code>`, error: e.message };
  }
}
export const latexAMathML = (latex, display = false) => convertirLatex(latex, display).mathml;
/** null si el LaTeX se entiende; si no, el motivo («comando foo», «entorno»…). */
export const errorLatex = (latex) => convertirLatex(latex).error;

/** Matriz/columna de MathML a partir de filas de fragmentos MathML ya construidos. */
export const matrizMathML = (filas) =>
  `<mrow><mo>[</mo><mtable>${filas.map((f) => `<mtr>${f.map((c) => `<mtd>${c}</mtd>`).join('')}</mtr>`).join('')}</mtable><mo>]</mo></mrow>`;
