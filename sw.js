const CACHE='fnb-control-shell-v2';
const SHELL=['./','./index.html','./manifest.json','./FNB_Control_192.png','./FNB_Control_512.png','./FNB_Control_512_Maskable.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
