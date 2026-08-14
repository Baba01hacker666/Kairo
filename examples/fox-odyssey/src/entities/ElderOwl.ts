import * as THREE from 'three';
import { ParticleSystem } from '@kairo/renderer';
import { ForestAudio } from '../audio/ForestAudio.ts';
import { GameState } from '../state.ts';

export interface OwlDialogue {
  chapter: number;
  speaker: string;
  avatar: string;
  text: string;
}

export class ElderOwl {
  public group: THREE.Group;
  public position: THREE.Vector3;
  private headMesh: THREE.Group;
  private wingLeft: THREE.Mesh;
  private wingRight: THREE.Mesh;
  private sparkleParticles: ParticleSystem;
  private audio: ForestAudio;
  private animTime: number = 0;
  private isTalking: boolean = false;

  private dialogues: Record<number, OwlDialogue> = {
    1: {
      chapter: 1,
      speaker: 'Grand Elder Owl',
      avatar: '🦉',
      text: 'Hoo-hoo! Welcome, brave little Fox! A dark Ashen Shadow has corrupted the grove. Use your Pounce (⚡/Shift) to strike shadow beasts, and Spirit Call (🔔/E) to cleanse them!'
    },
    2: {
      chapter: 2,
      speaker: 'Grand Elder Owl',
      avatar: '🦉',
      text: 'Splendid combat! Now ring the 4 chime monoliths 🔔 and gather Sun Acorns to restore the ancient Life Tree!'
    },
    3: {
      chapter: 3,
      speaker: 'Grand Elder Owl',
      avatar: '🦉',
      text: 'The grove is awakening! Head north to the Glowing Portal Archway to enter Level 2: The Moonlit Crystal Peaks!'
    },
    4: {
      chapter: 4,
      speaker: 'Grand Elder Owl',
      avatar: '🦉',
      text: 'The Moonlit Peaks are guarded by the Shadow Behemoth! Use your bouncy crystal geysers and spirit shockwaves to cleanse the apex!'
    }
  };

  constructor(scene: THREE.Scene, sparkleParticles: ParticleSystem, audio: ForestAudio) {
    this.sparkleParticles = sparkleParticles;
    this.audio = audio;
    this.position = new THREE.Vector3(4, 2.8, 3);

    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    scene.add(this.group);

    // 1. Perch Stone Pillar / Branch
    const perchMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3.0, 10), perchMat);
    perch.position.y = -1.5;
    perch.receiveShadow = true;
    perch.castShadow = true;
    this.group.add(perch);

    // 2. Stylized Owl Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5
    });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.6, 6, 12), bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    this.group.add(body);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), bellyMat);
    belly.scale.set(0.9, 1.1, 0.6);
    belly.position.set(0, 0.45, 0.22);
    this.group.add(belly);

    // 3. Animated Owl Head & Wisdom Brow
    this.headMesh = new THREE.Group();
    this.headMesh.position.set(0, 0.95, 0.05);

    const headGeo = new THREE.SphereGeometry(0.38, 12, 10);
    const head = new THREE.Mesh(headGeo, bodyMat);
    this.headMesh.add(head);

    // Owl Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
    eyeL.position.set(-0.16, 0.05, 0.32);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
    eyeR.position.set(0.16, 0.05, 0.32);
    this.headMesh.add(eyeL);
    this.headMesh.add(eyeR);

    // Eye Feathers / Horn Tufts
    const tuftMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const tuftL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 5), tuftMat);
    tuftL.position.set(-0.2, 0.35, 0.1);
    tuftL.rotation.z = -0.3;
    const tuftR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 5), tuftMat);
    tuftR.position.set(0.2, 0.35, 0.1);
    tuftR.rotation.z = 0.3;
    this.headMesh.add(tuftL);
    this.headMesh.add(tuftR);

    // Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, -0.05, 0.42);
    this.headMesh.add(beak);

    this.group.add(this.headMesh);

    // 4. Wings
    const wingGeo = new THREE.CapsuleGeometry(0.18, 0.6, 4, 8);
    this.wingLeft = new THREE.Mesh(wingGeo, bodyMat);
    this.wingLeft.position.set(-0.42, 0.45, 0);
    this.wingLeft.rotation.z = 0.2;
    this.group.add(this.wingLeft);

    this.wingRight = new THREE.Mesh(wingGeo, bodyMat);
    this.wingRight.position.set(0.42, 0.45, 0);
    this.wingRight.rotation.z = -0.2;
    this.group.add(this.wingRight);

    // Elder Wisdom Light
    const owlLight = new THREE.PointLight(0xfde047, 1.8, 8);
    owlLight.position.set(0, 1.2, 0.5);
    this.group.add(owlLight);
  }

  public getDialogueForChapter(chapter: number): OwlDialogue {
    return this.dialogues[chapter] || this.dialogues[1];
  }

  public checkProximity(
    playerPos: THREE.Vector3,
    chapter: number,
    onTalk: (dialogue: OwlDialogue) => void
  ) {
    const d = playerPos.distanceTo(this.position);
    if (d < 4.2 && !this.isTalking) {
      this.isTalking = true;
      this.sparkleParticles.emitBurst(this.position, 'sparkle', 20);
      this.audio.playSound('fanfare');
      onTalk(this.getDialogueForChapter(chapter));
    } else if (d >= 5.5) {
      this.isTalking = false;
    }
  }

  private static readonly _toPlayer = new THREE.Vector3();

  public update(dt: number, timeSeconds: number, playerPos: THREE.Vector3) {
    this.animTime += dt;

    // Breathing & wing idle twitch
    this.group.position.y = this.position.y + Math.sin(this.animTime * 2.5) * 0.05;
    this.wingLeft.rotation.z = 0.2 + Math.sin(this.animTime * 4) * 0.08;
    this.wingRight.rotation.z = -0.2 - Math.sin(this.animTime * 4) * 0.08;

    // Head tracks player smoothly (Owl 180-degree neck turn).
    // Wrap the angle difference so the head never spins the long way around
    // when the player crosses the +/-PI boundary.
    ElderOwl._toPlayer.subVectors(playerPos, this.group.position);
    const targetAngle = Math.atan2(ElderOwl._toPlayer.x, ElderOwl._toPlayer.z);
    let diff = targetAngle - this.headMesh.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.headMesh.rotation.y += diff * Math.min(1.0, dt * 4.0);
  }
}
