/* GİZLİ EL — arayüz. Masa, gösterge paneli değil.
 * Kural: oyuncu hak etmediği rakamı görmez. */
'use strict';
const $ = s => document.querySelector(s);
const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c;
  if (x !== undefined) n.textContent = x; return n; };
const KAYIT = 'gizliel_kayit_v1';

/* Bilinmeyen yazıyla değil karalamayla gösterilir: basılmamış bir satır.
   Genişlik içeriğe göre değil, tohuma göre sabit — her açılışta aynı görünür. */
function kara(anahtar, en){
  const n = el('span','kara');
  let h = 0; for (let i=0;i<anahtar.length;i++) h = (h*31 + anahtar.charCodeAt(i)) | 0;
  const g = (en || 62) + (Math.abs(h) % 34);
  n.style.width = g + 'px';
  return n;
}
function blok(kenarMetni, doldur){
  const b = el('div','blok');
  b.appendChild(el('div','kenar', kenarMetni));
  const g = el('div','govde');
  doldur(g);
  b.appendChild(g);
  return b;
}

let W = null, aktifCekmece = 'masa', seciliBolge = null;

/* fraksiyon renkleri: soluk, mürekkep gibi */
const RENK = ['#4c5d4f','#8a5a3c','#46566e','#6f4552','#5f6b39','#3d5f60','#8a6a2c','#553f63'];
const renk = i => RENK[i % RENK.length];

/* ---------- kayıt ---------- */
function kaydet(){
  if (!W) return;
  try {
    const rng = W.kurulumRng; delete W.kurulumRng;
    localStorage.setItem(KAYIT, JSON.stringify(W));
    W.kurulumRng = rng;
  } catch(e){}
}
function kayitVar(){ try { return !!localStorage.getItem(KAYIT); } catch(e){ return false; } }
function yukle(){
  try { const s = localStorage.getItem(KAYIT); if (!s) return null; return JSON.parse(s); }
  catch(e){ return null; }
}

/* ---------- dünya arama ----------
 * Sınavı geçen dünyalar önceden bulunup listelendi (23.726 aday elenerek).
 * Böylece açılış anlık. Liste tükenirse canlı aramaya düşer. */
const OYNANAN = 'gizliel_oynanan_v1';
function oynananlar(){
  try { return JSON.parse(localStorage.getItem(OYNANAN) || '[]'); } catch(e){ return []; }
}
function oynandiIsaretle(t){
  try { const l = oynananlar(); l.push(t);
        localStorage.setItem(OYNANAN, JSON.stringify(l.slice(-400))); } catch(e){}
}

function dunyaAra(doktrin){
  $('#doktrinler').hidden = true;
  const durum = $('#arama');
  const liste = (window.TOHUMLAR || []).filter(t => oynananlar().indexOf(t) < 0);
  if (liste.length){
    const t = liste[Math.floor(Math.random()*liste.length)];
    W = GE.dunyaKur(t);
    GE.oyuncuKur(W, { doktrin });
    oynandiIsaretle(t);
    durum.textContent = 'Dünya #' + t + ' ayakta.';
    setTimeout(basla, 260);
    return;
  }
  // liste tükendi: canlı ara
  let tohum = (Date.now() ^ (Math.random()*1e9)) >>> 0, elenen = 0;
  const parti = () => {
    const t0 = performance.now();
    while (performance.now() - t0 < 26){
      const d = GE.dogrula(tohum);
      elenen++;
      if (d.gecti){
        W = GE.dunyaKur(tohum);
        GE.oyuncuKur(W, { doktrin });
        oynandiIsaretle(tohum);
        durum.textContent = elenen + ' aday elendi. Dünya ayakta.';
        setTimeout(basla, 420);
        return;
      }
      tohum = (tohum + 1) >>> 0;
    }
    durum.textContent = 'Dünya dokunuyor… ' + elenen + ' aday elendi';
    requestAnimationFrame(parti);
  };
  parti();
}

