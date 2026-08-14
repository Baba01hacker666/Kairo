import * as THREE from 'three';
import { BouncyMushroom } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';

export class MushroomManager {
  public mushrooms: BouncyMushroom[] = [];
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;

    const mushroomCoords = [
      { x: -8, z: -20, force: 16 },
      { x: 14, z: 12, force: 15 },
      { x: -26, z: 14, force: 18 }
    ];

    mushroomCoords.forEach(item => {
      const g = new THREE.Group();
      g.position.set(item.x, 0, item.z);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.6, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.6 })
      );
      stem.position.y = 0.6;
      g.add(stem);

      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.4,
          emissive: 0x991b1b,
          emissiveIntensity: 0.3
        })
      );
      cap.position.y = 1.1;
      cap.castShadow = true;
      g.add(cap);

      for (let i = 0; i < 5; i++) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
        );
        const a = (i / 5) * Math.PI * 2;
        dot.position.set(Math.cos(a) * 0.9, 1.5, Math.sin(a) * 0.9);
        g.add(dot);
      }

      scene.add(g);
      this.mushrooms.push({
        mesh: g,
        position: new THREE.Vector3(item.x, 0, item.z),
        bounceForce: item.force,
        lastBounceTime: 0
      });
    });
  }

  public checkPlayerBounce(playerPos: THREE.Vector3, now: number, onBounce: (force: number) => void) {
    this.mushrooms.forEach(m => {
      const d = playerPos.distanceTo(m.position);
      if (d < 1.8 && playerPos.y < 1.8 && now - m.lastBounceTime > 500) {
        m.lastBounceTime = now;
        this.sparkleParticles.emitBurst(m.position, 'collect_burst', 30);
        this.audio.playSound('jump');
        onBounce(m.bounceForce);
      }
    });
  }
}
