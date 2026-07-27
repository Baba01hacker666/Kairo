import { Vector3, BoundingBox, Ray } from '../../core/src/index.ts';

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
  public velocity: Vector3 = new Vector3();
  public angularVelocity: Vector3 = new Vector3();
  public useGravity: boolean = true;
  public linearDamping: number = 0.05;
  public angularDamping: number = 0.05;
  public collisionLayer: number = 1;
  public collisionMask: number = 0xFFFFFFFF;

  applyForce(force: Vector3): void {
    if (this.type !== RigidBodyType.Dynamic || this.mass <= 0) return;
    const accel = force.clone().scale(1 / this.mass);
    this.velocity.add(accel);
  }

  applyImpulse(impulse: Vector3): void {
    if (this.type !== RigidBodyType.Dynamic || this.mass <= 0) return;
    this.velocity.add(impulse.clone().scale(1 / this.mass));
  }
}

export class Collider {
  public type: ColliderTypeValue = ColliderType.Box;
  public size: Vector3 = new Vector3(1, 1, 1);
  public centerOffset: Vector3 = new Vector3(0, 0, 0);
  public isTrigger: boolean = false;
  public friction: number = 0.4;
  public restitution: number = 0.2;

  getBoundingBox(position: Vector3): BoundingBox {
    const halfSize = this.size.clone().scale(0.5);
    const pos = position.clone().add(this.centerOffset);
    return new BoundingBox(
      pos.clone().sub(halfSize),
      pos.clone().add(halfSize)
    );
  }
}

export class CharacterController {
  public stepHeight: number = 0.3;
  public slopeLimit: number = 45;
  public isGrounded: boolean = false;
  public moveVelocity: Vector3 = new Vector3();
  public jumpSpeed: number = 5.0;
  public gravity: number = -9.81;

  move(direction: Vector3, dt: number): Vector3 {
    const displacement = direction.clone().scale(dt);
    if (!this.isGrounded) {
      this.moveVelocity.y += this.gravity * dt;
    } else {
      this.moveVelocity.y = 0;
    }
    displacement.y += this.moveVelocity.y * dt;
    return displacement;
  }

  jump(): void {
    if (this.isGrounded) {
      this.moveVelocity.y = this.jumpSpeed;
      this.isGrounded = false;
    }
  }
}

export interface RaycastHit {
  distance: number;
  point: Vector3;
  normal: Vector3;
  collider: Collider;
  rigidbody: RigidBody | null;
}

export class PhysicsWorld {
  public gravity: Vector3 = new Vector3(0, -9.81, 0);

  private bodies: { body: RigidBody; collider: Collider; position: Vector3 }[] = [];

  registerBody(body: RigidBody, collider: Collider, position: Vector3): void {
    this.bodies.push({ body, collider, position });
  }

  unregisterBody(body: RigidBody): void {
    this.bodies = this.bodies.filter(b => b.body !== body);
  }

  step(dt: number): void {
    for (const b of this.bodies) {
      if (b.body.type === RigidBodyType.Dynamic) {
        if (b.body.useGravity) {
          b.body.velocity.add(this.gravity.clone().scale(dt));
        }
        b.body.velocity.scale(1 - b.body.linearDamping * dt);
        b.position.add(b.body.velocity.clone().scale(dt));

        if (b.position.y - b.collider.size.y * 0.5 <= 0) {
          b.position.y = b.collider.size.y * 0.5;
          b.body.velocity.y = -b.body.velocity.y * b.collider.restitution;
          if (Math.abs(b.body.velocity.y) < 0.1) b.body.velocity.y = 0;
        }
      }
    }
  }

  raycast(ray: Ray, maxDistance: number = 100): RaycastHit | null {
    let closestHit: RaycastHit | null = null;
    let minDistance = maxDistance;

    for (const b of this.bodies) {
      const box = b.collider.getBoundingBox(b.position);
      const t = this.intersectRayBox(ray, box);
      if (t !== null && t >= 0 && t < minDistance) {
        minDistance = t;
        closestHit = {
          distance: t,
          point: ray.origin.clone().add(ray.direction.clone().scale(t)),
          normal: new Vector3(0, 1, 0),
          collider: b.collider,
          rigidbody: b.body
        };
      }
    }

    return closestHit;
  }

  private intersectRayBox(ray: Ray, box: BoundingBox): number | null {
    const invDir = new Vector3(
      1 / (ray.direction.x || 0.0001),
      1 / (ray.direction.y || 0.0001),
      1 / (ray.direction.z || 0.0001)
    );

    let t1 = (box.min.x - ray.origin.x) * invDir.x;
    let t2 = (box.max.x - ray.origin.x) * invDir.x;
    let tmin = Math.min(t1, t2);
    let tmax = Math.max(t1, t2);

    t1 = (box.min.y - ray.origin.y) * invDir.y;
    t2 = (box.max.y - ray.origin.y) * invDir.y;
    tmin = Math.max(tmin, Math.min(t1, t2));
    tmax = Math.min(tmax, Math.max(t1, t2));

    t1 = (box.min.z - ray.origin.z) * invDir.z;
    t2 = (box.max.z - ray.origin.z) * invDir.z;
    tmin = Math.max(tmin, Math.min(t1, t2));
    tmax = Math.min(tmax, Math.max(t1, t2));

    return tmax >= Math.max(0, tmin) ? tmin : null;
  }
}
