import * as THREE from 'three';
import { SpiritWisp } from '../types.js';
import { ParticleSystem } from '../../../../packages/renderer/src/index.js';
import { ForestAudio } from '../audio/ForestAudio.js';
export declare class WispManager {
    wisps: SpiritWisp[];
    private sparkleParticles;
    private audio;
    private _orbitTarget;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    /** Restore collected state from the save so collected wisps orbit the fox. */
    syncWithSave(): void;
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onCollect: (wisp: SpiritWisp) => void): void;
}
