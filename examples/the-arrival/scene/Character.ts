import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KairoApp } from '@kairo/core';

export class Character {
  public group: THREE.Group;
  public wanderer: THREE.Group | null = null;
  public wandererLight: THREE.PointLight;
  public eyeGlowMat: THREE.MeshBasicMaterial;

  constructor(public app: KairoApp) {
    this.group = new THREE.Group();
    app.scene.add(this.group);

    // Warm lantern/torch light
    this.wandererLight = new THREE.PointLight(0x38bdf8, 0, 12, 2);
    this.wandererLight.castShadow = true;
    this.group.add(this.wandererLight);

    // Glowing eyes
    this.eyeGlowMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
  }

  public async load(baseUrl: string) {
    const base = baseUrl === '/' || baseUrl === '' ? '/models/' : '../../models/';
    const gltf = await new Promise<any>((resolve, reject) => {
      new GLTFLoader().load(base + 'hooded-adventurer.glb', resolve, undefined, reject);
    });

    this.wanderer = gltf.scene;
    
    // Scale and fit
    const box = new THREE.Box3().setFromObject(this.wanderer!);
    const size = box.getSize(new THREE.Vector3());
    const dominant = Math.max(size.x, Math.max(size.y, size.z));
    if (dominant > 0) {
      this.wanderer!.scale.multiplyScalar(2.0 / dominant);
    }
    const b2 = new THREE.Box3().setFromObject(this.wanderer!);
    this.wanderer!.position.y -= b2.min.y;
    this.wanderer!.traverse((c) => {
      const mesh = c as THREE.Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });

    // Add glowing eyes
    const eyeGeo = new THREE.PlaneGeometry(0.1, 0.05);
    const eye1 = new THREE.Mesh(eyeGeo, this.eyeGlowMat);
    eye1.position.set(-0.08, 1.4, 0.4);
    const eye2 = new THREE.Mesh(eyeGeo, this.eyeGlowMat);
    eye2.position.set(0.08, 1.4, 0.4);
    this.wanderer!.add(eye1, eye2);

    this.group.add(this.wanderer!);
    this.group.position.set(0, 0, 12);
  }

  public update(t: number, dt: number, lit: boolean) {
    if (!this.wanderer) return;

    if (lit && this.wandererLight.intensity < 4) {
      this.wandererLight.intensity += dt * 0.8;
      this.eyeGlowMat.opacity += dt * 0.4;
    }

    // Walking logic
    if (t < 11.5) {
      this.group.position.z -= dt * 0.6;
      this.wanderer.rotation.y = Math.PI;
      this.wanderer.position.y = Math.sin(t * 8) * 0.05; // Bobbing
      this.wanderer.rotation.z = Math.sin(t * 4) * 0.03; // Swaying
    } else {
      // Stopped, looking up at the monolith
      this.wanderer.position.y += (0 - this.wanderer.position.y) * 0.1;
      this.wanderer.rotation.z += (0 - this.wanderer.rotation.z) * 0.1;
      this.wanderer.rotation.x = 0.2; // Tilt head up
    }

    this.wandererLight.position.copy(this.group.position);
    this.wandererLight.position.y += 1.5;
    this.wandererLight.position.z += 0.5;
  }
}
