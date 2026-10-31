// Caché propia, separada de JupyterLite; sólo URLs del directorio publicado.
const CACHE = 'precache';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
let caching;
// Mismo protocolo de FS que el SW de JupyterLite. También atiende el intervalo
// en que este SW controla el iframe antes de que el SW anidado tome el control.
const driveChannel = new BroadcastChannel('/sw-api.v1');
async function virtualRequest(request,url) {
  const payload=await request.json();
  payload.requestId??=crypto.randomUUID(); payload.pathname=url.pathname;
  return new Promise(resolve=>{
    const listener=event=>{
      if(event.data.browsingContextId!==payload.browsingContextId || event.data.requestId!==payload.requestId)return;
      driveChannel.removeEventListener('message',listener);
      resolve(new Response(JSON.stringify(event.data.response)));
    };
    driveChannel.addEventListener('message',listener);
    driveChannel.postMessage(payload);
  });
}
async function precache() {
  const cache=await caches.open(CACHE), root=new URL('./',self.location.href);
  const manifest=await (await fetch(new URL('recursos.json',root),{cache:'no-store'})).json();
  const previous=await cache.match(new URL('recursos.json',root));
  const refresh=previous && (await previous.json()).revision!==manifest.revision;
  // Secuencial para no multiplicar el pico de memoria del paquete de Octave.
  for(const path of manifest.files) {
    const url=new URL(path,root);
    if(url.origin!==root.origin || !url.pathname.startsWith(root.pathname)) throw Error('CACHE_SCOPE');
    if(refresh || !await cache.match(url)) {
      const response=await fetch(url);
      if(!response.ok) throw Error(`${response.status} ${path}`);
      await cache.put(url,response);
    }
  }
  await cache.put(new URL('recursos.json',root),new Response(JSON.stringify(manifest),{headers:{'Content-Type':'application/json'}}));
}
self.addEventListener('message',event=>{
  if(event.data?.type!=='aulac-cache')return;
  caching??=precache().finally(()=>{caching=null;});
  event.waitUntil(caching.then(()=>event.source?.postMessage({type:'aulac-offline',ok:true}),error=>{
    console.error(error);event.source?.postMessage({type:'aulac-offline',ok:false});
  }));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),root=new URL('./',self.location.href);
  if(url.origin!==root.origin)return;
  if(url.pathname.includes('/api/drive')||url.pathname.includes('/api/stdin/')) {
    event.respondWith(virtualRequest(event.request,url));return;
  }
  if(url.pathname.endsWith('/api/service-worker-heartbeat')) {
    event.respondWith(new Response('ok'));return;
  }
  if(event.request.method!=='GET'||!url.pathname.startsWith(root.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const key=new URL(url);key.search='';
    if(key.pathname.endsWith('/'))key.pathname+='index.html';
    const cached=await cache.match(key);
    return cached||fetch(event.request);
  })());
});
