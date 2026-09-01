/* Animal Farm Talent Release - offline service worker
 * Cache-first for instant load with no signal; refreshes the cache
 * in the background whenever the network is available.
 * Bump CACHE_VERSION on every deploy so updates roll out.
 */
const CACHE_VERSION = 'af-release-v2.1.0';
const APP_SHELL = ['./', './index.html', './sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          if (req.mode === 'navigate') {
            const shell = await caches.match('./index.html', { ignoreSearch: true })
              || await caches.match('./', { ignoreSearch: true });
            if (shell) return shell;
          }
          return cached;
        });
      return cached || networkFetch;
    })
  );
});
