import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
export declare class Character {
    app: KairoApp;
    group: THREE.Group;
    wanderer: THREE.Group | null;
    wandererLight: THREE.PointLight;
    eyeGlowMat: THREE.MeshBasicMaterial;
    constructor(app: KairoApp);
    load(baseUrl: string): Promise<void>;
    update(t: number, dt: number, lit: boolean): void;
}
