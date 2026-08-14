import { AudioManager } from '@kairo/audio';
export declare class ForestAudio {
    private audioManager;
    private nextMelodyTime;
    private pentatonicScale;
    constructor(audioManager: AudioManager);
    playSound(type: 'jump' | 'coin' | 'fanfare' | 'hint' | 'teleport' | 'push' | 'click'): void;
    update(timeSeconds: number): void;
    private playFluteNote;
}
