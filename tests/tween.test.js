import test from 'node:test';
import assert from 'node:assert';
import { TweenManager, Tween, Easing, getEasing } from '../packages/core/src/Tween.ts';

test('Tween - linear interpolation of scalar properties', () => {
  const manager = new TweenManager();
  const obj = { x: 0, y: 100 };
  const updates = [];

  manager.to(obj, { x: 10, y: 0 }, { duration: 1, easing: 'linear', onUpdate: e => updates.push(e) });
  manager.update(0.5);
  assert.strictEqual(obj.x, 5);
  assert.strictEqual(obj.y, 50);

  manager.update(0.5);
  assert.strictEqual(obj.x, 10); // exact end value
  assert.strictEqual(obj.y, 0);
  assert.strictEqual(manager.count, 0); // removed when finished
  assert.strictEqual(updates[updates.length - 1], 1);
});

test('Tween - onComplete fires and default easing is eased', () => {
  const manager = new TweenManager();
  const obj = { opacity: 0 };
  let completed = false;
  let firstUpdate = 0;

  manager.to(obj, { opacity: 1 }, { duration: 1, onUpdate: e => { if (firstUpdate === 0) firstUpdate = e; }, onComplete: () => completed = true });
  manager.update(0.5);
  // inOutQuad(0.5) = 0.5, so opacity mid = 0.5
  assert.strictEqual(obj.opacity, 0.5);
  assert.strictEqual(firstUpdate, 0.5);

  manager.update(0.5);
  assert.strictEqual(obj.opacity, 1);
  assert.strictEqual(completed, true);
});

test('Tween - delay delays progress', () => {
  const manager = new TweenManager();
  const obj = { x: 0 };
  manager.to(obj, { x: 10 }, { duration: 1, delay: 1, easing: 'linear' });

  manager.update(0.5);
  assert.strictEqual(obj.x, 0);
  manager.update(0.5);
  assert.strictEqual(obj.x, 0); // delay fully consumed at 1.0, tween not started
  manager.update(0.5);
  assert.strictEqual(obj.x, 5);
  manager.update(0.5);
  assert.strictEqual(obj.x, 10);
});

test('Tween - repeat plays extra cycles before completing', () => {
  const manager = new TweenManager();
  const obj = { x: 0 };
  let completes = 0;
  manager.to(obj, { x: 10 }, { duration: 1, easing: 'linear', repeat: 1, onComplete: () => completes++ });

  manager.update(1); // cycle 1
  assert.strictEqual(obj.x, 10);
  assert.strictEqual(completes, 0);
  manager.update(1); // cycle 2
  assert.strictEqual(obj.x, 10);
  assert.strictEqual(completes, 1);
});

test('Tween - yoyo returns to start and completes after one cycle', () => {
  const manager = new TweenManager();
  const obj = { x: 0 };
  let completes = 0;
  manager.to(obj, { x: 10 }, { duration: 1, easing: 'linear', yoyo: true, onComplete: () => completes++ });

  manager.update(1); // forward
  assert.strictEqual(obj.x, 10);
  manager.update(0.5); // reverse halfway
  assert.strictEqual(obj.x, 5);
  manager.update(0.5); // reverse done
  assert.strictEqual(obj.x, 0); // exact start
  assert.strictEqual(completes, 1);
});

test('Tween - chaining with then() runs sequentially', () => {
  const manager = new TweenManager();
  const obj = { x: 0 };
  const order = [];
  manager.to(obj, { x: 10 }, { duration: 1, easing: 'linear', onComplete: () => order.push('first') })
    .then(manager.to(obj, { x: 0 }, { duration: 1, easing: 'linear', onComplete: () => order.push('second') }));

  manager.update(1);
  assert.strictEqual(obj.x, 10);
  assert.deepStrictEqual(order, ['first']);

  manager.update(1);
  assert.strictEqual(obj.x, 0);
  assert.deepStrictEqual(order, ['first', 'second']);
  assert.strictEqual(manager.count, 0);
});

test('Tween - interpolates arrays and nested objects', () => {
  const manager = new TweenManager();
  const obj = { pos: { x: 0, y: 0 }, color: [0, 0, 0] };
  manager.to(obj, { pos: { x: 10, y: 20 }, color: [1, 0.5, 0] }, { duration: 1, easing: 'linear' });

  manager.update(0.5);
  assert.strictEqual(obj.pos.x, 5);
  assert.strictEqual(obj.pos.y, 10);
  assert.strictEqual(obj.color[0], 0.5);
  assert.strictEqual(obj.color[1], 0.25);

  manager.update(0.5);
  assert.strictEqual(obj.pos.x, 10);
  assert.strictEqual(obj.pos.y, 20);
  assert.strictEqual(obj.color[2], 0);
});

