const AD = 'gizliel-v1';
const DOSYALAR = ['./', './index.html', './sim.js', './ui.js', './tohumlar.js', './manifest.webmanifest'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(AD).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== AD).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const kopya = res.clone();
    caches.open(AD).then(c => c.put(e.request, kopya)).catch(()=>{});
    return res;
  }).catch(() => caches.match('./index.html'))));
});
