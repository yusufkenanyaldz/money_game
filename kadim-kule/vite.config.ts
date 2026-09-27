import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Tek dosyalık çıktı: oyun tek bir index.html olarak her yerde (Artifact, itch.io, GitHub Pages) çalışır.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { target: 'es2020' },
});
