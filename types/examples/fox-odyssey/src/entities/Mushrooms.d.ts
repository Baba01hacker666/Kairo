import * as THREE from 'three';
import { BouncyMushroom } from '../types.js';
import { ParticleSystem } from '../../../../packages/renderer/src/index.js';
import { ForestAudio } from '../audio/ForestAudio.js';
export declare class MushroomManager {
    mushrooms: BouncyMushroom[];
    private sparkleParticles;
    private audio;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    checkPlayerBounce(playerPos: THREE.Vector3, now: number, onBounce: (force: number) => void): void;
}
