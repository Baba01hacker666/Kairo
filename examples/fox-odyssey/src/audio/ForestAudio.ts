import { AudioManager } from '@kairo/audio';
import { GameState } from '../state.ts';

export class ForestAudio {
  private audioManager: AudioManager;
  private nextMelodyTime: number = 0;
  private pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  public resumeAudio() {
    this.audioManager.resume();
  }

  public playSound(type: 'jump' | 'coin' | 'fanfare' | 'hint' | 'teleport' | 'push' | 'click') {
    if (!GameState.instance.soundEnabled) return;
    this.audioManager.playSynthesizedSound(type);
  }

  public update(timeSeconds: number) {
    if (!GameState.instance.isGameStarted || !GameState.instance.soundEnabled) return;

    if (timeSeconds > this.nextMelodyTime) {
      this.nextMelodyTime = timeSeconds + (3.5 + Math.random() * 3.5);
      const freq = this.pentatonicScale[Math.floor(Math.random() * this.pentatonicScale.length)];
      this.playFluteNote(freq, 1.4);
    }
  }

  private playFluteNote(frequency: number, duration: number) {
    try {
      const ctx = (this.audioManager as any).ctx as AudioContext;
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      // Audio context suspended or user hasn't clicked yet
    }
  }
}
