import * as THREE from 'three';
export interface SpiritWisp {
    id: number;
    name: string;
    position: THREE.Vector3;
    mesh: THREE.Group;
    light: THREE.PointLight;
    isCollected: boolean;
    baseY: number;
    bobOffset: number;
}
export interface CollectibleAcorn {
    id: number;
    mesh: THREE.Group;
    position: THREE.Vector3;
    collected: boolean;
    baseY: number;
    spinSpeed: number;
}
export interface ChimeMonolith {
    id: number;
    mesh: THREE.Group;
    runeMesh: THREE.Mesh;
    light: THREE.PointLight;
    position: THREE.Vector3;
    isLit: boolean;
}
export interface BouncyMushroom {
    mesh: THREE.Group;
    position: THREE.Vector3;
    bounceForce: number;
    lastBounceTime: number;
}
export interface FriendlyDuck {
    id: number;
    mesh: THREE.Group;
    position: THREE.Vector3;
    targetPos: THREE.Vector3;
    isFollowing: boolean;
    animTime: number;
}
export interface PlayerStats {
    stamina: number;
    maxStamina: number;
    isPouncing: boolean;
    isGrounded: boolean;
    canDoubleJump: boolean;
    isGoldenForm: boolean;
}
