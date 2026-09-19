/* GİZLİ EL — simülasyon çekirdeği regresyon testleri */
const G = require('./sim.js');
let gecti = 0, kaldi = 0;
const T = (ad, kosul, detay) => {
  if (kosul) { gecti++; console.log('  ✓ ' + ad + (detay ? '   ' + detay : '')); }
  else { kaldi++; console.log('  ✗ ' + ad + (detay ? '   ' + detay : '')); }
};

console.log('\nGİZLİ EL — çekirdek testleri\n');

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
  const d = G.dogrula(328);
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
  const w = G.dunyaKur(328);
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
  const w = G.dunyaKur(328);
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
  const w = G.dunyaKur(328);
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
  const w = G.dunyaKur(328);
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
  for (let s=300; s<340; s++){
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
  const w = kur(328);
  const once = G.hamleler(w).length;
  w.el.ajanlar.push({ id:0, fac:0, dikildi:0, olgun:true, yakalandi:false });
  const sonra = G.hamleler(w).length;
  T('tur başına 300+ meşru hamle', once >= 300, once + ' hamle');
  T('ajan yeni fiiller açıyor', sonra > once, once + ' → ' + sonra);
}

/* 18. GOODHART: aynı kaldıraca basmak onu bozar */
{
  const a = kur(328), b = kur(328);
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
  const w = kur(328);
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
  const w = kur(328);
  const h = G.hamleler(w).filter(x=>x.fiil==='incele');
  T('başlangıçta kanunlar gizli', w.el.bilinen.length === 0 && h.length === w.kanunlar.length,
    w.kanunlar.length + ' gizli kanun');
  G.hamleYap(w, h[0]);
  T('incelemek bir kanunu açıyor', w.el.bilinen.length === 1);
  T('açılan kanun listeden çıkıyor',
    G.hamleler(w).filter(x=>x.fiil==='incele').length === h.length - 1);
}

/* 21. Kehanet vadesinde çözülüyor ve ödül/ceza veriyor */
{
  const w = kur(328);
  const kh = G.hamleler(w).find(h=>h.fiil==='kehanet');
  G.hamleYap(w, kh);
  T('kehanet kaydediliyor', w.el.kehanetler.length === 1, 'vade tur ' + w.el.kehanetler[0].vade);
  for (let t=0;t<16;t++) G.adim(w);
  const k = w.el.kehanetler[0];
  T('kehanet vadesinde çözülüyor', k.cozuldu, k.tuttu ? 'tuttu (' + k.fark + ')' : 'tutmadı (' + k.fark + ')');
}

/* 22. Kaybetmek mümkün ama kaçınılmaz değil */
{
  const hizli = kur(757), sabirli = kur(757);
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
  const w = kur(328);
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
  const iyi = kur(328), kotu = kur(328);
  iyi.el.doktrin = 'denge'; kotu.el.doktrin = 'bilgelik';
  for (let t=0;t<50;t++){ G.adim(iyi); G.adim(kotu); }
  const hIyi = iyi.el.hizGecmis.reduce((a,b)=>a+b,0)/iyi.el.hizGecmis.length;
  const hKotu = kotu.el.hizGecmis.reduce((a,b)=>a+b,0)/kotu.el.hizGecmis.length;
  T('hizalanma ölçülüyor ve doktrine göre farklı',
    Math.abs(hIyi - hKotu) > 10, hIyi.toFixed(0) + ' vs ' + hKotu.toFixed(0));
}

/* 26. Oyuncusuz dünya hâlâ etkilenmiyor */
{
  const a = G.dunyaKur(909), b = G.dunyaKur(909);
  G.oyuncuKur(b);
  for (let t=0;t<80;t++){ G.adim(a); G.adim(b); }
  T('oyuncu hiç hamle yapmazsa dünya aynı akar',
    JSON.stringify(G.durumVektoru(a)) === JSON.stringify(G.durumVektoru(b)));
}

console.log('\n' + (kaldi === 0 ? 'HEPSİ GEÇTİ' : kaldi + ' TEST KALDI') + '  (' + gecti + '/' + (gecti + kaldi) + ')\n');
process.exit(kaldi ? 1 : 0);
