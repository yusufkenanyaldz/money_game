/* VEBA — çekirdek testleri. En kritik olanı sonuncusu:
 * gerçek bilgiyle oynamak sezgiyle oynamaktan ölçülebilir şekilde iyi mi? */
const V = require('./cekirdek.js');
let gecti = 0, kaldi = 0;
const T = (ad, kosul, detay) => {
  if (kosul) { gecti++; console.log('  ✓ ' + ad + (detay ? '   ' + detay : '')); }
  else { kaldi++; console.log('  ✗ ' + ad + (detay ? '   ' + detay : '')); }
};
const N = 20;
function kos(fn){
  let s=0, i=0, h=0, en=100, az=0;
  for (let t=1;t<=N;t++){
    const O = V.sehirKur(t);
    while (!O.bitti){ if (fn) fn(O); V.hafta(O); }
    const p = (O.sonuc==='isyan') ? 0 : V.skor(O).oran;   // isyan = yenilgi
    s+=p; if(O.sonuc==='isyan') i++; h+=O.hafta;
    en=Math.min(en,p); az=Math.max(az,p);
  }
  return { oran:+(s/N).toFixed(1), isyan:i, hafta:+(h/N).toFixed(0), en:+en.toFixed(0), az:+az.toFixed(0) };
}

console.log('\nVEBA — çekirdek testleri\n');

/* 1. Belirlenimcilik */
{
  const a = V.sehirKur(7), b = V.sehirKur(7);
  for (let i=0;i<30;i++){ V.hafta(a); V.hafta(b); }
  T('aynı tohum aynı salgını üretir',
    JSON.stringify(V.skor(a)) === JSON.stringify(V.skor(b)));
}

/* 2. Sayılar tutarlı */
{
  let bozuk = 0;
  for (let t=1;t<=8;t++){
    const O = V.sehirKur(t);
    while (!O.bitti){
      V.hafta(O);
      for (const m of O.mahalleler){
        for (const k of ['S','Eb','Ib','Ep','Ip','R','D'])
          if (!isFinite(m[k]) || m[k] < -0.01) bozuk++;
        if (Math.abs((V.nufus(m) + m.D) - m.nufus) > 1.5) bozuk++;   // kimse yoktan var olmaz
      }
    }
  }
  T('nüfus korunur, NaN yok', bozuk === 0, bozuk + ' bozukluk');
}

/* 3. İki perdeli yapı: yaz hıyarcıklı, kış akciğer */
{
  let yazB = 0, kisA = 0;
  for (let t=1;t<=8;t++){
    const O = V.sehirKur(t);
    while (!O.bitti){
      const once = O.mahalleler.reduce((a,m)=>a+m.Ib,0);
      const onceP = O.mahalleler.reduce((a,m)=>a+m.Ip,0);
      V.hafta(O);
      if (O.hafta >= 12 && O.hafta <= 24) yazB = Math.max(yazB, once);
      if (O.hafta >= 34) kisA = Math.max(kisA, onceP);
    }
  }
  T('yazın hıyarcıklı dalga var', yazB > 20, 'en yüksek Ib ' + yazB.toFixed(0));
  T('kışın akciğer dalgası var', kisA > 20, 'en yüksek Ip ' + kisA.toFixed(0));
}

/* 4. Mevsimsellik gerçek */
{
  T('pire yazın etkin, kışın değil',
    V.pireEtkinligi(16) > 0.9 && V.pireEtkinligi(40) < 0.2,
    'temmuz ' + V.pireEtkinligi(16) + ' · ocak ' + V.pireEtkinligi(40));
  T('soğuk kışın zirvede',
    V.soguk(40) > 0.9 && V.soguk(16) < 0.1);
}

/* 5. Temel senaryo oynanabilir bantta */
{
  const t = kos(null);
  T('hiçbir şey yapmayan oyuncu şehrin çoğunu kaybeder',
    t.oran >= 15 && t.oran <= 45, 'yaşayan %' + t.oran);
  T('yıl sonuna kadar oynanır', t.hafta >= 42, 'ortalama bitiş haftası ' + t.hafta);
}

