const CACHE = "aasb-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then((res) => {
      return (
        res ||
        fetch(request).then((net) => {
          // cache-first for static GETs
          if (
            request.method === "GET" &&
            new URL(request.url).origin === location.origin
          ) {
            const copy = net.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return net;
        })
      );
    })
  );
});
