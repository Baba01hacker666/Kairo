import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { VOXLoader } from 'three/examples/jsm/loaders/VOXLoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';

export type AssetModelType = 'gltf' | 'glb' | 'obj' | 'fbx' | 'stl' | 'ply' | 'dae' | 'vox';

export class AssetManager {
  private cache: Map<string, any> = new Map();
  private pending: Map<string, Promise<any>> = new Map();

  private gltfLoader = new GLTFLoader();
  private objLoader = new OBJLoader();
  private fbxLoader = new FBXLoader();
  private stlLoader = new STLLoader();
  private plyLoader = new PLYLoader();
  private colladaLoader = new ColladaLoader();
  private voxLoader = new VOXLoader();
  private svgLoader = new SVGLoader();
  private fontLoader = new FontLoader();
  private textureLoader = new THREE.TextureLoader();

  /**
   * Unified 3D Model Loader
   * Automatically detects file format from URL extension (.glb, .gltf, .obj, .fbx, .stl, .ply, .dae, .vox)
   */
  async loadModel(url: string): Promise<THREE.Object3D> {
    if (this.cache.has(url)) {
      return this.cache.get(url).clone();
    }
    if (this.pending.has(url)) {
      const model = await this.pending.get(url);
      return model.clone();
    }

    const promise = new Promise<THREE.Object3D>((resolve, reject) => {
      const ext = url.split('.').pop()?.toLowerCase();

      if (ext === 'glb' || ext === 'gltf') {
        this.gltfLoader.load(url, (gltf) => {
          this.cache.set(url, gltf.scene);
          resolve(gltf.scene);
        }, undefined, reject);

      } else if (ext === 'obj') {
        this.objLoader.load(url, (obj) => {
          this.cache.set(url, obj);
          resolve(obj);
        }, undefined, reject);

      } else if (ext === 'fbx') {
        this.fbxLoader.load(url, (fbx) => {
          this.cache.set(url, fbx);
          resolve(fbx);
        }, undefined, reject);

      } else if (ext === 'stl') {
        this.stlLoader.load(url, (geo) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
          const mesh = new THREE.Mesh(geo, mat);
          this.cache.set(url, mesh);
          resolve(mesh);
        }, undefined, reject);

      } else if (ext === 'ply') {
        this.plyLoader.load(url, (geo) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
          const mesh = new THREE.Mesh(geo, mat);
          this.cache.set(url, mesh);
          resolve(mesh);
        }, undefined, reject);

      } else if (ext === 'dae') {
        this.colladaLoader.load(url, (collada) => {
          const scene = collada?.scene || new THREE.Group();
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

      } else {
        // Fallback: try GLTF
        this.gltfLoader.load(url, (gltf) => {
          this.cache.set(url, gltf.scene);
          resolve(gltf.scene);
        }, undefined, reject);
      }
    });

    this.pending.set(url, promise);
    const model = await promise;
    this.pending.delete(url);
    return model.clone();
  }

  /**
   * Load 3D Font for TextGeometry
   */
  async loadFont(url: string): Promise<Font> {
    if (this.cache.has(url)) return this.cache.get(url);
    return new Promise((resolve, reject) => {
      this.fontLoader.load(url, (font) => {
        this.cache.set(url, font);
        resolve(font);
      }, undefined, reject);
    });
  }

  /**
   * Load 2D/3D Texture
   */
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
