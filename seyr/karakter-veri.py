# Seyr — karakter verisini index.html'e yazar (ANIM, FACE_ALL, GECIS_ALL, ADIM_ALL, PUNCH_ALL, TEK_ALL, GORUNUM_SEVIYE).
# Kaynaklar: karakter-<görünüm>.json (karakter-isle.py), gecis.json / gecis-<görünüm>.json (gecis-isle.py)
# ve aşağıdaki elle ayarlanan tablolar. index.html'de /* KARAKTER-VERI */ ... /* /KARAKTER-VERI */ arası her seferinde yeniden yazılır.
# Kullanım: python3 karakter-veri.py
import json, os, re

BURASI = os.path.dirname(os.path.abspath(__file__))
YOL = os.path.join(BURASI, 'index.html')
GORUNUMLER = ['garip', 'yolcu', 'er', 'alp']
SEVIYE = [[10, 'yolcu'], [20, 'er'], [30, 'alp']]           # bu seviyeden itibaren bu görünüm

# --- Garip: elle (eski animasyon-isle.py şeritleri) ---
GARIP_ANIM = {"anim-garip-durus": [63, 320, 420, 6, 838], "anim-garip-yuru": [56, 231, 420, 6, 802], "anim-garip-yumruk": [30, 346, 420, 6, 800],
              "anim-garip-arka": [32, 170, 420, 6, 808], "anim-garip-kos": [29, 297, 420, 6, 790], "anim-garip-bekle": [36, 186, 420, 6, 806],
              "anim-garip-kacin": [30, 265, 420, 6, 792], "anim-garip-yuru2": [30, 246, 420, 6, 800]}
GARIP_FACE = {'bekle': -1, 'yuru': -1, 'yuru2': 1, 'kos': 1, 'durus': -1, 'yumruk': -1, 'kacin': -1, 'arka': 1}
GARIP_ADIM = {'yuru': [6.1, 15.4, 24.7, 34.1, 43.4, 52.7], 'kos': [0, 4.8, 9.6, 14.4, 19.3, 24.1], 'gkosdur': [-1, 5.5, 10.2, 15.1, 21.3, 26.3, 28.9]}

# --- Vuruş: from = vuruşun başladığı kare, hit = isabet, to = toparlanma; menzil px. (Er/Alp: hit = kolun en uzandığı kare)
PUNCH = {'garip': dict(from_=4, to=11, fps=16, hit=7, menzil=170),       # 4 gard, 7 tam uzanma, 11 geri çekilme
         'yolcu': dict(from_=31, to=43, fps=24, hit=38, menzil=215),     # 31 asa başın üstünde, 38 iner
         'er':    dict(from_=21, to=31, fps=20, hit=25, menzil=185),     # hançer
         'alp':   dict(from_=19, to=31, fps=20, hit=24, menzil=205)}     # pala
# --- Tek seferlik hareketler: kare aralığı ve süre (sn). kaçınma süresi oyunda 0,6 sn.
TEK = {'garip': {'kacin': (0, 13, .6)},
       'yolcu': {'kacin': (0, 23, .6)},
       'er':    {'kacin': (12, 22, .6)},
       'alp':   {'kacin': (4, 22, .6)}}
SURE = {'darbe': .7, 'yenilme': 1.8, 'zafer': None}      # None: kendi uzunluğunun %90'ı
HIZ = {'gkosdur': 1.3, 'gdur': 1.5, 'gbasla': 1.2}


def oku(ad):
    p = os.path.join(BURASI, ad)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else None


