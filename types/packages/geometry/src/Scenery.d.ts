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
/**
 * Instanced scenery builders.
 *
 * Scattering hundreds of trees/rocks/clouds as individual meshes explodes the
 * draw-call count (each one also renders again into the shadow map). These
 * field builders collapse a whole population into a handful of InstancedMesh
 * draw calls — one per part type — while keeping per-instance color via
 * `instanceColor`. Use them whenever you need a forest, a rock field or a sky
 * full of clouds instead of a `for` loop of `createTree`/`createRock`.
 */
export interface TreeFieldItem extends TreeOptions {
    position: [number, number, number];
}
export interface TreeFieldOptions {
    trees: TreeFieldItem[];
    castShadow?: boolean;
    receiveShadow?: boolean;
}
/** A whole forest as 3 InstancedMesh draw calls (trunks, canopies, blobs). */
export declare function createTreeField(opts: TreeFieldOptions): THREE.Group;
export interface RockFieldItem extends RockOptions {
    position: [number, number, number];
}
export interface RockFieldOptions {
    rocks: RockFieldItem[];
    castShadow?: boolean;
    receiveShadow?: boolean;
}
/** A rock field as a single InstancedMesh draw call. */
export declare function createRockField(opts: RockFieldOptions): THREE.InstancedMesh;
export interface CloudFieldItem extends CloudOptions {
    position: [number, number, number];
}
export interface CloudFieldOptions {
    clouds: CloudFieldItem[];
    castShadow?: boolean;
}
/** A sky full of clouds as a single InstancedMesh draw call. */
export declare function createCloudField(opts: CloudFieldOptions): THREE.Group;
/** A soft cloud made of a few overlapping flattened spheres. */
export declare function createCloud(opts?: CloudOptions): THREE.Group;
