import * as THREE from 'three';
import { KairoApp } from './KairoApp.ts';
import { Vector3, Quaternion } from './Math.ts';

export class CutsceneAbortError extends Error {
  constructor() {
    super('Cutscene Aborted');
    this.name = 'CutsceneAbortError';
  }
}

/**
 * The Context object passed to Cutscene scripts.
 * Provides helper methods to wait, move camera, and show UI, which can all be aborted instantly.
 */
export class CutsceneContext {
  private aborted = false;
  
  constructor(public app: KairoApp) {}
  
  public abort(): void {
    this.aborted = true;
    this.app.ui.hideSubtitle();
  }
  
  private checkAbort(): void {
    if (this.aborted) throw new CutsceneAbortError();
  }
  
  /** Wait for X seconds */
  public async wait(seconds: number): Promise<void> {
    this.checkAbort();
    return new Promise((resolve, reject) => {
      let elapsed = 0;
      const onUpdate = (dt: number) => {
        if (this.aborted) {
          this.app.engine.events.off('update', onUpdate);
          return reject(new CutsceneAbortError());
        }
        elapsed += dt;
        if (elapsed >= seconds) {
          this.app.engine.events.off('update', onUpdate);
          resolve();
        }
      };
      this.app.engine.events.on('update', onUpdate);
    });
  }
  
  /** Interpolate camera position */
  public async moveCamera(targetPos: [number, number, number], duration: number = 1.0): Promise<void> {
    this.checkAbort();
    return new Promise((resolve, reject) => {
      let elapsed = 0;
      const startPos = this.app.camera.position.clone();
      const endPos = new THREE.Vector3(...targetPos);
      
      const onUpdate = (dt: number) => {
        if (this.aborted) {
          this.app.engine.events.off('update', onUpdate);
          return reject(new CutsceneAbortError());
        }
        elapsed += dt;
        const t = Math.min(elapsed / duration, 1.0);
        
        // Smoothstep easing
        const ease = t * t * (3 - 2 * t);
        
        this.app.camera.position.lerpVectors(startPos, endPos, ease);
        
        if (t >= 1.0) {
          this.app.engine.events.off('update', onUpdate);
          resolve();
        }
      };
      this.app.engine.events.on('update', onUpdate);
    });
  }

  /** Interpolate camera rotation to look at a target */
  public async lookAt(targetPos: [number, number, number], duration: number = 1.0): Promise<void> {
    this.checkAbort();
    return new Promise((resolve, reject) => {
      let elapsed = 0;
      const startQuat = this.app.camera.quaternion.clone();
      
      // Calculate target quaternion
      const dummy = new THREE.Object3D();
      dummy.position.copy(this.app.camera.position);
      dummy.lookAt(new THREE.Vector3(...targetPos));
      const endQuat = dummy.quaternion.clone();

      const onUpdate = (dt: number) => {
        if (this.aborted) {
          this.app.engine.events.off('update', onUpdate);
          return reject(new CutsceneAbortError());
        }
        elapsed += dt;
        const t = Math.min(elapsed / duration, 1.0);
        
        const ease = t * t * (3 - 2 * t);
        this.app.camera.quaternion.slerpQuaternions(startQuat, endQuat, ease);
        
        if (t >= 1.0) {
          this.app.engine.events.off('update', onUpdate);
          resolve();
        }
      };
      this.app.engine.events.on('update', onUpdate);
    });
  }
  
  /** Play cinematic dialogue (subtitle) */
  public async showDialogue(text: string, duration: number = 2.0): Promise<void> {
    this.checkAbort();
    if (this.app.ui.showSubtitle) {
      this.app.ui.showSubtitle(text);
    }
    await this.wait(duration);
    if (this.app.ui.hideSubtitle) {
      this.app.ui.hideSubtitle();
    }
  }
  
  /** Shake the camera */
  public shakeCamera(intensity: number, duration: number, decay: number = 1.0): void {
    if (this.app.cameraController) {
      this.app.cameraController.shake({ intensity, duration, decay });
    }
  }
  
  /** Instantly flash the screen a color (e.g., "#ffffff" for lightning/damage) */
  public flashScreen(color: string = '#ffffff', durationMs: number = 500): void {
    if (this.app.ui.flash) {
      this.app.ui.flash(color, durationMs);
    }
  }
  
  /** Smoothly fade the screen to a specific opacity (0 to 1) over time */
  public async fadeScreen(targetOpacity: number, color: string = '#000000', durationMs: number = 1000): Promise<void> {
    this.checkAbort();
    if (this.app.ui.fade) {
      // Don't await directly if it might be aborted easily, but fade is UI driven.
      // We can just await the timeout via our wait function to ensure abort safety.
      this.app.ui.fade(targetOpacity, color, durationMs);
      await this.wait(durationMs / 1000);
    }
  }
}

/**
 * Orchestrator for playing Async/Await based cutscene sequences.
 */
export class CutsceneManager {
  private activeContext: CutsceneContext | null = null;
  
  constructor(private app: KairoApp) {}
  
  /**
   * Plays a cutscene script. The script should be an async function that receives the CutsceneContext.
   */
  public async play(script: (ctx: CutsceneContext) => Promise<void>): Promise<void> {
    this.stop(); // Abort any running cutscene
    this.activeContext = new CutsceneContext(this.app);
    
    // Optionally: disable player inputs here
    // this.app.input.enabled = false;
    
    try {
      await script(this.activeContext);
    } catch (e) {
      if (e instanceof CutsceneAbortError) {
        // Cutscene was skipped intentionally
        console.log('[CutsceneManager] Cutscene skipped.');
      } else {
        throw e; // Bubble up unexpected errors
      }
    } finally {
      if (this.activeContext) {
        this.activeContext.abort(); // ensure everything cleans up
        this.activeContext = null;
      }
      // Optionally: re-enable player inputs here
      // this.app.input.enabled = true;
    }
  }
  
  /**
   * Instantly aborts the currently running cutscene, triggering CutsceneAbortError 
   * to gracefully cancel all pending `await` operations.
   */
  public skip(): void {
    if (this.activeContext) {
      this.activeContext.abort();
    }
  }
  
  public stop(): void {
    this.skip();
  }
  
  public get isPlaying(): boolean {
    return this.activeContext !== null;
  }
}
