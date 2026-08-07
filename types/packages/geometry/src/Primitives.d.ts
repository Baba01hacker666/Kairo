import * as THREE from 'three';
/**
 * @kairo/geometry — Reusable primitive mesh builders.
 *
 * Every builder returns a ready-to-use THREE.Mesh with a standard PBR material,
 * sensible shadow defaults and an optional position/rotation. The goal is to
 * kill the repeated `new THREE.BoxGeometry(...) + new THREE.MeshStandardMaterial(...)`
 * boilerplate that used to live inline in every example.
 */
export interface PrimitiveOptions {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    color?: number | string;
    roughness?: number;
    metalness?: number;
    emissive?: number | string;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    side?: THREE.Side;
    material?: THREE.Material;
}
/** Axis-aligned box / block. */
export declare function createBlock(size: [number, number, number], opts?: PrimitiveOptions): THREE.Mesh;
/** UV sphere. */
export declare function createSphere(radius: number, opts?: PrimitiveOptions): THREE.Mesh;
/** Flat plane (XZ by default — rotate to XY if you need a wall). */
export declare function createPlane(width: number, height: number, opts?: PrimitiveOptions): THREE.Mesh;
/** Cylinder / pillar. */
export declare function createCylinder(radiusTop: number, radiusBottom: number, height: number, opts?: PrimitiveOptions): THREE.Mesh;
/** Cone / spike. */
export declare function createCone(radius: number, height: number, opts?: PrimitiveOptions): THREE.Mesh;
/** Torus / ring. */
export declare function createTorus(radius: number, tube: number, opts?: PrimitiveOptions): THREE.Mesh;
/** Capsule (pill shape). */
export declare function createCapsule(radius: number, length: number, opts?: PrimitiveOptions): THREE.Mesh;
/** Icosahedron (good for low-poly gems/orbs). */
export declare function createIcosahedron(radius: number, detail?: number, opts?: PrimitiveOptions): THREE.Mesh;
/** Dodecahedron (good for low-poly rocks/crystals). */
export declare function createDodecahedron(radius: number, detail?: number, opts?: PrimitiveOptions): THREE.Mesh;
