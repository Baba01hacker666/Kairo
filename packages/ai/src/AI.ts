import { Vector3 } from '../../core/src/Math.ts';

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

export type PathfindingAlgorithm =
  | 'astar'
  | 'weighted_astar'
  | 'dijkstra'
  | 'bidirectional_astar'
  | 'bidirectional_dijkstra';

export interface PathfindingOptions {
  algorithm?: PathfindingAlgorithm;
  heuristicWeight?: number; // Weight multiplier for h(n) (default 1.0; e.g. 1.5 or 2.0 for Weighted A*)
  allowDiagonal?: boolean;  // Allow 8-directional movement (default false)
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

  findPath(
    startPos: Vector3,
    endPos: Vector3,
    options?: PathfindingOptions | PathfindingAlgorithm
  ): Vector3[] {
    const opt = this.resolveOptions(options);

    switch (opt.algorithm) {
      case 'dijkstra':
        return this.findPathAStarInternal(startPos, endPos, 0, opt.allowDiagonal ?? false);
      case 'weighted_astar':
        return this.findPathAStarInternal(startPos, endPos, opt.heuristicWeight ?? 1.5, opt.allowDiagonal ?? false);
      case 'bidirectional_dijkstra':
        return this.findPathBidirectionalInternal(startPos, endPos, 0, opt.allowDiagonal ?? false);
      case 'bidirectional_astar':
        return this.findPathBidirectionalInternal(startPos, endPos, opt.heuristicWeight ?? 1.0, opt.allowDiagonal ?? false);
      case 'astar':
      default:
        return this.findPathAStarInternal(startPos, endPos, opt.heuristicWeight ?? 1.0, opt.allowDiagonal ?? false);
    }
  }

  findPathAStar(startPos: Vector3, endPos: Vector3, options?: PathfindingOptions): Vector3[] {
    const opt = this.resolveOptions(options, 'astar');
    return this.findPathAStarInternal(startPos, endPos, opt.heuristicWeight ?? 1.0, opt.allowDiagonal ?? false);
  }

  findPathWeighted(startPos: Vector3, endPos: Vector3, weight: number = 1.5, options?: PathfindingOptions): Vector3[] {
    const opt = this.resolveOptions(options, 'weighted_astar');
    return this.findPathAStarInternal(startPos, endPos, weight, opt.allowDiagonal ?? false);
  }

  findPathDijkstra(startPos: Vector3, endPos: Vector3, options?: PathfindingOptions): Vector3[] {
    const opt = this.resolveOptions(options, 'dijkstra');
    return this.findPathAStarInternal(startPos, endPos, 0, opt.allowDiagonal ?? false);
  }

  findPathBidirectionalAStar(startPos: Vector3, endPos: Vector3, weight: number = 1.0, options?: PathfindingOptions): Vector3[] {
    const opt = this.resolveOptions(options, 'bidirectional_astar');
    return this.findPathBidirectionalInternal(startPos, endPos, weight, opt.allowDiagonal ?? false);
  }

  findPathBidirectionalDijkstra(startPos: Vector3, endPos: Vector3, options?: PathfindingOptions): Vector3[] {
    const opt = this.resolveOptions(options, 'bidirectional_dijkstra');
    return this.findPathBidirectionalInternal(startPos, endPos, 0, opt.allowDiagonal ?? false);
  }

  private resolveOptions(
    options?: PathfindingOptions | PathfindingAlgorithm,
    defaultAlgo: PathfindingAlgorithm = 'astar'
  ): PathfindingOptions {
    if (typeof options === 'string') {
      return { algorithm: options };
    }
    return {
      algorithm: options?.algorithm ?? defaultAlgo,
      heuristicWeight: options?.heuristicWeight,
      allowDiagonal: options?.allowDiagonal
    };
  }

  private getGridCoords(startPos: Vector3, endPos: Vector3): { startNode: PathNode; endNode: PathNode } | null {
    const startX = Math.floor(startPos.x / this.nodeSize + this.width / 2);
    const startZ = Math.floor(startPos.z / this.nodeSize + this.height / 2);
    const endX = Math.floor(endPos.x / this.nodeSize + this.width / 2);
    const endZ = Math.floor(endPos.z / this.nodeSize + this.height / 2);

    if (
      startX < 0 || startX >= this.width || startZ < 0 || startZ >= this.height ||
      endX < 0 || endX >= this.width || endZ < 0 || endZ >= this.height
    ) {
      return null;
    }

    return {
      startNode: this.nodes[startX][startZ],
      endNode: this.nodes[endX][endZ]
    };
  }

