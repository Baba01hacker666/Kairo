import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KairoApp } from '@kairo/core';
import { AnimationStateMachine } from '@kairo/animation';
import { Serializer } from '@kairo/core';
import { ALL_LEVELS, LevelDefinition, LevelElement, WORLD_NAMES } from './levels.ts';

// Save state format
interface GameProgress {
  unlockedLevel: number;
  levelStars: Record<number, number>;
  totalAvocados: number;
  achievements: Record<string, boolean>;
}

const SAVE_KEY = 'kairo_fox_puzzle_progress';

function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const envelope = JSON.parse(raw);
      const verified = Serializer.verifyAndUnwrapSave<GameProgress>(envelope);
      if (verified.valid && verified.payload) {
        return verified.payload;
      }
    }
  } catch (e) {
    console.warn('Could not load save progress:', e);
  }
  return {
    unlockedLevel: 1,
    levelStars: {},
    totalAvocados: 0,
    achievements: {}
  };
}

function saveProgress(progress: GameProgress): void {
  try {
    const envelope = Serializer.createSaveEnvelope(progress);
    localStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
}

// Game State
let progress: GameProgress = loadProgress();
let currentLevelIndex = 0;
let currentLevel: LevelDefinition = ALL_LEVELS[currentLevelIndex];

let moveCount = 0;
let avocadosCollected = 0;
let isLevelCleared = false;

// Grid State Snapshot for Undo Stack
interface GridSnapshot {
  playerGridPos: [number, number];
  cratesPos: Map<string, [number, number]>;
  mirrorsRotation: Map<string, number>;
  doorsOpen: Map<string, boolean>;
  collectedItems: Set<string>;
}

const undoStack: GridSnapshot[] = [];

// Visual Objects
let foxGroup: THREE.Group | null = null;
let animStateMachine: AnimationStateMachine | null = null;
const levelObjectsGroup = new THREE.Group();
const elementMeshMap: Map<string, THREE.Object3D> = new Map();

// Grid dimensions & positioning
const TILE_SIZE = 2.0;
let playerGridPos: [number, number] = [1, 1];
const crateGridPositions: Map<string, [number, number]> = new Map();
const mirrorRotations: Map<string, number> = new Map();
const doorStates: Map<string, boolean> = new Map();
const collectedItems: Set<string> = new Set();

// Initialize Kairo App Engine
const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x09090b,
  shadows: true,
  fogColor: 0x09090b,
  fogNear: 20,
  fogFar: 80
});

app.scene.add(levelObjectsGroup);

// Load 3D Models
const gltfLoader = new GLTFLoader();

let avocadoTemplate: THREE.Group | null = null;
let helmetTemplate: THREE.Group | null = null;

// Load Fox Model & Skeletal Animations
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/Fox.glb',
  (gltf) => {
    foxGroup = gltf.scene;
    foxGroup.scale.set(0.022, 0.022, 0.022);
    foxGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    animStateMachine = new AnimationStateMachine(foxGroup);
    // Fox animations: 0: Idle/Survey, 1: Walk, 2: Run
    animStateMachine.registerState('Idle', gltf.animations[0], { fadeDuration: 0.2 });
    animStateMachine.registerState('Walk', gltf.animations[1], { fadeDuration: 0.15 });
    animStateMachine.registerState('Run', gltf.animations[2], { fadeDuration: 0.15 });
    animStateMachine.setState('Idle');

    app.scene.add(foxGroup);
    updatePlayerPositionVisuals(true);
  }
);

// Load Avocado Model
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/Avocado.glb',
  (gltf) => {
    avocadoTemplate = gltf.scene;
    avocadoTemplate.scale.set(12, 12, 12);
    avocadoTemplate.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // Refresh level items if loaded after level build
    buildLevelVisuals();
  }
);

// Load Helmet Model
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/DamagedHelmet.glb',
  (gltf) => {
    helmetTemplate = gltf.scene;
    helmetTemplate.scale.set(0.6, 0.6, 0.6);
    helmetTemplate.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
);

