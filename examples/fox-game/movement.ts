export const MOVE_ARRIVAL_EPSILON = 0.12;

export function hasArrivedAtGridTarget(distanceToTarget: number): boolean {
  return distanceToTarget < MOVE_ARRIVAL_EPSILON;
}

export function toCardinalMove(move: { x: number; y: number }): [number, number] {
  if (Math.abs(move.x) > Math.abs(move.y)) {
    return [Math.sign(move.x), 0];
  }

  return [0, Math.sign(move.y)];
}

export function canAcceptMoveInput(now: number, lastInputTime: number, cooldownMs: number, distanceToTarget: number): boolean {
  return now - lastInputTime > cooldownMs && hasArrivedAtGridTarget(distanceToTarget);
}
