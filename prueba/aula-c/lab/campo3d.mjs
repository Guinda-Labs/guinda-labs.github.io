// Pestaña «Campo» del panel de Análisis: escena 3D cualitativa de E, B y Poynting en un circuito simple.
// Se carga con import() dinámico solo al abrir la pestaña. three.js es local (lab/vendor/three), nunca CDN.
// La geometría vive en campo-geometria.mjs (sin WebGL); aquí solo se dibuja y se gestiona el ciclo de vida.
import { anillosB, lineasE, lineasPoynting, trayectoria, RESISTENCIA, FUENTE } from './campo-geometria.mjs';

export const TEXTOS = {
  lienzo: 'Escena 3D cualitativa de un circuito simple: campo eléctrico E, campo magnético B y vector de Poynting.',
  vistas: 'Vistas guiadas',
  leyenda: { e: 'E', b: 'B', s: 'Poynting' },
  nota: 'Cualitativo: formas y sentidos, no magnitudes.',
  pausar: 'Pausar',
  reanudar: 'Reanudar',
  centrar: 'Centrar',
  vistaActual: 'Vista',
};

export const VISTAS = [
  { id: 'fuente', corto: '1', nombre: '1 · Campo E de la fuente', capas: ['dipolo'] },
  { id: 'cable', corto: '2', nombre: '2 · E en el cable y Poynting', capas: ['dipolo', 'cable', 'poynting'] },
  { id: 'b', corto: '3', nombre: '3 · Campo B de la corriente', capas: ['b'] },
  { id: 'todo', corto: 'Todo', nombre: 'Ver todo', capas: ['dipolo', 'cable', 'b', 'poynting'] },
];

const DIR = (() => { const v = [9.2, 4.6, 16.5], l = Math.hypot(...v); return v.map((x) => x / l); })();
const TAN = Math.tan((36 / 2) * Math.PI / 180);

// Objetivo y distancia de la cámara por vista, según la proporción del lienzo (el panel es angosto).
export function encuadre(vista, aspecto) {
  const a = Math.max(0.5, aspecto || 1.33);
  if (vista === 'fuente') return { objetivo: [FUENTE.x, 0, 0], distancia: Math.max(7.5, 2.6 / (TAN * a)) };
  return { objetivo: [0, 0, 0], distancia: Math.max(11.5, 6.8 / (TAN * a)) };
}

function texturaRadial(T, tam, color, alfa) {
  const datos = new Uint8Array(tam * tam * 4), c = tam / 2;
  for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
    const r = Math.hypot(x + 0.5 - c, y + 0.5 - c) / c, i = (y * tam + x) * 4;
    datos[i] = datos[i + 1] = datos[i + 2] = color;
    datos[i + 3] = Math.round(255 * Math.max(0, Math.min(1, alfa(r))));
  }
  const t = new T.DataTexture(datos, tam, tam, T.RGBAFormat);
  t.magFilter = T.LinearFilter; t.minFilter = T.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}

