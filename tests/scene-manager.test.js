import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SceneManager } from '../packages/core/src/SceneManager.ts';

function fixture() {
  return {
    scene: new THREE.Scene(), clearObstacles() {},
    tweens: { killAll() {} }, dialogue: { stop() {} },
    cameraFX: { stopShake() {}, stopLookAt() {} }
  };
}

test('scene loads serialize async setup, dispose shared resources once and recover after failure', async () => {
  const app = fixture();
  const manager = new SceneManager(app);
  const geometry = new THREE.BoxGeometry();
  const texture = new THREE.Texture();
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const counts = { geometry: 0, texture: 0, material: 0 };
  geometry.addEventListener('dispose', () => counts.geometry++);
  texture.addEventListener('dispose', () => counts.texture++);
  material.addEventListener('dispose', () => counts.material++);
  app.scene.add(new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, material));
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const order = [];
  manager.define('slow', async () => { order.push('slow-start'); await gate; order.push('slow-end'); });
  manager.define('next', () => { order.push('next'); });
  const first = manager.load('slow');
  const second = manager.load('next');
  await Promise.resolve();
  assert.deepEqual(order, ['slow-start']);
  assert.equal(manager.currentScene, null);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(order, ['slow-start', 'slow-end', 'next']);
  assert.deepEqual(counts, { geometry: 1, texture: 1, material: 1 });
  assert.equal(manager.currentScene, 'next');
  manager.define('broken', () => { throw new Error('setup failed'); });
  await assert.rejects(manager.load('broken'), /setup failed/);
  assert.equal(manager.currentScene, null);
  await manager.load('next');
  assert.equal(manager.currentScene, 'next');
});