function basla(){
  $('#giris').hidden = true;
  kaydet();
  ciz();
}

/* ---------- durum satırı ---------- */
function durumCiz(){
  const E = W.el, s = $('#durumSatir');
  s.innerHTML = '';
  const par = (metin, sinif) => { const d = el('span', sinif || '');
    d.innerHTML = metin; s.appendChild(d); return d; };
  par(W.tur + '. mevsim');
  par('nüfuz <b>' + Math.floor(E.nufuz) + '</b>');
  // iz bir sayı değil, dosyaya vurulmuş bir damgadır
  const dm = el('span','damga' + (E.ifsa >= 42 ? ' sicak' : ''), 'iz ' + GE.izSozu(E.ifsa));
  const sar = el('span'); sar.appendChild(dm);
  s.appendChild(sar);
  par('<b>' + GE.hizSozu(E.hiz) + '</b>');
}

/* ---------- çekmeceler ---------- */
function cekmeceCiz(){
  const n = $('#cekmeceler');
  n.innerHTML = '';
  const acikDosya = W.meseleler.filter(m => m.acik).length;
  const sek = [['masa','Masa', acikDosya > 0], ['harita','Harita', false],
               ['kronik','Kronik', false], ['kutuphane','Kütüphane', false]];
  for (const [k, ad, im] of sek){
    const b = el('button');
    b.appendChild(document.createTextNode(ad));
    if (im) b.appendChild(el('span','im'));
    b.setAttribute('aria-current', aktifCekmece === k ? 'true' : 'false');
    b.onclick = () => { aktifCekmece = k; ciz(); window.scrollTo(0,0); };
    n.appendChild(b);
  }
}

/* ---------- masa ---------- */
function masaCiz(){
  const m = $('#masa');
  m.innerHTML = '';
  const acik = W.meseleler.filter(x => x.acik);
  if (acik.length){
    m.appendChild(blok('masanda bekleyen', g => {
      for (const mes of acik){
        const d = GE.dosyaUret(W, mes.id);
        if (!d) continue;
        const k = el('button','cagri');
        const ust = el('div','ust');
        ust.appendChild(el('h3','', d.baslik));
        ust.appendChild(el('div','sure', d.kalanMevsim + ' mevsim'));
        k.appendChild(ust);
        k.appendChild(el('p','', d.girizgah));
        k.onclick = () => dosyaAc(mes.id);
        g.appendChild(k);
      }
    }));
  }

  const bu = W.olaylar.filter(o => o.tur === W.tur && o.tip !== 'el');
  m.appendChild(blok('bu mevsim', g => {
    if (!bu.length) g.appendChild(el('p','soluk','Sessiz geçti.'));
    for (const o of bu.slice(-12)) g.appendChild(olaySatiri(o, false));
  }));

  m.appendChild(el('hr'));
  m.appendChild(blok('güçler', g => {
    for (let i=0;i<W.fac.length;i++) if (W.fac[i].canli) g.appendChild(fraksiyonSatiri(i));
  }));
}

function olaySatiri(o, turGoster){
  const d = el('div','olay' + (o.kavram ? ' vurgu' : ''));
  d.appendChild(el('div','t', turGoster ? String(o.tur) : ''));
  const mm = el('div','m');
  mm.appendChild(document.createTextNode(o.metin));
  if (o.kavramAd){
    const k = el('div','not', o.kavramAd + ' — ' + (o.kaynak||''));
    k.style.marginTop = '4px'; k.style.textTransform = 'none';
    mm.appendChild(k);
  }
  d.appendChild(mm);
  return d;
}

