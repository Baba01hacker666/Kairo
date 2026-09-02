import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ARENA_HALF = 14;
const WALL_H = 5;

const isMobile =
  typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768);

const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x05070f,
  gravity: [0, -32, 0],
  shadows: !isMobile,
  gameId: 'neon_blitz'
});

app.setLighting({
  ambient: 0.55,
  sunPosition: [6, 22, 4],
  sunIntensity: 1.3,
  sunColor: 0xb7e9ff,
  ambientColor: 0x6d28d9
});

const scene = app.scene;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function addArenaWall(w: number, h: number, d: number, x: number, y: number, z: number, color: number): void {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.4 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = !isMobile;
  mesh.receiveShadow = !isMobile;
  scene.add(mesh);
}

// ---------------------------------------------------------------------------
// Environment: neon arena
// ---------------------------------------------------------------------------
const R = ARENA_HALF;

// Ground
const ground = new THREE.Mesh(
  new THREE.BoxGeometry(R * 2 + 4, 1, R * 2 + 4),
  new THREE.MeshStandardMaterial({ color: 0x0a0a18, roughness: 0.9, metalness: 0.05 })
);
ground.position.set(0, -0.5, 0);
ground.receiveShadow = true;
scene.add(ground);

app.createBox({ size: [R * 2 + 4, 1, R * 2 + 4], position: [0, -0.5, 0], color: 0x0a0a18, physics: 'static' });

const grid = new THREE.GridHelper(R * 2, 28, 0x22d3ee, 0xa855f7);
(grid.material as THREE.Material).transparent = true;
(grid.material as THREE.Material).opacity = 0.22;
grid.position.y = 0.02;
scene.add(grid);

// Glowing walls
const wallMat = new THREE.MeshStandardMaterial({ color: 0x111633, roughness: 0.5, metalness: 0.5 });
const edgeMat = new THREE.MeshStandardMaterial({
  color: 0x05010f,
  emissive: 0x22d3ee,
  emissiveIntensity: 2.2,
  roughness: 0.4,
  metalness: 0.2
});
const T = 1.0;
addArenaWall(R * 2 + T * 2, WALL_H, T, 0, WALL_H / 2, R + T / 2, 0x0e1030);
addArenaWall(R * 2 + T * 2, WALL_H, T, 0, WALL_H / 2, -R - T / 2, 0x0e1030);
addArenaWall(T, WALL_H, R * 2 + T * 2, R + T / 2, WALL_H / 2, 0, 0x0e1030);
addArenaWall(T, WALL_H, R * 2 + T * 2, -R - T / 2, WALL_H / 2, 0, 0x0e1030);

// Neon top edges
function neonTop(w: number, d: number, x: number, z: number): void {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), edgeMat);
  mesh.position.set(x, WALL_H + 0.06, z);
  scene.add(mesh);
}
neonTop(R * 2 + T * 2, 0.5, 0, R + T / 2);
neonTop(R * 2 + T * 2, 0.5, 0, -R - T / 2);
neonTop(0.5, R * 2 + T * 2, R + T / 2, 0);
neonTop(0.5, R * 2 + T * 2, -R - T / 2, 0);

// Corner pylons
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const px = (R - 2.5) * Math.cos(angle);
  const pz = (R - 2.5) * Math.sin(angle);
  addArenaWall(0.5, 7, 0.5, px, 3.5, pz, 0x1e1b4b);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), edgeMat);
  tip.position.set(px, 7.2, pz);
  scene.add(tip);
}

// Decorative floating neon crystals
const crystalMat = new THREE.MeshStandardMaterial({
  color: 0x0a0420,
  emissive: 0x7c3aed,
  emissiveIntensity: 1.4,
  roughness: 0.3,
  metalness: 0.6,
  transparent: true,
  opacity: 0.9
});
const crystalGeo = new THREE.OctahedronGeometry(0.9);
const crystals: THREE.Mesh[] = [];
for (let i = 0; i < 14; i++) {
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.set(
    (Math.random() - 0.5) * (R * 2 - 6),
    6 + Math.random() * 8,
    (Math.random() - 0.5) * (R * 2 - 6)
  );
  scene.add(crystal);
  crystals.push(crystal);
}

