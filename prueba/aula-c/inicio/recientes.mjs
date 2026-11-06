const componentes = ['lab','documento','folio','octave'];
function normalizar(items) {
  if (!Array.isArray(items)) return [];
  return items.map(x => {
    if (!x || typeof x.title !== 'string' || typeof x.url !== 'string') return null;
    const path = x.url.split(/[?#]/)[0];
    const componente = componentes.includes(x.componente) ? x.componente : componentes.find(id => path.includes(`/${id}/`) || path.startsWith(`${id}/`)) || 'lab';
    const fecha = typeof x.fecha === 'string' && Number.isFinite(Date.parse(x.fecha)) ? x.fecha : null;
    return { title:x.title, url:x.url, componente, fecha };
  }).filter(Boolean).sort((a,b) => (Date.parse(b.fecha || 0) || 0) - (Date.parse(a.fecha || 0) || 0)).slice(0,5);
}
export function leerRecientes(storage) { try { const store=storage ?? globalThis.localStorage; return normalizar(JSON.parse(store.getItem('aulac-recientes') || '[]')); } catch { return []; } }
export function fechaRelativa(fecha, ahora = new Date(), textos = {}) {
  if (!fecha || !Number.isFinite(Date.parse(fecha))) return '';
  const horas = Math.max(0, Math.floor((ahora - new Date(fecha)) / 3600000));
  if (horas < 1) return textos.menosDeUnaHora || '';
  if (horas < 24) return (textos.horas || '').replace('{n}',horas);
  const dias = Math.floor(horas / 24);
  if (dias === 1) return textos.ayer || '';
  if (dias < 7) return (textos.dias || '').replace('{n}',dias);
  return new Intl.DateTimeFormat('es-MX', textos.fecha || { dateStyle:'medium' }).format(new Date(fecha));
}
