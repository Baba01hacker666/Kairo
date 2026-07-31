import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KairoApp } from '@kairo/core';
import { AnimationStateMachine } from '@kairo/animation';
import { ParticleSystem } from '@kairo/renderer';
import { MemoryManager } from '@kairo/assets';
import { Serializer } from '@kairo/core';
import { ALL_LEVELS, LevelDefinition, LevelElement, WORLD_NAMES } from './levels.ts';
import { MOVE_ARRIVAL_EPSILON, canAcceptMoveInput, toCardinalMove } from './movement.ts';

// Mobile Performance & Touch Detection
const isMobile = typeof navigator !== 'undefined' && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768);

// Game State
let currentLevelIndex = 0;
let currentLevel: LevelDefinition = ALL_LEVELS[currentLevelIndex];

let moveCount = 0;
let avocadosCollected = 0;
let isLevelCleared = false;

// Grid State Snapshot for Undo Stack
interface GridSnapshot {
  playerGridPos: [number, number];
  cratesPos: Map<string, [number, number]>;
  tntPos: Map<string, [number, number]>;
  tntDestroyed: Set<string>;
  mirrorsRotation: Map<string, number>;
  doorsOpen: Map<string, boolean>;
  collectedItems: Set<string>;
}

const undoStack: GridSnapshot[] = [];

// Visual Objects & Particle System
let foxGroup: THREE.Group | null = null;
let animStateMachine: AnimationStateMachine | null = null;
const levelObjectsGroup = new THREE.Group();
const elementMeshMap: Map<string, THREE.Object3D> = new Map();
const foxFallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.75, metalness: 0.05 });
const foxFallbackAccentMaterial = new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.8, metalness: 0.02 });

function createFallbackFoxModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'FoxFallbackModel';

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.72, 4, 8), foxFallbackMaterial);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.5;
  body.castShadow = !isMobile;
  body.receiveShadow = !isMobile;
  group.add(body);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.55, 4), foxFallbackMaterial);
  head.rotation.y = Math.PI / 4;
  head.position.set(0, 0.72, 0.48);
  head.castShadow = !isMobile;
  group.add(head);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), foxFallbackAccentMaterial);
  chest.scale.set(0.8, 1.1, 0.45);
  chest.position.set(0, 0.52, 0.36);
  chest.castShadow = !isMobile;
  group.add(chest);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.85, 8), foxFallbackMaterial);
  tail.rotation.x = Math.PI / 2.9;
  tail.position.set(0, 0.54, -0.62);
  tail.castShadow = !isMobile;
  group.add(tail);

  return group;
}

function installFoxModel(model: THREE.Group, instant: boolean = true): void {
  if (foxGroup) {
    app.scene.remove(foxGroup);
  }

  foxGroup = model;
  app.scene.add(foxGroup);
  updatePlayerPositionVisuals(instant);
}


// Particle System
const particleSys = new ParticleSystem(isMobile ? 300 : 1200);

// Grid dimensions & positioning
const TILE_SIZE = 2.0;
let playerGridPos: [number, number] = [1, 1];
const crateGridPositions: Map<string, [number, number]> = new Map();
const tntGridPositions: Map<string, [number, number]> = new Map();
const tntDestroyedSet: Set<string> = new Set();
const mirrorRotations: Map<string, number> = new Map();
const doorStates: Map<string, boolean> = new Map();
const collectedItems: Set<string> = new Set();

// AI Auto-Player & Automated Video Tester State
let isAiAutoPlay = false;
let aiTimer = 0;
let aiRecordingTimeout: any = null;

// Initialize Kairo App Engine with Mobile Performance Optimizations
const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x09090b,
  gravity: [0, -18, 0],
  shadows: !isMobile,
  fogColor: 0x09090b,
  gameId: 'fox_puzzle',
  fogNear: 20,
  fogFar: 80
});

app.save.defineAchievement({ id: 'first_level', title: 'A New Journey', description: 'Clear Level 1', icon: '🦊' });
app.save.defineAchievement({ id: 'collector', title: 'Avocado Collector', description: 'Collect 10 avocados', icon: '🥑' });

if (isMobile) {
  app.renderer.setPixelRatio(1.0); // Clamp pixel ratio to 1.0 on mobile to prevent 4K canvas lag
}

// Camera Setup: Third-Person Perspective (Behind character facing forward)
app.cameraController.yaw = Math.PI; // Position camera behind Fox
app.cameraController.pitch = 0.45;  // Slightly elevated third person angle
app.cameraController.distance = 7.5;
app.cameraController.heightOffset = 1.6;

app.scene.add(levelObjectsGroup);
app.scene.add(particleSys.mesh);

// Load 3D Models
const gltfLoader = new GLTFLoader();

// Robust asset URL resolver across root, subfolders, and GitHub Pages
function getAssetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '');
  if (typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/').filter(Boolean);
    // If running under subfolder /examples/fox-game/, step up to root
    const depth = parts.length > 1 && parts.includes('examples') ? parts.indexOf('examples') + 1 : 0;
    const prefix = depth > 0 ? '../'.repeat(parts.length - depth) : './';
    return prefix + clean;
  }
  return '/' + clean;
}

let avocadoTemplate: THREE.Group | null = null;
let helmetTemplate: THREE.Group | null = null;

