import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KairoApp } from '@kairo/core';
import { DustParticles } from './scene/Particles';
import { AnimationStateMachine } from '@kairo/animation';
import { ParticleSystem } from '@kairo/renderer';
import { MemoryManager } from '@kairo/assets';
import { Serializer } from '@kairo/core';
import { ALL_LEVELS, LevelDefinition, LevelElement, WORLD_NAMES } from './levels.ts';
import { MOVE_ARRIVAL_EPSILON, canAcceptMoveInput, toCardinalMove } from './movement.ts';
import { globalSketchfabStreamer, PRESET_MODEL_STREAMS } from './sketchfab.ts';

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
const laserBeamsGroup = new THREE.Group();
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

let dustParticles: DustParticles;

// Initialize Kairo App Engine
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
  app.renderer.setPixelRatio(1.0);
}

// Camera Setup: Third-Person Perspective
app.cameraController.yaw = Math.PI;
app.cameraController.pitch = 0.45;
app.cameraController.distance = 7.5;
app.cameraController.heightOffset = 1.6;

app.scene.add(levelObjectsGroup);
app.scene.add(laserBeamsGroup);
app.scene.add(particleSys.mesh);

dustParticles = new DustParticles(app.scene, 100);

// Load 3D Models
const gltfLoader = new GLTFLoader();

function getAssetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '');
  if (typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const depth = parts.length > 1 && parts.includes('examples') ? parts.indexOf('examples') + 1 : 0;
    const prefix = depth > 0 ? '../'.repeat(parts.length - depth) : './';
    return prefix + clean;
  }
  return '/' + clean;
}

let avocadoTemplate: THREE.Group | null = null;
let helmetTemplate: THREE.Group | null = null;

// Load Fox Model & Skeletal Animations
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
    console.log('✅ Loaded default Fox.glb model');
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

// Map grid coordinates to 3D world position
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

  // Instanced Boundary Outer Walls
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

    if (elem.type === 'wall') {
      const innerWallMesh = new THREE.Mesh(
        new THREE.BoxGeometry(TILE_SIZE * 0.98, 2.0, TILE_SIZE * 0.98),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.2 })
      );
      innerWallMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 1.0));
      innerWallMesh.castShadow = !isMobile;
      innerWallMesh.receiveShadow = !isMobile;
      levelObjectsGroup.add(innerWallMesh);
      elementMeshMap.set(elemId, innerWallMesh);

    } else if (elem.type === 'crate') {
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

    } else if (elem.type === 'laser_source') {
      const sourceMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 0.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xb45309, emissiveIntensity: 0.4 })
      );
      sourceMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.4));
      levelObjectsGroup.add(sourceMesh);
      elementMeshMap.set(elemId, sourceMesh);

    } else if (elem.type === 'laser_target') {
      const targetMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.12, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.6 })
      );
      targetMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.5));
      levelObjectsGroup.add(targetMesh);
      elementMeshMap.set(elemId, targetMesh);

    } else if (elem.type === 'rotating_bridge') {
      const bridgeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(TILE_SIZE * 0.9, 0.2, TILE_SIZE * 0.9),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      bridgeMesh.position.copy(gridToWorld(elem.pos[0], elem.pos[1], 0.1));
      bridgeMesh.rotation.y = ((elem.rotation || 0) * Math.PI) / 180;
      levelObjectsGroup.add(bridgeMesh);
      elementMeshMap.set(elemId, bridgeMesh);
    }
  });

  updateLasers();
  updateHUD();
}

