import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  extends: ['..'],
  modules: ['@nuxt/eslint', 'shadcn-nuxt'],
  css: [join(currentDir, './assets/css/tailwind.css')],
  alias: {
    '@': currentDir,
  },
  compatibilityDate: '2025-09-04',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  eslint: {
    config: {
      // Use the generated ESLint config for lint root project as well
      rootDir: fileURLToPath(new URL('..', import.meta.url)),
      stylistic: {
        indent: 2,
        semi: false,
        quotes: 'single',
        jsx: true,
      },
    },
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
});