// ---------------------------------------------------------------------------
// Player orb
// ---------------------------------------------------------------------------
const orbGroup = new THREE.Group();
const orbMat = new THREE.MeshStandardMaterial({
  color: 0x05010f,
  emissive: 0x22d3ee,
  emissiveIntensity: 2.4,
  metalness: 0.7,
  roughness: 0.2
});
const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), orbMat);
orb.castShadow = !isMobile;
orbGroup.add(orb);

// Orb inner glow
const glowMat = new THREE.MeshBasicMaterial({
  color: 0x22d3ee,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const glow = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 32), glowMat);
orbGroup.add(glow);

const orbLight = new THREE.PointLight(0x22d3ee, 16, 8);
orbLight.position.y = 0.3;
orbGroup.add(orbLight);

scene.add(orbGroup);

const SPAWN = new THREE.Vector3(0, 1.2, 8);

// ---------------------------------------------------------------------------
// Player physics
// ---------------------------------------------------------------------------
const player = app.createBox({
  size: [0.9, 0.9, 0.9],
  position: [SPAWN.x, SPAWN.y, SPAWN.z],
  color: 0x22d3ee,
  physics: 'dynamic',
  mass: 2
});
player.mesh.visible = false;

// ---------------------------------------------------------------------------
// Collectible orbs
// ---------------------------------------------------------------------------
const orbMat2 = new THREE.MeshStandardMaterial({
  color: 0x05010f,
  emissive: 0x34d399,
  emissiveIntensity: 2.0,
  metalness: 0.6,
  roughness: 0.2
});
const collectGeo = new THREE.SphereGeometry(0.3, 16, 16);
interface Collectible {
  mesh: THREE.Mesh;
  active: boolean;
  respawnAt: number;
}
const collectibles: Collectible[] = [];
for (let i = 0; i < 16; i++) {
  const c = new THREE.Mesh(collectGeo, orbMat2);
  c.position.set(
    (Math.random() - 0.5) * (R * 2 - 4),
    0.7,
    (Math.random() - 0.5) * (R * 2 - 4)
  );
  c.castShadow = !isMobile;
  scene.add(c);
  collectibles.push({ mesh: c, active: true, respawnAt: 0 });
}

// ---------------------------------------------------------------------------
// Spinning spike hazards (patrol around the arena)
// ---------------------------------------------------------------------------
const spikeMat = new THREE.MeshStandardMaterial({
  color: 0x1a0000,
  emissive: 0xff1a3a,
  emissiveIntensity: 2.2,
  roughness: 0.5
});
interface Hazard {
  mesh: THREE.Group;
  centerX: number;
  centerZ: number;
  radius: number;
  speed: number;
  phase: number;
}
const hazards: Hazard[] = [];
const hazardSpots: Array<[number, number, number, number]> = [
  [0, 0, 5, 0.8],
  [-6, -6, 4, 1.1],
  [6, -7, 4, 0.9],
  [-5, 6, 3.5, 1.2],
  [7, 5, 3, 1.0],
  [0, 0, 2, 0.6]
];
for (const [cx, cz, radius, speed] of hazardSpots) {
  const g = new THREE.Group();
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), spikeMat);
  staff.position.y = 1.2;
  g.add(staff);
  for (let k = 0; k < 6; k++) {
    const angle = (k / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 8), spikeMat);
    spike.position.set(Math.cos(angle) * 0.6, 1.2, Math.sin(angle) * 0.6);
    spike.rotation.z = -Math.PI / 2;
    spike.rotation.y = angle;
    g.add(spike);
  }
  g.position.set(cx, 0, cz);
  scene.add(g);
  hazards.push({ mesh: g, centerX: cx, centerZ: cz, radius, speed, phase: Math.random() * Math.PI * 2 });
}

