/* GİZLİ EL — simülasyon çekirdeği
 * Dünyanın fiziği her oyunda yeniden üretilir: nedensellik grafiği,
 * katsayılar, eşikler ve işaretler rastgeledir. Üretilen her kanun seti
 * oyuna verilmeden önce headless sınavdan geçer (bkz. dogrula()).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

/* ---------- deterministik rastgelelik ---------- */
// sıralı akış (dünya kurulumu için)
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
// konumsal hash (tur içi olaylar için — geçmişten bağımsız, kelebek etkisi ölçülebilsin)
function hsh(str){ let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; } h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return ((h^h>>>16)>>>0)/4294967296; }

/* ---------- değişkenler ---------- */
const VARS = ['guc','servet','istikrar','mesruiyet','bilgi','ofke'];
const VAD  = { guc:'Güç', servet:'Servet', istikrar:'İstikrar', mesruiyet:'Meşruiyet', bilgi:'Bilgi', ofke:'Öfke' };
const KAPSAM = ['oz','dusman','dost','dunya','komsu'];
const KAD = { oz:'kendi', dusman:'düşmanlarının', dost:'müttefiklerinin', dunya:'dünyanın', komsu:'komşularının' };
const SEKIL = ['dogrusal','esik','carpim','kitlik','doyum','geri'];

/* ---------- isim üretimi ---------- */
const SIFAT = ['Kara','Demir','Kızıl','Sessiz','Yedinci','Kırık','Altın','Gri','Uzak','Sonsuz','Tuzlu','Çıplak','Beyaz','Küllü','Yıldızsız','Boğuk','Mavi','Derin','Solgun','Çelik'];
const KURUM = ['Divan','Ahit','Locası','Konseyi','Hanedanı','Kapısı','Ocağı','Meclisi','Kardeşliği','Sofrası','Mührü','Kolu','Yemini','Sancağı','Halkası','Tarikatı'];
const AD = ['Vehbi','Sarya','Danyal','Melek','Kerem','Nuray','İskender','Bahar','Teoman','Zeliha','Rüzgar','Ferhat','Nergis','Cahit','İdris','Ayla','Sinan','Reyhan','Orhun','Peri','Kasım','Şahnur','Ünal','Defne','Bekir','Yıldız','Hamza','Mine','Tarık','Esma','Volkan','Ceren','Salih','Neva','Burak','Alev'];
const LAKAP = ['Sabırlı','Topal','Ölçücü','Yalancı','Kuzgun','Zehirli','Sağır','Yorgun','Kanlı','Nazik','Uykusuz','Tilki','Kilitli','Gülmeyen','İpek','Dilsiz','Tutkulu','Buzlu','Hesapçı','Çıplak Ayak'];
const BOLGE = ['Tuz Ovası','Kırık Liman','Bakır Geçidi','Alacakaranlık Vadisi','Dokuz Kuyu','Sazlık','Demirkapı','Ak Yayla','Sisli Boğaz','Yankı Tepeleri','Kestane Havzası','Cam Çölü','Kuyruklu Burun','Soğuk Dere','Yedi Değirmen','Batık Tarla'];

// Türkçe ek uyumu — "Kırık Liman'nı" gibi hatalar olmasın
const _ONLU = { 'a':'ı','ı':'ı','o':'u','u':'u','e':'i','i':'i','ö':'ü','ü':'ü' };
function sonUnlu(ad){
  const x = ad.toLowerCase();
  for (let i=x.length-1;i>=0;i--) if (_ONLU[x[i]]) return _ONLU[x[i]];
  return 'ı';
}
function unluMu(c){ return !!_ONLU[c.toLowerCase()]; }
function ekBelirtme(ad){            // -ı / -yı  (belirtme hâli)
  const u = sonUnlu(ad);
  return ad + "'" + (unluMu(ad[ad.length-1]) ? 'n' : '') + u;
}
function ekYonelme(ad){             // -a / -na  (yönelme hâli)
  const u = sonUnlu(ad), e = (u==='ı'||u==='u') ? 'a' : 'e';
  return ad + "'" + (unluMu(ad[ad.length-1]) ? 'n' : '') + e;
}

function sec(r, arr){ return arr[Math.floor(r()*arr.length)|0]; }
function secBenzersiz(r, arr, n){ const c=arr.slice(), o=[]; for(let i=0;i<n && c.length;i++) o.push(c.splice(Math.floor(r()*c.length),1)[0]); return o; }
function ara(r,a,b){ return a + r()*(b-a); }
function kirp(v,a,b){ return v<a?a:(v>b?b:v); }

/* ---------- KANUN ÜRETECİ ---------- */
// Bir kanun: hedef değişkenin turluk değişimine, kaynak değişkenin
// belirli bir kapsamdaki değerinden türeyen bir katkı ekler.
function kanunUret(r, i){
  const hedef = sec(r, VARS);
  const kaynak = sec(r, VARS);
  const sekil = sec(r, SEKIL);
  const kapsam = sec(r, KAPSAM);
  const isaret = r() < 0.5 ? -1 : 1;
  const k = {
    id: i,
    hedef, kaynak, sekil, kapsam,
    kat: isaret * ara(r, 0.45, 3.0),
    esik: Math.round(ara(r, 22, 78)),
    gizli: true                      // oyuncu keşfedene kadar görünmez
  };
  if (sekil === 'carpim') k.kaynak2 = sec(r, VARS);
  return k;
}

// Kanun SETİ üretimi. Kurallar hâlâ rastgele formülize edilir; yalnızca
// baştan ölü doğan setler (yetim değişken, fraksiyonlar arası kopukluk,
// geri besleme yokluğu) elenir — gerisini dogrula() karara bağlar.
function kanunSetiUret(r, nK){
  const K=[];
  // 1) her hedef değişken en az bir kanunla beslensin (yetim değişken olmasın)
  const sira = VARS.slice();
  for (let i=sira.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=sira[i]; sira[i]=sira[j]; sira[j]=t; }
  for (const hedef of sira){ const k=kanunUret(r, K.length); k.hedef=hedef; K.push(k); }
  // 2) kalanı tamamen serbest
  while (K.length < nK) K.push(kanunUret(r, K.length));
  // 3) fraksiyonlar arası bağ kotası — dalga yayılabilsin
  const kota = Math.ceil(nK*0.45);
  let dis = K.filter(k=>k.kapsam!=='oz').length;
  let guvenlik = 0;
  while (dis < kota && guvenlik++ < 200){
    const aday = K.filter(k=>k.kapsam==='oz');
    if (!aday.length) break;
    const k = aday[Math.floor(r()*aday.length)];
    k.kapsam = KAPSAM[1 + Math.floor(r()*(KAPSAM.length-1))];
    dis++;
  }
  // 4) en az bir geri besleme çevrimi (X→Y ve Y→X) bulunsun
  const cevrimVar = K.some(a=>K.some(b=>a!==b && a.hedef===b.kaynak && b.hedef===a.kaynak));
  if (!cevrimVar && K.length>=2){
    const a=K[Math.floor(r()*K.length)];
    let b=K[Math.floor(r()*K.length)]; if(b===a) b=K[(K.indexOf(a)+1)%K.length];
    b.kaynak=a.hedef; a.kaynak=b.hedef;
    if (a.sekil==='carpim') a.kaynak2=sec(r,VARS);
    if (b.sekil==='carpim') b.kaynak2=sec(r,VARS);
  }
  K.forEach((k,i)=>k.id=i);
  return K;
}

function sekilDeger(k, a, b){
  switch(k.sekil){
    case 'dogrusal': return (a - k.esik) / 50;
    case 'esik':     return a > k.esik ? 1 : -0.6;
    case 'carpim':   return (a/100) * (b/100) * 2 - 0.5;
    case 'kitlik':   return a < k.esik ? (k.esik - a) / 50 : 0;
    case 'doyum':    return Math.sqrt(a/100) - 0.5;
    case 'geri':     return 0.5 - Math.pow(a/100, 2);
  }
  return 0;
}

function kanunMetni(k){
  const s = k.kat >= 0 ? 'artırır' : 'azaltır';
  const kap = KAD[k.kapsam];
  const kv = VAD[k.kaynak];
  let kos;
  switch(k.sekil){
    case 'dogrusal': kos = `${kap} ${kv} değeri ${k.esik}'in üstüne çıktıkça`; break;
    case 'esik':     kos = `${kap} ${kv} değeri ${k.esik}'i aştığında`; break;
    case 'carpim':   kos = `${kap} ${kv} ile ${VAD[k.kaynak2]} birlikte yükseldikçe`; break;
    case 'kitlik':   kos = `${kap} ${kv} değeri ${k.esik}'in altına düştükçe`; break;
    case 'doyum':    kos = `${kap} ${kv} yükseldikçe (giderek azalan hızla)`; break;
    case 'geri':     kos = `${kap} ${kv} yükseldikçe (hızlanarak tersine)`; break;
  }
  return `${kos}, ${VAD[k.hedef]} ${s}. [${Math.abs(k.kat).toFixed(2)}]`;
}

/* ---------- KALİBRASYON ----------
 * Rastgele kanunların toplamı hiçbir zaman sıfıra yakınsamaz; kalibre
 * edilmemiş bir dünyada değişkenler tavana veya tabana park eder ve
 * dünya ölür. Bu yüzden üretilen her fizik, kendi denge sabitlerini
 * headless deneme turlarıyla bulur. Kanunlar değişmez — yalnızca
 * dünyanın "sıfır noktası" kendi kurallarına göre kaydırılır. */
const _kalibreOnbellek = new Map();
function kalibreEt(seed, ayar){
  const anahtar = seed + '|' + JSON.stringify(ayar||{});
  if (_kalibreOnbellek.has(anahtar)) return _kalibreOnbellek.get(anahtar);
  let sabit = {}, olcek = {};
  for (const v of VARS){ sabit[v] = 0; olcek[v] = 1; }
  let cekimCarpani = 1;
  const UFUK = 110, OLC = 45;
  for (let tur=0; tur<4; tur++){
    const pw = dunyaKur(seed, Object.assign({}, ayar||{}, { sabit: sabit, olcek: olcek, cekimCarpani: cekimCarpani }));
    const top={}, kare={}, say={};
    for (const v of VARS){ top[v]=0; kare[v]=0; say[v]=0; }
    let ray=0, orn=0;
    for (let t=0;t<UFUK;t++){
      adim(pw);
      if (t>=OLC) for (const f of pw.fac){
        if(!f.canli) continue;
        for (const v of VARS){ const x=f.v[v]; top[v]+=x; kare[v]+=x*x; say[v]++; orn++; if (x<=3||x>=97) ray++; }
      }
    }
    const ys={}, yo={};
    for (const v of VARS){
      const nn = say[v]||1, m = top[v]/nn;
      const sd = Math.sqrt(Math.max(0, kare[v]/nn - m*m));
      ys[v] = kirp(sabit[v] - (m-48)*0.055, -6, 6);
      let o = olcek[v];
      // kanun sürüklemesi ofsetin taşıyamayacağı kadar güçlüyse kanunları kıs
      if (Math.abs(m-48) > 16) o *= 0.68;
      // boyut tamamen tek tipleşmişse kanunları kıs ki mizaç/taban farkları görünsün
      if (sd < 6) o *= 0.80;
      else if (Math.abs(m-48) < 7 && sd > 11 && o < 1) o = Math.min(1, o*1.15);
      yo[v] = kirp(o, 0.2, 1);
    }
    sabit = ys; olcek = yo;
    const rayOran = orn ? ray/orn : 1;
    if (rayOran > 0.09) cekimCarpani = Math.min(cekimCarpani * 1.5, 2.5);
    else if (rayOran < 0.01 && cekimCarpani > 1) cekimCarpani = Math.max(1, cekimCarpani * 0.75);
  }
  const sonuc = { sabit, olcek, cekimCarpani };
  if (_kalibreOnbellek.size > 400) _kalibreOnbellek.clear();
  _kalibreOnbellek.set(anahtar, sonuc);
  return sonuc;
}

