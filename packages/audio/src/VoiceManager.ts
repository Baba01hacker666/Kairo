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

export const BuiltInVoicePresets: Record<string, VoiceProfile> = {
  owl: {
    pitch: 160,
    pitchVariation: 0.1,
    oscillatorType: 'triangle',
    blipDuration: 0.05,
    volume: 0.3
  },
  fox: {
    pitch: 440,
    pitchVariation: 0.18,
    oscillatorType: 'triangle',
    blipDuration: 0.035,
    volume: 0.25
  },
  wisp: {
    pitch: 880,
    pitchVariation: 0.12,
    oscillatorType: 'sine',
    blipDuration: 0.03,
    volume: 0.2
  },
  duck: {
    pitch: 580,
    pitchVariation: 0.25,
    oscillatorType: 'sawtooth',
    blipDuration: 0.04,
    volume: 0.2
  },
  robot: {
    pitch: 320,
    pitchVariation: 0.02,
    oscillatorType: 'square',
    blipDuration: 0.04,
    volume: 0.15
  },
  chime: {
    pitch: 1020,
    pitchVariation: 0.08,
    oscillatorType: 'sine',
    blipDuration: 0.06,
    volume: 0.25
  }
};

/**
 * 🎙️ VoiceManager
 * Procedural character typewriter voice blips (Undertale / Animal Crossing style)
 * and Web Speech API text-to-speech synthesis narration.
 */
export class VoiceManager extends EventEmitter {
  private audio: AudioManager;
  private profiles: Map<string, VoiceProfile> = new Map();
  private lastBlipCharIndex: number = -1;

  constructor(audio?: AudioManager) {
    super();
    this.audio = audio || new AudioManager();
    // Register standard voice presets
    for (const [name, preset] of Object.entries(BuiltInVoicePresets)) {
      this.registerProfile(name, { ...preset, name });
    }
  }

  /** Register a named character voice profile. */
  public registerProfile(name: string, profile: VoiceProfile): this {
    this.profiles.set(name, { ...profile, name });
    return this;
  }

  /** Retrieve a voice profile by name or preset. */
  public getProfile(nameOrProfile?: string | VoiceProfile): VoiceProfile {
    if (!nameOrProfile) {
      return this.profiles.get('fox') || BuiltInVoicePresets.fox;
    }
    if (typeof nameOrProfile === 'object') {
      return nameOrProfile;
    }
    return this.profiles.get(nameOrProfile) || BuiltInVoicePresets[nameOrProfile] || BuiltInVoicePresets.fox;
  }

  /**
   * Play a procedural typewriter voice blip for a character during dialogue typing.
   */
  public playVoiceBlip(
    char: string = 'a',
    profileOrName?: string | VoiceProfile,
    charIndex: number = 0
  ): void {
    // Skip whitespace and punctuation for blips
    if (!char || char.trim() === '' || /[,.!?;:'"()\-]/i.test(char)) {
      return;
    }

    const profile = this.getProfile(profileOrName);
    const interval = profile.characterInterval ?? 2;

    if (charIndex % interval !== 0) {
      return;
    }

    const ctx = (this.audio as any).ctx as AudioContext | null;
    const sfxGain = (this.audio as any).sfxGain as GainNode | null;
    if (!ctx || !sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const basePitch = profile.pitch ?? 440;
      const variation = profile.pitchVariation ?? 0.15;
      const randFactor = 1.0 + (Math.random() * 2 - 1) * variation;
      const freq = Math.max(50, Math.min(4000, basePitch * randFactor));

      osc.type = profile.oscillatorType ?? 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const duration = profile.blipDuration ?? 0.035;
      const vol = profile.volume ?? 0.25;

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + duration);

      this.emit('voice_blip', { char, profile, freq });
    } catch (err) {
      // Ignore audio synthesis errors before user interaction unlock
    }
  }

  /**
   * Speak a text string using the browser's Web Speech API Text-to-Speech engine.
   * Returns a promise that resolves when speech completes.
   */
  public speak(
    text: string,
    profileOrName?: string | VoiceProfile
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      const profile = this.getProfile(profileOrName);
      window.speechSynthesis.cancel(); // Stop any overlapping speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (profile.ttsRate !== undefined) utterance.rate = profile.ttsRate;
      if (profile.ttsPitch !== undefined) utterance.pitch = profile.ttsPitch;
      if (profile.ttsVolume !== undefined) utterance.volume = profile.ttsVolume;

      if (profile.ttsVoice) {
        const voices = window.speechSynthesis.getVoices();
        const matched = voices.find(v => v.name.includes(profile.ttsVoice!) || v.lang.includes(profile.ttsVoice!));
        if (matched) utterance.voice = matched;
      }

      utterance.onstart = () => {
        this.emit('speak_started', { text, profile });
      };

      utterance.onend = () => {
        this.emit('speak_ended', { text, profile });
        resolve();
      };

      utterance.onerror = (e) => {
        this.emit('speak_error', { text, error: e });
        resolve(); // Resolve rather than rejecting to prevent uncaught runtime errors in games
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /** Cancel active text-to-speech narration. */
  public cancelSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}
