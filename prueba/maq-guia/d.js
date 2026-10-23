'use strict';
// Estado ficticio solo en memoria. perfil=sin permite revisar la portada sin etapa.
const perfilD = new URLSearchParams(location.search).get('perfil') !== 'sin';
let searchPoolD;
function iconD(name) {
  const paths = {
    office:'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M8 9h1m6 0h1m-8 3h1m6 0h1',
    library:'M3 21h18M5 18V5l3-2 3 2v13m2 0V5l3-2 3 2v13M7 8h2m6 0h2',
    campus:'M3 21h18M5 21V8l7-5 7 5v13M9 21v-7h6v7M8 10h1m6 0h1',
    gavel:'m14 7 3-3 6 6-3 3M3 21h12M8 17l9-9M5 14l5 5m2-13 5 5',
    program:'M4 3h12l4 4v14H4zM16 3v5h4M8 12h8M8 16h8',
    forms:'M6 4h12v17H6zM9 4V2h6v2M9 10h6m-6 4h6m-6 4h4'
  };
  return paths[name] ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>` : icon(name);
}
function searchD(label, chips = []) {
  return `<label class="searchbox">${icon('search')}<input id="buscar" type="search" aria-label="${esc(label)}" placeholder="${esc(label)}"></label>${chips.length ? `<div class="suggestions">${chips.map(x => `<button data-buscar="${esc(x)}">${esc(x)}</button>`).join('')}</div>` : ''}<div id="resultados" aria-live="polite"></div>`;
}
function homeD() {
  const areas = d.acudir.filter(a => a.ambito === 'unidad' && a.nombre && !a.pendiente);
  const gestion = d.acudir.find(a => a.id === 'gestion_escolar');
  const tramites = d.preguntas.filter(q => q.apartado === 'tramites' || q.formato || q.ventanilla).length;
  const materias = Array.isArray(d.programas.materias) ? d.programas.materias : Object.values(d.programas.materias || {});
  const modules = [
    ['office','Gestión Escolar','modulo/gestion',d.preguntas.filter(q => q.acudir?.includes('gestion_escolar') || q.ventanilla).length,'preguntas'],
    ['route','Situación escolar y dictamen','modulo/situacion',topicQs(topics[3]).length,'preguntas'],
    ['library','Biblioteca','servicio/biblioteca',d.actividades.filter(a => /biblioteca/i.test([a.nombre,a.ofrece,a.donde].join(' '))).length,'fichas'],
    ['language','Idiomas','actividad/idiomas',d.actividades.filter(a => a.categoria === 'idiomas').length,'actividades'],
    ['campus','UPIITA','directorio/unidad',areas.length,'áreas'],
    ['health','Salud','servicio/salud',d.actividades.filter(a => /medic/i.test([a.nombre,a.ofrece,a.donde].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,''))).length,'fichas'],
    ['sport','Deporte','actividad/deporte',d.actividades.filter(a => a.categoria === 'deporte').length,'actividades'],
    ['culture','Cultura','actividad/cultura',d.actividades.filter(a => a.categoria === 'cultura').length,'actividades'],
    ['gavel','Reglas y derechos','reglas',Object.values(d.documentos).filter(x => x.reglamento).length,'documentos'],
    ['program','Programas de estudio','programas',materias.length,'programas'],
    ['forms','Trámites y formatos','tramites',tramites,'trámites']
  ];
  return `<header class="intro"><h1>Servicios y vida académica</h1></header>${searchD('Buscar en la Guía',perfilD ? ['Reinscripción','Carga','Adeudos','Dictamen'] : ['Inscripción','Biblioteca','Servicio social'])}${perfilD ? '<a class="stage-strip" href="#etapa/3">Tu etapa: Reinscripción <span>· Ver lo que te toca ›</span></a>' : ''}<section class="mosaic" aria-label="Servicios y temas">${modules.map(([i,title,href,n,unit]) => `<a class="module ${i === 'campus' ? 'unit' : ''}" href="#${href}">${iconD(i)}<h2>${esc(title)}</h2><strong class="count">${n} ${unit}</strong></a>`).join('')}</section>`;
}
function moduleD(id) {
  const gestion = id === 'gestion';
  const qs = gestion ? d.preguntas.filter(q => q.acudir?.includes('gestion_escolar') || q.ventanilla) : topicQs(topics[3]);
  searchPoolD = qs;
  const area = d.acudir.find(a => a.id === 'gestion_escolar');
  return `${back}<header class="module-heading">${iconD(gestion ? 'office' : 'route')}<h1 tabindex="-1">${gestion ? official(area.nombre,area.fuente?.doc || 'mo_upiita') : 'Situación escolar y dictamen'}</h1></header>${searchD('Buscar en este módulo')}<section id="module-questions" aria-label="Preguntas del módulo"><h2 class="section-title">${qs.length} preguntas</h2>${qs.map(questionLink).join('')}</section><div class="module-related"><section><h2>A quién acudir</h2>${[...new Set(qs.flatMap(q => q.acudir || []))].map(id => d.acudir.find(a => a.id === id)).filter(Boolean).map(areaLink).join('') || (area ? areaLink(area) : '')}</section><section><h2>Formatos relacionados</h2>${qs.filter(q => q.formato).map(q => link(q.formato.texto,`formato/${q.id}`)).join('') || '<p class="muted">Sin formatos asociados en los datos locales.</p>'}</section></div>`;
}
function stageD(id) {
  return `${back}<header class="module-heading">${icon('route')}<h1 tabindex="-1">Tu trayectoria académica</h1></header><nav class="stage-line" aria-label="Etapas de tu trayectoria">${d.etapas.map((s,i) => `<a class="stage ${s.id === id ? 'current' : ''}" ${s.id === id ? 'aria-current="step"' : ''} href="#etapa/${s.id}"><b>${i+1}</b><strong>${esc(s.nombre)}</strong><small>${stageQs(s.id).length} preguntas</small></a>`).join('')}</nav><h2>${esc(d.etapas.find(s => s.id === id)?.nombre || 'Etapa')}</h2>${stageQs(id).map(questionLink).join('')}`;
}
