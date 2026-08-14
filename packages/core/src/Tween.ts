export type EasingFn = (t: number) => number;

const BACK_C1 = 1.70158;
const BACK_C2 = BACK_C1 * 1.525;
const BACK_C3 = BACK_C1 + 1;
const ELASTIC_C4 = (2 * Math.PI) / 3;
const ELASTIC_C5 = (2 * Math.PI) / 4.5;

function bounceOut(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

/** Named easing functions, all mapping t ∈ [0, 1] to an eased value. */
export const Easing: Record<string, EasingFn> = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: t => t * t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inQuart: t => t * t * t * t,
  outQuart: t => 1 - Math.pow(1 - t, 4),
  inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  inSine: t => 1 - Math.cos((t * Math.PI) / 2),
  outSine: t => Math.sin((t * Math.PI) / 2),
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  inExpo: t => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: t => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  inBack: t => BACK_C3 * t * t * t - BACK_C1 * t * t,
  outBack: t => 1 + BACK_C3 * Math.pow(t - 1, 3) + BACK_C1 * Math.pow(t - 1, 2),
  inOutBack: t => (t < 0.5 ? (Math.pow(2 * t, 2) * ((BACK_C2 + 1) * 2 * t - BACK_C2)) / 2 : (Math.pow(2 * t - 2, 2) * ((BACK_C2 + 1) * (t * 2 - 2) + BACK_C2) + 2) / 2),
  inElastic: t => (t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_C4)),
  outElastic: t => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1),
  inOutElastic: t => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2 + 1),
  inBounce: t => 1 - bounceOut(1 - t),
  outBounce: bounceOut,
  inOutBounce: t => (t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2)
};

/** Resolve a string easing name or pass through a function. */
export function getEasing(easing?: EasingFn | string): EasingFn {
  if (typeof easing === 'function') return easing;
  return Easing[easing ?? 'inOutQuad'] ?? Easing.linear;
}

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

type Tweenable = number | number[] | Record<string, number>;

function isTweenable(value: unknown): value is Tweenable {
  if (typeof value === 'number' && Number.isFinite(value)) return true;
  if (Array.isArray(value)) return value.every(v => typeof v === 'number' && Number.isFinite(v));
  if (typeof value === 'object' && value !== null) {
    const values = Object.values(value);
    return values.length > 0 && values.every(v => typeof v === 'number' && Number.isFinite(v));
  }
  return false;
}

/**
 * ✨ Tween
 * Interpolates numeric properties of a target object (scalars, arrays, and
 * nested objects like THREE.Vector3 / engine Vector3) over time with easing,
 * delay, repeat, yoyo, chaining (then), and completion callbacks.
 */
export class Tween {
  public readonly target: any;
  private fromValues: Record<string, Tweenable> = {};
  private toValues: Record<string, Tweenable> = {};
  private duration: number;
  private delay: number;
  private ease: EasingFn;
  private repeat: number;
  private yoyo: boolean;
  private elapsed: number = 0;
  private repeatCount: number = 0;
  private reverse: boolean = false;
  private done: boolean = false;
  private killedFlag: boolean = false;
  private waiting: boolean = false;
  private nextTween: Tween | null = null;
  private onUpdateCb?: (eased: number, target: any) => void;
  private onCompleteCb?: (target: any) => void;
  public manager: TweenManager | null = null;

  constructor(
    target: any,
    to: Record<string, unknown>,
    from?: Record<string, unknown>,
    options: TweenOptions = {}
  ) {
    this.target = target;
    this.duration = Math.max(0.0001, options.duration ?? 1);
    this.delay = options.delay ?? 0;
    this.ease = getEasing(options.easing);
    this.repeat = options.repeat ?? 0;
    this.yoyo = options.yoyo ?? false;
    this.onUpdateCb = options.onUpdate;
    this.onCompleteCb = options.onComplete;

    for (const key of Object.keys(to)) {
      const fromVal = from ? from[key] : target[key];
      const toVal = to[key];
      if (!isTweenable(fromVal) || !isTweenable(toVal)) continue;
      if (typeof fromVal !== typeof toVal) continue;
      this.fromValues[key] = fromVal;
      this.toValues[key] = toVal;
    }
  }

  /** Chain: run `next` after this tween completes. */
  public then(next: Tween): Tween {
    this.nextTween = next;
    next.waiting = true;
    return next;
  }

