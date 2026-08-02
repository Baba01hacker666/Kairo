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

export class RenderPipeline {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.Camera;
  public postProcessing: PostProcessManager;

  public config: PostProcessingConfig = {
    bloom: false,
    bloomIntensity: 0.5,
    vignette: true,
    vignetteDarkness: 0.4,
    colorGrading: 'vibrant',
    exposure: 1.1
  };

  public metrics: RenderMetrics = {
    fps: 60,
    frameTimeMs: 16.6,
    cpuRenderMs: 2.1,
    cpuPhysicsMs: 0.5,
    cpuAiMs: 0.0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    jsHeapMb: 0
  };

  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private fpsTimer: number = 0;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.postProcessing = new PostProcessManager(this.renderer, this.scene, this.camera);

    this.setupRendererDefaults();
  }

  private setupRendererDefaults(): void {
    // Native high-resolution rendering with maximum visual crispness
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const ratio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1;
    this.renderer.setPixelRatio(ratio);

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.config.exposure;
  }

  public setToneMappingExposure(exposure: number): void {
    this.config.exposure = exposure;
    this.renderer.toneMappingExposure = exposure;
  }
  private currentSun: THREE.DirectionalLight | null = null;
  private currentAmbient: THREE.AmbientLight | null = null;

  public setupLighting(options: {
    sunPosition?: [number, number, number];
    sunColor?: number;
    sunIntensity?: number;
    ambientColor?: number;
    ambientIntensity?: number;
    shadowMapSize?: number;
  }): { sun: THREE.DirectionalLight; ambient: THREE.AmbientLight } {
    if (this.currentSun) {
      this.scene.remove(this.currentSun);
      if (this.currentSun.shadow && this.currentSun.shadow.map) {
        this.currentSun.shadow.map.dispose();
      }
    }
    if (this.currentAmbient) {
      this.scene.remove(this.currentAmbient);
    }

    const sunColor = options.sunColor ?? 0xfff5ea;
    const sunIntensity = options.sunIntensity ?? 2.5;
    const sun = new THREE.DirectionalLight(sunColor, sunIntensity);
    sun.position.set(...(options.sunPosition ?? [-15, 30, -15]));
    sun.castShadow = true;
    
    const size = options.shadowMapSize ?? 1024;
    sun.shadow.mapSize.width = size;
    sun.shadow.mapSize.height = size;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.bias = -0.0005;

    const ambientColor = options.ambientColor ?? 0xddeeff;
    const ambientIntensity = options.ambientIntensity ?? 0.8;
    const ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);

    this.scene.add(sun);
    this.scene.add(ambient);
    
    this.currentSun = sun;
    this.currentAmbient = ambient;

    return { sun, ambient };
  }

  public render(): void {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;
    this.frameCount++;
    this.fpsTimer += dt;

    if (this.fpsTimer >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / this.fpsTimer);
      this.metrics.frameTimeMs = parseFloat((1000 / this.metrics.fps).toFixed(2));
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    // Measure exact CPU render execution time
    const t0 = performance.now();
    this.postProcessing.render(dt / 1000); // Pass delta time in seconds
    this.metrics.cpuRenderMs = parseFloat((performance.now() - t0).toFixed(2));

    // Collect WebGL & JS Memory Info
    const info = this.renderer.info;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.geometries = info.memory.geometries;
    this.metrics.textures = info.memory.textures;

    if (typeof performance !== 'undefined' && (performance as any).memory) {
      this.metrics.jsHeapMb = parseFloat((((performance as any).memory.usedJSHeapSize) / (1024 * 1024)).toFixed(1));
    }
  }
}
