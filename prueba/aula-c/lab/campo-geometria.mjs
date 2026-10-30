// Geometría pura de la escena «Campo» (sin three.js ni WebGL): se puede probar en Node.
// Modelo cualitativo de cargas superficiales (ver FISICA-CAMPO.md): E es electrostático y sus líneas no se
// cierran; salen del conductor de potencial alto (naranja, +) y llegan al bajo (azul, −) o a la resistencia.
// Fuente a la izquierda (x = −4), resistencia a la derecha (x = 4). Unidades de la escena, no metros.
export const RMAX = 6;
export const FUENTE = { x: -4, radio: 0.5, mitad: 0.55 };
export const RESISTENCIA = { x: 4, radio: 0.4, mitad: 0.95 };
export const TP = { x: -4, y: 0.7, z: 0 };
export const TN = { x: -4, y: -0.7, z: 0 };

const V = (x, y, z) => ({ x, y, z });
const resta = (a, b) => V(a.x - b.x, a.y - b.y, a.z - b.z);
const suma = (a, b) => V(a.x + b.x, a.y + b.y, a.z + b.z);
const por = (a, k) => V(a.x * k, a.y * k, a.z * k);
const largo = (a) => Math.hypot(a.x, a.y, a.z);
export const distancia = (a, b) => largo(resta(a, b));
const unitario = (a) => { const l = largo(a) || 1; return por(a, 1 / l); };
const mezcla = (a, b, t) => V(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);

// Esquinas redondeadas con curvas cuadráticas.
function redondear(pts, r) {
  const salida = [{ ...pts[0] }];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const d1 = unitario(resta(b, a)), d2 = unitario(resta(c, b));
    const p0 = resta(b, por(d1, r)), p2 = suma(b, por(d2, r));
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      salida.push(suma(suma(por(p0, (1 - t) * (1 - t)), por(b, 2 * t * (1 - t))), por(p2, t * t)));
    }
  }
  salida.push({ ...pts[pts.length - 1] });
  return salida;
}

// Remuestreo a paso casi fijo.
function remuestrear(pts, h) {
  const salida = [{ ...pts[0] }];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.round(distancia(a, b) / h));
    for (let k = 1; k <= n; k++) salida.push(mezcla(a, b, k / n));
  }
  return salida;
}

let _trayectoria = null;
// Conductor superior (alto), inferior (bajo) y resistencia (de arriba abajo).
export function trayectoria() {
  if (_trayectoria) return _trayectoria;
  const arriba = remuestrear(redondear([V(-4, 0.62, 0), V(-4, 2, 0), V(4, 2, 0), V(4, 0.95, 0)], 0.5), 0.12);
  const abajo = remuestrear(redondear([V(4, -0.95, 0), V(4, -2, 0), V(-4, -2, 0), V(-4, -0.62, 0)], 0.5), 0.12);
  const resistencia = [];
  for (let i = 0; i <= 16; i++) resistencia.push(V(4, 0.95 - (1.9 * i) / 16, 0));
  return (_trayectoria = { arriba, abajo, resistencia });
}

let _cargas = null;
// Cargas puntuales que solo sirven para estimar |E| (color y velocidad de las partículas). No integran nada.
function cargas() {
  if (_cargas) return _cargas;
  const { arriba, abajo, resistencia } = trayectoria();
  const Q = [];
  const tramo = (pts, f0, f1) => pts.forEach((p, i) => {
    if (i % 2 === 0) Q.push({ ...p, q: 0.09 * (f0 + ((f1 - f0) * i) / (pts.length - 1)) });
  });
  tramo(arriba, 1, 1); tramo(resistencia, 1, -1); tramo(abajo, -1, -1);
  for (let a = 0; a < 6; a++) {
    const ang = (a / 6) * Math.PI * 2, rx = Math.cos(ang) * 0.35, rz = Math.sin(ang) * 0.35;
    Q.push({ x: TP.x + rx, y: TP.y, z: TP.z + rz, q: 0.75 });
    Q.push({ x: TN.x + rx, y: TN.y, z: TN.z + rz, q: -0.75 });
  }
  return (_cargas = Q);
}

// |E| relativo en un punto (sin unidades).
export function magnitudE(p) {
  let ex = 0, ey = 0, ez = 0;
  for (const c of cargas()) {
    const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z, d2 = dx * dx + dy * dy + dz * dz + 0.06;
    const k = c.q / (d2 * Math.sqrt(d2));
    ex += k * dx; ey += k * dy; ez += k * dz;
  }
  return Math.hypot(ex, ey, ez);
}

// Muestrea la curva paramétrica fn(t), t∈[0,1], a paso fijo y anota |E| en cada punto.
function remuestrearLinea(fn) {
  const ds = 0.07, N = 400, fino = [];
  for (let i = 0; i <= N; i++) fino.push(fn(i / N));
  const pts = [fino[0]];
  let acc = 0;
  for (let i = 1; i < fino.length; i++) {
    acc += distancia(fino[i], fino[i - 1]);
    if (acc >= ds) { pts.push(fino[i]); acc = 0; }
  }
  if (distancia(pts[pts.length - 1], fino[N]) > ds / 2) pts.push(fino[N]);
  return { pts, mags: pts.map(magnitudE) };
}

