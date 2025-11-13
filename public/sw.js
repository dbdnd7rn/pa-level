/* Simple PWA service worker for Pa-Level */
const CACHE_NAME = "pa-level-v1";
const OFFLINE_URL = "/offline";

// Precache some essentials (add more if you like)
const PRECACHE = [
  "/",
  OFFLINE_URL,
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install: cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: take control immediately and clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Pages (navigations): Network first, fallback to /offline
// - Images/CSS/JS: Cache first, then network & update
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Handle navigations (pages)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static assets (images, styles, scripts) -> Cache, update in background
  const isAsset =
    req.destination === "image" ||
    req.destination === "style" ||
    req.destination === "script" ||
    req.destination === "font";

  if (isAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            return res;
          })
          .catch(() => cached || Promise.reject());
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: just try network
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
