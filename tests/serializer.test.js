import test from 'node:test';
import assert from 'node:assert';
import { Serializer } from '../packages/core/src/Serializer.ts';

test('Serializer JSON state serialization & deep clone', () => {
  const original = {
    name: 'Fox State',
    level: 5,
    collectibles: new Set(['avocado_1', 'avocado_2']),
    metadata: new Map([['score', 100], ['time', 45.2]])
  };

  const json = Serializer.serialize(original);
  assert.strictEqual(typeof json, 'string');

  const restored = Serializer.deserialize(json);
  assert.strictEqual(restored.name, 'Fox State');
  assert.strictEqual(restored.level, 5);
  assert.strictEqual(restored.collectibles.has('avocado_1'), true);
  assert.strictEqual(restored.metadata.get('score'), 100);

  const cloned = Serializer.cloneDeep(original);
  assert.strictEqual(cloned.name, original.name);
  assert.notStrictEqual(cloned, original);
});

test('Serializer Save Envelope & Checksum verification', () => {
  const payload = { playerPosition: [10, 0, 5], inventory: ['gold_key'] };
  const envelope = Serializer.createSaveEnvelope(payload);

  assert.strictEqual(envelope.version, 1);
  assert.strictEqual(typeof envelope.checksum, 'number');

  const verification = Serializer.verifyAndUnwrapSave(envelope);
  assert.strictEqual(verification.valid, true);
  assert.deepStrictEqual(verification.payload, payload);

  // Test tampered save
  const tamperedEnvelope = { ...envelope, checksum: 123456789 };
  const tamperedVerification = Serializer.verifyAndUnwrapSave(tamperedEnvelope);
  assert.strictEqual(tamperedVerification.valid, false);
});
