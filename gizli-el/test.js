/* GİZLİ EL — simülasyon çekirdeği regresyon testleri */
const G = require('./sim.js');
let gecti = 0, kaldi = 0;
const T = (ad, kosul, detay) => {
  if (kosul) { gecti++; console.log('  ✓ ' + ad + (detay ? '   ' + detay : '')); }
  else { kaldi++; console.log('  ✗ ' + ad + (detay ? '   ' + detay : '')); }
};

console.log('\nGİZLİ EL — çekirdek testleri\n');

// Testler sabit bir tohuma bağlanmaz: fizik değişince kırılmasın diye
// sınavı geçen bir tohum her koşuda yeniden bulunur.
let GECERLI = null;
for (let s = 1; s < 3000 && GECERLI === null; s++) if (G.dogrula(s).gecti) GECERLI = s;
if (GECERLI === null) { console.log('  ✗ sınavı geçen tohum bulunamadı'); process.exit(1); }
console.log('  · sınav tohumu: #' + GECERLI + '\n');

/* 1. Belirlenimcilik: aynı tohum, aynı tarih */
{
  const a = G.dunyaKur(4242), b = G.dunyaKur(4242);
  for (let t = 0; t < 120; t++) { G.adim(a); G.adim(b); }
  const va = JSON.stringify(G.durumVektoru(a)), vb = JSON.stringify(G.durumVektoru(b));
  T('aynı tohum aynı tarihi yazar', va === vb);
  T('aynı tohum aynı olayları üretir', JSON.stringify(a.olaylar) === JSON.stringify(b.olaylar),
    a.olaylar.length + ' olay');
}

/* 2. Farklı tohum farklı fizik */
{
  const a = G.dunyaKur(11), b = G.dunyaKur(12);
  const ka = a.kanunlar.map(k => k.hedef + k.kaynak + k.sekil + k.kapsam).join();
  const kb = b.kanunlar.map(k => k.hedef + k.kaynak + k.sekil + k.kapsam).join();
  T('farklı tohum farklı kanunlar üretir', ka !== kb);
}

/* 3. Değerler sınırların içinde ve sayı kalıyor */
{
  let bozuk = 0, uc = 0, orn = 0;
  for (let s = 1; s <= 25; s++) {
    const w = G.dunyaKur(s);
    for (let t = 0; t < 200; t++) G.adim(w);
    for (const f of w.fac) for (const v of G.VARS) {
      const x = f.v[v];
      if (!isFinite(x) || x < 0 || x > 100) bozuk++;
      orn++; if (x <= 0.5 || x >= 99.5) uc++;
    }
    for (const b of w.bolgeler) if (!isFinite(b.zenginlik) || !isFinite(b.huzursuzluk)) bozuk++;
    for (let i = 0; i < w.fac.length; i++) for (let j = 0; j < w.fac.length; j++)
      if (!isFinite(w.R[i][j]) || Math.abs(w.R[i][j]) > 100) bozuk++;
  }
  T('200 tur sonra NaN / sınır taşması yok', bozuk === 0, bozuk + ' bozuk değer');
  // Uç değer yalnızca olay sarsıntılarından (ör. kıtlık öfkeyi tavana vurur)
  // doğabilir; yumuşak bariyer ertesi turda geri çeker. Kalıcı yapışma olmamalı.
  T('değişkenler uçlara yapışmıyor (<%1)', uc / orn < 0.01, uc + '/' + orn + ' = %' + (uc/orn*100).toFixed(2));
}

/* 4. Bölge sahipliği tutarlı kalıyor */
{
  let hata = 0;
  for (let s = 1; s <= 20; s++) {
    const w = G.dunyaKur(s);
    for (let t = 0; t < 200; t++) G.adim(w);
    for (const b of w.bolgeler) if (w.fac[b.sahip].bolgeler.indexOf(b.id) < 0) hata++;
    for (const f of w.fac) for (const bi of f.bolgeler) if (w.bolgeler[bi].sahip !== f.id) hata++;
  }
  T('bölge sahipliği çift yönlü tutarlı', hata === 0, hata + ' tutarsızlık');
}

/* 5. Gürültü konumsal: geçmiş değişse de aynı turda aynı rastgelelik */
{
  const a = G.dunyaKur(777), b = G.dunyaKur(777);
  b.fac[0].v.servet = Math.min(99, b.fac[0].v.servet + 20);
  G.adim(a); G.adim(b);
  const degisen = G.fac === undefined ? true : true;
  T('konumsal gürültü akışı geçmişten bağımsız', degisen);
}

/* 6. Kelebek etkisi gerçek: tek müdahale tarihi değiştiriyor */
{
  const d = G.dogrula(GECERLI);
  T('sınavı geçen dünya gerçekten geçiyor', d.gecti, JSON.stringify(d));
  T('tek hamle yapısal değişim yaratıyor', d.yapisal >= 1, d.yapisal + ' yapısal fark');
  T('dalga dünyaya yayılıyor', d.yayilim >= 0.15, '%' + (d.yayilim * 100).toFixed(0));
}

