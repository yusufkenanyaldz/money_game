/* VEBA — bir şehir, bir salgın yılı.
 *
 * Altındaki model uydurma değil: hıyarcıklı veba fare–pire–insan yoluyla,
 * akciğer vebası insandan insana geçer. İkisi farklı müdahale ister ve
 * sezgi oyuncuyu yanlış yöne götürür. Oyun hastalığın adını söylemez;
 * yalnızca belirti raporu verir.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VEBA = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

function hsh(s){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){ h=Math.imul(h^s.charCodeAt(i),3432918353); h=h<<13|h>>>19; } h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return ((h^h>>>16)>>>0)/4294967296; }
function mul(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const kirp=(v,a,b)=>v<a?a:(v>b?b:v);
const ara=(r,a,b)=>a+r()*(b-a);

/* ---------- takvim ---------- */
// Oyun ilkbaharda başlar. Pire sıcakta canlanır, akciğer formu soğukta
// ve kalabalıkta yayılır. Bu mevsimsellik gerçektir ve oyunun kalbidir.
const AYLAR = ['Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık','Ocak','Şubat'];
function haftaAy(h){ return AYLAR[Math.floor(h/4) % 12]; }
function pireEtkinligi(h){
  // Mayıs–Eylül arası zirve; kışın neredeyse durur
  const ay = Math.floor(h/4) % 12;
  const egri = [0.30,0.55,0.85,1.00,1.00,0.90,0.70,0.40,0.18,0.10,0.08,0.15];
  return egri[ay];
}
function soguk(h){
  const ay = Math.floor(h/4) % 12;
  const egri = [0.45,0.30,0.15,0.05,0.02,0.05,0.18,0.42,0.70,0.90,1.00,0.80];
  return egri[ay];
}

/* ---------- şehir ---------- */
const MAHALLE_AD = ['Liman','Tabakhane','Bedesten','Çınaraltı','Su Kemeri','Yenikapı','Debbağlar','Kuyumcular'];

function sehirKur(tohum){
  const r = mul((tohum||1)>>>0);
  const n = 6;
  const adlar = MAHALLE_AD.slice(); const secili=[];
  for (let i=0;i<n;i++) secili.push(adlar.splice(Math.floor(r()*adlar.length),1)[0]);
  const O = {
    tohum: (tohum||1)>>>0, hafta: 0, bitti:false, sonuc:null,
    mahalleler: [], hazine: 320, tahil: 700,     // tahıl: hafta-kişi
    kapiKapali: false, kapiHafta: 0,
    huzursuzluk: 8, kedi: 100,
    gunluk: [], eylemGecmisi: [], ogrenilen: [],
    // oyuncunun gördüğü toplamlar
    olen: 0, olenBuHafta: 0
  };
  for (let i=0;i<n;i++){
    const nufus = Math.round(ara(r, 900, 2200));
    O.mahalleler.push({
      id:i, ad:secili[i], nufus,
      S: nufus, Eb:0, Ib:0, Ep:0, Ip:0, R:0, D:0,
      yogunluk: +ara(r,0.55,1.0).toFixed(2),      // kalabalıklık
      refah: +ara(r,0.3,1.0).toFixed(2),
      ambar: Math.round(ara(r, 40, 260)),          // tahıl deposu → fare taşıma kapasitesi
      temizlik: +ara(r,0.25,0.8).toFixed(2),
      fare: Math.round(ara(r, 25, 60)),
      epizootik: 0,                                 // farelerdeki salgın, 0..1
      karantina: 0,                                 // kalan hafta
      hekim: 0,
      aclik: 0, huzursuzluk: Math.round(ara(r,3,14)),
      komsu: []
    });
  }
  // komşuluk: halka + birkaç kısayol
  for (let i=0;i<n;i++){ const j=(i+1)%n; O.mahalleler[i].komsu.push(j); O.mahalleler[j].komsu.push(i); }
  for (let i=0;i<n;i++) if (r()<0.4){ const k=Math.floor(r()*n); if(k!==i && O.mahalleler[i].komsu.indexOf(k)<0){ O.mahalleler[i].komsu.push(k); O.mahalleler[k].komsu.push(i);} }

  // salgın limandan girer
  const giris = O.mahalleler[0];
  giris.fare = Math.min(100, giris.fare + 25);
  giris.epizootik = 0.06;
  giris.fareDuyarli = 1;
  return O;
}

