import assert from 'node:assert';
import test from 'node:test';
import { PathfindingGrid, SequenceNode, ActionNode, NodeStatus } from '../packages/ai/src/AI.ts';
import { Vector3 } from '../packages/core/src/Math.ts';

test('AI Pathfinding Grid solution', () => {
  const grid = new PathfindingGrid(10, 10, 1.0);
  const path = grid.findPath(new Vector3(-2, 0, -2), new Vector3(2, 0, 2));
  assert(path.length > 1);
});

test('AI Behavior Tree Sequence evaluation', () => {
  const blackboard = new Map();
  let step1Executed = false;
  let step2Executed = false;

  const seq = new SequenceNode([
    new ActionNode(() => {
      step1Executed = true;
      return NodeStatus.Success;
    }),
    new ActionNode(() => {
      step2Executed = true;
      return NodeStatus.Success;
    })
  ]);

  const res = seq.tick(blackboard);
  assert.strictEqual(res, NodeStatus.Success);
  assert.strictEqual(step1Executed, true);
  assert.strictEqual(step2Executed, true);
});
