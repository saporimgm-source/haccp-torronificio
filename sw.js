/* HACCP Torronificio – funziona anche senza segnale */
var VER = 'haccp-shell-v1';
var SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('haccp-shell-') === 0 && k !== VER; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) {
    // prima la rete (per avere gli aggiornamenti), se manca il segnale la copia salvata
    e.respondWith(fetch(e.request).then(function (r) { var c = r.clone(); caches.open(VER).then(function (k) { k.put(e.request, c); }); return r; }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); }); }));
    return;
  }
  if (/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(u.host)) {
    e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request).then(function (n) { var c = n.clone(); caches.open(VER).then(function (k) { k.put(e.request, c); }); return n; }); }));
  }
});
