## 2024-05-24 - Entity Component System (ECS) Query Cache

**Learning:** ECS systems often run the exact same query (e.g. "give me all entities with Transform and Velocity") multiple times per frame or every single frame. Constantly iterating over entities to match components is an O(N) operation that scales poorly. We can cache the query results if no entity has mutated (added/removed a component or been created/destroyed).

**Action:** Whenever implementing or optimizing an ECS architecture, implement a `dirtyQueries` flag and a `queryCache: Map<string, EntityId[]>`. Invalidate the cache whenever components are added/removed or entities are spawned/destroyed. Return cached lists instead of recalculating, reducing repetitive O(N) operations to O(1) cache lookups.
