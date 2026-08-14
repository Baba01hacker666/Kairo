import * as THREE from 'three';
import { ShaderPresets, CustomShaderMaterial } from '@kairo/renderer';
import { createTree, createRock, createCloud } from '@kairo/geometry';

export class GroveWorld {
  public group: THREE.Group;
  public waterMaterial: CustomShaderMaterial;
  public shrineGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    // 1. Rolling Meadow Terrain
    const floorGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    const floorPosAttr = floorGeo.attributes.position;
    for (let i = 0; i < floorPosAttr.count; i++) {
      const x = floorPosAttr.getX(i);
      const y = floorPosAttr.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const height = Math.sin(x * 0.08) * Math.cos(y * 0.08) * 1.5 + (dist > 35 ? (dist - 35) * 0.15 : 0);
      floorPosAttr.setZ(i, height);
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.group.add(floorMesh);

    // 2. Procedural Water Pond
    this.waterMaterial = ShaderPresets.createWaterShader();
    this.waterMaterial.setUniform('u_shallowColor', { r: 0.2, g: 0.85, b: 0.95 }, 'color');
    this.waterMaterial.setUniform('u_deepColor', { r: 0.05, g: 0.3, b: 0.5 }, 'color');
    this.waterMaterial.setUniform('u_waveSpeed', 1.8, 'float');
    this.waterMaterial.setUniform('u_waveHeight', 0.08, 'float');

    const pondGeo = new THREE.CylinderGeometry(14, 14, 0.4, 32);
    const pondMesh = new THREE.Mesh(pondGeo, this.waterMaterial.toThreeMaterial());
    pondMesh.position.set(-18, 0.15, -12);
    pondMesh.receiveShadow = true;
    this.group.add(pondMesh);

    // 3. Pond Rocks & Stepping Stones
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const rx = -18 + Math.cos(angle) * 14.5;
      const rz = -12 + Math.sin(angle) * 14.5;
      const rock = createRock({
        position: [rx, 0.3, rz],
        scale: 0.8 + Math.sin(i * 3) * 0.3,
        color: 0x52796f
      });
      this.group.add(rock);
    }

    const stepPositions = [
      [-22, 0.35, -16],
      [-19, 0.35, -12],
      [-16, 0.35, -8],
      [-13, 0.35, -6]
    ];
    stepPositions.forEach(pos => {
      const step = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.4, 0.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x84a98c, roughness: 0.9 })
      );
      step.position.set(pos[0], pos[1], pos[2]);
      step.receiveShadow = true;
      step.castShadow = true;
      this.group.add(step);
    });

    // 4. Ancient Central Shrine & Great Tree
    this.shrineGroup = new THREE.Group();
    const dais = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 9, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 })
    );
    dais.position.y = 0.4;
    dais.receiveShadow = true;
    this.shrineGroup.add(dais);

    const greatTree = createTree({
      position: [0, 0.8, 0],
      scale: 2.8,
      trunkColor: 0x4a2e18,
      canopyColor: 0x2d6a4f,
      trunkHeight: 4.5,
      canopyRadius: 3.5
    });
    this.shrineGroup.add(greatTree);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const px = Math.cos(angle) * 6.5;
      const pz = Math.sin(angle) * 6.5;
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 4.0, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 })
      );
      pillar.position.set(px, 2.0, pz);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.shrineGroup.add(pillar);

      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.4, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })
      );
      cap.position.set(px, 4.2, pz);
      this.shrineGroup.add(cap);
    }
    this.group.add(this.shrineGroup);

    // 5. Forest Trees & Ambient Clouds
    const trees = [
      [12, 0, 15], [18, 0, 10], [25, 0, 20], [15, 0, -18], [28, 0, -10],
      [-10, 0, 22], [-24, 0, 18], [-32, 0, 8], [-28, 0, -25], [-12, 0, -35],
      [8, 0, -28], [32, 0, -25], [5, 0, 32], [-5, 0, 38], [22, 0, 32],
      [-35, 0, -8], [38, 0, 5], [0, 0, 42], [-18, 0, 35], [30, 0, -38]
    ];
    trees.forEach((pos, idx) => {
      const tree = createTree({
        position: [pos[0], pos[1], pos[2]],
        scale: 1.0 + (idx % 4) * 0.25,
        canopyColor: idx % 2 === 0 ? 0x2d6a4f : 0x40916c
      });
      this.group.add(tree);
    });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const cloud = createCloud({
        position: [Math.cos(angle) * 50, 24 + (i % 3) * 4, Math.sin(angle) * 50],
        scale: 2.2 + (i % 3) * 0.8,
        color: 0xffffff
      });
      this.group.add(cloud);
    }
  }

  public getTerrainHeight(x: number, z: number): number {
    const dist = Math.hypot(x, z);
    return Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.5 + (dist > 35 ? (dist - 35) * 0.15 : 0);
  }

  public update(dt: number, timeSeconds: number) {
    this.waterMaterial.update(dt, timeSeconds);
  }
}
