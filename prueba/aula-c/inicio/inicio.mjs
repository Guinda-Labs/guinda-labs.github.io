import { montarBarra } from '../nucleo/barra-aulac.mjs';
import { leerRecientes, fechaRelativa } from './recientes.mjs';
const t = await fetch(new URL('./textos.es.json', import.meta.url)).then(r => { if (!r.ok) throw Error(`textos.es.json: ${r.status}`); return r.json(); });
montarBarra(document.querySelector('[data-barra-aulac]'));
const escapar = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function miniatura(id) {
  const formas = {
    lab:'<path class="a" d="M22 100H56l6-12 12 24 12-24 12 24 6-12H128M128 100H140M140 84V116M150 84V116M150 100H176M176 100V132M164 132H188M22 100V132H176"/><rect class="p" x="196" y="30" width="104" height="104"/><path d="M196 56H300M196 82H300M196 108H300M222 30V134M248 30V134M274 30V134"/><path class="s" d="M198 106Q212 42 226 82T254 82T282 82T298 82"/>',
    documento:'<rect class="p" x="40" y="14" width="240" height="152"/><path class="a" d="M60 36H170M60 54H260M60 64H236M70 132H86L90 124L98 140L102 132H142"/><rect x="60" y="112" width="92" height="40"/><rect x="164" y="112" width="96" height="40"/><text x="96" y="94" font-size="12">H(s) = 1 / (RCs + 1)</text>',
    folio:'<rect class="p" x="20" y="20" width="136" height="140"/><rect class="p" x="172" y="20" width="128" height="140"/><path class="a" d="M190 42H270M190 60H282M190 70H270M190 80H282M200 118H272"/><text x="30" y="60" font-size="11">\\section{Filtro RC}</text><text x="30" y="90" font-size="11">H = 1/(1+sRC)</text>',
    octave:'<rect class="p" x="20" y="16" width="170" height="96"/><path d="M46 16V112"/><rect class="p" x="20" y="120" width="170" height="44"/><rect class="p" x="200" y="16" width="100" height="96"/><path class="s" d="M208 64Q222 22 236 64T264 64T292 64"/><text x="54" y="56" font-size="11">plot(t, sin(t));</text>',
    opamps:'<path class="a" d="M80 30 250 90 80 150Z"/><path d="M25 65H80M25 115H80M250 90H294M55 65V28H270V90"/><text x="98" y="78" font-size="12">+</text><text x="98" y="111" font-size="12">−</text>'
  };
  return `<svg viewBox="0 0 320 180" aria-hidden="true" focusable="false"><g class="l">${formas[id]}</g></svg>`;
}
function head(title, intro, id) { return `<header class="sec-cab"><h2 id="${id}">${escapar(title)}</h2>${intro ? `<p class="tenue">${escapar(intro)}</p>` : ''}</header>`; }
document.querySelector('.cabecera p').textContent = t.portada.descripcion;
const porId = Object.fromEntries(t.componentes.items.map(x => [x.id, x]));
function pintarRecientes() {
  const items = leerRecientes(); const root = document.querySelector('#recientes');
  root.innerHTML = head(t.recientes.titulo, t.recientes.intro, 'titulo-recientes');
  if (!items.length) root.insertAdjacentHTML('beforeend', `<div class="vacio"><h3>${escapar(t.recientes.vacioTitulo)}</h3><p>${escapar(t.recientes.vacioTexto)}</p></div>`);
  else root.insertAdjacentHTML('beforeend', `<ul class="filas">${items.map((x,i) => { const c=porId[x.componente], href=x.url==='./'?`${x.componente}/`:x.url.replace(/^\//,''); return `<li class="fila"><div><h3>${escapar(x.title)}</h3><p class="meta"><span>${escapar(c?.etiqueta||c?.nombre||t.recientes.archivo)}</span>${x.fecha?`<span>${escapar(fechaRelativa(x.fecha,new Date(),t.recientes))}</span>`:''}</p></div>${i===0?`<a class="btn btn--p" href="${escapar(href)}">${escapar(t.recientes.continuar)}</a>`:`<a class="fila-link" href="${escapar(href)}" aria-label="${escapar(t.recientes.abrir)} ${escapar(x.title)}"><svg class="chev" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg></a>`}</li>`; }).join('')}</ul>`);
  root.insertAdjacentHTML('beforeend', `<p class="pie-sec">${escapar(t.recientes.pie)}</p>`);
}
pintarRecientes();
document.querySelector('#componentes-contenido').innerHTML = head(t.componentes.titulo,'','titulo-componentes') + `<ul class="cards">${t.componentes.items.map(x=>`<li class="card"><div class="thumb">${miniatura(x.miniatura)}</div><div class="card-cuerpo"><h3>${escapar(x.nombre)}</h3><p>${escapar(x.corta)}</p>${x.nota?`<p class="nota">${escapar(x.nota)}</p>`:''}</div><a class="card-link" href="${escapar(x.ruta)}" aria-label="${escapar(t.componentes.boton)} ${escapar(x.nombre)}"><svg class="chev" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg></a></li>`).join('')}</ul>`;
document.querySelector('#clases-contenido').innerHTML = head(t.clases.titulo,t.clases.intro,'titulo-clases') + t.clases.items.map(x=>`<article class="clase"><div class="thumb">${miniatura('opamps')}</div><div><h3>${escapar(x.nombre)}</h3><p class="subtitulo">${escapar(x.subtitulo)}</p></div><a class="fila-link" href="${escapar(x.ruta)}" aria-label="${escapar(x.boton)}"><svg class="chev" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg></a></article>`).join('') + `<p class="pie-sec">${escapar(t.clases.pie)}</p>`;
