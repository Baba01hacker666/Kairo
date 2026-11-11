import test from 'node:test';
import assert from 'node:assert/strict';
import { Engine } from '../packages/core/src/Engine.ts';
import { Time } from '../packages/core/src/Time.ts';

test('Time handles zero timestamps, paused clocks and long FPS windows', () => {
  Time.resetClock();
  Time.update(0);
  Time.update(100);
  assert.equal(Time.deltaTime, 0.1);
  Time.update(2100);
  assert.equal(Time.deltaTime, 0.1);
  assert.ok(Math.abs(Time.fps - 2 / 2.1) < 1e-9);
  Time.update(2000);
  assert.equal(Time.deltaTime, 0.1);
  Time.resetClock();
  Time.update(5000);
  assert.equal(Time.deltaTime, 0);
});

test('Engine cancels paused frames, avoids duplicate loops and stops scheduling inside callbacks', () => {
  const oldRequest = globalThis.requestAnimationFrame;
  const oldCancel = globalThis.cancelAnimationFrame;
  const pending = new Map();
  let id = 0;
  globalThis.requestAnimationFrame = fn => { pending.set(++id, fn); return id; };
  globalThis.cancelAnimationFrame = key => pending.delete(key);
  try {
    const engine = new Engine();
    engine.start();
    assert.equal(pending.size, 1);
    engine.pause();
    assert.equal(pending.size, 0);
    engine.resume();
    assert.equal(pending.size, 1);
    engine.events.once('update', () => { engine.pause(); engine.resume(); });
    const [key, callback] = pending.entries().next().value;
    pending.delete(key);
    callback(performance.now() + 16);
    assert.equal(pending.size, 1);
    engine.events.once('render', () => engine.stop());
    const [nextKey, next] = pending.entries().next().value;
    pending.delete(nextKey);
    next(performance.now() + 32);
    assert.equal(pending.size, 0);
  } finally {
    globalThis.requestAnimationFrame = oldRequest;
    globalThis.cancelAnimationFrame = oldCancel;
  }
});
