import * as THREE from 'three';
import { CustomShaderMaterial } from '../../../../packages/renderer/src/index.js';
export declare class GroveWorld {
    group: THREE.Group;
    waterMaterial: CustomShaderMaterial;
    shrineGroup: THREE.Group;
    constructor(scene: THREE.Scene, mobile?: boolean);
    getTerrainHeight(x: number, z: number): number;
    update(dt: number, timeSeconds: number): void;
}