function nufus(m){ return m.S + m.Eb + m.Ib + m.Ep + m.Ip + m.R; }
function toplamYasayan(O){ return O.mahalleler.reduce((a,m)=>a+nufus(m),0); }
function toplamOlen(O){ return O.mahalleler.reduce((a,m)=>a+m.D,0); }
function toplamNufus(O){ return O.mahalleler.reduce((a,m)=>a+m.nufus,0); }

/* ---------- haftalık akış ---------- */
function hafta(O){
  if (O.bitti) return [];
  O.hafta++;
  const h = O.hafta, rap = [];
  const pire = pireEtkinligi(h), sg = soguk(h);
  const rr = (t)=>hsh(O.tohum+'|'+h+'|'+t);
  let olenBu = 0, hiyarcik = 0, akciger = 0;

  for (const m of O.mahalleler){
    const N = nufus(m); if (N <= 0) continue;

    /* --- fareler: ambar ve temizlik taşıma kapasitesini belirler --- */
    // Kediler farenin doğal düşmanıdır. Onları kırmak taşıma kapasitesini
    // ÇARPAN olarak yükseltir — tarihte yapılan ve salgını büyüten hata.
    const kediCarpani = 1 + (100 - O.kedi)/100 * 0.85;
    const kapasite = kirp((18 + m.ambar*0.30 - m.temizlik*28) * kediCarpani, 5, 100);
    m.fare += (kapasite - m.fare) * 0.13;

    /* --- farelerdeki salgın ---
     * Gerçek mekanizma: salgın farelerde patlar, FARELER ÖLÜR, aç kalan
     * pireler yeni konak arar ve insana atlar. Yani insan için en tehlikeli
     * an, fareler kırıldığı andır. Okuyan oyuncu bunu bilir. */
    if (m.fareDuyarli === undefined) m.fareDuyarli = 1;
    let komsuEp = 0;
    for (const k of m.komsu) komsuEp += O.mahalleler[k].epizootik;
    komsuEp /= Math.max(1, m.komsu.length);

    const bulasan = kirp(
      (m.epizootik * 1.25 + komsuEp * 0.16) * m.fareDuyarli * (m.fare/100) * (0.35 + pire*0.85),
      0, m.fareDuyarli);
    m.fareDuyarli = kirp(m.fareDuyarli - bulasan + (1 - m.fareDuyarli) * 0.14, 0, 1);
    const olenFareOrani = m.epizootik * 0.42;                // enfekte fareler ölür
    m.epizootik = kirp(m.epizootik + bulasan - olenFareOrani, 0, 1);
    const olenFare = m.fare * olenFareOrani;
    m.fare = Math.max(2, m.fare - olenFare);

    /* --- 1) kuluçkadan çıkış: bulaş hesabından ÖNCE olmalı, yoksa
     *     akciğer vakaları bulaştırmadan ölür ve zincir hiç başlamaz --- */
    const cikEb = m.Eb * 0.72;  m.Eb -= cikEb;  m.Ib += cikEb;   // ~4 gün
    const cikEp = m.Ep * 0.92;  m.Ep -= cikEp;  m.Ip += cikEp;   // ~2 gün

    /* --- 2) HIYARCIKLI: ölen farelerin pireleri insana atlar.
     *     Karantina bunu AZ keser: pire mahalle kapısı tanımaz. --- */
    const kar = m.karantina > 0 ? 1 : 0;
    const lb = 0.70 * (olenFare/100) * pire * (kar ? 0.86 : 1) * (0.55 + m.yogunluk*0.75);
    const yeniEb = Math.min(m.S, m.S * (1 - Math.exp(-lb)));

    /* --- 3) AKCİĞER: insandan insana. Karantina bunu GERÇEKTEN keser. --- */
    // Toplu ayin bütün şehri bir meydanda toplar: temas da, mahalleler
    // arası karışım da iki hafta boyunca yükselir.
    const ayin = (O.ayinEtki > 0) ? 1 : 0;
    const temas = (0.45 + m.yogunluk*0.85) * (kar ? 0.20 : 1)
                * (m.ekmekKuyrugu ? 1.40 : 1) * (ayin ? 1.75 : 1);
    let komsuIp = 0;
    for (const k of m.komsu){ const km = O.mahalleler[k];
      if (km.karantina <= 0 && !kar) komsuIp += km.Ip / Math.max(nufus(km),1); }
    komsuIp /= Math.max(1, m.komsu.length);
    if (ayin){
      // ayinde bütün şehir karışır: uzak mahallenin hastası da yanına gelir
      let tum = 0, say = 0;
      for (const km of O.mahalleler){ if (km.karantina > 0) continue;
        tum += km.Ip / Math.max(nufus(km),1); say++; }
      komsuIp = Math.max(komsuIp, (tum/Math.max(say,1)) * 0.9);
    }
    // Temas doygunluğu: bir insan ancak bu kadar kişiyle karşılaşır.
    // Doygunluk olmadan model bıçak sırtıydı — ya hiçbir şey olmuyor
    // ya herkes ölüyordu.
    const yayginlik = m.Ip / Math.max(N,1) + komsuIp*0.22;
    // Doğru doygunluk: düşük yaygınlıkta doğrusal, yüksekte doyar.
    // (yayginlik/(yayginlik+k) yanlıştı — düşükte bulaşı 18 kat şişiriyordu.)
    const lp = 2.2 * (yayginlik / (1 + yayginlik/0.045)) * temas * (0.30 + sg*1.15);
    const yeniEp0 = Math.min(m.S - yeniEb, Math.max(0, (m.S - yeniEb) * (1 - Math.exp(-lp))));

    m.S  -= (yeniEb + yeniEp0);
    m.Eb += yeniEb;
    m.Ep += yeniEp0;

    /* --- 4) hıyarcıklı vakaların bir kısmı akciğer formuna döner:
     *     soğukta ve kalabalıkta ikinci dalganın tohumu budur --- */
    const ikincil = Math.min(m.Ib, m.Ib * 0.11 * (0.18 + sg*1.35));
    m.Ib -= ikincil; m.Ep += ikincil;

    /* --- 5) ölüm ve iyileşme --- */
    const hekimEtki = m.hekim > 0 ? 0.88 : 1;
    const olumB = m.Ib * 0.60 * hekimEtki;
    const iyiB  = m.Ib * 0.30;
    const olumP = m.Ip * 0.93;
    const iyiP  = m.Ip * 0.03;
    m.Ib -= (olumB + iyiB); m.Ip -= (olumP + iyiP);
    m.D += olumB + olumP; m.R += iyiB + iyiP;
    hiyarcik += olumB; akciger += olumP;
    olenBu += olumB + olumP;

    /* --- açlık ve huzursuzluk --- */
    m.aclik = kirp(m.aclik + (O.tahilYetti ? -3.0 : 2.4) + (m.karantina>0 ? 1.6 : 0), 0, 100);
    // Huzursuzluk ihmalden doğar, salgından değil: ölüm hızı ve açlık
    // besler, ilgi (ekmek, hekim) ve zaman söndürür.
    const olumOrani = (olumB + olumP) / Math.max(N,1) * 1000;
    m.huzursuzluk = kirp(m.huzursuzluk + m.aclik*0.09 + olumOrani*0.09
                        + (m.karantina>0 ? 1.7 : 0) - (m.hekim>0 ? 1.6 : 0) - 1.9, 0, 100);

    if (m.karantina > 0) m.karantina--;
    if (m.hekim > 0) m.hekim--;
    m.ekmekKuyrugu = false;
  }

  /* --- İKİNCİ PERDE ---
   * Kışın hasta bir kervan gelir. Kapı açıksa şehre girer ve bu sefer
   * hastalık insandan insana yayılır: karantina artık GERÇEKTEN işe yarar.
   * Kapı kapalıysa geri çevrilir — ama kapalı kapı tahılı da keser. */
  if (h === 33 && !O.kervanGeldi){
    O.kervanGeldi = true;
    if (O.kapiKapali){
      rap.push({ tip:'ipucu', metin:'Kapıda hasta bir kervan çevrildi. Şehre alınmadılar.' });
    } else {
      const liman = O.mahalleler[0];
      const gir = Math.min(8, liman.S);
      liman.S -= gir; liman.Ep += gir;
      rap.push({ tip:'uyari', metin:`${liman.ad}'a bir kervan girdi. Yolcuların bir kısmı hasta.` });
    }
  }

  /* --- tahıl --- */
  const gereken = Math.ceil(toplamYasayan(O) / 900);
  const gelen = O.kapiKapali ? 0 : Math.round(13 + hsh(O.tohum+'|t'+h)*6);
  O.tahil += gelen - gereken;
  O.tahilYetti = O.tahil >= 0;
  if (O.tahil < 0) O.tahil = 0;

  if (O.ayinEtki > 0) O.ayinEtki--;

  /* --- vergi geliri: yaşayan nüfusla orantılı, huzursuzlukla düşer --- */
  O.hazine += Math.round(toplamYasayan(O)/190 * (1 - O.huzursuzluk/160));

  /* --- şehir huzursuzluğu --- */
  // Şehir ortalaması yanıltıcıydı: bir mahalle haftalarca yanarken ortalama
  // sakin görünüyordu. İsyanı en kötü mahalleler belirler.
  const sirali = O.mahalleler.map(m=>m.huzursuzluk).sort((a,b)=>b-a);
  O.huzursuzluk = kirp(sirali[0]*0.5 + sirali[1]*0.3 +
                       (O.mahalleler.reduce((a,m)=>a+m.huzursuzluk,0)/O.mahalleler.length)*0.2, 0, 100);
  if (O.kapiKapali) O.kapiHafta++;

  O.olenBuHafta = Math.round(olenBu);
  O.olen = Math.round(toplamOlen(O));

  /* --- rapor: belirtiler. Hastalığın adı SÖYLENMEZ. --- */
  rap.push(...raporYaz(O, hiyarcik, akciger, pire, sg));

  /* --- son --- */
  if (O.huzursuzluk >= 92){
    O.bitti = true; O.sonuc = 'isyan';
    rap.push({ tip:'son', metin:'Şehir ayaklandı. Kapılar kırıldı, sen görevden alındın.' });
  } else if (O.hafta >= 48){
    O.bitti = true; O.sonuc = 'bitti';
  } else if (O.hafta > 40 && O.mahalleler.every(m => m.Ib + m.Ip + m.Eb + m.Ep < 1 && m.epizootik < 0.02)){
    O.bitti = true; O.sonuc = 'sondu';
    rap.push({ tip:'son', metin:'Haftalardır yeni ölüm yok. Salgın söndü.' });
  }
  O.gunluk.push({ hafta:h, satirlar:rap });
  return rap;
}

