import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

// Create Kairo App
const app = new KairoApp({
  canvas: 'kairo-canvas',
  background: '#1a1a1a',
  shadows: true,
  gravity: [0, -9.8, 0]
});

// Setup Lighting
app.setLighting({
  sunPosition: [10, 20, 10],
  sunColor: 0xffffff,
  sunIntensity: 2.5,
  ambient: 0.5
});

app.camera.position.set(0, 15, 25);
app.camera.lookAt(0, 0, 0);

// Helper to create 2D text canvas as texture
function createTextSprite(text: string, size: number, color: string, yPos: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(20, 5, 1);
  sprite.position.y = yPos;
  return sprite;
}

// Title
const titleText = createTextSprite("GDP vs GDP per Capita", 80, "#4ade80", 12);
app.scene.add(titleText);

// Descriptions
const subText = createTextSprite("", 60, "#ffffff", -8);
app.scene.add(subText);

const gdpGroup = new THREE.Group();
gdpGroup.position.set(-10, 0, 0);
app.scene.add(gdpGroup);

const capitaGroup = new THREE.Group();
capitaGroup.position.set(10, 0, 0);
app.scene.add(capitaGroup);

// Materials
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });

const personGeo = new THREE.SphereGeometry(0.5, 16, 16);
const personMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });

// Scene 1: GDP
// A large country with a huge pile of money, but lots of people.
const country1Wealth = new THREE.Group();
for (let i = 0; i < 20; i++) {
  const mesh = new THREE.Mesh(boxGeo, goldMat);
  mesh.position.set((Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 4);
  mesh.castShadow = true;
  country1Wealth.add(mesh);
}
gdpGroup.add(country1Wealth);

const country1People = new THREE.Group();
for (let i = 0; i < 15; i++) {
  const mesh = new THREE.Mesh(personGeo, personMat);
  mesh.position.set((Math.random() - 0.5) * 8, 0.5, (Math.random() - 0.5) * 8 + 4);
  mesh.castShadow = true;
  country1People.add(mesh);
}
gdpGroup.add(country1People);

const gdpLabel = createTextSprite("Country A (High GDP)", 50, "#f87171", 6);
gdpGroup.add(gdpLabel);

// Scene 2: GDP per Capita
// A small country with less money, but very few people.
const country2Wealth = new THREE.Group();
for (let i = 0; i < 10; i++) {
  const mesh = new THREE.Mesh(boxGeo, goldMat);
  mesh.position.set((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3);
  mesh.castShadow = true;
  country2Wealth.add(mesh);
}
capitaGroup.add(country2Wealth);

const country2People = new THREE.Group();
for (let i = 0; i < 2; i++) {
  const mesh = new THREE.Mesh(personGeo, personMat);
  mesh.position.set((Math.random() - 0.5) * 4, 0.5, (Math.random() - 0.5) * 4 + 4);
  mesh.castShadow = true;
  country2People.add(mesh);
}
capitaGroup.add(country2People);

const capitaLabel = createTextSprite("Country B (High GDP/Capita)", 50, "#60a5fa", 6);
capitaGroup.add(capitaLabel);

app.start();

// Animation Sequence for the Video
let time = 0;
app.onUpdate((dt) => {
  time += dt;
  country1Wealth.rotation.y += dt * 0.2;
  country2Wealth.rotation.y += dt * 0.2;
});

// Update subtext
function updateSubtext(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold 50px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 10;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  (subText.material as THREE.SpriteMaterial).map = texture;
  subText.material.needsUpdate = true;
}

// Logic to run when generating video
(window as any).runGDPVideoSequence = async () => {
  // We can play an audio file!
  const audio = new Audio('./voiceover.mp3');
  audio.play();
  
  updateSubtext("GDP is the total wealth (boxes).");
  
  app.animate(app.camera.position, { x: [-10, -10], y: [15, 8], z: [25, 15] }, { duration: 3 });
  await new Promise(r => setTimeout(r, 4000));
  
  updateSubtext("Country A has a lot of wealth, but many people (spheres).");
  await new Promise(r => setTimeout(r, 4000));
  
  updateSubtext("GDP per Capita is wealth divided by population.");
  app.animate(app.camera.position, { x: [10, 10], y: [15, 8], z: [25, 15] }, { duration: 3 });
  await new Promise(r => setTimeout(r, 4500));
  
  updateSubtext("Country B has less wealth, but each person gets much more!");
  await new Promise(r => setTimeout(r, 4500));
  
  updateSubtext("So, Country B's citizens are richer on average!");
  app.animate(app.camera.position, { x: [0], y: [15], z: [25] }, { duration: 3 });
  await new Promise(r => setTimeout(r, 5000));
};

document.getElementById('btn-start')?.addEventListener('click', async () => {
  document.getElementById('ui-overlay')!.style.display = 'none';
  const KairoAPI = (window as any).KairoAPI;
  
  // Start recording
  KairoAPI.startVideoRecording(60);
  
  await (window as any).runGDPVideoSequence();
  
  const blob = await KairoAPI.stopVideoRecording('gdp-explainer.webm');
  console.log("Video downloaded:", blob.size);
});
