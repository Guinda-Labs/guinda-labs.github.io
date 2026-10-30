import {analizarNodos,thevenin,admitirCD,analizarMallas} from './analisis.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const f=(n,u)=>Number.isFinite(n)?`${Number(n.toPrecision(5)).toLocaleString('es-MX')} ${u}`:'Sin camino de CD';
const name=i=>'V'+String.fromCharCode(97+i%26)+(i>=26?Math.floor(i/26):'');
export function equivalente(r,norton=false){
 const source=norton?f(r.In*1000,'mA'):f(r.Vth,'V'),res=f(r.Rth,'Ω');
 return `<svg viewBox="0 0 280 160" role="img" aria-label="Equivalente de ${norton?'Norton':'Thévenin'}"><g fill="none" stroke="var(--aulac-acento)" stroke-width="2"><circle cx="55" cy="80" r="22"/><path d="${norton?'M55 58V30H250':'M55 58V30H92m56 0h102'}M55 102v28h195"/>${norton?'<path d="M180 30v25m0 50v25m-8-75h16v50h-16zM55 94V66l-6 8m6-8 6 8"/>':'<path d="M92 22h56v16H92zM49 73h12m-6-6v12m-6 12h12"/>'}<circle cx="250" cy="30" r="3"/><circle cx="250" cy="130" r="3"/></g><g font-size="13"><text x="252" y="23">A</text><text x="252" y="150">B</text><text x="6" y="150">${esc(source)}</text><text x="${norton?190:90}" y="${norton?85:17}">${esc(res)}</text></g></svg>`;
}
export function crearAnalisis({contenedor,svg,leer,fit,estado}){
 let active=null,A=null,B='0',carga='',paso=0,overlay=false,forma='th',seleccion='A',expanded=false,cache=null;
 const root=document.createElement('section');root.id='analisisContenido';root.hidden=true;contenedor.append(root);
 const clear=()=>{svg.classList?.remove('analisis-recorrido');svg.querySelectorAll('.analisis-capa').forEach(e=>e.remove());svg.querySelectorAll('.analisis-resaltado,.analisis-apagado').forEach(e=>e.classList.remove('analisis-resaltado','analisis-apagado'));};
 const layer=()=>{const g=document.createElementNS(svg.namespaceURI,'g');g.classList.add('analisis-capa');g.setAttribute('pointer-events','none');svg.append(g);return g;};
 const label=(g,x,y,s)=>{const t=document.createElementNS(svg.namespaceURI,'text');t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('class','analisis-chip');t.textContent=s;g.append(t);return t;};
 const tabs=()=>`<div class="ana-tabs" role="tablist" aria-label="Tipos de análisis">${[['nodos','Nodos'],['mallas','Mallas'],['thevenin','Thévenin/<wbr>Norton']].map(([id,title])=>`<button role="tab" data-tab="${id}" aria-selected="${active===id}">${title}</button>`).join('')}</div>`;
 const bindTabs=()=>root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>estado(b.dataset.tab));
 const combination=coeff=>coeff.map((v,i)=>v?(v<0?' − ':i&&coeff.slice(0,i).some(Boolean)?' + ':'')+'I'+(i+1):'').join('').trim()||'0';
 function pintarMallas(data){
  clear();const g=layer();
  data.meshes.forEach((m,i)=>{
   const shape=document.createElementNS(svg.namespaceURI,'path');shape.setAttribute('d','M'+m.points.map(p=>p.join(' ')).join('L')+'Z');shape.setAttribute('class','analisis-malla');shape.dataset.malla=String(i);g.append(shape);
   // El centroide de área evita que los vértices repetidos de cables sesguen la flecha.
   let x=0,y=0;m.points.forEach((p,k)=>{const q=m.points[(k+1)%m.points.length],a=p[0]*q[1]-q[0]*p[1];x+=(p[0]+q[0])*a;y+=(p[1]+q[1])*a;});x/=6*m.area;y/=6*m.area;
   const arrow=document.createElementNS(svg.namespaceURI,'path');arrow.setAttribute('d',`M${x-18} ${y-18}A25 25 0 1 1 ${x-25} ${y}m-5 7 5-7 7 5`);arrow.setAttribute('class','analisis-malla-flecha');g.append(arrow);label(g,x,y+5,'I'+(i+1)).setAttribute('text-anchor','middle');
  });
  root.querySelectorAll('[data-malla]').forEach(row=>{const highlight=on=>{g.querySelectorAll('[data-malla]').forEach(p=>p.classList.toggle('activa',on&&p.dataset.malla===row.dataset.malla));};row.onmouseenter=()=>highlight(true);row.onmouseleave=()=>highlight(false);row.onfocus=()=>highlight(true);row.onblur=()=>highlight(false);});
 }
 function panelMallas(ctx){
  const d=analizarMallas(ctx.esquema,ctx.dc,ctx.components);cache=d;
  root.innerHTML=tabs()+'<p>Sentido horario. Cada ventana del esquema es una malla. Al pasar el cursor por una fila se ilumina su malla.</p><table class="ana-voltajes"><caption>Corrientes de malla</caption><tbody>'+d.currents.map((v,i)=>`<tr data-malla="${i}" tabindex="0"><th scope="row">I${i+1}</th><td>${f(v*1000,'mA')}</td></tr>`).join('')+'</tbody></table><p>Una corriente de malla no siempre es la de un elemento.</p><table class="ana-voltajes ana-ramas"><caption>Corrientes de rama · de terminal 0 a terminal 1</caption><tbody>'+d.branches.map(b=>`<tr><th scope="row">I_${esc(b.id)}<small>${combination(b.coeff)}</small></th><td>${f(b.current*1000,'mA')}</td></tr>`).join('')+'</tbody></table>'+`<details id="ana-ecuaciones" ${expanded?'open':''}><summary>Ecuaciones de malla (Ω, mA, V)</summary><p>R · I = V. Con I en mA: Ω · mA / 1000 = V. Las restricciones de corriente se expresan en mA.</p><div class="ana-matriz" tabindex="0" role="region" aria-label="Matriz de mallas"><table><thead><tr><th>Ecuación</th>${d.currents.map((_,i)=>`<th>I${i+1}</th>`).join('')}<th>Resultado</th></tr></thead><tbody>${d.matrix.map((row,i)=>`<tr><th>${esc(d.kinds[i])}</th>${row.map(v=>`<td>${Number(v.toPrecision(5))}</td>`).join('')}<td>${f(d.rhs[i]*(d.kinds[i].startsWith('Restricción')?1000:1),d.kinds[i].startsWith('Restricción')?'mA':'V')}</td></tr>`).join('')}</tbody></table></div>${d.kinds.some(k=>k.includes('supermalla'))?'<p>Si una rama compartida tiene fuente de corriente, las dos mallas forman una supermalla y se agrega la ecuación Ia − Ib = Is.</p>':''}${d.branches.filter(b=>ctx.components.find(p=>p.id===b.id)?.type==='I').map(b=>`<p>${combination(b.coeff)} = ${esc(b.id)} = ${f(b.current*1000,'mA')}</p>`).join('')}</details>`;
  bindTabs();root.querySelector('#ana-ecuaciones').ontoggle=e=>expanded=e.target.open;pintarMallas(d);
 }
 function pintar(data,r){
  clear();const g=layer(),seen=new Set();
  for(const p of svg.querySelectorAll('[data-node]')){const n=p.dataset.node;if(seen.has(n)||!data.dc.voltages[n])continue;const box=p.getBBox();seen.add(n);let x=box.x+box.width/2,y=box.y-16;
   if(p.hasAttribute('data-pin')){x=Number(p.getAttribute('cx'));y=Number(p.getAttribute('cy'))-16;}
   if(active==='nodos')label(g,x,y,`${n==='0'?'Tierra':name(data.nodes.indexOf(n))} = ${f(data.dc.voltages[n][0],'V')}`);
   else if(n===A||n===B){label(g,x,y,(n===A?'A':'B')+' · '+(n==='0'?'tierra':name(data.nodes.indexOf(n))));p.classList.add('analisis-resaltado');}
  }
  if(!r)return;
  svg.classList?.toggle('analisis-recorrido',paso<3);
  for(const p of leer().components){const el=svg.querySelector('[data-component="'+CSS.escape(p.id)+'"]');if(!el)continue;
   if((paso<3&&p.id===carga)||(paso===1&&'VI'.includes(p.type)))el.classList.add('analisis-apagado');
   if((paso===0&&'VI'.includes(p.type))||(paso===1&&p.type==='R'&&p.id!==carga)||(paso===3&&p.id===carga))el.classList.add('analisis-resaltado');
   if(paso===1&&'VI'.includes(p.type)){const b=el.getBBox();label(g,b.x,b.y+b.height+20,p.type==='V'?'corto':'abierto');}
  }
  if(paso===2){const terminals=[A,B].map(n=>svg.querySelector('[data-pin][data-node="'+CSS.escape(n)+'"]')).filter(Boolean);if(terminals.length===2){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M'+terminals.map(t=>[t.getAttribute('cx'),t.getAttribute('cy')].join(' ')).join('L'));path.setAttribute('class','analisis-corto');g.append(path);}}
  if(overlay){const bounds=svg.querySelectorAll('[data-component]'),bottom=Math.max(100,...[...bounds].map(e=>{const b=e.getBBox();return b.y+b.height;}));const nested=document.createElementNS(svg.namespaceURI,'svg');nested.classList.add('analisis-equivalente');nested.setAttribute('x','100');nested.setAttribute('y',bottom+50);nested.setAttribute('width','280');nested.setAttribute('height','160');nested.innerHTML=equivalente(r,forma==='no'&&r.In!==null);g.append(nested);label(g,100,bottom+240,'equivalente superpuesto · el circuito no cambió');}
 }
 function actualizar(){
  if(!active){clear();return;}
  let ctx;try{
   ctx=leer();if(active==='mallas'){panelMallas(ctx);return;}const aviso=admitirCD(ctx.components);cache=analizarNodos(ctx.components,ctx.dc);const data=cache;
   if(!data.nodes.includes(A))A=data.nodes[0];if(!['0',...data.nodes].includes(B))B='0';
   let html=tabs()+(aviso?`<p role="status">${aviso}</p>`:'');let r=null;
   if(active==='nodos'){
    html+='<table class="ana-voltajes"><caption>Voltajes respecto a tierra</caption><tbody>'+data.nodes.map((n,i)=>`<tr><th scope="row">${name(i)} <small>· nodo ${esc(n)}${data.known[n]!==undefined?' · dato':''}</small></th><td>${f(data.dc.voltages[n][0],'V')}</td></tr>`).join('')+'</tbody></table><p>El voltaje de un nodo se mide respecto a tierra; el de un elemento es la diferencia entre dos nodos:</p><math display="block"><msub><mi>V</mi><mi>AB</mi></msub><mo>=</mo><msub><mi>V</mi><mi>A</mi></msub><mo>−</mo><msub><mi>V</mi><mi>B</mi></msub></math>';
    const vn=n=>name(data.nodes.indexOf(n));
    html+=`<details id="ana-ecuaciones" ${expanded?'open':''}><summary>Ecuaciones de nodo (mS, mA, V)</summary><p>G · V = I. KCL: mS · V = mA. Restricciones de fuentes: V.</p><div class="ana-matriz" tabindex="0" role="region" aria-label="Matriz de nodos"><table><thead><tr><th>Ecuación</th>${data.unknown.map(n=>`<th>${vn(n)}</th>`).join('')}<th>= I</th></tr></thead><tbody>${data.G.map((row,i)=>`<tr><th>${data.kinds[i]}</th>${row.map(v=>`<td>${Number(v.toPrecision(5))}</td>`).join('')}<td>${Number(data.I[i].toPrecision(5))}</td></tr>`).join('')}</tbody></table></div><p>Si la fuente de voltaje va de un nodo a tierra, ese nodo queda fijo (V = Vx) y no se forma supernodo. Si une dos nodos que no son tierra, forman un supernodo: se suman sus filas y se agrega Vx − Vy = Vs.</p>${Object.entries(data.known).filter(([n])=>n!=='0').map(([n,v])=>`<p>${vn(n)} = ${f(v,'V')} es dato, no incógnita.</p>`).join('')}</details>`;
   }else{
    const opts=selected=>['0',...data.nodes].map(n=>`<option value="${esc(n)}" ${n===selected?'selected':''}>${n==='0'?'Tierra':name(data.nodes.indexOf(n))+' · nodo '+esc(n)}</option>`).join('');
    const loads=ctx.components.filter(p=>p.type==='R'&&((p.a===A&&p.b===B)||(p.a===B&&p.b===A)));if(!loads.some(p=>p.id===carga))carga='';
    html+=`<p>Haz clic en dos puntos del esquema para elegir A y B. El panel recalcula con el mismo cálculo del simulador.</p><div class="ana-terminales"><label>A<select id="ana-A">${opts(A)}</select></label><label>B<select id="ana-B">${opts(B)}</select></label></div><button id="ana-pick">Elegir ${seleccion} en el esquema</button><label>Carga que se retira<select id="ana-carga"><option value="">Sin carga externa</option>${loads.map(p=>`<option ${p.id===carga?'selected':''}>${esc(p.id)}</option>`).join('')}</select></label>`;
    try{r=thevenin(ctx.components,A,B,carga||null);
     html+=`<div class="ana-resultados"><div><small>Vth</small><output>${f(r.Vth,'V')}</output></div><div><small>Rth</small><output>${f(r.Rth,'Ω')}</output></div><div><small>IN</small><output>${r.In===null?'No existe':f(r.In*1000,'mA')}</output></div></div>`;
     html+=`<div class="ana-tabs"><button data-form="th" aria-pressed="${forma==='th'}">Thévenin</button><button data-form="no" aria-pressed="${forma==='no'}" ${r.In===null?'disabled':''}>Norton</button></div>${equivalente(r,forma==='no'&&r.In!==null)}`;
     if(r.Rth===0)html+='<p>Rth = 0: A y B ya son una fuente ideal y no hay equivalente de Norton.</p>';
     const steps=[['Quitar la carga y medir VAB',`${carga?'Se quita '+esc(carga)+' y se dejan A y B abiertos.':'Sin carga externa entre A y B.'} Vth = VA − VB = ${f(r.Vth,'V')}.`],['Apagar las fuentes y hallar Rth',`Se apaga la fuente: una de voltaje se sustituye por un cable (en el esquema, «corto»); una de corriente, por un circuito abierto. Se aplica 1 mA de prueba: Rth = VAB / 1 mA = ${f(r.Rth,'Ω')}.`],['Norton: IN = Vth / Rth',r.In===null?'Rth = 0: A y B ya son una fuente ideal y no hay equivalente de Norton.':`IN = ${f(r.In*1000,'mA')}. Es la corriente que pasaría por un cable entre A y B (línea punteada en el esquema).`],['Comprobar con la carga original',r.load?`Se vuelve a conectar ${esc(carga)} = ${f(r.load.value,'Ω')}. I = Vth / (Rth + R) = ${f(r.current*1000,'mA')}. En el circuito completo se mide ${f((r.full.voltages[A][0]-r.full.voltages[B][0])/r.load.value*1000,'mA')}. Coinciden.`:'Aquí no hay un elemento entre A y B. Elige A y B sobre uno y repite: I = Vth / (Rth + R).']];
     html+=`<section class="ana-paso"><small>Paso ${paso+1} de 4</small><strong>${steps[paso][0]}</strong><p>${steps[paso][1]}</p><div class="ana-tabs"><button id="ana-prev" ${paso===0?'disabled':''}>Anterior</button><button id="ana-next" ${paso===3?'disabled':''}>Siguiente</button></div></section><button id="ana-overlay" aria-pressed="${overlay}">Ver equivalente sobre el circuito</button><p>El circuito no cambia; el equivalente se dibuja encima para comparar.</p>`;
    }catch(e){html+=`<p role="status">${esc(e.message)}</p>`;}
   }
   root.innerHTML=html;pintar(data,r);
   root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>estado(b.dataset.tab));
   root.querySelectorAll('[data-form]').forEach(b=>b.onclick=()=>{forma=b.dataset.form;actualizar();fit();});
   const on=(id,fn,event='onclick')=>{const e=root.querySelector('#'+id);if(e)e[event]=fn;};
   on('ana-ecuaciones',e=>expanded=e.target.open,'ontoggle');
   for(const id of ['A','B'])on('ana-'+id,e=>{if(id==='A')A=e.target.value;else B=e.target.value;paso=0;actualizar();fit();},'onchange');
   on('ana-carga',e=>{carga=e.target.value;paso=0;actualizar();fit();},'onchange');
   on('ana-pick',()=>{seleccion=seleccion==='A'?'B':'A';actualizar();});
   on('ana-prev',()=>{paso--;actualizar();fit();});on('ana-next',()=>{paso++;actualizar();fit();});on('ana-overlay',()=>{overlay=!overlay;actualizar();fit();});
  }catch(e){cache=null;clear();root.innerHTML=tabs()+'<p role="status">'+esc(e.message)+'</p>';bindTabs();console.error('[AULA-C análisis]',{error:e.message,tipo:active,terminales:{A,B},carga,componentes:ctx?.components,cables:ctx?.esquema?.wires});}
 }
 svg.addEventListener('click',e=>{if(active!=='thevenin'||!cache)return;const n=e.target.closest('[data-node]')?.dataset.node;if(n===undefined)return;e.preventDefault();e.stopImmediatePropagation();if(seleccion==='A'){A=n;seleccion='B';}else{B=n;seleccion='A';}paso=0;actualizar();fit();},true);
 return {actualizar,seleccionar(id){active=['nodos','thevenin','mallas'].includes(id)?id:null;root.hidden=!active;actualizar();},get activo(){return !!active;}};
}
