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

export enum SystemStage {
  PreUpdate = 'PreUpdate',
  Update = 'Update',
  PostUpdate = 'PostUpdate',
  FixedUpdate = 'FixedUpdate'
}

export abstract class System {
  public enabled: boolean = true;
  public priority: number = 0;
  public stage: SystemStage = SystemStage.Update;

  abstract update(world: World, delta: number): void;
}

export class Query {
  public all: ComponentType[];
  public any: ComponentType[];
  public none: ComponentType[];
  /** @internal */
  public _key?: string;

  constructor(
    all: ComponentType[] = [],
    any: ComponentType[] = [],
    none: ComponentType[] = []
  ) {
    this.all = all;
    this.any = any;
    this.none = none;
  }

  matches(world: World, entity: EntityId): boolean {
    const hasAll = this.all.every(c => world.hasComponent(entity, c));
    if (!hasAll) return false;

    const hasAny = this.any.length === 0 || this.any.some(c => world.hasComponent(entity, c));
    if (!hasAny) return false;

    const hasNone = !this.none.some(c => world.hasComponent(entity, c));
    return hasNone;
  }

}

export class World {
  private nextEntityId: EntityId = 1;
  private activeEntities: Set<EntityId> = new Set();
  private entityNames: Map<EntityId, string> = new Map();

  private components: Map<ComponentType, Map<EntityId, any>> = new Map();
  private disabledComponents: Map<ComponentType, Map<EntityId, any>> = new Map();
  private entityComponentTypes: Map<EntityId, Set<ComponentType>> = new Map();
  private tags: Map<EntityId, Set<string>> = new Map();
  private parents: Map<EntityId, EntityId> = new Map();
  private children: Map<EntityId, Set<EntityId>> = new Map();

  private systems: System[] = [];

  private componentIdMap: WeakMap<ComponentType, number> = new WeakMap();
  private nextComponentTypeId: number = 1;
  private queryCache: Map<string, EntityId[]> = new Map();

  private getComponentTypeId(comp: ComponentType): number {
    let id = this.componentIdMap.get(comp);
    if (id === undefined) {
      id = this.nextComponentTypeId++;
      this.componentIdMap.set(comp, id);
    }
    return id;
  }

  private buildQueryKeyPart(comps: ComponentType[] | undefined): string {
    if (!comps || comps.length === 0) return '';
    if (comps.length === 1) return this.getComponentTypeId(comps[0]).toString();
    if (comps.length === 2) {
      const id0 = this.getComponentTypeId(comps[0]);
      const id1 = this.getComponentTypeId(comps[1]);
      return id0 < id1 ? `${id0},${id1}` : `${id1},${id0}`;
    }

    // For > 2 components, fall back to array allocation but avoid .map()
    const ids: number[] = [];
    for (let i = 0; i < comps.length; i++) {
      ids.push(this.getComponentTypeId(comps[i]));
    }
    ids.sort((a, b) => a - b);
    return ids.join(',');
  }

  private getQueryCacheKey(queryDesc: Query): string {
    if (queryDesc._key !== undefined) return queryDesc._key;

    const allKey = this.buildQueryKeyPart(queryDesc.all);
    const anyKey = this.buildQueryKeyPart(queryDesc.any);
    const noneKey = this.buildQueryKeyPart(queryDesc.none);

    const key = `${allKey}|${anyKey}|${noneKey}`;
    queryDesc._key = key;
    return key;
  }

  private invalidateQueryCache(): void {
    if (this.queryCache.size > 0) {
      this.queryCache.clear();
    }
  }

  public sharedContexts: SharedEntityContextManager = new SharedEntityContextManager();

  createEntity(name?: string): EntityId {
    this.invalidateQueryCache();
    const id = this.nextEntityId++;
    this.activeEntities.add(id);
    this.tags.set(id, new Set());
    this.children.set(id, new Set());
    if (name) {
      this.entityNames.set(id, name);
      this.addTag(id, name);
    }
    return id;
  }

  createSharedContext<T extends Record<string, any>>(id: string, properties: T): SharedEntityContext<T> {
    return this.sharedContexts.registerContext(id, properties);
  }

