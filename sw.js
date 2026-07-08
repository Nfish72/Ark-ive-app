const CACHE_NAME = 'symptom-tracker-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './fish1.png',
  './fish2.png',
  './fish3.png',
  './cloud1.png',
  './cloud2.png',
  './doctor.html',
  './brain.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (url.includes('api.github.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  const isHTML = e.request.mode === 'navigate' ||
    (e.request.method === 'GET' && url.match(/\.html(\?|$)/)) ||
    url.endsWith('/');

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(err => console.warn('SW cache.put failed:', err));
          }
          return resp;
        })
        .catch(() => caches.match(e.request)
          .then(r => r || caches.match('./index.html'))
          .then(r => r || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
