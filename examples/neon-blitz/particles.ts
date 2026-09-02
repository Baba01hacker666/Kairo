import * as THREE from 'three';

/**
 * Lightweight sparkle particle field backed by a THREE.Points buffer.
 * Every point shares one material; the colour is set per burst.
 */
export class SparkleField {
  private points: THREE.Points;
  private positionAttribute: THREE.BufferAttribute;
  private material: THREE.PointsMaterial;
  private index = 0;

  constructor(scene: THREE.Scene, count: number) {
    const geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    geometry.setAttribute('position', this.positionAttribute);

    this.material = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  public emitSpark(position: THREE.Vector3, color = 0x22d3ee): void {
    for (let i = 0; i < 6; i++) {
      const arrayIndex = this.index * 3;
      this.positionAttribute.setXYZ(
        arrayIndex / 3,
        position.x + (Math.random() - 0.5) * 0.6,
        position.y + 0.3 + (Math.random() - 0.5) * 0.6,
        position.z + (Math.random() - 0.5) * 0.6
      );
      this.index = (this.index + 1) % (this.positionAttribute.count);
    }
    this.positionAttribute.needsUpdate = true;
    this.material.color.setHex(color);
  }
}
