import * as THREE from 'three';
import { KairoApp } from './KairoApp.ts';

export type SceneSetupFunction = (app: KairoApp) => void | Promise<void>;

/**
 * Manages loading, unloading, and transitioning between complete game levels/scenes.
 * Handles automatic teardown of Physics, UI, 3D Meshes, and Cutscenes.
 */
export class SceneManager {
  private activeSceneName: string | null = null;
  private scenes: Map<string, SceneSetupFunction> = new Map();

  constructor(private app: KairoApp) {}

  /**
   * Define a new scene with a setup function.
   */
  public define(name: string, setupFn: SceneSetupFunction): void {
    this.scenes.set(name, setupFn);
  }

  /**
   * Unload the current scene and load a new one.
   */
  public async load(name: string): Promise<void> {
    const setupFn = this.scenes.get(name);
    if (!setupFn) {
      console.error(`[SceneManager] Scene '${name}' not found.`);
      return;
    }

    this.activeSceneName = name;
    
    // 1. Stop any cutscenes
    if (this.app.cutscene) {
      this.app.cutscene.stop();
    }
    
    // 2. Clear Physics
    if (this.app.physics && (this.app.physics as any).clear) {
      (this.app.physics as any).clear();
    }
    this.app.clearObstacles();

    // 3. Clear UI
    if (this.app.ui && this.app.ui.clear) {
      this.app.ui.clear();
    }

    // 4. Clear 3D Scene Geometry & Materials
    const toRemove: THREE.Object3D[] = [];
    this.app.scene.traverse((node) => {
      // Don't remove the scene itself
      if (node === this.app.scene) return;
      // We also might want to keep the main camera and lights if they are shared, 
      // but usually KairoApp re-adds lights on setupLighting. 
      // For safety, we remove everything.
      toRemove.push(node);
    });

    const disposeMaterial = (mat: THREE.Material) => {
      // Dispose any textures attached to the material to avoid GPU leaks.
      for (const value of Object.values(mat)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      mat.dispose();
    };

    for (const node of toRemove) {
      if ((node as any).geometry) {
        (node as any).geometry.dispose();
      }
      if ((node as any).material) {
        const mat = (node as any).material;
        if (Array.isArray(mat)) {
          mat.forEach(disposeMaterial);
        } else {
          disposeMaterial(mat);
        }
      }
      if (node.parent) {
        node.parent.remove(node);
      }
    }

    // 5. Reset frame-driven gameplay systems so the old scene's dialogue,
    // tweens, and camera FX don't carry into the new scene.
    this.app.tweens.killAll();
    this.app.dialogue.stop();
    this.app.cameraFX.stopShake();
    this.app.cameraFX.stopLookAt();

    // 6. Run the new Scene Setup logic
    await setupFn(this.app);
    
    console.log(`[SceneManager] Loaded scene '${name}'`);
  }
  
  public get currentScene(): string | null {
    return this.activeSceneName;
  }
}
