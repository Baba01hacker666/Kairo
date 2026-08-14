import * as THREE from 'three';
import { CustomShaderMaterial } from '@kairo/renderer';
export declare class AzureGrottoWorld {
    group: THREE.Group;
    waterMaterial: CustomShaderMaterial;
    shrineGroup: THREE.Group;
    waterPonds: Array<{
        x: number;
        z: number;
        radius: number;
    }>;
    constructor(scene: THREE.Scene);
    getTerrainHeight(x: number, z: number): number;
    update(dt: number, timeSeconds: number): void;
}
