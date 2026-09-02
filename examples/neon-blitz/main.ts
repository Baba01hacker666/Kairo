import { KairoApp } from '@kairo/core';
import { buildWorld, getRandomArenaPosition, PLAYER_SPAWN, ARENA_HALF, type GameWorld } from './world';
import { SparkleField } from './particles';
import { createControls, type GameControls } from './controls';

// ---------------------------------------------------------------------------
// App & environment
// ---------------------------------------------------------------------------
const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x05070f,
  gravity: [0, -32, 0],
  shadows: !isMobile,
  gameId: 'neon_blitz'
});

app.setLighting({
  ambient: 0.55,
  sunPosition: [6, 22, 4],
  sunIntensity: 1.3,
  sunColor: 0xb7e9ff,
  ambientColor: 0x6d28d9
});

const arenaRadius = ARENA_HALF;
const world: GameWorld = buildWorld(app, !isMobile);
const sparks = new SparkleField(world.scene, isMobile ? 300 : 600);
const controls: GameControls = createControls(app, { sprint: 'btn-sprint', jump: 'btn-jump' });

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
const GROUND_LEVEL = 0.5;

let started = false;
let over = false;
let health = 100;
let score = 0;
let elapsed = 0;
let best = Number(localStorage.getItem('kairo-neon-blitz-best')) || 0;
let hitCooldown = 0;
let frame = 0;

const hudScore = document.getElementById('score')!;
const hudHealth = document.getElementById('health')!;
const hudBest = document.getElementById('best')!;
const hudTime = document.getElementById('time')!;
const msgTitle = document.getElementById('message-title')!;
const msgSub = document.getElementById('message-sub')!;
const messageBox = document.getElementById('message')!;
const startScreen = document.getElementById('start-screen')!;

function fmtTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function showMessage(title: string, subtitle: string): void {
  msgTitle.textContent = title;
  msgSub.textContent = subtitle;
  messageBox.style.opacity = '1';
}

function hideMessage(): void {
  messageBox.style.opacity = '0';
}

function flashDanger(): void {
  const rect = document.createElement('div');
  rect.style.cssText =
    'position:fixed;inset:0;background:rgba(255,26,58,0.15);pointer-events:none;z-index:40;transition:opacity 0.4s;';
  document.body.appendChild(rect);
  requestAnimationFrame(() => (rect.style.opacity = '0'));
  setTimeout(() => rect.remove(), 500);
}

function gameOver(): void {
  over = true;
  if (score > best) {
    best = score;
    localStorage.setItem('kairo-neon-blitz-best', String(best));
    hudBest.textContent = String(best);
    showMessage('NEW RECORD!', `You set a high score of ${score} orbs.`);
  } else {
    showMessage('WRECKED!', `You collected ${score} orbs and survived ${fmtTime(elapsed)}.`);
  }
  app.ui.showToast('Game Over', 2000, 'warning');
}

function restart(): void {
  over = false;
  health = 100;
  score = 0;
  elapsed = 0;
  hitCooldown = 0;
  const body = world.player.rb!.cannonBody;
  if (body) {
    body.position.set(PLAYER_SPAWN.x, PLAYER_SPAWN.y, PLAYER_SPAWN.z);
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
  }
  for (const collectible of world.collectibles) {
    collectible.active = true;
    collectible.mesh.visible = true;
  }
  hideMessage();
  app.ui.showToast('GO!', 900, 'info');
}

function begin(): void {
  if (started) return;
  started = true;
  startScreen.style.display = 'none';
  app.audio.playSynthesizedSound('coin');
  restart();
}

startScreen.addEventListener('click', begin);
startScreen.addEventListener('touchstart', begin, { passive: true });
window.addEventListener('keydown', (keyEvent) => {
  if (!started && (keyEvent.code === 'Enter' || keyEvent.code === 'Space')) {
    keyEvent.preventDefault();
    begin();
  }
  if (started && over && keyEvent.code === 'KeyR') restart();
});