// Helper to map grid coordinates to world 3D position
function gridToWorld(x: number, y: number, height: number = 0): THREE.Vector3 {
  const offsetX = -(currentLevel.gridSize[0] * TILE_SIZE) / 2 + TILE_SIZE / 2;
  const offsetZ = -(currentLevel.gridSize[1] * TILE_SIZE) / 2 + TILE_SIZE / 2;
  return new THREE.Vector3(offsetX + x * TILE_SIZE, height, offsetZ + y * TILE_SIZE);
}

// Build 3D Level Architecture & Visual Environment
function buildLevelVisuals(): void {
  // Clear previous level meshes
  while (levelObjectsGroup.children.length > 0) {
    const child = levelObjectsGroup.children[0];
    levelObjectsGroup.remove(child);
  }
  elementMeshMap.clear();
  app.clearObstacles();

  const [cols, rows] = currentLevel.gridSize;

  // Environment Lighting based on World Theme
  if (currentLevel.world === 1) {
    app.scene.background = new THREE.Color(0x87ceeb);
    app.scene.fog = new THREE.Fog(0x87ceeb, 20, 70);
    app.setLighting({ sunPosition: [-15, 30, -15], sunColor: 0xfffaed, sunIntensity: 2.8, ambientColor: 0xaaccff, ambientIntensity: 1.0 });
  } else if (currentLevel.world === 2) {
    app.scene.background = new THREE.Color(0x0a1128);
    app.scene.fog = new THREE.Fog(0x0a1128, 15, 60);
    app.setLighting({ sunPosition: [0, 25, 0], sunColor: 0x60a5fa, sunIntensity: 1.8, ambientColor: 0x1e293b, ambientIntensity: 1.2 });
  } else if (currentLevel.world === 3) {
    app.scene.background = new THREE.Color(0x1c1917);
    app.scene.fog = new THREE.Fog(0x1c1917, 18, 65);
    app.setLighting({ sunPosition: [-20, 25, 20], sunColor: 0xf59e0b, sunIntensity: 2.2, ambientColor: 0x44403c, ambientIntensity: 0.9 });
  } else if (currentLevel.world === 4) {
    app.scene.background = new THREE.Color(0x312e81);
    app.scene.fog = new THREE.Fog(0x312e81, 25, 80);
    app.setLighting({ sunPosition: [15, 35, -15], sunColor: 0xe0e7ff, sunIntensity: 3.0, ambientColor: 0x4338ca, ambientIntensity: 1.1 });
  } else {
    app.scene.background = new THREE.Color(0x18181b);
    app.scene.fog = new THREE.Fog(0x18181b, 15, 55);
    app.setLighting({ sunPosition: [-10, 20, -10], sunColor: 0xec4899, sunIntensity: 2.5, ambientColor: 0x3f3f46, ambientIntensity: 0.8 });
  }

  // Floor Tiles
  const floorGeo = new THREE.BoxGeometry(TILE_SIZE * 0.96, 0.4, TILE_SIZE * 0.96);
  const tileMatA = new THREE.MeshStandardMaterial({
    color: currentLevel.world === 1 ? 0x4a7c59 : currentLevel.world === 2 ? 0x1e293b : currentLevel.world === 3 ? 0x78350f : currentLevel.world === 4 ? 0x4338ca : 0x3f3f46,
    roughness: 0.7,
    metalness: 0.1
  });
  const tileMatB = new THREE.MeshStandardMaterial({
    color: currentLevel.world === 1 ? 0x3b6647 : currentLevel.world === 2 ? 0x0f172a : currentLevel.world === 3 ? 0x451a03 : currentLevel.world === 4 ? 0x3730a3 : 0x27272a,
    roughness: 0.7,
    metalness: 0.1
  });

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const tileMesh = new THREE.Mesh(floorGeo, (x + y) % 2 === 0 ? tileMatA : tileMatB);
      const pos = gridToWorld(x, y, -0.2);
      tileMesh.position.copy(pos);
      tileMesh.receiveShadow = true;
      levelObjectsGroup.add(tileMesh);
    }
  }

  // Perimeter Boundary Walls
  const wallGeo = new THREE.BoxGeometry(TILE_SIZE, 2.0, TILE_SIZE);
  const wallMat = new THREE.MeshStandardMaterial({
    color: currentLevel.world === 1 ? 0x2d4c1e : currentLevel.world === 2 ? 0x334155 : currentLevel.world === 3 ? 0x57534e : currentLevel.world === 4 ? 0x312e81 : 0x18181b,
    roughness: 0.8
  });

  for (let x = -1; x <= cols; x++) {
    for (let y = -1; y <= rows; y++) {
      if (x === -1 || y === -1 || x === cols || y === rows) {
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.copy(gridToWorld(x, y, 1.0));
        wall.castShadow = true;
        wall.receiveShadow = true;
        levelObjectsGroup.add(wall);
        app.registerObstacle(wall);
      }
    }
  }

  // Goal Exit Portal
  const goalGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
  const goalMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 });
  const goalMesh = new THREE.Mesh(goalGeo, goalMat);
  goalMesh.position.copy(gridToWorld(currentLevel.goalPos[0], currentLevel.goalPos[1], 0.05));
  levelObjectsGroup.add(goalMesh);

  // Level Interactive Elements
  currentLevel.elements.forEach((elem, index) => {
    const elemId = elem.id || `elem_${index}_${elem.type}`;
    const key = `${elem.pos[0]}_${elem.pos[1]}`;

    if (elem.type === 'crate') {
      const crateMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6, metalness: 0.2 })
      );
      const currentPos = crateGridPositions.get(elemId) || elem.pos;
      crateMesh.position.copy(gridToWorld(currentPos[0], currentPos[1], 0.75));
      crateMesh.castShadow = true;
      crateMesh.receiveShadow = true;
      levelObjectsGroup.add(crateMesh);
      elementMeshMap.set(elemId, crateMesh);

    } else if (elem.type === 'plate') {
      const plateMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: elem.isHoldPlate ? 0xef4444 : 0x3b82f6, roughness: 0.3 })
      );
      plateMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.05));
      levelObjectsGroup.add(plateMesh);
      elementMeshMap.set(elemId, plateMesh);

    } else if (elem.type === 'door') {
      const doorColor = elem.color === 'red' ? 0xef4444 : elem.color === 'blue' ? 0x3b82f6 : elem.color === 'gold' ? 0xeab308 : 0x64748b;
      const doorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 2.5, 0.3),
        new THREE.MeshStandardMaterial({ color: doorColor, metalness: 0.7, roughness: 0.3 })
      );
      doorMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 1.25));
      doorMesh.castShadow = true;
      levelObjectsGroup.add(doorMesh);
      elementMeshMap.set(elemId, doorMesh);
      app.registerObstacle(doorMesh);

    } else if (elem.type === 'key') {
      if (!collectedItems.has(elemId)) {
        const keyColor = elem.color === 'red' ? 0xef4444 : elem.color === 'blue' ? 0x3b82f6 : 0xeab308;
        const keyMesh = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.08, 12, 24),
          new THREE.MeshStandardMaterial({ color: keyColor, metalness: 0.9, roughness: 0.1 })
        );
        keyMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.8));
        levelObjectsGroup.add(keyMesh);
        elementMeshMap.set(elemId, keyMesh);
      }

    } else if (elem.type === 'avocado') {
      if (!collectedItems.has(elemId)) {
        let itemMesh: THREE.Object3D;
        if (avocadoTemplate) {
          itemMesh = avocadoTemplate.clone();
        } else {
          itemMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 })
          );
        }
        itemMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.6));
        levelObjectsGroup.add(itemMesh);
        elementMeshMap.set(elemId, itemMesh);
      }

    } else if (elem.type === 'helmet') {
      if (!collectedItems.has(elemId)) {
        let helmetMesh: THREE.Object3D;
        if (helmetTemplate) {
          helmetMesh = helmetTemplate.clone();
        } else {
          helmetMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 })
          );
        }
        helmetMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.6));
        levelObjectsGroup.add(helmetMesh);
        elementMeshMap.set(elemId, helmetMesh);
      }

    } else if (elem.type === 'mirror') {
      const mirrorGroup = new THREE.Group();
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.8, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
      );
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 1.0, roughness: 0.0, transparent: true, opacity: 0.9 })
      );
      glass.position.z = 0.11;
      mirrorGroup.add(frame);
      mirrorGroup.add(glass);

      const rot = mirrorRotations.get(elemId) ?? (elem.rotation || 0);
      mirrorGroup.rotation.y = (rot * Math.PI) / 180;
      mirrorGroup.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.9));
      levelObjectsGroup.add(mirrorGroup);
      elementMeshMap.set(elemId, mirrorGroup);

    } else if (elem.type === 'teleporter') {
      const portalMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.1, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.8 })
      );
      portalMesh.rotation.x = Math.PI / 2;
      portalMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.1));
      levelObjectsGroup.add(portalMesh);
      elementMeshMap.set(elemId, portalMesh);
    }
  });

  updateHUD();
}