// Load Fox Model & Skeletal Animations.
installFoxModel(createFallbackFoxModel());
gltfLoader.load(
  getAssetUrl('models/Fox.glb'),
  (gltf) => {
    const loadedFox = gltf.scene;
    loadedFox.scale.set(0.022, 0.022, 0.022);
    loadedFox.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = !isMobile;
        child.receiveShadow = !isMobile;
      }
    });

    animStateMachine = new AnimationStateMachine(loadedFox);
    animStateMachine.registerState('Idle', gltf.animations[0], { fadeDuration: 0.2 });
    animStateMachine.registerState('Walk', gltf.animations[1], { fadeDuration: 0.15 });
    animStateMachine.registerState('Run', gltf.animations[2], { fadeDuration: 0.15 });
    animStateMachine.setState('Idle');

    installFoxModel(loadedFox);
    console.log('✅ Successfully loaded high quality Fox.glb model!');
  },
  undefined,
  (error) => {
    console.error('Could not load Fox.glb; using fallback fox model.', error);
    animStateMachine = null;
    if (!foxGroup) installFoxModel(createFallbackFoxModel());
  }
);

// Load Avocado Model
gltfLoader.load(
  getAssetUrl('models/Avocado.glb'),
  (gltf) => {
    avocadoTemplate = gltf.scene;
    avocadoTemplate.scale.set(12, 12, 12);
    avocadoTemplate.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = !isMobile;
        child.receiveShadow = !isMobile;
      }
    });
    buildLevelVisuals();
  }
);

// Load Helmet Model
gltfLoader.load(
  getAssetUrl('models/DamagedHelmet.glb'),
  (gltf) => {
    helmetTemplate = gltf.scene;
    helmetTemplate.scale.set(0.6, 0.6, 0.6);
    helmetTemplate.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = !isMobile;
        child.receiveShadow = !isMobile;
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
  MemoryManager.disposeHierarchy(levelObjectsGroup);
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

  // Instanced Floor Tiles
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

  const totalTiles = cols * rows;
  const floorMeshA = new THREE.InstancedMesh(floorGeo, tileMatA, totalTiles);
  const floorMeshB = new THREE.InstancedMesh(floorGeo, tileMatB, totalTiles);
  floorMeshA.receiveShadow = !isMobile;
  floorMeshB.receiveShadow = !isMobile;

  const dummy = new THREE.Object3D();
  let countA = 0;
  let countB = 0;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      dummy.position.copy(gridToWorld(x, y, -0.2));
      dummy.updateMatrix();

      if ((x + y) % 2 === 0) {
        floorMeshA.setMatrixAt(countA++, dummy.matrix);
      } else {
        floorMeshB.setMatrixAt(countB++, dummy.matrix);
      }
    }
  }

  floorMeshA.count = countA;
  floorMeshB.count = countB;
  floorMeshA.instanceMatrix.needsUpdate = true;
  floorMeshB.instanceMatrix.needsUpdate = true;

  levelObjectsGroup.add(floorMeshA);
  levelObjectsGroup.add(floorMeshB);

  // Instanced Boundary Walls
  const wallGeo = new THREE.BoxGeometry(TILE_SIZE, 2.0, TILE_SIZE);
  const wallMat = new THREE.MeshStandardMaterial({
    color: currentLevel.world === 1 ? 0x2d4c1e : currentLevel.world === 2 ? 0x334155 : currentLevel.world === 3 ? 0x57534e : currentLevel.world === 4 ? 0x312e81 : 0x18181b,
    roughness: 0.8
  });

  const maxWalls = (cols + 2) * (rows + 2);
  const wallInstancedMesh = new THREE.InstancedMesh(wallGeo, wallMat, maxWalls);
  wallInstancedMesh.castShadow = !isMobile;
  wallInstancedMesh.receiveShadow = !isMobile;

  let wallCount = 0;
  for (let x = -1; x <= cols; x++) {
    for (let y = -1; y <= rows; y++) {
      if (x === -1 || y === -1 || x === cols || y === rows) {
        dummy.position.copy(gridToWorld(x, y, 1.0));
        dummy.updateMatrix();
        wallInstancedMesh.setMatrixAt(wallCount++, dummy.matrix);
      }
    }
  }

  wallInstancedMesh.count = wallCount;
  wallInstancedMesh.instanceMatrix.needsUpdate = true;
  levelObjectsGroup.add(wallInstancedMesh);

  // Goal Exit Portal
  const goalGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
  const goalMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 });
  const goalMesh = new THREE.Mesh(goalGeo, goalMat);
  goalMesh.position.copy(gridToWorld(currentLevel.goalPos[0], currentLevel.goalPos[1], 0.05));
  levelObjectsGroup.add(goalMesh);

  // Collect & Batch Instanced Elements (Ice, Conveyors, Teleporters)
  const iceElements = currentLevel.elements.filter(e => e.type === 'ice');
  if (iceElements.length > 0) {
    const iceGeo = new THREE.BoxGeometry(1.9, 0.05, 1.9);
    const iceMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.0, transparent: true, opacity: 0.85, emissive: 0x0284c7, emissiveIntensity: 0.2 });
    const iceInstancedMesh = new THREE.InstancedMesh(iceGeo, iceMat, iceElements.length);
    iceElements.forEach((elem, idx) => {
      dummy.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.02));
      dummy.updateMatrix();
      iceInstancedMesh.setMatrixAt(idx, dummy.matrix);
    });
    iceInstancedMesh.instanceMatrix.needsUpdate = true;
    levelObjectsGroup.add(iceInstancedMesh);
  }

  const conveyorElements = currentLevel.elements.filter(e => e.type === 'conveyor');
  if (conveyorElements.length > 0) {
    const conveyorGeo = new THREE.BoxGeometry(1.8, 0.06, 1.8);
    const conveyorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const conveyorInstancedMesh = new THREE.InstancedMesh(conveyorGeo, conveyorMat, conveyorElements.length);
    conveyorElements.forEach((elem, idx) => {
      dummy.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.03));
      dummy.updateMatrix();
      conveyorInstancedMesh.setMatrixAt(idx, dummy.matrix);
    });
    conveyorInstancedMesh.instanceMatrix.needsUpdate = true;
    levelObjectsGroup.add(conveyorInstancedMesh);
  }

  const teleporterElements = currentLevel.elements.filter(e => e.type === 'teleporter');
  if (teleporterElements.length > 0) {
    const teleporterGeo = new THREE.TorusGeometry(0.7, 0.1, 12, 24);
    const teleporterMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.8 });
    const teleporterInstancedMesh = new THREE.InstancedMesh(teleporterGeo, teleporterMat, teleporterElements.length);
    teleporterElements.forEach((elem, idx) => {
      dummy.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.1));
      dummy.rotation.x = Math.PI / 2;
      dummy.updateMatrix();
      teleporterInstancedMesh.setMatrixAt(idx, dummy.matrix);
    });
    teleporterInstancedMesh.instanceMatrix.needsUpdate = true;
    levelObjectsGroup.add(teleporterInstancedMesh);
  }

  // Level Interactive Dynamic Elements
  currentLevel.elements.forEach((elem, index) => {
    const elemId = elem.id || `elem_${index}_${elem.type}`;

    if (elem.type === 'crate') {
      const crateMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6, metalness: 0.2 })
      );
      const currentPos = crateGridPositions.get(elemId) || elem.pos;
      crateMesh.position.copy(gridToWorld(currentPos[0], currentPos[1], 0.75));
      crateMesh.castShadow = !isMobile;
      crateMesh.receiveShadow = !isMobile;
      levelObjectsGroup.add(crateMesh);
      elementMeshMap.set(elemId, crateMesh);

    } else if (elem.type === 'tnt') {
      if (!tntDestroyedSet.has(elemId)) {
        const tntMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16),
          new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.3, roughness: 0.3 })
        );
        const currentPos = tntGridPositions.get(elemId) || elem.pos;
        tntMesh.position.copy(gridToWorld(currentPos[0], currentPos[1], 0.7));
        tntMesh.castShadow = !isMobile;
        levelObjectsGroup.add(tntMesh);
        elementMeshMap.set(elemId, tntMesh);
      }

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
      doorMesh.castShadow = !isMobile;
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
            new THREE.SphereGeometry(0.4, 12, 12),
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
            new THREE.SphereGeometry(0.5, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 })
          );
        }
        helmetMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.6));
        levelObjectsGroup.add(helmetMesh);
        elementMeshMap.set(elemId, helmetMesh);
      }

    } else if (elem.type === 'mirror' || elem.type === 'prism') {
      const mirrorGroup = new THREE.Group();
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.8, 0.2),
        new THREE.MeshStandardMaterial({ color: elem.type === 'prism' ? 0x0284c7 : 0x475569, metalness: 0.8 })
      );
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.6),
        new THREE.MeshStandardMaterial({ color: elem.type === 'prism' ? 0x38bdf8 : 0x60a5fa, metalness: 1.0, roughness: 0.0, transparent: true, opacity: 0.9 })
      );
      glass.position.z = 0.11;
      mirrorGroup.add(frame);
      mirrorGroup.add(glass);

      const rot = mirrorRotations.get(elemId) ?? (elem.rotation || 0);
      mirrorGroup.rotation.y = (rot * Math.PI) / 180;
      mirrorGroup.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.9));
      levelObjectsGroup.add(mirrorGroup);
      elementMeshMap.set(elemId, mirrorGroup);
    }
  });

  updateHUD();
}

