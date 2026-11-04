import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@kit': new URL('../src', import.meta.url).pathname },
    dedupe: ['react', 'react-dom', 'lucide-react'],
  },
  build: { outDir: 'dist', emptyOutDir: true, modulePreload: { polyfill: false }, assetsInlineLimit: 0 },
});