// Load Selected Level State
function loadLevel(levelIndex: number): void {
  currentLevelIndex = Math.max(0, Math.min(ALL_LEVELS.length - 1, levelIndex));
  currentLevel = ALL_LEVELS[currentLevelIndex];

  playerGridPos = [...currentLevel.startPos];
  moveCount = 0;
  avocadosCollected = 0;
  isLevelCleared = false;

  crateGridPositions.clear();
  mirrorRotations.clear();
  doorStates.clear();
  collectedItems.clear();
  undoStack.length = 0;

  // Initialize elements state
  currentLevel.elements.forEach((elem, index) => {
    const elemId = elem.id || `elem_${index}_${elem.type}`;
    if (elem.type === 'crate') {
      crateGridPositions.set(elemId, [...elem.pos]);
    } else if (elem.type === 'mirror') {
      mirrorRotations.set(elemId, elem.rotation || 0);
    } else if (elem.type === 'door') {
      doorStates.set(elemId, false);
    }
  });

  buildLevelVisuals();
  updatePlayerPositionVisuals(true);

  app.ui.showToast(`Entered ${currentLevel.name}`, 3000, 'info');
}

// Push State snapshot to Undo Stack
function pushUndoState(): void {
  const crateCopy = new Map<string, [number, number]>();
  crateGridPositions.forEach((v, k) => crateCopy.set(k, [...v]));

  undoStack.push({
    playerGridPos: [...playerGridPos],
    cratesPos: crateCopy,
    mirrorsRotation: new Map(mirrorRotations),
    doorsOpen: new Map(doorStates),
    collectedItems: new Set(collectedItems)
  });
}

