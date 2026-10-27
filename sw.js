const CACHE_NAME = 'meditask-v2';
const assets = [
  './index.html',
  './css/style.css',
  './js/storage.js',
  './js/patients.js',
  './js/todos.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
