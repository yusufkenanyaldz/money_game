// Telefon boyutunda gerçek tarayıcıda duman testi: npm run build && npm run e2e
// Ekran görüntüleri e2e/shots/ klasörüne yazılır.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = new URL('../', import.meta.url);
const pageUrl = 'file://' + fileURLToPath(new URL('dist/index.html', root));
const shots = fileURLToPath(new URL('e2e/shots/', root));
mkdirSync(shots, { recursive: true });

const KEY = 'kadim-kule-kayit';
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath });
const errors = [];
const fail = (msg) => {
  console.error('HATA:', msg);
  process.exitCode = 1;
};

// Bu ortamda tarayıcı ağ vekilinin sertifikasını tanımıyor; Google Fonts isteklerini
// vekili ve sertifikayı bilen curl ile karşılıyoruz (yalnızca test için).
const fontCache = new Map();
async function serveFonts(route) {
  const url = route.request().url();
  try {
    if (!fontCache.has(url)) {
      const ua = route.request().headers()['user-agent'] ?? 'Mozilla/5.0';
      fontCache.set(url, execFileSync('curl', ['-sSf', '-A', ua, url], { maxBuffer: 1 << 24 }));
    }
    await route.fulfill({
      body: fontCache.get(url),
      contentType: url.includes('googleapis') ? 'text/css' : 'font/woff2',
      headers: { 'access-control-allow-origin': '*' },
    });
  } catch {
    await route.abort();
  }
}

/** Her senaryo boş depolu yeni bir bağlamda başlar; save verilirse oyun açılmadan yazılır. */
async function scenario(save) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'tr-TR',
  });
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, serveFonts);
  if (save) {
    await ctx.addInitScript(
      ([key, data]) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, data);
      },
      [KEY, JSON.stringify(save)],
    );
  }
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(pageUrl);
  await p.waitForTimeout(700);
  return { ctx, p };
}

const mana = (p) => p.locator('.mana-sayi').textContent().then((t) => t?.trim());

function midSave(overrides = {}) {
  const now = Date.now();
  return {
    v: 1,
    mana: '2.5e6',
    manaRun: '9e6',
    tapLevel: 9,
    circleRepaired: true,
    creatures: [34, 22, 14, 6, 1, 0, 0, 0, 0, 0],
    scrolls: ['peri-1', 'keskin-kristal'],
    floor: 3,
    buffs: [{ id: 'huma-uretim', remaining: 20, duration: 30, mult: 7 }],
    huma: { nextIn: 2, visibleFor: 0 },
    tipsSeen: ['hosgeldin', 'parlat', 'cember', 'ilk-peri', 'cevrimdisi', 'kutuphane', 'esik', 'huma'],
    settings: { sfx: true, music: false, volume: 0.7, notation: 'tr', vibration: true },
    stats: { taps: 900, crits: 40, humaCaught: 2, playTime: 1500, startedAt: now - 2e6, manaAllTime: '9e6' },
    lastTick: now,
    ...overrides,
  };
}

// 1) Yeni oyun: dokunma evresi
{
  const { ctx, p } = await scenario();
  await p.screenshot({ path: shots + '01-baslangic.png' });
  if (await p.locator('.sekme', { hasText: 'Yaratıklar' }).isVisible()) fail('Yaratıklar sekmesi baştan görünüyor');
  const crystal = p.locator('.kristal-dugme');
  for (let i = 0; i < 40; i++) await crystal.tap({ force: true });
  const m = Number(await mana(p));
  if (!(m >= 40)) fail(`40 dokunuş en az 40 mana vermeliydi (${m})`);
  await p.locator('.ustat .dugme').tap();
  await p.waitForTimeout(300);
  await p.screenshot({ path: shots + '02-dokunuslar.png' });
  await ctx.close();
}

