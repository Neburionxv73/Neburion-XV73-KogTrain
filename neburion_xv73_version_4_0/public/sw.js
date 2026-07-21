const VERSION = "4.0.0";
const STATIC_CACHE = `neburion-xv73-static-${VERSION}`;
const PAGE_CACHE = `neburion-xv73-pages-${VERSION}`;
const CORE = [
  "/", "/dashboard", "/session", "/training", "/memory-lab", "/attention-lab",
  "/logic-lab", "/language-lab", "/visual-lab", "/coach", "/progress", "/achievements",
  "/profile", "/settings", "/app-status", "/offline", "/manifest.webmanifest",
  "/icons/icon-192.png", "/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(PAGE_CACHE).then(cache => cache.addAll(CORE)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("neburion-xv73") && ![STATIC_CACHE, PAGE_CACHE].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) caches.open(PAGE_CACHE).then(cache => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/offline")) || Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok && ["style", "script", "image", "font", "manifest"].includes(request.destination)) {
          caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
