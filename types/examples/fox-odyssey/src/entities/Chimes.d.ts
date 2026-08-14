import * as THREE from 'three';
import { ChimeMonolith } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export declare class ChimeManager {
    chimes: ChimeMonolith[];
    private sparkleParticles;
    private audio;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    checkBarkResonance(playerPos: THREE.Vector3, onLit: (chime: ChimeMonolith) => void): void;
    areAllLit(): boolean;
}
