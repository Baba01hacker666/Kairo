import * as THREE from 'three';
import { PostProcessManager } from './PostProcessManager.ts';
export interface CpuProfileMap {
    webGlRenderMs: number;
    physicsStepMs: number;
    sceneGraphUpdateMs: number;
    animationMs: number;
    particlesMs: number;
    aiPathfindingMs: number;
    totalCpuTimeMs: number;
    targetFrameBudgetMs: number;
    cpuHeadroomMs: number;
    cpuHeadroomPercent: string;
}
export interface RenderMetrics {
    fps: number;
    frameTimeMs: number;
    cpuRenderMs: number;
    cpuPhysicsMs: number;
    cpuAiMs: number;
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    jsHeapMb: number;
    cpuProfileMap?: CpuProfileMap;
}
export interface PostProcessingConfig {
    bloom: boolean;
    bloomIntensity: number;
    vignette: boolean;
    vignetteDarkness: number;
    colorGrading: 'none' | 'warm' | 'cool' | 'vibrant' | 'sepia';
    exposure: number;
}
export declare class RenderPipeline {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    postProcessing: PostProcessManager;
    config: PostProcessingConfig;
    metrics: RenderMetrics;
    private lastTime;
    private frameCount;
    private fpsTimer;
    private adaptiveEnabled;
    private adaptiveLevel;
    private adaptiveMaxLevel;
    private adaptiveTimer;
    private lowFpsStreak;
    private highFpsStreak;
    private readonly PIXEL_RATIO_STEPS;
    private readonly SHADOW_MAP_STEPS;
    private basePixelRatio;
    private baseShadowSize;
    private adaptiveBaseCaptured;
    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera);
    /** Enable/disable automatic resolution scaling when FPS drops. */
    setAdaptiveQuality(enabled: boolean): void;
    private evaluateAdaptiveQuality;
    private applyAdaptiveLevel;
    private setupRendererDefaults;
    setToneMappingExposure(exposure: number): void;
    private currentSun;
    private currentAmbient;
    setupLighting(options: {
        sunPosition?: [number, number, number];
        sunColor?: number;
        sunIntensity?: number;
        ambientColor?: number;
        ambientIntensity?: number;
        shadowMapSize?: number;
    }): {
        sun: THREE.DirectionalLight;
        ambient: THREE.AmbientLight;
    };
    render(): void;
}
