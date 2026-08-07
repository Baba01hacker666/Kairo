import * as THREE from 'three';
export declare class DustParticles {
    private count;
    private geometry;
    private material;
    private points;
    private positions;
    private ages;
    private velocities;
    private index;
    constructor(scene: THREE.Scene, count?: number);
    emit(x: number, y: number, z: number): void;
    update(dt: number): void;
}
