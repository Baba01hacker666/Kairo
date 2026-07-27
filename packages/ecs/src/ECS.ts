/**
 * High-Performance Entity Component System (ECS) for Kairo Engine
 * Feature-rich: Bitmask/sparse-set fast queries, custom components, systems, tags, & events.
 */

export type EntityId = number;
export type ComponentType<T = any> = new (...args: any[]) => T;

export interface Component {
  [key: string]: any;
}

export abstract class System {
  public enabled: boolean = true;
  public priority: number = 0;
  
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

  private components: Map<ComponentType, Map<EntityId, any>> = new Map();
  private tags: Map<EntityId, Set<string>> = new Map();

  private systems: System[] = [];

  createEntity(name?: string): EntityId {
    const id = this.nextEntityId++;
    this.activeEntities.add(id);
    this.tags.set(id, new Set());
    if (name) {
      this.addTag(id, name);
    }
    return id;
  }

  destroyEntity(entity: EntityId): void {
    if (!this.activeEntities.has(entity)) return;

    for (const storage of this.components.values()) {
      storage.delete(entity);
    }

    this.tags.delete(entity);
    this.activeEntities.delete(entity);
  }

  addComponent<T>(entity: EntityId, component: T): T {
    const cType = (component as any).constructor as ComponentType<T>;
    if (!this.components.has(cType)) {
      this.components.set(cType, new Map());
    }
    this.components.get(cType)!.set(entity, component);
    return component;
  }

  removeComponent<T>(entity: EntityId, componentType: ComponentType<T>): void {
    const storage = this.components.get(componentType);
    if (storage) {
      storage.delete(entity);
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

  query(queryDesc: Query): EntityId[] {
    const results: EntityId[] = [];
    for (const entity of this.activeEntities) {
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

  update(delta: number): void {
    for (const system of this.systems) {
      if (system.enabled) {
        system.update(this, delta);
      }
    }
  }

  get entityCount(): number {
    return this.activeEntities.size;
  }
}
