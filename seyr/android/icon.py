import sys,os
from PIL import Image,ImageDraw
out=sys.argv[1];here=os.path.dirname(os.path.abspath(__file__))
sh=Image.open(os.path.join(here,'..','assets','anim-garip-bekle.webp')).convert('RGBA');fw=186;fh=420
fr=sh.crop((0,0,fw,fh));bb=fr.getbbox();fr=fr.crop(bb);bust=fr.crop((0,0,fr.width,int(fr.height*.48)))
for d,s in {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}.items():
    S=s*4;base=Image.new('RGBA',(S,S),(20,33,61,255));g=ImageDraw.Draw(base)
    g.ellipse((S*.12,S*.1,S*.88,S*.86),fill=(201,138,62,255));g.ellipse((S*.16,S*.14,S*.84,S*.82),fill=(239,217,163,255))
    k=S*.78/bust.height;b=bust.resize((int(bust.width*k),int(bust.height*k)),Image.LANCZOS);base.alpha_composite(b,((S-b.width)//2,S-b.height-int(S*.02)))
    g.rounded_rectangle((S*.02,S*.02,S*.98,S*.98),S//6,outline=(201,162,74,255),width=int(S*.03))
    m=Image.new('L',(S,S),0);ImageDraw.Draw(m).rounded_rectangle((0,0,S-1,S-1),S//6,fill=255);ic=Image.new('RGBA',(S,S));ic.paste(base,(0,0),m)
    p=os.path.join(out,'mipmap-'+d);os.makedirs(p,exist_ok=True);ic.resize((s,s),Image.LANCZOS).save(p+'/ic_launcher.png')
