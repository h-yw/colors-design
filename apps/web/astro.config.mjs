// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
const isPro = process.env.NODE_ENV === 'production';
// https://astro.build/config
export default defineConfig({
  // GitHub Pages configuration
  // Replace with your actual site URL, e.g., 'https://yourname.github.io'
  site: process.env.SITE || 'https://h-yw.github.io',
  // Replace with your repo name if not at root, e.g., '/my-repo'
  base: isPro ?process.env.BASE || '/colors-design/' : '/',
  server: {
    port: 9527
  },

  integrations: [react()]
});