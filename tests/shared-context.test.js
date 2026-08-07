import { test } from 'node:test';
import assert from 'node:assert';
import { World } from '../packages/ecs/src/ECS.ts';
import { SharedEntityContextManager } from '../packages/ecs/src/SharedEntityContext.ts';

test('SharedEntityContext - Flyweight Registry & Entity Attachment', () => {
  const world = new World();

  // Create shared context record for bouncing spheres
  const ballContext = world.createSharedContext('red_bouncing_ball', {
    radius: 0.5,
    restitution: 0.9,
    friction: 0.1,
    color: 0xff0000,
    meshTemplate: 'sphere_primitive'
  });

  assert.strictEqual(ballContext.id, 'red_bouncing_ball');
  assert.strictEqual(ballContext.properties.radius, 0.5);
  assert.strictEqual(ballContext.properties.restitution, 0.9);

  // Instantiate 1,000 entities sharing this single context record
  const entityIds = [];
  for (let i = 0; i < 1000; i++) {
    const ent = world.createEntityWithSharedContext('red_bouncing_ball', `Ball_${i}`);
    entityIds.push(ent);
  }

  assert.strictEqual(ballContext.entityCount, 1000);
  assert.strictEqual(world.sharedContexts.getEntityContextId(entityIds[0]), 'red_bouncing_ball');

  // Verify batch iteration across context
  let iteratedCount = 0;
  world.sharedContexts.forEachInContext('red_bouncing_ball', (ent, shared) => {
    iteratedCount++;
    assert.strictEqual(shared.radius, 0.5);
    assert.strictEqual(shared.color, 0xff0000);
  });
  assert.strictEqual(iteratedCount, 1000);

  // Destroy 100 entities and verify entity cleanup in shared context
  for (let i = 0; i < 100; i++) {
    world.destroyEntity(entityIds[i]);
  }
  assert.strictEqual(ballContext.entityCount, 900);
});

test('SharedEntityContext - Memory & Batch Evaluation Benchmark (10,000 Entities)', () => {
  const world = new World();
  const COUNT = 10000;

  // Create 3 shared contexts
  world.createSharedContext('bouncing_ball', { radius: 0.5, bounciness: 0.95, color: 'red' });
  world.createSharedContext('heavy_crate', { sizeX: 1.0, sizeY: 1.0, sizeZ: 1.0, mass: 50.0, color: 'brown' });
  world.createSharedContext('laser_projectile', { speed: 100.0, damage: 25.0, lifespan: 2.0, color: 'cyan' });

  const startInstantiation = performance.now();
  for (let i = 0; i < COUNT; i++) {
    const ctxId = i % 3 === 0 ? 'bouncing_ball' : (i % 3 === 1 ? 'heavy_crate' : 'laser_projectile');
    world.createEntityWithSharedContext(ctxId);
  }
  const instantiationDuration = performance.now() - startInstantiation;

  const stats = world.sharedContexts.getStats();
  assert.strictEqual(stats.totalRegisteredContexts, 3);
  assert.strictEqual(stats.totalEntitiesSharing, COUNT);
  assert.ok(stats.estimatedMemorySavedBytes > 1000000, `Expected > 1MB memory saved, got ${stats.estimatedMemorySavedBytes}B`);

  // Measure batch iteration performance
  let totalDamageRead = 0;
  const startEval = performance.now();
  world.sharedContexts.forEachInContext('laser_projectile', (ent, shared) => {
    totalDamageRead += shared.damage;
  });
  const evalDuration = performance.now() - startEval;

  console.log(`⚡ SharedEntityContext 10,000 Entity Benchmark: Instantiation=${instantiationDuration.toFixed(2)}ms, Batch Eval=${evalDuration.toFixed(2)}ms, Est. Memory Saved=${(stats.estimatedMemorySavedBytes / 1024 / 1024).toFixed(2)} MB`);
});
