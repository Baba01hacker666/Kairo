import { KairoApp } from './KairoApp.js';
export type SceneSetupFunction = (app: KairoApp) => void | Promise<void>;
/**
 * Manages loading, unloading, and transitioning between complete game levels/scenes.
 * Handles automatic teardown of Physics, UI, 3D Meshes, and Cutscenes.
 */
export declare class SceneManager {
    private app;
    private activeSceneName;
    private scenes;
    private pending;
    constructor(app: KairoApp);
    /**
     * Define a new scene with a setup function.
     */
    define(name: string, setupFn: SceneSetupFunction): void;
    /**
     * Unload the current scene and load a new one. Concurrent loads run in order.
     * Scene setup must not await another load on this manager (that would deadlock).
     */
    load(name: string): Promise<void>;
    private transitionTo;
    get currentScene(): string | null;
}
