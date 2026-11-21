'use strict';
/* =========================================================
   SEYR — Emanetler, seviye, güçler, Yıldız Defteri
   Her şey sadece bu cihazda saklanır (localStorage).
   ========================================================= */
(function(){
const KEY='seyr_v1';
// birim → "dakika karşılığı" (1 dk = 1 tecrübe). Okuma ölçüsü: 10 sayfa = 30 dk.
const EMANET=[
  {id:'kandil', ad:'Ezel Kandili',          gizli:'Kur\'an okumak',          birim:'sayfa', dk:3,   guc:{kut:.5,hikmet:.5}, adim:[1,5,10]},
  {id:'kalem',  ad:'Lokman\'ın Kalemi',      gizli:'Kitap okumak',           birim:'sayfa', dk:3,   guc:{hikmet:1},        adim:[5,10,20]},
  {id:'kabuk',  ad:'Yedi Deniz Kabuğu',      gizli:'Kitap dinlemek',         birim:'dakika',dk:1,   guc:{hikmet:1},        adim:[10,30,60]},
  {id:'gevher', ad:'Sonsuz Gevher Dizisi',   gizli:'Zikir',                  birim:'adet',  dk:.015,guc:{kut:1},           adim:[33,100,1000], zikirmatik:true},
  {id:'seher',  ad:'Seher Halkası',          gizli:'Namaz sonrası tesbihat', birim:'vakit', dk:10,  guc:{kut:1},           adim:[1], gunluk:5},
  {id:'nal',    ad:'Tozkoparan Nalı',        gizli:'Yürüyüş',                birim:'dakika',dk:1,   guc:{alp:1},           adim:[10,30,60]},
];
// Yıldız Defteri: her akşam sorulan dört emanet
const AHLAK=[
  {id:'ayna',  ad:'İskender\'in Aynası',   gizli:'Yalan söylememek',   soru:'İskender\'in Aynası bugün buğulandı mı?', canavar:'Bin Yüzlü Gulyabani'},
  {id:'muhur', ad:'Sessiz Ejder Mührü',    gizli:'Az ve öz konuşmak',  soru:'Sessiz Ejder Mührü bugün çözüldü mü?',    canavar:'Yedi Dilli Yılan'},
  {id:'yanki', ad:'Kaf Dağı Yankısı',      gizli:'Dinlemek',           soru:'Kaf Dağı Yankısı bugün sustu mu?',         canavar:'Ateş İfriti'},
  {id:'su',    ad:'Âb-ı Hayat Damlası',    gizli:'Sakin kalmak',       soru:'Âb-ı Hayat Damlası bugün dalgalandı mı?',  canavar:'Kızıl Dev'},
];
const AHLAK_DK=20;
const ADIM_DK=100;   /* adım ölçüsü: 100 adım = 1 dakika yürüyüş */
const UNVAN=['Garip','Yolcu','Er','Alp','Bahadır','Ulu','Bilge','Kutlu','Nurlu','Simurg'];
const GUC={kut:'Kut',hikmet:'Hikmet',alp:'Alp',cevher:'Cevher'};

// seviye eğrisi: L. seviyeye toplam gereken tecrübe = 25·(L−1)^1.75 → ~240 tecrübe/gün ile 100. seviye yaklaşık bir yıl
const need=L=>L<=1?0:25*Math.pow(L-1,1.75);
function levelOf(xp){let L=1;while(L<100&&xp>=need(L+1))L++;return L;}

/* ---------- KAYIT ---------- */
let D;
try{D=JSON.parse(localStorage.getItem(KEY));}catch(e){}
if(!D||typeof D!=='object')D={gun:{},defter:{},cig:{},ilk:Date.now()};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}};
const bugun=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const gun=k=>D.gun[k]||(D.gun[k]={});

/* ---------- HESAP ---------- */
// devamlılık: amel girilen her gün +%2 (en çok +%50); boş gün seriyi silmez, yarıya indirir
function seri(){const ks=Object.keys(D.gun).filter(k=>Object.values(D.gun[k]).some(v=>v>0)).sort();
  let s=0,prev=null;for(const k of ks){if(prev){const fark=Math.round((new Date(k)-new Date(prev))/864e5);for(let i=1;i<fark;i++)s=Math.floor(s/2);}s++;prev=k;}
  const son=prev?Math.round((new Date(bugun())-new Date(prev))/864e5):0;for(let i=1;i<son;i++)s=Math.floor(s/2);return s;}