function fraksiyonSatiri(i){
  const f = W.fac[i], sv = GE.bilgiSeviyesi(W, i);
  const d = el('div','frak');
  const ad = el('div','ad');
  const sol = el('div','isim');
  const nk = el('span','nokta'); nk.style.background = renk(i);
  sol.appendChild(nk); sol.appendChild(document.createTextNode(f.ad));
  ad.appendChild(sol);
  ad.appendChild(el('div','rozet', sv === 2 ? 'ajanın var' : (sv === 1 ? 'doğasını biliyorsun' : 'kaynağın yok')));
  d.appendChild(ad);

  // Altı değişken de listelenir. Göremediklerin BOŞ değil, KARALI:
  // neyi bilmediğini de bilirsin.
  const iz = el('div','izgara');
  for (const v of GE.VARS){
    const g = GE.gorunum(W, i, v);
    const sat = el('div','sat');
    sat.appendChild(el('span','et', GE.VAD[v].toLowerCase()));
    if (g.bilinmiyor) sat.appendChild(kara(f.ad + v, 40));
    else {
      const t = (g.tam !== undefined ? g.tam + ' · ' : '') + g.soz +
        (g.gidisat && g.gidisat !== 'duruyor' ? (g.gidisat === 'artıyor' ? ' ↑' : ' ↓') : '');
      sat.appendChild(el('span','dg', t));
    }
    iz.appendChild(sat);
  }
  d.appendChild(iz);
  return d;
}