// ---------------------------------------------------------------------------
// Update loop
// ---------------------------------------------------------------------------
app.onUpdate((dt) => {
  frame++;
  const delta = Math.min(dt, 1 / 30);
  const time = performance.now() * 0.001;
  controls.tick(delta);
  const body = world.player.rb!.cannonBody;

  // Attract-mode camera before the game starts
  if (!started) {
    app.camera.position.x += (Math.sin(time * 0.3) * 12 - app.camera.position.x) * 0.05;
    app.camera.position.y += (10 - app.camera.position.y) * 0.02;
    app.camera.position.z += (12 - app.camera.position.z) * 0.02;
    app.camera.lookAt(0, 1, 0);
    return;
  }

  if (!over) elapsed += delta;

  // ---- Movement ----
  if (!over && body) {
    const move = controls.readMove();
    const speed = controls.isSprintPressed() ? 16 : 9.5;
    const magnitude = Math.hypot(move.xAxis, move.zAxis);
    const scale = magnitude > 1 ? speed / magnitude : speed;
    body.velocity.x = move.xAxis * scale;
    body.velocity.z = move.zAxis * scale;
    body.velocity.y = Math.max(-40, body.velocity.y);

    // Jump only while touching the ground (position-based contact check).
    const grounded = body.position.y <= GROUND_LEVEL + 0.4;
    if (controls.isJumpPressed() && grounded) {
      body.velocity.y = 9;
      controls.consumeJump();
      app.audio.playSynthesizedSound('jump');
    }

    // Arena bounds
    body.position.x = Math.max(-arenaRadius + 1, Math.min(arenaRadius - 1, body.position.x));
    body.position.z = Math.max(-arenaRadius + 1, Math.min(arenaRadius - 1, body.position.z));
  }

  // Sync orb visuals to physics body
  if (body) {
    world.orbGroup.position.set(body.position.x, body.position.y, body.position.z);
    world.orbGroup.rotation.x += delta * 2;
    world.orbGroup.rotation.z += delta * 1.5;
    world.glowMesh.scale.setScalar(1 + Math.sin(time * 4) * 0.08);
  }

  // ---- Collectibles ----
  if (!over) {
    const now = performance.now();
    for (const collectible of world.collectibles) {
      collectible.mesh.rotation.y += delta * 3;
      if (collectible.active) {
        if (collectible.mesh.position.distanceTo(world.orbGroup.position) < 1.4) {
          collectible.active = false;
          collectible.mesh.visible = false;
          collectible.respawnAt = now + 6000;
          score += 10;
          sparks.emitSpark(collectible.mesh.position, 0x34d399);
          app.audio.playSynthesizedSound('coin');
        }
      } else if (now >= collectible.respawnAt) {
        collectible.active = true;
        collectible.mesh.visible = true;
        collectible.mesh.position.copy(getRandomArenaPosition(4, 0.7));
      }
    }
  }

  // ---- Hazards ----
  if (!over) {
    for (const hazard of world.hazards) {
      const hazardTime = time * hazard.speed + hazard.phase;
      const hazardX = hazard.centerX + Math.cos(hazardTime) * hazard.radius;
      const hazardZ = hazard.centerZ + Math.sin(hazardTime * 1.3) * hazard.radius;
      hazard.mesh.position.x = hazardX;
      hazard.mesh.position.z = hazardZ;
      hazard.mesh.rotation.y += delta * 3;

      const deltaX = world.orbGroup.position.x - hazardX;
      const deltaZ = world.orbGroup.position.z - hazardZ;
      const distanceSquared = deltaX * deltaX + deltaZ * deltaZ;
      if (hitCooldown <= 0 && distanceSquared < 1.1 * 1.1) {
        hitCooldown = 1.2;
        health -= 25;
        sparks.emitSpark(world.orbGroup.position, 0xff1a3a);
        app.audio.playSynthesizedSound('explosion');
        app.cameraFX.shake(0.5, 0.4);
        flashDanger();
        if (body) {
          const distance = Math.sqrt(distanceSquared) || 1;
          body.velocity.x += (deltaX / distance) * 10;
          body.velocity.z += (deltaZ / distance) * 10;
          body.velocity.y = 6;
        }
        if (health <= 0) {
          health = 0;
          gameOver();
        }
      }
    }
    if (hitCooldown > 0) hitCooldown -= delta;
  }

  // Ornamental crystal animation
  for (let i = 0; i < world.crystals.length; i++) {
    world.crystals[i].rotation.y += delta * 0.4;
    world.crystals[i].position.y += Math.sin(time + i) * 0.002;
  }

  // ---- Camera follow ----
  app.camera.position.x += (world.orbGroup.position.x - app.camera.position.x) * 0.08;
  app.camera.position.y += (9 - app.camera.position.y) * 0.05;
  app.camera.position.z += (world.orbGroup.position.z + 11 - app.camera.position.z) * 0.08;
  app.camera.lookAt(world.orbGroup.position);

  // ---- HUD ----
  hudScore.textContent = String(score);
  hudHealth.textContent = String(Math.max(0, health));
  hudBest.textContent = String(best);
  hudTime.textContent = fmtTime(elapsed);

  if (frame % 60 === 0 && body) {
    sparks.emitSpark(world.orbGroup.position);
  }
});

app.start();
