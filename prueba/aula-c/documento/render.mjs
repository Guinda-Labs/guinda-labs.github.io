// Árbol de bloques (formato.mjs) → HTML con el aspecto del reporte de práctica (hojas carta).
import { segmentos } from './formato.mjs';
import { evaluar, formatear, bandasColor, parseValor } from './valores.mjs';
import { latexAMathML } from './mathml.mjs';
import { portadaImportada, llenarPortada, camposDePortada } from './portada-docx.mjs';
import { tablasDeEscenarios, filaMedida, numeroDeCelda } from './simulacion.mjs';

const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const neg = (t) => t.replace(/(^|[\s(])-(?=\d)/g, '$1−');

/** Estilos del documento. Todo cuelga de .documento para no chocar con la página anfitriona. */
export const ESTILOS = `
.documento{--ink:#1c2430;--ink2:#33415c;--blue:#1f4e79;--blue-d:#173a5c;--line:#8ea9c8;--th:#dce7f4;--grid:#a6b6ca;--gray:#5b6573;--pend:#6f7782;--req:#eef3fa;color:var(--ink);font-family:Carlito,Calibri,"Segoe UI",Arial,sans-serif;font-size:10.5pt;line-height:1.45;padding:28px 12px 60px}
.documento *{box-sizing:border-box}
.documento .page{position:relative;width:8.5in;min-height:11in;margin:0 auto 28px;padding:.85in 1in 1in;background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(20,30,50,.18),0 6px 22px rgba(20,30,50,.10)}
.documento .pg-foot{position:absolute;left:0;right:0;bottom:.42in;text-align:center;font-size:8.5pt;color:#6a7280}
.documento h1.t{font-size:17pt;line-height:1.2;text-align:center;margin:0 0 4px;color:var(--ink);font-weight:700}
.documento .sub{text-align:center;color:var(--gray);margin:0 0 16px;font-size:11pt}
.documento h2{font-size:13.5pt;color:var(--blue);margin:20px 0 8px;padding-bottom:3px;border-bottom:1px solid var(--line);font-weight:700;line-height:1.25}
.documento h3,.documento h4{font-size:11.5pt;color:var(--blue-d);margin:16px 0 5px;font-weight:700}
.documento p{margin:0 0 8px}
.documento .page>:first-child{margin-top:0}
.documento ol.lit,.documento ul.lit{margin:0 0 8px;padding-left:24px}
.documento ol.lit li{margin-bottom:8px;padding-left:2px}.documento ul.lit li{margin-bottom:3px}
.documento .ident{width:100%;border-collapse:collapse;margin:4px 0 10px}
.documento .ident th,.documento .ident td{border:1px solid var(--grid);padding:5px 9px;text-align:left;font-weight:400}
.documento .ident th{background:var(--th);width:26%;font-weight:600}
.documento .ident td{min-height:26px}
.documento .req{background:var(--req);border:1px solid var(--grid);padding:9px 14px;margin:14px 0 6px;border-radius:var(--aulac-radio-superficie)}
.documento .req b:first-child{color:var(--blue-d)}
.documento table.grid{width:100%;border-collapse:collapse;margin:6px 0 2px;font-size:10pt;break-inside:avoid;page-break-inside:avoid;table-layout:auto}
.documento table.grid th,.documento table.grid td{border:1px solid var(--grid);padding:5px 7px;text-align:center;vertical-align:middle}
.documento table.grid thead th{background:var(--th);color:var(--blue-d);font-weight:700}
.documento table.grid th.l{text-align:left;font-weight:600;background:#f6f9fc;width:24%;min-width:5.2em}
.documento table.grid thead th.l{background:var(--th)}
.documento table.grid tr{break-inside:avoid;page-break-inside:avoid}
.documento table.grid tr.tot th,.documento table.grid tr.tot td{border-top:2px solid var(--grid);font-weight:600}
.documento table.grid td.eq,.documento table.grid td:has(math){white-space:nowrap}
.documento table.eqt th.l{width:1%;white-space:nowrap}
.documento table.eqt td.eq{text-align:left;font-size:.97em;width:auto}
.documento math,.documento .el,.documento .eqc{white-space:nowrap}
.documento math{font-family:"Cambria Math","STIX Two Math","Latin Modern Math","Noto Sans Math",serif;font-size:1.05em}
.documento .cap{font-style:italic;color:var(--gray);font-size:9pt;margin:3px 0 12px}
.documento .sws{display:flex;justify-content:center;gap:2px;margin-bottom:3px}
.documento .sws i{width:10px;height:10px;border-radius:var(--aulac-radio-control);border:1px solid rgba(0,0,0,.35);display:block}
.documento .cn{font-size:8.5pt;line-height:1.2;display:inline-block}
.documento .tol{font-size:8.5pt;color:var(--gray)}
.documento .pend{color:var(--pend);font-style:italic;font-size:9pt}
.documento .pendv{color:var(--pend);background:#eceef1;border-radius:var(--aulac-radio-control);padding:0 6px;font-style:italic;font-size:9pt}
.documento .med{color:var(--ink)}
.documento .v{position:relative;cursor:default;border-bottom:1px dotted transparent}
.documento .v:hover,.documento .v:focus-visible{border-bottom-color:#7f93b0}
.documento .v::after{content:attr(data-src);position:absolute;left:50%;bottom:calc(100% + 5px);transform:translateX(-50%);white-space:nowrap;font:11px/1.3 "Segoe UI",Arial,sans-serif;font-style:normal;font-weight:400;color:#fff;background:#2b3445;padding:3px 8px;border-radius:var(--aulac-radio-control);opacity:0;pointer-events:none;transition:opacity .12s;z-index:12;text-align:left}
.documento .v:hover::after,.documento .v:focus-visible::after{opacity:1}
.documento [contenteditable]{border-radius:var(--aulac-radio-control)}
.documento [contenteditable]:hover{background:#f6f8fb}
.documento [contenteditable]:focus{background:#f1f5fb;outline:1px solid #c5d3e6}
.documento [contenteditable]:empty::before{content:attr(data-ph);color:#8a93a1}
.documento details.calc{margin:10px 0;border:1px solid #d7dde6;border-radius:var(--aulac-radio-control);background:#fafbfc}
.documento details.calc summary{cursor:pointer;list-style:none;padding:6px 12px;color:var(--gray);font:12.5px "Segoe UI",Arial,sans-serif;display:flex;align-items:center;gap:8px}
.documento details.calc summary::-webkit-details-marker{display:none}
.documento .car{display:inline-block;transition:transform .15s;font-size:11px}
.documento details[open]>summary .car{transform:rotate(90deg)}
.documento .cs{margin-left:auto;font-size:11px;color:#6a7280;background:#edf0f4;border-radius:var(--aulac-radio-control);padding:1px 9px}
.documento .cb{padding:2px 14px 12px;border-top:1px solid #e3e7ed}
.documento pre{margin:8px 0 0;font:12px/1.55 Consolas,"Cascadia Mono","Courier New",monospace;white-space:pre-wrap;overflow-wrap:anywhere}
.documento pre .c{color:#6b7a6b}
.documento .out-l{font:11px "Segoe UI",Arial,sans-serif;color:var(--gray);margin-top:10px;text-transform:uppercase;letter-spacing:.04em}
.documento figure.fig{position:relative;margin:8px 0 4px;padding:0}
.documento figure.fig svg,.documento .dev-fig svg{display:block;width:100%;height:auto}
.documento .fig-head{display:flex;justify-content:space-between;align-items:center;gap:6px 10px;flex-wrap:wrap;min-height:28px;margin-bottom:2px}
.documento .seg{display:inline-flex;border:1px solid #d3dbe7;border-radius:var(--aulac-radio-control);overflow:hidden;background:#fff}
.documento .seg button{border:0;border-radius:var(--aulac-radio-control);background:#fff;color:#4b5666;padding:2px 10px;font:11.5px "Segoe UI",Arial,sans-serif;white-space:nowrap;cursor:pointer}
.documento .seg button[aria-pressed=true]{background:#eef3fa;color:#173a5c;font-weight:600}
.documento .ed{display:inline-block;min-width:4ch;border-bottom:1px dashed #b4bdca}
.documento .simbar{display:inline-flex;gap:8px;align-items:center;font:11.5px "Segoe UI",Arial,sans-serif;color:var(--gray)}
.documento .sim-btn{border:1px solid #c9b4c0;background:#fff;color:#7a1f45;border-radius:var(--aulac-radio-control);padding:2px 11px;font:inherit;cursor:pointer}
.documento .sim-btn:hover{background:#f7edf1}
.documento .snap{border:1px solid #d3dbe7;background:#fff;border-radius:var(--aulac-radio-control);padding:2px 10px;font:11.5px "Segoe UI",Arial,sans-serif;color:var(--gray);white-space:nowrap}
.documento .cover{display:flex;flex-direction:column;min-height:11in;font-family:"Courier New",Courier,monospace;text-align:center}
.documento .logos{display:flex;justify-content:flex-end;gap:12px;margin-top:-.25in}
.documento .logo{width:74px;height:74px;border:1px dashed #b4bdca;border-radius:var(--aulac-radio-control);color:#8a93a1;font:8pt "Segoe UI",Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.2}
.documento .cv-title{font:700 48pt/1.1 "Courier New",Courier,monospace;margin:1.7in 0 .25in;color:#000}
.documento .cv-sub{font:16pt/1.35 "Courier New",Courier,monospace;text-decoration:underline;text-underline-offset:5px;margin:0 auto;max-width:5.6in;color:#000}
.documento .cv-mid{margin-top:1.2in;font-size:14pt;line-height:1.8;color:#000}
.documento .cv-low{margin-top:.8in;font-size:13pt;line-height:1.7;color:#000}
.documento .cv-date{margin-top:auto;font-size:13pt;padding-bottom:.1in;color:#000}
.documento .qa{margin:0 0 14px}
.documento .ans{border:1px solid var(--grid);padding:6px 12px;min-height:56px;color:var(--ink);background:#fcfdfe;border-radius:var(--aulac-radio-superficie)}
.documento .concl{border:1px solid var(--grid);border-radius:var(--aulac-radio-control);min-height:3in;padding:10px 14px;margin-top:8px}
.documento .dev-box{position:relative;border:1.5px solid var(--ink2);border-radius:var(--aulac-radio-control);margin:16px 0 12px}
.documento .dev-box .num{position:absolute;top:-13px;left:12px;background:#fff;padding:0 6px;font-size:17pt;color:var(--blue-d);line-height:1}
.documento .dev-grid{display:grid;grid-template-columns:48% 1fr}
.documento .dev-fig{padding:14px 8px 10px 10px;border-right:1px solid var(--grid);margin:0}
.documento .dev-fig figcaption{font-size:8.5pt;color:var(--gray);font-style:italic;margin-top:4px;text-align:center}
.documento .dev-steps{min-width:0}
.documento .srow{display:grid;grid-template-columns:.95in 1fr;border-top:1px solid var(--grid)}
.documento .dev-steps .srow:first-child{border-top:0}
.documento .sl{padding:8px 9px;font-size:9pt;font-weight:700;color:var(--blue-d);border-right:1px solid var(--grid);background:#f6f9fc;line-height:1.3}
.documento .sl small{display:block;font-weight:400;color:var(--gray);font-size:8pt;margin-top:2px}
.documento .sc{padding:6px 10px;min-width:0;overflow-x:auto}
.documento .eqc{padding:8px 14px}
.documento .cols2,.documento .cols3,.documento .cols6{display:grid;padding:0!important}
.documento .cols2{grid-template-columns:repeat(2,1fr)}.documento .cols3{grid-template-columns:repeat(3,1fr)}.documento .cols6{grid-template-columns:repeat(6,1fr)}
.documento .c3,.documento .c4,.documento .c6{padding:7px 9px;border-left:1px solid var(--grid);min-width:0;font-size:9.5pt}
.documento .c3:first-child,.documento .c4:nth-child(odd),.documento .c6:first-child{border-left:0}
.documento .c4:nth-child(n+3){border-top:1px solid var(--grid)}
.documento .c4 b,.documento .c6 b{display:block}
.documento .c4 span,.documento .c6 span.d{display:block;font-size:8.5pt;color:var(--gray);line-height:1.3}
.documento .c3 h5{margin:0 0 4px;font-size:9.5pt;color:var(--blue-d)}
.documento .note{font-size:8.5pt;color:var(--gray)}
.documento .sys .c{text-align:center}
.documento .mate-error{color:#a33}
.documento .cont-h{font-size:9pt;color:var(--gray);padding:5px 12px;border-bottom:1px solid var(--grid);background:#f6f9fc}
.documento .sol{font-size:9.5pt;color:var(--gray);margin:2px 0 6px}
.documento .cover.imp{display:block;font-family:"Segoe UI",Arial,sans-serif;font-size:12pt;line-height:1.3;color:#000;text-align:left}
.documento .cover.imp p{margin:0}.documento .cover.imp [data-campo]:empty::before{content:attr(data-ph);color:#98a1af}
@media (max-width:8.9in){.documento .page{width:100%;max-width:8.5in;padding:.7in 7vw .9in}}
@media (max-width:720px){
  .documento{padding:12px 6px 40px}
  .documento .page{min-height:0;padding:24px 16px 56px;margin-bottom:14px;overflow-wrap:anywhere}
  .documento .cover{min-height:0}.documento .cv-title{font-size:26pt;margin-top:1in}.documento .cv-sub{font-size:12pt}
  .documento table.grid{display:block;overflow-x:auto}
  .documento .dev-grid{grid-template-columns:1fr}.documento .dev-fig{border-right:0;border-bottom:1px solid var(--grid)}
  .documento .srow{grid-template-columns:1fr}.documento .sl{border-right:0;border-bottom:1px solid var(--grid)}
  .documento .cols3,.documento .cols6{grid-template-columns:1fr}
}
@page{size:letter;margin:0}
@media print{
  .documento{padding:0;background:#fff}
  .documento .page{width:8.5in;min-height:11in;height:auto;margin:0;box-shadow:none;break-after:page;page-break-after:always}
  .documento .page:last-child{break-after:auto;page-break-after:auto}
  .documento details.calc,.documento .seg,.documento .snap,.documento .simbar{display:none!important}
  .documento .ed{border-bottom:0}
  .documento .v{border-bottom:0}.documento .v::after{display:none}
  .documento [contenteditable]:empty::before{content:"";color:transparent}
  .documento figure,.documento table,.documento .dev-box,.documento .req,.documento .srow{break-inside:avoid}
}
`;

// ---------- bloques de texto ----------
function inline(t) {
  return esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
}

function crearCtx(opciones) {
  const variables = opciones.variables || {};
  return {
    variables,
    portadas: opciones.portadas || null,
    esquemas: opciones.esquemas || {},
    salidas: opciones.salidas || {},
    sim: opciones.simulacion || {},
    tablasEdit: opciones.tablasEdit || new Set(),
    unidades: new Set(),
    renderVivo(v) {
      if (v.k === 'color') {
        const b = bandasColor(v.valor);
        if (!b) return '<span class="pendv">?</span>';
        return `<span class="sws" aria-hidden="true">${b.map((x) => `<i style="background:${x.color}"></i>`).join('')}</span><span class="cn">${b.map((x) => x.nombre).join(' ')}</span><br><span class="tol">±5 %</span>`;
      }
      const e = evaluar(v, variables);
      if (e.estado !== 'ok') return `<span class="v pendv" tabindex="0" data-src="Pendiente · ${esc(e.razon || 'sin dato')}">pendiente</span>`;
      const txt = neg(formatear(e.valor, e.cifras, { signo: e.signo }));
      const mostrar = e.unidad && !this.unidades.has(e.unidad);
      return `<span class="v" tabindex="0" data-src="${esc(e.origen || '')}">${txt}</span>${mostrar ? '&nbsp;' + esc(e.unidad) : ''}`;
    },
    seg(texto) {
      return segmentos(texto).map((s) => (s.t === 'texto' ? inline(s.v) : s.t === 'mate' ? latexAMathML(s.v, s.display) : this.renderVivo(s.v))).join('').replaceAll('\n', ' ');
    },
  };
}

const unidadesDeTabla = (tb) => {
  const s = new Set();
  const textos = [...tb.encabezado, ...tb.filas.map((f) => f.celdas[0] || '')];
  for (const t of textos) for (const w of t.split(/[\s()·,]+/)) if (w) s.add(w);
  return s;
};

function celdaHTML(ctx, texto, col) {
  const t = texto.trim();
  if (t === '::: campo :::') return '<span contenteditable="plaintext-only" class="campo" aria-label="Campo editable"></span>';
  if (t === '?') return '<span class="pend">por medir</span>';
  if (t === 'nominal') {
    const e = ctx.variables[col];
    const val = e && Number.isFinite(e.valor) ? `<span class="med">${neg(formatear(e.valor, 0))}${e.unidad ? '&nbsp;' + esc(e.unidad) : ''}</span><br>` : '';
    return val + '<span class="pend">nominal · sin medir</span>';
  }
  if (/^[−+-]?\d[\d.,]*$/.test(t)) return `<span class="med">${neg(esc(t))}</span>`;
  return ctx.seg(t);
}

function celdaEditable(ctx, texto, linea, col, nombre) {
  const t = texto.trim(), attrs = `contenteditable="plaintext-only" data-linea="${linea}" data-col="${col}" data-orig="${esc(t)}" aria-label="Valor medido de ${esc(nombre)}"`;
  if (numeroDeCelda(t)) return `<span class="med ed" ${attrs}>${neg(esc(t))}</span>`;
  const e = ctx.variables[nombre];
  const nom = e && Number.isFinite(e.valor) ? `${neg(formatear(e.valor, 0))}${e.unidad ? '&nbsp;' + esc(e.unidad) + ' ' : ' '}` : '';
  return `<span class="ed" ${attrs} data-ph="${t === '?' ? 'por medir' : 'valor'}"></span><br><span class="pend">${nom}${t === '?' ? 'por medir' : 'nominal · sin medir'}</span>`;
}

function tablaHTML(ctx, tb) {
  ctx.unidades = unidadesDeTabla(tb);
  const editable = ctx.tablasEdit.has(tb.id) && tb.id, filaMed = editable ? filaMedida(tb) : null;
  const hayMate = (c) => /(?<!\\)\$/.test(c);
  const eqt = tb.filas.some((f) => f.celdas.some(hayMate)) || tb.encabezado.some(hayMate);
  let h;
  if (tb.identificacion) {
    h = `<table class="ident"><tbody>${tb.filas.map((f) => `<tr><th scope="row">${ctx.seg(f.celdas[0] || '')}</th><td${(f.celdas[1] || '').trim() === '::: campo :::' ? ` contenteditable="plaintext-only" aria-label="${esc(f.celdas[0] || '')}"></td>` : `>${celdaHTML(ctx, f.celdas[1] || '', '')}</td>`}</tr>`).join('')}</tbody></table>`;
  } else {
    const cab = tb.encabezado.length ? `<thead><tr>${tb.encabezado.map((c, k) => `<th${k === 0 ? ' class="l"' : ''}>${ctx.seg(c)}</th>`).join('')}</tr></thead>` : '';
    const cuerpo = tb.filas.map((f) => {
      const tot = /^total/i.test((f.celdas[0] || '').trim());
      return `<tr${tot ? ' class="tot"' : ''}>${f.celdas.map((c, k) => {
        if (k === 0) return `<th class="l" scope="row">${ctx.seg(c)}</th>`;
        if (editable && f === filaMed) return `<td>${celdaEditable(ctx, c, f.linea, k, tb.encabezado[k] || '')}</td>`;
        const eq = hayMate(c);
        return `<td${eq ? ' class="eq" style="white-space:nowrap"' : ''}>${celdaHTML(ctx, c, tb.encabezado[k] || '')}</td>`;
      }).join('')}</tr>`;
    }).join('');
    h = `<table class="grid${eqt ? ' eqt' : ''}">${cab}<tbody>${cuerpo}</tbody></table>`;
  }
  ctx.unidades = new Set();
  return h + (tb.pie ? `<div class="cap"${tb.id ? ` id="${esc(tb.id)}"` : ''}>${ctx.seg(tb.pie)}</div>` : '');
}

// ---------- circuitos y figuras ----------
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const unidadElem = (n) => ({ R: 'Ω', V: 'V', I: 'A', C: 'F', L: 'H' }[n[0].toUpperCase()] || '');
const fmtValor = (e) => {
  const m = String(e.valorTexto).trim().match(/^([\d.]+(?:e[+-]?\d+)?)\s*(meg|[kKMmunpµ])?/i);
  const pref = m && m[2] ? (m[2].toLowerCase() === 'meg' ? 'M' : m[2] === 'u' ? 'µ' : m[2]) : '';
  return m ? `${m[1]} ${pref}${unidadElem(e.nombre)}` : String(e.valorTexto);
};

function valorSonda(ctx, s, esc_) {
  const e = ctx.variables[`${s.nombre}@${esc_}`];
  if (!e || !Number.isFinite(e.valor)) return '—';
  return `${neg(formatear(e.valor, 3))}${e.unidad ? ' ' + e.unidad : ''}`;
}

function grafoSVG(ctx, c, escenario) {
  const nodos = [...c.nodos].sort((a, b) => (/^(gnd|0)$/i.test(a) ? -1 : /^(gnd|0)$/i.test(b) ? 1 : 0));
  const W = 900, cx = 450, cy = 190, R = 130;
  const pos = {};
  nodos.forEach((n, k) => { const a = (Math.PI / 2) + (2 * Math.PI * k) / nodos.length; pos[n] = [cx + R * 1.8 * Math.cos(a), cy + R * Math.sin(a)]; });
  const usados = {};
  let g = '';
  for (const e of c.elementos) {
    if (!e.nodos) continue;
    const [a, b] = e.nodos.map((n) => pos[n]);
    const key = [...e.nodos].sort().join('|'); const k = (usados[key] = (usados[key] ?? -1) + 1);
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const off = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 26;
    const mx = (a[0] + b[0]) / 2 - (dy / len) * off, my = (a[1] + b[1]) / 2 + (dx / len) * off;
    const txt = `${e.nombre} · ${fmtValor(e)}`;
    g += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}" fill="none" stroke="#33415c" stroke-width="2"/>`;
    g += `<rect x="${(mx - txt.length * 4.1).toFixed(1)}" y="${(my - 11).toFixed(1)}" width="${(txt.length * 8.2).toFixed(1)}" height="22" rx="5" fill="#fff" stroke="#8ea9c8"/><text x="${mx.toFixed(1)}" y="${(my + 5).toFixed(1)}" text-anchor="middle" font-size="13" fill="#1f3f66">${esc(txt)}</text>`;
  }
  for (const n of nodos) g += `<circle cx="${pos[n][0].toFixed(1)}" cy="${pos[n][1].toFixed(1)}" r="5" fill="#33415c"/><text x="${(pos[n][0] + 9).toFixed(1)}" y="${(pos[n][1] - 9).toFixed(1)}" font-size="13" font-style="italic" fill="#5b6573">${esc(/^(gnd|0)$/i.test(n) ? 'GND' : n)}</text>`;
  const filas = Math.ceil(c.sondas.length / 2);
  let leyenda = '';
  c.sondas.forEach((s, k) => {
    const x = k % 2 ? 470 : 30, y = 372 + Math.floor(k / 2) * 24;
    const nom = valorSonda(ctx, s, 'nominal'), med = valorSonda(ctx, s, 'medido');
    leyenda += `<g class="probe"><text x="${x}" y="${y}" font-size="14" fill="#1c2430"><tspan font-weight="700" fill="#1f4e79">${esc(s.nombre)}</tspan>  <tspan fill="#5b6573">${esc(s.medida)}</tspan> = <tspan class="pv" data-nom="${esc(nom)}" data-med="${esc(med)}">${esc(escenario === 'medido' ? med : nom)}</tspan></text></g>`;
  });
  const H = 372 + filas * 24 + 10;
  return `<svg class="fig-main" viewBox="0 0 ${W} ${H}" role="img" aria-label="Circuito ${esc(c.id)} (esquema automático)" font-family="Carlito,Calibri,Segoe UI,Arial,sans-serif">${g}${leyenda}</svg>`;
}

