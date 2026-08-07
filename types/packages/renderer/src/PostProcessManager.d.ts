import * as THREE from 'three';
export declare class PostProcessManager {
    private renderer;
    private scene;
    private camera;
    private composer;
    private renderPass;
    private bloomPass;
    private outlinePass;
    private filmPass;
    private pixelatedPass;
    private outputPass;
    enabled: boolean;
    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera);
    render(dt: number): void;
    toggleBloom(enabled: boolean, intensity?: number): void;
    toggleFilmGrain(enabled: boolean): void;
    togglePixelation(enabled: boolean, pixelSize?: number): void;
    setSelectionOutline(objects: THREE.Object3D[], color?: string): void;
    private checkEnabled;
}
