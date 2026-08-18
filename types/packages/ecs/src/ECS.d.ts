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
    private entityComponentTypes;
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
    app?: any;
    private _assets?;
    setApp(app: any): void;
    get assets(): any;
    setAssets(assets: any): void;
    /**
     * Primary, intuitive entry point for adding an entity to the world.
     * Example: app.world.add('Player').sphere('blue').at(0, 2, 0).physics().spin();
     */
    add(name?: string): EntityHandle;
    /**
     * English-like, ergonomic entity creation entry point.
     * Example: world.entity('Player').model('Fox.glb').at(0, 1, 0).physics({ mass: 5 }).tag('player');
     */
    entity(name?: string): EntityHandle;
    /**
     * One-line asset & level loading directly into world and scene.
     * Example: const level = await world.load('assets/dungeon.blend');
     */
    load(assetUrl: string, name?: string): EntityHandle;
    /**
     * Fluent API for building an entity with components, tags, and shared contexts in concise lines of code.
     */
    buildEntity(name?: string): EntityBuilder;
    /**
     * High-performance batch entity spawner with minimal allocation overhead.
     */
    spawnBatch(count: number, initializer: (builder: EntityBuilder, index: number) => void): EntityId[];
    clear(): void;
    serialize(): any;
    deserialize(data: any, componentRegistry: Record<string, ComponentType>): void;
}
/**
 * Built-in Component Configurations & Interfaces
 */
export interface TransformConfig {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    sx: number;
    sy: number;
    sz: number;
}
export interface MeshConfig {
    type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'capsule' | string;
    color: string | number;
    roughness: number;
    metalness: number;
    scale: [number, number, number];
    size?: [number, number, number];
    radius?: number;
}
export interface PhysicsConfig {
    bodyType: 'static' | 'dynamic' | 'kinematic';
    mass: number;
    shape: 'box' | 'sphere' | 'capsule';
    restitution: number;
    friction: number;
}
export declare class TransformComponent implements TransformConfig {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    sx: number;
    sy: number;
    sz: number;
    constructor(config?: Partial<TransformConfig>);
}
export declare class MeshComponent implements MeshConfig {
    type: string;
    color: string | number;
    roughness: number;
    metalness: number;
    scale: [number, number, number];
    size?: [number, number, number];
    radius?: number;
    constructor(config?: Partial<MeshConfig>);
}
export declare class PhysicsComponent implements PhysicsConfig {
    bodyType: 'static' | 'dynamic' | 'kinematic';
    mass: number;
    shape: 'box' | 'sphere' | 'capsule';
    restitution: number;
    friction: number;
    constructor(config?: Partial<PhysicsConfig>);
}
export declare class BehaviorComponent {
    behaviorName?: string;
    options: Record<string, any>;
    constructor(behaviorName?: string, options?: Record<string, any>);
}
export declare class InventoryComponent {
    bagId?: string;
    capacity: number;
    constructor(capacity?: number, bagId?: string);
}
/**
 * Ergonomic Fluent Entity Builder
 * Enables single-line entity creation with default values and optional function value overrides.
 */