// Execute Undo Move
function performUndo(): void {
  if (undoStack.length === 0 || isLevelCleared) {
    app.ui.showToast('Nothing to undo!', 1500, 'warning');
    return;
  }

  const snapshot = undoStack.pop()!;
  playerGridPos = [...snapshot.playerGridPos];
  
  crateGridPositions.clear();
  snapshot.cratesPos.forEach((v, k) => crateGridPositions.set(k, [...v]));

  mirrorRotations.clear();
  snapshot.mirrorsRotation.forEach((v, k) => mirrorRotations.set(k, v));

  doorStates.clear();
  snapshot.doorsOpen.forEach((v, k) => doorStates.set(k, v));

  collectedItems.clear();
  snapshot.collectedItems.forEach(v => collectedItems.add(v));

  moveCount = Math.max(0, moveCount - 1);
  app.audio.playSynthesizedSound('undo');

  buildLevelVisuals();
  updatePlayerPositionVisuals(true);
}

// Update Fox position & Camera target
function updatePlayerPositionVisuals(instant: boolean = false): void {
  if (!foxGroup) return;

  const targetWorldPos = gridToWorld(playerGridPos[0], playerGridPos[1], 0);
  if (instant) {
    foxGroup.position.copy(targetWorldPos);
  } else {
    // Smooth lerp is updated in main tick
  }

  app.cameraController.setTargetPosition(targetWorldPos);
}

