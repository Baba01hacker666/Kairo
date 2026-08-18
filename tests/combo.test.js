import test from 'node:test';
import assert from 'node:assert';
import { ComboDetector } from '../packages/input/src/ComboDetector.ts';
import { InputManager } from '../packages/input/src/Input.ts';

test('ComboDetector - Sequence matching and triggering', () => {
  let dashTriggered = 0;
  let konamiTriggered = 0;

  const detector = new ComboDetector()
    .register({
      name: 'dash_right',
      sequence: ['KeyD', 'KeyD'],
      maxDelayMs: 400,
      onTrigger: () => dashTriggered++
    })
    .register({
      name: 'konami',
      sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'KeyB', 'KeyA'],
      onTrigger: () => konamiTriggered++
    });

  // Single press -> no trigger
  let res = detector.feed('KeyD', 1000);
  assert.deepStrictEqual(res, []);
  assert.strictEqual(dashTriggered, 0);

  // Second press within 400ms -> triggers dash!
  res = detector.feed('KeyD', 1200);
  assert.deepStrictEqual(res, ['dash_right']);
  assert.strictEqual(dashTriggered, 1);

  // Feed Konami sequence
  detector.feed('ArrowUp', 2000);
  detector.feed('ArrowUp', 2100);
  detector.feed('ArrowDown', 2200);
  detector.feed('ArrowDown', 2300);
  detector.feed('KeyB', 2400);
  const konamiRes = detector.feed('KeyA', 2500);

  assert.deepStrictEqual(konamiRes, ['konami']);
  assert.strictEqual(konamiTriggered, 1);
});

test('ComboDetector - Timeout reset when input is too slow', () => {
  let comboCount = 0;
  const detector = new ComboDetector().register({
    name: 'quick_punch',
    sequence: ['KeyJ', 'KeyK'],
    maxDelayMs: 200,
    onTrigger: () => comboCount++
  });

  detector.feed('KeyJ', 1000);
  // Wait 300ms (> 200ms max delay)
  const res = detector.feed('KeyK', 1350);

  assert.deepStrictEqual(res, []);
  assert.strictEqual(comboCount, 0);
});

test('InputManager - registerCombo helper integration', () => {
  const input = new InputManager();
  let specialMove = false;

  input.registerCombo('special', ['KeyQ', 'KeyW', 'KeyE'], () => {
    specialMove = true;
  });

  input.combos.feed('KeyQ', 100);
  input.combos.feed('KeyW', 200);
  input.combos.feed('KeyE', 300);

  assert.strictEqual(specialMove, true);
});
