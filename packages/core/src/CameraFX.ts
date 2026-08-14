import { TweenManager, getEasing, EasingFn } from './Tween.ts';

/** Minimal camera interface — anything with a position works (THREE cameras included). */
export interface CameraLike {
  position: { x: number; y: number; z: number };
  /** Perspective cameras expose fov; zoom FX no-ops when absent. */
  fov?: number;
  /** Positional overload only (THREE.Object3D.lookAt(x, y, z) is compatible). */
  lookAt?: (x: number, y: number, z: number) => void;
  updateProjectionMatrix?: () => void;
}

export interface CameraFXConfig {
  /** Clamp target for fov tweens. Default 30. */
  minFov?: number;
  /** Clamp target for fov tweens. Default 120. */
  maxFov?: number;
  /**
   * Returns the point the camera currently faces, used to seed smooth lookAt.
   * Defaults to assuming the camera looks down -Z. Provide this for cameras
   * whose orientation is already rotated (e.g. THREE via getWorldDirection).
   */
  getLookTarget?: () => { x: number; y: number; z: number };
}

export interface ShakeOptions {
  /** Exponential decay per second (higher = settles faster). Default 4. */
  decay?: number;
  /** Per-axis offset scale, e.g. { x: 1, y: 1, z: 0 } for ground-plane shakes. */
  axisScale?: { x?: number; y?: number; z?: number };
}

/**
 * 🎥 CameraFX
 * Tween-based camera effects composed on top of `TweenManager`:
 *  - `shake()`   – decaying random offset applied additively (delta-based, so it
 *                 composes with game-driven camera movement and never "sticks")
 *  - `punchZoom()`/`zoomTo()` – FOV effects that refresh the projection matrix
 *  - `moveTo()`  – eased camera position tween
 *  - `lookAt()`  – smooth rotation to face a target using the camera's own lookAt
 *
 * Call `update(dt)` every frame (KairoApp does this automatically via `app.cameraFX`).
 */
export class CameraFX {
  public camera: CameraLike;
  public tweens: TweenManager;
  private config: Required<Pick<CameraFXConfig, 'minFov' | 'maxFov'>>;
  private getLookTarget: CameraFXConfig['getLookTarget'] = undefined;

  private shakeActive: boolean = false;
  private shakeTime: number = 0;
  private shakeDuration: number = 0;
  private shakeIntensity: number = 0;
  private shakeDecay: number = 4;
  private shakeAxis: { x: number; y: number; z: number } = { x: 1, y: 1, z: 0 };
  private shakePrev: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

  private lookActive: boolean = false;
  private lookStart: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private lookTarget: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private lookProgress: number = 0;
  private lookDuration: number = 1;
  private lookEase: EasingFn = getEasing('inOutQuad');

  constructor(camera: CameraLike, tweens: TweenManager, config: CameraFXConfig = {}) {
    this.camera = camera;
    this.tweens = tweens;
    this.config = {
      minFov: config.minFov ?? 30,
      maxFov: config.maxFov ?? 120
    };
    this.getLookTarget = config.getLookTarget;
  }

  /** Tick shake decay + smooth lookAt. Safe to call every frame. */
  public update(dt: number): void {
    this.updateShake(dt);
    this.updateLook(dt);
  }

  /**
   * Start a decaying camera shake. Offsets are applied as per-frame deltas so
   * other camera logic (orbit controllers, moveTo tweens) keeps full control.
   */
  public shake(intensity: number, duration: number, options: ShakeOptions = {}): this {
    this.stopShake(); // settle any previous shake without a position jump
    this.shakeIntensity = Math.max(0, intensity);
    this.shakeDuration = Math.max(0.0001, duration);
    this.shakeTime = 0;
    this.shakeDecay = options.decay ?? 4;
    const axis = options.axisScale ?? {};
    this.shakeAxis = { x: axis.x ?? 1, y: axis.y ?? 1, z: axis.z ?? 0 };
    this.shakeActive = true;
    return this;
  }

  /** Stop the shake and settle the camera exactly back to its current base. */
  public stopShake(): this {
    if (this.shakeActive) {
      this.applyShakeDelta(0, 0, 0);
    }
    this.shakeActive = false;
    this.shakeIntensity = 0;
    this.shakePrev = { x: 0, y: 0, z: 0 };
    return this;
  }

