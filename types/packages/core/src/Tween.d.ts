export type EasingFn = (t: number) => number;
/** Named easing functions, all mapping t ∈ [0, 1] to an eased value. */
export declare const Easing: Record<string, EasingFn>;
/** Resolve a string easing name or pass through a function. */
export declare function getEasing(easing?: EasingFn | string): EasingFn;
export interface TweenOptions {
    /** Duration in seconds. Defaults to 1. */
    duration?: number;
    /** Delay before the tween starts, in seconds. */
    delay?: number;
    /** Easing function or named easing. Defaults to 'inOutQuad'. */
    easing?: EasingFn | string;
    /** Extra cycles to play after the first (-1 = infinite). */
    repeat?: number;
    /** Play forward then reverse per cycle. */
    yoyo?: boolean;
    onUpdate?: (eased: number, target: any) => void;
    onComplete?: (target: any) => void;
}
/**
 * ✨ Tween
 * Interpolates numeric properties of a target object (scalars, arrays, and
 * nested objects like THREE.Vector3 / engine Vector3) over time with easing,
 * delay, repeat, yoyo, chaining (then), and completion callbacks.
 */
export declare class Tween {
    readonly target: any;
    private fromValues;
    private toValues;
    private duration;
    private delay;
    private ease;
    private repeat;
    private yoyo;
    private elapsed;
    private repeatCount;
    private reverse;
    private done;
    private killedFlag;
    private waiting;
    private nextTween;
    private onUpdateCb?;
    private onCompleteCb?;
    manager: TweenManager | null;
    constructor(target: any, to: Record<string, unknown>, from?: Record<string, unknown>, options?: TweenOptions);
    /** Chain: run `next` after this tween completes. */
    then(next: Tween): Tween;
    /** Cancel this tween (and any chained tweens). */
    kill(): void;
    get isFinished(): boolean;
    get isWaiting(): boolean;
    /** Advance the tween. Returns true when it should be removed from its manager. */
    update(dt: number): boolean;
    private apply;
    private finish;
}
/**
 * 🎬 TweenManager
 * Drives active tweens. Call `update(dt)` every frame (KairoApp does this
 * automatically via `app.tweens`).
 */
export declare class TweenManager {
    private tweens;
    /** Create a tween from the target's current values to `to`. */
    to(target: any, to: Record<string, unknown>, options?: TweenOptions): Tween;
    /** Create a tween from `from` to the target's current values. */
    from(target: any, from: Record<string, unknown>, options?: TweenOptions): Tween;
    /** Create a tween between explicit `from` and `to` values. */
    fromTo(target: any, from: Record<string, unknown>, to: Record<string, unknown>, options?: TweenOptions): Tween;
    /** Advance all active tweens and drop finished ones. */
    update(dt: number): void;
    /** Cancel every active tween. */
    killAll(): void;
    get count(): number;
    private add;
}
