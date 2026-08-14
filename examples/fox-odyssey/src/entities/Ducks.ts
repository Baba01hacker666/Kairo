import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { GameState } from '../state.ts';

export interface FriendlyDuck {
  id: number;
  mesh: THREE.Group;
  position: THREE.Vector3;
  targetPos: THREE.Vector3;
  isFollowing: boolean;
  animTime: number;
}

export class DuckManager {
  public ducks: FriendlyDuck[] = [];
  private sparkleParticles: ParticleSystem;
  private _followTarget: THREE.Vector3 = new THREE.Vector3();
  private _lookTarget: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem) {
    this.sparkleParticles = sparkleParticles;

    const duckPositions = [
      [-15, -9],
      [-17, -15],
      [-21, -12]
    ];

    const duckBodyGeo = new THREE.SphereGeometry(0.35, 10, 8);
    const duckHeadGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const duckBeakGeo = new THREE.ConeGeometry(0.12, 0.25, 6);

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });

    for (let i = 0; i < duckPositions.length; i++) {
      const [sx, sz] = duckPositions[i];
      const g = new THREE.Group();
      g.position.set(sx, 0.35, sz);

      const body = new THREE.Mesh(duckBodyGeo, yellowMat);
      body.scale.set(1, 0.8, 1.2);
      g.add(body);

      const head = new THREE.Mesh(duckHeadGeo, yellowMat);
      head.position.set(0, 0.35, 0.25);
      g.add(head);

      const beak = new THREE.Mesh(duckBeakGeo, orangeMat);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.32, 0.48);
      g.add(beak);

      scene.add(g);

      const isFollowing = GameState.instance.ducksFollowing;
      this.ducks.push({
        id: i,
        mesh: g,
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
      // Generous call radius (16.0 units) so Spirit Bark gathers the ducklings immediately
      if (d < 16.0 && !duck.isFollowing) {
        duck.isFollowing = true;
        GameState.instance.ducksFollowing = true;
        GameState.instance.saveGame();
        this.sparkleParticles.emitBurst(duck.position, 'sparkle', 25);
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
        duck.mesh.position.lerp(this._followTarget.set(tx, 0.35, tz), dt * 5.5);
        duck.mesh.lookAt(this._lookTarget.set(playerPos.x, 0.35, playerPos.z));
        duck.mesh.position.y = 0.35 + Math.abs(Math.sin(duck.animTime)) * 0.18;
      }
    });
  }
}
