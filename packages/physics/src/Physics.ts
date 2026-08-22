import { Vector3, BoundingBox, Ray } from '../../core/src/Math.ts';
import * as CANNON from 'cannon-es';

export const RigidBodyType = {
  Dynamic: 'DYNAMIC',
  Static: 'STATIC',
  Kinematic: 'KINEMATIC'
} as const;

export type RigidBodyTypeValue = typeof RigidBodyType[keyof typeof RigidBodyType];

export const ColliderType = {
  Box: 'BOX',
  Sphere: 'SPHERE',
  Capsule: 'CAPSULE',
  Mesh: 'MESH'
} as const;

export type ColliderTypeValue = typeof ColliderType[keyof typeof ColliderType];

export type CollisionPhase = 'enter' | 'stay' | 'exit';

export interface CollisionEvent {
  phase: CollisionPhase;
  body: RigidBody;
  other: RigidBody;
  collider: Collider;
  otherCollider: Collider;
}

export interface RaycastHit {
  hasHit: boolean;
  body: RigidBody | null;
  collider: Collider | null;
  point: Vector3;
  normal: Vector3;
  distance: number;
}

interface BodyEntry {
  body: RigidBody;
  collider: Collider;
  position: Vector3;
}

export class SpatialHashGrid3D {
  private cellSize: number;
  private invCellSize: number;
  private grid: Map<number, Array<{ id: number; pos: Vector3; radius: number }>> = new Map();

  constructor(cellSize: number = 2.0) {
    this.cellSize = Math.max(0.001, cellSize);
    this.invCellSize = 1.0 / this.cellSize;
  }

  // Fast 32-bit integer spatial hash with zero GC string allocations
  private getHash(cx: number, cy: number, cz: number): number {
    return ((cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791)) | 0;
  }

  public clear(): void {
    this.grid.clear();
  }

  public insert(id: number, pos: Vector3, radius: number = 0.5): void {
    const cx = Math.floor(pos.x * this.invCellSize);
    const cy = Math.floor(pos.y * this.invCellSize);
    const cz = Math.floor(pos.z * this.invCellSize);
    const hash = this.getHash(cx, cy, cz);
    let cell = this.grid.get(hash);
    if (!cell) {
      cell = [];
      this.grid.set(hash, cell);
    }
    cell.push({ id, pos, radius });
  }

  public getNearby(pos: Vector3, outBuffer?: Array<{ id: number; pos: Vector3; radius: number }>): Array<{ id: number; pos: Vector3; radius: number }> {
    const cx = Math.floor(pos.x * this.invCellSize);
    const cy = Math.floor(pos.y * this.invCellSize);
    const cz = Math.floor(pos.z * this.invCellSize);
    const nearby: Array<{ id: number; pos: Vector3; radius: number }> = outBuffer || [];
    nearby.length = 0;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const hash = this.getHash(cx + dx, cy + dy, cz + dz);
          const cell = this.grid.get(hash);
          if (cell) {
            for (let i = 0; i < cell.length; i++) {
              nearby.push(cell[i]);
            }
          }
        }
      }
    }

    return nearby;
  }
}

export class Collider {
  public type: ColliderTypeValue = ColliderType.Box;
  public size: Vector3 = new Vector3(1, 1, 1);
  public radius: number = 0.5;
  public isTrigger: boolean = false;

  public getBoundingBox(position: Vector3, target?: BoundingBox): BoundingBox {
    const hx = this.size.x * 0.5;
    const hy = this.size.y * 0.5;
    const hz = this.size.z * 0.5;

    if (target) {
      target.min.set(position.x - hx, position.y - hy, position.z - hz);
      target.max.set(position.x + hx, position.y + hy, position.z + hz);
      return target;
    }

    return new BoundingBox(
      new Vector3(position.x - hx, position.y - hy, position.z - hz),
      new Vector3(position.x + hx, position.y + hy, position.z + hz)
    );
  }
}