/* 6. Kaldıraçlar doğru yönde */
{
  const temel = kos(null);
  const ambar = kos(O => {
    const k = O.mahalleler.slice().sort((a,b)=>b.ambar-a.ambar)[0];
    if (k && k.ambar > 50) V.eylemYap(O,'ambar',k.id);
  });
  const kar = kos(O => {
    const e = O.mahalleler.slice().sort((a,b)=>(b.Ib+b.Ip)-(a.Ib+a.Ip))[0];
    if (e && (e.Ib+e.Ip) > 4 && e.karantina === 0) V.eylemYap(O,'karantina',e.id);
  });
  const ayin = kos(O => { if (O.hafta % 6 === 0 && O.hafta > 28) V.eylemYap(O,'ayin'); });
  T('ambar temizliği fayda sağlar', ambar.oran > temel.oran, temel.oran + ' → ' + ambar.oran);
  T('karantina fayda sağlar', kar.oran > temel.oran, temel.oran + ' → ' + kar.oran);
  T('toplu ayin TUZAKTIR (moral yükseltir, bulaşı artırır)',
    ayin.oran < temel.oran, temel.oran + ' → ' + ayin.oran);
}

/* 7. ASIL SINAV: gerçek bilgi sezgiyi yener */
{
  const bilgili = (O) => {
    const kirli = O.mahalleler.slice().sort((a,b)=>b.ambar-a.ambar)[0];
    if (O.hafta < 24 && kirli && kirli.ambar > 45) { V.eylemYap(O,'ambar',kirli.id); return; }
    if (O.hafta === 31 && !O.kapiKapali) { V.eylemYap(O,'kapiKapat'); return; }
    const ak = O.mahalleler.slice().sort((a,b)=>b.Ip-a.Ip)[0];
    if (ak && ak.Ip > 1.5 && ak.karantina === 0) { V.eylemYap(O,'karantina',ak.id); return; }
    const kz = O.mahalleler.slice().sort((a,b)=>b.huzursuzluk-a.huzursuzluk)[0];
    if (kz && kz.huzursuzluk > 40) { V.eylemYap(O,'ekmek',kz.id); return; }
    if (kirli && kirli.ambar > 30) V.eylemYap(O,'ambar',kirli.id);
  };
  const sezgisel = (O) => {
    const e = O.mahalleler.slice().sort((a,b)=>(b.Ib+b.Ip)-(a.Ib+a.Ip))[0];
    if (e && (e.Ib+e.Ip) > 3 && e.karantina === 0) { V.eylemYap(O,'karantina',e.id); return; }
    const kz = O.mahalleler.slice().sort((a,b)=>b.huzursuzluk-a.huzursuzluk)[0];
    if (kz && kz.huzursuzluk > 40) { V.eylemYap(O,'ayin'); return; }
    if (O.hafta === 8) V.eylemYap(O,'cenaze');
  };
  const t = kos(null), z = kos(sezgisel), b = kos(bilgili);
  console.log('\n     hiçbir şey %' + t.oran + '  ·  sezgisel %' + z.oran + '  ·  okumuş %' + b.oran + '\n');
  T('sezgiyle oynamak hiç oynamamaktan iyidir', z.oran > t.oran + 5);
  T('GERÇEK BİLGİ SEZGİYİ YENER', b.oran > z.oran + 10,
    '+' + (b.oran - z.oran).toFixed(1) + ' puan üstünlük');
  // Doğru ölçüt: aynı şehirde karşılaştır. Uçları kıyaslamak yanıltıcıydı.
  let kazanan = 0;
  for (let t2=1;t2<=N;t2++){
    const A = V.sehirKur(t2); while(!A.bitti){ bilgili(A); V.hafta(A); }
    const B = V.sehirKur(t2); while(!B.bitti){ sezgisel(B); V.hafta(B); }
    const pa = (A.sonuc==='isyan')?0:V.skor(A).oran, pb = (B.sonuc==='isyan')?0:V.skor(B).oran;
    if (pa > pb) kazanan++;
  }
  T('üstünlük şanstan değil: aynı şehirde okumuş kazanır',
    kazanan >= N*0.9, kazanan + '/' + N + ' şehirde okumuş oyuncu önde');
}

console.log('\n' + (kaldi === 0 ? 'HEPSİ GEÇTİ' : kaldi + ' TEST KALDI') + '  (' + gecti + '/' + (gecti+kaldi) + ')\n');
process.exit(kaldi ? 1 : 0);
