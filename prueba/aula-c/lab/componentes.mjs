// Formato compartido por catálogo, editor, servidor y pruebas. No ejecuta SPICE.
const nombre=/^[A-Za-z_][A-Za-z0-9_]*$/;
export const escapar=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function importarSpice(text){
 if(typeof text!=='string'||text.length>60000)throw Error('SPICE vacío o demasiado grande (máximo 60 kB)');
 let lines=text.replace(/\r/g,'').replace(/\n\s*\+/g,' ').split('\n').map(l=>l.replace(/\s*[$;].*$/,'').trim()).filter(l=>l&&!l.startsWith('*'));
 // Las hojas de datos son datos, nunca scripts de ngspice ni accesos a archivos.
 const directives=new Set(['.subckt','.ends','.model','.param','.func']);
 for(let l of lines){if(/^(?:wrdata|write|shell|source|load|quit|echo|save|set|setplot|destroy|reset|alter|altermod|run)\b/i.test(l)||l.startsWith('.')&&!directives.has(l.split(/\s/)[0].toLowerCase())||!l.startsWith('.')&&!/^[RCLVIDQMXBEFGHKSTWJZ]\w*\s/i.test(l))throw Error('Instrucción SPICE no permitida: '+l.slice(0,100));if(/["'`\\]/.test(l)||/\b(?:pwl|table)\s*\([^)]*file/i.test(l))throw Error('No se permiten archivos ni comandos externos en SPICE');}
 let headers=lines.filter(l=>/^\.subckt\s/i.test(l)),models=lines.filter(l=>/^\.model\s/i.test(l));
 if(!headers.length&&!models.length)throw Error('Se esperaba .subckt o .model');
 if(headers.length){let tokens=headers[0].split(/\s+/),nodes=tokens.slice(2).filter((v,i,a)=>!v.includes('=')&&!a.slice(0,i+1).some(x=>/^params:/i.test(x)));if(!nombre.test(tokens[1])||!nodes.length||nodes.some(n=>!nombre.test(n)&&!/^\d+$/.test(n))||new Set(nodes.map(n=>n.toLowerCase())).size!==nodes.length)throw Error('Nombre o nodos de .subckt inválidos');if(lines.filter(l=>/^\.ends(?:\s|$)/i.test(l)).length!==headers.length)throw Error('Falta .ends en el subcircuito');return {kind:'subckt',name:tokens[1],nodes,text};}
 if(models.length!==1)throw Error('Importe un único .model o un .subckt principal');
 let m=models[0].match(/^\.model\s+(\w+)\s+(D|NPN|PNP|NMOS|PMOS)\b/i);if(!m||!nombre.test(m[1]))throw Error('Modelo compatible: D, NPN, PNP, NMOS o PMOS');
 return {kind:'model',name:m[1],modelType:m[2].toUpperCase(),nodes:({D:['A','K'],NPN:['C','B','E'],PNP:['C','B','E'],NMOS:['D','G','S','B'],PMOS:['D','G','S','B']})[m[2].toUpperCase()],text};
}
export function validarComponente(c){
 if(!c||!nombre.test(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>100||!c.package||!Array.isArray(c.package.pins)||c.package.pins.length<1||c.package.pins.length>40)throw Error('Metadatos o encapsulado inválidos');
 let pkg=c.package;if(!['axial','radial','to92','to126','to220','dip','sip','pot','button','led','switch','battery','bench','generator','ground','inductor'].includes(pkg.art)||!pkg.drawing||!['box','R','C','L','V','I','G','D','Q'].includes(pkg.symbol)||pkg.pins.some((p,i)=>p.number!==i+1||typeof p.name!=='string'||p.name.length>40||![p.x,p.y].every(v=>Number.isInteger(v)&&v>=0&&v<=62)))throw Error('Definición de encapsulado inválida');
 let m=importarSpice(c.spice?.text),mapping=c.mapping;
 if(!mapping||Object.keys(mapping).length!==pkg.pins.length||pkg.pins.some(p=>!m.nodes.includes(mapping[p.number]))||m.nodes.some(n=>!Object.values(mapping).includes(n)))throw Error('Mapee cada pin y cubra todos los nodos del modelo');
 if(new Set(Object.values(mapping)).size!==pkg.pins.length)throw Error('Cada pin debe corresponder a un nodo distinto');
 for(let [key,v] of Object.entries(c.parameters||{}))if(!nombre.test(key)||!Number.isFinite(v))throw Error('Parámetro inválido: '+key);
 if(m.kind==='model'&&Object.keys(c.parameters||{}).length)throw Error('Para .model edite los parámetros en su texto SPICE');
 if(c.datasheet&&!/^https?:\/\/[^\s]+$/i.test(c.datasheet))throw Error('URL de hoja de datos inválida');
 return {...c,spice:m};
}
export function instanciaSpice(c,id,nodes){c=validarComponente(c);if(!/^\w+$/.test(id)||!Array.isArray(nodes)||nodes.length!==c.package.pins.length||nodes.some(n=>!/^\w+$/.test(n)))throw Error('Instancia SPICE inválida');let ordered=c.spice.nodes.map(n=>nodes[c.package.pins.findIndex(p=>c.mapping[p.number]===n)]),prefix=c.spice.kind==='subckt'?'X':({D:'D',NPN:'Q',PNP:'Q',NMOS:'M',PMOS:'M'})[c.spice.modelType];return `${prefix}${id} ${ordered.join(' ')} ${c.spice.name}${c.spice.kind==='subckt'?Object.entries(c.parameters||{}).map(([k,v])=>` ${k}=${v}`).join(''):''}`;}
export function agujerosEncapsulado(pkg,anchor,rotation=0,span=pkg.drawing.span||1){
 let m=/^([a-j]):(\d+)$/.exec(anchor);if(!m||![0,90,180,270].includes(rotation)||!Number.isInteger(span)||span<1||span>62)throw Error('Anclaje o separación inválidos');
 let row='abcdefghij'.indexOf(m[1]),col=+m[2],sign=rotation>=180?-1:1;
 if(pkg.art==='dip'&&(rotation%180||row!==(pkg.drawing.width===6?2:4)))throw Error('DIP: pin 1 en fila '+(pkg.drawing.width===6?'c':'e')+', paralelo al canal (0°/180°)');
 return pkg.pins.map(p=>{let x=pkg.art==='axial'&&p.number===2?span:p.x,y=p.y,ri,ci;if(pkg.art==='dip'){ri=p.y===0?row:pkg.drawing.width===6?6:5;ci=col+sign*x;}else{ri=row+(rotation%180?sign*x:y);ci=col+(rotation%180?y:sign*x);}if(ri<0||ri>9||ci<1||ci>63)throw Error('Encapsulado fuera de la protoboard');return 'abcdefghij'[ri]+':'+ci;});
}
export function puntosEncapsulado(pkg){let xs=pkg.pins.map(p=>p.x*14),ys=pkg.pins.map(p=>p.y*14),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;return xs.map((x,i)=>[x-cx,ys[i]-cy]);}
// Nombre corto dentro del cuerpo: el número de parte («SCR tipo 2N5060 · modelo simplificado» → «2N5060»), si no, la primera palabra.
export function etiquetaCorta(label,max=9){let palabras=String(label).split('·')[0].split(/\s+/).filter(Boolean),short=palabras.find(w=>/\d/.test(w)&&/[A-Za-z]/.test(w))||palabras[0]||'';return [...short].length<=max?short:[...short].slice(0,max-1).join('')+'…';}
function geometriaSimbolo(pkg,label=''){let n=Math.ceil(pkg.pins.length/2),short=etiquetaCorta(label),width=Math.max(50,Math.min(80,[...short].length*6+12)),height=Math.max(32,(n-1)*18+20);return {n,width,height,short};}
export function simboloEncapsulado(pkg,label=''){let {n,width,height,short}=geometriaSimbolo(pkg,label),half=width/2,parts=[`<rect x="${-half}" y="${-height/2}" width="${width}" height="${height}" rx="4"/>`];pkg.pins.forEach((p,i)=>{let left=i<n,x=left?-(half+15):half+15,y=-((n-1)*18)/2+(left?i:pkg.pins.length-1-i)*18;parts.push(`<path d="M${x} ${y}H${left?-half:half}"/><text x="${left?x-2:x+2}" y="${y+4}" text-anchor="${left?'end':'start'}" class="pin-number">${p.number}</text>`);});parts.push(`<text x="0" y="5" text-anchor="middle" class="chip-label" title="${escapar(label)}">${escapar(short)}</text>`);return parts.join('');}
export function terminalEncapsulado(pkg,i,label=''){let {n,width}=geometriaSimbolo(pkg,label),half=width/2;return [i<n?-(half+15):half+15,-((n-1)*18)/2+(i<n?i:pkg.pins.length-1-i)*18];}
export function importarPaquete(text,library={}){if(typeof text!=='string'||text.length>1000000)throw Error('Paquete demasiado grande');let p;try{p=JSON.parse(text);}catch{throw Error('JSON de paquete inválido');}if(p?.format!=='aulac-paquete'||p.schema!==1||typeof p.name!=='string'||!p.name.trim()||typeof p.unit!=='string'||typeof p.academy!=='string'||typeof p.version!=='string'||typeof p.notes!=='string'||!Array.isArray(p.components)||p.components.length>100)throw Error('Estructura de paquete inválida');let ids=new Set();for(let c of p.components){if(typeof c==='string'){if(!Object.hasOwn(library,c))throw Error('Referencia desconocida: '+c);}else validarComponente(c);let id=typeof c==='string'?c:c.id;if(ids.has(id))throw Error('Componente repetido: '+id);ids.add(id);}return p;}
export function exportarPaquete(p,library={}){importarPaquete(JSON.stringify(p),library);return JSON.stringify(p,null,2)+'\n';}
