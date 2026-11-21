'use strict';
/* =========================================================
   SEYR — Savaş altyapısı
   Oyuncu canı, düşman yapay zekâsı (yaklaş → hazırlan → saldır → dinlen),
   darbe alma, kaçınmada dokunulmazlık, ölüm/yeniden doğma, dalgalar.
   Düşmanlar şimdilik kodla çizilen gölgeler; görselleri gelince sadece çizim değişir.
   ========================================================= */
const SAVAS=(()=>{
// tür tanımları — "zayif": Seher Çiyi'nin işe yaradığı Yıldız Defteri emaneti
const TUR={
  golge:{ad:'Gölge',     can:6,  hasar:7,  hiz:120, menzil:95,  hazir:.65, boy:.34, renk:'#2a2236', goz:'#e8cf8a', ara:[.9,1.6], tecrube:2},
  kizildev:{ad:'Kızıl Dev',can:22,hasar:22,hiz:80,  menzil:150, hazir:.9,  boy:.52, renk:'#6b1d14', goz:'#ffb347', ara:[1.2,2],  tecrube:15, zayif:'su', patron:true},
};
const E=[];             // düşmanlar
const yazi=[];          // hasar sayıları
let dalga=0,sonrakiX=900,olu=0,mesaj=null;
P.hp=P.maxhp=100;P.inv=0;P.hurtT=0;

function maxCan(){const h=window.__defter?__defter.hesap():{L:1,g:{cevher:0}};return Math.round(80+h.L*4+h.g.cevher/40);}
function cig(z){try{return (__defter.D.cig[z]||0);}catch(e){return 0;}}

function dog(tur,x,y){const T=TUR[tur];E.push({tur,T,x,y,can:T.can*(1+dalga*.08),max:T.can*(1+dalga*.08),durum:'yaklas',t:0,yon:-1,kx:0,isabet:false,
  bekle:T.ara[0]+Math.random()*(T.ara[1]-T.ara[0]),flas:0,sars:0,sal:Math.random()*6});}
function yeniDalga(){dalga++;const patron=dalga%5===0,n=patron?1:Math.min(4,1+Math.ceil(dalga/2));
  for(let i=0;i<n;i++)dog('golge',P.x+W*.75+i*90,clamp(.2+Math.random()*.6,0,1));
  if(patron)dog('kizildev',P.x+W*.9,.55);
  mesaj={t:2.2,s:patron?'KIZIL DEV YAKLAŞIYOR':dalga+'. SINAMA'};window.SES&&SES.dalga(patron);}

/* oyuncunun yumruğu isabet anında çağrılır */
function vurus(){for(const e of E){if(e.durum==='ol')continue;const dx=(e.x-P.x)*P.face,dy=Math.abs(e.y-P.y);
    if(dx>10&&dx<(window.MENZIL||170)&&dy<.2){let h=GUCLU.dmg*(1+.25*(e.T.zayif?cig(e.T.zayif):0));
      e.can-=h;e.flas=.15;e.kx=P.face*260;yazi.push({x:e.x,y:e.y,h:H*e.T.boy*scaleAt(e.y),s:'−'+(Math.round(h*10)/10),t:.8,c:'#f6e2a4'});
      for(let i=0;i<10;i++)parts.push({x:e.x,gy:e.y,h:rnd(60,140),vx:P.face*rnd(60,240),vh:rnd(40,220),l:rnd(.3,.6),c:Math.random()<.5?'#6b5a8a':'#2a2236'});
      if(e.can<=0){e.durum='ol';e.t=0;window.SES&&SES.olum(!!e.T.patron);if(E.every(x=>x.durum==='ol'))setTimeout(()=>window.ZAFER&&ZAFER(),350);}else window.SES&&SES.isabet(!!e.T.patron);
      if(e.durum==='ol'){}
      // sendeleme kuralı: hazırlanan/saldıran ve patron sendelemez; sendeledikten sonra 1,2 sn bağışık
      else if(!e.T.patron&&e.durum!=='hazir'&&e.durum!=='saldir'&&e.sars<=0){e.durum='darbe';e.t=0;e.sars=1.2;}
      else e.kx*=.25;}}}

function oyuncuVuruldu(e){
  if(P.inv>0||P.hurtT>0)return;
  if(P.st==='kacin'&&P.act>.12){yazi.push({x:P.x,y:P.y,h:H*.42,s:'kaçtın',t:.7,c:'#a9cfe0'});window.SES&&SES.kacti();return;}   // kaçınma = dokunulmazlık
  P.hp-=e.T.hasar*(1+dalga*.05);P.hurtT=.35;P.inv=.6;P.vx=-P.face*0+Math.sign(P.x-e.x)*260;P.act=0;
  yazi.push({x:P.x,y:P.y,h:H*.42,s:'−'+Math.round(e.T.hasar*(1+dalga*.05)),t:.8,c:'#e05a4a'});window.SES&&SES.yara();
  try{navigator.vibrate&&navigator.vibrate(40);}catch(x){}
  if(P.hp<=0){P.hp=0;olu=3;window.SES&&SES.dustu();mesaj={t:3,s:'DÜŞTÜN — yol yeniden açılıyor'};}
}

function update(dt){
  P.maxhp=maxCan();if(olu>0){olu-=dt;if(olu<=0){P.hp=P.maxhp;E.length=0;P.inv=1.5;dalga=Math.max(0,dalga-1);sonrakiX=P.x+500;}return;}
  P.inv=Math.max(0,P.inv-dt);if(P.hurtT>0)P.hurtT-=dt;
  P.hp=Math.min(P.maxhp,P.hp+dt*1.2);                      // yavaş iyileşme
  if(E.every(e=>e.durum==='ol')&&P.x>sonrakiX){yeniDalga();sonrakiX=P.x+700;}
  for(let i=E.length-1;i>=0;i--){const e=E[i],T=e.T;e.t+=dt;e.flas=Math.max(0,e.flas-dt);e.sars-=dt;e.sal+=dt;
    e.x+=e.kx*dt;e.kx*=Math.pow(.01,dt);
    const dx=P.x-e.x,dy=P.y-e.y,ux=Math.abs(dx);
    if(e.durum!=='ol'&&e.durum!=='saldir')e.yon=dx>0?1:-1;
    if(e.durum==='yaklas'){
      if(ux>T.menzil*.9){e.x+=Math.sign(dx)*T.hiz*dt;}else if(ux<T.menzil*.5)e.x-=Math.sign(dx)*T.hiz*.5*dt;
      e.y+=clamp(dy,-1,1)*.4*dt;
      // sıra kuralı: aynı anda tek düşman saldırır (patron her zaman sırasını alabilir)
      const sira=E.filter(o=>o!==e&&(o.durum==='hazir'||o.durum==='saldir')).length;
      e.bekle-=dt;if(ux<T.menzil*1.1&&Math.abs(dy)<.15&&e.bekle<=0&&(sira===0||T.patron)){e.durum='hazir';e.t=0;window.SES&&SES.hazir(!!T.patron);}
    }else if(e.durum==='hazir'){if(e.t>=T.hazir){e.durum='saldir';e.t=0;e.isabet=false;window.SES&&SES.saldir(!!T.patron);}}
    else if(e.durum==='saldir'){e.x+=e.yon*T.hiz*2.4*dt*(e.t<.22?1:0);
      if(!e.isabet&&e.t>.12){e.isabet=true;if(Math.abs(P.x-e.x)<T.menzil*1.15&&Math.abs(P.y-e.y)<.16)oyuncuVuruldu(e);}
      if(e.t>.4){e.durum='dinlen';e.t=0;}}
    else if(e.durum==='dinlen'){e.x-=e.yon*T.hiz*.35*dt;if(e.t>.5){e.durum='yaklas';e.bekle=T.ara[0]+Math.random()*(T.ara[1]-T.ara[0]);}}
    else if(e.durum==='darbe'){if(e.t>.3){e.durum='yaklas';e.bekle=Math.max(e.bekle,.4);}}
    else if(e.durum==='ol'&&e.t>1)E.splice(i,1);
  }
  for(let i=yazi.length-1;i>=0;i--){yazi[i].t-=dt;yazi[i].h+=40*dt;if(yazi[i].t<=0)yazi.splice(i,1);}
  if(mesaj){mesaj.t-=dt;if(mesaj.t<=0)mesaj=null;}
}

/* gölge çizimi: mürekkep lekesi gövde, parlayan gözler; durumuna göre eğilir/uzanır */
function ciz(e){const s=scaleAt(e.y),h=H*e.T.boy*s,x=e.x-camX+W/2,y=yScr(e.y),T=e.T;
  let a=1,lean=0,stretch=1;
  if(e.durum==='hazir'){lean=-.18*Math.min(1,e.t/T.hazir);stretch=1-.08*Math.min(1,e.t/T.hazir);}
  if(e.durum==='saldir'){lean=.3;stretch=1.08;}
  if(e.durum==='darbe')lean=-.25;
  if(e.durum==='ol'){a=Math.max(0,1-e.t);stretch=1-e.t*.5;}
  ctx.save();ctx.globalAlpha=a;
  ctx.fillStyle='rgba(30,20,10,.3)';ctx.beginPath();ctx.ellipse(x,y,h*.24,h*.04,0,0,7);ctx.fill();
  ctx.translate(x,y);ctx.scale(e.yon,1);ctx.rotate(lean);ctx.scale(1,stretch);
  const sal=Math.sin(e.sal*3)*h*.02;
  const g=ctx.createLinearGradient(0,-h,0,0);g.addColorStop(0,T.renk);g.addColorStop(1,'rgba(20,14,26,.85)');ctx.fillStyle=e.flas>0?'#f3e6c4':g;
  ctx.beginPath();ctx.moveTo(-h*.2,0);ctx.bezierCurveTo(-h*.32,-h*.4,-h*.26,-h*.8,-h*.05,-h*.98+sal);ctx.quadraticCurveTo(h*.12,-h*1.02,h*.2,-h*.82);
  ctx.bezierCurveTo(h*.3,-h*.5,h*.26,-h*.2,h*.22,0);
  for(let k=0;k<5;k++)ctx.lineTo(h*(.22-k*.105),(k%2?-h*.06:0)+sal*.5);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(201,162,74,.55)';ctx.lineWidth=1.5;ctx.stroke();
  // kol: saldırırken uzanır
  const kol=e.durum==='saldir'?h*.42:e.durum==='hazir'?h*.05:h*.18;
  ctx.strokeStyle=e.flas>0?'#f3e6c4':T.renk;ctx.lineWidth=h*.07;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(h*.12,-h*.62);ctx.quadraticCurveTo(h*.25,-h*.55,h*.12+kol,-h*.5);ctx.stroke();
  // gözler (hazırlanırken parlar)
  const p=e.durum==='hazir'?1:.55;ctx.fillStyle=T.goz;ctx.globalAlpha=a*p;
  for(const gx of[.02,.11]){ctx.beginPath();ctx.ellipse(h*gx,-h*.82+sal,h*.025,h*.015,0,0,7);ctx.fill();}
  if(e.durum==='hazir'){ctx.globalAlpha=a*.35*(.5+.5*Math.sin(e.t*30));ctx.fillStyle=T.goz;ctx.beginPath();ctx.arc(h*.06,-h*.82,h*.12,0,7);ctx.fill();}
  ctx.restore();
  // can çubuğu
  if(e.durum!=='ol'&&e.can<e.max){const bw=h*.5;ctx.fillStyle='rgba(20,33,61,.8)';ctx.fillRect(x-bw/2,y-h*1.1,bw,5);ctx.fillStyle=T.patron?'#e05a4a':'#c9a24a';ctx.fillRect(x-bw/2,y-h*1.1,bw*Math.max(0,e.can/e.max),5);}
}
function cizimler(){return E.map(e=>({y:e.y,f:()=>ciz(e)}));}
function ust(){
  for(const z of yazi){ctx.globalAlpha=Math.min(1,z.t*2);ctx.font='bold 18px Georgia,serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.6)';
    const x=z.x-camX+W/2,y=yScr(z.y)-z.h;ctx.strokeText(z.s,x,y);ctx.fillStyle=z.c;ctx.fillText(z.s,x,y);}
  ctx.globalAlpha=1;
  // oyuncu canı
  const x=Math.max(14,W*.02)+4,y=70,bw=Math.min(220,W*.3);ctx.fillStyle='rgba(20,33,61,.75)';ctx.fillRect(x,y,bw,9);
  ctx.fillStyle=P.hp/P.maxhp<.3?'#e05a4a':'#b23a1e';ctx.fillRect(x,y,bw*P.hp/P.maxhp,9);ctx.strokeStyle='rgba(201,162,74,.7)';ctx.lineWidth=1;ctx.strokeRect(x,y,bw,9);
  ctx.font='11px Georgia,serif';ctx.textAlign='left';ctx.fillStyle='#f3e6c4';ctx.fillText(Math.ceil(P.hp)+' / '+P.maxhp,x,y+22);
  if(P.hurtT>0){ctx.fillStyle=`rgba(178,58,30,${P.hurtT*.5})`;ctx.fillRect(0,0,W,H);}
  if(mesaj){ctx.globalAlpha=Math.min(1,mesaj.t);ctx.font='22px Georgia,serif';ctx.textAlign='center';ctx.fillStyle='#f6e2a4';ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=4;
    ctx.strokeText(mesaj.s,W/2,H*.28);ctx.fillText(mesaj.s,W/2,H*.28);ctx.globalAlpha=1;}
}
return{update,vurus,cizimler,ust,E,TUR,dog,get dalga(){return dalga}};
})();
window.SAVAS=SAVAS;