export class RigidBody {
  public type: RigidBodyTypeValue = RigidBodyType.Dynamic;
  public mass: number = 1.0;
  public useGravity: boolean = true;
  public linearDamping: number = 0.05;
  public angularDamping: number = 0.05;
  public collisionLayer: number = 1;
  public collisionMask: number = 0xFFFFFFFF;
  public fixedRotation: boolean = false;
  public lockLinearAxis: [boolean, boolean, boolean] = [false, false, false];
  public lockAngularAxis: [boolean, boolean, boolean] = [false, false, false];
  public cannonBody: CANNON.Body | null = null;

  private static _forceTemp = new CANNON.Vec3();
  private static _pointTemp = new CANNON.Vec3();

  applyForce(force: Vector3, point?: Vector3): void {
    if (this.cannonBody) {
      const f = RigidBody._forceTemp;
      f.set(force.x, force.y, force.z);
      if (point) {
        const p = RigidBody._pointTemp;
        p.set(point.x - this.cannonBody.position.x, point.y - this.cannonBody.position.y, point.z - this.cannonBody.position.z);
        this.cannonBody.applyForce(f, p);
      } else {
        this.cannonBody.applyForce(f);
      }
    }
  }

  applyImpulse(impulse: Vector3, point?: Vector3): void {
    if (this.cannonBody) {
      const i = RigidBody._forceTemp;
      i.set(impulse.x, impulse.y, impulse.z);
      if (point) {
        const p = RigidBody._pointTemp;
        p.set(point.x - this.cannonBody.position.x, point.y - this.cannonBody.position.y, point.z - this.cannonBody.position.z);
        this.cannonBody.applyImpulse(i, p);
      } else {
        this.cannonBody.applyImpulse(i);
      }
    }
  }

  applyTorque(torque: Vector3): void {
    if (this.cannonBody) {
      const t = RigidBody._forceTemp;
      t.set(torque.x, torque.y, torque.z);
      this.cannonBody.torque.vadd(t, this.cannonBody.torque);
    }
  }

  teleport(position: Vector3): void {
    if (this.cannonBody) {
      this.cannonBody.position.set(position.x, position.y, position.z);
      this.cannonBody.previousPosition.set(position.x, position.y, position.z);
      this.cannonBody.interpolatedPosition.set(position.x, position.y, position.z);
    }
  }

  get velocity(): Vector3 {
    if (this.cannonBody) return fromCannonVec3(this.cannonBody.velocity);
    return new Vector3();
  }

  set velocity(v: Vector3) {
    if (this.cannonBody) this.cannonBody.velocity.set(v.x, v.y, v.z);
  }

  get angularVelocity(): Vector3 {
    if (this.cannonBody) return fromCannonVec3(this.cannonBody.angularVelocity);
    return new Vector3();
  }

  set angularVelocity(v: Vector3) {
    if (this.cannonBody) this.cannonBody.angularVelocity.set(v.x, v.y, v.z);
  }

  /** Zero-allocation velocity read into an optional target vector. */
  getVelocity(target?: Vector3): Vector3 {
    const out = target || new Vector3();
    if (this.cannonBody) out.set(this.cannonBody.velocity.x, this.cannonBody.velocity.y, this.cannonBody.velocity.z);
    else out.set(0, 0, 0);
    return out;
  }

  /** Zero-allocation angular velocity read into an optional target vector. */
  getAngularVelocity(target?: Vector3): Vector3 {
    const out = target || new Vector3();
    if (this.cannonBody) out.set(this.cannonBody.angularVelocity.x, this.cannonBody.angularVelocity.y, this.cannonBody.angularVelocity.z);
    else out.set(0, 0, 0);
    return out;
  }
}

export type PhysicsBackendType = 'cannon' | 'havok' | 'go-wasm';

