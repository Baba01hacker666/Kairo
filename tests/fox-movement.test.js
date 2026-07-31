import test from 'node:test';
import assert from 'node:assert/strict';
import { canAcceptMoveInput, hasArrivedAtGridTarget, MOVE_ARRIVAL_EPSILON, toCardinalMove } from '../examples/fox-game/movement.ts';

test('fox input resolves analog/joystick vectors to one cardinal grid step', () => {
  assert.deepEqual(toCardinalMove({ x: 0.9, y: 0.2 }), [1, 0]);
  assert.deepEqual(toCardinalMove({ x: -0.9, y: 0.2 }), [-1, 0]);
  assert.deepEqual(toCardinalMove({ x: 0.2, y: 0.9 }), [0, 1]);
  assert.deepEqual(toCardinalMove({ x: 0.2, y: -0.9 }), [0, -1]);
});

test('fox movement input waits until visual model reaches target tile', () => {
  assert.equal(hasArrivedAtGridTarget(MOVE_ARRIVAL_EPSILON - 0.01), true);
  assert.equal(hasArrivedAtGridTarget(MOVE_ARRIVAL_EPSILON + 0.01), false);
  assert.equal(canAcceptMoveInput(500, 0, 260, MOVE_ARRIVAL_EPSILON + 0.01), false);
  assert.equal(canAcceptMoveInput(500, 0, 260, MOVE_ARRIVAL_EPSILON - 0.01), true);
});

test('fox movement input respects cooldown even after arriving', () => {
  assert.equal(canAcceptMoveInput(100, 0, 260, 0), false);
  assert.equal(canAcceptMoveInput(261, 0, 260, 0), true);
});
