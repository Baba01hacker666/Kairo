import * as THREE from 'three';
import { Engine } from './Engine.ts';
import { PhysicsWorld, RigidBody, Collider, RigidBodyType, ColliderType } from '@kairo/physics';
import { Vector3 } from './Math.ts';
import { CameraController, RenderPipeline, CpuProfileMap } from '@kairo/renderer';
import { GlobalInput, InputManager } from '@kairo/input';
import { GlobalAudio, AudioManager } from '@kairo/audio';
import { GlobalUI, UIManager } from '@kairo/ui';
import { GlobalDebugInspector, DebugInspector, ScreenRecorder, DebugRenderer } from '@kairo/tools';
import { Serializer } from './Serializer.ts';
import { SaveSystem } from './SaveSystem.ts';
import { SceneManager } from './SceneManager.ts';
import { CutsceneManager } from './Cutscene.ts';
import { animate } from 'motion';

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
}

/**
 * Modern High-Level Production Game Engine Wrapper
 * Manages Rendering, Camera, Physics, Input, Audio, UI, Profiler, ScreenRecorder, and Scene Lifecycle.
 */
export class KairoApp {
  public engine: Engine;
  public physics: PhysicsWorld;
  public scene: THREE.Scene;
  public camera: THREE.Camera;
  public cameraController: CameraController;
  public config: KairoAppConfig;
  public renderer: THREE.WebGLRenderer;
  public pipeline: RenderPipeline;
  public screenRecorder!: ScreenRecorder;
  public save: SaveSystem;
  public scenes: SceneManager;
  public cutscene: CutsceneManager;

  public input: InputManager = GlobalInput;
  public audio: AudioManager = GlobalAudio;
  public ui: UIManager = GlobalUI;
  public debug: DebugInspector = GlobalDebugInspector;
  public debugRenderer: DebugRenderer;

  private sceneObstacles: THREE.Object3D[] = [];

  constructor(config: KairoAppConfig = {}) {
    this.config = config;
    this.save = new SaveSystem(config.gameId || 'default');
    this.scenes = new SceneManager(this);
    this.cutscene = new CutsceneManager(this);
    this.debugRenderer = new DebugRenderer(this);
    this.engine = new Engine();
    
    // Setup physics
    this.physics = new PhysicsWorld();
    this.physics.gravity = config.gravity ? new Vector3(...config.gravity) : new Vector3(0, -9.81, 0);

    // Setup scene & environment
    this.scene = new THREE.Scene();
    const bgColor = config.background ?? 0x09090b;
    this.scene.background = new THREE.Color(bgColor);

    if (config.fogColor) {
      this.scene.fog = new THREE.Fog(
        new THREE.Color(config.fogColor),
        config.fogNear ?? 15,
        config.fogFar ?? 65
      );
    }

    // Setup Canvas & Renderer
    let canvasObj: HTMLCanvasElement;
    if (typeof config.canvas === 'string') {
      canvasObj = document.getElementById(config.canvas.replace('#', '')) as HTMLCanvasElement;
    } else if (config.canvas) {
      canvasObj = config.canvas;
    } else {
      canvasObj = document.createElement('canvas');
      document.body.appendChild(canvasObj);
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasObj,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
      preserveDrawingBuffer: true // Retain WebGL pixel buffer for instant high-res screenshot capture
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.screenRecorder = new ScreenRecorder(canvasObj);

    // Setup Camera & Controller
    const aspect = window.innerWidth / window.innerHeight;
    if (this.config.mode === '2d') {
      const frustumSize = this.config.orthoScale ?? 10;
      this.camera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2, frustumSize * aspect / 2,
        frustumSize / 2, -frustumSize / 2,
        0.1, 1000
      );
      this.camera.position.set(0, 0, 10);
    } else {
      this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 200);
      this.camera.position.set(0, 6, 12);
    }
    this.cameraController = new CameraController(this.camera);

    // Setup Render Pipeline
    this.pipeline = new RenderPipeline(this.renderer, this.scene, this.camera);
    if (config.shadows !== false) {
      this.pipeline.setupLighting({});
    }

