import {cargarFicha,variantesDe,especificacionesDe,compararFichas,compatibleConGananciaLazoAbierto} from './hoja-datos.mjs';

export async function crearHojaDatosUI({patillaje,simular}){
  const [lm,tl,pinData]=await Promise.all([
    ...['LM741','TL081'].map(async id=>[id,await(await fetch(`./datos/fichas/${id}.json`)).json()]),
    fetch('./datos/patillas.json').then(r=>r.json())
  ]);
  const fichas=Object.fromEntries([lm,tl]);
  let panel=null,previo=null,serial=0;
  const el=(tag,text,parent,attrs={})=>{const n=['svg','path','line','circle','text'].includes(tag)?document.createElementNS('http://www.w3.org/2000/svg',tag):document.createElement(tag);if(text!=null)n.textContent=text;for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent?.append(n);return n;};
  const nombres={offset:['Tensión de offset de entrada','V_OS'],bias:['Corriente de polarización de entrada','I_B'],gain:['Ganancia de tensión en lazo abierto','A_OL'],gbw:['Producto ganancia-ancho de banda','GBW'],slew:['Velocidad de respuesta','SR'],cmrr:['Rechazo en modo común','CMRR'],psrr:['Rechazo de fuente de alimentación','PSRR'],resistance:['Resistencia de entrada','R_IN'],swing:['Excursión de tensión de salida','V_O'],supply:['Corriente de alimentación','I_S']};
  const etiqueta=s=>nombres[s.id]||[s.parametro,''];
  const columnas=s=>[s.minimo??'—',s.tipico??'—',s.maximo??'—'];
  const citar=ficha=>String(ficha.cita||'').replace(/,\s*p\.\s*\[[^\]]+\]\.?/i,'');
  const cerrar=()=>{panel?.remove();panel=null;previo?.focus?.();previo=null;};
  const pagina=(ficha,s,parent)=>el('a',`p. ${s.pagina}`,parent,{href:`${ficha.hoja.url}#page=${s.pagina}`,target:'_blank',rel:'noopener'});
  const rotuloParametro=(s,parent)=>{const [es,sym]=etiqueta(s),th=el('th',null,parent,{title:s.parametro});el('span',es,th);if(sym)el('small',sym,th,{class:'hoja-simbolo'});el('small',s.parametro,th,{class:'hoja-literal'});};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel)cerrar();});
  function abrir(parte,{comparar=false,pieza=null}={}){
    const ficha=cargarFicha(fichas,parte);if(!ficha)return;
    cerrar();previo=document.activeElement;
    panel=el('aside',null,document.body,{class:'hoja-datos-panel',role:'dialog','aria-modal':'false','aria-label':`Hoja de datos ${parte}`,tabindex:'-1'});
    const top=el('header',null,panel,{class:'hoja-datos-cabecera'}),title=el('div',null,top);
    el('p',ficha.familia,title,{class:'hoja-datos-familia'});el('h2',ficha.parte,title);
    el('p',`${ficha.fabricante} · ${ficha.encapsulados.join(', ')}`,title);el('p',`Hoja ${ficha.hoja.codigo}, revisión ${ficha.hoja.revision}`,title);
    el('button','Cerrar',top,{type:'button'}).onclick=cerrar;
    const select=el('select',null,panel,{'aria-label':'Variante'});variantesDe(ficha).forEach(v=>select.add(new Option(v,v)));select.value=comparar?'LM741C':variantesDe(ficha)[0];
    const body=el('div',null,panel,{class:'hoja-datos-contenido'});
    async function render(){
      const request=++serial;body.replaceChildren();const variant=select.value,info=ficha.variantes[variant],specs=especificacionesDe(ficha,variant);
      el('h3','Patillaje',body);const pinrow=el('div',null,body,{class:'hoja-datos-patillas'});
      const source=pinData.piezas.find(x=>x.id===parte),names=new Map((source?.patillas||[]).map(p=>[p.numero,p.nombre_hoja]));
      const pins=(info.patillas||[]).map(p=>({numero:p.numero,nombre:variant==='TL081H'&&[1,5].includes(p.numero)?'NC':names.get(p.numero)||p.nombre}));pins.forEach(p=>el('span',`${p.numero} · ${p.nombre}`,pinrow));
      el('button','Ver patillaje completo',body,{type:'button'}).onclick=()=>patillaje?.(variant==='TL081H'?{definition:{id:'TL081H',name:'TL081H',package:{pins:pins.map(p=>({number:p.numero,name:p.nombre}))}}}:pieza||{definition:{id:parte,name:parte,package:{pins:pins.map(p=>({number:p.numero,name:p.nombre}))}}});
      el('h3','Especificaciones clave',body);const table=el('table',null,body,{class:'hoja-especificaciones'});table.innerHTML='<thead><tr><th>Parámetro</th><th>Mín.</th><th>Típ.</th><th>Máx.</th><th>Unidad</th><th>Condición</th><th>Fuente</th></tr></thead>';const tbody=el('tbody',null,table);
      for(const s of specs){const row=el('tr',null,tbody);rotuloParametro(s,row);for(const v of columnas(s))el('td',v,row,{class:'hoja-num'});el('td',s.condicion,row);const td=el('td',null,row);pagina(ficha,s,td);}
      el('h3','Qué significa para tu circuito',body);for(const id of ['gbw','slew','cmrr','offset']){const s=specs.find(x=>x.id===id);if(s)el('p',`${etiqueta(s)[0]}: ${ficha.explicaciones[id]}`,body,{class:'hoja-revision'});}
      el('h3','Curvas desde el modelo',body);const charts=el('div',null,body,{class:'hoja-curvas','aria-live':'polite'});el('p','Simulando con el macromodelo de AULA-C…',charts,{class:'hoja-nota'});
      let simulada=false,medidas=null;
      try{
        const result=await simular(parte,variant);if(request!==serial||!panel)return;
        const bode=(result.ac||[]).map(r=>{const z=r.voltages?.out||[0,0];return{x:r.f,ganancia:20*Math.log10(Math.hypot(z[0],z[1])),fase:Math.atan2(z[1],z[0])*180/Math.PI};});
        const step=(result.tran||[]).map(r=>({x:r.t,entrada:r.voltages?.inp?.[0]??0,salida:r.voltages?.out?.[0]??0}));
        if(!bode.length||!step.length)throw Error('El motor no devolvió puntos de análisis AC y transitorio.');
        const gananciaDc=10**(bode[0].ganancia/20);
        medidas={gananciaDc,slew:pendienteMaxima(step)};charts.replaceChildren();dibujarEscalon(charts,step,medidas.slew);simulada=true;
      }catch(error){if(request===serial&&panel)el('p',`No se pudo generar una curva: ${error.message}`,charts,{role:'status',class:'hoja-nota'});}
      if(simulada){
        const hojaGain=specs.find(s=>s.id==='gain'),hojaSR=specs.find(s=>s.id==='slew');
        const gainVv=hojaGain?Number(hojaGain.tipico)*1000:NaN,gainCompatible=compatibleConGananciaLazoAbierto(medidas.gananciaDc,gainVv),slewDiff=hojaSR&&Number.isFinite(medidas.slew)&&Math.abs(medidas.slew-Number(hojaSR.tipico))>Math.max(.01,Number(hojaSR.tipico)*.02);
        if(!gainCompatible)el('p',`El modelo de AULA-C para esta pieza no reproduce la ganancia de lazo abierto de la hoja (simulado: ${fmt(medidas.gananciaDc)} V/V; hoja: ${hojaGain?`${hojaGain.tipico} ${hojaGain.unidad} (${fmt(gainVv)} V/V), p. ${hojaGain.pagina}`:'sin cifra localizada'}). Se corregirá el modelo.`,body,{class:'hoja-nota'});
        el('p',`Slew rate · Simulado: ${fmt(medidas.slew)} V/µs · Hoja: ${hojaSR?`${hojaSR.tipico} ${hojaSR.unidad.replace('μ','µ')} típ. (p. ${hojaSR.pagina})`:'sin cifra localizada en la ficha consultada'}${slewDiff?' · discrepancia':''}`,body,{class:'hoja-nota'});
      }
      const figs=ficha.curvas,acRef=figs?.ac?`la figura ${figs.ac.figura}, p. ${figs.ac.pagina}`:'la hoja',trRef=figs?.transitorio?`la figura ${figs.transitorio.figura}, p. ${figs.transitorio.pagina}`:'la hoja';
      el('p',simulada?`Curvas del modelo AULA-C; compáralas con ${acRef} y ${trRef}.`:'Curvas no disponibles para esta variante con el macromodelo AULA-C actual.',body,{class:'hoja-nota'});
      const other=parte==='LM741'?'TL081':'LM741';el('button',`Comparar con ${other}`,body,{type:'button'}).onclick=()=>renderComparacion(ficha,variant,fichas[other],variantesDe(fichas[other])[0],body);
      if(ficha.maximos?.length){el('h3','Máximos absolutos',body);const maxima=el('table',null,body,{class:'hoja-maximos'});maxima.innerHTML='<thead><tr><th>Parámetro</th><th>Valor y fuente</th></tr></thead>';const rows=el('tbody',null,maxima);ficha.maximos.forEach(x=>{const row=el('tr',null,rows);el('th',x.parametro,row);const td=el('td',`${x.valor} ${x.unidad} · `,row,{class:'hoja-num'});el('a',`p. ${x.pagina}`,td,{href:`${ficha.hoja.url}#page=${x.pagina}`,target:'_blank',rel:'noopener'});});}
      el('h3','Fuente y cita sugerida',body);el('a',ficha.hoja.url,body,{href:ficha.hoja.url,target:'_blank',rel:'noopener'});el('p',citar(ficha),body);
    }
    select.onchange=()=>render();render();panel.focus();
  }
  function renderComparacion(a,va,b,vb,body){
    body.querySelector('.hoja-comparacion')?.remove();const box=el('section',null,body,{class:'hoja-comparacion'});el('h3',`${a.parte} frente a ${b.parte}`,box);const table=el('table',null,box);table.innerHTML=`<thead><tr><th>Parámetro</th><th>${a.parte} · ${va}</th><th>${b.parte} · ${vb}</th></tr></thead>`;const tbody=el('tbody',null,table);
    for(const row of compararFichas(a,va,b,vb)){const tr=el('tr',null,tbody);rotuloParametro(row,tr);if(row.condicionesDistintas)el('small','condiciones distintas',tr.firstElementChild,{class:'hoja-condiciones-distintas'});for(const [entry,ficha] of [[row.a,a],[row.b,b]]){const td=el('td',null,tr);if(entry){el('span',`${columnas(entry).join(' | ')} ${entry.unidad.replace('μ','µ')}`,td,{class:'hoja-num'});el('small',entry.condicion,td);pagina(ficha,entry,td);}else el('span','—',td,{class:'hoja-num'});}}
  }
  const colores={texto:'var(--aulac-texto)',tenue:'var(--aulac-tenue)',linea:'var(--aulac-linea)',ganancia:'var(--aulac-canal2)',fase:'var(--aulac-octave)',entrada:'var(--aulac-canal1)'};
  function texto(svg,x,y,value,attrs={}){return el('text',value,svg,{x,y,fill:colores.texto,'font-size':12,...attrs});}
  function escala(svg,{x0,x1,y0,y1,yTicks,xTicks,xLabel,yLabel,xScale,yScale}){yTicks.forEach(t=>{const y=yScale(t);el('line',null,svg,{x1:x0,x2:x1,y1:y,y2:y,stroke:colores.linea,'stroke-width':1});texto(svg,x0-8,y+4,String(t),{'text-anchor':'end',fill:colores.tenue});});xTicks.forEach(t=>{const x=xScale(t.x);el('line',null,svg,{x1:x,x2:x,y1:y0,y2:y1,stroke:colores.linea,'stroke-width':1});texto(svg,x,y1+17,t.label,{'text-anchor':'middle',fill:colores.tenue});});el('line',null,svg,{x1:x0,x2:x0,y1:y0,y2:y1,stroke:colores.texto});el('line',null,svg,{x1:x0,x2:x1,y1:y1,y2:y1,stroke:colores.texto});texto(svg,(x0+x1)/2,y1+35,xLabel,{'text-anchor':'middle'});texto(svg,13,(y0+y1)/2,yLabel,{transform:`rotate(-90 13 ${(y0+y1)/2})`,'text-anchor':'middle'});}
  function trazo(svg,rows,key,xScale,yScale,color){const points=rows.filter(r=>Number.isFinite(r[key])&&Number.isFinite(xScale(r.x))).map(r=>[xScale(r.x),yScale(r[key])]);el('path',null,svg,{d:points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' '),fill:'none',stroke:color,'stroke-width':2});}
  function svg(parent,title,h){const node=el('svg',null,parent,{viewBox:`0 0 720 ${h}`,role:'img','aria-label':title});return node;}
  function dibujarEscalon(parent,rows,slew){const fig=el('figure',null,parent);el('figcaption','Respuesta a escalón como seguidor',fig);const chart=svg(fig,'Respuesta a escalón: entrada y salida frente al tiempo en microsegundos',260),x0=66,x1=700,y0=16,y1=178,tMax=Math.max(...rows.map(r=>r.x),1e-9)*1e6,vMax=Math.max(1,...rows.flatMap(r=>[r.entrada,r.salida])),xScale=t=>x0+t*1e6/tMax*(x1-x0),yScale=v=>y1-v/(vMax*1.1)*(y1-y0),xTicks=Array.from({length:6},(_,i)=>({x:i*tMax/5,label:(i*tMax/5).toFixed(i===0?0:1)})),yTicks=[0,.25,.5,.75,1].map(v=>+(v*vMax).toFixed(2));escala(chart,{x0,x1,y0,y1,yTicks,xTicks,xLabel:'Tiempo (µs)',yLabel:'Voltaje (V)',xScale,yScale});trazo(chart,rows,'entrada',xScale,yScale,colores.entrada);trazo(chart,rows,'salida',xScale,yScale,colores.ganancia);texto(chart,430,52,`Slew rate medido: ${fmt(slew)} V/µs`,{fill:colores.fase});el('line',null,chart,{x1:75,x2:95,y1:238,y2:238,stroke:colores.entrada,'stroke-width':2});texto(chart,101,242,'Entrada (V)');el('line',null,chart,{x1:190,x2:210,y1:238,y2:238,stroke:colores.ganancia,'stroke-width':2});texto(chart,216,242,'Salida (V)');}
  function cruceUnidad(rows){for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];if(a.ganancia>=0&&b.ganancia<=0){const t=a.ganancia/(a.ganancia-b.ganancia);return Math.exp(Math.log(a.x)+t*(Math.log(b.x)-Math.log(a.x)));}}const first=rows[0],last=rows.at(-1);if(first?.ganancia<0)return extrapolar(rows[0],rows[1]);if(last?.ganancia>0)return extrapolar(rows.at(-2),last);return null;}
  function extrapolar(a,b){if(!a||!b||a.ganancia===b.ganancia)return null;const slope=(b.ganancia-a.ganancia)/(Math.log10(b.x)-Math.log10(a.x));return slope?10**(Math.log10(a.x)-a.ganancia/slope):null;}
  function pendienteMaxima(rows){let max=0;for(let i=1;i<rows.length;i++){const dt=rows[i].x-rows[i-1].x;if(dt>0)max=Math.max(max,Math.abs(rows[i].salida-rows[i-1].salida)/dt/1e6);}return max;}
  function fmt(value){return Number.isFinite(value)?value.toFixed(2):'n/d';}
  return{abrir};
}
