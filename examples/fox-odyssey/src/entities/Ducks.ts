import * as THREE from 'three';
import { FriendlyDuck } from '../types.ts';
import { ParticleSystem } from '@kairo/renderer';
import { GameState } from '../state.ts';

export class DuckManager {
  public ducks: FriendlyDuck[] = [];
  private sparkleParticles: ParticleSystem;
  private _followTarget: THREE.Vector3 = new THREE.Vector3();
  private _lookTarget: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem) {
    this.sparkleParticles = sparkleParticles;
    const duckColors = [0x10b981, 0xf59e0b, 0x38bdf8];

    for (let i = 0; i < 3; i++) {
      const dg = new THREE.Group();
      const dBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshStandardMaterial({ color: duckColors[i], roughness: 0.5 })
      );
      dBody.scale.set(1, 0.8, 1.3);
      dg.add(dBody);

      const dHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshStandardMaterial({ color: duckColors[i], roughness: 0.5 })
      );
      dHead.position.set(0, 0.28, 0.35);
      dg.add(dHead);

      const dBeak = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 })
      );
      dBeak.rotation.x = Math.PI / 2;
      dBeak.position.set(0, 0.26, 0.55);
      dg.add(dBeak);

      const sx = -18 + (i - 1) * 3;
      const sz = -12 + (i - 1) * 2;
      dg.position.set(sx, 0.35, sz);
      scene.add(dg);

      const isFollowing = GameState.instance.ducksFollowing;
      this.ducks.push({
        id: i,
        mesh: dg,
        position: new THREE.Vector3(sx, 0.35, sz),
        targetPos: new THREE.Vector3(sx, 0.35, sz),
        isFollowing: isFollowing,
        animTime: i * 2
      });
    }
  }

  public checkBarkCall(playerPos: THREE.Vector3, onDuckFollow: () => void) {
    this.ducks.forEach(duck => {
      const d = playerPos.distanceTo(duck.position);
      if (d < 12.0 && !duck.isFollowing) {
        duck.isFollowing = true;
        GameState.instance.ducksFollowing = true;
        GameState.instance.saveGame();
        this.sparkleParticles.emitBurst(duck.position, 'collect_burst', 15);
        onDuckFollow();
      }
    });
  }

  /** Restore following state from the save so recruited ducks follow on Continue. */
  public syncWithSave() {
    this.ducks.forEach(duck => {
      duck.isFollowing = GameState.instance.ducksFollowing;
    });
  }

  public update(dt: number, playerPos: THREE.Vector3, playerRotY: number) {
    this.ducks.forEach((duck, idx) => {
      duck.animTime += dt * 4;
      if (duck.isFollowing) {
        const offset = (idx + 1) * 1.6;
        const tx = playerPos.x - Math.sin(playerRotY) * offset;
        const tz = playerPos.z - Math.cos(playerRotY) * offset;
        // Reuse scratch vectors to avoid per-frame allocation
        duck.mesh.position.lerp(this._followTarget.set(tx, 0.35, tz), dt * 5.0);
        duck.mesh.lookAt(this._lookTarget.set(playerPos.x, 0.35, playerPos.z));
        duck.mesh.position.y = 0.35 + Math.abs(Math.sin(duck.animTime)) * 0.15;
      }
    });
  }
}
