import * as THREE from 'three';
import { Collider, ColliderType } from '@kairo/physics';
import { Vector3 } from '@kairo/core';

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
export function deriveCollider(mesh: THREE.Object3D): Collider {
  const collider = new Collider();
  const geo = (mesh as THREE.Mesh).geometry;
  const scale = mesh.getWorldScale(new THREE.Vector3());

  const setBox = (w: number, h: number, d: number) => {
    collider.type = ColliderType.Box;
    collider.size = new Vector3(w * scale.x, h * scale.y, d * scale.z);
  };
  const setSphere = (radius: number) => {
    collider.type = ColliderType.Sphere;
    collider.size = new Vector3(radius * 2 * scale.x, radius * 2 * scale.y, radius * 2 * scale.z);
  };
  const setCapsule = (radius: number, height: number) => {
    collider.type = ColliderType.Capsule;
    collider.size = new Vector3(radius * 2 * scale.x, height * scale.y, radius * 2 * scale.z);
  };

  if (geo instanceof THREE.BoxGeometry) {
    const p = geo.parameters as { width: number; height: number; depth: number };
    setBox(p.width, p.height, p.depth);
  } else if (geo instanceof THREE.SphereGeometry) {
    setSphere((geo.parameters as { radius: number }).radius);
  } else if (geo instanceof THREE.CapsuleGeometry) {
    const p = geo.parameters as { radius: number; height: number };
    setCapsule(p.radius, p.height + p.radius * 2);
  } else if (geo instanceof THREE.CylinderGeometry) {
    const p = geo.parameters as { radiusTop: number; radiusBottom: number; height: number };
    setCapsule(Math.max(p.radiusTop, p.radiusBottom), p.height);
  } else if (geo instanceof THREE.ConeGeometry) {
    const p = geo.parameters as { radius: number; height: number };
    setCapsule(p.radius, p.height);
  } else if (geo instanceof THREE.TorusGeometry) {
    const p = geo.parameters as { radius: number; tube: number };
    setBox((p.radius + p.tube) * 2, (p.radius + p.tube) * 2, p.tube * 2);
  } else if (geo instanceof THREE.IcosahedronGeometry || geo instanceof THREE.DodecahedronGeometry) {
    setSphere((geo.parameters as { radius: number }).radius);
  } else {
    // Generic: fit a box to the world bounding box.
    collider.type = ColliderType.Box;
    const box = new THREE.Box3().setFromObject(mesh);
    const s = box.getSize(new THREE.Vector3());
    collider.size = new Vector3(
      Math.max(0.1, s.x * scale.x),
      Math.max(0.1, s.y * scale.y),
      Math.max(0.1, s.z * scale.z)
    );
  }

  return collider;
}