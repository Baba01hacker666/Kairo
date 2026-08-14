import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
import { ParticleSystem } from '@kairo/renderer';

import { GameState } from './src/state.ts';
import { MobileInput } from './src/input/MobileInput.ts';
import { ForestAudio } from './src/audio/ForestAudio.ts';
import { FoxPlayer } from './src/player/FoxPlayer.ts';
import { GroveWorld } from './src/world/GroveWorld.ts';
import { CrystalPeaksWorld } from './src/world/CrystalPeaksWorld.ts';
import { AzureGrottoWorld } from './src/world/AzureGrottoWorld.ts';
import { ElderOwl } from './src/entities/ElderOwl.ts';
import { ShadowBeastManager } from './src/entities/ShadowBeasts.ts';
import { BrambleGolem } from './src/entities/BrambleGolem.ts';
import { AbyssalLeviathan } from './src/entities/AbyssalLeviathan.ts';
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

// --- 3. Subsystem Modules & Realms Initialization ---
const audio = new ForestAudio(app.audio);
const input = new MobileInput();
const worldL1 = new GroveWorld(app.scene);
const worldL2 = new CrystalPeaksWorld(app.scene);
const worldL3 = new AzureGrottoWorld(app.scene);
const player = new FoxPlayer(app.scene, dustParticles, sparkleParticles, audio);
const elderOwl = new ElderOwl(app.scene, sparkleParticles, audio);
const shadowBeasts = new ShadowBeastManager(app.scene, sparkleParticles, dustParticles, audio);
const brambleGolem = new BrambleGolem(app.scene, sparkleParticles, dustParticles, audio);
const abyssalLeviathan = new AbyssalLeviathan(app.scene, sparkleParticles, splashParticles, audio);

// Portal Archways
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

// Grotto Portals (L3)
const portalArchL3North = new THREE.Mesh(
  new THREE.TorusGeometry(2.6, 0.35, 16, 32),
  new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 2.5,
    roughness: 0.2
  })
);
portalArchL3North.position.set(0, 2.6, -32);
worldL3.group.add(portalArchL3North);

const portalArchL3South = new THREE.Mesh(
  new THREE.TorusGeometry(2.6, 0.35, 16, 32),
  new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 2.5,
    roughness: 0.2
  })
);
portalArchL3South.position.set(0, 2.6, 32);
worldL3.group.add(portalArchL3South);

// 3D Smooth Inertial Camera Orbit & Look Around State
let targetYaw = 0;
let currentYaw = 0;
let targetPitch = 0.38; // ~22 degrees
let currentPitch = 0.38;
let targetDistance = isMobile ? 9.2 : 8.0;
let currentDistance = isMobile ? 9.2 : 8.0;

const _camDesiredPos = new THREE.Vector3();
const _camTargetLookAt = new THREE.Vector3(player.position.x, player.position.y + 1.2, player.position.z);
const _currentCamLookAt = new THREE.Vector3(player.position.x, player.position.y + 1.2, player.position.z);

const _portalPosL1 = new THREE.Vector3(0, 2.6, -34);
const _portalPosL2 = new THREE.Vector3(0, 2.6, 34);
const _portalPosL3North = new THREE.Vector3(0, 2.6, -32);
const _portalPosL3South = new THREE.Vector3(0, 2.6, 32);
const _groveCenter = new THREE.Vector3(0, 0, 0);

// Initial Camera Placement
app.camera.position.set(player.position.x, player.position.y + 5.5, player.position.z + currentDistance);
app.camera.lookAt(_currentCamLookAt);

const wisps = new WispManager(app.scene, sparkleParticles, audio);
const acorns = new AcornManager(app.scene, sparkleParticles, audio, (x, z) => worldL1.getTerrainHeight(x, z));
const chimes = new ChimeManager(app.scene, sparkleParticles, audio);
const mushrooms = new MushroomManager(app.scene, sparkleParticles, audio);
const ducks = new DuckManager(app.scene, sparkleParticles);
const endgameShrine = new EndgameShrineManager(app.scene, sparkleParticles, audio);

