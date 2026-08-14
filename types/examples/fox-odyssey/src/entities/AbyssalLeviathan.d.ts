import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export declare class AbyssalLeviathan {
    group: THREE.Group;
    position: THREE.Vector3;
    hp: number;
    maxHp: number;
    isAlive: boolean;
    isSurfaced: boolean;
    private bodySegments;
    private crestMesh;
    private crestMat;
    private sparkleParticles;
    private splashParticles;
    private audio;
    private swimTimer;
    private diveTimer;
    private surfaceTimer;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, splashParticles: ParticleSystem, audio: ForestAudio);
    takeDamage(damage: number, onDefeated: () => void): void;
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onGeyserHit: () => void): void;
}
