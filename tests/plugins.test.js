import test from 'node:test';
import assert from 'node:assert';
import { PluginManager } from '../packages/plugins/src/Plugins.ts';
import { Engine } from '../packages/core/src/Engine.ts';

test('PluginManager lifecycle hooks and dependency tracking', () => {
  const engine = new Engine();
  const pluginManager = new PluginManager();

  let loaded = false;
  let updated = false;

  const testPlugin = {
    meta: {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      author: 'Kairo Team',
      description: 'Unit test plugin'
    },
    onLoad(eng) {
      loaded = true;
    },
    onUpdate(eng, dt) {
      updated = true;
    }
  };

  pluginManager.registerPlugin(testPlugin, engine);
  assert.strictEqual(loaded, true);
  assert.strictEqual(pluginManager.hasPlugin('test-plugin'), true);

  // Trigger engine update event
  engine.events.emit('update', 0.016);
  assert.strictEqual(updated, true);

  // Unregister
  pluginManager.unregisterPlugin('test-plugin', engine);
  assert.strictEqual(pluginManager.hasPlugin('test-plugin'), false);
});
