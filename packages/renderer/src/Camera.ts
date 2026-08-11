import * as THREE from 'three';
import { Vector3 } from '@kairo/core';

export interface CameraShakeConfig {
  intensity: number;
  duration: number;
  decay?: number;
}

export interface CinematicShotConfig {
  type: 'cut' | 'pan' | 'orbit' | 'dolly' | 'crane' | 'track';
  fromPos?: THREE.Vector3;
  toPos?: THREE.Vector3;
  targetPos?: THREE.Vector3;
  duration?: number;
  fov?: number;
  speed?: number;
  radius?: number;
}

export class CameraController {
  public camera: THREE.PerspectiveCamera | THREE.Camera;
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
  private currentTarget: THREE.Vector3 = new THREE.Vector3();
  private shakeOffset: THREE.Vector3 = new THREE.Vector3();
  private shakeTimeRemaining: number = 0;
  private shakeIntensity: number = 0;
  private shakeDecay: number = 1.0;

  // Cinematic Shot State
  private activeShot: CinematicShotConfig | null = null;
  private shotTimer: number = 0;
  private trackingTarget: THREE.Object3D | THREE.Vector3 | null = null;

  // Pre-allocated variables for update loop to avoid GC spikes
  private _desiredPos: THREE.Vector3 = new THREE.Vector3();
  private _dir: THREE.Vector3 = new THREE.Vector3();
  private _raycaster: THREE.Raycaster = new THREE.Raycaster();

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.currentPosition.copy(this.camera.position);
    this.currentTarget.copy(this.target);
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

  // --- CINEMATIC SHOTS & MOVEMENT SUITE ---

  /** Hard cut shot immediately to 3D position & lookAt target */
  public cutTo(pos: THREE.Vector3, lookAtTarget: THREE.Vector3): void {
    this.activeShot = null;
    this.camera.position.copy(pos);
    this.currentPosition.copy(pos);
    this.target.copy(lookAtTarget);
    this.currentTarget.copy(lookAtTarget);
    this.camera.lookAt(lookAtTarget);
  }

  /** Smooth 3D panning camera shot */
  public panTo(fromPos: THREE.Vector3, toPos: THREE.Vector3, lookAtTarget: THREE.Vector3, durationSeconds: number = 3.0): void {
    this.activeShot = {
      type: 'pan',
      fromPos: fromPos.clone(),
      toPos: toPos.clone(),
      targetPos: lookAtTarget.clone(),
      duration: durationSeconds
    };
    this.shotTimer = 0;
    this.camera.position.copy(fromPos);
    this.currentPosition.copy(fromPos);
    this.target.copy(lookAtTarget);
    this.currentTarget.copy(lookAtTarget);
  }

  /** 360° Cinematic Orbital Camera Shot around target */
  public orbitShot(centerTarget: THREE.Vector3, radius: number = 8.0, speed: number = 1.0, durationSeconds: number = 5.0): void {
    this.activeShot = {
      type: 'orbit',
      targetPos: centerTarget.clone(),
      radius,
      speed,
      duration: durationSeconds
    };
    this.shotTimer = 0;
    this.target.copy(centerTarget);
    this.currentTarget.copy(centerTarget);
  }

