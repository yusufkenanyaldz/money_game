# Mürekkep Damlası — tek dosya derleyici.
# kaynak.html içindeki Tailwind sınıflarından CSS üretir, yazı tiplerini gömer ve
# internetsiz çalışan Murekkep-Damlasi.html dosyasını yazar.
# Kullanım: python3 derle.py      (Node.js gerekir; Tailwind ilk seferde npx ile iner)
import base64, os, subprocess, sys, tempfile

BURASI = os.path.dirname(os.path.abspath(__file__))
KAYNAK = os.path.join(BURASI, 'kaynak.html')
CIKTI = os.path.join(BURASI, 'Murekkep-Damlasi.html')

LATIN = ('U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, '
         'U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD')
LATIN_EXT = ('U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, '
             'U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, '
             'U+2C60-2C7F, U+A720-A7FF')
FONTLAR = [('Cinzel', '600 900', 'cinzel-latinext', LATIN_EXT), ('Cinzel', '600 900', 'cinzel-latin', LATIN),
           ('Inter', '400 800', 'inter-latinext', LATIN_EXT), ('Inter', '400 800', 'inter-latin', LATIN)]


def font_css():
    parcalar = []
    for aile, agirlik, dosya, aralik in FONTLAR:
        veri = base64.b64encode(open(os.path.join(BURASI, 'fontlar', dosya + '.woff2'), 'rb').read()).decode()
        parcalar.append("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;"
                        "src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (aile, agirlik, veri, aralik))
    return ''.join(parcalar)


def tailwind_css():
    with tempfile.TemporaryDirectory() as t:
        giris, cikis = os.path.join(t, 'in.css'), os.path.join(t, 'out.css')
        open(giris, 'w').write('@tailwind base;\n@tailwind components;\n@tailwind utilities;\n')
        subprocess.run(['npx', '--yes', 'tailwindcss@3.4.17', '-i', giris, '-o', cikis, '--content', KAYNAK, '--minify'],
                       check=True, capture_output=True)
        return open(cikis).read()


def main():
    html = open(KAYNAK, encoding='utf-8').read()
    isaret = '<!-- STIL -->'
    if isaret not in html:
        sys.exit('kaynak.html içinde <!-- STIL --> işareti yok')
    html = html.replace(isaret, '<style>' + font_css() + tailwind_css() + '</style>')
    open(CIKTI, 'w', encoding='utf-8').write(html)
    print('✓', CIKTI, '(%d KB)' % (os.path.getsize(CIKTI) // 1024))


if __name__ == '__main__':
    main()
