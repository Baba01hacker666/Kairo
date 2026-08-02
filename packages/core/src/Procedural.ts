/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 */
export class PRNG {
  private state: number;

  constructor(seed: number = Date.now()) {
    this.state = seed;
  }

  /** Returns a float between 0 (inclusive) and 1 (exclusive) */
  public next(): number {
    this.state |= 0;
    this.state = this.state + 0x6d2b79f5 | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer between min and max (inclusive) */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns a float between min and max (exclusive of max) */
  public nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}

/**
 * Fast Simplex Noise Implementation (2D & 3D)
 */
export class SimplexNoise {
  private p: Uint8Array = new Uint8Array(512);
  private perm: Uint8Array = new Uint8Array(512);
  private permMod12: Uint8Array = new Uint8Array(512);

  constructor(seed?: number) {
    const prng = new PRNG(seed ?? Date.now());
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }
    for (let i = 0; i < 255; i++) {
      const r = i + ~~(prng.next() * (256 - i));
      const aux = this.p[i];
      this.p[i] = this.p[r];
      this.p[r] = aux;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = (this.perm[i] % 12);
    }
  }

  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  private dot3(g: number[], x: number, y: number, z: number): number {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  public noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(grad3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }
}

const grad3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];


/**
 * Cellular Automata Cave Generator
 */
export class CellularAutomata {
  public map: number[][];
  private width: number;
  private height: number;
  private prng: PRNG;

  constructor(width: number, height: number, fillProbability: number = 0.45, seed?: number) {
    this.width = width;
    this.height = height;
    this.map = [];
    this.prng = new PRNG(seed ?? Date.now());

    // Initialize random noise map
    for (let x = 0; x < width; x++) {
      this.map[x] = [];
      for (let y = 0; y < height; y++) {
        // Borders are always walls
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          this.map[x][y] = 1;
        } else {
          this.map[x][y] = this.prng.next() < fillProbability ? 1 : 0;
        }
      }
    }
  }

  public smooth(iterations: number = 5): void {
    for (let i = 0; i < iterations; i++) {
      const newMap: number[][] = [];
      for (let x = 0; x < this.width; x++) {
        newMap[x] = [];
        for (let y = 0; y < this.height; y++) {
          const neighborWallCount = this.getSurroundingWallCount(x, y);
          if (neighborWallCount > 4) {
            newMap[x][y] = 1;
          } else if (neighborWallCount < 4) {
            newMap[x][y] = 0;
          } else {
            newMap[x][y] = this.map[x][y];
          }
        }
      }
      this.map = newMap;
    }
  }

  private getSurroundingWallCount(gridX: number, gridY: number): number {
    let wallCount = 0;
    for (let neighborX = gridX - 1; neighborX <= gridX + 1; neighborX++) {
      for (let neighborY = gridY - 1; neighborY <= gridY + 1; neighborY++) {
        if (neighborX >= 0 && neighborX < this.width && neighborY >= 0 && neighborY < this.height) {
          if (neighborX !== gridX || neighborY !== gridY) {
            wallCount += this.map[neighborX][neighborY];
          }
        } else {
          wallCount++; // Out of bounds counts as a wall
        }
      }
    }
    return wallCount;
  }
}
