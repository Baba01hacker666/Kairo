import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { KairoApp, Vector3 } from '@kairo/core';
import { RigidBody, Collider, RigidBodyType, ColliderType } from '@kairo/physics';
import { ParticleSystem } from '@kairo/renderer';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ARENA_HALF = 44;
const WALL_H = 2.6;

const CAR_W = 1.9;
const CAR_H = 0.55;
const CAR_L = 3.5;

const MAX_SPEED = 44;      // m/s (~158 km/h)
const BOOST_MAX = 62;      // m/s (~223 km/h)
const ACCEL = 27;
const BRAKE = 46;
const REVERSE_MAX = 14;
const STEER_BASE = 2.9;

const TRACK_A = 30;        // oval track x radius
const TRACK_B = 20;        // oval track z radius

const isMobile =
  typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768);

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------
const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x0a0515,
  gravity: [0, -30, 0],
  fogColor: 0x150633,
  fogNear: 80,
  fogFar: 260,
  shadows: !isMobile,
  gameId: 'neon_drift'
});

app.setLighting({
  ambient: 0.35,
  sunPosition: [-80, 130, -60],
  sunIntensity: 1.15,
  sunColor: 0xffc06b,
  ambientColor: 0x8b5cf6
});

app.cameraController.enableCollisionAvoidance = false;
app.cameraController.lerpSpeed = 11;
(app.camera as THREE.PerspectiveCamera).fov = 58;

// Arcade car handling: minimize solver friction so our velocity control wins.
const cannonWorld = (app.physics as unknown as { cannonWorld: CANNON.World }).cannonWorld;
cannonWorld.defaultContactMaterial.friction = 0.02;
cannonWorld.defaultContactMaterial.restitution = 0.05;

const scene = app.scene;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function v3(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z);
}

function addStaticBox(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = !isMobile;
  mesh.receiveShadow = !isMobile;
  scene.add(mesh);

  const rb = new RigidBody();
  rb.type = RigidBodyType.Static;
  const col = new Collider();
  col.type = ColliderType.Box;
  col.size = new Vector3(w, h, d);
  app.physics.registerBody(rb, col, new Vector3(x, y, z));
  return mesh;
}

interface DynamicObstacle {
  mesh: THREE.Mesh;
  rb: RigidBody;
}

const obstacles: DynamicObstacle[] = [];

function addDynamicObstacle(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  z: number,
  size: [number, number, number],
  mass: number
): void {
  const mesh = new THREE.Mesh(geometry, material);
  const halfY = size[1] / 2;
  mesh.position.set(x, halfY, z);
  mesh.castShadow = !isMobile;
  mesh.receiveShadow = !isMobile;
  scene.add(mesh);

  const rb = new RigidBody();
  rb.type = RigidBodyType.Dynamic;
  rb.mass = mass;
  rb.linearDamping = 0.3;
  rb.angularDamping = 0.4;
  const col = new Collider();
  col.type = ColliderType.Box;
  col.size = new Vector3(size[0], size[1], size[2]);
  app.physics.registerBody(rb, col, new Vector3(x, halfY, z));

  obstacles.push({ mesh, rb });
}

// ---------------------------------------------------------------------------
// Environment: neon synthwave arena
// ---------------------------------------------------------------------------
// Ground
const groundMat = new THREE.MeshStandardMaterial({ color: 0x12062b, roughness: 0.9, metalness: 0.05 });
addStaticBox(ARENA_HALF * 2 + 12, 1, ARENA_HALF * 2 + 12, 0, -0.5, 0, groundMat);

const grid = new THREE.GridHelper(ARENA_HALF * 2, 44, 0x38bdf8, 0x8b5cf6);
(grid.material as THREE.Material).transparent = true;
(grid.material as THREE.Material).opacity = 0.28;
grid.position.y = 0.02;
scene.add(grid);

// Neon sun
const sun = new THREE.Mesh(
  new THREE.CircleGeometry(26, 48),
  new THREE.MeshBasicMaterial({ color: 0xff7a3d, fog: false, transparent: true, opacity: 0.95 })
);
sun.position.set(0, 120, -190);
sun.lookAt(0, 120, 0);
scene.add(sun);

const sunGlowCanvas = document.createElement('canvas');
sunGlowCanvas.width = 128;
sunGlowCanvas.height = 128;
const sunCtx = sunGlowCanvas.getContext('2d')!;
const sunGrad = sunCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
sunGrad.addColorStop(0, 'rgba(255,122,61,0.9)');
sunGrad.addColorStop(0.4, 'rgba(236,72,153,0.45)');
sunGrad.addColorStop(1, 'rgba(168,85,247,0)');
sunCtx.fillStyle = sunGrad;
sunCtx.fillRect(0, 0, 128, 128);
const sunGlowTex = new THREE.CanvasTexture(sunGlowCanvas);
const sunGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: sunGlowTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
);
sunGlow.scale.set(130, 130, 1);
sunGlow.position.set(0, 120, -185);
scene.add(sunGlow);

