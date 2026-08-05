import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { VOXLoader } from 'three/examples/jsm/loaders/VOXLoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { MeshCompressor, CompressionStats } from './MeshCompressor.ts';
import { BlendLoader } from './BlendLoader.ts';

export type AssetModelType = 'gltf' | 'glb' | 'obj' | 'fbx' | 'stl' | 'ply' | 'dae' | 'vox' | 'drc' | 'blend';

export interface ModelBoundsInfo {
  width: number;
  height: number;
  depth: number;
  center: THREE.Vector3;
  size: THREE.Vector3;
  scaleFactor: number;
}

export class AssetManager {
  private cache: Map<string, any> = new Map();
  private pending: Map<string, Promise<any>> = new Map();

  private gltfLoader = new GLTFLoader();
  private dracoLoader = new DRACOLoader();
  private objLoader = new OBJLoader();
  private fbxLoader = new FBXLoader();
  private stlLoader = new STLLoader();
  private plyLoader = new PLYLoader();
  private colladaLoader = new ColladaLoader();
  private voxLoader = new VOXLoader();
  private blendLoader = new BlendLoader();
  private svgLoader = new SVGLoader();
  private fontLoader = new FontLoader();
  private textureLoader = new THREE.TextureLoader();

  constructor() {
    // Configure Google Draco Mesh Decoder for compressed 3D GLTF models
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /**
   * Auto-Fit & Auto-Scale Character/Prop Asset to Target Height & Bottom Pivot Alignment
   */
  public autoFitModel(model: THREE.Object3D, targetHeight: number = 2.0): ModelBoundsInfo {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    const center = new THREE.Vector3();
    box.getCenter(center);

    const rawHeight = size.y > 0.0001 ? size.y : 1.0;
    const scaleFactor = targetHeight / rawHeight;

    // Apply uniform scale
    model.scale.multiplyScalar(scaleFactor);

    // Recompute bounding box post-scale
    model.updateMatrixWorld(true);
    const postBox = new THREE.Box3().setFromObject(model);
    const postSize = new THREE.Vector3();
    postBox.getSize(postSize);

    return {
      width: postSize.x,
      height: postSize.y,
      depth: postSize.z,
      center,
      size: postSize,
      scaleFactor
    };
  }

  /**
   * Auto-Generate Collision Collider Metadata for Character / Asset
   */
  public generateAutoCollider(model: THREE.Object3D): { type: 'box' | 'capsule' | 'sphere'; radius: number; height: number; halfExtents: [number, number, number] } {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    const radius = Math.max(size.x, size.z) / 2;
    const height = size.y;

    return {
      type: height > radius * 2.5 ? 'capsule' : 'box',
      radius,
      height,
      halfExtents: [size.x / 2, size.y / 2, size.z / 2]
    };
  }

  /**
   * Parse Sketchfab URL or Model UID or direct GLB/GLTF stream URL
   */
  public parseSketchfabUrl(input: string): { url: string; isSketchfab: boolean; uid?: string } {
    const trimmed = input.trim();
    const sketchfabMatch = trimmed.match(/sketchfab\.com\/(?:3d-models\/|models\/)?(?:[a-zA-Z0-9-]+-)?([a-f0-9]{32})/i);
    if (sketchfabMatch) {
      const uid = sketchfabMatch[1];
      return {
        url: `https://api.sketchfab.com/v3/models/${uid}/download`,
        isSketchfab: true,
        uid
      };
    }
    if (/^[a-f0-9]{32}$/i.test(trimmed)) {
      return {
        url: `https://api.sketchfab.com/v3/models/${trimmed}/download`,
        isSketchfab: true,
        uid: trimmed
      };
    }
    return { url: trimmed, isSketchfab: false };
  }

  /**
   * Stream a 3D Model directly from Sketchfab or remote GLTF/GLB asset URL into the engine
   */
  public async streamSketchfabModel(
    urlOrUid: string,
    onProgress?: (percent: number) => void,
    targetHeight: number = 2.0
  ): Promise<THREE.Object3D> {
    const parsed = this.parseSketchfabUrl(urlOrUid);
    let targetUrl = parsed.url;

    if (parsed.isSketchfab && parsed.uid) {
      try {
        const response = await fetch(`https://api.sketchfab.com/v3/models/${parsed.uid}`);
        if (response.ok) {
          const data = await response.json();
          if (data.gltf && data.gltf.url) {
            targetUrl = data.gltf.url;
          }
        }
      } catch (err) {
        console.warn('[AssetManager] Sketchfab API metadata fetch warning:', err);
      }
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        targetUrl,
        (gltf) => {
          const scene = gltf.scene;
          scene.name = parsed.uid ? `SketchfabModel_${parsed.uid.slice(0, 8)}` : 'StreamedSketchfabModel';
          if (targetHeight) this.autoFitModel(scene, targetHeight);
          this.processLoadedModel(scene, true);
          this.cache.set(urlOrUid, scene);
          resolve(scene.clone());
        },
        (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
        (error: any) => reject(new Error(`Sketchfab stream failed: ${error?.message || error}`))
      );
    });
  }