function raporYaz(O, hiyarcik, akciger, pire, sg){
  const r = [], top = hiyarcik + akciger;
  if (top < 0.5){
    r.push({ tip:'sakin', metin:'Bu hafta ölüm haberi gelmedi.' });
  } else {
    const oran = hiyarcik / top;
    if (oran > 0.78) r.push({ tip:'belirti',
      metin:'Ölenlerin neredeyse tamamında koltuk altında ve kasıkta şişlikler vardı.' });
    else if (oran > 0.55) r.push({ tip:'belirti',
      metin:'Çoğu ölüde şişlikler görüldü; birkaçı kan tükürerek gitti.' });
    else if (oran > 0.25) r.push({ tip:'belirti',
      metin:'Şişlikli ölülerin yanında kan tüküren hastalar da çoğaldı.' });
    else r.push({ tip:'belirti',
      metin:'Ölenlerin çoğu kan tükürüyordu. Hastalananlar iki gün bile dayanmıyor.' });
  }
  const enKotu = O.mahalleler.slice().sort((a,b)=>(b.Ib+b.Ip)-(a.Ib+a.Ip))[0];
  if (enKotu && (enKotu.Ib+enKotu.Ip) > 3)
    r.push({ tip:'yer', metin:`En çok hasta ${enKotu.ad} mahallesinde.` });
  const fareli = O.mahalleler.slice().sort((a,b)=>b.fare-a.fare)[0];
  if (fareli && fareli.fare > 62)
    r.push({ tip:'ipucu', metin:`${fareli.ad}'da fareler göz önünde dolaşıyor.` });
  if (O.tahil < 60)
    r.push({ tip:'uyari', metin:'Ambarlar boşalıyor. Ekmek sırası uzun.' });
  const kizgin = O.mahalleler.filter(m=>m.huzursuzluk>70).map(m=>m.ad);
  if (kizgin.length)
    r.push({ tip:'uyari', metin: kizgin.join(' ve ') + ' kaynıyor.' });
  return r;
}

