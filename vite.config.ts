import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  devOptions: {
    enabled: true,
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
    // Aumentar límite para que el bundle principal (~2.4 MB) se precachee
    // Sin esto el SW omite el JS principal y la app falla offline
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
    // skipWaiting: true → el nuevo SW toma control inmediatamente sin esperar
    // clientsClaim: true → el SW activo controla todas las pestañas abiertas
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        // API calls: NetworkFirst con fallback a caché si no hay red
        urlPattern: ({ url }: { url: URL }) =>
          url.pathname.startsWith('/auth') || url.pathname.startsWith('/api'),
        handler: 'NetworkFirst' as const,
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 8,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 h
          },
        },
      },
    ],
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
