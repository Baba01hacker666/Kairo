import * as THREE from 'three';
/**
 * @kairo/geometry — Instanced grass field.
 *
 * Every patch is a single draw call (InstancedMesh), so you can scatter
 * thousands of blades without tanking the frame budget.
 */
export interface GrassOptions {
    count?: number;
    area?: number;
    height?: [number, number];
    width?: number;
    seed?: number;
    color?: number | string;
    tipColor?: number | string;
    position?: [number, number, number];
    castShadow?: boolean;
    /**
     * Height sampler, e.g. the `heightAt(x, z)` returned by `createTerrain`.
     * When provided, every blade base is pinned to the surface height instead of
     * hovering over or burying into the ground (fixes grass-on-terrain fuzz).
     */
    heightAt?: (x: number, z: number) => number;
    /** Fade height (kept above 0 for numerical safety). */
    fadeDistance?: number;
}
export declare function createGrassField(opts?: GrassOptions): THREE.InstancedMesh;
