import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { wedding } from './src/config/wedding';

/**
 * The base path is taken from wedding.siteUrl, so GitHub Pages
 * (https://<user>.github.io/<repo>/) and a custom domain (https://example.com/)
 * both work by editing only src/config/wedding.ts.
 */
const site = new URL(wedding.siteUrl);
const base = site.pathname.endsWith('/') ? site.pathname : `${site.pathname}/`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'wedding-meta',
      transformIndexHtml: {
        order: 'pre',
        handler(html: string) {
        const uploadUrl = new URL(wedding.memories.uploadPath, wedding.siteUrl).href;
        const vars: Record<string, string> = {
          TITLE: wedding.meta.title,
          DESCRIPTION: wedding.meta.description,
          SITE_URL: wedding.siteUrl,
          UPLOAD_URL: uploadUrl,
          UPLOAD_TITLE: `${wedding.memories.uploadTitle} | ${wedding.groom.first} & ${wedding.bride.first}`,
          UPLOAD_DESCRIPTION: wedding.memories.uploadSubtitle,
          OG_IMAGE: new URL(wedding.meta.ogImage, wedding.siteUrl).href,
          THEME_COLOR: wedding.meta.themeColor,
          NAMES: `${wedding.groom.first} & ${wedding.bride.first}`,
        };
        return html.replace(/%WEDDING_(\w+)%/g, (_, k: string) => esc(vars[k] ?? ''));
        },
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        upload: resolve(__dirname, 'upload-memories/index.html'),
        manage: resolve(__dirname, 'manage-memories/index.html'),
      },
    },
  },
  test: { environment: 'node' },
});
