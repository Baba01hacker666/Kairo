import test from 'node:test';
import assert from 'node:assert';
import { FastSoAWorld } from '../packages/ecs/src/FastSoAWorld.ts';

function runSoABenchmark(entityCount, frameCount = 100) {
  const world = new FastSoAWorld(entityCount + 1000, 4.0);

  // Spawn entities into contiguous ArrayBuffer
  for (let i = 0; i < entityCount; i++) {
    const rx = (Math.random() - 0.5) * 90;
    const ry = (Math.random() - 0.5) * 90;
    const rz = (Math.random() - 0.5) * 90;
    const vx = (Math.random() - 0.5) * 12;
    const vy = (Math.random() - 0.5) * 12;
    const vz = (Math.random() - 0.5) * 12;

    world.spawnEntity(rx, ry, rz, vx, vy, vz, 0.5);
  }

  const dt = 1 / 60;
  const frameTimes = [];

  // Warmup 5 frames
  for (let w = 0; w < 5; w++) {
    world.update(dt);
  }

  // Execute continuous frames
  for (let frame = 0; frame < frameCount; frame++) {
    const t0 = performance.now();
    world.update(dt);
    const t1 = performance.now();
    frameTimes.push(t1 - t0);
  }

  const totalMs = frameTimes.reduce((a, b) => a + b, 0);
  const avgFrameMs = totalMs / frameCount;
  const sustainedFps = Math.round(1000 / Math.max(0.001, avgFrameMs));
  const is60FpsSustained = avgFrameMs <= 16.66;
  const throughput = Math.round((entityCount * frameCount) / (totalMs / 1000));

  console.log(`\n⚡ [WASM/SoA Contiguous Array Benchmark: ${entityCount.toLocaleString()} Active Entities] (${frameCount} Continuous Frames)`);
  console.log(`  - Avg Frame Time: ${avgFrameMs.toFixed(3)} ms / frame ${is60FpsSustained ? '⚡ (PASSES 60 FPS Target <= 16.66ms)' : '⚠️ (Exceeds 16.66ms)'}`);
  console.log(`  - Sustained FPS Score: ${sustainedFps} FPS`);
  console.log(`  - Throughput: ${throughput.toLocaleString()} Entity Updates / sec`);

  return { entityCount, avgFrameMs, sustainedFps, is60FpsSustained, throughput };
}

test('High-Performance WASM-Grade SoA Engine Multi-Tier Benchmark', () => {
  const tiers = [1000, 5000, 10000, 25000, 50000];
  const results = [];

  for (const count of tiers) {
    const res = runSoABenchmark(count, 100);
    results.push(res);
  }

  console.log('\n======================================================');
  console.log('🏆 WASM/SOA CONTIGUOUS BUFFER SCALING RESULTS');
  console.log('======================================================');
  for (const r of results) {
    const status = r.is60FpsSustained ? '✅ 60+ FPS SUSTAINED' : '❌ Below 60 FPS';
    console.log(`- ${r.entityCount.toLocaleString().padStart(6)} Colliding Entities: ${r.avgFrameMs.toFixed(2).padStart(6)} ms/frame | ${r.sustainedFps.toString().padStart(5)} FPS | ${(r.throughput / 1e6).toFixed(2).padStart(5)}M updates/s | ${status}`);
  }
  console.log('======================================================\n');

  assert.ok(results.find(r => r.entityCount === 1000).is60FpsSustained, '1,000 entities must run at 60+ FPS in SoA buffer');
});