export class PhysicsWorld {
  public getCannonWorld(): CANNON.World {
    return this.cannonWorld;
  }

  public gravity: Vector3 = new Vector3(0, -9.81, 0);
  public activeBackend: PhysicsBackendType = 'cannon';
  private bodies: BodyEntry[] = [];
  private cannonWorld: CANNON.World;
  private static _raycastTempBox = new BoundingBox();
  private static _raycastTempResult = { hasHit: false, distance: Infinity, point: new Vector3(), normal: new Vector3() };
  private bodyLookup: Map<CANNON.Body, BodyEntry> = new Map();
  private collisionListeners: Array<(event: CollisionEvent) => void> = [];
  private triggerListeners: Array<(event: CollisionEvent) => void> = [];
  private activePairs: Map<number, [BodyEntry, BodyEntry]> = new Map();
  private _nextPairs: Map<number, [BodyEntry, BodyEntry]> = new Map();

  private static readonly FIXED_TIMESTEP = 1 / 60;
  private static readonly MAX_SUBSTEPS = 3;

  constructor(backend: PhysicsBackendType = 'cannon') {
    this.activeBackend = backend;
    this.cannonWorld = new CANNON.World();
    this.cannonWorld.gravity.set(0, -9.81, 0);
    this.cannonWorld.frictionGravity = new CANNON.Vec3().copy(this.cannonWorld.gravity);
    this.cannonWorld.broadphase = new CANNON.SAPBroadphase(this.cannonWorld);
    (this.cannonWorld.solver as CANNON.GSSolver).iterations = 10;
  }

  public setBackend(backend: PhysicsBackendType): void {
    this.activeBackend = backend;
    console.log(`[Kairo Physics] Active Physics Engine Backend set to: ${backend.toUpperCase()}`);
  }

  public clear(): void {
    while (this.bodies.length > 0) {
      this.unregisterBody(this.bodies[this.bodies.length - 1].body);
    }
    this.bodies.length = 0;
    this.bodyLookup.clear();
    this.collisionListeners = [];
    this.triggerListeners = [];
    this.activePairs.clear();
    this._nextPairs.clear();
  }

  registerBody(body: RigidBody, collider: Collider, position: Vector3 = new Vector3()): void {
    const isDynamic = body.type === RigidBodyType.Dynamic;
    const isKinematic = body.type === RigidBodyType.Kinematic;
    const cannonBody = new CANNON.Body({
      mass: isDynamic ? Math.max(0.001, body.mass) : 0,
      type: isDynamic ? CANNON.Body.DYNAMIC : isKinematic ? CANNON.Body.KINEMATIC : CANNON.Body.STATIC,
      position: toCannonVec3(position),
      linearDamping: body.linearDamping,
      angularDamping: body.angularDamping,
      fixedRotation: body.fixedRotation,
      collisionFilterGroup: body.collisionLayer,
      collisionFilterMask: body.collisionMask
    });

    cannonBody.linearFactor.set(
      body.lockLinearAxis[0] ? 0 : 1,
      body.lockLinearAxis[1] ? 0 : 1,
      body.lockLinearAxis[2] ? 0 : 1
    );
    cannonBody.angularFactor.set(
      body.lockAngularAxis[0] ? 0 : 1,
      body.lockAngularAxis[1] ? 0 : 1,
      body.lockAngularAxis[2] ? 0 : 1
    );

    const shape = this.createShape(collider);
    cannonBody.addShape(shape);
    body.cannonBody = cannonBody;

    const entry: BodyEntry = { body, collider, position };
    this.bodies.push(entry);
    this.bodyLookup.set(cannonBody, entry);
    this.cannonWorld.addBody(cannonBody);
  }

