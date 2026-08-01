import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        stickman: 'examples/stickman-game/index.html',
        easy: 'examples/easy-game/index.html',
        cherry: 'examples/cherry-blossoms/index.html',
        gowasm: 'examples/go-wasm/index.html',
        gorunner: 'examples/go-runner/index.html',
        hqrender: 'examples/high-quality-render/index.html',
        foxgame: 'examples/fox-game/index.html',
        gofox: 'examples/go-fox/index.html',
        gdp: 'examples/gdp-explainer/index.html',
        babylonhavok: 'examples/babylon-havok/index.html',
        babylonshooter: 'examples/babylon-shooter/index.html',
        goraylib: 'examples/go-raylib-tester/index.html',
        editor: 'editor/index.html',
        aipathfinding: 'examples/ai-pathfinding/index.html',
        scifiexplorer: 'examples/scifi-explorer/index.html'
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
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
      '@kairo/plugins': '/packages/plugins/src/index.ts',
      '@kairo/ui': '/packages/ui/src/index.ts',
      '@kairo/tools': '/packages/tools/src/index.ts',
      '@kairo/events': '/packages/events/src/index.ts'
    }
  }
});
