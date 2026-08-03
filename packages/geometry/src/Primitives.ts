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

function buildMesh(geometry: THREE.BufferGeometry, opts: PrimitiveOptions = {}): THREE.Mesh {
  const material = opts.material ?? new THREE.MeshStandardMaterial({
    color: opts.color ?? 0xffffff,
    roughness: opts.roughness ?? 0.6,
    metalness: opts.metalness ?? 0.1,
    emissive: (opts.emissive as THREE.ColorRepresentation) ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    ...(opts.transparent !== undefined ? { transparent: opts.transparent, opacity: opts.opacity ?? 1 } : {})
  });

  const mesh = new THREE.Mesh(geometry, material);
  if (opts.position) mesh.position.set(...opts.position);
  if (opts.rotation) mesh.rotation.set(...opts.rotation);
  if (opts.scale) mesh.scale.set(...opts.scale);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  return mesh;
}

/** Axis-aligned box / block. */
export function createBlock(size: [number, number, number], opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.BoxGeometry(...size), opts);
}

/** UV sphere. */
export function createSphere(radius: number, opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.SphereGeometry(radius, opts?.castShadow === false ? 16 : 32, 16), opts);
}

/** Flat plane (XZ by default — rotate to XY if you need a wall). */
export function createPlane(width: number, height: number, opts?: PrimitiveOptions): THREE.Mesh {
  const mesh = buildMesh(new THREE.PlaneGeometry(width, height, 1, 1), opts);
  mesh.rotation.x = -Math.PI / 2;
  if (opts?.rotation) mesh.rotation.set(...opts.rotation);
  return mesh;
}

/** Cylinder / pillar. */
export function createCylinder(radiusTop: number, radiusBottom: number, height: number, opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24), opts);
}

/** Cone / spike. */
export function createCone(radius: number, height: number, opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.ConeGeometry(radius, height, 24), opts);
}

/** Torus / ring. */
export function createTorus(radius: number, tube: number, opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.TorusGeometry(radius, tube, 16, 48), opts);
}

/** Capsule (pill shape). */
export function createCapsule(radius: number, length: number, opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.CapsuleGeometry(radius, length, 8, 16), opts);
}

/** Icosahedron (good for low-poly gems/orbs). */
export function createIcosahedron(radius: number, detail: number = 1, opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.IcosahedronGeometry(radius, detail), opts);
}

/** Dodecahedron (good for low-poly rocks/crystals). */
export function createDodecahedron(radius: number, detail: number = 0, opts?: PrimitiveOptions): THREE.Mesh {
  return buildMesh(new THREE.DodecahedronGeometry(radius, detail), opts);
}