// Arena walls with neon tops
const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e0a3d, roughness: 0.5, metalness: 0.4 });
const neonEdgeMat = new THREE.MeshStandardMaterial({
  color: 0x05010f,
  emissive: 0xa855f7,
  emissiveIntensity: 2.2,
  roughness: 0.4,
  metalness: 0.2
});

const S = ARENA_HALF;
const wallTh = 1.2;
addStaticBox(S * 2 + wallTh * 2, WALL_H, wallTh, 0, WALL_H / 2, S + wallTh / 2, wallMat);
addStaticBox(S * 2 + wallTh * 2, WALL_H, wallTh, 0, WALL_H / 2, -S - wallTh / 2, wallMat);
addStaticBox(wallTh, WALL_H, S * 2 + wallTh * 2, S + wallTh / 2, WALL_H / 2, 0, wallMat);
addStaticBox(wallTh, WALL_H, S * 2 + wallTh * 2, -S - wallTh / 2, WALL_H / 2, 0, wallMat);

addStaticBox(S * 2 + wallTh * 2, 0.12, 0.5, 0, WALL_H + 0.06, S + wallTh / 2, neonEdgeMat);
addStaticBox(S * 2 + wallTh * 2, 0.12, 0.5, 0, WALL_H + 0.06, -S - wallTh / 2, neonEdgeMat);
addStaticBox(0.5, 0.12, S * 2 + wallTh * 2, S + wallTh / 2, WALL_H + 0.06, 0, neonEdgeMat);
addStaticBox(0.5, 0.12, S * 2 + wallTh * 2, -S - wallTh / 2, WALL_H + 0.06, 0, neonEdgeMat);

// Track edge lines
function buildOvalLine(radiusX: number, radiusZ: number, y: number, color: number, opacity: number): THREE.LineLoop {
  const pts: THREE.Vector3[] = [];
  const seg = 96;
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    pts.push(v3(radiusX * Math.cos(t), y, radiusZ * Math.sin(t)));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const line = new THREE.LineLoop(geo, mat);
  line.frustumCulled = false;
  scene.add(line);
  return line;
}

buildOvalLine(TRACK_A + 1.8, TRACK_B + 1.8, 0.05, 0xf472b6, 0.9);
buildOvalLine(TRACK_A - 1.8, TRACK_B - 1.8, 0.05, 0x38bdf8, 0.9);
buildOvalLine(TRACK_A + 0.3, TRACK_B + 0.3, 0.02, 0x22d3ee, 0.25);

// Neon pylons around the arena
const pylonMat = new THREE.MeshStandardMaterial({ color: 0x0b0620, emissive: 0x22d3ee, emissiveIntensity: 1.6 });
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  const px = (S - 2.5) * Math.cos(angle);
  const pz = (S - 2.5) * Math.sin(angle);
  addStaticBox(0.5, 7, 0.5, px, 3.5, pz, pylonMat);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), pylonMat);
  tip.position.set(px, 7.2, pz);
  scene.add(tip);
}

// Scatter neon "buildings" (obstacle-free decorative towers inside the arena)
const towerMat = new THREE.MeshStandardMaterial({
  color: 0x0a0420,
  emissive: 0x6d28d9,
  emissiveIntensity: 0.7,
  roughness: 0.4,
  metalness: 0.5
});
const towerPositions: Array<[number, number]> = [
  [14, 8],
  [-13, 12],
  [16, -10],
  [-16, -6],
  [2, 20],
  [-4, -20],
  [24, -18],
  [-24, 16],
  [6, 30],
  [-9, -30]
];
for (const [tx, tz] of towerPositions) {
  const h = 4 + Math.random() * 5;
  addStaticBox(2.4, h, 2.4, tx, h / 2, tz, towerMat);
}

// ---------------------------------------------------------------------------
// Car model
// ---------------------------------------------------------------------------
const car = new THREE.Group();
car.name = 'player-car';

const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0b1120, metalness: 0.9, roughness: 0.25 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x05010f, emissive: 0x22d3ee, emissiveIntensity: 1.8 });
const trimMatPink = new THREE.MeshStandardMaterial({ color: 0x05010f, emissive: 0xec4899, emissiveIntensity: 1.8 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x0e2a3a, metalness: 1, roughness: 0.05 });
const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xd9faff, emissiveIntensity: 2.5 });
const tailMat = new THREE.MeshStandardMaterial({ color: 0x1a0000, emissive: 0xff1a1a, emissiveIntensity: 2.5 });

