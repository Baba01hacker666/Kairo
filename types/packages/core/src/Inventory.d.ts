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
export declare class InventoryBag {
    readonly id: string;
    capacity: number;
    maxWeight?: number;
    readonly slots: (InventoryItem | null)[];
    readonly equipment: Map<string, InventoryItem>;
    readonly events: EventEmitter;
    private system;
    constructor(id: string, capacity: number | undefined, system: InventorySystem, maxWeight?: number);
    /**
     * Add items to the bag. Automatically stacks into existing slots before filling empty slots.
     */
    addItem(itemId: string, count?: number, customData?: Record<string, any>): ItemAddResult;
    /**
     * Remove a quantity of an item from the bag across any matching slots.
     */
    removeItem(itemId: string, count?: number): number;
    /**
     * Remove items from a specific slot index.
     */
    removeItemAt(slotIndex: number, count?: number): InventoryItem | null;
    /**
     * Check if the bag contains at least `count` of the specified item.
     */
    hasItem(itemId: string, count?: number): boolean;
    /**
     * Count total instances of an item in the bag.
     */
    getItemCount(itemId: string): number;
    /**
     * Get the item in a specific slot index.
     */
    getItemAt(slotIndex: number): InventoryItem | null;
    /**
     * Swap the contents of two slots, or merge them if they are identical stackable items.
     */
    swapSlots(fromSlot: number, toSlot: number): boolean;
    /**
     * Split a stack from one slot into another empty or partially filled slot.
     */
    splitStack(fromSlot: number, toSlot: number, count: number): boolean;
    /**
     * Equip an item from a slot into its designated equipment slot.
     */
    equip(slotIndex: number, targetSlotType?: string): boolean;
    /**
     * Unequip an item from an equipment slot and place it back into the bag.
     */
    unequip(slotType: string, targetSlotIndex?: number): boolean;
    /**
     * Get an equipped item by slot type.
     */
    getEquipped(slotType: string): InventoryItem | null;
    /**
     * Get all currently equipped items as a record.
     */
    getAllEquipped(): Record<string, InventoryItem>;
    /**
     * Aggregate total stats from all currently equipped items.
     */
    getTotalStats(): Record<string, number>;
    /**
     * Use an item in a specific slot (triggers onUse handler and consumes 1 if not prevented).
     */
    useItem(slotIndex: number, entityId?: string): boolean;
    /**
     * Clear all slots and unequip all items.
     */
    clear(): void;
    isFull(): boolean;
    getEmptySlotCount(): number;
    serialize(): InventorySnapshot;
    deserialize(snapshot: InventorySnapshot): void;
}
/**
 * 🎒 InventorySystem
 * Master system for item registry, multiple inventory bags (player, chests, vendors),
 * item transfers, and global inventory events.
 */
export declare class InventorySystem {
    private itemDefs;
    private bags;
    readonly events: EventEmitter;
    readonly player: InventoryBag;
    constructor();
    /**
     * Register a new item definition.
     */
    defineItem(def: ItemDef): ItemDef;
    /**
     * Register multiple item definitions in batch.
     */
    defineItems(defs: ItemDef[]): void;
    /**
     * Get an item definition by ID.
     */
    getItemDef(id: string): ItemDef | undefined;
    /**
     * Check if an item definition exists.
     */
    hasItemDef(id: string): boolean;
    /**
     * Create or retrieve an inventory bag container.
     */
    createBag(id: string, options?: {
        capacity?: number;
        maxWeight?: number;
    }): InventoryBag;
    /**
     * Get a bag container by ID.
     */
    getBag(id: string): InventoryBag | undefined;
    /**
     * Remove a bag container.
     */
    removeBag(id: string): void;
    /**
     * Transfer items between two bags (e.g. looting a chest or moving to bank).
     */
    transferItem(fromBagId: string, toBagId: string, fromSlot: number, count?: number): boolean;
    /**
     * Snapshot all bags for persistent saves.
     */
    serialize(): Record<string, InventorySnapshot>;
    /**
     * Restore all bags from saved snapshot data.
     */
    deserialize(data: Record<string, InventorySnapshot>): void;
}
