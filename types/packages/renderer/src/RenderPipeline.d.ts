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
    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera);
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