function hesap(){
  const g={kut:0,hikmet:0,alp:0,cevher:0};let xp=0;
  const ks=Object.keys(D.gun).sort();let s=0,prev=null;
  for(const k of [...new Set([...ks,...Object.keys(D.defter)])].sort()){
    const v=D.gun[k]||{},has=Object.values(v).some(x=>x>0);
    if(has){if(prev){const f=Math.round((new Date(k)-new Date(prev))/864e5);for(let i=1;i<f;i++)s=Math.floor(s/2);}s++;prev=k;}
    const carp=1+Math.min(.5,s*.02);
    for(const e of EMANET){const n=v[e.id]||0;const dk=(n+(e.id==='nal'?(v.adimSay||0)/ADIM_DK:0))*e.dk*carp;if(!dk)continue;xp+=dk;for(const gg in e.guc)g[gg]+=dk*e.guc[gg];}
    const df=D.defter[k]||{};
    // dürüstlük ilkesi: korunsa da kusur itiraf edilse de aynı tecrübe; itiraf ayrıca Seher Çiyi verir
    for(const a of AHLAK)if(df[a.id]){xp+=AHLAK_DK*carp;g.cevher+=AHLAK_DK*carp;}
  }
  const L=levelOf(xp);
  return{xp,L,unvan:UNVAN[Math.min(9,Math.floor((L-1)/10))],g,seri:seri(),
    simdiki:xp-need(L),sonraki:L>=100?1:need(L+1)-need(L)};
}

