import { KairoApp } from './KairoApp.ts';
export type SceneSetupFunction = (app: KairoApp) => void | Promise<void>;
/**
 * Manages loading, unloading, and transitioning between complete game levels/scenes.
 * Handles automatic teardown of Physics, UI, 3D Meshes, and Cutscenes.
 */
export declare class SceneManager {
    private app;
    private activeSceneName;
    private scenes;
    constructor(app: KairoApp);
    /**
     * Define a new scene with a setup function.
     */
    define(name: string, setupFn: SceneSetupFunction): void;
    /**
     * Unload the current scene and load a new one.
     */
    load(name: string): Promise<void>;
    get currentScene(): string | null;
}
