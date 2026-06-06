import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  injectRegister: false,
  devOptions: {
    enabled: true,
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    // skipWaiting: false → new SW waits in 'waiting' state until user confirms
    // clientsClaim must NOT be true, or the new SW takes over immediately
    skipWaiting: false,
    clientsClaim: false,
  },
  includeAssets: ['**/*'],
  manifest: {
    name: 'Doctor Companion',
    short_name: 'DC',
    description: 'An app that can help you in your daily tasks',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon',
      },
    ],
    theme_color: '#7e9c7f',
    background_color: '#464646',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    orientation: 'portrait',
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [VitePWA(manifestForPlugin)],
});