function part(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = !isMobile;
  car.add(m);
  return m;
}

// Body (built with local origin at the road surface)
part(new THREE.BoxGeometry(CAR_W, 0.5, CAR_L), bodyMat, 0, 0.5, 0);
part(new THREE.BoxGeometry(1.66, 0.26, 1.0), bodyMat, 0, 0.42, 1.62);
part(new THREE.BoxGeometry(1.54, 0.5, 1.66), glassMat, 0, 1.02, -0.1);

// Neon trim strips
part(new THREE.BoxGeometry(0.04, 0.03, 2.9), trimMat, CAR_W / 2 + 0.03, 0.62, 0);
part(new THREE.BoxGeometry(0.04, 0.03, 2.9), trimMat, -CAR_W / 2 - 0.03, 0.62, 0);
part(new THREE.BoxGeometry(0.03, 0.03, 0.9), trimMatPink, 0, 0.55, -1.55);

// Headlights & taillights
part(new THREE.BoxGeometry(0.32, 0.12, 0.06), lightMat, 0.62, 0.62, 1.78);
part(new THREE.BoxGeometry(0.32, 0.12, 0.06), lightMat, -0.62, 0.62, 1.78);
part(new THREE.BoxGeometry(0.36, 0.14, 0.06), tailMat, 0.62, 0.62, -1.76);
part(new THREE.BoxGeometry(0.36, 0.14, 0.06), tailMat, -0.62, 0.62, -1.76);

// Spoiler
part(new THREE.BoxGeometry(1.72, 0.08, 0.5), bodyMat, 0, 0.92, -1.62);
part(new THREE.BoxGeometry(0.08, 0.3, 0.08), bodyMat, 0.6, 0.82, -1.56);
part(new THREE.BoxGeometry(0.08, 0.3, 0.08), bodyMat, -0.6, 0.82, -1.56);

// Underglow
const underglow = part(new THREE.BoxGeometry(1.8, 0.04, 2.8), trimMat, 0, 0.08, 0);
(underglow.material as THREE.MeshStandardMaterial).color.setHex(0x05010f);
(underglow.material as THREE.MeshStandardMaterial).emissive.setHex(0xa855f7);
(underglow.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.0;
(underglow.material as THREE.MeshStandardMaterial).transparent = true;
(underglow.material as THREE.MeshStandardMaterial).opacity = 0.85;
(underglow.material as THREE.MeshStandardMaterial).blending = THREE.AdditiveBlending;
(underglow.material as THREE.MeshStandardMaterial).depthWrite = false;

const underLight = new THREE.PointLight(0xa855f7, 18, 6);
underLight.position.set(0, 0.25, 0);
car.add(underLight);

// Wheels
const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9, metalness: 0.2 });
const hubMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.2, emissive: 0x6366f1, emissiveIntensity: 0.4 });
const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 18);
const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.28, 10);
const wheels: THREE.Group[] = [];
for (const [wx, wz] of [[0.82, 1.18], [-0.82, 1.18], [0.82, -1.18], [-0.82, -1.18]] as Array<[number, number]>) {
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(wx, 0.34, wz);
  const tire = new THREE.Mesh(tireGeo, tireMat);
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = !isMobile;
  wheelGroup.add(tire);
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.rotation.z = Math.PI / 2;
  wheelGroup.add(hub);
  car.add(wheelGroup);
  wheels.push(wheelGroup);
}

scene.add(car);

// ---------------------------------------------------------------------------
// Physics: car body
// ---------------------------------------------------------------------------
const carBody = new RigidBody();
carBody.type = RigidBodyType.Dynamic;
carBody.mass = 1.6;
carBody.linearDamping = 0.0;
carBody.angularDamping = 0.0;
const carCollider = new Collider();
carCollider.type = ColliderType.Box;
carCollider.size = new Vector3(CAR_W, CAR_H, CAR_L);

const SPAWN = v3(0, CAR_H / 2, 14);
app.physics.registerBody(carBody, carCollider, new Vector3(SPAWN.x, SPAWN.y, SPAWN.z));

// ---------------------------------------------------------------------------
// Rings (collectibles) along the oval track
// ---------------------------------------------------------------------------
interface Ring {
  mesh: THREE.Mesh;
  baseY: number;
  collected: boolean;
  respawnAt: number;
}

