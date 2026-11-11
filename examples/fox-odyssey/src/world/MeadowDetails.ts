import * as THREE from 'three';

/** A deterministic, instanced understory: two draw calls and no per-frame work. */
export function createMeadowDetails(heightAt: (x: number, z: number) => number, mobile = false): THREE.Group {
  let seed = 0x2187;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const group = new THREE.Group();
  group.name = 'meadow-details';
  const count = mobile ? 500 : 1100;
  const grassGeometry = new THREE.BufferGeometry();
  // Two intersecting blades form a readable tuft from every camera angle.
  grassGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.18, 0, 0, 0.18, 0, 0, 0, 1, 0,
    0, 0, -0.18, 0, 0, 0.18, 0, 1, 0
  ], 3));
  grassGeometry.computeVertexNormals();
  const grass = new THREE.InstancedMesh(grassGeometry, new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 1, side: THREE.DoubleSide
  }), count);
  grass.name = 'grass-tufts';
  const flowers = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.12, 0),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }),
    Math.ceil(count / 7)
  );
  flowers.name = 'wildflowers';
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const grassColors = [0x416b3a, 0x66894d, 0x779c58, 0x507746];
  const flowerColors = [0xf5d792, 0xe9b1a8, 0xe5dfca, 0xb8a6cf];
  let placed = 0;
  let flowerCount = 0;
  // Reject the shrine, pond, and immediate spawn area so decorations don't obscure play.
  for (let attempts = 0; placed < count && attempts < count * 8; attempts++) {
    const x = (random() - 0.5) * 90;
    const z = (random() - 0.5) * 90;
    if (Math.hypot(x, z) < 10 || Math.hypot(x + 18, z + 12) < 16 || Math.hypot(x, z - 8) < 3) continue;
    const height = 0.38 + random() * 0.5;
    dummy.position.set(x, heightAt(x, z) - 0.08, z);
    dummy.rotation.set(0, random() * Math.PI, 0);
    dummy.scale.setScalar(height);
    dummy.updateMatrix();
    grass.setMatrixAt(placed, dummy.matrix);
    grass.setColorAt(placed, color.setHex(grassColors[Math.floor(random() * grassColors.length)]));
    if (placed % 7 === 0) {
      dummy.position.y += height * 0.9;
      dummy.scale.setScalar(0.7 + random() * 0.7);
      dummy.updateMatrix();
      flowers.setMatrixAt(flowerCount, dummy.matrix);
      flowers.setColorAt(flowerCount, color.setHex(flowerColors[Math.floor(random() * flowerColors.length)]));
      flowerCount++;
    }
    placed++;
  }
  grass.count = placed;
  flowers.count = flowerCount;
  grass.instanceMatrix.needsUpdate = true;
  flowers.instanceMatrix.needsUpdate = true;
  group.add(grass, flowers);
  return group;
}
