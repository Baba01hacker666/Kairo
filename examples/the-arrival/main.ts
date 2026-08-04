import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

// ─────────────────────────────────────────────────────────────
// THE ARRIVAL — a short cinematic rendered with the Kairo engine
// Uses: KairoApp primitives, RenderPipeline post-processing,
//       3D canvas text, the Cutscene manager, and a DOM title card.
// ─────────────────────────────────────────────────────────────

const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x020510,
  fogColor: 0x020510,
  fogNear: 22,
  fogFar: 110,
  shadows: true
});

// Deep-space lighting rig: cool ambient fill + warm key from the monolith side.
app.setLighting({
  ambient: 0.15,
  ambientColor: 0x6b7db8,
  sunPosition: [-14, 24, -10],
  sunIntensity: 0.35,
  sunColor: 0x8ea6ff
});

// Cinematic post-processing: bloom + subtle film grain.
app.pipeline.postProcessing.toggleBloom(true, 0.75);
app.pipeline.postProcessing.toggleFilmGrain(true);

// Tone-mapping for richer HDR look.
app.pipeline.renderer.toneMapping = THREE.ACESFilmicToneMapping;
app.pipeline.renderer.toneMappingExposure = 1.15;

// ── Starfield (denser, with color variety) ───────────────────
function createStarfield(count: number, radius: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.88 + 0.08);
    const r = radius * (0.75 + Math.random() * 0.25);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 1.5;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    // Slight color variation: white → blue → faint amber
    const temp = Math.random();
    if (temp < 0.7) {
      colors[i * 3] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 2] = 1.0;
    } else if (temp < 0.9) {
      colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.6;
    }
    sizes[i] = 0.4 + Math.random() * 1.8;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.38,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  app.scene.add(points);
  return points;
}
const starfield = createStarfield(3200, 160);

