import * as THREE from 'three';
import { FriendlyDuck } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
export declare class DuckManager {
    ducks: FriendlyDuck[];
    private sparkleParticles;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem);
    checkBarkCall(playerPos: THREE.Vector3, onDuckFollow: () => void): void;
    update(dt: number, playerPos: THREE.Vector3, playerRotY: number): void;
}
