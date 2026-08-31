// Fiestamatic Service Worker v4
// Auto-update strategy:
//   install  → skipWaiting()   (new SW activates immediately, no tab-close required)
//   activate → clients.claim() (takes control of all open tabs right away)
//              purge stale caches
//              broadcast SW_ACTIVATED so tabs can reload seamlessly
//
// Caching strategies:
//   App shell HTML  : StaleWhileRevalidate — always renders, silently refreshes
//   JS / CSS / icons: CacheFirst          — instant after first visit
//   Google Fonts    : CacheFirst (font cache)
//   Offline map     : bundled app asset; third-party map tiles are not cached
//   API             : NetworkOnly         — localStorage layer handles offline

const APP_CACHE  = 'fiestamatic-app-v5';
const FONT_CACHE = 'fiestamatic-fonts-v1';

const VALID_CACHES = new Set([APP_CACHE, FONT_CACHE]);

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/offline-map.svg',
];

// ─── Install ──────────────────────────────────────────────────────────────────
// skipWaiting() makes the new SW active immediately — no need to close tabs.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) =>
      Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url)))
    )
  );
  // Activate without waiting for existing tabs to close.
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
// clients.claim() lets this SW control tabs that were opened before it activated.
// Then we purge any stale cache versions and tell every tab to reload.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Purge old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !VALID_CACHES.has(k)).map((k) => caches.delete(k))
      );

      // 2. Claim all open clients immediately
      await self.clients.claim();

      // 3. Tell every open tab that a new SW has taken over → triggers reload
      const allClients = await self.clients.matchAll({ type: 'window' });
      for (const client of allClients) {
        client.postMessage({ type: 'SW_ACTIVATED' });
      }
    })()
  );
});

// ─── Message: SKIP_WAITING ────────────────────────────────────────────────────
// The frontend can send { type: 'SKIP_WAITING' } to force activation of a
// waiting SW (useful if you ever switch to a user-prompt update flow later).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept sw.js itself — let the browser manage SW script fetching
  if (url.pathname.endsWith('/sw.js')) return;

  // 1. API — NetworkOnly (app-level localStorage handles offline)
  if (url.pathname.startsWith('/api')) return;

  // 2. Third-party map tiles are left to the browser's normal HTTP cache.
  // OpenStreetMap's standard tile policy forbids offline prefetch/download.
  if (url.hostname === 'tile.openstreetmap.org') return;

  // 3. Google Fonts — CacheFirst (dedicated font cache)
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(event.request, FONT_CACHE));
    return;
  }

  // 4. Navigation (HTML) — NetworkFirst: always pick up the latest deployed
  //    index when online; use the cached shell only when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  // 5. JS / CSS / images / icons — CacheFirst
  event.respondWith(cacheFirst(event.request, APP_CACHE));
});

// ─── Caching strategies ───────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    if (request.destination === 'image') {
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <rect width="64" height="64" fill="#f5ede0"/>
          <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="28">🎉</text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      await cache.put(request, response.clone());
      // Keep the app-shell fallback in sync with the latest HTML as well.
      await cache.put('/', response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request) || await cache.match('/');
    return cached || new Response('Offline', { status: 503 });
  }
}
