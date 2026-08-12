import assert from 'node:assert';
import test from 'node:test';
import { World, Query, System } from '../packages/ecs/src/ECS.ts';
import { EasyScript } from '../packages/core/src/Scripting.ts';

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

test('EntityBuilder & spawnBatch for Less Code and High Performance', () => {
  const world = new World();
  world.createSharedContext('EnemyType', { health: 100, faction: 'Orc' });

  // 1. Single Entity via fluent EntityBuilder
  const player = world.buildEntity('Player')
    .with(new Position(10, 20))
    .with(new Velocity(2, 0))
    .tag('hero')
    .build();

  assert.strictEqual(world.getEntityName(player), 'Player');
  assert.strictEqual(world.getComponent(player, Position).x, 10);
  assert.strictEqual(world.hasTag(player, 'hero'), true);

  // 2. High performance batch spawning
  const enemies = world.spawnBatch(5, (builder, i) => {
    builder
      .with(new Position(i * 2, 0))
      .sharedContext('EnemyType')
      .tag('enemy');
  });

  assert.strictEqual(enemies.length, 5);
  assert.strictEqual(world.hasTag(enemies[2], 'enemy'), true);
  assert.strictEqual(world.getComponent(enemies[4], Position).x, 8);
  assert.strictEqual(world.sharedContexts.getEntityContextId(enemies[0]), 'EnemyType');
});

test('EntityBuilder single-line transform, mesh, physics & function value overrides', () => {
  const world = new World();

  // 1. One-line entity creation with default overrides via function value
  const boss = world.buildEntity('Boss')
    .at(0, 5, -10)
    .transform(def => ({ ...def, y: 15 })) // Function value override!
    .mesh('sphere', def => ({ ...def, color: '#ef4444', roughness: 0.2 }))
    .physics(def => ({ ...def, mass: 50, bodyType: 'kinematic' }))
    .spin(2.0)
    .bob(0.5, 4.0)
    .build();

  assert.strictEqual(world.getEntityName(boss), 'Boss');

  // Verify transform values
  const comps = world.getAllComponents(boss);
  const transformComp = comps.find(c => c.constructor.name === 'TransformComponent');
  assert.strictEqual(transformComp.x, 0);
  assert.strictEqual(transformComp.y, 15);
  assert.strictEqual(transformComp.z, -10);

  // Verify mesh values
  const meshComp = comps.find(c => c.constructor.name === 'MeshComponent');
  assert.strictEqual(meshComp.type, 'sphere');
  assert.strictEqual(meshComp.color, '#ef4444');
  assert.strictEqual(meshComp.roughness, 0.2);

  // Verify physics values
  const physComp = comps.find(c => c.constructor.name === 'PhysicsComponent');
  assert.strictEqual(physComp.mass, 50);
  assert.strictEqual(physComp.bodyType, 'kinematic');

  // Verify behavior values
  const behComp = comps.find(c => c.constructor.name === 'BehaviorComponent');
  assert.strictEqual(behComp.behaviorName, 'bob');
});

test('EasyScript.spawnObject one-line entity creation', () => {
  const world = new World();

  const hero = EasyScript.spawnObject(world, 'Hero', b => {
    b.at(1, 2, 3)
     .color('#3b82f6')
     .spin(1.5);
  });

  assert.strictEqual(world.getEntityName(hero), 'Hero');
  const comps = world.getAllComponents(hero);
  const transformComp = comps.find(c => c.constructor.name === 'TransformComponent');
  assert.strictEqual(transformComp.x, 1);
  assert.strictEqual(transformComp.y, 2);
  assert.strictEqual(transformComp.z, 3);
});