// ---------------------------------------------------------------------------
// Particles (simple sparkle system via points)
// ---------------------------------------------------------------------------
const particleCount = isMobile ? 300 : 600;
const pGeo = new THREE.BufferGeometry();
const pPos = new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3);
pGeo.setAttribute('position', pPos);
const pMat = new THREE.PointsMaterial({
  color: 0x22d3ee,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const points = new THREE.Points(pGeo, pMat);
points.frustumCulled = false;
scene.add(points);
let pIndex = 0;
function emitSpark(pos: THREE.Vector3, color = 0x22d3ee): void {
  const ga = pGeo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < 6; i++) {
    const idx = pIndex * 3;
    ga.setXYZ(
      idx / 3,
      pos.x + (Math.random() - 0.5) * 0.6,
      pos.y + 0.3 + (Math.random() - 0.5) * 0.6,
      pos.z + (Math.random() - 0.5) * 0.6
    );
    pIndex = (pIndex + 1) % particleCount;
  }
  ga.needsUpdate = true;
  pMat.color.setHex(color);
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
let started = false;
let over = false;
let health = 100;
let score = 0;
let elapsed = 0;
let best = Number(localStorage.getItem('kairo-neon-blitz-best')) || 0;
let hitCooldown = 0;
let frame = 0;

const hudScore = document.getElementById('score')!;
const hudHealth = document.getElementById('health')!;
const hudBest = document.getElementById('best')!;
const hudTime = document.getElementById('time')!;
const msgTitle = document.getElementById('message-title')!;
const msgSub = document.getElementById('message-sub')!;
const messageBox = document.getElementById('message')!;
const startScreen = document.getElementById('start-screen')!;

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function showMessage(title: string, sub: string): void {
  msgTitle.textContent = title;
  msgSub.textContent = sub;
  messageBox.style.opacity = '1';
}
function hideMessage(): void {
  messageBox.style.opacity = '0';
}

function flashDanger(): void {
  const rect = document.createElement('div');
  rect.style.cssText =
    'position:fixed;inset:0;background:rgba(255,26,58,0.15);pointer-events:none;z-index:40;transition:opacity 0.4s;';
  document.body.appendChild(rect);
  requestAnimationFrame(() => (rect.style.opacity = '0'));
  setTimeout(() => rect.remove(), 500);
}

function gameOver(): void {
  over = true;
  if (score > best) {
    best = score;
    localStorage.setItem('kairo-neon-blitz-best', String(best));
    hudBest.textContent = String(best);
    showMessage('NEW RECORD!', `You set a high score of ${score} orbs.`);
  } else {
    showMessage('WRECKED!', `You collected ${score} orbs and survived ${fmtTime(elapsed)}.`);
  }
  app.ui.showToast('Game Over', 2000, 'warning');
}

function restart(): void {
  over = false;
  health = 100;
  score = 0;
  elapsed = 0;
  hitCooldown = 0;
  if (player.rb!.cannonBody) {
    player.rb!.cannonBody.position.set(SPAWN.x, SPAWN.y, SPAWN.z);
    player.rb!.cannonBody.velocity.set(0, 0, 0);
    player.rb!.cannonBody.angularVelocity.set(0, 0, 0);
  }
  for (const c of collectibles) {
    c.active = true;
    c.mesh.visible = true;
  }
  hideMessage();
  app.ui.showToast('GO!', 900, 'info');
}

function begin(): void {
  if (started) return;
  started = true;
  app.audio.playSynthesizedSound('coin');
  startScreen.style.display = 'none';
  restart();
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const joyCenter = { x: 0, y: 0 };
const joyMax = 50;
let sprintHeld = false;

function readMove(): { x: number; z: number } {
  if (isMobile) {
    const v = app.input.touchJoystickVector;
    return { x: v.x, z: v.y };
  }
  let x = 0;
  let z = 0;
  if (app.isKeyDown('KeyA') || app.isKeyDown('ArrowLeft')) x -= 1;
  if (app.isKeyDown('KeyD') || app.isKeyDown('ArrowRight')) x += 1;
  if (app.isKeyDown('KeyW') || app.isKeyDown('ArrowUp')) z -= 1;
  if (app.isKeyDown('KeyS') || app.isKeyDown('ArrowDown')) z += 1;
  return { x, z };
}

function isSprintPressed(): boolean {
  if (isMobile) return sprintHeld;
  return app.isKeyDown('Space') || app.isKeyDown('ShiftLeft') || app.isKeyDown('ShiftRight');
}

startScreen.addEventListener('click', begin);
startScreen.addEventListener('touchstart', begin, { passive: true });
window.addEventListener('keydown', (e) => {
  if (!started && (e.code === 'Enter' || e.code === 'Space')) {
    e.preventDefault();
    begin();
  }
  if (started && over && e.code === 'KeyR') restart();
});

// Mobile joystick
const joyZone = document.getElementById('joy-zone') as HTMLElement;
const joyKnob = document.getElementById('joy-knob') as HTMLElement;
joyZone.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    app.input.touchJoystickActive = true;
    const rect = joyZone.getBoundingClientRect();
    joyCenter.x = rect.left + rect.width / 2;
    joyCenter.y = rect.top + rect.height / 2;
    const t = e.touches[0];
    updateJoystick(t);
  },
  { passive: false }
);
joyZone.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault();
    const t = Array.from(e.touches).find((tt) => tt.target === joyZone || tt.target === joyKnob);
    if (t) updateJoystick(t);
  },
  { passive: false }
);
function updateJoystick(touch: Touch): void {
  let dx = touch.clientX - joyCenter.x;
  let dy = touch.clientY - joyCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > joyMax) {
    dx = (dx / dist) * joyMax;
    dy = (dy / dist) * joyMax;
  }
  joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  app.input.touchJoystickVector.set(dx / joyMax, -dy / joyMax);
}
function resetJoystick(): void {
  app.input.touchJoystickActive = false;
  app.input.touchJoystickVector.set(0, 0);
  joyKnob.style.transform = 'translate(-50%, -50%)';
}
joyZone.addEventListener('touchend', resetJoystick);
joyZone.addEventListener('touchcancel', resetJoystick);

