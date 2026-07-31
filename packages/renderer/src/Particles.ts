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

  // SoA arrays
  private positions: Float32Array;
  private velocities: Float32Array;
  private lifespans: Float32Array;
  private maxLifespans: Float32Array;
  private sizes: Float32Array;
  private activeCount: number = 0;

  constructor(maxParticles: number = 1000, color: number = 0xffffff) {
    this.maxParticles = maxParticles;
    this.positions = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);
    this.lifespans = new Float32Array(maxParticles);
    this.maxLifespans = new Float32Array(maxParticles);
    this.sizes = new Float32Array(maxParticles);

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


  }

  public emitBurst(
    pos: THREE.Vector3 | [number, number, number],
    preset: ParticleEffectPreset,
    count: number = 30
  ): void {
    const origin = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
    for (let i = 0; i < count; i++) {
      if (this.activeCount >= this.maxParticles) break;
      const idx = this.activeCount;
      this.positions[idx * 3] = origin.x;
      this.positions[idx * 3 + 1] = origin.y;
      this.positions[idx * 3 + 2] = origin.z;
      this.lifespans[idx] = 0;

      let maxLife = 1.0;
      let vx = 0, vy = 0, vz = 0;
      let size = 1.0;

      if (preset === 'collect_burst') {
        maxLife = 0.6 + Math.random() * 0.4;
        vx = (Math.random() - 0.5) * 6;
        vy = Math.random() * 5 + 2;
        vz = (Math.random() - 0.5) * 6;
        size = 0.2 + Math.random() * 0.2;
      } else if (preset === 'explosion') {
        maxLife = 0.5 + Math.random() * 0.5;
        vx = (Math.random() - 0.5) * 12;
        vy = Math.random() * 8 + 3;
        vz = (Math.random() - 0.5) * 12;
        size = 0.3 + Math.random() * 0.3;
      } else if (preset === 'teleport_flash') {
        maxLife = 0.8;
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 1.5;
        vx = Math.cos(angle) * rad;
        vy = Math.random() * 6 + 2;
        vz = Math.sin(angle) * rad;
        size = 0.25;
      } else if (preset === 'dust_footstep') {
        maxLife = 0.4;
        vx = (Math.random() - 0.5) * 1.5;
        vy = Math.random() * 1.0;
        vz = (Math.random() - 0.5) * 1.5;
        size = 0.15;
      } else if (preset === 'portal_swirl') {
        maxLife = 1.2;
        const angle = Math.random() * Math.PI * 2;
        vx = Math.cos(angle) * 2;
        vy = Math.random() * 3 + 1;
        vz = Math.sin(angle) * 2;
        size = 0.2;
      } else {
        maxLife = 0.7;
        vx = (Math.random() - 0.5) * 3;
        vy = Math.random() * 4;
        vz = (Math.random() - 0.5) * 3;
        size = 0.2;
      }

      this.velocities[idx * 3] = vx;
      this.velocities[idx * 3 + 1] = vy;
      this.velocities[idx * 3 + 2] = vz;
      this.maxLifespans[idx] = maxLife;
      this.sizes[idx] = size;
      this.activeCount++;
    }
  }

  public update(dt: number): void {
    let writeIdx = 0;
    const gravity = 9.81 * dt * 0.3;
    const im = this.mesh.instanceMatrix.array as Float32Array;

    for (let i = 0; i < this.activeCount; i++) {
      this.lifespans[i] += dt;
      if (this.lifespans[i] >= this.maxLifespans[i]) {
        continue;
      }

      let vx = this.velocities[i * 3];
      let vy = this.velocities[i * 3 + 1] - gravity;
      let vz = this.velocities[i * 3 + 2];
      this.velocities[i * 3 + 1] = vy;

      let px = this.positions[i * 3] + vx * dt;
      let py = this.positions[i * 3 + 1] + vy * dt;
      let pz = this.positions[i * 3 + 2] + vz * dt;

      this.positions[i * 3] = px;
      this.positions[i * 3 + 1] = py;
      this.positions[i * 3 + 2] = pz;

      const progress = this.lifespans[i] / this.maxLifespans[i];
      const currentScale = this.sizes[i] * (1 - progress);

      if (writeIdx !== i) {
        this.positions[writeIdx * 3] = px;
        this.positions[writeIdx * 3 + 1] = py;
        this.positions[writeIdx * 3 + 2] = pz;
        this.velocities[writeIdx * 3] = vx;
        this.velocities[writeIdx * 3 + 1] = vy;
        this.velocities[writeIdx * 3 + 2] = vz;
        this.lifespans[writeIdx] = this.lifespans[i];
        this.maxLifespans[writeIdx] = this.maxLifespans[i];
        this.sizes[writeIdx] = this.sizes[i];
      }

      const offset = writeIdx * 16;
      im[offset] = currentScale;     im[offset+1] = 0;              im[offset+2] = 0;              im[offset+3] = 0;
      im[offset+4] = 0;              im[offset+5] = currentScale;   im[offset+6] = 0;              im[offset+7] = 0;
      im[offset+8] = 0;              im[offset+9] = 0;              im[offset+10] = currentScale;  im[offset+11] = 0;
      im[offset+12] = px;            im[offset+13] = py;            im[offset+14] = pz;            im[offset+15] = 1;

      writeIdx++;
    }

    this.activeCount = writeIdx;
    this.mesh.count = writeIdx;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
