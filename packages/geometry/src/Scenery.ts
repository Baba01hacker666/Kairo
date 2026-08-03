import * as THREE from 'three';
import { PRNG } from '@kairo/core';

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