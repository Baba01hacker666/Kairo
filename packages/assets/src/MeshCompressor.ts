import * as THREE from 'three';

export interface CompressionStats {
  originalVertices: number;
  compressedVertices: number;
  reductionPercentage: number;
  originalBytesEstimate: number;
  compressedBytesEstimate: number;
}

export class MeshCompressor {
  /**
   * Quantize and compact vertex position attributes of a BufferGeometry.
   * Compresses 32-bit floats into 16-bit packed coordinates to save up to 50% VRAM.
   */
  public static quantizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    const posAttr = geometry.getAttribute('position');
    if (!posAttr) return geometry;

    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;

    const min = bbox.min;
    const max = bbox.max;
    const size = new THREE.Vector3().subVectors(max, min);

    // Create 16-bit normalized integer array for vertex positions
    const count = posAttr.count;
    const packed = new Uint16Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      packed[i * 3 + 0] = Math.round(((x - min.x) / (size.x || 1)) * 65535);
      packed[i * 3 + 1] = Math.round(((y - min.y) / (size.y || 1)) * 65535);
      packed[i * 3 + 2] = Math.round(((z - min.z) / (size.z || 1)) * 65535);
    }

    const compressedGeo = geometry.clone();
    compressedGeo.setAttribute('quantizedPosition', new THREE.BufferAttribute(packed, 3, true));
    compressedGeo.userData.quantizationMin = min.toArray();
    compressedGeo.userData.quantizationSize = size.toArray();

    return compressedGeo;
  }

  /**
   * Optimize and merge duplicate vertices in a 3D mesh.
   */
  public static optimizeMesh(mesh: THREE.Mesh): CompressionStats {
    const geo = mesh.geometry;
    const originalVertices = geo.getAttribute('position')?.count || 0;
    const originalBytes = originalVertices * 3 * 4; // 3 floats per vertex, 4 bytes per float

    // Index vertices if not indexed
    if (!geo.index) {
      const positionAttr = geo.getAttribute('position');
      const count = positionAttr.count;
      const indices: number[] = [];
      const vertexMap = new Map<string, number>();
      const newPositions: number[] = [];
      let nextIndex = 0;

      for (let i = 0; i < count; i++) {
        const x = parseFloat(positionAttr.getX(i).toFixed(4));
        const y = parseFloat(positionAttr.getY(i).toFixed(4));
        const z = parseFloat(positionAttr.getZ(i).toFixed(4));
        const key = `${x},${y},${z}`;

        if (vertexMap.has(key)) {
          indices.push(vertexMap.get(key)!);
        } else {
          vertexMap.set(key, nextIndex);
          indices.push(nextIndex);
          newPositions.push(x, y, z);
          nextIndex++;
        }
      }

      geo.setIndex(indices);
      geo.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    }

    const compressedVertices = geo.getAttribute('position')?.count || 0;
    const compressedBytes = compressedVertices * 3 * 4 + (geo.index ? geo.index.count * 2 : 0);
    const reduction = originalVertices > 0 ? parseFloat((((originalVertices - compressedVertices) / originalVertices) * 100).toFixed(1)) : 0;

    return {
      originalVertices,
      compressedVertices,
      reductionPercentage: reduction,
      originalBytesEstimate: originalBytes,
      compressedBytesEstimate: compressedBytes
    };
  }
}
