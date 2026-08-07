import * as THREE from 'three';
import { Collider } from '@kairo/physics';
/**
 * @kairo/geometry — Collider derivation.
 *
 * Maps a THREE mesh's geometry (box / sphere / capsule / cylinder / cone /
 * torus / plane / icosahedron / dodecahedron) to a Kairo `Collider` so
 * procedural objects are physical by default. Pure + engine-free: the caller
 * (usually `KairoApp`) owns registering the body in a `PhysicsWorld` and
 * syncing the cannon body back to the mesh each frame.
 *
 * Pass-through stays the explicit opt-out: don't attach a collider (or drop
 * the object onto a specific collision layer), and the mesh just renders.
 */
/**
 * Derive a collider for a THREE mesh based on its geometry type.
 * Falls back to a box fitted to the mesh's world bounding box.
 */
export declare function deriveCollider(mesh: THREE.Object3D): Collider;