test('English-like world.entity() & world.load() two-tier API', async () => {
  const world = new World();

  // Mock app asset manager for testing model & sketchfab loading
  const loadedModels = [];
  world.setApp({
    scene: { add: (mesh) => loadedModels.push(mesh) },
    assets: {
      loadModel: async (url) => ({ name: url }),
      streamSketchfabModel: async (url) => ({ name: url, sketchfab: true })
    }
  });

  // 1. One-line primitive entity creation: world.entity('Hero').sphere().at(0, 2, 0).spin(1.5).bob(0.3, 3)
  const hero = world.entity('Hero')
    .sphere({ color: '#3b82f6', roughness: 0.2 })
    .at(0, 2, 0)
    .physics({ mass: 10 })
    .spin(1.5)
    .bob(0.3, 3);

  assert.strictEqual(world.getEntityName(hero.id), 'Hero');

  // 2. Simpler shorthand: world.entity('Hero2').sphere().at(0, 2, 0).spin(1.5)
  const hero2 = world.entity('Hero2')
    .sphere()
    .at(0, 2, 0)
    .spin(1.5);

  assert.strictEqual(world.getEntityName(hero2.id), 'Hero2');

  // 3. Load model with await: const player = await world.entity('Player').model('models/Fox.glb').at(0, 0, 0).physics({ mass: 5 }).tag('player')
  const player = await world.entity('Player')
    .model('models/Fox.glb')
    .at(0, 0, 0)
    .physics({ mass: 5 })
    .tag('player');

  assert.strictEqual(world.getEntityName(player.id), 'Player');
  assert.strictEqual(world.hasTag(player.id, 'player'), true);

  // 4. Direct world.load('assets/dungeon.blend')
  const level = await world.load('assets/dungeon.blend');
  assert.strictEqual(world.getEntityName(level.id), 'dungeon.blend');

  // 5. Sketchfab streaming: const statue = await world.entity('Statue').sketchfab('http://sketchfab...').spin(1)
  const statue = await world.entity('Statue')
    .sketchfab('https://sketchfab.com/3d-models/demo')
    .spin(1);

  assert.strictEqual(world.getEntityName(statue.id), 'Statue');

  // 6. Two-tier Advanced Control: hero.mesh(m => ({ ...m, color: 'blue', roughness: 0.2, metalness: 0.8 }))
  hero.mesh(mesh => ({
    ...mesh,
    color: 'blue',
    roughness: 0.2,
    metalness: 0.8
  }));

  hero.physics(def => ({
    ...def,
    mass: 10,
    friction: 0.2,
    restitution: 0.8
  }));

  const comps = world.getAllComponents(hero.id);
  const meshComp = comps.find(c => c.constructor.name === 'MeshComponent');
  assert.strictEqual(meshComp.color, 'blue');
  assert.strictEqual(meshComp.metalness, 0.8);

  const physComp = comps.find(c => c.constructor.name === 'PhysicsComponent');
  assert.strictEqual(physComp.friction, 0.2);
  assert.strictEqual(physComp.restitution, 0.8);
});

test('The Kairo Way - Zero Config "Describe What You Want" API', () => {
  const world = new World();

  // 1. world.add('Ground').box().scale(20, 1, 20)
  const ground = world.add('Ground')
    .box()
    .scale(20, 1, 20);

  assert.strictEqual(world.getEntityName(ground.id), 'Ground');
  let comps = world.getAllComponents(ground.id);
  let transformComp = comps.find(c => c.constructor.name === 'TransformComponent');
  assert.strictEqual(transformComp.sx, 20);
  assert.strictEqual(transformComp.sy, 1);
  assert.strictEqual(transformComp.sz, 20);

  // 2. world.add('Player').sphere('blue').at(0, 2, 0).physics().spin()
  const player = world.add('Player')
    .sphere('blue')
    .at(0, 2, 0)
    .physics()
    .spin()
    .move()
    .jump();

  assert.strictEqual(world.getEntityName(player.id), 'Player');
  comps = world.getAllComponents(player.id);
  const meshComp = comps.find(c => c.constructor.name === 'MeshComponent');
  assert.strictEqual(meshComp.color, 'blue');

  const physComp = comps.find(c => c.constructor.name === 'PhysicsComponent');
  assert.strictEqual(physComp.mass, 1.0); // Zero-config default mass=1

  // 3. Destroy helper
  player.destroy();
  assert.strictEqual(world.getEntityName(player.id), undefined);
});





