import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  publicDir: fileURLToPath(new URL('../../assets', import.meta.url)),
  server: { proxy: { '/auth': 'http://127.0.0.1:3000', '/health': 'http://127.0.0.1:3000', '/ws': { target: 'ws://127.0.0.1:3000', ws: true } } },
  build: { outDir: 'dist', emptyOutDir: true },
});
