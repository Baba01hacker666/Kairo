import * as THREE from 'three';
import { Vector3 } from '@kairo/core';

export interface CameraShakeConfig {
  intensity: number;
  duration: number;
  decay?: number;
}

export class CameraController {
  public camera: THREE.Camera;
  public target: THREE.Vector3 = new THREE.Vector3();
  
  public distance: number = 6.0;
  public minDistance: number = 2.0;
  public maxDistance: number = 20.0;
  public heightOffset: number = 1.5;
  public pitch: number = 0.35; // Vertical angle in radians
  public yaw: number = Math.PI; // Horizontal angle in radians (Behind character looking forward)

  public lerpSpeed: number = 10.0;
  public enableCollisionAvoidance: boolean = true;
  
  private currentPosition: THREE.Vector3 = new THREE.Vector3();
  private shakeOffset: THREE.Vector3 = new THREE.Vector3();
  private shakeTimeRemaining: number = 0;
  private shakeIntensity: number = 0;
  private shakeDecay: number = 1.0;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.currentPosition.copy(this.camera.position);
  }

  public setTargetPosition(pos: Vector3 | THREE.Vector3): void {
    this.target.set(pos.x, pos.y + this.heightOffset, pos.z);
  }

  public rotate(deltaYaw: number, deltaPitch: number): void {
    this.yaw += deltaYaw;
    this.pitch = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, this.pitch + deltaPitch));
  }

  public zoom(deltaDistance: number): void {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + deltaDistance));
  }

  public shake(config: CameraShakeConfig): void {
    this.shakeIntensity = config.intensity;
    this.shakeTimeRemaining = config.duration;
    this.shakeDecay = config.decay ?? 1.0;
  }

  public update(dt: number, sceneObstacles: THREE.Object3D[] = []): void {
    // Compute ideal orbital camera position
    const idealX = this.target.x + this.distance * Math.sin(this.yaw) * Math.cos(this.pitch);
    const idealY = this.target.y + this.distance * Math.sin(this.pitch);
    const idealZ = this.target.z + this.distance * Math.cos(this.yaw) * Math.cos(this.pitch);
    
    let desiredPos = new THREE.Vector3(idealX, idealY, idealZ);

    // Collision avoidance raycast against environment obstacles
    if (this.enableCollisionAvoidance && sceneObstacles.length > 0) {
      const dir = desiredPos.clone().sub(this.target).normalize();
      const raycaster = new THREE.Raycaster(this.target, dir, 0.1, this.distance);
      const hits = raycaster.intersectObjects(sceneObstacles, true);
      if (hits.length > 0) {
        const hitDist = hits[0].distance - 0.3;
        if (hitDist < this.distance) {
          desiredPos.copy(this.target).add(dir.multiplyScalar(Math.max(this.minDistance, hitDist)));
        }
      }
    }

    // Smooth position interpolation
    this.currentPosition.lerp(desiredPos, Math.min(1.0, this.lerpSpeed * dt));

    // Handle screen shake
    if (this.shakeTimeRemaining > 0) {
      this.shakeTimeRemaining -= dt;
      const currentInt = this.shakeIntensity * (this.shakeTimeRemaining > 0 ? (this.shakeTimeRemaining * this.shakeDecay) : 0);
      this.shakeOffset.set(
        (Math.random() - 0.5) * 2 * currentInt,
        (Math.random() - 0.5) * 2 * currentInt,
        (Math.random() - 0.5) * 2 * currentInt
      );
    } else {
      this.shakeOffset.set(0, 0, 0);
    }

    this.camera.position.copy(this.currentPosition).add(this.shakeOffset);
    this.camera.lookAt(this.target);
  }
}