test('Tween - from() tweens from given values to current', () => {
  const manager = new TweenManager();
  const obj = { scale: 2 };
  manager.from(obj, { scale: 0 }, { duration: 1, easing: 'linear' });

  manager.update(0.5);
  assert.strictEqual(obj.scale, 1);
  manager.update(0.5);
  assert.strictEqual(obj.scale, 2);
});

test('Tween - non-numeric properties are skipped without errors', () => {
  const manager = new TweenManager();
  const obj = { x: 0, name: 'fox', tag: 'hero' };
  manager.to(obj, { x: 10, name: 'wolf', tag: 'villain' }, { duration: 1, easing: 'linear' });
  manager.update(0.5);
  assert.strictEqual(obj.x, 5);
  assert.strictEqual(obj.name, 'fox'); // string props untouched
  assert.strictEqual(obj.tag, 'hero');
  manager.update(0.5);
  assert.strictEqual(obj.x, 10);
});

test('Tween - fromTo() and killAll()', () => {
  const manager = new TweenManager();
  const obj = { x: 0 };
  manager.fromTo(obj, { x: -5 }, { x: 5 }, { duration: 1, easing: 'linear' });
  manager.update(0.5);
  assert.strictEqual(obj.x, 0);

  manager.killAll();
  assert.strictEqual(manager.count, 0);
});

test('Easing - named easings exist and map endpoints correctly', () => {
  assert.strictEqual(getEasing('linear')(0.5), 0.5);
  assert.strictEqual(getEasing('inQuad')(0.5), 0.25);
  assert.strictEqual(getEasing('outQuad')(0.5), 0.75);
  assert.strictEqual(getEasing('linear')(0), 0);
  assert.strictEqual(getEasing('linear')(1), 1);
  // Custom function passthrough
  const custom = t => t * t;
  assert.strictEqual(getEasing(custom), custom);
  // Unknown name falls back to linear
  assert.strictEqual(getEasing('not-a-thing')(0.5), 0.5);
  assert.ok(Easing.inOutElastic(1), 1);
});

test('Tween - nested object props keep correct eased values across many frames (regression: from aliasing)', () => {
  const manager = new TweenManager();
  const obj = { pos: { x: 0 } };
  manager.to(obj, { pos: { x: 10 } }, { duration: 1, easing: 'linear' });

  manager.update(0.25);
  assert.strictEqual(obj.pos.x, 2.5);
  manager.update(0.25);
  assert.strictEqual(obj.pos.x, 5); // was 6.25 when from aliased the target
  manager.update(0.25);
  assert.strictEqual(obj.pos.x, 7.5); // was 9.0625
  manager.update(0.25);
  assert.strictEqual(obj.pos.x, 10);
});

test('Tween - yoyo on array props returns exactly to start (regression: from aliasing)', () => {
  const manager = new TweenManager();
  const obj = { color: [0, 0] };
  manager.to(obj, { color: [10, 10] }, { duration: 1, easing: 'linear', yoyo: true });

  manager.update(1);   // forward
  assert.strictEqual(obj.color[0], 10);
  manager.update(0.5); // reverse halfway
  assert.strictEqual(obj.color[0], 5); // was stuck at 10
  manager.update(0.5); // reverse done
  assert.strictEqual(obj.color[0], 0);
  assert.strictEqual(obj.color[1], 0);
  assert.strictEqual(manager.count, 0);
});

test('Tween - from() with nested object ends at the original current value (regression: to aliasing)', () => {
  const manager = new TweenManager();
  const obj = { pos: { x: 10 } };
  manager.from(obj, { pos: { x: 0 } }, { duration: 1, easing: 'linear' });

  manager.update(0.5);
  assert.strictEqual(obj.pos.x, 5);
  manager.update(0.5);
  assert.strictEqual(obj.pos.x, 10); // was stuck at 5 when to aliased the target
});

test('Tween - delay overshoot carries into the first tween frame', () => {
  const manager = new TweenManager();
  const obj = { x: 0 };
  manager.to(obj, { x: 10 }, { duration: 1, delay: 0.25, easing: 'linear' });

  manager.update(0.5); // 0.25 consumed by delay, 0.25 applied to the tween
  assert.strictEqual(obj.x, 2.5);
  manager.update(0.75);
  assert.strictEqual(obj.x, 10);
  assert.strictEqual(manager.count, 0);
});
