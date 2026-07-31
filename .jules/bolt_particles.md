## 2024-05-24 - Particle System Structure of Arrays (SoA) Optimization

**Learning:** Managing thousands of particles using Object-Oriented design (Array of Objects) causes immense garbage collection pressure and CPU cache misses due to fragmented memory layouts. When updating matrix data for InstancedMesh, relying on intermediate `THREE.Object3D` methods is a bottleneck.

**Action:** Whenever implementing a high-count system like Particles, strictly use a Structure of Arrays (SoA) layout (`Float32Array`). Iterate using flat indices, perform physics math inline, and write transformation matrices directly into the `InstancedMesh.instanceMatrix.array`. This eliminates object creation, method call overhead, and maximizes CPU cache locality.
