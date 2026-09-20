const SURUM = '2026-09-20-1';
const AD = 'veba-' + SURUM;
const DOSYALAR = ['./','./index.html','./cekirdek.js','./ui.js','./manifest.webmanifest'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(AD).then(c=>c.addAll(DOSYALAR)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==AD).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
// Ağ önce: güncellemeler kullanıcıya ULAŞSIN. (Önceki projede cache-first
// yüzünden düzeltmeler telefona hiç inmemişti.)
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('/sw.js')) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res && res.ok){ const k = res.clone(); caches.open(AD).then(c=>c.put(e.request,k)).catch(()=>{}); }
    return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
