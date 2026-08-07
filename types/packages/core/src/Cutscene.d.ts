import { KairoApp } from './KairoApp.ts';
export declare class CutsceneAbortError extends Error {
    constructor();
}
/**
 * The Context object passed to Cutscene scripts.
 * Provides helper methods to wait, move camera, and show UI, which can all be aborted instantly.
 */
export declare class CutsceneContext {
    app: KairoApp;
    private aborted;
    constructor(app: KairoApp);
    abort(): void;
    private checkAbort;
    /** Wait for X seconds */
    wait(seconds: number): Promise<void>;
    /** Interpolate camera position */
    moveCamera(targetPos: [number, number, number], duration?: number): Promise<void>;
    /** Interpolate camera rotation to look at a target */
    lookAt(targetPos: [number, number, number], duration?: number): Promise<void>;
    /** Play cinematic dialogue (subtitle) */
    showDialogue(text: string, duration?: number): Promise<void>;
    /** Shake the camera */
    shakeCamera(intensity: number, duration: number, decay?: number): void;
    /** Instantly flash the screen a color (e.g., "#ffffff" for lightning/damage) */
    flashScreen(color?: string, durationMs?: number): void;
    /** Smoothly fade the screen to a specific opacity (0 to 1) over time */
    fadeScreen(targetOpacity: number, color?: string, durationMs?: number): Promise<void>;
}
/**
 * Orchestrator for playing Async/Await based cutscene sequences.
 */
export declare class CutsceneManager {
    private app;
    private activeContext;
    constructor(app: KairoApp);
    /**
     * Plays a cutscene script. The script should be an async function that receives the CutsceneContext.
     */
    play(script: (ctx: CutsceneContext) => Promise<void>): Promise<void>;
    /**
     * Instantly aborts the currently running cutscene, triggering CutsceneAbortError
     * to gracefully cancel all pending `await` operations.
     */
    skip(): void;
    stop(): void;
    get isPlaying(): boolean;
}
