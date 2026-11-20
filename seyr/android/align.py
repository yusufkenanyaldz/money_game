# zipalign eşdeğeri: sıkıştırılmamış girdilerin verisini 4 bayta hizalar.
import sys,zipfile
src,dst=sys.argv[1],sys.argv[2]
zi=zipfile.ZipFile(src);zo=zipfile.ZipFile(dst,'w')
for info in zi.infolist():
    data=zi.read(info.filename)
    n=zipfile.ZipInfo(info.filename,date_time=(2026,1,1,0,0,0));n.external_attr=info.external_attr
    n.compress_type=zipfile.ZIP_STORED if (info.compress_type==zipfile.ZIP_STORED or info.filename=='resources.arsc' or info.filename.endswith('.webp')) else zipfile.ZIP_DEFLATED
    if n.compress_type==zipfile.ZIP_STORED:
        off=zo.fp.tell()+30+len(n.filename.encode())
        n.extra=b'\x00'*((-off)%4)
    zo.writestr(n,data,compresslevel=9)
zo.close()
