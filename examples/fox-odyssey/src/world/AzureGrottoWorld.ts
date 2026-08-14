import * as THREE from 'three';
import { ShaderPresets, CustomShaderMaterial } from '@kairo/renderer';
import { createRockField } from '@kairo/geometry';

export class AzureGrottoWorld {
  public group: THREE.Group;
  public waterMaterial: CustomShaderMaterial;
  public shrineGroup: THREE.Group;
  public waterPonds: Array<{ x: number; z: number; radius: number }> = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.visible = false; // Hidden until Act II / Level 3 is active
    scene.add(this.group);

    // 1. Subterranean Cavern Basin & Terraces
    const grottoGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    const posAttr = grottoGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const dist = Math.sqrt(x * x + y * y);

      // Deep subterranean grotto basin with tiered rock ledges
      let h = Math.sin(x * 0.08) * Math.sin(y * 0.08) * 2.2;
      if (dist > 28) {
        h += (dist - 28) * 0.4 + Math.sin(x * 0.2) * 1.5;
      }
      // Central deep waterfall reservoir
      if (dist < 16) {
        h = Math.min(h, -0.4);
      }
      posAttr.setZ(i, h);
    }
    grottoGeo.computeVertexNormals();

    const grottoMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate/cyan cave stone
      roughness: 0.85,
      metalness: 0.2,
      flatShading: true
    });
    const grottoMesh = new THREE.Mesh(grottoGeo, grottoMat);
    grottoMesh.rotation.x = -Math.PI / 2;
    grottoMesh.receiveShadow = true;
    this.group.add(grottoMesh);

    // 2. Animated Subterranean Azure Lagoon & Waterfall Reservoir
    this.waterMaterial = ShaderPresets.createWaterShader();
    this.waterMaterial.setUniform('u_shallowColor', [0.15, 0.75, 0.95, 0.9], 'vec4');
    this.waterMaterial.setUniform('u_deepColor', [0.03, 0.25, 0.55, 0.98], 'vec4');
    this.waterMaterial.setUniform('u_waveSpeed', 2.0, 'float');
    this.waterMaterial.setUniform('u_waveHeight', 0.06, 'float');

    const pondGeo = new THREE.CylinderGeometry(16, 16, 0.5, 32);
    const pondMesh = new THREE.Mesh(pondGeo, this.waterMaterial.toThreeMaterial());
    pondMesh.position.set(0, -0.1, 0);
    pondMesh.receiveShadow = true;
    this.group.add(pondMesh);

    this.waterPonds.push({ x: 0, z: 0, radius: 15.5 });

    // 3. Glowing Bioluminescent Cavern Mushrooms & Aquatic Crystals
    const crystalAquaMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    const shroomCapGeo = new THREE.ConeGeometry(0.8, 0.6, 10);
    const shroomStemGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.2, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 });

    const clusterPositions: [number, number, number][] = [
      [-14, 0.6, -12],
      [16, 0.6, 10],
      [-18, 0.8, 14],
      [12, 0.6, -16],
      [-6, 0.4, 20],
      [8, 0.4, 22]
    ];

    clusterPositions.forEach(([cx, cy, cz]) => {
      const g = new THREE.Group();
      g.position.set(cx, cy, cz);

      const stem = new THREE.Mesh(shroomStemGeo, stemMat);
      stem.position.y = 0.6;
      g.add(stem);

      const cap = new THREE.Mesh(shroomCapGeo, crystalAquaMat);
      cap.position.y = 1.3;
      g.add(cap);

      const light = new THREE.PointLight(0x38bdf8, 2.0, 10);
      light.position.set(0, 1.5, 0);
      g.add(light);

      this.group.add(g);
    });

    // 4. Stepping Lily Pads Across Water Reservoir
    const lilyGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.25, 12);
    const lilyMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7 });

    const lilyCoords = [
      [-10, 0.1, -6],
      [-5, 0.1, -2],
      [0, 0.1, 3],
      [5, 0.1, -1],
      [10, 0.1, -5]
    ];

    lilyCoords.forEach(([lx, ly, lz]) => {
      const lily = new THREE.Mesh(lilyGeo, lilyMat);
      lily.position.set(lx, ly, lz);
      lily.receiveShadow = true;
      this.group.add(lily);
    });

    // 5. Grotto Rocks Formation
    const grottoRocks: Array<{ position: [number, number, number]; scale: number; color: number }> = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      grottoRocks.push({
        position: [Math.cos(angle) * 17.5, 0.5, Math.sin(angle) * 17.5],
        scale: 1.0 + Math.sin(i * 2) * 0.4,
        color: 0x1e293b
      });
    }
    this.group.add(createRockField({ rocks: grottoRocks }));

    // 6. Central Sunken Aqueduct Shrine
    this.shrineGroup = new THREE.Group();
    const altar = new THREE.Mesh(
      new THREE.CylinderGeometry(4.0, 4.5, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    altar.position.set(0, 0.4, 16);
    this.shrineGroup.add(altar);

    const aquaCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.1),
      crystalAquaMat
    );
    aquaCore.position.set(0, 2.5, 16);
    this.shrineGroup.add(aquaCore);

    this.group.add(this.shrineGroup);
  }

  public getTerrainHeight(x: number, z: number): number {
    const dist = Math.sqrt(x * x + z * z);
    // The terrain plane is rotated -90deg about X, so its local Y maps to world -Z.
    // The mesh uses Math.sin(localY) which is -Math.sin(worldZ) — mirror the sign
    // so collision heights match the rendered geometry instead of being flipped.
    let h = Math.sin(x * 0.08) * Math.sin(-z * 0.08) * 2.2;
    if (dist > 28) {
      h += (dist - 28) * 0.4 + Math.sin(x * 0.2) * 1.5;
    }
    if (dist < 16) {
      // Reservoir surface
      return 0.1;
    }
    return Math.max(0, h);
  }

  public update(dt: number, timeSeconds: number) {
    if (!this.group.visible) return;
    this.waterMaterial.update(dt, timeSeconds);

    if (this.shrineGroup.children[1]) {
      this.shrineGroup.children[1].rotation.y += dt * 1.5;
      this.shrineGroup.children[1].position.y = 2.5 + Math.sin(timeSeconds * 3) * 0.25;
    }
  }
}
