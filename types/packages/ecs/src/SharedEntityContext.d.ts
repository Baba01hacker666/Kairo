/**
 * Kairo Engine - Shared Entity Context (Flyweight Archetype Optimization)
 * Allows thousands of entities to share invariant archetype properties (geometry, materials, physics parameters)
 * in a single memory record, reducing heap allocations and cache misses during batch system updates.
 */
import { EntityId } from './ECS.ts';
export interface SharedContextStats {
    totalRegisteredContexts: number;
    totalEntitiesSharing: number;
    estimatedMemorySavedBytes: number;
}
export declare class SharedEntityContext<T extends Record<string, any> = Record<string, any>> {
    readonly id: string;
    readonly properties: Readonly<T>;
    private _entityIds;
    private _cachedPropertyKeys;
    constructor(id: string, properties: T);
    get entityCount(): number;
    get entityIds(): ReadonlySet<EntityId>;
    get<K extends keyof T>(key: K): T[K];
    has(key: string): boolean;
    registerEntity(entity: EntityId): void;
    unregisterEntity(entity: EntityId): void;
    hasEntity(entity: EntityId): boolean;
}
export declare class SharedEntityContextManager {
    private contexts;
    private entityToContextMap;
    /**
     * Create or update a shared context record
     */
    registerContext<T extends Record<string, any>>(id: string, properties: T): SharedEntityContext<T>;
    /**
     * Retrieve a shared context by ID
     */
    getContext<T extends Record<string, any>>(id: string): SharedEntityContext<T> | undefined;
    /**
     * Attach an entity to a shared context
     */
    attachEntityToContext(entity: EntityId, contextId: string): void;
    /**
     * Detach an entity from its shared context
     */
    detachEntity(entity: EntityId): void;
    /**
     * Get the context ID for an entity
     */
    getEntityContextId(entity: EntityId): string | undefined;
    /**
     * Get the shared context for an entity
     */
    getEntityContext<T extends Record<string, any>>(entity: EntityId): SharedEntityContext<T> | undefined;
    /**
     * Batch process all entities sharing a specific context without duplicating property allocations
     */
    forEachInContext<T extends Record<string, any>>(contextId: string, callback: (entity: EntityId, sharedProps: Readonly<T>) => void): void;
    /**
     * Compute memory & performance statistics of the shared context registry
     */
    getStats(): SharedContextStats;
    clear(): void;
}
