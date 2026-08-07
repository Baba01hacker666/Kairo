import * as THREE from 'three';
export declare class FrustumCulling {
    private static projScreenMatrix;
    private static frustum;
    private static bbox;
    static cullScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): {
        visibleCount: number;
        culledCount: number;
    };
}
