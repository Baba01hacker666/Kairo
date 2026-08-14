/**
 * Kairo Engine Math Library
 * High-performance 2D/3D math primitives: Vector2, Vector3, Vector4, Matrix4, Quaternion, Ray, BoundingBox, Color.
 */
export declare class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
    copy(v: Vector2): this;
    clone(): Vector2;
    add(v: Vector2): this;
    sub(v: Vector2): this;
    scale(s: number): this;
    lengthSq(): number;
    length(): number;
    normalize(): this;
    dot(v: Vector2): number;
    distanceTo(v: Vector2): number;
    static zero(): Vector2;
}
export declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    scale(s: number): this;
    lengthSq(): number;
    length(): number;
    normalize(): this;
    dot(v: Vector3): number;
    cross(v: Vector3): Vector3;
    distanceTo(v: Vector3): number;
    lerp(v: Vector3, t: number): this;
    static zero(): Vector3;
    static one(): Vector3;
}
export declare class Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
}
export declare class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
    copy(q: Quaternion): this;
    clone(): Quaternion;
    identity(): this;
    setFromEuler(pitch: number, yaw: number, roll: number): this;
    slerp(qb: Quaternion, t: number): this;
}
export declare class Matrix4 {
    elements: Float32Array;
    identity(): this;
    copy(m: Matrix4): this;
    clone(): Matrix4;
    compose(position: Vector3, rotation: Quaternion, scale: Vector3): this;
    multiplyMatrices(a: Matrix4, b: Matrix4): this;
    multiply(m: Matrix4): this;
}
export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r?: number, g?: number, b?: number, a?: number);
    setHex(hex: string): this;
    toHex(): string;
}
export declare class Ray {
    origin: Vector3;
    direction: Vector3;
    private static _missResult;
    constructor(origin?: Vector3 | {
        x: number;
        y: number;
        z: number;
    }, direction?: Vector3 | {
        x: number;
        y: number;
        z: number;
    });
    intersectBox(box: BoundingBox, targetResult?: {
        hasHit: boolean;
        distance: number;
        point: Vector3;
        normal: Vector3;
    }): {
        hasHit: boolean;
        distance: number;
        point: Vector3;
        normal: Vector3;
    };
    intersectSphere(center: Vector3, radius: number, targetResult?: {
        hasHit: boolean;
        distance: number;
        point: Vector3;
        normal: Vector3;
    }): {
        hasHit: boolean;
        distance: number;
        point: Vector3;
        normal: Vector3;
    };
}
export declare class BoundingBox {
    min: Vector3;
    max: Vector3;
    constructor(min?: Vector3, max?: Vector3);
    intersectsBox(other: BoundingBox): boolean;
}
export declare class MathUtils {
    static clamp(value: number, min: number, max: number): number;
    static lerp(a: number, b: number, t: number): number;
    static degToRad(degrees: number): number;
    static radToDeg(radians: number): number;
}
