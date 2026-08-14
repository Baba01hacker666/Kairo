import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationStateMachine } from '@kairo/animation';
import { ParticleSystem } from '@kairo/renderer';
import { GameState } from '../state.ts';
import { ForestAudio } from '../audio/ForestAudio.ts';

export class FoxPlayer {
  public position: THREE.Vector3 = new THREE.Vector3(0, 0.5, 8);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationY: number = Math.PI; // Face forward into grove on spawn
  public isGrounded: boolean = true;
  public canDoubleJump: boolean = true;
  public isPouncing: boolean = false;

  public container: THREE.Group;
  private loadedModel: THREE.Object3D | null = null;
  private fallbackGroup: THREE.Group;
  private animStateMachine: AnimationStateMachine | null = null;

  public walkSpeed: number = 7.5;
  public pounceSpeed: number = 13.5;
  public jumpForce: number = 11.5;

  private barkTimer: number = 0;
  private auraRing: THREE.Mesh;
  private auraMaterial: THREE.MeshBasicMaterial;

  private dustParticles: ParticleSystem;
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;

  constructor(scene: THREE.Scene, dustParticles: ParticleSystem, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.dustParticles = dustParticles;
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;

    this.container = new THREE.Group();
    this.container.position.copy(this.position);
    scene.add(this.container);

    // 1. Stylized Procedural Fallback Mesh
    this.fallbackGroup = this.createFallbackFox();
    this.container.add(this.fallbackGroup);

    // 2. Spirit Call Aura Wave
    const auraGeo = new THREE.RingGeometry(0.2, 0.5, 32);
    this.auraMaterial = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    this.auraRing = new THREE.Mesh(auraGeo, this.auraMaterial);
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.05;
    this.container.add(this.auraRing);

    // 3. Load GLTF Fox Model
    this.loadFoxModel();
  }

