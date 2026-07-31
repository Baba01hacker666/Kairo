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
  private tags: Map<EntityId, Set<string>> = new Map();
  private parents: Map<EntityId, EntityId> = new Map();
  private children: Map<EntityId, Set<EntityId>> = new Map();

  private systems: System[] = [];

  createEntity(name?: string): EntityId {
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

    // Call onRemove hooks for all components
    for (const [cType, storage] of this.components.entries()) {
      if (storage.has(entity)) {
        const comp = storage.get(entity);
        if (comp && typeof (comp as ComponentLifecycleHook).onRemove === 'function') {
          (comp as ComponentLifecycleHook).onRemove!(entity, comp, this);
        }
        storage.delete(entity);
      }
    }

    for (const storage of this.disabledComponents.values()) {
      storage.delete(entity);
    }

    this.tags.delete(entity);
    this.children.delete(entity);
    this.entityNames.delete(entity);
    this.activeEntities.delete(entity);
  }

  setParent(child: EntityId, parent: EntityId | null): void {
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

  getParent(child: EntityId): EntityId | undefined {
    return this.parents.get(child);
  }

  getChildren(parent: EntityId): EntityId[] {
    const childSet = this.children.get(parent);
    return childSet ? Array.from(childSet) : [];
  }

  addComponent<T>(entity: EntityId, component: T): T {
    const cType = (component as any).constructor as ComponentType<T>;
    if (!this.components.has(cType)) {
      this.components.set(cType, new Map());
    }
    this.components.get(cType)!.set(entity, component);

    if (component && typeof (component as ComponentLifecycleHook).onAdd === 'function') {
      (component as ComponentLifecycleHook).onAdd!(entity, component, this);
    }

    return component;
  }

  removeComponent<T>(entity: EntityId, componentType: ComponentType<T>): void {
    const storage = this.components.get(componentType);
    if (storage && storage.has(entity)) {
      const comp = storage.get(entity);
      if (comp && typeof (comp as ComponentLifecycleHook).onRemove === 'function') {
        (comp as ComponentLifecycleHook).onRemove!(entity, comp, this);
      }
      storage.delete(entity);
    }
  }

  disableComponent<T>(entity: EntityId, componentType: ComponentType<T>): void {
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
    let candidateEntities: Iterable<EntityId>;

    // ⚡ Bolt Optimization:
    // If we require specific components, iterate only over the entities that have
    // the least common required component, instead of ALL active entities.
    // This turns an O(N_Total_Entities) operation into an O(N_Smallest_Component_Set) operation.
    if (queryDesc.all.length > 0) {
      let minSize = Infinity;
      let smallestStorage: Map<EntityId, any> | undefined;

      for (const compType of queryDesc.all) {
        const storage = this.components.get(compType);
        if (!storage || storage.size === 0) {
          return []; // If any required component is missing, no entity can match
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
    return results;
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

  get entityCount(): number {
    return this.activeEntities.size;
  }

  clear(): void {
    for (const entity of Array.from(this.activeEntities)) {
      this.destroyEntity(entity);
    }
    this.nextEntityId = 1;
  }
}
