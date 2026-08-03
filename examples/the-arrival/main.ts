import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

// ─────────────────────────────────────────────────────────────
// THE ARRIVAL — a short cinematic rendered with the Kairo engine
// Uses: KairoApp primitives, RenderPipeline post-processing,
//       3D canvas text, the Cutscene manager, and a DOM title card.
// ─────────────────────────────────────────────────────────────

const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x04060d,
  fogColor: 0x04060d,
  fogNear: 18,
  fogFar: 95,
  shadows: true
});

// Deep-space lighting: a faint violet starlight, no hot sun.
app.setLighting({
  ambient: 0.22,
  ambientColor: 0x8ea6ff,
  sunPosition: [-14, 20, -10],
  sunIntensity: 0.55,
  sunColor: 0x9db4ff
});

// Cinematic post-processing: soft bloom + subtle film grain.
app.pipeline.postProcessing.toggleBloom(true, 0.75);
app.pipeline.postProcessing.toggleFilmGrain(true);

// ── Starfield ────────────────────────────────────────────────
function createStarfield(count: number, radius: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Distribute on a spherical shell, biased away from the ground plane.
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.85 + 0.1); // keep upper hemisphere
    const r = radius * (0.8 + Math.random() * 0.2);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 2;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizes[i] = 0.6 + Math.random() * 1.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.45,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  app.scene.add(points);
  return points;
}
const starfield = createStarfield(2200, 150);

// ── Ground ───────────────────────────────────────────────────
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(75, 56),
  new THREE.MeshStandardMaterial({ color: 0x0a101f, roughness: 0.92, metalness: 0.08 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
app.scene.add(ground);

// Holographic grid.
const grid = new THREE.GridHelper(90, 45, 0x38bdf8, 0x38bdf8);
(grid.material as THREE.LineBasicMaterial).transparent = true;
(grid.material as THREE.LineBasicMaterial).opacity = 0.14;
(grid.material as THREE.LineBasicMaterial).blending = THREE.AdditiveBlending;
grid.position.y = 0.02;
app.scene.add(grid);

// Under-glow pool beneath the monolith.
const glowPool = new THREE.Mesh(
  new THREE.CircleGeometry(7, 40),
  new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.10,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
glowPool.rotation.x = -Math.PI / 2;
glowPool.position.y = 0.03;
app.scene.add(glowPool);

// ── Red moon ─────────────────────────────────────────────────
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3.4, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff5a3c })
);
moon.position.set(-42, 22, -58);
app.scene.add(moon);

const moonHalo = new THREE.Mesh(
  new THREE.SphereGeometry(4.6, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0xff6a3d,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
moonHalo.position.copy(moon.position);
app.scene.add(moonHalo);

// ── The Monolith ─────────────────────────────────────────────
const monolithGroup = new THREE.Group();
app.scene.add(monolithGroup);

// Stone body with an inner glow.
const obeliskMat = new THREE.MeshStandardMaterial({
  color: 0x1a2332,
  roughness: 0.35,
  metalness: 0.6,
  emissive: 0xffd166,
  emissiveIntensity: 0.25
});
const obelisk = new THREE.Mesh(new THREE.BoxGeometry(2.3, 8.0, 2.5), obeliskMat);
obelisk.position.y = 4.0;
obelisk.castShadow = true;
obelisk.receiveShadow = true;
monolithGroup.add(obelisk);

// Bright energy core (additive, sits just inside the stone).
const core = new THREE.Mesh(
  new THREE.BoxGeometry(1.35, 7.4, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0xffe08a,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
core.position.y = 4.0;
monolithGroup.add(core);

// Glowing edges.
const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 8.0, 2.5)),
  new THREE.LineBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
edges.position.y = 4.0;
monolithGroup.add(edges);

// Rotating energy ring.
const ring = new THREE.Mesh(
  new THREE.RingGeometry(2.6, 3.1, 64),
  new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
ring.rotation.x = Math.PI / 2.2;
ring.position.y = 5.2;
monolithGroup.add(ring);

// Pulsing point light at the heart of the monolith.
const heartLight = new THREE.PointLight(0xffc46a, 6, 34, 2);
heartLight.position.set(0, 4.2, 0);
monolithGroup.add(heartLight);

// Volumetric pillar that appears once the monolith awakens.
const pillar = new THREE.Mesh(
  new THREE.CylinderGeometry(1.0, 2.4, 26, 24, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
pillar.position.y = 17;
monolithGroup.add(pillar);

// Stone platform.
app.createBox({
  size: [9, 0.6, 9],
  position: [0, -0.3, 0],
  color: 0x0d1526,
  roughness: 0.5,
  metalness: 0.4,
  physics: 'static'
});

// ── The Wanderer ─────────────────────────────────────────────
const wanderer = new THREE.Group();
app.scene.add(wanderer);

const robe = new THREE.Mesh(
  new THREE.CylinderGeometry(0.28, 0.55, 1.1, 8),
  new THREE.MeshStandardMaterial({ color: 0x111a2c, roughness: 0.9, metalness: 0.1 })
);
robe.position.y = 0.55;
wanderer.add(robe);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.16, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0x0b1020,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.1
  })
);
head.position.y = 1.32;
wanderer.add(head);

wanderer.position.set(3.1, 0, -4.6);
wanderer.rotation.y = -0.35;
app.scene.add(wanderer);

// Orbiting light orbs around the monolith.
const orbMats = [0x22d3ee, 0xa78bfa].map(c =>
  new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
);
const orbs: THREE.Mesh[] = [];
for (let i = 0; i < 2; i++) {
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), orbMats[i]);
  orbs.push(orb);
  monolithGroup.add(orb);
}

