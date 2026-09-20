/* Sınavı geçen tohumları toplar. Dosyaya gömülür ki oyun anında açılsın. */
const G = require('./sim.js');
const fs = require('fs');
const HEDEF = parseInt(process.argv[2] || '160', 10);
const CIKTI = __dirname + '/tohumlar.json';
let bulunan = [], denenen = 0, t0 = Date.now();
let s = 1;
while (bulunan.length < HEDEF && denenen < 400000){
  denenen++;
  if (G.dogrula(s).gecti){
    bulunan.push(s);
    if (bulunan.length % 10 === 0){
      fs.writeFileSync(CIKTI, JSON.stringify(bulunan));
      console.log(bulunan.length + '/' + HEDEF + ' · ' + denenen + ' denendi · ' +
        ((Date.now()-t0)/1000).toFixed(0) + 's');
    }
  }
  s++;
}
fs.writeFileSync(CIKTI, JSON.stringify(bulunan));
console.log('BITTI: ' + bulunan.length + ' tohum, ' + denenen + ' aday elendi, ' +
  ((Date.now()-t0)/1000).toFixed(0) + 's · kabul %' + (bulunan.length/denenen*100).toFixed(2));
