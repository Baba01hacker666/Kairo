import { TweenManager, EasingFn } from './Tween.ts';
/** Minimal camera interface — anything with a position works (THREE cameras included). */
export interface CameraLike {
    position: {
        x: number;
        y: number;
        z: number;
    };
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
    getLookTarget?: () => {
        x: number;
        y: number;
        z: number;
    };
}
export interface ShakeOptions {
    /** Exponential decay per second (higher = settles faster). Default 4. */
    decay?: number;
    /** Per-axis offset scale, e.g. { x: 1, y: 1, z: 0 } for ground-plane shakes. */
    axisScale?: {
        x?: number;
        y?: number;
        z?: number;
    };
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
export declare class CameraFX {
    camera: CameraLike;
    tweens: TweenManager;
    private config;
    private getLookTarget;
    private shakeActive;
    private shakeTime;
    private shakeDuration;
    private shakeIntensity;
    private shakeDecay;
    private shakeAxis;
    private shakePrev;
    private lookActive;
    private lookStart;
    private lookTarget;
    private lookProgress;
    private lookDuration;
    private lookEase;
    constructor(camera: CameraLike, tweens: TweenManager, config?: CameraFXConfig);
    /** Tick shake decay + smooth lookAt. Safe to call every frame. */
    update(dt: number): void;
    /**
     * Start a decaying camera shake. Offsets are applied as per-frame deltas so
     * other camera logic (orbit controllers, moveTo tweens) keeps full control.
     */
    shake(intensity: number, duration: number, options?: ShakeOptions): this;
    /** Stop the shake and settle the camera exactly back to its current base. */
    stopShake(): this;
    get isShaking(): boolean;
    /** Quick fov "punch" that springs up and returns to the base fov. */
    punchZoom(amount: number, duration?: number, easing?: EasingFn | string): this;
    /** Tween fov to an absolute value (clamped to config bounds). */
    zoomTo(fov: number, duration?: number, easing?: EasingFn | string): this;
    /** Eased tween of the camera position. */
    moveTo(position: {
        x: number;
        y: number;
        z: number;
    }, duration?: number, easing?: EasingFn | string): this;
    /** Smoothly rotate the camera to face a target using the camera's own lookAt. */
    lookAt(target: {
        x: number;
        y: number;
        z: number;
    }, duration?: number, easing?: EasingFn | string): this;
    /** Stop a running smooth lookAt (camera stays where it is). */
    stopLookAt(): this;
    private updateShake;
    /** Apply a new offset as a delta from the previous one so the shake never jumps. */
    private applyShakeDelta;
    private updateLook;
    /** Approximate the point the camera currently faces (hook-aware when provided). */
    private computeCurrentTarget;
    private clampFov;
}