  unregisterBody(body: RigidBody): void {
    if (body.cannonBody) {
      this.cannonWorld.removeBody(body.cannonBody);
      this.bodyLookup.delete(body.cannonBody);
      body.cannonBody = null;
    }
    for (let i = 0; i < this.bodies.length; i++) {
      if (this.bodies[i].body === body) {
        const last = this.bodies.pop()!;
        if (i < this.bodies.length) {
          this.bodies[i] = last;
        }
        break;
      }
    }
  }

  step(dt: number): void {
    if (this.activeBackend === 'go-wasm' && typeof window !== 'undefined' && (window as any).kairoWasmPhysics) {
      (window as any).kairoWasmPhysics.step(dt);
      return;
    }

    if (this.activeBackend === 'havok') {
      if (typeof window !== 'undefined' && (window as any).havokPlugin) {
        (window as any).havokPlugin.step(dt);
        return;
      } else {
        if (!PhysicsWorld._havokFallbackWarned) {
          console.warn('[PhysicsWorld] Havok backend selected but Havok WASM plugin is not loaded; falling back to Cannon.js physics solver.');
          PhysicsWorld._havokFallbackWarned = true;
        }
      }
    }

    // Fast path: nothing to simulate. Skipping the Cannon solver entirely
    // removes broadphase/solver overhead from games that don't use physics
    // (e.g. terrain-only demos) while keeping per-frame cost at ~0.
    if (this.bodies.length === 0 && this.cannonWorld.bodies.length === 0) {
      return;
    }

    const world = this.cannonWorld;
    world.gravity.set(this.gravity.x, this.gravity.y, this.gravity.z);
    this.cancelGravityForNonGravityBodies();

    this.syncKinematicAndStaticBodies();
    world.step(PhysicsWorld.FIXED_TIMESTEP, dt, PhysicsWorld.MAX_SUBSTEPS);

    this.syncDynamicBodies();
    this.collectCollisionEvents();
  }

  private static _havokFallbackWarned = false;

  private cancelGravityForNonGravityBodies(): void {
    const g = this.gravity;
    for (const b of this.bodies) {
      const cannonBody = b.body.cannonBody;
      if (cannonBody && b.body.type === RigidBodyType.Dynamic && !b.body.useGravity) {
        cannonBody.force.x -= b.body.mass * g.x;
        cannonBody.force.y -= b.body.mass * g.y;
        cannonBody.force.z -= b.body.mass * g.z;
      }
    }
  }

  onCollision(listener: (event: CollisionEvent) => void): void {
    this.collisionListeners.push(listener);
  }

  onTrigger(listener: (event: CollisionEvent) => void): void {
    this.triggerListeners.push(listener);
  }

  private static _defaultRayDir = new Vector3(0, 0, -1);
  private static _tempRay = new Ray(new Vector3(), new Vector3());

  raycast(originOrRay: Vector3 | Ray, directionOrMaxDist?: Vector3 | number, maxDistance: number = 100, target?: RaycastHit): RaycastHit {
    let ray: Ray;
    let maxDist = maxDistance;

    if (originOrRay instanceof Ray) {
      ray = originOrRay;
      if (typeof directionOrMaxDist === 'number') maxDist = directionOrMaxDist;
    } else {
      const dir = (directionOrMaxDist instanceof Vector3) ? directionOrMaxDist : PhysicsWorld._defaultRayDir;
      ray = PhysicsWorld._tempRay;
      ray.origin.copy(originOrRay);
      ray.direction.copy(dir);
    }

    const closestHit: RaycastHit = target || {
      hasHit: false,
      body: null,
      collider: null,
      point: new Vector3(),
      normal: new Vector3(),
      distance: maxDist
    };
    if (target) {
      target.hasHit = false;
      target.body = null;
      target.collider = null;
      target.distance = maxDist;
      if (!target.point) target.point = new Vector3();
      if (!target.normal) target.normal = new Vector3();
    }

    for (let i = 0; i < this.bodies.length; i++) {
      const { body, collider, position } = this.bodies[i];
      let hit: { hasHit: boolean; distance: number; point: Vector3; normal: Vector3 };

      if (collider.type === ColliderType.Sphere) {
        const sphereRadius = collider.radius || (collider.size.x * 0.5);
        hit = ray.intersectSphere(position, sphereRadius, PhysicsWorld._raycastTempResult);
      } else {
        const bounds = collider.getBoundingBox(position, PhysicsWorld._raycastTempBox);
        hit = ray.intersectBox(bounds, PhysicsWorld._raycastTempResult);
      }

      if (hit.hasHit && hit.distance <= maxDist && hit.distance < closestHit.distance) {
        closestHit.hasHit = true;
        closestHit.distance = hit.distance;
        closestHit.point.copy(hit.point);
        closestHit.normal.copy(hit.normal);
        closestHit.body = body;
        closestHit.collider = collider;
      }
    }
    return closestHit;
  }

