import * as THREE from 'three';
import { PRNG } from '../../core/src/Procedural.ts';

/**
 * @kairo/geometry — Small composite scenery helpers (trees, rocks, clouds).
 * These are the "default objects" examples kept re-building by hand.
 */

export interface TreeOptions {
  position?: [number, number, number];
  scale?: number;
  seed?: number;
  trunkColor?: number | string;
  canopyColor?: number | string;
  trunkHeight?: number;
  trunkRadius?: number;
  canopyRadius?: number;
}

/** A stylized low-poly tree (cylinder trunk + dodecahedron canopy). */
export function createTree(opts: TreeOptions = {}): THREE.Group {
  const pos = opts.position ?? [0, 0, 0];
  const s = opts.scale ?? 1;
  const trunkHeight = (opts.trunkHeight ?? 2.2) * s;
  const trunkRadius = (opts.trunkRadius ?? 0.25) * s;
  const canopyRadius = (opts.canopyRadius ?? 1.5) * s;
  const prng = new PRNG(opts.seed ?? Math.floor(Math.random() * 99999));

  const group = new THREE.Group();
  group.position.set(...pos);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8),
    new THREE.MeshStandardMaterial({ color: opts.trunkColor ?? 0x6b4a2b, roughness: 1.0 })
  );
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  group.add(trunk);

  const canopyMat = new THREE.MeshStandardMaterial({ color: opts.canopyColor ?? 0x3c7a2e, roughness: 0.9 });
  const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(canopyRadius, 1), canopyMat);
  canopy.position.y = trunkHeight + canopyRadius * 0.6;
  canopy.castShadow = true;
  group.add(canopy);

  // Optional second blob for a rounder silhouette
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(canopyRadius * 0.55, 1), canopyMat);
  blob.position.set(canopyRadius * 0.5, trunkHeight + canopyRadius * 0.3, prng.nextFloat(-0.3, 0.3));
  blob.castShadow = true;
  group.add(blob);

  return group;
}

export interface RockOptions {
  position?: [number, number, number];
  scale?: number;
  seed?: number;
  color?: number | string;
  radius?: number;
}

/** A lumpy low-poly rock with perturbed vertices. */
export function createRock(opts: RockOptions = {}): THREE.Mesh {
  const pos = opts.position ?? [0, 0, 0];
  const s = opts.scale ?? 1;
  const radius = (opts.radius ?? 0.6) * s;
  const prng = new PRNG(opts.seed ?? Math.floor(Math.random() * 99999));

  const geo = new THREE.DodecahedronGeometry(radius, 1);
  const aPos = geo.attributes.position;
  for (let i = 0; i < aPos.count; i++) {
    const x = aPos.getX(i);
    const y = aPos.getY(i);
    const z = aPos.getZ(i);
    const stretch = 1 + prng.nextFloat(-0.25, 0.35);
    aPos.setXYZ(i, x * stretch, y * stretch, z * stretch);
  }
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: opts.color ?? 0x8a8a8a, roughness: 0.95 })
  );
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export interface CloudOptions {
  position?: [number, number, number];
  scale?: number;
  color?: number | string;
}

/**
 * Instanced scenery builders.
 *
 * Scattering hundreds of trees/rocks/clouds as individual meshes explodes the
 * draw-call count (each one also renders again into the shadow map). These
 * field builders collapse a whole population into a handful of InstancedMesh
 * draw calls — one per part type — while keeping per-instance color via
 * `instanceColor`. Use them whenever you need a forest, a rock field or a sky
 * full of clouds instead of a `for` loop of `createTree`/`createRock`.
 */

export interface TreeFieldItem extends TreeOptions {
  position: [number, number, number];
}

