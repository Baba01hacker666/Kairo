import { test } from 'node:test';
import assert from 'node:assert';
import { Serializer } from '../packages/core/src/Serializer.ts';

test('Serializer Payload Encryption & Decryption', () => {
  const originalData = JSON.stringify({ playerHp: 100, level: 42, inventory: ['sword', 'shield'] });
  const secretKey = 'MySuperSecretGameKey_99';

  const encrypted = Serializer.encryptPayload(originalData, secretKey);
  assert.notStrictEqual(encrypted, originalData);
  assert.strictEqual(typeof encrypted, 'string');

  const decrypted = Serializer.decryptPayload(encrypted, secretKey);
  assert.strictEqual(decrypted, originalData);
});

test('Serializer RLE Compression', () => {
  const repeatedStr = 'AAAAABBBBBCCCCCDDDDD';
  const compressed = Serializer.compressRLE(repeatedStr);
  assert.strictEqual(compressed, '5A5B5C5D');
});

test('Serializer RLE Decompression round trip', () => {
  const original = 'AAAAABBBBBCCCCCDDDDD';
  const compressed = Serializer.compressRLE(original);
  assert.strictEqual(Serializer.decompressRLE(compressed), original);

  // Singletons are stored bare
  assert.strictEqual(Serializer.decompressRLE(Serializer.compressRLE('abc')), 'abc');
  assert.strictEqual(Serializer.decompressRLE(''), '');
});
