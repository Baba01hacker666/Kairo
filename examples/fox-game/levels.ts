export interface LevelElement {
  id?: string;
  type:
    | 'crate'
    | 'plate'
    | 'door'
    | 'key'
    | 'teleporter'
    | 'moving_platform'
    | 'mirror'
    | 'laser_source'
    | 'laser_target'
    | 'rotating_bridge'
    | 'avocado'
    | 'helmet'
    | 'ice'
    | 'conveyor'
    | 'tnt'
    | 'prism'
    | 'oneway';
  pos: [number, number];
  targetPos?: [number, number];
  color?: 'red' | 'blue' | 'gold';
  rotation?: number; // degrees
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

export const WORLD_NAMES: Record<number, { name: string; description: string; color: string }> = {
  1: { name: 'Emerald Meadow', description: 'Sunlit pastures introducing pressure plates, crates, ice tiles, and gates.', color: '#10b981' },
  2: { name: 'Crystal Caves', description: 'Subterranean caverns with light beams, mirrors, and laser prisms.', color: '#3b82f6' },
  3: { name: 'Ancient Ruins', description: 'Overgrown ruins featuring moving platforms, keycards, conveyor belts, and portals.', color: '#f59e0b' },
  4: { name: 'Celestial Peak', description: 'High-altitude floating islands with weight-balanced switches, TNT barrels, and rotating bridges.', color: '#8b5cf6' },
  5: { name: 'Shadow Grove', description: 'The ultimate puzzle realm combining all master mechanics.', color: '#ec4899' }
};

export function generateAllLevels(): LevelDefinition[] {
  const levels: LevelDefinition[] = [];

  for (let i = 1; i <= 50; i++) {
    const world = Math.ceil(i / 10);
    const theme = world === 1 ? 'meadow' : world === 2 ? 'cave' : world === 3 ? 'ruins' : world === 4 ? 'peak' : 'shadow';
    const levelInWorld = ((i - 1) % 10) + 1;

    const size: [number, number] = [6 + Math.floor(i / 5), 6 + Math.floor(i / 5)];
    const startPos: [number, number] = [1, 1];
    const goalPos: [number, number] = [size[0] - 2, size[1] - 2];

    const elements: LevelElement[] = [];

    // Add avocados (collectibles)
    elements.push({ type: 'avocado', pos: [2, 1] });
    elements.push({ type: 'avocado', pos: [size[0] - 3, 2] });
    elements.push({ type: 'avocado', pos: [size[0] - 2, size[1] - 3] });

    if (i % 5 === 0) {
      elements.push({ type: 'helmet', pos: [Math.floor(size[0] / 2), Math.floor(size[1] / 2)] });
    }

    if (world === 1) {
      // Meadow: Crates, Pressure Plates, Doors, & Ice Slippery Tiles
      elements.push({ type: 'plate', pos: [3, 2], linkedId: 'door_1', isHoldPlate: levelInWorld > 3 });
      elements.push({ type: 'door', pos: [4, 2], id: 'door_1' });

      if (levelInWorld >= 3) {
        elements.push({ type: 'crate', pos: [2, 2] });
      }
      if (levelInWorld >= 5) {
        // Ice tiles
        elements.push({ type: 'ice', pos: [3, 3] });
        elements.push({ type: 'ice', pos: [3, 4] });
      }
      if (levelInWorld >= 7) {
        elements.push({ type: 'plate', pos: [2, 4], linkedId: 'door_2', isHoldPlate: true });
        elements.push({ type: 'door', pos: [3, 4], id: 'door_2' });
        elements.push({ type: 'crate', pos: [1, 3] });
      }
    } else if (world === 2) {
      // Caves: Light Beams, Mirrors, & Laser Prisms
      elements.push({ type: 'laser_source', pos: [1, 3], rotation: 0 });
      elements.push({ type: 'mirror', pos: [4, 3], rotation: 45 });
      elements.push({ type: 'laser_target', pos: [4, 5], linkedId: 'door_cave', id: 'target_1' });
      elements.push({ type: 'door', pos: [goalPos[0] - 1, goalPos[1]], id: 'door_cave' });

      if (levelInWorld >= 5) {
        elements.push({ type: 'prism', pos: [3, 3], rotation: 90 });
      }
      if (levelInWorld >= 7) {
        elements.push({ type: 'crate', pos: [2, 3] });
      }
    } else if (world === 3) {
      // Ruins: Moving Platforms, Keycards, Teleporters, & Conveyor Belts
      const colorKey: 'red' | 'blue' | 'gold' = levelInWorld % 3 === 0 ? 'gold' : levelInWorld % 2 === 0 ? 'blue' : 'red';
      elements.push({ type: 'key', pos: [2, 3], color: colorKey });
      elements.push({ type: 'door', pos: [4, 3], color: colorKey, id: 'key_door' });
      elements.push({ type: 'teleporter', pos: [3, 1], targetPos: [3, 5] });

      if (levelInWorld >= 4) {
        elements.push({ type: 'conveyor', pos: [2, 4], dir: 'E' });
        elements.push({ type: 'conveyor', pos: [3, 4], dir: 'E' });
      }
      if (levelInWorld >= 6) {
        elements.push({ type: 'moving_platform', pos: [1, 4], targetPos: [5, 4] });
      }
    } else if (world === 4) {
      // Peak: Rotating Bridges, Weight Plates, & TNT Barrels
      elements.push({ type: 'rotating_bridge', pos: [3, 3], rotation: 0, id: 'bridge_1' });
      elements.push({ type: 'plate', pos: [2, 2], linkedId: 'bridge_1' });
      elements.push({ type: 'crate', pos: [1, 2] });

      if (levelInWorld >= 4) {
        elements.push({ type: 'tnt', pos: [3, 2] });
      }
      if (levelInWorld >= 6) {
        elements.push({ type: 'rotating_bridge', pos: [4, 4], rotation: 90, id: 'bridge_2' });
        elements.push({ type: 'plate', pos: [4, 2], linkedId: 'bridge_2' });
      }
    } else {
      // Shadow Grove: Master Combination of All Mechanics
      elements.push({ type: 'key', pos: [1, 2], color: 'gold' });
      elements.push({ type: 'door', pos: [3, 2], color: 'gold', id: 'shadow_door_1' });
      elements.push({ type: 'crate', pos: [2, 3] });
      elements.push({ type: 'tnt', pos: [3, 3] });
      elements.push({ type: 'ice', pos: [4, 2] });
      elements.push({ type: 'conveyor', pos: [1, 4], dir: 'E' });
      elements.push({ type: 'plate', pos: [4, 3], linkedId: 'shadow_door_2', isHoldPlate: true });
      elements.push({ type: 'door', pos: [5, 3], id: 'shadow_door_2' });
      elements.push({ type: 'teleporter', pos: [2, 4], targetPos: [4, 4] });
      elements.push({ type: 'laser_source', pos: [1, 5], rotation: 0 });
      elements.push({ type: 'mirror', pos: [3, 5], rotation: 45 });
      elements.push({ type: 'laser_target', pos: [3, 6], linkedId: 'shadow_door_3' });
      elements.push({ type: 'door', pos: [goalPos[0], goalPos[1] - 1], id: 'shadow_door_3' });
    }

    const hintMsg = `World ${world} Level ${levelInWorld}: ${
      world === 1 ? 'Watch out for slippery ice tiles and push crates onto pressure plates!' :
      world === 2 ? 'Use rotatable mirrors and laser prisms to direct light beams to sensors.' :
      world === 3 ? 'Ride conveyor belts and use teleporters to cross large chasms.' :
      world === 4 ? 'Explode TNT barrels or push crates to align rotating bridges.' :
      'Master all mechanics—ice, conveyors, lasers, TNT, and teleporters—to reach the goal portal!'
    }`;

    levels.push({
      id: i,
      world,
      name: `Level ${i}: ${WORLD_NAMES[world].name} Pt. ${levelInWorld}`,
      gridSize: size,
      theme,
      hint: hintMsg,
      startPos,
      goalPos,
      elements,
      parMoves: 10 + i * 2
    });
  }

  return levels;
}

export const ALL_LEVELS = generateAllLevels();