// Construye el grafo de la escena con la API de three. Recibe el espacio de nombres THREE (inyectable en pruebas).
export function construirEscena(T) {
  const geos = new Set(), mats = new Set(), texs = new Set();
  const G = (x) => (geos.add(x), x), M = (x) => (mats.add(x), x), X = (x) => (texs.add(x), x);
  const V3 = (p) => new T.Vector3(p.x, p.y, p.z);
  const scene = new T.Scene(), root = new T.Group();
  scene.add(root);
  scene.add(new T.HemisphereLight(0xe4ecff, 0x1c2026, 3));
  const luz = new T.DirectionalLight(0xffffff, 2.3);
  luz.position.set(5, 9, 7); scene.add(luz);

  const gDip = new T.Group(), gCab = new T.Group(), gB = new T.Group(), gS = new T.Group();
  root.add(gDip, gCab, gB, gS);
  const capas = { dipolo: gDip, cable: gCab, b: gB, poynting: gS };

  const glow = X(texturaRadial(T, 64, 255, (r) => (r >= 1 ? 0 : r <= 0.35 ? 1 - 0.45 * (r / 0.35) : 0.55 * (1 - (r - 0.35) / 0.65))));
  const sombraTex = X(texturaRadial(T, 64, 0, (r) => 0.45 * (1 - r)));
  const basico = (extra) => M(new T.MeshBasicMaterial({ transparent: true, depthWrite: false, ...extra }));
  const mHi = M(new T.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.15 }));
  const mLo = M(new T.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.15 }));
  const mRes = M(new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.05, emissive: 0x331100, emissiveIntensity: 0.35 }));
  const mBat = M(new T.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.5, metalness: 0.3 }));
  const mBanda = M(new T.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.6 }));
  const matE = basico({ vertexColors: true, opacity: 0.62 }), matS = basico({ opacity: 0.26 });
  const matB1 = basico({ opacity: 0.9 }), matB2 = basico({ opacity: 0.5 });
  const matFlechaE = basico({ opacity: 0.9 }), matFlechaS = basico({ opacity: 0.8 });
  const puntos = (tam) => M(new T.PointsMaterial({ size: tam, map: glow, transparent: true, depthWrite: false, sizeAttenuation: true }));
  const pmE1 = puntos(0.2), pmE2 = puntos(0.2), pmB = puntos(0.24), pmS = puntos(0.2);

  /* ---- conductores, fuente y resistencia ---- */
  const { arriba, abajo, resistencia } = trayectoria();
  const tubo = (pts, mat) => {
    const geo = G(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(V3)), pts.length * 2, 0.075, 12, false));
    root.add(new T.Mesh(geo, mat));
  };
  tubo(arriba, mHi); tubo(abajo, mLo);
  const resG = G(new T.CylinderGeometry(RESISTENCIA.radio, RESISTENCIA.radio, 1.9, 40, 20));
  const resCol = new Float32Array(resG.attributes.position.count * 3);
  resG.setAttribute('color', new T.BufferAttribute(resCol, 3));
  const res = new T.Mesh(resG, mRes); res.position.set(RESISTENCIA.x, 0, 0); root.add(res);
  const bandaG = G(new T.CylinderGeometry(0.412, 0.412, 0.1, 40));
  [0.55, 0.18, -0.18].forEach((y) => { const b = new T.Mesh(bandaG, mBanda); b.position.set(RESISTENCIA.x, y, 0); root.add(b); });
  const bat = new T.Mesh(G(new T.CylinderGeometry(FUENTE.radio, FUENTE.radio, 1.1, 40)), mBat); bat.position.set(FUENTE.x, 0, 0); root.add(bat);
  const tapaG = G(new T.CylinderGeometry(0.22, 0.22, 0.14, 24));
  const tapaP = new T.Mesh(tapaG, mHi); tapaP.position.set(FUENTE.x, 0.62, 0); root.add(tapaP);
  const tapaN = new T.Mesh(tapaG, mLo); tapaN.position.set(FUENTE.x, -0.62, 0); root.add(tapaN);
  // Signos + y − hechos con cajas (sin texto ni canvas).
  const barraH = G(new T.BoxGeometry(0.34, 0.07, 0.07)), barraV = G(new T.BoxGeometry(0.07, 0.34, 0.07));
  const signo = (g, mat, y) => { const m = new T.Mesh(g, mat); m.position.set(FUENTE.x - 0.85, y, 0.1); root.add(m); };
  signo(barraH, mHi, 0.62); signo(barraV, mHi, 0.62); signo(barraH, mLo, -0.62);
  const sombra = new T.Mesh(G(new T.PlaneGeometry(13, 5)), basico({ map: sombraTex }));
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = -2.7; root.add(sombra);

  /* ---- E: líneas, flechas y partículas ---- */
  const lineas = [], flechaG = G(new T.ConeGeometry(0.07, 0.22, 10));
  const arriba3 = new T.Vector3(0, 1, 0);
  let emax = 0;
  for (const L of lineasE()) {
    if (L.pts.length < 10) continue;
    const sub = L.pts.filter((_, i) => i % 3 === 0);
    if (sub[sub.length - 1] !== L.pts[L.pts.length - 1]) sub.push(L.pts[L.pts.length - 1]);
    const curva = new T.CatmullRomCurve3(sub.map(V3)), seg = Math.min(140, sub.length * 3);
    const geo = G(new T.TubeGeometry(curva, seg, 0.02, 5, false));
    geo.setAttribute('color', new T.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    const grupo = L.familia === 'dipolo' ? gDip : gCab;
    grupo.add(new T.Mesh(geo, matE));
    const arco = new Float32Array(65 * 3);
    for (let k = 0; k <= 64; k++) { const p = curva.getPointAt(k / 64); arco.set([p.x, p.y, p.z], k * 3); }
    const mg = L.mags;
    mg.forEach((m) => { emax = Math.max(emax, m); });
    const cono = new T.Mesh(flechaG, matFlechaE);
    cono.position.copy(curva.getPointAt(0.45)); cono.quaternion.setFromUnitVectors(arriba3, curva.getTangentAt(0.45));
    grupo.add(cono);
    lineas.push({ geo, mg, arco, len: curva.getLength(), seg, grupo });
  }
  const totalLen = lineas.reduce((a, l) => a + l.len, 0);
  const crearPuntos = (grupo, mat) => {
    const parts = [];
    lineas.filter((l) => l.grupo === grupo).forEach((l) => {
      const n = Math.max(3, Math.min(16, Math.round((360 * l.len) / totalLen)));
      for (let k = 0; k < n; k++) parts.push({ l, u: k / n + 0.01 * ((parts.length * 7) % 3) });
    });
    const geo = G(new T.BufferGeometry());
    geo.setAttribute('position', new T.BufferAttribute(new Float32Array(parts.length * 3), 3));
    const p = new T.Points(geo, mat); p.frustumCulled = false; grupo.add(p);
    return { parts, p, geo };
  };
  const pDip = crearPuntos(gDip, pmE1), pCab = crearPuntos(gCab, pmE2);

  /* ---- B: anillos y partículas (mano derecha respecto a la corriente) ---- */
  const toro1 = G(new T.TorusGeometry(0.55, 0.02, 6, 40)), toro2 = G(new T.TorusGeometry(0.95, 0.02, 6, 40));
  const eje = new T.Vector3(0, 0, 1), bd = [];
  for (const { c, u } of anillosB()) {
    const cc = V3(c), uu = V3(u).normalize();
    for (const [R, geo, mat] of [[0.55, toro1, matB1], [0.95, toro2, matB2]]) {
      const t = new T.Mesh(geo, mat); t.position.copy(cc); t.quaternion.setFromUnitVectors(eje, uu); gB.add(t);
      const e1 = Math.abs(uu.z) > 0.9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 0, 1).cross(uu).normalize();
      bd.push({ c: cc, R, e1, e2: uu.clone().cross(e1), a: (bd.length * 2.4) % 6.28 });
    }
  }
  const bGeo = G(new T.BufferGeometry());
  bGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(bd.length * 3), 3));
  const bPts = new T.Points(bGeo, pmB); bPts.frustumCulled = false; gB.add(bPts);

  /* ---- Poynting: de la fuente a la resistencia por el espacio ---- */
  const sl = [], flechaS = G(new T.ConeGeometry(0.08, 0.26, 10));
  for (const ctrl of lineasPoynting()) {
    const curva = new T.CatmullRomCurve3(ctrl.map(V3));
    gS.add(new T.Mesh(G(new T.TubeGeometry(curva, 40, 0.014, 4, false)), matS));
    const f = new T.Mesh(flechaS, matFlechaS);
    f.position.copy(curva.getPointAt(0.55)); f.quaternion.setFromUnitVectors(arriba3, curva.getTangentAt(0.55)); gS.add(f);
    sl.push(curva);
  }
  const sp = [];
  sl.forEach((curva) => { for (let k = 0; k < 8; k++) sp.push({ curva, u: k / 8 }); });
  const sGeo = G(new T.BufferGeometry());
  sGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(sp.length * 3), 3));
  const sPts = new T.Points(sGeo, pmS); sPts.frustumCulled = false; gS.add(sPts);

  const todasPuntos = [pDip.p, pCab.p, bPts, sPts];

  /* ---- colores según el tema ---- */
  function pintar(p) {
    const C = T.Color, osc = !!p.oscuro;
    const alto = new C(p.alto), bajo = new C(p.bajo);
    mHi.color.copy(alto); mHi.emissive.copy(alto).multiplyScalar(osc ? 0.28 : 0.08);
    mLo.color.copy(bajo); mLo.emissive.copy(bajo).multiplyScalar(osc ? 0.28 : 0.08);
    const pos = resG.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const c = alto.clone().lerp(bajo, 1 - (pos.getY(i) + 0.95) / 1.9);
      resCol[i * 3] = c.r; resCol[i * 3 + 1] = c.g; resCol[i * 3 + 2] = c.b;
    }
    resG.attributes.color.needsUpdate = true;
    const mezcla = osc ? T.AdditiveBlending : T.NormalBlending;
    for (const m of [matE, matS, matB1, matB2, matFlechaE, matFlechaS, pmE1, pmE2, pmB, pmS]) { m.blending = [matE, matFlechaE, pmE1, pmE2].includes(m) ? T.NormalBlending : mezcla; m.needsUpdate = true; }
    const aclarar = (c, k) => c.clone().lerp(new C(osc ? '#ffffff' : '#000000'), k);
    // Las líneas E son rojas como su leyenda en ambos temas: nunca se aclaran hacia el blanco.
    const hsl0 = {}; new C(p.e).getHSL(hsl0);
    const e = new C().setHSL(hsl0.h, 0.9, osc ? 0.6 : 0.4);
    const bajoE = e.clone().offsetHSL(0, 0, osc ? -0.08 : 0.04), altoE = e.clone().offsetHSL(0, 0, osc ? 0.06 : -0.06);
    for (const l of lineas) {
      const col = l.geo.attributes.color, n = l.seg + 1;
      for (let r = 0; r < n; r++) {
        const u = r / (n - 1), k = Math.min(l.mg.length - 1, Math.round(u * (l.mg.length - 1)));
        const c = bajoE.clone().lerp(altoE, Math.sqrt(Math.min(1, l.mg[k] / emax)));
        for (let j = 0; j < 6; j++) { const i = (r * 6 + j) * 3; col.array[i] = c.r; col.array[i + 1] = c.g; col.array[i + 2] = c.b; }
      }
      col.needsUpdate = true;
    }
    matFlechaE.color.copy(e);
    pmE1.color.copy(e); pmE2.color.copy(e);
    const b = new C(p.b), s = new C(p.s);
    matB1.color.copy(b); matB2.color.copy(b); pmB.color.copy(aclarar(b, 0.2));
    matS.color.copy(s); matFlechaS.color.copy(s); pmS.color.copy(aclarar(s, 0.3));
    sombraTex.needsUpdate = true;
    sombra.material.opacity = osc ? 1 : 0.45;
  }

  function mostrarVista(id) {
    const v = VISTAS.find((x) => x.id === id) || VISTAS[VISTAS.length - 1];
    for (const [k, g] of Object.entries(capas)) g.visible = v.capas.includes(k);
    return v;
  }
  function mostrarParticulas(si) { for (const p of todasPuntos) p.visible = !!si; }

  const posicionar = (attr, i, l, u) => {
    const f = u * 64, k = Math.min(63, Math.floor(f)), w = f - k, a = l.arco, o = k * 3;
    attr.setXYZ(i, a[o] + (a[o + 3] - a[o]) * w, a[o + 1] + (a[o + 4] - a[o + 1]) * w, a[o + 2] + (a[o + 5] - a[o + 2]) * w);
  };
  const mover = (grupo, dt) => {
    const attr = grupo.geo.attributes.position;
    grupo.parts.forEach((q, i) => {
      const l = q.l, k = Math.min(l.mg.length - 1, Math.round(q.u * (l.mg.length - 1)));
      q.u = (q.u + (dt * (0.5 + 1.6 * Math.sqrt(l.mg[k] / emax))) / l.len) % 1;
      posicionar(attr, i, l, q.u);
    });
    attr.needsUpdate = true;
  };
  function animar(dt) {
    if (gDip.visible) mover(pDip, dt);
    if (gCab.visible) mover(pCab, dt);
    if (gB.visible) {
      const a = bGeo.attributes.position;
      bd.forEach((d, i) => {
        d.a += dt * 0.7;
        const c = Math.cos(d.a) * d.R, s = Math.sin(d.a) * d.R;
        a.setXYZ(i, d.c.x + d.e1.x * c + d.e2.x * s, d.c.y + d.e1.y * c + d.e2.y * s, d.c.z + d.e1.z * c + d.e2.z * s);
      });
      a.needsUpdate = true;
    }
    if (gS.visible) {
      const a = sGeo.attributes.position;
      sp.forEach((q, i) => { q.u = (q.u + dt * 0.22) % 1; const p = q.curva.getPointAt(q.u); a.setXYZ(i, p.x, p.y, p.z); });
      a.needsUpdate = true;
    }
  }

  function dispose() {
    for (const g of geos) g.dispose();
    for (const m of mats) m.dispose();
    for (const t of texs) t.dispose();
    scene.clear();
  }

  mostrarVista('todo'); animar(0);
  return {
    scene, pintar, mostrarVista, mostrarParticulas, animar, dispose,
    info: { lineasE: lineas.length, anillos: bd.length / 2, poynting: sl.length, geometrias: geos.size, materiales: mats.size, texturas: texs.size },
    _recursos: { geos, mats, texs },
  };
}

