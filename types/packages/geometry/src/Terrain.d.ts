import * as THREE from 'three';
/**
 * @kairo/geometry — Heightmap terrain built from SimplexNoise (reuses the
 * seeded noise from @kairo/core). Returns the mesh plus a `heightAt(x, z)`
 * helper so you can place trees/rocks/players exactly on the surface.
 */
export interface TerrainOptions {
    size?: number;
    segments?: number;
    seed?: number;
    amplitude?: number;
    frequency?: number;
    octaves?: number;
    persistence?: number;
    position?: [number, number, number];
    color?: number | string;
    highColor?: number | string;
    roughness?: number;
    metalness?: number;
    wireframe?: boolean;
}
export interface TerrainResult {
    mesh: THREE.Mesh;
    geometry: THREE.PlaneGeometry;
    /** Sample the surface height at world XZ coordinates (after position offset). */
    heightAt: (x: number, z: number) => number;
    /** Raw 2D height field (y in [0, 1]) before amplitude scaling. */
    heights: number[][];
}
export declare function createTerrain(opts?: TerrainOptions): TerrainResult;
