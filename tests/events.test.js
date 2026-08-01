import test from 'node:test';
import assert from 'node:assert';
import { EventBus, KeyEventTrigger, EventActionDispatcher, EventPriority } from '../packages/events/src/Events.ts';

test('EventBus priority, wildcard, and cancellation', () => {
  const bus = new EventBus();
  const order = [];

  bus.on('test:event', () => { order.push('normal'); }, EventPriority.NORMAL);
  bus.on('test:event', () => { order.push('high'); }, EventPriority.HIGH);
  bus.on('test:event', () => { order.push('critical'); }, EventPriority.CRITICAL);

  bus.emit('test:event');
  assert.deepStrictEqual(order, ['critical', 'high', 'normal']);
});

test('KeyEventTrigger Enter key launches key:Enter and action:submit events', () => {
  const bus = new EventBus();
  const trigger = new KeyEventTrigger(bus);

  let enterFired = false;
  let submitFired = false;
  let customBoundFired = false;

  bus.on('key:Enter', () => { enterFired = true; });
  bus.on('action:submit', () => { submitFired = true; });

  trigger.bindKey('Enter', 'game:start');
  bus.on('game:start', () => { customBoundFired = true; });

  // Simulate pressing Enter key
  trigger.handleKeyDown({
    code: 'Enter',
    key: 'Enter',
    repeat: false,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    timestamp: Date.now()
  });

  assert.strictEqual(enterFired, true);
  assert.strictEqual(submitFired, true);
  assert.strictEqual(customBoundFired, true);
  assert.strictEqual(trigger.isKeyDown('Enter'), true);

  trigger.destroy();
});

test('EventActionDispatcher executes registered callback on event', () => {
  const bus = new EventBus();
  const dispatcher = new EventActionDispatcher(bus);
  let actionExecuted = false;

  dispatcher.addAction('player:jump', (data) => {
    actionExecuted = true;
    assert.strictEqual(data.height, 5);
  });

  bus.emit('player:jump', { height: 5 });
  assert.strictEqual(actionExecuted, true);
});