  /**
   * Unified 3D Model Loader
   * Automatically handles compressed models (Draco .glb, .gltf, .drc, .obj, .fbx, .stl, .ply, .dae, .vox)
   */
  async loadModel(url: string, autoCompress: boolean = false, targetHeight?: number): Promise<THREE.Object3D> {
    if (url.includes('sketchfab.com') || /^[a-f0-9]{32}$/i.test(url.trim())) {
      return this.streamSketchfabModel(url, undefined, targetHeight || 2.0);
    }
    if (this.cache.has(url)) {
      const cloned = this.cache.get(url).clone();
      if (targetHeight) this.autoFitModel(cloned, targetHeight);
      return cloned;
    }
    if (this.pending.has(url)) {
      const model = await this.pending.get(url);
      const cloned = model.clone();
      if (targetHeight) this.autoFitModel(cloned, targetHeight);
      return cloned;
    }

    const promise = new Promise<THREE.Object3D>((resolve, reject) => {
      const ext = url.split('.').pop()?.toLowerCase();

      if (ext === 'glb' || ext === 'gltf') {
        this.gltfLoader.load(url, (gltf) => {
          this.processLoadedModel(gltf.scene, autoCompress);
          this.cache.set(url, gltf.scene);
          resolve(gltf.scene);
        }, undefined, reject);

      } else if (ext === 'drc') {
        this.dracoLoader.load(url, (geo) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });
          const mesh = new THREE.Mesh(geo, mat);
          this.cache.set(url, mesh);
          resolve(mesh);
        }, undefined, reject);

      } else if (ext === 'obj') {
        this.objLoader.load(url, (obj) => {
          this.processLoadedModel(obj, autoCompress);
          this.cache.set(url, obj);
          resolve(obj);
        }, undefined, reject);

      } else if (ext === 'fbx') {
        this.fbxLoader.load(url, (fbx) => {
          this.processLoadedModel(fbx, autoCompress);
          this.cache.set(url, fbx);
          resolve(fbx);
        }, undefined, reject);

      } else if (ext === 'stl') {
        this.stlLoader.load(url, (geo) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
          const mesh = new THREE.Mesh(geo, mat);
          if (autoCompress) MeshCompressor.optimizeMesh(mesh);
          this.cache.set(url, mesh);
          resolve(mesh);
        }, undefined, reject);

      } else if (ext === 'ply') {
        this.plyLoader.load(url, (geo) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
          const mesh = new THREE.Mesh(geo, mat);
          if (autoCompress) MeshCompressor.optimizeMesh(mesh);
          this.cache.set(url, mesh);
          resolve(mesh);
        }, undefined, reject);

      } else if (ext === 'dae') {
        this.colladaLoader.load(url, (collada) => {
          const scene = collada?.scene || new THREE.Group();
          this.processLoadedModel(scene, autoCompress);
          this.cache.set(url, scene);
          resolve(scene);
        }, undefined, reject);

      } else if (ext === 'vox') {
        this.voxLoader.load(url, (chunks) => {
          const group = new THREE.Group();
          const list = Array.isArray(chunks) ? chunks : [];
          for (let i = 0; i < list.length; i++) {
            const mesh = (list[i] as any)?.mesh;
            if (mesh) group.add(mesh);
          }
          this.cache.set(url, group);
          resolve(group);
        }, undefined, reject);

      } else if (ext === 'blend') {
        this.blendLoader.load(url, (group) => {
          this.processLoadedModel(group, autoCompress);
          this.cache.set(url, group);
          resolve(group);
        }, undefined, reject);

      } else {
        this.gltfLoader.load(url, (gltf) => {
          this.cache.set(url, gltf.scene);
          resolve(gltf.scene);
        }, undefined, reject);
      }
    });

    this.pending.set(url, promise);
    const model = await promise;
    this.pending.delete(url);
    const cloned = model.clone();
    if (targetHeight) this.autoFitModel(cloned, targetHeight);
    return cloned;
  }

  private processLoadedModel(root: THREE.Object3D, autoCompress: boolean): void {
    if (!autoCompress) return;

    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        MeshCompressor.optimizeMesh(child as THREE.Mesh);
      }
    });
  }

  /**
   * Optimize & Compress a loaded 3D model hierarchy at runtime
   */
  compressModel(model: THREE.Object3D): CompressionStats[] {
    const statsList: CompressionStats[] = [];
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const stats = MeshCompressor.optimizeMesh(child as THREE.Mesh);
        statsList.push(stats);
      }
    });
    return statsList;
  }

  async loadFont(url: string): Promise<Font> {
    if (this.cache.has(url)) return this.cache.get(url);
    return new Promise((resolve, reject) => {
      this.fontLoader.load(url, (font) => {
        this.cache.set(url, font);
        resolve(font);
      }, undefined, reject);
    });
  }

  async loadTexture(url: string): Promise<THREE.Texture> {
    if (this.cache.has(url)) return this.cache.get(url);
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, (tex) => {
        this.cache.set(url, tex);
        resolve(tex);
      }, undefined, reject);
    });
  }

  async loadText(url: string): Promise<string> {
    if (this.cache.has(url)) return this.cache.get(url);
    const res = await fetch(url);
    const text = await res.text();
    this.cache.set(url, text);
    return text;
  }

  async loadJSON<T = any>(url: string): Promise<T> {
    if (this.cache.has(url)) return this.cache.get(url);
    const text = await this.loadText(url);
    const json = JSON.parse(text);
    this.cache.set(url, json);
    return json;
  }

  async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) return this.cache.get(url);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  get<T>(url: string): T | undefined {
    return this.cache.get(url);
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  unload(url: string): void {
    this.cache.delete(url);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const GlobalAssets = new AssetManager();
