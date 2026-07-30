import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { Engine } from './Engine.ts';
import { PhysicsWorld, RigidBody, Collider, RigidBodyType, ColliderType } from '@kairo/physics';
import { Vector3 } from './Math.ts';
import { animate } from 'motion';

export interface KairoAppConfig {
  canvas?: HTMLCanvasElement | string;
  background?: string | number;
  gravity?: [number, number, number];
  shadows?: boolean;
}

/**
 * High-level magical wrapper that makes Kairo super easy to use!
 * Handles Three.js initialization, resizing, physics stepping, and the game loop.
 */
export class KairoApp {
  public engine: Engine;
  public physics: PhysicsWorld;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: WebGPURenderer;

  private keys: Record<string, boolean> = {};

  constructor(config: KairoAppConfig = {}) {
    this.engine = new Engine();
    
    // Auto-setup physics
    this.physics = new PhysicsWorld();
    if (config.gravity) {
      this.physics.gravity = new Vector3(...config.gravity);
    } else {
      this.physics.gravity = new Vector3(0, -9.81, 0);
    }

    // Auto-setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.background ?? 0x09090b);

    // Auto-setup renderer
    let canvasObj: HTMLCanvasElement;
    if (typeof config.canvas === 'string') {
      canvasObj = document.getElementById(config.canvas.replace('#', '')) as HTMLCanvasElement;
    } else if (config.canvas) {
      canvasObj = config.canvas;
    } else {
      canvasObj = document.createElement('canvas');
      document.body.appendChild(canvasObj);
    }
    
    // Upgrade to WebGPU Renderer!
    this.renderer = new WebGPURenderer({ canvas: canvasObj, antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // WebGPURenderer in this version of Three.js has a fatal WGSL compilation bug with depth textures in Chrome.
    // We must temporarily disable shadows entirely when using WebGPU until Three.js patches this!
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.BasicShadowMap as any;

    // Auto-setup camera
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Auto-resize handling
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Auto-input handling
    window.addEventListener('keydown', e => this.keys[e.code] = true);
    window.addEventListener('keyup', e => this.keys[e.code] = false);

    // Core loops
    this.engine.events.on('update', (dt: number) => {
      this.physics.step(dt);
    });

    this.engine.events.on('render', () => {
      this.renderer.renderAsync(this.scene, this.camera);
    });
  }

  public setLighting(options: { ambient?: number | string, sunPosition?: [number, number, number], sunIntensity?: number }) {
    if (options.ambient !== undefined) this.scene.add(new THREE.AmbientLight(options.ambient, typeof options.ambient === 'number' ? options.ambient : 0.5));
    if (options.sunPosition) {
      const sun = new THREE.DirectionalLight(0xffffff, options.sunIntensity ?? 1.5);
      sun.position.set(...options.sunPosition);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048; 
      sun.shadow.mapSize.height = 2048;
      this.scene.add(sun);
    }
  }

  public isKeyDown(code: string): boolean {
    return !!this.keys[code];
  }

  public onUpdate(callback: (dt: number) => void) {
    this.engine.events.on('update', callback);
  }

  public async start() {
    await this.renderer.init();
    this.engine.start();
  }

  /**
   * Magically animates any object or value over time! Perfect for cutscenes, UI, or cinematic videos.
   */
  public animate(target: any, keyframes: any, options?: any): any {
    return animate(target, keyframes, options);
  }

  /**
   * Helper to magically create a physically simulated box
   */
  public createBox(opts: { size?: [number, number, number], position?: [number, number, number], color?: number | string, physics?: 'static' | 'dynamic', mass?: number }) {
    const size = opts.size ?? [1, 1, 1];
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      new THREE.MeshStandardMaterial({ color: opts.color ?? 0xffffff, roughness: 0.5 })
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

      // Magically sync physics body to mesh
      this.engine.events.on('update', () => {
        if (rb.cannonBody) {
          mesh.position.set(rb.cannonBody.position.x, rb.cannonBody.position.y, rb.cannonBody.position.z);
          mesh.quaternion.set(rb.cannonBody.quaternion.x, rb.cannonBody.quaternion.y, rb.cannonBody.quaternion.z, rb.cannonBody.quaternion.w);
        }
      });
      return { mesh, rb };
    }
    return { mesh };
  }
}
