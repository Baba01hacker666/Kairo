import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export interface ChimeMonolith {
    id: number;
    mesh: THREE.Group;
    runeMesh: THREE.Mesh;
    light: THREE.PointLight;
    position: THREE.Vector3;
    isLit: boolean;
}
export declare class ChimeManager {
    chimes: ChimeMonolith[];
    private sparkleParticles;
    private audio;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    /** Restore lit state from the save so already-lit chimes glow on Continue. */
    syncWithSave(): void;
    checkBarkResonance(playerPos: THREE.Vector3, onLit: (chime: ChimeMonolith) => void): void;
    areAllLit(): boolean;
}
