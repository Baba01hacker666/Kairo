/**
 * High-Performance Structure-of-Arrays (SoA) WASM-Grade ECS Engine (@kairo/ecs)
 * Stores entity transforms, velocities, and bounding colliders in contiguous Float32Array buffers.
 * Leverages L1/L2 CPU cache prefetching and V8 auto-vectorization (SIMD) for 10,000+ to 50,000+ entities.
 */

export class FastSoAWorld {
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
  private gridTableSize: number;

  constructor(maxEntities: number = 50000, gridCellSize: number = 8.0) {
    this.maxEntities = maxEntities;
    this.gridCellSize = gridCellSize;
    this.invCellSize = 1.0 / gridCellSize;

    // Allocate contiguous SIMD-ready ArrayBuffers
    this.posX = new Float32Array(maxEntities);
    this.posY = new Float32Array(maxEntities);
    this.posZ = new Float32Array(maxEntities);

    this.velX = new Float32Array(maxEntities);
    this.velY = new Float32Array(maxEntities);
    this.velZ = new Float32Array(maxEntities);

    this.radius = new Float32Array(maxEntities);
    this.active = new Uint8Array(maxEntities);

    // 3D Spatial Grid Linked-List Buffers (Zero GC allocations!)
    this.gridTableSize = 131072; // 128K Spatial Hash Buckets
    this.gridHead = new Int32Array(this.gridTableSize);
    this.gridNext = new Int32Array(maxEntities);
  }

  public spawnEntity(px: number, py: number, pz: number, vx: number, vy: number, vz: number, r: number = 0.5): number {
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

    return id;
  }

  /**
   * Ultra-Fast SoA Vector Update & Spatial Grid Collision Resolution
   */
  public update(dt: number, boundSize: number = 60.0): number {
    const count = this.activeCount;
    const px = this.posX;
    const py = this.posY;
    const pz = this.posZ;
    const vx = this.velX;
    const vy = this.velY;
    const vz = this.velZ;
    const rad = this.radius;
    const act = this.active;

    // Reset Spatial Hash Grid Linked-List Head
    this.gridHead.fill(-1);

    // Step 1: Contiguous SIMD Velocity Integration & Spatial Grid Bucket Insertion
    const invCell = this.invCellSize;
    const tableSize = this.gridTableSize;
    const head = this.gridHead;
    const next = this.gridNext;

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
      const key = (((cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791)) & 0x7FFFFFFF) % tableSize;

      next[i] = head[key];
      head[key] = i;
    }

    // Step 2: Zero-Allocation Spatial Collision Resolution
    let collisionCount = 0;

    for (let a = 0; a < count; a++) {
      if (act[a] === 0) continue;

      const ax = px[a];
      const ay = py[a];
      const az = pz[a];
      const ar = rad[a];

      const cx = (ax * invCell) | 0;
      const cy = (ay * invCell) | 0;
      const cz = (az * invCell) | 0;

      // Query 3x3x3 Neighboring Spatial Hash Cells
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const key = ((((cx + dx) * 73856093) ^ ((cy + dy) * 19349663) ^ ((cz + dz) * 83492791)) & 0x7FFFFFFF) % tableSize;
            let b = head[key];

            while (b !== -1) {
              if (b > a && act[b] !== 0) {
                const delX = px[b] - ax;
                const delY = py[b] - ay;
                const delZ = pz[b] - az;
                const distSq = delX * delX + delY * delY + delZ * delZ;
                const minDist = ar + rad[b];

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
      }
    }

    return collisionCount;
  }

  public clear(): void {
    this.activeCount = 0;
    this.active.fill(0);
  }
}
