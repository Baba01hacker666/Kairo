import { EventEmitter } from './EventSystem.ts';

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'quest' | 'material' | 'misc' | string;

export interface ItemDef {
  /** Unique item identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Description or lore text. */
  description?: string;
  /** Classification of item. */
  type?: ItemType;
  /** Maximum stack size (default: 99; equipment defaults to 1). */
  maxStack?: number;
  /** Equipment slot type (e.g. 'weapon', 'head', 'chest', 'legs', 'shield', 'accessory'). */
  slotType?: string;
  /** Numeric stat modifiers applied when equipped (e.g. { attack: 10, defense: 5 }). */
  stats?: Record<string, number>;
  /** Gold / currency value. */
  price?: number;
  /** Icon or sprite asset identifier. */
  icon?: string;
  /** Arbitrary custom metadata. */
  metadata?: Record<string, any>;
  /** Callback executed when the item is used. Return false to prevent item consumption. */
  onUse?: (bag: InventoryBag, item: InventoryItem, entityId?: string) => boolean | void;
}

export interface InventoryItem {
  id: string;
  count: number;
  slot: number;
  customData?: Record<string, any>;
  durability?: number;
}

export interface ItemAddResult {
  success: boolean;
  added: number;
  remaining: number;
}

export interface InventorySnapshot {
  id: string;
  capacity: number;
  slots: (InventoryItem | null)[];
  equipment: Record<string, InventoryItem>;
}

/**
 * 🎒 InventoryBag
 * Manages item slots, stack limits, equipment slots, stat aggregation, and item events.
 */
export class InventoryBag {
  public readonly id: string;
  public capacity: number;
  public maxWeight?: number;
  public readonly slots: (InventoryItem | null)[];
  public readonly equipment: Map<string, InventoryItem> = new Map();
  public readonly events: EventEmitter = new EventEmitter();
  private system: InventorySystem;

  constructor(id: string, capacity: number = 20, system: InventorySystem, maxWeight?: number) {
    this.id = id;
    this.capacity = Math.max(1, capacity);
    this.system = system;
    this.maxWeight = maxWeight;
    this.slots = new Array(this.capacity).fill(null);
  }

  /**
   * Add items to the bag. Automatically stacks into existing slots before filling empty slots.
   */
  public addItem(itemId: string, count: number = 1, customData?: Record<string, any>): ItemAddResult {
    if (count <= 0) return { success: false, added: 0, remaining: count };

    const def = this.system.getItemDef(itemId);
    const maxStack = def?.maxStack ?? (def?.slotType ? 1 : 99);
    let remaining = count;
    let totalAdded = 0;

    // 1. Try to merge into existing non-full stacks (if stackable and no unique customData)
    if (maxStack > 1 && !customData) {
      for (let i = 0; i < this.slots.length && remaining > 0; i++) {
        const slotItem = this.slots[i];
        if (slotItem && slotItem.id === itemId && slotItem.count < maxStack && !slotItem.customData) {
          const space = maxStack - slotItem.count;
          const toAdd = Math.min(space, remaining);
          slotItem.count += toAdd;
          remaining -= toAdd;
          totalAdded += toAdd;

          this.events.emit('item_added', { itemId, count: toAdd, slot: i, bagId: this.id });
          this.system.events.emit('item_added', { itemId, count: toAdd, slot: i, bagId: this.id });
        }
      }
    }

    // 2. Place remaining items into empty slots
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      if (this.slots[i] === null) {
        const toAdd = Math.min(maxStack, remaining);
        const newItem: InventoryItem = {
          id: itemId,
          count: toAdd,
          slot: i,
          customData: customData ? { ...customData } : undefined
        };
        this.slots[i] = newItem;
        remaining -= toAdd;
        totalAdded += toAdd;

        this.events.emit('item_added', { itemId, count: toAdd, slot: i, bagId: this.id });
        this.system.events.emit('item_added', { itemId, count: toAdd, slot: i, bagId: this.id });
      }
    }

    if (totalAdded > 0) {
      this.events.emit('changed', this);
    }

