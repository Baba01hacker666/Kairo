import * as THREE from 'three';
export interface BlendHeader {
    pointerSize: number;
    littleEndian: boolean;
    version: string;
}
export interface BlendBlock {
    code: string;
    size: number;
    oldAddress: bigint | number;
    sdnaIndex: number;
    count: number;
    dataOffset: number;
}
/**
 * Native Blender (.blend) 3D Model File Loader for Kairo Engine & Three.js
 */
export declare class BlendLoader {
    private loader;
    setPath(value: string): this;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<THREE.Group>;
    load(url: string, onLoad: (group: THREE.Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent | Error) => void): void;
    /**
     * Parse binary .blend file ArrayBuffer into Three.js 3D Group hierarchy
     */
    parse(buffer: ArrayBuffer): THREE.Group;
    private createPlaceholderMesh;
}
