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

  // SoA (Structure of Arrays) layout for cache locality & GC elimination
  private positionsX: Float32Array;
  private positionsY: Float32Array;
  private positionsZ: Float32Array;

  private velocitiesX: Float32Array;
  private velocitiesY: Float32Array;
  private velocitiesZ: Float32Array;

  private colors: Int32Array; // Stored as Hex
  private sizes: Float32Array;
  private lives: Float32Array;
  private maxLives: Float32Array;

  private activeCount: number = 0;

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

    // Per-instance color buffer so emitBurst colors actually show up
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3);
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

    // Pre-allocate flat arrays
    this.positionsX = new Float32Array(maxParticles);
    this.positionsY = new Float32Array(maxParticles);
    this.positionsZ = new Float32Array(maxParticles);

    this.velocitiesX = new Float32Array(maxParticles);
    this.velocitiesY = new Float32Array(maxParticles);
    this.velocitiesZ = new Float32Array(maxParticles);

    this.colors = new Int32Array(maxParticles);
    this.sizes = new Float32Array(maxParticles);
    this.lives = new Float32Array(maxParticles);
    this.maxLives = new Float32Array(maxParticles);
  }

  public emitBurst(
    pos: THREE.Vector3 | [number, number, number],
    preset: ParticleEffectPreset,
    count: number = 30
  ): void {
    const ox = Array.isArray(pos) ? pos[0] : pos.x;
    const oy = Array.isArray(pos) ? pos[1] : pos.y;
    const oz = Array.isArray(pos) ? pos[2] : pos.z;

    for (let i = 0; i < count; i++) {
      if (this.activeCount >= this.maxParticles) break;
      const idx = this.activeCount++;

      this.positionsX[idx] = ox;
      this.positionsY[idx] = oy;
      this.positionsZ[idx] = oz;
      this.lives[idx] = 0;

      let color = 0xfacc15;

      if (preset === 'collect_burst') {
        this.maxLives[idx] = 0.6 + Math.random() * 0.4;
        this.velocitiesX[idx] = (Math.random() - 0.5) * 6;
        this.velocitiesY[idx] = Math.random() * 5 + 2;
        this.velocitiesZ[idx] = (Math.random() - 0.5) * 6;
        color = 0x10b981;
        this.sizes[idx] = 0.2 + Math.random() * 0.2;
      } else if (preset === 'explosion') {
        this.maxLives[idx] = 0.5 + Math.random() * 0.5;
        this.velocitiesX[idx] = (Math.random() - 0.5) * 12;
        this.velocitiesY[idx] = Math.random() * 8 + 3;
        this.velocitiesZ[idx] = (Math.random() - 0.5) * 12;
        color = Math.random() > 0.5 ? 0xef4444 : 0xf59e0b;
        this.sizes[idx] = 0.3 + Math.random() * 0.3;
      } else if (preset === 'teleport_flash') {
        this.maxLives[idx] = 0.8;
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 1.5;
        this.velocitiesX[idx] = Math.cos(angle) * rad;
        this.velocitiesY[idx] = Math.random() * 6 + 2;
        this.velocitiesZ[idx] = Math.sin(angle) * rad;
        color = 0xa855f7;
        this.sizes[idx] = 0.25;
      } else if (preset === 'dust_footstep') {
        this.maxLives[idx] = 0.4;
        this.velocitiesX[idx] = (Math.random() - 0.5) * 1.5;
        this.velocitiesY[idx] = Math.random() * 1.0;
        this.velocitiesZ[idx] = (Math.random() - 0.5) * 1.5;
        color = 0xd4d4d8;
        this.sizes[idx] = 0.15;
      } else if (preset === 'portal_swirl') {
        this.maxLives[idx] = 1.2;
        const angle = Math.random() * Math.PI * 2;
        this.velocitiesX[idx] = Math.cos(angle) * 2;
        this.velocitiesY[idx] = Math.random() * 3 + 1;
        this.velocitiesZ[idx] = Math.sin(angle) * 2;
        color = 0x3b82f6;
        this.sizes[idx] = 0.2;
      } else {
        // Default Sparkle
        this.maxLives[idx] = 0.7;
        this.velocitiesX[idx] = (Math.random() - 0.5) * 3;
        this.velocitiesY[idx] = Math.random() * 4;
        this.velocitiesZ[idx] = (Math.random() - 0.5) * 3;
        color = 0xfacc15;
        this.sizes[idx] = 0.2;
      }

      this.colors[idx] = color;
      this.writeInstanceColor(idx, color);
    }
  }

  private writeInstanceColor(idx: number, hex: number): void {
    if (!this.mesh.instanceColor) return;
    const arr = this.mesh.instanceColor.array;
    arr[idx * 3 + 0] = ((hex >> 16) & 0xff) / 255;
    arr[idx * 3 + 1] = ((hex >> 8) & 0xff) / 255;
    arr[idx * 3 + 2] = (hex & 0xff) / 255;
  }

  public update(dt: number): void {
    let aliveCount = 0;

    for (let i = 0; i < this.activeCount; i++) {
      this.lives[i] += dt;

      if (this.lives[i] >= this.maxLives[i]) {
        continue; // Dead, skip and don't copy over
      }

      // Physics update
      this.positionsX[i] += this.velocitiesX[i] * dt;
      this.positionsY[i] += this.velocitiesY[i] * dt;
      this.positionsZ[i] += this.velocitiesZ[i] * dt;

      this.velocitiesY[i] -= 9.81 * dt * 0.3; // Gentle gravity

      const progress = this.lives[i] / this.maxLives[i];
      const currentScale = this.sizes[i] * (1 - progress);

      this.dummy.position.set(this.positionsX[i], this.positionsY[i], this.positionsZ[i]);
      this.dummy.scale.set(currentScale, currentScale, currentScale);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(aliveCount, this.dummy.matrix);

      // Pack active particles to the front
      if (aliveCount !== i) {
        this.positionsX[aliveCount] = this.positionsX[i];
        this.positionsY[aliveCount] = this.positionsY[i];
        this.positionsZ[aliveCount] = this.positionsZ[i];

        this.velocitiesX[aliveCount] = this.velocitiesX[i];
        this.velocitiesY[aliveCount] = this.velocitiesY[i];
        this.velocitiesZ[aliveCount] = this.velocitiesZ[i];

        this.colors[aliveCount] = this.colors[i];
        this.sizes[aliveCount] = this.sizes[i];
        this.lives[aliveCount] = this.lives[i];
        this.maxLives[aliveCount] = this.maxLives[i];

        const ic = this.mesh.instanceColor;
        if (ic) {
          ic.array[aliveCount * 3 + 0] = ic.array[i * 3 + 0];
          ic.array[aliveCount * 3 + 1] = ic.array[i * 3 + 1];
          ic.array[aliveCount * 3 + 2] = ic.array[i * 3 + 2];
        }
      }

      aliveCount++;
    }

    this.activeCount = aliveCount;
    this.mesh.count = aliveCount;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