/* ---------- DÜNYA KURULUMU ---------- */
function dunyaKur(seed, ayar){
  ayar = ayar || {};
  const r = mulberry32(seed >>> 0);
  const nF = ayar.fraksiyon || (6 + Math.floor(r()*3));   // 6-8
  const nB = ayar.bolge || (nF + 3 + Math.floor(r()*3));

  const w = {
    seed: seed >>> 0,
    tur: 0,
    fac: [], bolgeler: [], R: [], kanunlar: [], liderEtki: [], iliskiYasasi: null,
    cekim: ara(r, 0.0008, 0.0095),        // dünyanın ortalamaya dönüş gücü (fizik!)
    gurultu: ara(r, 0.10, 0.45),        // rastgele dalgalanma genliği
    olaylar: [], gunluk: [], sabit: null, tohumlar: [], meseleler: [], kutuphane: []
  };
  // ayar.sabit verilmişse kalibrasyon denemesindeyiz (özyineleme yok)
  w.sabit = ayar.sabit || null;
  w.olcek = ayar.olcek || null;
  if (ayar.cekimCarpani) w.cekim *= ayar.cekimCarpani;

  const sifatlar = secBenzersiz(r, SIFAT, nF);
  const kurumlar = secBenzersiz(r, KURUM, nF);
  const adlar = secBenzersiz(r, AD, nF*3);
  for (let i=0;i<nF;i++){
    const f = {
      id:i,
      ad: sifatlar[i] + ' ' + kurumlar[i],
      ideoloji: [ara(r,-1,1), ara(r,-1,1), ara(r,-1,1)],
      v: {}, bolgeler: [], canli:true,
      lider: liderUret(r, adlar[i]),
      // oyuncunun bu fraksiyonda biriktirdikleri
      nufuz:0, ajan:[], sir:[], borc:0
    };
    // mizaç: aynı kanun her fraksiyonu aynı şiddette etkilemez
    f.mizac = {};
    for (const v of VARS) f.mizac[v] = ara(r, 0.55, 1.5);
    f.taban = {};
    for (const v of VARS){
      // her fraksiyonun kendi doğası var: dünya onu buraya çeker, ortalamaya değil
      f.taban[v] = Math.round(v==='ofke' ? ara(r,14,52) : ara(r,26,74));
      f.v[v] = Math.round(kirp(f.taban[v] + ara(r,-12,12), 5, 95));
    }
    w.fac.push(f);
  }

  // ilişki matrisi (asimetrik: A, B'ye güvenirken B, A'dan nefret edebilir)
  for (let i=0;i<nF;i++){
    w.R.push([]);
    for (let j=0;j<nF;j++){
      if (i===j){ w.R[i].push(0); continue; }
      w.R[i].push(0);
    }
  }
  for (let i=0;i<nF;i++) for (let j=0;j<nF;j++){
    if (i===j) continue;
    const d = ideolojikMesafe(w.fac[i], w.fac[j]);
    // dünya tarihsiz doğmaz: ilk günden dostluklar ve kan davaları vardır
    w.R[i][j] = Math.round(kirp(72 - d*150 + ara(r,-32,32), -95, 95));
  }

  // bölgeler
  const badlar = secBenzersiz(r, BOLGE, nB);
  for (let i=0;i<nB;i++){
    const sahip = i < nF ? i : Math.floor(r()*nF);
    const b = { id:i, ad:badlar[i], sahip, zenginlik: Math.round(ara(r,20,85)), huzursuzluk: Math.round(ara(r,5,40)), komsu:[] };
    w.bolgeler.push(b);
    w.fac[sahip].bolgeler.push(i);
  }
  // bölge komşulukları (halka + rastgele kısayollar)
  for (let i=0;i<nB;i++){
    const j=(i+1)%nB; w.bolgeler[i].komsu.push(j); w.bolgeler[j].komsu.push(i);
    if (r()<0.45){ const k2=Math.floor(r()*nB); if(k2!==i && w.bolgeler[i].komsu.indexOf(k2)<0){ w.bolgeler[i].komsu.push(k2); w.bolgeler[k2].komsu.push(i);} }
  }

  // KANUNLAR — dünyanın fiziği
  const nK = ayar.kanun || (13 + Math.floor(r()*7));   // 13-19
  w.kanunlar = kanunSetiUret(r, nK);

  // lider huyları → değişkenler eşlemesi de rastgele
  const HUY = ['hirs','kusku','kurnaz','sadakat','zalim'];
  const nL = 4 + Math.floor(r()*3);
  for (let i=0;i<nL;i++){
    w.liderEtki.push({ huy: sec(r,HUY), hedef: sec(r,VARS), kat: (r()<0.5?-1:1)*ara(r,0.3,1.5) });
  }

  // ilişki yasası — dostluk/düşmanlık neyle beslenir?
  w.iliskiYasasi = {
    guc:    (r()<0.5?-1:1)*ara(r,0.2,1.2),   // karşı tarafın gücü ilişkiyi nasıl etkiler
    ideo:   ara(r,0.3,1.4),                   // ideolojik yakınlık çekimi
    ortakDusman: ara(r,0.2,1.3),              // "düşmanımın düşmanı"
    ofke:   (r()<0.5?-1:1)*ara(r,0.1,0.9),
    kutuplasma: ara(r,0.4,1.7),               // düşmanlık düşmanlığı besler (çift kararlılık)
    sinir:  ara(r,0.2,1.1),                   // komşuluk sürtüşmesi
    surtunme: ara(r,0.005,0.030)              // ortalamaya dönüş
  };

  w.kurulumRng = r;
  // Not: kanun setini denge sabitleriyle kalibre etmeyi denedim (kalibreEt).
  // 500 dünyada ölçüldü: kabul oranına katkısı yok, maliyeti 3 katı. Dünyayı
  // raydan çıkmaktan koruyan şey kalibrasyon değil, uygulama adımındaki
  // yumuşak bariyer ve fraksiyon başına taban/mizaç farkları.
  if (!w.sabit){ w.sabit = null; w.olcek = null; }
  return w;
}

function liderUret(r, ad){
  return {
    ad: (ad || sec(r,AD)) + ' ' + sec(r,LAKAP),
    yas: Math.round(ara(r,29,49)),
    hirs: Math.round(ara(r,10,95)),
    kusku: Math.round(ara(r,10,95)),
    kurnaz: Math.round(ara(r,10,95)),
    sadakat: Math.round(ara(r,10,95)),
    zalim: Math.round(ara(r,10,95)),
    saglik: Math.round(ara(r,60,100)),
    yil: 0
  };
}

function ideolojikMesafe(a,b){
  let s=0; for(let i=0;i<3;i++){ const d=a.ideoloji[i]-b.ideoloji[i]; s+=d*d; }
  return Math.sqrt(s)/Math.sqrt(12);   // 0..1
}

/* ---------- kapsam çözümü ---------- */
function kapsamDeger(w, i, vr, kapsam){
  const F = w.fac, f = F[i];
  if (kapsam === 'oz') return f.v[vr];
  let top=0, n=0;
  if (kapsam === 'komsu'){
    const set = new Set();
    for (const bi of f.bolgeler) for (const kb of w.bolgeler[bi].komsu){
      const s = w.bolgeler[kb].sahip; if (s!==i && F[s].canli) set.add(s);
    }
    for (const j of set){ top+=F[j].v[vr]; n++; }
  } else {
    for (let j=0;j<F.length;j++){
      if (j===i || !F[j].canli) continue;
      const rel = w.R[i][j];
      if (kapsam==='dusman' && rel > -15) continue;
      if (kapsam==='dost'   && rel <  15) continue;
      top += F[j].v[vr]; n++;
    }
  }
  if (n===0){  // kapsam boşsa dünyanın ortalaması
    for (let j=0;j<F.length;j++){ if(j===i||!F[j].canli) continue; top+=F[j].v[vr]; n++; }
  }
  return n ? top/n : 50;
}