const actionBtn = document.getElementById('btn-action') as HTMLElement;
actionBtn.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    sprintHeld = true;
    actionBtn.classList.add('active');
  },
  { passive: false }
);
actionBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  sprintHeld = false;
  actionBtn.classList.remove('active');
});
actionBtn.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  sprintHeld = false;
  actionBtn.classList.remove('active');
});

// ---------------------------------------------------------------------------
// Update loop
// ---------------------------------------------------------------------------
app.onUpdate((dt) => {
  frame++;
  const delta = Math.min(dt, 1 / 30);
  const time = performance.now() * 0.001;

  // Attract camera before start
  if (!started) {
    app.camera.position.x += (Math.sin(time * 0.3) * 12 - app.camera.position.x) * 0.05;
    app.camera.position.y += (10 - app.camera.position.y) * 0.02;
    app.camera.position.z += (12 - app.camera.position.z) * 0.02;
    app.camera.lookAt(0, 1, 0);
    return;
  }

  if (!over) elapsed += delta;

  const cb = player.rb!.cannonBody;
  const isGrounded = cb ? Math.abs(cb.velocity.y) < 0.5 : true;

  // ---- Movement ----
  if (!over) {
    const move = readMove();
    const speed = isSprintPressed() ? 16 : 9.5;
    if (cb) {
      cb.velocity.x = move.x * speed;
      cb.velocity.z = move.z * speed;

      // Jump
      if (app.isKeyDown('KeyJ') && isGrounded) {
        cb.velocity.y = 9;
        app.audio.playSynthesizedSound('jump');
      }

      // Arena bounds
      const p = cb.position;
      p.x = Math.max(-R + 1, Math.min(R - 1, p.x));
      p.z = Math.max(-R + 1, Math.min(R - 1, p.z));
      cb.velocity.y = Math.max(-40, cb.velocity.y);
    }
  }

  // Sync orb visual to physics
  if (cb) {
    orbGroup.position.set(cb.position.x, cb.position.y, cb.position.z);
    orbGroup.rotation.x += delta * 2;
    orbGroup.rotation.z += delta * 1.5;
    glow.scale.setScalar(1 + Math.sin(time * 4) * 0.08);
  }

  // ---- Collectibles ----
  if (!over) {
    const nowMs = performance.now();
    for (const c of collectibles) {
      c.mesh.rotation.y += delta * 3;
      if (c.active) {
        if (c.mesh.position.distanceTo(orbGroup.position) < 1.4) {
          c.active = false;
          c.mesh.visible = false;
          c.respawnAt = nowMs + 6000;
          score += 10;
          emitSpark(c.mesh.position, 0x34d399);
          app.audio.playSynthesizedSound('coin');
        }
      } else if (nowMs >= c.respawnAt) {
        c.active = true;
        c.mesh.visible = true;
        c.mesh.position.set(
          (Math.random() - 0.5) * (R * 2 - 4),
          0.7,
          (Math.random() - 0.5) * (R * 2 - 4)
        );
      }
    }
  }

  // ---- Hazards ----
  if (!over) {
    for (const h of hazards) {
      const t = time * h.speed + h.phase;
      const px = h.centerX + Math.cos(t) * h.radius;
      const pz = h.centerZ + Math.sin(t * 1.3) * h.radius;
      h.mesh.position.x = px;
      h.mesh.position.z = pz;
      h.mesh.rotation.y += delta * 3;

      const dx = orbGroup.position.x - px;
      const dz = orbGroup.position.z - pz;
      const dist2 = dx * dx + dz * dz;
      if (hitCooldown <= 0 && dist2 < 1.1 * 1.1) {
        hitCooldown = 1.2;
        health -= 25;
        emitSpark(orbGroup.position, 0xff1a3a);
        app.audio.playSynthesizedSound('explosion');
        app.cameraFX.shake(0.5, 0.4);
        flashDanger();
        // Knockback
        if (cb) {
          const kb = Math.sqrt(dist2) || 1;
          cb.velocity.x += (dx / kb) * 10;
          cb.velocity.z += (dz / kb) * 10;
          cb.velocity.y = 6;
        }
        if (health <= 0) {
          health = 0;
          gameOver();
        }
      }
    }
    if (hitCooldown > 0) hitCooldown -= delta;
  }

  // Ambient crystals rotate + bob
  for (let i = 0; i < crystals.length; i++) {
    crystals[i].rotation.y += delta * 0.4;
    crystals[i].position.y += Math.sin(time + i) * 0.002;
  }

  // ---- Camera follow ----
  app.camera.position.x += (orbGroup.position.x - app.camera.position.x) * 0.08;
  app.camera.position.y += (9 - app.camera.position.y) * 0.05;
  app.camera.position.z += (orbGroup.position.z + 11 - app.camera.position.z) * 0.08;
  app.camera.lookAt(orbGroup.position);

  // ---- HUD ----
  hudScore.textContent = String(score);
  hudHealth.textContent = String(Math.max(0, health));
  hudBest.textContent = String(best);
  hudTime.textContent = fmtTime(elapsed);

  if (frame % 60 === 0 && cb) {
    emitSpark(orbGroup.position);
  }
});

// ---------------------------------------------------------------------------
// Start!
// ---------------------------------------------------------------------------
app.start();
