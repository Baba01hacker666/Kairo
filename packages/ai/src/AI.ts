import { Vector3 } from '../../core/src/index.ts';

export const NodeStatus = {
  Success: 'SUCCESS',
  Failure: 'FAILURE',
  Running: 'RUNNING'
} as const;

export type NodeStatusValue = typeof NodeStatus[keyof typeof NodeStatus];

export abstract class BTNode {
  abstract tick(blackboard: Map<string, any>): NodeStatusValue;
}

export class SequenceNode extends BTNode {
  public children: BTNode[];

  constructor(children: BTNode[]) {
    super();
    this.children = children;
  }

  tick(blackboard: Map<string, any>): NodeStatusValue {
    for (const child of this.children) {
      const status = child.tick(blackboard);
      if (status !== NodeStatus.Success) {
        return status;
      }
    }
    return NodeStatus.Success;
  }
}

export class SelectorNode extends BTNode {
  public children: BTNode[];

  constructor(children: BTNode[]) {
    super();
    this.children = children;
  }

  tick(blackboard: Map<string, any>): NodeStatusValue {
    for (const child of this.children) {
      const status = child.tick(blackboard);
      if (status !== NodeStatus.Failure) {
        return status;
      }
    }
    return NodeStatus.Failure;
  }
}

export class ActionNode extends BTNode {
  private actionFn: (blackboard: Map<string, any>) => NodeStatusValue;

  constructor(actionFn: (blackboard: Map<string, any>) => NodeStatusValue) {
    super();
    this.actionFn = actionFn;
  }

  tick(blackboard: Map<string, any>): NodeStatusValue {
    return this.actionFn(blackboard);
  }
}

export interface PathNode {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
  walkable: boolean;
}

export class PathfindingGrid {
  public width: number;
  public height: number;
  public nodeSize: number;
  public nodes: PathNode[][];

  constructor(width: number = 20, height: number = 20, nodeSize: number = 1.0) {
    this.width = width;
    this.height = height;
    this.nodeSize = nodeSize;
    this.nodes = [];

    for (let x = 0; x < width; x++) {
      this.nodes[x] = [];
      for (let z = 0; z < height; z++) {
        this.nodes[x][z] = {
          x,
          z,
          g: 0,
          h: 0,
          f: 0,
          parent: null,
          walkable: true
        };
      }
    }
  }

  setObstacle(x: number, z: number, walkable: boolean): void {
    if (x >= 0 && x < this.width && z >= 0 && z < this.height) {
      this.nodes[x][z].walkable = walkable;
    }
  }

  findPath(startPos: Vector3, endPos: Vector3): Vector3[] {
    const startX = Math.floor(startPos.x / this.nodeSize + this.width / 2);
    const startZ = Math.floor(startPos.z / this.nodeSize + this.height / 2);
    const endX = Math.floor(endPos.x / this.nodeSize + this.width / 2);
    const endZ = Math.floor(endPos.z / this.nodeSize + this.height / 2);

    if (
      startX < 0 || startX >= this.width || startZ < 0 || startZ >= this.height ||
      endX < 0 || endX >= this.width || endZ < 0 || endZ >= this.height
    ) {
      return [startPos, endPos];
    }

    const startNode = this.nodes[startX][startZ];
    const endNode = this.nodes[endX][endZ];

    const openSet: PathNode[] = [startNode];
    const closedSet: Set<PathNode> = new Set();

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      if (current === endNode) {
        const path: Vector3[] = [];
        let curr: PathNode | null = current;
        while (curr) {
          const worldX = (curr.x - this.width / 2) * this.nodeSize;
          const worldZ = (curr.z - this.height / 2) * this.nodeSize;
          path.unshift(new Vector3(worldX, 0, worldZ));
          curr = curr.parent;
        }
        return path;
      }

      closedSet.add(current);

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!neighbor.walkable || closedSet.has(neighbor)) continue;

        const newCost = current.g + 1;
        if (newCost < neighbor.g || !openSet.includes(neighbor)) {
          neighbor.g = newCost;
          neighbor.h = Math.abs(neighbor.x - endNode.x) + Math.abs(neighbor.z - endNode.z);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return [startPos, endPos];
  }

  private getNeighbors(node: PathNode): PathNode[] {
    const neighbors: PathNode[] = [];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dz] of dirs) {
      const nx = node.x + dx;
      const nz = node.z + dz;
      if (nx >= 0 && nx < this.width && nz >= 0 && nz < this.height) {
        neighbors.push(this.nodes[nx][nz]);
      }
    }
    return neighbors;
  }
}