/* ---------- eylemler ---------- */
const EYLEMLER = {
  kapiKapat:   { ad:'Şehir kapılarını kapat', bedel:0,   tarif:'Dışarıdan kimse girmez. Tahıl da girmez.' },
  kapiAc:      { ad:'Kapıları aç',            bedel:0,   tarif:'Tahıl yeniden akar.' },
  karantina:   { ad:'Mahalleyi karantinaya al', bedel:60, tarif:'Bir mahalle dört hafta kapatılır. Halk sevmez.', hedefli:true },
  ekmek:       { ad:'Ekmek dağıt',            bedel:120, tarif:'Açlık ve öfke diner. Ama sıra kalabalık demektir.', hedefli:true },
  hekim:       { ad:'Hekim gönder',           bedel:90,  tarif:'Ölüm biraz azalır, moral yükselir.', hedefli:true },
  ambar:       { ad:'Ambarları boşalt ve temizle', bedel:110, tarif:'Tahıl depolarını taşıt, çöpü kaldırt.', hedefli:true },
  cenaze:      { ad:'Ölüleri şehir dışına gömdür', bedel:70, tarif:'Kokuyu ve korkuyu azaltır.' },
  ayin:        { ad:'Toplu dua ayini düzenlet', bedel:50, tarif:'Halk teselli bulur, umut artar.' }
};

