import * as THREE from 'three';

export class DustParticles {
  private count: number;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private positions: Float32Array;
  private ages: Float32Array;
  private velocities: Float32Array;
  private index: number = 0;

  constructor(scene: THREE.Scene, count: number = 40) {
    this.count = count;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.ages = new Float32Array(count);
    this.velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      this.ages[i] = 999; // Dead initially
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    
    this.material = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.2,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  public emit(x: number, y: number, z: number) {
    this.positions[this.index * 3] = x + (Math.random() - 0.5) * 0.3;
    this.positions[this.index * 3 + 1] = y + Math.random() * 0.2;
    this.positions[this.index * 3 + 2] = z + (Math.random() - 0.5) * 0.3;
    
    this.velocities[this.index * 3] = (Math.random() - 0.5) * 0.5;
    this.velocities[this.index * 3 + 1] = Math.random() * 0.5 + 0.2;
    this.velocities[this.index * 3 + 2] = (Math.random() - 0.5) * 0.5;

    this.ages[this.index] = 0;

    this.index = (this.index + 1) % this.count;
    this.geometry.attributes.position.needsUpdate = true;
  }

  public update(dt: number) {
    let needsUpdate = false;
    for (let i = 0; i < this.count; i++) {
      if (this.ages[i] < 1.0) {
        this.ages[i] += dt * 2.0;
        
        this.positions[i * 3] += this.velocities[i * 3] * dt;
        this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * dt;
        this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * dt;
        
        needsUpdate = true;
      } else if (this.ages[i] !== 999) {
        // Move far away to hide
        this.positions[i * 3] = 9999;
        this.positions[i * 3 + 1] = 9999;
        this.positions[i * 3 + 2] = 9999;
        this.ages[i] = 999;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      this.geometry.attributes.position.needsUpdate = true;
    }
  }
}
