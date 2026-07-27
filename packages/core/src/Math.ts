/**
 * Kairo Engine Math Library
 * High-performance 2D/3D math primitives: Vector2, Vector3, Vector4, Matrix4, Quaternion, Ray, BoundingBox, Color.
 */

export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  normalize(): this {
    const len = this.length();
    if (len > 0) {
      this.scale(1 / len);
    }
    return this;
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  distanceTo(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }
}

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  add(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v: Vector3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  scale(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  normalize(): this {
    const len = this.length();
    if (len > 0) {
      this.scale(1 / len);
    }
    return this;
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vector3 {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    return new Vector3(x, y, z);
  }

  distanceTo(v: Vector3): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  lerp(v: Vector3, t: number): this {
    this.x += (v.x - this.x) * t;
    this.y += (v.y - this.y) * t;
    this.z += (v.z - this.z) * t;
    return this;
  }

  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  static one(): Vector3 {
    return new Vector3(1, 1, 1);
  }
}

export class Vector4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

export class Quaternion {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  set(x: number, y: number, z: number, w: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  identity(): this {
    return this.set(0, 0, 0, 1);
  }

  setFromEuler(pitch: number, yaw: number, roll: number): this {
    const c1 = Math.cos(pitch / 2);
    const c2 = Math.cos(yaw / 2);
    const c3 = Math.cos(roll / 2);
    const s1 = Math.sin(pitch / 2);
    const s2 = Math.sin(yaw / 2);
    const s3 = Math.sin(roll / 2);

    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 + s1 * s2 * c3;
    this.w = c1 * c2 * c3 - s1 * s2 * s3;

    return this;
  }

  slerp(qb: Quaternion, t: number): this {
    let cosHalfTheta = this.w * qb.w + this.x * qb.x + this.y * qb.y + this.z * qb.z;
    if (Math.abs(cosHalfTheta) >= 1.0) {
      return this;
    }

    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
      this.w = this.w * 0.5 + qb.w * 0.5;
      this.x = this.x * 0.5 + qb.x * 0.5;
      this.y = this.y * 0.5 + qb.y * 0.5;
      this.z = this.z * 0.5 + qb.z * 0.5;
      return this;
    }

    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this.w = this.w * ratioA + qb.w * ratioB;
    this.x = this.x * ratioA + qb.x * ratioB;
    this.y = this.y * ratioA + qb.y * ratioB;
    this.z = this.z * ratioA + qb.z * ratioB;

    return this;
  }
}

export class Matrix4 {
  public elements: Float32Array = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);

  identity(): this {
    const e = this.elements;
    e[0] = 1; e[4] = 0; e[8] = 0; e[12] = 0;
    e[1] = 0; e[5] = 1; e[9] = 0; e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
    return this;
  }

  compose(position: Vector3, rotation: Quaternion, scale: Vector3): this {
    const x = rotation.x, y = rotation.y, z = rotation.z, w = rotation.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    const sx = scale.x, sy = scale.y, sz = scale.z;

    const te = this.elements;
    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;

    return this;
  }
}

export class Color {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  setHex(hex: string): this {
    hex = hex.replace('#', '');
    if (hex.length === 6) {
      this.r = parseInt(hex.substring(0, 2), 16) / 255;
      this.g = parseInt(hex.substring(2, 4), 16) / 255;
      this.b = parseInt(hex.substring(4, 6), 16) / 255;
      this.a = 1.0;
    }
    return this;
  }

  toHex(): string {
    const r = Math.round(this.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(this.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(this.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
}

export class Ray {
  public origin: Vector3;
  public direction: Vector3;

  constructor(origin: Vector3 = new Vector3(), direction: Vector3 = new Vector3(0, 0, -1)) {
    this.origin = origin;
    this.direction = direction;
  }
}

export class BoundingBox {
  public min: Vector3;
  public max: Vector3;

  constructor(min: Vector3 = new Vector3(-1, -1, -1), max: Vector3 = new Vector3(1, 1, 1)) {
    this.min = min;
    this.max = max;
  }

  intersectsBox(other: BoundingBox): boolean {
    return (
      this.max.x >= other.min.x && this.min.x <= other.max.x &&
      this.max.y >= other.min.y && this.min.y <= other.max.y &&
      this.max.z >= other.min.z && this.min.z <= other.max.z
    );
  }
}

export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }
}
