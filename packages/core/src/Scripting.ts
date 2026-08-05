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

  // Built-in Motion Modes (No manual math required!)
  private _isSpinning: boolean = false;
  private _spinSpeed: number = 1.5;

  private _isBobbing: boolean = false;
  private _bobAmount: number = 0.25;
  private _bobSpeed: number = 3.0;
  private _baseY: number | null = null;
  private _bobTimer: number = 0;

  private _isPatrolling: boolean = false;
  private _patrolDistance: number = 4.0;
  private _patrolSpeed: number = 2.5;
  private _patrolDir: number = 1;
  private _startX: number | null = null;

  private _isPulsing: boolean = false;
  private _pulseMin: number = 0.8;
  private _pulseMax: number = 1.2;
  private _pulseSpeed: number = 4.0;
  private _pulseTimer: number = 0;
  private _baseScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  private _isJumping: boolean = false;
  private _jumpVelocity: number = 0;
  private _groundY: number = 0;

  private _customData: Record<string, any> = {};

  public attach(object: THREE.Object3D, app?: any): void {
    this.object = object;
    this.app = app;
    if (this.object) {
      this._baseY = this.object.position.y;
      this._startX = this.object.position.x;
      this._baseScale.copy(this.object.scale);
    }
    this.onStart();
  }

  // Lifecycle Hooks
  public onStart(): void {}
  public onUpdate(dt: number): void {}
  public onCollision(other: THREE.Object3D): void {}
  public onInteract(): void {}
  public onDestroy(): void {}

  // Internal tick running built-in motion presets automatically
  public _internalTick(dt: number): void {
    if (!this.enabled || !this.object) return;

    if (this._baseY === null) this._baseY = this.object.position.y;
    if (this._startX === null) this._startX = this.object.position.x;

    if (this._isSpinning) {
      this.object.rotation.y += this._spinSpeed * dt;
    }

    if (this._isBobbing && !this._isJumping) {
      this._bobTimer += dt * this._bobSpeed;
      this.object.position.y = this._baseY + Math.sin(this._bobTimer) * this._bobAmount;
    }

    if (this._isPatrolling) {
      this.object.position.x += this._patrolDir * this._patrolSpeed * dt;
      if (Math.abs(this.object.position.x - this._startX) > this._patrolDistance) {
        this._patrolDir = -this._patrolDir;
      }
    }

    if (this._isPulsing) {
      this._pulseTimer += dt * this._pulseSpeed;
      const s = this._pulseMin + (Math.sin(this._pulseTimer) * 0.5 + 0.5) * (this._pulseMax - this._pulseMin);
      this.object.scale.set(this._baseScale.x * s, this._baseScale.y * s, this._baseScale.z * s);
    }

    if (this._isJumping) {
      this.object.position.y += this._jumpVelocity * dt;
      this._jumpVelocity -= 18 * dt; // Gravity
      if (this.object.position.y <= this._groundY) {
        this.object.position.y = this._groundY;
        this._isJumping = false;
        this.dustBurst(12);
      }
    }

    this.onUpdate(dt);
  }

  // --- ULTRA-SIMPLE EASY MOTION COMMANDS ---

  /** Spin the 3D object continuously around Y axis */
  public spin(speed: number = 1.5): this {
    this._isSpinning = true;
    this._spinSpeed = speed;
    return this;
  }

  /** Gently bob the 3D object up and down */
  public bob(amount: number = 0.25, speed: number = 3.0): this {
    this._isBobbing = true;
    this._bobAmount = amount;
    this._bobSpeed = speed;
    return this;
  }

  /** Patrol back and forth along X axis */
  public patrol(distance: number = 4.0, speed: number = 2.5): this {
    this._isPatrolling = true;
    this._patrolDistance = distance;
    this._patrolSpeed = speed;
    return this;
  }

  /** Rhythmically pulse / scale object size */
  public pulse(minScale: number = 0.85, maxScale: number = 1.2, speed: number = 4.0): this {
    this._isPulsing = true;
    this._pulseMin = minScale;
    this._pulseMax = maxScale;
    this._pulseSpeed = speed;
    return this;
  }

  /** Make object jump into the air */
  public jump(force: number = 7.0): this {
    if (!this.object) return this;
    if (!this._isJumping) {
      this._groundY = this._baseY ?? this.object.position.y;
      this._jumpVelocity = force;
      this._isJumping = true;
      this.playSound('jump');
    }
    return this;
  }

  /** Stop all automatic motion behaviors */
  public stop(): this {
    this._isSpinning = false;
    this._isBobbing = false;
    this._isPatrolling = false;
    this._isPulsing = false;
    return this;
  }

  // --- EASY DIRECTIONAL MOVEMENT HELPERS ---

  /** Move relative by (dx, dy, dz) */
  public move(dx: number, dy: number, dz: number): this {
    if (this.object) {
      this.object.position.x += dx;
      this.object.position.y += dy;
      this.object.position.z += dz;
    }
    return this;
  }

  /** Move forward in facing direction */
  public moveForward(distance: number): this {
    if (this.object) this.object.translateZ(-distance);
    return this;
  }

  /** Move backward */
  public moveBackward(distance: number): this {
    if (this.object) this.object.translateZ(distance);
    return this;
  }

  /** Move Left along X axis */
  public moveLeft(distance: number): this {
    return this.move(-distance, 0, 0);
  }

  /** Move Right along X axis */
  public moveRight(distance: number): this {
    return this.move(distance, 0, 0);
  }

  /** Move Up along Y axis */
  public moveUp(distance: number): this {
    return this.move(0, distance, 0);
  }

  /** Move Down along Y axis */
  public moveDown(distance: number): this {
    return this.move(0, -distance, 0);
  }

  /** Turn / rotate Left by degrees */
  public turnLeft(degrees: number = 45): this {
    return this.rotate(0, (degrees * Math.PI) / 180, 0);
  }

  /** Turn / rotate Right by degrees */
  public turnRight(degrees: number = 45): this {
    return this.rotate(0, (-degrees * Math.PI) / 180, 0);
  }

  /** Rotate by radians (rx, ry, rz) */
  public rotate(rx: number, ry: number, rz: number): this {
    if (this.object) {
      this.object.rotation.x += rx;
      this.object.rotation.y += ry;
      this.object.rotation.z += rz;
    }
    return this;
  }

  /** Smoothly chase / move towards a target 3D position */
  public chase(targetPos: THREE.Vector3 | [number, number, number], speed: number = 3.0, dt: number = 0.016): this {
    if (!this.object) return this;
    const target = Array.isArray(targetPos) ? new THREE.Vector3(...targetPos) : targetPos;
    const dir = target.clone().sub(this.object.position).normalize();
    this.object.position.add(dir.multiplyScalar(speed * dt));
    this.object.lookAt(target);
    return this;
  }

  /** AI Pathfinding Navigation towards target */
  public navigateTo(targetPos: THREE.Vector3 | [number, number, number], speed: number = 3.0, dt: number = 0.016): this {
    return this.chase(targetPos, speed, dt);
  }

  /** Change object position */
  public setPosition(x: number, y: number, z: number): this {
    if (this.object) this.object.position.set(x, y, z);
    return this;
  }

  /** Get current 3D position vector */
  public getPosition(): THREE.Vector3 {
    return this.object ? this.object.position : new THREE.Vector3();
  }

  /** Distance to another object or vector */
  public getDistanceTo(other: THREE.Object3D | THREE.Vector3): number {
    if (!this.object) return 0;
    const pos = 'position' in other ? (other as THREE.Object3D).position : other;
    return this.object.position.distanceTo(pos);
  }

  /** Check if near another object */
  public isNear(other: THREE.Object3D | THREE.Vector3, maxDistance: number = 2.0): boolean {
    return this.getDistanceTo(other) <= maxDistance;
  }

  // --- CAMERA, UI & TOOLS ENGINE APIS ---

  /** Trigger camera shake effect */
  public shakeCamera(intensity: number = 0.4, duration: number = 0.3): this {
    if (this.app?.cameraController) {
      this.app.cameraController.shake({ intensity, duration });
    }
    return this;
  }

  /** Set camera distance behind character */
  public setCameraDistance(distance: number): this {
    if (this.app?.cameraController) {
      this.app.cameraController.distance = distance;
    }
    return this;
  }

  /** Show interactive dialogue modal UI */
  public showModal(title: string, content: string, buttons?: Array<{ text: string; primary?: boolean; onClick?: () => void }>): this {
    if (this.app?.ui) {
      this.app.ui.createModal(title, content, buttons || [{ text: 'OK', primary: true, onClick: () => {} }]);
    }
    return this;
  }

  /** Take 60 FPS WebGL screenshot */
  public takeScreenshot(): void {
    if (this.app?.takeScreenshot) {
      this.app.takeScreenshot();
    }
  }

  /** Record WebGL video clip */
  public async recordVideo(seconds: number = 5): Promise<void> {
    if (this.app?.startRecording && this.app?.stopRecording) {
      this.app.startRecording(60);
      setTimeout(async () => {
        await this.app.stopRecording(`easyscript-clip-${Date.now()}.webm`);
      }, seconds * 1000);
    }
  }

  // --- ANIMATION & IK SKELETAL APIS ---

  /** Trigger character skeletal animation state ('Idle' | 'Walk' | 'Run' | 'Jump') */
  public playAnimation(stateName: string, fadeDuration: number = 0.2): this {
    if (this.app?.animStateMachine) {
      this.app.animStateMachine.setState(stateName, fadeDuration);
    }
    return this;
  }

  /** Adjust Inverse Kinematics (IK) foot elevation */
  public setIKHeight(height: number): this {
    if (this.app?.state) {
      this.app.state.ikTargetHeight = height;
    }
    return this;
  }

  // --- 3D ASSETS, SKETCHFAB & BLENDER APIS ---

  /** Stream 3D model directly from Sketchfab URL or UID */
  public async streamSketchfab(urlOrUid: string): Promise<THREE.Object3D | null> {
    if (this.app?.assets) {
      return this.app.assets.streamSketchfabModel(urlOrUid);
    }
    return null;
  }

  /** Load Blender .blend file */
  public async loadBlenderModel(blendUrl: string): Promise<THREE.Object3D | null> {
    if (this.app?.assets) {
      return this.app.assets.loadModel(blendUrl);
    }
    return null;
  }

  // --- MULTIPLAYER NETWORK REPLICATION APIS ---

  /** Broadcast state replication over network */
  public syncState(stateData: Record<string, any>): this {
    if (this.app?.network) {
      this.app.network.broadcastState(stateData);
    }
    return this;
  }

  /** Send Remote Procedure Call (RPC) */
  public sendRPC(name: string, payload: any): this {
    if (this.app?.network) {
      this.app.network.sendRPC(name, payload);
    }
    return this;
  }

  // --- VISUAL & AUDIO HELPERS ---

  /** Change object color */
  public changeColor(colorHex: number | string): this {
    if (this.object) {
      this.object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(colorHex as any);
        }
      });
    }
    return this;
  }

  /** Set random bright neon color */
  public randomColor(): this {
    const colors = [0x10b981, 0x3b82f6, 0xef4444, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x06b6d4];
    return this.changeColor(colors[Math.floor(Math.random() * colors.length)]);
  }

  /** Hide object */
  public hide(): this {
    if (this.object) this.object.visible = false;
    return this;
  }

  /** Show object */
  public show(): this {
    if (this.object) this.object.visible = true;
    return this;
  }

  /** Show friendly pop-up toast */
  public say(message: string, durationMs: number = 2000, type: 'info' | 'success' | 'warning' = 'info'): this {
    if (this.app?.ui) {
      this.app.ui.showToast(message, durationMs, type);
    }
    return this;
  }

  /** Play sound effect */
  public playSound(soundName: string): this {
    if (this.app?.audio) {
      this.app.audio.playSynthesizedSound(soundName);
    }
    return this;
  }

  /** Spawn sparkle particles */
  public sparkle(count: number = 25): this {
    if (this.app?.particleSys && this.object) {
      this.app.particleSys.emitBurst(this.object.position, 'sparkle', count);
    }
    return this;
  }

  /** Spawn explosion particles */
  public explode(count: number = 40): this {
    if (this.app?.particleSys && this.object) {
      this.app.particleSys.emitBurst(this.object.position, 'explosion', count);
    }
    return this;
  }

  /** Spawn dust footstep particles */
  public dustBurst(count: number = 15): this {
    if (this.app?.particleSys && this.object) {
      this.app.particleSys.emitBurst(this.object.position, 'dust_footstep', count);
    }
    return this;
  }

  /** Spawn teleporter warp effect */
  public teleportEffect(): this {
    if (this.app?.particleSys && this.object) {
      this.app.particleSys.emitBurst(this.object.position, 'teleport_flash', 35);
      this.playSound('teleport');
    }
    return this;
  }

  /** Destroy object */
  public destroy(): void {
    this.onDestroy();
    if (this.object?.parent) {
      this.object.parent.remove(this.object);
    }
  }

  // --- EASY STATE DATA STORE ---
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
        script._internalTick(dt);
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
