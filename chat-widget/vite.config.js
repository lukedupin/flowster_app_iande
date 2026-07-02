import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.js'
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    },
    build: {
        minify: false,          // <‑‑ important: no minifier runs
        sourcemap: true,        // optional – keeps a source map for debugging
        lib: {
          entry: './src/main.jsx',
          name: 'ChatWidget',
          fileName: 'chat-widget',
          formats: ['iife']
        },
        rollupOptions: {
          input: 'src/main.jsx',
          output: {
            assetFileNames: 'chat-widget.[ext]'
          }
        }
    }
})