export declare class EntityBuilder {
    private _entity;
    private _world;
    constructor(world: World, name?: string);
    get id(): EntityId;
    with<T>(component: T): this;
    tag(tagName: string): this;
    parent(parentId: EntityId): this;
    sharedContext(contextId: string): this;
    /** Ultra-concise position shorthand: .at(x, y, z) */
    at(x: number, y?: number, z?: number): this;
    /**
     * One-line transform setter allowing default values and function value overrides:
     * .transform({ x: 0, y: 5 }) or .transform(def => ({ ...def, y: 10 }))
     */
    transform(configOrFn?: Partial<TransformConfig> | ((defaults: TransformConfig) => Partial<TransformConfig>)): this;
    /**
     * One-line mesh setter allowing string preset, object, or function value overrides:
     * .mesh('sphere') or .mesh('sphere', { color: '#ff0000' }) or .mesh('sphere', def => ({ ...def, color: '#00ff00' }))
     */
    mesh(typeOrConfigOrFn?: string | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>), configOrFn?: Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)): this;
    /**
     * One-line physics setter allowing default values and function value overrides:
     * .physics({ mass: 5 }) or .physics(def => ({ ...def, mass: 10 }))
     */
    physics(configOrFn?: Partial<PhysicsConfig> | ((defaults: PhysicsConfig) => Partial<PhysicsConfig>)): this;
    /** Backward compatibility helper for legacy playground/app callers */
    addTransform(opts?: {
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number];
    }): this;
    /** Backward compatibility helper for legacy playground/app callers */
    addMesh(opts?: {
        type?: 'box' | 'sphere' | 'plane' | 'cylinder';
        color?: number | string;
        size?: [number, number, number];
        radius?: number;
    }): this;
    /** Backward compatibility helper for legacy playground/app callers */
    addRigidBody(opts?: {
        mass?: number;
        type?: 'static' | 'dynamic';
        useGravity?: boolean;
    }): this;
    /** Backward compatibility helper for legacy playground/app callers */
    getTransform(): {
        readonly position: {
            x: number;
            y: number;
            z: number;
        };
        readonly rotation: {
            x: number;
            y: number;
            z: number;
        };
        readonly scale: {
            x: number;
            y: number;
            z: number;
        };
    };
    /** One-line color setter: .color('#ff0000') or .color(0x00ff00) */
    color(colorHex: string | number): this;
    /** One-line behavior setter: .behavior('spin', { speed: 2 }) or .behavior(def => ...) */
    behavior(nameOrFn?: string | Record<string, any> | ((defaults: Record<string, any>) => Record<string, any>), options?: Record<string, any>): this;
    /** Scale shorthand: .scale(20, 1, 20) or .scale(2) */
    scale(x: number, y?: number, z?: number): this;
    /** Rotation shorthand: .rotate(45, 0, 90) */
    rotate(rx: number, ry?: number, rz?: number): this;
    /** One-line spin motion helper: .spin(speed?) */
    spin(speed?: number): this;
    /** One-line bob motion helper: .bob(amount?, speed?) */
    bob(amount?: number, speed?: number): this;
    /** One-line pulse motion helper: .pulse(min?, max?, speed?) */
    pulse(min?: number, max?: number, speed?: number): this;
    /** One-line patrol motion helper: .patrol(distance?, speed?) */
    patrol(distance?: number, speed?: number): this;
    /** WASD / Arrow Key Player Movement Steering Trait */
    move(speed?: number): this;
    /** Jump Motion Trait */
    jump(force?: number): this;
    /** Native mobile touch joystick & action button trait */
    mobileControls(): this;
    /** Attach an inventory bag / component to the entity */
    inventory(capacity?: number, bagId?: string): this;
    /** Destroy entity from world */
    destroy(): void;
    build(): EntityId;
}
/**
 * Ergonomic High-Level Entity Handle
 * Supports English-like chaining, primitive helpers, model loading, and Promise/thenable awaiting.
 */
export declare class EntityHandle extends EntityBuilder {
    private _pendingAsyncTasks;
    constructor(world: World, name?: string);
    private _normalizeMeshArg;
    sphere(colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)): this;
    box(colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)): this;
    cylinder(colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)): this;
    capsule(colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)): this;
    plane(colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)): this;
    /**
     * One-line model loader directly attached to entity & scene:
     * const player = await world.entity('Player').model('models/Fox.glb').at(0, 1, 0).physics({ mass: 5 });
     */
    model(url: string): this;
    /**
     * One-line Sketchfab streamer directly attached to entity & scene:
     * const statue = await world.entity('Statue').sketchfab(url).spin(1);
     */
    sketchfab(urlOrUid: string): this;
    /**
     * Promise/thenable interface for seamless sync & async chaining:
     * await world.entity('Player').model('player.glb')
     */
    then<TResult1 = EntityHandle, TResult2 = never>(onfulfilled?: ((value: EntityHandle) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
}