// Grid Movement Logic
function tryMovePlayer(dx: number, dy: number): void {
  if (isLevelCleared || (dx === 0 && dy === 0)) return;

  const targetX = playerGridPos[0] + dx;
  const targetY = playerGridPos[1] + dy;

  // Boundary check
  const [cols, rows] = currentLevel.gridSize;
  if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) return;

  // Check Door blockers
  for (const elem of currentLevel.elements) {
    if (elem.type === 'door' && elem.pos[0] === targetX && elem.pos[1] === targetY) {
      const elemId = elem.id || `door_${elem.pos[0]}_${elem.pos[1]}`;
      const isOpen = doorStates.get(elemId);
      if (!isOpen) {
        app.ui.showToast('Door is locked!', 1500, 'warning');
        return;
      }
    }
  }

  // Check Crate pushing
  let pushedCrateId: string | null = null;
  crateGridPositions.forEach((pos, id) => {
    if (pos[0] === targetX && pos[1] === targetY) {
      pushedCrateId = id;
    }
  });

  if (pushedCrateId) {
    const crateNextX = targetX + dx;
    const crateNextY = targetY + dy;

    // Check crate boundary & obstacle
    if (crateNextX < 0 || crateNextX >= cols || crateNextY < 0 || crateNextY >= rows) return;

    // Check if another crate exists at crateNext
    let blockedByCrate = false;
    crateGridPositions.forEach((pos) => {
      if (pos[0] === crateNextX && pos[1] === crateNextY) blockedByCrate = true;
    });
    if (blockedByCrate) return;

    // Save Undo State before push
    pushUndoState();

    // Perform crate push
    crateGridPositions.set(pushedCrateId, [crateNextX, crateNextY]);
    app.audio.playSynthesizedSound('push');

    // Smoothly animate crate mesh
    const crateMesh = elementMeshMap.get(pushedCrateId);
    if (crateMesh) {
      const newPos = gridToWorld(crateNextX, crateNextY, 0.75);
      crateMesh.position.copy(newPos);
    }
  } else {
    pushUndoState();
  }

  // Rotate Fox towards movement direction
  if (foxGroup) {
    const targetAngle = Math.atan2(dx, dy);
    foxGroup.rotation.y = targetAngle;
  }

  // Move player
  playerGridPos = [targetX, targetY];
  moveCount++;

  updatePlayerPositionVisuals();
  checkPressurePlates();
  checkCollectibles();
  checkGoalCondition();
  updateHUD();
}

// Pressure Plate Check
function checkPressurePlates(): void {
  currentLevel.elements.forEach((elem, index) => {
    if (elem.type === 'plate' && elem.linkedId) {
      // Check if player or any crate is on plate
      const isPlayerOn = playerGridPos[0] === elem.pos[0] && playerGridPos[1] === elem.pos[1];
      let isCrateOn = false;
      crateGridPositions.forEach((pos) => {
        if (pos[0] === elem.pos[0] && pos[1] === elem.pos[1]) isCrateOn = true;
      });

      const active = isPlayerOn || isCrateOn;
      const targetDoor = elementMeshMap.get(elem.linkedId);

      if (targetDoor) {
        doorStates.set(elem.linkedId, active);
        targetDoor.visible = !active;
        if (active) {
          app.audio.playSynthesizedSound('switch');
        }
      }
    }
  });
}

