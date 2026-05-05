const CACHE_NAME = 'symptom-tracker-v7';
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
  './brain.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache GitHub API calls
  if (e.request.url.includes('api.github.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
