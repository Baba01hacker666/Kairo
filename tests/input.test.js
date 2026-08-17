import test from 'node:test';
import assert from 'node:assert';

// Stub window before importing so InputManager constructors register their
// listeners somewhere we can invoke directly (no real DOM in node).
const listeners = {};
globalThis.window = {
  addEventListener: (name, fn) => {
    (listeners[name] ||= []).push(fn);
  }
};

const { InputManager } = await import('../packages/input/src/Input.ts');

const fire = (name, event) => {
  for (const fn of listeners[name] ?? []) fn(event);
};

test('InputManager - mousemove events accumulate mouseDelta within a frame (regression)', () => {
  const input = new InputManager();

  fire('mousemove', { movementX: 3, movementY: 1, clientX: 10, clientY: 20 });
  fire('mousemove', { movementX: 2, movementY: 4, clientX: 12, clientY: 24 });

  // Both events' motion must be visible to the game this frame
  assert.strictEqual(input.mouseDelta.x, 5);
  assert.strictEqual(input.mouseDelta.y, 5);
  // Position reflects the latest event
  assert.strictEqual(input.mousePosition.x, 12);
  assert.strictEqual(input.mousePosition.y, 24);

  input.endFrame();
  assert.strictEqual(input.mouseDelta.x, 0);
  assert.strictEqual(input.mouseDelta.y, 0);
});

test('InputManager - key down/up tracked with just-pressed semantics', () => {
  const input = new InputManager();

  fire('keydown', { code: 'KeyW' });
  assert.strictEqual(input.isKeyDown('KeyW'), true);
  assert.strictEqual(input.isKeyJustPressed('KeyW'), true);

  input.endFrame();
  assert.strictEqual(input.isKeyDown('KeyW'), true);
  assert.strictEqual(input.isKeyJustPressed('KeyW'), false);

  fire('keyup', { code: 'KeyW' });
  assert.strictEqual(input.isKeyDown('KeyW'), false);
});
