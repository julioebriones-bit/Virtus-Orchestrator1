import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix: Use path.resolve('.') to get the current working directory as an absolute path.
      // This avoids a TypeScript type error with process.cwd() in some environments.
      '@': path.resolve('.'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