/* ---------- TUR ---------- */
function adim(w, sec_){
  w.tur++;
  const F = w.fac, n = F.length;
  const olaylar = [];
  const delta = F.map(()=>({guc:0,servet:0,istikrar:0,mesruiyet:0,bilgi:0,ofke:0}));

  // 1) kanunlar
  for (let i=0;i<n;i++){
    if (!F[i].canli) continue;
    for (const k of w.kanunlar){
      const a = kapsamDeger(w, i, k.kaynak, k.kapsam);
      const b = k.kaynak2 ? kapsamDeger(w, i, k.kaynak2, k.kapsam) : 0;
      delta[i][k.hedef] += k.kat * sekilDeger(k, a, b) * F[i].mizac[k.hedef] * (w.olcek ? w.olcek[k.hedef] : 1);
    }
    // 2) lider huyları
    const L = F[i].lider;
    for (const e of w.liderEtki) delta[i][e.hedef] += e.kat * ((L[e.huy]-50)/50);
    // 3) bölge geliri ve huzursuzluğu
    let zen=0, huz=0;
    for (const bi of F[i].bolgeler){ zen += w.bolgeler[bi].zenginlik; huz += w.bolgeler[bi].huzursuzluk; }
    const bs = F[i].bolgeler.length || 1;
    delta[i].servet += (zen/bs - 45)/45 * 1.1;
    delta[i].ofke   += (huz/bs - 40)/45 * 1.1;
    // 4) evrensel bedeller — bunlar rastgele değil, bu evrenin değişmez yasaları:
    //    ordu beslenir, büyük güç kendi ağırlığı altında ezilir, zenginlik göz çıkarır.
    const gr = F[i].v.guc/100;
    delta[i].servet -= gr*gr * 1.3;
    delta[i].guc    -= gr*gr*gr * 1.1;
    // 5) evrensel çekim + gürültü
    for (const v of VARS){
      // kendi doğasına dönüş: dünyanın rastgele çekimine EK olarak sabit bir
      // pay — yoksa fraksiyonlar fiziğin altında ezilip birbirine benzer.
      delta[i][v] += (F[i].taban[v] - F[i].v[v]) * (w.cekim + 0.024) + (w.sabit ? w.sabit[v] : 0);
      delta[i][v] += (hsh(w.seed+'|g|'+w.tur+'|'+i+'|'+v)*2-1) * w.gurultu;
    }
  }

  // 5) oyuncu / dış müdahale
  const tohumOlay = tohumlariIsle(w, delta);
  if (sec_ && sec_.delta) for (const i in sec_.delta) for (const v in sec_.delta[i]) delta[i][v] += sec_.delta[i][v];

  // 7) uygula — lojistik doyum: uçlara asla yapışma, yoksa küçük farklar yok olur
  for (let i=0;i<n;i++){
    if (!F[i].canli) continue;
    for (const v of VARS){
      const cur = F[i].v[v];
      let d = kirp(delta[i][v], -6, 6);
      d = d > 0 ? d * (1 - cur/100) * 1.7 : d * (cur/100) * 1.7;
      // yumuşak bariyer: 12-84 arası fiziğe dokunmaz, uçlarda karesel geri iter.
      // Böylece değişkenler uçlara park edemez ama orta bölgede dünya canlı kalır.
      if (cur > 80) d -= Math.pow((cur-80)/19.6, 2) * 9;
      else if (cur < 16) d += Math.pow((16-cur)/15.6, 2) * 9;
      F[i].v[v] = kirp(cur + d, 0.4, 99.6);
    }
  }

  // 8) ilişkiler
  const IY = w.iliskiYasasi, R2 = w.R.map(row=>row.slice());
  // komşuluk haritası (bölge sahipliği değiştikçe değişir)
  const sinir = F.map(()=>({}));
  for (const b of w.bolgeler) for (const kb of b.komsu){
    const a1=b.sahip, a2=w.bolgeler[kb].sahip;
    if (a1!==a2 && F[a1] && F[a2]){ sinir[a1][a2]=1; sinir[a2][a1]=1; }
  }
  for (let i=0;i<n;i++) for (let j=0;j<n;j++){
    if (i===j || !F[i].canli || !F[j].canli) continue;
    let d = 0;
    d += IY.guc * ((F[j].v.guc - 50)/50);
    d += IY.ideo * (0.5 - ideolojikMesafe(F[i],F[j])) * 1.6;
    d += IY.ofke * ((F[j].v.ofke - 40)/50);
    // ortak düşman
    let ort=0; for(let k2=0;k2<n;k2++){ if(k2===i||k2===j||!F[k2].canli) continue; if(w.R[i][k2]<-25 && w.R[j][k2]<-25) ort++; }
    d += IY.ortakDusman * ort * 0.8;
    // kutuplaşma: ilişki hangi yöndeyse o yönde derinleşir (dost/düşman çekicileri)
    const rr0 = w.R[i][j];
    d += IY.kutuplasma * (rr0/55) * (Math.abs(rr0)/55);
    if (sinir[i] && sinir[i][j]) d -= IY.sinir * 0.9;
    d += -IY.surtunme * rr0;
    d += (hsh(w.seed+'|r|'+w.tur+'|'+i+'|'+j)*2-1) * 0.9;
    R2[i][j] = kirp(w.R[i][j] + kirp(d,-5,5), -100, 100);
  }
  w.R = R2;

  // 9) bölgeler
  for (const b of w.bolgeler){
    const s = F[b.sahip];
    if (!s || !s.canli) continue;
    const bask = (s.v.guc - 50)/50, refah = (s.v.servet - 50)/50;
    b.huzursuzluk = kirp(b.huzursuzluk + (s.v.ofke-45)/28 - refah*0.9 - bask*0.5 + (hsh(w.seed+'|b|'+w.tur+'|'+b.id)*2-1)*0.7, 0, 100);
    b.zenginlik   = kirp(b.zenginlik + refah*0.55 - b.huzursuzluk/160 + (hsh(w.seed+'|z|'+w.tur+'|'+b.id)*2-1)*0.6, 0, 100);
  }

  // 10) olaylar
  olaylar.push(...olaylariCoz(w));

  // 11) liderler
  olaylar.push(...liderleriIsle(w));

  // 12) akımlar, meseleler, kopuşlar ve gizli el
  if (w.el) olaylar.push(...eliIsle(w));
  olaylar.push(...tohumOlay);
  olaylar.push(...kopuslariIsle(w));
  olaylar.push(...meseleleriIsle(w));

  w.olaylar.push(...olaylar);
  return olaylar;
}

function skor(f){ return (f.v.guc+f.v.servet+f.v.istikrar+f.v.mesruiyet+f.v.bilgi)/5 - f.v.ofke*0.30; }

function olaylariCoz(w){
  const F=w.fac, n=F.length, out=[];
  const E=(t,m,x)=>{ const o={tur:w.tur,tip:t,metin:m}; if(x) Object.assign(o,x); out.push(o); return o; };
  // Olaylar SÜREKLİ olasılıklarla tetiklenir: durumdaki en küçük fark bile
  // eşiği geçme ihtimalini kaydırır. Kararların birikmesi buradan doğar.
  const lo = x => 1/(1+Math.exp(-x));

  for (let i=0;i<n;i++){
    const f=F[i]; if(!f.canli) continue;
    const rr=(tag)=>hsh(w.seed+'|e|'+w.tur+'|'+i+'|'+tag);

    const pIsyan = kirp((f.v.ofke-66)/60 + (42-f.v.istikrar)/110, 0, 0.20);
    if (rr('isyan') < pIsyan){
      const sid = 5 + (f.v.ofke-60)/6;
      f.v.istikrar=kirp(f.v.istikrar-sid,0.4,99.6);
      f.v.guc=kirp(f.v.guc-sid*0.5,0.4,99.6); f.v.ofke=kirp(f.v.ofke-10,0.4,99.6);
      E('isyan', `${f.ad} topraklarında ayaklanma patladı.`, {fac:i});
    }

    const pDarbe = kirp((32-f.v.mesruiyet)/85 + (f.v.guc-48)/190 + (f.lider.hirs-55)/400, 0, 0.14);
    if (rr('darbe') < pDarbe){
      const eski=f.lider.ad;
      f.lider=liderUret(mulberry32(Math.floor(rr('yeni')*1e9)));
      f.v.mesruiyet=kirp(f.v.mesruiyet+14,0.4,99.6); f.v.istikrar=kirp(f.v.istikrar-9,0.4,99.6);
      E('darbe', `${f.ad}: ${eski} devrildi, yerine ${f.lider.ad} geçti.`, {fac:i});
    }

    const pKitlik = kirp((19-f.v.servet)/42, 0, 0.09);
    if (rr('kitlik') < pKitlik){
      f.v.ofke=kirp(f.v.ofke+11+(19-f.v.servet)/4,0.4,99.6);
      f.v.istikrar=kirp(f.v.istikrar-5,0.4,99.6);
      E('kitlik', `${f.ad} kıtlıkla boğuşuyor; halk öfkeli.`, {fac:i});
    }

    const pAltin = kirp((f.v.servet-74)/70 + (f.v.istikrar-66)/95 - f.v.ofke/300, 0, 0.12);
    if (rr('altin') < pAltin){
      f.v.mesruiyet=kirp(f.v.mesruiyet+6,0.4,99.6);
      E('altin', `${f.ad} için bolluk yılları: meşruiyeti yükseliyor.`, {fac:i});
    }

    if (skor(f)<9 && f.bolgeler.length===0){ f.canli=false; E('cokus', `${f.ad} tarihten silindi.`, {fac:i}); }
  }

  for (let i=0;i<n;i++) for (let j=0;j<n;j++){
    if(i===j||!F[i].canli||!F[j].canli) continue;
    const dusmanlik = (-w.R[i][j]-52)/120;
    const istek = (F[i].v.guc-42)/140 + (F[i].lider.zalim-50)/380;
    const pSavas = kirp(dusmanlik*(0.55+kirp(istek,-0.3,0.6)), 0, 0.09);
    if (hsh(w.seed+'|s|'+w.tur+'|'+i+'|'+j) < pSavas){
      const gf = (F[i].v.guc + F[i].v.bilgi*0.4) - (F[j].v.guc + F[j].v.istikrar*0.3);
      F[i].v.servet=kirp(F[i].v.servet-6,0.4,99.6); F[j].v.servet=kirp(F[j].v.servet-8,0.4,99.6);
      F[i].v.ofke=kirp(F[i].v.ofke+3,0.4,99.6); F[j].v.ofke=kirp(F[j].v.ofke+6,0.4,99.6);
      w.R[j][i]=kirp(Math.min(w.R[j][i]-26,-55),-100,100); w.R[i][j]=kirp(w.R[i][j]-12,-100,100);
      const pZafer = lo(gf/11);
      if (hsh(w.seed+'|sz|'+w.tur+'|'+i+'|'+j) < pZafer && F[j].bolgeler.length>0){
        const bi = F[j].bolgeler[Math.floor(hsh(w.seed+'|sb|'+w.tur+'|'+i+'|'+j)*F[j].bolgeler.length)];
        F[j].bolgeler = F[j].bolgeler.filter(x=>x!==bi);
        F[i].bolgeler.push(bi); w.bolgeler[bi].sahip=i; w.bolgeler[bi].huzursuzluk=kirp(w.bolgeler[bi].huzursuzluk+22,0,100);
        F[i].v.mesruiyet=kirp(F[i].v.mesruiyet-4,0.4,99.6);
        w.R[j][i]=kirp(w.R[j][i]-22,-100,100);
        E('savas', `${F[i].ad}, ${F[j].ad} üzerine yürüdü ve ${ekBelirtme(w.bolgeler[bi].ad)} aldı.`, {fac:i,hedef:j,bolge:bi});
      } else {
        E('savas', `${F[i].ad} ile ${F[j].ad} arasında kanlı ve sonuçsuz bir çatışma.`, {fac:i,hedef:j});
      }
    }
  }

  for (const b of w.bolgeler){
    const pKopus = kirp((b.huzursuzluk-74)/85, 0, 0.12);
    if (hsh(w.seed+'|ba|'+w.tur+'|'+b.id) < pKopus){
      const eski=b.sahip;
      const adaylar=b.komsu.map(k=>w.bolgeler[k].sahip).filter(x=>x!==eski && F[x] && F[x].canli);
      if (adaylar.length){
        const yeni = adaylar[Math.floor(hsh(w.seed+'|by|'+w.tur+'|'+b.id)*adaylar.length)];
        F[eski].bolgeler=F[eski].bolgeler.filter(x=>x!==b.id);
        F[yeni].bolgeler.push(b.id); b.sahip=yeni; b.huzursuzluk=52;
        F[eski].v.mesruiyet=kirp(F[eski].v.mesruiyet-7,0.4,99.6);
        w.R[eski][yeni]=kirp(w.R[eski][yeni]-30,-100,100);
        E('kopus', `${b.ad} ayaklandı ve ${ekYonelme(F[yeni].ad)} katıldı.`, {fac:yeni,hedef:eski,bolge:b.id});
      }
    }
  }
  return out;
}

