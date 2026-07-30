import { Engine, Vector3 } from '@kairo/core';
import { PhysicsWorld, RigidBody, Collider, RigidBodyType, ColliderType } from '@kairo/physics';
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

// Synthesizer
let audioCtx: any = null;
function getAudioCtx() {
  if (audioCtx) return audioCtx;
  try {
    const AudioCtxCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxCtor) audioCtx = new AudioCtxCtor();
  } catch (e) {}
  return audioCtx;
}

function playSfx(type: string) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  
  try {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'jump') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);
      gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'coin') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'hit') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.2);
      gain.gain.setValueAtTime(0.35, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    }
  } catch(e) {}
}

const engine = new Engine();
const physics = new PhysicsWorld();
physics.gravity = new Vector3(0, -35, 0);

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x09090b);
scene.fog = new THREE.FogExp2(0x09090b, 0.02);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-6, 3, 8);
camera.lookAt(-6, 2, 0);

const renderer = new WebGPURenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(10, 15, 10); sun.castShadow = true;
sun.shadow.mapSize.width = 2048; sun.shadow.mapSize.height = 2048;
scene.add(sun);
const rimLight = new THREE.PointLight(0x3b82f6, 4.0, 20);
rimLight.position.set(-10, 5, -5);
scene.add(rimLight);

// Track
const grid = new THREE.GridHelper(40, 40, 0x3b82f6, 0x18181b);
grid.position.y = 0.01;
scene.add(grid);

const trackMesh = new THREE.Mesh(
  new THREE.BoxGeometry(40, 0.4, 10), 
  new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6, metalness: 0.1 })
);
trackMesh.position.set(0, -0.2, 0);
trackMesh.receiveShadow = true;
scene.add(trackMesh);

// Ground Physics
const groundBody = new RigidBody();
groundBody.type = RigidBodyType.Static;
const groundCollider = new Collider();
groundCollider.type = ColliderType.Box;
groundCollider.size = new Vector3(40, 0.4, 10);
physics.registerBody(groundBody, groundCollider, new Vector3(0, -0.2, 0));

// Player Mesh
const playerGroup = new THREE.Group();
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.3 });
const skinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
const pantsMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

// Torso
const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.55, 20), bodyMat); 
chest.position.set(0, 1.6, 0); chest.castShadow = true; playerGroup.add(chest);
const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.4, 20), pantsMat); 
waist.position.set(0, 1.15, 0); waist.castShadow = true; playerGroup.add(waist);

// Head & Face
const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), skinMat); 
head.position.set(0, 2.2, 0); head.castShadow = true; playerGroup.add(head);
const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), pupilMat); 
eyeL.position.set(-0.11, 2.26, 0.3); playerGroup.add(eyeL);
const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), pupilMat); 
eyeR.position.set(0.11, 2.26, 0.3); playerGroup.add(eyeR);

// Arms (pivoting from shoulders)
const armGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.9, 16);
armGeom.translate(0, -0.45, 0); // Origin at shoulder
const armL = new THREE.Mesh(armGeom, bodyMat); 
armL.position.set(-0.35, 1.8, 0); armL.rotation.z = 0.2; armL.castShadow = true; playerGroup.add(armL);
const armR = new THREE.Mesh(armGeom, bodyMat); 
armR.position.set(0.35, 1.8, 0); armR.rotation.z = -0.2; armR.castShadow = true; playerGroup.add(armR);

// Legs (pivoting from hips)
const legGeom = new THREE.CylinderGeometry(0.07, 0.06, 1.0, 16);
legGeom.translate(0, -0.5, 0); // Origin at hip
const legL = new THREE.Mesh(legGeom, pantsMat); 
legL.position.set(-0.16, 1.0, 0); legL.castShadow = true; playerGroup.add(legL);
const legR = new THREE.Mesh(legGeom, pantsMat); 
legR.position.set(0.16, 1.0, 0); legR.castShadow = true; playerGroup.add(legR);

scene.add(playerGroup);

// Physics Entities
const playerRb = new RigidBody();
playerRb.type = RigidBodyType.Dynamic;
playerRb.mass = 1.0;
playerRb.fixedRotation = true;
const playerCol = new Collider();
playerCol.type = ColliderType.Box;
playerCol.size = new Vector3(0.5, 1.25, 0.5); // Half-extents for physics box (2.5m tall total)
let playerPos = new Vector3(-6, 3, 0);
physics.registerBody(playerRb, playerCol, playerPos);

const coinsList: { mesh: THREE.Mesh, x: number, y: number, active: boolean }[] = [];
const hazardsList: { mesh: THREE.Mesh, x: number }[] = [];

// Spawn game objects
const coinMat = new THREE.MeshStandardMaterial({ 
  color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8, 
  roughness: 0.1, metalness: 1.0
});
const coinGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 20); 
coinGeom.rotateX(Math.PI / 2);

for (let i = 0; i < 8; i++) {
  const coin = new THREE.Mesh(coinGeom, coinMat);
  const cx = -3 + i * 2.2, cy = 1.2 + Math.sin(i * 0.8) * 0.8;
  coin.position.set(cx, cy, 0); coin.castShadow = true; scene.add(coin);
  coinsList.push({ mesh: coin, x: cx, y: cy, active: true });
}

const hazMat = new THREE.MeshStandardMaterial({ 
  color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6, roughness: 0.2
});
const hazGeom = new THREE.ConeGeometry(0.35, 0.7, 16);
for (let j = 0; j < 3; j++) {
  const haz = new THREE.Mesh(hazGeom, hazMat);
  const hx = -1.5 + j * 4.5;
  haz.position.set(hx, 0.35, 0); haz.castShadow = true; scene.add(haz);
  hazardsList.push({ mesh: haz, x: hx });
}