  /** Hitchcock Vertigo Dolly Zoom Effect */
  public dollyZoom(targetFov: number = 30, durationSeconds: number = 2.5): void {
    if ((this.camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pCam = this.camera as THREE.PerspectiveCamera;
      this.activeShot = {
        type: 'dolly',
        fov: targetFov,
        fromPos: pCam.position.clone(),
        duration: durationSeconds
      };
      this.shotTimer = 0;
    }
  }

  /** Crane / Jib Camera Shot (Rising or Falling smoothly) */
  public craneShot(startPos: THREE.Vector3, endPos: THREE.Vector3, durationSeconds: number = 4.0): void {
    this.panTo(startPos, endPos, this.target, durationSeconds);
  }

  /** Cinematic Tracking Shot following target object */
  public trackObject(target: THREE.Object3D | THREE.Vector3, lerpSpeed: number = 8.0): void {
    this.trackingTarget = target;
    this.lerpSpeed = lerpSpeed;
  }

  public update(dt: number, sceneObstacles: THREE.Object3D[] = []): void {
    // 1. Process Active Cinematic Shot Movement
    if (this.activeShot) {
      this.shotTimer += dt;
      const progress = Math.min(1.0, this.shotTimer / (this.activeShot.duration || 1.0));
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Smooth S-curve easing

      if (this.activeShot.type === 'pan' && this.activeShot.fromPos && this.activeShot.toPos) {
        this.currentPosition.lerpVectors(this.activeShot.fromPos, this.activeShot.toPos, easeProgress);
        if (this.activeShot.targetPos) {
          this.target.copy(this.activeShot.targetPos);
          this.currentTarget.copy(this.activeShot.targetPos);
        }
      } else if (this.activeShot.type === 'orbit' && this.activeShot.targetPos) {
        const angle = this.shotTimer * (this.activeShot.speed || 1.0);
        const rad = this.activeShot.radius || 8.0;
        this.currentPosition.x = this.activeShot.targetPos.x + Math.sin(angle) * rad;
        this.currentPosition.y = this.activeShot.targetPos.y + 3.0;
        this.currentPosition.z = this.activeShot.targetPos.z + Math.cos(angle) * rad;
        this.target.copy(this.activeShot.targetPos);
        this.currentTarget.copy(this.activeShot.targetPos);
      } else if (this.activeShot.type === 'dolly' && (this.camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        const pCam = this.camera as THREE.PerspectiveCamera;
        pCam.fov += ((this.activeShot.fov || 30) - pCam.fov) * Math.min(1.0, 4.0 * dt);
        pCam.updateProjectionMatrix();
      }

      if (progress >= 1.0) {
        this.activeShot = null;
      }

      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentTarget);
      return;
    }

    // 2. Process Tracking Target
    if (this.trackingTarget) {
      const pos = 'position' in this.trackingTarget ? (this.trackingTarget as THREE.Object3D).position : this.trackingTarget;
      this.setTargetPosition(pos);
    }

    // 3. Smooth Exponential Decay Lerp Factor for 60fps/120fps Lockstep Tracking
    const clampDt = Math.min(0.1, Math.max(0.001, dt));
    const lerpFactor = 1.0 - Math.exp(-this.lerpSpeed * clampDt);

    // Smoothly lerp lookAt target position
    this.currentTarget.lerp(this.target, lerpFactor);

    // Compute ideal orbital camera position relative to current target
    const idealX = this.currentTarget.x + this.distance * Math.sin(this.yaw) * Math.cos(this.pitch);
    const idealY = this.currentTarget.y + this.distance * Math.sin(this.pitch);
    const idealZ = this.currentTarget.z + this.distance * Math.cos(this.yaw) * Math.cos(this.pitch);
    
    this._desiredPos.set(idealX, idealY, idealZ);

    // Collision avoidance raycast against environment obstacles
    if (this.enableCollisionAvoidance && sceneObstacles.length > 0) {
      this._dir.copy(this._desiredPos).sub(this.currentTarget).normalize();
      this._raycaster.set(this.currentTarget, this._dir);
      this._raycaster.near = 0.1;
      this._raycaster.far = this.distance;

      const hits = this._raycaster.intersectObjects(sceneObstacles, true);
      if (hits.length > 0) {
        const hitDist = hits[0].distance - 0.3;
        if (hitDist < this.distance) {
          this._desiredPos.copy(this.currentTarget).add(this._dir.multiplyScalar(Math.max(this.minDistance, hitDist)));
        }
      }
    }

    // Smooth camera position interpolation
    this.currentPosition.lerp(this._desiredPos, lerpFactor);

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
    this.camera.lookAt(this.currentTarget);
  }
}
