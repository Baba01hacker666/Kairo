import assert from 'node:assert';
import test from 'node:test';
import { PhysicsWorld, RigidBody, Collider, RigidBodyType } from '../packages/physics/src/Physics.ts';
import { Vector3, Ray } from '../packages/core/src/Math.ts';

test('Physics gravity step and collision raycast', () => {
  const world = new PhysicsWorld();
  const body = new RigidBody();
  body.type = RigidBodyType.Dynamic;
  body.useGravity = true;

  const collider = new Collider();
  const pos = new Vector3(0, 10, 0);

  world.registerBody(body, collider, pos);
  world.step(0.1);

  // Velocity should increase downwards due to gravity
  assert(body.velocity.y < 0);
  assert(pos.y < 10);
});

test('Physics Raycasting', () => {
  const world = new PhysicsWorld();
  const collider = new Collider();
  collider.size = new Vector3(2, 2, 2);
  const pos = new Vector3(0, 0, 0);

  world.registerBody(new RigidBody(), collider, pos);

  const ray = new Ray(new Vector3(0, 0, 10), new Vector3(0, 0, -1));
  const hit = world.raycast(ray);

  assert.notStrictEqual(hit, null);
  assert(hit.distance > 0);
});