  private findPathAStarInternal(
    startPos: Vector3,
    endPos: Vector3,
    heuristicWeight: number,
    allowDiagonal: boolean
  ): Vector3[] {
    const bounds = this.getGridCoords(startPos, endPos);
    if (!bounds) return [startPos, endPos];

    const { startNode, endNode } = bounds;
    if (!startNode.walkable || !endNode.walkable) return [startPos, endPos];
    if (startNode === endNode) return [this.nodeToVector3(startNode)];

    const gScore: Map<PathNode, number> = new Map();
    const parentMap: Map<PathNode, PathNode | null> = new Map();
    const openSet: PathNode[] = [startNode];
    const openSetHas: Set<PathNode> = new Set([startNode]);
    const closedSet: Set<PathNode> = new Set();

    gScore.set(startNode, 0);
    parentMap.set(startNode, null);

    const getH = (n: PathNode): number => {
      if (heuristicWeight === 0) return 0;
      const dx = Math.abs(n.x - endNode.x);
      const dz = Math.abs(n.z - endNode.z);
      return allowDiagonal
        ? (Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz)) * heuristicWeight
        : (dx + dz) * heuristicWeight;
    };

    const getF = (n: PathNode): number => {
      const g = gScore.get(n) ?? Infinity;
      return g + getH(n);
    };

    while (openSet.length > 0) {
      openSet.sort((a, b) => getF(a) - getF(b));
      const current = openSet.shift()!;
      openSetHas.delete(current);

      if (current === endNode) {
        return this.reconstructSinglePath(current, parentMap);
      }

      closedSet.add(current);

      const neighbors = this.getNeighbors(current, allowDiagonal);
      for (const { node: neighbor, moveCost } of neighbors) {
        if (!neighbor.walkable || closedSet.has(neighbor)) continue;

        const tentativeG = (gScore.get(current) ?? 0) + moveCost;
        const currentG = gScore.get(neighbor) ?? Infinity;

        if (tentativeG < currentG) {
          gScore.set(neighbor, tentativeG);
          parentMap.set(neighbor, current);

          if (!openSetHas.has(neighbor)) {
            openSet.push(neighbor);
            openSetHas.add(neighbor);
          }
        }
      }
    }

