import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { AnimationStateMachine, BlendTree1D, AnimationClip } from '../packages/animation/src/Animation.ts';
import { Vector3, Quaternion } from '../packages/core/src/Math.ts';

test('Animation BlendTree1D interpolation', () => {
  const clipIdle = new AnimationClip('Idle', 1.0, [
    { time: 0, value: new Vector3(0, 0, 0) },
    { time: 1, value: new Vector3(0, 0, 0) }
  ]);

  const clipRun = new AnimationClip('Run', 1.0, [
    { time: 0, value: new Vector3(0, 0, 0) },
    { time: 1, value: new Vector3(0, 0, 10) }
  ]);

  const tree = new BlendTree1D();
  tree.addClip(clipIdle, 0.0);
  tree.addClip(clipRun, 1.0);

  const sampleMid = tree.evaluate(0.5, 0.5);
  assert.ok(Math.abs(sampleMid.position.z - 2.5) < 0.1);
});

test('AnimationStateMachine state transitions', () => {
  const dummyMesh = new THREE.Mesh();
  const stateMachine = new AnimationStateMachine(dummyMesh);

  const clipA = new THREE.AnimationClip('Idle', 1.0, []);
  const clipB = new THREE.AnimationClip('Run', 1.0, []);

  stateMachine.registerState('Idle', clipA);
  stateMachine.registerState('Run', clipB);

  stateMachine.setState('Idle');
  assert.strictEqual(stateMachine.getCurrentStateName(), 'Idle');

  stateMachine.setState('Run');
  assert.strictEqual(stateMachine.getCurrentStateName(), 'Run');
});
