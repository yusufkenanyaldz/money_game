const fs=require('fs'), D=__dirname;
const oku=f=>fs.readFileSync(D+'/'+f,'utf8');
let h=oku('index.html');
for(const f of ['cekirdek.js','ui.js'])
  h=h.replace('<script src="'+f+'"></script>','<script>\n'+oku(f).replace(/<\/script>/g,'<\\/script>')+'\n</script>');
h=h.replace('<link rel="manifest" href="manifest.webmanifest">','');
h=h.replace(/\/\* SW-BAS \*\/[\s\S]*?\/\* SW-SON \*\//,'');
fs.writeFileSync(D+'/veba.html',h);
console.log('veba.html · '+(fs.statSync(D+'/veba.html').size/1024).toFixed(0)+' KB · '+
  (h.includes('serviceWorker')?'SW HALA VAR (hata)':'SW cikarildi'));
