import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
import { ParticleSystem } from '@kairo/renderer';

import { GameState } from './src/state.ts';
import { MobileInput } from './src/input/MobileInput.ts';
import { ForestAudio } from './src/audio/ForestAudio.ts';
import { FoxPlayer } from './src/player/FoxPlayer.ts';
import { GroveWorld } from './src/world/GroveWorld.ts';
import { CrystalPeaksWorld } from './src/world/CrystalPeaksWorld.ts';
import { WispManager } from './src/entities/Wisps.ts';
import { AcornManager } from './src/entities/Acorns.ts';
import { ChimeManager } from './src/entities/Chimes.ts';
import { MushroomManager } from './src/entities/Mushrooms.ts';
import { DuckManager } from './src/entities/Ducks.ts';
import { EndgameShrineManager } from './src/entities/EndgameShrine.ts';
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

const sunLight = app.setLighting({
  sunPosition: [30, 45, 20],
  sunColor: 0xfff3d6,
  sunIntensity: 1.8,
  ambientColor: 0x6ee7b7,
  ambientIntensity: 0.9
}).sun;
// Add the sun's target to the scene so its shadow camera can follow the player
app.scene.add(sunLight.target);

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
const worldL1 = new GroveWorld(app.scene);
const worldL2 = new CrystalPeaksWorld(app.scene);
const player = new FoxPlayer(app.scene, dustParticles, sparkleParticles, audio);

// Portal Archway in Level 1 leading to Level 2
const portalArchL1 = new THREE.Mesh(
  new THREE.TorusGeometry(2.6, 0.35, 16, 32),
  new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 2.5,
    roughness: 0.2
  })
);
portalArchL1.position.set(0, 2.6, -34);
worldL1.group.add(portalArchL1);

const portalGateL1 = new THREE.Mesh(
  new THREE.CircleGeometry(2.3, 32),
  new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
);
portalGateL1.position.set(0, 2.6, -34);
worldL1.group.add(portalGateL1);

// Portal Archway in Level 2 leading back to Level 1
const portalArchL2 = new THREE.Mesh(
  new THREE.TorusGeometry(2.6, 0.35, 16, 32),
  new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x059669,
    emissiveIntensity: 2.5,
    roughness: 0.2
  })
);
portalArchL2.position.set(0, 2.6, 34);
worldL2.group.add(portalArchL2);

const portalGateL2 = new THREE.Mesh(
  new THREE.CircleGeometry(2.3, 32),
  new THREE.MeshBasicMaterial({ color: 0x059669, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
);
portalGateL2.position.set(0, 2.6, 34);
worldL2.group.add(portalGateL2);

// 3D Camera Orbit & Look Around State
let camYaw = 0;
let camPitch = 0.35; // ~20 degrees
let camDistance = isMobile ? 9.5 : 8.2;
const _camDesiredPos = new THREE.Vector3();
const _portalPosL1 = new THREE.Vector3(0, 2.6, -34);
const _portalPosL2 = new THREE.Vector3(0, 2.6, 34);

// Initial Camera Placement
app.camera.position.set(player.position.x, player.position.y + 5.5, player.position.z + camDistance);
app.camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);

const wisps = new WispManager(app.scene, sparkleParticles, audio);
const acorns = new AcornManager(app.scene, sparkleParticles, audio);
const chimes = new ChimeManager(app.scene, sparkleParticles, audio);
const mushrooms = new MushroomManager(app.scene, sparkleParticles, audio);
const ducks = new DuckManager(app.scene, sparkleParticles);
const endgameShrine = new EndgameShrineManager(app.scene, sparkleParticles, audio);

// --- 4. Level Switcher Routine ---
function switchLevel(targetLevel: number, spawnAtPortal: boolean = true) {
  GameState.instance.currentLevel = targetLevel;

  if (targetLevel === 2) {
    worldL1.group.visible = false;
    worldL2.group.visible = true;
    app.scene.background = new THREE.Color(0x070919);
    if (app.scene.fog) {
      (app.scene.fog as THREE.Fog).color.setHex(0x0e1329);
    }
    sunLight.color.setHex(0x818cf8);
    sunLight.intensity = 1.6;

    if (spawnAtPortal) {
      player.position.set(0, 0.6, 28);
    }
    sparkleParticles.emitBurst(player.position, 'sparkle', 60);
    audio.playSound('teleport');
    hud.showToast('❄️ Entered Realm: Moonlit Crystal Peaks (Level 2)', '💎');
    setTimeout(() => {
      hud.showDialogue(
        'Moon Spirit Wolf',
        '🐺',
        'Welcome to the Crystal Peaks, Fox! Beware the icy winds, leap onto bouncy crystal geysers 💨, and explore the alpine spires!'
      );
    }, 400);
  } else {
    worldL1.group.visible = true;
    worldL2.group.visible = false;
    app.scene.background = new THREE.Color(0x09120c);
    if (app.scene.fog) {
      (app.scene.fog as THREE.Fog).color.setHex(0x12241a);
    }
    sunLight.color.setHex(0xfff3d6);
    sunLight.intensity = 1.8;

    if (spawnAtPortal) {
      player.position.set(0, 0.6, -28);
    }
    sparkleParticles.emitBurst(player.position, 'sparkle', 60);
    audio.playSound('teleport');
    hud.showToast('🌲 Entered Realm: The Ancient Grove (Level 1)', '🦊');
  }

  GameState.instance.saveGame([player.position.x, player.position.y, player.position.z]);
}

// --- 5. HUD & Start Screen Wireup ---
let lastSaveTime = 0;

const hud = new GameHUD(
  (isContinue: boolean) => {
    // Start Game Callback
    audio.resumeAudio();
    GameState.instance.gameStartTime = performance.now();

    if (isContinue) {
      const save = GameState.instance.loadGame();
      if (save) {
        if (save.currentLevel && save.currentLevel === 2) {
          switchLevel(2, false);
        } else {
          switchLevel(1, false);
        }

        if (save.playerPos) {
          player.position.set(save.playerPos[0], save.playerPos[1], save.playerPos[2]);
          app.camera.position.set(player.position.x, player.position.y + 5.5, player.position.z + camDistance);
          app.camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);
        }
        // Restore collected/lit/following state onto the 3D world objects
        acorns.syncWithSave();
        wisps.syncWithSave();
        chimes.syncWithSave();
        ducks.syncWithSave();
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
          'Welcome back, little Fox! Swipe the screen to look around, dash with sprint, and explore the ancient grove!'
        );
      }, 500);
    } else {
      GameState.instance.clearSaveData();
      switchLevel(1, false);
      // Reset world objects to fresh (uncollected) state
      acorns.syncWithSave();
      wisps.syncWithSave();
      chimes.syncWithSave();
      ducks.syncWithSave();
      hud.syncSavedUI();
      hud.showToast('🌲 A new journey begins...', '🦊');
      setTimeout(() => {
        hud.showDialogue(
          'Grove Elder Owl',
          '🦉',
          'Welcome to the Ancient Grove, little Fox! Swipe anywhere on the right to look around, leap across stepping stones, and step through the ancient northern portal to visit the Moonlit Crystal Peaks!'
        );
      }, 500);
    }
  },
  () => app.captureScreenshot(`FoxOdyssey_${Date.now()}.png`),
  () => audio.playSound('click')
);