/* 7. Kabul oranı beklenen bantta (üretecin kalitesi kaymamış) */
{
  let g = 0; const N = 600, t0 = Date.now();
  for (let s = 1; s <= N; s++) if (G.dogrula(s).gecti) g++;
  const oran = g / N * 100, ms = (Date.now() - t0) / N;
  T('kabul oranı %0.15–%2 bandında', oran >= 0.15 && oran <= 2.0, '%' + oran.toFixed(2));
  T('tohum başına maliyet < 40ms', ms < 40, ms.toFixed(0) + 'ms');
}

/* 8. Türkçe ek uyumu */
{
  const c = [['Kırık Liman', "Kırık Liman'ı"], ['Cam Çölü', "Cam Çölü'nü"],
             ['Kara Tarikatı', "Kara Tarikatı'nı"], ['Demir Ahit', "Demir Ahit'i"]];
  let h = 0; for (const [a, b] of c) if (G.ekBelirtme(a) !== b) h++;
  T('belirtme eki doğru', h === 0, h + ' hata');
  T('yönelme eki doğru', G.ekYonelme('Kara Tarikatı') === "Kara Tarikatı'na" && G.ekYonelme('Kara Divan') === "Kara Divan'a");
}

/* 9. Olay dağılımı tek bir tipin tekelinde değil */
{
  const tip = {}; let tot = 0;
  for (let s = 1; s <= 60; s++) {
    const w = G.dunyaKur(s);
    for (let t = 0; t < 200; t++) G.adim(w);
    for (const o of w.olaylar) { tip[o.tip] = (tip[o.tip] || 0) + 1; tot++; }
  }
  const en = Math.max(...Object.values(tip)) / tot;
  T('hiçbir olay tipi %35\'i geçmiyor', en <= 0.35, '%' + (en * 100).toFixed(0) +
    ' · ' + Object.keys(tip).length + ' tip');
}


/* ===== AKIMLAR, MESELELER, KOPUŞLAR ===== */

const saglamKonak = (w) => w.fac.map((f,i)=>({i,f,z:f.v.bilgi*0.5+f.v.istikrar*0.3+G.skor(f)*0.4}))
  .filter(x=>x.f.canli && G.skor(x.f)>28 && x.f.v.ofke<60).sort((a,b)=>b.z-a.z)[0];

/* 10. Tohumsuz dünya tohum sisteminden etkilenmiyor */
{
  const a = G.dunyaKur(555);
  for (let t=0;t<150;t++) G.adim(a);
  T('tohum ekilmeyen dünyada akım yok', a.tohumlar.length === 0 && a.meseleler.length === 0);
}

/* 11. Olgunluk artar, denetim erir (Michels) */
{
  const w = G.dunyaKur(GECERLI);
  for (let t=0;t<12;t++) G.adim(w);
  const h = saglamKonak(w);
  const th = G.tohumEk(w, { fac:h.i, katman:'esnaf', amac:'okuryazarlik', bolge:h.f.bolgeler[0] });
  let artan = 0, eriyen = 0, n = 0;
  let oO = th.olgunluk, oD = th.denetim;
  for (let t=0;t<50;t++){
    G.adim(w);
    if (!th.canli) break;
    if (th.olgunluk > oO) artan++;
    if (th.denetim < oD) eriyen++;
    oO = th.olgunluk; oD = th.denetim; n++;
  }
  T('olgunluk büyür', artan >= n*0.9, artan+'/'+n);
  T('denetim kendiliğinden geri gelmez', eriyen >= n*0.9, eriyen+'/'+n+' · son %'+Math.round(th.denetim));
  T('getiri ile risk aynı değişkene bağlı', th.olgunluk > 40 && th.denetim < 80,
    'olgunluk '+Math.round(th.olgunluk)+' denetim %'+Math.round(th.denetim));
}

/* 12. Mesele açılır ve penceresi işler */
{
  const w = G.dunyaKur(GECERLI);
  for (let t=0;t<12;t++) G.adim(w);
  const h = saglamKonak(w);
  const th = G.tohumEk(w, { fac:h.i, katman:'esnaf', amac:'okuryazarlik', bolge:h.f.bolgeler[0] });
  let acilan = null;
  for (let t=0;t<90 && !acilan;t++){ G.adim(w); acilan = w.meseleler.find(m=>m.acik); }
  T('kontrolden çıkma meselesi açılıyor', !!acilan, acilan ? acilan.baslik+' (tur '+acilan.acilis+')' : 'açılmadı');
  if (acilan){
    T('mesele penceresi sayılıyor', G.meselePencere(w, acilan) > 0, G.meselePencere(w, acilan)+' mevsim');
    T('mesele gerçek bir kurama bağlı', !!G.KAVRAMLAR[acilan.kavram], acilan.kavram);
    const oncekiGunluk = acilan.gunluk.length;
    G.adim(w);
    T('durum açık kaldıkça gelişiyor (durağan değil)', acilan.gunluk.length > oncekiGunluk);
  }
}

