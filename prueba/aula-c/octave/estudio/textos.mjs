// Mismo subconjunto de TOML que los textos del laboratorio: clave = JSON string.
export function leerTextos(source) {
  return Object.fromEntries(source.split(/\r?\n/).filter(line => /^\S+ = "/.test(line)).map(line => {
    const at = line.indexOf(' = ');
    return [line.slice(0, at), JSON.parse(line.slice(at + 3))];
  }));
}
export function traducir(textos, clave, datos = {}) {
  if (!(clave in textos)) throw Error(clave);
  return textos[clave].replace(/\{(\w+)\}/g, (_, nombre) => datos[nombre] ?? `{${nombre}}`);
}
