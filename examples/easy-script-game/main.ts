import * as THREE from 'three';
import { EasyScript, ScriptRunner } from '@kairo/core';

// DOM Elements & HUD State
let score = 0;
let avocadosCollected = 0;
const totalAvocados = 4;

const scoreEl = document.getElementById('hud-score-val');
const avoEl = document.getElementById('hud-avocado-val');

function updateHUD() {
  if (scoreEl) scoreEl.innerText = score.toString();
  if (avoEl) avoEl.innerText = `${avocadosCollected} / ${totalAvocados}`;
}

// 1. Three.js 3D Scene Setup
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f19);
scene.fog = new THREE.FogExp2(0x0b0f19, 0.025);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 2. Lighting Setup
const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfffaed, 1.5);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);

const accentLight = new THREE.PointLight(0x6366f1, 4.0, 30);
accentLight.position.set(0, 4, 0);
scene.add(accentLight);

// 3. Environment Arena Grid Floor & Walls
const gridHelper = new THREE.GridHelper(30, 30, 0x6366f1, 0x1e293b);
gridHelper.position.y = 0;
scene.add(gridHelper);

// Simple Wall Boundaries
const wallGroup = new THREE.Group();
const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
const createWall = (x: number, z: number, w: number, d: number) => {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 2, d), wallMat);
  wall.position.set(x, 1, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  wallGroup.add(wall);
};
createWall(0, -15, 30, 1);
createWall(0, 15, 30, 1);
createWall(-15, 0, 1, 30);
createWall(15, 0, 1, 30);
scene.add(wallGroup);

// 4. Create 3D Player Entity
const playerGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.6, 16);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.3, metalness: 0.2 });
const playerMesh = new THREE.Mesh(playerGeo, playerMat);
playerMesh.position.set(0, 0.8, 0);
playerMesh.castShadow = true;
scene.add(playerMesh);

// Player Visor
const visorGeo = new THREE.BoxGeometry(0.6, 0.3, 0.4);
const visorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 });
const visor = new THREE.Mesh(visorGeo, visorMat);
visor.position.set(0, 0.4, -0.3);
playerMesh.add(visor);

// 5. EasyScript Behavior Registration
const scriptRunner = new ScriptRunner();
const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Touch Joystick Setup
const touchVector = { x: 0, y: 0 };
const joystickZone = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');

if (joystickZone && joystickKnob) {
  let center = { x: 0, y: 0 };
  const maxRadius = 45;

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = Array.from(e.touches).find(t => t.target === joystickZone || t.target === joystickKnob);
    if (!touch) return;
    let dx = touch.clientX - center.x;
    let dy = touch.clientY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    touchVector.x = dx / maxRadius;
    touchVector.y = dy / maxRadius;
  };

  joystickZone.addEventListener('touchstart', (e) => {
    const rect = joystickZone.getBoundingClientRect();
    center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    onTouchMove(e);
  }, { passive: false });

  joystickZone.addEventListener('touchmove', onTouchMove, { passive: false });

  const resetJoystick = () => {
    touchVector.x = 0; touchVector.y = 0;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
  };
  joystickZone.addEventListener('touchend', resetJoystick);
  joystickZone.addEventListener('touchcancel', resetJoystick);
}

// Register 🏃 Player Behavior via EasyScript
const playerBehavior = EasyScript.createBehavior({
  onUpdate(dt: number) {
    const speed = 6.5;
    let moveX = 0, moveZ = 0;

    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    if (touchVector.x !== 0 || touchVector.y !== 0) {
      moveX = touchVector.x;
      moveZ = touchVector.y;
    }

    if (moveX !== 0 || moveZ !== 0) {
      this.move(moveX * speed * dt, 0, moveZ * speed * dt);
      const angle = Math.atan2(moveX, moveZ);
      this.object.rotation.y = angle;
    }

    if (keys['Space']) {
      this.jump(8.0);
    }
  }
});
scriptRunner.add(playerBehavior, playerMesh, { ui: { showToast: console.log }, audio: null });

// Touch Jump & Interact Buttons
document.getElementById('btn-touch-jump')?.addEventListener('click', () => {
  playerBehavior.jump(8.0);
});

// 6. Spawn Collectible Items (Avocados & Golden Stars)
const itemGroup = new THREE.Group();
scene.add(itemGroup);

const itemPositions = [
  { x: -8, z: -8, type: 'avocado' },
  { x: 8, z: -8, type: 'avocado' },
  { x: -8, z: 8, type: 'avocado' },
  { x: 8, z: 8, type: 'avocado' }
];

itemPositions.forEach((pos, idx) => {
  const itemGeo = new THREE.OctahedronGeometry(0.6);
  const itemMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.5 });
  const itemMesh = new THREE.Mesh(itemGeo, itemMat);
  itemMesh.position.set(pos.x, 1.2, pos.z);
  itemMesh.castShadow = true;
  itemGroup.add(itemMesh);

  // Attach EasyScript Motion to Collectible Item
  const itemBehavior = EasyScript.createBehavior({
    onStart() {
      this.spin(2.0);
      this.bob(0.3, 3.5);
      this.pulse(0.85, 1.2, 3.0);
    },
    onUpdate() {
      if (this.isNear(playerMesh, 1.2)) {
        score += 100;
        avocadosCollected++;
        updateHUD();
        this.sparkle(40);
        this.destroy();
      }
    }
  });
  scriptRunner.add(itemBehavior, itemMesh);
});

// 7. Spawn AI Patrol Enemy Bot
const enemyGeo = new THREE.DodecahedronGeometry(0.7);
const enemyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
enemyMesh.position.set(0, 1.2, -6);
enemyMesh.castShadow = true;
scene.add(enemyMesh);

const enemyBehavior = EasyScript.createBehavior({
  onStart() {
    this.patrol(6.0, 2.5);
    this.spin(1.0);
  },
  onUpdate(dt: number) {
    if (this.isNear(playerMesh, 1.4)) {
      this.explode(40);
      this.setPosition((Math.random() - 0.5) * 20, 1.2, (Math.random() - 0.5) * 20);
    }
  }
});
scriptRunner.add(enemyBehavior, enemyMesh);

// 8. Modal & Controls Setup
const modal = document.getElementById('code-modal');
document.getElementById('btn-view-code')?.addEventListener('click', () => {
  modal?.classList.add('active');
});
document.getElementById('btn-close-modal')?.addEventListener('click', () => {
  modal?.classList.remove('active');
});
document.getElementById('btn-restart')?.addEventListener('click', () => {
  window.location.reload();
});

// 9. Main Animation Loop
let lastTime = performance.now();

function animate(now: number) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  scriptRunner.update(dt);

  // Smooth Camera Follow Player
  camera.position.x += (playerMesh.position.x - camera.position.x) * 0.1;
  camera.position.y += (playerMesh.position.y + 8 - camera.position.y) * 0.1;
  camera.position.z += (playerMesh.position.z + 12 - camera.position.z) * 0.1;
  camera.lookAt(playerMesh.position);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateHUD();
animate(performance.now());