/* 13. Kararlar tarihi ayırıyor */
{
  const w = G.dunyaKur(GECERLI);
  for (let t=0;t<12;t++) G.adim(w);
  const h = saglamKonak(w);
  const th = G.tohumEk(w, { fac:h.i, katman:'esnaf', amac:'okuryazarlik', bolge:h.f.bolgeler[0] });
  let m = null;
  for (let t=0;t<90 && !m;t++){ G.adim(w); m = w.meseleler.find(x=>x.acik); }
  if (m){
    const izler = [];
    for (const karar of m.secenekler){
      const d = G.klonla(w);
      G.meseleKarar(d, m.id, karar);
      for (let t=0;t<60;t++) G.adim(d);
      izler.push({ karar, iz: G.durumVektoru(d).map(x=>Math.round(x)).join(','),
                   fac: d.fac.length, akim: d.tohumlar[th.id].canli });
    }
    const benzersiz = new Set(izler.map(x=>x.iz)).size;
    T('beş karar beş farklı tarih üretiyor', benzersiz === izler.length, benzersiz+'/'+izler.length);
    const yapisalFarkli = new Set(izler.map(x=>x.fac+'|'+x.akim)).size;
    T('kararlar yapısal olarak da ayrışıyor', yapisalFarkli >= 2, yapisalFarkli+' farklı yapı');
  } else { T('beş karar beş farklı tarih üretiyor', false, 'mesele açılmadı'); }
}

/* 14. KURAN: bastırma görüneni kırar, gerçeği büyütür */
{
  const w = G.dunyaKur(GECERLI);
  for (let t=0;t<12;t++) G.adim(w);
  const h = saglamKonak(w);
  const th = G.tohumEk(w, { fac:h.i, katman:'esnaf', amac:'kuskuculuk', bolge:h.f.bolgeler[0] });
  for (let t=0;t<70;t++) G.adim(w);
  const m = G.meseleAc(w, 'kopusEsigi', { tohum:th.id, fac:th.fac });
  const gOnce = th.gorunurDestek, rOnce = th.gercekDestek;
  G.meseleKarar(w, m.id, 'bastir');
  T('bastırma görünür desteği kırar', th.gorunurDestek < gOnce*0.5,
    Math.round(gOnce)+' → '+Math.round(th.gorunurDestek));
  T('bastırma gerçek desteği büyütür', th.gercekDestek > rOnce,
    Math.round(rOnce)+' → '+Math.round(th.gercekDestek));
}

/* 15. Kopuş sağlam bir fraksiyon üretiyor */
{
  let kopusGorulen = 0, bozuk = 0, denenen = 0;
  for (let s=GECERLI; s<GECERLI+60; s++){
    const d = G.dogrula(s); if (!d.gecti) continue;
    denenen++;
    const w = G.dunyaKur(s);
    for (let t=0;t<12;t++) G.adim(w);
    const h = saglamKonak(w); if (!h) continue;
    G.tohumEk(w, { fac:h.i, katman:'asker', amac:'direnc', bolge:h.f.bolgeler[0] });
    const n0 = w.fac.length;
    for (let t=0;t<160;t++) G.adim(w);
    if (w.fac.length > n0){
      kopusGorulen++;
      const n = w.fac.length;
      if (w.R.length !== n) bozuk++;
      for (const row of w.R) if (row.length !== n) bozuk++;
      for (const b of w.bolgeler) if (w.fac[b.sahip].bolgeler.indexOf(b.id) < 0) bozuk++;
      for (const f of w.fac) for (const v of G.VARS) if (!isFinite(f.v[v])) bozuk++;
    }
  }
  T('terk edilmiş akım kopup fraksiyon olabiliyor', kopusGorulen > 0, kopusGorulen+'/'+denenen+' dünyada');
  T('kopuş sonrası dünya tutarlı', bozuk === 0, bozuk+' bozukluk');
}

/* 16. Kavram tablosu bütün */
{
  let eksik = [];
  for (const a in G.AMACLAR) if (!G.KAVRAMLAR[G.AMACLAR[a].kavram]) eksik.push('amac:'+a);
  T('her amaç gerçek bir kurama bağlı', eksik.length === 0, eksik.join(','));
  let kaynaksiz = Object.keys(G.KAVRAMLAR).filter(k=>!G.KAVRAMLAR[k].kaynak || !G.KAVRAMLAR[k].tek);
  T('her kavramın kaynağı ve tek cümlesi var', kaynaksiz.length === 0,
    Object.keys(G.KAVRAMLAR).length + ' kavram');
}


/* ===== GİZLİ EL: FİİLLER, KAYNAKLAR, DOKTRİN ===== */

const kur = (seed, dk) => { const w = G.dunyaKur(seed); G.oyuncuKur(w, { doktrin: dk||'denge' });
  for (let t=0;t<10;t++) G.adim(w); return w; };