  createEntityWithSharedContext<T extends Record<string, any>>(contextId: string, name?: string): EntityId {
    const id = this.createEntity(name);
    this.sharedContexts.attachEntityToContext(id, contextId);
    return id;
  }

  getEntityName(entity: EntityId): string | undefined {
    return this.entityNames.get(entity);
  }

  setEntityName(entity: EntityId, name: string): void {
    this.entityNames.set(entity, name);
  }

  destroyEntity(entity: EntityId): void {
    if (!this.activeEntities.has(entity)) return;

    // Destroy children recursively
    const childSet = this.children.get(entity);
    if (childSet) {
      for (const childId of Array.from(childSet)) {
        this.destroyEntity(childId);
      }
    }

    // Detach from parent
    const parentId = this.parents.get(entity);
    if (parentId !== undefined) {
      this.children.get(parentId)?.delete(entity);
      this.parents.delete(entity);
    }

    // Fast O(1) component cleanup for attached components only
    const compTypes = this.entityComponentTypes.get(entity);
    if (compTypes) {
      for (const cType of compTypes) {
        const storage = this.components.get(cType);
        if (storage) {
          const comp = storage.get(entity);
          if (comp && typeof (comp as ComponentLifecycleHook).onRemove === 'function') {
            (comp as ComponentLifecycleHook).onRemove!(entity, comp, this);
          }
          storage.delete(entity);
        }
      }
      this.entityComponentTypes.delete(entity);
    }

    for (const storage of this.disabledComponents.values()) {
      storage.delete(entity);
    }

    this.tags.delete(entity);
    this.children.delete(entity);
    this.entityNames.delete(entity);
    this.sharedContexts.detachEntity(entity);
    this.activeEntities.delete(entity);
    this.invalidateQueryCache();
  }

  setParent(child: EntityId, parent: EntityId | null): void {
    // Prevent creating parent/child cycles which would make destroyEntity recurse forever
    if (parent !== null && (parent === child || this.isDescendant(parent, child))) return;

    const oldParent = this.parents.get(child);
    if (oldParent !== undefined) {
      this.children.get(oldParent)?.delete(child);
    }
    if (parent !== null && this.activeEntities.has(parent)) {
      this.parents.set(child, parent);
      this.children.get(parent)?.add(child);
    } else {
      this.parents.delete(child);
    }
  }

  private isDescendant(node: EntityId, ancestor: EntityId): boolean {
    let current = this.parents.get(node);
    while (current !== undefined) {
      if (current === ancestor) return true;
      current = this.parents.get(current);
    }
    return false;
  }

  getParent(child: EntityId): EntityId | undefined {
    return this.parents.get(child);
  }

  getChildren(parent: EntityId): EntityId[] {
    const childSet = this.children.get(parent);
    return childSet ? Array.from(childSet) : [];
  }

  addComponent<T>(entity: EntityId, component: T): T {
    this.invalidateQueryCache();
    const cType = (component as any).constructor as ComponentType<T>;
    // Re-adding a component supersedes any disabled instance of the same type,
    // otherwise enableComponent would resurrect the old one and overwrite this.
    this.disabledComponents.get(cType)?.delete(entity);

    if (!this.components.has(cType)) {
      this.components.set(cType, new Map());
    }
    this.components.get(cType)!.set(entity, component);

    let compSet = this.entityComponentTypes.get(entity);
    if (!compSet) {
      compSet = new Set();
      this.entityComponentTypes.set(entity, compSet);
    }
    compSet.add(cType);

    if (component && typeof (component as ComponentLifecycleHook).onAdd === 'function') {
      (component as ComponentLifecycleHook).onAdd!(entity, component, this);
    }

    return component;
  }

  removeComponent<T>(entity: EntityId, componentType: ComponentType<T>): void {
    this.invalidateQueryCache();
    const storage = this.components.get(componentType);
    if (storage && storage.has(entity)) {
      const comp = storage.get(entity);
      if (comp && typeof (comp as ComponentLifecycleHook).onRemove === 'function') {
        (comp as ComponentLifecycleHook).onRemove!(entity, comp, this);
      }
      storage.delete(entity);
      this.entityComponentTypes.get(entity)?.delete(componentType);
    }
  }

