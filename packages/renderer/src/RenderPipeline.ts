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

  // --- Adaptive Quality: automatically trades resolution for frame rate ---
  // When the frame budget is blown (heavy terrain/shadow scenes on weak GPUs),
  // we step the render scale + shadow map size down so the game stays smooth;
  // when headroom returns we step back up. This keeps "no lag" without the
  // developer having to pick a fixed quality tier.
  private adaptiveEnabled: boolean = true;
  private adaptiveLevel: number = 0; // 0 = best quality
  private adaptiveMaxLevel: number = 3;
  private adaptiveTimer: number = 0;
  private lowFpsStreak: number = 0;
  private highFpsStreak: number = 0;
  private readonly PIXEL_RATIO_STEPS = [1.0, 0.85, 0.72, 0.6];
  private readonly SHADOW_MAP_STEPS = [1.0, 0.75, 0.5, 0.35];
  private basePixelRatio: number = 0; // captured from the app's configured ratio
  private baseShadowSize: number = 1024;
  private adaptiveBaseCaptured: boolean = false;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.postProcessing = new PostProcessManager(this.renderer, this.scene, this.camera);

    this.setupRendererDefaults();
  }

  /** Enable/disable automatic resolution scaling when FPS drops. */
  public setAdaptiveQuality(enabled: boolean): void {
    this.adaptiveEnabled = enabled;
    this.adaptiveLevel = 0;
    this.lowFpsStreak = 0;
    this.highFpsStreak = 0;
  }

  private evaluateAdaptiveQuality(dtMs: number): void {
    if (!this.adaptiveEnabled) return;

    // Evaluate once per second (after metrics.fps has been refreshed)
    this.adaptiveTimer += dtMs;
    if (this.adaptiveTimer < 1000) return;
    this.adaptiveTimer = 0;

    const fps = this.metrics.fps;
    if (fps <= 0) return;

    // Capture the app's configured pixel ratio on first use (level 0 = as-is)
    if (!this.adaptiveBaseCaptured) {
      this.adaptiveBaseCaptured = true;
      this.basePixelRatio = this.renderer.getPixelRatio() || 1;
      this.baseShadowSize = this.currentSun?.shadow?.mapSize?.width ?? 1024;
    }

    if (fps < 45) {
      this.lowFpsStreak++;
      this.highFpsStreak = 0;
      // Two consecutive bad seconds -> drop one quality level
      if (this.lowFpsStreak >= 2 && this.adaptiveLevel < this.adaptiveMaxLevel) {
        this.adaptiveLevel++;
        this.lowFpsStreak = 0;
        this.applyAdaptiveLevel();
      }
    } else if (fps >= 58) {
      this.highFpsStreak++;
      this.lowFpsStreak = 0;
      // Four consecutive good seconds -> restore one quality level
      if (this.highFpsStreak >= 4 && this.adaptiveLevel > 0) {
        this.adaptiveLevel--;
        this.highFpsStreak = 0;
        this.applyAdaptiveLevel();
      }
    } else {
      this.lowFpsStreak = 0;
      this.highFpsStreak = 0;
    }
  }

  private applyAdaptiveLevel(): void {
    const ratioStep = this.PIXEL_RATIO_STEPS[this.adaptiveLevel];
    const shadowStep = this.SHADOW_MAP_STEPS[this.adaptiveLevel];

    // Scale the render resolution (setPixelRatio re-sizes the drawing buffer)
    this.renderer.setPixelRatio(this.basePixelRatio * ratioStep);

    // Scale the shadow map; dispose + null forces three.js to reallocate it
    if (this.currentSun && this.currentSun.shadow) {
      const shadow = this.currentSun.shadow;
      const size = Math.max(256, Math.round(this.baseShadowSize * shadowStep));
      shadow.mapSize.set(size, size);
      if (shadow.map) {
        shadow.map.dispose();
        shadow.map = null;
      }
    }

    // Re-measure after the change so the first FPS reading isn't polluted
    this.lowFpsStreak = 0;
    this.highFpsStreak = 0;
  }

  private setupRendererDefaults(): void {
    // Native high-resolution rendering with maximum visual crispness
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Respect a pixel ratio the host app already configured (e.g. KairoApp sets
    // min(devicePixelRatio, 2)); only upgrade the renderer's default 1x.
    if (this.renderer.getPixelRatio() <= 1) {
      const ratio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1;
      this.renderer.setPixelRatio(ratio);
    }

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
    this.baseShadowSize = size;
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

    // Auto quality scaling: keep the game smooth before it starts dropping frames
    this.evaluateAdaptiveQuality(dt);

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