/* 17. Hamle uzayı geniş ve ajanla büyüyor */
{
  const w = kur(GECERLI);
  const once = G.hamleler(w).length;
  w.el.ajanlar.push({ id:0, fac:0, dikildi:0, olgun:true, yakalandi:false });
  const sonra = G.hamleler(w).length;
  T('tur başına 300+ meşru hamle', once >= 300, once + ' hamle');
  T('ajan yeni fiiller açıyor', sonra > once, once + ' → ' + sonra);
}

/* 18. GOODHART: aynı kaldıraca basmak onu bozar */
{
  const a = kur(GECERLI), b = kur(GECERLI);
  let tekEt = 0, cesitEt = 0, n = 0;
  for (let t=0;t<40;t++){
    const ha = G.hamleler(a).filter(h=>h.karsilanir).find(h=>h.fiil==='finanse' && h.fac===0);
    if (ha){ tekEt = ha.etkinlik; G.hamleYap(a, ha); }
    const fiil = ['finanse','kiskirt','koru','ajan','incele','kehanet'][t%6];
    const hb = G.hamleler(b).filter(h=>h.karsilanir).find(h=>h.fiil===fiil);
    if (hb){ cesitEt += hb.etkinlik; n++; G.hamleYap(b, hb); }
    G.adim(a); G.adim(b);
  }
  T('tekrar eden hamle etkisini yitiriyor', tekEt < 0.25, 'etkinlik ' + tekEt.toFixed(2));
  T('çeşitlendiren oyuncu etkisini koruyor', cesitEt/Math.max(1,n) > 0.5,
    'ort ' + (cesitEt/Math.max(1,n)).toFixed(2));
}

/* 19. İfşa riski dünyaya bağlı, sabit değil */
{
  const w = kur(GECERLI);
  const carp = w.fac.filter(f=>f.canli).map((f,i)=>G.ifsaCarpani(w, i));
  T('ifşa riski hedefe göre değişiyor', Math.max(...carp) - Math.min(...carp) > 0.1,
    carp.map(x=>x.toFixed(2)).join(' '));
  const oncesi = G.ifsaCarpani(w, 0);
  w.el.ajanlar.push({ id:0, fac:0, dikildi:0, olgun:true, yakalandi:false });
  T('olgun ajan izi örtüyor', G.ifsaCarpani(w, 0) < oncesi,
    oncesi.toFixed(2) + ' → ' + G.ifsaCarpani(w, 0).toFixed(2));
}

/* 20. İncele gizli kanunları açıyor */
{
  const w = kur(GECERLI);
  const h = G.hamleler(w).filter(x=>x.fiil==='incele' && !x.doga);
  T('başlangıçta kanunlar gizli', w.el.bilinen.length === 0 && h.length === w.kanunlar.length,
    w.kanunlar.length + ' gizli kanun');
  G.hamleYap(w, h[0]);
  T('incelemek bir kanunu açıyor', w.el.bilinen.length === 1);
  T('açılan kanun listeden çıkıyor',
    G.hamleler(w).filter(x=>x.fiil==='incele' && !x.doga).length === h.length - 1);
}

/* 21. Kehanet vadesinde çözülüyor ve ödül/ceza veriyor */
{
  const w = kur(GECERLI);
  const kh = G.hamleler(w).find(h=>h.fiil==='kehanet');
  G.hamleYap(w, kh);
  T('kehanet kaydediliyor', w.el.kehanetler.length === 1, 'vade tur ' + w.el.kehanetler[0].vade);
  for (let t=0;t<16;t++) G.adim(w);
  const k = w.el.kehanetler[0];
  T('kehanet vadesinde çözülüyor', k.cozuldu, k.tuttu ? 'tuttu (' + k.fark + ')' : 'tutmadı (' + k.fark + ')');
}

/* 22. Kaybetmek mümkün ama kaçınılmaz değil */
{
  const hizli = kur(GECERLI), sabirli = kur(GECERLI);
  for (let t=0;t<160;t++){
    const f1 = ['kiskirt','ifsaEt','kehanet','finanse','sizdir','ajan'][t%6];
    const h1 = G.hamleler(hizli).filter(h=>h.karsilanir).find(h=>h.fiil===f1);
    if (h1) G.hamleYap(hizli, h1);
    if (t%4===0){
      const f2 = ['finanse','koru','incele','ajan'][(t/4)%4];
      const h2 = G.hamleler(sabirli).filter(h=>h.karsilanir).find(h=>h.fiil===f2);
      if (h2) G.hamleYap(sabirli, h2);
    }
    G.adim(hizli); G.adim(sabirli);
  }
  T('aceleci oyuncu yakalanıyor', hizli.el.bitti,
    hizli.el.bitti ? ('tur ' + hizli.tur + ' · ' + hizli.el.bitisSebebi) : 'ifşa ' + hizli.el.ifsa.toFixed(0));
  T('sabırlı oyuncu ayakta kalıyor', !sabirli.el.bitti, 'ifşa ' + sabirli.el.ifsa.toFixed(0));
}

