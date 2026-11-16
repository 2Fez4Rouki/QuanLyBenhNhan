const CACHE_NAME = 'meditask-v39'; // 💡 Nhớ tăng version này lên mỗi khi bạn deploy code mới (v3, v4, v5...)
const assets = [
  './',
  './index.html',
  './css/style.css',
  './js/storage.js',
  './js/auth.js',
  './js/patients.js',
  './js/todos.js',
  './js/calendar.js',
  './js/app.js',
  './manifest.json'
];

// 1. Cài đặt Service Worker và cache các tài nguyên
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

// 2. Kích hoạt và tự động xóa sạch các cache phiên bản cũ (v1, v2...)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ Đang xóa cache cũ:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Chiến lược Fetch: Luôn ưu tiên lấy bản mới nhất từ mạng, nếu mất mạng mới dùng cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