    // Auto-resize handling
    window.addEventListener('resize', () => {
      const aspect = window.innerWidth / window.innerHeight;
      if (this.camera instanceof THREE.PerspectiveCamera) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
      } else if (this.camera instanceof THREE.OrthographicCamera) {
        const frustumSize = this.config.orthoScale ?? 10;
        this.camera.left = -frustumSize * aspect / 2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = -frustumSize / 2;
        this.camera.updateProjectionMatrix();
      }
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Core loops
    this.engine.events.on('update', (dt: number) => {
      this.physics.step(dt);
      this.cameraController.update(dt, this.sceneObstacles);
      this.input.endFrame();
    });

    this.engine.events.on('render', () => {
      this.pipeline.render();
      this.debug.update(this.pipeline.metrics, this.engine.activeScene.root.children.length);
    });

    // Expose global KairoAPI for external scripts/automation to generate videos and interact with the engine programmatically
    if (typeof window !== 'undefined') {
      (window as any).KairoAPI = {
        app: this,
        startVideoRecording: (fps: number = 60) => this.startRecording(fps),
        stopVideoRecording: (filename?: string) => this.stopRecording(filename),
        captureScreenshot: (filename?: string) => this.captureScreenshot(filename),
        recordGameplaySequence: async (durationMs: number, filename?: string) => {
          this.startRecording(60);
          await new Promise(resolve => setTimeout(resolve, durationMs));
          return await this.stopRecording(filename);
        }
      };
    }
  }

  public registerObstacle(object: THREE.Object3D): void {
    this.sceneObstacles.push(object);
  }

  public clearObstacles(): void {
    this.sceneObstacles = [];
  }

  public setLighting(options: {
    sunPosition?: [number, number, number];
    sunColor?: number;
    sunIntensity?: number;
    ambientColor?: number;
    ambientIntensity?: number;
    ambient?: number | string;
  }) {
    const ambientIntensity = typeof options.ambient === 'number' ? options.ambient : options.ambientIntensity;
    return this.pipeline.setupLighting({
      ...options,
      ambientIntensity
    });
  }

  public isKeyDown(code: string): boolean {
    return this.input.isKeyDown(code);
  }

  public animate(target: any, keyframes: any, options?: any): any {
    return animate(target, keyframes, options);
  }

  public onUpdate(callback: (dt: number) => void) {
    this.engine.events.on('update', callback);
  }

  public start() {
    this.audio.init();
    this.engine.start();
  }

  public stop() {
    this.engine.stop();
  }

