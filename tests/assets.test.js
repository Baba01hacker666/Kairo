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
  assert.strictEqual(typeof manager.autoFitModel, 'function');
  assert.strictEqual(typeof manager.generateAutoCollider, 'function');
});

test('AssetManager autoFitModel and generateAutoCollider', () => {
  const manager = new AssetManager();
  const geo = new THREE.BoxGeometry(4, 10, 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());

  const bounds = manager.autoFitModel(mesh, 2.0); // Target height 2.0m
  assert.strictEqual(Math.round(bounds.height), 2);

  const collider = manager.generateAutoCollider(mesh);
  assert.strictEqual(collider.height, bounds.height);
  assert.ok(collider.type === 'capsule' || collider.type === 'box');
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
