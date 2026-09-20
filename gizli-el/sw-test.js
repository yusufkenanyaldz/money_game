/* Servis işçisi testi: yeni sürüm kullanıcıya ULAŞIYOR mu, ve çevrimdışı
 * hâlâ çalışıyor mu? İlk sürüm cache-first'tü ve güncellemeleri kilitliyordu.
 *   node sw-test.js                                                      */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
// kaynak dosyalar geçici bir klasöre kopyalanır; test onları değiştirerek
// "yeni sürüm yayınlandı" durumunu taklit eder
const KAYNAK = __dirname;
const DIR = fs.mkdtempSync(require('os').tmpdir() + '/gizliel-sw-');
for (const f of ['index.html','ui.js','sim.js','tohumlar.js','sw.js','manifest.webmanifest'])
  fs.copyFileSync(KAYNAK + '/' + f, DIR + '/' + f);
const TIP = {'.html':'text/html','.js':'text/javascript','.webmanifest':'application/manifest+json'};
const srv = http.createServer((q,r)=>{
  let f = q.url.split('?')[0]; if (f === '/') f = '/index.html';
  const p = path.join(DIR, f);
  fs.readFile(p, (e,d)=>{
    if (e){ r.writeHead(404); r.end(); return; }
    r.writeHead(200, {'Content-Type': TIP[path.extname(p)] || 'text/plain',
                      'Cache-Control':'no-cache'});
    r.end(d);
  });
});
(async () => {
  await new Promise(res => srv.listen(8099, res));
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const ctx = await b.newContext({ viewport:{width:390,height:844} });
  const p = await ctx.newPage();

  await p.goto('http://localhost:8099/', { waitUntil:'load' });
  await p.waitForFunction(()=>navigator.serviceWorker.controller !== null, null, {timeout:15000});
  await p.waitForTimeout(1200);
  const ilk = await p.textContent('#surum').catch(()=>'(okunamadi)');
  console.log('1) ilk yukleme, surum:', ilk);

  // calisan surumu degistir (yeni yayin gibi)
  const ui = fs.readFileSync(DIR + '/ui.js','utf8').replace("'2026-09-20-2'", "'YENI-SURUM'");
  fs.writeFileSync(DIR + '/ui.js', ui);
  const sw = fs.readFileSync(DIR + '/sw.js','utf8').replace("'2026-09-20-2'", "'YENI-SURUM'");
  fs.writeFileSync(DIR + '/sw.js', sw);
  console.log('2) sunucuda yeni surum yayinlandi');

  await p.reload({ waitUntil:'load' }).catch(()=>{});
  await p.waitForTimeout(3500);           // controllerchange kendiliginden bir kez tazeler
  let son = null;
  for (let i=0;i<6 && !son;i++){
    son = await p.textContent('#surum').catch(()=>null);
    if (!son) await p.waitForTimeout(500);
  }
  console.log('3) yenileme sonrasi surum:', son);
  console.log(son && son.includes('YENI-SURUM') ? '   ✓ GUNCELLEME ULASTI' : '   ✗ ESKI SURUMDE KALDI');

  // cevrimdisi hala calisiyor mu
  await ctx.setOffline(true);
  await p.reload({ waitUntil:'load' }).catch(()=>{});
  await p.waitForTimeout(600);
  const cevrimdisi = await p.$eval('#giris h1', n=>n.textContent).catch(()=>null);
  console.log('4) cevrimdisi acilis:', cevrimdisi === 'GİZLİ EL' ? '✓ calisiyor' : '✗ acilmadi');

  await b.close(); srv.close();
  fs.rmSync(DIR, { recursive:true, force:true });
  if (!son || !son.includes('YENI-SURUM')) process.exitCode = 1;
})().catch(e=>{ console.error('ERR', e.message); process.exit(1); });
