import test from 'node:test';
import assert from 'node:assert';
import { ParticleSystem } from '../packages/renderer/src/Particles.ts';

test('ParticleSystem emission, lifecycle update & pooling', () => {
  const sys = new ParticleSystem(100);

  sys.emitBurst([0, 1, 0], 'explosion', 20);
  assert.strictEqual(sys.mesh.count, 0); // before update

  sys.update(0.1);
  assert.strictEqual(sys.mesh.count, 20);

  // Update past lifetime
  sys.update(1.5);
  assert.strictEqual(sys.mesh.count, 0); // all recycled to pool
});
