const CACHE = 'graphcalc-v1';
const ASSETS = [
  './', './index.html', './manifest.json',
  './vendor/katex.min.css', './vendor/katex.min.js', './vendor/auto-render.min.js',
  './vendor/papaparse.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (resp.ok && e.request.method === 'GET') caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
    return resp;
  })));
});