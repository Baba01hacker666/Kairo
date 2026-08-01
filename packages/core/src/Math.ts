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

  copy(q: Quaternion): this {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  }

  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
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

  copy(m: Matrix4): this {
    this.elements.set(m.elements);
    return this;
  }

  clone(): Matrix4 {
    const mat = new Matrix4();
    mat.copy(this);
    return mat;
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

  multiplyMatrices(a: Matrix4, b: Matrix4): this {
    const ae = a.elements;
    const be = b.elements;
    const te = this.elements;

    const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

    const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
  }

  multiply(m: Matrix4): this {
    return this.multiplyMatrices(this, m);
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

  constructor(origin: Vector3 | { x: number; y: number; z: number } = new Vector3(), direction: Vector3 | { x: number; y: number; z: number } = new Vector3(0, 0, -1)) {
    this.origin = origin instanceof Vector3 ? origin : new Vector3(origin.x, origin.y, origin.z);
    this.direction = direction instanceof Vector3 ? direction : new Vector3(direction.x, direction.y, direction.z);
  }

  intersectBox(box: BoundingBox): { hasHit: boolean; distance: number; point: Vector3; normal: Vector3 } {
    const dirX = Math.abs(this.direction.x) < 0.00001 ? 0.00001 : this.direction.x;
    const dirY = Math.abs(this.direction.y) < 0.00001 ? 0.00001 : this.direction.y;
    const dirZ = Math.abs(this.direction.z) < 0.00001 ? 0.00001 : this.direction.z;

    let tmin = (box.min.x - this.origin.x) / dirX;
    let tmax = (box.max.x - this.origin.x) / dirX;
    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

    let tymin = (box.min.y - this.origin.y) / dirY;
    let tymax = (box.max.y - this.origin.y) / dirY;
    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

    if (tmin > tymax || tymin > tmax) {
      return { hasHit: false, distance: Infinity, point: new Vector3(), normal: new Vector3() };
    }

    if (tymin > tmin) tmin = tymin;
    if (tymax < tmax) tmax = tymax;

    let tzmin = (box.min.z - this.origin.z) / dirZ;
    let tzmax = (box.max.z - this.origin.z) / dirZ;
    if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

    if (tmin > tzmax || tzmin > tmax) {
      return { hasHit: false, distance: Infinity, point: new Vector3(), normal: new Vector3() };
    }

    if (tzmin > tmin) tmin = tzmin;

    const hitPoint = this.origin.clone().add(this.direction.clone().scale(tmin));
    const normal = new Vector3();
    const eps = 0.01;
    if (Math.abs(hitPoint.x - box.max.x) < eps) normal.x = 1;
    else if (Math.abs(hitPoint.x - box.min.x) < eps) normal.x = -1;
    else if (Math.abs(hitPoint.y - box.max.y) < eps) normal.y = 1;
    else if (Math.abs(hitPoint.y - box.min.y) < eps) normal.y = -1;
    else if (Math.abs(hitPoint.z - box.max.z) < eps) normal.z = 1;
    else if (Math.abs(hitPoint.z - box.min.z) < eps) normal.z = -1;
    else normal.z = 1;

    return {
      hasHit: tmin >= 0,
      distance: tmin,
      point: hitPoint,
      normal
    };
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
