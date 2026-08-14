import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export interface SprintRing {
    id: number;
    mesh: THREE.Mesh;
    position: THREE.Vector3;
    passed: boolean;
}
export declare class EndgameShrineManager {
    private scene;
    private sparkleParticles;
    private audio;
    sprintRings: SprintRing[];
    isSprintActive: boolean;
    sprintStartTime: number;
    sprintRingsCollected: number;
    bestTimeSeconds: number;
    skyState: 'noon' | 'sunset' | 'aurora';
    private timeTrialAltar;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    private initAltarMesh;
    private initSprintRings;
    private loadBestTime;
    startSprint(onStart: () => void): void;
    private static readonly _altarCenter;
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onRingPassed: (current: number, total: number) => void, onFinish: (elapsedSeconds: number, isNewBest: boolean) => void): void;
}
