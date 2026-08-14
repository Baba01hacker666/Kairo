import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
import { GameState } from '../state.ts';

export class AbyssalLeviathan {
  public group: THREE.Group;
  public position: THREE.Vector3;
  public hp: number = 7;
  public maxHp: number = 7;
  public isAlive: boolean = true;
  public isSurfaced: boolean = false;

  private bodySegments: THREE.Mesh[] = [];
  private crestMesh: THREE.Mesh;
  private crestMat: THREE.MeshStandardMaterial;

  private sparkleParticles: ParticleSystem;
  private splashParticles: ParticleSystem;
  private audio: ForestAudio;

  private swimTimer: number = 0;
  private diveTimer: number = 0;
  private surfaceTimer: number = 0;

  constructor(
    scene: THREE.Scene,
    sparkleParticles: ParticleSystem,
    splashParticles: ParticleSystem,
    audio: ForestAudio
  ) {
    this.sparkleParticles = sparkleParticles;
    this.splashParticles = splashParticles;
    this.audio = audio;
    this.position = new THREE.Vector3(0, 0.4, 0);

    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.visible = false;
    scene.add(this.group);

    // 1. Serpentine Leviathan Segments
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      roughness: 0.3,
      metalness: 0.6
    });

    for (let i = 0; i < 5; i++) {
      const radius = 1.0 - i * 0.15;
      const seg = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), bodyMat);
      seg.scale.set(1.0, 0.8, 1.3);
      seg.position.set(0, 0, -i * 1.4);
      seg.castShadow = true;
      this.group.add(seg);
      this.bodySegments.push(seg);
    }

    // 2. Glowing Sapphire Dorsal Crest (Vulnerable Point)
    this.crestMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.5,
      roughness: 0.1
    });
    this.crestMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 6), this.crestMat);
    this.crestMesh.position.set(0, 1.2, 0);
    this.group.add(this.crestMesh);

    // Glowing Eyes
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x67e8f9,
      emissiveIntensity: 3.0
    });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMat);
    eye1.position.set(-0.35, 0.4, 0.6);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMat);
    eye2.position.set(0.35, 0.4, 0.6);
    this.group.add(eye1);
    this.group.add(eye2);
  }

  public takeDamage(damage: number, onDefeated: () => void) {
    if (!this.isAlive || !this.isSurfaced) return;

    this.hp -= damage;
    this.splashParticles.emitBurst(this.group.position, 'portal_swirl', 35);
    this.sparkleParticles.emitBurst(this.group.position, 'sparkle', 25);
    this.audio.playSound('push');

    // Hurt Flash
    this.crestMat.emissive.setHex(0xfef08a);
    setTimeout(() => {
      if (this.isAlive) {
        this.crestMat.emissive.setHex(0x0284c7);
      }
    }, 200);

    if (this.hp <= 0) {
      this.isAlive = false;
      this.group.visible = false;
      this.splashParticles.emitBurst(this.group.position, 'collect_burst', 60);
      this.sparkleParticles.emitBurst(this.group.position, 'sparkle', 80);
      this.audio.playSound('fanfare');
      onDefeated();
    }
  }

  public update(
    dt: number,
    timeSeconds: number,
    playerPos: THREE.Vector3,
    onGeyserHit: () => void
  ) {
    if (!this.isAlive || GameState.instance.currentLevel !== 3) {
      this.group.visible = this.isAlive && GameState.instance.currentLevel === 3;
      return;
    }

    this.swimTimer += dt;
    this.diveTimer += dt;

    // Serpentine swimming orbit around lake
    const angle = this.swimTimer * 0.8;
    const radius = 9.0;
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;

    this.group.position.x = targetX;
    this.group.position.z = targetZ;

    // Body undulation
    this.bodySegments.forEach((seg, i) => {
      seg.position.y = Math.sin(timeSeconds * 4 - i * 0.8) * 0.25;
      seg.rotation.y = Math.sin(timeSeconds * 3 - i * 0.6) * 0.2;
    });

    // Submerge & Surface cycle
    if (this.diveTimer > 5.0) {
      this.diveTimer = 0;
      this.isSurfaced = !this.isSurfaced;

      if (this.isSurfaced) {
        this.group.position.y = 0.5;
        this.splashParticles.emitBurst(this.group.position, 'portal_swirl', 40);
        this.audio.playSound('teleport');
      } else {
        this.group.position.y = -1.2;
      }
    }

    // Geyser attack when surfaced near player
    if (this.isSurfaced) {
      const d = playerPos.distanceTo(this.group.position);
      if (d < 3.2) {
        onGeyserHit();
      }
    }
  }
}
