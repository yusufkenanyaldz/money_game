/* Ayar tezgâhı: dört oyuncu tipini tohumlar üzerinde koşturur. */
const V = require('./cekirdek.js');

const STRATEJILER = {
  'hicbir sey': () => {},

  'kotu oyun': (O) => {                       // sezgiyle oynayan
    if (O.hafta === 3) V.eylemYap(O, 'itlaf');           // kedileri itlaf (TUZAK)
    if (O.hafta === 12) V.eylemYap(O, 'itlaf');
    const en = O.mahalleler.slice().sort((a,b)=>(b.Ib+b.Ip)-(a.Ib+a.Ip))[0];
    if (en && (en.Ib+en.Ip) > 4 && en.karantina === 0) V.eylemYap(O, 'karantina', en.id);
    if (O.hafta === 6) V.eylemYap(O, 'kapiKapat');
  },

  'iyi oyun': (O) => {                        // okumuş oyuncu
    // 1) Önce ambarlar: fare kapasitesini kır (hıyarcıklı formun kökü)
    const kirli = O.mahalleler.slice().sort((a,b)=>b.ambar-a.ambar)[0];
    if (O.hafta <= 10 && kirli && kirli.ambar > 90) { V.eylemYap(O,'ambar',kirli.id); return; }
    // 2) Kışa girerken kapıyı kapat (kervan gelmesin)
    if (O.hafta === 31 && !O.kapiKapali) { V.eylemYap(O,'kapiKapat'); return; }
    if (O.hafta === 40 && O.kapiKapali) { V.eylemYap(O,'kapiAc'); return; }
    // 3) Huzursuz mahalleye ekmek
    const kizgin = O.mahalleler.slice().sort((a,b)=>b.huzursuzluk-a.huzursuzluk)[0];
    if (kizgin && kizgin.huzursuzluk > 45) { V.eylemYap(O,'ekmek',kizgin.id); return; }
    // 4) Akciğer formu varsa karantina (o zaman GERÇEKTEN işe yarar)
    const akciger = O.mahalleler.slice().sort((a,b)=>b.Ip-a.Ip)[0];
    if (akciger && akciger.Ip > 2 && akciger.karantina === 0) { V.eylemYap(O,'karantina',akciger.id); return; }
    // 5) Boşsa ambar temizlemeye devam
    if (kirli && kirli.ambar > 60) V.eylemYap(O,'ambar',kirli.id);
  },

  'sadece ekmek': (O) => {
    const kizgin = O.mahalleler.slice().sort((a,b)=>b.huzursuzluk-a.huzursuzluk)[0];
    if (kizgin && kizgin.huzursuzluk > 35) V.eylemYap(O,'ekmek',kizgin.id);
  }
};

const N = 12;
console.log('strateji'.padEnd(14), 'yasayan%'.padStart(9), 'isyan'.padStart(6), 'ort.bitis'.padStart(10), 'kisa ulasan'.padStart(12));
for (const ad in STRATEJILER){
  let top=0, isyan=0, hafta=0, kis=0;
  for (let t=1;t<=N;t++){
    const O = V.sehirKur(t);
    while (!O.bitti){ STRATEJILER[ad](O); V.hafta(O); }
    const s = V.skor(O);
    top += s.oran; if (O.sonuc==='isyan') isyan++; hafta += O.hafta; if (O.hafta>=34) kis++;
  }
  console.log(ad.padEnd(14), (top/N).toFixed(1).padStart(9), String(isyan+'/'+N).padStart(6),
    (hafta/N).toFixed(0).padStart(10), String(kis+'/'+N).padStart(12));
}
