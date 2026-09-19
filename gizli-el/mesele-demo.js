/* Senaryo: bir katmana okuryazarlık ekersen ne olur?
 * Ve mesele açıldığında beş kararın her biri tarihi nasıl ayırır? */
const G = require('./sim.js');

let seed = null;
for (let s = 300; s < 4000; s++) if (G.dogrula(s).gecti) { seed = s; break; }

const w = G.dunyaKur(seed);
for (let t = 0; t < 12; t++) G.adim(w);            // dünya kendi hâlinde dönsün

// En okur-yazar zemine sahip fraksiyonu seç
// Sağlam bir konak seç: okur-yazar zemini olan AMA çökmekte olmayan
const hedef = w.fac.map((f,i)=>({i,f,z:f.v.bilgi*0.5+f.v.istikrar*0.3+G.skor(f)*0.4}))
                   .filter(x=>x.f.canli && G.skor(x.f) > 28 && x.f.v.ofke < 60)
                   .sort((a,b)=>b.z-a.z)[0];
if (!hedef) { console.log('Bu dünyada sağlam konak yok.'); process.exit(0); }
const th = G.tohumEk(w, { fac: hedef.i, katman: 'esnaf', amac: 'okuryazarlik',
                          bolge: hedef.f.bolgeler[0] });

const ç = n => '─'.repeat(n);
console.log('\n' + ç(76));
console.log(`  DÜNYA #${seed}  ·  ${hedef.f.ad} içinde esnaf katmanına okuryazarlık ekildi`);
console.log(`  Akımın adı: ${th.ad}`);
console.log(ç(76));
console.log('  tur   olgunluk  denetim   görünen/gerçek destek   evre');

let meseleId = null;
for (let t = 13; t <= 90; t++) {
  const ol = G.adim(w);
  if (t % 6 === 0 || ol.some(o => o.tohum === th.id || o.tip === 'meseleAcildi')) {
    console.log(`  ${String(t).padStart(3)}   ${String(Math.round(th.olgunluk)).padStart(6)}    ` +
      `${String(Math.round(th.denetim)).padStart(5)}   ${String(Math.round(th.gorunurDestek)).padStart(10)}` +
      ` / ${String(Math.round(th.gercekDestek)).padStart(3)}        ${th.evre}`);
  }
  for (const o of ol) if (o.tohum === th.id || o.tip === 'meseleAcildi')
    console.log(`        ▸ ${o.metin}`);
  const acik = w.meseleler.find(m => m.acik && m.ilgili.tohum === th.id);
  if (acik) { meseleId = acik.id; break; }
}

if (meseleId === null) { console.log('\n  Bu dünyada mesele açılmadı.'); process.exit(0); }

const m = w.meseleler[meseleId];
console.log('\n' + ç(76));
console.log(`  MESELE AÇILDI — "${m.baslik}"   ·  ${G.meselePencere(w, m)} mevsim içinde karar ver`);
console.log(ç(76));
console.log(`  ${th.ad}: olgunluk ${Math.round(th.olgunluk)} · denetimin %${Math.round(th.denetim)}`);
console.log(`  görünen destek %${Math.round(th.gorunurDestek)} · gerçek destek ${'bilinmiyor'}`);
console.log(`  ${hedef.f.ad}: meşruiyet ${hedef.f.v.mesruiyet|0} · öfke ${hedef.f.v.ofke|0} · istikrar ${hedef.f.v.istikrar|0}`);
console.log(`\n  Seçenekler: ${m.secenekler.join(' · ')}`);

const ACIK = { bekle:'Bekle', gozetle:'Gözetle', kurumsallastir:'Kurumsallaştır',
               yonlendir:'Başka hedefe yönlendir', bastir:'Bastır', terk:'Terk et',
               gunahKecisi:'Günah keçisi yap' };

console.log('\n' + ç(76));
console.log('  AYNI ANDAN BEŞ FARKLI TARİH  (karardan 60 mevsim sonra)');
console.log(ç(76));

const sonuclar = [];
for (const karar of m.secenekler) {
  const d = G.klonla(w);
  const olay = G.meseleKarar(d, meseleId, karar);
  const kavramlar = new Set(olay.map(o => o.kavram).filter(Boolean));
  let kopus = 0, savas = 0, isyan = 0, darbe = 0;
  const baslangicFac = d.fac.length;
  for (let t = 0; t < 60; t++) {
    for (const o of G.adim(d)) {
      if (o.tip === 'kopus') kopus++;
      if (o.tip === 'savas') savas++;
      if (o.tip === 'isyan') isyan++;
      if (o.tip === 'darbe') darbe++;
      if (o.kavram) kavramlar.add(o.kavram);
    }
  }
  const h = d.fac[hedef.i], t2 = d.tohumlar[th.id];
  sonuclar.push({ karar, h, t2, kopus, savas, isyan, darbe,
                  yeniFac: d.fac.length - baslangicFac, kavramlar: [...kavramlar],
                  ilk: olay[0] ? olay[0].metin : '' });
}

for (const s of sonuclar) {
  console.log(`\n  ── ${ACIK[s.karar]} ──`);
  console.log(`     ${s.ilk}`);
  console.log(`     ${hedef.f.ad}: meşruiyet ${s.h.v.mesruiyet|0} · öfke ${s.h.v.ofke|0} · ` +
              `istikrar ${s.h.v.istikrar|0} · bilgi ${s.h.v.bilgi|0} · skor ${G.skor(s.h).toFixed(1)}`);
  const akimDurum = s.t2.canli
    ? (s.t2.kurumsal ? 'düzenin parçası' : 'hâlâ senin') + ' · olgunluk ' + Math.round(s.t2.olgunluk) +
      ' · denetimin %' + Math.round(s.t2.denetim) + ' · amaç ' + G.AMACLAR[s.t2.amac].ad
    : (s.t2.son === 'kopus' ? 'KOPTU — artık ayrı bir güç' : 'konak çöktüğü için dağıldı');
  console.log(`     ${s.t2.ad}: ${akimDurum} · gerçek destek %${Math.round(s.t2.gercekDestek)}`);
  console.log(`     60 mevsimde: ${s.isyan} ayaklanma · ${s.savas} savaş · ${s.darbe} darbe · ` +
              `${s.yeniFac} yeni fraksiyon`);
}

console.log('\n' + ç(76));
console.log('  KÜTÜPHANE — bu meselede işleyen kuramlar');
console.log(ç(76));
const gorulen = new Set(sonuclar.flatMap(s => s.kavramlar));
gorulen.add(m.kavram);
for (const k of gorulen) {
  const K = G.KAVRAMLAR[k]; if (!K) continue;
  console.log(`\n  ${K.ad}`);
  console.log(`    ${K.tek}`);
  console.log(`    ${K.kaynak}`);
}
console.log('\n  Oyun bunları açıklamaz. Okursan bir sonrakini önceden görürsün.\n');
