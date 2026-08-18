import test from 'node:test';
import assert from 'node:assert';
import { InventorySystem, InventoryBag } from '../packages/core/src/Inventory.ts';
import { World, InventoryComponent } from '../packages/ecs/src/ECS.ts';

test('InventoryBag - addItem with stacking and slot allocation', () => {
  const system = new InventorySystem();
  system.defineItem({
    id: 'health_potion',
    name: 'Health Potion',
    type: 'consumable',
    maxStack: 5
  });

  const bag = system.createBag('test_bag', { capacity: 4 });

  // Add 3 potions
  const res1 = bag.addItem('health_potion', 3);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.added, 3);
  assert.strictEqual(res1.remaining, 0);
  assert.strictEqual(bag.getItemCount('health_potion'), 3);
  assert.strictEqual(bag.slots[0]?.count, 3);

  // Add 4 more potions (should fill slot 0 with 2 to reach maxStack 5, and put remaining 2 in slot 1)
  const res2 = bag.addItem('health_potion', 4);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.added, 4);
  assert.strictEqual(res2.remaining, 0);
  assert.strictEqual(bag.getItemCount('health_potion'), 7);
  assert.strictEqual(bag.slots[0]?.count, 5);
  assert.strictEqual(bag.slots[1]?.count, 2);
  assert.strictEqual(bag.slots[2], null);
});

test('InventoryBag - removeItem and partial counts across slots', () => {
  const system = new InventorySystem();
  system.defineItem({ id: 'wood', name: 'Wood', maxStack: 10 });
  const bag = system.createBag('wood_bag', { capacity: 5 });

  bag.addItem('wood', 15); // slot 0 = 10, slot 1 = 5
  assert.strictEqual(bag.getItemCount('wood'), 15);

  const removed = bag.removeItem('wood', 8);
  assert.strictEqual(removed, 8);
  assert.strictEqual(bag.getItemCount('wood'), 7);
  // slot 1 (5) emptied, slot 0 had 3 removed -> 7 remaining in slot 0
  assert.strictEqual(bag.slots[0]?.count, 7);
  assert.strictEqual(bag.slots[1], null);
});

test('InventoryBag - swapSlots and stack merging', () => {
  const system = new InventorySystem();
  system.defineItem({ id: 'coin', name: 'Gold Coin', maxStack: 100 });
  const bag = system.createBag('wallet', { capacity: 5 });

  bag.addItem('coin', 40);
  // manual insert in slot 3
  bag.slots[3] = { id: 'coin', count: 30, slot: 3 };

  // Merging slot 0 (40) into slot 3 (30) -> slot 3 gets 70, slot 0 is emptied
  const swapResult = bag.swapSlots(0, 3);
  assert.strictEqual(swapResult, true);
  assert.strictEqual(bag.slots[3]?.count, 70);
  assert.strictEqual(bag.slots[0], null);
  assert.strictEqual(bag.getItemCount('coin'), 70);
});

test('InventoryBag - Equipment slots and stat bonus calculation', () => {
  const system = new InventorySystem();
  system.defineItem({
    id: 'iron_sword',
    name: 'Iron Sword',
    type: 'weapon',
    slotType: 'weapon',
    maxStack: 1,
    stats: { attack: 15 }
  });

  system.defineItem({
    id: 'steel_shield',
    name: 'Steel Shield',
    type: 'armor',
    slotType: 'shield',
    maxStack: 1,
    stats: { defense: 10, attack: 2 }
  });

  const bag = system.player;
  bag.clear();
  bag.addItem('iron_sword', 1);
  bag.addItem('steel_shield', 1);

  // Equip sword from slot 0
  const equipSword = bag.equip(0);
  assert.strictEqual(equipSword, true);
  assert.strictEqual(bag.slots[0], null);
  assert.strictEqual(bag.getEquipped('weapon')?.id, 'iron_sword');

  // Equip shield from slot 1
  const equipShield = bag.equip(1);
  assert.strictEqual(equipShield, true);
  assert.strictEqual(bag.slots[1], null);
  assert.strictEqual(bag.getEquipped('shield')?.id, 'steel_shield');

  // Verify aggregated total stats
  const totalStats = bag.getTotalStats();
  assert.strictEqual(totalStats.attack, 17);
  assert.strictEqual(totalStats.defense, 10);

  // Unequip sword
  const unequipSword = bag.unequip('weapon');
  assert.strictEqual(unequipSword, true);
  assert.strictEqual(bag.getEquipped('weapon'), null);
  assert.strictEqual(bag.getItemCount('iron_sword'), 1);
  assert.strictEqual(bag.getTotalStats().attack, 2);
});

test('InventoryBag - Item onUse consumption and cancellation', () => {
  let usedTimes = 0;
  const system = new InventorySystem();
  system.defineItem({
    id: 'apple',
    name: 'Apple',
    onUse: (bag, item, entityId) => {
      usedTimes++;
    }
  });

  system.defineItem({
    id: 'permanent_compass',
    name: 'Magic Compass',
    onUse: () => {
      return false; // Prevent consumption
    }
  });

  const bag = system.player;
  bag.clear();
  bag.addItem('apple', 2);
  bag.addItem('permanent_compass', 1);

  // Use apple -> consumed
  bag.useItem(0);
  assert.strictEqual(usedTimes, 1);
  assert.strictEqual(bag.getItemCount('apple'), 1);

  // Use compass -> NOT consumed
  bag.useItem(1);
  assert.strictEqual(bag.getItemCount('permanent_compass'), 1);
});

test('InventorySystem - transferItem between containers', () => {
  const system = new InventorySystem();
  system.defineItem({ id: 'diamond', name: 'Diamond', maxStack: 10 });

  const chest = system.createBag('treasure_chest', { capacity: 10 });
  const player = system.player;
  player.clear();

  chest.addItem('diamond', 5);

  const transferOk = system.transferItem('treasure_chest', 'player', 0, 3);
  assert.strictEqual(transferOk, true);
  assert.strictEqual(chest.getItemCount('diamond'), 2);
  assert.strictEqual(player.getItemCount('diamond'), 3);
});

test('InventorySystem - Serialization and Deserialization round trip', () => {
  const system = new InventorySystem();
  system.defineItem({ id: 'ruby', name: 'Ruby', maxStack: 20 });
  system.defineItem({ id: 'helmet', name: 'Iron Helmet', slotType: 'head', stats: { defense: 5 } });

  const bag = system.player;
  bag.clear();
  bag.addItem('ruby', 12);
  bag.addItem('helmet', 1);
  bag.equip(1);

  const snapshot = system.serialize();

  // Create fresh system and restore
  const restoredSystem = new InventorySystem();
  restoredSystem.defineItem({ id: 'ruby', name: 'Ruby', maxStack: 20 });
  restoredSystem.defineItem({ id: 'helmet', name: 'Iron Helmet', slotType: 'head', stats: { defense: 5 } });
  restoredSystem.deserialize(snapshot);

  const restoredBag = restoredSystem.player;
  assert.strictEqual(restoredBag.getItemCount('ruby'), 12);
  assert.strictEqual(restoredBag.getEquipped('head')?.id, 'helmet');
  assert.strictEqual(restoredBag.getTotalStats().defense, 5);
});

test('ECS - EntityBuilder .inventory() trait', () => {
  const world = new World();
  const entity = world.buildEntity('Hero')
    .at(0, 1, 0)
    .inventory(30, 'hero_bag')
    .build();

  const comp = world.getComponent(entity, InventoryComponent);
  assert.ok(comp);
  assert.strictEqual(comp.capacity, 30);
  assert.strictEqual(comp.bagId, 'hero_bag');
});
