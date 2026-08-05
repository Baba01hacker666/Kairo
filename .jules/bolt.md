## 2024-11-23 - High-Frequency Physics Queries Anti-Pattern
**Learning:** In high-frequency physics queries like `overlapSphere`, `overlapBox`, and `raycast`, using `.filter().map()` array chaining and performing object allocations (e.g., `new BoundingBox()`, `Vector3.clone()`) via `collider.getBoundingBox(position)` creates significant GC overhead and performance bottlenecks. These methods can be called thousands of times per frame in dense scenes.
**Action:** Replace `.filter().map()` chains with traditional `for` loops in hot paths. Inline bounding box dimension calculations (e.g. `const hx = collider.size.x * 0.5`) and re-use objects or avoid allocations entirely to prevent unnecessary garbage collection. This optimization was observed to yield roughly a 3x speedup in synthetic benchmarks.

## 2024-11-23 - Collision Pair Validation Array Allocation Spikes
**Learning:** In continuous physics update functions like `collectCollisionEvents`, processing separating collision pairs by string parsing (e.g. `key.split(':').map(Number)`) followed by O(N) full-array `this.bodies.find` lookups causes unacceptable CPU delays and garbage collection spikes because it happens every frame for every collision.
**Action:** When tracking paired data for exit/separation events across frames, always persist the full Object references directly inside a Tuple map (`Map<string, [BodyEntry, BodyEntry]>`). Iterating Map entries provides O(1) direct object lookup in the hot frame loop and bypasses garbage string generation.

## 2024-12-07 - Query Cache Key Allocation Spikes
**Learning:** In the ECS hot path, generating query cache keys via `.map()` and dynamic array allocation (e.g. `queryDesc.all.map(c => this.getComponentTypeId(c)).sort().join(',')`) creates massive garbage collection pressure when systems evaluate queries every frame.
**Action:** Replaced `.map()` with explicit loop accumulation and added inline fast-paths for 1- and 2-component queries (which don't require array allocation). Also added a `_key` cache property on the `Query` object to skip key generation entirely when users reuse query objects. This optimization reduces GC spikes by eliminating intermediate arrays in the update loop.

## 2024-12-08 - BoundingBox Allocation Elimination in Physics Queries
**Learning:** High-frequency physics queries like `raycast`, `overlapSphere`, and `overlapBox` iterate through many bodies, allocating intermediate `Vector3` and `BoundingBox` instances via `.clone()` and `new BoundingBox()`. These repeated object allocations create massive Garbage Collection pressure.
**Action:** Inline bounds calculations and use pre-allocated static variables like `_raycastTempBox`. Adding an optional `target?: BoundingBox` to getters allows callers to reuse existing objects and eliminate hot-path allocations.
