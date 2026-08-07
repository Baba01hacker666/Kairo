/**
 * High-Performance Structure-of-Arrays (SoA) WASM-Grade ECS Engine (@kairo/ecs)
 * Stores entity transforms, velocities, and bounding colliders in contiguous Float32Array buffers.
 * Leverages L1/L2 CPU cache prefetching and V8 auto-vectorization (SIMD) for 10,000+ to 50,000+ entities.
 */
import type { EntityId } from './ECS.js';
export type FastSoAEntityId = EntityId;
export interface FastSoAWorldOptions {
    maxEntities?: number;
    gridCellSize?: number;
}
export interface SoAWasmExports {
    memory: WebAssembly.Memory;
    set_cell_size(size: number): void;
    get_pos_x(): number;
    get_pos_y(): number;
    get_pos_z(): number;
    get_vel_x(): number;
    get_vel_y(): number;
    get_vel_z(): number;
    get_radius(): number;
    get_active(): number;
    spawn_entity(id: number, px: number, py: number, pz: number, vx: number, vy: number, vz: number, r: number): void;
    clear_entities(): void;
    update(count: number, dt: number, boundSize: number): number;
    write_instance_matrices(outMatrixArrayPointer: number, count: number): void;
}
export interface EngineTelemetryStats {
    activeEntities: number;
    fps: number;
    simTimeMs: number;
    matrixTimeMs: number;
    throughput: number;
    memoryUsageBytes: number;
    isWasmMode: boolean;
    engineMode: string;
}
export declare class FastSoAWorld {
    static wasmExports: SoAWasmExports | null;
    static isWasmLoaded: boolean;
    isWasmMode: boolean;
    maxEntities: number;
    activeCount: number;
    posX: Float32Array;
    posY: Float32Array;
    posZ: Float32Array;
    velX: Float32Array;
    velY: Float32Array;
    velZ: Float32Array;
    radius: Float32Array;
    active: Uint8Array;
    private gridCellSize;
    private invCellSize;
    private gridHead;
    private gridNext;
    private gridTag;
    private gridTableSize;
    private gridTableMask;
    private frameId;
    static loadWasm(wasmUrl?: string): Promise<boolean>;
    static initSyncWasm(wasmBuffer: ArrayBuffer | Uint8Array): boolean;
    constructor(maxEntities?: number, gridCellSize?: number);
    spawnEntity(px: number, py: number, pz: number, vx: number, vy: number, vz: number, r?: number): EntityId;
    /**
     * Ultra-Fast SoA Vector Update & Spatial Grid Collision Resolution
     */
    update(dt: number, boundSize?: number): number;
    getMemoryFootprintBytes(): number;
    clear(): void;
}
