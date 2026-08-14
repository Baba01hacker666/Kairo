import * as THREE from 'three';
import { ChimeMonolith } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { GameState } from '../state.ts';
import { ForestAudio } from '../audio/ForestAudio.ts';

export class ChimeManager {
  public chimes: ChimeMonolith[] = [];
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;

    const chimeCoords = [
      { x: 18, z: -8, id: 1 },
      { x: -12, z: 24, id: 2 },
      { x: 22, z: 22, id: 3 }
    ];

    chimeCoords.forEach(item => {
      const g = new THREE.Group();
      g.position.set(item.x, 0, item.z);

      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 3.2, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
      );
      stone.position.y = 1.6;
      stone.castShadow = true;
      stone.receiveShadow = true;
      g.add(stone);

      const isLit = GameState.instance.litChimeIds.has(item.id);

      const rune = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0x475569,
          emissive: isLit ? 0xf59e0b : 0x000000,
          emissiveIntensity: isLit ? 2.0 : 0.0,
          roughness: 0.3
        })
      );
      rune.position.set(0, 2.2, 0.45);
      g.add(rune);

      const pLight = new THREE.PointLight(0xf59e0b, isLit ? 4.0 : 0, 10);
      pLight.position.set(0, 2.2, 0.8);
      g.add(pLight);

      scene.add(g);
      this.chimes.push({
        id: item.id,
        mesh: g,
        runeMesh: rune,
        light: pLight,
        position: new THREE.Vector3(item.x, 0, item.z),
        isLit: isLit
      });
    });
  }

  /** Restore lit state from the save so already-lit chimes glow on Continue. */
  public syncWithSave() {
    this.chimes.forEach(chime => {
      const lit = GameState.instance.litChimeIds.has(chime.id);
      chime.isLit = lit;
      (chime.runeMesh.material as THREE.MeshStandardMaterial).emissive.setHex(lit ? 0xf59e0b : 0x000000);
      (chime.runeMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = lit ? 2.0 : 0.0;
      chime.light.intensity = lit ? 4.0 : 0;
    });
  }

  public checkBarkResonance(playerPos: THREE.Vector3, onLit: (chime: ChimeMonolith) => void) {
    this.chimes.forEach(chime => {
      const d = playerPos.distanceTo(chime.position);
      if (d < 7.0 && !chime.isLit) {
        chime.isLit = true;
        GameState.instance.lightChime(chime.id);
        (chime.runeMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
        (chime.runeMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.0;
        chime.light.intensity = 4.0;
        this.sparkleParticles.emitBurst(chime.position, 'sparkle', 50);
        this.audio.playSound('coin');
        onLit(chime);
      }
    });
  }

  public areAllLit(): boolean {
    return this.chimes.every(c => c.isLit);
  }
}