  disableComponent<T>(entity: EntityId, componentType: ComponentType<T>): void {
    this.invalidateQueryCache();
    const storage = this.components.get(componentType);
    if (storage && storage.has(entity)) {
      const comp = storage.get(entity);
      storage.delete(entity);
      if (!this.disabledComponents.has(componentType)) {
        this.disabledComponents.set(componentType, new Map());
      }
      this.disabledComponents.get(componentType)!.set(entity, comp);

      if (comp && typeof (comp as ComponentLifecycleHook).onDisable === 'function') {
        (comp as ComponentLifecycleHook).onDisable!(entity, comp, this);
      }
    }
  }

  enableComponent<T>(entity: EntityId, componentType: ComponentType<T>): void {
    this.invalidateQueryCache();
    const disabledStorage = this.disabledComponents.get(componentType);
    if (disabledStorage && disabledStorage.has(entity)) {
      const comp = disabledStorage.get(entity);
      disabledStorage.delete(entity);
      if (!this.components.has(componentType)) {
        this.components.set(componentType, new Map());
      }
      this.components.get(componentType)!.set(entity, comp);

      if (comp && typeof (comp as ComponentLifecycleHook).onEnable === 'function') {
        (comp as ComponentLifecycleHook).onEnable!(entity, comp, this);
      }
    }
  }

  getComponent<T>(entity: EntityId, componentType: ComponentType<T>): T | undefined {
    const storage = this.components.get(componentType);
    return storage ? storage.get(entity) : undefined;
  }

  hasComponent<T>(entity: EntityId, componentType: ComponentType<T>): boolean {
    const storage = this.components.get(componentType);
    return storage ? storage.has(entity) : false;
  }

  getAllComponents(entity: EntityId): any[] {
    const comps: any[] = [];
    for (const storage of this.components.values()) {
      if (storage.has(entity)) {
        comps.push(storage.get(entity));
      }
    }
    return comps;
  }

  addTag(entity: EntityId, tag: string): void {
    const entityTags = this.tags.get(entity);
    if (entityTags) {
      entityTags.add(tag);
    }
  }

  hasTag(entity: EntityId, tag: string): boolean {
    const entityTags = this.tags.get(entity);
    return entityTags ? entityTags.has(tag) : false;
  }

  removeTag(entity: EntityId, tag: string): void {
    this.tags.get(entity)?.delete(tag);
  }



  query(queryDesc: Query): EntityId[] {
    const key = this.getQueryCacheKey(queryDesc);
    const cached = this.queryCache.get(key);
    if (cached) {
      return cached.slice();
    }

    let candidateEntities: Iterable<EntityId>;

    if (queryDesc.all.length > 0) {
      let minSize = Infinity;
      let smallestStorage: Map<EntityId, any> | undefined;

      for (const compType of queryDesc.all) {
        const storage = this.components.get(compType);
        if (!storage || storage.size === 0) {
          this.queryCache.set(key, []);
          return [];
        }
        if (storage.size < minSize) {
          minSize = storage.size;
          smallestStorage = storage;
        }
      }
      candidateEntities = smallestStorage!.keys();
    } else {
      candidateEntities = this.activeEntities;
    }

    const results: EntityId[] = [];
    for (const entity of candidateEntities) {
      if (queryDesc.matches(this, entity)) {
        results.push(entity);
      }
    }
    this.queryCache.set(key, results);
    return results.slice();
  }

  /**
   * Ultra-High Performance Direct Dual-Component Fast Iterator
   * Avoids query array allocations and map lookup overheads for 100,000+ entities
   */
  each2<A, B>(
    CompA: ComponentType<A>,
    CompB: ComponentType<B>,
    callback: (entity: EntityId, compA: A, compB: B) => void
  ): void {
    const storageA = this.components.get(CompA);
    const storageB = this.components.get(CompB);
    if (!storageA || !storageB) return;

    const [smaller, larger, isASmaller] = storageA.size <= storageB.size
      ? [storageA, storageB, true]
      : [storageB, storageA, false];

    for (const [entity, item] of smaller) {
      const other = larger.get(entity);
      if (other !== undefined) {
        if (isASmaller) {
          callback(entity, item as A, other as B);
        } else {
          callback(entity, other as A, item as B);
        }
      }
    }
  }