  sphereCast(originOrRay: Vector3 | Ray, radius: number, direction?: Vector3, maxDistance: number = 100, target?: RaycastHit): RaycastHit {
    const hit = this.raycast(originOrRay, direction, maxDistance + radius, target);
    if (hit.hasHit) {
      hit.distance = Math.max(0, hit.distance - radius);
    }
    return hit;
  }

  overlapSphere(center: Vector3, radius: number, target?: RigidBody[]): RigidBody[] {
    const results: RigidBody[] = target || [];
    if (target) results.length = 0;

    for (let i = 0; i < this.bodies.length; i++) {
      const { body, collider, position } = this.bodies[i];
      
      if (collider.type === ColliderType.Sphere) {
        const rSphere = collider.radius || (collider.size.x * 0.5);
        const totalRadius = radius + rSphere;
        const dx = center.x - position.x;
        const dy = center.y - position.y;
        const dz = center.z - position.z;
        if (dx * dx + dy * dy + dz * dz <= totalRadius * totalRadius) {
          results.push(body);
        }
      } else {
        const hx = collider.size.x * 0.5;
        const hy = collider.size.y * 0.5;
        const hz = collider.size.z * 0.5;
        const closestX = clamp(center.x, position.x - hx, position.x + hx);
        const closestY = clamp(center.y, position.y - hy, position.y + hy);
        const closestZ = clamp(center.z, position.z - hz, position.z + hz);
        const dx = center.x - closestX;
        const dy = center.y - closestY;
        const dz = center.z - closestZ;
        if (dx * dx + dy * dy + dz * dz <= radius * radius) {
          results.push(body);
        }
      }
    }
    return results;
  }

  overlapBox(center: Vector3, halfExtentsOrSize: Vector3, isHalfExtents: boolean = true, target?: RigidBody[]): RigidBody[] {
    const hx = isHalfExtents ? halfExtentsOrSize.x : halfExtentsOrSize.x * 0.5;
    const hy = isHalfExtents ? halfExtentsOrSize.y : halfExtentsOrSize.y * 0.5;
    const hz = isHalfExtents ? halfExtentsOrSize.z : halfExtentsOrSize.z * 0.5;

    const minX = center.x - hx;
    const maxX = center.x + hx;
    const minY = center.y - hy;
    const maxY = center.y + hy;
    const minZ = center.z - hz;
    const maxZ = center.z + hz;

    const results: RigidBody[] = target || [];
    if (target) results.length = 0;

    // ⚡ Bolt Optimization:
    // Avoid intermediate BoundingBox allocations and .filter().map() chaining in hot path.
    for (let i = 0; i < this.bodies.length; i++) {
      const { body, collider, position } = this.bodies[i];
      if (!body.cannonBody) continue;
      const hx = collider.size.x * 0.5;
      const hy = collider.size.y * 0.5;
      const hz = collider.size.z * 0.5;
      if (
        maxX >= position.x - hx && minX <= position.x + hx &&
        maxY >= position.y - hy && minY <= position.y + hy &&
        maxZ >= position.z - hz && minZ <= position.z + hz
      ) {
        results.push(body);
      }
    }
    return results;
  }

