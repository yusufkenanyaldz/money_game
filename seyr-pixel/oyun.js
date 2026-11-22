'use strict';
/* =========================================================================
   SEYR PIXEL — 1. bölüm: Gaflet Ovası
   Oyun 180 piksel yükseklikte çizilir; genişlik ekranın oranına göre (280–480). Ekranı tam doldurur.
   Savaşın kuralı: düşman saldırmadan önce hazırlanır (gözleri kızarır, "!").
   Hazırlanırken vurursan kılıç seker. Saldırısını tam zamanında kaçınırsan
   düşman sersemler ve o arada vuruşun iki kat işler.
   ========================================================================= */
let W = 320; const H = 180, ZEMIN = 150;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const META = window.META, SERIT = window.SERIT;
/* Düşman görselleri (Gemini → pixel-isle --grup). Olmayan hareket için kodla çizilmiş yer tutucu kullanılır. */
const DM = {}; for (const g in (window.DUSMAN || {})) { DM[g] = { meta: DUSMAN[g].meta, img: {} }; for (const k in DUSMAN[g].serit) { const i = new Image(); i.src = DUSMAN[g].serit[k]; DM[g].img[k] = i; } }
// saldırı şeridinde hazırlanma ve vuruş kareleri: [hazırlanma başı, vuruş başı, vuruş sonu]
// [hazırlanma başı, vuruş başı, vuruş sonu, (dev) sersemken oynayan son kare]
/* Yadigârlar: bölüm sonu canavarından düşer, kalıcıdır (Defter kaydında). */
const YADIGAR = { abihayat: { ad: 'Âb-ı Hayat Damlası', etki: 'Düşmanlar %30 daha uzun sersem kalır.' } };
const varMi = k => !!(window.__defter && __defter.D.yadigar && __defter.D.yadigar[k]);
const sersemSure = T => T.sersem * (varMi('abihayat') ? 1.3 : 1);
const YIMG = {}; for (const k in (window.UI || {})) { const i = new Image(); i.src = UI[k]; YIMG[k] = i; }
const SALDIRI_KARE = { golge: [0, 20, 40], dev: [0, 27, 33, 62] };
const IMG = {};
for (const k in SERIT) { const i = new Image(); i.src = SERIT[k]; IMG[k] = i; }
function boyutla() {
  // ekranın tamamını kapla: yükseklik 180 oyun pikseli, genişlik ekran oranından. Telefonun yüksek piksel yoğunluğunda
  // tam sayı olmayan büyütme göze batmaz.
  const vw = innerWidth, vh = innerHeight;
  W = Math.max(280, Math.min(480, Math.round(vw / (vh / H))));
  const k = Math.min(vh / H, vw / W);
  if (cv.width !== W) { cv.width = W; ctx.imageSmoothingEnabled = false; }
  cv.style.width = Math.round(W * k) + 'px'; cv.style.height = Math.round(H * k) + 'px';
}
addEventListener('resize', boyutla); boyutla();
const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => v < a ? a : v > b ? b : v;

/* ---------- Ses (sentez, şimdilik) ---------- */
let AC = null;
/* Videoların kendi sesleri (ses-isle.py → window.SESLER). Yüklenmemişse sentez sese düşer. */
const BUF = {}; let sesYuklendi = false;
function sesYukle() { if (sesYuklendi || !AC || !window.SESLER) return; sesYuklendi = true;
  for (const k in SESLER) fetch(SESLER[k]).then(r => r.arrayBuffer()).then(a => AC.decodeAudioData(a)).then(b => BUF[k] = b).catch(() => {}); }
function dosya(k, vol = .8) { if (!AC || !BUF[k]) return false; const s = AC.createBufferSource(), g = AC.createGain();
  s.buffer = BUF[k]; s.playbackRate.value = .96 + Math.random() * .08; g.gain.value = vol; s.connect(g); g.connect(AC.destination); s.start(); return true; }
function sesAc() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }); } catch (e) {} } if (AC && AC.state !== 'running') AC.resume().catch(() => {}); sesYukle(); }
function ton(f, sure, tip = 'square', vol = .06, kay = 0) {
  if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = tip; o.frequency.setValueAtTime(f, t); if (kay) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + kay), t + sure);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + sure);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + sure);
}
const SES = {
  vur: () => ton(220, .08, 'square', .05, -120), isabet: () => { ton(140, .12, 'square', .07, -80); ton(70, .15, 'triangle', .08); },
  sek: () => { ton(1200, .06, 'square', .04); ton(900, .08, 'square', .03); }, kac: () => ton(500, .12, 'triangle', .04, 300),
  kactin: () => { ton(660, .08, 'square', .04); setTimeout(() => ton(990, .12, 'square', .04), 70); },
  yara: () => ton(110, .25, 'sawtooth', .07, -60), hazir: () => ton(330, .1, 'square', .025),
  ol: () => ton(200, .3, 'triangle', .06, -150), dev: () => { ton(55, .5, 'sawtooth', .1, -20); ton(80, .35, 'square', .06, -40); },
  amel: () => { ton(784, .1, 'triangle', .04); setTimeout(() => ton(1046, .14, 'triangle', .04), 80); },
  tesbih: n => ton(n % 33 === 0 ? 1320 : 880, .05, 'triangle', .03),
  guc: () => [392, 523, 659].forEach((f, i) => setTimeout(() => ton(f, .12, 'triangle', .05), i * 50)),
  bos: () => ton(150, .1, 'square', .03),
  bitti: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => ton(f, .18, 'square', .04), i * 120)),
};