/* ---------- ARAYÜZ ---------- */
const css=`
#dfBtn{position:fixed;top:calc(10px + env(safe-area-inset-top));right:calc(60px + env(safe-area-inset-right));height:38px;padding:0 14px;border-radius:19px;border:1px solid rgba(201,162,74,.8);background:rgba(20,33,61,.7);color:#f3e6c4;font:inherit;font-size:13px;letter-spacing:.15em;z-index:5}
#lvBar{position:fixed;top:calc(52px + env(safe-area-inset-top));left:calc(14px + env(safe-area-inset-left));width:min(220px,30vw);height:5px;border-radius:3px;background:rgba(20,33,61,.6);border:1px solid rgba(201,162,74,.5);overflow:hidden}
#lvBar i{display:block;height:100%;background:linear-gradient(90deg,#c9a24a,#f6e2a4);width:0;transition:width .4s}
#df{position:fixed;inset:0;z-index:20;display:none;background:radial-gradient(ellipse at 50% 20%,#1d3461,#0d1730 75%);color:#f3e6c4;font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  padding:calc(10px + env(safe-area-inset-top)) calc(14px + env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) calc(14px + env(safe-area-inset-left));overflow:hidden}
#df.on{display:flex;flex-direction:column}
#df .ust{display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(201,162,74,.4);padding-bottom:8px}
#df .ust h2{font-weight:400;letter-spacing:.3em;font-size:18px;color:#e8cf8a}
#df .ust .bilgi{flex:1;font-size:13px;color:#d9c79a;font-style:italic}
#df .ust button,#df .sek button{font:inherit;color:#f3e6c4;background:rgba(20,33,61,.7);border:1px solid rgba(201,162,74,.6);border-radius:4px;padding:6px 12px;font-size:13px}
#df .sek{display:flex;gap:6px;margin:8px 0}
#df .sek button.on{background:linear-gradient(180deg,#2a4a82,#1d3461);border-color:#e8cf8a}
#df .govde{flex:1;overflow-y:auto;overscroll-behavior:contain}
.dfs{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid rgba(201,162,74,.15)}
.dfs .ad{flex:1;min-width:0}.dfs .ad b{display:block;font-weight:400;font-size:15px}.dfs .ad small{color:#b9a77c;font-style:italic;font-size:12px}
.dfs .say{min-width:62px;text-align:center;font-size:18px;color:#e8cf8a}
.dfs button{font:inherit;min-width:44px;height:36px;color:#f3e6c4;background:rgba(29,52,97,.8);border:1px solid rgba(201,162,74,.55);border-radius:4px;font-size:13px}
.dfs button.ana{background:linear-gradient(180deg,#2a4a82,#1d3461);border-color:#e8cf8a}
.soru{padding:12px 4px;border-bottom:1px solid rgba(201,162,74,.15)}.soru p{font-size:15px;margin-bottom:8px}
.soru .ik{display:flex;gap:8px}.soru button{flex:1;font:inherit;padding:9px;color:#f3e6c4;background:rgba(29,52,97,.7);border:1px solid rgba(201,162,74,.45);border-radius:4px}
.soru button.on{background:linear-gradient(180deg,#2a4a82,#1d3461);border-color:#e8cf8a}
.not{font-size:12.5px;font-style:italic;color:#b9a77c;line-height:1.5;padding:10px 4px}
.guc{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;padding:8px 0}
.guc div{border:1px solid rgba(201,162,74,.4);border-radius:6px;padding:10px;background:rgba(20,33,61,.5)}.guc b{display:block;font-weight:400;font-size:22px;color:#e8cf8a}
.gunsec{display:flex;gap:6px;padding:6px 0 4px}.gunsec button{font:inherit;font-size:12.5px;color:#f3e6c4;background:rgba(20,33,61,.6);border:1px solid rgba(201,162,74,.45);border-radius:14px;padding:5px 12px}
.gunsec button.on{background:linear-gradient(180deg,#2a4a82,#1d3461);border-color:#e8cf8a}
.yedek{margin-top:10px;border-top:1px solid rgba(201,162,74,.35);padding-top:10px}.yedek b{font-weight:400;letter-spacing:.3em;color:#e8cf8a;font-size:13px}
.yedek .ik{display:flex;gap:8px;margin:6px 0}.yedek button{flex:1;font:inherit;padding:9px;color:#f3e6c4;background:rgba(29,52,97,.8);border:1px solid rgba(201,162,74,.55);border-radius:4px}
.yedek textarea{width:100%;font:12px monospace;color:#f3e6c4;background:rgba(8,14,30,.7);border:1px solid rgba(201,162,74,.4);border-radius:4px;padding:8px;resize:none}
#zm{position:fixed;inset:0;z-index:30;display:none;place-items:center;background:rgba(8,14,30,.94)}
#zm.on{display:grid}
#zm .daire{width:min(56vh,56vw);height:min(56vh,56vw);border-radius:50%;border:3px double #c9a24a;display:grid;place-items:center;text-align:center;
  background:radial-gradient(circle,#1d3461,#0d1730);box-shadow:0 0 40px rgba(201,162,74,.25);touch-action:manipulation}
#zm .daire b{display:block;font-size:min(14vh,14vw);font-weight:400;color:#f6e2a4}#zm .daire small{color:#b9a77c;letter-spacing:.2em}
#zm .kapat{position:fixed;top:calc(14px + env(safe-area-inset-top));right:calc(14px + env(safe-area-inset-right));font:inherit;color:#f3e6c4;background:rgba(20,33,61,.8);border:1px solid #c9a24a;border-radius:4px;padding:8px 14px}
#seviyeAtla{position:fixed;left:0;right:0;top:30%;text-align:center;z-index:25;pointer-events:none;opacity:0;transition:opacity .5s;color:#f6e2a4;text-shadow:0 2px 10px #000}
#seviyeAtla.on{opacity:1}#seviyeAtla b{display:block;font-size:34px;font-weight:400;letter-spacing:.3em}`;
document.head.insertAdjacentHTML('beforeend','<style>'+css+'</style>');
document.body.insertAdjacentHTML('beforeend',`
<button id="dfBtn">DEFTER</button><div id="lvBar"><i></i></div>
<div id="df"><div class="ust"><h2 id="dfBaslik">DEFTER</h2><span class="bilgi" id="dfBilgi"></span><button id="dfKapat">Kapat</button></div>
<div class="sek"><button data-s="bugun" class="on">Bugün</button><button data-s="yildiz">Yıldız Defteri</button><button data-s="guc">Güçler</button></div>
<div class="govde" id="dfGovde"></div></div>
<div id="zm"><button class="kapat" id="zmKapat">Tamam</button><div class="daire" id="zmDaire"><div><b id="zmSay">0</b><small id="zmAlt">GEVHER</small></div></div></div>
<div id="seviyeAtla"><b id="saL"></b><span id="saU"></span></div>`);
const $=s=>document.querySelector(s);
let sek='bugun',anahtar=false,sonL=hesap().L,geri=0;      // geri: 0 bugün, 1 dün, 2 evvelki gün
const secili=()=>{const d=new Date();d.setDate(d.getDate()-geri);return bugun(d);};
const GUNAD=['Bugün','Dün','Evvelki gün'];
function gunSecici(){return `<div class="gunsec">${GUNAD.map((a,i)=>`<button data-g="${i}" class="${i===geri?'on':''}">${a}</button>`).join('')}</div>`;}

