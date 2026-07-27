import assert from 'node:assert';
import test from 'node:test';
import { Vector2, Vector3, Quaternion, MathUtils } from '../packages/core/src/Math.ts';

test('Vector3 operations', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  
  v1.add(v2);
  assert.strictEqual(v1.x, 5);
  assert.strictEqual(v1.y, 7);
  assert.strictEqual(v1.z, 9);

  const len = new Vector3(3, 0, 0).length();
  assert.strictEqual(len, 3);
});

test('Quaternion Euler conversion & Slerp', () => {
  const q = new Quaternion();
  q.setFromEuler(0, Math.PI / 2, 0);
  assert(Math.abs(q.y - Math.sin(Math.PI / 4)) < 0.0001);
});

test('MathUtils clamping and lerp', () => {
  assert.strictEqual(MathUtils.clamp(15, 0, 10), 10);
  assert.strictEqual(MathUtils.lerp(0, 100, 0.5), 50);
});
