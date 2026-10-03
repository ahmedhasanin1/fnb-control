const CACHE = 'fnb-control-shell-v8';

const SHELL = [
  './',
  './index.html?v=20261003',
  './manifest.json?v=20261003',
  './FNB_Control_192.png',
  './FNB_Control_512.png',
  './FNB_Control_512_Maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {

  if(event.request.method !== 'GET'){
    return;
  }

  const url = new URL(event.request.url);

  if(url.origin !== self.location.origin){
    return;
  }

  /*
    Always fetch the HTML shell from the network first.
    This prevents an old cached index.html from surviving
    future fixes to the PWA navigation.
  */
  if(url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')){
    event.respondWith(
      fetch(event.request, {cache:'no-store'})
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /*
    Other local assets can use cache-first.
  */
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
