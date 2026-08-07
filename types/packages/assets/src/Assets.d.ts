import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { CompressionStats } from './MeshCompressor.ts';
export type AssetModelType = 'gltf' | 'glb' | 'obj' | 'fbx' | 'stl' | 'ply' | 'dae' | 'vox' | 'drc' | 'blend';
export interface ModelBoundsInfo {
    width: number;
    height: number;
    depth: number;
    center: THREE.Vector3;
    size: THREE.Vector3;
    scaleFactor: number;
}
export declare class AssetManager {
    private cache;
    private pending;
    private gltfLoader;
    private dracoLoader;
    private objLoader;
    private fbxLoader;
    private stlLoader;
    private plyLoader;
    private colladaLoader;
    private voxLoader;
    private blendLoader;
    private svgLoader;
    private fontLoader;
    private textureLoader;
    constructor();
    /**
     * Auto-Fit & Auto-Scale Character/Prop Asset to Target Height & Bottom Pivot Alignment
     */
    autoFitModel(model: THREE.Object3D, targetHeight?: number): ModelBoundsInfo;
    /**
     * Auto-Generate Collision Collider Metadata for Character / Asset
     */
    generateAutoCollider(model: THREE.Object3D): {
        type: 'box' | 'capsule' | 'sphere';
        radius: number;
        height: number;
        halfExtents: [number, number, number];
    };
    /**
     * Parse Sketchfab URL or Model UID or direct GLB/GLTF stream URL
     */
    parseSketchfabUrl(input: string): {
        url: string;
        isSketchfab: boolean;
        uid?: string;
    };
    /**
     * Stream a 3D Model directly from Sketchfab or remote GLTF/GLB asset URL into the engine
     */
    streamSketchfabModel(urlOrUid: string, onProgress?: (percent: number) => void, targetHeight?: number): Promise<THREE.Object3D>;
    /**
     * Unified 3D Model Loader
     * Automatically handles compressed models (Draco .glb, .gltf, .drc, .obj, .fbx, .stl, .ply, .dae, .vox)
     */
    loadModel(url: string, autoCompress?: boolean, targetHeight?: number): Promise<THREE.Object3D>;
    private processLoadedModel;
    /**
     * Optimize & Compress a loaded 3D model hierarchy at runtime
     */
    compressModel(model: THREE.Object3D): CompressionStats[];
    loadFont(url: string): Promise<Font>;
    loadTexture(url: string): Promise<THREE.Texture>;
    loadText(url: string): Promise<string>;
    loadJSON<T = any>(url: string): Promise<T>;
    loadImage(url: string): Promise<HTMLImageElement>;
    get<T>(url: string): T | undefined;
    has(url: string): boolean;
    unload(url: string): void;
    clear(): void;
}
export declare const GlobalAssets: AssetManager;