// Collectible Items Check
function checkCollectibles(): void {
  currentLevel.elements.forEach((elem, index) => {
    const elemId = elem.id || `elem_${index}_${elem.type}`;
    if ((elem.type === 'avocado' || elem.type === 'helmet' || elem.type === 'key') && !collectedItems.has(elemId)) {
      if (playerGridPos[0] === elem.pos[0] && playerGridPos[1] === elem.pos[1]) {
        collectedItems.add(elemId);
        const mesh = elementMeshMap.get(elemId);
        if (mesh) mesh.visible = false;

        if (elem.type === 'avocado') {
          avocadosCollected++;
          app.audio.playSynthesizedSound('coin');
          app.ui.showToast('Collected Avocado! 🥑', 1500, 'success');
        } else if (elem.type === 'helmet') {
          app.audio.playSynthesizedSound('key');
          app.ui.showToast('Found Secret Golden Helmet! 🪖', 2500, 'success');
        } else if (elem.type === 'key') {
          if (elem.linkedId) doorStates.set(elem.linkedId, true);
          app.audio.playSynthesizedSound('key');
          app.ui.showToast(`Picked up ${elem.color || ''} Keycard! 🔑`, 2000, 'success');
        }
      }
    }
  });
}

// Goal Exit Condition Check
function checkGoalCondition(): void {
  if (playerGridPos[0] === currentLevel.goalPos[0] && playerGridPos[1] === currentLevel.goalPos[1]) {
    isLevelCleared = true;
    app.audio.playSynthesizedSound('fanfare');

    // Calculate Stars: 3 stars if all avocados collected & moves <= parMoves
    const stars = avocadosCollected >= 3 ? (moveCount <= currentLevel.parMoves ? 3 : 2) : 1;

    // Save Progress
    if (progress.unlockedLevel <= currentLevelIndex + 1 && currentLevelIndex + 1 < ALL_LEVELS.length) {
      progress.unlockedLevel = currentLevelIndex + 2;
    }
    progress.levelStars[currentLevel.id] = Math.max(progress.levelStars[currentLevel.id] || 0, stars);
    progress.totalAvocados += avocadosCollected;
    saveProgress(progress);

    app.ui.createModal(
      `🎉 ${currentLevel.name} Cleared!`,
      `
        <div style="text-align: center;">
          <div style="font-size: 36px; margin-bottom: 12px;">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
          <p>Moves: <strong>${moveCount}</strong> (Par: ${currentLevel.parMoves})</p>
          <p>Avocados: <strong>${avocadosCollected} / 3</strong> 🥑</p>
        </div>
      `,
      [
        { text: 'Retry', onClick: () => loadLevel(currentLevelIndex) },
        { text: 'Next Level ➡️', primary: true, onClick: () => loadLevel(currentLevelIndex + 1) }
      ]
    );
  }
}

// Update HUD Labels
function updateHUD(): void {
  const titleEl = document.getElementById('hud-level-title');
  const worldEl = document.getElementById('hud-world-desc');
  const avoEl = document.getElementById('hud-avocado-count');
  const moveEl = document.getElementById('hud-move-count');

  if (titleEl) titleEl.innerText = currentLevel.name;
  if (worldEl) worldEl.innerText = `World ${currentLevel.world}: ${WORLD_NAMES[currentLevel.world].name}`;
  if (avoEl) avoEl.innerText = `${avocadosCollected} / 3 🥑`;
  if (moveEl) moveEl.innerText = `${moveCount} moves`;
}

// UI Button Listeners
document.getElementById('btn-undo')?.addEventListener('click', performUndo);
document.getElementById('btn-restart')?.addEventListener('click', () => loadLevel(currentLevelIndex));
document.getElementById('btn-hint')?.addEventListener('click', () => {
  app.audio.playSynthesizedSound('hint');
  app.ui.createModal('💡 Dynamic Level Hint', currentLevel.hint, [{ text: 'Got it!', primary: true, onClick: () => {} }]);
});
document.getElementById('btn-levels')?.addEventListener('click', showLevelSelectModal);
document.getElementById('btn-settings')?.addEventListener('click', showSettingsModal);

