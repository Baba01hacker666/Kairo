import * as THREE from 'three';
import { SimplexNoise } from '../../core/src/Procedural.ts';

/**
 * @kairo/geometry — Heightmap terrain built from SimplexNoise (reuses the
 * seeded noise from @kairo/core). Returns the mesh plus a `heightAt(x, z)`
 * helper so you can place trees/rocks/players exactly on the surface.
 */

export interface TerrainOptions {
  size?: number;              // Width/depth of the terrain in world units
  segments?: number;          // Grid resolution (segments per side)
  seed?: number;              // Deterministic seed
  amplitude?: number;         // Max vertical height
  frequency?: number;         // Noise frequency (bigger = more hills)
  octaves?: number;           // fBm octaves for detail
  persistence?: number;       // fBm persistence (amplitude decay per octave)
  position?: [number, number, number];
  color?: number | string;    // Base ground color
  highColor?: number | string; // Color at the peaks (gradient between color/highColor)
  roughness?: number;
  metalness?: number;
  wireframe?: boolean;
}

export interface TerrainResult {
  mesh: THREE.Mesh;
  geometry: THREE.PlaneGeometry;
  /** Sample the surface height at world XZ coordinates (after position offset). */
  heightAt: (x: number, z: number) => number;
  /** Raw 2D height field (y in [0, 1]) before amplitude scaling. */
  heights: number[][];
}

function fbm(noise: SimplexNoise, x: number, z: number, octaves: number, persistence: number): number {
  let total = 0;
  let freq = 1;
  let amp = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    total += noise.noise2D(x * freq, z * freq) * amp;
    max += amp;
    amp *= persistence;
    freq *= 2;
  }
  // noise2D returns roughly [-1, 1]; normalize to [0, 1]
  return (total / max + 1) / 2;
}

export function createTerrain(opts: TerrainOptions = {}): TerrainResult {
  const size = opts.size ?? 100;
  const segments = opts.segments ?? 128;
  const seed = opts.seed ?? 1337;
  const amplitude = opts.amplitude ?? 6;
  const frequency = opts.frequency ?? 0.08;
  const octaves = opts.octaves ?? 5;
  const persistence = opts.persistence ?? 0.5;
  const position = opts.position ?? [0, 0, 0];

  const noise = new SimplexNoise(seed);

  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2); // Lay flat on the XZ plane

  const posAttr = geometry.attributes.position;
  const heights: number[][] = [];
  const colors = new Float32Array(posAttr.count * 3);
  const cLow = new THREE.Color(opts.color ?? 0x4a7c3f);
  const cHigh = new THREE.Color(opts.highColor ?? 0x8fae6b);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const h = fbm(noise, x * frequency, z * frequency, octaves, persistence);
    posAttr.setY(i, h * amplitude);

    const row = Math.floor((z + size / 2) / size * segments);
    if (!heights[row]) heights[row] = [];
    heights[row][Math.floor((x + size / 2) / size * segments)] = h;

    const c = cLow.clone().lerp(cHigh, h);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  posAttr.needsUpdate = true;
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: opts.roughness ?? 0.95,
    metalness: opts.metalness ?? 0.0,
    wireframe: opts.wireframe ?? false
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'Terrain';

  const heightAt = (x: number, z: number): number => {
    const h = fbm(noise, (x - position[0]) * frequency, (z - position[2]) * frequency, octaves, persistence);
    return h * amplitude + position[1];
  };

  return { mesh, geometry, heightAt, heights };
}