async function cargarLocal() {
  const [T, oc] = await Promise.all([import('./vendor/three/three.module.min.js'), import('./vendor/three/OrbitControls.js')]);
  return { T, OrbitControls: oc.OrbitControls };
}

const h = (etiqueta, props = {}, ...hijos) => {
  const e = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'className') e.className = v;
    else if (k === 'texto') e.textContent = v;
    else e.setAttribute(k, v);
  }
  if (hijos.length) e.append(...hijos);
  return e;
};

// Monta la escena dentro de host. Devuelve {destruir()}. Lanza si no hay WebGL o falta three.
// deps (solo pruebas): {cargar, crearRenderer}.
export async function montarCampo(host, deps = {}) {
  const { T, OrbitControls } = await (deps.cargar ? deps.cargar() : cargarLocal());
  const lienzo = h('canvas', { className: 'campo-lienzo', role: 'img', 'aria-label': TEXTOS.lienzo });
  const renderer = deps.crearRenderer ? deps.crearRenderer(T, lienzo) : new T.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: false, powerPreference: 'low-power' });
  let escena = null, controls = null;
  try {
    escena = construirEscena(T);
    const mqMov = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    const mqOsc = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
    const raiz = document.documentElement;
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.75));
    const camara = new T.PerspectiveCamera(36, 1.33, 0.1, 100);

    /* ---- interfaz ---- */
    const botones = VISTAS.map((v) => h('button', { type: 'button', 'data-vista': v.id, 'aria-pressed': 'false', 'aria-label': v.nombre, title: v.nombre, texto: v.corto }));
    const nombreVista = h('p', { className: 'campo-vista', 'aria-live': 'polite' });
    const bPausa = h('button', { type: 'button', texto: TEXTOS.pausar }), bCentrar = h('button', { type: 'button', texto: TEXTOS.centrar });
    const swatch = (clase, texto) => h('span', { className: 'campo-ley campo-ley-' + clase }, h('i', { 'aria-hidden': 'true' }), texto);
    host.append(
      lienzo,
      h('div', { className: 'campo-vistas', role: 'group', 'aria-label': TEXTOS.vistas }, ...botones),
      nombreVista,
      h('p', { className: 'campo-leyenda' }, swatch('e', TEXTOS.leyenda.e), swatch('b', TEXTOS.leyenda.b), swatch('s', TEXTOS.leyenda.s)),
      h('p', { className: 'campo-nota', texto: TEXTOS.nota }),
      h('div', { className: 'campo-acciones' }, bPausa, bCentrar),
    );

    /* ---- estado y bucle ---- */
    let vista = 'todo', raf = 0, ultimo = 0, sucio = true, pausa = false, visible = true, docVisible = true, muerto = false, movido = false;
    const reducido = () => !!mqMov?.matches;
    const animando = () => !muerto && visible && docVisible && !pausa && !reducido();
    const programar = () => { if (!raf && !muerto && visible && docVisible && (sucio || animando())) raf = requestAnimationFrame(paso); };
    function paso(ahora) {
      raf = 0;
      if (muerto) return;
      const anim = animando(), dt = ultimo ? Math.min(0.1, (ahora - ultimo) / 1000) : 0;
      ultimo = anim ? ahora : 0;
      if (anim) escena.animar(dt);
      controls.update();
      if (anim || sucio) { renderer.render(escena.scene, camara); sucio = false; }
      programar();
    }
    const pedir = () => { sucio = true; programar(); };

    function paleta() {
      const css = (n) => (globalThis.getComputedStyle?.(raiz).getPropertyValue(n) || '').trim();
      const tok = (n, defecto) => css(n) || defecto;
      const fondo = tok('--aulac-superficie2', '#272a2d');
      const hsl = {}; new T.Color(tok('--aulac-fondo', '#171819')).getHSL(hsl);
      return {
        fondo, oscuro: hsl.l < 0.5,
        alto: tok('--aulac-canal1', '#efc183'), bajo: tok('--aulac-canal2', '#9dd6ff'),
        e: tok('--aulac-canal4', '#ffaaaa'), b: tok('--aulac-canal3', '#ccc4ff'), s: tok('--aulac-python', '#9dd6ff'),
      };
    }
    function aplicarPaleta() {
      const p = paleta();
      renderer.setClearColor(new T.Color(p.fondo), 1);
      escena.pintar(p);
      pedir();
    }
    function aplicarMovimiento() {
      controls.enableDamping = !reducido();
      escena.mostrarParticulas(!reducido());
      if (reducido()) bPausa.setAttribute('hidden', ''); else bPausa.removeAttribute('hidden');
      ultimo = 0; pedir();
    }
    function encuadrar() {
      const e = encuadre(vista, camara.aspect);
      const o = new T.Vector3(...e.objetivo);
      camara.position.set(o.x + DIR[0] * e.distancia, o.y + DIR[1] * e.distancia, o.z + DIR[2] * e.distancia);
      controls.target.copy(o); controls.update();
      movido = false; pedir();
    }
    function elegirVista(id) {
      const v = escena.mostrarVista(id);
      vista = v.id;
      botones.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-vista') === vista)));
      nombreVista.textContent = v.nombre;
      lienzo.setAttribute('aria-label', `${TEXTOS.lienzo} ${TEXTOS.vistaActual}: ${v.nombre}.`);
      encuadrar();
    }

    controls = new OrbitControls(camara, lienzo);
    controls.enablePan = false; controls.dampingFactor = 0.07; controls.minDistance = 5; controls.maxDistance = 30; controls.rotateSpeed = 0.7;
    controls.addEventListener('change', pedir);
    controls.addEventListener('start', () => { movido = true; });

    botones.forEach((b) => b.addEventListener('click', () => elegirVista(b.getAttribute('data-vista'))));
    bCentrar.addEventListener('click', () => encuadrar());
    bPausa.addEventListener('click', () => {
      pausa = !pausa; bPausa.textContent = pausa ? TEXTOS.reanudar : TEXTOS.pausar; ultimo = 0; pedir();
    });

    const alRedimensionar = () => {
      const w = lienzo.clientWidth, hh = lienzo.clientHeight;
      if (!w || !hh) return;
      renderer.setSize(w, hh, false);
      camara.aspect = w / hh; camara.updateProjectionMatrix();
      if (!movido) encuadrar(); else pedir();
    };
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(alRedimensionar) : null;
    ro?.observe(lienzo);
    const io = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entradas) => { visible = entradas[entradas.length - 1].isIntersecting; ultimo = 0; if (visible) pedir(); }) : null;
    io?.observe(lienzo);
    const alVisibilidad = () => { docVisible = document.visibilityState !== 'hidden'; ultimo = 0; if (docVisible) pedir(); };
    document.addEventListener('visibilitychange', alVisibilidad);
    const mo = typeof MutationObserver === 'function' ? new MutationObserver(aplicarPaleta) : null;
    mo?.observe(raiz, { attributes: true, attributeFilter: ['data-theme'] });
    mqOsc?.addEventListener?.('change', aplicarPaleta);
    mqMov?.addEventListener?.('change', aplicarMovimiento);

    aplicarPaleta(); aplicarMovimiento(); elegirVista('todo'); alRedimensionar();

    return {
      escena,
      get activo() { return !muerto; },
      destruir() {
        if (muerto) return;
        muerto = true;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        ro?.disconnect(); io?.disconnect(); mo?.disconnect();
        mqOsc?.removeEventListener?.('change', aplicarPaleta);
        mqMov?.removeEventListener?.('change', aplicarMovimiento);
        document.removeEventListener('visibilitychange', alVisibilidad);
        controls.dispose();
        escena.dispose();
        renderer.dispose();
        renderer.forceContextLoss?.();
        host.replaceChildren();
      },
    };
  } catch (e) {
    // Sin fugas si algo falla a medias (p. ej. el contexto WebGL).
    controls?.dispose?.(); escena?.dispose(); renderer.dispose?.(); renderer.forceContextLoss?.();
    throw e;
  }
}
