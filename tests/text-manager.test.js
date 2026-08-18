import test from 'node:test';
import assert from 'node:assert';
import { TextManager } from '../packages/core/src/TextManager.ts';

test('TextManager - Locale string registration and variable interpolation', () => {
  const tm = new TextManager('en');

  tm.registerStrings('en', {
    greeting: 'Hello {name}!',
    quests: {
      intro: 'Welcome to {location}. You have {count} coins.'
    }
  });

  tm.registerStrings('es', {
    greeting: '¡Hola {name}!',
    quests: {
      intro: 'Bienvenido a {location}. Tienes {count} monedas.'
    }
  });

  // Default 'en' locale
  assert.strictEqual(tm.t('greeting', { name: 'Fox' }), 'Hello Fox!');
  assert.strictEqual(tm.t('quests.intro', { location: 'Ancient Grove', count: 10 }), 'Welcome to Ancient Grove. You have 10 coins.');

  // Switch to 'es'
  tm.setLocale('es');
  assert.strictEqual(tm.t('greeting', { name: 'Fox' }), '¡Hola Fox!');
  assert.strictEqual(tm.t('quests.intro', { location: 'Bosque Antiguo', count: 10 }), 'Bienvenido a Bosque Antiguo. Tienes 10 monedas.');

  // Fallback to 'en' when key is missing in 'es'
  tm.registerStrings('en', { missingKey: 'English Only' });
  assert.strictEqual(tm.t('missingKey'), 'English Only');
});

test('TextManager - Speaker registration and retrieval', () => {
  const tm = new TextManager();

  tm.registerSpeaker({
    id: 'owl',
    name: 'Elder Owl',
    avatar: 'assets/owl.png',
    color: '#8b5cf6',
    voice: 'owl'
  });

  tm.registerSpeaker({
    id: 'fox',
    name: 'Swift Fox',
    color: '#f97316',
    voice: 'fox'
  });

  const owl = tm.getSpeaker('owl');
  assert.ok(owl);
  assert.strictEqual(owl.name, 'Elder Owl');
  assert.strictEqual(owl.color, '#8b5cf6');
  assert.strictEqual(owl.voice, 'owl');

  assert.strictEqual(tm.hasSpeaker('fox'), true);
  assert.strictEqual(tm.hasSpeaker('unknown'), false);
  assert.strictEqual(tm.getAllSpeakers().length, 2);
});

test('TextManager - Text line repository and formatting', () => {
  const tm = new TextManager();

  tm.registerLines({
    'sign.village': 'Welcome to Fox Village!',
    'stat.hp': 'HP: {current} / {max}'
  });

  assert.strictEqual(tm.getLine('sign.village'), 'Welcome to Fox Village!');
  assert.strictEqual(tm.getLine('stat.hp', { current: 80, max: 100 }), 'HP: 80 / 100');
  assert.strictEqual(tm.getLine('nonexistent'), undefined);
});

test('TextManager - Rich text tag parsing', () => {
  const tm = new TextManager();

  const parsed = tm.parseTags('Hello <color=#ff0000>Hero</color>! <speed=20>Watch out!</speed> <pause=0.5/>');

  assert.strictEqual(parsed.rawText, 'Hello <color=#ff0000>Hero</color>! <speed=20>Watch out!</speed> <pause=0.5/>');
  assert.strictEqual(parsed.cleanText, 'Hello Hero! Watch out! ');
  assert.strictEqual(parsed.tags.length, 3);

  // Tag 1: color
  assert.strictEqual(parsed.tags[0].name, 'color');
  assert.strictEqual(parsed.tags[0].value, '#ff0000');
  assert.strictEqual(parsed.tags[0].charIndex, 6);

  // Tag 2: speed
  assert.strictEqual(parsed.tags[1].name, 'speed');
  assert.strictEqual(parsed.tags[1].value, '20');
  assert.strictEqual(parsed.tags[1].charIndex, 12);

  // Tag 3: pause
  assert.strictEqual(parsed.tags[2].name, 'pause');
  assert.strictEqual(parsed.tags[2].value, '0.5');
  assert.strictEqual(parsed.tags[2].charIndex, 23);
});

test('TextManager - Pluralization formatter', () => {
  const tm = new TextManager();
  assert.strictEqual(tm.formatPlural(1, 'apple', 'apples'), 'apple');
  assert.strictEqual(tm.formatPlural(5, 'apple', 'apples'), 'apples');
  assert.strictEqual(tm.formatPlural(0, 'apple', 'apples'), 'apples');
});