function liderleriIsle(w){
  const out=[];
  for (let i=0;i<w.fac.length;i++){
    const f=w.fac[i]; if(!f.canli) continue;
    const L=f.lider; L.yil++;
    if (w.tur%4===0) L.yas++;
    // mevsimlik ölüm riski: yaşla üstel + sağlık + suikast (istikrarsızlık)
    const risk = 0.0022 * Math.exp((L.yas - 45) / 9.0)
               + (100 - L.saglik) / 9000
               + Math.max(0, 38 - f.v.istikrar) / 9000 * (L.kusku / 100);
    if (hsh(w.seed+'|o|'+w.tur+'|'+i) < risk){
      const eski=L.ad;
      const varisRng = mulberry32(Math.floor(hsh(w.seed+'|v|'+w.tur+'|'+i)*1e9));
      f.lider = liderUret(varisRng);
      const sarsinti = 6 + (L.hirs/12);
      f.v.istikrar = kirp(f.v.istikrar - sarsinti, 0, 100);
      f.v.mesruiyet = kirp(f.v.mesruiyet - sarsinti*0.7, 0, 100);
      // veliaht krizi ilişkileri sarsar
      for (let j=0;j<w.fac.length;j++) if(j!==i) w.R[i][j]=kirp(w.R[i][j]*0.7 + (hsh(w.seed+'|vr|'+w.tur+'|'+i+'|'+j)*40-20),-100,100);
      out.push({tur:w.tur,tip:'veraset',fac:i,metin:`${f.ad}: ${eski} öldü. ${f.lider.ad} tahta çıktı — veraset sancılı.`});
    }
  }
  return out;
}

/* ================= KAVRAMLAR =================
 * Bu oyunun mekanikleri uydurma değil: her biri gerçek bir kuramın
 * matematiğidir. Oyun mesele kapandıktan sonra yalnızca kavramın adını
 * ve kaynağını söyler, ASLA açıklamaz. Okuyan oyuncu bir sonrakini
 * önceden görür — oyunun ekrandan çok kafada dönmesi buradan gelir.
 */
const KAVRAMLAR = {
  michels: {
    ad: 'Tunç Oligarşi Yasası',
    tek: 'Her hareket olgunlaştıkça kendi seçkinini üretir ve kuruluş amacından sapar.',
    kaynak: 'Robert Michels — Siyasal Partiler (1911)'
  },
  tocqueville: {
    ad: 'Tocqueville Paradoksu',
    tek: 'Kötü bir düzen için en tehlikeli an, kendini düzeltmeye başladığı andır.',
    kaynak: 'Alexis de Tocqueville — Eski Rejim ve Devrim (1856)'
  },
  kuran: {
    ad: 'Tercih Saklama',
    tek: 'Baskı altında gerçek destek görünmez; eşik aşıldığında çöküş ani olur.',
    kaynak: 'Timur Kuran — Yalanla Yaşamak (1995)'
  },
  haldun: {
    ad: 'Asabiyet',
    tek: 'Dayanışma ruhu hanedanı kurar, refah onu çözer; döngü dört nesil sürer.',
    kaynak: 'İbn Haldun — Mukaddime (1377)'
  },
  goodhart: {
    ad: 'Goodhart Yasası',
    tek: 'Bir ölçüt hedefe dönüştüğünde iyi bir ölçüt olmaktan çıkar.',
    kaynak: 'Charles Goodhart (1975) / Marilyn Strathern (1997)'
  },
  olson: {
    ad: 'Kolektif Eylemin Mantığı',
    tek: 'Küçük ve yoğun çıkarlar, büyük ve dağınık çoğunluğu düzenli olarak yener.',
    kaynak: 'Mancur Olson — Kolektif Eylemin Mantığı (1965)'
  },
  scott: {
    ad: 'Okunabilirlik',
    tek: 'Merkez, görebilmek için basitleştirir; basitleştirdiği şeyi yok eder.',
    kaynak: 'James C. Scott — Devlet Gibi Görmek (1998)'
  },
  vekil: {
    ad: 'Vekil Sorunu',
    tek: 'Vekilin çıkarı asilinkiyle aynı değildir ve gözetim her zaman pahalıdır.',
    kaynak: 'Jensen & Meckling (1976)'
  },
  girard: {
    ad: 'Günah Keçisi',
    tek: 'Kriz, suçun tek bir kurbanda toplanmasıyla çözülür — ve bir süre işe yarar.',
    kaynak: 'René Girard — Şiddet ve Kutsal (1972)'
  },
  merton: {
    ad: 'Kendini Gerçekleştiren Kehanet',
    tek: 'Yanlış bir tanım, ona göre davranıldığı için doğru çıkar.',
    kaynak: 'Robert K. Merton — Social Theory and Social Structure (1948)'
  },
  ostrom: {
    ad: 'Ortakların Yönetimi',
    tek: 'Ortak varlık ne devletle ne piyasayla; kendi kurallarını yazan toplulukla korunur.',
    kaynak: 'Elinor Ostrom — Ortakların Yönetimi (1990)'
  }
};

/* ================= TOHUMLAR VE AKIMLAR =================
 * Oyuncu bir fikri bir toplumsal katmana eker. Tohum olgunlaştıkça
 * getirisi artar; AMA denetimi aynı olgunlukla erir. Fayda ile risk
 * tek bir değişkene bağlıdır, ayrılamaz.
 */
const KATMANLAR = {
  seckin: { ad:'seçkinler', hiz:1.25, tehlike:1.60, gorunur:1.4 },
  ruhban: { ad:'ruhban',    hiz:0.85, tehlike:1.25, gorunur:1.1 },
  asker:  { ad:'asker',     hiz:1.00, tehlike:2.10, gorunur:1.3 },
  esnaf:  { ad:'esnaf',     hiz:1.15, tehlike:0.95, gorunur:0.8 },
  halk:   { ad:'halk',      hiz:0.70, tehlike:1.15, gorunur:0.6 }
};
const AMACLAR = {
  okuryazarlik: { ad:'okuryazarlık', besle:'bilgi',      kavram:'tocqueville' },
  sadakat:      { ad:'sadakat',      besle:'istikrar',   kavram:'michels' },
  kuskuculuk:   { ad:'kuşkuculuk',   besle:'bilgi',      kavram:'kuran' },
  zenginlik:    { ad:'zenginlik',    besle:'servet',     kavram:'olson' },
  inanc:        { ad:'inanç',        besle:'mesruiyet',  kavram:'girard' },
  direnc:       { ad:'direnç',       besle:'guc',        kavram:'haldun' }
};
const EVRELER = ['fısıltı','çevre','akım','kurum','kopuş'];
const AKIM_ADI_ON = ['Okuma','Sessiz','Gece','Açık','Dokuzuncu','Yeni','Sabah','Kapalı','Yalın','Uyanık'];
const AKIM_ADI_SON = ['Halkaları','Kardeşliği','Sofrası','Meclisi','Yemini','Odası','Yolu','Çırakları','Defteri','Kapısı'];

function evreAdi(olgunluk){
  if (olgunluk < 20) return 'fısıltı';
  if (olgunluk < 45) return 'çevre';
  if (olgunluk < 75) return 'akım';
  return 'kurum';
}

function tohumEk(w, { fac, katman, amac, bolge }){
  const r = mulberry32(Math.floor(hsh(w.seed+'|th|'+w.tur+'|'+fac+'|'+(w.tohumlar.length))*1e9));
  const t = {
    id: w.tohumlar.length,
    ad: sec(r, AKIM_ADI_ON) + ' ' + sec(r, AKIM_ADI_SON),
    fac, katman, amac,
    bolge: (bolge === undefined ? null : bolge),
    dogum: w.tur,
    olgunluk: 3,
    denetim: 100,
    // Kuran: görünür destek bastırılabilir, gerçek destek bastırılamaz
    gercekDestek: 6,
    gorunurDestek: 6,
    dogrultu: w.fac[fac].ideoloji.slice(),
    // katmanın kendi çıkarı — hareket zamanla buraya sürüklenir
    cekim: [ara(r,-1,1), ara(r,-1,1), ara(r,-1,1)],
    besleniyor: true,
    gozetim: false,
    bastirilma: 0,
    evre: 'fısıltı',
    canli: true,
    kurumsal: false,
    gecmis: []
  };
  w.tohumlar.push(t);
  return t;
}

function vekMesafe(a, b){
  let s=0; for (let i=0;i<3;i++){ const d=a[i]-b[i]; s+=d*d; }
  return Math.sqrt(s)/Math.sqrt(12);
}

function tohumlariIsle(w, delta){
  const out = [];
  for (const t of w.tohumlar){
    if (!t.canli) continue;
    const host = w.fac[t.fac];
    if (!host || !host.canli){ t.canli = false; t.son = 'konak-coktu'; continue; }
    const K = KATMANLAR[t.katman], A = AMACLAR[t.amac];
    const rr = (tag)=>hsh(w.seed+'|tz|'+w.tur+'|'+t.id+'|'+tag);

    /* --- olgunlaşma: zemin uygunsa hızlı büyür --- */
    const zemin = (host.v.bilgi/100)*0.6 + (host.v.istikrar/100)*0.4;
    const bask = t.bastirilma > 0 ? 0.35 : 1;
    const buyume = K.hiz * (0.30 + zemin*0.95) * (t.besleniyor ? 1.55 : 0.75)
                 * (1 - t.olgunluk/135) * bask;
    t.olgunluk = kirp(t.olgunluk + buyume, 0, 100);

    /* --- MICHELS: denetim olgunlukla erir, geri gelmez --- */
    const sapma = vekMesafe(t.dogrultu, host.ideoloji);
    const erime = Math.pow(t.olgunluk/100, 1.55) * K.tehlike * 1.05
                + sapma * 1.30
                + (t.besleniyor ? 0.45 : 0);
    t.denetim = kirp(t.denetim - erime + (t.gozetim ? 1.25 : 0), 0, 100);

    /* --- kendi doğrultusunu bulur: olgunlaştıkça katmanın çıkarına kayar --- */
    const kayma = 0.016 * (0.35 + t.olgunluk/100);
    for (let i=0;i<3;i++){
      t.dogrultu[i] = kirp(t.dogrultu[i] + (t.cekim[i]-t.dogrultu[i])*kayma
                          + (rr('d'+i)*2-1)*0.004, -1, 1);
    }

    /* --- KURAN: baskı görünür desteği kırar, gerçeği büyütür --- */
    const cekicilik = t.olgunluk/100 * (0.5 + sapma*0.8);
    t.gercekDestek = kirp(t.gercekDestek + cekicilik*1.4 + t.bastirilma*0.9, 0, 100);
    const gorunurHedef = t.bastirilma > 0
      ? t.gercekDestek * kirp(0.25 - t.bastirilma*0.03, 0.05, 0.9)
      : t.gercekDestek * kirp(0.55 + t.olgunluk/220, 0, 1);
    t.gorunurDestek += (gorunurHedef - t.gorunurDestek) * 0.30;
    if (t.bastirilma > 0) t.bastirilma = Math.max(0, t.bastirilma - 1);

    /* --- dünyaya etkisi: getiri denetimle, zarar denetimsizlikle --- */
    const pay = t.olgunluk/100;
    const tutulan  = pay * (t.denetim/100);
    const bagimsiz = pay * (1 - t.denetim/100);
    delta[t.fac][A.besle] += tutulan * 2.6 + pay * 0.55;
    // kendini geliştirmiş ama düzeni kabul etmeyen bir topluluk:
    delta[t.fac].ofke      += bagimsiz * 2.5;
    delta[t.fac].mesruiyet -= bagimsiz * 1.9;
    delta[t.fac].istikrar  -= bagimsiz * 1.1 * K.tehlike * 0.6;

    /* --- TOCQUEVILLE: hızlı iyileşme isyanı besler --- */
    const oncekiRefah = t.sonRefah === undefined ? host.v.servet : t.sonRefah;
    const ivme = host.v.servet - oncekiRefah;
    t.sonRefah = host.v.servet;
    if (ivme > 0.6 && host.v.servet < 62 && t.olgunluk > 25){
      delta[t.fac].ofke += Math.min(ivme, 3) * 0.75 * pay;
      if (!t.tocqueville && rr('toc') < 0.25){
        t.tocqueville = true;
        out.push({ tur:w.tur, tip:'ivme', tohum:t.id, fac:t.fac, kavram:'tocqueville',
          metin: `${host.ad} düzeliyor — ve ${t.ad} tam bu yüzden sesini yükseltiyor.` });
      }
    }

    /* --- evre geçişleri --- */
    const yeniEvre = evreAdi(t.olgunluk);
    if (yeniEvre !== t.evre){
      const eski = t.evre; t.evre = yeniEvre;
      t.gecmis.push({ tur:w.tur, evre:yeniEvre, denetim:Math.round(t.denetim) });
      out.push({ tur:w.tur, tip:'evre', tohum:t.id, fac:t.fac,
        metin: `${t.ad} artık bir ${yeniEvre} (${eski} değil). Denetimin: %${Math.round(t.denetim)}.` });
    }
  }
  return out;
}