  /** Cancel this tween (and any chained tweens). */
  public kill(): void {
    this.killedFlag = true;
    this.nextTween?.kill();
  }

  public get isFinished(): boolean {
    return this.done;
  }

  public get isWaiting(): boolean {
    return this.waiting;
  }

  /** Advance the tween. Returns true when it should be removed from its manager. */
  public update(dt: number): boolean {
    if (this.killedFlag || this.done) return true;
    if (this.waiting) return false;

    if (this.delay > 0) {
      this.delay -= dt;
      return false;
    }

    this.elapsed += dt;
    const finished = this.elapsed >= this.duration;
    const t = Math.min(1, this.elapsed / this.duration);
    const easedT = this.yoyo && this.reverse ? 1 - t : t;
    const e = this.ease(easedT);
    this.apply(e);
    if (this.onUpdateCb) this.onUpdateCb(e, this.target);

    if (finished) {
      if (this.yoyo && !this.reverse) {
        this.reverse = true;
        this.elapsed = 0;
        return false;
      }
      if (this.yoyo && this.reverse) {
        // A full forward+back cycle finished.
        this.reverse = false;
        this.repeatCount++;
        if (this.repeat >= 0 && this.repeatCount > this.repeat) {
          this.apply(0); // Snap exactly back to the start values
          return this.finish();
        }
        this.elapsed = 0;
        return false;
      }
      this.repeatCount++;
      if (this.repeat >= 0 && this.repeatCount > this.repeat) {
        this.apply(1); // Snap exactly to the end values
        return this.finish();
      }
      this.elapsed = 0;
      return false;
    }
    return false;
  }

  private apply(progress: number): void {
    for (const key of Object.keys(this.fromValues)) {
      const from = this.fromValues[key];
      const to = this.toValues[key];
      if (typeof from === 'number') {
        this.target[key] = from + ((to as number) - from) * progress;
      } else if (Array.isArray(from)) {
        const toArr = to as number[];
        const targetArr = this.target[key] as number[];
        for (let i = 0; i < from.length; i++) {
          targetArr[i] = from[i] + (toArr[i] - from[i]) * progress;
        }
      } else {
        const fromObj = from as Record<string, number>;
        const toObj = to as Record<string, number>;
        const targetObj = this.target[key] as Record<string, number>;
        for (const k of Object.keys(fromObj)) {
          if (typeof fromObj[k] === 'number' && typeof toObj[k] === 'number') {
            targetObj[k] = fromObj[k] + (toObj[k] - fromObj[k]) * progress;
          }
        }
      }
    }
  }

  private finish(): boolean {
    this.done = true;
    if (this.onCompleteCb) this.onCompleteCb(this.target);
    if (this.nextTween) this.nextTween.waiting = false;
    return true;
  }
}

/**
 * 🎬 TweenManager
 * Drives active tweens. Call `update(dt)` every frame (KairoApp does this
 * automatically via `app.tweens`).
 */
export class TweenManager {
  private tweens: Tween[] = [];

  /** Create a tween from the target's current values to `to`. */
  public to(target: any, to: Record<string, unknown>, options?: TweenOptions): Tween {
    return this.add(new Tween(target, to, undefined, options));
  }

  /** Create a tween from `from` to the target's current values. */
  public from(target: any, from: Record<string, unknown>, options?: TweenOptions): Tween {
    const current: Record<string, unknown> = {};
    for (const key of Object.keys(from)) current[key] = target[key];
    return this.add(new Tween(target, current, from, options));
  }

  /** Create a tween between explicit `from` and `to` values. */
  public fromTo(target: any, from: Record<string, unknown>, to: Record<string, unknown>, options?: TweenOptions): Tween {
    return this.add(new Tween(target, to, from, options));
  }

  /** Advance all active tweens and drop finished ones. */
  public update(dt: number): void {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      if (this.tweens[i].update(dt)) {
        this.tweens.splice(i, 1);
      }
    }
  }

  /** Cancel every active tween. */
  public killAll(): void {
    this.tweens.forEach(t => t.kill());
    this.tweens = [];
  }

  public get count(): number {
    return this.tweens.length;
  }

  private add(tween: Tween): Tween {
    tween.manager = this;
    this.tweens.push(tween);
    return tween;
  }
}