/* ---------- harita ---------- */
function haritaCiz(){
  const h = $('#harita');
  h.innerHTML = '';
  h.appendChild(el('div','not','Şema — yalnızca bildiğin kadarı.'));

  const n = W.bolgeler.length, R = 98, CX = 190, CY = 150;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 380 300');
  svg.id = 'sema';
  const poz = i => { const a = -Math.PI/2 + i/n*Math.PI*2;
    return [CX + Math.cos(a)*R, CY + Math.sin(a)*R]; };
  const kisalt = ad => ad.length > 15 ? ad.split(' ')[0] : ad;

  const cizilen = new Set();
  for (const b of W.bolgeler) for (const k of b.komsu){
    const anahtar = Math.min(b.id,k) + '-' + Math.max(b.id,k);
    if (cizilen.has(anahtar)) continue;
    cizilen.add(anahtar);
    const [x1,y1] = poz(b.id), [x2,y2] = poz(k);
    const l = document.createElementNS(ns,'line');
    l.setAttribute('x1',x1); l.setAttribute('y1',y1);
    l.setAttribute('x2',x2); l.setAttribute('y2',y2);
    l.setAttribute('stroke', '#9c9082');
    l.setAttribute('stroke-width', Math.abs(b.id-k)===1||Math.abs(b.id-k)===n-1 ? 1.2 : .7);
    svg.appendChild(l);
  }

  for (const b of W.bolgeler){
    const g = GE.bolgeGorunum(W, b.id);
    const [x,y] = poz(b.id);
    if (seciliBolge === b.id){
      const halka = document.createElementNS(ns,'circle');
      halka.setAttribute('cx',x); halka.setAttribute('cy',y); halka.setAttribute('r',13);
      halka.setAttribute('fill','none'); halka.setAttribute('stroke','#8c3a2b');
      halka.setAttribute('stroke-width','1');
      svg.appendChild(halka);
    }
    // ortak toprak: ikinci ince halka. Kesik çizgi gürültü yapıyordu.
    if (g.ortak){
      const dis = document.createElementNS(ns,'circle');
      dis.setAttribute('cx',x); dis.setAttribute('cy',y); dis.setAttribute('r',9.5);
      dis.setAttribute('fill','none'); dis.setAttribute('stroke', renk(g.sahip));
      dis.setAttribute('stroke-width','.6'); dis.setAttribute('opacity','.75');
      dis.style.pointerEvents = 'none';
      svg.appendChild(dis);
    }
    const c = document.createElementNS(ns,'circle');
    c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',6);
    // içi dolu = içerisini görebiliyorsun
    c.setAttribute('fill', g.seviye >= 1 ? renk(g.sahip) : '#e9e2d3');
    c.setAttribute('stroke', renk(g.sahip));
    c.setAttribute('stroke-width','1.5');
    c.style.pointerEvents = 'none';
    svg.appendChild(c);

    const hit = document.createElementNS(ns,'circle');
    hit.setAttribute('cx',x); hit.setAttribute('cy',y); hit.setAttribute('r',17);
    hit.setAttribute('fill','transparent');
    hit.style.cursor = 'pointer';
    hit.onclick = () => { seciliBolge = b.id; haritaCiz(); };
    svg.appendChild(hit);

    const t = document.createElementNS(ns,'text');
    const ca = Math.cos(-Math.PI/2 + b.id/n*Math.PI*2);
    const sa = Math.sin(-Math.PI/2 + b.id/n*Math.PI*2);
    const sag = ca > .18, sol = ca < -.18;
    t.setAttribute('x', x + (sag ? 14 : (sol ? -14 : 0)));
    t.setAttribute('y', y + (sag||sol ? 3 : (sa < 0 ? -14 : 17)));
    t.setAttribute('text-anchor', sag ? 'start' : (sol ? 'end' : 'middle'));
    t.textContent = kisalt(b.ad);
    svg.appendChild(t);
  }
  h.appendChild(svg);

  const bilgi = el('div','bolgeBilgi');
  if (seciliBolge === null) bilgi.innerHTML = 'Bir düğüme dokun.<br>İçi dolu düğüm: içerisini görebiliyorsun. Çift halka: ortak toprak.';
  else {
    const g = GE.bolgeGorunum(W, seciliBolge);
    const p = [];
    p.push(g.ad + ' — ' + g.sahipAd + (g.ortak ? ' · ortak toprak' : ''));
    if (g.seviye === 0) p.push('İçerisi hakkında kaynağın yok.');
    else {
      p.push('zenginlik: ' + (g.zenginlik !== undefined ? g.zenginlik + ' (' + g.zenginlikSoz + ')' : g.zenginlikSoz));
      p.push('huzursuzluk: ' + (g.huzursuzluk !== undefined ? g.huzursuzluk + ' (' + g.huzursuzlukSoz + ')' : g.huzursuzlukSoz));
      p.push('yerel kural: ' + (g.kuralVar ? 'var' : 'yok') + (g.gelenek !== undefined ? ' (gelenek ' + g.gelenek + ')' : ''));
    }
    bilgi.innerHTML = p.join('<br>');
  }
  h.appendChild(bilgi);

  // renk anahtarı: düğüm rengi sahibi gösterir
  h.appendChild(el('hr'));
  h.appendChild(blok('kim nerede', g => {
    for (let i=0;i<W.fac.length;i++){
      if (!W.fac[i].canli) continue;
      const say = W.bolgeler.filter(b => b.sahip === i).length;
      const r = el('div','olcum');
      const sol = el('span','ad');
      const nk = el('span','nokta'); nk.style.background = renk(i);
      sol.appendChild(nk); sol.appendChild(document.createTextNode(W.fac[i].ad));
      r.appendChild(sol);
      r.appendChild(el('span','nokta-sirasi'));
      r.appendChild(el('span','dg', say + ' bölge'));
      g.appendChild(r);
    }
  }));
}

/* ---------- kronik ---------- */
function kronikCiz(){
  const k = $('#kronik');
  k.innerHTML = '';
  k.appendChild(blok('olup bitenler', g => {
    const ol = W.olaylar.filter(o => o.tip !== 'ret').slice(-90).reverse();
    if (!ol.length) g.appendChild(el('p','soluk','Henüz bir şey olmadı.'));
    for (const o of ol) g.appendChild(olaySatiri(o, true));
  }));
}