function ust(){const h=hesap();
  $('#hud').innerHTML=`${h.unvan.toLocaleUpperCase('tr-TR')} · ${h.L}<small>seri ${h.seri} gün${h.seri?` · +%${Math.round(Math.min(.5,h.seri*.02)*100)}`:''}</small>`;
  $('#lvBar i').style.width=(h.L>=100?100:h.simdiki/h.sonraki*100)+'%';
  $('#dfBilgi').textContent=`${h.unvan} · ${h.L}. makam · ${Math.floor(h.simdiki)} / ${Math.floor(h.sonraki)}`;
  if(h.L>sonL){$('#saL').textContent=h.L+'. MAKAM';$('#saU').textContent=h.unvan;const e=$('#seviyeAtla');e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2600);
    if(window.__oyun)window.__oyun.seviye(h.L);}
  sonL=h.L;if(window.__oyun)window.__oyun.guc(h);}
function ekle(id,n){if(n>0&&window.SES)SES.amel();const g=gun(secili());g[id]=Math.max(0,(g[id]||0)+n);save();ciz();ust();}
function ciz(){const G=$('#dfGovde'),g=gun(secili());G.innerHTML='';
  if(sek!=='guc'){G.insertAdjacentHTML('beforeend',gunSecici());G.querySelectorAll('.gunsec button').forEach(b=>b.onclick=()=>{geri=+b.dataset.g;ciz();});}
  if(sek==='bugun'){
    for(const e of EMANET){const d=document.createElement('div');d.className='dfs';const n=g[e.id]||0;
      d.innerHTML=`<div class="ad"><b>${e.ad}</b><small>${anahtar?e.gizli+' · ':''}${e.birim}${e.id==='nal'?adimYazi(g):''}</small></div>
        <button data-n="-${e.adim[0]}">−</button><span class="say">${n}${e.gunluk?' / '+e.gunluk:''}</span>`+
        e.adim.map((a,i)=>`<button data-n="${a}" class="${i===e.adim.length-1?'ana':''}">+${a}</button>`).join('')+(e.zikirmatik?'<button data-z="1" class="ana">◎</button>':'');
      d.querySelectorAll('button[data-n]').forEach(b=>b.onclick=()=>{let v=+b.dataset.n;if(e.gunluk)v=Math.min(v,e.gunluk-(g[e.id]||0));ekle(e.id,v);});
      const z=d.querySelector('[data-z]');if(z)z.onclick=()=>zikirmatik(e);
      const iz=d.querySelector('[data-izin]');if(iz)iz.onclick=()=>{try{SeyrAndroid.izinIste();}catch(x){}};
      G.appendChild(d);}
    G.insertAdjacentHTML('beforeend','<p class="not">Ölçü: 10 sayfa okuma = 30 dakika, 100 adım = 1 dakika. Her gün az da olsa bir şey girmek seriyi büyütür; boş geçen gün seriyi silmez, yarıya indirir.</p>');
  }else if(sek==='yildiz'){
    const df=D.defter[secili()]||(D.defter[secili()]={});
    for(const a of AHLAK){const d=document.createElement('div');d.className='soru';const v=df[a.id];
      d.innerHTML=`<p>${a.soru}${anahtar?` <small style="color:#b9a77c">(${a.gizli})</small>`:''}</p><div class="ik"><button data-v="k" class="${v==='k'?'on':''}">Hayır, sağlam kaldı</button><button data-v="i" class="${v==='i'?'on':''}">Evet, itiraf ediyorum</button></div>`;
      d.querySelectorAll('button').forEach(b=>b.onclick=()=>{const eski=df[a.id];df[a.id]=b.dataset.v;
        if(b.dataset.v==='i'&&eski!=='i')D.cig[a.id]=(D.cig[a.id]||0)+1;if(eski==='i'&&b.dataset.v!=='i')D.cig[a.id]=Math.max(0,(D.cig[a.id]||1)-1);save();ciz();ust();});
      G.appendChild(d);}
    G.insertAdjacentHTML('beforeend',`<p class="not">İki cevap da aynı ölçüde güç verir. İtiraf edilen her kusur ayrıca bir <b>Seher Çiyi</b> bırakır; o çiy, aynı kusurun canavarına karşı seni güçlendirir. Yıldızlara karşı dürüst olan kaybetmez.</p>`);
  }else{
    const h=hesap();
    G.insertAdjacentHTML('beforeend',`<div class="guc">${Object.keys(GUC).map(k=>`<div><small>${GUC[k].toLocaleUpperCase('tr-TR')}</small><b>${Math.floor(h.g[k])}</b></div>`).join('')}</div>`);
    const c=AHLAK.filter(a=>D.cig[a.id]).map(a=>`${a.ad}: ${D.cig[a.id]} çiy → ${a.canavar}`).join('<br>');
    G.insertAdjacentHTML('beforeend',`<p class="not">Seher Çiyi<br>${c||'Henüz yok.'}</p><p class="not">Toplam tecrübe: ${Math.floor(h.xp)} · Seri: ${h.seri} gün</p>`);
    G.insertAdjacentHTML('beforeend',`<div class="yedek"><b>YEDEK</b>
      <p class="not">Bütün kayıtların yalnızca bu telefonda. Ara sıra yedek kodunu kopyalayıp güvenli bir yere (Notlar, kendine mesaj) yapıştır. Telefon değişirse ya da uygulama silinirse bu kodla geri dönersin.</p>
      <div class="ik"><button id="ykAl">Yedek kodunu kopyala</button><button id="ykYukle">Yedekten geri yükle</button></div>
      <textarea id="ykAlan" rows="3" placeholder="Geri yüklemek için yedek kodunu buraya yapıştır" spellcheck="false"></textarea><p class="not" id="ykDurum"></p></div>`);
    $('#ykAl').onclick=yedekAl;$('#ykYukle').onclick=yedekYukle;
    /* Görünüm önizleme (geçici, deneme için): seviyeye gelmeden sonraki görünümü oyunda dene */
    const ak=window.__oyun?__oyun.kar:'garip',secim=window.__onizleme||'';
    G.insertAdjacentHTML('beforeend',`<div class="yedek"><b>GÖRÜNÜM ÖNİZLEME</b>
      <p class="not">Deneme içindir; kayda ve seviyeye dokunmaz. Şu an: ${ak==='yolcu'?'Yolcu':'Garip'}.</p>
      <div class="ik"><button data-gr="" class="${secim===''?'on':''}">Seviyeye göre</button><button data-gr="garip" class="${secim==='garip'?'on':''}">Garip</button><button data-gr="yolcu" class="${secim==='yolcu'?'on':''}">Yolcu</button></div></div>`);
    G.querySelectorAll('[data-gr]').forEach(b=>b.onclick=()=>{window.__onizleme=b.dataset.gr;if(window.__oyun)__oyun.gorunum(b.dataset.gr||null);ciz();});
  }
}
function zikirmatik(e){const z=$('#zm');let n=0;$('#zmSay').textContent='0';$('#zmAlt').textContent=e.ad.toLocaleUpperCase('tr-TR');z.classList.add('on');
  $('#zmDaire').onpointerdown=ev=>{ev.preventDefault();n++;$('#zmSay').textContent=n;if(window.SES)SES.tesbih(n);try{navigator.vibrate&&navigator.vibrate(n%33===0?60:8);}catch(x){}};
  $('#zmKapat').onclick=()=>{z.classList.remove('on');if(n)ekle(e.id,n);};}
