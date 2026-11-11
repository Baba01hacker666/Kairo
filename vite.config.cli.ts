import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// The CLI is Node-only; do not pull it into the browser engine bundle.
export default defineConfig({
  build: {
    outDir: 'dist/cli',
    emptyOutDir: true,
    target: 'node22',
    ssr: resolve('packages/tools/src/cli.ts'),
    rollupOptions: { output: { entryFileNames: 'cli.js' } }
  }
});
