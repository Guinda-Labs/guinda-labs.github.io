// Adaptadores de motor para simulacion.mjs. Solo lectura sobre ../lab/motor/*:
//  - MNA (JS puro, siempre disponible).
//  - ngspice-web (Worker del lab). En el navegador el Worker importa lab/vendor/eecircuit-engine, que hoy NO está
//    vendorizado en el repositorio: si falta, el worker falla al cargar y se cae a MNA con aviso.
import { MNA } from '../lab/motor/mna.mjs';
import { MotorNgspiceBase, analizarRaw } from '../lab/motor/spice-compartido.mjs';

export const motorMNA = () => ({ nombre: 'MNA', dc: async (comps) => new MNA(comps).dc() });

/** `cliente` es un MotorNgspiceWeb (../lab/motor/ngspice-web.mjs); con `limiteMs` se aborta un arranque colgado. */
export function motorNgspice(cliente, { limiteMs = 20000 } = {}) {
  return {
    nombre: 'ngspice',
    async disponible() {
      let t;
      try { await Promise.race([cliente.iniciar(), new Promise((_, rej) => { t = setTimeout(() => rej(Error('ngspice-web no respondió en ' + limiteMs / 1000 + ' s')), limiteMs); })]); return true; }
      catch (e) { try { cliente.detener(); } catch { /* sin worker */ } this.error = e.message; return false; }
      finally { clearTimeout(t); }
    },
    async dc(comps) {
      const m = new MotorNgspiceBase(comps);
      m.raw = async (cmd) => {
        const r = await cliente.ejecutar({ codigo: m.deck(cmd) });
        if (!r.ok) throw Error(r.error?.mensaje || 'ngspice falló');
        return analizarRaw(new TextDecoder().decode(r.archivos['resultado.raw']));
      };
      return m.dc();
    },
  };
}

/** ngspice si responde; si no, MNA y un aviso que explica por qué. */
export async function elegirMotor(ngspice) {
  if (ngspice && await ngspice.disponible()) return { motor: ngspice, aviso: null };
  return { motor: motorMNA(), aviso: ngspice ? `ngspice-web no disponible (${ngspice.error || 'sin motor'}); se usó MNA` : 'Se usó MNA' };
}
