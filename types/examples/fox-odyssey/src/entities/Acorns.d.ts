import * as THREE from 'three';
import { CollectibleAcorn } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export declare class AcornManager {
    acorns: CollectibleAcorn[];
    private sparkleParticles;
    private audio;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    /** Restore collected state from the save so already-collected acorns are hidden. */
    syncWithSave(): void;
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onCollect: (count: number) => void): void;
}
