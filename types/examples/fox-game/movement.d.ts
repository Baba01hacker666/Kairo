export declare const MOVE_ARRIVAL_EPSILON = 0.12;
export declare function hasArrivedAtGridTarget(distanceToTarget: number): boolean;
export declare function toCardinalMove(move: {
    x: number;
    y: number;
}): [number, number];
export declare function canAcceptMoveInput(now: number, lastInputTime: number, cooldownMs: number, distanceToTarget: number): boolean;
