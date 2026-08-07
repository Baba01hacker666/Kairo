/**
 * Modern High-Performance Entity Component System (ECS) for Kairo Engine
 * Features:
 * - Bitmask & Fast Array Component Storage
 * - Query Caching & Bitset Matching (All, Any, None)
 * - System Scheduling Stages (PreUpdate, Update, PostUpdate, FixedUpdate)
 * - Component Lifecycle Hooks (onAdd, onRemove, onEnable, onDisable)
 * - Entity Hierarchy & Parent/Child Relationships
 * - Full Entity & Component Serialization
 */
import { SharedEntityContextManager, SharedEntityContext } from './SharedEntityContext.ts';
export type EntityId = number;
export type ComponentType<T = any> = new (...args: any[]) => T;
export interface Component {
    [key: string]: any;
}
export interface ComponentLifecycleHook<T = any> {
    onAdd?(entity: EntityId, component: T, world: World): void;
    onRemove?(entity: EntityId, component: T, world: World): void;
    onEnable?(entity: EntityId, component: T, world: World): void;
    onDisable?(entity: EntityId, component: T, world: World): void;
}
export declare enum SystemStage {
    PreUpdate = "PreUpdate",
    Update = "Update",
    PostUpdate = "PostUpdate",
    FixedUpdate = "FixedUpdate"
}
export declare abstract class System {
    enabled: boolean;
    priority: number;
    stage: SystemStage;
    abstract update(world: World, delta: number): void;
}
export declare class Query {
    all: ComponentType[];
    any: ComponentType[];
    none: ComponentType[];
    /** @internal */
    _key?: string;
    constructor(all?: ComponentType[], any?: ComponentType[], none?: ComponentType[]);
    matches(world: World, entity: EntityId): boolean;
}
export declare class World {
    private nextEntityId;
    private activeEntities;
    private entityNames;
    private components;
    private disabledComponents;
    private tags;
    private parents;
    private children;
    private systems;
    private componentIdMap;
    private nextComponentTypeId;
    private queryCache;
    private getComponentTypeId;
    private buildQueryKeyPart;
    private getQueryCacheKey;
    private invalidateQueryCache;
    sharedContexts: SharedEntityContextManager;
    createEntity(name?: string): EntityId;
    createSharedContext<T extends Record<string, any>>(id: string, properties: T): SharedEntityContext<T>;
    createEntityWithSharedContext<T extends Record<string, any>>(contextId: string, name?: string): EntityId;
    getEntityName(entity: EntityId): string | undefined;
    setEntityName(entity: EntityId, name: string): void;
    destroyEntity(entity: EntityId): void;
    setParent(child: EntityId, parent: EntityId | null): void;
    private isDescendant;
    getParent(child: EntityId): EntityId | undefined;
    getChildren(parent: EntityId): EntityId[];
    addComponent<T>(entity: EntityId, component: T): T;
    removeComponent<T>(entity: EntityId, componentType: ComponentType<T>): void;
    disableComponent<T>(entity: EntityId, componentType: ComponentType<T>): void;
    enableComponent<T>(entity: EntityId, componentType: ComponentType<T>): void;
    getComponent<T>(entity: EntityId, componentType: ComponentType<T>): T | undefined;
    hasComponent<T>(entity: EntityId, componentType: ComponentType<T>): boolean;
    getAllComponents(entity: EntityId): any[];
    addTag(entity: EntityId, tag: string): void;
    hasTag(entity: EntityId, tag: string): boolean;
    removeTag(entity: EntityId, tag: string): void;
    query(queryDesc: Query): EntityId[];
    /**
     * Ultra-High Performance Direct Dual-Component Fast Iterator
     * Avoids query array allocations and map lookup overheads for 100,000+ entities
     */
    each2<A, B>(CompA: ComponentType<A>, CompB: ComponentType<B>, callback: (entity: EntityId, compA: A, compB: B) => void): void;
    addSystem(system: System): this;
    removeSystem(system: System): void;
    update(delta: number, stage?: SystemStage): void;
    updateAll(delta: number): void;
    /**
     * Run systems scheduled for the fixed-timestep stage. Wire this to the
     * engine's fixedUpdate event so physics-tied systems advance at a stable rate.
     */
    updateFixed(delta: number): void;
    get entityCount(): number;
    clear(): void;
    serialize(): any;
    deserialize(data: any, componentRegistry: Record<string, ComponentType>): void;
}
