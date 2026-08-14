import { Vector3 } from '../../core/src/Math.ts';

export type SynthesizedSFXType =
  | 'jump'
  | 'laser'
  | 'explosion'
  | 'coin'
  | 'click'
  | 'switch'
  | 'gate'
  | 'key'
  | 'teleport'
  | 'push'
  | 'fanfare'
  | 'undo'
  | 'hint';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private uiGain: GainNode | null = null;
  private isUnlocked: boolean = false;
  private gestureListenersAttached: boolean = false;

  private currentBgmSource: AudioBufferSourceNode | HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupUserGestureUnlock();
    }
  }

  public setupUserGestureUnlock(): void {
    if (this.gestureListenersAttached || typeof window === 'undefined') return;
    this.gestureListenersAttached = true;

    const unlock = () => {
      this.isUnlocked = true;
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
  }

  public init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    if (typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.uiGain = this.ctx.createGain();

        this.bgmGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.uiGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      } catch (err) {
        // Ignored until user gesture
      }
    }
  }

  public resume(): Promise<void> {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      return this.ctx.resume().catch(() => {});
    }
    return Promise.resolve();
  }

  public setMasterVolume(vol: number): void {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  public setBGMVolume(vol: number): void {
    if (this.bgmGain) this.bgmGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  public setSFXVolume(vol: number): void {
    if (this.sfxGain) this.sfxGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  public setUIVolume(vol: number): void {
    if (this.uiGain) this.uiGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  public playSynthesizedSound(type: SynthesizedSFXType, pos?: Vector3): void {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx || !this.sfxGain || this.ctx.state !== 'running') return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      let destNode: AudioNode = this.sfxGain;

      if (pos && this.ctx.createPanner) {
        const panner = this.ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'exponential';
        panner.refDistance = 1;
        panner.maxDistance = 50;
        panner.rolloffFactor = 1.5;
        panner.positionX.value = pos.x;
        panner.positionY.value = pos.y;
        panner.positionZ.value = pos.z;
        panner.connect(this.sfxGain);
        destNode = panner;
      }

      osc.connect(gain);
      gain.connect(destNode);

      const now = this.ctx.currentTime;

      switch (type) {
        case 'jump':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'laser':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;

        case 'coin':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, now); // B5
          osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'click':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;

        case 'switch':
          osc.type = 'square';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.setValueAtTime(300, now + 0.03);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'teleport':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'push':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(60, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;

        case 'fanfare':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
          osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;

        case 'undo':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'hint':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now); // A4
          osc.frequency.setValueAtTime(554.37, now + 0.08); // C#5
          osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;

        default:
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
      }
    } catch (e) {
      // Ignore audio glitches safely
    }
  }

  public playBGM(url: string, loop: boolean = true): void {
    this.init();
    if (this.currentBgmSource) {
      if ('stop' in this.currentBgmSource) {
        try { this.currentBgmSource.stop(); } catch (e) {}
      } else if ('pause' in this.currentBgmSource) {
        this.currentBgmSource.pause();
      }
    }

    const audio = new Audio(url);
    audio.loop = loop;
    audio.play().catch(() => {});
    this.currentBgmSource = audio;
  }
}

export const GlobalAudio = new AudioManager();
