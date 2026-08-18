import test from 'node:test';
import assert from 'node:assert';
import { StateMachine } from '../packages/ai/src/StateMachine.ts';

test('StateMachine - State registration, onEnter, onUpdate, onExit lifecycle', () => {
  const log = [];
  const context = { hp: 100, isWalking: false };

  const fsm = new StateMachine(context)
    .state('idle', {
      onEnter: (ctx, from) => log.push(`idle:enter:from:${from}`),
      onUpdate: (ctx, dt) => log.push(`idle:update:${dt}`),
      onExit: (ctx, to) => log.push(`idle:exit:to:${to}`)
    })
    .state('walk', {
      onEnter: (ctx, from) => log.push(`walk:enter:from:${from}`),
      onUpdate: (ctx, dt) => log.push(`walk:update:${dt}`),
      onExit: (ctx, to) => log.push(`walk:exit:to:${to}`)
    });

  assert.strictEqual(fsm.currentState, 'idle');
  fsm.update(0.16);

  fsm.setState('walk');
  assert.strictEqual(fsm.currentState, 'walk');
  assert.strictEqual(fsm.previousState, 'idle');

  fsm.update(0.16);

  assert.deepStrictEqual(log, [
    'idle:enter:from:null',
    'idle:update:0.16',
    'idle:exit:to:walk',
    'walk:enter:from:idle',
    'walk:update:0.16'
  ]);
});

test('StateMachine - Transition conditions during update()', () => {
  const fox = { speed: 0, isGrounded: true };

  const fsm = new StateMachine(fox)
    .state('idle')
    .state('run')
    .state('jump')
    .transition('idle', 'run', (ctx) => ctx.speed > 0)
    .transition('run', 'idle', (ctx) => ctx.speed === 0)
    .transition('*', 'jump', (ctx) => !ctx.isGrounded)
    .transition('jump', 'idle', (ctx) => ctx.isGrounded && ctx.speed === 0);

  assert.strictEqual(fsm.currentState, 'idle');

  // Change speed -> next update automatically transitions to 'run'
  fox.speed = 4.5;
  fsm.update(0.1);
  assert.strictEqual(fsm.currentState, 'run');

  // Jump in the air -> wildcard transition triggers 'jump'
  fox.isGrounded = false;
  fsm.update(0.1);
  assert.strictEqual(fsm.currentState, 'jump');

  // Land back down
  fox.isGrounded = true;
  fox.speed = 0;
  fsm.update(0.1);
  assert.strictEqual(fsm.currentState, 'idle');
});

test('StateMachine - Event trigger transitions', () => {
  const player = { attackCooldown: 0 };

  const fsm = new StateMachine(player)
    .state('idle')
    .state('attack')
    .state('block')
    .transition('idle', 'attack', 'ATTACK_PRESSED')
    .transition('idle', 'block', 'BLOCK_PRESSED')
    .transition('attack', 'idle', 'ATTACK_FINISHED')
    .transition('block', 'idle', 'BLOCK_RELEASED');

  assert.strictEqual(fsm.currentState, 'idle');

  const triggeredAttack = fsm.trigger('ATTACK_PRESSED');
  assert.strictEqual(triggeredAttack, true);
  assert.strictEqual(fsm.currentState, 'attack');

  // Cannot block while attacking (no transition defined)
  const invalidTrigger = fsm.trigger('BLOCK_PRESSED');
  assert.strictEqual(invalidTrigger, false);
  assert.strictEqual(fsm.currentState, 'attack');

  fsm.trigger('ATTACK_FINISHED');
  assert.strictEqual(fsm.currentState, 'idle');
});

test('StateMachine - History tracking and revertToPreviousState()', () => {
  const menu = { page: 'main' };

  const fsm = new StateMachine(menu)
    .state('main')
    .state('settings')
    .state('audio_settings')
    .transition('main', 'settings')
    .transition('settings', 'audio_settings')
    .transition('audio_settings', 'settings');

  fsm.setState('settings');
  fsm.setState('audio_settings');
  assert.strictEqual(fsm.currentState, 'audio_settings');

  // Revert back to settings
  const revert1 = fsm.revertToPreviousState();
  assert.strictEqual(revert1, true);
  assert.strictEqual(fsm.currentState, 'settings');

  // Revert back to main
  const revert2 = fsm.revertToPreviousState();
  assert.strictEqual(revert2, true);
  assert.strictEqual(fsm.currentState, 'main');

  // No further history
  const revert3 = fsm.revertToPreviousState();
  assert.strictEqual(revert3, false);
});

test('StateMachine - State duration tracking and transition callbacks', () => {
  let transitionFired = false;
  const fsm = new StateMachine({})
    .state('charging')
    .state('charged')
    .transition('charging', 'charged', (ctx) => fsm.timeInState >= 2.0, () => {
      transitionFired = true;
    });

  fsm.update(1.0);
  assert.strictEqual(fsm.currentState, 'charging');
  assert.strictEqual(fsm.timeInState, 1.0);
  assert.strictEqual(transitionFired, false);

  fsm.update(1.5); // total time >= 2.0
  assert.strictEqual(fsm.currentState, 'charged');
  assert.strictEqual(transitionFired, true);
});
