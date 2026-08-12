import { Vector3 } from '../../core/src/Math.ts';
export type SynthesizedSFXType = 'jump' | 'laser' | 'explosion' | 'coin' | 'click' | 'switch' | 'gate' | 'key' | 'teleport' | 'push' | 'fanfare' | 'undo' | 'hint';
export declare class AudioManager {
    private ctx;
    private masterGain;
    private bgmGain;
    private sfxGain;
    private uiGain;
    private currentBgmSource;
    init(): void;
    setMasterVolume(vol: number): void;
    setBGMVolume(vol: number): void;
    setSFXVolume(vol: number): void;
    setUIVolume(vol: number): void;
    playSynthesizedSound(type: SynthesizedSFXType, pos?: Vector3): void;
    updateListenerPosition(pos: Vector3, forward?: Vector3): void;
}
export declare const GlobalAudio: AudioManager;
