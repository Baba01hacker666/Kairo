import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { AssetManager } from '../packages/assets/src/Assets.ts';
import { MeshCompressor } from '../packages/assets/src/MeshCompressor.ts';

test('AssetManager instance API methods', () => {
  const manager = new AssetManager();

  assert.strictEqual(typeof manager.loadModel, 'function');
  assert.strictEqual(typeof manager.loadFont, 'function');
  assert.strictEqual(typeof manager.loadTexture, 'function');
  assert.strictEqual(typeof manager.loadImage, 'function');
  assert.strictEqual(typeof manager.loadJSON, 'function');
  assert.strictEqual(typeof manager.loadText, 'function');
});

test('MeshCompressor vertex optimization & quantization', () => {
  // Create un-indexed cube mesh with duplicate vertices
  const geo = new THREE.BoxGeometry(2, 2, 2).toNonIndexed();
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());

  const originalCount = geo.getAttribute('position').count;
  const stats = MeshCompressor.optimizeMesh(mesh);

  assert.strictEqual(stats.originalVertices, originalCount);
  assert.strictEqual(stats.compressedVertices, 8); // Deduplicates 36 unindexed vertices to 8 unique corner vertices!
  assert.strictEqual(typeof stats.reductionPercentage, 'number');

  const quantizedGeo = MeshCompressor.quantizeGeometry(geo);
  assert.ok(quantizedGeo.getAttribute('quantizedPosition'));
});
