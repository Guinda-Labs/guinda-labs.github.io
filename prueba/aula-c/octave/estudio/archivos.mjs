// RAW v1: tres uint32 little endian (alto, ancho, canales), luego RGB intercalado por filas.
export function empaquetarImagen({width, height, data}) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 || data.length !== width*height*4) throw Error('RGBA_INVALID');
  let channels=1;
  for(let i=0;i<data.length;i+=4) if(data[i]!==data[i+1] || data[i]!==data[i+2]) {channels=3;break;}
  const raw=new Uint8Array(12+width*height*channels), view=new DataView(raw.buffer);
  [height,width,channels].forEach((n,i)=>view.setUint32(i*4,n,true));
  for(let p=0;p<width*height;p++) for(let c=0;c<channels;c++) raw[12+p*channels+c]=data[p*4+c];
  return raw;
}
export function desempaquetarImagen(raw) {
  if(raw.length<12) throw Error('RAW_HEADER');
  const view=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);
  const [height,width,channels]=[0,4,8].map(i=>view.getUint32(i,true));
  if(!height || !width || ![1,3].includes(channels) || raw.length!==12+height*width*channels) throw Error('RAW_SIZE');
  const data=new Uint8ClampedArray(height*width*4);
  for(let p=0;p<height*width;p++) {
    for(let c=0;c<3;c++) data[p*4+c]=raw[12+p*channels+(channels===1?0:c)];
    data[p*4+3]=255;
  }
  return {height,width,channels,data};
}
export async function decodificarImagen(file, env=globalThis) {
  const bitmap=await env.createImageBitmap(file);
  try {
    const canvas=new env.OffscreenCanvas(bitmap.width,bitmap.height), context=canvas.getContext('2d');
    context.drawImage(bitmap,0,0);
    return empaquetarImagen(context.getImageData(0,0,bitmap.width,bitmap.height));
  } finally {bitmap.close();}
}
export function rutaProyecto(path) {
  const parts=path.replaceAll('\\','/').split('/');
  if(parts.some(p=>!p || p==='.' || p==='..' || p==='.aulac' || /[\x00-\x1f]/.test(p))) throw Error('PROJECT_PATH');
  return parts.join('/');
}
export function aBase64(bytes) {
  let binary='';
  for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(binary);
}
export function deBase64(content) {return Uint8Array.from(atob(content),c=>c.charCodeAt(0));}
export async function guardarArchivo(contents,path,bytes,format='base64') {
  const parts=path.split('/');
  for(let i=1;i<parts.length;i++) {
    const dir=parts.slice(0,i).join('/');
    try {await contents.get(dir,{content:false});}
    catch(error) {if(error.response?.status!==404 && error.status!==404) throw error; await contents.save(dir,{type:'directory'});}
  }
  await contents.save(path,{type:'file',format,content:format==='text'?bytes:aBase64(bytes)});
}
export async function leerBinario(contents,path) {
  const file=await contents.get(path,{format:'base64',content:true});
  return deBase64(file.content);
}
export async function pngDesdeRaw(raw) {
  const {width,height,data}=desempaquetarImagen(raw), canvas=new OffscreenCanvas(width,height);
  canvas.getContext('2d').putImageData(new ImageData(data,width,height),0,0);
  return canvas.convertToBlob({type:'image/png'});
}
export const funcionesPDI=['aulac_native','aulac_rawread','aulac_rawwrite','imread','imfinfo','imwrite','aulac_figuras'];
export async function instalarPDI(contents) {
  for(const name of funcionesPDI) {
    const response=await fetch(`./octave/${name}.m`);
    if(!response.ok) throw Error(`PDI ${name}: ${response.status}`);
    await guardarArchivo(contents,`.aulac/octave/${name}.m`,await response.text(),'text');
  }
}
export const iniciarPDI="addpath('/drive/.aulac/octave', '-end'); aulac_native('init'); addpath('/drive/.aulac/octave', '-begin');";
