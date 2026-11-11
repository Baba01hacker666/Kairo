import * as THREE from 'three';
import { Engine } from './Engine.js';
import { World, EntityHandle } from '../../ecs/src/index.js';
import { PhysicsWorld, RigidBody, Collider } from '../../physics/src/index.js';
import { CameraController, RenderPipeline, CpuProfileMap } from '../../renderer/src/index.js';
import { InputManager } from '../../input/src/index.js';
import { AudioManager } from '../../audio/src/index.js';
import { UIManager } from '../../ui/src/index.js';
import { DebugInspector, ScreenRecorder, DebugRenderer, VideoTimeline, GameBugDetector } from '../../tools/src/index.js';
import { SaveSystem } from './SaveSystem.js';
import { SceneManager } from './SceneManager.js';
import { CutsceneManager } from './Cutscene.js';
import { QuestSystem } from './QuestSystem.js';
import { DialogueSystem } from './DialogueSystem.js';
import { CombatSystem } from './Combat.js';
import { TweenManager } from './Tween.js';
import { CameraFX } from './CameraFX.js';
import { InventorySystem } from './Inventory.js';
import { TextManager } from './TextManager.js';
import { VoiceManager } from '../../audio/src/index.js';
import { AssetManager } from '../../assets/src/index.js';
import * as BABYLON from '@babylonjs/core';
export interface KairoAppConfig {
    canvas?: HTMLCanvasElement | string;
    background?: string | number;
    gravity?: [number, number, number];
    shadows?: boolean;
    fogColor?: number | string;
    fogNear?: number;
    fogFar?: number;
    gameId?: string;
    mode?: '2d' | '3d';
    pixelArt?: boolean;
    orthoScale?: number;
    enableBabylon?: boolean;
    rendererBackend?: 'webgl' | 'webgpu';
    /** Auto-tune resolution & shadow quality to hold a smooth frame rate (default: true). */
    adaptiveQuality?: boolean;
}
/**
 * Modern High-Level Production Game Engine Wrapper
 * Manages Rendering, Camera, Physics, Input, Audio, UI, Profiler, ScreenRecorder, and Scene Lifecycle.
 */