// ── Drifting energy motes ────────────────────────────────────
const MOTE_COUNT = 90;
const moteGeo = new THREE.BufferGeometry();
const motePos = new Float32Array(MOTE_COUNT * 3);
const moteSpeeds = new Float32Array(MOTE_COUNT);
const moteSeeds = new Float32Array(MOTE_COUNT);
for (let i = 0; i < MOTE_COUNT; i++) {
  motePos[i * 3] = (Math.random() - 0.5) * 22;
  motePos[i * 3 + 1] = Math.random() * 14;
  motePos[i * 3 + 2] = (Math.random() - 0.5) * 22;
  moteSpeeds[i] = 0.15 + Math.random() * 0.35;
  moteSeeds[i] = Math.random() * Math.PI * 2;
}
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
const motes = new THREE.Points(
  moteGeo,
  new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.09,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
app.scene.add(motes);

// ── Floating 3D label (world-space text via createText3D) ───
const sectorLabel = app.createText3D({
  text: '▲ SECTOR 07 ▲',
  position: [0, 12.4, 0],
  font: '600 64px Inter, sans-serif',
  color: 'rgba(125, 211, 252, 0.9)',
  size: 1.5,
  billboard: true,
  align: 'center'
});

// Shockwave ring for the awakening beat.
const shockGeo = new THREE.RingGeometry(0.2, 0.55, 64);
const shockMat = new THREE.MeshBasicMaterial({
  color: 0x7dd3fc,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const shock = new THREE.Mesh(shockGeo, shockMat);
shock.rotation.x = -Math.PI / 2;
shock.position.y = 0.05;
app.scene.add(shock);
let shockActive = false;
let shockRadius = 0;

// ── Ambient animation loop ───────────────────────────────────
let lit = false;              // does the monolith stay awake?
app.onUpdate((dt) => {
  const t = performance.now() * 0.001;

  // Monolith heartbeat.
  const pulse = 1.35 + Math.sin(t * 2.4) * 0.45;
  const targetIntensity = lit ? pulse : 0.22 + Math.sin(t * 0.8) * 0.08;
  obeliskMat.emissiveIntensity += (targetIntensity - obeliskMat.emissiveIntensity) * Math.min(dt * 3, 1);

  heartLight.intensity = lit ? 9 + Math.sin(t * 2.4) * 2.5 : 4 + Math.sin(t * 0.8) * 1;
  core.material.opacity = lit ? 0.95 : 0.55;
  edges.material.opacity = lit ? 1.0 : 0.75;

  // Pillar fades in when awake.
  pillar.material.opacity += ((lit ? 0.16 : 0) - (pillar.material as THREE.MeshBasicMaterial).opacity) * Math.min(dt * 1.4, 1);

  // Ring spin.
  ring.rotation.y += dt * 0.55;
  ring.rotation.z = Math.sin(t * 0.35) * 0.12;

  // Orbs orbit the monolith on a tilted plane.
  orbs.forEach((orb, i) => {
    const a = t * (0.55 + i * 0.2) + i * Math.PI;
    orb.position.set(Math.cos(a) * 4.4, 4.2 + Math.sin(a * 0.8) * 1.6, Math.sin(a) * 4.4);
  });

  // Shockwave expansion.
  if (shockActive) {
    shockRadius += dt * 26;
    shock.scale.setScalar(shockRadius);
    shockMat.opacity = Math.max(0, 0.85 - shockRadius / 26);
    if (shockRadius >= 26) shockActive = false;
  }

  // Wanderer sways slightly, gazing at the monolith.
  wanderer.position.y = Math.sin(t * 1.1) * 0.02;
  wanderer.rotation.y = -0.35 + Math.sin(t * 0.4) * 0.12;

  // Motes drift upward and recycle.
  const pos = moteGeo.getAttribute('position') as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < MOTE_COUNT; i++) {
    arr[i * 3 + 1] += moteSpeeds[i] * dt;
    arr[i * 3] += Math.sin(t * 0.8 + moteSeeds[i]) * 0.12 * dt;
    if (arr[i * 3 + 1] > 16) {
      arr[i * 3 + 1] = 0;
      arr[i * 3] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
  }
  pos.needsUpdate = true;

  // Twinkle the starfield slightly.
  (starfield.material as THREE.PointsMaterial).opacity = 0.7 + Math.sin(t * 0.6) * 0.15;
});

// ── DOM orchestration ────────────────────────────────────────
const stage = document.getElementById('stage')!;
const hint = document.getElementById('hint')!;
const titleCard = document.getElementById('title-card')!;
const endCard = document.getElementById('end-card')!;
const replayBtn = document.getElementById('replay-btn')!;

let started = false;

// Fade the whole screen to black instantly so we can open on a fade-in.
app.ui.fade(1.0, '#000000', 0);

async function playMovie(): Promise<void> {
  started = true;
  stage.classList.add('movie');   // slide in letterbox bars
  hint.style.opacity = '0';

  const moviePromise = app.cutscene.play(async (ctx) => {
    // Opening: fade in from black.
    await ctx.fadeScreen(0.0, '#000000', 1800);

    // 1. Wide establishing shot — wanderer small, monolith towering.
    await Promise.all([
      ctx.moveCamera([0, 2.4, 15], 5.0),
      ctx.lookAt([0, 4, 0], 5.0)
    ]);
    await ctx.showDialogue('Nothing has moved on this world in a thousand years.', 4.2);

    // 2. Push in from the left.
    await Promise.all([
      ctx.moveCamera([6.5, 3.2, 9.5], 5.5),
      ctx.lookAt([0, 5, 0], 5.5)
    ]);
    await ctx.showDialogue('But tonight, the monolith is glowing.', 3.6);

    // 3. Circle to the right.
    await Promise.all([
      ctx.moveCamera([-6.8, 2.6, 10], 5.5),
      ctx.lookAt([0, 6, 0], 5.5)
    ]);
    await ctx.showDialogue('Three hundred years of silence…', 3.6);
    await ctx.wait(0.9);
    await ctx.showDialogue('…broken.', 2.2);

    // 4. THE EVENT — rush in as it awakens.
    await Promise.all([
      ctx.moveCamera([0, 3.6, 7.2], 1.4),
      ctx.lookAt([0, 4.2, 0], 1.4)
    ]);
    ctx.flashScreen('#ffffff', 320);
    ctx.shakeCamera(0.55, 1.1, 0.5);
    lit = true;
    shockActive = true;
    shockRadius = 0.2;
    await ctx.showDialogue('*It awakens.*', 2.6);

    // 5. Drone up past the summit as the pillar ignites.
    await Promise.all([
      ctx.moveCamera([3.5, 9.5, 6.5], 4.5),
      ctx.lookAt([0, 6.5, 0], 4.5)
    ]);
    await ctx.showDialogue('The beacon is live. Something heard us.', 4.2);

    // 6. Pull way back for the title card moment.
    await Promise.all([
      ctx.moveCamera([-4, 16, 24], 6.0),
      ctx.lookAt([0, 3, 0], 6.0)
    ]);
    titleCard.classList.add('show');
    await ctx.wait(4.5);
    titleCard.classList.remove('show');

    // 7. Final descent toward the wanderer.
    await Promise.all([
      ctx.moveCamera([2.4, 1.6, -3.2], 5.0),
      ctx.lookAt([3.1, 1.2, -4.6], 5.0)
    ]);
    await ctx.showDialogue('They are not alone anymore.', 3.6);

    // Fade out.
    await ctx.fadeScreen(1.0, '#000000', 2000);
  });

  try {
    await moviePromise;
    endCard.classList.add('show');
    setTimeout(() => stage.classList.remove('movie'), 1200);
  } catch {
    // Cutscene was skipped via ESC.
    stage.classList.remove('movie');
    endCard.classList.add('show');
  }
}

function startOrReplay(): void {
  endCard.classList.remove('show');
  lit = false;
  // Reset a couple of lit-dependent visuals instantly.
  obeliskMat.emissiveIntensity = 0.25;
  pillar.material.opacity = 0;
  playMovie();
}

hint.addEventListener('click', startOrReplay);
replayBtn.addEventListener('click', startOrReplay);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && started && app.cutscene.isPlaying) {
    app.cutscene.skip();
    return;
  }
  if ((e.code === 'Space' || e.code === 'Enter') && !started) {
    e.preventDefault();
    startOrReplay();
  }
});

// Run the engine.
app.start();