// Dynamic Laser Beam Raytracing System
function updateLasers(): void {
  MemoryManager.disposeHierarchy(laserBeamsGroup);
  while (laserBeamsGroup.children.length > 0) {
    laserBeamsGroup.remove(laserBeamsGroup.children[0]);
  }

  const [cols, rows] = currentLevel.gridSize;

  currentLevel.elements.forEach((elem, index) => {
    if (elem.type === 'laser_source') {
      let currX = elem.pos[0];
      let currY = elem.pos[1];

      // Laser direction vector (0: East [1,0], 90: South [0,1], 180: West [-1,0], 270: North [0,-1])
      const rot = elem.rotation || 0;
      let dirX = rot === 0 ? 1 : rot === 180 ? -1 : 0;
      let dirY = rot === 90 ? 1 : rot === 270 ? -1 : 0;

      for (let step = 0; step < Math.max(cols, rows) * 2; step++) {
        const nextX = currX + dirX;
        const nextY = currY + dirY;

        if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) break;

        // Render laser segment
        const startPos = gridToWorld(currX, currY, 0.5);
        const endPos = gridToWorld(nextX, nextY, 0.5);
        const distance = startPos.distanceTo(endPos);

        const beamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, distance, 8);
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);

        beamMesh.position.copy(startPos.clone().add(endPos).multiplyScalar(0.5));
        beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endPos.clone().sub(startPos).normalize());
        laserBeamsGroup.add(beamMesh);

        currX = nextX;
        currY = nextY;

        // Laser reflection / hit detection
        let hitObject = false;
        for (const targetElem of currentLevel.elements) {
          if (targetElem.pos[0] === currX && targetElem.pos[1] === currY) {
            const elemId = targetElem.id || `elem_${index}_${targetElem.type}`;

            if (targetElem.type === 'mirror') {
              const mRot = mirrorRotations.get(elemId) ?? (targetElem.rotation || 0);
              if (mRot === 45 || mRot === 225) {
                const temp = dirX;
                dirX = dirY;
                dirY = temp;
              } else {
                const temp = dirX;
                dirX = -dirY;
                dirY = -temp;
              }
            } else if (targetElem.type === 'laser_target') {
              doorStates.set(targetElem.linkedId || '', true);
              const targetMesh = elementMeshMap.get(elemId);
              if (targetMesh && (targetMesh as THREE.Mesh).material) {
                ((targetMesh as THREE.Mesh).material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);
              }
              hitObject = true;
            } else if (targetElem.type === 'wall' || targetElem.type === 'crate' || (targetElem.type === 'door' && !doorStates.get(elemId))) {
              hitObject = true;
            }
          }
        }

        if (hitObject) break;
      }
    }
  });
}

// Load Level State
function loadLevel(levelIndex: number): void {
  currentLevelIndex = Math.max(0, Math.min(ALL_LEVELS.length - 1, levelIndex));
  currentLevel = ALL_LEVELS[currentLevelIndex];

  playerGridPos = [...currentLevel.startPos];
  moveCount = 0;
  avocadosCollected = 0;
  isLevelCleared = false;

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
        const newRot = (currentRot + 45) % 360;
        mirrorRotations.set(elemId, newRot);

        const mirrorMesh = elementMeshMap.get(elemId);
        if (mirrorMesh) {
          mirrorMesh.rotation.y = (newRot * Math.PI) / 180;
        }
        app.audio.playSynthesizedSound('switch');
        app.ui.showToast(`Rotated ${elem.type === 'prism' ? 'Prism' : 'Mirror'} to ${newRot}°! 🔄`, 1500, 'info');
        rotatedAny = true;
        updateLasers();
      }
    }
  });

  if (!rotatedAny) {
    app.ui.showToast('Nothing nearby to interact with!', 1500, 'info');
  }
}

let isManualRecording = false;
function toggleManualRecording(): void {
  const btn = document.getElementById('btn-record');
  if (!isManualRecording) {
    if (app.startRecording(60)) {
      isManualRecording = true;
      app.ui.showToast('🎥 Recording Started', 2000, 'info');
      if (btn) {
        btn.innerText = '⏹️ Stop Rec';
        btn.style.borderColor = '#ef4444';
        btn.style.background = 'rgba(239, 68, 68, 0.2)';
      }
    } else {
      app.ui.showToast('❌ Failed to start recording. Ensure MediaRecorder is supported.', 2500, 'warning');
    }
  } else {
    isManualRecording = false;
    app.stopRecording(`kairo-gameplay-${Date.now()}.webm`).then((blob) => {
      if (blob) {
        app.ui.showToast('✅ Recording Saved to Downloads', 3000, 'success');
      }
    });

    if (btn) {
      btn.innerText = '🎥 Record';
      btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      btn.style.background = 'rgba(255, 255, 255, 0.1)';
    }
  }
}

// Update Fox position & Camera target smoothly
function updatePlayerPositionVisuals(instant: boolean = false): void {
  if (!foxGroup) return;

  const targetWorldPos = gridToWorld(playerGridPos[0], playerGridPos[1], 0);
  if (instant) {
    foxGroup.position.copy(targetWorldPos);
  } else {
    // Smooth lerp visual position towards grid target
    foxGroup.position.lerp(targetWorldPos, 0.35);
  }

  app.cameraController.setTargetPosition(foxGroup.position);
}

