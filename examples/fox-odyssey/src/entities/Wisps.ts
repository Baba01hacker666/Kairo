import * as THREE from 'three';
import { SpiritWisp } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { GameState } from '../state.ts';
import { ForestAudio } from '../audio/ForestAudio.ts';

export class WispManager {
  public wisps: SpiritWisp[] = [];
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;

    const locations = [
      { x: -19, z: -12, name: 'River Wisp' },
      { x: 18, z: -8, name: 'Chime Wisp' },
      { x: -26, z: 14, name: 'Highlands Wisp' },
      { x: 28, z: 18, name: 'Grove Wisp' },
      { x: 0, z: -28, name: 'Ancient Arch Wisp' }
    ];

    locations.forEach((loc, idx) => {
      const g = new THREE.Group();
      g.position.set(loc.x, 2.0, loc.z);

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfacc15,
          emissiveIntensity: 1.5,
          roughness: 0.1
        })
      );
      g.add(orb);

      const pLight = new THREE.PointLight(0xfde047, 2.5, 12);
      g.add(pLight);

      const isCollected = GameState.instance.collectedWispIds.has(idx);
      scene.add(g);
      this.wisps.push({
        id: idx,
        name: loc.name,
        position: new THREE.Vector3(loc.x, 2.0, loc.z),
        mesh: g,
        light: pLight,
        isCollected: isCollected,
        baseY: 2.0,
        bobOffset: idx * 1.3
      });
    });
  }

  public update(dt: number, timeSeconds: number, playerPos: THREE.Vector3, onCollect: (wisp: SpiritWisp) => void) {
    this.wisps.forEach(wisp => {
      if (wisp.isCollected) {
        // Orbit following fox
        const angle = timeSeconds * 2.5 + wisp.id * 1.25;
        const tx = playerPos.x + Math.sin(angle) * (1.8 + wisp.id * 0.4);
        const tz = playerPos.z + Math.cos(angle) * (1.8 + wisp.id * 0.4);
        const ty = playerPos.y + 1.2 + Math.sin(timeSeconds * 4 + wisp.id) * 0.3;
        wisp.mesh.position.lerp(new THREE.Vector3(tx, ty, tz), dt * 7);
        return;
      }

      wisp.mesh.position.y = wisp.baseY + Math.sin(timeSeconds * 2.5 + wisp.bobOffset) * 0.4;
      wisp.mesh.rotation.y += dt * 2.0;

      const d = playerPos.distanceTo(wisp.mesh.position);
      if (d < 2.2) {
        wisp.isCollected = true;
        this.sparkleParticles.emitBurst(wisp.mesh.position, 'teleport_flash', 50);
        this.audio.playSound('teleport');
        GameState.instance.collectWisp(wisp.id, wisp.name);
        onCollect(wisp);
      }
    });
  }
}