/* ================= MESELELER =================
 * Bir mesele açıldığında DURMAZ. Açık kaldığı sürece durum kendi
 * başına gelişir; beklemek de bir karardır ve bedeli vardır.
 */
const MESELE_TANIM = {
  basibos: {
    baslik: 'Elinden kayıyor',
    kavram: 'michels',
    pencere: 8,
    secenekler: ['bekle','gozetle','kurumsallastir','yonlendir','terk']
  },
  kopusEsigi: {
    baslik: 'Kopuş eşiği',
    kavram: 'kuran',
    pencere: 6,
    secenekler: ['bekle','bastir','kurumsallastir','yonlendir','terk']
  },
  kirilma: {
    baslik: 'Kırılma',
    kavram: 'girard',
    pencere: 4,
    secenekler: ['bekle','bastir','gunahKecisi','terk']
  }
};

function meseleAc(w, tip, ilgili){
  const T = MESELE_TANIM[tip];
  const m = {
    id: w.meseleler.length, tip, baslik: T.baslik, kavram: T.kavram,
    acilis: w.tur, pencere: T.pencere, secenekler: T.secenekler.slice(),
    ilgili, acik: true, karar: null, kapanis: null, gunluk: []
  };
  w.meseleler.push(m);
  return m;
}

// Dünyayı dallandırmak için (senaryo karşılaştırması, ileride geri alma yok)
function klonla(w){
  const rng = w.kurulumRng; delete w.kurulumRng;
  const k = JSON.parse(JSON.stringify(w));
  w.kurulumRng = rng;
  return k;
}

function meselePencere(w, m){ return m.acilis + m.pencere - w.tur; }

function meseleleriIsle(w){
  const out = [];
  for (const m of w.meseleler){
    if (!m.acik) continue;
    const t = m.ilgili.tohum != null ? w.tohumlar[m.ilgili.tohum] : null;
    // durum açık kaldıkça gelişir
    if (t && t.canli){
      m.gunluk.push({ tur:w.tur, olgunluk:Math.round(t.olgunluk), denetim:Math.round(t.denetim),
                      gercek:Math.round(t.gercekDestek), gorunur:Math.round(t.gorunurDestek) });
    }
    if (meselePencere(w, m) <= 0){
      // karar vermemek de bir karardır
      out.push(...meseleKarar(w, m.id, 'bekle', true));
    }
  }
  return out;
}

function meseleKarar(w, meseleId, karar, sureDoldu){
  const m = w.meseleler[meseleId];
  const out = [];
  if (!m || !m.acik) return out;
  if (m.secenekler.indexOf(karar) < 0) karar = 'bekle';
  const t = m.ilgili.tohum != null ? w.tohumlar[m.ilgili.tohum] : null;
  const f = t ? w.fac[t.fac] : (m.ilgili.fac != null ? w.fac[m.ilgili.fac] : null);
  m.acik = false; m.karar = karar; m.kapanis = w.tur; m.sureDoldu = !!sureDoldu;

  const K = KAVRAMLAR[m.kavram];
  const not = (metin, ek) => out.push(Object.assign({ tur:w.tur, tip:'mesele', mesele:m.id,
    kavram:m.kavram, kavramAd:K.ad, kaynak:K.kaynak, metin }, ek||{}));

  if (!t || !t.canli || !f){ not('Mesele kendiliğinden kapandı.'); return out; }

  switch (karar){
    case 'bekle':
      // hiçbir şey yapmamak hareketi serbest bırakır
      t.denetim = kirp(t.denetim - 6, 0, 100);
      not(sureDoldu
        ? `${t.ad} meselesinde süre doldu. Karar vermemek de bir karardı.`
        : `${t.ad} meselesinde beklemeyi seçtin.`);
      break;

    case 'gozetle':
      // vekil sorunu: gözetim işe yarar ama pahalıdır ve fark edilir
      t.gozetim = true;
      f.v.servet = kirp(f.v.servet - 3, 0.4, 99.6);
      f.v.bilgi  = kirp(f.v.bilgi + 4, 0.4, 99.6);
      t.gercekDestek = kirp(t.gercekDestek + 4, 0, 100);
      not(`${t.ad} üzerine göz koydun. Gözetim pahalı ve görünür.`, { ikincilKavram:'vekil' });
      break;

    case 'kurumsallastir':
      // hareketi düzenin parçası yap: kopuş biter, sapma kalıcılaşır
      t.kurumsal = true;
      t.denetim = kirp(t.denetim + 26, 0, 100);
      t.olgunluk = kirp(t.olgunluk - 8, 0, 100);
      f.v.mesruiyet = kirp(f.v.mesruiyet + 6, 0.4, 99.6);
      f.v.istikrar  = kirp(f.v.istikrar + 4, 0.4, 99.6);
      // ama artık sökülemez: kendi doğrultusunu düzene taşır
      for (let i=0;i<3;i++) f.ideoloji[i] = kirp(f.ideoloji[i]*0.85 + t.dogrultu[i]*0.15, -1, 1);
      not(`${t.ad} düzenin parçası oldu. Artık sökülemez — ve düzeni kendine benzetecek.`);
      break;

    case 'yonlendir': {
      // başka bir hedefe koşmak: denetim yetiyorsa güçlü, yetmiyorsa geri teper
      const sans = kirp(t.denetim/100 * 1.15 - t.olgunluk/260, 0.05, 0.95);
      if (hsh(w.seed+'|yn|'+w.tur+'|'+t.id) < sans){
        const amaclar = Object.keys(AMACLAR).filter(a=>a!==t.amac);
        t.amac = amaclar[Math.floor(hsh(w.seed+'|ya|'+w.tur+'|'+t.id)*amaclar.length)];
        t.denetim = kirp(t.denetim + 10, 0, 100);
        not(`${t.ad} yeni bir hedefe çevrildi: ${AMACLAR[t.amac].ad}. Tuttu.`);
      } else {
        t.denetim = kirp(t.denetim - 20, 0, 100);
        t.gercekDestek = kirp(t.gercekDestek + 9, 0, 100);
        not(`${t.ad} yönlendirilmeye direndi. Artık senin olmadığını biliyorlar.`);
      }
      break;
    }

    case 'bastir': {
      // KURAN: görünür destek çöker, gerçek destek büyür — ve saklanır
      t.bastirilma = 5;
      t.gorunurDestek = kirp(t.gorunurDestek * 0.25, 0, 100);
      t.gercekDestek = kirp(t.gercekDestek + 12 + t.olgunluk/8, 0, 100);
      f.v.guc      = kirp(f.v.guc - 3, 0.4, 99.6);
      f.v.istikrar = kirp(f.v.istikrar + 7, 0.4, 99.6);
      f.v.ofke     = kirp(f.v.ofke + 5, 0.4, 99.6);
      t.denetim = kirp(t.denetim + 12, 0, 100);
      not(`${t.ad} bastırıldı. Sokak sessiz.`);
      break;
    }

    case 'gunahKecisi':
      // GIRARD: suçu birine yıkmak krizi gerçekten çözer — bir süreliğine
      f.v.ofke      = kirp(f.v.ofke - 16, 0.4, 99.6);
      f.v.istikrar  = kirp(f.v.istikrar + 9, 0.4, 99.6);
      f.v.mesruiyet = kirp(f.v.mesruiyet - 5, 0.4, 99.6);
      t.gercekDestek = kirp(t.gercekDestek + 7, 0, 100);
      not(`Suç ${t.ad}'nin üstüne yıkıldı. Öfke dindi.`);
      break;

    case 'terk':
      t.besleniyor = false; t.gozetim = false;
      t.denetim = kirp(t.denetim - 30, 0, 100);
      not(`${t.ad} ile bağını kopardın. Artık seni suçlayamazlar — ve dinlemezler.`);
      break;
  }
  return out;
}

/* --- kopuş: hareket yeni bir fraksiyona dönüşür --- */
function fraksiyonEkle(w, ad, kaynak, dogrultu, pay){
  const src = w.fac[kaynak];
  const r = mulberry32(Math.floor(hsh(w.seed+'|fe|'+w.tur+'|'+kaynak)*1e9));
  const f = {
    id: w.fac.length, ad,
    ideoloji: dogrultu.slice(),
    v: {}, taban: {}, mizac: {}, bolgeler: [], canli: true,
    lider: liderUret(r), nufuz:0, ajan:[], sir:[], borc:0, kopukTur: w.tur, anaGovde: kaynak
  };
  for (const v of VARS){
    const alinan = src.v[v] * pay;
    f.v[v] = kirp(v==='ofke' ? Math.max(src.v[v], 55) : Math.max(alinan, 12), 0.4, 99.6);
    f.taban[v] = kirp(src.taban[v] * (v==='ofke' ? 1.25 : 0.85), 8, 90);
    f.mizac[v] = src.mizac[v] * ara(r, 0.8, 1.25);
    if (v !== 'ofke') src.v[v] = kirp(src.v[v] * (1 - pay*0.55), 0.4, 99.6);
  }
  w.fac.push(f);
  // ilişki matrisini büyüt: ana gövdeyle kan davası, gerisi ideolojiden
  for (let i=0;i<w.R.length;i++) w.R[i].push(0);
  w.R.push(new Array(w.fac.length).fill(0));
  const n = w.fac.length - 1;
  for (let i=0;i<n;i++){
    const d = ideolojikMesafe(f, w.fac[i]);
    let taban = Math.round(kirp(72 - d*150, -95, 95));
    if (i === kaynak) taban = -85;
    w.R[n][i] = taban;
    w.R[i][n] = i === kaynak ? -78 : Math.round(kirp(taban*0.8 + (hsh(w.seed+'|fr|'+i)*30-15), -95, 95));
  }
  return f;
}