function esquemaSVG(ctx, c, escenario, sufijo) {
  const crudo = ctx.esquemas[c.id];
  if (!crudo) return grafoSVG(ctx, c, escenario);
  const porNombre = Object.fromEntries(c.sondas.map((x) => [norm(x.nombre), x]));
  let s = String(crudo).replace(/\bid="([\w-]+)"/g, `id="$1-${sufijo}"`).replace(/aria-labelledby="([^"]+)"/g, (m, a) => `aria-labelledby="${a.split(/\s+/).map((x) => x + '-' + sufijo).join(' ')}"`);
  s = s.replace(/(<tspan[^>]*>)([^<]+)(<\/tspan>\s*<tspan class="pv" data-nom=")([^"]*)(" data-med=")([^"]*)(">)[^<]*<\/tspan>/g, (m, a, nom, b, n, c2, d) => {
    const sonda = porNombre[norm(nom)];
    if (sonda) { const vn = valorSonda(ctx, sonda, 'nominal'), vm = valorSonda(ctx, sonda, 'medido'); if (vn !== '—') n = vn; if (vm !== '—') d = vm; }
    return `${a}${nom}${b}${n}${c2}${d}">${escenario === 'medido' ? d : n}</tspan>`;
  });
  return s;
}

function estadoSim(ctx, c) {
  const s = ctx.sim[c.id];
  if (!s) return 'sin simular';
  if (s.estado === 'ejecutando') return 'Simulando…';
  if (s.estado === 'error') return 'Error: ' + s.mensaje;
  return `${s.motor} · DC ${s.hora}`;
}
const botonSim = (ctx, c) => `<span class="simbar"><button type="button" class="sim-btn" data-sim="${esc(c.id)}">↻ Simular</button><span class="sim-est" aria-live="polite">${esc(estadoSim(ctx, c))}</span></span>`;

