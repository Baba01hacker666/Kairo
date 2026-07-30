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

export class RigidBody {
  public type: RigidBodyTypeValue = RigidBodyType.Dynamic;
  public mass: number = 1.0;
  public useGravity: boolean = true;
  public linearDamping: number = 0.05;
  public angularDamping: number = 0.05;
  public collisionLayer: number = 1;
  public collisionMask: number = 0xFFFFFFFF;
  public fixedRotation: boolean = false;

  // Reference to cannon-es body
  public cannonBody: CANNON.Body | null = null;

  applyForce(force: Vector3): void {
    if (this.cannonBody) {
      this.cannonBody.applyForce(new CANNON.Vec3(force.x, force.y, force.z), this.cannonBody.position);
    }
  }

  applyImpulse(impulse: Vector3): void {
    if (this.cannonBody) {
      this.cannonBody.applyImpulse(new CANNON.Vec3(impulse.x, impulse.y, impulse.z), this.cannonBody.position);
    }
  }

  get velocity(): Vector3 {
    if (this.cannonBody) return new Vector3(this.cannonBody.velocity.x, this.cannonBody.velocity.y, this.cannonBody.velocity.z);
    return new Vector3();
  }

  set velocity(v: Vector3) {
    if (this.cannonBody) {
      this.cannonBody.velocity.set(v.x, v.y, v.z);
    }
  }
}

export class Collider {
  public type: ColliderTypeValue = ColliderType.Box;
  public size: Vector3 = new Vector3(1, 1, 1);
  public centerOffset: Vector3 = new Vector3(0, 0, 0);
  public isTrigger: boolean = false;
  public friction: number = 0.4;
  public restitution: number = 0.2;

  // Reference to cannon-es shape
  public cannonShape: CANNON.Shape | null = null;

  getBoundingBox(position: Vector3): BoundingBox {
    const halfSize = this.size.clone().scale(0.5);
    const pos = position.clone().add(this.centerOffset);
    return new BoundingBox(
      pos.clone().sub(halfSize),
      pos.clone().add(halfSize)
    );
  }
}

export class PhysicsWorld {
  public cannonWorld: CANNON.World;
  private bodies: { body: RigidBody; collider: Collider; position: Vector3 }[] = [];
  private defaultMaterial: CANNON.Material;

  constructor() {
    this.cannonWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0)
    });
    this.defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial, this.defaultMaterial,
      { friction: 0.1, restitution: 0.0 }
    );
    this.cannonWorld.addContactMaterial(defaultContactMaterial);
  }

  set gravity(g: Vector3) {
    this.cannonWorld.gravity.set(g.x, g.y, g.z);
  }

  get gravity(): Vector3 {
    return new Vector3(this.cannonWorld.gravity.x, this.cannonWorld.gravity.y, this.cannonWorld.gravity.z);
  }

  registerBody(body: RigidBody, collider: Collider, position: Vector3): void {
    let shape: CANNON.Shape;
    if (collider.type === ColliderType.Box) {
      shape = new CANNON.Box(new CANNON.Vec3(collider.size.x * 0.5, collider.size.y * 0.5, collider.size.z * 0.5));
    } else if (collider.type === ColliderType.Sphere) {
      shape = new CANNON.Sphere(collider.size.x * 0.5);
    } else {
      shape = new CANNON.Box(new CANNON.Vec3(collider.size.x * 0.5, collider.size.y * 0.5, collider.size.z * 0.5));
    }
    
    collider.cannonShape = shape;

    let mass = body.type === RigidBodyType.Dynamic ? body.mass : 0;
    if (body.type === RigidBodyType.Kinematic) mass = 0; // Or kinematic specific settings

    const cBody = new CANNON.Body({
      mass: mass,
      material: this.defaultMaterial,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      fixedRotation: body.fixedRotation,
      linearDamping: body.linearDamping,
      angularDamping: body.angularDamping,
    });
    
    if (body.type === RigidBodyType.Kinematic) {
      cBody.type = CANNON.Body.KINEMATIC;
    } else if (body.type === RigidBodyType.Static) {
      cBody.type = CANNON.Body.STATIC;
    } else {
      cBody.type = CANNON.Body.DYNAMIC;
    }

    cBody.addShape(shape, new CANNON.Vec3(collider.centerOffset.x, collider.centerOffset.y, collider.centerOffset.z));
    
    if (!body.useGravity) {
      cBody.preStep = () => {
        cBody.force.y -= this.cannonWorld.gravity.y * cBody.mass;
      };
    }

    this.cannonWorld.addBody(cBody);
    body.cannonBody = cBody;

    this.bodies.push({ body, collider, position });
  }

  unregisterBody(body: RigidBody): void {
    if (body.cannonBody) {
      this.cannonWorld.removeBody(body.cannonBody);
      body.cannonBody = null;
    }
    this.bodies = this.bodies.filter(b => b.body !== body);
  }

  step(dt: number): void {
    // Sync external positional changes to cannon
    for (const b of this.bodies) {
      if (b.body.cannonBody && b.body.type !== RigidBodyType.Dynamic) {
         b.body.cannonBody.position.set(b.position.x, b.position.y, b.position.z);
      }
    }

    // Step physics
    this.cannonWorld.step(1/60, dt, 3);

    // Sync cannon results back to ECS
    for (const b of this.bodies) {
      if (b.body.cannonBody && b.body.type === RigidBodyType.Dynamic) {
        b.position.set(b.body.cannonBody.position.x, b.body.cannonBody.position.y, b.body.cannonBody.position.z);
      }
    }
  }

  // Simplified raycast via cannon
  raycast(ray: Ray, maxDistance: number = 100): { hasHit: boolean, point: Vector3, distance: number } | null {
    const from = new CANNON.Vec3(ray.origin.x, ray.origin.y, ray.origin.z);
    const to = new CANNON.Vec3(
      ray.origin.x + ray.direction.x * maxDistance,
      ray.origin.y + ray.direction.y * maxDistance,
      ray.origin.z + ray.direction.z * maxDistance
    );
    
    const result = new CANNON.RaycastResult();
    const cannonRay = new CANNON.Ray(from, to);
    this.cannonWorld.raycastClosest(from, to, {}, result);
    
    if (result.hasHit) {
      return {
        hasHit: true,
        point: new Vector3(result.hitPointWorld.x, result.hitPointWorld.y, result.hitPointWorld.z),
        distance: result.distance
      };
    }
    return null;
  }
}