const rings: Ring[] = [];
const ringMat = new THREE.MeshStandardMaterial({
  color: 0x05010f,
  emissive: 0xfbbf24,
  emissiveIntensity: 2.2,
  metalness: 0.6,
  roughness: 0.2
});
const ringGeo = new THREE.TorusGeometry(1.15, 0.13, 12, 32);
const RING_COUNT = 14;
for (let i = 0; i < RING_COUNT; i++) {
  const t = (i / RING_COUNT) * Math.PI * 2;
  const ring = new THREE.Mesh(ringGeo, ringMat);
  const rx = TRACK_A * Math.cos(t);
  const rz = TRACK_B * Math.sin(t);
  const baseY = 1.9 + Math.sin(t * 2) * 0.4;
  ring.position.set(rx, baseY, rz);
  ring.castShadow = !isMobile;
  scene.add(ring);
  rings.push({ mesh: ring, baseY, collected: false, respawnAt: 0 });
}

// ---------------------------------------------------------------------------
// Boost pads
// ---------------------------------------------------------------------------
const padMat = new THREE.MeshStandardMaterial({
  color: 0x05010f,
  emissive: 0x22d3ee,
  emissiveIntensity: 1.6,
  transparent: true,
  opacity: 0.9
});
const padGeo = new THREE.PlaneGeometry(3.2, 5.2);
interface BoostPad {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  cooldown: number;
}
const boostPads: BoostPad[] = [];
for (let i = 0; i < 6; i++) {
  const t = (i / 6) * Math.PI * 2 + 0.4;
  const pad = new THREE.Mesh(padGeo, padMat);
  const px = TRACK_A * Math.cos(t);
  const pz = TRACK_B * Math.sin(t);
  pad.position.set(px, 0.06, pz);
  pad.rotation.x = -Math.PI / 2;
  scene.add(pad);
  boostPads.push({ mesh: pad, x: px, z: pz, cooldown: 0 });
}

// ---------------------------------------------------------------------------
// Obstacles: cones & crates
// ---------------------------------------------------------------------------
const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0x7c2d12, emissiveIntensity: 0.4, roughness: 0.5 });
const coneGeo = new THREE.ConeGeometry(0.36, 1.2, 16);
const crateMat = new THREE.MeshStandardMaterial({ color: 0x0b0620, emissive: 0x8b5cf6, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.3 });
const crateGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);

const coneSpots: Array<[number, number]> = [
  [10, 2], [-12, 2], [12, -2], [-13, -2], [6, -8], [-7, -9],
  [18, -4], [-20, -8], [3, 10], [-3, -11], [10, -14], [-12, 15]
];
for (const [cx, cz] of coneSpots) {
  addDynamicObstacle(coneGeo, coneMat, cx, cz, [0.72, 1.2, 0.72], 1.2);
}

const crateSpots: Array<[number, number]> = [
  [22, 4], [-24, -4], [20, 12], [-22, -12], [26, -14], [-26, 10], [8, 26], [-10, -26]
];
for (const [cx, cz] of crateSpots) {
  addDynamicObstacle(crateGeo, crateMat, cx, cz, [1.1, 1.1, 1.1], 2.2);
}

// ---------------------------------------------------------------------------
// Particles & skid trail
// ---------------------------------------------------------------------------
const particles = new ParticleSystem(isMobile ? 400 : 900);
scene.add(particles.mesh);

class SkidTrail {
  private line: THREE.Line;
  private max: number;
  private positions: Float32Array;
  private count = 0;

  constructor(max = 700, color = 0x7dd3fc) {
    this.max = max;
    this.positions = new Float32Array(max * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.line = new THREE.Line(geo, mat);
    this.line.frustumCulled = false;
    scene.add(this.line);
  }

  add(x: number, y: number, z: number): void {
    if (this.count >= this.max) {
      this.positions.copyWithin(0, 3, this.count * 3);
      this.count--;
    }
    const i = this.count * 3;
    this.positions[i] = x;
    this.positions[i + 1] = y;
    this.positions[i + 2] = z;
    this.count++;
    const geo = this.line.geometry as THREE.BufferGeometry;
    geo.setDrawRange(0, this.count);
    (geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  }
}

const skidTrail = new SkidTrail();

// ---------------------------------------------------------------------------
// Engine audio (Web Audio hum)
// ---------------------------------------------------------------------------
class EngineSound {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gain: GainNode | null = null;

  init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC: typeof AudioContext | undefined =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.value = 60;
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'square';
      this.osc2.frequency.value = 30;
      const g2 = this.ctx.createGain();
      g2.gain.value = 0.35;
      this.osc.connect(this.gain);
      this.osc2.connect(g2);
      g2.connect(this.gain);
      this.gain.connect(filter);
      filter.connect(this.ctx.destination);
      this.osc.start();
      this.osc2.start();
    } catch {
      this.ctx = null;
    }
  }

