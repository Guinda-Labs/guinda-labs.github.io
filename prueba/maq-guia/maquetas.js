'use strict';
const d = DATOS, app = document.querySelector('#app'), mode = document.body.dataset.direccion;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Iconos propios: un solo juego de línea, cuadrícula 24, trazo 1.7.
const paths = {arrow:'M5 12h14m-6-6 6 6-6 6',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',school:'m3 9 9-6 9 6M5 10v10h14V10M9 20v-6h6v6',book:'M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-4-2-7-1-10 1',language:'M3 5h12M9 2v3M5 5c0 6 4 10 9 12M13 5C12 11 8 16 3 18M14 21l4-11 4 11m-6-4h4',health:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',sport:'M4 4l16 16M20 4 4 20M3 8l5-5M16 21l5-5M3 16l5 5M16 3l5 5',culture:'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5',route:'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 9v5a4 4 0 0 0 4 4h5'};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.arrow}"/></svg>`;
const arrow = `<span class="arrow">${icon('arrow')}</span>`;
const link = (label, hash, small='') => `<a class="row" href="#${esc(hash)}"><span>${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</span>${arrow}</a>`;
const questionLink = q => link(q.pregunta, `pregunta/${q.id}`);
const stageQs = id => d.preguntas.filter(q => q.etapa === id);
const official = (text, doc, tag='span') => `<${tag} data-oficial="${esc(doc)}">${esc(text)}</${tag}>`;
function inline(text) {
  return esc(String(text || '').replaceAll('{unidad}', 'UPIITA')).replace(/\[\[a:([\w-]+):([\w -]+)\|([^\]]+)\]\]/g, (_, doc, n, label) => `<a class="tag" href="#articulo/${doc}/${encodeURIComponent(n)}">${label}</a>`).replace(/\[\[g:([\w-]+)\|([^\]]+)\]\]/g, (_, id, label) => `<abbr title="${esc(d.glosario[id]?.definicion || '')}">${label}</abbr>`);
}
function source(f) {
  if (!f) return '';
  const doc = d.documentos[f.doc];
  return `<span class="source">${official(doc?.titulo || f.doc, f.doc)}${f.pagina ? ' · p. ' + esc(f.pagina) : ''}${f.articulo ? ' · art. ' + esc(f.articulo) : ''}${f.arts?.length ? ' · arts. ' + f.arts.map(n => `<a href="#articulo/${esc(f.doc)}/${encodeURIComponent(n)}">${esc(n)}</a>`).join(', ') : ''}</span>`;
}
function answer(q, open=false) {
  return `<details ${open ? 'open' : ''}><summary>${esc(q.pregunta)}</summary><div class="answer"><p>${inline(q.respuesta)}</p>${q.pasos?.length ? `<ol>${q.pasos.map(s => `<li>${inline(s)}</li>`).join('')}</ol>` : ''}${(q.fuentes || []).map(source).join('')}${q.formato ? link(q.formato.texto, `formato/${q.id}`, 'Ficha de preparación') : ''}${(q.acudir || []).filter(id => d.acudir.some(a => a.id === id)).map(id => areaLink(d.acudir.find(a => a.id === id))).join('')}</div></details>`;
}
function areaLink(a) {
  return `<a class="row" href="#lugar/${esc(a.id)}"><span>${official(a.nombre || a.id, a.fuente?.doc || 'mo_upiita')}<small>${a.ambito === 'unidad' ? 'UPIITA' : 'IPN'}</small></span>${arrow}</a>`;
}
const back = '<a class="back" href="#">← Guía politécnica</a>';
function tools() {
  return `<h2>Para consultar</h2>${link('Reglas y derechos', 'reglas', Object.values(d.documentos).filter(x => x.reglamento).length + ' documentos')}${link('Planes y programas', 'programas', 'Ingeniería Biónica')}${link('Trámites y formatos', 'tramites')}${link('Actividades y servicios', 'actividades')}`;
}
function homeA() {
  const current = d.etapas.find(s => s.id === '3'), qs = stageQs('3');
  return `<header class="intro"><span class="eyebrow">De ingreso a titulación</span><h1>Tu trayectoria</h1></header><section class="feature"><div><span class="tag">Tu etapa hoy · Ejemplo ficticio</span><h2>${esc(current.nombre)}</h2><p>Prepara tu siguiente periodo.</p><a class="primary" href="#etapa/3">Ver mi etapa ${icon('arrow')}</a></div><aside><span class="eyebrow">Antes de reinscribirte</span>${qs.slice(0, 2).map(questionLink).join('')}</aside></section><nav class="stages" aria-label="Etapas de tu trayectoria">${d.etapas.map((s, i) => `<a class="stage ${s.id === '3' ? 'current' : ''}" ${s.id === '3' ? 'aria-current="step"' : ''} href="#etapa/${s.id}"><b>${i+1 < 10 ? '0' : ''}${i+1}</b><strong>${esc(s.nombre)}</strong><small>${stageQs(s.id).length} preguntas${s.id === '3' ? ' · Estás aquí' : ''}</small></a>`).join('')}</nav><div class="columns"><section><h2>Lo que viene después</h2>${stageQs('7').slice(0, 3).map(questionLink).join('')}</section><section>${tools()}</section></div>`;
}
const topics = [ ['ingreso','Ingreso y primeros pasos',['1']], ['cursar','Cursar y acreditar',['2']], ['inscripcion','Reinscripción y carga',['3']], ['situacion','Adeudos y dictamen',['4','5']], ['cambios','Cambiar de trayectoria',['6']], ['egreso','Servicio social y título',['7']] ];
const topicQs = t => d.preguntas.filter(q => t[2].includes(q.etapa));
function homeB() {
  return `<section class="searchhero"><span class="eyebrow">Guía politécnica</span><h1>¿Qué necesitas?</h1><label class="searchbox">${icon('search')}<input id="buscar" type="search" aria-label="Buscar en la Guía" placeholder="Escribe tu duda"></label><div class="suggestions">${['Reprobé','Dictamen','Servicio social','Correo institucional'].map(x => `<button data-buscar="${esc(x)}">${esc(x)}</button>`).join('')}</div><div id="resultados" aria-live="polite"></div></section><section aria-label="Índice de temas">${topics.map((t,i) => `<article class="editorial"><header><span class="number">0${i+1}</span><h2><a href="#tema/${t[0]}">${t[1]}</a></h2><small>${topicQs(t).length} preguntas</small></header><div>${topicQs(t).slice(0,3).map(questionLink).join('')}${link('Ver el tema completo',`tema/${t[0]}`)}</div></article>`).join('')}</section><div class="columns after-index"><section>${tools()}</section><section><h2>Quién te atiende</h2>${d.acudir.filter(a => a.ambito === 'unidad').slice(0,2).map(areaLink).join('')}</section></div>`;
}
const places = [ ['school','Gestión Escolar','Inscripción, constancias y trayectoria.','lugar/gestion_escolar'], ['library','Biblioteca','Consulta, préstamo y recursos de estudio.','servicio/biblioteca'], ['language','Idiomas','Cursos CELEX y constancias.','actividad/idiomas'], ['health','Salud','Atención y servicios para tu bienestar.','servicio/salud'], ['sport','Deporte','Disciplinas, torneos y espacios deportivos.','actividad/deporte'], ['culture','Cultura','Talleres, actividades y recintos.','actividad/cultura'] ];
function homeC() {
  return `<header class="intro"><span class="eyebrow">Tu unidad y el Instituto</span><h1>Explora el Politécnico</h1></header><section class="campus" aria-label="Lugares y servicios"><div class="place center">${icon('school')}<span class="tag">Empieza por tu unidad</span><h2>UPIITA</h2><p>Encuentra el área que atiende tu necesidad.</p><a class="primary" href="#directorio/unidad">Ver áreas ${icon('arrow')}</a></div>${places.map(([id,title,desc,href]) => `<a class="place ${id}" href="#${href}">${icon(id === 'library' ? 'book' : id)}<h2>${title}</h2><p>${desc}</p>${arrow}</a>`).join('')}</section><div class="columns"><section><span class="eyebrow">Más allá de tu unidad</span><h2>En el IPN</h2>${d.acudir.filter(a => a.ambito === 'ipn' && a.nombre && !a.pendiente).slice(0,3).map(areaLink).join('')}${link('Ver el directorio del IPN','directorio/ipn')}</section><section><h2>Tu vida académica</h2>${link('Preguntas de tu trayectoria','etapa/3')}${link('Reglas y derechos','reglas')}${link('Planes y programas','programas')}</section></div>`;
}
function layout(title, content, side=tools()) {
  return `${back}<h1 tabindex="-1">${esc(title)}</h1><div class="interior"><aside>${side}</aside><section class="reading">${content}</section></div>`;
}
function related(qs) {
  const ids = [...new Set(qs.flatMap(q => q.acudir || []))];
  const areas = ids.map(id => d.acudir.find(a => a.id === id)).filter(Boolean);
  if (!areas.length) areas.push(d.acudir.find(a => a.id === 'gestion_escolar'));
  return `<h2>A quién acudir</h2>${areas.filter(Boolean).map(areaLink).join('')}<h2>Trámites relacionados</h2>${qs.filter(q => q.ventanilla || q.formato || q.apartado === 'tramites').map(questionLink).join('') || '<p class="muted">Sin trámites asociados a estas preguntas.</p>'}<h2>Fuentes</h2>${[...new Set(qs.flatMap(q => (q.fuentes || []).map(f => f.doc)))].filter(id => d.documentos[id]).map(id => `<a class="row" href="#regla/${id}">${official(d.documentos[id].titulo,id)}${arrow}</a>`).join('')}`;
}
function activityCards(items) {
  return items.map((a,i) => `<details><summary>${esc(a.nombre)}</summary><div class="answer"><p>${esc(a.ofrece)}</p><h3>Requisitos</h3><p>${esc(a.requisitos)}</p><h3>Inscripción</h3><p>${esc(a.inscripcion)}</p><p class="muted">${esc(a.donde)}</p><span class="source">Ficha local de actividades · Consulta: ${esc(a.consulta)}</span></div></details>`).join('');
}
function render() {
  if (mode === 'd') searchPoolD = d.preguntas;
  const [type, raw, extra] = location.hash.slice(1).split('/'), id = decodeURIComponent(raw || '');
  let html;
  if (!type) html = mode === 'd' ? homeD() : mode === 'a' ? homeA() : mode === 'b' ? homeB() : homeC();
  else if (mode === 'd' && type === 'modulo') html = moduleD(id);
  else if (mode === 'd' && type === 'etapa') html = stageD(id);
  else if (type === 'etapa' || type === 'tema') {
    const t = topics.find(t => t[0] === id), s = d.etapas.find(s => s.id === id);
    const qs = type === 'etapa' ? stageQs(id) : t ? topicQs(t) : [];
    html = layout(type === 'etapa' ? s?.nombre || 'Etapa' : t?.[1] || 'Tema', `<span class="eyebrow">${qs.length} preguntas</span>${qs.map(q => answer(q)).join('')}`,related(qs));
  } else if (type === 'pregunta' || type === 'formato') {
    const q = d.preguntas.find(q => q.id === id);
    html = q ? layout(type === 'formato' ? q.formato?.texto || 'Preparar trámite' : 'Resuelve tu duda', `${type === 'formato' ? '<p class="muted">Ficha de preparación. La maqueta no envía solicitudes ni descarga formatos.</p>' : ''}${answer(q,true)}`, related([q])) : layout('Pregunta no disponible','<p>Vuelve al índice para elegir otra pregunta.</p>');
  } else if (type === 'lugar') {
    const a = d.acudir.find(a => a.id === id);
    html = a ? layout('Quién te atiende', `<h2>${official(a.nombre || a.id,a.fuente?.doc || 'mo_upiita')}</h2><p>${inline(a.para)}</p>${source(a.fuente)}<h2>Lo que puedes resolver</h2>${d.preguntas.filter(q => q.acudir?.includes(id) || (id === 'gestion_escolar' && q.ventanilla)).slice(0,8).map(q => answer(q)).join('')}<h2>Funciones del área</h2>${(a.funciones || []).slice(0,4).map(f => `<div class="literal">${official(f.texto,f.fuente?.doc || a.fuente?.doc || 'mo_upiita','p')}${source(f.fuente || a.fuente)}</div>`).join('')}`, `<h2>En tu unidad</h2>${d.acudir.filter(a => a.ambito === 'unidad' && a.nombre).slice(0,5).map(areaLink).join('')}`) : layout('Área no disponible','<p>Consulta el directorio de tu unidad.</p>');
  } else if (type === 'directorio') {
    const items = d.acudir.filter(a => a.ambito === id && a.nombre && !a.pendiente);
    html = layout(id === 'unidad' ? 'Áreas de UPIITA' : 'Áreas del IPN',items.map(areaLink).join(''));
  } else if (type === 'actividad' || type === 'actividades' || type === 'servicio') {
    const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const items = d.actividades.filter(a => type === 'actividades' || (type === 'actividad' ? a.categoria === id : norm([a.nombre,a.ofrece,a.donde].join(' ')).includes(id === 'salud' ? 'medic' : id)));
    html = layout(({idiomas:'Idiomas',deporte:'Deporte',cultura:'Cultura',salud:'Salud',biblioteca:'Biblioteca'})[id] || 'Actividades y servicios', activityCards(items) || '<p>No hay fichas locales para este servicio.</p>',`<h2>En UPIITA primero</h2>${link('Áreas de tu unidad','directorio/unidad')}${link('Servicios del IPN','directorio/ipn')}${link('Todas las actividades','actividades')}<p class="muted">${items.length} fichas · Fechas y requisitos según la consulta registrada.</p>`);
  } else if (type === 'reglas') {
    html = layout('Reglas y derechos',Object.entries(d.documentos).filter(([,v]) => v.reglamento).map(([id,v]) => `<a class="row" href="#regla/${id}"><span>${official(v.titulo,id)}<small>${esc(v.resumen)}</small></span>${arrow}</a>`).join(''));
  } else if (type === 'regla' || type === 'articulo') {
    const reg = d.reglamentos[id], meta = d.documentos[id];
    const arts = type === 'articulo' ? (reg?.articulos || []).filter(a => String(a.n) === decodeURIComponent(extra || '')) : (reg?.articulos || []);
    html = layout('Lectura de reglamentos', `<h2>${official(reg?.titulo || meta?.titulo || id,id)}</h2>${arts.length ? arts.map(a => `<details ${type === 'articulo' ? 'open' : ''}><summary>Artículo ${esc(a.n)}</summary><div class="answer literal">${official(a.texto,id,'p')}<span class="source">Artículo ${esc(a.n)} · ${official(meta?.titulo || reg.titulo,id)}</span></div></details>`).join('') : '<p>El repositorio conserva la referencia, sin articulado local disponible.</p>'}`);
  } else if (type === 'tramites') {
    html = layout('Trámites y formatos',d.preguntas.filter(q => q.apartado === 'tramites' || q.formato || q.ventanilla).map(questionLink).join(''));
  } else if (type === 'programas' || type === 'programa') {
    const materias = Array.isArray(d.programas.materias) ? d.programas.materias : Object.values(d.programas.materias || {});
    html = layout('Planes y programas', `<span class="eyebrow">Ingeniería Biónica · UPIITA</span>${materias.map(m => `<details><summary>${official(m.nombre,'programa-bionica')} <small>${esc(m.clave || '')}</small></summary><div class="answer">${m.objetivo ? official(m.objetivo,'programa-bionica','p') : ''}<span class="source">Programa de estudio · ${esc(m.clave || '')}${m.vigencia ? ' · ' + esc(m.vigencia) : ''}</span></div></details>`).join('')}`);
  } else html = layout('Página no disponible', '<p>Vuelve a la Guía para elegir un tema.</p>');
  app.innerHTML = html;
  const input = document.querySelector('#buscar');
  if (input) {
    const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const search = () => {
      const words = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
      const moduleQuestions = document.querySelector('#module-questions');
      if (moduleQuestions) moduleQuestions.hidden = words.length > 0;
      const results = words.length ? (mode === 'd' ? searchPoolD : d.preguntas).filter(q => words.every(w => normalize([q.pregunta,q.respuesta,...(q.palabras || [])].join(' ')).includes(w))) : [];
      document.querySelector('#resultados').innerHTML = !words.length ? '' : `<p class="source">${results.length} resultados</p>${results.length ? results.map(questionLink).join('') : '<p>No encontramos esa consulta. Prueba con otra palabra o elige un tema del índice.</p>'}`;
    };
    input.addEventListener('input',search);
    document.querySelectorAll('[data-buscar]').forEach(b => b.addEventListener('click',() => {input.value = b.dataset.buscar;search();input.focus();}));
  }
  if (type) {window.scrollTo(0,0);app.querySelector('h1')?.focus({preventScroll:true});}
}
let theme = new URLSearchParams(location.search).get('tema') === 'oscuro' ? 'oscuro' : 'claro';
const themeButton = document.querySelector('#tema');
function setTheme(value) {theme = value;document.documentElement.dataset.tema = theme;themeButton.textContent = theme === 'claro' ? 'Tema oscuro' : 'Tema claro';themeButton.setAttribute('aria-pressed',String(theme === 'oscuro'));}
themeButton.addEventListener('click',() => setTheme(theme === 'claro' ? 'oscuro' : 'claro'));
window.addEventListener('message',e => {if(e.source === parent && ['claro','oscuro'].includes(e.data?.tema))setTheme(e.data.tema);});
window.addEventListener('hashchange',render);
setTheme(theme);
render();