/* ---------- kütüphane ---------- */
function kutuphaneCiz(){
  const k = $('#kutuphane');
  k.innerHTML = '';
  const liste = W.el.kutuphane || [];
  k.appendChild(blok('kütüphane', g => {
    g.appendChild(el('p','not','Oyun bunları açıklamaz. Okursan bir sonrakini önceden görürsün.'));
    if (!liste.length) g.appendChild(el('p','soluk','Henüz bir mesele kapanmadı.'));
    for (const kk of liste){
      const K = GE.KAVRAMLAR[kk]; if (!K) continue;
      const d = el('div','kuram');
      d.appendChild(el('h3','', K.ad));
      d.appendChild(el('div','tek', K.tek));
      d.appendChild(el('div','kaynak', K.kaynak));
      g.appendChild(d);
    }
  }));
  k.appendChild(el('hr'));
  k.appendChild(blok('çözdüğün kanunlar', g => {
    if (!W.el.bilinen.length){
      g.appendChild(el('p','soluk','Hiçbir kanunu incelemedin. Bu dünyanın fiziği senin için kapalı:'));
      const d = el('div');
      d.style.margin = '10px 0';
      for (let i=0;i<W.kanunlar.length;i++){
        const r = el('div'); r.style.padding = '4px 0';
        r.appendChild(kara('kanun'+i, 150));
        d.appendChild(r);
      }
      g.appendChild(d);
    }
    for (const id of W.el.bilinen){
      const d = el('div','kuram');
      d.appendChild(el('div','tek', GE.kanunMetni(W.kanunlar[id])));
      g.appendChild(d);
    }
    // henüz çözülmemişler karalı durur
    const kalan = W.kanunlar.length - W.el.bilinen.length;
    if (W.el.bilinen.length && kalan > 0){
      const d = el('div'); d.style.marginTop = '8px';
      for (let i=0;i<kalan;i++){
        const r = el('div'); r.style.padding = '4px 0';
        r.appendChild(kara('kalan'+i, 150));
        d.appendChild(r);
      }
      g.appendChild(d);
      g.appendChild(el('div','not', kalan + ' kanun hâlâ karanlıkta.'));
    }
  }));
  k.appendChild(el('hr'));
  const disa = el('button','dugme','Kaydı metin olarak dışa aktar');
  disa.onclick = disaAktar;
  k.appendChild(disa);
}

function disaAktar(){
  const rng = W.kurulumRng; delete W.kurulumRng;
  const metin = JSON.stringify(W);
  W.kurulumRng = rng;
  const ta = el('textarea'); ta.value = metin;
  ortuAc(ic => {
    ic.appendChild(el('h2','dosyaBaslik','Kayıt'));
    ic.appendChild(el('p','soluk','Bu metni bir yere kopyala. Telefon verisi silinirse buradan geri dönersin.'));
    ta.style.height = '240px';
    ic.appendChild(ta);
    ta.select();
  });
}

/* ---------- örtü ---------- */
function ortuAc(doldur){
  const o = $('#ortu'), ic = $('#ortuIc');
  ic.innerHTML = '';
  ic.appendChild(el('div','kose sol-ust'));
  ic.appendChild(el('div','kose sag-ust'));
  const kap = el('button','kapat','← Kapat');
  kap.onclick = ortuKapat;
  ic.appendChild(kap);
  doldur(ic);
  o.hidden = false;
  o.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}
function ortuKapat(){ $('#ortu').hidden = true; document.body.style.overflow = ''; }