// Level Select Modal
function showLevelSelectModal(): void {
  let gridHtml = '<div class="level-grid">';
  ALL_LEVELS.forEach((lvl, idx) => {
    const isUnlocked = idx + 1 <= progress.unlockedLevel;
    const stars = progress.levelStars[lvl.id] || 0;
    gridHtml += `
      <div class="level-card ${isUnlocked ? '' : 'locked'}" onclick="window.selectGameLevel(${idx})">
        <div style="font-weight: bold; font-size: 16px;">#${lvl.id}</div>
        <div style="font-size: 11px; color: #a1a1aa; margin: 4px 0;">W${lvl.world}</div>
        <div style="font-size: 12px; color: #f59e0b;">${isUnlocked ? (stars > 0 ? '⭐'.repeat(stars) : 'Ready') : '🔒'}</div>
      </div>
    `;
  });
  gridHtml += '</div>';

  (window as any).selectGameLevel = (idx: number) => {
    if (idx + 1 <= progress.unlockedLevel) {
      loadLevel(idx);
    } else {
      app.ui.showToast('Level Locked! Clear previous levels to unlock.', 2000, 'warning');
    }
  };

  app.ui.createModal('🗺️ Select Level', gridHtml, [{ text: 'Close', primary: true, onClick: () => {} }]);
}

// Settings Modal
function showSettingsModal(): void {
  const content = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <label style="font-weight: 600; display: block; margin-bottom: 6px;">Master Volume</label>
        <input type="range" min="0" max="1" step="0.05" value="0.8" oninput="window.setMasterVol(this.value)" style="width: 100%;">
      </div>
      <div>
        <label style="font-weight: 600; display: block; margin-bottom: 6px;">SFX Volume</label>
        <input type="range" min="0" max="1" step="0.05" value="0.9" oninput="window.setSFXVol(this.value)" style="width: 100%;">
      </div>
      <div>
        <label style="font-weight: 600; display: block; margin-bottom: 6px;">Graphics Quality</label>
        <select onchange="window.setGraphicsQuality(this.value)" style="width: 100%; padding: 8px; border-radius: 8px; background: #27272a; color: white;">
          <option value="high">High (PBR + PCF Soft Shadows)</option>
          <option value="medium">Medium (Standard Lighting)</option>
        </select>
      </div>
    </div>
  `;

  (window as any).setMasterVol = (v: number) => app.audio.setMasterVolume(Number(v));
  (window as any).setSFXVol = (v: number) => app.audio.setSFXVolume(Number(v));
  (window as any).setGraphicsQuality = (q: string) => {
    app.renderer.shadowMap.enabled = q === 'high';
  };

  app.ui.createModal('⚙️ Settings', content, [{ text: 'Done', primary: true, onClick: () => {} }]);
}

// Input Handling Hook
let lastInputTime = 0;
const INPUT_COOLDOWN = 180; // ms

app.onUpdate((dt) => {
  if (animStateMachine) {
    animStateMachine.update(dt);
  }

  // Smooth Fox Position Lerp
  if (foxGroup) {
    const targetWorld = gridToWorld(playerGridPos[0], playerGridPos[1], 0);
    foxGroup.position.lerp(targetWorld, Math.min(1.0, 14 * dt));

    const distToTarget = foxGroup.position.distanceTo(targetWorld);
    if (distToTarget > 0.1 && animStateMachine) {
      animStateMachine.setState('Walk');
    } else if (animStateMachine) {
      animStateMachine.setState('Idle');
    }
  }

  // Keyboard Input
  const now = performance.now();
  if (now - lastInputTime > INPUT_COOLDOWN) {
    const move = app.input.getMovementVector();
    if (Math.abs(move.x) > 0.3 || Math.abs(move.y) > 0.3) {
      const dx = Math.round(move.x);
      const dy = Math.round(move.y);
      tryMovePlayer(dx, dy);
      lastInputTime = now;
    }

    if (app.input.isActionJustPressed('Undo')) performUndo();
    if (app.input.isActionJustPressed('Restart')) loadLevel(currentLevelIndex);
    if (app.input.isActionJustPressed('Hint')) {
      app.audio.playSynthesizedSound('hint');
      app.ui.createModal('💡 Dynamic Level Hint', currentLevel.hint, [{ text: 'Got it!', primary: true, onClick: () => {} }]);
    }
  }
});

// Start Initial Level
loadLevel(0);
app.start();
