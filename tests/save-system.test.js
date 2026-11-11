import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem } from '../packages/core/src/SaveSystem.ts';

test('SaveSystem works without localStorage', () => {
  const saves = new SaveSystem('headless');
  assert.equal(saves.getProgress('level', 1), 1);
  saves.setProgress('level', 2);
  assert.equal(saves.getProgress('level', 1), 2);
  assert.equal(saves.unlockAchievement('first'), true);
  assert.equal(saves.unlockAchievement('first'), false);
  assert.equal(saves.hasAchievement('first'), true);
});

test('SaveSystem initializes defaults when storage access throws', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  const warn = console.warn;
  console.warn = () => {};
  try {
    const saves = new SaveSystem('blocked');
    saves.setProgress('level', 3);
    assert.equal(saves.getProgress('level', 1), 3);
    assert.equal(saves.unlockAchievement('first'), true);
  } finally {
    console.warn = warn;
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});

test('SaveSystem persists Map and Set values with a valid checksum', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const store = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value)
  }});
  try {
    const saves = new SaveSystem('collections');
    saves.setProgress('data', { items: new Set(['key']), stats: new Map([['hp', 10]]) });
    const loaded = new SaveSystem('collections').getProgress('data', null);
    assert.deepEqual(loaded.items, new Set(['key']));
    assert.deepEqual(loaded.stats, new Map([['hp', 10]]));
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