function figuraHTML(ctx, doc, b, num) {
  const c = doc.circuitos.find((x) => x.id === b.circuitoId);
  if (!c && !b.imagen) return `<p class="pendv">Figura sin circuito</p>`;
  const esc_ = b.escenario || 'nominal';
  const tieneMedido = c && c.escenarios.some((e) => e.nombre === 'medido');
  const seg = tieneMedido ? `<span class="seg" role="group" aria-label="Escenario de simulación"><button type="button" aria-pressed="${esc_ !== 'medido'}" data-esc="nominal">Nominal</button><button type="button" aria-pressed="${esc_ === 'medido'}" data-esc="medido">Valores medidos</button></span>` : '<span></span>';
  const cuerpo = b.imagen ? `<img src="${esc(b.imagen)}" alt="${esc(b.alt)}" style="max-width:100%">` : esquemaSVG(ctx, c, esc_, 'f' + num);
  return `<figure class="fig" aria-label="${esc(b.alt)}"><div class="fig-head">${seg}${c ? botonSim(ctx, c) : ''}<span class="snap">${b.modo === 'captura-viva' ? 'Captura viva' : 'Captura congelada'}</span></div><div class="fig-body">${cuerpo}</div><figcaption class="cap">${inline(b.alt)}.${b.pie ? ' ' + ctx.seg(b.pie) : ''}</figcaption></figure>`;
}

