import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, SceneNode } from '../packages/core/src/Scene.ts';

test('scene graph rejects cycles and does not remove nodes belonging to another scene', () => {
  const a = new Scene('a');
  const b = new Scene('b');
  const parent = new SceneNode('parent');
  const child = new SceneNode('child');
  a.add(parent);
  parent.addChild(child);
  assert.throws(() => child.addChild(parent), /cycle/);
  assert.throws(() => parent.addChild(parent), /cycle/);
  b.remove(child);
  assert.equal(child.parent, parent);
  a.remove(child);
  assert.equal(child.parent, null);
});
