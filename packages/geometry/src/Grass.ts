import * as THREE from 'three';
import { PRNG } from '@kairo/core';

/**
 * @kairo/geometry — Instanced grass field.
 *
 * Every patch is a single draw call (InstancedMesh), so you can scatter
 * thousands of blades without tanking the frame budget.
 */

export interface GrassOptions {
  count?: number;              // Number of blades
  area?: number;               // Side length of the square patch they cover
  height?: [number, number];   // Min/max blade height
  width?: number;              // Blade thickness
  seed?: number;
  color?: number | string;     // Base color
  tipColor?: number | string;  // Slight lerp toward this at the tip
  position?: [number, number, number];
  castShadow?: boolean;
}

export function createGrassField(opts: GrassOptions = {}): THREE.InstancedMesh {
  const count = opts.count ?? 2000;
  const area = opts.area ?? 40;
  const [hMin, hMax] = opts.height ?? [0.5, 1.2];
  const width = opts.width ?? 0.12;
  const seed = opts.seed ?? 1;
  const position = opts.position ?? [0, 0, 0];

  const prng = new PRNG(seed);

  // A single blade: a tapering strip of two triangles
  const bladeGeo = new THREE.PlaneGeometry(width, 1, 1, 1);
  bladeGeo.translate(0, 0.5, 0); // Pivot at the base so it sits on the ground

  const base = new THREE.Color(opts.color ?? 0x4c9a3f);
  const tip = new THREE.Color(opts.tipColor ?? 0x8fd460);
  const colors = new Float32Array(bladeGeo.attributes.position.count * 3);
  for (let i = 0; i < bladeGeo.attributes.position.count; i++) {
    const y = bladeGeo.attributes.position.getY(i); // 0 (base) .. 1 (tip)
    const c = base.clone().lerp(tip, y);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  bladeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 1.0
  });

  const instanced = new THREE.InstancedMesh(bladeGeo, material, count);
  instanced.position.set(...position);
  instanced.castShadow = opts.castShadow ?? false;

  const half = area / 2;
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const h = prng.nextFloat(hMin, hMax);
    dummy.position.set(
      prng.nextFloat(-half, half),
      h / 2, // center the pivot so it grows from y=0
      prng.nextFloat(-half, half)
    );
    dummy.rotation.set(
      0,
      prng.nextFloat(0, Math.PI),
      (prng.nextFloat(-0.2, 0.2))
    );
    dummy.scale.set(prng.nextFloat(0.7, 1.3), h, 1);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
  }
  instanced.instanceMatrix.needsUpdate = true;

  return instanced;
}