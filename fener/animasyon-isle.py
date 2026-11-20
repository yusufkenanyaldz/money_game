import subprocess,glob,os,json,sys,numpy as np,shutil
from PIL import Image
U='/root/.claude/uploads/6ae7375b-f8fb-5171-a84a-287811073158/'
T='/tmp/claude-0/-home-user-money-game/6ae7375b-f8fb-5171-a84a-287811073158/scratchpad/anim3/'
O='/home/user/money_game/fener/assets/'
V={
 ('well',1):('4b8a4405',.5),('hut',1):('640734c7',.5),('mill',1):('d35345ec',.5),('grave',1):('df78c341',1.2),('mine',1):('15b13ab5',.5),
 ('abbey',1):('4bd2ff19',.5),('tower',1):('0f2f4731',.5),('cathedral',1):('6a8df9f7',2.9),('gate',1):('7a61db5f',.5),
 ('abbey',2):('5002515b',.5),('tower',2):('a2aa7638',.5),('cathedral',2):('908d72c8',.5),('gate',2):('1d0572bb',.5),('hut',2):('6b06d9df',.5),
 ('grave',2):('9559ee2e',1.2),('mill',2):('b6ce287a',.5),('mine',2):('50a49f32',.5),('well',2):('b2d166aa',.5),
 ('mine',3):('4630dc74',.5),('grave',3):('b86b670d',.5),('mill',3):('b5c6f54b',.5),('well',3):('18769f1f',.5),('hut',3):('dc455c41',.5),
 ('abbey',3):('b51b224e',.5),('tower',3):('a6d40ca3',.5),('cathedral',3):('5b8d0bc9',.5),('gate',3):('cfca98d1',.5),
 ('lantern',1):('6facc0f7',.5),('lantern',2):('9cec493e',.5),('lantern',3):('ace35ce0',.5),('lantern',4):('87cd73f8',.5),
 ('tower',4):('597704b5',.5),('cathedral',4):('0acfae79',.5),('gate',4):('c5334b20',.5),('hut',4):('30c29b40',.5),('well',4):('d1ad14b4',.5),
 ('grave',4):('a7c12e41',.5),('mill',4):('a284c3ec',.5),('mine',4):('803a4972',.5),('abbey',4):('17b273ed',.5),
 ('fx','halka'):('0b117726',.5),('fx','patlama'):('acdf1363',0),
}
only=sys.argv[1:] 
def key(f,fx=False):
    f=f.astype(np.float32);R,G,B=f[...,0],f[...,1],f[...,2]
    m=np.minimum(R,B)-G
    br=np.concatenate([m[:6].ravel(),m[-6:].ravel(),m[:,:6].ravel(),m[:,-6:].ravel()])
    bgv=max(np.percentile(br,25),40)
    bord=np.concatenate([f[:6].reshape(-1,3),f[-6:].reshape(-1,3),f[:,:6].reshape(-1,3),f[:,-6:].reshape(-1,3)])
    bgc=np.median(bord,0)
    s=m/bgv
    a=1-np.clip((s-.32)/.42,0,1)
    a3=a[...,None]
    c=np.where(a3>.02,(f-(1-a3)*bgc)/np.maximum(a3,1e-3),0)
    # kalan magenta taşmasını bastır
    mm=np.minimum(c[...,0],c[...,2])-c[...,1];sp=np.clip(mm-25,0,None)[...,None]*(1-a3*.5)
    c[...,0:1]-=sp*.8;c[...,2:3]-=sp*.8
    if fx=='glow':
        c[...,2]=np.minimum(c[...,2],c[...,1]*.8+22)
    elif fx:
        c[...,2]=np.minimum(c[...,2],c[...,1]*.8);c[...,0]=np.maximum(c[...,0],c[...,1])
        a=a*np.clip((np.maximum(c[...,0],c[...,1])-40)/60,0,1)**.7;a3=a[...,None]
    return np.dstack([np.clip(c,0,255)*a3,a])
meta=json.load(open(T+'meta.json')) if os.path.exists(T+'meta.json') else {}
for (kind,lv),(vid,st) in V.items():
    name=f'anim-{kind}-{lv}'
    if only and name not in only:continue
    once=lv=='patlama';FPS=15;N=48 if once else 36;K=0 if once else 9;H=320 if kind!='fx' else 360;COLS=6
    d=T+name;shutil.rmtree(d,ignore_errors=True);os.makedirs(d)
    src=glob.glob(U+vid+'-*.mp4')[0]
    subprocess.run(['ffmpeg','-v','error','-ss',str(st),'-i',src,'-vf',f'fps={FPS}','-frames:v',str(N+K),d+'/%03d.png'],check=True)
    F=[np.asarray(Image.open(f).convert('RGB')) for f in sorted(glob.glob(d+'/*.png'))]
    Rr=[key(f,'glow' if kind=='lantern' else kind=='fx') for f in F]
    out=[(Rr[i]*(i/K)+Rr[N+i]*(1-i/K)) if i<K else Rr[i] for i in range(N)]
    al=np.stack([o[...,3] for o in out]).max(0)
    ys,xs=np.where(al>.08);x0,x1,y0,y1=xs.min()-3,xs.max()+4,ys.min()-3,ys.max()+4
    fh=H;fw=round((x1-x0)*H/(y1-y0))
    rows=-(-N//COLS);sheet=Image.new('RGBA',(fw*COLS,fh*rows))
    for i,p in enumerate(out):
        a=p[...,3:4];rgb=np.where(a>1e-3,p[...,:3]/np.maximum(a,1e-3),0)
        im=Image.fromarray(np.dstack([np.clip(rgb,0,255),a[...,0]*255]).astype(np.uint8),'RGBA').crop((x0,y0,x1,y1)).resize((fw,fh),Image.LANCZOS)
        sheet.paste(im,((i%COLS)*fw,(i//COLS)*fh))
    sheet.save(O+name+'.webp','WEBP',quality=90,method=6)
    json.dump([N,fw,fh,COLS],open(T+'m-'+name+'.json','w'));meta[name]=[N,fw,fh,COLS];print(name,fw,fh,os.path.getsize(O+name+'.webp')//1024,'KB')
if not only:json.dump(meta,open(T+'meta.json','w'))
