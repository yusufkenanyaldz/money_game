import numpy as np,wave,subprocess,os,json
O='/home/user/money_game/seyr/assets/ses/'
def load(n):
    w=wave.open(n+'.wav');return np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768,w.getframerate()
def save(x,sr,name):
    x=x/ (np.abs(x).max()+1e-9)*.89
    tmp=name+'.tmp.wav';w=wave.open(tmp,'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((x*32767).astype(np.int16).tobytes());w.close()
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-c:a','libmp3lame','-q:a','2',O+name+'.mp3'],check=True);os.remove(tmp)
info={}
# 1) tek tek efektler (vuruşları bul)
EV={'yuru':('adim',5),'yuru2':('adim2',4),'kos':('kosu-adim',6),'yumruk':('yumruk',5),'kacin':('kacin',1),'durus':('durus',2)}
for src,(base,want) in EV.items():
    x,sr=load(src);hop=sr//100;e=np.array([np.sqrt((x[i:i+hop]**2).mean()) for i in range(0,len(x)-hop,hop)])
    db=20*np.log10(e+1e-9);thr=max(db.max()-22,-50)
    ons=[];i=1
    while i<len(db):
        if db[i]>thr and db[i-1]<=thr:
            ons.append(i);i+=15
        else:i+=1
    cand=[]
    for o in ons:
        a=max(0,(o-2)*hop);end=o
        while end<len(db) and end-o<60 and db[end]>thr-18:end+=1
        b=min(len(x),(end+4)*hop);seg=x[a:b].copy()
        if len(seg)<sr*.05:continue
        f=int(sr*.004);seg[:f]*=np.linspace(0,1,f);t=int(min(len(seg)*.4,sr*.06));seg[-t:]*=np.linspace(1,0,t)**2
        cand.append((db[o:end].max(),seg))
    cand.sort(key=lambda c:-c[0])
    for k,(p,seg) in enumerate(cand[:want]):save(seg,sr,f'{base}-{k+1}');info[f'{base}-{k+1}']=round(len(seg)/sr,2)
# 2) animasyonla eşzamanlı döngüler (animasyonla aynı başlangıç, 2.4 sn, son 0.6 sn başa harmanlanır)
ST={'bekle':.3,'yuru':.3,'yuru2':3.0,'kos':1.6,'arka':.3,'durus':.3,'yumruk':.3,'kacin':.3}
for n,st in ST.items():
    x,sr=load(n);N=int(2.4*sr);K=int(.6*sr);a=int(st*sr)
    seg=x[a:a+N+K]
    if len(seg)<N+K:continue
    out=seg[:N].copy();w=np.linspace(0,1,K);out[:K]=seg[:K]*w+seg[N:N+K]*(1-w)
    save(out,sr,'dongu-'+n);info['dongu-'+n]=2.4
json.dump(info,open(O+'liste.json','w'),indent=1,ensure_ascii=False);print(json.dumps(info,ensure_ascii=False))