  private createFallbackFox(): THREE.Group {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.65 });
    const chestMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.7 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), bodyMat);
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.5;
    group.add(body);

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.55, 6), bodyMat);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0.65, 0.55);
    group.add(head);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), chestMat);
    snout.position.set(0, 0.62, 0.85);
    group.add(snout);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), chestMat);
    chest.scale.set(0.9, 1.2, 0.5);
    chest.position.set(0, 0.52, 0.35);
    group.add(chest);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.85, 8), bodyMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.65, -0.6);
    group.add(tail);

    return group;
  }

  private loadFoxModel() {
    const loader = new GLTFLoader();
    const isGhPages = typeof window !== 'undefined' && window.location.pathname.includes('/Kairo');
    const basePath = isGhPages ? '/Kairo' : '';

    const candidateUrls = [
      `${basePath}/models/Fox.glb`,
      '../../models/Fox.glb',
      '../models/Fox.glb',
      './models/Fox.glb',
      '/models/Fox.glb',
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb'
    ];

    const tryLoad = (index: number) => {
      if (index >= candidateUrls.length) {
        console.warn('Fallback procedural fox mesh active.');
        return;
      }
      const url = candidateUrls[index];
      loader.load(
        url,
        gltf => {
          this.container.remove(this.fallbackGroup);
          const model = gltf.scene;
          model.scale.set(0.022, 0.022, 0.022);
          model.rotation.y = 0; // Model faces forward (+Z in local coords)
          model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.container.add(model);
          this.loadedModel = model;

          if (gltf.animations && gltf.animations.length >= 3) {
            this.animStateMachine = new AnimationStateMachine(model);
            this.animStateMachine.registerState('Idle', gltf.animations[0], { fadeDuration: 0.2 });
            this.animStateMachine.registerState('Walk', gltf.animations[1], { fadeDuration: 0.15 });
            this.animStateMachine.registerState('Run', gltf.animations[2], { fadeDuration: 0.15 });
            this.animStateMachine.setState('Idle');
          }
        },
        undefined,
        () => {
          tryLoad(index + 1);
        }
      );
    };

    tryLoad(0);
  }

  public jump(): boolean {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.canDoubleJump = true;
      this.dustParticles.emitBurst(this.position, 'dust_footstep', 15);
      this.audio.playSound('jump');
      return true;
    } else if (this.canDoubleJump) {
      this.velocity.y = this.jumpForce * 0.9;
      this.canDoubleJump = false;
      this.sparkleParticles.emitBurst(this.position, 'sparkle', 25);
      this.audio.playSound('teleport');
      return true;
    }
    return false;
  }

  public pounce(): boolean {
    const state = GameState.instance;
    if (state.stamina > 25 && !this.isPouncing) {
      this.isPouncing = true;
      state.stamina = Math.max(0, state.stamina - 30);
      this.audio.playSound('push');
      this.dustParticles.emitBurst(this.position, 'dust_footstep', 20);
      return true;
    }
    return false;
  }

  public spiritBark(): boolean {
    this.barkTimer = 1.0;
    this.audio.playSound('fanfare');
    this.sparkleParticles.emitBurst(
      this.position,
      'teleport_flash',
      GameState.instance.isGoldenForm ? 50 : 35
    );
    return true;
  }

  public setGoldenAura() {
    if (this.loadedModel) {
      this.loadedModel.traverse((c: any) => {
        if (c.isMesh && c.material) {
          c.material.emissive = new THREE.Color(0xf59e0b);
          c.material.emissiveIntensity = 0.8;
        }
      });
    }
  }

  public update(dt: number, inputX: number, inputZ: number, getTerrainHeight: (x: number, z: number) => number) {
    const state = GameState.instance;

    // Stamina Regeneration & Decay
    if (!this.isPouncing) {
      state.stamina = Math.min(state.maxStamina, state.stamina + dt * 20);
    } else {
      state.stamina = Math.max(0, state.stamina - dt * 35);
      if (state.stamina <= 0) this.isPouncing = false;
    }

    const inputMag = Math.hypot(inputX, inputZ);
    const speed = this.isPouncing ? this.pounceSpeed : this.walkSpeed;

    if (inputMag > 0.05) {
      const nx = inputX / inputMag;
      const nz = inputZ / inputMag;
      this.velocity.x = nx * speed;
      this.velocity.z = nz * speed;

      // Smooth Orientation: atan2(nx, nz) smoothly maps movement to forward-facing angle
      const targetAngle = Math.atan2(nx, nz);
      let diff = targetAngle - this.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotationY += diff * Math.min(1.0, dt * 14);

      if (this.animStateMachine) {
        this.animStateMachine.setState(this.isPouncing ? 'Run' : 'Walk');
      }

      if (this.isGrounded && Math.random() < 0.25) {
        this.dustParticles.emitBurst(this.position, 'dust_footstep', 2);
      }
    } else {
      this.velocity.x *= Math.exp(-12 * dt);
      this.velocity.z *= Math.exp(-12 * dt);

      if (this.animStateMachine && this.isGrounded) {
        this.animStateMachine.setState('Idle');
      }
    }

    // Gravity
    this.velocity.y -= 25.0 * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;

    // Terrain Collision
    const surfaceY = getTerrainHeight(this.position.x, this.position.z);
    if (this.position.y <= surfaceY + 0.1) {
      this.position.y = surfaceY + 0.1;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.canDoubleJump = true;
    } else {
      this.isGrounded = false;
    }

    // World Clamp
    const dist = Math.hypot(this.position.x, this.position.z);
    if (dist > 70) {
      this.position.x = (this.position.x / dist) * 70;
      this.position.z = (this.position.z / dist) * 70;
    }

    this.container.position.copy(this.position);
    this.container.rotation.y = this.rotationY;

    // Spirit Wave Animation
    if (this.barkTimer > 0) {
      this.barkTimer -= dt;
      const progress = 1.0 - this.barkTimer;
      this.auraRing.scale.set(progress * 16, progress * 16, progress * 16);
      this.auraMaterial.opacity = Math.max(0, Math.sin(progress * Math.PI));
    }

    if (this.animStateMachine) {
      this.animStateMachine.update(dt);
    }
  }
}
