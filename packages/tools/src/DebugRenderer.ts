import * as THREE from 'three';
import { KairoApp } from '@kairo/core';

export class DebugRenderer {
  private gridHelper: THREE.GridHelper | null = null;
  private axesHelper: THREE.AxesHelper | null = null;
  private cameraHelper: THREE.CameraHelper | null = null;
  
  // Trackers
  private boundingBoxHelpers: Map<THREE.Object3D, THREE.BoxHelper> = new Map();
  private wireframeMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map();
  private isWireframeMode: boolean = false;

  constructor(private app: KairoApp) {}

  /**
   * Toggles a 3D Grid Overlay on the XZ plane.
   */
  public toggleGrid(size: number = 100, divisions: number = 100): void {
    if (this.gridHelper) {
      this.app.scene.remove(this.gridHelper);
      this.gridHelper.dispose();
      this.gridHelper = null;
    } else {
      this.gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
      this.app.scene.add(this.gridHelper);
    }
  }

  /**
   * Toggles the Global Pivot/Origin indicator (AxesHelper)
   */
  public toggleOriginIndicator(size: number = 5): void {
    if (this.axesHelper) {
      this.app.scene.remove(this.axesHelper);
      this.axesHelper.dispose();
      this.axesHelper = null;
    } else {
      this.axesHelper = new THREE.AxesHelper(size);
      this.app.scene.add(this.axesHelper);
    }
  }

  /**
   * Toggles a global wireframe mode for all meshes in the scene.
   */
  public toggleWireframe(): void {
    this.isWireframeMode = !this.isWireframeMode;
    
    this.app.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (this.isWireframeMode) {
          // Save original material
          this.wireframeMaterials.set(child, child.material);
          // Apply wireframe
          child.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true
          });
        } else {
          // Restore original material
          const orig = this.wireframeMaterials.get(child);
          if (orig) {
            child.material = orig;
          }
        }
      }
    });
    
    if (!this.isWireframeMode) {
      this.wireframeMaterials.clear();
    }
  }

  /**
   * Draws an AABB Bounding Box around a specific 3D Object.
   */
  public showBoundingBox(object: THREE.Object3D, color: number = 0xffff00): void {
    if (this.boundingBoxHelpers.has(object)) return;
    const box = new THREE.BoxHelper(object, color);
    this.app.scene.add(box);
    this.boundingBoxHelpers.set(object, box);
    
    // Auto update hook
    const onUpdate = () => {
      if (this.boundingBoxHelpers.has(object)) {
        box.update();
      } else {
        this.app.engine.events.off('update', onUpdate);
      }
    };
    this.app.engine.events.on('update', onUpdate);
  }

  /**
   * Removes an AABB Bounding Box around a specific 3D Object.
   */
  public hideBoundingBox(object: THREE.Object3D): void {
    const box = this.boundingBoxHelpers.get(object);
    if (box) {
      this.app.scene.remove(box);
      box.dispose();
      this.boundingBoxHelpers.delete(object);
    }
  }

  /**
   * Clears all debug visualizations
   */
  public clear(): void {
    if (this.gridHelper) this.toggleGrid();
    if (this.axesHelper) this.toggleOriginIndicator();
    if (this.isWireframeMode) this.toggleWireframe();
    
    this.boundingBoxHelpers.forEach((box, obj) => {
      this.app.scene.remove(box);
      box.dispose();
    });
    this.boundingBoxHelpers.clear();
  }
}
