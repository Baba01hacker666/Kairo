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

export class FastSoAWorld {
  public static wasmExports: SoAWasmExports | null = null;
  public static isWasmLoaded: boolean = false;
  public isWasmMode: boolean = false;

  public maxEntities: number;
  public activeCount: number = 0;

  // Contiguous Structure-of-Arrays (SoA) Buffers
  public posX: Float32Array;
  public posY: Float32Array;
  public posZ: Float32Array;

  public velX: Float32Array;
  public velY: Float32Array;
  public velZ: Float32Array;

  public radius: Float32Array;
  public active: Uint8Array;

  // High-Speed Spatial Partitioning Grid Cells
  private gridCellSize: number;
  private invCellSize: number;
  private gridHead: Int32Array;
  private gridNext: Int32Array;
  private gridTag: Uint32Array;
  private gridTableSize: number;
  private gridTableMask: number;
  private frameId: number = 1;

  public static async loadWasm(wasmUrl?: string): Promise<boolean> {
    if (FastSoAWorld.isWasmLoaded) return true;
    try {
      const baseUrl = (import.meta as any).env?.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

      const candidateUrls: string[] = [];
      if (wasmUrl) candidateUrls.push(wasmUrl);
      candidateUrls.push(
        `${cleanBase}wasm/kairo_soa_physics.wasm`,
        `../../wasm/kairo_soa_physics.wasm`,
        `../wasm/kairo_soa_physics.wasm`,
        `./wasm/kairo_soa_physics.wasm`,
        `/wasm/kairo_soa_physics.wasm`,
        `wasm/kairo_soa_physics.wasm`
      );

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const bytes = await res.arrayBuffer();
            const mod = await WebAssembly.instantiate(bytes, {});
            FastSoAWorld.wasmExports = mod.instance.exports as unknown as SoAWasmExports;
            FastSoAWorld.isWasmLoaded = true;
            console.log(`⚡ [FastSoAWorld] WASM Physics Kernel loaded successfully from ${url}`);
            return true;
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn("[FastSoAWorld] WASM load fallback to optimized JS engine:", e);
    }
    return false;
  }

  public static initSyncWasm(wasmBuffer: ArrayBuffer | Uint8Array): boolean {
    try {
      const bytes = wasmBuffer instanceof Uint8Array ? wasmBuffer : new Uint8Array(wasmBuffer);
      const mod = new WebAssembly.Module(bytes as BufferSource);
      const instance = new WebAssembly.Instance(mod, {});
      FastSoAWorld.wasmExports = instance.exports as unknown as SoAWasmExports;
      FastSoAWorld.isWasmLoaded = true;
      return true;
    } catch (e) {
      console.warn("[FastSoAWorld] WASM sync init failed:", e);
      return false;
    }
  }

  constructor(maxEntities: number = 50000, gridCellSize: number = 12.0) {
    this.maxEntities = maxEntities;
    this.gridCellSize = gridCellSize;
    this.invCellSize = 1.0 / gridCellSize;

    if (FastSoAWorld.wasmExports) {
      const exp = FastSoAWorld.wasmExports;
      const mem = exp.memory.buffer;
      exp.set_cell_size(gridCellSize);
      this.posX = new Float32Array(mem, exp.get_pos_x(), maxEntities);
      this.posY = new Float32Array(mem, exp.get_pos_y(), maxEntities);
      this.posZ = new Float32Array(mem, exp.get_pos_z(), maxEntities);
      this.velX = new Float32Array(mem, exp.get_vel_x(), maxEntities);
      this.velY = new Float32Array(mem, exp.get_vel_y(), maxEntities);
      this.velZ = new Float32Array(mem, exp.get_vel_z(), maxEntities);
      this.radius = new Float32Array(mem, exp.get_radius(), maxEntities);
      this.active = new Uint8Array(mem, exp.get_active(), maxEntities);
      this.isWasmMode = true;

      this.gridTableSize = 0;
      this.gridTableMask = 0;
      this.gridHead = new Int32Array(0);
      this.gridTag = new Uint32Array(0);
      this.gridNext = new Int32Array(0);
    } else {
      // Allocate contiguous SIMD-ready ArrayBuffers for JS fallback engine
      this.posX = new Float32Array(maxEntities);
      this.posY = new Float32Array(maxEntities);
      this.posZ = new Float32Array(maxEntities);

      this.velX = new Float32Array(maxEntities);
      this.velY = new Float32Array(maxEntities);
      this.velZ = new Float32Array(maxEntities);

      this.radius = new Float32Array(maxEntities);
      this.active = new Uint8Array(maxEntities);

      // 3D Spatial Grid Linked-List Buffers
      this.gridTableSize = 131072; // 128K Spatial Hash Buckets (2^17)
      this.gridTableMask = this.gridTableSize - 1;
      this.gridHead = new Int32Array(this.gridTableSize);
      this.gridTag = new Uint32Array(this.gridTableSize);
      this.gridNext = new Int32Array(maxEntities);
    }
  }

  public spawnEntity(px: number, py: number, pz: number, vx: number, vy: number, vz: number, r: number = 0.5): EntityId {
    if (this.activeCount >= this.maxEntities) return -1;

    const id = this.activeCount++;
    this.posX[id] = px;
    this.posY[id] = py;
    this.posZ[id] = pz;
    this.velX[id] = vx;
    this.velY[id] = vy;
    this.velZ[id] = vz;
    this.radius[id] = r;
    this.active[id] = 1;

    if (this.isWasmMode && FastSoAWorld.wasmExports) {
      FastSoAWorld.wasmExports.spawn_entity(id, px, py, pz, vx, vy, vz, r);
    }

    return id;
  }

