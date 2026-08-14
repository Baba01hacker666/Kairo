import * as THREE from 'three';
import { ShaderPresets, CustomShaderMaterial } from '@kairo/renderer';
import { createRockField, createCloudField } from '@kairo/geometry';

export class CrystalPeaksWorld {
  public group: THREE.Group;
  public iceMaterial: CustomShaderMaterial;
  public shrineGroup: THREE.Group;
  public crystalGeysers: Array<{ x: number; z: number; force: number }> = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.visible = false; // Hidden by default until Level 2 is loaded
    scene.add(this.group);

    // 1. Alpine Glacial Terrain
    const terrainGeo = new THREE.PlaneGeometry(180, 180, 52, 52);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const dist = Math.sqrt(x * x + y * y);

      // Mountain ridges, terraced plateau, and crystal canyon
      let height = Math.sin(x * 0.06) * Math.cos(y * 0.06) * 3.5;
      if (dist > 30) {
        height += (dist - 30) * 0.35 + Math.sin(x * 0.15) * 2.0;
      }
    // Canyon basin near center (local Y maps to world -Z after the -90deg X rotation,
    // so `y < 10 && y > -20` renders as `z > -10 && z < 20` in world space)
    if (Math.abs(x) < 14 && y < 10 && y > -20) {
      height = Math.min(height, 0.2);
    }
      posAttr.setZ(i, height);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.75,
      metalness: 0.25,
      flatShading: true
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.receiveShadow = true;
    this.group.add(terrainMesh);

    // 2. Reflective Frozen Ice Pond / Lake
    this.iceMaterial = ShaderPresets.createWaterShader();
    this.iceMaterial.setUniform('u_shallowColor', [0.3, 0.7, 0.95, 0.9], 'vec4');
    this.iceMaterial.setUniform('u_deepColor', [0.1, 0.2, 0.6, 0.98], 'vec4');
    this.iceMaterial.setUniform('u_waveSpeed', 0.6, 'float');
    this.iceMaterial.setUniform('u_waveHeight', 0.03, 'float');

    const iceLakeGeo = new THREE.CylinderGeometry(18, 18, 0.5, 32);
    const iceLake = new THREE.Mesh(iceLakeGeo, this.iceMaterial.toThreeMaterial());
    iceLake.position.set(0, 0.1, -8);
    iceLake.receiveShadow = true;
    this.group.add(iceLake);