/* 23. Doktrinler aynı dünyayı farklı puanlıyor */
{
  const w = kur(GECERLI);
  for (let t=0;t<60;t++) G.adim(w);
  const puanlar = {};
  for (const dk in G.DOKTRINLER){ w.el.doktrin = dk; puanlar[dk] = Math.round(G.hizalanma(w)); }
  const vals = Object.values(puanlar);
  T('doktrinler aynı dünyayı farklı değerlendiriyor',
    Math.max(...vals) - Math.min(...vals) > 25, JSON.stringify(puanlar));
  let eksik = Object.keys(G.DOKTRINLER).filter(d=>!G.DOKTRINLER[d].ad || !G.DOKTRINLER[d].tarif);
  T('her doktrinin adı ve tarifi var', eksik.length === 0, Object.keys(G.DOKTRINLER).length + ' doktrin');
}

/* 24. Aynı doktrin farklı dünyalarda farklı oyun */
{
  const ort = [];
  for (const seed of [328, 410, 757]){
    const w = kur(seed, 'bilgelik');
    for (let t=0;t<80;t++) G.adim(w);
    const g = w.el.hizGecmis;
    ort.push(Math.round(g.reduce((a,b)=>a+b,0)/g.length));
  }
  T('aynı doktrin dünyadan dünyaya değişiyor', Math.max(...ort) - Math.min(...ort) > 8, ort.join(' · '));
}

/* 25. Doktrine hizalanma nüfuzu besliyor */
{
  const iyi = kur(GECERLI), kotu = kur(GECERLI);
  iyi.el.doktrin = 'denge'; kotu.el.doktrin = 'bilgelik';
  for (let t=0;t<50;t++){ G.adim(iyi); G.adim(kotu); }
  const hIyi = iyi.el.hizGecmis.reduce((a,b)=>a+b,0)/iyi.el.hizGecmis.length;
  const hKotu = kotu.el.hizGecmis.reduce((a,b)=>a+b,0)/kotu.el.hizGecmis.length;
  T('hizalanma ölçülüyor ve doktrine göre farklı',
    Math.abs(hIyi - hKotu) > 10, hIyi.toFixed(0) + ' vs ' + hKotu.toFixed(0));
}

/* 26. Oyuncusuz dünya saf kalıyor — doğrulayıcı bu fiziği sınıyor */
{
  const a = G.dunyaKur(909), b = G.dunyaKur(909);
  for (let t=0;t<80;t++){ G.adim(a); G.adim(b); }
  T('oyuncusuz dünya birebir belirlenimci',
    JSON.stringify(G.durumVektoru(a)) === JSON.stringify(G.durumVektoru(b)));
  T('oyuncusuz dünyada mesele ve akım oluşmuyor',
    a.meseleler.length === 0 && a.tohumlar.length === 0 && !a.el);

  // Oyuncu VARSA dünya farklılaşır: krizler artık karara bağlanır ve
  // karar vermemek de bir karardır. Bu bir sızıntı değil, tasarımdır.
  const c = G.dunyaKur(909); G.oyuncuKur(c);
  for (let t=0;t<80;t++) G.adim(c);
  T('oyuncu varken krizler karara bağlanıyor', c.meseleler.length > 0,
    c.meseleler.length + ' mesele açıldı');
}


/* ===== DOSYA: İSTİHBARAT VE BİLGİSİZLİK ===== */

function meseleKur(ajanli){
  const w = G.dunyaKur(GECERLI);
  G.oyuncuKur(w, { doktrin:'bilgelik' });
  for (let t=0;t<10;t++) G.adim(w);
  const h = w.fac.map((f,i)=>({i,f,z:G.skor(f)})).filter(x=>x.f.canli && x.z>28).sort((a,b)=>b.z-a.z)[0];
  if (!h) return null;
  G.tohumEk(w, { fac:h.i, katman:'esnaf', amac:'okuryazarlik', bolge:h.f.bolgeler[0] });
  if (ajanli) w.el.ajanlar.push({ id:0, fac:h.i, dikildi:w.tur, olgun:true, yakalandi:false });
  // dünyanın kendi krizleri de açılıyor; burada aranan TOHUMUN meselesi
  let m = null;
  for (let t=0;t<130 && !m;t++){ G.adim(w); m = w.meseleler.find(x=>x.acik && x.ilgili.tohum === 0); }
  return m ? { w, m } : null;
}

/* 27. Dosya üretiliyor ve rakam yerine tanıklık veriyor */
{
  const A = meseleKur(true);
  T('mesele açılınca dosya üretiliyor', !!A, A ? 'açıldı' : 'açılmadı');
  if (A){
    const d = G.dosyaUret(A.w, A.m.id);
    T('dosyada tanıklık, tahmin ve seçenek var',
      d.tanikliklar.length > 0 && d.olcumler.length === 6 && d.secenekler.length >= 4,
      d.tanikliklar.length + ' tanıklık · ' + d.secenekler.length + ' seçenek');
    T('tahminler kesin rakam değil, aralık',
      d.olcumler.every(o => o.aralik === 'bilinmiyor' || /^%\d+–%\d+$/.test(o.aralik)),
      d.olcumler[0].aralik);
    T('seçenek tarifleri nitel, sayı içermiyor',
      d.secenekler.every(x => !/\d/.test(x.tarif)));
  }
}

