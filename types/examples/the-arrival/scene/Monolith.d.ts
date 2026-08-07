import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
export declare class Monolith {
    app: KairoApp;
    group: THREE.Group;
    obeliskMat: THREE.MeshStandardMaterial;
    coreMat: THREE.MeshBasicMaterial;
    ring: THREE.Mesh;
    ring2: THREE.Mesh;
    heartLight: THREE.PointLight;
    fillLight: THREE.PointLight;
    pillarMat: THREE.MeshBasicMaterial;
    orbs: THREE.Mesh[];
    constructor(app: KairoApp);
    update(t: number, dt: number, lit: boolean): void;
}