  update(speed: number, throttle: number): void {
    if (!this.ctx || !this.osc || !this.osc2 || !this.gain) return;
    if (this.ctx.state === 'suspended') return;
    const t = this.ctx.currentTime;
    const freq = 42 + Math.abs(speed) * 5.6 + Math.max(0, throttle) * 24;
    this.osc.frequency.setTargetAtTime(freq, t, 0.05);
    this.osc2.frequency.setTargetAtTime(freq * 0.5, t, 0.05);
    const vol = Math.min(0.09, 0.012 + Math.abs(speed) * 0.0011 + Math.max(0, throttle) * 0.02);
    this.gain.gain.setTargetAtTime(vol, t, 0.05);
  }
}

const engineSound = new EngineSound();

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
let started = false;
let speed = 0;            // signed scalar m/s
let yaw = 0;              // car heading
let score = 0;
let driftScore = 0;
let boost = 100;
let boosting = false;
let drifting = false;
let driftAmount = 0;
let lap = 1;
let frame = 0;
let prevCarZ = SPAWN.z;

// Lap validation: accumulate signed angular progress around the oval so a
// start-line crossing only counts after a real lap (wiggle-proof, and works
// in either travel direction).
let lapProgress = 0;      // radians accumulated since last counted lap
let lapPrevTheta: number | null = null;
let lapStartTime = 0;
const MIN_LAP_ARC = 5.0;  // ~286° of the oval required before a crossing counts
let bestLapMs = Number(localStorage.getItem('kairo-car-best-lap')) || 0;
let bestScore = Number(localStorage.getItem('kairo-car-best-score')) || 0;

function fmtTime(ms: number): string {
  const s = ms / 1000;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;
}

function rearmRings(): void {
  const now = performance.now();
  for (const ring of rings) {
    ring.collected = false;
    ring.respawnAt = now;
    ring.mesh.visible = true;
  }
}

function restartRun(): void {
  score = 0;
  driftScore = 0;
  lap = 1;
  lapProgress = 0;
  lapPrevTheta = null;
  lapStartTime = performance.now();
  rearmRings();
  respawn();
  app.ui.showToast('🔄 RUN RESTARTED — Shift+R anytime', 1800, 'info');
}

let boostBtnHeld = false;

let lastCrashSound = 0;

const hudScore = document.getElementById('score-num')!;
const hudSpeed = document.getElementById('speed-num')!;
const hudBoost = document.getElementById('boost-fill')!;
const hudDrift = document.getElementById('drift-indicator')!;
const hudLap = document.getElementById('lap-num')!;
const hudFps = document.getElementById('fps-num')!;
const hudDriftScore = document.getElementById('drift-score')!;
const hudBestLap = document.getElementById('best-lap')!;
const hudBestScore = document.getElementById('best-score')!;

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
function readInput(): { throttle: number; steer: number; boostKey: boolean; driftKey: boolean } {
  if (isMobile) {
    const active = app.input.touchJoystickActive;
    const jy = active ? app.input.touchJoystickVector.y : 0;
    const jx = active ? app.input.touchJoystickVector.x : 0;
    const throttle = active ? Math.max(0, -jy) - Math.max(0, jy) * 0.6 : 0;
    return { throttle, steer: jx, boostKey: boostBtnHeld, driftKey: boostBtnHeld };
  }
  const up = app.isKeyDown('KeyW') || app.isKeyDown('ArrowUp');
  const down = app.isKeyDown('KeyS') || app.isKeyDown('ArrowDown');
  const left = app.isKeyDown('KeyA') || app.isKeyDown('ArrowLeft');
  const right = app.isKeyDown('KeyD') || app.isKeyDown('ArrowRight');
  const throttle = up ? 1 : down ? -0.65 : 0;
  const steer = left ? -1 : right ? 1 : 0;
  return {
    throttle,
    steer,
    boostKey: app.input.isActionActive('Sprint'),
    driftKey: app.input.isActionActive('Jump')
  };
}

function respawn(): void {
  speed = 0;
  yaw = 0; // forward faces +Z
  const cb = carBody.cannonBody!;
  cb.position.set(SPAWN.x, SPAWN.y, SPAWN.z);
  cb.previousPosition.copy(cb.position);
  cb.velocity.set(0, 0, 0);
  cb.angularVelocity.set(0, 0, 0);
  boost = 100;
}

