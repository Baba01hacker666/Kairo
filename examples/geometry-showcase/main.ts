import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { KairoApp } from '@kairo/core';
import {
  createTerrain,
  createGrassField,
  createTree,
  createRock,
  createCloud,
  createSphere,
  createBlock,
  createTorus,
  createCapsule,
  createCylinder,
  createCone,
  createIcosahedron
} from '@kairo/geometry';

// --- Engine setup -----------------------------------------------------------
const app = new KairoApp({ background: 0x0b1020, shadows: true });
app.setLighting({ ambient: 0.65, sunPosition: [30, 40, 20], sunIntensity: 1.6 });

// Orbit camera (decoupled from any player rotation)
const controls = new OrbitControls(app.camera as THREE.PerspectiveCamera, app.renderer.domElement);
controls.target.set(0, 4, 0);
controls.minDistance = 8;
controls.maxDistance = 90;
controls.maxPolarAngle = Math.PI / 2.05;
controls.enableDamping = true;
controls.update();

app.camera.position.set(30, 24, 38);

// --- Terrain (one call — heightmap + vertex colors + heightAt sampling) ------
const terrain = createTerrain({
  size: 90,
  segments: 140,
  seed: 2024,
  amplitude: 7,
  frequency: 0.07,
  octaves: 5
});
const { heightAt } = terrain;
// Terrain is static ground. Its collider is a flat slab at valley level (y≈0)
// so dynamic shapes rest on the ground and roll against the hills.
terrain.mesh.position.y = -0.5;
app.attachPhysics(terrain.mesh, { type: 'static', addToScene: true, size: [90, 1, 90], colliderType: 'box' });

// --- Grass pinned to the terrain surface (no more hovering/burying "fuzz") ---
const grass = createGrassField({ count: 5000, area: 48, seed: 7, height: [0.5, 1.3], heightAt });
app.scene.add(grass);

// --- Scenery scattered with heightAt + static physics --------------------------
const prng = mulberry(99);

for (let i = 0; i < 26; i++) {
  const x = prng() * 70 - 35;
  const z = prng() * 70 - 35;
  const y = heightAt(x, z);
  if (y < 2.2) continue;
  const tree = createTree({ position: [x, y, z], scale: 0.8 + prng() * 0.9, seed: Math.floor(prng() * 100000) });
  app.attachPhysics(tree, { type: 'static', addToScene: true });
}

for (let i = 0; i < 60; i++) {
  const x = prng() * 80 - 40;
  const z = prng() * 80 - 40;
  const rock = createRock({ position: [x, heightAt(x, z), z], scale: 0.3 + prng() * 0.9, seed: Math.floor(prng() * 100000) });
  app.attachPhysics(rock, { type: 'static', addToScene: true });
}

// --- Clouds drifting overhead (non-physical on purpose) ------------------------
const clouds: THREE.Group[] = [];
for (let i = 0; i < 6; i++) {
  const cloud = createCloud({ position: [prng() * 90 - 45, 18 + prng() * 6, prng() * 60 - 30], scale: 2 + prng() * 2.5 });
  app.scene.add(cloud);
  clouds.push(cloud);
}

// --- A wall of primitives that FALL and COLLIDE (solid by default) ------------
const floaters: Array<{ mesh: THREE.Mesh; seed: number }> = [];
const makers = [
  () => createSphere(1.1, { color: 0x38bdf8, metalness: 0.4, roughness: 0.25 }),
  () => createBlock([1.6, 1.6, 1.6], { color: 0xf472b6, roughness: 0.35 }),
  () => createTorus(1.0, 0.4, { color: 0xa78bfa, metalness: 0.5, roughness: 0.3 }),
  () => createCapsule(0.7, 1.2, { color: 0x34d399, roughness: 0.3 }),
  () => createCylinder(0.7, 0.7, 2.0, { color: 0xfbbf24, metalness: 0.6, roughness: 0.3 }),
  () => createCone(0.9, 1.8, { color: 0xfb923c, roughness: 0.4 }),
  () => createIcosahedron(1.0, 1, { color: 0x22d3ee, metalness: 0.3, roughness: 0.2 })
];

for (let i = 0; i < 14; i++) {
  const angle = (i / 14) * Math.PI * 2;
  const radius = 5 + (i % 3) * 1.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const make = makers[i % makers.length];
  const mesh = make();
  mesh.position.set(x, 12 + (i % 4) * 1.2, z);
  mesh.rotation.set(prng() * Math.PI, prng() * Math.PI, prng() * Math.PI);
  // Dynamic = falls under gravity, collides with the terrain and each other.
  app.attachPhysics(mesh, { type: 'dynamic', mass: 2 + (i % 3), addToScene: true });
  floaters.push({ mesh, seed: prng() });
}

// --- Per-frame update -----------------------------------------------------------
let t = 0;
app.onUpdate((dt) => {
  t += dt;

  // Clouds are non-physical, keep them drifting manually.
  clouds.forEach((c, i) => {
    c.position.x += dt * (0.5 + i * 0.15);
    if (c.position.x > 50) c.position.x = -50;
  });

  controls.update();
});

app.start();

// Deterministic PRNG for scatter placement (seeded, so the layout is stable)
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}