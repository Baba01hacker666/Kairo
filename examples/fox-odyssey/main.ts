import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
import { ParticleSystem } from '@kairo/renderer';

import { GameState } from './src/state.ts';
import { MobileInput } from './src/input/MobileInput.ts';
import { ForestAudio } from './src/audio/ForestAudio.ts';
import { FoxPlayer } from './src/player/FoxPlayer.ts';
import { GroveWorld } from './src/world/GroveWorld.ts';
import { WispManager } from './src/entities/Wisps.ts';
import { AcornManager } from './src/entities/Acorns.ts';
import { ChimeManager } from './src/entities/Chimes.ts';
import { MushroomManager } from './src/entities/Mushrooms.ts';
import { DuckManager } from './src/entities/Ducks.ts';
import { GameHUD } from './src/ui/GameHUD.ts';

// --- 1. Mobile-Optimized KairoApp Setup ---
const isMobile = typeof navigator !== 'undefined' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768);

const app = new KairoApp({
  canvas: '#game-canvas',
  background: 0x0a140f,
  shadows: !isMobile, // Disable heavy dynamic shadows on low-end mobile for locked 60 FPS
  fogColor: 0x142820,
  fogNear: 25,
  fogFar: 95
});

// Cap pixel ratio on mobile for thermal safety & locked 60 FPS
if (app.renderer) {
  app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2.0));
}

app.setLighting({
  sunPosition: [30, 45, 20],
  sunColor: 0xfff3d6,
  sunIntensity: 1.8,
  ambientColor: 0x6ee7b7,
  ambientIntensity: 0.9
});

// --- 2. Shared Particle Systems ---
const leafParticles = new ParticleSystem(300, 0x34d399);
const sparkleParticles = new ParticleSystem(350, 0xfde047);
const dustParticles = new ParticleSystem(250, 0xd1fae5);
const splashParticles = new ParticleSystem(250, 0x38bdf8);

app.scene.add(leafParticles.mesh);
app.scene.add(sparkleParticles.mesh);
app.scene.add(dustParticles.mesh);
app.scene.add(splashParticles.mesh);

// --- 3. Subsystem Modules Initialization ---
const audio = new ForestAudio(app.audio);
const input = new MobileInput();
const world = new GroveWorld(app.scene);
const player = new FoxPlayer(app.scene, dustParticles, sparkleParticles, audio);

const wisps = new WispManager(app.scene, sparkleParticles, audio);
const acorns = new AcornManager(app.scene, sparkleParticles, audio);
const chimes = new ChimeManager(app.scene, sparkleParticles, audio);
const mushrooms = new MushroomManager(app.scene, sparkleParticles, audio);
const ducks = new DuckManager(app.scene, sparkleParticles);

const hud = new GameHUD(
  () => app.captureScreenshot(`FoxOdyssey_${Date.now()}.png`),
  () => audio.playSound('click')
);

// --- 4. Input & Event Wireup ---
input.onJump = () => {
  player.jump();
};

input.onPounce = () => {
  player.pounce();
};

input.onSpiritCall = () => {
  player.spiritBark();
  hud.showToast('Spirit Call Resonated!', '🔔');

  // Check Chimes Resonance
  chimes.checkBarkResonance(player.position, chime => {
    hud.showToast(`Ancient Chime #${chime.id} Awakened!`, '✨');
    if (chimes.areAllLit()) {
      hud.showToast('🌟 Ancient Sanctuary Chimes In Harmony!', '🌟');
      audio.playSound('fanfare');
      const treeLight = new THREE.PointLight(0xfde047, 5, 30);
      treeLight.position.set(0, 5, 0);
      world.shrineGroup.add(treeLight);
    }
  });

  // Call Ducks
  ducks.checkBarkCall(player.position, () => {
    hud.showToast('A duckling joined your pack!', '🦆');
  });
};

input.onTogglePhotoMode = () => {
  hud.togglePhotoMode();
};

GameState.instance.on('game_won', () => {
  player.setGoldenAura();
  audio.playSound('fanfare');
});

// Show initial welcome story dialogue
setTimeout(() => {
  hud.showDialogue(
    'Grove Elder Owl',
    '🦉',
    'Welcome to the Ancient Grove, little Fox! Use the on-screen joystick or WASD to explore, leap across stepping stones, and ring the chime monoliths [🔔] to awaken the spirits!'
  );
}, 600);

// --- 5. Main Game Loop ---
app.onUpdate((dt: number) => {
  const now = performance.now();
  const timeSeconds = (now - GameState.instance.gameStartTime) * 0.001;

  // 1. Audio and Shader Updates
  audio.update(timeSeconds);
  world.update(dt, timeSeconds);

  // 2. Mobile Multi-Touch & Key Input
  const moveInput = input.update();
  if (input.isPouncing) {
    player.isPouncing = true;
  }

  // 3. Player Physics & Locomotion
  player.update(dt, moveInput.x, moveInput.y, (x, z) => world.getTerrainHeight(x, z));
  hud.updateStamina(GameState.instance.stamina, GameState.instance.maxStamina);

  // 4. Bouncy Mushrooms Collision
  mushrooms.checkPlayerBounce(player.position, now, force => {
    player.velocity.y = force;
    player.isGrounded = false;
    hud.showToast('🍄 Super Mushroom Bounce!', '🚀');
  });

  // 5. Sun Acorns Attraction & Collection
  acorns.update(dt, timeSeconds, player.position, count => {
    hud.showToast(`Gathered Sun Acorn (${count}/${GameState.instance.totalAcorns})`, '🌰');
    if (count >= GameState.instance.totalAcorns) {
      hud.showToast('🌟 All Sun Acorns Gathered!', '🌟');
      audio.playSound('fanfare');
    }
  });

  // 6. Lost Spirit Wisps Update & Follow
  wisps.update(dt, timeSeconds, player.position, wisp => {
    hud.showToast(`Awakened ${wisp.name}! (${GameState.instance.wispsCollectedCount}/5)`, '✨');
  });

  // 7. Duck Companions Follow Pack
  ducks.update(dt, player.position, player.rotationY);

  // 8. Camera Follow Tracking (with mobile touch drag support in photo mode)
  if (!GameState.instance.isPhotoMode) {
    const camDist = isMobile ? 11.0 : 9.5;
    const camHeight = isMobile ? 5.5 : 4.8;
    const camTargetX = player.position.x - Math.sin(player.rotationY) * camDist * 0.4;
    const camTargetZ = player.position.z - Math.cos(player.rotationY) * camDist * 0.4 + camDist;
    const camTargetY = player.position.y + camHeight;

    app.camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), dt * 6.5);
    app.camera.lookAt(new THREE.Vector3(player.position.x, player.position.y + 1.2, player.position.z));
  }

  // 9. Particle Lifecycles
  leafParticles.mesh.count = leafParticles.maxParticles;
  sparkleParticles.mesh.count = sparkleParticles.maxParticles;
  dustParticles.mesh.count = dustParticles.maxParticles;
  splashParticles.mesh.count = splashParticles.maxParticles;
});

// Launch Engine
app.start();
console.log('🦊 Fox Odyssey (Modular Mobile-Ready Architecture) initialized.');
