import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
import { GameState } from '../state.ts';

export interface SunAcorn {
  id: number;
  mesh: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
  baseY: number;
  spinSpeed: number;
}

export class AcornManager {
  public acorns: SunAcorn[] = [];
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;
  private getTerrainHeight?: (x: number, z: number) => number;

  constructor(
    scene: THREE.Scene,
    sparkleParticles: ParticleSystem,
    audio: ForestAudio,
    getTerrainHeight?: (x: number, z: number) => number
  ) {
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;
    this.getTerrainHeight = getTerrainHeight;

    const acornPositions = [
      [3, 0.4, 4], [8, 0.4, 2], [14, 0.4, 6], [22, 0.4, 12],
      [-5, 0.4, 5], [-12, 0.4, 8], [-18, 0.4, 15], [-26, 0.4, 6],
      [6, 0.4, -6], [12, 0.4, -14], [20, 0.4, -18], [28, 0.4, -8],
      [-6, 0.4, -8], [-14, 0.4, -16], [-22, 0.4, -20], [-30, 0.4, -12],
      [0, 0.4, 18], [0, 0.4, -24], [-18, 0.4, -6], [16, 0.4, 25]
    ];

    const capGeo = new THREE.ConeGeometry(0.26, 0.22, 10);
    const nutGeo = new THREE.SphereGeometry(0.24, 10, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const nutMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });

    for (let i = 0; i < acornPositions.length; i++) {
      const [ax, , az] = acornPositions[i];
      const g = new THREE.Group();
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.16;
      cap.rotation.x = Math.PI;
      const nut = new THREE.Mesh(nutGeo, nutMat);
      g.add(nut);
      g.add(cap);

      // Sit the acorn on the actual terrain surface so it is never buried
      // inside a hill or floating high above a valley.
      const surfaceY = this.getTerrainHeight ? this.getTerrainHeight(ax, az) : 0;
      const restY = surfaceY + 0.45;
      const isCollected = GameState.instance.collectedAcornIds.has(i);
      g.position.set(ax, restY, az);
      g.castShadow = false;
      if (isCollected) g.visible = false;
      scene.add(g);

      this.acorns.push({
        id: i,
        mesh: g,
        position: new THREE.Vector3(ax, restY, az),
        collected: isCollected,
        baseY: restY,
        spinSpeed: 2.0 + Math.random() * 1.5
      });
    }
  }

  /** Restore collected state from the save so already-collected acorns are hidden. */
  public syncWithSave() {
    this.acorns.forEach(acorn => {
      const collected = GameState.instance.collectedAcornIds.has(acorn.id);
      acorn.collected = collected;
      acorn.mesh.visible = !collected;
    });
  }

  public update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onCollect: (count: number) => void) {
    this.acorns.forEach(acorn => {
      if (acorn.collected) return;
      acorn.mesh.rotation.y += dt * acorn.spinSpeed;
      acorn.mesh.position.y = acorn.baseY + Math.sin(timeSeconds * 3 + acorn.spinSpeed) * 0.2;

      const d = playerPos.distanceTo(acorn.mesh.position);

      // Snappy, instant magnetic pull
      if (d < 5.5) {
        const pullSpeed = Math.max(20.0, (6.0 - d) * 8.0);
        acorn.mesh.position.lerp(playerPos, Math.min(1.0, dt * pullSpeed));
      }

      // Responsive, zero-lag collection trigger
      if (d < 2.0) {
        acorn.collected = true;
        acorn.mesh.visible = false;
        this.sparkleParticles.emitBurst(acorn.mesh.position, 'sparkle', 25);
        this.audio.playSound('coin');
        const count = GameState.instance.collectAcorn(acorn.id);
        onCollect(count);
      }
    });
  }
}
