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

export class Collider {
  public type: ColliderTypeValue = ColliderType.Box;
  public size: Vector3 = new Vector3(1, 1, 1);
  public centerOffset: Vector3 = new Vector3(0, 0, 0);
  public isTrigger: boolean = false;
  public friction: number = 0.4;
  public restitution: number = 0.2;
  public cannonShape: CANNON.Shape | null = null;

  getBoundingBox(position: Vector3): BoundingBox {
    const halfSize = this.size.clone().scale(0.5);
    const pos = position.clone().add(this.centerOffset);
    return new BoundingBox(pos.clone().sub(halfSize), pos.clone().add(halfSize));
  }
}

export class PhysicsWorld {
  public cannonWorld: CANNON.World;
  public fixedTimeStep = 1 / 60;
  public maxSubSteps = 8;
  public collisionEvents: CollisionEvent[] = [];

  private bodies: BodyEntry[] = [];
  private bodyLookup = new Map<CANNON.Body, BodyEntry>();
  private defaultMaterial: CANNON.Material;
  private activePairs = new Set<string>();
  private collisionListeners = new Set<(event: CollisionEvent) => void>();
  private triggerListeners = new Set<(event: CollisionEvent) => void>();

  onTrigger(listener: (event: CollisionEvent) => void): () => void {
    this.triggerListeners.add(listener);
    return () => this.triggerListeners.delete(listener);
  }

  constructor() {
    this.cannonWorld = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0) });
    this.cannonWorld.allowSleep = true;
    this.cannonWorld.broadphase = new CANNON.SAPBroadphase(this.cannonWorld);
    this.defaultMaterial = new CANNON.Material('default');
    this.cannonWorld.defaultContactMaterial.friction = 0.4;
    this.cannonWorld.defaultContactMaterial.restitution = 0.2;
    this.cannonWorld.addContactMaterial(new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, { friction: 0.4, restitution: 0.2 }));
  }

  set gravity(g: Vector3) { this.cannonWorld.gravity.set(g.x, g.y, g.z); }
  get gravity(): Vector3 { return fromCannonVec3(this.cannonWorld.gravity); }

  onCollision(listener: (event: CollisionEvent) => void): () => void {
    this.collisionListeners.add(listener);
    return () => this.collisionListeners.delete(listener);
  }

  registerBody(body: RigidBody, collider: Collider, position: Vector3): void {
    const shape = this.createShape(collider);
    collider.cannonShape = shape;
    const mass = body.type === RigidBodyType.Dynamic ? Math.max(0, body.mass) : 0;
    const material = new CANNON.Material(`collider-${this.bodies.length}`);
    material.friction = collider.friction;
    material.restitution = collider.restitution;
    const cBody = new CANNON.Body({ mass, material, position: toCannonVec3(position), fixedRotation: body.fixedRotation, linearDamping: body.linearDamping, angularDamping: body.angularDamping });
    cBody.type = body.type === RigidBodyType.Kinematic ? CANNON.Body.KINEMATIC : body.type === RigidBodyType.Static ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC;
    cBody.collisionFilterGroup = body.collisionLayer;
    cBody.collisionFilterMask = body.collisionMask;
    shape.collisionResponse = !collider.isTrigger;
    cBody.addShape(shape, toCannonVec3(collider.centerOffset));
    if (!body.useGravity) cBody.addEventListener('preStep', () => cBody.force.vsub(this.cannonWorld.gravity.scale(cBody.mass), cBody.force));

    const entry = { body, collider, position };
    this.cannonWorld.addBody(cBody);
    body.cannonBody = cBody;
    this.bodies.push(entry);
    this.bodyLookup.set(cBody, entry);
  }

  unregisterBody(body: RigidBody): void {
    if (body.cannonBody) {
      this.bodyLookup.delete(body.cannonBody);
      this.cannonWorld.removeBody(body.cannonBody);
      body.cannonBody = null;
    }
    this.bodies = this.bodies.filter(b => b.body !== body);
  }

  step(dt: number): void {
    this.syncKinematicAndStaticBodies();
    this.cannonWorld.step(this.fixedTimeStep, dt, this.maxSubSteps);
    this.syncDynamicBodies();
    this.collectCollisionEvents();
  }

  raycast(ray: Ray, maxDistance: number = 100): RaycastHit | null {
    const from = toCannonVec3(ray.origin);
    const direction = ray.direction.clone().normalize();
    const to = new CANNON.Vec3(from.x + direction.x * maxDistance, from.y + direction.y * maxDistance, from.z + direction.z * maxDistance);
    const result = new CANNON.RaycastResult();
    this.cannonWorld.raycastClosest(from, to, { skipBackfaces: false }, result);
    return result.hasHit ? this.toRaycastHit(result) : null;
  }

