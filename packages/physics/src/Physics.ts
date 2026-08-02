import { Vector3, BoundingBox, Ray } from '../../core/src/index.ts';
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
  private grid: Map<string, Array<{ id: number; pos: Vector3; radius: number }>> = new Map();

  constructor(cellSize: number = 2.0) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, y: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx},${cy},${cz}`;
  }

  public clear(): void {
    this.grid.clear();
  }

  public insert(id: number, pos: Vector3, radius: number = 0.5): void {
    const key = this.getKey(pos.x, pos.y, pos.z);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push({ id, pos, radius });
  }

  public getNearby(pos: Vector3): Array<{ id: number; pos: Vector3; radius: number }> {
    const cx = Math.floor(pos.x / this.cellSize);
    const cy = Math.floor(pos.y / this.cellSize);
    const cz = Math.floor(pos.z / this.cellSize);
    const nearby: Array<{ id: number; pos: Vector3; radius: number }> = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = this.grid.get(key);
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
  public isTrigger: boolean = false;

  public getBoundingBox(position: Vector3): BoundingBox {
    const half = this.size.clone().scale(0.5);
    return new BoundingBox(
      position.clone().sub(half),
      position.clone().add(half)
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
  public cannonBody: CANNON.Body | null = null;

  applyForce(force: Vector3, point?: Vector3): void {
    if (this.cannonBody) {
      this.cannonBody.applyForce(toCannonVec3(force), point ? toCannonVec3(point) : this.cannonBody.position);
    }
  }

  applyImpulse(impulse: Vector3, point?: Vector3): void {
    if (this.cannonBody) {
      this.cannonBody.applyImpulse(toCannonVec3(impulse), point ? toCannonVec3(point) : this.cannonBody.position);
    }
  }

  applyTorque(torque: Vector3): void {
    if (this.cannonBody) {
      this.cannonBody.torque.vadd(toCannonVec3(torque), this.cannonBody.torque);
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
}

export type PhysicsBackendType = 'cannon' | 'havok' | 'go-wasm';

export class PhysicsWorld {
  public gravity: Vector3 = new Vector3(0, -9.81, 0);
  public activeBackend: PhysicsBackendType = 'cannon';
  private bodies: BodyEntry[] = [];
  private cannonWorld: CANNON.World;
  private bodyLookup: Map<CANNON.Body, BodyEntry> = new Map();
  private collisionListeners: Array<(event: CollisionEvent) => void> = [];
  private triggerListeners: Array<(event: CollisionEvent) => void> = [];
  private activePairs: Set<string> = new Set();
  private collisionEvents: CollisionEvent[] = [];

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
    this.bodies = this.bodies.filter(entry => entry.body !== body);
  }

  step(dt: number): void {
    if (this.activeBackend === 'go-wasm' && (window as any).kairoWasmPhysics) {
      (window as any).kairoWasmPhysics.step(dt);
      return;
    }

    const world = this.cannonWorld;
    const accumulatorBefore = world.accumulator;
    // cannon-es applies gravity inside each fixed substep, so predict the total
    // simulated time this call to feed manual per-body gravity below.
    const simulated = Math.min(
      Math.floor((accumulatorBefore + dt) / PhysicsWorld.FIXED_TIMESTEP),
      PhysicsWorld.MAX_SUBSTEPS
    ) * PhysicsWorld.FIXED_TIMESTEP;

    // Gravity is applied per-body so `useGravity: false` bodies stay unaffected,
    // while world gravity is zeroed to avoid double application.
    world.gravity.set(0, 0, 0);
    if (world.frictionGravity) world.frictionGravity.set(this.gravity.x, this.gravity.y, this.gravity.z);
    this.applyGravity(simulated);

    this.syncKinematicAndStaticBodies();
    world.step(PhysicsWorld.FIXED_TIMESTEP, dt, PhysicsWorld.MAX_SUBSTEPS);

    // If the world bailed out early on a spike frame, retract the gravity that
    // was applied for substeps that never ran.
    const simulatedActual = (accumulatorBefore + dt) - world.accumulator;
    const overApplied = simulated - simulatedActual;
    if (overApplied > 0) this.applyGravity(-overApplied);

    this.syncDynamicBodies();
    this.collectCollisionEvents();
  }

  private applyGravity(dt: number): void {
    if (dt === 0) return;
    const g = this.gravity;
    for (const b of this.bodies) {
      const cannonBody = b.body.cannonBody;
      if (cannonBody && b.body.type === RigidBodyType.Dynamic && b.body.useGravity) {
        cannonBody.velocity.x += g.x * dt;
        cannonBody.velocity.y += g.y * dt;
        cannonBody.velocity.z += g.z * dt;
      }
    }
  }

  onCollision(listener: (event: CollisionEvent) => void): void {
    this.collisionListeners.push(listener);
  }

  onTrigger(listener: (event: CollisionEvent) => void): void {
    this.triggerListeners.push(listener);
  }

  raycast(originOrRay: Vector3 | Ray, directionOrMaxDist?: Vector3 | number, maxDistance: number = 100): RaycastHit {
    let ray: Ray;
    let maxDist = maxDistance;

    if (originOrRay instanceof Ray) {
      ray = originOrRay;
      if (typeof directionOrMaxDist === 'number') maxDist = directionOrMaxDist;
    } else {
      const dir = (directionOrMaxDist instanceof Vector3) ? directionOrMaxDist : new Vector3(0, 0, -1);
      ray = new Ray(originOrRay, dir);
    }

    let closestHit: RaycastHit = {
      hasHit: false,
      body: null,
      collider: null,
      point: new Vector3(),
      normal: new Vector3(),
      distance: maxDist
    };

    // ⚡ Bolt Optimization:
    // Avoid creating new arrays via mapping and filter arrays.
    for (let i = 0; i < this.bodies.length; i++) {
      const { body, collider, position } = this.bodies[i];
      const bounds = collider.getBoundingBox(position);
      const hit = ray.intersectBox(bounds);
      if (hit.hasHit && hit.distance <= maxDist && hit.distance < closestHit.distance) {
        closestHit = {
          hasHit: true,
          body,
          collider,
          point: hit.point,
          normal: hit.normal,
          distance: hit.distance
        };
      }
    }
    return closestHit;
  }

  sphereCast(originOrRay: Vector3 | Ray, radius: number, direction?: Vector3, maxDistance: number = 100): RaycastHit {
    const hit = this.raycast(originOrRay, direction, maxDistance + radius);
    if (hit.hasHit) {
      hit.distance = Math.max(0, hit.distance - radius);
    }
    return hit;
  }

  overlapSphere(center: Vector3, radius: number): RigidBody[] {
    const radiusSq = radius * radius;
    const results: RigidBody[] = [];

    // ⚡ Bolt Optimization:
    // Avoid .filter().map() chaining in this hot path.
    for (let i = 0; i < this.bodies.length; i++) {
      const { body, collider, position } = this.bodies[i];
      const bounds = collider.getBoundingBox(position);
      const closestX = clamp(center.x, bounds.min.x, bounds.max.x);
      const closestY = clamp(center.y, bounds.min.y, bounds.max.y);
      const closestZ = clamp(center.z, bounds.min.z, bounds.max.z);
      const dx = center.x - closestX;
      const dy = center.y - closestY;
      const dz = center.z - closestZ;
      if (dx * dx + dy * dy + dz * dz <= radiusSq) {
        results.push(body);
      }
    }
    return results;
  }

  overlapBox(center: Vector3, halfExtents: Vector3): RigidBody[] {
    const queryBox = new BoundingBox(
      center.clone().sub(halfExtents),
      center.clone().add(halfExtents)
    );
    const results: RigidBody[] = [];

    // ⚡ Bolt Optimization:
    // Avoid .filter().map() chaining in this hot path.
    for (let i = 0; i < this.bodies.length; i++) {
      const { body, collider, position } = this.bodies[i];
      const bounds = collider.getBoundingBox(position);
      if (queryBox.intersectsBox(bounds)) {
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
    const nextPairs = new Set<string>();
    this.collisionEvents = [];
    for (const contact of this.cannonWorld.contacts) {
      const a = this.bodyLookup.get(contact.bi);
      const b = this.bodyLookup.get(contact.bj);
      if (!a || !b) continue;
      const key = pairKey(contact.bi.id, contact.bj.id);
      nextPairs.add(key);
      this.emitCollision(this.activePairs.has(key) ? 'stay' : 'enter', a, b);
    }
    for (const key of this.activePairs) {
      if (!nextPairs.has(key)) {
        const [aId, bId] = key.split(':').map(Number);
        const a = this.bodies.find(entry => entry.body.cannonBody?.id === aId);
        const b = this.bodies.find(entry => entry.body.cannonBody?.id === bId);
        if (a && b) this.emitCollision('exit', a, b);
      }
    }
    this.activePairs = nextPairs;
  }

  private emitCollision(phase: CollisionPhase, a: BodyEntry, b: BodyEntry): void {
    const events: CollisionEvent[] = [
      { phase, body: a.body, other: b.body, collider: a.collider, otherCollider: b.collider },
      { phase, body: b.body, other: a.body, collider: b.collider, otherCollider: a.collider }
    ];
    this.collisionEvents.push(...events);
    for (const event of events) {
      for (const listener of this.collisionListeners) listener(event);
      if (event.collider.isTrigger || event.otherCollider.isTrigger) {
        for (const listener of this.triggerListeners) listener(event);
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
function pairKey(a: number, b: number): string { return a < b ? `${a}:${b}` : `${b}:${a}`; }

function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
