import test from 'node:test';
import assert from 'node:assert';
import { VoiceManager, BuiltInVoicePresets } from '../packages/audio/src/VoiceManager.ts';
import { TextManager } from '../packages/core/src/TextManager.ts';
import { DialogueSystem } from '../packages/core/src/DialogueSystem.ts';

test('VoiceManager - Presets and profile registration', () => {
  const vm = new VoiceManager();

  assert.ok(vm.getProfile('owl'));
  assert.strictEqual(vm.getProfile('owl').pitch, 160);

  assert.ok(vm.getProfile('fox'));
  assert.strictEqual(vm.getProfile('fox').pitch, 440);

  vm.registerProfile('dragon', {
    pitch: 110,
    oscillatorType: 'sawtooth',
    volume: 0.5
  });

  const dragon = vm.getProfile('dragon');
  assert.strictEqual(dragon.pitch, 110);
  assert.strictEqual(dragon.oscillatorType, 'sawtooth');
});

test('DialogueSystem - Speaker profile resolution and rich tags', () => {
  const tm = new TextManager();
  const ds = new DialogueSystem();
  ds.setTextManager(tm);

  tm.registerSpeaker({
    id: 'elder_owl',
    name: 'Elder Owl of the Woods',
    avatar: 'owl.png',
    voice: 'owl',
    color: '#a855f7'
  });

  let capturedEvent = null;
  ds.on('dialogue_line', (e) => {
    capturedEvent = e;
  });

  ds.play([
    {
      speakerId: 'elder_owl',
      text: 'Greetings <color=#10b981>traveler</color>.'
    }
  ]);

  assert.ok(capturedEvent);
  assert.strictEqual(capturedEvent.line.speaker, 'Elder Owl of the Woods');
  assert.strictEqual(capturedEvent.line.avatar, 'owl.png');
  assert.strictEqual(capturedEvent.line.voice, 'owl');
  assert.strictEqual(capturedEvent.speakerProfile?.id, 'elder_owl');
  assert.strictEqual(capturedEvent.parsedText?.cleanText, 'Greetings traveler.');
  assert.strictEqual(capturedEvent.parsedText?.tags[0]?.name, 'color');
});

test('DialogueSystem - Typewriter char-by-char event & voice blip forwarding', () => {
  const ds = new DialogueSystem();
  ds.typewriterCps = 100; // 100 chars per sec

  const chars = [];
  ds.on('dialogue_char', (e) => {
    chars.push(e.char);
  });

  let blipsPlayed = [];
  ds.setVoiceManager({
    playVoiceBlip: (char, voice, index) => {
      blipsPlayed.push({ char, voice, index });
    }
  });

  ds.play([
    {
      speaker: 'Fox',
      voice: 'fox',
      text: 'Hello'
    }
  ]);

  // Advance 0.03 seconds (3 characters revealed: 'H', 'e', 'l')
  ds.update(0.03);
  assert.deepStrictEqual(chars, ['H', 'e', 'l']);
  assert.strictEqual(blipsPlayed.length, 3);
  assert.strictEqual(blipsPlayed[0].char, 'H');
  assert.strictEqual(blipsPlayed[0].voice, 'fox');
});
