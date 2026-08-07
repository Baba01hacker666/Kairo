import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist/lib',
    emptyOutDir: true,
    minify: 'esbuild',
    target: 'es2022',
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, 'packages/core/src/index.ts'),
      name: 'Kairo',
      fileName: (format) => `kairo.${format === 'es' ? 'mjs' : format === 'cjs' ? 'cjs' : 'umd.js'}`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['three', 'cannon-es', '@babylonjs/core'],
      output: {
        globals: {
          three: 'THREE',
          'cannon-es': 'CANNON',
          '@babylonjs/core': 'BABYLON'
        },
        compact: true
      }
    }
  },
  resolve: {
    alias: {
      '@kairo/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@kairo/ecs': path.resolve(__dirname, 'packages/ecs/src/index.ts'),
      '@kairo/renderer': path.resolve(__dirname, 'packages/renderer/src/index.ts'),
      '@kairo/physics': path.resolve(__dirname, 'packages/physics/src/index.ts'),
      '@kairo/geometry': path.resolve(__dirname, 'packages/geometry/src/index.ts'),
      '@kairo/animation': path.resolve(__dirname, 'packages/animation/src/index.ts'),
      '@kairo/audio': path.resolve(__dirname, 'packages/audio/src/index.ts'),
      '@kairo/input': path.resolve(__dirname, 'packages/input/src/index.ts'),
      '@kairo/ai': path.resolve(__dirname, 'packages/ai/src/index.ts'),
      '@kairo/network': path.resolve(__dirname, 'packages/network/src/index.ts'),
      '@kairo/assets': path.resolve(__dirname, 'packages/assets/src/index.ts'),
      '@kairo/plugins': path.resolve(__dirname, 'packages/plugins/src/index.ts'),
      '@kairo/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
      '@kairo/tools': path.resolve(__dirname, 'packages/tools/src/index.ts'),
      '@kairo/events': path.resolve(__dirname, 'packages/events/src/index.ts')
    }
  }
});
