const CACHE = 'graphcalc-v5';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './vendor/katex.min.css',
  './vendor/katex.min.js',
  './vendor/auto-render.min.js',
  './vendor/papaparse.min.js',
  './vendor/algebrite.min.js',
  './vendor/three.min.js',
  './js/extensions.js',
  './js/i18n.js',
  './js/units.js',
  './js/cas-steps.js',
  './js/stats-plus.js',
  './js/chemistry.js',
  './js/notebook.js',
  './js/presentation.js',
  './js/terminal.js',
  './js/graph3d.js',
  './js/voice.js',
  './js/plugins.js',
  './js/extras.js',
  './assets/GraphCalc_Icon.svg',
  './assets/GraphCalc-apple-touch.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      for (const url of LOCAL_ASSETS){
        try { await c.add(url); }
        catch (err){ console.warn('[SW] Failed to cache:', url, err); }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok){
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});