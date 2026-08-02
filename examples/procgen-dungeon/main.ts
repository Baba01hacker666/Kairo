import * as THREE from 'three';
import { KairoApp, Vector3, CellularAutomata, SimplexNoise } from '@kairo/core';

const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x020617,
  gravity: [0, -40, 0], // Snappy gravity
  shadows: true,
  mode: '3d'
});

app.setLighting({
  ambient: 0.3,
  sunPosition: [20, 40, 20],
  sunIntensity: 1.2,
  sunColor: 0xffedd5,
  ambientColor: 0x1e293b
});

// Setup Top-Down Camera
app.camera.position.set(0, 40, 15);
app.camera.lookAt(0, 0, 0);

const levelBlocks: any[] = [];
let playerObj: any = null;

function generateLevel() {
  // Clear old level
  for (const block of levelBlocks) {
    block.dispose();
  }
  levelBlocks.length = 0;
  
  if (playerObj) {
    playerObj.dispose();
  }

  // 1. Procedural generation using Cellular Automata for Cave walls
  const width = 30;
  const height = 30;
  const ca = new CellularAutomata(width, height, 0.46, Math.random() * 1000000);
  ca.smooth(5);

  // 2. Procedural generation using Simplex Noise for floor coloring
  const noise = new SimplexNoise(Math.random() * 10000);

  let spawnPoint = new Vector3(0, 2, 0);
  let spawned = false;
  const blockSize = 3;

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < height; z++) {
      const worldX = (x - width / 2) * blockSize;
      const worldZ = (z - height / 2) * blockSize;

      if (ca.map[x][z] === 1) {
        // Wall
        const block = app.createBox({
          size: [blockSize, blockSize * 1.5, blockSize],
          position: [worldX, blockSize * 0.75, worldZ],
          color: 0x334155,
          physics: 'static',
          roughness: 0.9
        });
        levelBlocks.push(block);
      } else {
        // Floor
        const n = noise.noise2D(x * 0.15, z * 0.15);
        const color = new THREE.Color(0x0f172a).lerp(new THREE.Color(0x1e293b), (n + 1) / 2);
        
        const floor = app.createBox({
          size: [blockSize, 0.5, blockSize],
          position: [worldX, -0.25, worldZ],
          color: color.getHex(),
          physics: 'static',
          roughness: 1.0
        });
        levelBlocks.push(floor);

        // Find a valid open space to spawn player
        if (!spawned && x > 5 && x < width - 5 && z > 5 && z < height - 5) {
          spawnPoint.set(worldX, 2, worldZ);
          spawned = true;
        }
      }
    }
  }

  // Spawn Player
  playerObj = app.createBox({
    size: [1.2, 1.2, 1.2],
    position: [spawnPoint.x, spawnPoint.y, spawnPoint.z],
    color: 0xfbbf24,
    physics: 'dynamic',
    mass: 1,
    roughness: 0.2
  });
  
  if (playerObj.rb) {
    playerObj.rb.fixedRotation = true;
  }
}

// Generate the initial dungeon
generateLevel();

// Controls
let moveX = 0;
let moveZ = 0;

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveX = -1;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') moveX = 1;
  if (e.code === 'KeyW' || e.code === 'ArrowUp') moveZ = -1;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') moveZ = 1;
  if (e.code === 'KeyR') generateLevel();
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') if (moveX === -1) moveX = 0;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') if (moveX === 1) moveX = 0;
  if (e.code === 'KeyW' || e.code === 'ArrowUp') if (moveZ === -1) moveZ = 0;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') if (moveZ === 1) moveZ = 0;
});

const speed = 14;

app.onUpdate((dt) => {
  if (playerObj && playerObj.rb && playerObj.rb.cannonBody) {
    const body = playerObj.rb.cannonBody;
    
    // Apply movement velocity
    body.velocity.x = moveX * speed;
    body.velocity.z = moveZ * speed;
    
    // Smooth Camera Follow
    const targetX = body.position.x;
    const targetZ = body.position.z + 20; // Offset for isometric/top-down perspective
    
    app.camera.position.x += (targetX - app.camera.position.x) * dt * 5;
    app.camera.position.z += (targetZ - app.camera.position.z) * dt * 5;
    app.camera.lookAt(app.camera.position.x, body.position.y, app.camera.position.z - 20);
  }
});

app.start();