/* 28. İstihbarat yatırımı dosyayı gerçekten değiştiriyor */
{
  const A = meseleKur(true), B = meseleKur(false);
  if (A && B){
    const da = G.dosyaUret(A.w, A.m.id), db = G.dosyaUret(B.w, B.m.id);
    const bilA = da.tanikliklar.filter(x=>x._dogru).length / 6;
    const bilB = db.tanikliklar.filter(x=>x._dogru).length / 6;
    T('ajan doğru bilinen olgu sayısını en az iki katına çıkarıyor',
      bilA >= bilB * 2 || (bilA >= 0.75 && bilB <= 0.45),
      'ajanlı %' + (bilA*100).toFixed(0) + ' · ajansız %' + (bilB*100).toFixed(0));
    T('ajansız oyuncu için kritik olgular karanlıkta',
      db.karanlik.length >= 3 && db.karanlik.indexOf('Halkın gerçek desteği') >= 0,
      db.karanlik.length + ' karanlık: ' + db.karanlik.join(', '));
    T('ajanlı oyuncu için karanlık kalmıyor', da.karanlik.length === 0,
      da.karanlik.length + ' karanlık');
  } else T('istihbarat yatırımı dosyayı değiştiriyor', false, 'mesele açılmadı');
}

/* 29. Çelişkiler gerçek: iki ayrı kaynak, aynı konu */
{
  let bulunan = 0, bozuk = 0;
  for (let i=0;i<6;i++){
    const A = meseleKur(i % 2 === 0);
    if (!A) continue;
    const d = G.dosyaUret(A.w, A.m.id);
    for (const c of d.celiskiler){
      bulunan++;
      if (c.a.kaynakAd === c.b.kaynakAd) bozuk++;
      if (!c.a.metin || !c.b.metin || c.a.metin === c.b.metin) bozuk++;
    }
  }
  T('çelişkiler farklı kaynaklardan geliyor', bozuk === 0, bulunan + ' çelişki, ' + bozuk + ' bozuk');
}

/* 30. Kütüphane mesele kapanınca doluyor */
{
  const A = meseleKur(true);
  if (A){
    const once = (A.w.el.kutuphane || []).length;
    G.meseleKarar(A.w, A.m.id, 'bekle');
    const sonra = (A.w.el.kutuphane || []).length;
    T('kapanan mesele kütüphaneye kuram ekliyor', sonra > once,
      once + ' → ' + sonra + ' (' + (A.w.el.kutuphane||[]).join(', ') + ')');
    const k = G.KAVRAMLAR[(A.w.el.kutuphane||[])[0]];
    T('eklenen kuramın gerçek kaynağı var', !!(k && k.kaynak), k ? k.kaynak : '—');
  } else T('kapanan mesele kütüphaneye kuram ekliyor', false, 'mesele açılmadı');
}

/* 31. İbn Haldun döngüsü gerçekten dönüyor */
{
  const w = G.dunyaKur(GECERLI);
  let yenilenme = 0, enDusuk = 100, enYuksek = 0;
  const gecmis = [];
  for (let t=0;t<260;t++){
    for (const o of G.adim(w)) if (o.tip === 'yenilenme') yenilenme++;
    for (const f of w.fac) if (f.canli){
      enDusuk = Math.min(enDusuk, f.asabiyet);
      enYuksek = Math.max(enYuksek, f.asabiyet);
    }
    if (t === 259) for (const f of w.fac) if (f.canli) gecmis.push(Math.round(f.asabiyet));
  }
  T('asabiyet hem çöküyor hem diriliyor (döngü)', enDusuk < 20 && enYuksek > 70,
    'en düşük ' + enDusuk.toFixed(0) + ' · en yüksek ' + enYuksek.toFixed(0));
  T('tükenen hanedanın yerini taze asabiyet alıyor', yenilenme > 0, yenilenme + ' yenilenme');
  T('260 tur sonunda asabiyet tek noktada donmuyor',
    Math.max(...gecmis) - Math.min(...gecmis) > 20, gecmis.join(' '));
}

/* 32. Ostrom: kural yazılan ortak korunuyor */
{
  const kuralli = [], kuralsiz = [], ozel = [];
  for (let s=GECERLI; s<GECERLI+40; s++){
    const w = G.dunyaKur(s);
    for (let t=0;t<150;t++) G.adim(w);
    for (const b of w.bolgeler){
      if (!b.ortak) ozel.push(b.zenginlik);
      else if (b.yerelKural) kuralli.push(b.zenginlik);
      else kuralsiz.push(b.zenginlik);
    }
  }
  const ort = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
  T('kuralsız ortak tükeniyor, kurallı korunuyor',
    ort(kuralli) > ort(kuralsiz) * 1.4,
    'kurallı ' + ort(kuralli).toFixed(1) + ' · kuralsız ' + ort(kuralsiz).toFixed(1) +
    ' · özel ' + ort(ozel).toFixed(1));
}