const bezier = (P, t) => {
  const u = 1 - t, b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  let r = 0, y = 0;
  for (let i = 0; i < 4; i++) { r += b[i] * P[i][0]; y += b[i] * P[i][1]; }
  return [r, y];
};

// 18 arcos de dipolo del borne + al borne −, en planos que contienen el eje de la pila.
function arcosDipolo() {
  const salida = [], ra = 0.2, ya = 0.74, TAM = [[0.5, 1.2, 1], [0.9, 1.4, 0.8], [1.25, 1.4, 0.6]];
  TAM.forEach(([h, kx, ky], s) => {
    for (let k = 0; k < 6; k++) {
      const ph = (k + 0.5 * (s % 2)) * Math.PI / 3, cs = Math.cos(ph), sn = Math.sin(ph);
      const P = [[ra, ya], [ra + kx * h, ya + ky * h], [ra + kx * h, -ya - ky * h], [ra, -ya]];
      salida.push({ familia: 'dipolo', ...remuestrearLinea((t) => { const [r, y] = bezier(P, t); return V(TP.x + r * cs, y, r * sn); }) });
    }
  });
  return salida;
}

// 14 entre cables, 6 por fuera, 8 en la resistencia. Sin anillos dentro del cable.
function lineasCable() {
  const salida = [], yt = 1.91, yb = -1.91;
  for (let i = 0; i < 9; i++) {
    const x = -3.2 + (6.4 * i) / 8;
    (i % 2 ? [0] : [-0.2, 0.2]).forEach((z) => salida.push({
      familia: 'cable',
      ...remuestrearLinea((t) => V(x * (1 + 0.04 * Math.sin(Math.PI * t)), yt + (yb - yt) * t, z)),
    }));
  }
  [-2.4, 0, 2.4].forEach((x) => [-1, 1].forEach((sd) => {
    const P = [[0, 2.09], [sd * 1.1, 2.55], [sd * 1.1, -2.55], [0, -2.09]];
    salida.push({ familia: 'externa', ...remuestrearLinea((t) => { const [z, y] = bezier(P, t); return V(x, y, z); }) });
  }));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    salida.push({
      familia: 'resistencia',
      ...remuestrearLinea((t) => { const r = 0.42 + 0.2 * Math.sin(Math.PI * t); return V(4 + r * Math.cos(a), 0.95 - 1.9 * t, r * Math.sin(a)); }),
    });
  }
  return salida;
}

let _lineas = null;
// Las 46 líneas de E, todas orientadas de naranja (+) a azul (−): [{familia, pts, mags}].
export function lineasE() {
  return (_lineas ||= [...arcosDipolo(), ...lineasCable()]);
}

// Posiciones de los anillos de B (regla de la mano derecha respecto al sentido de la corriente convencional).
export function anillosB() {
  const { arriba, abajo } = trayectoria(), salida = [];
  for (const pts of [arriba, abajo]) {
    const paso = Math.max(4, Math.round(pts.length / 6));
    for (let i = Math.floor(paso / 2); i < pts.length; i += paso) {
      const c = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], u = unitario(resta(b, a));
      if (Math.abs(u.y) < 0.01 && Math.abs(u.x) < 0.01) continue;
      salida.push({ c, u });
    }
  }
  return salida;
}

// 14 líneas de Poynting de la fuente a la resistencia por el espacio: puntos de control de cada curva.
export function lineasPoynting() {
  const salida = [], N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, zs = Math.sin(a), ys = Math.cos(a);
    salida.push([
      V(-3.52, 0.4 * ys, 0.46 * zs), V(-1.6, 1.1 * ys + 0.2, 1.3 * zs * 1.6),
      V(1.6, 1.1 * ys + 0.1, 1.3 * zs * 1.6), V(3.58, 0.75 * ys, 0.42 * zs),
    ]);
  }
  return salida;
}

// Comprobaciones de FISICA-CAMPO.md reunidas para las pruebas y para validar la escena al construirla.
export function resumenLineas() {
  const { arriba, abajo } = trayectoria(), dMin = (p, set) => Math.min(...set.map((q) => distancia(p, q)));
  const ls = lineasE();
  return ls.map((l) => {
    const ini = l.pts[0], fin = l.pts[l.pts.length - 1];
    return {
      familia: l.familia,
      cierre: distancia(ini, fin),
      iniNaranja: dMin(ini, arriba), iniAzul: dMin(ini, abajo),
      finNaranja: dMin(fin, arriba), finAzul: dMin(fin, abajo),
      radioMax: Math.max(...l.pts.map((p) => largo(p))),
    };
  });
}

// ¿Está el punto dentro de la fuente (cilindro vertical) o de la resistencia?
export function dentroDeCuerpo(p) {
  const rF = Math.hypot(p.x - FUENTE.x, p.z), rR = Math.hypot(p.x - RESISTENCIA.x, p.z);
  return (rF < FUENTE.radio && Math.abs(p.y) < FUENTE.mitad) || (rR < RESISTENCIA.radio && Math.abs(p.y) < RESISTENCIA.mitad);
}
