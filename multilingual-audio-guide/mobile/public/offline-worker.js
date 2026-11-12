const shellCache = 'saigon-guide-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' && url.pathname === '/') {
    event.respondWith(
      fetch(request).catch(async () => {
        const saved = await caches.match(new URL('/', self.location.origin), {
          cacheName: shellCache,
        });
        return saved || Response.error();
      })
    );
  } else if (
    url.pathname.startsWith('/_expo/static/') ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches
        .match(request, { cacheName: shellCache })
        .then((saved) => saved || fetch(request))
    );
  }
});