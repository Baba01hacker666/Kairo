import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
export declare class DebugRenderer {
    private app;
    private gridHelper;
    private axesHelper;
    private cameraHelper;
    private boundingBoxHelpers;
    private wireframeMaterials;
    private isWireframeMode;
    constructor(app: KairoApp);
    /**
     * Toggles a 3D Grid Overlay on the XZ plane.
     */
    toggleGrid(size?: number, divisions?: number): void;
    /**
     * Toggles the Global Pivot/Origin indicator (AxesHelper)
     */
    toggleOriginIndicator(size?: number): void;
    /**
     * Toggles a global wireframe mode for all meshes in the scene.
     */
    toggleWireframe(): void;
    /**
     * Draws an AABB Bounding Box around a specific 3D Object.
     */
    showBoundingBox(object: THREE.Object3D, color?: number): void;
    /**
     * Removes an AABB Bounding Box around a specific 3D Object.
     */
    hideBoundingBox(object: THREE.Object3D): void;
    /**
     * Clears all debug visualizations
     */
    clear(): void;
}