$('#dfBtn').onclick=()=>{$('#df').classList.add('on');ciz();ust();if(window.__oyun)window.__oyun.durdur(true);};
$('#dfKapat').onclick=()=>{$('#df').classList.remove('on');anahtar=false;if(window.__oyun)window.__oyun.durdur(false);};
document.querySelectorAll('#df .sek button').forEach(b=>b.onclick=()=>{sek=b.dataset.s;document.querySelectorAll('#df .sek button').forEach(x=>x.classList.toggle('on',x===b));ciz();});
// gizli anahtar: başlığa 1,5 sn bas
{let t=null;const h=$('#dfBaslik');h.addEventListener('pointerdown',()=>{t=setTimeout(()=>{anahtar=!anahtar;ciz();try{navigator.vibrate&&navigator.vibrate(30);}catch(x){}},1500);});
 for(const ev of['pointerup','pointerleave','pointercancel'])h.addEventListener(ev,()=>clearTimeout(t));}
/* ---------- ADIM SENSÖRÜ ----------
   Android kabuğu telefonun adım sayacını verir (telefon açıldığından beri toplam adım).
   Son okumadan bu yana atılan adımlar bugünün Tozkoparan Nalı'na yazılır.
   Sayaç küçülürse ya da açılış anı değişirse telefon yeniden başlamıştır: o zaman sayacın tamamı yeni adımdır. */
