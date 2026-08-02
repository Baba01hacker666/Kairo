import assert from 'node:assert';
import test from 'node:test';
import { PathfindingGrid, SequenceNode, ActionNode, NodeStatus } from '../packages/ai/src/AI.ts';
import { Vector3 } from '../packages/core/src/Math.ts';

test('AI Pathfinding Grid - Standard A*', () => {
  const grid = new PathfindingGrid(10, 10, 1.0);
  const path = grid.findPath(new Vector3(-2, 0, -2), new Vector3(2, 0, 2));
  assert(path.length > 1);
  assert.strictEqual(path[0].x, -2);
  assert.strictEqual(path[0].z, -2);
  assert.strictEqual(path[path.length - 1].x, 2);
  assert.strictEqual(path[path.length - 1].z, 2);
});

test('AI Pathfinding Grid - Weighted A*', () => {
  const grid = new PathfindingGrid(10, 10, 1.0);
  grid.setObstacle(5, 5, false);

  const path = grid.findPathWeighted(new Vector3(-4, 0, -4), new Vector3(4, 0, 4), 2.0);
  assert(path.length > 1);
  assert.strictEqual(path[0].x, -4);
  assert.strictEqual(path[path.length - 1].x, 4);
});

test('AI Pathfinding Grid - Dijkstra Search', () => {
  const grid = new PathfindingGrid(10, 10, 1.0);
  grid.setObstacle(5, 4, false);
  grid.setObstacle(5, 5, false);

  const path = grid.findPathDijkstra(new Vector3(-3, 0, 0), new Vector3(3, 0, 0));
  assert(path.length > 1);
  assert.strictEqual(path[0].x, -3);
  assert.strictEqual(path[path.length - 1].x, 3);
});

test('AI Pathfinding Grid - Bidirectional A*', () => {
  const grid = new PathfindingGrid(20, 20, 1.0);
  // Add wall with gap
  for (let z = 0; z < 20; z++) {
    if (z !== 10) grid.setObstacle(10, z, false);
  }

  const path = grid.findPathBidirectionalAStar(new Vector3(-8, 0, 0), new Vector3(8, 0, 0));
  assert(path.length > 1);
  assert.strictEqual(path[0].x, -8);
  assert.strictEqual(path[path.length - 1].x, 8);
});

test('AI Pathfinding Grid - Bidirectional Dijkstra', () => {
  const grid = new PathfindingGrid(20, 20, 1.0);
  grid.setObstacle(10, 10, false);

  const path = grid.findPathBidirectionalDijkstra(new Vector3(-5, 0, -5), new Vector3(5, 0, 5));
  assert(path.length > 1);
  assert.strictEqual(path[0].x, -5);
  assert.strictEqual(path[path.length - 1].x, 5);
});

test('AI Pathfinding Grid - Diagonal Movement', () => {
  const grid = new PathfindingGrid(10, 10, 1.0);
  const path = grid.findPath(new Vector3(-2, 0, -2), new Vector3(2, 0, 2), { allowDiagonal: true });
  assert(path.length > 1);
  // Diagonal distance should yield fewer steps than 4-way cardinal
  assert(path.length <= 6);
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