// Grid Cell Blocking Helper (Precise AABB overlap check)
function isGridCellBlocked(gx: number, gy: number): boolean {
  const [cols, rows] = currentLevel.gridSize;
  if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) return true;

  for (const elem of currentLevel.elements) {
    if (elem.type === 'wall' && elem.pos[0] === gx && elem.pos[1] === gy) return true;
    if (elem.type === 'door' && elem.pos[0] === gx && elem.pos[1] === gy) {
      const elemId = elem.id || `door_${gx}_${gy}`;
      if (!doorStates.get(elemId)) return true;
    }
  }

  let blocked = false;
  crateGridPositions.forEach((pos) => { if (pos[0] === gx && pos[1] === gy) blocked = true; });
  tntGridPositions.forEach((pos, id) => { if (pos[0] === gx && pos[1] === gy && !tntDestroyedSet.has(id)) blocked = true; });

  return blocked;
}

// Grid Movement Logic
function tryMovePlayer(dx: number, dy: number): void {
  if (isLevelCleared || (dx === 0 && dy === 0)) return;

  const targetX = playerGridPos[0] + dx;
  const targetY = playerGridPos[1] + dy;

  const [cols, rows] = currentLevel.gridSize;
  if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) return;

  // Check Walls / Inner Obstacles
  for (const elem of currentLevel.elements) {
    if (elem.type === 'wall' && elem.pos[0] === targetX && elem.pos[1] === targetY) return;
    if (elem.type === 'door' && elem.pos[0] === targetX && elem.pos[1] === targetY) {
      const elemId = elem.id || `door_${elem.pos[0]}_${elem.pos[1]}`;
      if (!doorStates.get(elemId)) {
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

    if (isGridCellBlocked(crateNextX, crateNextY)) return;

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

  // Move player to target grid position
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
    if (slideX >= 0 && slideX < cols && slideY >= 0 && slideY < rows && !isGridCellBlocked(slideX, slideY)) {
      playerGridPos = [slideX, slideY];
    }
  }

  // Handle Conveyor belts
  for (const elem of currentLevel.elements) {
    if (elem.type === 'conveyor' && elem.pos[0] === playerGridPos[0] && elem.pos[1] === playerGridPos[1]) {
      const shiftX = elem.dir === 'E' ? 1 : elem.dir === 'W' ? -1 : 0;
      const shiftY = elem.dir === 'S' ? 1 : elem.dir === 'N' ? -1 : 0;
      const convX = Math.max(0, Math.min(cols - 1, playerGridPos[0] + shiftX));
      const convY = Math.max(0, Math.min(rows - 1, playerGridPos[1] + shiftY));
      if (!isGridCellBlocked(convX, convY)) {
        playerGridPos = [convX, convY];
        app.audio.playSynthesizedSound('switch');
      }
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
  currentLevel.elements.forEach((elem) => {
    if (elem.type === 'plate' && elem.linkedId) {
      const isPlayerOn = playerGridPos[0] === elem.pos[0] && playerGridPos[1] === elem.pos[1];
      let isCrateOn = false;
      crateGridPositions.forEach((pos) => { if (pos[0] === elem.pos[0] && pos[1] === elem.pos[1]) isCrateOn = true; });

      const active = isPlayerOn || isCrateOn;
      const targetMesh = elementMeshMap.get(elem.linkedId);

      if (targetMesh) {
        doorStates.set(elem.linkedId, active);
        if (elem.linkedId.startsWith('bridge')) {
          targetMesh.rotation.y = active ? Math.PI / 2 : 0;
        } else {
          targetMesh.visible = !active;
        }
        if (active) app.audio.playSynthesizedSound('switch');
      }
    }
  });

  updateLasers();
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

// Sketchfab & 3D Model Streamer Modal
function showSketchfabStreamerModal(): void {
  let gridHtml = `
    <div style="margin-bottom: 16px;">
      <p style="font-size: 13px; color: #a1a1aa; margin-bottom: 12px;">
        Stream high quality 3D character models directly from Sketchfab or remote GLTF repositories!
      </p>
      
      <div style="display: flex; gap: 8px; margin-bottom: 20px;">
        <input id="sketchfab-url-input" type="text" placeholder="Paste Sketchfab URL or direct .glb link..." 
          style="flex: 1; padding: 10px 14px; border-radius: 10px; background: #18181b; border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 13px;">
        <button id="btn-stream-custom" style="padding: 10px 16px; border-radius: 10px; background: linear-gradient(135deg, #3b82f6, #10b981); border: none; color: white; font-weight: 700; cursor: pointer;">
          🚀 Stream
        </button>
      </div>

      <div style="font-weight: 700; font-size: 14px; margin-bottom: 10px;">Curated Stream Catalog</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
  `;

  PRESET_MODEL_STREAMS.forEach((preset) => {
    gridHtml += `
      <div class="level-card" onclick="window.streamPresetModel('${preset.id}')" style="align-items: flex-start; text-align: left; padding: 14px;">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 6px;">
          <span style="font-weight: 800; font-size: 14px;">${preset.name}</span>
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 6px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700;">${preset.badge}</span>
        </div>
        <div style="font-size: 11px; color: #a1a1aa; margin-bottom: 6px;">By ${preset.author}</div>
        <div style="font-size: 11px; color: #e4e4e7;">${preset.description}</div>
      </div>
    `;
  });

  gridHtml += `</div></div>`;

  (window as any).streamPresetModel = (presetId: string) => {
    const preset = PRESET_MODEL_STREAMS.find(p => p.id === presetId);
    if (preset) {
      loadStreamedCharacterModel(preset.url, preset.name);
    }
  };

  app.ui.createModal('🎨 Sketchfab & 3D Model Streamer', gridHtml, [{ text: 'Close', onClick: () => {} }]);

  setTimeout(() => {
    document.getElementById('btn-stream-custom')?.addEventListener('click', () => {
      const inputEl = document.getElementById('sketchfab-url-input') as HTMLInputElement;
      if (inputEl && inputEl.value.trim()) {
        loadStreamedCharacterModel(inputEl.value.trim(), 'Custom Stream');
      } else {
        app.ui.showToast('Please enter a valid Sketchfab URL or .glb link!', 2000, 'warning');
      }
    });
  }, 100);
}

// Load streamed character model into Fox scene
async function loadStreamedCharacterModel(urlOrUid: string, name: string): Promise<void> {
  app.ui.showToast(`⌛ Streaming 3D model: ${name}...`, 4000, 'info');

  try {
    const streamed = await globalSketchfabStreamer.loadStreamedModel(urlOrUid, (progress) => {
      app.ui.showToast(`⌛ Streaming ${name} (${progress}%)...`, 1000, 'info');
    });

    installFoxModel(streamed.scene, true);

    if (streamed.animations.length > 0) {
      animStateMachine = new AnimationStateMachine(streamed.scene);
      animStateMachine.registerState('Idle', streamed.animations[0], { fadeDuration: 0.2 });
      if (streamed.animations[1]) animStateMachine.registerState('Walk', streamed.animations[1], { fadeDuration: 0.15 });
      if (streamed.animations[2]) animStateMachine.registerState('Run', streamed.animations[2], { fadeDuration: 0.15 });
      animStateMachine.setState('Idle');
    } else {
      animStateMachine = null;
    }

    particleSys.emitBurst(foxGroup?.position || new THREE.Vector3(), 'sparkle', 40);
    app.audio.playSynthesizedSound('fanfare');
    app.ui.showToast(`✅ Successfully streamed 3D model: ${streamed.name}!`, 3500, 'success');
  } catch (err: any) {
    console.error('Error streaming 3D model:', err);
    app.ui.showToast(`❌ Could not stream model: ${err.message || err}`, 3500, 'warning');
  }
}

// UI Button Listeners
document.getElementById('btn-record')?.addEventListener('click', toggleManualRecording);
document.getElementById('btn-sketchfab')?.addEventListener('click', showSketchfabStreamerModal);
document.getElementById('btn-undo')?.addEventListener('click', performUndo);
document.getElementById('btn-restart')?.addEventListener('click', () => loadLevel(currentLevelIndex));
document.getElementById('btn-hint')?.addEventListener('click', () => {
  app.audio.playSynthesizedSound('hint');
  app.ui.createModal('💡 Dynamic Level Hint', currentLevel.hint, [{ text: 'Got it!', primary: true, onClick: () => {} }]);
});
document.getElementById('btn-levels')?.addEventListener('click', showLevelSelectModal);
document.getElementById('btn-menu')?.addEventListener('click', showSystemGameMenu);
document.getElementById('btn-settings')?.addEventListener('click', showSettingsModal);

// Speed-dial toggle
const speedDialToggle = document.getElementById('speed-dial-toggle');
const speedDialGroup = document.getElementById('speed-dial-group');
speedDialToggle?.addEventListener('click', () => {
  speedDialToggle.classList.toggle('open');
  speedDialGroup?.classList.toggle('open');
});
speedDialGroup?.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    speedDialToggle?.classList.remove('open');
    speedDialGroup?.classList.remove('open');
  });
});

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

