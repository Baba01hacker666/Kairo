import * as THREE from 'three';
import { FriendlyDuck } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
export declare class DuckManager {
    ducks: FriendlyDuck[];
    private sparkleParticles;
    private _followTarget;
    private _lookTarget;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem);
    checkBarkCall(playerPos: THREE.Vector3, onDuckFollow: () => void): void;
    /** Restore following state from the save so recruited ducks follow on Continue. */
    syncWithSave(): void;
    update(dt: number, playerPos: THREE.Vector3, playerRotY: number): void;
}