function colorearCodigo(t) {
  return esc(t).split('\n').map((l) => l.replace(/((?:%|#|\/\/).*)$/, '<span class="c">$1</span>')).join('\n');
}

function codigoHTML(ctx, b) {
  const nombre = b.lenguaje === 'octave' ? 'Octave' : b.lenguaje === 'python' ? 'Python' : b.lenguaje;
  const lineas = b.codigo.split('\n').length;
  const salida = ctx.salidas[b.nombre];
  return `<details class="calc"${b.pliega ? '' : ' open'}><summary><span class="car" aria-hidden="true">▸</span> Cálculo en ${esc(nombre)} · ${lineas} líneas · ${b.ejecuta ? 'ejecutable' : 'solo lectura'}<span class="cs">${esc(b.nombre || 'sin nombre')}</span></summary><div class="cb"><pre class="code">${colorearCodigo(b.codigo)}</pre>${b.produce.length ? `<div class="out-l">Produce</div><pre class="out">${esc(b.produce.join(', '))}</pre>` : ''}${salida ? `<div class="out-l">Salida</div><pre class="out">${esc(salida)}</pre>` : ''}</div></details>`;
}

function circuitoHTML(ctx, b) {
  const c = b.circuito;
  const esc_ = c.escenarios.map((e) => e.nombre).join(' · ') || 'nominal';
  return `<details class="calc"><summary><span class="car" aria-hidden="true">▸</span> Circuito ${esc(c.id)} · análisis ${esc(c.analisis)} · ${c.elementos.length} elementos<span class="cs">${esc(esc_)} · ${esc(estadoSim(ctx, c))}</span></summary><div class="cb">${botonSim(ctx, c)}<pre class="code">${colorearCodigo(b.codigo.replace(/;/g, ';'))}</pre></div></details>`;
}

// ---------- desarrollo ----------
const circulado = (n) => (n >= 1 && n <= 20 ? String.fromCodePoint(0x2460 + n - 1) : `(${n})`);
const eqHTML = (ctx, t) => `<div class="eqc">${ctx.seg(t.includes('$') ? t : `$$${t}$$`)}</div>`;
const subInner = (nombre) => latexAMathML(nombre.replace(/^([A-Za-z]+)(\d+)$/, '$1_{$2}')).replace(/^<math[^>]*><mrow>|<\/mrow><\/math>$/g, '');
const sub = (nombre) => `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${subInner(nombre)}</mrow></math>`;

function desarrolloHTML(ctx, doc, b) {
  const c = doc.circuitos.find((x) => x.id === b.circuito);
  const parte = (tipo) => b.items.filter((i) => i.tipo === tipo);
  const fig = c ? `<figure class="dev-fig">${esquemaSVG(ctx, c, 'nominal', 'd' + b.n)}<figcaption>Circuito de la figura ${b.n}</figcaption></figure>` : '';
  let izq = '';
  for (const r of parte('ramas')) izq += `<div class="srow"><div class="sl">Corrientes de rama</div><div class="sc cols2">${r.ramas.map((x) => `<div class="c4"><b>${sub(x.corriente)}</b><span>${esc(x.sonda)}${x.detalle ? ' · ' + esc(x.detalle) : ''}</span></div>`).join('')}</div></div>`;
  for (const l of parte('lck')) izq += `<div class="srow"><div class="sl">LCK en el nodo ${esc(l.id)}</div><div class="sc">${eqHTML(ctx, l.ecuacion)}</div></div>`;
  let ancho = '';
  for (const l of parte('lkv')) ancho += `<div class="srow"><div class="sl">Lazo ${esc(l.id)}<small>${esc(l.elementos)}</small></div><div class="sc eqc">${ctx.seg(l.ecuacion.includes('$') ? l.ecuacion : `$$${l.ecuacion}$$`)}</div></div>`;
  for (const s of parte('sistema')) {
    const vec = (arr, u = '') => `<mrow><mo>[</mo><mtable>${arr.map((x) => `<mtr><mtd>${typeof x === 'number' ? `<mn>${x < 0 ? '−' + Math.abs(x) : x}</mn>${u ? `<mtext>&#8239;${u}</mtext>` : ''}` : `<mi>${esc(x)}</mi>`}</mtd></mtr>`).join('')}</mtable><mo>]</mo></mrow>`;
    const incs = s.incognitas.map((n) => subInner(n));
    const mat = `<mrow><mo>[</mo><mtable>${s.matriz.map((f) => `<mtr>${f.map((x) => `<mtd><mn>${x < 0 ? '−' + Math.abs(x) : x}</mn></mtd>`).join('')}</mtr>`).join('')}</mtable><mo>]</mo></mrow>`;
    const col = `<mrow><mo>[</mo><mtable>${incs.map((x) => `<mtr><mtd>${x}</mtd></mtr>`).join('')}</mtable><mo>]</mo></mrow>`;
    const rhs = vec(s.rhs, 'V').replace(/<mn>0<\/mn>/g, '<mn>0</mn>');
    const sol = s.incognitas.map((n) => ctx.variables[n]);
    const completa = sol.every((x) => x && Number.isFinite(x.valor));
    const solMath = completa ? `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${col}<mo>=</mo>${vec(sol.map((x) => Number(x.valor.toFixed(3))))}<mtext>&#8239;${esc(sol[0].unidad || '')}</mtext></mrow></math>` : '';
    ancho += `<div class="srow"><div class="sl">Sistema matricial<small>${esc(s.nota)}</small></div><div class="sc sys"><div class="eqc c"><math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${mat}<mo>·</mo>${col}<mo>=</mo>${rhs}</mrow></math></div>${solMath ? `<div class="eqc c">${solMath}</div>` : `<p class="note">Solución pendiente: ${s.resuelve ? 'ejecute la celda «' + esc(s.resuelve) + '»' : 'sin celda de resolución'}.</p>`}</div></div>`;
  }
  let cont = '';
  for (const o of parte('ohm')) {
    cont += `<div class="srow"><div class="sl">Ley de Ohm: tensiones</div><div class="sc cols6">${o.elementos.map((n) => {
      const e = c && c.elementos.find((x) => x.nombre === n);
      return `<div class="c6">${sub(`V_{${n}}`)}<span class="d">${e ? esc(fmtValor(e)) : ''}</span><b>${ctx.renderVivo({ k: 'var', clave: `V(${n})`, escenario: '', origen: 'calc', unidad: 'V', cifras: 3 })}</b></div>`;
    }).join('')}</div></div>`;
  }
  for (const o of parte('lck-nodos')) {
    cont += `<div class="srow"><div class="sl">Comprobación de LCK</div><div class="sc cols3">${o.nodos.map((n) => `<div class="c3"><h5>Nodo ${esc(n)}</h5><p>Suma = ${ctx.renderVivo({ k: 'formula', fn: 'suma', arg: 'lck' + n, unidad: 'mA', cifras: 3 })}</p></div>`).join('')}</div></div>`;
  }
  for (const o of parte('caracteristicas')) {
    if (!c) continue;
    const prev = ctx.unidades; ctx.unidades = new Set();
    const celda = (clave, u, cif) => ctx.renderVivo({ k: 'var', clave, escenario: '', origen: 'calc', unidad: u, cifras: cif });
    ctx.unidades = new Set(['V', 'mA', 'W']);
    const filas = c.elementos.map((e) => `<tr><th class="l" scope="row">${esc(e.nombre)}</th><td>${e.nombre[0] === 'R' ? esc(String(e.valor)) : '—'}</td><td>${celda(`V(${e.nombre})`, 'V', 3)}</td><td>${celda(`I(${e.nombre})`, 'mA', 3)}</td><td>${celda(`P(${e.nombre})`, 'W', 4)}</td></tr>`).join('');
    ctx.unidades = prev;
    cont += `<div class="srow"><div class="sl">Características eléctricas</div><div class="sc"><table class="grid mini"><thead><tr><th class="l">Elemento</th><th>Resistencia (Ω)</th><th>Tensión (V)</th><th>Corriente (mA)</th><th>Potencia (W)</th></tr></thead><tbody>${filas}</tbody></table></div></div>`;
  }
  for (const o of parte('reduccion')) cont += `<div class="srow"><div class="sl">Reducción equivalente</div><div class="sc"><p class="note">Terminales ${esc(o.atributos.terminales || '?')}: reducción serie/paralelo pendiente de conectar con el laboratorio.</p></div></div>`;
  return `<div class="dev-box"><span class="num" aria-label="Circuito ${b.n}">${circulado(b.n)}</span><div class="dev-grid">${fig}<div class="dev-steps">${izq}</div></div>${ancho ? `<div class="dev-wide" style="border-top:1px solid var(--grid)">${ancho}</div>` : ''}${cont}</div>`;
}

// ---------- portada ----------
function portadaHTML(doc, ctx) {
  const p0 = doc.meta.portada;
  const p = typeof p0 === 'string' ? { plantilla: p0 } : p0 || {};
  const imp = portadaImportada(doc.meta, ctx.portadas);
  if (imp) return `<section class="page cover imp" aria-label="Portada" data-plantilla="importada" data-archivo="${esc(imp.nombre)}">${llenarPortada(imp.html, camposDePortada(p))}</section>`;
  const ed = (txt, ph) => `<span contenteditable="plaintext-only" data-ph="${esc(ph)}">${esc(txt ?? '')}</span>`;
  const [u1, u2] = p.unidad ? String(p.unidad).split(/\s+en\s+/) : [];
  return `<section class="page cover" aria-label="Portada" data-plantilla="${esc(p.plantilla || 'clasica-upiita')}"><div class="logos"><div class="logo">logo<br>UPIITA</div><div class="logo">logo<br>IPN</div></div>
<h1 class="cv-title">Práctica${p.numero !== undefined && p.numero !== '' ? ' #' + esc(p.numero) : ''}</h1>
<p class="cv-sub">${ed(p.subtitulo, 'Subtítulo de la práctica')}</p>
<div class="cv-mid"><div>${ed(p.grupo, 'Grupo')} – ${ed(p.curso, 'Curso')}</div><div>${ed(p.alumno, 'Nombre del alumno')}</div><div>Profesora: ${ed(p.profesora, 'Nombre de la profesora')}</div></div>
<div class="cv-low"><div>${ed(p.carrera, 'Nombre de la carrera')}</div><div>${u2 ? `${esc(u1)} en<br>${esc(u2)}` : esc(p.unidad || '') || 'Unidad Profesional Interdisciplinaria en<br>Ingeniería y Tecnologías Avanzadas'}</div></div>
<div class="cv-date">Ciudad de México a ${ed(p.fecha, 'fecha')}.</div></section>`;
}

// ---------- bloques → [{html, peso, tipo}] ----------
function bloqueHTML(ctx, doc, b, st) {
  const largo = (t) => Math.ceil(String(t).replace(/\$[^$]*\$|\{\{[^}]*\}\}/g, 'xxxxx').length / 100);
  switch (b.tipo) {
    case 'titulo': {
      if (b.nivel === 1) return { html: `<h1 class="t">${ctx.seg(b.texto)}</h1>${b.subtitulo ? `<p class="sub">${ctx.seg(b.subtitulo)}</p>` : ''}`, peso: b.subtitulo ? 1.1 : 0.8, titulo: true };
      if (b.nivel === 2) return { html: `<h2>${ctx.seg(b.texto)}</h2>`, peso: 0.65, titulo: true, salto: /^anexo/i.test(b.texto) };
      return { html: `<h${Math.min(b.nivel + 1, 4)}>${ctx.seg(b.texto)}</h${Math.min(b.nivel + 1, 4)}>`, peso: 0.5, titulo: true };
    }
    case 'parrafo': return { html: `<p>${ctx.seg(b.texto)}</p>`, peso: largo(b.texto) * 0.2 + 0.14 };
    case 'lista': {
      const tag = b.ordenada ? 'ol' : 'ul';
      return { html: `<${tag} class="lit">${b.items.map((i) => `<li>${ctx.seg(i.texto)}</li>`).join('')}</${tag}>`, peso: b.items.reduce((a, i) => a + largo(i.texto) * 0.2 + 0.12, 0.1) };
    }
    case 'tabla': {
      const rows = b.filas.length, color = b.filas.some((f) => f.celdas.some((c) => /\{\{color:/.test(c)));
      return { html: tablaHTML(ctx, b), peso: 0.35 + rows * (b.identificacion ? 0.38 : 0.32) + (color ? 0.3 : 0) + (b.pie ? 0.3 : 0) };
    }
    case 'circuito': return { html: circuitoHTML(ctx, b), peso: 0.45 };
    case 'figura': { st.fig++; return { html: figuraHTML(ctx, doc, b, st.fig), peso: 4.9 }; }
    case 'codigo': return { html: codigoHTML(ctx, b), peso: b.pliega ? 0.45 : 0.5 + b.codigo.split('\n').length * 0.2 };
    case 'campo': return { html: '<div contenteditable="plaintext-only" class="ans" aria-label="Campo editable"></div>', peso: 0.5 };
    case 'respuesta': {
      const alto = String(b.atributos.alto || '');
      const h = parseFloat(alto) || 0;
      return { html: h ? `<div class="concl" contenteditable="plaintext-only" aria-label="Respuesta" style="min-height:${esc(alto)}"></div>` : '<div class="ans" contenteditable="plaintext-only" aria-label="Respuesta"></div>', peso: h ? h + 0.3 : 0.9 };
    }
    case 'contenedor': {
      if (b.nombre === 'requisito') return { html: `<div class="req">${ctx.seg(b.texto)}</div>`, peso: largo(b.texto) * 0.2 + 0.45 };
      return { html: `<div class="req">${ctx.seg(b.texto)}</div>`, peso: largo(b.texto) * 0.2 + 0.45 };
    }
    case 'desarrollo': return { html: desarrolloHTML(ctx, doc, b), peso: 4.8 + b.items.filter((i) => ['lkv', 'ohm', 'caracteristicas', 'lck-nodos'].includes(i.tipo)).length * 0.8 };
    default: return { html: '', peso: 0 };
  }
}

const CAPACIDAD = 8.7;
function paginar(items) {
  const paginas = [[]]; let usado = 0; let cola = [];
  const flush = (extra) => {
    const total = cola.reduce((a, x) => a + x.peso, 0) + extra.peso;
    if (usado > 0 && usado + total > CAPACIDAD) { paginas.push([]); usado = 0; }
    paginas[paginas.length - 1].push(...cola, extra); usado += total; cola = [];
  };
  for (const it of items) {
    if (it.salto && usado > 0) { paginas.push([]); usado = 0; }
    if (it.titulo) { cola.push(it); continue; }
    flush(it);
  }
  if (cola.length) { paginas[paginas.length - 1].push(...cola); }
  return paginas.filter((p) => p.length);
}

/**
 * Árbol → HTML del documento (secciones .page dentro de .documento).
 * opciones: {variables, esquemas:{idCircuito:svg}, salidas:{celda:texto}}
 */
export function renderDocumento(doc, opciones = {}) {
  const ctx = crearCtx(opciones);
  const st = { fig: 0 };
  if (!opciones.tablasEdit) ctx.tablasEdit = tablasDeEscenarios(doc);
  const items = doc.bloques.map((b) => bloqueHTML(ctx, doc, b, st));
  const paginas = paginar(items);
  const pie = doc.meta.pie ? ctx.seg(String(doc.meta.pie)) : '';
  const hayPortada = doc.meta.portada !== undefined;
  let n = hayPortada ? 1 : 0;
  const hojas = paginas.map((p) => {
    n++;
    return `<section class="page" aria-label="Página ${n}">${p.map((x) => x.html).join('')}<div class="pg-foot">${pie ? pie + ' · ' : ''}Página ${n}</div></section>`;
  });
  return `<div class="documento">${hayPortada ? portadaHTML(doc, ctx) : ''}${hojas.join('\n')}</div>`;
}

/** Documento HTML completo e independiente (para exportar o probar). */
export function paginaCompleta(doc, opciones = {}) {
  const titulo = (doc.bloques.find((b) => b.tipo === 'titulo') || {}).texto || 'Documento AULA-C';
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title><style>body{margin:0;background:#e6e8ec}${ESTILOS}</style></head><body>${renderDocumento(doc, opciones)}</body></html>`;
}

/** Cambia los valores de las sondas de las figuras según el escenario (uso en el navegador). */
export function activarEscenarios(raiz) {
  raiz.addEventListener('click', (ev) => {
    const b = ev.target.closest && ev.target.closest('.seg button[data-esc]');
    if (!b) return;
    const fig = b.closest('figure');
    fig.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    fig.querySelectorAll('.pv').forEach((t) => { t.textContent = b.dataset.esc === 'medido' ? t.dataset.med : t.dataset.nom; });
  });
}

/** Repagina midiendo alturas reales: empuja bloques sobrantes a la hoja siguiente (navegador). */
export function ajustarPaginas(raiz) {
  const pagina = (el) => el.closest('.page');
  let hojas = [...raiz.querySelectorAll('.page:not(.cover)')];
  for (let k = 0; k < hojas.length; k++) {
    const h = hojas[k];
    const bloques = () => [...h.children].filter((x) => !x.classList.contains('pg-foot'));
    let guard = 0;
    while (h.scrollHeight > h.clientHeight + 1 && bloques().length > 1 && guard++ < 60) {
      let sig = hojas[k + 1];
      if (!sig) {
        sig = document.createElement('section'); sig.className = 'page';
        const foot = document.createElement('div'); foot.className = 'pg-foot'; sig.appendChild(foot);
        h.after(sig); hojas.push(sig);
      }
      const ult = bloques().pop();
      sig.insertBefore(ult, sig.firstChild);
    }
  }
  const pie = (raiz.querySelector('.pg-foot') || {}).textContent || '';
  const base = pie.replace(/\s*·?\s*Página \d+$/, '');
  raiz.querySelectorAll('.page').forEach((p, i) => {
    p.setAttribute('aria-label', `Página ${i + 1}`);
    const f = p.querySelector('.pg-foot');
    if (f) f.textContent = `${base ? base + ' · ' : ''}Página ${i + 1}`;
  });
}
