import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

export function makeRadialTexture(inner: string, outer: string, size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeSkyTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, '#01030c');
  g.addColorStop(0.45, '#040a1c');
  g.addColorStop(0.7, '#0a1230');
  g.addColorStop(0.85, '#12204a');
  g.addColorStop(1.0, '#1a2c5e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeGroundTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#070e1e';
  ctx.fillRect(0, 0, 512, 512);
  // Subtle rocky noise.
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const v = 6 + Math.random() * 12;
    ctx.fillStyle = `rgba(${v},${v + 4},${v + 18},${0.3 + Math.random() * 0.4})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  // Faint cool glow toward the center (under the monolith).
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, 'rgba(20,40,80,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function setupEnvironment(app: KairoApp): void {
  // ── Sky dome (atmospheric gradient) ──────────────────────────
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1900, 32, 24),
    new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false, depthWrite: false })
  );
  app.scene.add(sky);

  // ── Ground ───────────────────────────────────────────────────
  const groundTex = makeGroundTexture();
  groundTex.repeat.set(4, 4);
  const ground = new THREE.Mesh(
    // Made massive (8000x8000) so its edges never clip the sky at wide 70+ FOV angles
    new THREE.PlaneGeometry(8000, 8000),
    new THREE.MeshStandardMaterial({
      map: groundTex,
      color: 0x010204, // Very dark so the shadow doesn't create stark wedges
      roughness: 0.98,
      metalness: 0.02
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  app.scene.add(ground);
}