let adimDurum=window.SeyrAndroid?'bekle':'';
function adimYazi(g){const a=g.adimSay||0;
  let t=a?` · ${a} adım (${Math.floor(a/ADIM_DK)} dk)`:'';
  if(geri===0&&adimDurum==='izin')t+=' <button data-izin="1" class="ana" style="margin-left:6px">Adım izni ver</button>';
  else if(geri===0&&adimDurum==='yok')t+=' · adım sensörü yok';
  else if(geri===0&&adimDurum==='acik'&&!a)t+=' · adımlar sayılıyor';
  return t;}
function adimSensor(v,boot,durum){
  const eski=adimDurum;if(durum)adimDurum=durum;
  v=+v;boot=+boot;
  if(!(v>=0)){if(eski!==adimDurum&&$('#df').classList.contains('on'))ciz();return;}
  const A=D.adim;
  if(!A){D.adim={son:v,boot};save();if($('#df').classList.contains('on'))ciz();return;}  /* ilk okuma: yalnızca başlangıç noktası */
  const yeniden=Math.abs(boot-A.boot)>10*60e3||v<A.son;
  const fark=yeniden?v:v-A.son;
  A.son=v;A.boot=boot;
  if(fark>0){const g=gun(bugun());g.adimSay=(g.adimSay||0)+fark;}
  save();
  if(fark>0||eski!==adimDurum){ust();if($('#df').classList.contains('on')&&sek==='bugun')ciz();}
}
window.SeyrAdim={sensor:adimSensor};
if(window.SeyrAndroid){try{const p=String(SeyrAndroid.adim()).split(',');adimSensor(p[0],p[1],p[2]);}catch(e){}}

/* ---------- YEDEK ---------- */
const IMZA='SEYR1:';
function kodla(o){const j=JSON.stringify(o);return IMZA+btoa(unescape(encodeURIComponent(j)));}
function coz(k){k=(k||'').replace(/\s+/g,'');if(!k.startsWith(IMZA))throw new Error('imza');return JSON.parse(decodeURIComponent(escape(atob(k.slice(IMZA.length)))));}
function yedekAl(){const k=kodla({surum:1,tarih:new Date().toISOString(),D});const a=$('#ykAlan');a.value=k;a.focus();a.select();
  let tamam=false;try{tamam=document.execCommand('copy');}catch(e){}
  if(!tamam&&navigator.clipboard)navigator.clipboard.writeText(k).then(()=>durum('Kopyalandı. Şimdi güvenli bir yere yapıştır.')).catch(()=>durum('Kod aşağıda seçili; uzun basıp kopyala.'));
  else durum(tamam?'Kopyalandı. Şimdi güvenli bir yere yapıştır.':'Kod aşağıda seçili; uzun basıp kopyala.');
  D.sonYedek=Date.now();save();}
function yedekYukle(){let o;try{o=coz($('#ykAlan').value);}catch(e){durum('Bu bir Seyr yedek kodu değil ya da eksik kopyalanmış.');return;}
  const Y=o.D||{};if(!Y.gun||!Y.defter){durum('Yedek kodu bozuk görünüyor.');return;}
  const gunSay=Object.keys(Y.gun).length;
  if(!confirm(`Bu yedek ${new Date(o.tarih).toLocaleDateString('tr-TR')} tarihli ve ${gunSay} günlük kayıt içeriyor.\nŞu anki kayıtların bu yedekle DEĞİŞTİRİLECEK. Devam edilsin mi?`))return;
  const adimNokta=D.adim;for(const k of Object.keys(D))delete D[k];Object.assign(D,Y);if(adimNokta)D.adim=adimNokta;else delete D.adim;save();sonL=hesap().L;durum('Yedek geri yüklendi.');ust();setTimeout(ciz,1200);}
function durum(t){const e=$('#ykDurum');if(e)e.textContent=t;}
window.__defter={hesap,ekle,D,need,levelOf,kodla,coz};
ust();
})();