// ── Nebula clouds (layered transparent sprites) ──────────────
function createNebula(): THREE.Group {
  const group = new THREE.Group();
  const nebColors = [0x1a0e3e, 0x0e2a4d, 0x2d1052, 0x0a1e38];

  for (let i = 0; i < 14; i++) {
    const geo = new THREE.PlaneGeometry(
      30 + Math.random() * 50,
      20 + Math.random() * 35
    );
    const mat = new THREE.MeshBasicMaterial({
      color: nebColors[i % nebColors.length],
      transparent: true,
      opacity: 0.06 + Math.random() * 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geo, mat);

    const angle = Math.random() * Math.PI * 2;
    const dist = 55 + Math.random() * 60;
    plane.position.set(
      Math.cos(angle) * dist,
      15 + Math.random() * 40,
      Math.sin(angle) * dist
    );
    plane.rotation.set(
      Math.random() * 0.4 - 0.2,
      Math.random() * Math.PI * 2,
      Math.random() * 0.3
    );
    group.add(plane);
  }
  app.scene.add(group);
  return group;
}
const nebula = createNebula();

// ── Distant mountain silhouettes ─────────────────────────────
function createMountains(): void {
  const shape = new THREE.Shape();
  const points: [number, number][] = [];
  const segs = 60;
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const r = 70 + Math.sin(a * 5.7) * 8 + Math.sin(a * 13.3) * 4 + Math.sin(a * 27.1) * 2;
    points.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();

  const extGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  const mat = new THREE.MeshBasicMaterial({
    color: 0x060b1a,
    transparent: true,
    opacity: 0.85
  });
  const mesh = new THREE.Mesh(extGeo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  mesh.scale.y = 0.18;
  app.scene.add(mesh);

  // Jagged peaks extruded upward
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + Math.random() * 0.15;
    const rad = 68 + Math.random() * 8;
    const h = 3 + Math.random() * 7;
    const peak = new THREE.Mesh(
      new THREE.ConeGeometry(2.5 + Math.random() * 3, h, 4),
      new THREE.MeshStandardMaterial({
        color: 0x0a0f22,
        roughness: 0.95,
        metalness: 0.05,
        transparent: true,
        opacity: 0.7
      })
    );
    peak.position.set(Math.cos(a) * rad, h * 0.5, Math.sin(a) * rad);
    peak.rotation.y = Math.random() * Math.PI;
    app.scene.add(peak);
  }
}
createMountains();

// ── Ground ───────────────────────────────────────────────────
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(85, 64),
  new THREE.MeshStandardMaterial({
    color: 0x070e1e,
    roughness: 0.95,
    metalness: 0.05
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
app.scene.add(ground);

// Holographic grid.
const grid = new THREE.GridHelper(100, 50, 0x1a3a5c, 0x1a3a5c);
(grid.material as THREE.LineBasicMaterial).transparent = true;
(grid.material as THREE.LineBasicMaterial).opacity = 0.08;
(grid.material as THREE.LineBasicMaterial).blending = THREE.AdditiveBlending;
grid.position.y = 0.02;
app.scene.add(grid);

// Under-glow pool beneath the monolith (layered for richer glow).
const glowPool = new THREE.Mesh(
  new THREE.CircleGeometry(8, 48),
  new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
glowPool.rotation.x = -Math.PI / 2;
glowPool.position.y = 0.03;
app.scene.add(glowPool);

const glowPoolInner = new THREE.Mesh(
  new THREE.CircleGeometry(4, 48),
  new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
glowPoolInner.rotation.x = -Math.PI / 2;
glowPoolInner.position.y = 0.04;
app.scene.add(glowPoolInner);

// ── Red moon + atmospheric halo ──────────────────────────────
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(4.0, 40, 40),
  new THREE.MeshBasicMaterial({ color: 0xff4a2e })
);
moon.position.set(-48, 26, -65);
app.scene.add(moon);

const moonHalo = new THREE.Mesh(
  new THREE.SphereGeometry(6.2, 40, 40),
  new THREE.MeshBasicMaterial({
    color: 0xff5a28,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
moonHalo.position.copy(moon.position);
app.scene.add(moonHalo);

// Outer atmospheric rim.
const moonRim = new THREE.Mesh(
  new THREE.SphereGeometry(8.5, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0x991a0a,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
moonRim.position.copy(moon.position);
app.scene.add(moonRim);

// ── The Monolith (richer detail) ─────────────────────────────
const monolithGroup = new THREE.Group();
app.scene.add(monolithGroup);

// Stone body — darker, more imposing.
const obeliskMat = new THREE.MeshStandardMaterial({
  color: 0x12192a,
  roughness: 0.30,
  metalness: 0.65,
  emissive: 0xffd166,
  emissiveIntensity: 0.18
});
const obelisk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9.0, 2.7), obeliskMat);
obelisk.position.y = 4.5;
obelisk.castShadow = true;
obelisk.receiveShadow = true;
monolithGroup.add(obelisk);

// Bright energy core.
const coreMat = new THREE.MeshBasicMaterial({
  color: 0xffe08a,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const core = new THREE.Mesh(new THREE.BoxGeometry(1.4, 8.2, 1.6), coreMat);
core.position.y = 4.5;
monolithGroup.add(core);

// Glowing edges.
const edgesMat = new THREE.LineBasicMaterial({
  color: 0xffd166,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5, 9.0, 2.7)),
  edgesMat
);
edges.position.y = 4.5;
edges.scale.set(1.015, 1.015, 1.015);
monolithGroup.add(edges);

// Rune engravings — glowing lines on the monolith faces.
function createRuneLines(faceOffset: THREE.Vector3, faceRotation: THREE.Euler): void {
  const runeCount = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < runeCount; i++) {
    const pts: THREE.Vector3[] = [];
    const segments = 3 + Math.floor(Math.random() * 3);
    let x = (Math.random() - 0.5) * 1.4;
    let y = (Math.random() - 0.5) * 6;
    for (let s = 0; s <= segments; s++) {
      pts.push(new THREE.Vector3(x, y, 0));
      x += (Math.random() - 0.5) * 0.6;
      y += (Math.random() - 0.5) * 1.2;
    }
    const runGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const runeMat = new THREE.LineBasicMaterial({
      color: 0xffc46a,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const line = new THREE.Line(runGeo, runeMat);
    line.position.copy(faceOffset);
    line.rotation.copy(faceRotation);
    line.position.y += 4.5;
    monolithGroup.add(line);
  }
}
createRuneLines(new THREE.Vector3(0, 0, 1.36), new THREE.Euler(0, 0, 0));
createRuneLines(new THREE.Vector3(0, 0, -1.36), new THREE.Euler(0, Math.PI, 0));
createRuneLines(new THREE.Vector3(1.26, 0, 0), new THREE.Euler(0, Math.PI / 2, 0));
createRuneLines(new THREE.Vector3(-1.26, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0));

// Primary energy ring.
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x7dd3fc,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const ring = new THREE.Mesh(new THREE.RingGeometry(2.8, 3.4, 72), ringMat);
ring.rotation.x = Math.PI / 2.2;
ring.position.y = 5.5;
monolithGroup.add(ring);

// Secondary counter-rotating ring.
const ring2Mat = new THREE.MeshBasicMaterial({
  color: 0xa78bfa,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const ring2 = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.0, 72), ring2Mat);
ring2.rotation.x = Math.PI / 2.6;
ring2.position.y = 4.2;
monolithGroup.add(ring2);

// Pulsing point light at the heart of the monolith.
const heartLight = new THREE.PointLight(0xffc46a, 5, 38, 2);
heartLight.position.set(0, 4.5, 0);
monolithGroup.add(heartLight);

// Cool blue fill from below.
const fillLight = new THREE.PointLight(0x38bdf8, 2.5, 28, 2);
fillLight.position.set(0, 0.5, 3);
monolithGroup.add(fillLight);

// Volumetric pillar that appears once the monolith awakens.
const pillarMat = new THREE.MeshBasicMaterial({
  color: 0x7dd3fc,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide
});
const pillar = new THREE.Mesh(
  new THREE.CylinderGeometry(1.2, 2.8, 32, 28, 1, true),
  pillarMat
);
pillar.position.y = 20;
monolithGroup.add(pillar);

// Stone platform (stepped).
app.createBox({
  size: [10, 0.5, 10],
  position: [0, -0.25, 0],
  color: 0x0a1526,
  roughness: 0.5,
  metalness: 0.4,
  physics: 'static'
});
app.createBox({
  size: [7, 0.3, 7],
  position: [0, 0.15, 0],
  color: 0x0d1a30,
  roughness: 0.45,
  metalness: 0.45,
  physics: 'static'
});

// ── Floating debris rocks ────────────────────────────────────
const debrisRocks: THREE.Mesh[] = [];
for (let i = 0; i < 8; i++) {
  const s = 0.15 + Math.random() * 0.35;
  const rock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(s, 0),
    new THREE.MeshStandardMaterial({
      color: 0x1a2236,
      roughness: 0.8,
      metalness: 0.3
    })
  );
  const angle = (i / 8) * Math.PI * 2;
  const rad = 4.5 + Math.random() * 3;
  rock.position.set(Math.cos(angle) * rad, 2 + Math.random() * 6, Math.sin(angle) * rad);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  app.scene.add(rock);
  debrisRocks.push(rock);
}

// ── The Wanderer (enhanced with staff) ───────────────────────
const wanderer = new THREE.Group();
app.scene.add(wanderer);

// Robe.
const robe = new THREE.Mesh(
  new THREE.CylinderGeometry(0.26, 0.58, 1.2, 10),
  new THREE.MeshStandardMaterial({ color: 0x0e1528, roughness: 0.92, metalness: 0.08 })
);
robe.position.y = 0.6;
wanderer.add(robe);

// Hood.
const hood = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.6),
  new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.9, metalness: 0.1 })
);
hood.position.y = 1.32;
wanderer.add(hood);

// Head (glowing eyes).
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.15, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0x080e1a,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.8,
    roughness: 0.15,
    metalness: 0.1
  })
);
head.position.y = 1.30;
wanderer.add(head);

// Staff.
const staff = new THREE.Mesh(
  new THREE.CylinderGeometry(0.025, 0.03, 1.6, 6),
  new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.7, metalness: 0.3 })
);
staff.position.set(0.35, 0.8, 0);
staff.rotation.z = -0.15;
wanderer.add(staff);

