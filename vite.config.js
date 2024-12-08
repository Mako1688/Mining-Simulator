import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Mining-Simulator/',
  plugins: [VitePWA()],
});