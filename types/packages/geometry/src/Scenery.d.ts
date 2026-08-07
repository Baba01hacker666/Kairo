import * as THREE from 'three';
/**
 * @kairo/geometry — Small composite scenery helpers (trees, rocks, clouds).
 * These are the "default objects" examples kept re-building by hand.
 */
export interface TreeOptions {
    position?: [number, number, number];
    scale?: number;
    seed?: number;
    trunkColor?: number | string;
    canopyColor?: number | string;
    trunkHeight?: number;
    trunkRadius?: number;
    canopyRadius?: number;
}
/** A stylized low-poly tree (cylinder trunk + dodecahedron canopy). */
export declare function createTree(opts?: TreeOptions): THREE.Group;
export interface RockOptions {
    position?: [number, number, number];
    scale?: number;
    seed?: number;
    color?: number | string;
    radius?: number;
}
/** A lumpy low-poly rock with perturbed vertices. */
export declare function createRock(opts?: RockOptions): THREE.Mesh;
export interface CloudOptions {
    position?: [number, number, number];
    scale?: number;
    color?: number | string;
}
/** A soft cloud made of a few overlapping flattened spheres. */
export declare function createCloud(opts?: CloudOptions): THREE.Group;
