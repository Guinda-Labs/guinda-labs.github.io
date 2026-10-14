/* Cupos: lectura de ocupabilidad y funciones compartidas con SATE. */
(function(raiz){
  'use strict';
  const origenSaes=o=>/^https:\/\/(www\.)?saes\.[a-z0-9]+\.ipn\.mx$/.test(o);
  const origenSate=(o,url)=>!!url&&o===new URL(url).origin;
  const clave=f=>f.grupo+'|'+f.materia;
  function parsear(doc){
    if(doc.querySelector('input[type="password"]'))throw new Error('sesion');
    const tabla=doc.querySelector('#ctl00_mainCopy_GrvOcupabilidad');
    if(!tabla)throw new Error('vacia');
    const rows=[...tabla.querySelectorAll('tr')];
    const normal=s=>s.trim().replace(/\s+/g,' ').toLowerCase();
    const headers=['grupo','materia','nombre de la materia','semestre','cupo','inscritos','disponibles'];
    if(!rows.length||[...rows[0].children].map(c=>normal(c.textContent)).join('|')!==headers.join('|'))throw new Error('columnas');
    const filas=rows.slice(1).filter(r=>r.children.length===7).map(r=>{
      const c=[...r.children].map(x=>x.textContent.trim());
      if(!c.slice(4).every(x=>/^\d+$/.test(x)))throw new Error('numeros');
      return {grupo:c[0],materia:c[1],nombre:c[2],nivel:c[3],cupo:+c[4],inscritos:+c[5],disponibles:+c[6]};
    });
    if(!filas.length)throw new Error('vacia');
    if(rows.slice(1).some(r=>r.children.length!==7))throw new Error('columnas');
    return filas;
  }
  function validar(d){
    return d?.tipo==='ipnt.cupos.datos'&&d.v===1&&typeof d.unidad==='string'&&/^[a-z0-9]+$/.test(d.unidad)&&
      typeof d.carrera==='string'&&d.carrera.length<=40&&typeof d.plan==='string'&&d.plan.length<=40&&typeof d.hora==='string'&&Number.isFinite(Date.parse(d.hora))&&
      Date.parse(d.hora)<=Date.now()+60000&&Array.isArray(d.filas)&&d.filas.length<=5000&&d.filas.every(f=>
        f&&typeof f.grupo==='string'&&f.grupo.length<=40&&typeof f.materia==='string'&&f.materia.length<=40&&
        ['cupo','inscritos','disponibles'].every(k=>Number.isSafeInteger(f[k])&&f[k]>=0));
  }
  const antigua=d=>!d||Date.now()-Date.parse(d.hora)>3600000;
  const limpiar=d=>({tipo:'ipnt.cupos.datos',v:1,unidad:d.unidad,carrera:d.carrera,plan:d.plan,hora:d.hora,
    filas:d.filas.map(({grupo,materia,cupo,inscritos,disponibles})=>({grupo,materia,cupo,inscritos,disponibles}))});
  const reciente=(a,b)=>validar(b)&&(!validar(a)||Date.parse(b.hora)>Date.parse(a.hora))?b:a;
  const fecha=d=>new Date(d.hora).toLocaleString('es-MX',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  function cambios(antes,despues,grupos){
    if(!antes||antes.carrera!==despues.carrera||antes.plan!==despues.plan)return [];
    const prev=new Map(antes.filas.map(f=>[clave(f),f.disponibles])),propios=new Set(grupos.map(clave));
    return despues.filas.filter(f=>{const a=prev.get(clave(f)),n=f.disponibles;
      return propios.has(clave(f))&&a!==undefined&&a!==n&&(a===0&&n>0||n===0||n<=3);
    });
  }
  function tarjetas(datos,seleccion,oferta){return seleccion.map(s=>({...s,fila:datos.filas.find(f=>clave(f)===clave(s)),alternativas:datos.filas.filter(f=>f.materia===s.materia&&f.grupo!==s.grupo&&f.disponibles>0).map(f=>{
    const o=oferta.find(o=>clave(o)===clave(f));
    return {...f,choque:!o?null:seleccion.some(t=>t.materia!==s.materia&&t.horas.some(a=>o.horas.some(b=>a[0]===b[0]&&a[1]<b[2]&&b[1]<a[2])))};
  })}))}
  async function consultar({fetch:pedir,parser,url,carrera,plan,opciones}){
    async function leer(body){
      let r;
      try{r=await pedir(url,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',redirect:'manual',
        ...(body?{headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()}:{})})}
      catch(e){throw Object.assign(new Error('red'),{etapa:body?.get('__EVENTTARGET')||'GET'})}
      if(r.type==='opaqueredirect'||r.status>=300&&r.status<400)throw Object.assign(new Error('sesion'),{etapa:body?.get('__EVENTTARGET')||'GET',estado:r.status});
      if(new URL(r.url||url).origin!==new URL(url).origin||!/\/Academica\/Ocupabilidad_grupos\.aspx$/i.test(new URL(r.url||url).pathname))throw new Error('sesion');
      if(!r.ok)throw Object.assign(new Error('http'),{etapa:body?.get('__EVENTTARGET')||'GET',estado:r.status});
      const doc=parser(await r.text());if(doc.querySelector('input[type="password"]'))throw new Error('sesion');return doc;
    }
    let doc=await leer();
    const select=id=>doc.querySelector('[name="ctl00$mainCopy$'+id+'"]');
    async function post(target,val){
      const body=new URLSearchParams();
      for(const el of doc.querySelectorAll('input[type="hidden"],select'))if(el.name&&!el.disabled)body.set(el.name,el.value);
      body.set('ctl00$mainCopy$rblEsquema','1');body.set('__EVENTTARGET','ctl00$mainCopy$'+target);body.set('__EVENTARGUMENT','');body.set('__LASTFOCUS','');
      if(target!=='rblEsquema$0')body.set('ctl00$mainCopy$'+target,val);doc=await leer(body);
    }
    // El SAES muestra carrera y plan solo después de elegir «Periodo Escolar Actual» (verificado con sesión real, 2026-10-14).
    await post('rblEsquema$0','1');
    if(!select('dpdcarrera')||!select('dpdplan'))throw new Error('sesion');
    if(['Chkespecialidad','ChkSemestre','Chkgrupo','Chkmateria'].some(k=>doc.querySelector('[name="ctl00$mainCopy$'+k+'"]:checked')))await post('dpdcarrera',select('dpdcarrera').value);
    carrera=carrera||select('dpdcarrera').value;
    if(![...select('dpdcarrera').options].some(o=>o.value===carrera))throw new Error('seleccion');
    await post('dpdcarrera',carrera);
    const planes=[...select('dpdplan').options];
    if(plan&&!planes.some(o=>o.value===plan)){opciones(doc);throw new Error('plan')}
    plan=plan||select('dpdplan').value;
    if(select('dpdplan').value!==plan)await post('dpdplan',plan);
    opciones(doc);
    if(select('dpdcarrera').value!==carrera||select('dpdplan').value!==plan||!doc.querySelector('[name="ctl00$mainCopy$rblEsquema"][value="1"]:checked'))throw new Error('seleccion');
    return {carrera,plan,filas:parsear(doc)};
  }
  raiz.IPNCupos={origenSaes,origenSate,clave,parsear,validar,limpiar,antigua,reciente,fecha,tarjetas,consultar,cambios};
})(typeof window==='undefined'?globalThis:window);

