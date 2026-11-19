import sys,os
from PIL import Image,ImageDraw,ImageFilter
out=sys.argv[1];src=Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','fener.webp')).convert('RGBA')
for d,s in {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}.items():
    S=s*4;bg=Image.new('RGBA',(S,S),(0,0,0,0));m=Image.new('L',(S,S),0);ImageDraw.Draw(m).rounded_rectangle((0,0,S-1,S-1),S//5,fill=255)
    base=Image.new('RGBA',(S,S),(10,8,7,255));g=Image.new('RGBA',(S,S),(0,0,0,0));ImageDraw.Draw(g).ellipse((S*.18,S*.22,S*.82,S*.86),fill=(224,140,60,150))
    base=Image.alpha_composite(base,g.filter(ImageFilter.GaussianBlur(S*.1)))
    h=int(S*.84);w=int(h*src.width/src.height);l=src.resize((w,h),Image.LANCZOS);base.alpha_composite(l,((S-w)//2,int(S*.08)))
    bg.paste(base,(0,0),m);p=os.path.join(out,'mipmap-'+d);os.makedirs(p,exist_ok=True);bg.resize((s,s),Image.LANCZOS).save(p+'/ic_launcher.png')
