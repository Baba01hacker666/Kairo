import * as THREE from 'three';
export interface ModelStreamPreset {
    id: string;
    name: string;
    author: string;
    badge: string;
    url: string;
    description: string;
    scale?: number;
}
export declare const PRESET_MODEL_STREAMS: ModelStreamPreset[];
export declare class SketchfabStreamer {
    private loader;
    /**
     * Parse Sketchfab URL or Model UID or direct GLB/GLTF stream URL
     */
    parseStreamUrl(input: string): {
        url: string;
        isSketchfab: boolean;
        uid?: string;
    };
    /**
     * Load and stream a 3D model from Sketchfab or remote URL
     */
    loadStreamedModel(urlOrUid: string, onProgress?: (progress: number) => void): Promise<{
        scene: THREE.Group;
        animations: THREE.AnimationClip[];
        name: string;
    }>;
}
export declare const globalSketchfabStreamer: SketchfabStreamer;
