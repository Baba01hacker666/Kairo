import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
import { GameState } from '../state.ts';

export interface ShadowBeast {
  id: number;
  type: 'creeper' | 'specter' | 'behemoth';
  mesh: THREE.Group;
  position: THREE.Vector3;
  hp: number;
  maxHp: number;
  isAlive: boolean;
  level: number;
  speed: number;
  knockback: THREE.Vector3;
  baseY: number;
  stunTimer: number;
}

export class ShadowBeastManager {
  public beasts: ShadowBeast[] = [];
  private sparkleParticles: ParticleSystem;
  private dustParticles: ParticleSystem;
  private audio: ForestAudio;
  private scene: THREE.Scene;

  private static _scratchDiff = new THREE.Vector3();

  constructor(
    scene: THREE.Scene,
    sparkleParticles: ParticleSystem,
    dustParticles: ParticleSystem,
    audio: ForestAudio
  ) {
    this.scene = scene;
    this.sparkleParticles = sparkleParticles;
    this.dustParticles = dustParticles;
    this.audio = audio;

    this.spawnBeasts();
  }

  private spawnBeasts() {
    // Level 1: 4 Shadow Creepers
    const l1Spawns: [number, number, number][] = [
      [-10, 0.4, 12],
      [14, 0.4, -12],
      [-22, 0.4, -6],
      [18, 0.4, 18]
    ];

    // Level 2: 3 Shadow Specters + 1 Shadow Behemoth (Boss)
    const l2Spawns: [number, number, number, 'specter' | 'behemoth'][] = [
      [-14, 1.2, -14, 'specter'],
      [16, 1.2, 12, 'specter'],
      [-18, 1.2, 16, 'specter'],
      [0, 1.5, 12, 'behemoth']
    ];

    const shadowMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x475569,
      roughness: 0.9,
      metalness: 0.1
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 2.5
    });

    let id = 1;

    // Build L1 Creepers
    l1Spawns.forEach(([x, y, z]) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);

      const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55), shadowMat);
      body.castShadow = true;
      g.add(body);

      // Glowing Red Eyes
      const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), eyeMat);
      eye1.position.set(-0.2, 0.15, 0.45);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), eyeMat);
      eye2.position.set(0.2, 0.15, 0.45);
      g.add(eye1);
      g.add(eye2);

      this.scene.add(g);
      this.beasts.push({
        id: id++,
        type: 'creeper',
        mesh: g,
        position: new THREE.Vector3(x, y, z),
        hp: 2,
        maxHp: 2,
        isAlive: true,
        level: 1,
        speed: 3.8,
        knockback: new THREE.Vector3(),
        baseY: y,
        stunTimer: 0
      });
    });

    // Build L2 Specters & Behemoth Boss
    l2Spawns.forEach(([x, y, z, type]) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.visible = false; // Hidden until Level 2

      const isBoss = type === 'behemoth';
      const scale = isBoss ? 1.9 : 0.8;

      const bodyGeo = isBoss ? new THREE.IcosahedronGeometry(1.2) : new THREE.OctahedronGeometry(0.7);
      const bossMat = new THREE.MeshStandardMaterial({
        color: isBoss ? 0x1e1b4b : 0x312e81,
        emissive: isBoss ? 0x7c3aed : 0xa855f7,
        emissiveIntensity: 1.8,
        roughness: 0.3
      });

      const body = new THREE.Mesh(bodyGeo, bossMat);
      body.scale.set(scale, scale, scale);
      body.castShadow = true;
      g.add(body);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(isBoss ? 0.25 : 0.14, 8, 8), eyeMat);
      eye.position.set(0, isBoss ? 0.3 : 0.2, isBoss ? 1.1 : 0.6);
      g.add(eye);

      this.scene.add(g);
      this.beasts.push({
        id: id++,
        type,
        mesh: g,
        position: new THREE.Vector3(x, y, z),
        hp: isBoss ? 8 : 3,
        maxHp: isBoss ? 8 : 3,
        isAlive: true,
        level: 2,
        speed: isBoss ? 3.0 : 4.5,
        knockback: new THREE.Vector3(),
        baseY: y,
        stunTimer: 0
      });
    });
  }

  public onLevelSwitch(level: number) {
    this.beasts.forEach(b => {
      if (b.isAlive) {
        b.mesh.visible = b.level === level;
      }
    });
  }

  /** Player Pounce attack hits beasts in front of fox */
  public handlePlayerPounceAttack(
    playerPos: THREE.Vector3,
    playerRotY: number,
    onDefeat: (beast: ShadowBeast) => void
  ) {
    const currentLevel = GameState.instance.currentLevel;
    this.beasts.forEach(beast => {
      if (!beast.isAlive || beast.level !== currentLevel) return;

      const d = playerPos.distanceTo(beast.position);
      if (d < 2.4) {
        beast.hp -= 1;
        beast.stunTimer = 0.6;

        // Knockback away from player
        const kx = Math.sin(playerRotY) * 8.0;
        const kz = Math.cos(playerRotY) * 8.0;
        beast.knockback.set(kx, 3.0, kz);

        this.dustParticles.emitBurst(beast.position, 'dust_footstep', 25);
        this.sparkleParticles.emitBurst(beast.position, 'sparkle', 15);
        this.audio.playSound('push');

        if (beast.hp <= 0) {
          this.killBeast(beast, onDefeat);
        }
      }
    });
  }

  /** Player Spirit Bark releases a purifying shockwave hitting all nearby beasts */
  public handlePlayerSpiritBark(
    playerPos: THREE.Vector3,
    onDefeat: (beast: ShadowBeast) => void
  ) {
    const currentLevel = GameState.instance.currentLevel;
    this.beasts.forEach(beast => {
      if (!beast.isAlive || beast.level !== currentLevel) return;

      const d = playerPos.distanceTo(beast.position);
      if (d < 12.0) {
        const damage = GameState.instance.isGoldenForm ? 4 : 2;
        beast.hp -= damage;
        beast.stunTimer = 1.2;

        ShadowBeastManager._scratchDiff.subVectors(beast.position, playerPos).normalize().multiplyScalar(10.0);
        beast.knockback.copy(ShadowBeastManager._scratchDiff);
        beast.knockback.y = 4.0;

        this.sparkleParticles.emitBurst(beast.position, 'sparkle', 35);

        if (beast.hp <= 0) {
          this.killBeast(beast, onDefeat);
        }
      }
    });
  }

  private killBeast(beast: ShadowBeast, onDefeat: (beast: ShadowBeast) => void) {
    beast.isAlive = false;
    beast.mesh.visible = false;
    this.sparkleParticles.emitBurst(beast.position, 'sparkle', 60);
    this.audio.playSound('fanfare');
    onDefeat(beast);
  }

  public update(
    dt: number,
    timeSeconds: number,
    playerPos: THREE.Vector3,
    isPlayerInvulnerable: boolean,
    onDamagePlayer: (damage: number) => void
  ) {
    const currentLevel = GameState.instance.currentLevel;

    this.beasts.forEach(beast => {
      if (!beast.isAlive || beast.level !== currentLevel) return;

      // Apply Knockback
      if (beast.knockback.lengthSq() > 0.01) {
        beast.position.x += beast.knockback.x * dt;
        beast.position.y += beast.knockback.y * dt;
        beast.position.z += beast.knockback.z * dt;
        beast.knockback.multiplyScalar(Math.exp(-8 * dt));
        beast.position.y = Math.max(beast.baseY, beast.position.y - 15 * dt);
      }

      if (beast.stunTimer > 0) {
        beast.stunTimer -= dt;
        beast.mesh.rotation.y += dt * 8.0;
      } else {
        // AI Chase Logic
        const d = playerPos.distanceTo(beast.position);
        if (d < 14.0 && d > 1.2) {
          ShadowBeastManager._scratchDiff.subVectors(playerPos, beast.position).normalize();
          beast.position.x += ShadowBeastManager._scratchDiff.x * beast.speed * dt;
          beast.position.z += ShadowBeastManager._scratchDiff.z * beast.speed * dt;
          beast.mesh.lookAt(playerPos.x, beast.position.y, playerPos.z);
        }

        // Floating animation for specters / boss
        if (beast.type !== 'creeper') {
          beast.position.y = beast.baseY + Math.sin(timeSeconds * 3 + beast.id) * 0.3;
        }

        // Damage Player on contact
        if (d < 1.4 && !isPlayerInvulnerable) {
          onDamagePlayer(1);
          this.dustParticles.emitBurst(playerPos, 'dust_footstep', 20);
        }
      }

      beast.mesh.position.copy(beast.position);
    });
  }
}
