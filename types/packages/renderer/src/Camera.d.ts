import * as THREE from 'three';
import { Vector3 } from '../../core/src/Math.ts';
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
export declare class CameraController {
    camera: THREE.PerspectiveCamera | THREE.Camera;
    target: THREE.Vector3;
    enabled: boolean;
    distance: number;
    minDistance: number;
    maxDistance: number;
    heightOffset: number;
    pitch: number;
    yaw: number;
    lerpSpeed: number;
    enableCollisionAvoidance: boolean;
    private currentPosition;
    private currentTarget;
    private shakeOffset;
    private shakeTimeRemaining;
    private shakeIntensity;
    private shakeDecay;
    private activeShot;
    private shotTimer;
    private trackingTarget;
    private _desiredPos;
    private _dir;
    private _raycaster;
    private _hits;
    private _shotFromPos;
    private _shotToPos;
    private _shotTargetPos;
    constructor(camera: THREE.Camera);
    setTargetPosition(pos: Vector3 | THREE.Vector3): void;
    rotate(deltaYaw: number, deltaPitch: number): void;
    zoom(deltaDistance: number): void;
    shake(config: CameraShakeConfig): void;
    /** Hard cut shot immediately to 3D position & lookAt target */
    cutTo(pos: THREE.Vector3, lookAtTarget: THREE.Vector3): void;
    /** Smooth 3D panning camera shot */
    panTo(fromPos: THREE.Vector3, toPos: THREE.Vector3, lookAtTarget: THREE.Vector3, durationSeconds?: number): void;
    /** 360° Cinematic Orbital Camera Shot around target */
    orbitShot(centerTarget: THREE.Vector3, radius?: number, speed?: number, durationSeconds?: number): void;
    /** Hitchcock Vertigo Dolly Zoom Effect */
    dollyZoom(targetFov?: number, durationSeconds?: number): void;
    /** Crane / Jib Camera Shot (Rising or Falling smoothly) */
    craneShot(startPos: THREE.Vector3, endPos: THREE.Vector3, durationSeconds?: number): void;
    /** Cinematic Tracking Shot following target object */
    trackObject(target: THREE.Object3D | THREE.Vector3, lerpSpeed?: number): void;
    update(dt: number, sceneObstacles?: THREE.Object3D[]): void;
}
