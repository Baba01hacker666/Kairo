import test from 'node:test';
import assert from 'node:assert';
import { DialogueSystem } from '../packages/core/src/DialogueSystem.ts';

test('DialogueSystem - play lines sequentially with events', () => {
  const ds = new DialogueSystem();
  ds.typewriterCps = 0; // disable typewriter so advance() moves lines directly
  const started = [];
  const lines = [];
  let ended = null;

  ds.on('dialogue_started', e => started.push(e.id));
  ds.on('dialogue_line', e => lines.push(e.line.text));
  ds.on('dialogue_ended', e => ended = e.id);

  ds.register('greeting', [
    { id: 'l1', speaker: 'Owl', text: 'Hello fox' },
    { speaker: 'Fox', text: 'Hi owl' }
  ]);
  ds.play('greeting');

  assert.deepStrictEqual(started, ['greeting']);
  assert.strictEqual(ds.isPlaying, true);
  assert.strictEqual(ds.currentLine.text, 'Hello fox');
  assert.strictEqual(ds.currentLine.speaker, 'Owl');
  assert.deepStrictEqual(lines, ['Hello fox']);

  ds.advance();
  assert.strictEqual(ds.currentLine.text, 'Hi owl');
  assert.deepStrictEqual(lines, ['Hello fox', 'Hi owl']);

  ds.advance();
  assert.strictEqual(ds.isPlaying, false);
  assert.strictEqual(ended, 'greeting');
});

test('DialogueSystem - typewriter effect and skip', () => {
  const ds = new DialogueSystem();
  ds.typewriterCps = 10;
  ds.play([{ text: '0123456789' }]); // 10 chars

  assert.strictEqual(ds.isTyping, true);
  ds.update(0.5);
  assert.strictEqual(ds.typedCharacters, 5);

  ds.advance(); // while typing → finishes typing instead of advancing
  assert.strictEqual(ds.isTyping, false);
  assert.strictEqual(ds.typedCharacters, 10);
  assert.strictEqual(ds.currentLine.text, '0123456789'); // same line

  ds.advance(); // now advances to end
  assert.strictEqual(ds.isPlaying, false);
});

test('DialogueSystem - choices jump to target line or end dialogue', () => {
  const ds = new DialogueSystem();
  ds.typewriterCps = 0; // disable typewriter so advance() moves lines directly
  const selected = [];
  ds.on('dialogue_choice_selected', e => selected.push(e.choice.text));

  ds.register('branch', [
    {
      id: 'start',
      text: 'Where to?',
      choices: [
        { text: 'North', next: 'north' },
        { text: 'Leave', next: '' }
      ]
    },
    { id: 'south', text: 'Warm winds here' },
    { id: 'north', text: 'Cold winds blow here' }
  ]);

  ds.play('branch');
  assert.strictEqual(ds.currentLine.id, 'start');
  assert.strictEqual(ds.choices.length, 2);

  ds.selectChoice(0);
  assert.deepStrictEqual(selected, ['North']);
  assert.strictEqual(ds.currentLine.id, 'north');
  assert.strictEqual(ds.currentLine.text, 'Cold winds blow here');

  ds.advance(); // 'north' is the last line → dialogue ends
  assert.strictEqual(ds.isPlaying, false);

  // Choice jump continues from the line AFTER the target in the script
  ds.play('branch');
  ds.selectChoice(1); // Leave → ends
  assert.strictEqual(ds.isPlaying, false);

  // Choice with empty next ends the dialogue immediately
  ds.play('branch');
  ds.selectChoice(1);
  assert.strictEqual(ds.isPlaying, false);
});

test('DialogueSystem - stop mid-dialogue emits ended with id', () => {
  const ds = new DialogueSystem();
  let endedId = null;
  ds.on('dialogue_ended', e => endedId = e.id);

  ds.register('long', [
    { text: 'one' },
    { text: 'two' },
    { text: 'three' }
  ]);
  ds.play('long');
  assert.strictEqual(ds.isPlaying, true);

  ds.stop();
  assert.strictEqual(ds.isPlaying, false);
  assert.strictEqual(endedId, 'long');
});

test('DialogueSystem - per-line typewriter override and onStart/onEnd hooks', () => {
  const ds = new DialogueSystem();
  ds.typewriterCps = 0; // disable default typing; only the per-line override would matter
  const hooks = [];
  ds.register('hook', [
    { id: 'a', text: 'fast', typewriterCps: 100, onStart: () => hooks.push('start:a'), onEnd: () => hooks.push('end:a') },
    { text: 'done' }
  ]);
  ds.play('hook');
  assert.deepStrictEqual(hooks, ['start:a']);
  assert.strictEqual(ds.isTyping, true); // per-line override re-enables typing

  ds.skipTyping();
  ds.advance();
  assert.deepStrictEqual(hooks, ['start:a', 'end:a']);
  ds.advance();
  assert.strictEqual(ds.isPlaying, false);
});
