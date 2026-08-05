import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelStreamPreset {
  id: string;
  name: string;
  author: string;
  badge: string;
  url: string;
  description: string;
  scale?: number;
}

export const PRESET_MODEL_STREAMS: ModelStreamPreset[] = [
  {
    id: 'fox_classic',
    name: '🦊 Classic Fox',
    author: 'Kairo Engine',
    badge: 'Local Default',
    url: 'models/Fox.glb',
    description: 'High-quality rigged cartoon fox with Skeletal Idle, Walk, and Run animations.'
  },
  {
    id: 'avocado_hero',
    name: '🥑 Hero Avocado',
    author: 'Khronos Group',
    badge: 'PBR Stream',
    url: 'models/Avocado.glb',
    description: 'Textured PBR Avocado mascot rolling into action.'
  },
  {
    id: 'helmet_bot',
    name: '🪖 Golden Mech Helmet',
    author: 'Battle Mech',
    badge: 'PBR Metallic',
    url: 'models/DamagedHelmet.glb',
    description: 'Futuristic Sci-Fi damaged helmet with metallic reflection map.'
  },
  {
    id: 'sketchfab_cyber_fox',
    name: '⚡ Cyberpunk Low-Poly Fox',
    author: 'Sketchfab Community',
    badge: 'Sketchfab Stream',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
    description: 'Streamed low-poly adventure fox directly from remote GLTF repository.'
  },
  {
    id: 'sketchfab_duck',
    name: '🦆 Rubber Duck Adventurer',
    author: 'Sketchfab / Khronos',
    badge: 'Sketchfab Stream',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF-Binary/Duck.glb',
    description: 'Quacky yellow duck explorer for underwater and mystery levels.'
  }
];

export class SketchfabStreamer {
  private loader = new GLTFLoader();

  /**
   * Parse Sketchfab URL or Model UID or direct GLB/GLTF stream URL
   */
  public parseStreamUrl(input: string): { url: string; isSketchfab: boolean; uid?: string } {
    const trimmed = input.trim();
    
    // Check if Sketchfab URL: e.g. https://sketchfab.com/3d-models/fox-1234567890abcdef1234567890abcdef
    const sketchfabMatch = trimmed.match(/sketchfab\.com\/(?:3d-models\/|models\/)?(?:[a-zA-Z0-9-]+-)?([a-f0-9]{32})/i);
    if (sketchfabMatch) {
      const uid = sketchfabMatch[1];
      // Sketchfab Data API v3 download link or fallback viewer model stream URL
      return {
        url: `https://api.sketchfab.com/v3/models/${uid}/download`,
        isSketchfab: true,
        uid
      };
    }

    // Direct UID (32 hex characters)
    if (/^[a-f0-9]{32}$/i.test(trimmed)) {
      return {
        url: `https://api.sketchfab.com/v3/models/${trimmed}/download`,
        isSketchfab: true,
        uid: trimmed
      };
    }

    return {
      url: trimmed,
      isSketchfab: false
    };
  }

  /**
   * Load and stream a 3D model from Sketchfab or remote URL
   */
  public async loadStreamedModel(
    urlOrUid: string,
    onProgress?: (progress: number) => void
  ): Promise<{ scene: THREE.Group; animations: THREE.AnimationClip[]; name: string }> {
    const parsed = this.parseStreamUrl(urlOrUid);
    let targetUrl = parsed.url;

    // Handle Sketchfab API metadata fetch if Sketchfab URL
    if (parsed.isSketchfab && parsed.uid) {
      try {
        const response = await fetch(`https://api.sketchfab.com/v3/models/${parsed.uid}`);
        if (response.ok) {
          const data = await response.json();
          // Check if public GLTF/GLB download link is provided by API
          if (data.gltf && data.gltf.url) {
            targetUrl = data.gltf.url;
          }
        }
      } catch (err) {
        console.warn('Could not fetch Sketchfab API metadata directly; attempting raw stream:', err);
      }
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        targetUrl,
        (gltf) => {
          const scene = gltf.scene;
          scene.name = 'StreamedSketchfabModel';

          // Auto-fit bounding scale
          scene.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(scene);
          const size = new THREE.Vector3();
          box.getSize(size);

          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0.001) {
            // Target height ~1.4 units (matching Fox size in 3D scene)
            const targetScale = 1.4 / maxDim;
            scene.scale.set(targetScale, targetScale, targetScale);
          }

          // Enable shadows on all meshes
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          resolve({
            scene,
            animations: gltf.animations || [],
            name: parsed.uid ? `Sketchfab Model (${parsed.uid.slice(0, 8)})` : 'Streamed 3D Model'
          });
        },
        (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
        (error: any) => {
          reject(new Error(`Failed to stream 3D model: ${error?.message || error}`));
        }
      );
    });
  }
}

export const globalSketchfabStreamer = new SketchfabStreamer();
