# Seyr Pixel — videoların kendi seslerinden oyun sesleri. Her ses, şeridin kullandığı zaman aralığından kesilir,
# vuruşun başladığı yerden (en yüksek seviyenin %15'i) 5 ms önce başlar, en çok 1,4 sn, sonu yumuşak söner.
# Çıktı: assets/ses.json  {ad: data:audio/wav;base64,...}  (22 kHz mono)
import base64, io, json, os, subprocess, wave
import numpy as np

B = os.path.dirname(os.path.abspath(__file__)); K = os.path.join(B, 'kaynak')
SR = 22050
SESLER = {   # ad: (video, başlangıç sn, süre sn, en uzun sn, ses seviyesi çarpanı)
    'p-saldiri': ('saldiri-gemini.mp4', .9, 1.6, .7, 1),
    'p-kacin':   ('kacin-gemini.mp4', 3.8, 1.3, .7, 1),
    'p-darbe':   ('darbe-gemini.mp4', 1.15, 1.3, .8, 1),
    'p-yenilme': ('yenilme-gemini.mp4', .4, 4.8, 1.6, 1),
    'p-zafer':   ('zafer-gemini.mp4', 1.0, 3.0, 1.4, 1),
    'g-saldiri': ('dusman/golge-saldiri.mp4', 2.4, 1.6, .8, 1),
    'g-darbe':   ('dusman/golge-darbe.mp4', .9, 1.5, .8, 1),
    'g-ol':      ('dusman/golge-ol.mp4', 1.0, 3.0, 1.4, 1),
    'd-saldiri': ('dusman/dev-saldiri.mp4', 2.4, 2.0, 1.2, 1),
    'd-darbe':   ('dusman/dev-darbe-ham.mp4', 3.2, 2.0, 1.0, 1),
    'd-ol':      ('dusman/dev-ol.mp4', .3, 6.0, 2.0, 1),
}
cikti, rapor = {}, []
for ad, (v, bas, sure, enuzun, kat) in SESLER.items():
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(bas), '-t', str(sure), '-i', os.path.join(K, v), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    if len(x) == 0 or np.abs(x).max() < .01: rapor.append(f'{ad}: sessiz, atlandı'); continue
    w = SR // 200; env = np.array([np.abs(x[i:i + w]).max() for i in range(0, len(x) - w, w)])
    on = int(np.argmax(env > env.max() * .15)) * w
    y = x[max(0, on - SR // 200): max(0, on - SR // 200) + int(enuzun * SR)].copy()
    f = SR // 500; y[:f] *= np.linspace(0, 1, f); t = min(len(y) // 3, int(.25 * SR)); y[-t:] *= np.linspace(1, 0, t) ** 2
    y = y / (np.abs(y).max() + 1e-9) * .7 * kat
    b = io.BytesIO(); wv = wave.open(b, 'wb'); wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((y * 32767).astype(np.int16).tobytes()); wv.close()
    cikti[ad] = 'data:audio/wav;base64,' + base64.b64encode(b.getvalue()).decode()
    rapor.append(f'{ad}: +{on / SR:.2f} sn başlıyor, {len(y) / SR:.2f} sn')
json.dump(cikti, open(os.path.join(B, 'assets', 'ses.json'), 'w'))
print('\n'.join(rapor)); print('ses.json', os.path.getsize(os.path.join(B, 'assets', 'ses.json')) // 1024, 'KB')