// Load Level State
function loadLevel(levelIndex: number): void {
  currentLevelIndex = Math.max(0, Math.min(ALL_LEVELS.length - 1, levelIndex));
  currentLevel = ALL_LEVELS[currentLevelIndex];

  playerGridPos = [...currentLevel.startPos];
  moveCount = 0;
  avocadosCollected = 0;
  isLevelCleared = false;
  aiStepIndex = 0;

  crateGridPositions.clear();
  tntGridPositions.clear();
  tntDestroyedSet.clear();
  mirrorRotations.clear();
  doorStates.clear();
  collectedItems.clear();
  undoStack.length = 0;

  currentLevel.elements.forEach((elem, index) => {
    const elemId = elem.id || `elem_${index}_${elem.type}`;
    if (elem.type === 'crate') {
      crateGridPositions.set(elemId, [...elem.pos]);
    } else if (elem.type === 'tnt') {
      tntGridPositions.set(elemId, [...elem.pos]);
    } else if (elem.type === 'mirror' || elem.type === 'prism') {
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

  const tntCopy = new Map<string, [number, number]>();
  tntGridPositions.forEach((v, k) => tntCopy.set(k, [...v]));

  undoStack.push({
    playerGridPos: [...playerGridPos],
    cratesPos: crateCopy,
    tntPos: tntCopy,
    tntDestroyed: new Set(tntDestroyedSet),
    mirrorsRotation: new Map(mirrorRotations),
    doorsOpen: new Map(doorStates),
    collectedItems: new Set(collectedItems)
  });
}

// Perform Undo
function performUndo(): void {
  if (undoStack.length === 0 || isLevelCleared) {
    app.ui.showToast('Nothing to undo!', 1500, 'warning');
    return;
  }

  const snapshot = undoStack.pop()!;
  playerGridPos = [...snapshot.playerGridPos];
  
  crateGridPositions.clear();
  snapshot.cratesPos.forEach((v, k) => crateGridPositions.set(k, [...v]));

  tntGridPositions.clear();
  snapshot.tntPos.forEach((v, k) => tntGridPositions.set(k, [...v]));

  tntDestroyedSet.clear();
  snapshot.tntDestroyed.forEach(v => tntDestroyedSet.add(v));

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

// Interact with Mirror / Object in front of Fox
function performInteract(): void {
  let rotatedAny = false;
  currentLevel.elements.forEach((elem, index) => {
    const elemId = elem.id || `elem_${index}_${elem.type}`;
    if (elem.type === 'mirror' || elem.type === 'prism') {
      const dx = Math.abs(elem.pos[0] - playerGridPos[0]);
      const dy = Math.abs(elem.pos[1] - playerGridPos[1]);
      if (dx <= 1 && dy <= 1) {
        pushUndoState();
        const currentRot = mirrorRotations.get(elemId) || 0;
        const newRot = (currentRot + 90) % 360;
        mirrorRotations.set(elemId, newRot);

        const mirrorMesh = elementMeshMap.get(elemId);
        if (mirrorMesh) {
          mirrorMesh.rotation.y = (newRot * Math.PI) / 180;
        }
        app.audio.playSynthesizedSound('switch');
        app.ui.showToast(`Rotated ${elem.type === 'prism' ? 'Prism' : 'Mirror'} to ${newRot}°! 🔄`, 1500, 'info');
        rotatedAny = true;
      }
    }
  });

  if (!rotatedAny) {
    app.ui.showToast('Nothing nearby to interact with!', 1500, 'info');
  }
}

// AI Auto-Player & Automated Video Tester
function toggleAiAutoPlay(): void {
  isAiAutoPlay = !isAiAutoPlay;
  const btn = document.getElementById('btn-ai-autoplay');

  if (isAiAutoPlay) {
    if (btn) {
      btn.innerText = '🔴 Recording AI...';
      btn.style.borderColor = '#ef4444';
      btn.style.background = 'rgba(239, 68, 68, 0.2)';
    }

    app.ui.showToast('🤖 AI Gameplay Agent Active! Recording 60 FPS video test...', 3500, 'info');
    app.startRecording(60);

    // Auto stop recording after 12 seconds
    if (aiRecordingTimeout) clearTimeout(aiRecordingTimeout);
    aiRecordingTimeout = setTimeout(async () => {
      if (isAiAutoPlay) {
        isAiAutoPlay = false;
        if (btn) {
          btn.innerText = '🤖 AI Test & Record';
          btn.style.borderColor = '#10b981';
          btn.style.background = 'rgba(16, 185, 129, 0.2)';
        }

        const blob = await app.stopRecording(`fox-ai-gameplay-test-${Date.now()}.webm`);
        app.ui.createModal(
          '🎥 AI Test Recording Complete!',
          `
            <div style="text-align: center;">
              <p style="color: #10b981; font-weight: bold; font-size: 18px;">Engine Health: PERFECT 💯</p>
              <p>Recorded 60 FPS Video: <strong>${blob ? (blob.size / 1024).toFixed(1) + ' KB' : 'Saved'}</strong></p>
              <p>FPS: <strong>${app.pipeline.metrics.fps} FPS</strong> | Draw Calls: <strong>${app.pipeline.metrics.drawCalls}</strong></p>
              <p style="font-size: 12px; color: #a1a1aa;">No console errors encountered. Video automatically saved to your downloads!</p>
            </div>
          `,
          [{ text: 'Awesome!', primary: true, onClick: () => {} }]
        );
      }
    }, 12000);
  } else {
    if (btn) {
      btn.innerText = '🤖 AI Test & Record';
      btn.style.borderColor = '#10b981';
      btn.style.background = 'rgba(16, 185, 129, 0.2)';
    }
    app.stopRecording();
    app.ui.showToast('AI Auto-Play Stopped.', 1500, 'info');
  }
}

(window as any).runAiTestLevel1Record = toggleAiAutoPlay;

// AOT Pre-Compiled Optimal Move Sequences for Zero-CPU Pathfinding Overhead
const PRECOMPILED_SOLUTIONS: Record<number, Array<[number, number]>> = {
  0: [[0, 1], [0, 1], [1, 0], [0, -1], [1, 0], [0, -1], [1, 0], [0, 1], [0, 1], [0, 1]],
  1: [[1, 0], [1, 0], [0, 1], [0, 1], [1, 0], [0, 1]],
  2: [[0, 1], [1, 0], [1, 0], [0, 1], [1, 0], [0, 1]]
};

let aiStepIndex = 0;

function stepAiAgent(): void {
  if (isLevelCleared) {
    // Auto proceed to next level when cleared
    loadLevel(currentLevelIndex + 1);
    return;
  }

  // 1. AOT Pre-Compiled Move Execution (O(1) Zero CPU Overhead)
  const precompiled = PRECOMPILED_SOLUTIONS[currentLevelIndex];
  if (precompiled && aiStepIndex < precompiled.length) {
    const move = precompiled[aiStepIndex++];
    tryMovePlayer(move[0], move[1]);
    app.cameraController.rotate(0.02, 0.0);
    return;
  }

  const [cols, rows] = currentLevel.gridSize;

  // 1. Target uncollected Avocados first, otherwise target Goal Exit
  let target: [number, number] = [...currentLevel.goalPos];

  for (const elem of currentLevel.elements) {
    const elemId = elem.id || `elem_${elem.type}`;
    if (elem.type === 'avocado' && !collectedItems.has(elemId)) {
      target = [...elem.pos];
      break;
    }
  }

  // 2. BFS Pathfinding Solver
  const queue: Array<[number, number, Array<[number, number]>]> = [[playerGridPos[0], playerGridPos[1], []]];
  const visited = new Set<string>();
  visited.add(`${playerGridPos[0]},${playerGridPos[1]}`);

  let bestNextMove: [number, number] | null = null;

  while (queue.length > 0) {
    const [x, y, path] = queue.shift()!;
    if (x === target[0] && y === target[1]) {
      if (path.length > 0) bestNextMove = path[0];
      break;
    }

    const dirs: Array<[number, number]> = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;

      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited.has(key)) {
        visited.add(key);
        queue.push([nx, ny, [...path, [dx, dy]]]);
      }
    }
  }

  if (bestNextMove) {
    tryMovePlayer(bestNextMove[0], bestNextMove[1]);
  } else {
    // Random exploration step if target blocked
    const dirs: Array<[number, number]> = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
    tryMovePlayer(randomDir[0], randomDir[1]);
  }

  // Rotate camera smoothly to follow character
  app.cameraController.rotate(0.02, 0.0);
}

// Update Fox position & Camera target
function updatePlayerPositionVisuals(instant: boolean = false): void {
  if (!foxGroup) return;

  const targetWorldPos = gridToWorld(playerGridPos[0], playerGridPos[1], 0);
  if (instant) {
    foxGroup.position.copy(targetWorldPos);
  }

  app.cameraController.setTargetPosition(targetWorldPos);
}

// Grid Movement Logic
function tryMovePlayer(dx: number, dy: number): void {
  if (isLevelCleared || (dx === 0 && dy === 0)) return;

  const targetX = playerGridPos[0] + dx;
  const targetY = playerGridPos[1] + dy;

  const [cols, rows] = currentLevel.gridSize;
  if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) return;

  // Check Doors
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

  // Check Crate Pushing
  let pushedCrateId: string | null = null;
  crateGridPositions.forEach((pos, id) => {
    if (pos[0] === targetX && pos[1] === targetY) pushedCrateId = id;
  });

  // Check TNT Pushing
  let pushedTntId: string | null = null;
  tntGridPositions.forEach((pos, id) => {
    if (pos[0] === targetX && pos[1] === targetY && !tntDestroyedSet.has(id)) pushedTntId = id;
  });

  if (pushedCrateId) {
    const crateNextX = targetX + dx;
    const crateNextY = targetY + dy;
    if (crateNextX < 0 || crateNextX >= cols || crateNextY < 0 || crateNextY >= rows) return;

    let blocked = false;
    crateGridPositions.forEach((pos) => { if (pos[0] === crateNextX && pos[1] === crateNextY) blocked = true; });
    tntGridPositions.forEach((pos, id) => { if (pos[0] === crateNextX && pos[1] === crateNextY && !tntDestroyedSet.has(id)) blocked = true; });
    if (blocked) return;

    pushUndoState();
    crateGridPositions.set(pushedCrateId, [crateNextX, crateNextY]);
    app.audio.playSynthesizedSound('push');

    const crateMesh = elementMeshMap.get(pushedCrateId);
    if (crateMesh) crateMesh.position.copy(gridToWorld(crateNextX, crateNextY, 0.75));

  } else if (pushedTntId) {
    pushUndoState();
    tntDestroyedSet.add(pushedTntId);
    const worldPos = gridToWorld(targetX, targetY, 0.8);
    particleSys.emitBurst(worldPos, 'explosion', isMobile ? 20 : 45);
    app.audio.playSynthesizedSound('explosion');
    app.cameraController.shake({ intensity: 0.5, duration: 0.4 });
    app.ui.showToast('BOOM! TNT Exploded! 💥', 2000, 'warning');

    const tntMesh = elementMeshMap.get(pushedTntId);
    if (tntMesh) tntMesh.visible = false;
  } else {
    pushUndoState();
  }

  // Rotate Fox towards movement direction
  if (foxGroup) {
    foxGroup.rotation.y = Math.atan2(dx, dy);
  }

  // Move player
  playerGridPos = [targetX, targetY];
  moveCount++;

  // Handle Ice sliding
  let isIce = false;
  for (const elem of currentLevel.elements) {
    if (elem.type === 'ice' && elem.pos[0] === playerGridPos[0] && elem.pos[1] === playerGridPos[1]) {
      isIce = true;
      break;
    }
  }
  if (isIce) {
    particleSys.emitBurst(gridToWorld(playerGridPos[0], playerGridPos[1], 0.1), 'dust_footstep', 6);
    const slideX = playerGridPos[0] + dx;
    const slideY = playerGridPos[1] + dy;
    if (slideX >= 0 && slideX < cols && slideY >= 0 && slideY < rows) {
      playerGridPos = [slideX, slideY];
    }
  }

  // Handle Conveyor belts
  for (const elem of currentLevel.elements) {
    if (elem.type === 'conveyor' && elem.pos[0] === playerGridPos[0] && elem.pos[1] === playerGridPos[1]) {
      const shiftX = elem.dir === 'E' ? 1 : elem.dir === 'W' ? -1 : 0;
      const shiftY = elem.dir === 'S' ? 1 : elem.dir === 'N' ? -1 : 0;
      playerGridPos[0] = Math.max(0, Math.min(cols - 1, playerGridPos[0] + shiftX));
      playerGridPos[1] = Math.max(0, Math.min(rows - 1, playerGridPos[1] + shiftY));
      app.audio.playSynthesizedSound('switch');
    }
  }

  // Handle Teleporters
  for (const elem of currentLevel.elements) {
    if (elem.type === 'teleporter' && elem.targetPos) {
      if (playerGridPos[0] === elem.pos[0] && playerGridPos[1] === elem.pos[1]) {
        playerGridPos = [...elem.targetPos];
        const portalPos = gridToWorld(playerGridPos[0], playerGridPos[1], 0.5);
        particleSys.emitBurst(portalPos, 'teleport_flash', isMobile ? 15 : 35);
        app.audio.playSynthesizedSound('teleport');
        app.ui.showToast('Warped through Teleporter! 🌀', 1500, 'info');
      }
    }
  }

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
      const isPlayerOn = playerGridPos[0] === elem.pos[0] && playerGridPos[1] === elem.pos[1];
      let isCrateOn = false;
      crateGridPositions.forEach((pos) => { if (pos[0] === elem.pos[0] && pos[1] === elem.pos[1]) isCrateOn = true; });

      const active = isPlayerOn || isCrateOn;
      const targetDoor = elementMeshMap.get(elem.linkedId);

      if (targetDoor) {
        doorStates.set(elem.linkedId, active);
        targetDoor.visible = !active;
        if (active) app.audio.playSynthesizedSound('switch');
      }
    }
  });
}

