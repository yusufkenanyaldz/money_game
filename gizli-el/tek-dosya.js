/* Her şeyi tek bir HTML dosyasına gömer: yedek / taşınabilir kopya.
   Servis işçisi (çevrimdışı önbellek) tek dosyada anlamsız, çıkarılır. */
const fs = require('fs');
const D = __dirname;
const oku = f => fs.readFileSync(D + '/' + f, 'utf8');

let html = oku('index.html');
const goml = (etiket, dosya) => {
  const kod = oku(dosya).replace(/<\/script>/g, '<\\/script>');
  if (!html.includes(etiket)) throw new Error('bulunamadi: ' + etiket);
  html = html.replace(etiket, '<script>\n' + kod + '\n</script>');
};
goml('<script src="tohumlar.js"></script>', 'tohumlar.js');
goml('<script src="sim.js"></script>', 'sim.js');
goml('<script src="ui.js"></script>', 'ui.js');
html = html.replace('<link rel="manifest" href="manifest.webmanifest">', '');
html = html.replace(/\/\* SW-BAS \*\/[\s\S]*?\/\* SW-SON \*\//, '');

const cikti = D + '/gizli-el.html';
fs.writeFileSync(cikti, html);
console.log('gizli-el.html · ' + (fs.statSync(cikti).size/1024).toFixed(0) + ' KB · ' +
  (html.includes('serviceWorker') ? 'SW HALA VAR (hata)' : 'SW cikarildi'));