export declare class KairoApp {
    engine: Engine;
    world: World;
    physics: PhysicsWorld;
    scene: THREE.Scene;
    camera: THREE.Camera;
    cameraController: CameraController;
    config: KairoAppConfig;
    renderer: THREE.WebGLRenderer;
    pipeline: RenderPipeline;
    screenRecorder: ScreenRecorder;
    save: SaveSystem;
    scenes: SceneManager;
    cutscene: CutsceneManager;
    assets: AssetManager;
    babylonEngine?: any;
    babylonScene?: BABYLON.Scene;
    babylonCanvas?: HTMLCanvasElement;
    input: InputManager;
    audio: AudioManager;
    ui: UIManager;
    debug: DebugInspector;
    debugRenderer: DebugRenderer;
    videoTimeline: VideoTimeline;
    bugDetector: GameBugDetector;
    quests: QuestSystem;
    dialogue: DialogueSystem;
    combat: CombatSystem;
    tweens: TweenManager;
    cameraFX: CameraFX;
    inventory: InventorySystem;
    text: TextManager;
    voices: VoiceManager;
    private sceneObstacles;
    constructor(config?: KairoAppConfig | string);
    /** Native mobile touch joystick & action buttons helper */
    mobileControls(): this;
    registerObstacle(object: THREE.Object3D): void;
    createEntity(name?: string): EntityHandle;
    createSharedContext(id: string, properties: Record<string, any>): import("../../ecs/src/index.js").SharedEntityContext<Record<string, any>>;
    createEntityWithSharedContext(contextId: string, name?: string): EntityHandle;
    audit(): import("../../tools/src/index.js").BugAuditReport;
    runFuzzTest(durationSeconds?: number): Promise<import("../../tools/src/index.js").FuzzTestResult>;
    toggleBugInspector(): void;
    clearObstacles(): void;
    setLighting(options: {
        sunPosition?: [number, number, number];
        sunColor?: number;
        sunIntensity?: number;
        ambientColor?: number;
        ambientIntensity?: number;
        ambient?: number | string;
    }): {
        sun: THREE.DirectionalLight;
        ambient: THREE.AmbientLight;
    };
    isKeyDown(code: string): boolean;
    animate(target: any, keyframes: any, options?: any): any;
    onUpdate(callback: (dt: number) => void): void;
    onRender(callback: () => void): void;
    createProceduralTerrain(options: any): import("../../geometry/src/index.js").TerrainResult;
    start(): Promise<void>;
    stop(): void;
    /**
     * Helper to quickly spawn a physically simulated box
     */
    createBox(opts: {
        size?: [number, number, number];
        position?: [number, number, number];
        color?: number | string;
        physics?: 'static' | 'dynamic';
        mass?: number;
        roughness?: number;
        metalness?: number;
    }): {
        mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>;
        rb: RigidBody;
        col: Collider;
        dispose: () => void;
    } | {
        mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>;
        rb?: undefined;
        col?: undefined;
        dispose?: undefined;
    };
    /**
     * Make any THREE mesh physical (solid by default): derives a collider from
     * its geometry, registers a rigid body, and syncs the cannon body back to
     * the mesh every frame. Pass-through is the explicit opt-out — skip this
     * call (or set a custom collision layer) and the mesh stays ghosted.
     */
    attachPhysics(mesh: THREE.Object3D, opts?: {
        type?: 'static' | 'dynamic';
        mass?: number;
        colliderType?: 'box' | 'sphere' | 'capsule';
        size?: [number, number, number];
        addToScene?: boolean;
        castShadow?: boolean;
    }): {
        mesh: THREE.Object3D<THREE.Object3DEventMap>;
        rb: RigidBody;
        collider: Collider;
        dispose: () => void;
    };
    /**
     * Helper to spawn a physically simulated box in BABYLON.js, synced to the Cannon.js physics engine just like Three.js
     */
    createBabylonBox(opts: {
        name?: string;
        size?: [number, number, number];
        position?: [number, number, number];
        color?: [number, number, number];
        physics?: 'static' | 'dynamic';
        mass?: number;
    }): {
        mesh: BABYLON.Mesh;
        rb: RigidBody;
        col: Collider;
        dispose: () => void;
    } | {
        mesh: BABYLON.Mesh;
        dispose: () => void;
        rb?: undefined;
        col?: undefined;
    };
    /**
     * Set a 2D Background Image
     */
    setBackgroundImage(url: string, pixelArt?: boolean): void;
    /**
     * Helper to spawn a 2D textured block/sprite
     */
    createBlock2D(opts: {
        size?: [number, number];
        position?: [number, number, number];
        textureUrl?: string;
        color?: number | string;
        pixelArt?: boolean;
        billboard?: boolean;
        physics?: 'static' | 'dynamic';
        mass?: number;
        lockZAxis?: boolean;
        fixedRotation?: boolean;
    }): {
        mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.Material<THREE.MaterialEventMap>, THREE.Object3DEventMap>;
        rb: RigidBody;
        col: Collider;
        dispose: () => void;
    } | {
        mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.Material<THREE.MaterialEventMap>, THREE.Object3DEventMap>;
        dispose: () => void;
        rb?: undefined;
        col?: undefined;
    };
    /**
     * Print text dynamically into the 3D scene using high-res Canvas textures.
     * Supports any CSS font, colors, and dynamic updating.
     */
    createText3D(opts: {
        text: string;
        position?: [number, number, number];
        font?: string;
        color?: string;
        size?: number;
        billboard?: boolean;
        align?: 'left' | 'center' | 'right';
    }): {
        mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
        setText: (newText: string) => void;
        dispose: () => void;
    };
    /**
     * Capture instant high-res WebGL canvas screenshot
     */
    captureScreenshot(filename?: string): string;
    /**
     * Start 60 FPS video recording of WebGL canvas stream
     */
    startRecording(fps?: number): boolean;
    /**
     * Stop video recording and download video file
     */
    stopRecording(filename?: string): Promise<Blob | null>;
    /**
     * Generate Real-Time CPU Execution Profile Map
     */
    getCpuProfileMap(): CpuProfileMap;
    /**
     * Generate & Export Complete Engine Memory Map & CPU Profile Dump
     */
    getMemoryMapDump(): {
        timestamp: string;
        metrics: any;
        cpuProfileMap: CpuProfileMap;
        gpuMemory: {
            geometries: number;
            textures: number;
            estimatedVramBytes: number;
            estimatedVramMb: string;
        };
        jsHeap: {
            usedHeapBytes: number;
            totalHeapBytes: number;
            heapLimitBytes: number;
            usedHeapMb: string;
        };
        sceneGraph: {
            totalNodes: number;
            meshesCount: number;
            instancedMeshesCount: number;
            lightsCount: number;
        };
        memoryMapBreakdown: Array<{
            subsystem: string;
            description: string;
            bytes: number;
            formatted: string;
        }>;
    };
    /** Create custom multitrack video timeline with duration */
    createVideoTimeline(durationSeconds?: number): VideoTimeline;
    /** Add keyframed camera shot clip to video timeline */
    addCameraShot(time: number, duration: number, shotType: 'orbit' | 'pan' | 'dolly' | 'crane', config: any): void;
    /** Add image / graphic overlay clip with masking to video timeline */
    addVideoOverlay(time: number, duration: number, url: string, maskConfig?: any): void;
    /** Add text / title subtitle clip to video timeline */
    addVideoText(time: number, duration: number, text: string): void;
    /** Add video transition cut to video timeline */
    addVideoTransition(time: number, duration: number, transitionType: 'wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch'): void;
    /** Add color grading preset filter to video timeline */
    addVideoColorGrading(time: number, duration: number, preset: 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none'): void;
    /** Play active video timeline */
    playVideo(): void;
    /** Pause active video timeline */
    pauseVideo(): void;
    /** Seek video timeline playhead */
    seekVideo(timeSeconds: number): void;
    /** Export video timeline as WebM video file */
    exportVideo(filename?: string): Promise<void>;
}
