import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

export class Monolith {
  public group: THREE.Group;
  public obeliskMat: THREE.MeshStandardMaterial;
  public coreMat: THREE.MeshBasicMaterial;
  public ring: THREE.Mesh;
  public ring2: THREE.Mesh;
  public heartLight: THREE.PointLight;
  public fillLight: THREE.PointLight;
  public pillarMat: THREE.MeshBasicMaterial;
  public orbs: THREE.Mesh[] = [];

  constructor(public app: KairoApp) {
    this.group = new THREE.Group();
    app.scene.add(this.group);

    // Sleek, classic black obelisk (hollow frame so the core is visible)
    this.obeliskMat = new THREE.MeshStandardMaterial({
      color: 0x050a12,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x101a2a,
    });
    
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 1.2), this.obeliskMat);
    leftPillar.position.set(-1.1, 7, 0);
    leftPillar.castShadow = true; leftPillar.receiveShadow = true;
    this.group.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 1.2), this.obeliskMat);
    rightPillar.position.set(1.1, 7, 0);
    rightPillar.castShadow = true; rightPillar.receiveShadow = true;
    this.group.add(rightPillar);

    const topBridge = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.8, 1.2), this.obeliskMat);
    topBridge.position.set(0, 12.6, 0);
    topBridge.castShadow = true; topBridge.receiveShadow = true;
    this.group.add(topBridge);

    const bottomBridge = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.0, 1.2), this.obeliskMat);
    bottomBridge.position.set(0, 1.5, 0);
    bottomBridge.castShadow = true; bottomBridge.receiveShadow = true;
    this.group.add(bottomBridge);

    // Bright energy core
    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0xffe08a,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const core = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.0, 1.0), this.coreMat);
    core.position.y = 7;
    this.group.add(core);

    // Primary energy ring
    this.ring = new THREE.Mesh(new THREE.RingGeometry(2.8, 3.4, 72), new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    this.ring.rotation.x = Math.PI / 2.2;
    this.ring.position.y = 5.5;
    this.group.add(this.ring);

    // Secondary inner ring
    this.ring2 = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.0, 72), new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    this.ring2.rotation.x = Math.PI / 2.6;
    this.ring2.position.y = 4.2;
    this.group.add(this.ring2);

    // Point light at the heart
    this.heartLight = new THREE.PointLight(0xffc46a, 8, 42, 2);
    this.heartLight.position.set(0, 4.5, 0);
    this.group.add(this.heartLight);

    // Cool blue fill light
    this.fillLight = new THREE.PointLight(0x38bdf8, 4, 32, 2);
    this.fillLight.position.set(0, 0.5, 3);
    this.group.add(this.fillLight);

    // Volumetric pillar
    this.pillarMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.8, 32, 28, 1, true), this.pillarMat);
    pillar.position.y = 20;
    this.group.add(pillar);

    // Orbiting light orbs
    const orbMats = [0x22d3ee, 0xa78bfa, 0xffc46a].map(c =>
      new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    for (let i = 0; i < 3; i++) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), orbMats[i]);
      this.group.add(orb);
      this.orbs.push(orb);
    }
  }

  public update(t: number, dt: number, lit: boolean) {
    // Rings counter-rotate
    this.ring.rotation.z = t * 0.4;
    this.ring2.rotation.z = -t * 0.3;

    // Pulse the heart light and core
    const pulse = 1.6 + Math.sin(t * 2.6) * 0.5;
    const targetIntensity = lit ? pulse : 0.4 + Math.sin(t * 0.7) * 0.1;
    this.coreMat.opacity += (targetIntensity - this.coreMat.opacity) * Math.min(dt * 3, 1);
    this.heartLight.intensity = this.coreMat.opacity * 6;
    
    // Obelisk material faintly pulses with the heart when lit
    if (lit) {
      this.obeliskMat.emissiveIntensity = 0.5 + Math.sin(t * 2.6) * 0.5;
    } else {
      this.obeliskMat.emissiveIntensity = 0.18;
    }

    // Orbs orbit the monolith
    for (let i = 0; i < this.orbs.length; i++) {
      const angle = t * (0.8 + i * 0.2) + i * (Math.PI * 2 / 3);
      const radius = 3.5 + Math.sin(t * 1.5 + i) * 0.5;
      const height = 6 + Math.sin(t * 2 + i * 2) * 3;
      this.orbs[i].position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    }
  }
}
