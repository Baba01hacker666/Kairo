import { PathfindingGrid, SequenceNode, SelectorNode, ActionNode, NodeStatus } from '@kairo/ai';
import { Vector3 } from '@kairo/core';

console.log('--- Starting Kairo AI Pathfinding & Behavior Tree Demo ---');

// 1. Setup NavMesh Grid
const grid = new PathfindingGrid(10, 10, 1.0);
grid.setObstacle(3, 3, false);
grid.setObstacle(3, 4, false);
grid.setObstacle(3, 5, false);

const startPos = new Vector3(-4, 0, -4);
const endPos = new Vector3(4, 0, 4);

const path = grid.findPath(startPos, endPos);
console.log(`Path calculated with ${path.length} waypoints:`);
path.forEach((pt, i) => console.log(`  Waypoint #${i+1}: [X: ${pt.x}, Z: ${pt.z}]`));

// 2. Setup Behavior Tree
const blackboard = new Map<string, any>();
blackboard.set('hasTarget', true);
blackboard.set('distanceToTarget', 1.5);

const tree = new SelectorNode([
  new SequenceNode([
    new ActionNode((bb) => bb.get('distanceToTarget') < 2.0 ? NodeStatus.Success : NodeStatus.Failure),
    new ActionNode(() => {
      console.log('Action: Melee Attack Target!');
      return NodeStatus.Success;
    })
  ]),
  new ActionNode(() => {
    console.log('Action: Move towards Target Waypoint.');
    return NodeStatus.Success;
  })
]);

console.log('Ticking AI Behavior Tree:');
const result = tree.tick(blackboard);
console.log('Behavior Tree Execution Result:', result);