  addSystem(system: System): this {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
    return this;
  }

  removeSystem(system: System): void {
    const idx = this.systems.indexOf(system);
    if (idx !== -1) {
      this.systems.splice(idx, 1);
    }
  }

  update(delta: number, stage: SystemStage = SystemStage.Update): void {
    for (const system of this.systems) {
      if (system.enabled && system.stage === stage) {
        system.update(this, delta);
      }
    }
  }

  updateAll(delta: number): void {
    this.update(delta, SystemStage.PreUpdate);
    this.update(delta, SystemStage.Update);
    this.update(delta, SystemStage.PostUpdate);
  }

  /**
   * Run systems scheduled for the fixed-timestep stage. Wire this to the
   * engine's fixedUpdate event so physics-tied systems advance at a stable rate.
   */
  updateFixed(delta: number): void {
    this.update(delta, SystemStage.FixedUpdate);
  }

  get entityCount(): number {
    return this.activeEntities.size;
  }

  public app?: any;

  public setApp(app: any): void {
    this.app = app;
  }

  /**
   * Primary, intuitive entry point for adding an entity to the world.
   * Example: app.world.add('Player').sphere('blue').at(0, 2, 0).physics().spin();
   */
  add(name?: string): EntityHandle {
    return new EntityHandle(this, name);
  }

  /**
   * English-like, ergonomic entity creation entry point.
   * Example: world.entity('Player').model('Fox.glb').at(0, 1, 0).physics({ mass: 5 }).tag('player');
   */
  entity(name?: string): EntityHandle {
    return new EntityHandle(this, name);
  }

  /**
   * One-line asset & level loading directly into world and scene.
   * Example: const level = await world.load('assets/dungeon.blend');
   */
  load(assetUrl: string, name?: string): EntityHandle {
    const handle = new EntityHandle(this, name || assetUrl.split('/').pop() || 'LoadedAsset');
    handle.model(assetUrl);
    return handle;
  }

  /**
   * Fluent API for building an entity with components, tags, and shared contexts in concise lines of code.
   */
  buildEntity(name?: string): EntityBuilder {
    return new EntityBuilder(this, name);
  }

  /**
   * High-performance batch entity spawner with minimal allocation overhead.
   */
  spawnBatch(
    count: number,
    initializer: (builder: EntityBuilder, index: number) => void
  ): EntityId[] {
    const ids: EntityId[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const builder = new EntityBuilder(this);
      initializer(builder, i);
      ids[i] = builder.id;
    }
    return ids;
  }

  clear(): void {
    for (const entity of Array.from(this.activeEntities)) {
      this.destroyEntity(entity);
    }
    this.nextEntityId = 1;
  }

  serialize(): any {
    const entitiesData: Record<EntityId, any> = {};
    for (const entity of this.activeEntities) {
      const comps = this.getAllComponents(entity);
      entitiesData[entity] = {
        name: this.entityNames.get(entity),
        tags: Array.from(this.tags.get(entity) || []),
        components: comps.map(c => ({
          type: (c as any).constructor.name,
          data: c
        }))
      };
    }
    return {
      nextEntityId: this.nextEntityId,
      entities: entitiesData,
      parents: Array.from(this.parents.entries())
    };
  }

  deserialize(data: any, componentRegistry: Record<string, ComponentType>): void {
    this.clear();
    this.nextEntityId = data.nextEntityId || 1;
    
    // Reconstruct entities
    for (const [idStr, entityData] of Object.entries(data.entities)) {
      const entity = parseInt(idStr, 10);
      this.activeEntities.add(entity);
      this.tags.set(entity, new Set((entityData as any).tags));
      if ((entityData as any).name) {
        this.entityNames.set(entity, (entityData as any).name);
      }
      this.children.set(entity, new Set());
      
      // Reconstruct components
      for (const compData of (entityData as any).components) {
        const Ctor = componentRegistry[compData.type];
        if (Ctor) {
          const comp = new Ctor();
          Object.assign(comp, compData.data);
          this.addComponent(entity, comp);
        } else {
          console.warn(`[ECS] Deserialization missing component constructor: ${compData.type}`);
        }
      }
    }
    
    // Reconstruct parents
    for (const [child, parent] of data.parents || []) {
      this.setParent(child, parent as EntityId);
    }
  }
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
}