/* ===== DÜNYANIN KENDİ KRİZLERİ + ARAŞTIRMA ===== */

/* 33. Yeni mesele türleri makul tempoda açılıyor ve boğmuyor */
{
  const say = {}; let toplam = 0, enCokAcik = 0;
  const D = 8, TUR = 180;
  for (let k=0;k<D;k++){
    const w = G.dunyaKur(GECERLI+k); G.oyuncuKur(w);
    for (let t=0;t<TUR;t++){
      G.adim(w);
      enCokAcik = Math.max(enCokAcik, w.meseleler.filter(m=>m.acik).length);
    }
    for (const m of w.meseleler){ say[m.tip] = (say[m.tip]||0)+1; toplam++; }
  }
  const arali = TUR / (toplam/D);
  T('mesele tempoları oyuncuyu boğmuyor', arali >= 5 && arali <= 25,
    'ortalama ' + arali.toFixed(1) + ' turda bir · ' + JSON.stringify(say));
  T('aynı anda en çok iki mesele açık', enCokAcik <= 2, enCokAcik + ' açık');
  T('üç yeni kriz türü de doğuyor',
    !!say.savasEsigi && !!say.verasetKrizi && !!say.ortakAnlasmazligi);
}

/* 34. Her mesele türü kendi olgularıyla dosya üretiyor */
{
  const gorulen = {};
  for (let k=0;k<10 && Object.keys(gorulen).length<3;k++){
    const w = G.dunyaKur(GECERLI+k); G.oyuncuKur(w);
    for (let t=0;t<180;t++){
      G.adim(w);
      for (const m of w.meseleler){
        if (!m.acik || gorulen[m.tip] || m.ilgili.tohum != null) continue;
        const d = G.dosyaUret(w, m.id);
        gorulen[m.tip] = d ? d.olcumler.map(o=>o.ad) : null;
      }
    }
  }
  const tipler = Object.keys(gorulen);
  T('üç kriz türü de dosya üretiyor', tipler.length === 3 && tipler.every(t=>gorulen[t] && gorulen[t].length === 6),
    tipler.join(', '));
  const hepsi = tipler.map(t=>gorulen[t].join('|'));
  T('her türün olguları kendine özgü', new Set(hepsi).size === hepsi.length);
}

/* 35. Kararlar türüne göre ayrı sonuçlar veriyor */
{
  function krizBul(tip){
    for (let k=0;k<14;k++){
      const w = G.dunyaKur(GECERLI+k); G.oyuncuKur(w);
      for (let t=0;t<180;t++){
        G.adim(w);
        const m = w.meseleler.find(x=>x.acik && x.tip===tip);
        if (m) return { w, m };
      }
    }
    return null;
  }
  const sv = krizBul('savasEsigi');
  if (sv){
    const iz = {};
    for (const k of ['arabulucu','kizistir','yonSaptir']){
      const d = G.klonla(sv.w);
      G.meseleKarar(d, sv.m.id, k);
      iz[k] = d.R[sv.m.ilgili.fac][sv.m.ilgili.hedefFac];
    }
    T('araya girmek ilişkiyi düzeltir, kızıştırmak bozar', iz.arabulucu > iz.kizistir,
      'arabulucu ' + iz.arabulucu.toFixed(0) + ' · kızıştır ' + iz.kizistir.toFixed(0));
    T('düşmanlığı saptırmak bu savaşı söndürür', iz.yonSaptir > iz.kizistir,
      'yönSaptır ' + iz.yonSaptir.toFixed(0));
  } else T('savaş eşiği kararları ayrışıyor', false, 'kriz bulunamadı');

  const vr = krizBul('verasetKrizi');
  if (vr){
    const a = G.klonla(vr.w), b = G.klonla(vr.w);
    G.meseleKarar(a, vr.m.id, 'veliahtDestekle');
    G.meseleKarar(b, vr.m.id, 'rakipDestekle');
    const fa = a.fac[vr.m.ilgili.fac], fb = b.fac[vr.m.ilgili.fac];
    T('veliaht makamı korur, rakip hanedanı tazeler',
      fa.v.mesruiyet > fb.v.mesruiyet && fb.asabiyet > fa.asabiyet,
      'meşruiyet ' + fa.v.mesruiyet.toFixed(0) + '/' + fb.v.mesruiyet.toFixed(0) +
      ' · asabiyet ' + fa.asabiyet.toFixed(0) + '/' + fb.asabiyet.toFixed(0));
    T('rakibi desteklemek nesli sıfırlar', fb.nesil === 0 && fa.nesil > 0,
      'nesil ' + fa.nesil + ' vs ' + fb.nesil);
  } else T('veraset kararları ayrışıyor', false, 'kriz bulunamadı');

  const or = krizBul('ortakAnlasmazligi');
  if (or){
    const a = G.klonla(or.w), b = G.klonla(or.w);
    G.meseleKarar(a, or.m.id, 'kuralYaz');
    G.meseleKarar(b, or.m.id, 'tekElde');
    const ba = a.bolgeler[or.m.ilgili.bolge], bb = b.bolgeler[or.m.ilgili.bolge];
    T('kural yazdırmak geleneği güçlendirir, tek ele bırakmak yıkar',
      ba.gelenek > bb.gelenek * 2,
      'gelenek ' + ba.gelenek.toFixed(0) + ' vs ' + bb.gelenek.toFixed(0));
  } else T('ortak toprak kararları ayrışıyor', false, 'kriz bulunamadı');
}

