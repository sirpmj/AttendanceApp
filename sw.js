const CACHE_NAME = "attendance-app-v1";

// 🔥 Files to cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

// 🔹 Install - cache files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Cache opened");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting(); // activate immediately
});

// 🔹 Activate - clean old cache
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Old cache removed:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// 🔹 Fetch - serve from cache (offline support)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return (
        res ||
        fetch(e.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, response.clone());
            return response;
          });
        }).catch(() => {
          // 🔥 Optional fallback
          if (e.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        })
      );
    })
  );
});
