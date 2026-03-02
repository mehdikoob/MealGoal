import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { transformWithEsbuild } from 'vite';

export default defineConfig({
  plugins: [
    // Treat .js files containing JSX as .jsx
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;
        return transformWithEsbuild(code, id, { loader: 'jsx' });
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
});
