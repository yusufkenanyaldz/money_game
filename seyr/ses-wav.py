# Seyr — oyunda çalınan video seslerini kırpılmış WAV olarak assets/ses/ses.js'e gömer (window.SES_DOSYA).
# MP3 her sesin başına 20-30 ms (bir yumrukta 154 ms) sessizlik ekliyordu; burada her ses vuruştan 5 ms önce başlar.
# Kullanım: python3 ses-wav.py
import base64, io, json, os, subprocess, wave
import numpy as np
BURASI = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(BURASI, 'assets', 'ses')
SR = 32000
ADLAR = ([f'adim-{i}' for i in range(1, 6)] + [f'kosu-adim-{i}' for i in range(1, 7)] +
         [f'yumruk-{i}' for i in range(1, 6)] + ['kacin-1', 'durus-1', 'durus-2'])
paket, rapor = {}, []
for ad in ADLAR:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(D, ad + '.mp3'), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    w = SR // 1000                                            # 1 ms pencere
    env = np.array([np.abs(x[i:i + w]).max() for i in range(0, len(x) - w, w)])
    on = int(np.argmax(env > env.max() * .15)) * w            # vuruşun başladığı yer
    bas = max(0, on - 5 * w); y = x[bas:].copy()
    f = 2 * w; y[:f] *= np.linspace(0, 1, f)                   # 2 ms yumuşak başlangıç (tık olmasın)
    b = io.BytesIO(); wv = wave.open(b, 'wb'); wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); wv.close()
    paket[ad] = 'data:audio/wav;base64,' + base64.b64encode(b.getvalue()).decode()
    rapor.append(f'{ad}: baştan {bas / SR * 1000:.0f} ms kırpıldı, {len(y) / SR:.2f} sn')
open(os.path.join(D, 'ses.js'), 'w').write('window.SES_DOSYA=' + json.dumps(paket) + ';\n')
print('\n'.join(rapor)); print('ses.js', os.path.getsize(os.path.join(D, 'ses.js')) // 1024, 'KB')
