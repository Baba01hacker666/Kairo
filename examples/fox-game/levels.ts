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
    | 'wall'
    | 'oneway';
  pos: [number, number];
  targetPos?: [number, number];
  color?: 'red' | 'blue' | 'gold';
  rotation?: number; // degrees (0, 90, 180, 270)
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

    // Grid sizes scale gracefully from 7x7 up to 12x12 for high readability & tight puzzles
    const width = 7 + Math.floor((i - 1) / 8);
    const height = 7 + Math.floor((i - 1) / 8);
    const size: [number, number] = [width, height];

    const startPos: [number, number] = [1, 1];
    const goalPos: [number, number] = [width - 2, height - 2];

    const elements: LevelElement[] = [];

    // Helper to check valid empty grid pos
    const isOccupied = (x: number, y: number) => {
      if ((x === startPos[0] && y === startPos[1]) || (x === goalPos[0] && y === goalPos[1])) return true;
      return elements.some(e => e.pos[0] === x && e.pos[1] === y);
    };

    // Divider wall separating start room from goal room, with a door in the middle passage
    const wallCol = Math.floor(width / 2);
    const doorRow = Math.floor(height / 2);

    for (let y = 0; y < height; y++) {
      if (y !== doorRow) {
        elements.push({ type: 'wall', pos: [wallCol, y] });
      }
    }

    // Place main gate at the wall opening
    const gateId = `gate_main_lvl_${i}`;
    elements.push({ type: 'door', pos: [wallCol, doorRow], id: gateId, color: world === 3 ? (levelInWorld % 2 === 0 ? 'blue' : 'red') : undefined });

    // Collectibles (Avocados) placed strategically in both rooms
    const avo1Pos: [number, number] = [1, height - 2];
    const avo2Pos: [number, number] = [wallCol - 1, 1];
    const avo3Pos: [number, number] = [width - 2, 1];
    
    if (!isOccupied(...avo1Pos)) elements.push({ type: 'avocado', pos: avo1Pos });
    if (!isOccupied(...avo2Pos)) elements.push({ type: 'avocado', pos: avo2Pos });
    if (!isOccupied(...avo3Pos)) elements.push({ type: 'avocado', pos: avo3Pos });

    if (i % 4 === 0) {
      const helmetPos: [number, number] = [width - 2, Math.floor(height / 2) + 1];
      if (!isOccupied(...helmetPos)) elements.push({ type: 'helmet', pos: helmetPos });
    }

    // World Specific Puzzle Mechanics
    if (world === 1) {
      // Meadow: Pressure Plates, Crates, Ice Slippery Tiles
      const platePos: [number, number] = [2, Math.min(height - 3, doorRow + 1)];
      const cratePos: [number, number] = [2, Math.max(1, doorRow - 1)];

      elements.push({ type: 'plate', pos: platePos, linkedId: gateId, isHoldPlate: levelInWorld > 2 });
      elements.push({ type: 'crate', pos: cratePos });

      if (levelInWorld >= 3) {
        // Add ice tiles in the passage
        elements.push({ type: 'ice', pos: [wallCol - 1, doorRow] });
        elements.push({ type: 'ice', pos: [wallCol + 1, doorRow] });
      }

      if (levelInWorld >= 6) {
        // Second inner wall & second door
        const secDoorId = `gate_sec_lvl_${i}`;
        const secDoorRow = doorRow - 2 > 0 ? doorRow - 2 : doorRow + 2;
        elements.push({ type: 'door', pos: [wallCol + 1, secDoorRow], id: secDoorId });
        elements.push({ type: 'plate', pos: [wallCol + 2, secDoorRow], linkedId: secDoorId, isHoldPlate: true });
        elements.push({ type: 'crate', pos: [wallCol + 1, 1] });
      }

    } else if (world === 2) {
      // Caves: Laser Beams, Rotatable Mirrors, Prisms
      const laserSourcePos: [number, number] = [1, doorRow];
      const mirrorPos: [number, number] = [wallCol - 1, doorRow];
      const laserTargetPos: [number, number] = [wallCol - 1, 1];

      elements.push({ type: 'laser_source', pos: laserSourcePos, rotation: 0 }); // Shoots East
      elements.push({ type: 'mirror', pos: mirrorPos, rotation: 45 }); // Reflects East -> South
      elements.push({ type: 'laser_target', pos: laserTargetPos, linkedId: gateId, id: `target_${i}` });

      if (levelInWorld >= 4) {
        // Add prism or second mirror setup
        elements.push({ type: 'prism', pos: [wallCol - 2, doorRow], rotation: 90 });
      }

      if (levelInWorld >= 7) {
        // Block laser path with a pushable crate
        elements.push({ type: 'crate', pos: [3, doorRow] });
      }

    } else if (world === 3) {
      // Ruins: Keycards, Teleporters, Conveyors
      const keyColor: 'red' | 'blue' | 'gold' = levelInWorld % 3 === 0 ? 'gold' : levelInWorld % 2 === 0 ? 'blue' : 'red';
      const keyPos: [number, number] = [1, height - 2];
      
      elements.push({ type: 'key', pos: keyPos, color: keyColor, linkedId: gateId });
      elements.push({ type: 'teleporter', pos: [2, 1], targetPos: [wallCol + 1, 1] });

      if (levelInWorld >= 4) {
        elements.push({ type: 'conveyor', pos: [wallCol - 1, doorRow - 1], dir: 'E' });
        elements.push({ type: 'conveyor', pos: [wallCol - 1, doorRow + 1], dir: 'N' });
      }

      if (levelInWorld >= 7) {
        // Secondary Teleporter
        elements.push({ type: 'teleporter', pos: [width - 2, 2], targetPos: [wallCol + 1, height - 2] });
      }

    } else if (world === 4) {
      // Peak: Rotating Bridges, Weight Plates, TNT Barrels
      const bridgeId = `bridge_lvl_${i}`;
      elements.push({ type: 'rotating_bridge', pos: [wallCol, doorRow], rotation: 0, id: bridgeId });
      elements.push({ type: 'plate', pos: [wallCol - 1, doorRow], linkedId: bridgeId });
      elements.push({ type: 'crate', pos: [wallCol - 2, doorRow] });

      if (levelInWorld >= 3) {
        // TNT barrel blocking the path
        elements.push({ type: 'tnt', pos: [wallCol + 1, doorRow] });
      }

      if (levelInWorld >= 6) {
        const secBridgeId = `bridge_sec_lvl_${i}`;
        elements.push({ type: 'rotating_bridge', pos: [wallCol + 1, height - 2], rotation: 90, id: secBridgeId });
        elements.push({ type: 'plate', pos: [wallCol - 1, height - 2], linkedId: secBridgeId });
      }

    } else {
      // Shadow Grove: Ultimate Master Mechanics Combination
      elements.push({ type: 'key', pos: [1, doorRow + 1], color: 'gold', linkedId: gateId });
      elements.push({ type: 'crate', pos: [2, 2] });
      elements.push({ type: 'tnt', pos: [wallCol - 1, 1] });
      elements.push({ type: 'ice', pos: [wallCol - 1, doorRow] });
      elements.push({ type: 'conveyor', pos: [1, doorRow - 1], dir: 'E' });
      elements.push({ type: 'teleporter', pos: [2, height - 2], targetPos: [wallCol + 1, height - 2] });
      elements.push({ type: 'laser_source', pos: [wallCol + 1, 1], rotation: 90 });
      elements.push({ type: 'mirror', pos: [wallCol + 1, doorRow + 1], rotation: 135 });
      
      const shadowGateId = `shadow_gate_${i}`;
      elements.push({ type: 'door', pos: [goalPos[0] - 1, goalPos[1]], id: shadowGateId });
      elements.push({ type: 'laser_target', pos: [width - 2, doorRow + 1], linkedId: shadowGateId });
    }

    const hintMsg = `Level ${i} (${WORLD_NAMES[world].name} Pt. ${levelInWorld}): ${
      world === 1 ? 'Push the heavy crate onto the pressure plate to keep the main gate open!' :
      world === 2 ? 'Interact (E key / touch button) to rotate the mirror 45° and direct the laser beam onto the target sensor.' :
      world === 3 ? 'Collect the matching keycard and ride teleporters or conveyor belts across inner walls.' :
      world === 4 ? 'Push TNT into obstacles or activate weight plates to align rotating bridges.' :
      'Master all mechanics—lasers, ice, conveyors, TNT, and keycards—to reach the exit portal!'
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
      parMoves: 8 + i * 2
    });
  }

  return levels;
}

export const ALL_LEVELS = generateAllLevels();