  public get isShaking(): boolean {
    return this.shakeActive;
  }

  /** Quick fov "punch" that springs up and returns to the base fov. */
  public punchZoom(amount: number, duration: number = 0.25, easing: EasingFn | string = 'outQuad'): this {
    if (typeof this.camera.fov !== 'number') return this;
    const base = this.camera.fov;
    const target = this.clampFov(base + amount);
    this.tweens.to(this.camera, { fov: target }, {
      duration,
      easing,
      yoyo: true,
      onUpdate: () => this.camera.updateProjectionMatrix?.()
    });
    return this;
  }

  /** Tween fov to an absolute value (clamped to config bounds). */
  public zoomTo(fov: number, duration: number = 0.5, easing: EasingFn | string = 'inOutQuad'): this {
    if (typeof this.camera.fov !== 'number') return this;
    this.tweens.to(this.camera, { fov: this.clampFov(fov) }, {
      duration,
      easing,
      onUpdate: () => this.camera.updateProjectionMatrix?.()
    });
    return this;
  }

  /** Eased tween of the camera position. */
  public moveTo(position: { x: number; y: number; z: number }, duration: number = 1, easing: EasingFn | string = 'inOutQuad'): this {
    this.tweens.to(this.camera.position, {
      x: position.x,
      y: position.y,
      z: position.z
    }, { duration, easing });
    return this;
  }

  /** Smoothly rotate the camera to face a target using the camera's own lookAt. */
  public lookAt(target: { x: number; y: number; z: number }, duration: number = 1, easing: EasingFn | string = 'inOutQuad'): this {
    if (typeof this.camera.lookAt !== 'function') return this;
    this.lookStart = this.computeCurrentTarget();
    this.lookTarget = { x: target.x, y: target.y, z: target.z };
    this.lookProgress = 0;
    this.lookDuration = Math.max(0.0001, duration);
    this.lookEase = getEasing(easing);
    this.lookActive = true;
    return this;
  }

  /** Stop a running smooth lookAt (camera stays where it is). */
  public stopLookAt(): this {
    this.lookActive = false;
    return this;
  }

  private updateShake(dt: number): void {
    if (!this.shakeActive) return;
    this.shakeTime += dt;
    if (this.shakeTime >= this.shakeDuration) {
      this.stopShake();
      return;
    }
    const decayed = this.shakeIntensity * Math.exp(-this.shakeDecay * this.shakeTime);
    const ox = (Math.random() * 2 - 1) * decayed * this.shakeAxis.x;
    const oy = (Math.random() * 2 - 1) * decayed * this.shakeAxis.y;
    const oz = (Math.random() * 2 - 1) * decayed * this.shakeAxis.z;
    this.applyShakeDelta(ox, oy, oz);
  }

  /** Apply a new offset as a delta from the previous one so the shake never jumps. */
  private applyShakeDelta(dx: number, dy: number, dz: number): void {
    const p = this.camera.position;
    p.x += dx - this.shakePrev.x;
    p.y += dy - this.shakePrev.y;
    p.z += dz - this.shakePrev.z;
    this.shakePrev = { x: dx, y: dy, z: dz };
  }

  private updateLook(dt: number): void {
    if (!this.lookActive || typeof this.camera.lookAt !== 'function') return;
    this.lookProgress += dt;
    const t = Math.min(1, this.lookProgress / this.lookDuration);
    const e = this.lookEase(t);
    this.camera.lookAt(
      this.lookStart.x + (this.lookTarget.x - this.lookStart.x) * e,
      this.lookStart.y + (this.lookTarget.y - this.lookStart.y) * e,
      this.lookStart.z + (this.lookTarget.z - this.lookStart.z) * e
    );
    if (t >= 1) this.lookActive = false;
  }

  /** Approximate the point the camera currently faces (hook-aware when provided). */
  private computeCurrentTarget(): { x: number; y: number; z: number } {
    if (this.getLookTarget) {
      const t = this.getLookTarget();
      return { x: t.x, y: t.y, z: t.z };
    }
    // Fallback: assume the camera looks down -Z.
    return { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z - 1 };
  }

  private clampFov(fov: number): number {
    return Math.min(this.config.maxFov, Math.max(this.config.minFov, fov));
  }
}
