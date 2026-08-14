import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
import { GameState } from '../state.ts';

export class BrambleGolem {
  public group: THREE.Group;
  public position: THREE.Vector3;
  public hp: number = 6;
  public maxHp: number = 6;
  public isAlive: boolean = true;
  public isVulnerable: boolean = false;

  private coreMesh: THREE.Mesh;
  private coreMat: THREE.MeshStandardMaterial;
  private fistLeft: THREE.Mesh;
  private fistRight: THREE.Mesh;
  private shockwaveRing: THREE.Mesh;
  private shockwaveMat: THREE.MeshBasicMaterial;

  private sparkleParticles: ParticleSystem;
  private dustParticles: ParticleSystem;
  private audio: ForestAudio;

  private attackTimer: number = 0;
  private slamAnimTimer: number = 0;
  private shockwaveActive: boolean = false;
  private shockwaveRadius: number = 0;
  private vulnerableTimer: number = 0;

  private static readonly _scratchDist = new THREE.Vector3();
  private static readonly _dustPos = new THREE.Vector3();

  constructor(
    scene: THREE.Scene,
    sparkleParticles: ParticleSystem,
    dustParticles: ParticleSystem,
    audio: ForestAudio
  ) {
    this.sparkleParticles = sparkleParticles;
    this.dustParticles = dustParticles;
    this.audio = audio;
    this.position = new THREE.Vector3(0, 0, -24);

    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    scene.add(this.group);

    // 1. Golem Torso & Stone Body
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 2.5
    });

    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), stoneMat);
    torso.position.y = 2.4;
    torso.castShadow = true;
    this.group.add(torso);

    // Shoulders & Branches
    const shoulderL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.2, 8), woodMat);
    shoulderL.position.set(-1.8, 2.6, 0);
    shoulderL.rotation.z = Math.PI / 3;
    this.group.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.2, 8), woodMat);
    shoulderR.position.set(1.8, 2.6, 0);
    shoulderR.rotation.z = -Math.PI / 3;
    this.group.add(shoulderR);

    // 2. Giant Boulder Fists
    this.fistLeft = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9), stoneMat);
    this.fistLeft.position.set(-2.2, 1.2, 0.8);
    this.fistLeft.castShadow = true;
    this.group.add(this.fistLeft);

    this.fistRight = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9), stoneMat);
    this.fistRight.position.set(2.2, 1.2, 0.8);
    this.fistRight.castShadow = true;
    this.group.add(this.fistRight);

    // 3. Glowing Corrupted Heart Core
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x6d28d9,
      emissiveIntensity: 2.0,
      roughness: 0.2
    });
    this.coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), this.coreMat);
    this.coreMesh.position.set(0, 2.4, 1.2);
    this.group.add(this.coreMesh);

    // Eyes
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), eyeMat);
    eye1.position.set(-0.4, 3.2, 1.1);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), eyeMat);
    eye2.position.set(0.4, 3.2, 1.1);
    this.group.add(eye1);
    this.group.add(eye2);

    // 4. Ground Shockwave Ring
    const ringGeo = new THREE.RingGeometry(0.2, 0.8, 32);
    this.shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    this.shockwaveRing = new THREE.Mesh(ringGeo, this.shockwaveMat);
    this.shockwaveRing.rotation.x = -Math.PI / 2;
    this.shockwaveRing.position.set(0, 0.1, 0);
    this.group.add(this.shockwaveRing);
  }

  public takeDamage(damage: number, onDefeated: () => void) {
    if (!this.isAlive) return;

    this.hp -= damage;
    this.dustParticles.emitBurst(this.group.position, 'dust_footstep', 35);
    this.sparkleParticles.emitBurst(this.group.position, 'sparkle', 25);
    this.audio.playSound('push');

    // Visual Hurt Flash
    this.coreMat.emissive.setHex(0xfef08a);
    setTimeout(() => {
      if (this.isAlive) {
        this.coreMat.emissive.setHex(this.isVulnerable ? 0xf59e0b : 0x6d28d9);
      }
    }, 200);

    if (this.hp <= 0) {
      this.isAlive = false;
      this.group.visible = false;
      this.sparkleParticles.emitBurst(this.group.position, 'sparkle', 80);
      this.audio.playSound('fanfare');
      onDefeated();
    }
  }

  public update(
    dt: number,
    timeSeconds: number,
    playerPos: THREE.Vector3,
    isPlayerGrounded: boolean,
    onDamagePlayer: () => void
  ) {
    if (!this.isAlive || GameState.instance.currentLevel !== 1) {
      this.group.visible = this.isAlive && GameState.instance.currentLevel === 1;
      return;
    }

    this.attackTimer += dt;

    // Breathing & Core Pulse
    this.coreMesh.rotation.y += dt * 2.0;
    this.coreMesh.rotation.x += dt * 1.5;
    const pulse = 1.0 + Math.sin(timeSeconds * 4) * 0.15;
    this.coreMesh.scale.set(pulse, pulse, pulse);

    // Golem tracks player
    BrambleGolem._scratchDist.subVectors(playerPos, this.group.position);
    const targetAngle = Math.atan2(BrambleGolem._scratchDist.x, BrambleGolem._scratchDist.z);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetAngle, dt * 2.5);

    // Slam Attack Sequence every 4.5 seconds
    if (this.attackTimer > 4.5) {
      this.attackTimer = 0;
      this.slamAnimTimer = 1.2;
      this.shockwaveActive = true;
      this.shockwaveRadius = 0.5;
      this.isVulnerable = false;
      this.coreMat.emissive.setHex(0x6d28d9);
    }

    // Fist Slam Animation
    if (this.slamAnimTimer > 0) {
      this.slamAnimTimer -= dt;
      const progress = 1.0 - this.slamAnimTimer / 1.2;
      // Lift fists up then crash down
      const fistY = progress < 0.6 ? 1.2 + Math.sin(progress * Math.PI) * 2.2 : 0.4;
      this.fistLeft.position.y = fistY;
      this.fistRight.position.y = fistY;

      if (progress >= 0.6 && !this.isVulnerable) {
        BrambleGolem._dustPos.set(this.position.x, 0.4, this.position.z);
        this.dustParticles.emitBurst(BrambleGolem._dustPos, 'dust_footstep', 40);
        this.audio.playSound('push');
        this.isVulnerable = true;
        this.vulnerableTimer = 2.4; // Vulnerable window for player to attack!
        this.coreMat.emissive.setHex(0xf59e0b); // Golden amber vulnerable glow
      }
    } else {
      this.fistLeft.position.y = 1.2 + Math.sin(timeSeconds * 2.5) * 0.15;
      this.fistRight.position.y = 1.2 + Math.cos(timeSeconds * 2.5) * 0.15;
    }

    // Vulnerable Window Timer
    if (this.isVulnerable) {
      this.vulnerableTimer -= dt;
      if (this.vulnerableTimer <= 0) {
        this.isVulnerable = false;
        this.coreMat.emissive.setHex(0x6d28d9);
      }
    }

    // Shockwave Ring Expansion
    if (this.shockwaveActive) {
      this.shockwaveRadius += dt * 12.0;
      this.shockwaveRing.scale.set(this.shockwaveRadius, this.shockwaveRadius, this.shockwaveRadius);
      this.shockwaveMat.opacity = Math.max(0, 1.0 - this.shockwaveRadius / 14.0);

      // Check shockwave collision with grounded player (must jump to avoid!)
      const d = playerPos.distanceTo(this.position);
      if (Math.abs(d - this.shockwaveRadius) < 1.0 && isPlayerGrounded) {
        onDamagePlayer();
      }

      if (this.shockwaveRadius >= 14.0) {
        this.shockwaveActive = false;
        this.shockwaveMat.opacity = 0;
      }
    }
  }
}
