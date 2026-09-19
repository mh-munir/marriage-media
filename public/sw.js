/* Marriage Media Service Worker */

const STATIC_CACHE = "marriage-media-static-v1";
const DYNAMIC_CACHE = "marriage-media-dynamic-v1";

const PRE_CACHE_URLS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRE_CACHE_URLS).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) return;
  if (event.request.url.includes("/_next/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((response) => response || caches.match("/")))
  );
});