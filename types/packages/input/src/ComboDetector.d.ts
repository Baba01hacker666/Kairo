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
/**
 * 🕹️ ComboDetector
 * Pattern recognition engine for fighting game input sequences, double-taps, dash triggers, and cheat codes.
 */
export declare class ComboDetector {
    private combos;
    private tracking;
    readonly events: EventEmitter;
    /**
     * Register an input combo sequence.
     */
    register(combo: InputCombo): this;
    /**
     * Unregister a combo by name.
     */
    unregister(name: string): void;
    /**
     * Feed a key or action name into the combo tracker.
     * Checks all registered combos and triggers matched ones.
     */
    feed(inputKey: string, currentTime?: number): string[];
    /**
     * Check time expirations for in-progress combos during update frame.
     */
    update(currentTime?: number): void;
    /**
     * Clear all active combo tracking states.
     */
    reset(): void;
    private resetTracking;
}