function kopuslariIsle(w){
  const out = [];
  for (const t of w.tohumlar){
    if (!t.canli || t.kurumsal) continue;
    const host = w.fac[t.fac];
    if (!host || !host.canli) continue;
    const sapma = vekMesafe(t.dogrultu, host.ideoloji);

    /* mesele açılışları */
    const acikMi = (tip)=> w.meseleler.some(m=>m.acik && m.tip===tip && m.ilgili.tohum===t.id);
    if (!t.uyari1 && t.olgunluk >= 45 && t.denetim < 58){
      t.uyari1 = true;
      if (!acikMi('basibos')){
        meseleAc(w, 'basibos', { tohum:t.id, fac:t.fac });
        out.push({ tur:w.tur, tip:'meseleAcildi', tohum:t.id, fac:t.fac, kavram:'michels',
          metin: `${t.ad} kendi seçkinini üretmeye başladı. Denetimin %${Math.round(t.denetim)}.` });
      }
    }
    if (!t.uyari2 && t.olgunluk >= 72 && t.denetim < 32){
      t.uyari2 = true;
      if (!acikMi('kopusEsigi')){
        meseleAc(w, 'kopusEsigi', { tohum:t.id, fac:t.fac });
        out.push({ tur:w.tur, tip:'meseleAcildi', tohum:t.id, fac:t.fac, kavram:'kuran',
          metin: `${t.ad} artık düzeni açıkça reddediyor. Gerçek destek %${Math.round(t.gercekDestek)}.` });
      }
    }
    // KURAN çağlayanı: saklanan destek eşiği aşarsa bastırma tersine döner
    if (t.gercekDestek > 62 && t.gercekDestek - t.gorunurDestek > 30 && !acikMi('kirilma')){
      if (hsh(w.seed+'|kc|'+w.tur+'|'+t.id) < 0.18){
        meseleAc(w, 'kirilma', { tohum:t.id, fac:t.fac });
        out.push({ tur:w.tur, tip:'meseleAcildi', tohum:t.id, fac:t.fac, kavram:'kuran',
          metin: `${t.ad} için sessizlik çatladı: görünen %${Math.round(t.gorunurDestek)}, gerçek %${Math.round(t.gercekDestek)}.` });
      }
    }

    /* KOPUŞ */
    const olgun = t.olgunluk > 78, kayip = t.denetim < 8, uzak = sapma > 0.30;
    const guclu = t.gercekDestek > 52;
    if (olgun && kayip && uzak && guclu && hsh(w.seed+'|kp|'+w.tur+'|'+t.id) < 0.22){
      const pay = kirp(t.gercekDestek/160, 0.12, 0.45);
      const yeni = fraksiyonEkle(w, t.ad, t.fac, t.dogrultu, pay);
      // bölge de götürebilir
      if (t.bolge != null && w.bolgeler[t.bolge] && w.bolgeler[t.bolge].sahip === t.fac && t.gercekDestek > 66){
        host.bolgeler = host.bolgeler.filter(x=>x!==t.bolge);
        yeni.bolgeler.push(t.bolge); w.bolgeler[t.bolge].sahip = yeni.id;
      }
      host.v.mesruiyet = kirp(host.v.mesruiyet - 12, 0.4, 99.6);
      host.v.istikrar  = kirp(host.v.istikrar - 10, 0.4, 99.6);
      t.canli = false; t.son = 'kopus'; t.evre = 'kopuş'; t.kopanFac = yeni.id;
      out.push({ tur:w.tur, tip:'kopus', tohum:t.id, fac:t.fac, yeniFac:yeni.id, kavram:'michels',
        metin: `${t.ad} koptu ve kendi başına bir güç oldu. Senin eserindi.` });
    }
  }
  return out;
}

/* ================= OYUNCU: GİZLİ EL =================
 * Oyuncu hiçbir fraksiyonu yönetmez. İki kaynağı vardır:
 *   nüfuz — harcanır, yavaş dolar
 *   ifşa  — birikir, silinmez; 100'e varırsa oyun biter
 * Her fiil ikisini de tüketir. Asıl kısıt nüfuz değil, ifşadır.
 */
const FIILLER = {
  incele:   { ad:'İncele',          nufuz:3, ifsa:0.4, kavram:null },
  fisilda:  { ad:'Fısılda',         nufuz:2, ifsa:1.0, kavram:'vekil' },
  ajan:     { ad:'Ajan yerleştir',  nufuz:4, ifsa:1.5, kavram:'vekil' },
  koru:     { ad:'Koru',            nufuz:3, ifsa:0.8, kavram:null },
  finanse:  { ad:'Finanse et',      nufuz:4, ifsa:1.5, kavram:'tocqueville' },
  sizdir:   { ad:'Sızdır',          nufuz:2, ifsa:1.7, kavram:'scott' },
  kiskirt:  { ad:'Kışkırt',         nufuz:3, ifsa:2.4, kavram:'olson' },
  tohum:    { ad:'Tohum ek',        nufuz:5, ifsa:1.0, kavram:'michels' },
  kehanet:  { ad:'Kehanet',         nufuz:4, ifsa:2.0, kavram:'merton' },
  ifsaEt:   { ad:'İfşa et',         nufuz:3, ifsa:2.9, kavram:'girard' }
};

/* ================= DOKTRİN =================
 * Oyuncunun amacı. Hangi dünya durumunun "iyi" olduğunu doktrin tanımlar
 * ve aynı doktrin nüfuzunu besler: dünya sana benzedikçe güçlenirsin.
 * Bu yüzden doktrinine aykırı her hamle iki kez pahalıdır.
 */
function _canli(w){ return w.fac.filter(f=>f.canli); }
function _sapma(xs){
  if (!xs.length) return 0;
  const m = xs.reduce((a,b)=>a+b,0)/xs.length;
  return Math.sqrt(xs.reduce((a,b)=>a+(b-m)*(b-m),0)/xs.length);
}
const DOKTRINLER = {
  denge: {
    ad: 'Denge', tarif: 'Hiçbir güç ötekini ezmesin.',
    puan(w){ const F=_canli(w); if(F.length<2) return 0;
      return kirp(100 - _sapma(F.map(f=>f.v.guc))*3.2 - Math.max(0, F.length<4 ? (4-F.length)*15 : 0), 0, 100); }
  },
  bilgelik: {
    ad: 'Bilgelik', tarif: 'Dünya bilsin ve öfkelenmesin.',
    puan(w){ const F=_canli(w); if(!F.length) return 0;
      const b=F.reduce((a,f)=>a+f.v.bilgi,0)/F.length, o=F.reduce((a,f)=>a+f.v.ofke,0)/F.length;
      return kirp(b*1.15 - o*0.85, 0, 100); }
  },
  dirlik: {
    ad: 'Dirlik', tarif: 'Kimin elinde olduğu önemli değil; halk rahat etsin.',
    puan(w){ const F=_canli(w); if(!F.length) return 0;
      const sv=F.reduce((a,f)=>a+f.v.servet,0)/F.length, is=F.reduce((a,f)=>a+f.v.istikrar,0)/F.length;
      const hz=w.bolgeler.reduce((a,b)=>a+b.huzursuzluk,0)/(w.bolgeler.length||1);
      return kirp(sv*0.55 + is*0.55 - hz*0.35, 0, 100); }
  },
  cozulme: {
    ad: 'Çözülme', tarif: 'Büyük olan hiçbir şey ayakta kalmasın.',
    puan(w){ const F=_canli(w); if(!F.length) return 0;
      const enBuyuk = Math.max(...F.map(f=>f.bolgeler.length));
      const ort = w.bolgeler.length / F.length;
      return kirp(F.length*9 - (enBuyuk-ort)*11, 0, 100); }
  },
  arilik: {
    ad: 'Arılık', tarif: 'Tek bir fikir dünyaya sinsin.',
    puan(w){ const F=_canli(w); if(F.length<2) return 0;
      let top=0, n=0;
      for(let i=0;i<F.length;i++) for(let j=i+1;j<F.length;j++){ top+=ideolojikMesafe(F[i],F[j]); n++; }
      return kirp(100 - (top/(n||1))*190, 0, 100); }
  },
  sureklilik: {
    ad: 'Süreklilik', tarif: 'Aynı el hep üstte kalsın — kim olduğu fark etmez.',
    puan(w){ const F=_canli(w); if(!F.length) return 0;
      const s2 = F.map((f)=>({f,s:skor(f)})).sort((a,b)=>b.s-a.s);
      const E = w.el;
      if (!E) return 0;
      if (E.sonUst === s2[0].f.id) E.ustSure = (E.ustSure||0)+1; else { E.sonUst = s2[0].f.id; E.ustSure = 0; }
      // sallantılı üstünlük süreklilik sayılmaz
      const fark = s2.length>1 ? s2[0].s - s2[1].s : 30;
      return kirp((E.ustSure||0)*1.0 - (fark < 6 ? 25 : 0), 0, 100); }
  }
};

function hizalanma(w){
  if (!w.el || !w.el.doktrin) return 50;
  return DOKTRINLER[w.el.doktrin].puan(w);
}

function oyuncuKur(w, ayar){
  w.el = {
    doktrin: (ayar && ayar.doktrin) || 'denge',
    nufuz: 10, ifsa: 0, hiz: 50, hizGecmis: [],
    ajanlar: [], sirlar: [], kehanetler: [],
    asinma: {},            // GOODHART: (fiil|hedef) → yıpranma
    bilinen: [],           // keşfedilmiş kanunların id'leri
    gunluk: [], av: 0,     // av: seni arayan fraksiyonların toplam dikkati
    bitti: false, bitisSebebi: null
  };
  return w.el;
}

/* --- GOODHART: aynı kaldıraca basmak onu kaldıraç olmaktan çıkarır --- */
function asinmaAnahtar(fiil, hedef){ return fiil + '|' + (hedef == null ? '-' : hedef); }
// İfşa riski dünyaya bağlıdır: bilgisi yüksek bir fraksiyona dokunmak
// seni ele verir; orada olgun bir ajanın varsa iz örtülür.
function ifsaCarpani(w, fac){
  if (fac == null || !w.fac[fac]) return 1;
  const f = w.fac[fac];
  const ajan = w.el && w.el.ajanlar.some(a=>a.fac===fac && a.olgun && !a.yakalandi);
  return (0.5 + f.v.bilgi/115) * (ajan ? 0.72 : 1) * (f.korunma > 0 ? 1.15 : 1);
}

function etkinlik(w, fiil, hedef){
  const a = w.el.asinma[asinmaAnahtar(fiil, hedef)] || 0;
  return 1 / (1 + Math.pow(a, 1.3) * 0.38);
}
function asindir(w, fiil, hedef){
  const k = asinmaAnahtar(fiil, hedef);
  w.el.asinma[k] = (w.el.asinma[k] || 0) + 1;
}

