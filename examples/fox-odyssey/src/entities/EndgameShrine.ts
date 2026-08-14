import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
import { GameState } from '../state.ts';

export interface SprintRing {
  id: number;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  passed: boolean;
}

export class EndgameShrineManager {
  private scene: THREE.Scene;
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;

  // Spirit Sprint Time Trial
  public sprintRings: SprintRing[] = [];
  public isSprintActive: boolean = false;
  public sprintStartTime: number = 0;
  public sprintRingsCollected: number = 0;
  public bestTimeSeconds: number = 0;

  // Sky Cycle
  public skyState: 'noon' | 'sunset' | 'aurora' = 'noon';
  private timeTrialAltar: THREE.Group;

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.scene = scene;
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;

    this.timeTrialAltar = new THREE.Group();
    scene.add(this.timeTrialAltar);

    this.initAltarMesh();
    this.initSprintRings();
    this.loadBestTime();
  }

  private initAltarMesh() {
    // Altar Ring Platform at Grove Center
    const ringGeo = new THREE.TorusGeometry(2.5, 0.25, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const altar = new THREE.Mesh(ringGeo, ringMat);
    altar.rotation.x = Math.PI / 2;
    altar.position.set(0, 0.3, 0);
    this.timeTrialAltar.add(altar);

    const coreGeo = new THREE.OctahedronGeometry(0.8);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.0
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 2.2, 0);
    this.timeTrialAltar.add(core);

    const light = new THREE.PointLight(0x38bdf8, 3.0, 15);
    light.position.set(0, 2.5, 0);
    this.timeTrialAltar.add(light);
  }

  private initSprintRings() {
    const ringCoords: [number, number, number][] = [
      [8, 2.0, -8],
      [18, 3.5, -4],
      [22, 1.5, 12],
      [8, 2.5, 22],
      [-10, 2.0, 20],
      [-22, 3.0, 5],
      [-18, 2.5, -14],
      [0, 3.0, -18]
    ];

    const torusGeo = new THREE.TorusGeometry(1.4, 0.18, 12, 24);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.5,
      roughness: 0.2
    });

    ringCoords.forEach((coord, idx) => {
      const mesh = new THREE.Mesh(torusGeo, torusMat.clone());
      mesh.position.set(coord[0], coord[1], coord[2]);
      mesh.visible = false;
      this.scene.add(mesh);

      this.sprintRings.push({
        id: idx + 1,
        mesh,
        position: new THREE.Vector3(coord[0], coord[1], coord[2]),
        passed: false
      });
    });
  }

  private loadBestTime() {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem('kairo_fox_best_sprint_time');
      if (val) this.bestTimeSeconds = parseFloat(val);
    }
  }

  public startSprint(onStart: () => void) {
    this.isSprintActive = true;
    this.sprintStartTime = performance.now();
    this.sprintRingsCollected = 0;
    this.sprintRings.forEach(r => {
      r.passed = false;
      r.mesh.visible = true;
    });
    this.audio.playSound('fanfare');
    onStart();
  }

  private static readonly _altarCenter = new THREE.Vector3(0, 0, 0);

  public update(
    dt: number,
    timeSeconds: number,
    playerPos: THREE.Vector3,
    onRingPassed: (current: number, total: number) => void,
    onFinish: (elapsedSeconds: number, isNewBest: boolean) => void
  ) {
    // Rotate center altar core
    if (this.timeTrialAltar.children[1]) {
      this.timeTrialAltar.children[1].rotation.y += dt * 1.5;
      this.timeTrialAltar.children[1].rotation.x += dt * 0.8;
      this.timeTrialAltar.children[1].position.y = 2.2 + Math.sin(timeSeconds * 3) * 0.25;
    }

    if (!this.isSprintActive) {
      // Check if player steps on central altar to start trial
      const d = playerPos.distanceTo(EndgameShrineManager._altarCenter);
      if (d < 2.8 && GameState.instance.isGoldenForm) {
        this.startSprint(() => {});
      }
      return;
    }

    // Spin active sprint rings
    this.sprintRings.forEach(ring => {
      if (ring.passed) return;
      ring.mesh.rotation.y += dt * 2.0;

      const d = playerPos.distanceTo(ring.position);
      if (d < 2.5) {
        ring.passed = true;
        ring.mesh.visible = false;
        this.sprintRingsCollected++;
        this.sparkleParticles.emitBurst(ring.position, 'sparkle', 40);
        this.audio.playSound('teleport');
        onRingPassed(this.sprintRingsCollected, this.sprintRings.length);

        if (this.sprintRingsCollected >= this.sprintRings.length) {
          this.isSprintActive = false;
          const elapsed = (performance.now() - this.sprintStartTime) * 0.001;
          const isNewBest = this.bestTimeSeconds === 0 || elapsed < this.bestTimeSeconds;
          if (isNewBest) {
            this.bestTimeSeconds = elapsed;
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('kairo_fox_best_sprint_time', elapsed.toFixed(2));
            }
          }
          this.audio.playSound('fanfare');
          onFinish(elapsed, isNewBest);
        }
      }
    });
  }
}
