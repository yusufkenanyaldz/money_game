/* Her kaldıraç tek başına ne yapıyor? Temel ile karşılaştır. */
const V = require('./cekirdek.js');
const N = 14;

function kos(fn){
  let top=0, isyan=0, hafta=0;
  for (let t=1;t<=N;t++){
    const O = V.sehirKur(t);
    while (!O.bitti){ if(fn) fn(O); V.hafta(O); }
    // isyan = yenilgi. Erken biten oyun "daha az ölü" demek değildir.
    top += (O.sonuc==='isyan') ? 0 : V.skor(O).oran;
    if(O.sonuc==='isyan') isyan++; hafta += O.hafta;
  }
  return { oran:+(top/N).toFixed(1), isyan, hafta:+(hafta/N).toFixed(0) };
}

const temel = kos(null);
console.log('TEMEL (hiçbir şey):', JSON.stringify(temel), '\n');

const testler = {
  'ambar temizligi (surekli)': O => {
    const k = O.mahalleler.slice().sort((a,b)=>b.ambar-a.ambar)[0];
    if (k && k.ambar > 50) V.eylemYap(O,'ambar',k.id);
  },
  'kedi itlafi (hafta 3)': O => { if(O.hafta===3) V.eylemYap(O,'itlaf'); },
  'karantina (en hastaya)': O => {
    const e = O.mahalleler.slice().sort((a,b)=>(b.Ib+b.Ip)-(a.Ib+a.Ip))[0];
    if (e && (e.Ib+e.Ip)>4 && e.karantina===0) V.eylemYap(O,'karantina',e.id);
  },
  'ekmek (huzursuza)': O => {
    const k = O.mahalleler.slice().sort((a,b)=>b.huzursuzluk-a.huzursuzluk)[0];
    if (k && k.huzursuzluk>35) V.eylemYap(O,'ekmek',k.id);
  },
  'hekim (en hastaya)': O => {
    const e = O.mahalleler.slice().sort((a,b)=>(b.Ib+b.Ip)-(a.Ib+a.Ip))[0];
    if (e && (e.Ib+e.Ip)>4 && e.hekim===0) V.eylemYap(O,'hekim',e.id);
  },
  'kapi kapat (hafta 6)': O => { if(O.hafta===6) V.eylemYap(O,'kapiKapat'); },
  'cenaze (surekli)': O => { if(O.hafta%4===0) V.eylemYap(O,'cenaze'); }
};

for (const ad in testler){
  const r = kos(testler[ad]);
  const fark = (r.oran - temel.oran).toFixed(1);
  const isaret = fark > 1 ? '✓ iyi' : (fark < -1 ? '✗ zararlı' : '· etkisiz');
  console.log(ad.padEnd(26), 'yasayan %'+String(r.oran).padStart(5),
    ' fark '+String(fark>0?'+'+fark:fark).padStart(6),
    ' isyan '+String(r.isyan+'/'+N).padStart(6), ' ', isaret);
}
