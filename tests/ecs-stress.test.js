import test from 'node:test';
import assert from 'node:assert';
import { World, System } from '../packages/ecs/src/ECS.ts';
import { Vector3 } from '../packages/core/src/Math.ts';

class TransformComponent {
  constructor(position = new Vector3(), radius = 0.5) {
    this.position = position;
    this.radius = radius;
  }
}

class RigidBodyPhysicsComponent {
  constructor(velocity = new Vector3(), mass = 1.0) {
    this.velocity = velocity;
    this.mass = mass;
  }
}

class HighSpeedIntHashSpatialGrid3D {
  constructor(cellSize = 6.0) {
    this.cellSize = cellSize;
    this.invCellSize = 1.0 / cellSize;
    this.grid = new Map();
    this.nearbyBuffer = [];
  }

  clear() {
    this.grid.clear();
  }

  insert(id, transform, body) {
    const cx = (transform.position.x * this.invCellSize) | 0;
    const cy = (transform.position.y * this.invCellSize) | 0;
    const cz = (transform.position.z * this.invCellSize) | 0;
    const key = (cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push({ id, transform, body });
  }

  getNearby(pos) {
    const cx = (pos.x * this.invCellSize) | 0;
    const cy = (pos.y * this.invCellSize) | 0;
    const cz = (pos.z * this.invCellSize) | 0;
    this.nearbyBuffer.length = 0;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = ((cx + dx) * 73856093) ^ ((cy + dy) * 19349663) ^ ((cz + dz) * 83492791);
          const cell = this.grid.get(key);
          if (cell) {
            for (let i = 0; i < cell.length; i++) {
              this.nearbyBuffer.push(cell[i]);
            }
          }
        }
      }
    }
    return this.nearbyBuffer;
  }
}

class OptimizedPhysicalCollisionSystem extends System {
  constructor() {
    super();
    this.grid = new HighSpeedIntHashSpatialGrid3D(6.0);
  }

  update(world, dt) {
    this.grid.clear();

    // 1. Position Integration, World Boundary Bounce, & Spatial Grid Population
    world.each2(TransformComponent, RigidBodyPhysicsComponent, (entity, transform, body) => {
      // 3D Velocity Integration
      transform.position.x += body.velocity.x * dt;
      transform.position.y += body.velocity.y * dt;
      transform.position.z += body.velocity.z * dt;

      // Boundary Collisions (-50m to +50m cube)
      const BOUND = 50.0;
      if (Math.abs(transform.position.x) > BOUND) {
        transform.position.x = Math.sign(transform.position.x) * BOUND;
        body.velocity.x *= -1;
      }
      if (Math.abs(transform.position.y) > BOUND) {
        transform.position.y = Math.sign(transform.position.y) * BOUND;
        body.velocity.y *= -1;
      }
      if (Math.abs(transform.position.z) > BOUND) {
        transform.position.z = Math.sign(transform.position.z) * BOUND;
        body.velocity.z *= -1;
      }

      this.grid.insert(entity, transform, body);
    });

    // 2. High-Speed Zero-Allocation Integer Hash Collision Detection & Overlap Elastic Bounce
    let collisionCount = 0;

    world.each2(TransformComponent, RigidBodyPhysicsComponent, (entityA, transformA, bodyA) => {
      const neighbors = this.grid.getNearby(transformA.position);

      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const entityB = neighbor.id;

        if (entityA >= entityB) continue; // Avoid duplicate pairs

        const transformB = neighbor.transform;
        const bodyB = neighbor.body;

        // 3D Distance Vector
        const dx = transformB.position.x - transformA.position.x;
        const dy = transformB.position.y - transformA.position.y;
        const dz = transformB.position.z - transformA.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const minDist = transformA.radius + transformB.radius;

        // Sphere Collision Detection
        if (distSq < minDist * minDist && distSq > 0.0001) {
          collisionCount++;
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          // Position Overlap Separation
          const overlap = 0.5 * (minDist - dist);
          transformA.position.x -= nx * overlap;
          transformA.position.y -= ny * overlap;
          transformA.position.z -= nz * overlap;
          transformB.position.x += nx * overlap;
          transformB.position.y += ny * overlap;
          transformB.position.z += nz * overlap;

          // Momentum Elastic Bounce Vector Resolution
          const kx = bodyA.velocity.x - bodyB.velocity.x;
          const ky = bodyA.velocity.y - bodyB.velocity.y;
          const kz = bodyA.velocity.z - bodyB.velocity.z;
          const p = 2 * (nx * kx + ny * ky + nz * kz) / (bodyA.mass + bodyB.mass);

          bodyA.velocity.x -= p * bodyB.mass * nx;
          bodyA.velocity.y -= p * bodyB.mass * ny;
          bodyA.velocity.z -= p * bodyB.mass * nz;
          bodyB.velocity.x += p * bodyA.mass * nx;
          bodyB.velocity.y += p * bodyA.mass * ny;
          bodyB.velocity.z += p * bodyA.mass * nz;
        }
      }
    });

