/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 */
export declare class PRNG {
    private state;
    constructor(seed?: number);
    /** Returns a float between 0 (inclusive) and 1 (exclusive) */
    next(): number;
    /** Returns an integer between min and max (inclusive) */
    nextInt(min: number, max: number): number;
    /** Returns a float between min and max (exclusive of max) */
    nextFloat(min: number, max: number): number;
}
/**
 * Fast Simplex Noise Implementation (2D & 3D)
 */
export declare class SimplexNoise {
    private p;
    private perm;
    private permMod12;
    constructor(seed?: number);
    private dot;
    private dot3;
    noise2D(xin: number, yin: number): number;
}
/**
 * Cellular Automata Cave Generator
 */
export declare class CellularAutomata {
    map: number[][];
    private width;
    private height;
    private prng;
    constructor(width: number, height: number, fillProbability?: number, seed?: number);
    smooth(iterations?: number): void;
    private getSurroundingWallCount;
}
