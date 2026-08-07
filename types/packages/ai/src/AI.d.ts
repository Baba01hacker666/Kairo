import { Vector3 } from '../../core/src/index.ts';
export declare const NodeStatus: {
    readonly Success: "SUCCESS";
    readonly Failure: "FAILURE";
    readonly Running: "RUNNING";
};
export type NodeStatusValue = typeof NodeStatus[keyof typeof NodeStatus];
export declare abstract class BTNode {
    abstract tick(blackboard: Map<string, any>): NodeStatusValue;
}
export declare class SequenceNode extends BTNode {
    children: BTNode[];
    constructor(children: BTNode[]);
    tick(blackboard: Map<string, any>): NodeStatusValue;
}
export declare class SelectorNode extends BTNode {
    children: BTNode[];
    constructor(children: BTNode[]);
    tick(blackboard: Map<string, any>): NodeStatusValue;
}
export declare class ActionNode extends BTNode {
    private actionFn;
    constructor(actionFn: (blackboard: Map<string, any>) => NodeStatusValue);
    tick(blackboard: Map<string, any>): NodeStatusValue;
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
export type PathfindingAlgorithm = 'astar' | 'weighted_astar' | 'dijkstra' | 'bidirectional_astar' | 'bidirectional_dijkstra';
export interface PathfindingOptions {
    algorithm?: PathfindingAlgorithm;
    heuristicWeight?: number;
    allowDiagonal?: boolean;
}
export declare class PathfindingGrid {
    width: number;
    height: number;
    nodeSize: number;
    nodes: PathNode[][];
    constructor(width?: number, height?: number, nodeSize?: number);
    setObstacle(x: number, z: number, walkable: boolean): void;
    findPath(startPos: Vector3, endPos: Vector3, options?: PathfindingOptions | PathfindingAlgorithm): Vector3[];
    findPathAStar(startPos: Vector3, endPos: Vector3, options?: PathfindingOptions): Vector3[];
    findPathWeighted(startPos: Vector3, endPos: Vector3, weight?: number, options?: PathfindingOptions): Vector3[];
    findPathDijkstra(startPos: Vector3, endPos: Vector3, options?: PathfindingOptions): Vector3[];
    findPathBidirectionalAStar(startPos: Vector3, endPos: Vector3, weight?: number, options?: PathfindingOptions): Vector3[];
    findPathBidirectionalDijkstra(startPos: Vector3, endPos: Vector3, options?: PathfindingOptions): Vector3[];
    private resolveOptions;
    private getGridCoords;
    private findPathAStarInternal;
    private findPathBidirectionalInternal;
    private reconstructSinglePath;
    private reconstructBidirectionalPath;
    private nodeToVector3;
    private getNeighbors;
}
