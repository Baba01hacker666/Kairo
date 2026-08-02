import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class PostProcessManager {
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;
  private outlinePass: OutlinePass;
  private filmPass: FilmPass;
  private pixelatedPass: RenderPixelatedPass;
  private outputPass: OutputPass;

  public enabled: boolean = false;

  constructor(private renderer: THREE.WebGLRenderer, private scene: THREE.Scene, private camera: THREE.Camera) {
    this.composer = new EffectComposer(renderer);
    
    // 1. Base Render Pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 2. Pixelation Pass (Disabled by default)
    this.pixelatedPass = new RenderPixelatedPass(6, scene, camera);
    this.pixelatedPass.enabled = false;
    this.composer.addPass(this.pixelatedPass);

    // 3. Selection Outline / Glow Pass
    this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    this.outlinePass.edgeStrength = 3.0;
    this.outlinePass.edgeGlow = 0.5;
    this.outlinePass.edgeThickness = 1.0;
    this.outlinePass.visibleEdgeColor.set('#ffffff');
    this.outlinePass.hiddenEdgeColor.set('#222222');
    this.outlinePass.enabled = false;
    this.composer.addPass(this.outlinePass);

    // 4. Unreal Bloom Pass
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    this.bloomPass.enabled = false;
    this.composer.addPass(this.bloomPass);

    // 5. Film Grain / CRT Scanlines
    this.filmPass = new FilmPass();
    this.filmPass.enabled = false;
    this.composer.addPass(this.filmPass);

    // 6. Output Pass (Tone mapping & Color space conversion)
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
    
    window.addEventListener('resize', () => {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public render(dt: number): void {
    if (this.enabled) {
      this.composer.render(dt);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // --- API ---

  public toggleBloom(enabled: boolean, intensity: number = 1.5): void {
    this.bloomPass.enabled = enabled;
    this.bloomPass.strength = intensity;
    this.checkEnabled();
  }

  public toggleFilmGrain(enabled: boolean): void {
    this.filmPass.enabled = enabled;
    this.checkEnabled();
  }

  public togglePixelation(enabled: boolean, pixelSize: number = 6): void {
    this.pixelatedPass.enabled = enabled;
    this.pixelatedPass.setPixelSize(pixelSize);
    this.checkEnabled();
  }

  public setSelectionOutline(objects: THREE.Object3D[], color: string = '#ffffff'): void {
    if (objects.length > 0) {
      this.outlinePass.enabled = true;
      this.outlinePass.selectedObjects = objects;
      this.outlinePass.visibleEdgeColor.set(color);
      this.enabled = true;
    } else {
      this.outlinePass.enabled = false;
      this.outlinePass.selectedObjects = [];
      this.checkEnabled();
    }
  }

  private checkEnabled(): void {
    this.enabled = this.bloomPass.enabled || this.filmPass.enabled || this.pixelatedPass.enabled || this.outlinePass.enabled;
  }
}
