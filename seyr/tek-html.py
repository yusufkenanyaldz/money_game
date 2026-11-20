# Oyunu tek HTML dosyasına toplar (resimler, sesler, betikler içine gömülür).
# Kullanım: python3 tek-html.py <seyr klasörü> <çıktı.html>
import base64,glob,json,os,re,sys
os.chdir(sys.argv[1]);h=open('index.html').read()
for f in ['assets/ses/ses.js','sesler.js','savas.js','defter.js']:
    tag=f'<script src="{f}"></script>';assert tag in h,f
    h=h.replace(tag,'<script>'+open(f).read().replace('</script','<\\/script')+'</script>')
img={os.path.basename(p)[:-5]:'data:image/webp;base64,'+base64.b64encode(open(p,'rb').read()).decode() for p in glob.glob('assets/*.webp')}
a="const AURL=n=>'assets/'+n+'.webp',";assert a in h
h=h.replace(a,'const RESIM='+json.dumps(img)+";const AURL=n=>RESIM[n]||'assets/'+n+'.webp',")
open(sys.argv[2],'w').write(h)