/* ---------- Girdi ---------- */
const tus = { sol: false, sag: false };
const basla = () => { sesAc(); const y = document.getElementById('yardim'); if (y) y.hidden = true; };
addEventListener('keydown', e => {
  basla(); if (e.repeat) return;
  if (e.key === 'ArrowLeft') tus.sol = true; if (e.key === 'ArrowRight') tus.sag = true;
  if (e.key === 'j' || e.key === 'J') saldir(); if (e.key === 'k' || e.key === 'K') kacin();
  if ((e.key === 'Enter' || e.key === ' ') && OYUN.durum !== 'oyun') yeniden();
});
addEventListener('keyup', e => { if (e.key === 'ArrowLeft') tus.sol = false; if (e.key === 'ArrowRight') tus.sag = false; });
function dugme(id, bas, birak) {
  const b = document.getElementById(id); if (!b) return;
  b.addEventListener('pointerdown', e => { e.preventDefault(); basla(); b.classList.add('on'); bas(); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => { b.classList.remove('on'); birak && birak(); });
}
dugme('sol', () => tus.sol = true, () => tus.sol = false);
dugme('sag', () => tus.sag = true, () => tus.sag = false);
dugme('vur', () => saldir()); dugme('kac', () => kacin());
cv.addEventListener('pointerdown', () => { basla(); if (OYUN.durum !== 'oyun') yeniden(); });

/* ---------- Oyuncu ---------- */
// saldırı: videonun 6. karesinden (kılıç kalkmış) oynat; 9. karede kılıç izi başlar = isabet
const SALDIRI = { bas: 6, isabet: 9, hiz: 1.8, menzil: 44 };
const KACIN = { hiz: 1.7, dokunulmaz: [1, 11], geri: 70 };
const P = { x: 40, yon: 1, can: 5, max: 5, guclu: false, kalkan: 0, inv: 0, eylem: null, et: 0, isabet: false, bas: 0, t: 0, tb: 0, yara: 0, kacti: false };

function saldir() {
  if (OYUN.durum !== 'oyun' || P.eylem) return;
  P.eylem = 'saldiri'; P.et = 0; P.isabet = false; if (!BUF['p-saldiri']) SES.vur();
}
function kacin() {
  if (OYUN.durum !== 'oyun') return;
  if (P.eylem === 'kacin') return;
  // saldırıyı isabetten önce kesemezsin (karar ver); isabetten sonra kaçınabilirsin
  if (P.eylem === 'saldiri' && saldiriKare() < SALDIRI.isabet + 2) return;
  P.eylem = 'kacin'; P.et = 0; P.kacti = false; dosya('p-kacin', .7) || SES.kac();
}
const saldiriKare = () => SALDIRI.bas + Math.floor(P.et * META.saldiri.fps * SALDIRI.hiz);
const tekKare = (ad, hiz) => Math.min(META[ad].n - 1, Math.floor(P.et * META[ad].fps * hiz));
const kacinKare = () => Math.floor(P.et * META.kacin.fps * KACIN.hiz);
const dokunulmaz = () => P.inv > 0 || (P.eylem === 'kacin' && kacinKare() >= KACIN.dokunulmaz[0] && kacinKare() <= KACIN.dokunulmaz[1]);

function oyuncuVuruldu(hasar, kaynakX) {
  if (P.kalkan > 0 && !dokunulmaz()) { P.kalkan = 0; P.inv = .6; yazi(P.x, 'nur kalkanı', '#ffe9a8'); SES.kactin(); titret(1, .1); return 'kacti'; }
  if (dokunulmaz()) {           // tam zamanında kaçtı
    if (!P.kacti) { P.kacti = true; yazi(P.x, 'kaçtın', '#9fd6ff'); SES.kactin(); }
    return 'kacti';
  }
  P.can -= hasar; P.inv = 1; P.yara = .25; dosya('p-darbe', .8) || SES.yara(); titret(3, .2);
  P.eylem = META.darbe ? 'darbe' : null; P.et = 0;
  P.x += Math.sign(P.x - kaynakX || -P.yon) * 16;
  yazi(P.x, '-' + hasar, '#ff7b6b');
  if (P.can <= 0) { P.can = 0; OYUN.durum = 'dustu'; OYUN.t = 0; dosya('p-yenilme', .8) || SES.ol(); }
  return 'yara';
}

/* ---------- Düşmanlar ---------- */
const TUR = {
  golge: { can: 3, hiz: 30, menzil: 30, hazir: .55, saldiri: .18, hamle: 60, hasar: 1, sersem: .9, w: 18, h: 22, renk: '#2a2236', koyu: '#16111f' },
  dev:   { can: 14, hiz: 18, menzil: 50, hazir: .9, saldiri: .25, hamle: 0, hasar: 2, sersem: 1.2, w: 40, h: 52, renk: '#7a2418', koyu: '#3d120c', dalga: true },
};
const E = [];
function dog(tur, x) { const T = TUR[tur]; E.push({ tur, T, x, can: T.can, durum: 'yaklas', t: 0, bekle: rnd(.3, 1), flas: 0, kx: 0, yon: -1, saldiriSirasi: false, isabet: false }); }
const dalgalar = [];   // şok dalgaları (Kızıl Dev)

function vurusKontrol() {
  P.gucluVurus = P.guclu; P.guclu = false;   // Alp: hazırlanmış güçlü darbe bu vuruşta harcanır
  for (const e of E) {
    if (e.durum === 'ol') continue;
    const dx = (e.x - P.x) * P.yon;
    if (dx < -6 || dx > SALDIRI.menzil + e.T.w / 2) continue;
    if (e.durum === 'hazir' && !P.gucluVurus) { yazi(e.x, 'tok!', '#d9ad4f'); SES.sek(); e.flas = .1; continue; }   // hazırlanırken zırhlı
    let hasar = e.durum === 'sersem' ? 2 : 1;
    if (P.gucluVurus) { hasar = 3; if (e.durum === 'hazir' || e.durum === 'yaklas') { e.durum = 'sersem'; e.t = 0; } titret(3, .15); }
    e.can -= hasar; e.flas = .15; e.darbeT = 0; e.kx = P.yon * (e.tur === 'dev' ? 3 : 10); SES.isabet(); dosya(e.tur === 'dev' ? 'd-darbe' : 'g-darbe', .6); titret(e.tur === 'dev' ? 2 : 1, .1);
    yazi(e.x, hasar > 1 ? '-2!' : '-1', hasar > 1 ? '#ffd36b' : '#ffffff');
    if (e.can <= 0) { e.durum = 'ol'; e.t = 0; dosya(e.tur === 'dev' ? 'd-ol' : 'g-ol', .8) || SES.ol(); if (e.tur === 'dev') { OYUN.devOldu = true; OYUN.dusen = { k: 'abihayat', x: e.x, y: ZEMIN - 70, vy: -40, t: 0 }; } }
    else if (e.durum !== 'sersem' && e.tur === 'golge') { e.durum = 'geri'; e.t = 0; }
  }
}

function dusmanlar(dt) {
  const saldiranVar = E.some(e => e.durum === 'hazir' || e.durum === 'saldir');
  for (const e of E) {
    const T = e.T; e.t += dt; e.flas = Math.max(0, e.flas - dt); e.x += e.kx; e.kx *= .6;
    const dx = P.x - e.x, ux = Math.abs(dx); if (e.durum !== 'saldir') e.yon = Math.sign(dx) || e.yon;
    if (e.durum === 'ol') continue;
    if (e.durum === 'yaklas') {
      if (ux > T.menzil) e.x += Math.sign(dx) * T.hiz * dt;
      e.bekle -= dt;
      if (ux <= T.menzil + 4 && e.bekle <= 0 && (!saldiranVar || e.tur === 'dev') && OYUN.durum === 'oyun') { e.durum = 'hazir'; e.t = 0; SES.hazir(); }
    } else if (e.durum === 'hazir') {
      const hazir = T.hazir * (e.tur === 'dev' && e.can <= T.can / 2 ? .75 : 1);   // dev yarı canında hızlanır
      if (e.t >= hazir) { e.durum = 'saldir'; e.t = 0; e.isabet = false; dosya(e.tur === 'dev' ? 'd-saldiri' : 'g-saldiri', .75); if (e.tur === 'dev') { if (!BUF['d-saldiri']) SES.dev(); titret(4, .3); } }
    } else if (e.durum === 'saldir') {
      e.x += e.yon * T.hamle * dt;
      if (!e.isabet && e.t >= T.saldiri * .5) {
        e.isabet = true; let sonuc = null;
        if (Math.abs(P.x - e.x) < T.menzil + 6) sonuc = oyuncuVuruldu(T.hasar, e.x);
        if (T.dalga) for (const y of [-1, 1]) dalgalar.push({ x: e.x + y * 20, yon: y, t: 0, isabet: false });
        e.kactiMi = sonuc === 'kacti';
      }
      if (e.t >= T.saldiri) {
        if (e.kactiMi || e.tur === 'dev') { e.durum = 'sersem'; e.t = 0; if (e.kactiMi) yazi(e.x, 'sersem', '#ffd36b'); }
        else { e.durum = 'geri'; e.t = 0; }
      }
    } else if (e.durum === 'sersem') {
      if (e.t >= sersemSure(T)) { e.durum = 'geri'; e.t = 0; }
    } else if (e.durum === 'geri') {
      e.x -= Math.sign(dx) * T.hiz * .8 * dt;
      if (e.t >= .6) { e.durum = 'yaklas'; e.t = 0; e.bekle = rnd(.6, 1.4); }
    }
  }
  for (let i = E.length - 1; i >= 0; i--) { const e = E[i], om = DM[e.tur] && DM[e.tur].meta.ol; if (e.durum === 'ol' && e.t > (om ? om.n / om.fps / 1.5 : .6)) E.splice(i, 1); }
  for (const e of E) if (e.darbeT !== undefined) e.darbeT += dt;
  for (let i = dalgalar.length - 1; i >= 0; i--) {
    const d = dalgalar[i]; d.t += dt; d.x += d.yon * 120 * dt;
    if (!d.isabet && Math.abs(d.x - P.x) < 8) { d.isabet = true; oyuncuVuruldu(1, d.x - d.yon * 10); }
    if (d.t > .9) dalgalar.splice(i, 1);
  }
}

/* ---------- Bölüm ---------- */
const BOLUM = {
  ad: 'Gaflet Ovası', uzunluk: 1500,
  gruplar: [{ x: 260, d: ['golge', 'golge'] }, { x: 620, d: ['golge', 'golge', 'golge'] }, { x: 980, d: ['golge', 'golge', 'golge', 'golge'] }],
  dev: 1320,
};
const OYUN = { durum: 'giris', t: 0, kam: 0, grup: 0, kilit: null, devOldu: false, devGeldi: false, kontrol: 40, titre: 0, tsure: 0 };
function yeniden() {
  sesAc(); if (OYUN.durum === 'dustu' && OYUN.t < 2.2) return;
  if (OYUN.durum === 'bitti') { OYUN.grup = 0; OYUN.kontrol = 40; OYUN.devGeldi = false; OYUN.devOldu = false; }
  E.length = 0; dalgalar.length = 0;
  P.x = OYUN.kontrol; P.can = P.max; P.inv = 1; P.eylem = null; P.yon = 1;
  if (OYUN.devGeldi && !OYUN.devOldu) { OYUN.devGeldi = false; }
  OYUN.kilit = null; OYUN.durum = 'oyun'; OYUN.t = 0;
}
function yadigarAl(d) {
  d.alindi = true; const yeni = !varMi(d.k);
  if (yeni && window.__defter) __defter.yadigar(d.k);
  SES.guc(); setTimeout(() => SES.bitti(), 250);
  const y = YADIGAR[d.k], el = document.getElementById('yadigar');
  if (el && yeni) { el.querySelector('b').textContent = y.ad; el.querySelector('p').textContent = y.etki; el.hidden = false; durdu = true;
    el.onclick = () => { el.hidden = true; durdu = false; son = performance.now(); }; }
  else yazi(P.x, y.ad, '#9fe8ff');
}
function bolumGuncelle() {
  const g = BOLUM.gruplar[OYUN.grup];
  if (g && P.x > g.x - 120 && !OYUN.kilit) {
    OYUN.kilit = [g.x - 150, g.x + 150]; g.d.forEach((t, i) => dog(t, i % 2 ? g.x - 190 - i * 12 : g.x + 70 + i * 22));   // çoğu önden, bazıları arkadan sokulur
  }
  if (OYUN.kilit && E.every(e => e.durum === 'ol')) {
    if (g) { OYUN.grup++; OYUN.kontrol = g.x; yazi(P.x, 'temiz', '#b9e08a'); }
    OYUN.kilit = null;
  }
  if (!g && !OYUN.devGeldi && P.x > BOLUM.dev - 140) {
    OYUN.devGeldi = true; OYUN.kontrol = BOLUM.dev - 200; dog('dev', BOLUM.dev + 60); OYUN.kilit = [BOLUM.dev - 170, BOLUM.dev + 150];
    mesaj('KIZIL DEV', 2);
  }
  const d = OYUN.dusen;
  if (d && !d.alindi) {   // yadigâr düşer, karakter üstünden geçince alınır
    d.t += 1 / 60; d.vy += 220 / 60; d.y = Math.min(ZEMIN - 18, d.y + d.vy / 60);
    if (d.y >= ZEMIN - 18) { d.yer = (d.yer || 0) + 1 / 60; if (d.yer > .8) d.x += Math.sign(P.x - d.x) * Math.min(Math.abs(P.x - d.x), 70 / 60); }   // yere inince oyuncuya süzülür
    if (d.y >= ZEMIN - 18 && Math.abs(P.x - d.x) < 12) yadigarAl(d);
  }
  if (OYUN.devOldu && OYUN.durum === 'oyun' && E.length === 0 && (!d || d.alindi)) { OYUN.durum = 'bitti'; OYUN.t = 0; SES.bitti(); setTimeout(() => dosya('p-zafer', .7), 300); }
}

/* ---------- Efektler ---------- */
const yazilar = []; let msj = null;
function yazi(x, s, c) {   // aynı yerde yeni yazı varsa üstüne yığ, çakışmasın
  let y = ZEMIN - 60; for (const o of yazilar) if (Math.abs(o.x - x) < 40 && o.t > .5 && Math.abs(o.y - y) < 10) y = o.y - 11;
  yazilar.push({ x, y, s, c, t: .9 });
}
function mesaj(s, t) { msj = { s, t }; }
function titret(g, s) { OYUN.titre = Math.max(OYUN.titre, g); OYUN.tsure = Math.max(OYUN.tsure, s); }

/* ---------- Güncelleme ---------- */
function guncelle(dt) {
  if (OYUN.durum !== 'oyun') { OYUN.t += dt; return; }
  P.inv = Math.max(0, P.inv - dt); P.yara = Math.max(0, P.yara - dt);
  if (P.eylem === 'saldiri') {
    P.et += dt; const f = saldiriKare();
    if (!P.isabet && f >= SALDIRI.isabet) { P.isabet = true; dosya('p-saldiri', .7); vurusKontrol(); }
    if (f >= META.saldiri.n) P.eylem = null;
  } else if (P.eylem === 'darbe') {
    P.et += dt; if (P.et * META.darbe.fps * 1.6 >= META.darbe.n) P.eylem = null;
  } else if (P.eylem === 'kacin') {
    P.et += dt; const f = kacinKare();
    P.x -= P.yon * KACIN.geri * Math.max(0, 1 - P.et / .55) * dt;
    if (f >= META.kacin.n) P.eylem = null;
  }
  const yon = P.eylem ? 0 : (tus.sag ? 1 : 0) - (tus.sol ? 1 : 0);
  if (yon) { P.yon = yon; P.bas += dt; P.t += dt; } else { P.bas = 0; P.tb += dt; }
  const kos = yon && P.bas > .5;
  P.x += yon * (kos ? 82 : 36) * dt;
  const sinir = OYUN.kilit || [10, BOLUM.uzunluk];
  P.x = clamp(P.x, sinir[0] + 10, sinir[1] - 10);
  if (OYUN.sezgi > 0) OYUN.sezgi -= dt;
  dusmanlar(OYUN.sezgi > 0 ? dt * .4 : dt); bolumGuncelle();
  const hedef = clamp(P.x - W / 2 + P.yon * 30, 0, BOLUM.uzunluk - W);
  OYUN.kam += (hedef - OYUN.kam) * Math.min(1, dt * 5);
  if (OYUN.tsure > 0) { OYUN.tsure -= dt; if (OYUN.tsure <= 0) OYUN.titre = 0; }
  for (let i = yazilar.length - 1; i >= 0; i--) { yazilar[i].t -= dt; yazilar[i].y -= 18 * dt; if (yazilar[i].t <= 0) yazilar.splice(i, 1); }
  if (msj) { msj.t -= dt; if (msj.t <= 0) msj = null; }
}

/* ---------- Çizim: Gaflet Ovası ---------- */
const PAL = { gok: ['#2b2d55', '#3d3a66', '#5b4a74', '#8a5a6e', '#c27a5e', '#e2a15e'], gunes: '#f3d27a', dag1: '#4a4a75', dag2: '#3b5a4d',
  servi: '#1f3b2c', ot: '#4f7a3a', ot2: '#3d6430', toprak: '#6b4a2f', toprak2: '#5a3d26', yol: '#a7845a', tas: '#8a6a45', cicek: ['#e2c35c', '#d96a5a', '#e8e2d0'] };
const hash = i => { let h = i * 374761393; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function arkaPlan(kam) {
  const bant = 18; PAL.gok.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * bant, W, bant + 1); });
  ctx.fillStyle = PAL.gunes; const gx = 230 - Math.round(kam * .03); ctx.fillRect(gx, 70, 22, 6); ctx.fillRect(gx + 3, 66, 16, 14); ctx.fillRect(gx + 6, 64, 10, 18);
  ctx.fillStyle = PAL.gok[5]; ctx.fillRect(0, 6 * bant, W, 40);
  for (const [renk, h, par, per, taban] of [[PAL.dag1, 30, .15, 70, 120], [PAL.dag2, 22, .35, 45, 136]]) {
    ctx.fillStyle = renk;
    for (let x = 0; x < W; x++) { const w = x + kam * par; const y = Math.round(taban - h * (.5 + .5 * Math.sin(w / per) * Math.cos(w / (per * 1.9)))); ctx.fillRect(x, y, 1, ZEMIN - y); }
  }
  // serviler (orta katman)
  ctx.fillStyle = PAL.servi;
  for (let i = Math.floor(kam * .5 / 90) - 1; i < Math.floor(kam * .5 / 90) + 6; i++) {
    if (hash(i + 3) < .45) continue; const x = Math.round(i * 90 + hash(i) * 50 - kam * .5), h = 26 + Math.round(hash(i + 9) * 16);
    for (let k = 0; k < h; k++) { const w = Math.max(1, Math.round(5 * Math.sin(Math.PI * Math.min(1, (k + 2) / h)))); ctx.fillRect(x - (w >> 1), ZEMIN - 2 - k, w, 1); }
  }
  // zemin
  for (let x = -16; x < W + 16; x += 16) {
    const wx = Math.floor((x + kam) / 16), ox = Math.round(x - (((kam % 16) + 16) % 16));
    ctx.fillStyle = PAL.ot; ctx.fillRect(ox, ZEMIN, 16, 4); ctx.fillStyle = PAL.ot2; ctx.fillRect(ox + ((wx * 5) & 7), ZEMIN, 3, 1);
    ctx.fillStyle = PAL.yol; ctx.fillRect(ox, ZEMIN + 4, 16, 8); ctx.fillStyle = PAL.tas; ctx.fillRect(ox + ((wx * 7) & 11), ZEMIN + 6, 3, 2);
    ctx.fillStyle = (wx & 1) ? PAL.toprak : PAL.toprak2; ctx.fillRect(ox, ZEMIN + 12, 16, H - ZEMIN - 12);
    if (hash(wx + 50) < .3) { ctx.fillStyle = PAL.cicek[(wx & 3) % 3]; ctx.fillRect(ox + 4, ZEMIN - 2, 2, 2); ctx.fillStyle = PAL.ot2; ctx.fillRect(ox + 5, ZEMIN, 1, 1); }
  }
}
function sprite(st, f, sx, yon) {
  const M = META[st], im = IMG[st]; if (!M || !im || !im.complete || !im.naturalWidth) return;
  const x = Math.round(sx - M.w / 2), y = ZEMIN - (M.taban ?? M.h - 1);
  ctx.save(); if (yon !== M.yon) { ctx.translate(Math.round(sx) * 2, 0); ctx.scale(-1, 1); }
  ctx.drawImage(im, f * M.w, 0, M.w, M.h, x, y, M.w, M.h); ctx.restore();
}
function oyuncuCiz(kam) {
  const sx = P.x - kam;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(Math.round(sx - 12), ZEMIN, 24, 2);
  if (P.inv > 0 && Math.floor(P.inv * 16) % 2 && !P.eylem && OYUN.durum === 'oyun') return;
  let st, f;
  if (P.eylem === 'saldiri') { st = 'saldiri'; f = Math.min(META.saldiri.n - 1, saldiriKare()); }
  else if (P.eylem === 'kacin') { st = 'kacin'; f = Math.min(META.kacin.n - 1, kacinKare()); }
  else if ((tus.sag || tus.sol) && OYUN.durum === 'oyun') { st = P.bas > .5 ? 'kos' : 'yuru'; f = Math.floor(P.t * META[st].fps) % META[st].n; }
  else { st = 'bekle'; f = Math.floor(P.tb * META.bekle.fps) % META.bekle.n; }
  if (P.eylem === 'darbe') { st = 'darbe'; f = tekKare('darbe', 1.6); }
  if (OYUN.durum === 'dustu') { if (META.yenilme) { st = 'yenilme'; f = Math.min(META.yenilme.n - 1, Math.floor(OYUN.t * META.yenilme.fps * 1.4)); } else { st = 'bekle'; f = 0; ctx.globalAlpha = Math.max(.2, 1 - OYUN.t); } }
  if (OYUN.durum === 'bitti' && META.zafer) { st = 'zafer'; f = Math.min(META.zafer.n - 1, Math.floor(OYUN.t * META.zafer.fps)); }
  if (P.guclu) ctx.filter = `drop-shadow(0 0 2px #ffd36b) brightness(${1.1 + .15 * Math.sin(OYUN.zaman * 12)})`;
  sprite(st, f, sx, P.yon); ctx.globalAlpha = 1; ctx.filter = 'none';
  if (P.kalkan > 0) { ctx.strokeStyle = `rgba(255,233,168,${.55 + .25 * Math.sin(OYUN.zaman * 6)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(Math.round(sx) + .5, ZEMIN - 30.5, 20, 33, 0, 0, 7); ctx.stroke(); }
}
function dusmanSprite(e, kam) {
  const D = DM[e.tur]; if (!D) return false;
  const M = D.meta, T = e.T, sx = Math.round(e.x - kam);
  let st = 'bekle', f = 0; const tek = (ad, p) => { st = ad; f = Math.min(M[ad].n - 1, Math.floor(p * M[ad].n)); };
  const K = SALDIRI_KARE[e.tur];
  if (e.durum === 'ol' && M.ol) tek('ol', e.t * 1.5 * M.ol.fps / M.ol.n);
  else if (e.durum === 'hazir' && M.saldiri && K[1]) { st = 'saldiri'; f = K[0] + Math.floor(Math.min(1, e.t / T.hazir) * (K[1] - K[0] - 1)); }
  else if (e.durum === 'saldir' && M.saldiri && K[2]) { st = 'saldiri'; f = K[1] + Math.floor(Math.min(1, e.t / T.saldiri) * (K[2] - K[1])); }
  else if (e.durum === 'sersem' && M.saldiri && K[3]) { st = 'saldiri'; f = K[2] + Math.floor(Math.min(1, e.t / sersemSure(T)) * (K[3] - K[2])); }   // yere vurmuş, toz kalkıyor
  else if (e.darbeT !== undefined && M.darbe && e.darbeT < M.darbe.n / M.darbe.fps / 2.5 && e.durum !== 'hazir' && e.durum !== 'saldir') tek('darbe', e.darbeT * 2.5 * M.darbe.fps / M.darbe.n);
  else if ((e.durum === 'yaklas' || e.durum === 'geri') && M.yuru) { st = 'yuru'; f = Math.floor(OYUN.zaman * M.yuru.fps) % M.yuru.n; }
  else f = Math.floor(OYUN.zaman * M.bekle.fps + e.x) % M.bekle.n;
  const m = M[st], im = D.img[st]; if (!im || !im.complete || !im.naturalWidth) return false;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(sx - (T.w >> 1), ZEMIN, T.w, 2);
  ctx.save(); if (e.yon !== m.yon) { ctx.translate(sx * 2, 0); ctx.scale(-1, 1); }
  const kirmizi = e.tur === 'dev' && e.durum === 'hazir' && !M.saldiri && Math.floor(e.t * 10) % 2;   // saldırı klibi yoksa uyarı
  if (kirmizi) ctx.filter = 'sepia(1) saturate(4) hue-rotate(-30deg) brightness(1.2)';
  if (e.flas > 0) ctx.filter = 'brightness(2.2)';
  const yy = 0;
  ctx.drawImage(im, f * m.w, 0, m.w, m.h, Math.round(sx - m.w / 2), ZEMIN - (m.taban ?? m.h - 1) + yy, m.w, m.h); ctx.restore();
  // durum işaretleri (sprite'ın üstünde)
  const ust = ZEMIN - Math.round(T.h * (e.tur === 'dev' ? 1.7 : 1.9));
  if (e.durum === 'hazir') { ctx.fillStyle = '#ffd36b'; ctx.fillRect(sx, ust - 6, 2, 5); ctx.fillRect(sx, ust, 2, 1); }
  if (e.durum === 'sersem') { ctx.fillStyle = '#ffd36b'; const a = e.t * 8; for (let i = 0; i < 3; i++) ctx.fillRect(Math.round(sx + Math.cos(a + i * 2.1) * 7), Math.round(ust + 4 + Math.sin(a + i * 2.1) * 2), 1, 1); }
  if (e.tur === 'dev' && e.durum !== 'ol') { ctx.fillStyle = '#16111f'; ctx.fillRect(W / 2 - 61, 14, 122, 5); ctx.fillStyle = '#c0392b'; ctx.fillRect(W / 2 - 60, 15, Math.round(120 * e.can / T.can), 3); }
  return true;
}
function dusmanCiz(e, kam) {
  if (dusmanSprite(e, kam)) return;
  const T = e.T, sx = Math.round(e.x - kam); if (sx < -60 || sx > W + 60) return;
  let w = T.w, h = T.h, lean = 0;
  if (e.durum === 'hazir') { h -= 3; lean = -2; }
  if (e.durum === 'saldir') { w += 6; h -= 2; lean = 4; }
  if (e.durum === 'ol') { const k = Math.max(0, 1 - e.t / .6); h = Math.round(h * k); w = Math.round(w * (1 + (1 - k))); }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(sx - (T.w >> 1), ZEMIN, T.w, 2);
  if (h <= 0) return;
  const govde = e.flas > 0 ? '#e8e2d0' : T.renk;
  for (let k = 0; k < h; k++) {   // satır satır, mürekkep lekesi gibi
    const r = k / h, gen = Math.round(w * (.55 + .45 * Math.sin(Math.PI * Math.min(1, r * 1.1 + .05))));
    const kay = Math.round(lean * e.yon * (1 - r));
    ctx.fillStyle = (k === 0 || k === h - 1) ? T.koyu : govde; ctx.fillRect(sx - (gen >> 1) + kay, ZEMIN - h + k, gen, 1);
    ctx.fillStyle = T.koyu; ctx.fillRect(sx - (gen >> 1) + kay, ZEMIN - h + k, 1, 1); ctx.fillRect(sx + (gen >> 1) + kay - 1, ZEMIN - h + k, 1, 1);
  }
  if (e.tur === 'dev') {   // boynuzlar ve sopa
    ctx.fillStyle = '#e8d6a8'; ctx.fillRect(sx - 9, ZEMIN - h - 3, 2, 4); ctx.fillRect(sx + 7, ZEMIN - h - 3, 2, 4);
    ctx.fillStyle = '#5a3d26'; const kx = sx + e.yon * (w / 2 + 2);
    if (e.durum === 'hazir') ctx.fillRect(kx - 2, ZEMIN - h - 14, 4, 20); else ctx.fillRect(kx - 10 * (e.durum === 'saldir' ? -e.yon : 0) - 2, ZEMIN - 14, e.durum === 'saldir' ? 20 : 4, e.durum === 'saldir' ? 4 : 14);
  }
  const gozY = ZEMIN - h + Math.round(h * .3), gozX = sx + e.yon * Math.round(w * .18);
  const goz = e.durum === 'hazir' ? (Math.floor(e.t * 12) % 2 ? '#ff4a3a' : '#ffb347') : e.durum === 'sersem' ? '#8a8fa3' : '#e8cf8a';
  ctx.fillStyle = goz; ctx.fillRect(gozX - 3, gozY, 2, 1); ctx.fillRect(gozX + 1, gozY, 2, 1);
  if (e.durum === 'hazir') { ctx.fillStyle = '#ffd36b'; ctx.fillRect(sx, ZEMIN - h - 10, 2, 5); ctx.fillRect(sx, ZEMIN - h - 4, 2, 1); }
  if (e.durum === 'sersem') { ctx.fillStyle = '#ffd36b'; const a = e.t * 8; for (let i = 0; i < 3; i++) ctx.fillRect(Math.round(sx + Math.cos(a + i * 2.1) * 7), Math.round(ZEMIN - h - 5 + Math.sin(a + i * 2.1) * 2), 1, 1); }
  if (e.tur === 'dev' && e.durum !== 'ol') {   // can çubuğu
    ctx.fillStyle = '#16111f'; ctx.fillRect(W / 2 - 61, 14, 122, 5); ctx.fillStyle = '#c0392b'; ctx.fillRect(W / 2 - 60, 15, Math.round(120 * e.can / T.can), 3);
  }
}
function arayuz() {
  if (OYUN.sezgi > 0) { ctx.fillStyle = `rgba(90,150,220,${Math.min(.18, OYUN.sezgi * .1)})`; ctx.fillRect(0, 0, W, H); }
  for (let i = 0; i < P.max; i++) kalp(8 + i * 11, 8, i < P.can);
  const ilerleme = clamp(P.x / BOLUM.uzunluk, 0, 1);
  const px = Math.round(W / 2 - 39);   // bölüm ilerlemesi: üst ortada
  ctx.fillStyle = '#16111f'; ctx.fillRect(px, 6, 78, 3); ctx.fillStyle = '#d9ad4f'; ctx.fillRect(px, 6, Math.round(78 * ilerleme), 3);
  ctx.fillStyle = '#e8e2d0'; ctx.fillRect(px + Math.round(78 * ilerleme) - 1, 4, 2, 7);
}
function kalp(x, y, dolu) {
  const s = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  s.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') { ctx.fillStyle = dolu ? (j === 1 && i === 1 ? '#ff9b8a' : '#c0392b') : '#3a3346'; ctx.fillRect(x + i, y + j, 1, 1); } }));
}
function ciz() {
  const tx = OYUN.titre ? Math.round(rnd(-OYUN.titre, OYUN.titre)) : 0;
  ctx.save(); ctx.translate(tx, 0);
  const kam = Math.round(OYUN.kam); arkaPlan(kam);
  if (OYUN.kilit) { ctx.fillStyle = 'rgba(217,173,79,.5)'; for (const sx of OYUN.kilit) { const x = Math.round(sx - kam); for (let y = ZEMIN - 40; y < ZEMIN; y += 4) ctx.fillRect(x, y, 1, 2); } }
  for (const d of dalgalar) { const x = Math.round(d.x - kam); ctx.fillStyle = '#e2a15e'; ctx.fillRect(x - 3, ZEMIN - 5, 6, 5); ctx.fillStyle = '#f3d27a'; ctx.fillRect(x - 1, ZEMIN - 8, 2, 3); }
  for (const e of E) dusmanCiz(e, kam);
  const dd = OYUN.dusen, yi = YIMG['abihayat-k'];
  if (dd && !dd.alindi && yi && yi.complete) { const by = Math.round(dd.y + (dd.y >= ZEMIN - 18 ? Math.sin(OYUN.zaman * 4) * 1.5 : 0));
    ctx.fillStyle = 'rgba(159,232,255,.25)'; ctx.fillRect(Math.round(dd.x - kam) - 9, by - 2, 18, 22); ctx.drawImage(yi, Math.round(dd.x - kam) - 7, by); }
  oyuncuCiz(kam);
  ctx.restore();
  for (const y of yazilar) yaziCiz(y.s, Math.round(y.x - kam), Math.round(y.y), y.c);
  arayuz();
  if (msj) ortaYazi(msj.s, 60, '#ffd36b');
  if (OYUN.durum === 'giris') { perde(.55); ortaYazi(BOLUM.ad.toLocaleUpperCase('tr-TR'), 62, '#ffd36b'); ortaYazi('dokun ya da Enter: başla', 82, '#e8e2d0'); }
  if (OYUN.durum === 'dustu') { perde(Math.min(.6, OYUN.t)); ortaYazi('DÜŞTÜN', 70, '#ff7b6b'); if (OYUN.t > 2.2) ortaYazi('dokun: son yerden devam', 90, '#e8e2d0'); }
  if (OYUN.durum === 'bitti') { perde(Math.min(.6, OYUN.t)); ortaYazi('BÖLÜM TAMAM', 68, '#ffd36b'); if (OYUN.t > 1) ortaYazi('dokun: yeniden oyna', 88, '#e8e2d0'); }
}
function perde(a) { ctx.fillStyle = `rgba(10,10,18,${a})`; ctx.fillRect(0, 0, W, H); }
/* yazı: tarayıcı yazı tipiyle küçük çizip piksel ızgarasına oturtur */
function yaziCiz(s, x, y, c) { ctx.font = '8px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#0b0b12'; ctx.fillText(s, x + 1, y + 1); ctx.fillStyle = c; ctx.fillText(s, x, y); }
function ortaYazi(s, y, c) { yaziCiz(s, W / 2, y, c); }

let son = performance.now();
function kare(now) { const dt = durdu ? 0 : Math.min(.05, (now - son) / 1000); son = now; OYUN.zaman = (OYUN.zaman || 0) + dt; guncelle(dt); ciz(); requestAnimationFrame(kare); }
requestAnimationFrame(kare);
/* ---------- Dört güç: haklar Defter'den (bugünkü ameller) ---------- */
const YETENEK = {
  alp:    { ad: 'Güçlü Darbe', yap: () => { if (P.guclu) return false; P.guclu = true; yazi(P.x, 'güçlü darbe', '#ffd36b'); return true; } },
  kut:    { ad: 'Nur Kalkanı', yap: () => { if (P.kalkan) return false; P.kalkan = 1; yazi(P.x, 'nur kalkanı', '#ffe9a8'); return true; } },
  hikmet: { ad: 'Sezgi', yap: () => { if (OYUN.sezgi > 0) return false; OYUN.sezgi = 3; yazi(P.x, 'sezgi', '#9fd6ff'); return true; } },
  cevher: { ad: 'Sabır', yap: () => { if (P.can >= P.max) return false; P.can++; yazi(P.x, '+1', '#ff9b8a'); return true; } },
};
function yetenek(k) {
  if (OYUN.durum !== 'oyun' || !window.__defter) return;
  const h = __defter.haklar()[k];
  if (!h || h.kalan <= 0) { SES.bos(); yazi(P.x, h && h.toplam ? 'bugünlük bitti' : 'defterle beslen', '#8a8fa3'); return; }
  if (!YETENEK[k].yap()) { SES.bos(); return; }
  __defter.kullan(k); SES.guc(); haklarGoster();
}
function haklarGoster() {
  if (!window.__defter) return; const h = __defter.haklar();
  for (const k in YETENEK) { const b = document.getElementById('y-' + k); if (!b) continue; b.dataset.kalan = h[k].kalan; b.classList.toggle('bos', h[k].kalan <= 0); b.title = `${YETENEK[k].ad}: ${h[k].kalan}/${h[k].toplam}`; }
}
for (const k in YETENEK) dugme('y-' + k, () => yetenek(k));
addEventListener('keydown', e => { const m = { '1': 'alp', '2': 'kut', '3': 'hikmet', '4': 'cevher' }[e.key]; if (m) yetenek(m); });
let durdu = false;
window.__oyun = { P, E, OYUN, saldir, kacin, yeniden, dog, yetenek,
  durdur(v) { durdu = v; }, haklar: haklarGoster,
  guc(h) { const m = 5 + Math.floor((h.L - 1) / 10); if (m !== P.max) { P.can += m - P.max; P.max = m; } },   // her 10 seviyede +1 kalp
  seviye() { SES.bitti(); } };
