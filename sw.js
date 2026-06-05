/* Service worker for the Dragon Wizard.
   Precaches the app shell + all screenshots + CDN libs on first online load,
   then serves everything cache-first so the full flow works OFFLINE afterwards.
   20260605102859 is replaced with a fresh token on every deploy to bust the cache. */
const CACHE = "dragon-wizard-20260605102859";

const ASSETS = [
  "./",
  "./index.html",
  "./app.jsx",
  "./styles.css",
  "./assets/gameloft-logo.png",
  "./assets/v1-home.jpg",
  "./assets/v1-search.jpg",
  "./assets/v1-details.jpg",
  "./assets/v2-home.jpg",
  "./assets/v2-search.jpg",
  "./assets/v2-details.jpg",
  // CDN libraries (unpkg + Google Fonts all send CORS headers, so these
  // cache as readable responses and still satisfy the <script integrity> hashes)
  "https://unpkg.com/react@18.3.1/umd/react.development.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js",
  "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
];

// Install: cache each asset. Use catch-per-item so one failure can't abort the whole install.
self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(
        ASSETS.map(function (url) {
          return cache.add(new Request(url, { cache: "reload" })).catch(function () {});
        })
      );
    })
  );
});

// Activate: drop caches from previous builds.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) { if (k !== CACHE) return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Fetch: cache-first (ignoring the ?v= cache-bust query so versioned URLs still match).
// On a cache miss, fetch from network and store a copy for next time. Offline + miss = fail.
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); }).catch(function () {});
        return res;
      }).catch(function () { return cached; });
    })
  );
});
