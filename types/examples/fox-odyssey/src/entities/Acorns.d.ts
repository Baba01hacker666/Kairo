import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export interface SunAcorn {
    id: number;
    mesh: THREE.Group;
    position: THREE.Vector3;
    collected: boolean;
    baseY: number;
    spinSpeed: number;
}
export declare class AcornManager {
    acorns: SunAcorn[];
    private sparkleParticles;
    private audio;
    private getTerrainHeight?;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio, getTerrainHeight?: (x: number, z: number) => number);
    /** Restore collected state from the save so already-collected acorns are hidden. */
    syncWithSave(): void;
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onCollect: (count: number) => void): void;
}
