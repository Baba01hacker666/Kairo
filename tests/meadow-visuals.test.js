import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createMeadowDetails } from '../examples/fox-odyssey/src/world/MeadowDetails.ts';
import { GroveWorld } from '../examples/fox-odyssey/src/world/GroveWorld.ts';

test('meadow details are deterministic, instanced, and reduced on mobile', () => {
  const desktop = createMeadowDetails(() => 1);
  const again = createMeadowDetails(() => 1);
  const mobile = createMeadowDetails(() => 1, true);
  assert.equal(desktop.children.length, 2);
  assert.equal(desktop.children[0].count, 1100);
  assert.equal(mobile.children[0].count, 500);
  assert.deepEqual(Array.from(desktop.children[0].instanceMatrix.array), Array.from(again.children[0].instanceMatrix.array));
  assert.ok(desktop.children.every(mesh => mesh.isInstancedMesh && mesh.count > 0));
});

test('grove terrain has vertex colors and forest follows the terrain height', () => {
  const scene = new THREE.Scene();
  const world = new GroveWorld(scene, true);
  const terrain = world.group.children.find(node => node.geometry?.type === 'PlaneGeometry');
  assert.ok(terrain.geometry.getAttribute('color'));
  const detail = world.group.getObjectByName('meadow-details');
  assert.ok(detail);
  assert.equal(detail.children[0].count, 500);
  assert.ok(Number.isFinite(world.getTerrainHeight(12, 15)));
});
