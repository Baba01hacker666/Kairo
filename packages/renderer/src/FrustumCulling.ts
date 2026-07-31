import * as THREE from 'three';

export class FrustumCulling {
  private static projScreenMatrix = new THREE.Matrix4();
  private static frustum = new THREE.Frustum();
  private static bbox = new THREE.Box3();

  public static cullScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): { visibleCount: number; culledCount: number } {
    this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

    let visibleCount = 0;
    let culledCount = 0;

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh && obj.visible) {
        const mesh = obj as THREE.Mesh;
        if (!mesh.geometry) return;

        if (!mesh.geometry.boundingBox) {
          mesh.geometry.computeBoundingBox();
        }

        if (mesh.geometry.boundingBox) {
          this.bbox.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
          const intersects = this.frustum.intersectsBox(this.bbox);
          if (!intersects) {
            culledCount++;
          } else {
            visibleCount++;
          }
        }
      }
    });

    return { visibleCount, culledCount };
  }
}
