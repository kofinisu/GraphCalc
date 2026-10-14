const CACHE = 'graphcalc-v3';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/GraphCalc_Icon.svg',
  './assets/GraphCalc-apple-touch.png'
];

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
  'https://cdn.jsdelivr.net/npm/algebrite@1.4.0/algebrite.bundle-for-browser.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      await c.addAll(LOCAL_ASSETS).catch(err => console.warn('[SW] Local asset failed:', err));
      for (const url of CDN_ASSETS){
        try {
          // Explicit CORS mode matches how <script>/<link> fetch these
          await c.add(new Request(url, { mode: 'cors', credentials: 'omit' }));
        } catch (err){
          console.warn('[SW] CDN cache miss:', url, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(resp => {
        // Only cache successful same-origin or CORS-fetched responses
        if (resp.ok && e.request.url.startsWith('http')){
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => {
        // Only fall back to index.html for actual page navigations.
        // Handing HTML to a failed <script>/<link> breaks parsing silently.
        if (e.request.mode === 'navigate'){
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});