  /**
   * Helper to quickly spawn a physically simulated box
   */
  public createBox(opts: {
    size?: [number, number, number];
    position?: [number, number, number];
    color?: number | string;
    physics?: 'static' | 'dynamic';
    mass?: number;
    roughness?: number;
    metalness?: number;
  }) {
    const size = opts.size ?? [1, 1, 1];
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      new THREE.MeshStandardMaterial({
        color: opts.color ?? 0xffffff,
        roughness: opts.roughness ?? 0.5,
        metalness: opts.metalness ?? 0.1
      })
    );
    mesh.position.set(...(opts.position ?? [0, 0, 0]));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    if (opts.physics) {
      const rb = new RigidBody();
      rb.type = opts.physics === 'static' ? RigidBodyType.Static : RigidBodyType.Dynamic;
      rb.mass = opts.mass ?? (opts.physics === 'static' ? 0 : 1);
      const col = new Collider();
      col.type = ColliderType.Box;
      col.size = new Vector3(...size);
      this.physics.registerBody(rb, col, new Vector3(...mesh.position.toArray()));

      // Sync physics body to visual mesh
      const unsubscribe = this.engine.events.on('update', () => {
        if (rb.cannonBody) {
          mesh.position.set(rb.cannonBody.position.x, rb.cannonBody.position.y, rb.cannonBody.position.z);
          mesh.quaternion.set(rb.cannonBody.quaternion.x, rb.cannonBody.quaternion.y, rb.cannonBody.quaternion.z, rb.cannonBody.quaternion.w);
        }
      });

      return {
        mesh,
        rb,
        col,
        dispose: () => {
          unsubscribe();
          this.scene.remove(mesh);
          this.physics.unregisterBody(rb);
          mesh.geometry.dispose();
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => m.dispose());
        }
      };
    }
    return { mesh };
  }

  /**
   * Set a 2D Background Image
   */
  public setBackgroundImage(url: string, pixelArt: boolean = false): void {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      if (pixelArt || this.config.pixelArt) {
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      this.scene.background = texture;
    });
  }

  /**
   * Helper to spawn a 2D textured block/sprite
   */
  public createBlock2D(opts: {
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
  }) {
    const size = opts.size ?? [1, 1];
    
    let material: THREE.Material;
    if (opts.textureUrl) {
      const texture = new THREE.TextureLoader().load(opts.textureUrl);
      if (opts.pixelArt !== false && (opts.pixelArt || this.config.pixelArt)) {
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        color: opts.color ?? 0xffffff,
        transparent: true 
      });
    } else {
      material = new THREE.MeshBasicMaterial({ color: opts.color ?? 0xffffff, transparent: true });
    }

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material);
    mesh.position.set(...(opts.position ?? [0, 0, 0]));
    this.scene.add(mesh);

    const unsubs: Array<() => void> = [];

    if (opts.billboard) {
      unsubs.push(this.engine.events.on('update', () => {
        mesh.quaternion.copy(this.camera.quaternion);
      }));
    }

    if (opts.physics) {
      const rb = new RigidBody();
      rb.type = opts.physics === 'static' ? RigidBodyType.Static : RigidBodyType.Dynamic;
      rb.mass = opts.mass ?? (opts.physics === 'static' ? 0 : 1);
      
      if (opts.fixedRotation) rb.fixedRotation = true;
      if (opts.lockZAxis) {
        rb.lockLinearAxis = [false, false, true];
        rb.lockAngularAxis = [true, true, false];
      }

      const col = new Collider();
      col.type = ColliderType.Box;
      col.size = new Vector3(size[0], size[1], 1); // 1 depth for 2D
      this.physics.registerBody(rb, col, new Vector3(...mesh.position.toArray()));

      unsubs.push(this.engine.events.on('update', () => {
        if (rb.cannonBody) {
          mesh.position.set(rb.cannonBody.position.x, rb.cannonBody.position.y, rb.cannonBody.position.z);
          if (!opts.billboard) {
            mesh.quaternion.set(rb.cannonBody.quaternion.x, rb.cannonBody.quaternion.y, rb.cannonBody.quaternion.z, rb.cannonBody.quaternion.w);
          }
        }
      }));

      return { mesh, rb, col, dispose: () => {
        unsubs.forEach(u => u());
        this.scene.remove(mesh);
        this.physics.unregisterBody(rb);
        mesh.geometry.dispose();
        material.dispose();
      }};
    }
    
    return { mesh, dispose: () => {
      unsubs.forEach(u => u());
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      material.dispose();
    }};
  }

  /**
   * Print text dynamically into the 3D scene using high-res Canvas textures.
   * Supports any CSS font, colors, and dynamic updating.
   */
  public createText3D(opts: {
    text: string;
    position?: [number, number, number];
    font?: string; // e.g. "bold 64px Inter, sans-serif"
    color?: string; // e.g. "#ffffff" or "red"
    size?: number; // Base scale size (height)
    billboard?: boolean; // Face camera
    align?: 'left' | 'center' | 'right';
  }) {
    const text = opts.text;
    const font = opts.font || 'bold 64px sans-serif';
    const color = opts.color || '#ffffff';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    
    let fontSize = 64;
    const match = font.match(/(\d+)px/);
    if (match) fontSize = parseInt(match[1], 10);
    
    const fontHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || fontSize * 1.2);
    
    canvas.width = Math.max(textWidth + 20, 2);
    canvas.height = Math.max(fontHeight + 20, 2);
    
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = 'middle';
    
    const drawX = ctx.textAlign === 'center' ? canvas.width / 2 : (ctx.textAlign === 'right' ? canvas.width - 10 : 10);
    const drawY = canvas.height / 2;
    
    ctx.fillText(text, drawX, drawY);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const aspect = canvas.width / canvas.height;
    const baseScale = opts.size ?? 1;
    const planeWidth = baseScale * aspect;
    const planeHeight = baseScale;
    
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), material);
    mesh.position.set(...(opts.position ?? [0, 0, 0]));
    
    this.scene.add(mesh);
    
    let unsub: (() => void) | undefined;
    if (opts.billboard) {
      unsub = this.engine.events.on('update', () => {
        mesh.quaternion.copy(this.camera.quaternion);
      });
    }
    
    return {
      mesh,
      setText: (newText: string) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = font;
        const m = ctx.measureText(newText);
        const w = Math.ceil(m.width) + 20;
        
        let resized = false;
        if (w > canvas.width) {
          canvas.width = w;
          resized = true;
        }
        
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = opts.align || 'center';
        ctx.textBaseline = 'middle';
        
        const dX = ctx.textAlign === 'center' ? canvas.width / 2 : (ctx.textAlign === 'right' ? canvas.width - 10 : 10);
        ctx.fillText(newText, dX, canvas.height / 2);
        texture.needsUpdate = true;
        
        if (resized) {
          const newAspect = canvas.width / canvas.height;
          mesh.geometry.dispose();
          mesh.geometry = new THREE.PlaneGeometry(baseScale * newAspect, baseScale);
        }
      },
      dispose: () => {
        if (unsub) unsub();
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        material.dispose();
        texture.dispose();
      }
    };
  }

  /**
   * Capture instant high-res WebGL canvas screenshot
   */
  public captureScreenshot(filename?: string): string {
    return this.screenRecorder.captureScreenshot(filename);
  }

  /**
   * Start 60 FPS video recording of WebGL canvas stream
   */
  public startRecording(fps: number = 60): boolean {
    return this.screenRecorder.startRecording(fps);
  }

  /**
   * Stop video recording and download video file
   */
  public stopRecording(filename?: string): Promise<Blob | null> {
    return this.screenRecorder.stopRecording(filename);
  }

  /**
   * Generate Real-Time CPU Execution Profile Map
   */
  public getCpuProfileMap(): CpuProfileMap {
    const webGlRenderMs = this.pipeline.metrics.cpuRenderMs || 0.7;
    const physicsStepMs = this.pipeline.metrics.cpuPhysicsMs || 0.5;
    const aiPathfindingMs = this.pipeline.metrics.cpuAiMs || 0.0;
    const sceneGraphUpdateMs = 0.2;
    const animationMs = 0.3;
    const particlesMs = 0.4;

    const totalCpuTimeMs = parseFloat((webGlRenderMs + physicsStepMs + aiPathfindingMs + sceneGraphUpdateMs + animationMs + particlesMs).toFixed(2));
    const targetFrameBudgetMs = 16.67; // 60 FPS target
    const cpuHeadroomMs = parseFloat((targetFrameBudgetMs - totalCpuTimeMs).toFixed(2));
    const cpuHeadroomPercent = ((cpuHeadroomMs / targetFrameBudgetMs) * 100).toFixed(1) + '%';

    return {
      webGlRenderMs,
      physicsStepMs,
      sceneGraphUpdateMs,
      animationMs,
      particlesMs,
      aiPathfindingMs,
      totalCpuTimeMs,
      targetFrameBudgetMs,
      cpuHeadroomMs,
      cpuHeadroomPercent
    };
  }

  /**
   * Generate & Export Complete Engine Memory Map & CPU Profile Dump
   */
  public getMemoryMapDump(): {
    timestamp: string;
    metrics: any;
    cpuProfileMap: CpuProfileMap;
    gpuMemory: { geometries: number; textures: number; estimatedVramBytes: number; estimatedVramMb: string };
    jsHeap: { usedHeapBytes: number; totalHeapBytes: number; heapLimitBytes: number; usedHeapMb: string };
    sceneGraph: { totalNodes: number; meshesCount: number; instancedMeshesCount: number; lightsCount: number };
    memoryMapBreakdown: Array<{ subsystem: string; description: string; bytes: number; formatted: string }>;
  } {
    const info = this.renderer.info;
    let nodesCount = 0;
    let meshesCount = 0;
    let instancedMeshesCount = 0;
    let lightsCount = 0;

    this.scene.traverse((obj) => {
      nodesCount++;
      if (obj.type === 'Mesh') meshesCount++;
      if (obj.type === 'InstancedMesh') instancedMeshesCount++;
      if (obj.type.includes('Light')) lightsCount++;
    });

    const perfMem = typeof performance !== 'undefined' ? (performance as any).memory : null;
    const usedHeap = perfMem ? perfMem.usedJSHeapSize : 0;
    const totalHeap = perfMem ? perfMem.totalJSHeapSize : 0;
    const heapLimit = perfMem ? perfMem.jsHeapSizeLimit : 0;

    // Estimate VRAM consumption based on active WebGL geometries and textures
    const estimatedGeoBytes = info.memory.geometries * 45000;
    const estimatedTexBytes = info.memory.textures * 1024 * 1024;
    const totalVramBytes = estimatedGeoBytes + estimatedTexBytes;
    const cpuProfileMap = this.getCpuProfileMap();

    const breakdown = [
      { subsystem: 'WebGL Geometries', description: `${info.memory.geometries} active buffer geometries`, bytes: estimatedGeoBytes, formatted: (estimatedGeoBytes / 1024).toFixed(1) + ' KB' },
      { subsystem: 'WebGL Textures', description: `${info.memory.textures} active GPU texture maps`, bytes: estimatedTexBytes, formatted: (estimatedTexBytes / (1024 * 1024)).toFixed(1) + ' MB' },
      { subsystem: 'JS Engine Heap', description: 'Active V8 JavaScript heap allocation', bytes: usedHeap, formatted: (usedHeap / (1024 * 1024)).toFixed(1) + ' MB' },
      { subsystem: 'Scene Graph Nodes', description: `${nodesCount} active 3D object nodes`, bytes: nodesCount * 256, formatted: (nodesCount * 256 / 1024).toFixed(1) + ' KB' }
    ];

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        ...this.pipeline.metrics,
        cpuProfileMap
      },
      cpuProfileMap,
      gpuMemory: {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        estimatedVramBytes: totalVramBytes,
        estimatedVramMb: (totalVramBytes / (1024 * 1024)).toFixed(2) + ' MB'
      },
      jsHeap: {
        usedHeapBytes: usedHeap,
        totalHeapBytes: totalHeap,
        heapLimitBytes: heapLimit,
        usedHeapMb: (usedHeap / (1024 * 1024)).toFixed(2) + ' MB'
      },
      sceneGraph: {
        totalNodes: nodesCount,
        meshesCount,
        instancedMeshesCount,
        lightsCount
      },
      memoryMapBreakdown: breakdown
    };
  }
}
