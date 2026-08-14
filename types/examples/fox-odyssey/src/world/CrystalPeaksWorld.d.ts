import * as THREE from 'three';
import { CustomShaderMaterial } from '@kairo/renderer';
export declare class CrystalPeaksWorld {
    group: THREE.Group;
    iceMaterial: CustomShaderMaterial;
    shrineGroup: THREE.Group;
    crystalGeysers: Array<{
        x: number;
        z: number;
        force: number;
    }>;
    constructor(scene: THREE.Scene);
    getTerrainHeight(x: number, z: number): number;
    checkGeyserBounce(playerPos: THREE.Vector3, now: number, onBounce: (force: number) => void): boolean;
    update(dt: number, timeSeconds: number): void;
}
