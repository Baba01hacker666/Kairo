import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
import { GameState } from '../state.ts';

export interface ChimeMonolith {
  id: number;
  mesh: THREE.Group;
  runeMesh: THREE.Mesh;
  light: THREE.PointLight;
  position: THREE.Vector3;
  isLit: boolean;
}

export class ChimeManager {
  public chimes: ChimeMonolith[] = [];
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;

    const chimeCoords = [
      { id: 1, x: 0, z: -14, label: 'North' },
      { id: 2, x: 16, z: 0, label: 'East' },
      { id: 3, x: 0, z: 14, label: 'South' },
      { id: 4, x: -16, z: 0, label: 'West' }
    ];

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const runeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      emissive: 0x000000,
      roughness: 0.2
    });

    chimeCoords.forEach(item => {
      const g = new THREE.Group();
      g.position.set(item.x, 0, item.z);

      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.0, 1.2), stoneMat);
      pillar.position.y = 2.0;
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      g.add(pillar);

      const rune = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 12, 24), runeMat.clone());
      rune.position.set(0, 2.4, 0.65);
      g.add(rune);

      const isLit = GameState.instance.litChimeIds.has(item.id);
      const pLight = new THREE.PointLight(0xfde047, isLit ? 4.0 : 0, 18);
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
      // Generous resonance radius (14.0 units) so Spirit Call responds immediately
      if (d < 14.0 && !chime.isLit) {
        chime.isLit = true;
        GameState.instance.lightChime(chime.id);
        (chime.runeMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
        (chime.runeMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.5;
        chime.light.intensity = 5.0;
        this.sparkleParticles.emitBurst(chime.position, 'sparkle', 60);
        this.audio.playSound('coin');
        onLit(chime);
      }
    });
  }

  public areAllLit(): boolean {
    return this.chimes.length > 0 && this.chimes.every(c => c.isLit);
  }
}