export interface PhysicsConfig {
  bodyType: 'static' | 'dynamic' | 'kinematic';
  mass: number;
  shape: 'box' | 'sphere' | 'capsule';
  restitution: number;
  friction: number;
}

export class TransformComponent implements TransformConfig {
  public x: number;
  public y: number;
  public z: number;
  public rx: number;
  public ry: number;
  public rz: number;
  public sx: number;
  public sy: number;
  public sz: number;

  constructor(config: Partial<TransformConfig> = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.z = config.z ?? 0;
    this.rx = config.rx ?? 0;
    this.ry = config.ry ?? 0;
    this.rz = config.rz ?? 0;
    this.sx = config.sx ?? 1;
    this.sy = config.sy ?? 1;
    this.sz = config.sz ?? 1;
  }
}

export class MeshComponent implements MeshConfig {
  public type: string;
  public color: string | number;
  public roughness: number;
  public metalness: number;
  public scale: [number, number, number];

  constructor(config: Partial<MeshConfig> = {}) {
    this.type = config.type ?? 'box';
    this.color = config.color ?? '#ffffff';
    this.roughness = config.roughness ?? 0.5;
    this.metalness = config.metalness ?? 0.0;
    this.scale = config.scale ?? [1, 1, 1];
  }
}

export class PhysicsComponent implements PhysicsConfig {
  public bodyType: 'static' | 'dynamic' | 'kinematic';
  public mass: number;
  public shape: 'box' | 'sphere' | 'capsule';
  public restitution: number;
  public friction: number;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.bodyType = config.bodyType ?? 'dynamic';
    this.mass = config.mass ?? 1.0;
    this.shape = config.shape ?? 'box';
    this.restitution = config.restitution ?? 0.3;
    this.friction = config.friction ?? 0.5;
  }
}

export class BehaviorComponent {
  public behaviorName?: string;
  public options: Record<string, any>;

  constructor(behaviorName?: string, options: Record<string, any> = {}) {
    this.behaviorName = behaviorName;
    this.options = options;
  }
}

/**
 * Ergonomic Fluent Entity Builder
 * Enables single-line entity creation with default values and optional function value overrides.
 */
export class EntityBuilder {
  private _entity: EntityId;
  private _world: World;

  constructor(world: World, name?: string) {
    this._world = world;
    this._entity = world.createEntity(name);
  }

  public get id(): EntityId {
    return this._entity;
  }

  public with<T>(component: T): this {
    this._world.addComponent(this._entity, component);
    return this;
  }

  public tag(tagName: string): this {
    this._world.addTag(this._entity, tagName);
    return this;
  }

  public parent(parentId: EntityId): this {
    this._world.setParent(this._entity, parentId);
    return this;
  }

  public sharedContext(contextId: string): this {
    this._world.sharedContexts.attachEntityToContext(this._entity, contextId);
    return this;
  }

  /** Ultra-concise position shorthand: .at(x, y, z) */
  public at(x: number, y: number = 0, z: number = 0): this {
    return this.transform({ x, y, z });
  }

  /**
   * One-line transform setter allowing default values and function value overrides:
   * .transform({ x: 0, y: 5 }) or .transform(def => ({ ...def, y: 10 }))
   */
  public transform(
    configOrFn?: Partial<TransformConfig> | ((defaults: TransformConfig) => Partial<TransformConfig>)
  ): this {
    const existing = this._world.getComponent(this._entity, TransformComponent) || new TransformComponent();
    let updated: Partial<TransformConfig> = {};
    if (typeof configOrFn === 'function') {
      updated = configOrFn(existing);
    } else if (configOrFn) {
      updated = configOrFn;
    }
    Object.assign(existing, updated);
    this._world.addComponent(this._entity, existing);
    return this;
  }

