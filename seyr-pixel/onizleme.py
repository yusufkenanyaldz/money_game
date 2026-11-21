# Seyr Pixel — assets/ şeritlerini gömerek telefonda açılan tek dosyalık önizleme üretir: onizleme.html
import base64, json, os
BURASI = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(BURASI, 'assets')
meta = json.load(open(os.path.join(A, 'karakter.json')))
seritler = {k: 'data:image/png;base64,' + base64.b64encode(open(os.path.join(A, k + '.png'), 'rb').read()).decode() for k in meta}
SAYFA = r'''<title>Seyr Pixel</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Tek ekran oyun önizlemesi: koyu gece paleti, tek tema. Oyun 320x180 çizilir, tam kat büyütülür. */
:root{--zemin:#14161f;--yazi:#e8e2d0;--soluk:#8a8fa3;--altin:#d9ad4f;color-scheme:dark}
html,body{height:100%;margin:0;background:var(--zemin);color:var(--yazi);font:14px/1.4 system-ui,sans-serif;overflow:hidden}
#sahne{position:fixed;inset:0;display:grid;place-items:center}
canvas{image-rendering:pixelated;image-rendering:crisp-edges;display:block}
#bilgi{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));color:var(--soluk);font-size:12px;text-align:center;pointer-events:none}
.tus{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom,0px));width:64px;height:64px;border-radius:50%;border:2px solid var(--altin);background:rgba(20,22,31,.6);color:var(--altin);font:700 22px system-ui;touch-action:none;user-select:none;-webkit-user-select:none}
#sol{left:max(18px,env(safe-area-inset-left,0px))}#sag{left:calc(max(18px,env(safe-area-inset-left,0px)) + 78px)}
.tus.on{background:var(--altin);color:var(--zemin)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<div id="sahne"><canvas id="c" width="320" height="180" aria-label="Seyr Pixel önizleme"></canvas></div>
<p id="bilgi">Seyr Pixel · yürüme önizlemesi · ← → tuşları ya da alttaki düğmeler</p>
<button class="tus" id="sol" aria-label="Sola yürü">◀</button><button class="tus" id="sag" aria-label="Sağa yürü">▶</button>
<script>
const META=__META__,SERIT=__SERIT__;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const IMG={};for(const k in SERIT){const i=new Image();i.src=SERIT[k];IMG[k]=i;}
function boyutla(){const k=Math.max(1,Math.floor(Math.min(innerWidth/320,innerHeight/180)));cv.style.width=320*k+'px';cv.style.height=180*k+'px';}
addEventListener('resize',boyutla);boyutla();
/* Yer: döşeme mantığı, sabit palet */
const PAL={gok1:'#1e2440',gok2:'#3a3f66',dag:'#2b2f4d',dag2:'#383d63',ot:'#3f6b3a',ot2:'#335a30',toprak:'#6b4a2f',toprak2:'#56391f',yildiz:'#e8e2d0'};
function zemin(kam){
  const g=ctx.createLinearGradient(0,0,0,120);g.addColorStop(0,PAL.gok1);g.addColorStop(1,PAL.gok2);ctx.fillStyle=g;ctx.fillRect(0,0,320,140);
  ctx.fillStyle=PAL.yildiz;for(let i=0;i<30;i++){const x=((i*73+11)%320-kam*.05+640)%320,y=(i*37)%70;ctx.fillRect(Math.round(x),y,1,1);}
  for(const [renk,h,par,per] of [[PAL.dag,40,.2,90],[PAL.dag2,28,.4,60]]){ctx.fillStyle=renk;
    for(let x=0;x<320;x++){const w=x+kam*par;const y=128-h*(.5+.5*Math.sin(w/per)*Math.cos(w/(per*1.7)));ctx.fillRect(x,Math.round(y),1,140-Math.round(y));}}
  for(let x=-16;x<336;x+=16){const wx=Math.floor((x+kam)/16),ox=Math.round(x-((kam%16)+16)%16);
    ctx.fillStyle=PAL.ot;ctx.fillRect(ox,140,16,4);ctx.fillStyle=PAL.ot2;ctx.fillRect(ox+((wx*5)&7),140,3,1);
    ctx.fillStyle=(wx&1)?PAL.toprak:PAL.toprak2;ctx.fillRect(ox,144,16,36);}
}
const P={x:0,yon:1,t:0,hiz:0};const tus={sol:false,sag:false};
addEventListener('keydown',e=>{if(e.key==='ArrowLeft')tus.sol=true;if(e.key==='ArrowRight')tus.sag=true;});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft')tus.sol=false;if(e.key==='ArrowRight')tus.sag=false;});
for(const id of ['sol','sag']){const b=document.getElementById(id);
  b.addEventListener('pointerdown',e=>{e.preventDefault();tus[id]=true;b.classList.add('on');});
  for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>{tus[id]=false;b.classList.remove('on');});}
let son=performance.now();
function kare(now){const dt=Math.min(.05,(now-son)/1000);son=now;
  const yon=(tus.sag?1:0)-(tus.sol?1:0);P.hiz=yon*34;if(yon)P.yon=yon;P.x+=P.hiz*dt;if(yon)P.t+=dt;
  zemin(P.x);
  const st=META.bekle&&!yon?'bekle':'yuru',M=META[st],im=IMG[st];
  if(im.complete&&im.naturalWidth){let f=st==='yuru'&&!yon?0:Math.floor(P.t*M.fps)%M.n;if(st==='bekle')f=Math.floor(now/1000*M.fps)%M.n;
    const x=Math.round(160-M.w/2),y=144-M.h;ctx.save();if(P.yon!==M.yon){ctx.translate(320,0);ctx.scale(-1,1);}
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(Math.round(160-M.w*.3),143,Math.round(M.w*.6),2);
    ctx.drawImage(im,f*M.w,0,M.w,M.h,x,y,M.w,M.h);ctx.restore();}
  requestAnimationFrame(kare);}
requestAnimationFrame(kare);
</script>
'''
html = SAYFA.replace('__META__', json.dumps(meta)).replace('__SERIT__', json.dumps(seritler))
open(os.path.join(BURASI, 'onizleme.html'), 'w', encoding='utf-8').write(html)
print('✓ onizleme.html', os.path.getsize(os.path.join(BURASI, 'onizleme.html')) // 1024, 'KB')