    return {
      success: totalAdded > 0,
      added: totalAdded,
      remaining
    };
  }

  /**
   * Remove a quantity of an item from the bag across any matching slots.
   */
  public removeItem(itemId: string, count: number = 1): number {
    if (count <= 0) return 0;
    let needed = count;
    let totalRemoved = 0;

    for (let i = this.slots.length - 1; i >= 0 && needed > 0; i--) {
      const slotItem = this.slots[i];
      if (slotItem && slotItem.id === itemId) {
        const toRemove = Math.min(slotItem.count, needed);
        slotItem.count -= toRemove;
        needed -= toRemove;
        totalRemoved += toRemove;

        if (slotItem.count <= 0) {
          this.slots[i] = null;
        }

        this.events.emit('item_removed', { itemId, count: toRemove, slot: i, bagId: this.id });
        this.system.events.emit('item_removed', { itemId, count: toRemove, slot: i, bagId: this.id });
      }
    }

    if (totalRemoved > 0) {
      this.events.emit('changed', this);
    }

    return totalRemoved;
  }

  /**
   * Remove items from a specific slot index.
   */
  public removeItemAt(slotIndex: number, count?: number): InventoryItem | null {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return null;
    const item = this.slots[slotIndex];
    if (!item) return null;

    const removeCount = count !== undefined ? Math.min(item.count, Math.max(1, count)) : item.count;
    item.count -= removeCount;

    const removedItem: InventoryItem = {
      id: item.id,
      count: removeCount,
      slot: slotIndex,
      customData: item.customData ? { ...item.customData } : undefined,
      durability: item.durability
    };

    if (item.count <= 0) {
      this.slots[slotIndex] = null;
    }

    this.events.emit('item_removed', { itemId: removedItem.id, count: removeCount, slot: slotIndex, bagId: this.id });
    this.system.events.emit('item_removed', { itemId: removedItem.id, count: removeCount, slot: slotIndex, bagId: this.id });
    this.events.emit('changed', this);

    return removedItem;
  }

  /**
   * Check if the bag contains at least `count` of the specified item.
   */
  public hasItem(itemId: string, count: number = 1): boolean {
    return this.getItemCount(itemId) >= count;
  }

  /**
   * Count total instances of an item in the bag.
   */
  public getItemCount(itemId: string): number {
    let total = 0;
    for (const item of this.slots) {
      if (item && item.id === itemId) {
        total += item.count;
      }
    }
    return total;
  }

  /**
   * Get the item in a specific slot index.
   */
  public getItemAt(slotIndex: number): InventoryItem | null {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return null;
    return this.slots[slotIndex];
  }

  /**
   * Swap the contents of two slots, or merge them if they are identical stackable items.
   */
  public swapSlots(fromSlot: number, toSlot: number): boolean {
    if (fromSlot < 0 || fromSlot >= this.slots.length || toSlot < 0 || toSlot >= this.slots.length) return false;
    if (fromSlot === toSlot) return true;

    const itemA = this.slots[fromSlot];
    const itemB = this.slots[toSlot];

    // If both are same stackable item without unique customData, merge from A into B
    if (itemA && itemB && itemA.id === itemB.id && !itemA.customData && !itemB.customData) {
      const def = this.system.getItemDef(itemA.id);
      const maxStack = def?.maxStack ?? 99;
      if (itemB.count < maxStack) {
        const space = maxStack - itemB.count;
        const transfer = Math.min(space, itemA.count);
        itemB.count += transfer;
        itemA.count -= transfer;
        if (itemA.count <= 0) {
          this.slots[fromSlot] = null;
        }
        this.events.emit('changed', this);
        return true;
      }
    }

    // Normal swap
    if (itemA) itemA.slot = toSlot;
    if (itemB) itemB.slot = fromSlot;
    this.slots[fromSlot] = itemB;
    this.slots[toSlot] = itemA;

    this.events.emit('changed', this);
    return true;
  }

  /**
   * Split a stack from one slot into another empty or partially filled slot.
   */
  public splitStack(fromSlot: number, toSlot: number, count: number): boolean {
    if (fromSlot < 0 || fromSlot >= this.slots.length || toSlot < 0 || toSlot >= this.slots.length) return false;
    if (fromSlot === toSlot || count <= 0) return false;

    const source = this.slots[fromSlot];
    if (!source || source.count <= count) return false;

    const dest = this.slots[toSlot];
    if (dest === null) {
      source.count -= count;
      this.slots[toSlot] = {
        id: source.id,
        count,
        slot: toSlot,
        customData: source.customData ? { ...source.customData } : undefined
      };
      this.events.emit('changed', this);
      return true;
    } else if (dest.id === source.id && !source.customData && !dest.customData) {
      const def = this.system.getItemDef(source.id);
      const maxStack = def?.maxStack ?? 99;
      const space = maxStack - dest.count;
      const transfer = Math.min(space, count);
      if (transfer > 0) {
        source.count -= transfer;
        dest.count += transfer;
        this.events.emit('changed', this);
        return true;
      }
    }

    return false;
  }

  /**
   * Equip an item from a slot into its designated equipment slot.
   */
  public equip(slotIndex: number, targetSlotType?: string): boolean {
    const item = this.getItemAt(slotIndex);
    if (!item) return false;

    const def = this.system.getItemDef(item.id);
    const slotType = targetSlotType || def?.slotType;
    if (!slotType) return false;

    // Remove single item from slot
    const equippedItem = this.removeItemAt(slotIndex, 1);
    if (!equippedItem) return false;

    // If an item is already equipped, put it back into the bag
    const previousEquipped = this.equipment.get(slotType);
    if (previousEquipped) {
      this.addItem(previousEquipped.id, previousEquipped.count, previousEquipped.customData);
      this.events.emit('item_unequipped', { itemId: previousEquipped.id, slotType, bagId: this.id });
      this.system.events.emit('item_unequipped', { itemId: previousEquipped.id, slotType, bagId: this.id });
    }

    this.equipment.set(slotType, equippedItem);
    this.events.emit('item_equipped', { itemId: equippedItem.id, slotType, bagId: this.id });
    this.system.events.emit('item_equipped', { itemId: equippedItem.id, slotType, bagId: this.id });
    this.events.emit('changed', this);

    return true;
  }

  /**
   * Unequip an item from an equipment slot and place it back into the bag.
   */
  public unequip(slotType: string, targetSlotIndex?: number): boolean {
    const equipped = this.equipment.get(slotType);
    if (!equipped) return false;

    if (this.isFull()) return false;

    this.equipment.delete(slotType);

    if (targetSlotIndex !== undefined && targetSlotIndex >= 0 && targetSlotIndex < this.slots.length && this.slots[targetSlotIndex] === null) {
      equipped.slot = targetSlotIndex;
      this.slots[targetSlotIndex] = equipped;
    } else {
      this.addItem(equipped.id, equipped.count, equipped.customData);
    }

    this.events.emit('item_unequipped', { itemId: equipped.id, slotType, bagId: this.id });
    this.system.events.emit('item_unequipped', { itemId: equipped.id, slotType, bagId: this.id });
    this.events.emit('changed', this);

    return true;
  }

  /**
   * Get an equipped item by slot type.
   */
  public getEquipped(slotType: string): InventoryItem | null {
    return this.equipment.get(slotType) ?? null;
  }

  /**
   * Get all currently equipped items as a record.
   */
  public getAllEquipped(): Record<string, InventoryItem> {
    const result: Record<string, InventoryItem> = {};
    this.equipment.forEach((item, slotType) => {
      result[slotType] = item;
    });
    return result;
  }

  /**
   * Aggregate total stats from all currently equipped items.
   */
  public getTotalStats(): Record<string, number> {
    const totalStats: Record<string, number> = {};
    this.equipment.forEach((item) => {
      const def = this.system.getItemDef(item.id);
      if (def?.stats) {
        for (const [stat, val] of Object.entries(def.stats)) {
          totalStats[stat] = (totalStats[stat] ?? 0) + val;
        }
      }
    });
    return totalStats;
  }

  /**
   * Use an item in a specific slot (triggers onUse handler and consumes 1 if not prevented).
   */
  public useItem(slotIndex: number, entityId?: string): boolean {
    const item = this.getItemAt(slotIndex);
    if (!item) return false;

    const def = this.system.getItemDef(item.id);
    let shouldConsume = true;

    if (def?.onUse) {
      const res = def.onUse(this, item, entityId);
      if (res === false) {
        shouldConsume = false;
      }
    }

    if (shouldConsume) {
      this.removeItemAt(slotIndex, 1);
    }

    this.events.emit('item_used', { itemId: item.id, slot: slotIndex, bagId: this.id, entityId });
    this.system.events.emit('item_used', { itemId: item.id, slot: slotIndex, bagId: this.id, entityId });
    return true;
  }

  /**
   * Clear all slots and unequip all items.
   */
  public clear(): void {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i] = null;
    }
    this.equipment.clear();
    this.events.emit('changed', this);
  }

  public isFull(): boolean {
    return this.slots.every(slot => slot !== null);
  }

  public getEmptySlotCount(): number {
    return this.slots.filter(slot => slot === null).length;
  }

  public serialize(): InventorySnapshot {
    const equipRecord: Record<string, InventoryItem> = {};
    this.equipment.forEach((val, key) => {
      equipRecord[key] = { ...val };
    });

    return {
      id: this.id,
      capacity: this.capacity,
      slots: this.slots.map(s => s ? { ...s } : null),
      equipment: equipRecord
    };
  }

  public deserialize(snapshot: InventorySnapshot): void {
    this.capacity = snapshot.capacity;
    this.slots.length = this.capacity;
    for (let i = 0; i < this.capacity; i++) {
      this.slots[i] = snapshot.slots[i] ? { ...snapshot.slots[i]! } : null;
    }
    this.equipment.clear();
    if (snapshot.equipment) {
      for (const [slotType, item] of Object.entries(snapshot.equipment)) {
        this.equipment.set(slotType, { ...item });
      }
    }
    this.events.emit('changed', this);
  }
}

