import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Vendor split.
         *
         * Route and sheet splitting shrinks the entry, but without this the
         * three libraries still ride along inside it -- so every deploy, even a
         * one-line copy change, invalidates React and Framer in everyone's
         * cache along with our own code. Pinning them to their own chunks means
         * a normal release re-downloads only the app.
         *
         * Framer is deliberately its own chunk rather than folded into a single
         * `vendor`: it is the largest of the three and the most likely to be
         * trimmed later, and keeping it separate makes that visible in the
         * build output instead of hidden inside an aggregate.
         */
        /* Matched on the resolved path rather than declared as an id list.
           `['react', 'react-dom']` only claims those two entry modules, so the
           app's actual imports -- `react-dom/client`, the JSX runtime,
           scheduler, and Framer's `motion-dom` / `motion-utils` siblings --
           fell through into the entry chunk and left a 4 kB "react" chunk next
           to a 240 kB one. */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
            return 'motion';
          }
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons';
        },
      },
    },
  },
});