  /**
   * One-line mesh setter allowing string preset, object, or function value overrides:
   * .mesh('sphere') or .mesh('sphere', { color: '#ff0000' }) or .mesh('sphere', def => ({ ...def, color: '#00ff00' }))
   */
  public mesh(
    typeOrConfigOrFn?: string | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>),
    configOrFn?: Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)
  ): this {
    const existing = this._world.getComponent(this._entity, MeshComponent) || new MeshComponent();
    let updated: Partial<MeshConfig> = {};
    if (typeof typeOrConfigOrFn === 'string') {
      updated.type = typeOrConfigOrFn;
      if (typeof configOrFn === 'function') {
        updated = { ...updated, ...configOrFn({ ...existing, ...updated }) };
      } else if (configOrFn) {
        updated = { ...updated, ...configOrFn };
      }
    } else if (typeof typeOrConfigOrFn === 'function') {
      updated = typeOrConfigOrFn(existing);
    } else if (typeOrConfigOrFn) {
      updated = typeOrConfigOrFn;
    }
    Object.assign(existing, updated);
    this._world.addComponent(this._entity, existing);
    return this;
  }

  /**
   * One-line physics setter allowing default values and function value overrides:
   * .physics({ mass: 5 }) or .physics(def => ({ ...def, mass: 10 }))
   */
  public physics(
    configOrFn?: Partial<PhysicsConfig> | ((defaults: PhysicsConfig) => Partial<PhysicsConfig>)
  ): this {
    const existing = this._world.getComponent(this._entity, PhysicsComponent) || new PhysicsComponent();
    let updated: Partial<PhysicsConfig> = {};
    if (typeof configOrFn === 'function') {
      updated = configOrFn(existing);
    } else if (configOrFn) {
      updated = configOrFn;
    }
    Object.assign(existing, updated);
    this._world.addComponent(this._entity, existing);
    return this;
  }

  /** One-line color setter: .color('#ff0000') or .color(0x00ff00) */
  public color(colorHex: string | number): this {
    return this.mesh(defaults => ({ ...defaults, color: colorHex }));
  }

  /** One-line behavior setter: .behavior('spin', { speed: 2 }) or .behavior(def => ...) */
  public behavior(
    nameOrFn?: string | Record<string, any> | ((defaults: Record<string, any>) => Record<string, any>),
    options: Record<string, any> = {}
  ): this {
    const existing = this._world.getComponent(this._entity, BehaviorComponent) || new BehaviorComponent();
    if (typeof nameOrFn === 'string') {
      existing.behaviorName = nameOrFn;
      existing.options = { ...existing.options, ...options };
    } else if (typeof nameOrFn === 'function') {
      existing.options = nameOrFn(existing.options);
    } else if (nameOrFn) {
      existing.options = { ...existing.options, ...nameOrFn };
    }
    this._world.addComponent(this._entity, existing);
    return this;
  }

  /** Scale shorthand: .scale(20, 1, 20) or .scale(2) */
  public scale(x: number, y?: number, z?: number): this {
    const sx = x;
    const sy = y !== undefined ? y : x;
    const sz = z !== undefined ? z : x;
    return this.transform(defaults => ({ ...defaults, sx, sy, sz }));
  }

  /** Rotation shorthand: .rotate(45, 0, 90) */
  public rotate(rx: number, ry: number = 0, rz: number = 0): this {
    return this.transform(defaults => ({ ...defaults, rx, ry, rz }));
  }

  /** One-line spin motion helper: .spin(speed?) */
  public spin(speed: number = 1.5): this {
    return this.behavior('spin', { speed });
  }

  /** One-line bob motion helper: .bob(amount?, speed?) */
  public bob(amount: number = 0.25, speed: number = 3.0): this {
    return this.behavior('bob', { amount, speed });
  }

  /** One-line pulse motion helper: .pulse(min?, max?, speed?) */
  public pulse(min: number = 0.8, max: number = 1.2, speed: number = 4.0): this {
    return this.behavior('pulse', { min, max, speed });
  }

  /** One-line patrol motion helper: .patrol(distance?, speed?) */
  public patrol(distance: number = 4.0, speed: number = 2.5): this {
    return this.behavior('patrol', { distance, speed });
  }

  /** WASD / Arrow Key Player Movement Steering Trait */
  public move(speed: number = 5.0): this {
    return this.behavior('move', { speed });
  }

  /** Jump Motion Trait */
  public jump(force: number = 8.0): this {
    return this.behavior('jump', { force });
  }

  /** Native mobile touch joystick & action button trait */
  public mobileControls(): this {
    const world = (this as any)._world as World;
    if (world.app?.input) {
      world.app.input.setupMobileControls();
    }
    return this;
  }

  /** Destroy entity from world */
  public destroy(): void {
    this._world.destroyEntity(this._entity);
  }

  public build(): EntityId {
    return this._entity;
  }
}