/**
 * 🎒 InventorySystem
 * Master system for item registry, multiple inventory bags (player, chests, vendors),
 * item transfers, and global inventory events.
 */
export class InventorySystem {
  private itemDefs: Map<string, ItemDef> = new Map();
  private bags: Map<string, InventoryBag> = new Map();
  public readonly events: EventEmitter = new EventEmitter();
  public readonly player: InventoryBag;

  constructor() {
    this.player = this.createBag('player', { capacity: 24 });
  }

  /**
   * Register a new item definition.
   */
  public defineItem(def: ItemDef): ItemDef {
    this.itemDefs.set(def.id, def);
    return def;
  }

  /**
   * Register multiple item definitions in batch.
   */
  public defineItems(defs: ItemDef[]): void {
    defs.forEach(d => this.defineItem(d));
  }

  /**
   * Get an item definition by ID.
   */
  public getItemDef(id: string): ItemDef | undefined {
    return this.itemDefs.get(id);
  }

  /**
   * Check if an item definition exists.
   */
  public hasItemDef(id: string): boolean {
    return this.itemDefs.has(id);
  }

  /**
   * Create or retrieve an inventory bag container.
   */
  public createBag(id: string, options: { capacity?: number; maxWeight?: number } = {}): InventoryBag {
    if (this.bags.has(id)) {
      return this.bags.get(id)!;
    }
    const bag = new InventoryBag(id, options.capacity ?? 20, this, options.maxWeight);
    this.bags.set(id, bag);
    return bag;
  }