/* ---------- dosya ---------- */
function dosyaAc(meseleId){
  const d = GE.dosyaUret(W, meseleId);
  if (!d) return;
  ortuAc(ic => {
    ic.appendChild(el('h2','dosyaBaslik', d.baslik));
    const ust = el('div','not');
    ust.appendChild(document.createTextNode('dosya ' + String(meseleId+1).padStart(3,'0') +
      ' · ' + W.tur + '. mevsim · karar için '));
    const kalan = el('span','damga' + (d.kalanMevsim <= 2 ? ' sicak' : ''), d.kalanMevsim + ' mevsim');
    ust.appendChild(kalan);
    ic.appendChild(ust);
    ic.appendChild(el('p','', d.girizgah));
    ic.appendChild(el('hr'));

    ic.appendChild(blok('tanıklıklar', g => {
      if (!d.tanikliklar.length) g.appendChild(el('p','soluk','Hiçbir kaynağın konuşmuyor.'));
      for (const t of d.tanikliklar){
        const n = el('div','taniklik');
        n.appendChild(el('div','kaynak', t.etiket));
        n.appendChild(el('div','iddia', '“' + t.metin + '”'));
        g.appendChild(n);
      }
    }));

    ic.appendChild(blok('tahminler', g => {
      for (const o of d.olcumler){
        const n = el('div','olcum');
        n.appendChild(el('span','ad', o.ad));
        n.appendChild(el('span','nokta-sirasi'));
        if (o.aralik === 'bilinmiyor'){
          const kutu = el('span','dg');
          kutu.appendChild(kara(d.baslik + o.ad, 58));
          n.appendChild(kutu);
        } else n.appendChild(el('span','dg', o.aralik));
        g.appendChild(n);
      }
      const karanlik = d.olcumler.filter(o => o.aralik === 'bilinmiyor').length;
      if (karanlik) g.appendChild(el('div','not',
        karanlik === 1 ? 'Bir satır basılmamış: kaynağın görmüyor.'
                       : karanlik + ' satır basılmamış: kaynağın oraya ulaşmıyor.'));
    }));

    if (d.celiskiler.length){
      ic.appendChild(blok('çelişki', g => {
        g.appendChild(el('p','not','İkisi aynı anda doğru olamaz.'));
        for (const c of d.celiskiler){
          const n = el('div','celiski');
          n.appendChild(el('div','not', c.baslik));
          for (const y of [c.a, c.b]){
            const q = el('div','yan');
            q.appendChild(el('div','kaynak', y.etiket));
            q.appendChild(el('div','', '“' + y.metin + '”'));
            n.appendChild(q);
          }
          g.appendChild(n);
        }
      }));
    }

    ic.appendChild(el('hr'));
    ic.appendChild(blok('kararın', g => {
      d.secenekler.forEach((sc, i) => {
        const b = el('button','secenek');
        b.appendChild(el('div','no', (i+1) + '.'));
        const sag = el('div');
        sag.appendChild(el('b','', sc.ad));
        sag.appendChild(el('span','', sc.tarif));
        b.appendChild(sag);
        b.onclick = () => {
          const olay = GE.meseleKarar(W, meseleId, sc.anahtar);
          W.olaylar.push(...olay);
          ortuKapat(); kaydet(); ciz();
        };
        g.appendChild(b);
      });
    }));
  });
}

/* ---------- emir ---------- */
const FIIL_CUMLE = {
  incele:  h => h.doga ? ['', h.fac, 'fraksiyonunun doğasını çöz'] : ['', h.kanun, 'kanununu incele'],
  ajan:    () => ['', '', 'içine ajan yerleştir'],
  fisilda: () => ['', '', 'liderinin kulağına fısılda'],
  koru:    () => ['', '', 'korunsun'],
  finanse: () => ['', '', 'gizlice finanse edilsin'],
  kiskirt: () => ['', '', 'kışkırtılsın']
};

function emirAc(){
  const hepsi = GE.hamleler(W);
  const gruplar = {};
  for (const h of hepsi) (gruplar[h.fiil] = gruplar[h.fiil] || []).push(h);
  ortuAc(ic => {
    ic.appendChild(el('h2','dosyaBaslik','Emir yaz'));
    ic.appendChild(el('div','not','nüfuz ' + Math.floor(W.el.nufuz) + ' · iz ' + GE.izSozu(W.el.ifsa)));
    ic.appendChild(el('hr'));
    const liste = el('div','sec-liste');
    for (const f in GE.FIILLER){
      const g = gruplar[f];
      if (!g || !g.length) continue;
      const F = GE.FIILLER[f];
      const b = el('button');
      b.appendChild(el('span','', F.ad));
      b.appendChild(el('span','yan', 'nüfuz ' + F.nufuz + ' · ' + g.length + ' hedef'));
      if (W.el.nufuz < F.nufuz){ b.disabled = true; b.style.opacity = .3; }
      else b.onclick = () => hedefSec(f, g);
      liste.appendChild(b);
    }
    ic.appendChild(liste);
  });
}