// --- 4. Level Switcher Routine ---
function switchLevel(targetLevel: number, spawnAtPortal: boolean = true) {
  GameState.instance.currentLevel = targetLevel;
  shadowBeasts.onLevelSwitch(targetLevel);
  hud.updateRealm(targetLevel);

  if (targetLevel === 3) {
    // Act II: Whispering Azure Grotto
    worldL1.group.visible = false;
    worldL2.group.visible = false;
    worldL3.group.visible = true;
    app.scene.background = new THREE.Color(0x040d1a);
    if (app.scene.fog) {
      (app.scene.fog as THREE.Fog).color.setHex(0x081b2e);
    }
    sunLight.color.setHex(0x38bdf8);
    sunLight.intensity = 1.4;

    if (spawnAtPortal) {
      player.position.set(0, 0.6, 26);
    }
    sparkleParticles.emitBurst(player.position, 'sparkle', 60);
    audio.playSound('teleport');
    hud.showToast('💧 Entered Realm: Whispering Azure Grotto (Act II)', '💧');
    setTimeout(() => {
      hud.showDialogue(
        'Water Sprite Aqualis',
        '💧',
        'Welcome to the Azure Grotto, Fox! Beware the Leviathan in the lagoon, skim across lily pads, and awaken the subterranean light!'
      );
    }, 400);
  } else if (targetLevel === 2) {
    // Act III: Moonlit Crystal Peaks
    worldL1.group.visible = false;
    worldL2.group.visible = true;
    worldL3.group.visible = false;
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
    hud.showToast('❄️ Entered Realm: Moonlit Crystal Peaks (Act III)', '💎');
    setTimeout(() => {
      hud.showDialogue(
        'Moon Spirit Wolf',
        '🐺',
        'Welcome to the Crystal Peaks, Fox! Beware the icy winds, leap onto bouncy crystal geysers 💨, and explore the alpine spires!'
      );
    }, 400);
  } else {
    // Act I: The Ancient Grove
    worldL1.group.visible = true;
    worldL2.group.visible = false;
    worldL3.group.visible = false;
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
    hud.showToast('🌲 Entered Realm: The Ancient Grove (Act I)', '🦊');
  }

  _camTargetLookAt.set(player.position.x, player.position.y + 1.2, player.position.z);
  _currentCamLookAt.copy(_camTargetLookAt);
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
        switchLevel(save.currentLevel || 1, false);

        if (save.playerPos) {
          player.position.set(save.playerPos[0], save.playerPos[1], save.playerPos[2]);
          _camTargetLookAt.set(player.position.x, player.position.y + 1.2, player.position.z);
          _currentCamLookAt.copy(_camTargetLookAt);
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
          'Grand Elder Owl',
          '🦉',
          'Welcome back, little Fox! Approach me anytime for wisdom, strike shadow creepers with Pounce (⚡), and let us restore the grove!'
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
          'Grand Elder Owl',
          '🦉',
          'Hoo-hoo! Welcome to the Ancient Grove, little Fox! An Ashen Shadow has invaded. Approach me on my stone roost, leap into combat with Pounce (⚡), and defeat the Bramble Golem!'
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

// --- 6. Action Input Handlers (Combat & Interaction) ---
input.onJump = () => {
  if (!GameState.instance.isGameStarted) return;
  player.jump();
};

input.onPounce = () => {
  if (!GameState.instance.isGameStarted) return;
  const pounced = player.pounce();
  if (pounced) {
    // Combat Strike Hitbox against minions
    shadowBeasts.handlePlayerPounceAttack(player.position, player.rotationY, beast => {
      hud.showToast(`💥 Cleansed ${beast.type.toUpperCase()}!`, '💥');
      GameState.instance.healPlayer(1);
      GameState.instance.recordBeastDefeat();
    });

    // Act I Boss: Bramblewood Golem Strike
    if (brambleGolem.isAlive && GameState.instance.currentLevel === 1) {
      const d = player.position.distanceTo(brambleGolem.position);
      if (d < 3.8 && brambleGolem.isVulnerable) {
        brambleGolem.takeDamage(1, () => {
          hud.showToast('🏆 Cleansed Bramblewood Golem! Gateway Opened!', '🌟');
          GameState.instance.setChapter(2);
        });
      }
    }

    // Act II Boss: Abyssal Leviathan Strike
    if (abyssalLeviathan.isAlive && GameState.instance.currentLevel === 3) {
      const d = player.position.distanceTo(abyssalLeviathan.group.position);
      if (d < 4.2 && abyssalLeviathan.isSurfaced) {
        abyssalLeviathan.takeDamage(1, () => {
          hud.showToast('🏆 Cleansed Abyssal Leviathan Phantom!', '🌟');
          GameState.instance.setChapter(3);
        });
      }
    }
  }
};

input.onSpiritCall = () => {
  if (!GameState.instance.isGameStarted) return;
  player.spiritBark();
  hud.showToast('Spirit Call Resonated!', '🔔');

  // Purifying shockwave hits shadow beasts
  shadowBeasts.handlePlayerSpiritBark(player.position, beast => {
    hud.showToast(`✨ Purified ${beast.type.toUpperCase()} with Spirit Shockwave!`, '✨');
    GameState.instance.healPlayer(1);
    GameState.instance.recordBeastDefeat();
  });

  // Shockwave damage against Bosses
  if (brambleGolem.isAlive && GameState.instance.currentLevel === 1) {
    const d = player.position.distanceTo(brambleGolem.position);
    if (d < 12.0) {
      brambleGolem.takeDamage(1, () => {
        hud.showToast('🏆 Cleansed Bramblewood Golem! Gateway Opened!', '🌟');
        GameState.instance.setChapter(2);
      });
    }
  }

  if (abyssalLeviathan.isAlive && GameState.instance.currentLevel === 3) {
    const d = player.position.distanceTo(abyssalLeviathan.group.position);
    if (d < 12.0 && abyssalLeviathan.isSurfaced) {
      abyssalLeviathan.takeDamage(1, () => {
        hud.showToast('🏆 Cleansed Abyssal Leviathan Phantom!', '🌟');
        GameState.instance.setChapter(3);
      });
    }
  }

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
  if (GameState.instance.isGoldenForm && player.position.distanceTo(_groveCenter) < 8.0) {
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

// --- 7. Screen Orientation & Dynamic Viewport Resize ---
const updateViewport = () => {
  if (app.renderer && app.camera) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    app.renderer.setSize(width, height);
    const persCam = app.camera as THREE.PerspectiveCamera;
    if (persCam.isPerspectiveCamera) {
      persCam.aspect = width / height;
      persCam.updateProjectionMatrix();
    }
  }
};
window.addEventListener('resize', updateViewport);
window.addEventListener('orientationchange', () => {
  setTimeout(updateViewport, 150);
});

// --- 8. Main Game Loop ---
app.onUpdate((dt: number) => {
  const now = performance.now();
  const timeSeconds = (now - GameState.instance.gameStartTime) * 0.001;

  // Active Realm World Object
  const currentLvl = GameState.instance.currentLevel;
  const activeWorld = currentLvl === 2 ? worldL2 : (currentLvl === 3 ? worldL3 : worldL1);

  // 1. Audio and Shader Updates
  audio.update(timeSeconds);
  if (worldL1.group.visible) worldL1.update(dt, timeSeconds);
  if (worldL2.group.visible) worldL2.update(dt, timeSeconds);
  if (worldL3.group.visible) worldL3.update(dt, timeSeconds);

  // Rotate portal gateway rings
  portalArchL1.rotation.z += dt * 0.8;
  portalArchL2.rotation.z += dt * 0.8;
  portalArchL3North.rotation.z += dt * 0.8;
  portalArchL3South.rotation.z += dt * 0.8;

  // 2. Mobile Multi-Touch & Key Input
  if (GameState.instance.isGameStarted) {
    const moveInput = input.update();
    player.isPouncing = input.isPouncing;

    // 3. Player Physics & Locomotion (Camera Yaw Aligned)
    player.update(dt, moveInput.x, moveInput.y, (x, z) => activeWorld.getTerrainHeight(x, z), currentYaw);
    hud.updateStamina(GameState.instance.stamina, GameState.instance.maxStamina);

    // 4. Elder Owl Companion & Story Interaction (Level 1)
    if (worldL1.group.visible) {
      elderOwl.update(dt, timeSeconds, player.position);
      elderOwl.checkProximity(player.position, GameState.instance.currentChapter, diag => {
        hud.showDialogue(diag.speaker, diag.avatar, diag.text);
      });
    }

    // 5. Boss Encounters Update
    if (currentLvl === 1) {
      brambleGolem.update(
        dt,
        timeSeconds,
        player.position,
        player.isGrounded,
        () => {
          player.takeDamage();
          hud.showToast('💔 Struck by Golem Shockwave! Jump (Space) to dodge!', '💔');
        }
      );
    } else if (currentLvl === 3) {
      abyssalLeviathan.update(
        dt,
        timeSeconds,
        player.position,
        () => {
          player.takeDamage();
          hud.showToast('💔 Struck by Leviathan Geyser!', '💔');
        }
      );
    }

    // 6. Shadow Beasts Combat AI Loop
    shadowBeasts.update(
      dt,
      timeSeconds,
      player.position,
      player.invulnerabilityTimer > 0,
      damage => {
        player.takeDamage();
        hud.showToast('💔 Struck by Shadow Beast!', '💔');
      }
    );

    // 7. Realm Portal Transitions
    if (currentLvl === 1) {
      if (player.position.distanceTo(_portalPosL1) < 3.2) {
        // Grove -> Grotto
        switchLevel(3);
      }
    } else if (currentLvl === 3) {
      if (player.position.distanceTo(_portalPosL3South) < 3.2) {
        // Grotto -> Grove
        switchLevel(1);
      } else if (player.position.distanceTo(_portalPosL3North) < 3.2) {
        // Grotto -> Crystal Peaks
        switchLevel(2);
      }
    } else if (currentLvl === 2) {
      if (player.position.distanceTo(_portalPosL2) < 3.2) {
        // Crystal Peaks -> Grotto
        switchLevel(3);
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

    // 8. Bouncy Mushrooms Collision (Level 1)
    if (worldL1.group.visible) {
      mushrooms.checkPlayerBounce(player.position, now, force => {
        player.velocity.y = force;
        player.isGrounded = false;
        hud.showToast('🍄 Super Mushroom Bounce!', '🚀');
      });
    }

    // 9. Sun Acorns Attraction & Collection
    acorns.update(dt, timeSeconds, player.position, count => {
      hud.showToast(`Gathered Sun Acorn (${count}/${GameState.instance.totalAcorns})`, '🌰');
      if (count >= GameState.instance.totalAcorns) {
        hud.showToast('🌟 All Sun Acorns Gathered!', '🌟');
        audio.playSound('fanfare');
      }
    });

    // 10. Lost Spirit Wisps Update & Follow
    wisps.update(dt, timeSeconds, player.position, wisp => {
      hud.showToast(`Awakened ${wisp.name}! (${GameState.instance.wispsCollectedCount}/5)`, '✨');
    });

    // 11. Duck Companions Follow Pack
    ducks.update(dt, player.position, player.rotationY);

    // 12. Endgame Spirit Sprint Time Trial
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

  // 13. Silky-Smooth Inertial Orbit & Follow Camera
  if (!GameState.instance.isPhotoMode) {
    const look = input.consumeLookDelta();
    if (look.x !== 0 || look.y !== 0) {
      // Natural, ultra-smooth orbital drag
      targetYaw -= look.x * (isMobile ? 0.0038 : 0.0030);
      targetPitch = Math.max(0.10, Math.min(1.20, targetPitch + look.y * (isMobile ? 0.0032 : 0.0026)));
    }
    if (look.zoom !== 0) {
      targetDistance = Math.max(4.5, Math.min(18.0, targetDistance + look.zoom));
    }

    // Exponential smoothing for silky 60/120 FPS camera motion
    const smoothFactor = Math.min(1.0, dt * 10.0);
    currentYaw += (targetYaw - currentYaw) * smoothFactor;
    currentPitch += (targetPitch - currentPitch) * smoothFactor;
    currentDistance += (targetDistance - currentDistance) * Math.min(1.0, dt * 8.0);

    // Smoothly track look target (fox center)
    _camTargetLookAt.set(player.position.x, player.position.y + 1.2, player.position.z);
    _currentCamLookAt.lerp(_camTargetLookAt, Math.min(1.0, dt * 10.0));

    const horizontalDist = currentDistance * Math.cos(currentPitch);
    const verticalDist = currentDistance * Math.sin(currentPitch);

    const desiredCamX = _currentCamLookAt.x + Math.sin(currentYaw) * horizontalDist;
    const desiredCamY = _currentCamLookAt.y + verticalDist;
    const desiredCamZ = _currentCamLookAt.z + Math.cos(currentYaw) * horizontalDist;

    _camDesiredPos.set(desiredCamX, desiredCamY, desiredCamZ);
    app.camera.position.lerp(_camDesiredPos, Math.min(1.0, dt * 12.0));
    app.camera.lookAt(_currentCamLookAt);

    // Track player with sun shadow camera
    sunLight.position.set(player.position.x + 30, 45, player.position.z + 20);
    sunLight.target.position.set(player.position.x, 0, player.position.z);
    sunLight.target.updateMatrixWorld();
  }

  // 14. Particle Lifecycles (advance sim, update instanced matrices, compact dead particles)
  leafParticles.update(dt);
  sparkleParticles.update(dt);
  dustParticles.update(dt);
  splashParticles.update(dt);
});

// Launch Engine
app.start();
console.log('🦊 Fox Odyssey (4-Act Campaign Architecture) active.');