    // 3. Glowing Amethyst & Sapphire Crystal Spires
    const crystalMatAmethyst = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.8
    });
    const crystalMatCyan = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
      roughness: 0.1,
      metalness: 0.8
    });

    const spireGeo = new THREE.ConeGeometry(0.8, 4.5, 6);
    const clusterCoords = [
      [-14, 0, -6], [14, 0, -10], [-22, 0, 15], [20, 0, 22],
      [-5, 0, 28], [6, 0, -26], [-28, 0, -18], [25, 0, -22]
    ];

    clusterCoords.forEach((coord, idx) => {
      const g = new THREE.Group();
      g.position.set(coord[0], 0, coord[2]);

      const mainSpire = new THREE.Mesh(spireGeo, idx % 2 === 0 ? crystalMatAmethyst : crystalMatCyan);
      mainSpire.position.y = 2.2;
      mainSpire.rotation.z = (Math.random() - 0.5) * 0.3;
      mainSpire.castShadow = true;
      g.add(mainSpire);

      // Smaller side crystals
      for (let s = 0; s < 3; s++) {
        const sideSpire = new THREE.Mesh(spireGeo, idx % 2 === 0 ? crystalMatCyan : crystalMatAmethyst);
        const angle = (s / 3) * Math.PI * 2;
        sideSpire.position.set(Math.cos(angle) * 0.7, 1.2, Math.sin(angle) * 0.7);
        sideSpire.scale.set(0.5, 0.5, 0.5);
        sideSpire.rotation.x = (Math.random() - 0.5) * 0.5;
        sideSpire.rotation.z = (Math.random() - 0.5) * 0.5;
        g.add(sideSpire);
      }

      const crystalLight = new THREE.PointLight(idx % 2 === 0 ? 0xc084fc : 0x38bdf8, 2.5, 14);
      crystalLight.position.y = 2.5;
      g.add(crystalLight);

      this.group.add(g);
    });

    // 4. Bouncy Thermal Crystal Geysers
    this.crystalGeysers = [
      { x: -12, z: 8, force: 18.0 },
      { x: 14, z: 6, force: 20.0 },
      { x: 0, z: -22, force: 22.0 },
      { x: -20, z: -12, force: 19.0 }
    ];

    const geyserRingGeo = new THREE.TorusGeometry(1.2, 0.3, 12, 24);
    const geyserMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 2.0
    });

    this.crystalGeysers.forEach(g => {
      const vent = new THREE.Mesh(geyserRingGeo, geyserMat);
      vent.rotation.x = Math.PI / 2;
      vent.position.set(g.x, 0.3, g.z);
      this.group.add(vent);
    });

    // 5. Alpine Rocks & Night Clouds
    const alpineRocks: Array<{ position: [number, number, number]; scale: number; color: number }> = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      alpineRocks.push({
        position: [Math.cos(angle) * 35, 1.5, Math.sin(angle) * 35],
        scale: 1.2 + Math.sin(i) * 0.5,
        color: 0x334155
      });
    }
    this.group.add(createRockField({ rocks: alpineRocks }));

    const auroraClouds: Array<{ position: [number, number, number]; scale: number; color: number }> = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      auroraClouds.push({
        position: [Math.cos(angle) * 55, 26 + (i % 3) * 5, Math.sin(angle) * 55],
        scale: 2.5 + (i % 3) * 0.8,
        color: 0x818cf8
      });
    }
    this.group.add(createCloudField({ clouds: auroraClouds }));

    // 6. Central Moon Altar & Celestial Gateway
    this.shrineGroup = new THREE.Group();
    const altarBase = new THREE.Mesh(
      new THREE.CylinderGeometry(5.0, 5.5, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.85 })
    );
    altarBase.position.set(0, 0.6, 12);
    altarBase.receiveShadow = true;
    this.shrineGroup.add(altarBase);

    const moonCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.4),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 2.5,
        roughness: 0.1
      })
    );
    moonCrystal.position.set(0, 3.2, 12);
    this.shrineGroup.add(moonCrystal);

    this.group.add(this.shrineGroup);
  }

  public getTerrainHeight(x: number, z: number): number {
    const dist = Math.sqrt(x * x + z * z);
    let h = Math.sin(x * 0.06) * Math.cos(z * 0.06) * 3.5;
    if (dist > 30) {
      h += (dist - 30) * 0.35 + Math.sin(x * 0.15) * 2.0;
    }
    // Keep collision identical to the rendered mesh (see constructor comment):
    // the canyon region in world space is |x| < 14 && -10 < z < 20.
    if (Math.abs(x) < 14 && z > -10 && z < 20) {
      h = Math.min(h, 0.2);
    }
    return Math.max(0, h);
  }

  public checkGeyserBounce(playerPos: THREE.Vector3, now: number, onBounce: (force: number) => void): boolean {
    for (const g of this.crystalGeysers) {
      const d = Math.hypot(playerPos.x - g.x, playerPos.z - g.z);
      if (d < 1.6 && playerPos.y < 2.0) {
        onBounce(g.force);
        return true;
      }
    }
    return false;
  }

  public update(dt: number, timeSeconds: number) {
    if (!this.group.visible) return;
    this.iceMaterial.update(dt, timeSeconds);

    if (this.shrineGroup.children[1]) {
      this.shrineGroup.children[1].rotation.y += dt * 1.2;
      this.shrineGroup.children[1].position.y = 3.2 + Math.sin(timeSeconds * 2.5) * 0.3;
    }
  }
}
