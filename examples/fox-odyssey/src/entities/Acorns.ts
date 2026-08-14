import * as THREE from 'three';
import { CollectibleAcorn } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { GameState } from '../state.ts';
import { ForestAudio } from '../audio/ForestAudio.ts';

export class AcornManager {
  public acorns: CollectibleAcorn[] = [];
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;

    const acornMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.4
    });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    for (let i = 0; i < GameState.instance.totalAcorns; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), acornMat);
      body.scale.set(1.0, 1.3, 1.0);
      g.add(body);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), capMat);
      cap.position.y = 0.15;
      g.add(cap);

      const angle = (i / GameState.instance.totalAcorns) * Math.PI * 2;
      const radius = 8 + (i % 5) * 5.5;
      const ax = Math.cos(angle) * radius + (Math.sin(i * 7) * 4);
      const az = Math.sin(angle) * radius + (Math.cos(i * 5) * 4);
      const ay = 1.0 + (i % 3 === 0 ? 0.8 : 0);

      const isCollected = GameState.instance.collectedAcornIds.has(i);
      g.position.set(ax, ay, az);
      // Small collectibles don't need to cast shadows — keeps the shadow pass cheap
      g.castShadow = false;
      if (isCollected) g.visible = false;
      scene.add(g);

      this.acorns.push({
        id: i,
        mesh: g,
        position: new THREE.Vector3(ax, ay, az),
        collected: isCollected,
        baseY: ay,
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

      // Measure distance from the live mesh position so attraction/collection
      // works even after the acorn has been pulled toward the player.
      const d = playerPos.distanceTo(acorn.mesh.position);
      if (d < 4.5) {
        acorn.mesh.position.lerp(playerPos, dt * 6.0);
      }
      if (d < 1.4) {
        acorn.collected = true;
        acorn.mesh.visible = false;
        this.sparkleParticles.emitBurst(acorn.mesh.position, 'sparkle', 20);
        this.audio.playSound('coin');
        const count = GameState.instance.collectAcorn(acorn.id);
        onCollect(count);
      }
    });
  }
}
