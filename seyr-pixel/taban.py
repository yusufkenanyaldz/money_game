# Her şeridin ayak hizasını (en alt opak satırın ortancası) json'a "taban" olarak yazar; oyun ayakları zemine buna göre oturtur.
import json, os, numpy as np
from PIL import Image
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
for grup in ('karakter', 'golge', 'dev'):
    p = os.path.join(A, grup + '.json')
    if not os.path.exists(p): continue
    M = json.load(open(p))
    for k, m in M.items():
        a = np.asarray(Image.open(os.path.join(A, (k if grup == 'karakter' else f'{grup}-{k}') + '.png')))[..., 3]; w = m['w']
        alt = [np.where(a[:, i * w:(i + 1) * w].any(1))[0] for i in range(m['n'])]
        m['taban'] = int(np.median([x.max() for x in alt if len(x)]))
    json.dump(M, open(p, 'w'), indent=1, ensure_ascii=False)
    print(grup, {k: (m['h'], m['taban']) for k, m in M.items()})