// Sync world object states from any existing save loaded during HUD construction
acorns.syncWithSave();
wisps.syncWithSave();
chimes.syncWithSave();
ducks.syncWithSave();

// --- 6. Action Input Handlers ---
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
      worldL1.shrineGroup.add(treeLight);
    }
  });

  // Call Ducks
  ducks.checkBarkCall(player.position, () => {
    hud.showToast('A duckling joined your pack!', '🦆');
  });

  // Celestial Sky Harmonization at Ancient Life Tree in Golden Form
  if (GameState.instance.isGoldenForm && player.position.distanceTo(new THREE.Vector3(0, 0, 0)) < 8.0) {
    if (endgameShrine.skyState === 'noon') {
      endgameShrine.skyState = 'sunset';
      app.scene.background = new THREE.Color(0x311b28);
      sunLight.color.setHex(0xfb923c);
      sunLight.intensity = 2.2;
      hud.showToast('🌅 Golden Sunset Sky Harmonized', '✨');
    } else if (endgameShrine.skyState === 'sunset') {
      endgameShrine.skyState = 'aurora';
      app.scene.background = new THREE.Color(0x061118);
      sunLight.color.setHex(0x38bdf8);
      sunLight.intensity = 1.0;
      hud.showToast('🌌 Starry Aurora Twilight Harmonized', '✨');
    } else {
      endgameShrine.skyState = 'noon';
      app.scene.background = new THREE.Color(0x09120c);
      sunLight.color.setHex(0xfff3d6);
      sunLight.intensity = 1.8;
      hud.showToast('☀️ Radiant Grove Noon Harmonized', '✨');
    }
  }
};

input.onTogglePhotoMode = () => {
  if (!GameState.instance.isGameStarted) return;
  hud.togglePhotoMode();
};

GameState.instance.on('game_won', () => {
  player.setGoldenAura();
  audio.playSound('fanfare');
  hud.showToast('🌟 Golden Fox Awakened! Triple Jump & Infinite Sprint Unlocked!', '🌟');
});

