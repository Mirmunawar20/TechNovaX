/* TechNovaX service worker — offline-first for assets, network-first for pages */
const VERSION = 'tnx-v2';
const CORE = ['/', '/assets/css/style.css', '/assets/css/post.css', '/assets/css/fa.min.css', '/assets/js/config.js', '/assets/js/main.js', '/assets/js/post.js', '/assets/img/favicon.svg', '/404.html'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== VERSION).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return;
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('.json');
  if (isPage) {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; }).catch(() => caches.match(req).then((m) => m || caches.match('/404.html'))));
  } else {
    e.respondWith(caches.match(req).then((m) => m || fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; })));
  }
});