  /**
   * Ultra-Fast SoA Vector Update & Spatial Grid Collision Resolution
   */
  public update(dt: number, boundSize: number = 60.0): number {
    const count = this.activeCount;

    if (this.isWasmMode && FastSoAWorld.wasmExports) {
      return FastSoAWorld.wasmExports.update(count, dt, boundSize);
    }

    const px = this.posX;
    const py = this.posY;
    const pz = this.posZ;
    const vx = this.velX;
    const vy = this.velY;
    const vz = this.velZ;
    const rad = this.radius;
    const act = this.active;

    // Advance frame tag to avoid clearing gridHead array every frame
    const frameId = ++this.frameId;
    if (frameId === 0xFFFFFFFF) {
      this.gridTag.fill(0);
      this.frameId = 1;
    }

    const invCell = this.invCellSize;
    const tableMask = this.gridTableMask;
    const head = this.gridHead;
    const tag = this.gridTag;
    const next = this.gridNext;

    // Step 1: Contiguous SIMD Velocity Integration & Spatial Grid Bucket Insertion
    for (let i = 0; i < count; i++) {
      if (act[i] === 0) continue;

      // Update position via 3D velocity
      let x = px[i] + vx[i] * dt;
      let y = py[i] + vy[i] * dt;
      let z = pz[i] + vz[i] * dt;

      // World Boundary Bounce
      if (x < -boundSize) { x = -boundSize; vx[i] = -vx[i]; }
      else if (x > boundSize) { x = boundSize; vx[i] = -vx[i]; }

      if (y < -boundSize) { y = -boundSize; vy[i] = -vy[i]; }
      else if (y > boundSize) { y = boundSize; vy[i] = -vy[i]; }

      if (z < -boundSize) { z = -boundSize; vz[i] = -vz[i]; }
      else if (z > boundSize) { z = boundSize; vz[i] = -vz[i]; }

      px[i] = x;
      py[i] = y;
      pz[i] = z;

      // Bitwise Hash Insertion
      const cx = (x * invCell) | 0;
      const cy = (y * invCell) | 0;
      const cz = (z * invCell) | 0;
      const key = ((cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791)) & tableMask;

      if (tag[key] !== frameId) {
        tag[key] = frameId;
        head[key] = -1;
      }
      next[i] = head[key];
      head[key] = i;
    }

    // Step 2: Zero-Allocation Spatial Collision Resolution
    let collisionCount = 0;

    const OFF_X = [0, -1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, 1];
    const OFF_Y = [0, -1,-1,-1,  0, 0, 0,  1, 1, 1,  1, 1, 1, 0];
    const OFF_Z = [0,  1, 1, 1,  1, 1, 1,  1, 1, 1,  0, 0, 0, 0];

    for (let a = 0; a < count; a++) {
      if (act[a] === 0) continue;

      const ax = px[a];
      const ay = py[a];
      const az = pz[a];
      const ar = rad[a];

      const cx = (ax * invCell) | 0;
      const cy = (ay * invCell) | 0;
      const cz = (az * invCell) | 0;

      // Query Self Cell (k=0) and 13 Forward Neighbor Cells (k=1..13)
      for (let k = 0; k < 14; k++) {
        const key = (((cx + OFF_X[k]) * 73856093) ^ ((cy + OFF_Y[k]) * 19349663) ^ ((cz + OFF_Z[k]) * 83492791)) & tableMask;
        if (tag[key] !== frameId) continue;

        let b = head[key];
        const isSelf = (k === 0);

        while (b !== -1) {
          if ((!isSelf || b > a) && act[b] !== 0) {
            const minDist = ar + rad[b];

            const delX = px[b] - ax;
            if (delX >= minDist || delX <= -minDist) { b = next[b]; continue; }

            const delY = py[b] - ay;
            if (delY >= minDist || delY <= -minDist) { b = next[b]; continue; }

            const delZ = pz[b] - az;
            if (delZ >= minDist || delZ <= -minDist) { b = next[b]; continue; }

            const distSq = delX * delX + delY * delY + delZ * delZ;

            if (distSq < minDist * minDist && distSq > 0.0001) {
              collisionCount++;
              const dist = Math.sqrt(distSq);
              const nx = delX / dist;
              const ny = delY / dist;
              const nz = delZ / dist;

              // Separate Overlap
              const overlap = 0.5 * (minDist - dist);
              px[a] -= nx * overlap;
              py[a] -= ny * overlap;
              pz[a] -= nz * overlap;
              px[b] += nx * overlap;
              py[b] += ny * overlap;
              pz[b] += nz * overlap;

              // Elastic Bounce Vector Impulse
              const kx = vx[a] - vx[b];
              const ky = vy[a] - vy[b];
              const kz = vz[a] - vz[b];
              const p = nx * kx + ny * ky + nz * kz;

              vx[a] -= p * nx;
              vy[a] -= p * ny;
              vz[a] -= p * nz;
              vx[b] += p * nx;
              vy[b] += p * ny;
              vz[b] += p * nz;
            }
          }
          b = next[b];
        }
      }
    }

    return collisionCount;
  }

  public getMemoryFootprintBytes(): number {
    if (this.isWasmMode && FastSoAWorld.wasmExports) {
      return FastSoAWorld.wasmExports.memory.buffer.byteLength;
    }
    const floatBytes = this.posX.byteLength * 7;
    const byteBytes = this.active.byteLength;
    const gridBytes = (this.gridHead.byteLength + this.gridTag.byteLength + this.gridNext.byteLength);
    return floatBytes + byteBytes + gridBytes;
  }

  public clear(): void {
    this.activeCount = 0;
    this.active.fill(0);
    if (this.isWasmMode && FastSoAWorld.wasmExports) {
      FastSoAWorld.wasmExports.clear_entities();
    }
  }
}
