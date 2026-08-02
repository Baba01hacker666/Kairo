import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { KairoApp, Vector3 } from '@kairo/core';

// 1. Initialize the Engine
const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x1e293b,
  gravity: [0, -25, 0], // Stronger gravity for snappy platforming
  shadows: true,
  mode: '3d', // We use a 3D camera to get perspective on our 3D objects
});

// Setup Lighting
app.setLighting({
  ambient: 0.6,
  sunPosition: [10, 20, 15],
  sunIntensity: 1.5,
  sunColor: 0xffffff,
  ambientColor: 0x64748b
});

// Position camera for a 2.5D side-view
app.camera.position.set(0, 4, 16);
(app.camera as THREE.PerspectiveCamera).fov = 45;
(app.camera as THREE.PerspectiveCamera).updateProjectionMatrix();

// ---------------------------------------------------------
// Procedurally Generate a Pixel Art Texture for the Player
// ---------------------------------------------------------
const canvas = document.createElement('canvas');
canvas.width = 16;
canvas.height = 16;
const ctx = canvas.getContext('2d')!;
// Body
ctx.fillStyle = '#38bdf8';
ctx.fillRect(2, 2, 12, 12);
// Eyes
ctx.fillStyle = '#ffffff';
ctx.fillRect(4, 4, 3, 3);
ctx.fillRect(9, 4, 3, 3);
// Pupils
ctx.fillStyle = '#0f172a';
ctx.fillRect(5, 5, 1, 1);
ctx.fillRect(10, 5, 1, 1);
// Mouth
ctx.fillStyle = '#0f172a';
ctx.fillRect(5, 10, 6, 2);

const playerTexUrl = canvas.toDataURL();

// ---------------------------------------------------------
// Build the Level
// ---------------------------------------------------------
// We use 3D boxes for platforms so that 3D cubes can bounce off them
app.createBox({ size: [40, 2, 4], position: [0, -1, 0], color: 0x334155, physics: 'static', roughness: 0.8 });
app.createBox({ size: [6, 1, 4], position: [8, 2, 0], color: 0x475569, physics: 'static', roughness: 0.8 });
app.createBox({ size: [6, 1, 4], position: [-8, 4, 0], color: 0x475569, physics: 'static', roughness: 0.8 });
app.createBox({ size: [6, 1, 4], position: [2, 7, 0], color: 0x475569, physics: 'static', roughness: 0.8 });

// Left/Right Walls
app.createBox({ size: [2, 20, 4], position: [-21, 9, 0], color: 0x1e293b, physics: 'static' });
app.createBox({ size: [2, 20, 4], position: [21, 9, 0], color: 0x1e293b, physics: 'static' });

// Add some purely decorative 3D background elements to emphasize the 2.5D depth
app.createBox({ size: [2, 12, 2], position: [-10, 5, -8], color: 0x0f172a, physics: 'static' });
app.createBox({ size: [3, 8, 2], position: [12, 3, -6], color: 0x0f172a, physics: 'static' });
app.createBox({ size: [4, 16, 2], position: [0, 7, -10], color: 0x0f172a, physics: 'static' });


// ---------------------------------------------------------
// The 2.5D Player
// ---------------------------------------------------------
// The player is a 2D quad that always faces the camera (billboard),
// but is physically locked to the Z=0 plane (lockZAxis).
const player = app.createBlock2D({
  size: [1.5, 1.5],
  position: [0, 2, 0],
  textureUrl: playerTexUrl,
  pixelArt: true,
  billboard: true, // Always face camera
  physics: 'dynamic',
  mass: 2,
  lockZAxis: true, // Prevents falling forward/backward into the 3D depth
  fixedRotation: true // Prevents tipping over
});

const playerBody = player.rb!.cannonBody!;
// Reduce friction so player slides easily
playerBody.material = new CANNON.Material({ friction: 0.0, restitution: 0.0 });

// Ground contact checking
let isGrounded = false;
app.physics.onCollision((event) => {
  if (event.body === player.rb) {
    if (event.phase === 'enter' || event.phase === 'stay') {
      // Check if contact normal points upwards relative to player
      if (event.otherCollider) {
        const bounds = event.otherCollider.getBoundingBox(event.other.cannonBody ? new Vector3(event.other.cannonBody.position.x, event.other.cannonBody.position.y, event.other.cannonBody.position.z) : new Vector3());
        const pY = playerBody.position.y - 0.75; // Player bottom
        if (pY >= bounds.max.y - 0.2) {
          isGrounded = true;
        }
      }
    }
  }
});

// ---------------------------------------------------------
// Controls
// ---------------------------------------------------------
let moveX = 0;
let jumpRequested = false;

// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveX = -1;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') moveX = 1;
  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') jumpRequested = true;
  if (e.code === 'KeyE') spawn3DCube();
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') if (moveX === -1) moveX = 0;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') if (moveX === 1) moveX = 0;
  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') jumpRequested = false;
});

// Mobile UI
const btnLeft = document.getElementById('btn-left')!;
const btnRight = document.getElementById('btn-right')!;
const btnJump = document.getElementById('btn-jump')!;
const btnSpawn = document.getElementById('btn-spawn')!;

const handleTouch = (btn: HTMLElement, val: number) => {
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); moveX = val; });
  btn.addEventListener('touchend', (e) => { e.preventDefault(); if (moveX === val) moveX = 0; });
};
handleTouch(btnLeft, -1);
handleTouch(btnRight, 1);

btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); jumpRequested = true; });
btnJump.addEventListener('touchend', (e) => { e.preventDefault(); jumpRequested = false; });
btnSpawn.addEventListener('pointerdown', (e) => { e.preventDefault(); spawn3DCube(); });

// ---------------------------------------------------------
// 3D Interaction
// ---------------------------------------------------------
function spawn3DCube() {
  // Spawns a full 3D physics box
  // It has no Z locks, so it will tumble in full 3D space, but it can still collide with the 2D player
  app.createBox({
    size: [1, 1, 1],
    position: [playerBody.position.x + (Math.random() - 0.5) * 2, 12, (Math.random() - 0.5) * 2],
    color: Math.random() * 0xffffff,
    physics: 'dynamic',
    mass: 0.5,
    roughness: 0.3
  });
}

// ---------------------------------------------------------
// Game Loop
// ---------------------------------------------------------
const speed = 10;
const jumpForce = 12;

app.onUpdate((dt) => {
  // Apply horizontal movement
  playerBody.velocity.x = moveX * speed;
  
  // Apply jump
  if (jumpRequested && isGrounded) {
    playerBody.velocity.y = jumpForce;
    isGrounded = false; // Prevent double jump immediately
  }
  
  // Smooth Camera Follow
  const targetX = playerBody.position.x;
  const targetY = Math.max(4, playerBody.position.y + 2);
  
  app.camera.position.x += (targetX - app.camera.position.x) * dt * 5;
  app.camera.position.y += (targetY - app.camera.position.y) * dt * 5;
  
  // Always look at the player plane
  app.camera.lookAt(app.camera.position.x, app.camera.position.y, 0);

  // Reset grounded flag for next frame (physics collision events will set it true if touching ground)
  isGrounded = false;
});

app.start();
