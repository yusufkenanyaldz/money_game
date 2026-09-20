/* VEBA — arayüz. Tek ekran, haftada tek karar, hemen görünen sonuç. */
'use strict';
const $ = s => document.querySelector(s);
const el = (t,c,x) => { const n=document.createElement(t); if(c)n.className=c;
  if(x!==undefined)n.textContent=x; return n; };
const KAYIT = 'veba_kayit_v1';
const SURUM = '2026-09-20-1';

let O = null, sonRapor = [];

/* ---------- kayıt ---------- */
function kaydet(){ try{ localStorage.setItem(KAYIT, JSON.stringify({o:O, r:sonRapor})); }catch(e){} }
function yukle(){ try{ const s=localStorage.getItem(KAYIT); if(!s)return null; return JSON.parse(s);}catch(e){return null;} }
function kayitVar(){ try{ return !!localStorage.getItem(KAYIT); }catch(e){ return false; } }

/* ---------- başlık ---------- */
function ustCiz(){
  const yasayan = Math.round(VEBA.toplamYasayan(O));
  const olen = Math.round(VEBA.toplamOlen(O));
  const top = VEBA.toplamNufus(O);
  $('#takvim').textContent = O.hafta + '. hafta · ' + VEBA.haftaAy(O.hafta);

  const y = $('#yasayan'); y.innerHTML = '';
  y.appendChild(document.createTextNode(yasayan.toLocaleString('tr')));
  y.appendChild(el('small','','yaşayan (başta ' + top.toLocaleString('tr') + ')'));

  const o = $('#olen'); o.innerHTML = '';
  o.appendChild(document.createTextNode(olen.toLocaleString('tr')));
  o.appendChild(el('small','', O.olenBuHafta > 0 ? ('ölen · bu hafta ' + O.olenBuHafta) : 'ölen'));

  const k = $('#kaynak'); k.innerHTML = '';
  const par = (t,u)=>{ const d=el('span',u?'uyari':''); d.innerHTML=t; k.appendChild(d); };
  par('hazine <b>' + O.hazine + '</b>');
  par('tahıl <b>' + O.tahil + '</b> hafta', O.tahil < 90);
  par(O.kapiKapali ? '<b>kapılar kapalı</b>' : 'kapılar açık', O.kapiKapali);

  const c = $('#huzCubuk');
  c.querySelector('i').style.width = Math.round(O.huzursuzluk) + '%';
  c.classList.toggle('tehlike', O.huzursuzluk >= 65);
  const h = O.huzursuzluk;
  $('#huzNot').textContent = 'Halkın hâli: ' +
    (h < 20 ? 'sakin' : h < 40 ? 'tedirgin' : h < 60 ? 'homurdanıyor'
     : h < 78 ? 'öfkeli — dikkat et' : 'isyanın eşiğinde');
  $('#huzNot').className = 'not' + (h >= 65 ? ' uyari' : '');
}

/* ---------- haftanın raporu ---------- */
function raporCiz(){
  const r = $('#rapor'); r.innerHTML = '';
  r.appendChild(el('div','not', O.hafta === 0 ? 'Yıl başlıyor.' : 'Bu hafta'));
  if (!sonRapor.length) r.appendChild(el('div','sat sakin','Kayda değer bir şey olmadı.'));
  for (const s of sonRapor){
    const sinif = ['belirti','uyari','eylem','sakin','ipucu','yer','son'].indexOf(s.tip) >= 0 ? s.tip : '';
    r.appendChild(el('div','sat ' + sinif, s.metin));
  }
}

/* ---------- mahalleler ---------- */
function mahalleCiz(){
  const g = $('#mahalleler'); g.innerHTML = '';
  for (const m of O.mahalleler){
    const n = Math.round(VEBA.nufus(m));
    const d = el('div','mah' + (m.karantina > 0 ? ' kapali' : ''));
    d.appendChild(el('div','ad', m.ad));
    d.appendChild(el('div','olu', m.D >= 1 ? Math.round(m.D) + ' ölü' : ''));
    const alt = el('div','alt');
    const par = (etiket, deger) => { const s = el('span');
      s.appendChild(el('span','etiket', etiket + ' '));
      s.appendChild(document.createTextNode(deger)); alt.appendChild(s); };
    par('yaşayan', n.toLocaleString('tr'));
    // Hasta sayısı gösterilmez: yönetici bunu bilemez. Görünür işaretler var.
    const hasta = m.Ib + m.Ip;
    par('hasta', hasta < 1 ? 'görülmedi' : hasta < 8 ? 'birkaç' : hasta < 25 ? 'çok' : 'her sokakta');
    par('fareler', m.fare < 30 ? 'seyrek' : m.fare < 55 ? 'var' : m.fare < 75 ? 'çok' : 'her yerde');
    par('ambar', m.ambar < 60 ? 'boşaltılmış' : m.ambar < 130 ? 'dolu' : 'ağzına kadar');
    par('halk', m.huzursuzluk < 25 ? 'sakin' : m.huzursuzluk < 50 ? 'tedirgin'
        : m.huzursuzluk < 72 ? 'öfkeli' : 'ayağa kalkmak üzere');
    if (m.karantina > 0) par('', 'KAPALI · ' + m.karantina + ' hafta');
    if (m.hekim > 0) par('', 'hekim var');
    d.appendChild(alt);
    g.appendChild(d);
  }
}

