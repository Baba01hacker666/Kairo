import * as THREE from 'three';
export interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    color: THREE.Color;
    size: number;
    alpha: number;
    life: number;
    maxLife: number;
}
export type ParticleEffectPreset = 'sparkle' | 'fire' | 'smoke' | 'portal_swirl' | 'collect_burst' | 'explosion' | 'dust_footstep' | 'teleport_flash';
export declare class ParticleSystem {
    mesh: THREE.InstancedMesh;
    maxParticles: number;
    private dummy;
    private positionsX;
    private positionsY;
    private positionsZ;
    private velocitiesX;
    private velocitiesY;
    private velocitiesZ;
    private colors;
    private sizes;
    private lives;
    private maxLives;
    private activeCount;
    private instanceColorDirty;
    constructor(maxParticles?: number, color?: number);
    emitBurst(pos: THREE.Vector3 | [number, number, number], preset: ParticleEffectPreset, count?: number): void;
    private writeInstanceColor;
    update(dt: number): void;
}
