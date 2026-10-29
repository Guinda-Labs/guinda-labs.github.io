// Composiciones editoriales por práctica. Las coordenadas no alteran la netlist.
export const unidades={I:'Opto-tiristores y sus aplicaciones.',II:'Circuitos de potencia.',III:'Amplificadores con transistores BJT.',IV:'Amplificadores con transistores MOSFET.',V:'Aplicaciones de los OP AMPS a filtros activos y amplificadores de instrumentación.'};
export const objetivos={
 'i-fase':'Medir el ángulo de disparo y la potencia de una carga controlada por TRIAC y DIAC.',
 'i-aislamiento':'Comparar la transferencia óptica del 4N25 y del MOC3021 con sus entradas encendidas y apagadas.',
 'ii-rectificador':'Comparar rectificación de media onda y onda completa y medir el rizo del filtro capacitivo.',
 'ii-buck':'Medir la tensión y el rizo de un convertidor reductor con excitación PWM.',
 'iii-emisor-comun':'Medir polarización, ganancia e impedancias de un amplificador en emisor común.',
 'iv-fuente-comun':'Medir la polarización y la ganancia de un amplificador MOSFET en fuente común.',
 'v-sallen-key':'Medir la ganancia y la frecuencia de corte de un filtro Sallen-Key de segundo orden.',
 'v-instrumentacion':'Medir ganancia diferencial y rechazo de modo común con una bioseñal simulada.'
};
// Cada entrada es [x, y, rotación, desplazamiento de rótulo x, y].
const planos={
 'i-fase':{XRED:[100,250,0,0,-70],XT:[800,220,0,135,-15],XD:[590,330,0,0,-45],RT:[360,160,0,0,-38],CT:[470,390,90,105,0],RG:[710,330,0,0,45],RL:[800,420,90,105,0],G1:[300,510,0,0,50]},
 'i-aislamiento':{VLED:[100,200,90,0,-65],RLED:[260,140,0,0,-38],XO:[480,210,0,0,-110],VCC:[710,150,90,0,-65],RC:[710,280,90,80,0],VLED2:[100,480,90,0,-65],RLED2:[260,420,0,0,-38],XM:[480,490,0,0,-110],VISO:[940,150,90,0,-65],RL:[940,420,90,75,0],G1:[650,620,0,0,48]},
 'ii-rectificador':{VAC:[100,270,90,0,-70],XB:[410,270,0,0,-115],C1:[690,300,90,70,0],RL:[920,300,90,70,0],G1:[560,460,0,0,50]},
 'ii-buck':{VIN:[100,210,90,0,-70],VPWM:[270,420,90,0,75],XM:[420,180,0,0,-90],XD:[510,330,270,105,0],L1:[670,210,0,0,-40],C1:[830,330,90,105,0],RL:[1050,330,90,105,0],G1:[650,530,0,0,48]},
 'iii-emisor-comun':{V1:[80,200,90,0,-75],V2:[230,310,90,0,85],R1:[430,160,90,-80,0],R2:[430,390,90,-80,0],RC:[650,160,90,100,0],RE:[650,420,90,-75,0],CE:[830,420,90,105,0],C1:[320,270,0,0,-40],C2:[850,240,0,0,-40],RL:[1050,380,90,75,0],Q1:[615,270,0,-10,85],G1:[550,530,0,0,48]},
 'iv-fuente-comun':{VDD:[100,200,90,0,-75],VG:[270,330,90,0,85],XM:[650,310,0,100,10],RD:[650,160,90,75,0],RG:[450,420,90,-75,0],G1:[600,530,0,0,48]},
 'v-sallen-key':{VIN:[80,300,90,0,85],VP:[780,80,0,0,-38],VN:[990,80,0,0,-38],R1:[270,260,0,0,-38],R2:[480,260,0,0,-38],C1:[490,150,0,0,-40],C2:[590,400,90,-100,0],XA:[800,280,0,0,-110],RF:[1000,430,90,105,0],RG:[800,500,0,0,45],G1:[420,590,0,0,48]},
 'v-instrumentacion':{VCM:[100,430,90,0,80],VD:[100,280,90,-5,-65],VRUIDO:[290,240,0,0,-40],VP:[560,80,0,0,-38],VN:[800,80,0,0,-38],XI:[600,300,0,0,-110],RL:[990,380,90,75,0],G1:[480,550,0,0,48]}
};
const triangle='M-45-65L65 0L-45 65ZM-75-30H-45M-75 30H-45M65 0H85M0-38V-85M0 38V85';
const polarity='<text x="-35" y="-24">+</text><text x="-35" y="36">−</text><text x="8" y="-66">V+</text><text x="8" y="78">V−</text>';
const diode='M-40 0H-15M-15-18L15 0L-15 18ZM15-18V18M15 0H40';
const thyristor='M0-65V-28M-20-28L20-28L0 8ZM-22 8H22M0 8V65M0 8L40 40H65';
const mos='M-65 0H-25V-30M-18-32V32M-10-25H25V-65M-10 25H25V65M25 25V-25M-10 0H12L3-7M12 0L3 7';
// Pines en el orden físico original; los números SPICE nunca se renumeran.
export function simboloPractica(p){
 const id=p.definition?.id;
 if(id==='TL072')return {pins:[[85,0],[-75,30],[-75,-30],[0,85],[125,-30],[125,30],[285,0],[0,-85]],box:[-75,-85,285,85],svg:`<path d="${triangle}"/>${polarity}<g transform="translate(200 0)"><path d="M-45-65L65 0L-45 65ZM-75-30H-45M-75 30H-45M65 0H85"/><text x="-35" y="-24">+</text><text x="-35" y="36">−</text><text x="-15" y="50">B</text></g>`};
 if(id==='INA3')return {pins:[[-75,-30],[-75,30],[0,-85],[0,85],[85,0],[35,85],[65,85],[85,85]],box:[-75,-85,85,85],svg:`<path d="${triangle}"/>${polarity}<path d="M35 18V85M65 85V65M85 85V65"/><text x="28" y="108">REF / NC</text>`};
 if(['AD620','INA128'].includes(id))return {pins:[[-125,-65],[-75,30],[-75,-30],[0,85],[35,85],[85,0],[0,-85],[-125,65]],box:[-125,-85,85,108],svg:`<path d="${triangle}"/>${polarity}<path d="M-125-65H-85V-48H-45M-125 65H-85V48H-45M35 18V85"/><text x="-135" y="-72">1 RG</text><text x="-135" y="83">8 RG</text><text x="28" y="108">5 REF</text>`};
 if(id==='TRIAC')return {pins:[[0,65],[0,-65],[65,40]],box:[-45,-65,65,65],svg:'<path d="M0-65V-40H-20V-25M0-40H20V-5M-35-25H-5L-20 5ZM-35 5H-5M-20 5V40H0V65M5 25H35L20-5ZM5-5H35M20 25V40H0M20-5L65 40"/>'};
 if(id==='SCR')return {pins:[[0,-65],[0,65],[65,40]],box:[-30,-65,65,65],svg:`<path d="${thyristor}"/>`};
 if(id==='DIAC')return {pins:[[-40,0],[40,0]],box:[-40,-20,40,20],svg:'<path d="M-40 0H-22M22 0H40M-22-18V18L0 0ZM22-18V18L0 0Z"/>'};
 if(id==='PUENTE')return {pins:[[-80,0],[80,0],[0,-80],[0,80]],box:[-80,-80,80,80],svg:`<path d="M-80 0L0-80L80 0L0 80Z"/>${[[-40,-40,-45],[40,-40,45],[-40,40,-135],[40,40,135]].map(([x,y,r])=>`<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-14-9L10 0L-14 9ZM10-12V12"/></g>`).join('')}<text x="-68" y="-12">~</text><text x="52" y="-12">~</text><text x="12" y="-65">+</text><text x="12" y="78">−</text>`};
 if(id==='TRANSFORMADOR')return {pins:[[-60,-60],[-60,60],[60,-60],[60,60]],box:[-60,-65,60,65],svg:'<path d="M-60-60H-30V-45Q0-45-30-15Q0-15-30 15Q0 15-30 45V60H-60M60-60H30V-45Q0-45 30-15Q0-15 30 15Q0 15 30 45V60H60M-8-65V65M8-65V65"/><circle cx="-43" cy="-47" r="4" fill="currentColor"/><circle cx="43" cy="-47" r="4" fill="currentColor"/>'};
 if(['BS170','IRF540'].includes(id))return {pins:id==='BS170'?[[25,-65],[-65,0],[25,65]]:[[-65,0],[25,-65],[25,65]],box:[-65,-65,25,65],svg:`<path d="${mos}"/>`};
 if(id==='D1N5819')return {pins:[[-40,0],[40,0]],box:[-40,-20,40,20],svg:`<path d="${diode}"/>`};
 if(id==='RED127')return {pins:[[0,-40],[0,40]],box:[-25,-40,25,40],svg:'<circle r="25"/><path d="M0-40V-25M0 25V40M-16 0Q-8-20 0 0Q8 20 16 0"/>'};
 if(['OPTO4N25','MOC3021'].includes(id))return {pins:[[-80,-30],[-80,30],[-50,85],[80,30],[80,-30],[80,65]],box:[-80,-85,80,85],svg:`<path d="M-60-85H60V85H-60ZM-80-30H-40V-18M-55-18H-25L-40 12ZM-55 12H-25M-40 12V30H-80M-50 85V65M-15-20L15-35M2-35H15V-22M-15 10L15-5M2-5H15V8"/>${id==='OPTO4N25'?'<path d="M35-20V20M35-10L60-30H80M35 10L60 30H80M48 15L57 27L44 24M35 20V65H80"/>':'<path d="M80-30H35V30H80M22-22H48M22 22H48M22-22V22L48 0ZM48 22V-22L22 0ZM80 65H60"/>'}`};
 return null;
}
const localPin=(p,i)=>p.schematic?.pins?.[i]??(p.type==='Q'?[[35,-30],[-40,0],[35,30]][i]:[p.type==='G'?0:(i?40:-40),0]);
export function puntoEsquema(c,key){const [id,i]=key.split(':'),p=c.components.find(p=>p.id===id),[x,y]=localPin(p,+i),a=p.rotation*Math.PI/180;return [Math.round(p.x+x*Math.cos(a)-y*Math.sin(a)),Math.round(p.y+x*Math.sin(a)+y*Math.cos(a))];}
// Parte siempre del ejemplo INA3 para conservar el montaje original al elegirlo.
export function seleccionarINA(original,chip,definition){
 const c=structuredClone(original);if(chip==='INA3')return c;
 if(c.b309?.practice!=='v-instrumentacion'||!['AD620','INA128'].includes(chip)||definition?.id!==chip)throw Error('Chip de instrumentación inválido');
 const xi=c.components.find(p=>p.id==='XI');if(xi?.definition.id!=='INA3')throw Error('Se requiere el ejemplo INA3 original');
 xi.definition=structuredClone(definition);delete xi.schematic;delete c.schematicVersion;
 c.components.push({id:'RG',type:'R',value:chip==='AD620'?499:505,x:380,y:300,rotation:90,schematic:{label:[0,85]}});
 const pins={0:2,1:1,2:6,3:3,4:5,5:4},remap=k=>k.startsWith('XI:')?'XI:'+pins[k.split(':')[1]]:k;
 c.wires=(c.logicalRequest||c.wires).filter(w=>![w.a,w.b].some(k=>['XI:6','XI:7'].includes(k))).map(w=>({id:w.id,a:remap(w.a),b:remap(w.b)}));
 c.wires.push({id:'w15',a:'XI:0',b:'RG:0'},{id:'w16',a:'XI:7',b:'RG:1'});
 c.b309.probes=['VD:0','XI:5'];c.b309.chip=chip;
 if(c.mode==='board'){
  c.logicalRequest=structuredClone(c.wires);c.physical.placements.RG={holes:['a:31','a:35'],rotation:0,span:4};
  const contact=k=>{const [id,i]=k.split(':'),h=c.physical.placements[id].holes[+i];return h.replace(/^[a-e]:/,'d:').replace(/^[f-j]:/,'i:');};
  c.physical.wires=c.wires.map(w=>({id:w.id,a:contact(w.a),b:contact(w.b),color:'#4985cf'}));
 }
 console.info('[B309 INA]',{chip,RG:c.components.at(-1).value,mode:c.mode,pins:xi.definition.mapping});return c;
}
// Carriles y codos elegidos para cada conexión. Un número indica un carril horizontal.
const codos={
 'i-fase':{w1:[[100,80],[800,80]],w2:[[100,80],[320,80]],w3:510,w4:510,w5:[[470,160]],w6:[[470,160],[470,330]],w7:[],w8:[[865,330]],w9:[],w10:[[840,285],[840,480],[470,480]]},
 'i-aislamiento':{w1:[[100,140]],w2:[[350,140],[350,180]],w3:[[40,240],[40,600],[380,600],[380,240]],w4:[[40,240],[40,600],[380,600],[380,295]],w5:[[40,240],[40,620]],w6:[[40,240],[40,600],[810,600],[810,190]],w7:[[40,240],[40,600],[560,600]],w8:[[40,240],[40,600],[560,600]],w9:[[40,240],[40,600],[100,600]],w10:[[40,240],[40,600],[380,600],[380,520]],w11:[[40,240],[40,600],[430,600]],w12:[[40,240],[40,600],[560,600]],w13:[[40,240],[40,600],[1100,600],[1100,190]],w14:[[40,240],[40,600],[560,600]],w15:[],w16:[[710,340],[610,340],[610,180]],w17:[[100,420]],w18:[[350,420],[350,460]],w19:[[940,80],[1060,80],[1060,380]],w20:[[940,580],[590,580],[590,555]]},
 'ii-rectificador':{w1:[[100,190],[250,190],[250,270]],w2:[[100,420],[530,420],[530,270]],w3:[[410,120],[690,120]],w4:[[410,120],[920,120]],w5:460,w6:460,w7:460},
 'ii-buck':{w1:[[100,80],[445,80]],w2:530,w3:530,w4:530,w5:530,w6:[[270,180]],w7:[[270,490],[445,490]],w8:[[445,250],[510,250]],w9:[[445,210]],w10:[[830,210]],w11:[[1050,210]]},
 'iii-emisor-comun':{w1:70,w2:70,w3:510,w4:510,w5:510,w6:510,w7:510,w8:530,w9:[[230,270]],w10:[[430,270]],w11:[[430,270]],w12:[],w13:[],w14:[[740,230],[740,240]],w15:[],w16:[[650,350],[830,350]],w17:[[1050,240]]},
 'iv-fuente-comun':{w1:70,w2:[],w3:[[270,310]],w4:[[450,290]],w5:530,w6:530,w7:530,w8:530},
 'v-sallen-key':{w1:[[80,260]],w2:[],w3:[[370,260],[370,150]],w4:[[590,260]],w5:250,w6:[[1100,150],[1100,200],[885,200]],w7:[[1180,150],[1180,390],[1000,390]],w8:[[1000,500]],w9:[[1000,480],[920,480],[920,370],[700,370],[700,310]],w10:[[80,590],[1220,590],[1220,20],[820,20]],w11:[[80,590],[1220,590],[1220,20],[1030,20]],w12:590,w13:590,w14:[[80,590],[900,590],[900,250]],w15:590,w16:[[740,80],[740,120],[800,120]],w17:[[950,80],[950,140],[1250,140],[1250,380],[800,380]],w18:[[925,350],[1130,350],[1130,280]]},
 'v-instrumentacion':{w1:[],w2:[[100,350],[460,350],[460,330]],w3:[[100,240]],w4:[[420,240],[420,270]],w5:[[520,80],[520,150],[600,150]],w6:[[760,80],[760,430],[600,430]],w7:[[990,300]],w8:[[100,550],[1180,550],[1180,20],[600,20]],w9:550,w10:550,w11:550,w12:550,w13:550,w14:550}
};
export function prepararEsquema(c){
 const plan=planos[c.b309?.practice];if(!plan||c.schematicVersion===1)return c;
 // El documento físico conserva agujeros; sólo cambia su vista esquemática.
 for(const p of c.components){const spec=plan[p.id];if(!spec)continue;const [x,y,rotation,dx,dy]=spec;Object.assign(p,{x,y,rotation});const symbol=simboloPractica(p);p.schematic={...(symbol?{pins:symbol.pins}:{}),label:[dx,dy]};}
 // La variante de media onda usa D1 en lugar del puente.
 const extra=c.components.find(p=>!plan[p.id]);if(extra&&(extra.type==='D'||extra.definition?.id==='D1N5819')){Object.assign(extra,{x:410,y:190,rotation:0,schematic:{label:[0,-40],...(simboloPractica(extra)?{pins:simboloPractica(extra).pins}:{})}});}
 const half=c.b309.practice==='ii-rectificador'&&!c.components.some(p=>p.id==='XB');
 const halfBends={w1:[[100,190]],w2:[[690,190]],w3:[[920,190]],w4:460,w5:460,w6:460};
 for(const w of c.wires){const a=puntoEsquema(c,w.a),b=puntoEsquema(c,w.b);let bends=(half?halfBends:codos[c.b309.practice])[w.id];if(typeof bends==='number')bends=[[a[0],bends],[b[0],bends]];if(!bends)bends=[[b[0],a[1]]];let pts=[a,...bends,b],orthogonal=[pts[0]];for(const q of pts.slice(1)){const prev=orthogonal.at(-1);if(prev[0]!==q[0]&&prev[1]!==q[1])orthogonal.push([q[0],prev[1]]);if(prev[0]!==q[0]||prev[1]!==q[1])orthogonal.push(q);}w.points=orthogonal;}
 if(c.b309.practice==='v-instrumentacion'&&c.components.some(p=>p.id==='RG'))for(const id of ['w15','w16']){const w=c.wires.find(w=>w.id===id),a=puntoEsquema(c,w.a),b=puntoEsquema(c,w.b);w.points=[a,[b[0],a[1]],b];}
 if(c.b309.practice==='v-sallen-key'){
  // La realimentación llega a RG por su extremo izquierdo, sin atravesar el cuerpo.
  const w=c.wires.find(w=>w.id==='w8');w.points=[puntoEsquema(c,w.a),[1000,480],[700,480],[700,500],puntoEsquema(c,w.b)];
 }
 c.schematicVersion=1;return c;
}
export function rotuloEsquema(p){
 const si=v=>{const e=v===0?0:Math.max(-12,Math.min(9,Math.floor(Math.log10(Math.abs(v))/3)*3));return Number((v/10**e).toPrecision(3))+({'-12':'p','-9':'n','-6':'µ','-3':'m',0:'',3:'k',6:'M',9:'G'}[e]);};
 const value=p.definition?.id??(p.type==='G'?'Tierra':p.type==='Q'?(p.polarity||'NPN'):p.wave?.type==='sin'?`${si(p.wave.args[2])}Hz`:p.wave?.type==='pulse'?'PWM':`${si(p.value)}${{R:'Ω',C:'F',L:'H',V:'V'}[p.type]||''}`);
 const label=p.id+' · '+value,[dx,dy]=p.schematic?.label??[0,-40];
 return {text:label,x:p.x+dx,y:p.y+dy,width:label.length*9.6+6,height:22};
}
export function cajasEsquema(c){return c.components.flatMap(p=>{const s=simboloPractica(p),b=s?.box??(p.type==='Q'?[-40,-30,35,30]:p.type==='G'?[-20,0,20,28]:[-40,-22,40,22]),a=p.rotation*Math.PI/180,pts=[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]].map(([x,y])=>[p.x+x*Math.cos(a)-y*Math.sin(a),p.y+x*Math.sin(a)+y*Math.cos(a)]),r=rotuloEsquema(p);return [{id:p.id,kind:'symbol',x:Math.min(...pts.map(p=>p[0]))-3,y:Math.min(...pts.map(p=>p[1]))-3,width:Math.max(...pts.map(p=>p[0]))-Math.min(...pts.map(p=>p[0]))+6,height:Math.max(...pts.map(p=>p[1]))-Math.min(...pts.map(p=>p[1]))+6},{id:p.id,kind:'label',x:r.x-r.width/2,y:r.y-17,width:r.width,height:r.height}];});}
export function encuadreEsquema(c){const boxes=cajasEsquema(c),pts=c.wires.flatMap(w=>w.points||[]),xs=[...boxes.flatMap(b=>[b.x,b.x+b.width]),...pts.map(p=>p[0])],ys=[...boxes.flatMap(b=>[b.y,b.y+b.height]),...pts.map(p=>p[1])],x=Math.min(...xs)-30,y=Math.min(...ys)-30;return [x,y,Math.max(...xs)-x+30,Math.max(...ys)-y+30];}
export async function cargarCuaderno(unit,request=fetch){
 if(!Object.hasOwn(unidades,unit))throw Error('Unidad B309 desconocida');
 const source=await request('/cuaderno/ejemplos/b309-'+unit.toLowerCase()+'.aulac.json');if(!source.ok)throw Error('No se pudo leer el cuaderno B309');
 const response=await request('/cuaderno/api/abrir',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({book:await source.json()})});if(!response.ok)throw Error('No se pudo abrir el cuaderno B309');
 return '/cuaderno/';
}