// --- 7. Main Game Loop ---
app.onUpdate((dt: number) => {
  const now = performance.now();
  const timeSeconds = (now - GameState.instance.gameStartTime) * 0.001;

  // Active Realm World Object
  const activeWorld = GameState.instance.currentLevel === 2 ? worldL2 : worldL1;

  // 1. Audio and Shader Updates
  audio.update(timeSeconds);
  if (worldL1.group.visible) worldL1.update(dt, timeSeconds);
  if (worldL2.group.visible) worldL2.update(dt, timeSeconds);

  // Rotate portal gateway rings
  portalArchL1.rotation.z += dt * 0.8;
  portalArchL2.rotation.z += dt * 0.8;

  // 2. Mobile Multi-Touch & Key Input
  if (GameState.instance.isGameStarted) {
    const moveInput = input.update();
    player.isPouncing = input.isPouncing;

    // 3. Player Physics & Locomotion (Camera Yaw Aligned)
    player.update(dt, moveInput.x, moveInput.y, (x, z) => activeWorld.getTerrainHeight(x, z), camYaw);
    hud.updateStamina(GameState.instance.stamina, GameState.instance.maxStamina);

    // 4. Realm Portal Transitions
    if (GameState.instance.currentLevel === 1) {
      if (player.position.distanceTo(_portalPosL1) < 3.2) {
        switchLevel(2);
      }
    } else {
      if (player.position.distanceTo(_portalPosL2) < 3.2) {
        switchLevel(1);
      }

      // Level 2: Thermal Crystal Geysers
      worldL2.checkGeyserBounce(player.position, now, force => {
        player.velocity.y = force;
        player.isGrounded = false;
        sparkleParticles.emitBurst(player.position, 'sparkle', 35);
        audio.playSound('teleport');
        hud.showToast('💨 Crystal Geyser Launch!', '🚀');
      });
    }

    // 5. Bouncy Mushrooms Collision (Level 1)
    if (worldL1.group.visible) {
      mushrooms.checkPlayerBounce(player.position, now, force => {
        player.velocity.y = force;
        player.isGrounded = false;
        hud.showToast('🍄 Super Mushroom Bounce!', '🚀');
      });
    }

    // 6. Sun Acorns Attraction & Collection
    acorns.update(dt, timeSeconds, player.position, count => {
      hud.showToast(`Gathered Sun Acorn (${count}/${GameState.instance.totalAcorns})`, '🌰');
      if (count >= GameState.instance.totalAcorns) {
        hud.showToast('🌟 All Sun Acorns Gathered!', '🌟');
        audio.playSound('fanfare');
      }
    });

    // 7. Lost Spirit Wisps Update & Follow
    wisps.update(dt, timeSeconds, player.position, wisp => {
      hud.showToast(`Awakened ${wisp.name}! (${GameState.instance.wispsCollectedCount}/5)`, '✨');
    });

    // 8. Duck Companions Follow Pack
    ducks.update(dt, player.position, player.rotationY);

    // 9. Endgame Spirit Sprint Time Trial
    endgameShrine.update(
      dt,
      timeSeconds,
      player.position,
      (curr, total) => {
        hud.showToast(`Celestial Ring (${curr}/${total}) Passed!`, '🌟');
      },
      (elapsed, isNewBest) => {
        hud.showToast(
          isNewBest
            ? `🏆 NEW RECORD! Grove Sprint: ${elapsed.toFixed(1)}s!`
            : `✨ Spirit Sprint Complete: ${elapsed.toFixed(1)}s!`,
          '🌟'
        );
      }
    );

    // Periodic position auto-save every 4 seconds
    if (now - lastSaveTime > 4000) {
      lastSaveTime = now;
      GameState.instance.saveGame([player.position.x, player.position.y, player.position.z]);
    }
  }

  // 10. Touch & Mouse 3D Camera Look & Orbit Follow Camera
  if (!GameState.instance.isPhotoMode) {
    const look = input.consumeLookDelta();
    if (look.x !== 0 || look.y !== 0) {
      camYaw -= look.x * 0.0055;
      camPitch = Math.max(0.08, Math.min(1.25, camPitch + look.y * 0.0045));
    }
    if (look.zoom !== 0) {
      camDistance = Math.max(4.5, Math.min(18.0, camDistance + look.zoom));
    }

    const horizontalDist = camDistance * Math.cos(camPitch);
    const verticalDist = camDistance * Math.sin(camPitch);

    const desiredCamX = player.position.x + Math.sin(camYaw) * horizontalDist;
    const desiredCamY = player.position.y + verticalDist + 1.2;
    const desiredCamZ = player.position.z + Math.cos(camYaw) * horizontalDist;

    _camDesiredPos.set(desiredCamX, desiredCamY, desiredCamZ);
    app.camera.position.lerp(_camDesiredPos, Math.min(1.0, dt * 8.0));
    app.camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);

    // Track player with sun shadow camera
    sunLight.position.set(player.position.x + 30, 45, player.position.z + 20);
    sunLight.target.position.set(player.position.x, 0, player.position.z);
    sunLight.target.updateMatrixWorld();
  }

  // 11. Particle Lifecycles (advance sim, update instanced matrices, compact dead particles)
  leafParticles.update(dt);
  sparkleParticles.update(dt);
  dustParticles.update(dt);
  splashParticles.update(dt);
});

// Launch Engine
app.start();
console.log('🦊 Fox Odyssey (Level 1: Ancient Grove + Level 2: Moonlit Crystal Peaks) active.');
