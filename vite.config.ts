import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Kairo/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@kairo/core': '/packages/core/src/index.ts',
      '@kairo/ecs': '/packages/ecs/src/index.ts',
      '@kairo/renderer': '/packages/renderer/src/index.ts',
      '@kairo/physics': '/packages/physics/src/index.ts',
      '@kairo/animation': '/packages/animation/src/index.ts',
      '@kairo/audio': '/packages/audio/src/index.ts',
      '@kairo/input': '/packages/input/src/index.ts',
      '@kairo/ai': '/packages/ai/src/index.ts',
      '@kairo/network': '/packages/network/src/index.ts',
      '@kairo/assets': '/packages/assets/src/index.ts',
      '@kairo/plugins': '/packages/plugins/src/index.ts'
    }
  }
});
