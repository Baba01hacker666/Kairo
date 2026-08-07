export interface LevelElement {
    id?: string;
    type: 'crate' | 'plate' | 'door' | 'key' | 'teleporter' | 'moving_platform' | 'mirror' | 'laser_source' | 'laser_target' | 'rotating_bridge' | 'avocado' | 'helmet' | 'ice' | 'conveyor' | 'tnt' | 'prism' | 'wall' | 'oneway';
    pos: [number, number];
    targetPos?: [number, number];
    color?: 'red' | 'blue' | 'gold';
    rotation?: number;
    dir?: 'N' | 'S' | 'E' | 'W';
    linkedId?: string;
    isHoldPlate?: boolean;
}
export interface LevelDefinition {
    id: number;
    world: number;
    name: string;
    gridSize: [number, number];
    theme: 'meadow' | 'cave' | 'ruins' | 'peak' | 'shadow';
    hint: string;
    startPos: [number, number];
    goalPos: [number, number];
    elements: LevelElement[];
    parMoves: number;
}
export declare const WORLD_NAMES: Record<number, {
    name: string;
    description: string;
    color: string;
}>;
export declare function generateAllLevels(): LevelDefinition[];
export declare const ALL_LEVELS: LevelDefinition[];