/* --- meşru hamlelerin tamamı --- */
function hamleler(w){
  const L = [], E = w.el;
  const canli = w.fac.map((f,i)=>({f,i})).filter(x=>x.f.canli);
  const ajanli = (i)=> E.ajanlar.some(a=>a.fac===i && a.olgun);
  const ek = (fiil, hedef, etiket, ayrinti)=>{
    const F = FIILLER[fiil];
    const et = etkinlik(w, fiil, hedef);
    const ic = ifsaCarpani(w, (ayrinti && ayrinti.fac != null) ? ayrinti.fac : null);
    L.push(Object.assign({ fiil, hedef, etiket, nufuz:F.nufuz, ifsa:+(F.ifsa*(2-et)*ic).toFixed(2),
                           etkinlik:+et.toFixed(2), karsilanir: E.nufuz >= F.nufuz }, ayrinti||{}));
  };

  // İNCELE — dünyanın gizli kanunlarını öğren (araştırma döngüsü)
  for (const k of w.kanunlar) if (E.bilinen.indexOf(k.id) < 0)
    ek('incele', 'k'+k.id, `${VAD[k.hedef]} kanunlarından birini incele`, { kanun:k.id });

  for (const {f,i} of canli){
    ek('ajan',    i, `${f.ad} içine ajan yerleştir`, { fac:i });
    ek('finanse', i, `${f.ad} gizlice finanse edilsin`, { fac:i });
    ek('kiskirt', i, `${f.ad} kışkırtılsın`, { fac:i });
    ek('koru',    i, `${f.ad} korunsun`, { fac:i });
    if (ajanli(i)) ek('fisilda', i, `${f.lider.ad} kulağına fısılda`, { fac:i });
    // KEHANET — geleceğe dair bir iddia; tutarsa nüfuz, tutmazsa ifşa
    for (const v of VARS) for (const yon of ['yukselecek','dusecek'])
      ek('kehanet', i+'|'+v+'|'+yon, `Kehanet: ${f.ad} — ${VAD[v]} ${yon}`,
         { fac:i, vr:v, yon });
    // TOHUM — katman × amaç
    for (const kat in KATMANLAR) for (const am in AMACLAR)
      ek('tohum', i+'|'+kat+'|'+am,
         `${f.ad} · ${KATMANLAR[kat].ad} katmanına ${AMACLAR[am].ad} ek`,
         { fac:i, katman:kat, amac:am });
  }

  // SIZDIR / İFŞA ET — çiftler
  for (const {f:a,i} of canli) for (const {f:b,i:j} of canli){
    if (i===j) continue;
    if (ajanli(i)) ek('sizdir', i+'>'+j, `${a.ad}'nın bildiğini ${b.ad} da öğrensin`, { fac:i, hedefFac:j });
  }
  for (const sir of E.sirlar){
    if (sir.kullanildi) continue;
    for (const {f:b,i:j} of canli){
      if (j===sir.fac) continue;
      ek('ifsaEt', sir.id+'>'+j, `${w.fac[sir.fac].ad} hakkındaki sırrı ${b.ad}'na ver`,
         { sir:sir.id, fac:sir.fac, hedefFac:j });
    }
  }
  return L;
}

function hamleYap(w, h){
  const E = w.el, out = [];
  const F = FIILLER[h.fiil];
  if (!F) return out;
  if (E.nufuz < F.nufuz) return [{ tur:w.tur, tip:'ret', metin:'Nüfuzun yetmiyor.' }];
  const et = etkinlik(w, h.fiil, h.hedef);
  E.nufuz -= F.nufuz;
  E.ifsa   = kirp(E.ifsa + F.ifsa * (2 - et) * ifsaCarpani(w, h.fac), 0, 100);
  asindir(w, h.fiil, h.hedef);
  const not = (metin, ek)=> out.push(Object.assign({ tur:w.tur, tip:'el', fiil:h.fiil, metin }, ek||{}));
  const f = h.fac != null ? w.fac[h.fac] : null;

  switch (h.fiil){
    case 'incele': {
      const k = w.kanunlar[h.kanun];
      if (k && E.bilinen.indexOf(k.id) < 0) E.bilinen.push(k.id);
      not(`Bir kanun açığa çıktı: ${kanunMetni(k)}`, { kanun:k.id, kavram:null });
      break;
    }
    case 'ajan':
      E.ajanlar.push({ id:E.ajanlar.length, fac:h.fac, dikildi:w.tur, olgun:false, yakalandi:false });
      not(`${f.ad} içine bir ajan yerleştirildi. Olgunlaşması zaman alır.`, { kavram:'vekil' });
      break;
    case 'fisilda':
      f.lider.kusku = kirp(f.lider.kusku + 9*et, 0, 100);
      f.v.istikrar  = kirp(f.v.istikrar - 3*et, 0.4, 99.6);
      not(`${f.lider.ad} artık çevresine daha az güveniyor.`);
      break;
    case 'koru':
      f.korunma = (f.korunma || 0) + 6*et;
      not(`${f.ad} bir süre korunuyor.`);
      break;
    case 'finanse':
      f.v.servet = kirp(f.v.servet + 7*et, 0.4, 99.6);
      not(`${f.ad} kasasına sessizce para aktı.`, { kavram:'tocqueville' });
      break;
    case 'kiskirt': {
      // OLSON: küçük ve yoğun gruplar örgütlenir, geniş kalabalık örgütlenmez
      const akim = w.tohumlar.find(t=>t.canli && t.fac===h.fac);
      const yogunluk = akim ? (1.45 - (akim.katman==='halk' ? 0.75 : 0)) : 0.7;
      f.v.ofke = kirp(f.v.ofke + 9*et*yogunluk, 0.4, 99.6);
      f.v.istikrar = kirp(f.v.istikrar - 4*et*yogunluk, 0.4, 99.6);
      not(`${f.ad} kışkırtıldı.` + (yogunluk < 0.8 ? ' Kalabalık dağınık; öfke dağılıyor.' : ''),
          { kavram:'olson' });
      break;
    }
    case 'tohum': {
      const t = tohumEk(w, { fac:h.fac, katman:h.katman, amac:h.amac, bolge:f.bolgeler[0] });
      not(`${f.ad} içinde ${KATMANLAR[h.katman].ad} katmanına ${AMACLAR[h.amac].ad} ekildi: ${t.ad}.`,
          { tohum:t.id, kavram:'michels' });
      break;
    }
    case 'sizdir': {
      // SCOTT: merkez görebilmek için basitleştirir; gördüğü şey artık o şey değildir
      const b = w.fac[h.hedefFac];
      b.v.bilgi = kirp(b.v.bilgi + 6*et, 0.4, 99.6);
      f.v.bilgi = kirp(f.v.bilgi - 2*et, 0.4, 99.6);
      w.R[h.fac][h.hedefFac] = kirp(w.R[h.fac][h.hedefFac] - 8*et, -100, 100);
      not(`${f.ad}'nın bildiği ${b.ad}'na ulaştı.`, { kavram:'scott' });
      break;
    }
    case 'ifsaEt': {
      const sir = E.sirlar.find(x=>x.id===h.sir);
      const b = w.fac[h.hedefFac];
      if (sir) sir.kullanildi = true;
      const agirlik = sir ? sir.agirlik : 6;
      f.v.mesruiyet = kirp(f.v.mesruiyet - agirlik*et, 0.4, 99.6);
      w.R[h.hedefFac][h.fac] = kirp(w.R[h.hedefFac][h.fac] - agirlik*2.2*et, -100, 100);
      b.v.bilgi = kirp(b.v.bilgi + 4*et, 0.4, 99.6);
      not(`${b.ad}, ${f.ad} hakkındaki sırrı öğrendi.`, { kavram:'girard' });
      break;
    }
    case 'kehanet': {
      const baslangic = f.v[h.vr];
      E.kehanetler.push({ id:E.kehanetler.length, fac:h.fac, vr:h.vr, yon:h.yon,
                          baslangic, acilis:w.tur, vade:w.tur+12, cozuldu:false });
      // MERTON: ilan edilmiş kehanet, ona göre davranıldığı için kendini besler
      const itis = (h.yon==='yukselecek' ? 1 : -1) * 1.6 * et;
      f.v[h.vr] = kirp(f.v[h.vr] + itis, 0.4, 99.6);
      not(`Kehanet ilan edildi: ${f.ad} — ${VAD[h.vr]} ${h.yon}. Vade 12 mevsim.`, { kavram:'merton' });
      break;
    }
  }
  E.gunluk.push({ tur:w.tur, fiil:h.fiil, hedef:h.hedef, etkinlik:+et.toFixed(2) });
  return out;
}

