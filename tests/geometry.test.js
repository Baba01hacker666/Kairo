import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import {
  createTerrain,
  createGrassField,
  createTree,
  createRock,
  createBlock,
  createSphere,
  createPlane,
  createCylinder,
  createCone,
  createTorus,
  createCapsule,
  createIcosahedron,
  createDodecahedron
} from '../packages/geometry/src/index.ts';

test('createTerrain builds a heightmap mesh with deterministic heights', () => {
  const a = createTerrain({ size: 40, segments: 16, seed: 42, amplitude: 5, frequency: 0.08 });
  const b = createTerrain({ size: 40, segments: 16, seed: 42, amplitude: 5, frequency: 0.08 });

  assert.ok(a.mesh instanceof THREE.Mesh);
  assert.ok(a.geometry instanceof THREE.PlaneGeometry);
  assert.strictEqual(a.geometry.attributes.position.count, (16 + 1) * (16 + 1));

  // Same seed -> same height sampling
  assert.ok(Math.abs(a.heightAt(3, 5) - b.heightAt(3, 5)) < 1e-9);

  // Height is within [0, amplitude] across the field
  for (const [x, z] of [[0, 0], [10, 10], [-10, 5], [12, -8]]) {
    const h = a.heightAt(x, z);
    assert.ok(h >= -1e-6 && h <= 5 + 1e-6, `height ${h} out of range at ${x},${z}`);
  }

  // Different seed -> different heights
  const c = createTerrain({ size: 40, segments: 16, seed: 1, amplitude: 5, frequency: 0.08 });
  assert.ok(Math.abs(c.heightAt(3, 5) - a.heightAt(3, 5)) > 1e-6);
});

test('createTerrain stores vertex colors and positions on the surface', () => {
  const { geometry, mesh } = createTerrain({ size: 20, segments: 8, seed: 7, amplitude: 3 });
  assert.ok(geometry.attributes.color, 'terrain should have vertex colors');
  assert.strictEqual(geometry.attributes.color.itemSize, 3);
  assert.ok(mesh.receiveShadow);
  // Vertices should be displaced off the flat plane (some y != 0)
  const pos = geometry.attributes.position;
  let displaced = false;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getY(i)) > 1e-4) { displaced = true; break; }
  }
  assert.ok(displaced, 'terrain vertices should be displaced by the heightmap');
});

test('createGrassField returns an instanced mesh with the requested blade count', () => {
  const grass = createGrassField({ count: 500, area: 20, seed: 3 });
  assert.ok(grass instanceof THREE.InstancedMesh);
  assert.strictEqual(grass.count, 500);
  assert.strictEqual(grass.instanceMatrix.count, 500);

  // Same seed -> same blade placement (deterministic)
  const other = createGrassField({ count: 500, area: 20, seed: 3 });
  const m1 = grass.instanceMatrix.array.slice(0, 16);
  const m2 = other.instanceMatrix.array.slice(0, 16);
  assert.deepStrictEqual(Array.from(m1), Array.from(m2));
});

test('scenery helpers return sensible object graphs', () => {
  const tree = createTree({ position: [1, 2, 3], scale: 1.5 });
  assert.ok(tree instanceof THREE.Group);
  assert.deepStrictEqual(tree.position.toArray(), [1, 2, 3]);
  assert.ok(tree.children.length >= 2, 'tree should have trunk + canopy');

  const rock = createRock({ position: [0, 1, 0], scale: 2 });
  assert.ok(rock instanceof THREE.Mesh);
  assert.ok(rock.geometry.attributes.position.count >= 12);
});

test('primitives build ready-to-use meshes with shadows enabled', () => {
  const block = createBlock([2, 1, 3], { position: [0, 0, 0], color: 0xff0000 });
  assert.ok(block instanceof THREE.Mesh);
  assert.ok(block.geometry instanceof THREE.BoxGeometry);
  assert.strictEqual(block.castShadow, true);
  assert.strictEqual(block.receiveShadow, true);

  assert.ok(createSphere(1) instanceof THREE.Mesh);
  assert.ok(createPlane(4, 4) instanceof THREE.Mesh);
  assert.ok(createCylinder(0.5, 0.5, 2) instanceof THREE.Mesh);
  assert.ok(createCone(0.5, 2) instanceof THREE.Mesh);
  assert.ok(createTorus(1, 0.4) instanceof THREE.Mesh);
  assert.ok(createCapsule(0.5, 1) instanceof THREE.Mesh);
  assert.ok(createIcosahedron(1) instanceof THREE.Mesh);
  assert.ok(createDodecahedron(1) instanceof THREE.Mesh);
});
