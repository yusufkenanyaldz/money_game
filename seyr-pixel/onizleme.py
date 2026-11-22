# Seyr Pixel — oyunu (oyun.js) ve assets/ şeritlerini gömerek telefonda açılan tek dosya üretir: onizleme.html
import base64, json, os
BURASI = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(BURASI, 'assets')
meta = json.load(open(os.path.join(A, 'karakter.json')))
ui = {k: 'data:image/png;base64,' + base64.b64encode(open(os.path.join(A, f'ui-{k}.png'), 'rb').read()).decode() for k in ('vur', 'kac', 'ok') if os.path.exists(os.path.join(A, f'ui-{k}.png'))}
seritler = {k: 'data:image/png;base64,' + base64.b64encode(open(os.path.join(A, k + '.png'), 'rb').read()).decode() for k in meta}
oyun = open(os.path.join(BURASI, 'oyun.js'), encoding='utf-8').read()
SAYFA = r'''<title>Seyr Pixel</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap">
<style>
/* Tek ekran oyun: koyu gece paleti, tek tema. Oyun 320x180 çizilir, tam katla büyütülür. */
:root{--zemin:#14161f;--yazi:#e8e2d0;--soluk:#8a8fa3;--altin:#d9ad4f;color-scheme:dark}
html,body{height:100%;margin:0;background:var(--zemin);color:var(--yazi);font:14px/1.4 system-ui,sans-serif;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
#sahne{position:fixed;inset:0;display:grid;place-items:center}
canvas{image-rendering:pixelated;image-rendering:crisp-edges;display:block}
.tus{position:fixed;bottom:calc(16px + env(safe-area-inset-bottom,0px));width:62px;height:62px;border-radius:50%;border:2px solid var(--altin);background:rgba(20,22,31,.55);color:var(--altin);font:12px "Press Start 2P",monospace;touch-action:none;-webkit-tap-highlight-color:transparent}
#sol{left:max(16px,env(safe-area-inset-left,0px))}#sag{left:calc(max(16px,env(safe-area-inset-left,0px)) + 74px)}
#vur{right:max(16px,env(safe-area-inset-right,0px));width:72px;height:72px}#kac{right:calc(max(16px,env(safe-area-inset-right,0px)) + 84px)}
.tus.on{background:var(--altin);color:var(--zemin)}
.tus.res{border:0;border-radius:0;background:center/contain no-repeat;image-rendering:pixelated;color:transparent;filter:drop-shadow(0 2px 0 rgba(0,0,0,.5))}
.tus.res.on{background-color:transparent;filter:brightness(.7);transform:translateY(2px)}
#sol.res{transform:scaleX(-1)}#sol.res.on{transform:scaleX(-1) translateY(2px)}
#vur.res{width:80px;height:80px}#kac.res{width:68px;height:68px}
#yardim{position:fixed;top:calc(6px + env(safe-area-inset-top,0px));left:0;right:0;text-align:center;color:var(--soluk);font-size:11px;pointer-events:none}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<div id="sahne"><canvas id="c" width="320" height="180" aria-label="Seyr Pixel: Gaflet Ovası"></canvas></div>
<p id="yardim">◀ ▶ yürü (basılı tut: koş) · VUR · KAÇ — düşman kızarınca kaç, sersemleyince vur · klavye ← → J K</p>
<button class="tus" id="sol" aria-label="Sola">◀</button><button class="tus" id="sag" aria-label="Sağa">▶</button>
<button class="tus" id="kac" aria-label="Kaç">KAÇ</button><button class="tus" id="vur" aria-label="Vur">VUR</button>
<script>window.META=__META__;window.SERIT=__SERIT__;</script>
<script>__OYUN__</script>
'''
ek = ''.join(f"document.querySelectorAll('{s}').forEach(b=>{{b.classList.add('res');b.style.backgroundImage='url({ui[k]})'}});" for s, k in (('#vur', 'vur'), ('#kac', 'kac'), ('#sol,#sag', 'ok')) if k in ui)
SAYFA = SAYFA.replace('<script>window.META', '<script>' + ek + '</script>\n<script>window.META')
html = SAYFA.replace('__META__', json.dumps(meta)).replace('__SERIT__', json.dumps(seritler)).replace('__OYUN__', oyun.replace('</script', '<\\/script'))
open(os.path.join(BURASI, 'onizleme.html'), 'w', encoding='utf-8').write(html)
print('✓ onizleme.html', os.path.getsize(os.path.join(BURASI, 'onizleme.html')) // 1024, 'KB')
