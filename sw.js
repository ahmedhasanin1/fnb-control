const CACHE_NAME='fnb-control-v9';
const SHELL=['./','./index.html','./manifest.json','./FNB_Control_192.png','./FNB_Control_512.png','./FNB_Control_512_Maskable.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  const u=new URL(event.request.url);
  if(u.origin!==self.location.origin) return;

  const isShell=
    u.pathname.endsWith('/') ||
    u.pathname.endsWith('/index.html') ||
    u.pathname.endsWith('/manifest.json') ||
    u.pathname.endsWith('/sw.js');

  if(isShell){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(c=>c.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request))
  );
});
