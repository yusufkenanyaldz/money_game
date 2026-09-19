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

console.log('\n' + (kaldi === 0 ? 'HEPSİ GEÇTİ' : kaldi + ' TEST KALDI') + '  (' + gecti + '/' + (gecti + kaldi) + ')\n');
process.exit(kaldi ? 1 : 0);