/* ---------- eylemler ---------- */
const HEDEFLI = { karantina:1, ekmek:1, hekim:1, ambar:1 };
function eylemCiz(){
  $('#kararBtn').disabled = !!O.bitti;
}

/* Eylemler sürekli ekranda durmuyordu: şehri gizliyorlardı. Karar bir
   adımın arkasında — önce oku, sonra seç. */
function kararAc(){
  if (O.bitti) return;
  const sira = ['ambar','karantina','ekmek','hekim','cenaze','ayin',
                O.kapiKapali ? 'kapiAc' : 'kapiKapat'];
  ortuAc(ic => {
    ic.appendChild(el('h2','baslik','Bu hafta ne yapacaksın?'));
    ic.appendChild(el('div','not','hazine ' + O.hazine + ' akçe · bir karar, sonra hafta geçer'));
    ic.appendChild(el('hr'));
    for (const ad of sira){
      const E = VEBA.EYLEMLER[ad]; if (!E) continue;
      const b = el('button','ebtn');
      b.appendChild(el('span','', E.ad));
      b.appendChild(el('span','bd', E.bedel > 0 ? E.bedel + ' akçe' : 'bedelsiz'));
      b.appendChild(el('span','tr', E.tarif));
      if (O.hazine < E.bedel) b.disabled = true;
      else b.onclick = () => { ortuKapat(); HEDEFLI[ad] ? hedefSec(ad) : uygula(ad); };
      ic.appendChild(b);
    }
    const bk = el('button','gec','Bu hafta hiçbir şey yapma');
    bk.style.marginTop = '8px';
    bk.onclick = () => { ortuKapat(); ilerle([]); };
    ic.appendChild(bk);
  });
}

function hedefSec(ad){
  const E = VEBA.EYLEMLER[ad];
  ortuAc(ic => {
    ic.appendChild(el('h2','baslik', E.ad));
    ic.appendChild(el('div','not', E.tarif));
    ic.appendChild(el('hr'));
    for (const m of O.mahalleler){
      const b = el('button','ebtn');
      b.appendChild(el('span','', m.ad));
      const hasta = m.Ib + m.Ip;
      b.appendChild(el('span','bd', Math.round(VEBA.nufus(m)).toLocaleString('tr') + ' kişi'));
      b.appendChild(el('span','tr',
        'hasta: ' + (hasta<1?'görülmedi':hasta<8?'birkaç':hasta<25?'çok':'her sokakta') +
        ' · fareler: ' + (m.fare<30?'seyrek':m.fare<55?'var':m.fare<75?'çok':'her yerde') +
        ' · halk: ' + (m.huzursuzluk<25?'sakin':m.huzursuzluk<50?'tedirgin':
                       m.huzursuzluk<72?'öfkeli':'ayağa kalkmak üzere')));
      b.onclick = () => { ortuKapat(); uygula(ad, m.id); };
      ic.appendChild(b);
    }
  });
}

function uygula(ad, hedef){
  const olay = VEBA.eylemYap(O, ad, hedef);
  ilerle(olay);
}

/* ---------- hafta ---------- */
function ilerle(eylemOlay){
  const r = VEBA.hafta(O);
  sonRapor = (eylemOlay || []).concat(r);
  kaydet(); ciz();
  if (O.bitti) sonEkrani();
}

function ciz(){ ustCiz(); raporCiz(); mahalleCiz(); eylemCiz();
  $('#gecBtn').textContent = O.bitti ? 'Yıl bitti' : 'Haftayı geçir';
  $('#gecBtn').disabled = !!O.bitti; }

/* ---------- örtü ---------- */
function ortuAc(doldur){
  const o=$('#ortu'), ic=$('#ortuIc'); ic.innerHTML='';
  const k=el('button','kapat','← Vazgeç'); k.onclick=ortuKapat; ic.appendChild(k);
  doldur(ic); o.hidden=false; o.scrollTop=0; document.body.style.overflow='hidden';
}
function ortuKapat(){ $('#ortu').hidden=true; document.body.style.overflow=''; }