function ifsaSozu(x){ return x < 1.2 ? 'az' : (x < 2.6 ? 'orta' : (x < 4 ? 'çok' : 'pervasız')); }

function hedefSec(fiil, hamleler){
  ortuAc(ic => {
    ic.appendChild(el('h2','dosyaBaslik', GE.FIILLER[fiil].ad));
    ic.appendChild(el('div','not','hedefi seç'));
    ic.appendChild(el('hr'));
    const liste = el('div','sec-liste');
    const sirali = hamleler.slice().sort((a,b)=> (b.etkinlik - a.etkinlik));
    for (const h of sirali.slice(0, 120)){
      const b = el('button');
      const nt = [];
      if (h.etkinlik < 0.92) nt.push('yıpranmış ×' + h.etkinlik.toFixed(2));
      nt.push('iz ' + ifsaSozu(h.ifsa));
      b.appendChild(el('span','', h.etiket));
      b.appendChild(el('span','yan', nt.join(' · ')));
      b.onclick = () => onayla(h);
      liste.appendChild(b);
    }
    ic.appendChild(liste);
  });
}

function onayla(h){
  ortuAc(ic => {
    ic.appendChild(el('h2','dosyaBaslik','Onay'));
    ic.appendChild(el('p','', h.etiket));
    const bd = el('div','bedel');
    bd.innerHTML = 'nüfuz <b>−' + h.nufuz + '</b> &nbsp; · &nbsp; bırakacağı iz <b>' + ifsaSozu(h.ifsa) + '</b>' +
      (h.etkinlik < 0.92 ? ' &nbsp; · &nbsp; etkinlik <b>×' + h.etkinlik.toFixed(2) + '</b> (aynı kaldıraca çok bastın)' : '');
    ic.appendChild(bd);
    const ver = el('button','dugme vurgu','Emri ver');
    ver.onclick = () => {
      const olay = GE.hamleYap(W, h);
      W.olaylar.push(...olay);
      ortuKapat(); kaydet(); ciz();
    };
    ic.appendChild(ver);
  });
}

/* ---------- tur ---------- */
function mevsimGec(){
  if (W.el.bitti) return;
  // Açık dosyanın üstünden sessizce geçilmez: son mevsimde onay ister.
  const son = W.meseleler.filter(m => m.acik && GE.meselePencere(W, m) <= 1);
  if (son.length && !mevsimGec._onaylandi){
    ortuAc(ic => {
      ic.appendChild(el('h2','dosyaBaslik','Son mevsim'));
      ic.appendChild(el('p','', son.length === 1
        ? '“' + son[0].baslik + '” dosyası bu mevsim kapanıyor. Karar vermezsen karar senin yerine verilir.'
        : son.length + ' dosya bu mevsim kapanıyor. Karar vermezsen kararlar senin yerine verilir.'));
      ic.appendChild(el('p','soluk','Beklemek de bir karardır — ama bilerek bekle.'));
      const oku = el('button','dugme','Dosyayı aç');
      oku.onclick = () => { ortuKapat(); dosyaAc(son[0].id); };
      ic.appendChild(oku);
      const gec = el('button','dugme vurgu','Yine de geç');
      gec.style.marginTop = '10px';
      gec.onclick = () => { ortuKapat(); mevsimGec._onaylandi = true; mevsimGec();
                            mevsimGec._onaylandi = false; };
      ic.appendChild(gec);
    });
    return;
  }
  const oncekiAcik = W.meseleler.filter(m => m.acik).length;
  GE.adim(W);
  if (W.olaylar.length > 400) W.olaylar = W.olaylar.slice(-400);
  // yeni dosya geldiyse oyuncuyu masaya çek
  if (W.meseleler.filter(m => m.acik).length > oncekiAcik) aktifCekmece = 'masa';
  kaydet();
  ciz();
  if (W.el.bitti) sonEkrani();
}

