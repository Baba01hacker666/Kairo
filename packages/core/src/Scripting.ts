import * as THREE from 'three';
import type { World, EntityBuilder, EntityId } from '@kairo/ecs';

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

  // Pre-allocated vectors for frame evaluation to prevent GC spikes
  private _tempDir: THREE.Vector3 = new THREE.Vector3();
  private _evalPos1: THREE.Vector3 = new THREE.Vector3();
  private _evalPos2: THREE.Vector3 = new THREE.Vector3();
  private _evalTarget: THREE.Vector3 = new THREE.Vector3();

  private _setVector3(target: THREE.Vector3, prop: THREE.Vector3 | [number, number, number] | any): void {
    if (!prop) {
      target.set(0, 0, 0);
      return;
    }
    if (Array.isArray(prop)) {
      target.set(prop[0] ?? 0, prop[1] ?? 0, prop[2] ?? 0);
    } else if (typeof prop === 'object') {
      if ('x' in prop && typeof prop.x === 'number') {
        target.set(prop.x, prop.y ?? 0, prop.z ?? 0);
      } else if (typeof prop[0] === 'number') {
        target.set(prop[0], prop[1] ?? 0, prop[2] ?? 0);
      }
    }
  }

  public attach(object: THREE.Object3D, app?: any): void {
    this.object = object;
    this.app = app;
    if (this.object) {
      this._baseY = this.object.position?.y ?? 0;
      this._startX = this.object.position?.x ?? 0;
      if (this.object.scale) {
        this._baseScale.copy(this.object.scale);
      }
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
  public chase(targetPos: THREE.Vector3 | [number, number, number] | any, speed: number = 3.0, dt: number = 0.016): this {
    if (!this.object || !targetPos) return this;
    let tx = 0, ty = 0, tz = 0;
    if (Array.isArray(targetPos)) {
      tx = targetPos[0]; ty = targetPos[1]; tz = targetPos[2];
    } else if (typeof targetPos === 'object') {
      if ('x' in targetPos && typeof targetPos.x === 'number') {
        tx = targetPos.x; ty = targetPos.y ?? 0; tz = targetPos.z ?? 0;
      } else if (typeof targetPos[0] === 'number') {
        tx = targetPos[0]; ty = targetPos[1] ?? 0; tz = targetPos[2] ?? 0;
      }
    }

    this._tempDir.set(tx, ty, tz).sub(this.object.position).normalize();
    this.object.position.add(this._tempDir.multiplyScalar(speed * dt));
    this.object.lookAt(tx, ty, tz);

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
  public getPosition(target?: THREE.Vector3): THREE.Vector3 {
    if (!this.object) return target ? target.set(0,0,0) : new THREE.Vector3();
    return target ? target.copy(this.object.position) : this.object.position;
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

  // --- CINEMATIC SHOTS & CAMERA MOVEMENT APIS ---

  /** Hard cut shot immediately to 3D position & lookAt target */
  public cutToShot(pos: THREE.Vector3 | [number, number, number], lookAtTarget: THREE.Vector3 | [number, number, number]): this {
    if (this.app?.cameraController) {
      this._setVector3(this._evalPos1, pos);
      this._setVector3(this._evalTarget, lookAtTarget);
      this.app.cameraController.cutTo(this._evalPos1, this._evalTarget);
    }
    return this;
  }

  /** Smooth 3D panning camera shot */
  public panCamera(fromPos: THREE.Vector3 | [number, number, number], toPos: THREE.Vector3 | [number, number, number], lookAtTarget: THREE.Vector3 | [number, number, number], durationSeconds: number = 3.0): this {
    if (this.app?.cameraController) {
      this._setVector3(this._evalPos1, fromPos);
      this._setVector3(this._evalPos2, toPos);
      this._setVector3(this._evalTarget, lookAtTarget);
      this.app.cameraController.panTo(this._evalPos1, this._evalPos2, this._evalTarget, durationSeconds);
    }
    return this;
  }

  /** 360° Orbital Camera Shot around target */
  public orbitCamera(centerTarget: THREE.Vector3 | [number, number, number], radius: number = 8.0, speed: number = 1.0, durationSeconds: number = 5.0): this {
    if (this.app?.cameraController) {
      this._setVector3(this._evalTarget, centerTarget);
      this.app.cameraController.orbitShot(this._evalTarget, radius, speed, durationSeconds);
    }
    return this;
  }

  /** Hitchcock Vertigo Dolly Zoom Effect */
  public dollyZoom(targetFov: number = 30, durationSeconds: number = 2.5): this {
    if (this.app?.cameraController) {
      this.app.cameraController.dollyZoom(targetFov, durationSeconds);
    }
    return this;
  }

  /** Crane / Jib Camera Shot (Rising or Falling smoothly) */
  public craneShot(startPos: THREE.Vector3 | [number, number, number], endPos: THREE.Vector3 | [number, number, number], durationSeconds: number = 4.0): this {
    if (this.app?.cameraController) {
      this._setVector3(this._evalPos1, startPos);
      this._setVector3(this._evalPos2, endPos);
      this.app.cameraController.craneShot(this._evalPos1, this._evalPos2, durationSeconds);
    }
    return this;
  }

  /** Track / Follow target object smoothly with camera */
  public trackObject(target: THREE.Object3D | THREE.Vector3): this {
    if (this.app?.cameraController) {
      this.app.cameraController.trackObject(target);
    }
    return this;
  }

  // --- VIDEO EDITING, MULTI-TRACK KEYFRAMING & OVERLAY APIS ---

  /** Create custom multitrack video timeline with total duration */
  public createVideoTimeline(durationSeconds: number = 10.0): any {
    if (this.app?.createVideoTimeline) {
      return this.app.createVideoTimeline(durationSeconds);
    }
    return null;
  }

  /** Add keyframed camera shot clip to video timeline */
  public addCameraShot(time: number, duration: number, shotType: 'orbit' | 'pan' | 'dolly' | 'crane', config: any): this {
    if (this.app?.addCameraShot) {
      this.app.addCameraShot(time, duration, shotType, config);
    }
    return this;
  }

  /** Add image / graphic overlay clip with masking to video timeline */
  public addVideoOverlay(time: number, duration: number, url: string, maskConfig?: any): this {
    if (this.app?.addVideoOverlay) {
      this.app.addVideoOverlay(time, duration, url, maskConfig);
    }
    return this;
  }

  /** Add title card / text subtitle clip to video timeline */
  public addVideoText(time: number, duration: number, text: string): this {
    if (this.app?.addVideoText) {
      this.app.addVideoText(time, duration, text);
    }
    return this;
  }

  /** Add video transition cut to video timeline */
  public addVideoTransition(time: number, duration: number, type: 'wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch'): this {
    if (this.app?.addVideoTransition) {
      this.app.addVideoTransition(time, duration, type);
    }
    return this;
  }

  /** Add color grading preset filter to video timeline */
  public addVideoColorGrading(time: number, duration: number, preset: 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none'): this {
    if (this.app?.addVideoColorGrading) {
      this.app.addVideoColorGrading(time, duration, preset);
    }
    return this;
  }

  /** Play video editing timeline */
  public playVideoTimeline(): this {
    if (this.app?.playVideo) {
      this.app.playVideo();
    }
    return this;
  }

  /** Export video timeline to 60 FPS WebM video file */
  public async exportVideoFile(filename: string = 'kairo-video-edit.webm'): Promise<void> {
    if (this.app?.exportVideo) {
      await this.app.exportVideo(filename);
    }
  }

  /** Display image graphics, logos, or texture cutouts over 3D viewport with masking */
  public showOverlayImage(url: string, options?: any): string {
    if (this.app?.ui?.showImageOverlay) {
      return this.app.ui.showImageOverlay(url, options);
    }
    return '';
  }

  /** Remove image overlay graphic */
  public removeOverlayImage(id: string): this {
    if (this.app?.ui?.removeImageOverlay) {
      this.app.ui.removeImageOverlay(id);
    }
    return this;
  }

  /** Toggle 21:9 Widescreen Letterbox Black Bars */
  public letterbox(enabled: boolean = true, barHeightPercent: number = 10): this {
    if (this.app?.ui?.setLetterbox) {
      this.app.ui.setLetterbox(enabled, barHeightPercent);
    }
    return this;
  }

  /** Video Editing Screen Transition Cut ('wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch') */
  public async transitionCut(type: 'wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch' = 'fadeBlack', durationMs: number = 500): Promise<void> {
    if (this.app?.ui?.transitionCut) {
      await this.app.ui.transitionCut(type, durationMs);
    }
  }

  /** Apply Color Grading Preset ('cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none') */
  public setColorGrading(preset: 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none'): this {
    if (this.app?.ui?.setColorGrading) {
      this.app.ui.setColorGrading(preset);
    }
    return this;
  }

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
  },

  /**
   * One-line EasyScript entity creation helper!
   * Example: EasyScript.spawnObject(world, 'Hero', b => b.at(0, 2, 0).color('#3b82f6').spin());
   */
  spawnObject: (
    world: World,
    name: string = 'GameObject',
    configurator?: (builder: EntityBuilder) => void
  ): EntityId => {
    const builder = world.buildEntity(name);
    if (configurator) {
      configurator(builder);
    }
    return builder.build();
  }
};