/*__CUPOS_PANEL__*/
(function(){
  'use strict';
  const URL_SATE="https://guinda-labs.github.io/prueba/sate/cupos.html",textos={"sate.cupos.auto": "Actualizar cada minuto", "sate.cupos.sonido": "Sonido", "sate.cupos.notificacion": "Notificación", "sate.cupos.auto_activa": "Consulta automática activa durante 30 min. Para permitir notificaciones, usa la ventana de SATE.", "sate.cupos.auto_pausa": "Consulta automática en pausa mientras esta pestaña está oculta.", "sate.cupos.auto_fin": "Terminó la consulta automática de 30 min. Puedes continuar cuando lo necesites.", "sate.cupos.auto_apagada": "Consulta automática desactivada.", "sate.cupos.seguir": "Seguir 30 min más", "sate.cupos.aviso": "{materia} · {grupo} ahora tiene {n} lugares", "sate.cupos.titulo_avisos": "({n}) Cupos", "sate.cupos.permitir": "Permitir notificaciones", "sate.cupos.permiso_listo": "Notificaciones permitidas.", "sate.cupos.permiso_panel": "Las notificaciones no están permitidas o no están disponibles. Los cambios seguirán apareciendo en el panel; el sonido depende de tu casilla Sonido.", "sate.cupos.titulo": "Cupos", "sate.cupos.cerrar": "Cerrar Cupos", "sate.cupos.carrera": "Carrera", "sate.cupos.plan": "Plan", "sate.cupos.grupo": "Grupo", "sate.cupos.materia": "Materia", "sate.cupos.cupo": "Cupo", "sate.cupos.inscritos": "Inscritos", "sate.cupos.disponibles": "Disponibles", "sate.cupos.cambio": "Cambio", "sate.cupos.actualizar": "Actualizar", "sate.cupos.abrir_sate": "Ver en SATE", "sate.cupos.consultar": "Consultar cupos", "sate.cupos.filtro": "Filtrar materia o grupo", "sate.cupos.elegidos": "Grupos elegidos en SATE", "sate.cupos.todos": "Disponibilidad de los grupos", "sate.cupos.sin_coincidencias": "No hay grupos que coincidan con la selección o el filtro.", "sate.cupos.lleno": "Lleno", "sate.cupos.lugares": "{n} lugares", "sate.cupos.hace": "hace {n} min", "sate.cupos.sin_actualizar": "sin actualizar", "sate.cupos.omitir": "Omitir grupos llenos", "sate.cupos.ayuda": "Abre el SAES › Académica › Ocupabilidad Horario y pulsa el marcador Cupos. Para instalarlo, arrastra «Cupos» a la barra de marcadores. En su panel, pulsa «Consultar cupos».", "sate.cupos.limites": "Solo lectura del periodo actual. Los lugares pueden cambiar antes de tu reinscripción. Puedes consultar una vez por minuto.", "sate.cupos.inicio": "Elige carrera y plan y pulsa «Consultar cupos».", "sate.cupos.consultando": "Consultando disponibilidad…", "sate.cupos.ultima": "Última consulta: {hora}", "sate.cupos.antigua": "Consulta antigua", "sate.cupos.antigua_ayuda": "Pasó más de una hora: «Omitir grupos llenos» queda desmarcada. Actualiza la consulta antes de usar ese filtro.", "sate.cupos.dejar_abierta": "Puedes dejar esta ventana abierta mientras consultas cupos", "sate.cupos.grupos": "{n} grupos", "sate.cupos.esperando": "Esperando tu consulta desde el marcador Cupos.", "sate.cupos.esperar": "Espera al menos 60 s entre consultas.", "sate.cupos.nube_guardada": "Consulta guardada en OneDrive.", "sate.cupos.error_nube": "La consulta está en este navegador. No se pudo sincronizar con OneDrive; vuelve a sincronizar tu cuenta.", "sate.cupos.horario_lleno": "Tu horario tiene grupos llenos según la última consulta.", "sate.cupos.alternativas": "Buscar alternativas con lugar", "sate.cupos.tu_horario": "Tu horario", "sate.cupos.tu_grupo": "Tu grupo", "sate.cupos.nivel": "Nivel", "sate.cupos.todos_niveles": "Todos", "sate.cupos.orden": "Orden por lugares", "sate.cupos.orden_mas": "Más lugares primero", "sate.cupos.orden_menos": "Menos lugares primero", "sate.cupos.sin_dato": "Sin dato en esta consulta", "sate.cupos.sin_horas": "Sin horario para comprobar choques", "sate.cupos.con_choque": "Choca con tu horario", "sate.cupos.sin_choque": "Sin choque con tu horario", "sate.cupos.solo_saes": "Ejecuta Cupos dentro del SAES de tu unidad académica, con tu sesión iniciada.", "sate.cupos.ventana": "El navegador bloqueó la receptora. Permite abrir ventanas y vuelve a pulsar «Consultar cupos».", "sate.cupos.sin_sitio": "Esta construcción no tiene una dirección de SATE configurada. Cupos funciona aquí; configura UPIITA_SITE para habilitar el puente.", "sate.cupos.error_sesion": "Tu sesión del SAES venció o la página volvió al inicio de sesión. Inicia sesión por tu cuenta y vuelve a ejecutar Cupos.", "sate.cupos.error_vacia": "El SAES no muestra grupos para esta consulta. Revisa carrera y plan y vuelve a actualizar.", "sate.cupos.error_columnas": "La tabla del SAES tiene columnas distintas. No se interpretaron los cupos; informa este cambio para revisar el marcador.", "sate.cupos.error_numeros": "La tabla contiene valores de cupo no válidos. No se actualizaron los datos.", "sate.cupos.error_http": "El SAES no pudo responder la consulta. Vuelve a pulsar «Actualizar».", "sate.cupos.error_seleccion": "El SAES no confirmó la carrera o el plan elegidos. Revisa los selectores y vuelve a consultar.", "sate.cupos.error_plan": "El plan elegido no corresponde a esta carrera. Se cargaron sus planes; elige uno y vuelve a actualizar.", "sate.cupos.error_red": "No se pudo consultar el SAES. Revisa tu conexión y vuelve a pulsar «Actualizar»."};
  const C=window.IPNCupos,tx=(k,v={})=>(textos['sate.cupos.'+k]||k).replace(/\{(\w+)\}/g,(_,k)=>v[k]??''),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(!C.origenSaes(location.origin)){alert(tx('solo_saes'));return}
  if(document.getElementById('ipnt-cupos')){document.getElementById('ipnt-cupos').focus();return}
  const unidad=location.hostname.match(/saes\.([a-z0-9]+)\.ipn\.mx$/)[1],origin=URL_SATE?new URL(URL_SATE).origin:null;
  let sate=null,seleccion=[],oferta=[],datos=null,anterior=new Map(),busy=false,destruido=false,ultima=window.IPNCuposUltimaConsulta??null,conexion=null;
  const originales=new Map();
  const titulo=document.title;
  let automatico=false,hasta=0,reloj=null,audio=null,avisos=0;
  const panel=document.createElement('section');panel.id='ipnt-cupos';panel.tabIndex=-1;panel.setAttribute('aria-label',tx('titulo'));
  const estilo=document.createElement('style');estilo.id='ipnt-cupos-estilo';estilo.textContent=`
  #ipnt-cupos{--ipn-texto:#29252b;--ipn-superficie:#fff;--ipn-linea:#ded8dc;--ipn-acento:#71334c;position:fixed;z-index:2147483646;right:12px;bottom:12px;width:min(620px,calc(100vw - 24px));max-height:85vh;overflow:auto;background:var(--ipn-superficie);color:var(--ipn-texto);border:1px solid var(--ipn-linea);border-radius:16px;padding:18px;box-shadow:0 8px 32px #0003;font:14px/1.5 system-ui;box-sizing:border-box}
  @media(prefers-color-scheme:dark){#ipnt-cupos{--ipn-texto:#eee8eb;--ipn-superficie:#211e22;--ipn-linea:#61565e;--ipn-acento:#efb7ce}}
  #ipnt-cupos *{box-sizing:border-box}#ipnt-cupos header{display:flex;gap:12px;align-items:center}#ipnt-cupos h2{flex:1;margin:0;font-size:20px}#ipnt-cupos button,#ipnt-cupos select,#ipnt-cupos input{font:inherit;color:inherit;background:var(--ipn-superficie);border:1px solid var(--ipn-linea);border-radius:8px;padding:7px}#ipnt-cupos button{cursor:pointer}#ipnt-cupos :focus-visible{outline:3px solid var(--ipn-acento);outline-offset:2px}#ipnt-cupos label{display:inline-block;margin:8px 6px 8px 0}#ipnt-cupos .tabla{overflow:auto}#ipnt-cupos table{width:100%;border-collapse:collapse;font-size:13px}#ipnt-cupos th,#ipnt-cupos td{padding:6px;text-align:left;border-bottom:1px solid var(--ipn-linea)}#ipnt-cupos article{padding:10px;border:1px solid var(--ipn-linea);border-radius:10px;margin:8px 0}
  #ipnt-cupos tr.elegido{font-weight:600;background:color-mix(in srgb,var(--ipn-acento) 12%,var(--ipn-superficie))}.ipnt-cupo-barra{display:block;height:6px;border-radius:4px;background:#ddd;min-width:70px;margin-top:4px}.ipnt-cupo-barra i{display:block;height:100%;border-radius:4px;background:var(--ocupacion)}#ctl00_mainCopy_GrvOcupabilidad tr.ipnt-elegido{outline:2px solid #71334c;outline-offset:-2px}`;
  document.head.appendChild(estilo);
  panel.innerHTML=`<header><h2>${esc(tx('titulo'))}</h2><button data-c="cerrar" aria-label="${esc(tx('cerrar'))}">×</button></header><p>${esc(tx('limites'))}</p>
  <label>${esc(tx('carrera'))} <select data-c="carrera"></select></label><label>${esc(tx('plan'))} <select data-c="plan"></select></label>
  <p><button data-c="actualizar">${esc(tx('consultar'))}</button></p>
  <label><input type="checkbox" data-c="auto"> ${esc(tx('auto'))}</label>
  <label><input type="checkbox" data-c="sonido"> ${esc(tx('sonido'))}</label>
  <label><input type="checkbox" data-c="notificacion"> ${esc(tx('notificacion'))}</label>
  <p data-c="automatico" role="status" aria-live="polite"></p><button data-c="seguir" hidden>${esc(tx('seguir'))}</button>
  <p data-c="aviso" role="status" aria-live="polite"></p>
  <p data-c="estado" role="status" aria-live="polite">${esc(tx('inicio'))}</p><div data-c="tarjetas"></div>
  <label>${esc(tx('filtro'))} <input type="search" data-c="filtro"></label><label>${esc(tx('nivel'))} <select data-c="nivel"><option value="">${esc(tx('todos_niveles'))}</option></select></label>
  <label>${esc(tx('orden'))} <select data-c="orden"><option value="desc">${esc(tx('orden_mas'))}</option><option value="asc">${esc(tx('orden_menos'))}</option></select></label><div class="tabla" data-c="tabla"></div>`;
  document.body.appendChild(panel);panel.focus();const el=k=>panel.querySelector('[data-c="'+k+'"]');
  function opciones(doc){for(const k of ['carrera','plan']){const s=doc.querySelector('[name="ctl00$mainCopy$dpd'+k+'"]');if(s){el(k).innerHTML=[...s.options].map(o=>`<option value="${esc(o.value)}">${esc(o.textContent)}</option>`).join('');el(k).value=s.value}}}
  opciones(document);
  function enviar(d){if(sate&&!sate.closed)sate.postMessage(d,origin)}
  function preferencias(){enviar({tipo:'ipnt.cupos.avisos',v:1,unidad,hasta:automatico?hasta:0,notificacion:el('notificacion').checked===true})}
  function sonido(){if(!automatico||!el('sonido').checked||!audio||audio.state!=='running')return;
    try{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;
      o.frequency.value=660;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.18);
      o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.2);
    }catch(e){console.warn('IPN Cupos: sonido no disponible',e)}}
  function detener(vencido=false){automatico=false;el('auto').checked=false;clearInterval(reloj);reloj=null;preferencias();
    el('automatico').textContent=tx(vencido?'auto_fin':'auto_apagada');el('seguir').hidden=!vencido}
  function pulso(){if(!automatico)return;if(Date.now()>=hasta){detener(true);return}
    el('automatico').textContent=tx(document.hidden?'auto_pausa':'auto_activa');
    if(!document.hidden&&(ultima===null||Date.now()-ultima>=60000))return actualizar();
  }
  function activar(){automatico=true;hasta=Date.now()+30*60000;el('auto').checked=true;
    el('sonido').checked=true;el('notificacion').checked=true;el('seguir').hidden=true;
    // El contexto se crea y reanuda exclusivamente dentro del clic de activación.
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio=audio||new Audio();audio.resume().catch(e=>console.warn('IPN Cupos: audio suspendido',e))}}
    catch(e){console.warn('IPN Cupos: audio no disponible',e)}
    if(!sate||sate.closed)abrir();preferencias();clearInterval(reloj);reloj=setInterval(pulso,60000);pulso();
  }
  function abrir(){if(!URL_SATE)return;const url=new URL(URL_SATE);url.searchParams.set('unidad',unidad);
    sate=window.open(url.href,'sate-cupos','width=420,height=560');
    if(!sate){el('estado').textContent=tx('ventana');return}
    clearInterval(conexion);let n=0;conexion=setInterval(()=>{enviar({tipo:'ipnt.cupos.hola',v:1,unidad});if(++n>=15)clearInterval(conexion)},500);
  }
  function barra(f){const n=f.cupo?Math.min(100,Math.round(f.inscritos/f.cupo*100)):100;return `<span class="ipnt-cupo-barra" aria-hidden="true"><i style="width:${n}%;--ocupacion:${f.disponibles===0?'var(--ipn-acento)':n>=80?'#ab751b':'#35805a'}"></i></span>`}
  function disponibilidad(f){return tx(f.disponibles===0?'lleno':'lugares',{n:f.disponibles})}
  function pintar(){if(!datos)return;const q=el('filtro').value.toLocaleLowerCase(),nivel=el('nivel').value;
    const elegido=f=>seleccion.some(s=>C.clave(s)===C.clave(f));
    const filas=datos.filas.filter(f=>(!nivel||f.nivel===nivel)&&(!q||(f.grupo+' '+f.materia+' '+f.nombre).toLocaleLowerCase().includes(q))).sort((a,b)=>Number(elegido(b))-Number(elegido(a))+(elegido(a)===elegido(b)?(el('orden').value==='asc'?a.disponibles-b.disponibles:b.disponibles-a.disponibles):0));
    el('tabla').innerHTML=`<table><caption>${esc(tx('todos'))}</caption><thead><tr>${['grupo','materia','disponibles','cambio'].map(k=>`<th scope="col">${esc(tx(k))}</th>`).join('')}</tr></thead><tbody>${filas.map(f=>{const a=anterior.get(C.clave(f)),delta=a==null?null:f.disponibles-a;return `<tr class="${elegido(f)?'elegido':''}"><th scope="row">${esc(f.grupo)}${elegido(f)?' · '+esc(tx('tu_grupo')):''}</th><td>${esc(f.materia)}<br>${esc(f.nombre)}</td><td>${esc(disponibilidad(f))} · ${f.inscritos}/${f.cupo}${barra(f)}</td><td>${delta==null?'':delta>0?'▲ '+delta:delta<0?'▼ '+Math.abs(delta):'='}</td></tr>`}).join('')}</tbody></table>`;
    el('tarjetas').innerHTML=seleccion.length?`<h3>${esc(tx('tu_horario'))}</h3>`+C.tarjetas(datos,seleccion,oferta).map(s=>`<article><b>${esc(s.materia)} · ${esc(s.grupo)}</b><p>${esc(s.fila?disponibilidad(s.fila):tx('sin_dato'))}</p>${s.fila?.disponibles===0?s.alternativas.map(a=>`<p>${esc(a.grupo)} · ${esc(disponibilidad(a))} · ${esc(tx(a.choque===null?'sin_horas':a.choque?'con_choque':'sin_choque'))}</p>`).join(''):''}</article>`).join(''):'';
    // Se conservan las filas y sus valores originales para restaurarlos al cerrar el panel.
    const tabla=document.getElementById('ctl00_mainCopy_GrvOcupabilidad');if(tabla)for(const r of [...tabla.querySelectorAll('tr')].slice(1)){
      const f=datos.filas.find(f=>f.grupo===r.children[0]?.textContent.trim()&&f.materia===r.children[1]?.textContent.trim());if(!f)continue;
      if(!originales.has(r))originales.set(r,{padre:r.parentNode,hidden:r.hidden,celdas:[...r.children].slice(4).map(c=>c.innerHTML)});
      r.hidden=!filas.includes(f);r.classList.toggle('ipnt-elegido',elegido(f));
      r.children[4].textContent=f.cupo;r.children[5].textContent=f.inscritos;
      const a=anterior.get(C.clave(f)),delta=a==null?null:f.disponibles-a;
      r.children[6].innerHTML=esc(disponibilidad(f))+(elegido(f)?' · '+esc(tx('tu_grupo')):'')+(delta>0?' ▲ '+delta:delta<0?' ▼ '+Math.abs(delta):'')+barra(f);
    }
    if(tabla){const orden=new Map(datos.filas.map(f=>[C.clave(f),f]));const rows=[...originales.keys()].filter(r=>r.isConnected!==false);
      rows.sort((a,b)=>{const fa=orden.get(a.children[0].textContent.trim()+'|'+a.children[1].textContent.trim()),fb=orden.get(b.children[0].textContent.trim()+'|'+b.children[1].textContent.trim());return fa&&fb?Number(elegido(fb))-Number(elegido(fa))+(elegido(fa)===elegido(fb)?(el('orden').value==='asc'?fa.disponibles-fb.disponibles:fb.disponibles-fa.disponibles):0):0});
      for(const r of rows)r.parentNode.appendChild(r);
    }
  }
  async function actualizar(){if(busy||destruido)return;
    if(ultima!==null&&Date.now()-ultima<60000){el('estado').textContent=tx('esperar');return}
    if(!sate||sate.closed)abrir();busy=true;ultima=Date.now();window.IPNCuposUltimaConsulta=ultima;el('actualizar').disabled=true;el('estado').textContent=tx('consultando');
    const carrera=el('carrera').value,plan=el('plan').value;
    try{const r=await C.consultar({fetch:window.fetch.bind(window),parser:s=>new DOMParser().parseFromString(s,'text/html'),url:location.origin+'/Academica/Ocupabilidad_grupos.aspx',carrera,plan,opciones});if(destruido)return;
      anterior=new Map(datos&&datos.carrera===r.carrera&&datos.plan===r.plan?datos.filas.map(f=>[C.clave(f),f.disponibles]):[]);
      const nuevos={tipo:'ipnt.cupos.datos',v:1,unidad,...r,hora:new Date().toISOString()},cambios=C.cambios(datos,nuevos,seleccion);
      datos=nuevos;el('estado').textContent=tx('ultima',{hora:C.fecha(datos)});
      if(automatico&&Date.now()<hasta&&cambios.length){avisos+=cambios.length;el('aviso').textContent=cambios.map(f=>tx('aviso',{...f,n:f.disponibles})).join(' · ');document.title=tx('titulo_avisos',{n:avisos});sonido()}
      el('nivel').innerHTML=`<option value="">${esc(tx('todos_niveles'))}</option>`+[...new Set(r.filas.map(f=>f.nivel))].map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');pintar();enviarDatos();
    }catch(e){console.warn('IPN Cupos: consulta fallida',{unidad,carrera,plan,codigo:e.message,etapa:e.etapa,estado:e.estado,pila:e.stack});el('estado').textContent=tx('error_'+(textos['sate.cupos.error_'+e.message]?e.message:'red'))}
    finally{busy=false;if(!destruido)el('actualizar').disabled=false}
  }
  function enviarDatos(){if(datos)enviar({...datos,filas:datos.filas.map(({grupo,materia,cupo,inscritos,disponibles})=>({grupo,materia,cupo,inscritos,disponibles}))})}
  function mensaje(e){if(!C.origenSate(e.origin,URL_SATE)||e.source!==sate)return;const d=e.data;
    if(d?.tipo==='ipnt.cupos.hola'){clearInterval(conexion);preferencias();enviarDatos()}
    if(d?.tipo==='ipnt.cupos.permiso'&&d.v===1)el('aviso').textContent=tx(d.permiso==='granted'?'permiso_listo':'permiso_panel');
    if(d?.tipo==='ipnt.cupos.seleccion'&&d.v===1&&Array.isArray(d.grupos)&&Array.isArray(d.oferta)&&d.grupos.length<=500&&d.oferta.length<=10000){
      const valida=g=>typeof g.grupo==='string'&&typeof g.materia==='string'&&Array.isArray(g.horas)&&g.horas.every(h=>Array.isArray(h)&&h.length===3&&h.every(Number.isFinite));
      if(!d.grupos.every(valida)||!d.oferta.every(valida))return;seleccion=d.grupos;oferta=d.oferta;
      for(const k of ['texto','superficie','linea','acento'])if(/^#[a-f0-9]{3,8}$/i.test(d.tokens?.[k]||''))panel.style.setProperty('--ipn-'+k,d.tokens[k]);pintar();
    }
  }
  window.addEventListener('message',mensaje);el('actualizar').onclick=actualizar;for(const k of ['filtro','nivel','orden'])el(k).oninput=pintar;
  el('auto').onchange=()=>el('auto').checked?activar():detener();el('seguir').onclick=activar;
  el('notificacion').onchange=preferencias;document.addEventListener('visibilitychange',pulso);
  el('carrera').onchange=()=>{el('plan').innerHTML=''};
  function cerrar(){detener();destruido=true;clearInterval(conexion);document.removeEventListener('visibilitychange',pulso);window.removeEventListener('message',mensaje);document.title=titulo;if(audio)audio.close().catch(e=>console.warn('IPN Cupos: cierre de audio',e));panel.remove();estilo.remove();
    for(const [r,o] of originales){r.hidden=o.hidden;r.classList.remove('ipnt-elegido');o.celdas.forEach((html,i)=>r.children[4+i].innerHTML=html);o.padre.appendChild(r)}
  }
  el('cerrar').onclick=cerrar;panel.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar()});
  abrir();
})();
