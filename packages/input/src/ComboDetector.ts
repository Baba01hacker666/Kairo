import { EventEmitter } from '../../core/src/EventSystem.ts';

export interface InputCombo {
  /** Unique combo identifier (e.g. 'konami_code', 'double_tap_dash', 'uppercut'). */
  name: string;
  /** Sequence of keys or action names required in order. */
  sequence: string[];
  /** Maximum allowed time in milliseconds between successive keystrokes (default: 600ms). */
  maxDelayMs?: number;
  /** Callback fired when the combo sequence is successfully matched. */
  onTrigger?: () => void;
}

interface ComboTrackState {
  combo: InputCombo;
  currentIndex: number;
  lastInputTime: number;
}

/**
 * 🕹️ ComboDetector
 * Pattern recognition engine for fighting game input sequences, double-taps, dash triggers, and cheat codes.
 */
export class ComboDetector {
  private combos: Map<string, InputCombo> = new Map();
  private tracking: ComboTrackState[] = [];
  public readonly events: EventEmitter = new EventEmitter();

  /**
   * Register an input combo sequence.
   */
  public register(combo: InputCombo): this {
    if (!combo.sequence || combo.sequence.length === 0) return this;
    this.combos.set(combo.name, combo);
    this.resetTracking();
    return this;
  }

  /**
   * Unregister a combo by name.
   */
  public unregister(name: string): void {
    this.combos.delete(name);
    this.resetTracking();
  }

  /**
   * Feed a key or action name into the combo tracker.
   * Checks all registered combos and triggers matched ones.
   */
  public feed(inputKey: string, currentTime: number = performance.now()): string[] {
    const triggered: string[] = [];

    for (const tracker of this.tracking) {
      const { combo, currentIndex, lastInputTime } = tracker;
      const maxDelay = combo.maxDelayMs ?? 600;

      // Check if sequence timed out
      if (currentIndex > 0 && currentTime - lastInputTime > maxDelay) {
        tracker.currentIndex = 0;
      }

      const expectedKey = combo.sequence[tracker.currentIndex];

      if (expectedKey.toLowerCase() === inputKey.toLowerCase()) {
        tracker.currentIndex++;
        tracker.lastInputTime = currentTime;

        // Completed sequence!
        if (tracker.currentIndex >= combo.sequence.length) {
          triggered.push(combo.name);
          if (combo.onTrigger) {
            combo.onTrigger();
          }
          this.events.emit('combo_triggered', { name: combo.name, sequence: combo.sequence });
          tracker.currentIndex = 0; // Reset after successful trigger
        }
      } else {
        // If not matching next step, check if it matches the first step of this combo
        if (combo.sequence[0].toLowerCase() === inputKey.toLowerCase()) {
          tracker.currentIndex = 1;
          tracker.lastInputTime = currentTime;
        } else {
          tracker.currentIndex = 0;
        }
      }
    }

    return triggered;
  }

  /**
   * Check time expirations for in-progress combos during update frame.
   */
  public update(currentTime: number = performance.now()): void {
    for (const tracker of this.tracking) {
      if (tracker.currentIndex > 0) {
        const maxDelay = tracker.combo.maxDelayMs ?? 600;
        if (currentTime - tracker.lastInputTime > maxDelay) {
          tracker.currentIndex = 0;
        }
      }
    }
  }

  /**
   * Clear all active combo tracking states.
   */
  public reset(): void {
    for (const tracker of this.tracking) {
      tracker.currentIndex = 0;
      tracker.lastInputTime = 0;
    }
  }

  private resetTracking(): void {
    this.tracking = Array.from(this.combos.values()).map(combo => ({
      combo,
      currentIndex: 0,
      lastInputTime: 0
    }));
  }
}
