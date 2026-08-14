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
  background: 0x09120c,
  shadows: !isMobile, // Disable heavy dynamic shadows on mobile for locked 60 FPS
  fogColor: 0x12241a,
  fogNear: 25,
  fogFar: 95
});

// Disable default engine camera controller to prevent conflicting dual updates / flickering
app.cameraController.enabled = false;

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

// Initial Camera Placement
app.camera.position.set(player.position.x, player.position.y + 5.5, player.position.z + 9.0);
app.camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);
const _camDesiredPos = new THREE.Vector3();

const wisps = new WispManager(app.scene, sparkleParticles, audio);
const acorns = new AcornManager(app.scene, sparkleParticles, audio);
const chimes = new ChimeManager(app.scene, sparkleParticles, audio);
const mushrooms = new MushroomManager(app.scene, sparkleParticles, audio);
const ducks = new DuckManager(app.scene, sparkleParticles);

// --- 4. HUD & Start Screen Wireup ---
let lastSaveTime = 0;

const hud = new GameHUD(
  (isContinue: boolean) => {
    // Start Game Callback
    audio.resumeAudio();

    if (isContinue) {
      const save = GameState.instance.loadGame();
      if (save) {
        if (save.playerPos) {
          player.position.set(save.playerPos[0], save.playerPos[1], save.playerPos[2]);
          app.camera.position.set(player.position.x, player.position.y + 5.5, player.position.z + 9.0);
          app.camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);
        }
        hud.syncSavedUI();
        if (save.isGoldenForm) {
          player.setGoldenAura();
        }
        hud.showToast('💾 Adventure Progress Restored!', '✨');
      }
      setTimeout(() => {
        hud.showDialogue(
          'Grove Elder Owl',
          '🦉',
          'Welcome back, little Fox! Let us continue awakening the spirits and restoring the ancient grove!'
        );
      }, 500);
    } else {
      GameState.instance.clearSaveData();
      hud.syncSavedUI();
      hud.showToast('🌲 A new journey begins...', '🦊');
      setTimeout(() => {
        hud.showDialogue(
          'Grove Elder Owl',
          '🦉',
          'Welcome to the Ancient Grove, little Fox! Use your touch joystick to explore, leap across stepping stones, and ring the chime monoliths 🔔 to awaken the spirits!'
        );
      }, 500);
    }
  },
  () => app.captureScreenshot(`FoxOdyssey_${Date.now()}.png`),
  () => audio.playSound('click')
);

// --- 5. Action Input Handlers ---
input.onJump = () => {
  if (!GameState.instance.isGameStarted) return;
  player.jump();
};

input.onPounce = () => {
  if (!GameState.instance.isGameStarted) return;
  player.pounce();
};

input.onSpiritCall = () => {
  if (!GameState.instance.isGameStarted) return;
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
  if (!GameState.instance.isGameStarted) return;
  hud.togglePhotoMode();
};

GameState.instance.on('game_won', () => {
  player.setGoldenAura();
  audio.playSound('fanfare');
});

// --- 6. Main Game Loop ---
app.onUpdate((dt: number) => {
  const now = performance.now();
  const timeSeconds = (now - GameState.instance.gameStartTime) * 0.001;

  // 1. Audio and Shader Updates
  audio.update(timeSeconds);
  world.update(dt, timeSeconds);

  // 2. Mobile Multi-Touch & Key Input
  if (GameState.instance.isGameStarted) {
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

    // Periodic position auto-save every 4 seconds
    if (now - lastSaveTime > 4000) {
      lastSaveTime = now;
      GameState.instance.saveGame([player.position.x, player.position.y, player.position.z]);
    }
  }

  // 8. Ultra-Smooth Stable Third-Person Follow Camera
  if (!GameState.instance.isPhotoMode) {
    const camHeight = isMobile ? 5.8 : 5.0;
    const camDist = isMobile ? 9.5 : 8.2;

    _camDesiredPos.set(player.position.x, player.position.y + camHeight, player.position.z + camDist);
    app.camera.position.lerp(_camDesiredPos, Math.min(1.0, dt * 7.5));
    app.camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);
  }

  // 9. Particle Lifecycles
  leafParticles.mesh.count = leafParticles.maxParticles;
  sparkleParticles.mesh.count = sparkleParticles.maxParticles;
  dustParticles.mesh.count = dustParticles.maxParticles;
  splashParticles.mesh.count = splashParticles.maxParticles;
});

// Launch Engine
app.start();
console.log('🦊 Fox Odyssey (Smooth Camera + Mobile Touch Architecture) active.');