/* Geçmiş raporlar: mevsimsel örüntüyü ancak buraya bakarak fark edersin. */
function kayitlarAc(){
  ortuAc(ic => {
    ic.appendChild(el('h2','baslik','Yılın kayıtları'));
    ic.appendChild(el('div','not','Ölenlerin nasıl öldüğü her hafta yazıldı.'));
    ic.appendChild(el('hr'));
    const g = (O.gunluk||[]).filter(x => x.satirlar.some(s => s.tip === 'belirti'));
    if (!g.length){ ic.appendChild(el('p','not','Henüz kayda geçen bir şey yok.')); return; }
    let sonBelirti = null;
    for (const h of g){
      const b = h.satirlar.find(s => s.tip === 'belirti');
      if (!b || b.metin === sonBelirti) continue;       // aynı satırı tekrarlama
      sonBelirti = b.metin;
      const d = el('div','mah');
      d.appendChild(el('div','ad', h.hafta + '. hafta · ' + VEBA.haftaAy(h.hafta)));
      d.appendChild(el('div','olu',''));
      d.appendChild(el('div','alt', b.metin));
      ic.appendChild(d);
    }
  });
}

/* ---------- son ---------- */
function sonEkrani(){
  const s = VEBA.skor(O);
  ortuAc(ic => {
    ic.querySelector('.kapat').textContent = '← Kapat';
    ic.appendChild(el('h2','baslik',
      O.sonuc === 'isyan' ? 'Şehir ayaklandı' :
      O.sonuc === 'sondu' ? 'Salgın söndü' : 'Yıl bitti'));
    if (O.sonuc === 'isyan')
      ic.appendChild(el('p','','Kapılar kırıldı, sen görevden alındın. ' +
        'Halkın öfkesi salgından önce patladı.'));
    ic.appendChild(el('hr'));
    const sat = (a,b)=>{ const d=el('div','mah');
      d.appendChild(el('div','ad',a)); d.appendChild(el('div','olu',b)); ic.appendChild(d); };
    sat('Başlangıçta', s.toplam.toLocaleString('tr') + ' kişi');
    sat('Hayatta kalan', s.yasayan.toLocaleString('tr') + ' kişi');
    sat('Ölen', s.olen.toLocaleString('tr') + ' kişi');
    sat('Oran', '%' + s.oran + ' yaşadı');
    ic.appendChild(el('hr'));
    ic.appendChild(el('div','not','Karşılaştırma'));
    ic.appendChild(el('p','','Hiç müdahale etmeyen bir yönetici ortalama <b>%28</b> ile çıkar. ' +
      'Sezgiyle oynayan <b>%34</b>. Hastalığın gerçekten nasıl yayıldığını bilen <b>%57</b>.'));
    ic.appendChild(el('p','not','Bu yılın kayıtlarına bakmak istersen: ölenlerin nasıl öldüğü ' +
      'her hafta yazıldı. Hangi mevsimde hangi belirti vardı?'));
    const b = el('button','gec','Yeni bir yıl');
    b.style.marginTop = '16px';
    b.onclick = () => { try{localStorage.removeItem(KAYIT);}catch(e){} location.reload(); };
    ic.appendChild(b);
  });
}

/* ---------- açılış ---------- */
function basla(kayit){
  if (kayit){ O = kayit.o; sonRapor = kayit.r || []; }
  else { O = VEBA.sehirKur((Date.now() ^ (Math.random()*1e9)) >>> 0); sonRapor = []; }
  $('#giris').hidden = true;
  kaydet(); ciz();
}

$('#surum').textContent = 'sürüm ' + SURUM;
$('#baslaBtn').onclick = () => basla(null);
if (kayitVar()){
  const d = $('#devamBtn'); d.style.display = 'block';
  d.onclick = () => { const k = yukle(); if (k && k.o) basla(k); };
}
$('#gecBtn').onclick = () => ilerle([]);
$('#kararBtn').onclick = kararAc;
$('#kayitBtn').onclick = kayitlarAc;
/* SW-BAS */
if ('serviceWorker' in navigator){
  let yenilendi = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yenilendi) return; yenilendi = true; location.reload();
  });
  navigator.serviceWorker.register('sw.js').then(r=>{ r.update().catch(()=>{}); }).catch(()=>{});
}
/* SW-SON */

if (navigator.storage && navigator.storage.persist)
  navigator.storage.persisted().then(v=>{ if(!v) navigator.storage.persist().catch(()=>{}); }).catch(()=>{});