  private createShape(collider: Collider): CANNON.Shape {
    if (collider.type === ColliderType.Sphere) return new CANNON.Sphere(collider.size.x * 0.5);
    if (collider.type === ColliderType.Capsule) return new CANNON.Cylinder(collider.size.x * 0.5, collider.size.x * 0.5, collider.size.y, 12);
    return new CANNON.Box(new CANNON.Vec3(collider.size.x * 0.5, collider.size.y * 0.5, collider.size.z * 0.5));
  }

  private syncKinematicAndStaticBodies(): void {
    for (const b of this.bodies) if (b.body.cannonBody && b.body.type !== RigidBodyType.Dynamic) b.body.cannonBody.position.set(b.position.x, b.position.y, b.position.z);
  }

  private syncDynamicBodies(): void {
    for (const b of this.bodies) if (b.body.cannonBody && b.body.type === RigidBodyType.Dynamic) b.position.set(b.body.cannonBody.position.x, b.body.cannonBody.position.y, b.body.cannonBody.position.z);
  }

  private collectCollisionEvents(): void {
    const nextPairs = this._nextPairs;
    nextPairs.clear();
    for (const contact of this.cannonWorld.contacts) {
      const a = this.bodyLookup.get(contact.bi);
      const b = this.bodyLookup.get(contact.bj);
      if (!a || !b) continue;
      const key = pairKey(contact.bi.id, contact.bj.id);
      nextPairs.set(key, [a, b]);
      this.emitCollision(this.activePairs.has(key) ? 'stay' : 'enter', a, b);
    }
    for (const [key, pair] of this.activePairs.entries()) {
      if (!nextPairs.has(key)) {
        const [a, b] = pair;
        // Verify both bodies are still registered in the physics world
        if (this.bodyLookup.has(a.body.cannonBody!) && this.bodyLookup.has(b.body.cannonBody!)) {
          this.emitCollision('exit', a, b);
        }
      }
    }
    this._nextPairs = this.activePairs;
    this.activePairs = nextPairs;
  }

  private emitCollision(phase: CollisionPhase, a: BodyEntry, b: BodyEntry): void {
    const eventA: CollisionEvent = { phase, body: a.body, other: b.body, collider: a.collider, otherCollider: b.collider };
    const eventB: CollisionEvent = { phase, body: b.body, other: a.body, collider: b.collider, otherCollider: a.collider };

    for (let i = 0; i < this.collisionListeners.length; i++) {
      this.collisionListeners[i](eventA);
      this.collisionListeners[i](eventB);
    }

    if (eventA.collider.isTrigger || eventA.otherCollider.isTrigger) {
      for (let i = 0; i < this.triggerListeners.length; i++) {
        this.triggerListeners[i](eventA);
        this.triggerListeners[i](eventB);
      }
    }
  }

  private toRaycastHit(result: CANNON.RaycastResult): RaycastHit {
    const entry = result.body ? this.bodyLookup.get(result.body) : undefined;
    return { hasHit: true, body: entry?.body ?? null, collider: entry?.collider ?? null, point: fromCannonVec3(result.hitPointWorld), normal: fromCannonVec3(result.hitNormalWorld), distance: result.distance };
  }
}

function toCannonVec3(v: Vector3): CANNON.Vec3 { return new CANNON.Vec3(v.x, v.y, v.z); }
function fromCannonVec3(v: CANNON.Vec3): Vector3 { return new Vector3(v.x, v.y, v.z); }
function pairKey(a: number, b: number): number {
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  const sum = lo + hi;
  return (sum * (sum + 1)) / 2 + hi;
}

function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }


export interface VehicleConfig {
  chassisBody: RigidBody;
  indexRightAxis?: number;
  indexUpAxis?: number;
  indexForwardAxis?: number;
}

