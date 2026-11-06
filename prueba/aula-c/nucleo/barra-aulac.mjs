const textos = await fetch(new URL('../inicio/textos.es.json', import.meta.url)).then(r => r.json());
const links = [['lab', textos.barra.laboratorio, 'lab/'], ['documento', textos.barra.documento, 'documento/'], ['folio', textos.barra.folio, 'folio/'], ['octave', textos.barra.octave, 'octave/'], ['clases', textos.barra.clases, '#clases']];
export function montarBarra(host) {
  const activo = host.dataset.componente || 'inicio';
  const marca = `<a class="bar-marca" href="./" aria-label="${textos.barra.inicio}"${activo === 'inicio' ? ' aria-current="page"' : ''}>AULA-C</a>`;
  const enlace = ([id, nombre, url]) => `<a href="${url}"${activo === id ? ' aria-current="page"' : ''}>${nombre}</a>`;
  host.innerHTML = `<header class="bar-host"><div class="bar" data-barra>${marca}<nav class="bar-nav" aria-label="${textos.barra.aria}">${links.map(enlace).join('')}</nav><span class="bar-actual">${links.find(x => x[0] === activo)?.[1] || ''}</span><details class="bar-menu"><summary aria-label="${textos.barra.menu}">${textos.barra.menu}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg></summary><nav class="bar-panel" aria-label="${textos.barra.aria}">${links.map(enlace).join('')}</nav></details><label class="tema"><span class="tx">${textos.barra.tema}</span><select aria-label="${textos.barra.temaAria}"><option value="sistema">${textos.barra.sistema}</option><option value="light">${textos.barra.claro}</option><option value="dark">${textos.barra.oscuro}</option></select></label></div></header>`;
  const details = host.querySelector('details');
  details.addEventListener('keydown', e => { if (e.key === 'Escape') { details.open = false; details.querySelector('summary').focus(); } });
  document.addEventListener('click', e => { if (!details.contains(e.target)) details.open = false; });
  const selector = host.querySelector('select');
  let tema = 'sistema';
  try { tema = localStorage.getItem('aulac-theme') || 'sistema'; } catch {}
  selector.value = ['sistema', 'light', 'dark'].includes(tema) ? tema : 'sistema';
  function aplicar(valor) { if (valor === 'sistema') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = valor; }
  aplicar(selector.value);
  selector.addEventListener('change', () => { aplicar(selector.value); try { localStorage.setItem('aulac-theme', selector.value); } catch {} });
}