// Staff glow tip.
const staffTip = new THREE.Mesh(
  new THREE.SphereGeometry(0.06, 8, 8),
  new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
staffTip.position.set(0.37, 1.58, 0);
wanderer.add(staffTip);

const staffLight = new THREE.PointLight(0x22d3ee, 1.2, 8, 2);
staffLight.position.set(0.37, 1.58, 0);
wanderer.add(staffLight);

wanderer.position.set(3.5, 0, -5.0);
wanderer.rotation.y = -0.35;

// Orbiting light orbs around the monolith.
const orbMats = [0x22d3ee, 0xa78bfa, 0xffc46a].map(c =>
  new THREE.MeshBasicMaterial({
    color: c, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false
  })
);
const orbs: THREE.Mesh[] = [];
for (let i = 0; i < 3; i++) {
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), orbMats[i]);
  orbs.push(orb);
  monolithGroup.add(orb);
  // Point light per orb.
  const orbLight = new THREE.PointLight(orbMats[i].color.getHex(), 1.5, 12, 2);
  orb.add(orbLight);
}

// ── Drifting energy motes ────────────────────────────────────
const MOTE_COUNT = 140;
const moteGeo = new THREE.BufferGeometry();
const motePos = new Float32Array(MOTE_COUNT * 3);
const moteSpeeds = new Float32Array(MOTE_COUNT);
const moteSeeds = new Float32Array(MOTE_COUNT);
for (let i = 0; i < MOTE_COUNT; i++) {
  motePos[i * 3] = (Math.random() - 0.5) * 28;
  motePos[i * 3 + 1] = Math.random() * 18;
  motePos[i * 3 + 2] = (Math.random() - 0.5) * 28;
  moteSpeeds[i] = 0.12 + Math.random() * 0.3;
  moteSeeds[i] = Math.random() * Math.PI * 2;
}
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
const motes = new THREE.Points(
  moteGeo,
  new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.08,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
app.scene.add(motes);

// ── Floating 3D label (world-space text via createText3D) ───
const sectorLabel = app.createText3D({
  text: '▲ SECTOR 07 ▲',
  position: [0, 13.5, 0],
  font: '600 64px Inter, sans-serif',
  color: 'rgba(125, 211, 252, 0.85)',
  size: 1.6,
  billboard: true,
  align: 'center'
});

// Shockwave ring for the awakening beat.
const shockGeo = new THREE.RingGeometry(0.2, 0.55, 72);
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

// Second shockwave (delayed, larger).
const shock2Geo = new THREE.RingGeometry(0.3, 0.7, 72);
const shock2Mat = new THREE.MeshBasicMaterial({
  color: 0xa78bfa,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const shock2 = new THREE.Mesh(shock2Geo, shock2Mat);
shock2.rotation.x = -Math.PI / 2;
shock2.position.y = 0.05;
app.scene.add(shock2);
let shock2Active = false;
let shock2Radius = 0;

// ── Shooting stars ───────────────────────────────────────────
interface ShootingStar {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}
const shootingStars: ShootingStar[] = [];
let nextShootingStarTime = 3 + Math.random() * 5;

function spawnShootingStar(): void {
  const geo = new THREE.SphereGeometry(0.08, 6, 6);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geo, mat);

  const angle = Math.random() * Math.PI * 2;
  const height = 30 + Math.random() * 25;
  const dist = 40 + Math.random() * 40;
  mesh.position.set(Math.cos(angle) * dist, height, Math.sin(angle) * dist);

  const dir = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    -0.5 - Math.random() * 0.5,
    (Math.random() - 0.5) * 2
  ).normalize().multiplyScalar(25 + Math.random() * 15);

  app.scene.add(mesh);
  shootingStars.push({ mesh, velocity: dir, life: 0, maxLife: 1.2 + Math.random() * 0.8 });
}

// ── Ambient animation loop ───────────────────────────────────
let lit = false;
app.onUpdate((dt) => {
  const t = performance.now() * 0.001;

  // Monolith heartbeat.
  const pulse = 1.5 + Math.sin(t * 2.6) * 0.5;
  const targetIntensity = lit ? pulse : 0.18 + Math.sin(t * 0.7) * 0.06;
  obeliskMat.emissiveIntensity += (targetIntensity - obeliskMat.emissiveIntensity) * Math.min(dt * 3, 1);

  heartLight.intensity = lit ? 10 + Math.sin(t * 2.6) * 3 : 3.5 + Math.sin(t * 0.7) * 0.8;
  fillLight.intensity = lit ? 4 : 2;
  coreMat.opacity = lit ? 0.95 : 0.5;
  edgesMat.opacity = lit ? 1.0 : 0.7;

  // Pool glow intensifies when lit.
  (glowPool.material as THREE.MeshBasicMaterial).opacity = lit ? 0.18 : 0.08;
  (glowPoolInner.material as THREE.MeshBasicMaterial).opacity = lit ? 0.25 : 0.12;

  // Pillar fades in when awake.
  pillarMat.opacity += ((lit ? 0.2 : 0) - pillarMat.opacity) * Math.min(dt * 1.4, 1);

  // Ring spin.
  ring.rotation.y += dt * 0.6;
  ring.rotation.z = Math.sin(t * 0.35) * 0.12;
  ring2.rotation.y -= dt * 0.35;
  ring2.rotation.z = Math.cos(t * 0.28) * 0.15;

  // Orbs orbit the monolith.
  orbs.forEach((orb, i) => {
    const a = t * (0.5 + i * 0.18) + i * (Math.PI * 2 / 3);
    const orbR = 4.8 + Math.sin(t * 0.3 + i) * 0.8;
    orb.position.set(
      Math.cos(a) * orbR,
      4.5 + Math.sin(a * 0.7 + i * 1.5) * 1.8,
      Math.sin(a) * orbR
    );
  });

  // Floating debris rocks bob gently.
  debrisRocks.forEach((rock, i) => {
    rock.position.y += Math.sin(t * 0.5 + i * 2.1) * 0.003;
    rock.rotation.x += dt * 0.08;
    rock.rotation.z += dt * 0.05;
  });

  // Shockwave expansion.
  if (shockActive) {
    shockRadius += dt * 28;
    shock.scale.setScalar(shockRadius);
    shockMat.opacity = Math.max(0, 0.9 - shockRadius / 28);
    if (shockRadius >= 28) shockActive = false;
  }
  if (shock2Active) {
    shock2Radius += dt * 20;
    shock2.scale.setScalar(shock2Radius);
    shock2Mat.opacity = Math.max(0, 0.6 - shock2Radius / 22);
    if (shock2Radius >= 22) shock2Active = false;
  }

  // Wanderer sways.
  wanderer.position.y = Math.sin(t * 1.0) * 0.015;
  wanderer.rotation.y = -0.35 + Math.sin(t * 0.35) * 0.1;

  // Staff tip flicker.
  (staffTip.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(t * 4.5) * 0.3;
  staffLight.intensity = 0.8 + Math.sin(t * 4.5) * 0.4;

  // Motes drift upward.
  const pos = moteGeo.getAttribute('position') as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < MOTE_COUNT; i++) {
    arr[i * 3 + 1] += moteSpeeds[i] * dt;
    arr[i * 3] += Math.sin(t * 0.7 + moteSeeds[i]) * 0.1 * dt;
    arr[i * 3 + 2] += Math.cos(t * 0.5 + moteSeeds[i]) * 0.06 * dt;
    if (arr[i * 3 + 1] > 20) {
      arr[i * 3 + 1] = 0;
      arr[i * 3] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
  }
  pos.needsUpdate = true;

  // Twinkle the starfield.
  (starfield.material as THREE.PointsMaterial).opacity = 0.75 + Math.sin(t * 0.5) * 0.12;

  // Nebula slow drift.
  nebula.rotation.y += dt * 0.003;

  // Shooting stars.
  nextShootingStarTime -= dt;
  if (nextShootingStarTime <= 0) {
    spawnShootingStar();
    nextShootingStarTime = 4 + Math.random() * 8;
  }
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.life += dt;
    ss.mesh.position.add(ss.velocity.clone().multiplyScalar(dt));
    (ss.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - ss.life / ss.maxLife);
    if (ss.life >= ss.maxLife) {
      app.scene.remove(ss.mesh);
      ss.mesh.geometry.dispose();
      shootingStars.splice(i, 1);
    }
  }
});

// ── DOM orchestration ────────────────────────────────────────
const stage = document.getElementById('stage')!;
const titleCard = document.getElementById('title-card')!;
const endCard = document.getElementById('end-card')!;
const replayBtn = document.getElementById('replay-btn')!;

let started = false;

// Fade the whole screen to black instantly so we can open on a fade-in.
app.ui.fade(1.0, '#000000', 0);

async function playMovie(): Promise<void> {
  started = true;
  stage.classList.add('movie');   // slide in letterbox bars

  const moviePromise = app.cutscene.play(async (ctx) => {
    // Opening: fade in from black.
    await ctx.fadeScreen(0.0, '#000000', 2200);

    // 1. Wide establishing shot — wanderer small, monolith towering.
    await Promise.all([
      ctx.moveCamera([0, 2.2, 16], 6.0),
      ctx.lookAt([0, 4.5, 0], 6.0)
    ]);
    await ctx.showDialogue('Nothing has moved on this world in a thousand years.', 4.5);

    // 2. Low angle push-in from the left, looking up at the monolith.
    await Promise.all([
      ctx.moveCamera([7.5, 1.8, 8.5], 5.5),
      ctx.lookAt([0, 6, 0], 5.5)
    ]);
    await ctx.showDialogue('But tonight, the monolith stirs.', 3.8);

    // 3. Slow arc to the right, revealing the wanderer's silhouette.
    await Promise.all([
      ctx.moveCamera([-7.5, 2.4, 9.5], 6.0),
      ctx.lookAt([0, 5.5, 0], 6.0)
    ]);
    await ctx.showDialogue('Three hundred years of silence…', 3.6);
    await ctx.wait(1.0);
    await ctx.showDialogue('…broken by a pulse no ear can hear.', 2.8);

    // 4. THE EVENT — rush in close, the monolith awakens!
    await Promise.all([
      ctx.moveCamera([0, 3.2, 6.0], 1.2),
      ctx.lookAt([0, 4.5, 0], 1.2)
    ]);
    ctx.flashScreen('#c8e8ff', 400);
    ctx.shakeCamera(0.6, 1.2, 0.6);
    lit = true;
    shockActive = true;
    shockRadius = 0.2;
    setTimeout(() => { shock2Active = true; shock2Radius = 0.3; }, 350);
    await ctx.showDialogue('*It awakens.*', 2.8);

    // 5. Dramatic low-angle close-up of the pulsing core.
    await Promise.all([
      ctx.moveCamera([1.8, 1.5, 3.8], 3.5),
      ctx.lookAt([0, 5, 0], 3.5)
    ]);
    await ctx.showDialogue('Ancient circuits ignite — light pours from stone.', 3.8);

    // 6. Drone up past the summit as the pillar ignites.
    await Promise.all([
      ctx.moveCamera([3.8, 11, 7.5], 5.0),
      ctx.lookAt([0, 7, 0], 5.0)
    ]);
    await ctx.showDialogue('The beacon is live. Something heard us.', 4.2);

    // 7. Pull way back for the title card moment.
    await Promise.all([
      ctx.moveCamera([-5, 18, 28], 6.5),
      ctx.lookAt([0, 3, 0], 6.5)
    ]);
    titleCard.classList.add('show');
    await ctx.wait(5.0);
    titleCard.classList.remove('show');

    // 8. Final intimate shot — close on the wanderer's face.
    await Promise.all([
      ctx.moveCamera([2.8, 1.5, -3.5], 5.5),
      ctx.lookAt([3.5, 1.3, -5.0], 5.5)
    ]);
    await ctx.showDialogue('They are not alone anymore.', 4.0);

    // Fade out.
    await ctx.fadeScreen(1.0, '#000000', 2500);
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
  if (app.cutscene.isPlaying) return;
  endCard.classList.remove('show');
  lit = false;
  obeliskMat.emissiveIntensity = 0.18;
  pillarMat.opacity = 0;
  playMovie();
}

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

// The film starts itself after a short beat — no click required.
setTimeout(() => startOrReplay(), 750);