export interface WheelInfo {
  radius: number;
  directionLocal: Vector3;
  suspensionStiffness: number;
  suspensionRestLength: number;
  frictionSlip: number;
  dampingRelaxation: number;
  dampingCompression: number;
  maxSuspensionForce: number;
  rollInfluence: number;
  axleLocal: Vector3;
  chassisConnectionPointLocal: Vector3;
  maxSuspensionTravel: number;
  customSlidingRotationalSpeed: number;
  useCustomSlidingRotationalSpeed: boolean;
  isFrontWheel?: boolean;
}

export class RaycastVehicle {
  public cannonVehicle: CANNON.RaycastVehicle | null = null;
  public chassisBody: RigidBody;

  constructor(config: VehicleConfig) {
    this.chassisBody = config.chassisBody;

    if (this.chassisBody.cannonBody) {
      this.cannonVehicle = new CANNON.RaycastVehicle({
        chassisBody: this.chassisBody.cannonBody,
        indexRightAxis: config.indexRightAxis ?? 0, // x
        indexUpAxis: config.indexUpAxis ?? 1, // y
        indexForwardAxis: config.indexForwardAxis ?? 2 // z
      });
    }
  }

  public addWheel(options: WheelInfo) {
    if (!this.cannonVehicle) return;
    this.cannonVehicle.addWheel({
      radius: options.radius,
      directionLocal: toCannonVec3(options.directionLocal),
      suspensionStiffness: options.suspensionStiffness,
      suspensionRestLength: options.suspensionRestLength,
      frictionSlip: options.frictionSlip,
      dampingRelaxation: options.dampingRelaxation,
      dampingCompression: options.dampingCompression,
      maxSuspensionForce: options.maxSuspensionForce,
      rollInfluence: options.rollInfluence,
      axleLocal: toCannonVec3(options.axleLocal),
      chassisConnectionPointLocal: toCannonVec3(options.chassisConnectionPointLocal),
      maxSuspensionTravel: options.maxSuspensionTravel,
      customSlidingRotationalSpeed: options.customSlidingRotationalSpeed,
      useCustomSlidingRotationalSpeed: options.useCustomSlidingRotationalSpeed,
      isFrontWheel: options.isFrontWheel
    });
  }

  public setSteeringValue(value: number, wheelIndex: number) {
    if (this.cannonVehicle) {
      this.cannonVehicle.setSteeringValue(value, wheelIndex);
    }
  }

  public applyEngineForce(value: number, wheelIndex: number) {
    if (this.cannonVehicle) {
      this.cannonVehicle.applyEngineForce(value, wheelIndex);
    }
  }

  public setBrake(brake: number, wheelIndex: number) {
    if (this.cannonVehicle) {
      this.cannonVehicle.setBrake(brake, wheelIndex);
    }
  }

  public updateWheelTransform(wheelIndex: number) {
    if (this.cannonVehicle) {
      this.cannonVehicle.updateWheelTransform(wheelIndex);
    }
  }

  public getWheelTransform(wheelIndex: number): { position: Vector3, quaternion: {x: number, y: number, z: number, w: number} } | null {
    if (!this.cannonVehicle) return null;
    const t = this.cannonVehicle.wheelInfos[wheelIndex].worldTransform;
    return {
      position: new Vector3(t.position.x, t.position.y, t.position.z),
      quaternion: { x: t.quaternion.x, y: t.quaternion.y, z: t.quaternion.z, w: t.quaternion.w }
    };
  }

  public addToWorld(world: PhysicsWorld) {
    if (this.cannonVehicle && world.getCannonWorld()) {
      this.cannonVehicle.addToWorld(world.getCannonWorld());
    }
  }

  public removeFromWorld(world: PhysicsWorld) {
    if (this.cannonVehicle && world.getCannonWorld()) {
      this.cannonVehicle.removeFromWorld(world.getCannonWorld());
    }
  }
}
