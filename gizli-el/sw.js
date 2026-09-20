/* Servis işçisi.
 * ÖNEMLİ: ilk sürüm cache-first idi ve önbellek adı sabitti; bir kez
 * önbelleğe alınınca güncellemeler kullanıcıya HİÇ ulaşmıyordu.
 * Artık ağ önce, önbellek yedek: çevrimiçiyken hep güncel, çevrimdışıyken
 * çalışmaya devam eder. */
const SURUM = '2026-09-20-2';
const AD = 'gizliel-' + SURUM;
const DOSYALAR = ['./', './index.html', './sim.js', './ui.js', './tohumlar.js', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(AD).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== AD).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('/sw.js')) return;          // işçinin kendisi asla önbellekten

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.ok){
          const kopya = res.clone();
          caches.open(AD).then(c => c.put(e.request, kopya)).catch(()=>{});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