// Input and State
const keys: Record<string, boolean> = {};
const touchState = { left: false, right: false, jump: false };
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function bindTouch(el: HTMLElement | null, key: 'left' | 'right' | 'jump') {
  if (!el) return;
  const on = (e: Event) => { e.preventDefault(); touchState[key] = true; };
  const off = (e: Event) => { e.preventDefault(); touchState[key] = false; };
  el.addEventListener('touchstart', on); el.addEventListener('touchend', off);
  el.addEventListener('mousedown', on); el.addEventListener('mouseup', off);
}
bindTouch(document.getElementById('btn-left'), 'left');
bindTouch(document.getElementById('btn-right'), 'right');
bindTouch(document.getElementById('btn-jump'), 'jump');

let score = 0, health = 100, isGameOver = false, isGrounded = true;

(window as any).resetGame = function() {
  score = 0; health = 100; isGameOver = false; 
  playerPos.set(-6, 3, 0);
  playerRb.velocity = new Vector3(0, 0, 0);
  
  if((window as any).hideGameOver) (window as any).hideGameOver();
  
  coinsList.forEach(c => { c.active = true; c.mesh.visible = true; });
};

engine.events.on('update', (dt: number) => {
  if (!isGameOver) {
    physics.step(dt);
    
    // Position mesh
    playerGroup.position.x = playerPos.x;
    playerGroup.position.y = playerPos.y - 1.1; // Offset for collider half-height + small visual padding so feet don't clip underground
    playerGroup.position.z = playerPos.z;
    
    let moveX = 0;
    if (keys['KeyA'] || keys['ArrowLeft'] || touchState.left) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight'] || touchState.right) moveX += 1;
    
    // Rotate character to face movement direction
    if (moveX > 0) playerGroup.rotation.y = Math.PI / 2;
    else if (moveX < 0) playerGroup.rotation.y = -Math.PI / 2;
    else playerGroup.rotation.y = Math.PI / 2; // Default facing right
    
    // Physics Velocity Control
    let vel = playerRb.velocity;
    vel.x = moveX * 7;
    
    // Lock Z axis completely to prevent falling off the 2.5D track
    if (playerRb.cannonBody) {
      playerRb.cannonBody.position.z = 0;
      playerRb.cannonBody.velocity.z = 0;
    }
    
    // Basic Walk Animation (arms and legs swing)
    const t = performance.now() * 0.012;
    if (Math.abs(vel.x) > 0.5) {
      legL.rotation.x = Math.sin(t) * 0.8;
      legR.rotation.x = Math.sin(t + Math.PI) * 0.8;
      armL.rotation.x = Math.sin(t + Math.PI) * 0.8; // Opposite to leg
      armR.rotation.x = Math.sin(t) * 0.8;
    } else {
      // Ease back to idle
      legL.rotation.x *= 0.8;
      legR.rotation.x *= 0.8;
      armL.rotation.x *= 0.8;
      armR.rotation.x *= 0.8;
    }

    isGrounded = Math.abs(vel.y) < 0.1 && playerPos.y < 3.0;
    if ((keys['KeyW'] || keys['Space'] || keys['ArrowUp'] || touchState.jump) && isGrounded) {
      vel.y = 13;
      playSfx('jump');
    }
    
    playerRb.velocity = vel;

    // Bounds check applied directly to physics body to prevent sliding out of bounds
    if (playerRb.cannonBody) {
      if (playerRb.cannonBody.position.x < -12) {
        playerRb.cannonBody.position.x = -12;
        playerRb.cannonBody.velocity.x = 0;
      }
      if (playerRb.cannonBody.position.x > 12) {
        playerRb.cannonBody.position.x = 12;
        playerRb.cannonBody.velocity.x = 0;
      }
      // Re-sync playerPos
      playerPos.x = playerRb.cannonBody.position.x;
    }

    const pX = playerPos.x;
    const pY = playerGroup.position.y;

    // Collisions
    coinsList.forEach(c => {
      if (c.active) {
        c.mesh.rotation.z += dt * 3;
        if (Math.abs(pX - c.x) < 0.8 && Math.abs(pY - c.y) < 1.2) {
          c.active = false; c.mesh.visible = false; score += 100; playSfx('coin');
        }
      }
    });

    hazardsList.forEach(h => {
      if (Math.abs(pX - h.x) < 0.6 && pY < 1.0) {
        health -= 40 * dt;
        if (health <= 0) { 
          health = 0; isGameOver = true; playSfx('hit'); 
          if((window as any).showGameOver) (window as any).showGameOver();
        }
      }
    });

    // Update DOM
    document.getElementById('score-val')!.innerText = score.toString();
    document.getElementById('health-val')!.innerText = `${Math.ceil(health)}%`;
    document.getElementById('health-fill')!.style.width = `${Math.max(0, health)}%`;
    if(health < 30) {
      document.getElementById('health-fill')!.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
      document.getElementById('health-fill')!.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
    } else {
      document.getElementById('health-fill')!.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      document.getElementById('health-fill')!.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.4)';
    }

    camera.position.x += (pX - camera.position.x) * 0.1;
    camera.lookAt(camera.position.x, 2, 0);
  }
});

engine.events.on('render', () => {
  renderer.renderAsync(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Start Engine ---
(async () => {
  await renderer.init();
  engine.start();
})();
console.log('Kairo Engine + Cannon-ES + Motion.dev Started');
