import * as THREE from 'three';
import { Engine } from './Engine.ts';
import { PhysicsWorld, RigidBody, Collider, RigidBodyType, ColliderType } from '@kairo/physics';
import { Vector3 } from './Math.ts';
import { CameraController, RenderPipeline } from '@kairo/renderer';
import { GlobalInput, InputManager } from '@kairo/input';
import { GlobalAudio, AudioManager } from '@kairo/audio';
import { GlobalUI, UIManager } from '@kairo/ui';
import { GlobalDebugInspector, DebugInspector } from '@kairo/tools';
import { Serializer } from './Serializer.ts';
import { animate } from 'motion';

export interface KairoAppConfig {
  canvas?: HTMLCanvasElement | string;
  background?: string | number;
  gravity?: [number, number, number];
  shadows?: boolean;
  fogColor?: number | string;
  fogNear?: number;
  fogFar?: number;
}

/**
 * Modern High-Level Production Game Engine Wrapper
 * Manages Rendering, Camera, Physics, Input, Audio, UI, Profiler, and Scene Lifecycle.
 */
export class KairoApp {
  public engine: Engine;
  public physics: PhysicsWorld;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public cameraController: CameraController;
  public renderer: THREE.WebGLRenderer;
  public pipeline: RenderPipeline;

  public input: InputManager = GlobalInput;
  public audio: AudioManager = GlobalAudio;
  public ui: UIManager = GlobalUI;
  public debug: DebugInspector = GlobalDebugInspector;

  private sceneObstacles: THREE.Object3D[] = [];

  constructor(config: KairoAppConfig = {}) {
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
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Setup Camera & Controller
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 6, 12);
    this.cameraController = new CameraController(this.camera);

    // Setup Render Pipeline
    this.pipeline = new RenderPipeline(this.renderer, this.scene, this.camera);
    if (config.shadows !== false) {
      this.pipeline.setupLighting({});
    }

    // Auto-resize handling
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
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
      this.engine.events.on('update', () => {
        if (rb.cannonBody) {
          mesh.position.set(rb.cannonBody.position.x, rb.cannonBody.position.y, rb.cannonBody.position.z);
          mesh.quaternion.set(rb.cannonBody.quaternion.x, rb.cannonBody.quaternion.y, rb.cannonBody.quaternion.z, rb.cannonBody.quaternion.w);
        }
      });
      return { mesh, rb, col };
    }
    return { mesh };
  }
}
