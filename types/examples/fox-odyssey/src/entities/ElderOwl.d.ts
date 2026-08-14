import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
export interface OwlDialogue {
    chapter: number;
    speaker: string;
    avatar: string;
    text: string;
}
export declare class ElderOwl {
    group: THREE.Group;
    position: THREE.Vector3;
    private headMesh;
    private wingLeft;
    private wingRight;
    private sparkleParticles;
    private audio;
    private animTime;
    private isTalking;
    private dialogues;
    constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio);
    getDialogueForChapter(chapter: number): OwlDialogue;
    checkProximity(playerPos: THREE.Vector3, chapter: number, onTalk: (dialogue: OwlDialogue) => void): void;
    private static readonly _toPlayer;
    update(dt: number, timeSeconds: number, playerPos: THREE.Vector3): void;
}
