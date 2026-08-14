import * as THREE from 'three';
import { BouncyMushroom } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export declare class MushroomManager {
    mushrooms: BouncyMushroom[];
    private sparkleParticles;
    private audio;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    checkPlayerBounce(playerPos: THREE.Vector3, now: number, onBounce: (force: number) => void): void;
}
