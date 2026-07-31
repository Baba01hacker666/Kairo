import * as THREE from 'three';

export interface RenderMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
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
  public camera: THREE.PerspectiveCamera;

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
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0
  };

  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private fpsTimer: number = 0;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.setupRendererDefaults();
  }

  private setupRendererDefaults(): void {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.config.exposure;
  }

  public setToneMappingExposure(exposure: number): void {
    this.config.exposure = exposure;
    this.renderer.toneMappingExposure = exposure;
  }

  public setupLighting(options: {
    sunPosition?: [number, number, number];
    sunColor?: number;
    sunIntensity?: number;
    ambientColor?: number;
    ambientIntensity?: number;
    shadowMapSize?: number;
  }): { sun: THREE.DirectionalLight; ambient: THREE.AmbientLight } {
    const sunColor = options.sunColor ?? 0xfff5ea;
    const sunIntensity = options.sunIntensity ?? 2.5;
    const sun = new THREE.DirectionalLight(sunColor, sunIntensity);
    sun.position.set(...(options.sunPosition ?? [-15, 30, -15]));
    sun.castShadow = true;
    
    const size = options.shadowMapSize ?? 2048;
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
      this.metrics.frameTimeMs = parseFloat((this.fpsTimer / this.frameCount).toFixed(2));
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    // Render main 3D scene
    this.renderer.render(this.scene, this.camera);

    // Collect WebGL performance info
    const info = this.renderer.info;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.geometries = info.memory.geometries;
    this.metrics.textures = info.memory.textures;
  }
}