/* --- oyuncunun turu: kaynak, ajanlar, kehanetler, av --- */
function eliIsle(w){
  const E = w.el, out = [];
  if (!E || E.bitti) return out;

  // nüfuz: kurumsallaşmış akımlar ve olgun ajanlar besler
  const kurumsal = w.tohumlar.filter(t=>t.canli && t.kurumsal).length;
  const olgunAjan = E.ajanlar.filter(a=>a.olgun && !a.yakalandi).length;
  // Dünya doktrinine benzedikçe güçlenirsin: amaç ve motor aynı şeydir
  E.hiz = hizalanma(w);
  E.hizGecmis.push(Math.round(E.hiz));
  if (E.hizGecmis.length > 400) E.hizGecmis.shift();
  // hizalanma keskin: doktrinine aykırı giden dünya seni aç bırakır
  const besin = 0.5 + Math.pow(E.hiz/100, 1.4) * 3.4;
  E.nufuz = Math.min(24, E.nufuz + besin + kurumsal*0.85 + olgunAjan*0.45 - E.ifsa/70);

  // ifşa yavaş söner ama sıfırlanmaz
  E.ifsa = kirp(E.ifsa - (1.15 + (E.ifsa>60 ? 0.5 : 0)), 0, 100);

  // GOODHART yıpranması çok yavaş iyileşir
  for (const k in E.asinma) E.asinma[k] = Math.max(0, E.asinma[k] - 0.035);

  // ajanlar olgunlaşır, sır üretir, yakalanabilir
  for (const a of E.ajanlar){
    if (a.yakalandi) continue;
    const f = w.fac[a.fac];
    if (!f || !f.canli){ a.yakalandi = true; continue; }
    const yas = w.tur - a.dikildi;
    if (!a.olgun && yas >= 6){
      a.olgun = true;
      out.push({ tur:w.tur, tip:'el', metin:`${f.ad} içindeki ajanın artık işe yarar.` });
    }
    if (a.olgun && hsh(w.seed+'|sr|'+w.tur+'|'+a.id) < 0.09){
      const sir = { id:E.sirlar.length, fac:a.fac, agirlik:Math.round(ara(()=>hsh(w.seed+'|sa|'+w.tur+'|'+a.id),4,11)),
                    bulundu:w.tur, kullanildi:false };
      E.sirlar.push(sir);
      out.push({ tur:w.tur, tip:'el', sir:sir.id,
        metin:`${f.ad} hakkında bir sır elinde: ağırlık ${sir.agirlik}.` });
    }
    // yakalanma: fraksiyonun bilgisi ve senin ifşan yükseldikçe
    const risk = (f.v.bilgi/100)*0.022 + E.ifsa/2600;
    if (a.olgun && hsh(w.seed+'|ay|'+w.tur+'|'+a.id) < risk){
      a.yakalandi = true;
      E.ifsa = kirp(E.ifsa + 9, 0, 100);
      out.push({ tur:w.tur, tip:'el', metin:`${f.ad} ajanını yakaladı. İzin daha da belirginleşti.` });
    }
  }

  // kehanetler vadesinde çözülür
  for (const kh of E.kehanetler){
    if (kh.cozuldu || w.tur < kh.vade) continue;
    kh.cozuldu = true;
    const f = w.fac[kh.fac];
    const simdi = f && f.canli ? f.v[kh.vr] : 0;
    const fark = simdi - kh.baslangic;
    const tuttu = (kh.yon==='yukselecek' && fark > 4) || (kh.yon==='dusecek' && fark < -4);
    kh.tuttu = tuttu; kh.fark = +fark.toFixed(1);
    if (tuttu){
      E.nufuz = Math.min(24, E.nufuz + 9);
      E.ifsa  = kirp(E.ifsa - 4, 0, 100);
      out.push({ tur:w.tur, tip:'el', kavram:'merton',
        metin:`Kehanet tuttu: ${f.ad} — ${VAD[kh.vr]} ${kh.yon} (${fark>0?'+':''}${fark.toFixed(1)}). Görünmez el güçlendi.` });
    } else {
      E.ifsa = kirp(E.ifsa + 7, 0, 100);
      out.push({ tur:w.tur, tip:'el', kavram:'merton',
        metin:`Kehanet tutmadı: ${f && f.canli ? f.ad : 'fraksiyon'} — ${VAD[kh.vr]} ${kh.yon} (${fark>0?'+':''}${fark.toFixed(1)}). Yalancı peygamber fark edilir.` });
    }
  }

  // korunma söner
  for (const f of w.fac) if (f.korunma) f.korunma = Math.max(0, f.korunma - 1.5);

  // AV: bilgisi yüksek fraksiyonlar izi sürer
  let dikkat = 0;
  for (const f of w.fac) if (f.canli) dikkat += Math.max(0, f.v.bilgi - 58) / 100;
  E.av = kirp(E.av + dikkat * (E.ifsa/55) - 0.25, 0, 100);

  if (E.ifsa >= 100 || E.av >= 100){
    E.bitti = true;
    E.bitisSebebi = E.ifsa >= 100 ? 'ifsa' : 'av';
    out.push({ tur:w.tur, tip:'son',
      metin: E.bitisSebebi === 'ifsa'
        ? 'Artık görünüyorsun. Gizli el kalmadı.'
        : 'İzini sürdüler ve buldular.' });
  }
  return out;
}

/* ---------- DOĞRULAMA ---------- */
// Üretilen fizik oyuna layık mı? Donuk, çığ gibi, ölü veya kaderi yazılmış
// dünyalar elenir. En kritik sınav: tek bir küçük müdahale, 100 tur sonra
// dünyayı yapısal olarak değiştirebiliyor mu? (kararlar birikmeli)
function durumVektoru(w){
  const o=[];
  for (const f of w.fac) for (const v of VARS) o.push(f.canli ? f.v[v] : 0);
  return o;
}
function yapisalImza(w){
  return { sahip: w.bolgeler.map(b=>b.sahip), lider: w.fac.map(f=>f.lider.ad), canli: w.fac.map(f=>f.canli) };
}
function yapisalFark(a,b){
  let n=0;
  for (let i=0;i<a.sahip.length;i++) if(a.sahip[i]!==b.sahip[i]) n++;
  for (let i=0;i<a.lider.length;i++) if(a.lider[i]!==b.lider[i]) n++;
  for (let i=0;i<a.canli.length;i++) if(a.canli[i]!==b.canli[i]) n++;
  return n;
}

function dogrula(seed, ayar){
  const T = 200, DT = 120;
  const w = dunyaKur(seed, ayar);
  let hareket=0, ornek=0, sabit=0;
  let dv=null, yi=null;
  for (let t=0;t<T;t++){
    const onc = w.fac.map(f=>VARS.map(v=>f.v[v]));
    adim(w);
    for (let i=0;i<w.fac.length;i++){
      if(!w.fac[i].canli) continue;
      for (let vi=0;vi<VARS.length;vi++){
        const yeni=w.fac[i].v[VARS[vi]];
        if (t>40){ hareket += Math.abs(yeni-onc[i][vi]); ornek++; if (yeni<=2||yeni>=98) sabit++; }
      }
    }
    if (t===DT-1){ dv=durumVektoru(w); yi=yapisalImza(w); }
  }
  const canlilik = ornek? hareket/ornek : 0;
  const sabitOran = ornek? sabit/ornek : 1;
  const hayatta = w.fac.filter(f=>f.canli && skor(f)>12).length;
  const skorlar = w.fac.filter(f=>f.canli).map(skor);
  const ort = skorlar.reduce((a,b)=>a+b,0)/(skorlar.length||1);
  const cesitlilik = Math.sqrt(skorlar.reduce((a,b)=>a+(b-ort)*(b-ort),0)/(skorlar.length||1));
  const olay = w.olaylar.length;
  const sayac = {};
  for (const o of w.olaylar) sayac[o.tip] = (sayac[o.tip]||0)+1;
  const olayTip = Object.keys(sayac).length;
  // tek bir olay tipi kroniği ele geçirmesin
  const tekel = olay ? Math.max(...Object.values(sayac)) / olay : 1;
  // değişken bazında tekdüzelik: kaç değişkende fraksiyonlar birbirinden ayrışmış?
  const canliF = w.fac.filter(f=>f.canli);
  let ayrisan = 0, cokmus = 0;
  for (const v of VARS){
    const xs = canliF.map(f=>f.v[v]);
    const m = xs.reduce((a,b)=>a+b,0)/(xs.length||1);
    const sd = Math.sqrt(xs.reduce((a,b)=>a+(b-m)*(b-m),0)/(xs.length||1));
    if (sd >= 8) ayrisan++;
    // bir değişkende herkes aynı uçta toplanmışsa o boyut ölmüştür
    if (m <= 12 || m >= 88) cokmus++;
  }

  // Açılış canlı mı? Oyuncu ilk 60 turu oynar; dramanın orada başlaması gerek.
  const erken = w.olaylar.filter(o=>o.tur<=60);
  const erkenSayi = erken.length, erkenTip = new Set(erken.map(o=>o.tip)).size;

  // Ucuz sınavlar önce: kelebek sınavı pahalı, boşa harcama
  const ucuzGecti = canlilik>=0.30 && canlilik<=2.2 && sabitOran<=0.18 && hayatta>=4 &&
                    cesitlilik>=7 && olay>=15 && olay<=260 && olayTip>=4 &&
                    tekel<=0.55 && ayrisan>=4 && cokmus===0 &&
                    erkenSayi>=8 && erkenTip>=4;
  if (!ucuzGecti && !(ayar && ayar.tamRapor)){
    return { seed, gecti:false, canlilik:+canlilik.toFixed(3), sabitOran:+sabitOran.toFixed(3), hayatta,
             cesitlilik:+cesitlilik.toFixed(2), olay, olayTip, tekel:+tekel.toFixed(2), ayrisan, cokmus, erkenSayi, erkenTip,
             sapma:0, enSapma:0, yayilim:0, yapisal:0, erken:true };
  }

  // KELEBEK SINAVI — iki ayrı oyuncu hamlesi denenir; ikisi de dünyayı
  // yüz tur sonra yeniden yazabilmeli. Tek şanslı kaldıraç yetmez.
  function dokunus(hedefFac, hedefVar, miktar){
    const u = dunyaKur(seed, ayar);
    for (let t=0;t<DT;t++){
      if (t===20 && u.fac[hedefFac]) u.fac[hedefFac].v[hedefVar] = kirp(u.fac[hedefFac].v[hedefVar] + miktar, 0.4, 99.6);
      adim(u);
    }
    const a=dv||[], b=durumVektoru(u);
    let top=0, en=0, yay=0;
    for (let i=0;i<a.length;i++){ const d=Math.abs(a[i]-(b[i]||0)); top+=d; if(d>en) en=d; if(d>3) yay++; }
    return { ort:top/(a.length||1), en, yay: yay/(a.length||1), yapisal: yi?yapisalFark(yi,yapisalImza(u)):0 };
  }
  const d1 = dokunus(0, 'servet', 8);
  const d2 = dokunus(Math.min(2, w.fac.length-1), 'mesruiyet', -8);

  const enSapma   = Math.min(d1.en, d2.en);
  const yayilim   = Math.min(d1.yay, d2.yay);
  const yapisal   = Math.min(d1.yapisal, d2.yapisal);
  const sapma     = Math.min(d1.ort, d2.ort);

  const gecti =
    canlilik   >= 0.30 && canlilik <= 2.2 &&
    sabitOran  <= 0.18 &&
    hayatta    >= 4    &&
    cesitlilik >= 7    &&
    olay       >= 15   && olay <= 260 &&
    olayTip    >= 4    && tekel <= 0.55 &&
    ayrisan    >= 4    && cokmus === 0 &&
    erkenSayi  >= 8    && erkenTip >= 4 &&
    enSapma    >= 12   &&
    yayilim    >= 0.15 &&
    yapisal    >= 1;

  return { seed, gecti, canlilik:+canlilik.toFixed(3), sabitOran:+sabitOran.toFixed(3), hayatta,
           cesitlilik:+cesitlilik.toFixed(2), olay, olayTip, tekel:+tekel.toFixed(2), ayrisan, cokmus, erkenSayi, erkenTip,
           sapma:+sapma.toFixed(2), enSapma:+enSapma.toFixed(1), yayilim:+yayilim.toFixed(2), yapisal };
}

// Sınavı geçen ilk tohumu bul
function iyiTohum(baslangic, ayar, limit){
  limit = limit || 400;
  for (let s=baslangic>>>0; s<(baslangic>>>0)+limit; s++){
    const d = dogrula(s, ayar);
    if (d.gecti) return { seed:s, rapor:d };
  }
  return null;
}

return { VARS, VAD, SEKIL, KAPSAM, KAVRAMLAR, KATMANLAR, AMACLAR, EVRELER,
           FIILLER, DOKTRINLER, hizalanma, ifsaCarpani, oyuncuKur, hamleler, hamleYap, eliIsle, etkinlik,
           klonla, tohumEk, tohumlariIsle, meseleAc, meseleKarar, meselePencere, fraksiyonEkle, evreAdi,
           kanunSetiUret, kalibreEt, ekBelirtme, ekYonelme, durumVektoru, yapisalImza, dunyaKur, adim, skor, dogrula, iyiTohum, kanunMetni, ideolojikMesafe, mulberry32, hsh };
});
