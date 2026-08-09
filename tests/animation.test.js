import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { AnimationStateMachine, BlendTree1D, AnimationClip, InverseKinematicsSolver } from '../packages/animation/src/Animation.ts';
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

test('InverseKinematicsSolver.solveTwoBone correctness', () => {
  const rootPos = new Vector3(0, 0, 0);
  const jointPos = new Vector3(0, 1, 0);
  const targetPos = new Vector3(1, 1, 1);
  const l1 = 1.0;
  const l2 = 1.0;

  const result = InverseKinematicsSolver.solveTwoBone(rootPos, jointPos, targetPos, l1, l2);

  assert.ok(!Number.isNaN(result.jointPos.x) && !Number.isNaN(result.jointPos.y) && !Number.isNaN(result.jointPos.z));
  assert.ok(!Number.isNaN(result.endPos.x) && !Number.isNaN(result.endPos.y) && !Number.isNaN(result.endPos.z));

  const d1 = result.jointPos.distanceTo(rootPos);
  assert.ok(Math.abs(d1 - l1) < 1e-4, `Expected bone 1 length ${l1}, got ${d1}`);

  const d2 = result.jointPos.distanceTo(result.endPos);
  assert.ok(Math.abs(d2 - l2) < 1e-4, `Expected bone 2 length ${l2}, got ${d2}`);

  assert.ok(Math.abs(result.endPos.x - targetPos.x) < 1e-4);
  assert.ok(Math.abs(result.endPos.y - targetPos.y) < 1e-4);
  assert.ok(Math.abs(result.endPos.z - targetPos.z) < 1e-4);
});

test('InverseKinematicsSolver.solveTwoBone degenerate vertical case', () => {
  const rootPos = new Vector3(0, 0, 0);
  const jointPos = new Vector3(0, 1, 0);
  const targetPos = new Vector3(0, 1.8, 0);
  const l1 = 1.0;
  const l2 = 1.0;

  const result = InverseKinematicsSolver.solveTwoBone(rootPos, jointPos, targetPos, l1, l2);

  assert.ok(!Number.isNaN(result.jointPos.x) && !Number.isNaN(result.jointPos.y) && !Number.isNaN(result.jointPos.z));
  const d1 = result.jointPos.distanceTo(rootPos);
  assert.ok(Math.abs(d1 - l1) < 1e-4);
});

test('InverseKinematicsSolver.solveTwoBone benchmark', () => {
  const rootPos = new Vector3(0, 0, 0);
  const jointPos = new Vector3(0, 1, 0);
  const targetPos = new Vector3(1.2, 0.5, 0.8);
  const l1 = 1.5;
  const l2 = 1.2;

  const iterations = 100000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    InverseKinematicsSolver.solveTwoBone(rootPos, jointPos, targetPos, l1, l2);
  }
  const elapsed = performance.now() - start;

  assert.ok(elapsed >= 0);
});