// 2) Oyun ortası: yaratıklar, Hüma, kütüphane, kule
{
  const { ctx, p } = await scenario(midSave());
  await p.screenshot({ path: shots + '03-kristal-orta.png' });
  await p.locator('.sekme', { hasText: 'Yaratıklar' }).tap();
  await p.waitForTimeout(300);
  await p.screenshot({ path: shots + '04-yaratiklar.png' });
  const counts = () => p.locator('.adet').allTextContents().then((t) => t.join(','));
  const before = await counts();
  await p.locator('section[aria-label="Çağırma Çemberi"] .kart .dugme.hazir').first().tap();
  await p.waitForTimeout(150);
  if ((await counts()) === before) fail('yaratık alımı sayıyı artırmadı');

  await p.waitForTimeout(2200);
  const huma = p.locator('.huma');
  if (!(await huma.isVisible())) fail('Hüma Kuşu görünmedi');
  else {
    await p.waitForTimeout(3000); // ekranın ortasına gelsin
    await p.screenshot({ path: shots + '05-huma.png' });
    await huma.tap({ force: true });
    await p.waitForTimeout(250);
    if (await huma.isVisible()) fail('Hüma yakalanamadı');
    await p.screenshot({ path: shots + '05b-huma-yakalandi.png' });
  }

  await p.locator('.sekme', { hasText: 'Kütüphane' }).tap();
  await p.waitForTimeout(300);
  await p.screenshot({ path: shots + '06-kutuphane.png' });

  await p.locator('.sekme', { hasText: 'Kule' }).tap();
  await p.waitForTimeout(300);
  await p.screenshot({ path: shots + '07-kule.png' });
  await p.locator('.icerik').evaluate((el) => (el.scrollTop = el.scrollHeight));
  await p.waitForTimeout(200);
  await p.screenshot({ path: shots + '08-ayarlar.png' });

  // Dışa aktar → sıfırla → içe aktar döngüsü
  await p.locator('.dugme', { hasText: 'Dışa aktar' }).tap();
  const code = await p.locator('#kayit-disa').inputValue();
  if (!code.startsWith('KADIMKULE1:')) fail('dışa aktarılan kayıt biçimi yanlış');
  await p.locator('.dugme', { hasText: 'Sıfırla' }).tap();
  await p.locator('.dugme', { hasText: 'Evet, her şeyi sil' }).tap();
  await p.waitForTimeout(200);
  if ((await mana(p)) !== '0') fail('sıfırlama manayı sıfırlamadı');
  await p.locator('.sekme', { hasText: 'Kule' }).tap();
  await p.locator('.icerik').evaluate((el) => (el.scrollTop = el.scrollHeight));
  await p.locator('.dugme', { hasText: 'İçe aktar' }).tap();
  await p.locator('#kayit-ice').fill(code);
  await p.locator('.dugme', { hasText: 'Kaydı yükle' }).tap();
  await p.waitForTimeout(200);
  if ((await mana(p)) === '0') fail('içe aktarma kaydı geri yüklemedi');
  await ctx.close();
}

// 3) Çevrimdışı dönüş: 3 saat önce kaydedilmiş oyun
{
  const { ctx, p } = await scenario(midSave({ buffs: [], lastTick: Date.now() - 3 * 3600 * 1000 }));
  const title = await p.locator('.pencere h2').textContent().catch(() => null);
  if (!title?.includes('Hoş geldin')) fail(`çevrimdışı penceresi çıkmadı (${title})`);
  await p.screenshot({ path: shots + '09-cevrimdisi.png' });
  await ctx.close();
}

// 4) Kat açılışı: çemberi onarmaya yetecek mana
{
  const { ctx, p } = await scenario(
    midSave({ mana: '3000', circleRepaired: false, floor: 1, creatures: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], scrolls: [], buffs: [], tipsSeen: ['hosgeldin', 'parlat', 'cember'] }),
  );
  await p.locator('.hedef-dugme').tap();
  await p.waitForTimeout(500);
  const title = await p.locator('.pencere h2').textContent().catch(() => null);
  if (title !== 'Çağırma Çemberi') fail(`kat açılış penceresi çıkmadı (${title})`);
  await p.screenshot({ path: shots + '10-kat-acildi.png' });
  await ctx.close();
}

if (errors.length) fail('Konsol hataları:\n' + errors.join('\n'));
await browser.close();
console.log(process.exitCode ? 'Duman testi BAŞARISIZ' : 'Duman testi geçti. Ekran görüntüleri: e2e/shots/');