function sonEkrani(){
  ortuAc(ic => {
    ic.appendChild(el('h2','dosyaBaslik','Görünüyorsun'));
    ic.appendChild(el('p','', W.el.bitisSebebi === 'ifsa'
      ? 'İzlerin birikti ve artık gizli değilsin. Gizli el kalmadı.'
      : 'İzini sürdüler ve buldular.'));
    ic.appendChild(el('p','soluk', W.tur + ' mevsim dayandın. Doktrinin ' +
      GE.DOKTRINLER[W.el.doktrin].ad + '; dünya sonunda ' +
      Math.round(W.el.hiz) + ' puanla ' + GE.hizSozu(W.el.hiz).toLowerCase() + '.'));
    const yeni = el('button','dugme vurgu','Yeni dünya');
    yeni.onclick = () => { try{ localStorage.removeItem(KAYIT); }catch(e){} location.reload(); };
    ic.appendChild(yeni);
  });
}

/* ---------- çizim ---------- */
function ciz(){
  durumCiz(); cekmeceCiz();
  for (const k of ['masa','harita','kronik','kutuphane']) $('#'+k).hidden = (k !== aktifCekmece);
  if (aktifCekmece === 'masa') masaCiz();
  else if (aktifCekmece === 'harita') haritaCiz();
  else if (aktifCekmece === 'kronik') kronikCiz();
  else kutuphaneCiz();
  const acik = W.meseleler.filter(m => m.acik).length;
  const g = $('#gecBtn');
  g.textContent = acik ? 'Bekle · ' + acik + ' dosya açık' : 'Mevsimi geçir';
  g.classList.toggle('vurgu', !acik);
  g.disabled = !!W.el.bitti;
  $('#emirBtn').disabled = !!W.el.bitti;
}

/* ---------- açılış ---------- */
const SURUM = '2026-09-20-3';

function girisKur(){
  const sv = $('#surum'); if (sv) sv.textContent = 'sürüm ' + SURUM;
  const gs = document.querySelector('#giris .sar');
  gs.insertBefore(el('div','kose sol-ust'), gs.firstChild);
  gs.insertBefore(el('div','kose sag-ust'), gs.firstChild);
  const d = $('#doktrinler');
  for (const k in GE.DOKTRINLER){
    const D = GE.DOKTRINLER[k];
    const b = el('button','dok');
    b.appendChild(el('b','', D.ad));
    b.appendChild(el('span','', D.tarif));
    b.onclick = () => dunyaAra(k);
    d.appendChild(b);
  }
  if (kayitVar()){
    const y = $('#yukleBtn');
    y.style.display = 'block';
    y.onclick = () => { const k = yukle(); if (k){ W = k; basla(); } };
  }
  $('#iceriAlBtn').onclick = () => {
    try { const k = JSON.parse($('#iceriAl').value); if (k && k.fac){ W = k; basla(); } }
    catch(e){ $('#arama').textContent = 'Metin okunamadı.'; }
  };
}

/* ---------- kalıcılık ve güncelleme ---------- */
// Android'de depolama baskısı altında bile veri silinmesin diye kalıcılık iste.
if (navigator.storage && navigator.storage.persist){
  navigator.storage.persisted().then(v => { if (!v) navigator.storage.persist().catch(()=>{}); })
    .catch(()=>{});
}

/* SW-BAS */
if ('serviceWorker' in navigator){
  let yenilendi = false;
  // Yeni işçi devralınca sayfayı bir kez tazele: eski sürümde kalma.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yenilendi) return;
    yenilendi = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').then(r => { r.update().catch(()=>{}); }).catch(()=>{});
}
/* SW-SON */

$('#gecBtn').onclick = mevsimGec;
$('#emirBtn').onclick = emirAc;
girisKur();
