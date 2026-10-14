import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// The file is public build metadata, never user data or runtime configuration.
const commit = process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

export default defineConfig({
  plugins: [
    {
      name: 'release-identity',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ commit }),
        });
      },
    },
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'OS SYLVAR — صحتك بأسلوب حياتك',
        short_name: 'OS SYLVAR',
        description: 'صحتك... بأسلوب حياتك',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#17131b',
        background_color: '#151219',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webp}'],
        clientsClaim: true,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // Only the build's shell/assets are precached. No runtime data cache.
        runtimeCaching: [],
      },
      devOptions: { enabled: false },
    }),
  ],
});