    return [startPos, endPos];
  }

  private findPathBidirectionalInternal(
    startPos: Vector3,
    endPos: Vector3,
    heuristicWeight: number,
    allowDiagonal: boolean
  ): Vector3[] {
    const bounds = this.getGridCoords(startPos, endPos);
    if (!bounds) return [startPos, endPos];

    const { startNode, endNode } = bounds;
    if (!startNode.walkable || !endNode.walkable) return [startPos, endPos];
    if (startNode === endNode) return [this.nodeToVector3(startNode)];

    const gForward: Map<PathNode, number> = new Map();
    const parentForward: Map<PathNode, PathNode | null> = new Map();
    const openForward: PathNode[] = [startNode];
    const openForwardSet: Set<PathNode> = new Set([startNode]);
    const closedForward: Set<PathNode> = new Set();

    const gBackward: Map<PathNode, number> = new Map();
    const parentBackward: Map<PathNode, PathNode | null> = new Map();
    const openBackward: PathNode[] = [endNode];
    const openBackwardSet: Set<PathNode> = new Set([endNode]);
    const closedBackward: Set<PathNode> = new Set();

    gForward.set(startNode, 0);
    parentForward.set(startNode, null);

    gBackward.set(endNode, 0);
    parentBackward.set(endNode, null);

    const getHForward = (n: PathNode): number => {
      if (heuristicWeight === 0) return 0;
      const dx = Math.abs(n.x - endNode.x);
      const dz = Math.abs(n.z - endNode.z);
      return allowDiagonal
        ? (Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz)) * heuristicWeight
        : (dx + dz) * heuristicWeight;
    };

    const getHBackward = (n: PathNode): number => {
      if (heuristicWeight === 0) return 0;
      const dx = Math.abs(n.x - startNode.x);
      const dz = Math.abs(n.z - startNode.z);
      return allowDiagonal
        ? (Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz)) * heuristicWeight
        : (dx + dz) * heuristicWeight;
    };

    const getFForward = (n: PathNode) => (gForward.get(n) ?? Infinity) + getHForward(n);
    const getFBackward = (n: PathNode) => (gBackward.get(n) ?? Infinity) + getHBackward(n);

    let bestCost = Infinity;
    let intersectionNode: PathNode | null = null;

    while (openForward.length > 0 && openBackward.length > 0) {
      // Step Forward Search
      openForward.sort((a, b) => getFForward(a) - getFForward(b));
      const currF = openForward.shift()!;
      openForwardSet.delete(currF);
      closedForward.add(currF);

      if (closedBackward.has(currF)) {
        const total = (gForward.get(currF) ?? 0) + (gBackward.get(currF) ?? 0);
        if (total < bestCost) {
          bestCost = total;
          intersectionNode = currF;
          break;
        }
      }

      const fNeighbors = this.getNeighbors(currF, allowDiagonal);
      for (const { node: neighbor, moveCost } of fNeighbors) {
        if (!neighbor.walkable || closedForward.has(neighbor)) continue;

        const tentativeG = (gForward.get(currF) ?? 0) + moveCost;
        if (tentativeG < (gForward.get(neighbor) ?? Infinity)) {
          gForward.set(neighbor, tentativeG);
          parentForward.set(neighbor, currF);

          if (!openForwardSet.has(neighbor)) {
            openForward.push(neighbor);
            openForwardSet.add(neighbor);
          }

          if (gBackward.has(neighbor)) {
            const totalCost = tentativeG + gBackward.get(neighbor)!;
            if (totalCost < bestCost) {
              bestCost = totalCost;
              intersectionNode = neighbor;
            }
          }
        }
      }

      // Step Backward Search
      openBackward.sort((a, b) => getFBackward(a) - getFBackward(b));
      const currB = openBackward.shift()!;
      openBackwardSet.delete(currB);
      closedBackward.add(currB);

      if (closedForward.has(currB)) {
        const total = (gForward.get(currB) ?? 0) + (gBackward.get(currB) ?? 0);
        if (total < bestCost) {
          bestCost = total;
          intersectionNode = currB;
          break;
        }
      }

      const bNeighbors = this.getNeighbors(currB, allowDiagonal);
      for (const { node: neighbor, moveCost } of bNeighbors) {
        if (!neighbor.walkable || closedBackward.has(neighbor)) continue;

        const tentativeG = (gBackward.get(currB) ?? 0) + moveCost;
        if (tentativeG < (gBackward.get(neighbor) ?? Infinity)) {
          gBackward.set(neighbor, tentativeG);
          parentBackward.set(neighbor, currB);

          if (!openBackwardSet.has(neighbor)) {
            openBackward.push(neighbor);
            openBackwardSet.add(neighbor);
          }

          if (gForward.has(neighbor)) {
            const totalCost = tentativeG + gForward.get(neighbor)!;
            if (totalCost < bestCost) {
              bestCost = totalCost;
              intersectionNode = neighbor;
            }
          }
        }
      }

      if (intersectionNode && openForward.length > 0 && openBackward.length > 0) {
        const minF = getFForward(openForward[0]) + getFBackward(openBackward[0]);
        if (minF >= bestCost) {
          break;
        }
      }
    }

    if (intersectionNode) {
      return this.reconstructBidirectionalPath(intersectionNode, parentForward, parentBackward);
    }

    return [startPos, endPos];
  }

  private reconstructSinglePath(endNode: PathNode, parentMap: Map<PathNode, PathNode | null>): Vector3[] {
    const path: Vector3[] = [];
    let curr: PathNode | null | undefined = endNode;
    while (curr) {
      path.unshift(this.nodeToVector3(curr));
      curr = parentMap.get(curr);
    }
    return path;
  }

  private reconstructBidirectionalPath(
    intersection: PathNode,
    parentForward: Map<PathNode, PathNode | null>,
    parentBackward: Map<PathNode, PathNode | null>
  ): Vector3[] {
    const forwardNodes: PathNode[] = [];
    let currF: PathNode | null | undefined = intersection;
    while (currF) {
      forwardNodes.unshift(currF);
      currF = parentForward.get(currF);
    }

    const backwardNodes: PathNode[] = [];
    let currB: PathNode | null | undefined = parentBackward.get(intersection);
    while (currB) {
      backwardNodes.push(currB);
      currB = parentBackward.get(currB);
    }

    return [...forwardNodes, ...backwardNodes].map(n => this.nodeToVector3(n));
  }

  private nodeToVector3(node: PathNode): Vector3 {
    const worldX = (node.x - this.width / 2) * this.nodeSize;
    const worldZ = (node.z - this.height / 2) * this.nodeSize;
    return new Vector3(worldX, 0, worldZ);
  }

  private getNeighbors(node: PathNode, allowDiagonal: boolean = false): { node: PathNode; moveCost: number }[] {
    const neighbors: { node: PathNode; moveCost: number }[] = [];
    const cardinalDirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];

    for (const [dx, dz] of cardinalDirs) {
      const nx = node.x + dx;
      const nz = node.z + dz;
      if (nx >= 0 && nx < this.width && nz >= 0 && nz < this.height) {
        neighbors.push({ node: this.nodes[nx][nz], moveCost: 1.0 });
      }
    }

    if (allowDiagonal) {
      const diagDirs = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ];
      for (const [dx, dz] of diagDirs) {
        const nx = node.x + dx;
        const nz = node.z + dz;
        if (nx >= 0 && nx < this.width && nz >= 0 && nz < this.height) {
          if (this.nodes[node.x + dx][node.z].walkable && this.nodes[node.x][node.z + dz].walkable) {
            neighbors.push({ node: this.nodes[nx][nz], moveCost: Math.SQRT2 });
          }
        }
      }
    }

    return neighbors;
  }
}

export { PathfindingGrid as NavGrid };