/**
 * Ergonomic High-Level Entity Handle
 * Supports English-like chaining, primitive helpers, model loading, and Promise/thenable awaiting.
 */
export class EntityHandle extends EntityBuilder {
  private _pendingAsyncTasks: Promise<any>[] = [];

  constructor(world: World, name?: string) {
    super(world, name);
  }

  private _normalizeMeshArg(
    colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)
  ): Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>) | undefined {
    if (typeof colorOrConfigOrFn === 'string' || typeof colorOrConfigOrFn === 'number') {
      return { color: colorOrConfigOrFn };
    }
    return colorOrConfigOrFn;
  }

  public sphere(
    colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)
  ): this {
    return this.mesh('sphere', this._normalizeMeshArg(colorOrConfigOrFn));
  }

  public box(
    colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)
  ): this {
    return this.mesh('box', this._normalizeMeshArg(colorOrConfigOrFn));
  }

  public cylinder(
    colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)
  ): this {
    return this.mesh('cylinder', this._normalizeMeshArg(colorOrConfigOrFn));
  }

  public capsule(
    colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)
  ): this {
    return this.mesh('capsule', this._normalizeMeshArg(colorOrConfigOrFn));
  }

  public plane(
    colorOrConfigOrFn?: string | number | Partial<MeshConfig> | ((defaults: MeshConfig) => Partial<MeshConfig>)
  ): this {
    return this.mesh('plane', this._normalizeMeshArg(colorOrConfigOrFn));
  }

  /**
   * One-line model loader directly attached to entity & scene:
   * const player = await world.entity('Player').model('models/Fox.glb').at(0, 1, 0).physics({ mass: 5 });
   */
  public model(url: string): this {
    const task = (async () => {
      const world = (this as any)._world as World;
      if (world.app?.assets) {
        const loadedMesh = await world.app.assets.loadModel(url);
        if (loadedMesh) {
          this.with(loadedMesh);
          if (world.app.scene) {
            world.app.scene.add(loadedMesh);
          }
        }
      }
    })();
    this._pendingAsyncTasks.push(task);
    return this;
  }

  /**
   * One-line Sketchfab streamer directly attached to entity & scene:
   * const statue = await world.entity('Statue').sketchfab(url).spin(1);
   */
  public sketchfab(urlOrUid: string): this {
    const task = (async () => {
      const world = (this as any)._world as World;
      if (world.app?.assets) {
        const streamedMesh = await world.app.assets.streamSketchfabModel(urlOrUid);
        if (streamedMesh) {
          this.with(streamedMesh);
          if (world.app.scene) {
            world.app.scene.add(streamedMesh);
          }
        }
      }
    })();
    this._pendingAsyncTasks.push(task);
    return this;
  }

  /**
   * Promise/thenable interface for seamless sync & async chaining:
   * await world.entity('Player').model('player.glb')
   */
  public async then<TResult1 = EntityHandle, TResult2 = never>(
    onfulfilled?: ((value: EntityHandle) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      if (this._pendingAsyncTasks.length > 0) {
        await Promise.all(this._pendingAsyncTasks);
      }
      // Un-thenable proxy so V8 Promise A+ resolver doesn't recursively unbox 'this'
      const handleProxy = Object.create(this);
      handleProxy.then = undefined;
      return onfulfilled ? onfulfilled(handleProxy) : (handleProxy as any);
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }
}



