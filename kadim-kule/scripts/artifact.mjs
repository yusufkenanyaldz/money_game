// dist/index.html'den Artifact sayfası üretir: Artifact yayını kendi <html>/<head>/<body>
// iskeletini eklediği için yalnızca başlık, bağlantılar, stil ve betik bırakılır.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? '';

// Simge bağlantıları bırakılmaz: Artifact kendi sekme simgesini kullanır.
const keep = [
  ...head.matchAll(/<title>[\s\S]*?<\/title>|<link\b[^>]*>|<style\b[^>]*>[\s\S]*?<\/style>|<script\b[^>]*>[\s\S]*?<\/script>/gi),
]
  .map((m) => m[0])
  .filter((tag) => !/^<link\b/i.test(tag) || /fonts\.(googleapis|gstatic)\.com/.test(tag));

const out = [...keep, body.trim()].join('\n');
mkdirSync(new URL('../dist-artifact/', import.meta.url), { recursive: true });
writeFileSync(new URL('../dist-artifact/kadim-kule.html', import.meta.url), out);
console.log(`dist-artifact/kadim-kule.html yazıldı (${(out.length / 1024).toFixed(0)} KB)`);
