/* Aşama 1 kanıtı: sistemin kendi ürettiği fizikle yazdığı tarih. */
const G = require('./sim.js');

const baslangic = parseInt(process.argv[2] || '1', 10);
let bulunan = null, denenen = 0;
const t0 = Date.now();
for (let s = baslangic; s < baslangic + 5000; s++) {
  denenen++;
  const d = G.dogrula(s);
  if (d.gecti) { bulunan = d; break; }
}
if (!bulunan) { console.log('Sınavı geçen dünya bulunamadı.'); process.exit(1); }

const w = G.dunyaKur(bulunan.seed);
const cz = s => '─'.repeat(s);

console.log('\n' + cz(74));
console.log(`  DÜNYA #${bulunan.seed}   (${denenen} aday elendi, ${Date.now()-t0}ms)`);
console.log(cz(74));
console.log(`  canlılık ${bulunan.canlilik} · çeşitlilik ${bulunan.cesitlilik} · ayakta ${bulunan.hayatta}`);
console.log(`  tek hamlenin 100 tur sonraki en büyük etkisi: ${bulunan.enSapma} birim`);
console.log(`  o hamlenin yaydığı dalga: durumun %${(bulunan.yayilim*100).toFixed(0)}'i · yapısal değişim: ${bulunan.yapisal}`);

console.log('\n' + cz(74));
console.log('  BU DÜNYANIN KANUNLARI  (sistem üretti — her dünyada başkadır)');
console.log(cz(74));
w.kanunlar.forEach((k, i) => console.log(`  ${String(i+1).padStart(2)}. ${G.kanunMetni(k)}`));
console.log(`\n  Evrensel çekim: ${w.cekim.toFixed(4)}   ·   Gürültü: ${w.gurultu.toFixed(3)}`);
const IY = w.iliskiYasasi;
console.log(`  İlişki yasası: güç×${IY.guc.toFixed(2)} · ideoloji×${IY.ideo.toFixed(2)} · ortak düşman×${IY.ortakDusman.toFixed(2)} · öfke×${IY.ofke.toFixed(2)}`);

console.log('\n' + cz(74));
console.log('  FRAKSİYONLAR');
console.log(cz(74));
for (const f of w.fac) {
  const v = f.v;
  console.log(`  ${f.ad.padEnd(22)} lider: ${f.lider.ad}`);
  console.log(`  ${''.padEnd(22)} Güç ${v.guc|0} · Servet ${v.servet|0} · İstikrar ${v.istikrar|0} · Meşruiyet ${v.mesruiyet|0} · Bilgi ${v.bilgi|0} · Öfke ${v.ofke|0}`);
  console.log(`  ${''.padEnd(22)} bölgeler: ${f.bolgeler.map(b=>w.bolgeler[b].ad).join(', ')||'—'}`);
}

console.log('\n' + cz(74));
console.log('  KRONİK — 50 tur');
console.log(cz(74));
for (let t = 1; t <= 50; t++) {
  const ol = G.adim(w);
  if (ol.length) {
    console.log(`\n  [${String(t).padStart(2)}. mevsim]`);
    for (const o of ol) console.log(`     · ${o.metin}`);
  }
}

console.log('\n' + cz(74));
console.log('  50 TUR SONRA');
console.log(cz(74));
const sirali = w.fac.map((f,i)=>({f,i,s:G.skor(f)})).sort((a,b)=>b.s-a.s);
for (const {f,s} of sirali) {
  console.log(`  ${(f.canli?'':'† ') + f.ad.padEnd(22)} güç ${String(f.v.guc|0).padStart(2)}  servet ${String(f.v.servet|0).padStart(2)}  istikrar ${String(f.v.istikrar|0).padStart(2)}  meşruiyet ${String(f.v.mesruiyet|0).padStart(2)}  öfke ${String(f.v.ofke|0).padStart(2)}   → ${s.toFixed(1)}`);
}

/* --- KANIT: tek bir müdahale tarihi yeniden yazar mı? --- */
console.log('\n' + cz(74));
console.log('  İKİ TARİH — 10. mevsimde tek bir müdahale');
console.log(cz(74));
const A = G.dunyaKur(bulunan.seed), B = G.dunyaKur(bulunan.seed);
const hedef = 0;
for (let t = 1; t <= 120; t++) {
  if (t === 10) B.fac[hedef].v.servet = Math.min(99.6, B.fac[hedef].v.servet + 8);  // "finanse et"
  G.adim(A); G.adim(B);
}
console.log(`  Müdahale: ${A.fac[hedef].ad} gizlice finanse edildi (+8 Servet), sadece 10. mevsimde.`);
console.log(`\n  ${'fraksiyon'.padEnd(22)} ${'müdahalesiz'.padStart(12)} ${'müdahaleli'.padStart(12)}   fark`);
for (let i = 0; i < A.fac.length; i++) {
  const a = G.skor(A.fac[i]), b = G.skor(B.fac[i]);
  const bar = Math.abs(a-b) > 8 ? '  ◄ tarih değişti' : '';
  console.log(`  ${A.fac[i].ad.padEnd(22)} ${a.toFixed(1).padStart(12)} ${b.toFixed(1).padStart(12)}   ${(b-a>=0?'+':'')+(b-a).toFixed(1)}${bar}`);
}
let fark = 0;
for (let i = 0; i < A.bolgeler.length; i++) if (A.bolgeler[i].sahip !== B.bolgeler[i].sahip) fark++;
let lf = 0;
for (let i = 0; i < A.fac.length; i++) if (A.fac[i].lider.ad !== B.fac[i].lider.ad) lf++;
console.log(`\n  120. mevsimde: ${fark} bölge başka elde, ${lf} fraksiyonun başında başka bir lider var.`);
console.log(cz(74) + '\n');
