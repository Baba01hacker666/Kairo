import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export interface ShadowBeast {
    id: number;
    type: 'creeper' | 'specter' | 'behemoth';
    mesh: THREE.Group;
    position: THREE.Vector3;
    hp: number;
    maxHp: number;
    isAlive: boolean;
    level: number;
    speed: number;
    knockback: THREE.Vector3;
    baseY: number;
    stunTimer: number;
}
export declare class ShadowBeastManager {
    beasts: ShadowBeast[];
    private sparkleParticles;
    private dustParticles;
    private audio;
    private scene;
    private static _scratchDiff;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, dustParticles: ParticleSystem, audio: ForestAudio);
    private spawnBeasts;
    onLevelSwitch(level: number): void;
    /** Player Pounce attack hits beasts in front of fox */
    handlePlayerPounceAttack(playerPos: THREE.Vector3, playerRotY: number, onDefeat: (beast: ShadowBeast) => void): void;
    /** Player Spirit Bark releases a purifying shockwave hitting all nearby beasts */
    handlePlayerSpiritBark(playerPos: THREE.Vector3, onDefeat: (beast: ShadowBeast) => void): void;
    private killBeast;
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, isPlayerInvulnerable: boolean, onDamagePlayer: (damage: number) => void): void;
}
