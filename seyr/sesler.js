'use strict';
/* =========================================================
   SEYR — Sentez ve türetilmiş sesler (dosya gerektirmez)
   Davul (kudüm/davul), kanun benzeri çekme tel, hırıltı, rüzgâr.
   Her fonksiyon isteğe bağlı bir ses bağlamı alır (test için OfflineAudioContext).
   ========================================================= */
const SES=(()=>{
const H=[293.66,311.13,369.99,392,440,466.16,523.25,587.33];   // Hicaz dizisi (Re)
let ana=null;
function out(c){c=c||AC;if(c===AC){if(!ana){ana=AC.createDynamicsCompressor();ana.threshold.value=-14;ana.ratio.value=4;ana.connect(AC.destination);}return ana;}return c.destination;}
const ok=c=>(c||AC)&&(c||sesOn);
function gurultu(c,sure){const n=Math.floor(c.sampleRate*sure),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;return s;}
function zarf(c,g,t,atak,sure,tepe){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(tepe,t+atak);g.gain.exponentialRampToValueAtTime(0.0001,t+sure);}

/* davul: inen perdeli gövde + tık */
function davul(c,t=0,{f=110,son=45,sure=.45,vol=.9}={}){c=c||AC;t+=c.currentTime;
  const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(son,t+sure*.6);
  zarf(c,g,t,.004,sure,vol);o.connect(g);g.connect(out(c));o.start(t);o.stop(t+sure+.05);
  const n=gurultu(c,.06),ng=c.createGain(),bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1800;zarf(c,ng,t,.001,.05,vol*.35);n.connect(bp);bp.connect(ng);ng.connect(out(c));n.start(t);}
/* kanun benzeri çekme tel: üçgen + harmonik, hızlı sönüm */
function tel(c,t=0,f=440,vol=.35,sure=.9){c=c||AC;t+=c.currentTime;
  for(const [k,v,tip] of[[1,1,'triangle'],[2,.35,'sine'],[3,.12,'sine']]){const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();
    o.type=tip;o.frequency.value=f*k;lp.type='lowpass';lp.frequency.setValueAtTime(f*8,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+sure);
    zarf(c,g,t,.003,sure/k,vol*v);o.connect(lp);lp.connect(g);g.connect(out(c));o.start(t);o.stop(t+sure+.05);}}
/* hırıltı: alçak testere + süzülmüş gürültü, yavaş yükselir */
function hirilti(c,t=0,sure=.6,vol=.35,f=55){c=c||AC;t+=c.currentTime;
  const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*1.25,t+sure);
  lp.type='lowpass';lp.frequency.value=380;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+sure*.8);g.gain.exponentialRampToValueAtTime(.0001,t+sure);
  o.connect(lp);lp.connect(g);g.connect(out(c));o.start(t);o.stop(t+sure+.05);
  const n=gurultu(c,sure),ng=c.createGain(),bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=300;bp.Q.value=2;
  ng.gain.setValueAtTime(.0001,t);ng.gain.linearRampToValueAtTime(vol*.8,t+sure*.8);ng.gain.exponentialRampToValueAtTime(.0001,t+sure);n.connect(bp);bp.connect(ng);ng.connect(out(c));n.start(t);}
/* rüzgâr / dağılma: süzgeci kayan gürültü */
function ruzgar(c,t=0,sure=.7,vol=.4,f0=2400,f1=300){c=c||AC;t+=c.currentTime;
  const n=gurultu(c,sure),g=c.createGain(),bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.4;bp.frequency.setValueAtTime(f0,t);bp.frequency.exponentialRampToValueAtTime(f1,t+sure);
  zarf(c,g,t,sure*.15,sure,vol);n.connect(bp);bp.connect(g);g.connect(out(c));n.start(t);}
/* dosyadaki bir sesi farklı perdeyle çal (yalnızca canlı bağlamda) */
function ornek(grup,rate,vol,lp){if(!AC||!sesOn)return;const L=SFX[grup],b=BUF[L[(Math.random()*L.length)|0]];if(!b)return;
  const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.playbackRate.value=rate;g.gain.value=vol;let n=s;
  if(lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;s.connect(f);n=f;}n.connect(g);g.connect(out());s.start();}

const S={
  // düşman saldırmaya hazırlanıyor (uyarı)
  hazir(patron,c){if(!c&&!ok())return;hirilti(c,0,patron?.9:.55,patron?.45:.25,patron?42:62);},
  // düşman atılıyor
  saldir(patron,c){if(!c){if(!ok())return;ornek('kac',patron?.6:.78,.7,1600);}ruzgar(c,0,.28,.25,1800,500);},
  // oyuncunun yumruğu düşmana değdi
  isabet(patron,c){if(!c&&!ok())return;davul(c,0,{f:patron?90:140,son:patron?40:60,sure:.22,vol:.6});},
  // düşman dağıldı
  olum(patron,c){if(!c&&!ok())return;ruzgar(c,0,patron?1.6:.8,.45,3200,180);tel(c,.05,H[patron?0:4]/2,.25,1.4);if(patron){davul(c,0,{f:80,son:35,sure:.9,vol:1});tel(c,.25,H[0],.3,2);}},
  // oyuncu vuruldu
  yara(c){if(!c){if(!ok())return;ornek('durus',.8,.7,1200);}davul(c,0,{f:70,son:38,sure:.35,vol:.8});tel(c,0,H[1]/2,.18,.4);tel(c,0,H[2]/2,.14,.4);},
  // kaçınma başarılı
  kacti(c){if(!c&&!ok())return;tel(c,0,H[6],.22,.6);tel(c,.06,H[7]*1.0,.18,.7);},
  // dalga başlıyor: üç davul
  dalga(patron,c){if(!c&&!ok())return;if(patron){for(let i=0;i<8;i++)davul(c,i*.11,{f:75,son:40,sure:.3,vol:.35+i*.07});davul(c,.95,{f:60,son:30,sure:1.4,vol:1});hirilti(c,.9,1.6,.35,36);}
    else{davul(c,0,{vol:.7});davul(c,.24,{vol:.55});davul(c,.48,{f:85,son:38,sure:.7,vol:.85});}},
  // oyuncu düştü
  dustu(c){if(!c&&!ok())return;davul(c,0,{f:60,son:28,sure:1.2,vol:.9});[4,3,2,1,0].forEach((k,i)=>tel(c,.15+i*.22,H[k]/2,.22,1.1));},
  // seviye atlama: Hicaz dizisinde çıkan kanun
  seviye(c){if(!c&&!ok())return;[0,1,2,3,4,6,7].forEach((k,i)=>tel(c,i*.09,H[k],.3,1.2));davul(c,.7,{f:100,son:45,sure:.6,vol:.8});},
  // defterde bir amel girildi
  amel(c){if(!c&&!ok())return;tel(c,0,H[4],.22,.8);tel(c,.08,H[7],.16,.9);},
  // zikirmatik dokunuşu (her 33'te farklı)
  tesbih(n,c){if(!c&&!ok())return;tel(c,0,n%33===0?H[7]:H[4]*2,n%33===0?.3:.1,n%33===0?1.2:.25);},
  _test:{davul,tel,hirilti,ruzgar},
};
return S;
})();
window.SES=SES;
