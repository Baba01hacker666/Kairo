import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import {
  createTerrain,
  createGrassField,
  createTree,
  createRock,
  createTreeField,
  createRockField,
  createCloudField,
  createBlock,
  createSphere,
  createPlane,
  createCylinder,
  createCone,
  createTorus,
  createCapsule,
  createIcosahedron,
  createDodecahedron,
  deriveCollider
} from '../packages/geometry/src/index.ts';
import { ColliderType } from '../packages/physics/src/Physics.ts';

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

test('createTreeField collapses a forest into a few instanced draw calls', () => {
  const field = createTreeField({
    trees: [
      { position: [0, 0, 0], scale: 1.0, canopyColor: 0x2d6a4f },
      { position: [5, 0, 3], scale: 1.5, canopyColor: 0x40916c },
      { position: [-4, 0, 2], scale: 1.25, canopyColor: 0x2d6a4f }
    ]
  });

  assert.ok(field instanceof THREE.Group);
  // Trunk + canopy + blob InstancedMeshes — one draw call per part, not per tree
  assert.strictEqual(field.children.length, 3);
  field.children.forEach(mesh => {
    assert.ok(mesh instanceof THREE.InstancedMesh);
    assert.strictEqual(mesh.count, 3, 'every part mesh has one instance per tree');
  });

  // Canopies sit above their trunks (different instance matrices)
  const trunkY = field.children[0].instanceMatrix.array[13];
  const canopyY = field.children[1].instanceMatrix.array[13];
  assert.ok(canopyY > trunkY, 'canopy should be raised above the trunk');
});

test('createRockField and createCloudField return instanced meshes', () => {
  const rocks = createRockField({
    rocks: [
      { position: [0, 0, 0], scale: 1 },
      { position: [3, 0, 1], scale: 2 },
      { position: [-2, 0, 4], scale: 0.5 }
    ]
  });
  assert.ok(rocks instanceof THREE.InstancedMesh);
  assert.strictEqual(rocks.count, 3);

  // Bigger rock -> bigger instance scale (column-major diagonal)
  const smallScale = rocks.instanceMatrix.array[0];
  const bigIndex = 1 * 16;
  const bigScale = rocks.instanceMatrix.array[bigIndex];
  assert.ok(bigScale > smallScale, 'scaled-up rock should have a larger instance matrix');

  const clouds = createCloudField({
    clouds: [
      { position: [0, 10, 0], scale: 1 },
      { position: [10, 20, 5], scale: 2 }
    ]
  });
  assert.ok(clouds instanceof THREE.Group);
  const cloudMesh = clouds.children[0];
  assert.ok(cloudMesh instanceof THREE.InstancedMesh);
  assert.strictEqual(cloudMesh.count, 8, '4 puffs per cloud x 2 clouds');
  assert.strictEqual(cloudMesh.castShadow, false, 'clouds should not cast shadows');
});

test('deriveCollider maps primitive geometry to the right collider type', () => {
  const box = deriveCollider(createBlock([2, 1, 3]));
  assert.strictEqual(box.type, ColliderType.Box);
  assert.ok(Math.abs(box.size.x - 2) < 1e-6 && Math.abs(box.size.y - 1) < 1e-6 && Math.abs(box.size.z - 3) < 1e-6);

  const sphere = deriveCollider(createSphere(1));
  assert.strictEqual(sphere.type, ColliderType.Sphere);
  assert.ok(Math.abs(sphere.size.x - 2) < 1e-6, 'sphere diameter ~2');

  const capsule = deriveCollider(createCapsule(0.5, 1));
  assert.strictEqual(capsule.type, ColliderType.Capsule);
  assert.ok(capsule.size.x > 0 && capsule.size.y > 0, 'capsule collider has positive extents');

  const torus = deriveCollider(createTorus(1, 0.4));
  assert.strictEqual(torus.type, ColliderType.Box, 'torus falls back to a box');

  // A scaled mesh yields a scaled collider (world scale is respected).
  const scaled = createBlock([2, 1, 3]);
  scaled.scale.set(2, 2, 2);
  const scaledBox = deriveCollider(scaled);
  assert.ok(Math.abs(scaledBox.size.y - 2) < 1e-6, 'size follows world scale');
});

test('createGrassField pins blades to the terrain via heightAt', () => {
  const grass = createGrassField({ count: 1, height: [1, 1], seed: 3, heightAt: () => 5 });
  // instanceMatrix is column-major; element [13] is the translation y.
  const ty = grass.instanceMatrix.array[13];
  // Blade base is anchored 0.03 below the surface so it grows out of the ground.
  assert.ok(Math.abs(ty - 4.97) < 1e-4, `blade should sit on height ${ty}, expected ~4.97`);

  // Without heightAt the blade rests at y ≈ -0.03 (the base anchor, below the plane).
  const flat = createGrassField({ count: 1, height: [1, 1], seed: 3 });
  assert.ok(Math.abs(flat.instanceMatrix.array[13] + 0.03) < 1e-6, 'flat grass sits at the base anchor');
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
