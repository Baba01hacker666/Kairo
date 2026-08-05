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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
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

// Mock App Context for EasyScript Engine Camera & UI Features
const mockApp = {
  cameraController: {
    camera,
    position: camera.position,
    target: playerMesh.position,
    cutTo: (pos: THREE.Vector3, target: THREE.Vector3) => {
      camera.position.copy(pos);
      camera.lookAt(target);
    },
    panTo: () => {},
    orbitShot: (center: THREE.Vector3) => {
      const angle = performance.now() * 0.001;
      camera.position.set(center.x + Math.sin(angle) * 8, center.y + 4, center.z + Math.cos(angle) * 8);
      camera.lookAt(center);
    },
    dollyZoom: () => {},
    shake: () => {}
  },
  ui: {
    showToast: (msg: string) => console.log(msg),
    setLetterbox: (enabled: boolean) => {
      let topBar = document.getElementById('letterbox-top');
      let botBar = document.getElementById('letterbox-bot');
      if (!topBar) {
        topBar = document.createElement('div');
        topBar.id = 'letterbox-top';
        topBar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:0%;background:#000;transition:height 0.4s ease;z-index:9999;pointer-events:none;';
        document.body.appendChild(topBar);
      }
      if (!botBar) {
        botBar = document.createElement('div');
        botBar.id = 'letterbox-bot';
        botBar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:0%;background:#000;transition:height 0.4s ease;z-index:9999;pointer-events:none;';
        document.body.appendChild(botBar);
      }
      topBar.style.height = enabled ? '10%' : '0%';
      botBar.style.height = enabled ? '10%' : '0%';
    },
    transitionCut: (type: string) => {
      let flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(239,68,68,0.4);z-index:9999;pointer-events:none;transition:opacity 0.4s ease;';
      document.body.appendChild(flash);
      setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 400); }, 100);
    },
    setColorGrading: (preset: string) => {
      let overlay = document.getElementById('color-grade-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'color-grade-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:998;transition:all 0.4s ease;';
        document.body.appendChild(overlay);
      }
      if (preset === 'cyberpunkNeon') {
        overlay.style.backdropFilter = 'contrast(120%) saturate(160%) hue-rotate(15deg)';
        overlay.style.background = 'rgba(99, 102, 241, 0.08)';
      } else if (preset === 'cinematicWarm') {
        overlay.style.backdropFilter = 'contrast(110%) sepia(25%) saturate(120%)';
        overlay.style.background = 'rgba(245, 158, 11, 0.06)';
      } else {
        overlay.style.backdropFilter = 'none';
        overlay.style.background = 'none';
      }
    },
    showImageOverlay: () => {
      let stamp = document.createElement('div');
      stamp.style.cssText = `
        position: fixed; top: 25%; left: 50%; transform: translate(-50%, -50%);
        width: 160px; height: 160px; background: radial-gradient(circle, #f59e0b, #ef4444);
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        display: flex; align-items: center; justify-content: center; color: white; font-weight: 900;
        font-family: sans-serif; font-size: 14px; z-index: 9999; pointer-events: none; text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.6);
      `;
      stamp.innerText = 'VICTORY!\nCLEARED';
      document.body.appendChild(stamp);
      return 'victory_stamp';
    }
  }
};

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
scriptRunner.add(playerBehavior, playerMesh, mockApp);

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

let victoryTriggered = false;

itemPositions.forEach((pos) => {
  const itemGeo = new THREE.OctahedronGeometry(0.6);
  const itemMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.5 });
  const itemMesh = new THREE.Mesh(itemGeo, itemMat);
  itemMesh.position.set(pos.x, 1.2, pos.z);
  itemMesh.castShadow = true;
  itemGroup.add(itemMesh);

  // Attach EasyScript Motion & Cinematic Video Overlay Effects
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
        this.setColorGrading('cyberpunkNeon');
        setTimeout(() => this.setColorGrading('none'), 1200);

        if (avocadosCollected >= totalAvocados && !victoryTriggered) {
          victoryTriggered = true;
          this.letterbox(true, 10);
          this.setColorGrading('cinematicWarm');
          this.showOverlayImage('');
        }

        this.destroy();
      }
    }
  });
  scriptRunner.add(itemBehavior, itemMesh, mockApp);
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
  onUpdate() {
    if (this.isNear(playerMesh, 1.4)) {
      this.explode(40);
      this.transitionCut('glitch', 400);
      this.setPosition((Math.random() - 0.5) * 20, 1.2, (Math.random() - 0.5) * 20);
    }
  }
});
scriptRunner.add(enemyBehavior, enemyMesh, mockApp);

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

  // Smooth Camera Follow Player or Victory Orbital Shot
  if (victoryTriggered) {
    const angle = now * 0.001;
    camera.position.x = playerMesh.position.x + Math.sin(angle) * 8;
    camera.position.y = playerMesh.position.y + 4;
    camera.position.z = playerMesh.position.z + Math.cos(angle) * 8;
    camera.lookAt(playerMesh.position);
  } else {
    camera.position.x += (playerMesh.position.x - camera.position.x) * 0.1;
    camera.position.y += (playerMesh.position.y + 8 - camera.position.y) * 0.1;
    camera.position.z += (playerMesh.position.z + 12 - camera.position.z) * 0.1;
    camera.lookAt(playerMesh.position);
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateHUD();
animate(performance.now());
