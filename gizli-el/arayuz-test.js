/* Arayüz düzen testi: dört telefon genişliğinde hiçbir şey ekrandan
 * taşmamalı. Kullanıcı bir kez kayık düzenle karşılaştı — bir daha olmasın.
 * Çalıştırmak için Playwright gerekir:  node arayuz-test.js            */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  let kotu = 0;
  for (const g of [320, 360, 390, 430]){
    const p = await b.newPage({ viewport:{width:g,height:800}, deviceScaleFactor:2 });
    await p.goto('file://' + __dirname + '/index.html', {waitUntil:'domcontentloaded'});
    await p.waitForTimeout(200);
    await p.click('#doktrinler .dok:nth-child(2)');
    await p.waitForFunction(()=>document.querySelector('#giris').hidden, null, {timeout:40000});
    // biraz ilerlet ki icerik dolsun
    for (let i=0;i<30;i++){
      const bas = await p.$eval('#ortuIc .dosyaBaslik', n =>
        document.querySelector('#ortu').hidden ? null : n.textContent).catch(()=>null);
      if (bas === 'Son mevsim') { await p.click('#ortuIc .dugme.vurgu'); continue; }
      if (bas !== null) { await p.click('#ortuIc .kapat').catch(()=>{}); continue; }
      await p.click('#gecBtn');
    }
    const olc = async (ad) => {
      const r = await p.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const tasan = [];
        for (const n of document.querySelectorAll('body *')){
          if (!n.offsetParent && n.tagName !== 'BODY') continue;
          const b = n.getBoundingClientRect();
          if (b.width === 0) continue;
          if (b.right > W + 1.5 || b.left < -1.5){
            tasan.push(n.className + '|' + (n.textContent||'').trim().slice(0,26) +
                       '|' + Math.round(b.left) + '→' + Math.round(b.right));
          }
        }
        return { W, yatayKaydirma: document.documentElement.scrollWidth > W + 1,
                 tasan: tasan.slice(0,6), toplam: tasan.length };
      });
      if (r.yatayKaydirma || r.toplam) {
        kotu++;
        console.log('  ✗ ' + ad + ' @' + r.W + 'px — yatay kaydırma:' + r.yatayKaydirma + ', taşan:' + r.toplam);
        r.tasan.forEach(t => console.log('      ' + t));
      } else console.log('  ✓ ' + ad + ' @' + r.W + 'px temiz');
    };
    console.log('--- ' + g + 'px ---');
    await olc('masa');
    await p.click('#cekmeceler button:nth-child(2)'); await p.waitForTimeout(150); await olc('harita');
    await p.click('#cekmeceler button:nth-child(3)'); await p.waitForTimeout(150); await olc('kronik');
    await p.click('#cekmeceler button:nth-child(4)'); await p.waitForTimeout(150); await olc('kütüphane');
    await p.click('#cekmeceler button:nth-child(1)'); await p.waitForTimeout(100);
    await p.click('#emirBtn'); await p.waitForTimeout(150); await olc('emir');
    
    await p.close();
  }
  console.log(kotu ? '\n' + kotu + ' YERDE TAŞMA VAR' : '\nHİÇBİR GENİŞLİKTE TAŞMA YOK');
  if (kotu) process.exitCode = 1;
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