    return collisionCount;
  }
}

function runRealPhysicsBenchmark(entityCount, frameCount = 100) {
  const world = new World();
  const sys = new OptimizedPhysicalCollisionSystem();
  world.addSystem(sys);

  // Spawn Entities with 3D Vectors in a 100m cube
  for (let i = 0; i < entityCount; i++) {
    const entity = world.createEntity();
    const rx = (Math.random() - 0.5) * 90;
    const ry = (Math.random() - 0.5) * 90;
    const rz = (Math.random() - 0.5) * 90;
    const vx = (Math.random() - 0.5) * 12;
    const vy = (Math.random() - 0.5) * 12;
    const vz = (Math.random() - 0.5) * 12;

    world.addComponent(entity, new TransformComponent(new Vector3(rx, ry, rz), 0.5));
    world.addComponent(entity, new RigidBodyPhysicsComponent(new Vector3(vx, vy, vz), 1.0));
  }

  const dt = 1 / 60;
  const frameTimes = [];

  // Warmup 5 frames
  for (let w = 0; w < 5; w++) {
    world.updateAll(dt);
  }

  // Execute Sustained Real Physics Engine Frames
  for (let frame = 0; frame < frameCount; frame++) {
    const t0 = performance.now();
    world.updateAll(dt);
    const t1 = performance.now();
    frameTimes.push(t1 - t0);
  }

  const totalMs = frameTimes.reduce((a, b) => a + b, 0);
  const avgFrameMs = totalMs / frameCount;
  const minFrameMs = Math.min(...frameTimes);
  const maxFrameMs = Math.max(...frameTimes);
  const sustainedFps = Math.round(1000 / Math.max(0.001, avgFrameMs));
  const is60FpsSustained = avgFrameMs <= 16.66;

  console.log(`\n💥 [Real 3D Physics Collision Benchmark: ${entityCount.toLocaleString()} Active Entities] (${frameCount} Continuous Frames)`);
  console.log(`  - Avg Frame Time: ${avgFrameMs.toFixed(3)} ms / frame ${is60FpsSustained ? '⚡ (PASSES 60 FPS Target <= 16.66ms)' : '⚠️ (Exceeds 16.66ms)'}`);
  console.log(`  - Min / Max Frame Time: ${minFrameMs.toFixed(3)} ms / ${maxFrameMs.toFixed(3)} ms`);
  console.log(`  - Sustained FPS Score: ${sustainedFps} FPS`);

  return { entityCount, avgFrameMs, sustainedFps, is60FpsSustained };
}

test('Real 3D Spatial Physics & Entity Collision Benchmark Suite', () => {
  const tiers = [500, 1000, 2000, 3000];
  const results = [];

  for (const count of tiers) {
    const res = runRealPhysicsBenchmark(count, 100);
    results.push(res);
  }

  console.log('\n======================================================');
  console.log('🏆 REAL 3D PHYSICS & COLLISION SCALING SUMMARY');
  console.log('======================================================');
  for (const r of results) {
    const status = r.is60FpsSustained ? '✅ 60+ FPS SUSTAINED' : '❌ Below 60 FPS';
    console.log(`- ${r.entityCount.toLocaleString().padStart(5)} Colliding Entities: ${r.avgFrameMs.toFixed(2).padStart(6)} ms/frame | ${r.sustainedFps.toString().padStart(4)} FPS | ${status}`);
  }
  console.log('======================================================\n');

  assert.ok(results.find(r => r.entityCount === 500).is60FpsSustained, '500 colliding entities must be sustained at 60+ FPS');
});