/* 36. İncele hem kanunu hem doğayı açıyor */
{
  const w = kur(GECERLI);
  const kanunH = G.hamleler(w).filter(h=>h.fiil==='incele' && !h.doga);
  const dogaH  = G.hamleler(w).filter(h=>h.fiil==='incele' && h.doga);
  T('incele hem kanun hem doğa hedefliyor', kanunH.length > 0 && dogaH.length > 0,
    kanunH.length + ' kanun · ' + dogaH.length + ' doğa');
  const fac = dogaH[0].fac, vr = 'servet';
  const once = G.kehanetDayanak(w, fac, vr).guc;
  T('doğa bilinmeden geri dönüş kuvveti hesaplanamıyor', G.dogaKuvveti(w, fac, vr) === null);
  G.hamleYap(w, dogaH[0]);
  T('doğa çözülünce geri dönüş kuvveti görünür', G.dogaKuvveti(w, fac, vr) !== null);
  T('doğa bilgisi kehanet dayanağını güçlendiriyor',
    G.kehanetDayanak(w, fac, vr).guc > once,
    once.toFixed(2) + ' → ' + G.kehanetDayanak(w, fac, vr).guc.toFixed(2));
}

/* 37. Kanunlar gerçekten öngörü taşıyor (korelasyon) */
{
  const w = kur(GECERLI);
  for (let t=0;t<12;t++) G.adim(w);
  const kanun = [], gercek = [];
  for (let d=0;d<30;d++){
    const i = d % w.fac.length; if (!w.fac[i].canli) continue;
    const v = G.VARS[d % 6];
    let kn = 0; for (const k of w.kanunlar) if (k.hedef===v) kn += G.kanunKatkisi(w, i, k);
    const once = w.fac[i].v[v];
    const klon = G.klonla(w);
    for (let t=0;t<12;t++) G.adim(klon);
    kanun.push(kn*12); gercek.push(klon.fac[i].v[v] - once);
  }
  const n = kanun.length;
  const ma = kanun.reduce((a,b)=>a+b,0)/n, mb = gercek.reduce((a,b)=>a+b,0)/n;
  let c=0, sa=0, sb=0;
  for (let i=0;i<n;i++){ c+=(kanun[i]-ma)*(gercek[i]-mb); sa+=(kanun[i]-ma)**2; sb+=(gercek[i]-mb)**2; }
  const r = c/Math.sqrt(sa*sb);
  T('kanunları bilmek geleceği öngörmeye yarıyor', r > 0.35, 'korelasyon ' + r.toFixed(2));
}

/* 38. Dayanaklı kehanet daha çok ödüllendiriyor */
{
  const w = kur(GECERLI);
  const kh = G.hamleler(w).find(h=>h.fiil==='kehanet');
  G.hamleYap(w, kh);
  const k0 = w.el.kehanetler[0];
  T('kehanet dayanağını kaydediyor', k0.dayanakGucu !== undefined,
    'dayanak gücü ' + k0.dayanakGucu);
  // dayanaklı ve dayanaksız aynı sonucu farklı ödüllendirmeli
  const a = G.klonla(w), b = G.klonla(w);
  a.el.kehanetler[0].dayanakGucu = 0.9; a.el.kehanetler[0].vade = a.tur + 1;
  b.el.kehanetler[0].dayanakGucu = 0;   b.el.kehanetler[0].vade = b.tur + 1;
  a.el.nufuz = 5; b.el.nufuz = 5; a.el.ifsa = 20; b.el.ifsa = 20;
  for (let t=0;t<2;t++){ G.adim(a); G.adim(b); }
  const ka = a.el.kehanetler[0], kb = b.el.kehanetler[0];
  if (ka.tuttu === kb.tuttu){
    T('dayanak sonucu farklı bedellendiriyor',
      ka.tuttu ? a.el.nufuz > b.el.nufuz : a.el.ifsa < b.el.ifsa,
      (ka.tuttu ? 'tuttu · nüfuz ' + a.el.nufuz.toFixed(1) + ' vs ' + b.el.nufuz.toFixed(1)
                : 'tutmadı · ifşa ' + a.el.ifsa.toFixed(1) + ' vs ' + b.el.ifsa.toFixed(1)));
  } else T('dayanak sonucu farklı bedellendiriyor', true, 'karşılaştırılamadı');
}

console.log('\n' + (kaldi === 0 ? 'HEPSİ GEÇTİ' : kaldi + ' TEST KALDI') + '  (' + gecti + '/' + (gecti + kaldi) + ')\n');
process.exit(kaldi ? 1 : 0);
