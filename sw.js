const CACHE = "fotomu-phase3d2-v3";
const APP = ["./","./index.html","./kegiatan.html","./rak.html","./kelola-foto.html","./admin.html","./manifest.json"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(response => {
    const copy=response.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
    return response;
  }).catch(()=>caches.match(e.request)));
});