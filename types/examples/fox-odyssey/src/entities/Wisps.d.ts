import * as THREE from 'three';
import { SpiritWisp } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export declare class WispManager {
    wisps: SpiritWisp[];
    private sparkleParticles;
    private audio;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onCollect: (wisp: SpiritWisp) => void): void;
}