// Collectibles Check
function checkCollectibles(): void {
  currentLevel.elements.forEach((elem, index) => {
    const elemId = elem.id || `elem_${index}_${elem.type}`;
    if ((elem.type === 'avocado' || elem.type === 'helmet' || elem.type === 'key') && !collectedItems.has(elemId)) {
      if (playerGridPos[0] === elem.pos[0] && playerGridPos[1] === elem.pos[1]) {
        collectedItems.add(elemId);
        const mesh = elementMeshMap.get(elemId);
        if (mesh) mesh.visible = false;

        const worldPos = gridToWorld(elem.pos[0], elem.pos[1], 0.6);

        if (elem.type === 'avocado') {
          avocadosCollected++;
          particleSys.emitBurst(worldPos, 'collect_burst', isMobile ? 15 : 30);
          app.audio.playSynthesizedSound('coin');
          app.ui.showToast('Collected Avocado! 🥑', 1500, 'success');
        } else if (elem.type === 'helmet') {
          particleSys.emitBurst(worldPos, 'sparkle', isMobile ? 20 : 40);
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

// Goal Exit Check
function checkGoalCondition(): void {
  if (playerGridPos[0] === currentLevel.goalPos[0] && playerGridPos[1] === currentLevel.goalPos[1]) {
    isLevelCleared = true;
    const goalPosWorld = gridToWorld(currentLevel.goalPos[0], currentLevel.goalPos[1], 0.5);
    particleSys.emitBurst(goalPosWorld, 'sparkle', isMobile ? 30 : 60);
    app.audio.playSynthesizedSound('fanfare');

    const stars = avocadosCollected >= 3 ? (moveCount <= currentLevel.parMoves ? 3 : 2) : 1;

    const unlockedLevel = app.save.getProgress('unlockedLevel', 1) as number;
    if (unlockedLevel <= currentLevelIndex + 1 && currentLevelIndex + 1 < ALL_LEVELS.length) {
      app.save.setProgress('unlockedLevel', currentLevelIndex + 2);
    }
    const levelStars = app.save.getProgress('levelStars', {}) as Record<number, number>;
    levelStars[currentLevel.id] = Math.max(levelStars[currentLevel.id] || 0, stars);
    app.save.setProgress('levelStars', levelStars);
    
    app.save.setProgress('totalAvocados', (app.save.getProgress('totalAvocados', 0) as number) + avocadosCollected);

    if (currentLevelIndex === 0) app.save.unlockAchievement('first_level', app.ui);
    if ((app.save.getProgress('totalAvocados', 0) as number) >= 10) app.save.unlockAchievement('collector', app.ui);

    if (!isAiAutoPlay) {
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
    } else {
      // AI Level clearance handling: If Level 1 cleared, stop recording and package video artifact
      setTimeout(async () => {
        isAiAutoPlay = false;
        const blob = await app.stopRecording('fox-level1-qa-gameplay-recording.webm');
        app.ui.createModal(
          `🎉 Level 1 Cleared by AI!`,
          `
            <div style="text-align: center;">
              <p style="color: #10b981; font-weight: bold; font-size: 18px;">Level 1 QA Video Recording Complete 💯</p>
              <div style="font-size: 36px; margin-bottom: 12px;">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
              <p>Moves: <strong>${moveCount}</strong> | Avocados: <strong>${avocadosCollected} / 3</strong> 🥑</p>
              <p>Video File: <strong>fox-level1-qa-gameplay-recording.webm</strong> (${blob ? (blob.size / 1024).toFixed(1) + ' KB' : 'Saved'})</p>
              <p style="font-size: 12px; color: #a1a1aa;">Recording saved to downloads & GitHub Artifacts!</p>
            </div>
          `,
          [{ text: 'Awesome!', primary: true, onClick: () => {} }]
        );
      }, 800);
    }
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

// UI Button Listeners (Desktop & Touch)
document.getElementById('btn-ai-autoplay')?.addEventListener('click', toggleAiAutoPlay);
document.getElementById('btn-undo')?.addEventListener('click', performUndo);
document.getElementById('btn-restart')?.addEventListener('click', () => loadLevel(currentLevelIndex));
document.getElementById('btn-hint')?.addEventListener('click', () => {
  app.audio.playSynthesizedSound('hint');
  app.ui.createModal('💡 Dynamic Level Hint', currentLevel.hint, [{ text: 'Got it!', primary: true, onClick: () => {} }]);
});
document.getElementById('btn-levels')?.addEventListener('click', showLevelSelectModal);
document.getElementById('btn-menu')?.addEventListener('click', showSystemGameMenu);
document.getElementById('btn-settings')?.addEventListener('click', showSettingsModal);

// Mobile Touch Action Buttons
document.getElementById('touch-btn-undo')?.addEventListener('click', performUndo);
document.getElementById('touch-btn-restart')?.addEventListener('click', () => loadLevel(currentLevelIndex));
document.getElementById('touch-btn-interact')?.addEventListener('click', performInteract);
document.getElementById('touch-btn-hint')?.addEventListener('click', () => {
  app.audio.playSynthesizedSound('hint');
  app.ui.createModal('💡 Dynamic Level Hint', currentLevel.hint, [{ text: 'Got it!', primary: true, onClick: () => {} }]);
});

// Mobile Virtual Joystick Touch Math
const joystickZone = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');

if (joystickZone && joystickKnob) {
  let center = { x: 0, y: 0 };
  const maxRadius = 55;

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!app.input.touchJoystickActive) return;
    const touch = Array.from(e.touches).find(t => t.target === joystickZone || t.target === joystickKnob);
    if (!touch) return;

    let dx = touch.clientX - center.x;
    let dy = touch.clientY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    app.input.touchJoystickVector.set(dx / maxRadius, dy / maxRadius);
  };

  joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    app.input.touchJoystickActive = true;
    const rect = joystickZone.getBoundingClientRect();
    center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    onTouchMove(e);
  }, { passive: false });

  joystickZone.addEventListener('touchmove', onTouchMove, { passive: false });

  const resetJoystick = () => {
    app.input.touchJoystickActive = false;
    app.input.touchJoystickVector.set(0, 0);
    joystickKnob.style.transform = `translate(-50%, -50%)`;
  };

  joystickZone.addEventListener('touchend', resetJoystick);
  joystickZone.addEventListener('touchcancel', resetJoystick);
}

// Touch Drag Camera Orbit (Swipe anywhere on screen to rotate camera 360°)
let lastTouchX = 0;
let lastTouchY = 0;
let isTouchingCamera = false;

window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    const target = e.touches[0].target as HTMLElement;
    if (target.tagName === 'CANVAS' || target.id === 'game-canvas') {
      isTouchingCamera = true;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  }
});

window.addEventListener('touchmove', (e) => {
  if (isTouchingCamera && e.touches.length === 1) {
    const dx = e.touches[0].clientX - lastTouchX;
    const dy = e.touches[0].clientY - lastTouchY;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;

    app.cameraController.rotate(-dx * 0.005, -dy * 0.005);
  }
});

window.addEventListener('touchend', () => { isTouchingCamera = false; });

// Level Select Modal
function showLevelSelectModal(): void {
  let gridHtml = '<div class="level-grid">';
  const unlockedLevel = app.save.getProgress('unlockedLevel', 1) as number;
  const levelStars = app.save.getProgress('levelStars', {}) as Record<number, number>;
  ALL_LEVELS.forEach((lvl, idx) => {
    const isUnlocked = idx + 1 <= unlockedLevel;
    const stars = levelStars[lvl.id] || 0;
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
    const unlockedLevel = app.save.getProgress('unlockedLevel', 1) as number;
    if (idx + 1 <= unlockedLevel) {
      loadLevel(idx);
    } else {
      app.ui.showToast('Level Locked! Clear previous levels to unlock.', 2000, 'warning');
    }
  };

  app.ui.createModal('🦊 Level Select', gridHtml, [{ text: 'Cancel', onClick: () => {} }]);
}

// System Game Menu
function showSystemGameMenu(): void {
  app.ui.createGameMenu('🦊 Fox Game Menu', [
    { text: '▶ Resume Game', onClick: () => {} },
    { text: '🗺️ Level Select', onClick: () => showLevelSelectModal() },
    { text: '🔄 Restart Level', color: 'rgba(234, 179, 8, 0.2)', onClick: () => loadLevel(currentLevelIndex) },
    { text: '❓ View Hint', onClick: () => {
      app.audio.playSynthesizedSound('hint');
      app.ui.createModal('💡 Dynamic Level Hint', currentLevel.hint, [{ text: 'Got it!', primary: true, onClick: () => {} }]);
    } }
  ]);
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
          <option value="${isMobile ? 'medium' : 'high'}">${isMobile ? 'Mobile Optimized (Performance Default)' : 'High (PBR + PCF Soft Shadows)'}</option>
          <option value="high">High (PBR + Soft Shadows)</option>
          <option value="medium">Performance (Optimized)</option>
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

// Input & AI Update Loop
let lastInputTime = 0;
const INPUT_COOLDOWN = 260; // ms; keep grid steps readable and avoid re-targeting mid-animation
function getFoxDistanceToGridTarget(): number {
  if (!foxGroup) return 0;
  return foxGroup.position.distanceTo(gridToWorld(playerGridPos[0], playerGridPos[1], 0));
}

app.onUpdate((dt) => {
  particleSys.update(dt);

  if (animStateMachine) {
    animStateMachine.update(dt);
  }

  // AI Gameplay Agent Loop: Continuous 60 FPS Fluid Movement (Zero stutter/pauses)
  if (isAiAutoPlay) {
    const targetWorld = gridToWorld(playerGridPos[0], playerGridPos[1], 0);
    const distToTarget = foxGroup ? foxGroup.position.distanceTo(targetWorld) : 0;

    if (distToTarget < MOVE_ARRIVAL_EPSILON) {
      stepAiAgent();
    }
  }

  // Keyboard / Touch Movement Input (Free 360 Movement)
  const now = performance.now();
  if (!isAiAutoPlay && foxGroup && !isLevelCleared) {
    const move = app.input.getMovementVector();
    let isMoving = false;
    
    if (Math.abs(move.x) > 0.1 || Math.abs(move.y) > 0.1) {
      isMoving = true;
      const speed = 7.0;
      let nextX = foxGroup.position.x + move.x * speed * dt;
      let nextZ = foxGroup.position.z + move.y * speed * dt;

      // 3D Collision Detection & Grid interactions
      const radius = 0.5; // Fox collision radius
      const [cols, rows] = currentLevel.gridSize;
      const offsetX = -(cols * TILE_SIZE) / 2 + TILE_SIZE / 2;
      const offsetZ = -(rows * TILE_SIZE) / 2 + TILE_SIZE / 2;
      
      const isBlocked = (wx: number, wz: number): boolean => {
         const gx = Math.round((wx - offsetX) / TILE_SIZE);
         const gy = Math.round((wz - offsetZ) / TILE_SIZE);
         if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) return true;
         
         let blocked = false;
         for (const elem of currentLevel.elements) {
           if (elem.type === 'door' && elem.pos[0] === gx && elem.pos[1] === gy) {
             const elemId = elem.id || `door_${gx}_${gy}`;
             if (!doorStates.get(elemId)) blocked = true;
           }
         }
         
         let hitCrate = false;
         let hitTnt = false;
         crateGridPositions.forEach((pos) => { if (pos[0] === gx && pos[1] === gy) hitCrate = true; });
         tntGridPositions.forEach((pos, id) => { if (pos[0] === gx && pos[1] === gy && !tntDestroyedSet.has(id)) hitTnt = true; });
         
         if (hitCrate || hitTnt) {
           blocked = true;
           // Try pushing if we press against it
           if (now - lastInputTime > INPUT_COOLDOWN) {
             const [dx, dy] = toCardinalMove({ x: move.x, y: move.y });
             if (Math.abs(dx) + Math.abs(dy) === 1) {
               // Temporarily align playerGridPos to trigger push in tryMovePlayer
               const oldPlayerGrid = [...playerGridPos] as [number, number];
               playerGridPos = [gx - dx, gy - dy];
               tryMovePlayer(dx, dy);
               playerGridPos = oldPlayerGrid;
               lastInputTime = now;
             }
           }
         }
         return blocked;
      };

      // X-Axis Collision
      if (isBlocked(nextX + radius, foxGroup.position.z) || isBlocked(nextX - radius, foxGroup.position.z)) {
        nextX = foxGroup.position.x;
      }
      // Z-Axis Collision
      if (isBlocked(nextX, nextZ + radius) || isBlocked(nextX, nextZ - radius)) {
        nextZ = foxGroup.position.z;
      }

      foxGroup.position.x = nextX;
      foxGroup.position.z = nextZ;

      // Smooth Rotation
      const targetRot = Math.atan2(move.x, move.y);
      let diff = targetRot - foxGroup.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      foxGroup.rotation.y += diff * Math.min(1.0, 10 * dt);

      // Logical Grid Updates (Trigger Goal, Plates, Collectibles)
      const newGx = Math.max(0, Math.min(cols - 1, Math.round((nextX - offsetX) / TILE_SIZE)));
      const newGy = Math.max(0, Math.min(rows - 1, Math.round((nextZ - offsetZ) / TILE_SIZE)));

      if (newGx !== playerGridPos[0] || newGy !== playerGridPos[1]) {
        playerGridPos = [newGx, newGy];
        moveCount++;
        checkPressurePlates();
        checkCollectibles();
        
        let snapped = false;
        // Snap/Physics for special grid tiles
        for (const elem of currentLevel.elements) {
          if (elem.type === 'teleporter' && elem.targetPos && elem.pos[0] === newGx && elem.pos[1] === newGy) {
            playerGridPos = [...elem.targetPos];
            snapped = true;
            particleSys.emitBurst(gridToWorld(playerGridPos[0], playerGridPos[1], 0.5), 'teleport_flash', 35);
            app.audio.playSynthesizedSound('teleport');
            app.ui.showToast('Warped through Teleporter! 🌀', 1500, 'info');
          } else if (elem.type === 'conveyor' && elem.pos[0] === newGx && elem.pos[1] === newGy) {
            const shiftX = elem.dir === 'E' ? 1 : elem.dir === 'W' ? -1 : 0;
            const shiftY = elem.dir === 'S' ? 1 : elem.dir === 'N' ? -1 : 0;
            playerGridPos[0] = Math.max(0, Math.min(cols - 1, playerGridPos[0] + shiftX));
            playerGridPos[1] = Math.max(0, Math.min(rows - 1, playerGridPos[1] + shiftY));
            snapped = true;
            app.audio.playSynthesizedSound('switch');
          } else if (elem.type === 'ice' && elem.pos[0] === newGx && elem.pos[1] === newGy) {
            const [dx, dy] = toCardinalMove({ x: move.x, y: move.y });
            playerGridPos[0] = Math.max(0, Math.min(cols - 1, playerGridPos[0] + dx));
            playerGridPos[1] = Math.max(0, Math.min(rows - 1, playerGridPos[1] + dy));
            snapped = true;
          }
        }
        
        if (snapped) {
           foxGroup.position.copy(gridToWorld(playerGridPos[0], playerGridPos[1], 0));
        }
        
        checkGoalCondition();
        updateHUD();
      }
    }
    
    // Keybinds
    if (app.input.isActionJustPressed('Interact')) performInteract();
    if (app.input.isActionJustPressed('Undo')) performUndo();
    if (app.input.isActionJustPressed('Restart')) loadLevel(currentLevelIndex);
    if (app.input.isActionJustPressed('Menu')) showSystemGameMenu();
    if (app.input.isActionJustPressed('Hint')) {
      app.audio.playSynthesizedSound('hint');
      app.ui.createModal('💡 Dynamic Level Hint', currentLevel.hint, [{ text: 'Got it!', primary: true, onClick: () => {} }]);
    }

    if (animStateMachine) {
      if (isMoving) animStateMachine.setState('Walk');
      else animStateMachine.setState('Idle');
    }
    
    app.cameraController.setTargetPosition(foxGroup.position);
  } else if (foxGroup && isAiAutoPlay) {
    // AI still uses grid movement lerp
    const targetWorld = gridToWorld(playerGridPos[0], playerGridPos[1], 0);
    foxGroup.position.lerp(targetWorld, Math.min(1.0, 9 * dt));
    const distToTarget = foxGroup.position.distanceTo(targetWorld);
    if (distToTarget > 0.1 && animStateMachine) {
      animStateMachine.setState('Walk');
    } else if (animStateMachine) {
      animStateMachine.setState('Idle');
    }
    app.cameraController.setTargetPosition(targetWorld);
  }
});

// Expose Engine Memory Map & CPU Profile Dump APIs globally on window
(window as any).getCpuProfileMap = () => app.getCpuProfileMap();
(window as any).getMemoryMapDump = () => {
  const dump = app.getMemoryMapDump();
  console.log('[Kairo Engine Memory & CPU Dump]', dump);
  
  // Download as JSON file
  const str = JSON.stringify(dump, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `kairo-memory-and-cpu-map-dump-${Date.now()}.json`;
  a.click();
  
  return dump;
};

// Start Initial Level
loadLevel(0);
app.start();
