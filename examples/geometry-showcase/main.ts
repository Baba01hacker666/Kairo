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
app.scene.add(terrain.mesh);

// --- Grass patches on the terrain -------------------------------------------
const grass = createGrassField({ count: 4000, area: 55, seed: 7, height: [0.5, 1.3] });
grass.position.y = 0.02; // sit just above the lowest ground
app.scene.add(grass);

// --- Scenery scattered with heightAt (no manual math) -------------------------
const prng = mulberry(99);

// Trees on the hills
for (let i = 0; i < 26; i++) {
  const x = prng() * 70 - 35;
  const z = prng() * 70 - 35;
  const y = heightAt(x, z);
  if (y < 2.2) continue; // keep the valley floor mostly clear
  const tree = createTree({
    position: [x, y, z],
    scale: 0.8 + prng() * 0.9,
    seed: Math.floor(prng() * 100000)
  });
  app.scene.add(tree);
}

// Rocks everywhere, flat on the surface
for (let i = 0; i < 60; i++) {
  const x = prng() * 80 - 40;
  const z = prng() * 80 - 40;
  const rock = createRock({
    position: [x, heightAt(x, z), z],
    scale: 0.3 + prng() * 0.9,
    seed: Math.floor(prng() * 100000)
  });
  app.scene.add(rock);
}

// --- Floating primitives demo (one call each) --------------------------------
const primitives: THREE.Object3D[] = [];
const floaters = [
  createSphere(1.6, { position: [-9, 6, -4], color: 0x38bdf8, metalness: 0.4, roughness: 0.25 }),
  createBlock([2.4, 2.4, 2.4], { position: [-6, 6, 2], color: 0xf472b6, roughness: 0.35 }),
  createTorus(1.4, 0.5, { position: [-3, 6, -3], color: 0xa78bfa, metalness: 0.5, roughness: 0.3 }),
  createCapsule(0.9, 1.6, { position: [0, 6, 1], color: 0x34d399, roughness: 0.3 }),
  createCylinder(0.9, 0.9, 2.6, { position: [3, 6, -4], color: 0xfbbf24, metalness: 0.6, roughness: 0.3 }),
  createCone(1.2, 2.6, { position: [6, 6, 0], color: 0xfb923c, roughness: 0.4 }),
  createIcosahedron(1.4, 1, { position: [9, 6, 3], color: 0x22d3ee, metalness: 0.3, roughness: 0.2 })
];
for (const p of floaters) {
  app.scene.add(p);
  primitives.push(p);
}

// --- Clouds drifting overhead --------------------------------------------------
const clouds: THREE.Group[] = [];
for (let i = 0; i < 6; i++) {
  const cloud = createCloud({
    position: [prng() * 90 - 45, 18 + prng() * 6, prng() * 60 - 30],
    scale: 2 + prng() * 2.5
  });
  app.scene.add(cloud);
  clouds.push(cloud);
}

// --- Per-frame update -----------------------------------------------------------
let t = 0;
app.onUpdate((dt) => {
  t += dt;

  // Bob & spin the floating primitives
  floaters.forEach((p, i) => {
    p.position.y = 6 + Math.sin(t * 0.9 + i * 1.1) * 0.7;
    p.rotation.y += dt * 0.4;
  });

  // Drift clouds slowly
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