export interface TreeFieldOptions {
  trees: TreeFieldItem[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/** A whole forest as 3 InstancedMesh draw calls (trunks, canopies, blobs). */
export function createTreeField(opts: TreeFieldOptions): THREE.Group {
  const trees = opts.trees;
  const count = trees.length;
  const group = new THREE.Group();
  if (count === 0) return group;

  // Unit geometries, scaled per instance so every tree keeps its own size
  const trunkGeo = new THREE.CylinderGeometry(0.8, 1, 1, 8);
  const canopyGeo = new THREE.DodecahedronGeometry(1, 1);
  const blobGeo = new THREE.IcosahedronGeometry(1, 1);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, count);
  const blobMesh = new THREE.InstancedMesh(blobGeo, canopyMat, count);

  const dummy = new THREE.Object3D();
  const trunkColors = new Float32Array(count * 3);
  const canopyColors = new Float32Array(count * 3);

  trees.forEach((tree, idx) => {
    const pos = tree.position;
    const s = tree.scale ?? 1;
    const trunkHeight = (tree.trunkHeight ?? 2.2) * s;
    const trunkRadius = (tree.trunkRadius ?? 0.25) * s;
    const canopyRadius = (tree.canopyRadius ?? 1.5) * s;

    // Deterministic per-tree jitter (index-seeded) so instances don't overlap
    const prng = new PRNG((tree.seed ?? 0) + idx * 7919);
    const blobZ = prng.nextFloat(-0.3, 0.3);

    // Trunk: unit tapered cylinder scaled by (radius, height, radius)
    dummy.position.set(pos[0], pos[1] + trunkHeight / 2, pos[2]);
    dummy.scale.set(trunkRadius, trunkHeight, trunkRadius);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(idx, dummy.matrix);

    // Canopy
    dummy.position.set(pos[0], pos[1] + trunkHeight + canopyRadius * 0.6, pos[2]);
    dummy.scale.set(canopyRadius, canopyRadius, canopyRadius);
    dummy.updateMatrix();
    canopyMesh.setMatrixAt(idx, dummy.matrix);

    // Secondary blob for a rounder silhouette
    dummy.position.set(
      pos[0] + canopyRadius * 0.5,
      pos[1] + trunkHeight + canopyRadius * 0.3,
      pos[2] + blobZ
    );
    dummy.scale.set(canopyRadius * 0.55, canopyRadius * 0.55, canopyRadius * 0.55);
    dummy.updateMatrix();
    blobMesh.setMatrixAt(idx, dummy.matrix);

    const tc = new THREE.Color(tree.trunkColor ?? 0x6b4a2b);
    const cc = new THREE.Color(tree.canopyColor ?? 0x3c7a2e);
    trunkColors[idx * 3] = tc.r; trunkColors[idx * 3 + 1] = tc.g; trunkColors[idx * 3 + 2] = tc.b;
    canopyColors[idx * 3] = cc.r; canopyColors[idx * 3 + 1] = cc.g; canopyColors[idx * 3 + 2] = cc.b;
  });

  trunkMesh.instanceMatrix.needsUpdate = true;
  canopyMesh.instanceMatrix.needsUpdate = true;
  blobMesh.instanceMatrix.needsUpdate = true;

  // Per-instance colors (white base material × instance color)
  trunkMesh.instanceColor = new THREE.InstancedBufferAttribute(trunkColors, 3);
  canopyMesh.instanceColor = new THREE.InstancedBufferAttribute(canopyColors, 3);
  blobMesh.instanceColor = new THREE.InstancedBufferAttribute(canopyColors, 3);

  const castShadow = opts.castShadow ?? true;
  const receiveShadow = opts.receiveShadow ?? false;
  [trunkMesh, canopyMesh, blobMesh].forEach(m => {
    m.castShadow = castShadow;
    m.receiveShadow = receiveShadow;
  });

  group.add(trunkMesh, canopyMesh, blobMesh);
  return group;
}

export interface RockFieldItem extends RockOptions {
  position: [number, number, number];
}

export interface RockFieldOptions {
  rocks: RockFieldItem[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/** A rock field as a single InstancedMesh draw call. */
export function createRockField(opts: RockFieldOptions): THREE.InstancedMesh {
  const rocks = opts.rocks;
  const count = rocks.length;

  // One lumpy unit dodecahedron shared by every rock
  const geo = new THREE.DodecahedronGeometry(1, 1);
  const aPos = geo.attributes.position;
  const prng = new PRNG(0x5eed);
  for (let i = 0; i < aPos.count; i++) {
    const x = aPos.getX(i);
    const y = aPos.getY(i);
    const z = aPos.getZ(i);
    const stretch = 1 + prng.nextFloat(-0.25, 0.35);
    aPos.setXYZ(i, x * stretch, y * stretch, z * stretch);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  const colors = new Float32Array(count * 3);

  rocks.forEach((rock, idx) => {
    const pos = rock.position;
    const radius = (rock.radius ?? 0.6) * (rock.scale ?? 1);
    dummy.position.set(...pos);
    dummy.scale.set(radius, radius, radius);
    dummy.updateMatrix();
    mesh.setMatrixAt(idx, dummy.matrix);

    const c = new THREE.Color(rock.color ?? 0x8a8a8a);
    colors[idx * 3] = c.r; colors[idx * 3 + 1] = c.g; colors[idx * 3 + 2] = c.b;
  });

  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  return mesh;
}

export interface CloudFieldItem extends CloudOptions {
  position: [number, number, number];
}

export interface CloudFieldOptions {
  clouds: CloudFieldItem[];
  castShadow?: boolean;
}

/** A sky full of clouds as a single InstancedMesh draw call. */
export function createCloudField(opts: CloudFieldOptions): THREE.Group {
  // One cloud = 4 flattened puffs, laid out exactly like createCloud
  const puffsLayout: [number, number, number, number][] = [
    [0, 0, 0, 1.0],
    [1.1, -0.1, 0.2, 0.7],
    [-1.1, 0, -0.2, 0.8],
    [0.5, -0.25, 0.1, 0.9]
  ];
  const clouds = opts.clouds;
  const perCloud = puffsLayout.length;
  const count = clouds.length * perCloud;
  const group = new THREE.Group();
  if (count === 0) return group;

  const geo = new THREE.SphereGeometry(1, 12, 8);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    transparent: true,
    opacity: 0.92
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();

  clouds.forEach((cloud, ci) => {
    const pos = cloud.position;
    const s = cloud.scale ?? 1;
    puffsLayout.forEach(([x, y, z, r], pi) => {
      const idx = ci * perCloud + pi;
      dummy.position.set(pos[0] + x * s, pos[1] + y * s, pos[2] + z * s);
      dummy.scale.set(r * s, r * s * 0.55, r * s); // Flatten into a cloud
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    });
  });

  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = opts.castShadow ?? false;
  group.add(mesh);
  return group;
}

/** A soft cloud made of a few overlapping flattened spheres. */
export function createCloud(opts: CloudOptions = {}): THREE.Group {
  const pos = opts.position ?? [0, 10, 0];
  const s = opts.scale ?? 1;
  const mat = new THREE.MeshStandardMaterial({
    color: opts.color ?? 0xffffff,
    roughness: 1.0,
    transparent: true,
    opacity: 0.92
  });

  const group = new THREE.Group();
  group.position.set(...pos);

  const puffs: [number, number, number, number][] = [
    [0, 0, 0, 1.0],
    [1.1 * s, -0.1 * s, 0.2 * s, 0.7],
    [-1.1 * s, 0, -0.2 * s, 0.8],
    [0.5 * s, -0.25 * s, 0.1 * s, 0.9]
  ];
  for (const [x, y, z, r] of puffs) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r * s, 12, 8), mat);
    puff.position.set(x, y, z);
    puff.scale.y = 0.55; // Flatten into a cloud
    group.add(puff);
  }
  return group;
}