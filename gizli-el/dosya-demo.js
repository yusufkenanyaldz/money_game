/* Aynı mesele, iki farklı istihbarat konumu.
 * Solda: önceden ajan yerleştirmiş oyuncu. Sağda: yerleştirmemiş. */
const G = require('./sim.js');

let seed = null;
for (let s = 1; s < 4000 && !seed; s++) if (G.dogrula(s).gecti) seed = s;

function hazirla(ajanliMi){
  const w = G.dunyaKur(seed);
  G.oyuncuKur(w, { doktrin:'bilgelik' });
  for (let t=0;t<10;t++) G.adim(w);
  const h = w.fac.map((f,i)=>({i,f,z:f.v.bilgi*0.5+G.skor(f)*0.5}))
    .filter(x=>x.f.canli && G.skor(x.f)>28 && x.f.v.ofke<60).sort((a,b)=>b.z-a.z)[0];
  G.tohumEk(w, { fac:h.i, katman:'esnaf', amac:'okuryazarlik', bolge:h.f.bolgeler[0] });
  if (ajanliMi) w.el.ajanlar.push({ id:0, fac:h.i, dikildi:w.tur, olgun:true, yakalandi:false });
  let m = null;
  for (let t=0;t<130 && !m;t++){ G.adim(w); m = w.meseleler.find(x=>x.acik); }
  return { w, m, th: w.tohumlar[0] };
}

const c = n => '═'.repeat(n);
const ince = n => '─'.repeat(n);

function yaz(d, th, baslik){
  console.log('\n' + c(74));
  console.log('  ' + baslik);
  console.log(c(74));
  console.log(`  DOSYA — ${d.baslik}          karar için ${d.kalanMevsim} mevsim`);
  console.log(ince(74));
  console.log('  ' + d.girizgah);
  console.log('\n  Elindeki kaynaklar: ' + d.kaynakDurumu.map(k=>`${k.ad} (${k.etiket})`).join(' · '));

  console.log('\n  TANIKLIKLAR');
  for (const t of d.tanikliklar)
    console.log(`    ${('['+t.kaynakAd+']').padEnd(11)} ${t.baslik.padEnd(24)} "${t.metin}"`);

  console.log('\n  TAHMİNLER  (kesin rakam yok)');
  for (const o of d.olcumler)
    console.log(`    ${o.ad.padEnd(24)} ${o.aralik.padEnd(12)} ${o.kaynak}`);

  if (d.karanlik && d.karanlik.length){
    console.log('\n  KARANLIKTA  (hiçbir kaynağın göremediği)');
    for (const k of d.karanlik) console.log(`    ${k}`);
  }

  if (d.celiskiler.length){
    console.log('\n  ÇELİŞKİLER  (biri yanılıyor)');
    for (const k of d.celiskiler){
      console.log(`    ${k.baslik}:`);
      console.log(`      ${k.a.kaynakAd} (${k.a.etiket}): "${k.a.metin}"`);
      console.log(`      ${k.b.kaynakAd} (${k.b.etiket}): "${k.b.metin}"`);
    }
  }

  console.log('\n  SEÇENEKLER');
  for (const s of d.secenekler) console.log(`    ${s.ad.padEnd(26)} ${s.tarif}`);

  // sadece bu demoda: perde arkası
  console.log('\n  ' + ince(70));
  console.log(`  [perde arkası] gerçek destek %${Math.round(th.gercekDestek)} · ` +
    `olgunluk ${Math.round(th.olgunluk)} · denetimin %${Math.round(th.denetim)}`);
  console.log(`  [perde arkası] 6 olgudan doğru bilinen: ${d.tanikliklar.filter(t=>t._dogru).length}/6` +
    ` (${d.tanikliklar.length} satır geldi, ${(d.karanlik||[]).length} karanlıkta)`);
}

const A = hazirla(true), B = hazirla(false);
if (!A.m || !B.m) { console.log('Mesele açılmadı.'); process.exit(0); }
yaz(G.dosyaUret(A.w, A.m.id), A.th, 'ÖNCEDEN AJAN YERLEŞTİRMİŞ OYUNCU');
yaz(G.dosyaUret(B.w, B.m.id), B.th, 'AJAN YERLEŞTİRMEMİŞ OYUNCU');

// isabet farkını çok denemede ölç
let iyi = 0, kotu = 0, n = 0;
for (let s = seed; s < seed + 900 && n < 12; s++){
  if (!G.dogrula(s).gecti) continue;
  for (const ajanli of [true, false]){
    const w = G.dunyaKur(s); G.oyuncuKur(w);
    for (let t=0;t<10;t++) G.adim(w);
    const h = w.fac.map((f,i)=>({i,f,z:G.skor(f)})).filter(x=>x.f.canli&&x.z>28).sort((a,b)=>b.z-a.z)[0];
    if (!h) continue;
    G.tohumEk(w, { fac:h.i, katman:'esnaf', amac:'okuryazarlik', bolge:h.f.bolgeler[0] });
    if (ajanli) w.el.ajanlar.push({ id:0, fac:h.i, dikildi:w.tur, olgun:true, yakalandi:false });
    let m = null;
    for (let t=0;t<130 && !m;t++){ G.adim(w); m = w.meseleler.find(x=>x.acik); }
    if (!m) continue;
    const d = G.dosyaUret(w, m.id);
    // gerçek ölçüt: altı olgudan kaçını DOĞRU biliyorsun (kapsam × isabet)
    const oran = d.tanikliklar.filter(x=>x._dogru).length / 6;
    if (ajanli) iyi += oran; else kotu += oran;
  }
  n++;
}
console.log('\n' + c(74));
console.log(`  ${n} dünyada ölçüm — dosyanın isabet oranı:`);
console.log(`    ajan yerleştirmiş oyuncu : %${(iyi/n*100).toFixed(0)}`);
console.log(`    yerleştirmemiş oyuncu    : %${(kotu/n*100).toFixed(0)}`);
console.log(c(74) + '\n');