// Touch Drag Camera Orbit
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
    { text: '🎨 3D Model Streamer', onClick: () => showSketchfabStreamerModal() },
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
const INPUT_COOLDOWN = 220; // ms

app.onUpdate((dt) => {
  particleSys.update(dt);

  if (animStateMachine) {
    animStateMachine.update(dt);
  }
  if (dustParticles) {
    dustParticles.update(dt);
  }

  // Keyboard / Touch Movement Input (Free 360 Movement with smooth grid synchronization)
  const now = performance.now();
  if (foxGroup && !isLevelCleared) {
    const move = app.input.getMovementVector();
    let isMoving = false;

    if (Math.abs(move.x) > 0.1 || Math.abs(move.y) > 0.1) {
      isMoving = true;
      const speed = 6.5;

      const [cols, rows] = currentLevel.gridSize;
      const offsetX = -(cols * TILE_SIZE) / 2 + TILE_SIZE / 2;
      const offsetZ = -(rows * TILE_SIZE) / 2 + TILE_SIZE / 2;

      let nextX = foxGroup.position.x + move.x * speed * dt;
      let nextZ = foxGroup.position.z + move.y * speed * dt;

      // Player radius in grid units (~0.25 grid cell width)
      const rGrid = 0.22;
      const gridX = (nextX - offsetX) / TILE_SIZE;
      const gridZ = (nextZ - offsetZ) / TILE_SIZE;

      // Collision checks with precise cell bounding box overlap
      let blockedX = false;
      let blockedZ = false;

      const currGridX = (foxGroup.position.x - offsetX) / TILE_SIZE;
      const currGridZ = (foxGroup.position.z - offsetZ) / TILE_SIZE;

      for (let cx = Math.floor(gridX - 1); cx <= Math.ceil(gridX + 1); cx++) {
        for (let cy = Math.floor(gridZ - 1); cy <= Math.ceil(gridZ + 1); cy++) {
          if (isGridCellBlocked(cx, cy)) {
            // Check horizontal collision
            if (Math.abs(gridX - cx) < 0.5 + rGrid && Math.abs(currGridZ - cy) < 0.5 + rGrid) {
              blockedX = true;
              // Check crate/TNT push trigger
              if (now - lastInputTime > INPUT_COOLDOWN) {
                const [cardX, cardY] = toCardinalMove({ x: move.x, y: move.y });
                if (cardX !== 0 || cardY !== 0) {
                  tryMovePlayer(cardX, cardY);
                  lastInputTime = now;
                }
              }
            }
            // Check vertical collision
            if (Math.abs(currGridX - cx) < 0.5 + rGrid && Math.abs(gridZ - cy) < 0.5 + rGrid) {
              blockedZ = true;
              if (now - lastInputTime > INPUT_COOLDOWN) {
                const [cardX, cardY] = toCardinalMove({ x: move.x, y: move.y });
                if (cardX !== 0 || cardY !== 0) {
                  tryMovePlayer(cardX, cardY);
                  lastInputTime = now;
                }
              }
            }
          }
        }
      }

      if (!blockedX) foxGroup.position.x = nextX;
      if (!blockedZ) foxGroup.position.z = nextZ;

      // Smooth Character Facing Rotation
      const targetRot = Math.atan2(move.x, move.y);
      let diff = targetRot - foxGroup.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      foxGroup.rotation.y += diff * Math.min(1.0, 12 * dt);

      // Logical Grid Position Updates (Trigger Goals, Plates, Collectibles)
      const newGx = Math.max(0, Math.min(cols - 1, Math.round((foxGroup.position.x - offsetX) / TILE_SIZE)));
      const newGy = Math.max(0, Math.min(rows - 1, Math.round((foxGroup.position.z - offsetZ) / TILE_SIZE)));

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
            const convX = Math.max(0, Math.min(cols - 1, playerGridPos[0] + shiftX));
            const convY = Math.max(0, Math.min(rows - 1, playerGridPos[1] + shiftY));
            if (!isGridCellBlocked(convX, convY)) {
              playerGridPos = [convX, convY];
              snapped = true;
              app.audio.playSynthesizedSound('switch');
            }
          }
        }

        if (snapped) {
          foxGroup.position.copy(gridToWorld(playerGridPos[0], playerGridPos[1], 0));
        }

        checkGoalCondition();
        updateHUD();
      }
    } else {
      // Idle state: smoothly align fox position visually to target grid cell center
      updatePlayerPositionVisuals(false);
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
      if (isMoving) {
        animStateMachine.setState('Walk');
        dustParticles.emit(foxGroup.position.x, 0, foxGroup.position.z);
      } else {
        animStateMachine.setState('Idle');
      }
    }

    app.cameraController.setTargetPosition(foxGroup.position);
  }
});

// Expose Engine Memory Map & CPU Profile Dump APIs globally on window
(window as any).getCpuProfileMap = () => app.getCpuProfileMap();
(window as any).getMemoryMapDump = () => {
  const dump = app.getMemoryMapDump();
  console.log('[Kairo Engine Memory & CPU Dump]', dump);

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
