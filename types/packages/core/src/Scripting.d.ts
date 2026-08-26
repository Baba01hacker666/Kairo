import * as THREE from 'three';
import type { World, EntityBuilder, EntityId } from '@kairo/ecs';
export interface ScriptContext {
    object: THREE.Object3D;
    scene?: THREE.Scene;
    app?: any;
}
export declare class ScriptBehavior {
    object: THREE.Object3D;
    app: any;
    enabled: boolean;
    private _isSpinning;
    private _spinSpeed;
    private _isBobbing;
    private _bobAmount;
    private _bobSpeed;
    private _baseY;
    private _bobTimer;
    private _isPatrolling;
    private _patrolDistance;
    private _patrolSpeed;
    private _patrolDir;
    private _startX;
    private _isPulsing;
    private _pulseMin;
    private _pulseMax;
    private _pulseSpeed;
    private _pulseTimer;
    private _baseScale;
    private _isJumping;
    private _jumpVelocity;
    private _groundY;
    private _customData;
    private _tempDir;
    private _evalPos1;
    private _evalPos2;
    private _evalTarget;
    private _setVector3;
    attach(object: THREE.Object3D, app?: any): void;
    onStart(): void;
    onUpdate(dt: number): void;
    onCollision(other: THREE.Object3D): void;
    onInteract(): void;
    onDestroy(): void;
    _internalTick(dt: number): void;
    /** Spin the 3D object continuously around Y axis */
    spin(speed?: number): this;
    /** Gently bob the 3D object up and down */
    bob(amount?: number, speed?: number): this;
    /** Patrol back and forth along X axis */
    patrol(distance?: number, speed?: number): this;
    /** Rhythmically pulse / scale object size */
    pulse(minScale?: number, maxScale?: number, speed?: number): this;
    /** Make object jump into the air */
    jump(force?: number): this;
    /** Stop all automatic motion behaviors */
    stop(): this;
    /** Move relative by (dx, dy, dz) */
    move(dx: number, dy: number, dz: number): this;
    /** Move forward in facing direction */
    moveForward(distance: number): this;
    /** Move backward */
    moveBackward(distance: number): this;
    /** Move Left along X axis */
    moveLeft(distance: number): this;
    /** Move Right along X axis */
    moveRight(distance: number): this;
    /** Move Up along Y axis */
    moveUp(distance: number): this;
    /** Move Down along Y axis */
    moveDown(distance: number): this;
    /** Turn / rotate Left by degrees */
    turnLeft(degrees?: number): this;
    /** Turn / rotate Right by degrees */
    turnRight(degrees?: number): this;
    /** Rotate by radians (rx, ry, rz) */
    rotate(rx: number, ry: number, rz: number): this;
    /** Smoothly chase / move towards a target 3D position */
    chase(targetPos: THREE.Vector3 | [number, number, number] | any, speed?: number, dt?: number): this;
    /** AI Pathfinding Navigation towards target */
    navigateTo(targetPos: THREE.Vector3 | [number, number, number], speed?: number, dt?: number): this;
    /** Change object position */
    setPosition(x: number, y: number, z: number): this;
    /** Get current 3D position vector */
    getPosition(target?: THREE.Vector3): THREE.Vector3;
    /** Distance to another object or vector */
    getDistanceTo(other: THREE.Object3D | THREE.Vector3): number;
    /** Check if near another object */
    isNear(other: THREE.Object3D | THREE.Vector3, maxDistance?: number): boolean;
    /** Hard cut shot immediately to 3D position & lookAt target */
    cutToShot(pos: THREE.Vector3 | [number, number, number], lookAtTarget: THREE.Vector3 | [number, number, number]): this;
    /** Smooth 3D panning camera shot */
    panCamera(fromPos: THREE.Vector3 | [number, number, number], toPos: THREE.Vector3 | [number, number, number], lookAtTarget: THREE.Vector3 | [number, number, number], durationSeconds?: number): this;
    /** 360° Orbital Camera Shot around target */
    orbitCamera(centerTarget: THREE.Vector3 | [number, number, number], radius?: number, speed?: number, durationSeconds?: number): this;
    /** Hitchcock Vertigo Dolly Zoom Effect */
    dollyZoom(targetFov?: number, durationSeconds?: number): this;
    /** Crane / Jib Camera Shot (Rising or Falling smoothly) */
    craneShot(startPos: THREE.Vector3 | [number, number, number], endPos: THREE.Vector3 | [number, number, number], durationSeconds?: number): this;
    /** Track / Follow target object smoothly with camera */
    trackObject(target: THREE.Object3D | THREE.Vector3): this;
    /** Create custom multitrack video timeline with total duration */
    createVideoTimeline(durationSeconds?: number): any;
    /** Add keyframed camera shot clip to video timeline */
    addCameraShot(time: number, duration: number, shotType: 'orbit' | 'pan' | 'dolly' | 'crane', config: any): this;
    /** Add image / graphic overlay clip with masking to video timeline */
    addVideoOverlay(time: number, duration: number, url: string, maskConfig?: any): this;
    /** Add title card / text subtitle clip to video timeline */
    addVideoText(time: number, duration: number, text: string): this;
    /** Add video transition cut to video timeline */
    addVideoTransition(time: number, duration: number, type: 'wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch'): this;
    /** Add color grading preset filter to video timeline */
    addVideoColorGrading(time: number, duration: number, preset: 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none'): this;
    /** Play video editing timeline */
    playVideoTimeline(): this;
    /** Export video timeline to 60 FPS WebM video file */
    exportVideoFile(filename?: string): Promise<void>;
    /** Display image graphics, logos, or texture cutouts over 3D viewport with masking */
    showOverlayImage(url: string, options?: any): string;
    /** Remove image overlay graphic */
    removeOverlayImage(id: string): this;
    /** Toggle 21:9 Widescreen Letterbox Black Bars */
    letterbox(enabled?: boolean, barHeightPercent?: number): this;
    /** Video Editing Screen Transition Cut ('wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch') */
    transitionCut(type?: 'wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch', durationMs?: number): Promise<void>;
    /** Apply Color Grading Preset ('cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none') */
    setColorGrading(preset: 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none'): this;
    /** Trigger camera shake effect */
    shakeCamera(intensity?: number, duration?: number): this;
    /** Set camera distance behind character */
    setCameraDistance(distance: number): this;
    /** Show interactive dialogue modal UI */
    showModal(title: string, content: string, buttons?: Array<{
        text: string;
        primary?: boolean;
        onClick?: () => void;
    }>): this;
    /** Take 60 FPS WebGL screenshot */
    takeScreenshot(): void;
    /** Record WebGL video clip */
    recordVideo(seconds?: number): Promise<void>;
    /** Trigger character skeletal animation state ('Idle' | 'Walk' | 'Run' | 'Jump') */
    playAnimation(stateName: string, fadeDuration?: number): this;
    /** Adjust Inverse Kinematics (IK) foot elevation */
    setIKHeight(height: number): this;
    /** Stream 3D model directly from Sketchfab URL or UID */
    streamSketchfab(urlOrUid: string): Promise<THREE.Object3D | null>;
    /** Load Blender .blend file */
    loadBlenderModel(blendUrl: string): Promise<THREE.Object3D | null>;
    /** Broadcast state replication over network */
    syncState(stateData: Record<string, any>): this;
    /** Send Remote Procedure Call (RPC) */
    sendRPC(name: string, payload: any): this;
    /** Change object color */
    changeColor(colorHex: number | string): this;
    /** Set random bright neon color */
    randomColor(): this;
    /** Hide object */
    hide(): this;
    /** Show object */
    show(): this;
    /** Show friendly pop-up toast */
    say(message: string, durationMs?: number, type?: 'info' | 'success' | 'warning'): this;
    /** Play sound effect */
    playSound(soundName: string): this;
    /** Spawn sparkle particles */
    sparkle(count?: number): this;
    /** Spawn explosion particles */
    explode(count?: number): this;
    /** Spawn dust footstep particles */
    dustBurst(count?: number): this;
    /** Spawn teleporter warp effect */
    teleportEffect(): this;
    /** Destroy object */
    destroy(): void;
    set(key: string, value: any): void;
    get<T = any>(key: string, defaultValue?: T): T;
}
export declare class ScriptRunner {
    private scripts;
    add(script: ScriptBehavior, object: THREE.Object3D, app?: any): void;
    remove(script: ScriptBehavior): void;
    update(dt: number): void;
    clear(): void;
}
export declare const EasyScript: {
    createBehavior: (hooks: {
        onStart?: (this: ScriptBehavior) => void;
        onUpdate?: (this: ScriptBehavior, dt: number) => void;
        onInteract?: (this: ScriptBehavior) => void;
        onCollision?: (this: ScriptBehavior, other: THREE.Object3D) => void;
    }) => ScriptBehavior;
    /**
     * One-line EasyScript entity creation helper!
     * Example: EasyScript.spawnObject(world, 'Hero', b => b.at(0, 2, 0).color('#3b82f6').spin());
     */
    spawnObject: (world: World, name?: string, configurator?: (builder: EntityBuilder) => void) => EntityId;
};
