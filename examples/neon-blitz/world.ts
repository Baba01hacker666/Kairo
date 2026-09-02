import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

export const ARENA_HALF = 14;
const WALL_HEIGHT = 5;
const ARENA_R = ARENA_HALF;

export const PLAYER_SPAWN = new THREE.Vector3(0, 1.2, 8);

interface BoxSpec {
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
  color: number;
}

function buildBox(spec: BoxSpec, shadows: boolean): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(spec.width, spec.height, spec.depth),
    new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.4, metalness: 0.4 })
  );
  mesh.position.set(spec.x, spec.y, spec.z);
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  return mesh;
}

export function getRandomArenaPosition(clearance: number, height: number): THREE.Vector3 {
  return new THREE.Vector3(
    (Math.random() - 0.5) * (ARENA_R * 2 - clearance),
    height,
    (Math.random() - 0.5) * (ARENA_R * 2 - clearance)
  );
}

/**
 * Builds the neon arena, glowing orb player model, collectible orbs,
 * rotating spike hazards, floating crystals and the sparkle particle field.
 * Returns references the game loop needs to update each frame.
 */
export function buildWorld(app: KairoApp, shadows: boolean) {
  const scene = app.scene;

  // Ground
  const groundMesh = buildBox(
    { width: ARENA_R * 2 + 4, height: 1, depth: ARENA_R * 2 + 4, x: 0, y: -0.5, z: 0, color: 0x0a0a18 },
    shadows
  );
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
  const ground = app.createBox({
    size: [ARENA_R * 2 + 4, 1, ARENA_R * 2 + 4],
    position: [0, -0.5, 0],
    color: 0x0a0a18,
    physics: 'static',
  });
  ground.mesh.visible = false;

  const grid = new THREE.GridHelper(ARENA_R * 2, 28, 0x22d3ee, 0xa855f7);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.22;
  grid.position.y = 0.02;
  scene.add(grid);

  // Arena walls (physical boundaries + neon visuals)
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x05010f,
    emissive: 0x22d3ee,
    emissiveIntensity: 2.2,
    roughness: 0.4,
    metalness: 0.2,
  });
  const wallThickness = 1.0;
  const wallSpecs: BoxSpec[] = [
    { width: ARENA_R * 2 + wallThickness * 2, height: WALL_HEIGHT, depth: wallThickness, x: 0, y: WALL_HEIGHT / 2, z: ARENA_R + wallThickness / 2, color: 0x0e1030 },
    { width: ARENA_R * 2 + wallThickness * 2, height: WALL_HEIGHT, depth: wallThickness, x: 0, y: WALL_HEIGHT / 2, z: -ARENA_R - wallThickness / 2, color: 0x0e1030 },
    { width: wallThickness, height: WALL_HEIGHT, depth: ARENA_R * 2 + wallThickness * 2, x: ARENA_R + wallThickness / 2, y: WALL_HEIGHT / 2, z: 0, color: 0x0e1030 },
    { width: wallThickness, height: WALL_HEIGHT, depth: ARENA_R * 2 + wallThickness * 2, x: -ARENA_R - wallThickness / 2, y: WALL_HEIGHT / 2, z: 0, color: 0x0e1030 },
  ];
  for (const spec of wallSpecs) {
    scene.add(buildBox(spec, shadows));
    const wall = app.createBox({
      size: [spec.width, spec.height, spec.depth],
      position: [spec.x, spec.y, spec.z],
      color: spec.color,
      physics: 'static',
    });
    wall.mesh.visible = false;
  }

  // Neon top edges
  const neonSpecs: Array<[number, number, number, number]> = [
    [ARENA_R * 2 + wallThickness * 2, 0.5, 0, ARENA_R + wallThickness / 2],
    [ARENA_R * 2 + wallThickness * 2, 0.5, 0, -ARENA_R - wallThickness / 2],
    [0.5, ARENA_R * 2 + wallThickness * 2, ARENA_R + wallThickness / 2, 0],
    [0.5, ARENA_R * 2 + wallThickness * 2, -ARENA_R - wallThickness / 2, 0]
  ];
  for (const [width, depth, posX, posZ] of neonSpecs) {
    const neon = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), edgeMat);
    neon.position.set(posX, WALL_HEIGHT + 0.06, posZ);
    scene.add(neon);
  }

  // Corner pylons
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px = (ARENA_R - 2.5) * Math.cos(angle);
    const pz = (ARENA_R - 2.5) * Math.sin(angle);
    scene.add(buildBox({ width: 0.5, height: 7, depth: 0.5, x: px, y: 3.5, z: pz, color: 0x1e1b4b }, shadows));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), edgeMat);
    tip.position.set(px, 7.2, pz);
    scene.add(tip);
  }

  // Floating ornamental crystals
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x0a0420,
    emissive: 0x7c3aed,
    emissiveIntensity: 1.4,
    roughness: 0.3,
    metalness: 0.6,
    transparent: true,
    opacity: 0.9
  });
  const crystalGeometry = new THREE.OctahedronGeometry(0.9);
  const crystals: THREE.Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const crystal = new THREE.Mesh(crystalGeometry, crystalMat);
    const pos = getRandomArenaPosition(6, 6 + Math.random() * 8);
    crystal.position.copy(pos);
    scene.add(crystal);
    crystals.push(crystal);
  }

  // Player orb visuals
  const orbGroup = new THREE.Group();
  const orbMaterial = new THREE.MeshStandardMaterial({
    color: 0x05010f,
    emissive: 0x22d3ee,
    emissiveIntensity: 2.4,
    metalness: 0.7,
    roughness: 0.2
  });
  const orbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), orbMaterial);
  orbMesh.castShadow = shadows;
  orbGroup.add(orbMesh);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 32), glowMaterial);
  orbGroup.add(glowMesh);

  const orbLight = new THREE.PointLight(0x22d3ee, 16, 8);
  orbLight.position.y = 0.3;
  orbGroup.add(orbLight);
  scene.add(orbGroup);

  // Player physics body
  const player = app.createBox({
    size: [0.9, 0.9, 0.9],
    position: [PLAYER_SPAWN.x, PLAYER_SPAWN.y, PLAYER_SPAWN.z],
    color: 0x22d3ee,
    physics: 'dynamic',
    mass: 2
  });
  player.mesh.visible = false;

  // Collectible orbs
  const collectibleMaterial = new THREE.MeshStandardMaterial({
    color: 0x05010f,
    emissive: 0x34d399,
    emissiveIntensity: 2.0,
    metalness: 0.6,
    roughness: 0.2
  });
  const collectibleGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  const collectibles: Array<{ mesh: THREE.Mesh; active: boolean; respawnAt: number }> = [];
  for (let i = 0; i < 16; i++) {
    const mesh = new THREE.Mesh(collectibleGeometry, collectibleMaterial);
    mesh.position.copy(getRandomArenaPosition(4, 0.7));
    mesh.castShadow = shadows;
    scene.add(mesh);
    collectibles.push({ mesh, active: true, respawnAt: 0 });
  }

  // Rotating spike hazards
  const spikeMat = new THREE.MeshStandardMaterial({
    color: 0x1a0000,
    emissive: 0xff1a3a,
    emissiveIntensity: 2.2,
    roughness: 0.5
  });
  const hazardSpots: Array<[number, number, number, number]> = [
    [0, 0, 5, 0.8],
    [-6, -6, 4, 1.1],
    [6, -7, 4, 0.9],
    [-5, 6, 3.5, 1.2],
    [7, 5, 3, 1.0],
    [0, 0, 2, 0.6]
  ];
  const hazards: Array<{
    mesh: THREE.Group;
    centerX: number;
    centerZ: number;
    radius: number;
    speed: number;
    phase: number;
  }> = [];
  for (const [centerX, centerZ, radius, speed] of hazardSpots) {
    const group = new THREE.Group();
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), spikeMat);
    staff.position.y = 1.2;
    group.add(staff);
    for (let spikeIndex = 0; spikeIndex < 6; spikeIndex++) {
      const angle = (spikeIndex / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 8), spikeMat);
      spike.position.set(Math.cos(angle) * 0.6, 1.2, Math.sin(angle) * 0.6);
      spike.rotation.z = -Math.PI / 2;
      spike.rotation.y = angle;
      group.add(spike);
    }
    group.position.set(centerX, 0, centerZ);
    scene.add(group);
    hazards.push({ mesh: group, centerX, centerZ, radius, speed, phase: Math.random() * Math.PI * 2 });
  }

  return { scene, orbGroup, glowMesh, player, collectibles, hazards, crystals };
}

export type GameWorld = ReturnType<typeof buildWorld>;