// ---------------------------------------------------------------------------
// Start screen & audio unlock
// ---------------------------------------------------------------------------
const startScreen = document.getElementById('start-screen')!;
function begin(): void {
  if (started) return;
  started = true;
  engineSound.init();
  startScreen.style.display = 'none';
  lapStartTime = performance.now();
  app.ui.showToast('GO!', 900, 'info');
}

startScreen.addEventListener('click', begin);
startScreen.addEventListener('touchstart', begin, { passive: true });
window.addEventListener('keydown', (e) => {
  if (!started && (e.code === 'Enter' || e.code === 'Space')) {
    e.preventDefault();
    begin();
  }
});

// Mobile touch controls
const joystickZone = document.getElementById('joystick-zone')!;
const joystickKnob = document.getElementById('joystick-knob')!;
const boostBtn = document.getElementById('btn-boost')!;
const joyCenter = { x: 0, y: 0 };
const joyMax = 50;

function updateJoystick(touch: Touch): void {
  let dx = touch.clientX - joyCenter.x;
  let dy = touch.clientY - joyCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > joyMax) {
    dx = (dx / dist) * joyMax;
    dy = (dy / dist) * joyMax;
  }
  joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  app.input.touchJoystickVector.set(dx / joyMax, dy / joyMax);
}

joystickZone.addEventListener('touchstart', (e) => {
  e.preventDefault();
  app.input.touchJoystickActive = true;
  const rect = joystickZone.getBoundingClientRect();
  joyCenter.x = rect.left + rect.width / 2;
  joyCenter.y = rect.top + rect.height / 2;
  const t = e.touches[0];
  updateJoystick(t);
}, { passive: false });

joystickZone.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = Array.from(e.touches).find((tt) => tt.target === joystickZone || tt.target === joystickKnob);
  if (t) updateJoystick(t);
}, { passive: false });

function resetJoystick(): void {
  app.input.touchJoystickActive = false;
  app.input.touchJoystickVector.set(0, 0);
  joystickKnob.style.transform = 'translate(-50%, -50%)';
}
joystickZone.addEventListener('touchend', resetJoystick);
joystickZone.addEventListener('touchcancel', resetJoystick);

boostBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  boostBtnHeld = true;
  boostBtn.classList.add('active');
}, { passive: false });
boostBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  boostBtnHeld = false;
  boostBtn.classList.remove('active');
}, { passive: false });
boostBtn.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  boostBtnHeld = false;
  boostBtn.classList.remove('active');
}, { passive: false });

