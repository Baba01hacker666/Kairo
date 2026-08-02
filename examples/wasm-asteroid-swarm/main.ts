import * as THREE from 'three';
import { FastSoAWorld } from '../../packages/ecs/src/FastSoAWorld.ts';

// WebGL Canvas & Scene Setup
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060810);
scene.fog = new THREE.FogExp2(0x060810, 0.008);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 70);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x00ffcc, 1.5);
dirLight.position.set(50, 80, 50);
scene.add(dirLight);

// Space Grid Helper
const gridHelper = new THREE.GridHelper(160, 40, 0x38bdf8, 0x1e293b);
gridHelper.position.y = -35;
scene.add(gridHelper);

// Player Ship Representation
const shipGroup = new THREE.Group();
const shipGeo = new THREE.ConeGeometry(1.2, 3.5, 4);
shipGeo.rotateX(Math.PI / 2);
const shipMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8, emissive: 0x0284c7 });
const shipMesh = new THREE.Mesh(shipGeo, shipMat);
shipGroup.add(shipMesh);
scene.add(shipGroup);

// Initialize High-Performance WASM-Grade SoA ECS Engine
let TARGET_ENTITIES = 5000;
let world = new FastSoAWorld(12000, 6.0);

// Create Instanced Mesh for 10,000+ Asteroid Entities (1 Single Draw Call!)
const asteroidGeo = new THREE.IcosahedronGeometry(0.5, 1);
const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.3 });
let instancedAsteroids = new THREE.InstancedMesh(asteroidGeo, asteroidMat, world.maxEntities);
instancedAsteroids.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(instancedAsteroids);

const dummy = new THREE.Object3D();

function populateSwarm(count: number) {
  world.clear();
  for (let i = 0; i < count; i++) {
    const rx = (Math.random() - 0.5) * 110;
    const ry = (Math.random() - 0.5) * 60;
    const rz = (Math.random() - 0.5) * 110;

    const vx = (Math.random() - 0.5) * 12;
    const vy = (Math.random() - 0.5) * 12;
    const vz = (Math.random() - 0.5) * 12;

    const radius = 0.4 + Math.random() * 0.4;
    world.spawnEntity(rx, ry, rz, vx, vy, vz, radius);
  }
}

populateSwarm(TARGET_ENTITIES);

// Keyboard Input Handling
const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyE') {
    TARGET_ENTITIES = Math.min(10000, TARGET_ENTITIES + 1000);
    populateSwarm(TARGET_ENTITIES);
  } else if (e.code === 'KeyQ') {
    TARGET_ENTITIES = Math.max(1000, TARGET_ENTITIES - 1000);
    populateSwarm(TARGET_ENTITIES);
  }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Telemetry DOM Elements
const elEntities = document.getElementById('stat-entities')!;
const elFps = document.getElementById('stat-fps')!;
const elMs = document.getElementById('stat-ms')!;
const elThroughput = document.getElementById('stat-throughput')!;

// Frame Loop Variables
let lastTime = performance.now();
let frameCount = 0;
let fpsTimer = 0;

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  // Player Flight Logic (WASD)
  const shipSpeed = 25 * dt;
  if (keys['KeyW']) shipGroup.position.z -= shipSpeed;
  if (keys['KeyS']) shipGroup.position.z += shipSpeed;
  if (keys['KeyA']) shipGroup.position.x -= shipSpeed;
  if (keys['KeyD']) shipGroup.position.x += shipSpeed;

  camera.position.x = shipGroup.position.x * 0.3;
  camera.position.z = shipGroup.position.z + 75;
  camera.lookAt(shipGroup.position.x * 0.5, shipGroup.position.y, shipGroup.position.z);

  // High-Speed SoA Vector Engine Simulation Step
  const simStart = performance.now();
  world.update(dt, 60.0);
  const simEnd = performance.now();
  const simTimeMs = simEnd - simStart;

  // Update InstancedMesh Matrix Buffer for 1 Single Draw Call!
  const count = world.activeCount;
  for (let i = 0; i < count; i++) {
    dummy.position.set(world.posX[i], world.posY[i], world.posZ[i]);
    const r = world.radius[i];
    dummy.scale.set(r * 2, r * 2, r * 2);
    dummy.updateMatrix();
    instancedAsteroids.setMatrixAt(i, dummy.matrix);
  }
  instancedAsteroids.count = count;
  instancedAsteroids.instanceMatrix.needsUpdate = true;

  renderer.render(scene, camera);

  // Telemetry HUD Updates
  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 0.2) {
    const fps = Math.round(frameCount / fpsTimer);
    const throughput = Math.round(count * fps);

    elEntities.textContent = count.toLocaleString();
    elFps.textContent = `${fps} FPS`;
    elMs.textContent = `${simTimeMs.toFixed(2)} ms / frame`;
    elThroughput.textContent = `${throughput.toLocaleString()} / sec`;

    frameCount = 0;
    fpsTimer = 0;
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
