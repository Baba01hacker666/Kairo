import test from 'node:test';
import assert from 'node:assert';
import { AssetManager } from '../packages/assets/src/Assets.ts';

test('AssetManager instance API methods', () => {
  const manager = new AssetManager();

  assert.strictEqual(typeof manager.loadModel, 'function');
  assert.strictEqual(typeof manager.loadFont, 'function');
  assert.strictEqual(typeof manager.loadTexture, 'function');
  assert.strictEqual(typeof manager.loadImage, 'function');
  assert.strictEqual(typeof manager.loadJSON, 'function');
  assert.strictEqual(typeof manager.loadText, 'function');
});
