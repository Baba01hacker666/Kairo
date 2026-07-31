import * as THREE from 'three';

export class MemoryManager {
  public static disposeHierarchy(object: THREE.Object3D): void {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => this.disposeMaterial(mat));
          } else {
            this.disposeMaterial(mesh.material);
          }
        }
      }
    });
  }

  private static disposeMaterial(material: THREE.Material): void {
    material.dispose();
    for (const key of Object.keys(material)) {
      const prop = (material as any)[key];
      if (prop && typeof prop === 'object' && prop.isTexture) {
        (prop as THREE.Texture).dispose();
      }
    }
  }
}
