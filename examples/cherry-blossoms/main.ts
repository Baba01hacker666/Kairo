import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

// Initialize the Kairo App with a misty rose background
const app = new KairoApp({ background: 0xffe4e1 });

// Soft cinematic lighting
app.setLighting({ ambient: 0.9, sunPosition: [10, 20, -5], sunIntensity: 2.0 });

// Forest green ground
app.createBox({ 
  size: [50, 1, 50], 
  position: [0, -0.5, 0], 
  color: 0x4a5d23, 
  physics: 'static' 
});

// A simple minimalist tree trunk
app.createBox({ 
  size: [0.8, 6, 0.8], 
  position: [0, 3, 0], 
  color: 0x5c4033, 
  physics: 'static' 
});

// A stylized cherry tree canopy
const canopyGeo = new THREE.DodecahedronGeometry(3.5, 1);
const canopyMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
const canopy = new THREE.Mesh(canopyGeo, canopyMat);
canopy.position.set(0, 6.5, 0);
canopy.castShadow = true;
app.scene.add(canopy);

// Create 300 cherry blossom petals for the falling effect!
const petalGeo = new THREE.PlaneGeometry(0.15, 0.15);
const petalMat = new THREE.MeshStandardMaterial({ 
  color: 0xffb7c5, // Light pink
  side: THREE.DoubleSide,
  roughness: 0.4
});

interface PetalData {
  mesh: THREE.Mesh;
  seed: number;
  startY: number;
  landedTime: number;
}

const petals: PetalData[] = [];

for (let i = 0; i < 300; i++) {
  const mesh = new THREE.Mesh(petalGeo, petalMat);
  mesh.castShadow = true;
  
  // Random start position within the canopy bounds
  const startX = (Math.random() - 0.5) * 6;
  const startZ = (Math.random() - 0.5) * 6;
  const startY = 5 + Math.random() * 3;
  
  mesh.position.set(startX, startY, startZ);
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  
  app.scene.add(mesh);
  
  petals.push({
    mesh,
    seed: Math.random() * 100,
    startY,
    landedTime: 0
  });
}

// Position camera for a cinematic shot
app.camera.position.set(0, 4, 12);

// Use Motion.dev (integrated into KairoApp) to animate a smooth cinematic camera pan back and forth!
app.animate(app.camera.position, {
  x: [-6, 6]
}, { duration: 15, direction: 'alternate', repeat: Infinity, ease: 'easeInOut' });

app.animate(app.camera.position, {
  y: [2, 6]
}, { duration: 10, direction: 'alternate', repeat: Infinity, ease: 'easeInOut' });

// Petal Animation Loop
app.onUpdate((dt) => {
  const time = performance.now() * 0.001;
  app.camera.lookAt(0, 3, 0); // Always keep the camera locked on the tree trunk
  
  for (const petal of petals) {
    const p = petal.mesh.position;
    const r = petal.mesh.rotation;
    
    if (p.y > 0.02) {
      // 1. Falling Phase
      // Float downwards slowly
      p.y -= 1.2 * dt; 
      
      // Sway side to side using sine waves based on the petal's unique random seed
      p.x += Math.sin(time * 2 + petal.seed) * 0.8 * dt;
      p.z += Math.cos(time * 1.5 + petal.seed) * 0.8 * dt;
      
      // Gently tumble and rotate in the air
      r.x += 1.0 * dt;
      r.y += 1.5 * dt;
      r.z += 0.5 * dt;
    } else {
      // 2. Landed Phase
      p.y = 0.01 + (petal.seed * 0.0001); // Prevent Z-fighting when lying on the ground
      
      // Snap rotation so it lays flat on the grass
      r.x = Math.PI / 2;
      r.y = 0;
      // Keep its current Z rotation so it lands facing a random direction
      
      // Keep track of how long it's been on the ground
      if (petal.landedTime === 0) {
        petal.landedTime = time;
      }
      
      // 3. Respawn Phase
      // After lying on the ground for a few seconds, magically respawn back in the canopy to create an infinite loop!
      if (time - petal.landedTime > 6) { // 6 seconds on ground
        p.y = petal.startY;
        p.x = (Math.random() - 0.5) * 6;
        p.z = (Math.random() - 0.5) * 6;
        petal.landedTime = 0; // Reset landed time
      }
    }
  }
});

// Run the engine
app.start();
