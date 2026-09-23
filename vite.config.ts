import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AnimeBlackCore',
      fileName: 'anime-black-core',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        globals: {
          firebase: 'firebase',
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