// ---------------------------------------------------------------------------
// Update loop
// ---------------------------------------------------------------------------
app.onUpdate((dt) => {
  frame++;
  const delta = Math.min(dt, 1 / 20);

  // Attract-mode camera before start
  if (!started) {
    const t = frame * delta;
    app.cameraController.setTargetPosition(v3(Math.sin(t * 0.2) * 12, 1, Math.cos(t * 0.2) * 12));
    app.cameraController.yaw = t * 0.5;
    app.cameraController.pitch = 0.45;
    app.cameraController.distance = 18;
    app.cameraController.update(delta);
    particles.update(delta);
    return;
  }

  // ---- Input ----
  const input = readInput();

  if (app.input.isKeyJustPressed('KeyR')) {
    if (app.isKeyDown('ShiftLeft') || app.isKeyDown('ShiftRight')) restartRun();
    else respawn();
  }

  // ---- Car dynamics ----
  boosting = input.boostKey && boost > 1 && speed > 0.5;
  drifting = input.driftKey && Math.abs(speed) > 6;

  if (boosting) {
    speed += ACCEL * 1.35 * delta;
    if (speed > BOOST_MAX) speed = Math.max(speed - delta * 10, BOOST_MAX);
    boost = Math.max(0, boost - delta * 26);
  } else {
    boost = Math.min(100, boost + delta * 5);
  }

  if (input.throttle > 0) {
    const cap = boosting ? BOOST_MAX : MAX_SPEED;
    speed += ACCEL * (boosting ? 1.25 : 1) * delta * input.throttle;
    if (speed > cap) speed = Math.max(speed - delta * 9, cap);
  } else if (input.throttle < 0) {
    if (speed > 0.5) {
      speed -= BRAKE * delta;
    } else {
      speed = Math.max(-REVERSE_MAX, speed + input.throttle * ACCEL * 0.6 * delta);
    }
  } else {
    speed *= Math.max(0, 1 - delta * 1.4);
    if (Math.abs(speed) < 0.2) speed = 0;
  }

  // Steering (speed-sensitive)
  const speedFactor = Math.min(1, Math.abs(speed) / 18);
  const steerStrength = input.steer * STEER_BASE * (0.22 + 0.78 * speedFactor) * (1 - (Math.abs(speed) / BOOST_MAX) * 0.45);
  yaw += steerStrength * delta;

  // Apply to physics body
  const cb = carBody.cannonBody!;
  const desiredVx = Math.sin(yaw) * speed;
  const desiredVz = Math.cos(yaw) * speed;

  const grip = drifting ? 2.6 : 10;
  const vx = cb.velocity.x + (desiredVx - cb.velocity.x) * Math.min(1, delta * grip);
  const vz = cb.velocity.z + (desiredVz - cb.velocity.z) * Math.min(1, delta * grip);
  cb.velocity.x = vx;
  cb.velocity.z = vz;
  cb.angularVelocity.set(0, 0, 0);
  cb.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), yaw);

  // ---- Arena safety clamp ----
  const margin = 3.0;
  const p = cb.position;
  const hitWall = p.x > S - margin || p.x < -S + margin || p.z > S - margin || p.z < -S + margin;
  p.x = Math.max(-S + margin, Math.min(S - margin, p.x));
  p.z = Math.max(-S + margin, Math.min(S - margin, p.z));
  if (hitWall && Math.abs(speed) > 14) {
    speed *= 0.5;
  }

  // ---- Impact detection (wall / obstacle) ----
  const actualSpeed = Math.sqrt(cb.velocity.x * cb.velocity.x + cb.velocity.z * cb.velocity.z);
  const impactSpeed = Math.max(0, Math.abs(speed) - actualSpeed - 4);
  if (impactSpeed > 10 && frame - lastCrashSound > 20) {
    lastCrashSound = frame;
    particles.emitBurst(v3(p.x, 0.6, p.z), 'explosion', isMobile ? 14 : 26);
    app.audio.playSynthesizedSound('explosion');
    app.cameraController.shake({ intensity: Math.min(0.8, impactSpeed * 0.03), duration: 0.35 });
    if (impactSpeed > 20) app.ui.showToast('CRASH!', 900, 'warning');
  }

  // ---- Drift scoring ----
  if (drifting) {
    driftScore += delta * Math.abs(speed);
    driftAmount = Math.min(1, driftAmount + delta * 2.5);
  } else {
    driftAmount = Math.max(0, driftAmount - delta * 3);
    if (driftAmount === 0 && driftScore > 0) {
      const bonus = Math.round(driftScore);
      score += bonus;
      driftScore = 0;
      app.ui.showToast(`DRIFT +${bonus}`, 1200, 'success');
    }
  }

  // ---- Sync car visual ----
  car.position.set(p.x, p.y, p.z);
  car.rotation.y = yaw;
  const spin = (speed / 0.34) * delta;
  for (const w of wheels) w.rotation.x += spin;

  // ---- Wheel contact points & skid marks ----
  if (drifting && Math.abs(speed) > 10) {
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    for (const side of [-1, 1]) {
      skidTrail.add(
        p.x + fx * -1.1 + rx * (0.82 * side),
        0.04,
        p.z + fz * -1.1 + rz * (0.82 * side)
      );
    }
    if (Math.random() < 0.5) {
      particles.emitBurst(v3(p.x + fx * -1.6, 0.3, p.z + fz * -1.6), 'smoke', 3);
    }
  }

  // ---- Exhaust / boost flames ----
  const fx = Math.sin(yaw);
  const fz = Math.cos(yaw);
  const exhaustPos = v3(p.x + fx * -1.9, 0.45, p.z + fz * -1.9);
  if (boosting) {
    particles.emitBurst(exhaustPos, 'explosion', isMobile ? 2 : 3);
    if (Math.random() < 0.6) particles.emitBurst(exhaustPos, 'fire', 2);
  } else if (Math.abs(speed) > 4) {
    if (Math.random() < 0.5) particles.emitBurst(exhaustPos, 'fire', 1);
  }

  // ---- Rings ----
  const nowMs = performance.now();
  for (const ring of rings) {
    ring.mesh.rotation.y += delta * 2;
    ring.mesh.rotation.x = Math.sin(frame * 0.02 + ring.baseY);
    ring.mesh.position.y = ring.baseY + Math.sin(frame * delta * 2 + ring.baseY) * 0.25;
    if (ring.collected) {
      if (nowMs >= ring.respawnAt) {
        ring.collected = false;
        ring.mesh.visible = true;
        particles.emitBurst(ring.mesh.position, 'sparkle', isMobile ? 8 : 14);
      }
      continue;
    }
    if (ring.mesh.position.distanceTo(car.position) < 2.9) {
      ring.collected = true;
      ring.respawnAt = nowMs + 8000;
      ring.mesh.visible = false;
      score += 100;
      boost = Math.min(100, boost + 8);
      particles.emitBurst(ring.mesh.position, 'collect_burst', isMobile ? 16 : 30);
      app.audio.playSynthesizedSound('coin');
      app.ui.showToast('+100 RING', 700, 'success');
    }
  }

  // ---- Boost pads ----
  for (const pad of boostPads) {
    pad.cooldown = Math.max(0, pad.cooldown - delta);
    if (pad.cooldown <= 0 && Math.abs(p.x - pad.x) < 2.2 && Math.abs(p.z - pad.z) < 3.2) {
      pad.cooldown = 1.2;
      boost = Math.min(100, boost + 30);
      speed = Math.max(speed, Math.min(BOOST_MAX, Math.abs(speed) + 16));
      particles.emitBurst(v3(p.x, 0.5, p.z), 'teleport_flash', isMobile ? 18 : 30);
      app.audio.playSynthesizedSound('switch');
      app.cameraController.shake({ intensity: 0.35, duration: 0.3 });
    }
  }

  // ---- Laps (validated by accumulated angular progress + start-line crossing) ----
  {
    // Parametric angle around the oval; accumulate shortest signed step.
    const theta = Math.atan2(p.x / TRACK_A, p.z / TRACK_B);
    let d = theta - (lapPrevTheta ?? theta);
    if (d > Math.PI) d -= Math.PI * 2;
    else if (d < -Math.PI) d += Math.PI * 2;
    lapProgress += d;
    lapPrevTheta = theta;

    if (p.z > 13.5 && prevCarZ < 13.5 && Math.abs(p.x) < 3 && speed > 2) {
      if (Math.abs(lapProgress) >= MIN_LAP_ARC) {
        const now = performance.now();
        let msg = `LAP ${lap}`;
        if (lapStartTime > 0) {
          const lapMs = now - lapStartTime;
          msg += ` — ${fmtTime(lapMs)}`;
          if (!bestLapMs || lapMs < bestLapMs) {
            bestLapMs = lapMs;
            localStorage.setItem('kairo-car-best-lap', String(Math.round(lapMs)));
            msg = `⭐ BEST LAP ${fmtTime(lapMs)}`;
          }
        }
        lap++;
        lapStartTime = now;
        app.ui.showToast(msg, 1600, 'info');
        particles.emitBurst(v3(0, 1.2, 14), 'sparkle', isMobile ? 12 : 24);
      }
      // Reset progress either way so line-wiggling never accumulates credit.
      lapProgress = 0;
    }

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('kairo-car-best-score', String(score));
    }
  }
  prevCarZ = p.z;

  // ---- Obstacles sync ----
  for (const ob of obstacles) {
    const obBody = ob.rb.cannonBody;
    if (obBody) {
      ob.mesh.position.set(obBody.position.x, obBody.position.y, obBody.position.z);
      ob.mesh.quaternion.set(obBody.quaternion.x, obBody.quaternion.y, obBody.quaternion.z, obBody.quaternion.w);
    }
  }

  // ---- Camera ----
  app.cameraController.setTargetPosition(v3(p.x, 0.9, p.z));
  app.cameraController.yaw = yaw + Math.PI;
  app.cameraController.distance = 7.6 + Math.min(6, Math.abs(speed) * 0.11);
  app.cameraController.pitch = 0.32;

  const targetFov = 58 + Math.min(20, Math.abs(speed) * 0.38);
  const cam = app.camera as THREE.PerspectiveCamera;
  cam.fov += (targetFov - cam.fov) * Math.min(1, delta * 4);
  cam.updateProjectionMatrix();

  // ---- Particles ----
  particles.update(delta);

  // ---- Engine audio ----
  engineSound.update(speed, input.throttle);

  // ---- HUD ----
  hudScore.textContent = String(score);
  hudSpeed.textContent = String(Math.round(Math.abs(speed) * 3.6));
  hudBoost.style.width = `${boost.toFixed(0)}%`;
  hudDrift.style.opacity = driftAmount > 0.35 ? '1' : '0';
  hudDriftScore.textContent = String(Math.round(driftScore));
  hudLap.textContent = String(lap);
  hudBestLap.textContent = bestLapMs ? fmtTime(bestLapMs) : '--';
  hudBestScore.textContent = String(bestScore);
  if (frame % 30 === 0) {
    hudFps.textContent = String(app.pipeline.metrics.fps.toFixed(0));
  }
});

// ---------------------------------------------------------------------------
// Start!
// ---------------------------------------------------------------------------
app.start();