sphereCast(origin: Vector3, radius: number, direction: Vector3, maxDistance = 100): RaycastHit | null {
    const from = toCannonVec3(origin);

    // We modify direction in place instead of clone()
    const dirLen = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    const dirX = direction.x / dirLen;
    const dirY = direction.y / dirLen;
    const dirZ = direction.z / dirLen;

    const to = new CANNON.Vec3(from.x + dirX * maxDistance, from.y + dirY * maxDistance, from.z + dirZ * maxDistance);

    // Quick hack for sphere cast using raycast closest - not perfect but Cannon.js doesn't have native sweep test
    // Real implementation would need a ghost object sweep or custom broadphase/narrowphase intersection test
    const result = new CANNON.RaycastResult();
    this.cannonWorld.raycastClosest(from, to, { skipBackfaces: false }, result);

    // Fallback if no exact ray hit, check using steps to simulate a sphere cast
    if (!result.hasHit) {
      const steps = Math.max(1, Math.ceil(maxDistance / Math.max(radius, 0.1)));

      const center = new Vector3(0, 0, 0); // Re-use this vector in loop

      for (let i = 0; i <= steps; i++) {
        const distance = (i / steps) * maxDistance;
        center.set(origin.x + dirX * distance, origin.y + dirY * distance, origin.z + dirZ * distance);

        const body = this.overlapSphere(center, radius)[0];
        if (body) {
          const entry = this.bodies.find(candidate => candidate.body === body);
          return { hasHit: true, body, collider: entry?.collider ?? null, point: new Vector3(center.x, center.y, center.z), normal: new Vector3(-dirX, -dirY, -dirZ), distance };
        }
      }
      return null;
    }

    // Approximate sphere cast hit using raycast hit
    return this.toRaycastHit(result);
  }

  overlapBox(center: Vector3, size: Vector3): RigidBody[] {
    const halfSizeX = size.x * 0.5;
    const halfSizeY = size.y * 0.5;
    const halfSizeZ = size.z * 0.5;
    const queryMinX = center.x - halfSizeX;
    const queryMaxX = center.x + halfSizeX;
    const queryMinY = center.y - halfSizeY;
    const queryMaxY = center.y + halfSizeY;
    const queryMinZ = center.z - halfSizeZ;
    const queryMaxZ = center.z + halfSizeZ;

    const result: RigidBody[] = [];

    // ⚡ Bolt Optimization: Replace .filter().map() with O(N) loop to eliminate array allocation
    // Also skip new Collider() allocation for query bounding box
    for (let i = 0; i < this.bodies.length; i++) {
      const entry = this.bodies[i];
      if (!entry.body.cannonBody) continue;

      const bounds = entry.collider.getBoundingBox(entry.position);
      if (
        queryMaxX >= bounds.min.x && queryMinX <= bounds.max.x &&
        queryMaxY >= bounds.min.y && queryMinY <= bounds.max.y &&
        queryMaxZ >= bounds.min.z && queryMinZ <= bounds.max.z
      ) {
        result.push(entry.body);
      }
    }
    return result;
  }

  overlapSphere(center: Vector3, radius: number): RigidBody[] {
    const radiusSq = radius * radius;
    const result: RigidBody[] = [];

    // ⚡ Bolt Optimization: Replace .filter().map() with O(N) loop to eliminate array allocation
    for (let i = 0; i < this.bodies.length; i++) {
      const entry = this.bodies[i];
      if (!entry.body.cannonBody) continue;

      const bounds = entry.collider.getBoundingBox(entry.position);
      const closestX = clamp(center.x, bounds.min.x, bounds.max.x);
      const closestY = clamp(center.y, bounds.min.y, bounds.max.y);
      const closestZ = clamp(center.z, bounds.min.z, bounds.max.z);
      const dx = center.x - closestX;
      const dy = center.y - closestY;
      const dz = center.z - closestZ;

      if (dx * dx + dy * dy + dz * dz <= radiusSq) {
        result.push(entry.body);
      }
    }
    return result;
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