ANIM, FACE, GECIS, ADIM, PUNCH_ALL, TEK_ALL = dict(GARIP_ANIM), {}, {}, {}, {}, {}
for g in GORUNUMLER:
    k = oku(f'karakter-{g}.json')
    if g == 'garip': face = dict(GARIP_FACE); adim = dict(GARIP_ADIM)
    else:
        ANIM.update(k['ANIM']); face = dict(k['FACE']); adim = dict(k['ADIM'])
    ge = oku('gecis.json' if g == 'garip' else f'gecis-{g}.json')
    GECIS[g] = {}
    if ge:
        kay = ge['kay']
        for ad, v in ge['gecis'].items():
            ANIM[f'anim-{g}-{ad}'] = v['anim']; face[ad] = v['yon']
            src = 'bekle' if ad == 'gbasla' else ('yuru' if ad == 'gdur' else 'kos')
            hedef = 'yuru' if ad == 'gbasla' else 'bekle'
            bas = round(kay[src] * face[src] * v['yon'] - v['kayBas'], 1); son = round(kay[hedef] * face[hedef] * v['yon'] - v['kaySon'], 1)
            G = dict(cikis=v['cikis'], hedef=hedef, hiz=HIZ[ad], kay=[bas, son])
            if v['giris']: G['giris'] = [v['giris'][str(i)] for i in range(len(v['giris']))]
            if v['dur'] is not None: G['dur'] = v['dur']
            GECIS[g][ad] = G
            if ad == 'gkosdur' and 'gkosdur' not in adim and 'kos' in adim and len(adim['kos']) > 1:
                P = adim['kos'][1] - adim['kos'][0]; adim['gkosdur'] = [round(x * P, 1) for x in range(int(v['dur'] / P) + 1)]
    FACE[g] = face
    ADIM[g] = {st: dict(k=v, s='adim' if st == 'yuru' else 'kos', v=.45 if st == 'yuru' else (.5 if st == 'gkosdur' else .55)) for st, v in adim.items()}
    p = PUNCH[g]; PUNCH_ALL[g] = {'from': p['from_'], 'to': p['to'], 'fps': p['fps'], 'hit': p['hit'], 'menzil': p['menzil']}
    tek = {st: {'from': a, 'n': n, 'sure': s} for st, (a, n, s) in TEK[g].items()}
    for st in ('darbe', 'yenilme', 'zafer'):
        if st in face:
            N = ANIM[f'anim-{g}-{st}'][0]; tek[st] = {'from': 0, 'n': N, 'sure': SURE[st] or round(N / 15 * .9, 2)}
    TEK_ALL[g] = tek

j = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
blok = ('/* KARAKTER-VERI: karakter-veri.py üretir, elle değiştirme */\n'
        f'const ANIM={json.dumps(ANIM)};\n'
        f'const FACE_ALL={j(FACE)};   // görselin baktığı yön\n'
        '/* Köprü klipler: giris = kaynak döngünün her karesine en benzeyen giriş karesi; cikis = hedef döngünün başlanacak karesi;\n'
        '   dur = ayakların durduğu kare; kay = baş hizası (kaynak px, başta→sonda); hiz = oynatma hızı */\n'
        f'const GECIS_ALL={j(GECIS)};\n'
        '/* Ayak sesleri: ayağın yere bastığı kareler (görüntüdeki en açık adım; Garip videonun sesinden) */\n'
        f'const ADIM_ALL={j(ADIM)};\n'
        f'const PUNCH_ALL={j(PUNCH_ALL)};\n'
        '/* Tek seferlik hareketler: from = ilk kare, n = kare sayısı, sure = sn */\n'
        f'const TEK_ALL={j(TEK_ALL)};\n'
        f'const GORUNUM_SEVIYE={j(SEVIYE)};\n'
        "let KAR='garip',FACE=FACE_ALL.garip,GECIS=GECIS_ALL.garip,ADIM=ADIM_ALL.garip,PUNCH=PUNCH_ALL.garip,TEK=TEK_ALL.garip;window.MENZIL=PUNCH.menzil;\n"
        '/* /KARAKTER-VERI */')
h = open(YOL, encoding='utf-8').read()
if '/* KARAKTER-VERI' in h:
    h = re.sub(r'/\* KARAKTER-VERI:.*?/\* /KARAKTER-VERI \*/', lambda m: blok, h, count=1, flags=re.S)
else:
    raise SystemExit('index.html içinde KARAKTER-VERI bloğu yok')
open(YOL, 'w', encoding='utf-8').write(h)
print('✓ index.html:', ', '.join(f"{g}: {len(FACE[g])} hareket, geçiş {list(GECIS[g])}" for g in GORUNUMLER))
