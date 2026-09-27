// Ana ekran simgesini (180×180 PNG) üretip index.html'e data URI olarak gömer.
// Bir kez çalıştırılır: node scripts/app-icon.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#1f2b6e"/><stop offset="1" stop-color="#060918"/></radialGradient>
    <radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#45dcc8" stop-opacity=".55"/><stop offset="1" stop-color="#45dcc8" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="180" height="180" fill="url(#g)"/>
  <circle cx="90" cy="92" r="70" fill="url(#h)"/>
  <g fill="none" stroke="#f3c35a" stroke-opacity=".6" stroke-width="2">
    <rect x="42" y="44" width="96" height="96"/>
    <rect x="42" y="44" width="96" height="96" transform="rotate(45 90 92)"/>
  </g>
  <g transform="translate(90 92) scale(.62) translate(-100 -118)">
    <polygon points="100,20 58,80 100,96" fill="#c8fff6"/>
    <polygon points="100,20 100,96 142,80" fill="#57d9c9"/>
    <polygon points="58,80 58,158 100,174 100,96" fill="#3fcfbe"/>
    <polygon points="100,96 100,174 142,158 142,80" fill="#178f88"/>
    <polygon points="58,158 100,214 100,174" fill="#1c948f"/>
    <polygon points="100,174 100,214 142,158" fill="#0c4f5a"/>
    <polygon points="100,28 68,78 80,82" fill="#fff" fill-opacity=".5"/>
  </g>
</svg>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
await page.setContent(`<body style="margin:0">${svg}</body>`);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const file = new URL('../index.html', import.meta.url);
const html = readFileSync(file, 'utf8');
const tag = `<link rel="apple-touch-icon" href="data:image/png;base64,${png.toString('base64')}" />`;
const favicon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(svg)}" />`;
const cleaned = html.replace(/\s*<link rel="(apple-touch-icon|icon)"[^>]*>/g, '');
writeFileSync(file, cleaned.replace('</title>', `</title>\n    ${favicon}\n    ${tag}`));
console.log(`Simge gömüldü (${(png.length / 1024).toFixed(1)} KB)`);
