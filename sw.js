// Minimale service worker - nodig zodat Chrome/Android de app als "installeerbaar"
// beschouwt (samen met manifest.json). Doet verder geen caching, dus internet
// blijft nodig om de app te openen.
self.addEventListener("install", function(event) {
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
  event.respondWith(fetch(event.request));
});
