export function cargarFicha(fichas, parte) {
  return fichas?.[parte] || null;
}

export function variantesDe(ficha) {
  return Object.keys(ficha?.variantes || {});
}

export function especificacionesDe(ficha, variante) {
  return ficha?.variantes?.[variante]?.especificaciones || [];
}

export function compararFichas(a, varianteA, b, varianteB) {
  const left = especificacionesDe(a, varianteA), right = especificacionesDe(b, varianteB);
  const keys = [...new Set([...left, ...right].map(x => x.id))];
  return keys.map(id => {
    const x = left.find(v => v.id === id), y = right.find(v => v.id === id);
    return { id, parametro: x?.parametro || y?.parametro, a: x || null, b: y || null,
      condicionesDistintas: !!x && !!y && x.condicion !== y.condicion };
  });
}

export function compatibleConGananciaLazoAbierto(simulada, ficha) {
  const hoja = Number(ficha?.tipico ?? ficha);
  return Number.isFinite(simulada) && Number.isFinite(hoja) && hoja > 0 &&
    simulada >= hoja / 10 && simulada <= hoja * 10;
}

export function curvaModelo(ficha, variante, tipo, puntos = 180) {
  const specs = especificacionesDe(ficha, variante);
  const valor = id => Number(specs.find(x => x.id === id)?.tipico);
  const gbw = valor('gbw') * 1e6, slew = valor('slew');
  if (!(gbw > 0 && slew > 0)) return [];
  return Array.from({ length: puntos }, (_, i) => {
    const t = i / (puntos - 1);
    if (tipo === 'ac') {
      const f = 10 * 10 ** (t * 7), ratio = f / gbw;
      return { x: f, ganancia: 1 / Math.sqrt(1 + ratio ** 2), fase: -Math.atan(ratio) * 180 / Math.PI };
    }
    const time = t * 0.00008, target = 1;
    return { x: time, salida: Math.min(target, slew * time) };
  });
}
