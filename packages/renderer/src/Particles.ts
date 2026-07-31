import * as THREE from 'three';
import { Vector3, Color } from '@kairo/core';

export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export type ParticleEffectPreset =
  | 'sparkle'
  | 'fire'
  | 'smoke'
  | 'portal_swirl'
  | 'collect_burst'
  | 'explosion'
  | 'dust_footstep'
  | 'teleport_flash';

export class ParticleSystem {
  public mesh: THREE.InstancedMesh;
  public maxParticles: number;
  private dummy: THREE.Object3D = new THREE.Object3D();

  private activeParticles: Particle[] = [];
  private pool: Particle[] = [];

  constructor(maxParticles: number = 1000, color: number = 0xffffff) {
    this.maxParticles = maxParticles;

    const geo = new THREE.SphereGeometry(0.1, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });

    this.mesh = new THREE.InstancedMesh(geo, mat, maxParticles);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.count = 0;

    // Pre-fill pool
    for (let i = 0; i < maxParticles; i++) {
      this.pool.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 1.0,
        alpha: 1.0,
        life: 0,
        maxLife: 1.0
      });
    }
  }

  public emitBurst(
    pos: THREE.Vector3 | [number, number, number],
    preset: ParticleEffectPreset,
    count: number = 30
  ): void {
    const origin = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;

    for (let i = 0; i < count; i++) {
      if (this.pool.length === 0) break;
      const p = this.pool.pop()!;

      p.position.copy(origin);
      p.life = 0;

      if (preset === 'collect_burst') {
        p.maxLife = 0.6 + Math.random() * 0.4;
        p.velocity.set(
          (Math.random() - 0.5) * 6,
          Math.random() * 5 + 2,
          (Math.random() - 0.5) * 6
        );
        p.color.setHex(0x10b981);
        p.size = 0.2 + Math.random() * 0.2;
      } else if (preset === 'explosion') {
        p.maxLife = 0.5 + Math.random() * 0.5;
        p.velocity.set(
          (Math.random() - 0.5) * 12,
          Math.random() * 8 + 3,
          (Math.random() - 0.5) * 12
        );
        p.color.setHex(Math.random() > 0.5 ? 0xef4444 : 0xf59e0b);
        p.size = 0.3 + Math.random() * 0.3;
      } else if (preset === 'teleport_flash') {
        p.maxLife = 0.8;
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 1.5;
        p.velocity.set(Math.cos(angle) * rad, Math.random() * 6 + 2, Math.sin(angle) * rad);
        p.color.setHex(0xa855f7);
        p.size = 0.25;
      } else if (preset === 'dust_footstep') {
        p.maxLife = 0.4;
        p.velocity.set((Math.random() - 0.5) * 1.5, Math.random() * 1.0, (Math.random() - 0.5) * 1.5);
        p.color.setHex(0xd4d4d8);
        p.size = 0.15;
      } else if (preset === 'portal_swirl') {
        p.maxLife = 1.2;
        const angle = Math.random() * Math.PI * 2;
        p.velocity.set(Math.cos(angle) * 2, Math.random() * 3 + 1, Math.sin(angle) * 2);
        p.color.setHex(0x3b82f6);
        p.size = 0.2;
      } else {
        // Default Sparkle
        p.maxLife = 0.7;
        p.velocity.set((Math.random() - 0.5) * 3, Math.random() * 4, (Math.random() - 0.5) * 3);
        p.color.setHex(0xfacc15);
        p.size = 0.2;
      }

      this.activeParticles.push(p);
    }
  }

  public update(dt: number): void {
    let count = 0;

    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.activeParticles.splice(i, 1);
        this.pool.push(p);
        continue;
      }

      // Physics update
      p.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.81 * dt * 0.3; // Gentle gravity

      const progress = p.life / p.maxLife;
      const currentScale = p.size * (1 - progress);

      this.dummy.position.copy(p.position);
      this.dummy.scale.set(currentScale, currentScale, currentScale);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(count, this.dummy.matrix);
      count++;
    }

    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
