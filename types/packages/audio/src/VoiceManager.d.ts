import { EventEmitter } from '../../core/src/EventSystem.ts';
import { AudioManager } from './Audio.ts';
export interface VoiceProfile {
    /** Voice profile identifier (e.g. 'owl', 'fox', 'duck', 'robot', 'narrator'). */
    name?: string;
    /** Base frequency in Hertz for procedural typewriter blips (default: 420 Hz). */
    pitch?: number;
    /** Amount of random pitch variation per character to sound natural (0.0 to 1.0, default: 0.15). */
    pitchVariation?: number;
    /** Waveform type for procedural blips (default: 'triangle'). */
    oscillatorType?: OscillatorType;
    /** Duration of each individual character blip in seconds (default: 0.035s). */
    blipDuration?: number;
    /** Frequency interval in characters (e.g. play blip every 2 characters, default: 2). */
    characterInterval?: number;
    /** Volume multiplier for blips (default: 0.25). */
    volume?: number;
    /** Name of TTS voice for speech synthesis (e.g. 'Google UK English Male'). */
    ttsVoice?: string;
    /** TTS speech rate (0.5 to 2.0, default: 1.0). */
    ttsRate?: number;
    /** TTS speech pitch (0.0 to 2.0, default: 1.0). */
    ttsPitch?: number;
    /** TTS speech volume (0.0 to 1.0, default: 1.0). */
    ttsVolume?: number;
}
export declare const BuiltInVoicePresets: Record<string, VoiceProfile>;
/**
 * 🎙️ VoiceManager
 * Procedural character typewriter voice blips (Undertale / Animal Crossing style)
 * and Web Speech API text-to-speech synthesis narration.
 */
export declare class VoiceManager extends EventEmitter {
    private audio;
    private profiles;
    private lastBlipCharIndex;
    constructor(audio?: AudioManager);
    /** Register a named character voice profile. */
    registerProfile(name: string, profile: VoiceProfile): this;
    /** Retrieve a voice profile by name or preset. */
    getProfile(nameOrProfile?: string | VoiceProfile): VoiceProfile;
    /**
     * Play a procedural typewriter voice blip for a character during dialogue typing.
     */
    playVoiceBlip(char?: string, profileOrName?: string | VoiceProfile, charIndex?: number): void;
    /**
     * Speak a text string using the browser's Web Speech API Text-to-Speech engine.
     * Returns a promise that resolves when speech completes.
     */
    speak(text: string, profileOrName?: string | VoiceProfile): Promise<void>;
    /** Cancel active text-to-speech narration. */
    cancelSpeech(): void;
}
