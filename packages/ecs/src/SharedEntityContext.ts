/**
 * Kairo Engine - Shared Entity Context (Flyweight Archetype Optimization)
 * Allows thousands of entities to share invariant archetype properties (geometry, materials, physics parameters)
 * in a single memory record, reducing heap allocations and cache misses during batch system updates.
 */

import { EntityId, World } from './ECS.ts';

export interface SharedContextStats {
  totalRegisteredContexts: number;
  totalEntitiesSharing: number;
  estimatedMemorySavedBytes: number;
}

export class SharedEntityContext<T extends Record<string, any> = Record<string, any>> {
  public readonly id: string;
  public readonly properties: Readonly<T>;
  private _entityIds: Set<EntityId> = new Set();
  public readonly _cachedPropertyKeys: string[];

  constructor(id: string, properties: T) {
    this.id = id;
    this.properties = Object.freeze({ ...properties });
    this._cachedPropertyKeys = Object.keys(this.properties);
  }

  public get entityCount(): number {
    return this._entityIds.size;
  }

  public get entityIds(): ReadonlySet<EntityId> {
    return this._entityIds;
  }

  public get<K extends keyof T>(key: K): T[K] {
    return this.properties[key];
  }

  public has(key: string): boolean {
    return key in this.properties;
  }

  public registerEntity(entity: EntityId): void {
    this._entityIds.add(entity);
  }

  public unregisterEntity(entity: EntityId): void {
    this._entityIds.delete(entity);
  }

  public hasEntity(entity: EntityId): boolean {
    return this._entityIds.has(entity);
  }
}

export class SharedEntityContextManager {
  private contexts: Map<string, SharedEntityContext<any>> = new Map();
  private entityToContextMap: Map<EntityId, string> = new Map();

  /**
   * Create or update a shared context record
   */
  public registerContext<T extends Record<string, any>>(id: string, properties: T): SharedEntityContext<T> {
    if (this.contexts.has(id)) {
      const existing = this.contexts.get(id)!;
      // Return existing if exact match
      return existing as SharedEntityContext<T>;
    }
    const context = new SharedEntityContext<T>(id, properties);
    this.contexts.set(id, context);
    return context;
  }

  /**
   * Retrieve a shared context by ID
   */
  public getContext<T extends Record<string, any>>(id: string): SharedEntityContext<T> | undefined {
    return this.contexts.get(id) as SharedEntityContext<T> | undefined;
  }

  /**
   * Attach an entity to a shared context
   */
  public attachEntityToContext(entity: EntityId, contextId: string): void {
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`[SharedEntityContextManager] Context '${contextId}' not found.`);
    }

    // Detach from previous context if any
    const prevContextId = this.entityToContextMap.get(entity);
    if (prevContextId && prevContextId !== contextId) {
      this.contexts.get(prevContextId)?.unregisterEntity(entity);
    }

    context.registerEntity(entity);
    this.entityToContextMap.set(entity, contextId);
  }

  /**
   * Detach an entity from its shared context
   */
  public detachEntity(entity: EntityId): void {
    const contextId = this.entityToContextMap.get(entity);
    if (contextId) {
      this.contexts.get(contextId)?.unregisterEntity(entity);
      this.entityToContextMap.delete(entity);
    }
  }

  /**
   * Get the context ID for an entity
   */
  public getEntityContextId(entity: EntityId): string | undefined {
    return this.entityToContextMap.get(entity);
  }

  /**
   * Get the shared context for an entity
   */
  public getEntityContext<T extends Record<string, any>>(entity: EntityId): SharedEntityContext<T> | undefined {
    const contextId = this.entityToContextMap.get(entity);
    return contextId ? (this.contexts.get(contextId) as SharedEntityContext<T>) : undefined;
  }

  /**
   * Batch process all entities sharing a specific context without duplicating property allocations
   */
  public forEachInContext<T extends Record<string, any>>(
    contextId: string,
    callback: (entity: EntityId, sharedProps: Readonly<T>) => void
  ): void {
    const context = this.getContext<T>(contextId);
    if (!context) return;

    const props = context.properties;
    context.entityIds.forEach((entity) => {
      callback(entity, props);
    });
  }

  /**
   * Compute memory & performance statistics of the shared context registry
   */
  public getStats(): SharedContextStats {
    let totalSharing = 0;
    let totalKeysCount = 0;

    this.contexts.forEach((ctx) => {
      const count = ctx.entityCount;
      totalSharing += count;
      // ⚡ Bolt: Avoid using `Object.keys()` in hot paths/loops (like getStats)
      // since it generates GC pressure by allocating new arrays. Use the cached array length.
      totalKeysCount += ctx._cachedPropertyKeys.length;
    });

    // Estimate ~64 bytes saved per redundant object property per entity
    const estimatedMemorySavedBytes = Math.max(0, (totalSharing - this.contexts.size) * totalKeysCount * 64);

    return {
      totalRegisteredContexts: this.contexts.size,
      totalEntitiesSharing: totalSharing,
      estimatedMemorySavedBytes
    };
  }

  public clear(): void {
    this.contexts.clear();
    this.entityToContextMap.clear();
  }
}
