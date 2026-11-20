# index.html + assets/ -> tek, bağımsız HTML (görseller gömülü). Kullanım: python3 tek-dosya.py cikti.html
import base64,re,os,json,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s=open('index.html').read()
D={f[:-5]:'data:image/webp;base64,'+base64.b64encode(open('assets/'+f,'rb').read()).decode() for f in os.listdir('assets') if f.endswith('.webp')}
s=s.replace("const AURL=n=>'assets/'+n+'.webp';","const AURL=n=>ASSET[n];")
s=s.replace("i.src='assets/'+k+'.webp'","i.src=ASSET[k]").replace("i.src='assets/yer-'+PLACE[k][0]+'.webp'","i.src=ASSET['yer-'+PLACE[k][0]]")
s=re.sub(r"assets/([a-z0-9-]+)\.webp",lambda m:D[m.group(1)],s)
s=s.replace("<script>\n'use strict';","<script>\n'use strict';\nconst ASSET="+json.dumps(D)+";",1)
assert 'assets/' not in s,'kalan yol var'
open(sys.argv[1],'w').write(s);print(sys.argv[1],len(s)//1024,'KB')