  /**
   * Get a bag container by ID.
   */
  public getBag(id: string): InventoryBag | undefined {
    return this.bags.get(id);
  }

  /**
   * Remove a bag container.
   */
  public removeBag(id: string): void {
    if (id === 'player') return; // protect default player bag
    this.bags.delete(id);
  }

  /**
   * Transfer items between two bags (e.g. looting a chest or moving to bank).
   */
  public transferItem(fromBagId: string, toBagId: string, fromSlot: number, count?: number): boolean {
    const fromBag = this.getBag(fromBagId);
    const toBag = this.getBag(toBagId);
    if (!fromBag || !toBag) return false;

    const item = fromBag.getItemAt(fromSlot);
    if (!item) return false;

    const transferCount = count !== undefined ? Math.min(item.count, count) : item.count;
    if (transferCount <= 0) return false;

    const addResult = toBag.addItem(item.id, transferCount, item.customData);
    if (addResult.added > 0) {
      fromBag.removeItemAt(fromSlot, addResult.added);
      this.events.emit('item_transferred', {
        itemId: item.id,
        count: addResult.added,
        fromBagId,
        toBagId
      });
      return true;
    }

    return false;
  }

  /**
   * Snapshot all bags for persistent saves.
   */
  public serialize(): Record<string, InventorySnapshot> {
    const data: Record<string, InventorySnapshot> = {};
    this.bags.forEach((bag, id) => {
      data[id] = bag.serialize();
    });
    return data;
  }

  /**
   * Restore all bags from saved snapshot data.
   */
  public deserialize(data: Record<string, InventorySnapshot>): void {
    if (!data) return;
    for (const [id, snap] of Object.entries(data)) {
      let bag = this.getBag(id);
      if (!bag) {
        bag = this.createBag(id, { capacity: snap.capacity });
      }
      bag.deserialize(snap);
    }
  }
}
