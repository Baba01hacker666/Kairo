import assert from 'node:assert';
import test from 'node:test';
import { World, Query, System } from '../packages/ecs/src/ECS.ts';

class Position {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Velocity {
  constructor(vx = 1, vy = 1) {
    this.vx = vx;
    this.vy = vy;
  }
}

class MovementSystem extends System {
  update(world, delta) {
    const entities = world.query(new Query([Position, Velocity]));
    for (const id of entities) {
      const pos = world.getComponent(id, Position);
      const vel = world.getComponent(id, Velocity);
      pos.x += vel.vx * delta;
      pos.y += vel.vy * delta;
    }
  }
}

test('ECS Entity, Component, Query & System pipeline', () => {
  const world = new World();
  const entity = world.createEntity('TestEntity');

  world.addComponent(entity, new Position(0, 0));
  world.addComponent(entity, new Velocity(10, 5));

  assert.strictEqual(world.hasComponent(entity, Position), true);

  const sys = new MovementSystem();
  world.addSystem(sys);

  world.update(0.1);

  const pos = world.getComponent(entity, Position);
  assert.strictEqual(pos.x, 1);
  assert.strictEqual(pos.y, 0.5);
});
