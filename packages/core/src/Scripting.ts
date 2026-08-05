import * as THREE from 'three';

export interface ScriptContext {
  object: THREE.Object3D;
  scene?: THREE.Scene;
  app?: any;
}

export class ScriptBehavior {
  public object!: THREE.Object3D;
  public app!: any;
  public enabled: boolean = true;
  private _customData: Record<string, any> = {};

  public attach(object: THREE.Object3D, app?: any): void {
    this.object = object;
    this.app = app;
    this.onStart();
  }

  // Lifecycle Hooks (overridden by user scripts)
  public onStart(): void {}
  public onUpdate(dt: number): void {}
  public onCollision(other: THREE.Object3D): void {}
  public onInteract(): void {}
  public onDestroy(): void {}

  // High-Level Easy Movement Helpers
  public move(dx: number, dy: number, dz: number): void {
    if (!this.object) return;
    this.object.position.x += dx;
    this.object.position.y += dy;
    this.object.position.z += dz;
  }

  public moveForward(distance: number): void {
    if (!this.object) return;
    this.object.translateZ(-distance);
  }

  public rotate(rx: number, ry: number, rz: number): void {
    if (!this.object) return;
    this.object.rotation.x += rx;
    this.object.rotation.y += ry;
    this.object.rotation.z += rz;
  }

  public lookAt(target: THREE.Vector3 | [number, number, number]): void {
    if (!this.object) return;
    if (Array.isArray(target)) {
      this.object.lookAt(target[0], target[1], target[2]);
    } else {
      this.object.lookAt(target);
    }
  }

  public setPosition(x: number, y: number, z: number): void {
    if (!this.object) return;
    this.object.position.set(x, y, z);
  }

  public getPosition(): THREE.Vector3 {
    return this.object ? this.object.position : new THREE.Vector3();
  }

  public getDistanceTo(other: THREE.Object3D | THREE.Vector3): number {
    if (!this.object) return 0;
    const pos = 'position' in other ? (other as THREE.Object3D).position : other;
    return this.object.position.distanceTo(pos);
  }

  // Visual Effects & Sound Helpers
  public playSound(soundName: string): void {
    if (this.app?.audio) {
      this.app.audio.playSynthesizedSound(soundName);
    }
  }

  public emitParticles(type: 'sparkle' | 'dust_footstep' | 'explosion' | 'collect_burst' = 'sparkle', count: number = 20): void {
    if (this.app?.particleSys) {
      this.app.particleSys.emitBurst(this.object.position, type, count);
    }
  }

  public showToast(message: string, durationMs: number = 2000, type: 'info' | 'success' | 'warning' = 'info'): void {
    if (this.app?.ui) {
      this.app.ui.showToast(message, durationMs, type);
    }
  }

  public destroy(): void {
    this.onDestroy();
    if (this.object?.parent) {
      this.object.parent.remove(this.object);
    }
  }

  // Easy State Store
  public set(key: string, value: any): void {
    this._customData[key] = value;
  }

  public get<T = any>(key: string, defaultValue?: T): T {
    return this._customData[key] ?? defaultValue;
  }
}

export class ScriptRunner {
  private scripts: ScriptBehavior[] = [];

  public add(script: ScriptBehavior, object: THREE.Object3D, app?: any): void {
    script.attach(object, app);
    this.scripts.push(script);
  }

  public remove(script: ScriptBehavior): void {
    const idx = this.scripts.indexOf(script);
    if (idx !== -1) {
      this.scripts[idx].onDestroy();
      this.scripts.splice(idx, 1);
    }
  }

  public update(dt: number): void {
    for (let i = 0; i < this.scripts.length; i++) {
      const script = this.scripts[i];
      if (script.enabled) {
        script.onUpdate(dt);
      }
    }
  }

  public clear(): void {
    this.scripts.forEach(s => s.onDestroy());
    this.scripts = [];
  }
}

export const EasyScript = {
  createBehavior: (hooks: {
    onStart?: (this: ScriptBehavior) => void;
    onUpdate?: (this: ScriptBehavior, dt: number) => void;
    onInteract?: (this: ScriptBehavior) => void;
    onCollision?: (this: ScriptBehavior, other: THREE.Object3D) => void;
  }): ScriptBehavior => {
    const instance = new ScriptBehavior();
    if (hooks.onStart) instance.onStart = hooks.onStart.bind(instance);
    if (hooks.onUpdate) instance.onUpdate = hooks.onUpdate.bind(instance);
    if (hooks.onInteract) instance.onInteract = hooks.onInteract.bind(instance);
    if (hooks.onCollision) instance.onCollision = hooks.onCollision.bind(instance);
    return instance;
  }
};
