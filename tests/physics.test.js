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

test('Physics useGravity false body floats in place', () => {
  const world = new PhysicsWorld();
  world.gravity = new Vector3(0, -30, 0);

  const floorBody = new RigidBody();
  floorBody.type = RigidBodyType.Static;
  const floorCollider = new Collider();
  floorCollider.size = new Vector3(100, 1, 100);
  const floorPos = new Vector3(0, -0.5, 0);
  world.registerBody(floorBody, floorCollider, floorPos);

  const falling = new RigidBody();
  falling.type = RigidBodyType.Dynamic;
  const fallCollider = new Collider();
  fallCollider.size = new Vector3(1, 1, 1);
  const fallPos = new Vector3(0, 5, 0);
  world.registerBody(falling, fallCollider, fallPos);

  const floating = new RigidBody();
  floating.type = RigidBodyType.Dynamic;
  floating.useGravity = false;
  const floatCollider = new Collider();
  floatCollider.size = new Vector3(1, 1, 1);
  const floatPos = new Vector3(10, 8, 10);
  world.registerBody(floating, floatCollider, floatPos);

  for (let i = 0; i < 120; i++) world.step(1 / 60);

  // Gravity-affected body falls and settles on the floor
  assert(fallPos.y < 5);
  assert(Math.abs(falling.velocity.y) < 0.01);

  // Gravity-less body keeps its position and velocity
  assert.strictEqual(floatPos.y, 8);
  assert.strictEqual(floating.velocity.y, 0);
  assert.strictEqual(floatPos.x, 10);
  assert.strictEqual(floatPos.z, 10);
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

test('Physics collision events and overlap queries', () => {
  const world = new PhysicsWorld();

  const floorBody = new RigidBody();
  floorBody.type = RigidBodyType.Static;
  const floorCollider = new Collider();
  floorCollider.size = new Vector3(10, 1, 10);
  const floorPos = new Vector3(0, 0, 0);
  world.registerBody(floorBody, floorCollider, floorPos);

  const ballBody = new RigidBody();
  ballBody.type = RigidBodyType.Dynamic;
  const ballCollider = new Collider();
  ballCollider.size = new Vector3(1, 1, 1);
  const ballPos = new Vector3(0, 3, 0);
  world.registerBody(ballBody, ballCollider, ballPos);

  const phases = [];
  world.onCollision(event => phases.push(event.phase));
  for (let i = 0; i < 90; i++) world.step(1 / 60);

  assert(phases.includes('enter'));
  assert(world.overlapBox(new Vector3(0, 0, 0), new Vector3(12, 2, 12)).includes(floorBody));
  assert(world.overlapSphere(new Vector3(0, 0.5, 0), 2).includes(ballBody));
});

test('Physics raycast and sphereCast return hit metadata', () => {
  const world = new PhysicsWorld();
  const body = new RigidBody();
  body.type = RigidBodyType.Static;
  const collider = new Collider();
  collider.size = new Vector3(2, 2, 2);
  const pos = new Vector3(0, 0, 0);
  world.registerBody(body, collider, pos);

  const rayHit = world.raycast(new Ray(new Vector3(0, 0, 5), new Vector3(0, 0, -1)), 10);
  assert.strictEqual(rayHit.body, body);
  assert.strictEqual(rayHit.collider, collider);
  assert(rayHit.normal.z > 0);

  const sphereHit = world.sphereCast(new Vector3(0, 0, 5), 0.5, new Vector3(0, 0, -1), 10);
  assert.strictEqual(sphereHit.body, body);
  assert(sphereHit.distance > 0);
});
