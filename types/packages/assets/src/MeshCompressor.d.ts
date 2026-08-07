import * as THREE from 'three';
export interface CompressionStats {
    originalVertices: number;
    compressedVertices: number;
    reductionPercentage: number;
    originalBytesEstimate: number;
    compressedBytesEstimate: number;
}
export declare class MeshCompressor {
    /**
     * Quantize and compact vertex position attributes of a BufferGeometry.
     * Compresses 32-bit floats into 16-bit packed coordinates to save up to 50% VRAM.
     */
    static quantizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry;
    private static remapAttributes;
    /**
     * Optimize and merge duplicate vertices in a 3D mesh.
     */
    static optimizeMesh(mesh: THREE.Mesh): CompressionStats;
}