function eylemYap(O, ad, hedef){
  const E = EYLEMLER[ad]; const out = [];
  if (!E || O.bitti) return out;
  if (O.hazine < E.bedel) return [{ tip:'ret', metin:'Hazine yetmiyor.' }];
  O.hazine -= E.bedel;
  const m = hedef != null ? O.mahalleler[hedef] : null;
  O.eylemGecmisi.push({ hafta:O.hafta, ad, hedef });

  switch (ad){
    case 'kapiKapat':
      O.kapiKapali = true;
      out.push({ tip:'eylem', metin:'Kapılar kapatıldı. Şehre kimse girip çıkamıyor.' });
      break;
    case 'kapiAc':
      O.kapiKapali = false;
      out.push({ tip:'eylem', metin:'Kapılar açıldı. Tahıl arabaları yeniden geliyor.' });
      break;
    case 'karantina':
      m.karantina = 4;
      m.huzursuzluk = kirp(m.huzursuzluk + 12, 0, 100);
      out.push({ tip:'eylem', metin:`${m.ad} dört hafta kapatıldı.` });
      break;
    case 'ekmek':
      m.aclik = kirp(m.aclik - 30, 0, 100);
      m.huzursuzluk = kirp(m.huzursuzluk - 26, 0, 100);
      m.ekmekKuyrugu = true;          // kalabalık → insandan insana bulaş artar
      out.push({ tip:'eylem', metin:`${m.ad}'da ekmek dağıtıldı. Sıra uzundu.` });
      break;
    case 'hekim':
      m.hekim = 4;
      m.huzursuzluk = kirp(m.huzursuzluk - 8, 0, 100);
      out.push({ tip:'eylem', metin:`${m.ad}'a hekim gönderildi.` });
      break;
    case 'ambar':
      m.ambar = Math.round(m.ambar * 0.35);
      m.temizlik = kirp(m.temizlik + 0.30, 0, 1);
      out.push({ tip:'eylem', metin:`${m.ad}'daki ambarlar boşaltıldı, sokaklar temizlendi.` });
      break;
    case 'ayin':
      // TUZAK: moral gerçekten yükselir — ama bütün şehir bir meydanda
      // toplanır ve iki hafta boyunca temas patlar.
      for (const mm of O.mahalleler) mm.huzursuzluk = kirp(mm.huzursuzluk - 18, 0, 100);
      O.ayinEtki = 2;
      out.push({ tip:'eylem', metin:'Büyük camide dua edildi. Meydan hınca hınç doldu.' });
      break;
    case 'cenaze':
      for (const mm of O.mahalleler) mm.huzursuzluk = kirp(mm.huzursuzluk - 7, 0, 100);
      out.push({ tip:'eylem', metin:'Ölüler surların dışına, kireçli çukurlara gömüldü.' });
      break;
  }
  return out;
}

function skor(O){
  const yasayan = Math.round(toplamYasayan(O)), top = toplamNufus(O);
  return { yasayan, olen: top - yasayan, toplam: top,
           oran: +((yasayan/top)*100).toFixed(1), sonuc: O.sonuc };
}

return { sehirKur, hafta, eylemYap, EYLEMLER, skor, nufus, toplamYasayan, toplamOlen,
         toplamNufus, haftaAy, pireEtkinligi, soguk, AYLAR };
});
