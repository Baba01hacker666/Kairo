# 🎮 Making a Game in Kairo Engine — The Kairo Way

> **Core Philosophy**: *"Describe what you want, and it exists." Zero configuration on the common path, smart defaults by default, and expressive English-like verbs.*

---

## 🚀 1. The "Wow" 30-Second Blueprint

Open Kairo and build a running 3D game in 10 lines of code:

```typescript
import { KairoApp } from '@kairo/core';

// 1. Zero-Config App Setup
const app = new KairoApp('#game');

// 2. Add Ground
app.world.add('Ground')
  .box()
  .scale(20, 1, 20);

// 3. Add Player with Physics & Motion
app.world.add('Player')
  .sphere('blue')
  .at(0, 2, 0)
  .physics()
  .spin();

// 4. Add Enemy
app.world.add('Enemy')
  .sphere('red')
  .at(5, 1, 0);

// 5. Start Engine
app.engine.start();
```

---

## 🛠️ 2. Natural Feature Discovery

| Verb | Description | Code Example |
| :--- | :--- | :--- |
| **Add Primitive** | Zero-config or color shorthand | `app.world.add('Hero').sphere('blue')` |
| **Position** | Move object in 3D space | `player.at(0, 2, 0)` |
| **Scale & Rotate** | Adjust size and rotation | `ground.scale(20, 1, 20).rotate(0, 45, 0)` |
| **Physics** | Smart dynamic collision defaults | `player.physics()` or `player.physics({ mass: 10 })` |
| **Character Control**| Steering & jump helpers | `player.move().jump()` |
| **Load Model** | Load GLB/GLTF direct to scene | `app.world.add('Player').model('player.glb')` |
| **Load Whole Level**| Load `.blend` direct to world | `await app.world.load('dungeon.blend')` |
| **Stream Internet Asset**| Stream Sketchfab 3D models | `await app.world.add('Statue').sketchfab(url)` |
| **Motion Traits** | 1-word automatic behaviors | `enemy.spin().bob().pulse().patrol()` |
| **Destroy** | Clean entity destruction | `enemy.destroy()` |


---

## ⚡ 2. High-Performance Spawning (`spawnBatch`)

When spawning large numbers of game objects (collectibles, enemies, obstacles, particles), avoid looping with individual allocations. Use **`spawnBatch`** for continuous memory allocation with **0 Garbage Collection overhead**:

```typescript
// Register flyweight archetype context for 500 collectible gems
app.world.createSharedContext('GemCollectible', {
  value: 10,
  sfx: 'coin',
  color: 0x3b82f6
});

// Batch spawn 500 gems in 1 contiguous execution block
const gemEntities = app.world.spawnBatch(500, (builder, i) => {
  const x = (Math.random() - 0.5) * 100;
  const z = (Math.random() - 0.5) * 100;

  builder
    .sharedContext('GemCollectible')
    .tag('collectible');
});
```

---

## 🧩 3. Versatile Game Systems (Composition First)

To keep your game modular and versatile across genres (2D, 3D, puzzle, platformer, action):

### **Define Pure Data Components**
```typescript
class Position {
  constructor(public x = 0, public y = 0, public z = 0) {}
}

class Health {
  constructor(public current = 100, public max = 100) {}
}
```

### **Define System Logic**
```typescript
import { System, Query } from '@kairo/ecs';

class HealthSystem extends System {
  update(world, dt) {
    const entities = world.query(new Query([Health]));
    for (const id of entities) {
      const health = world.getComponent(id, Health);
      if (health.current <= 0) {
        world.destroyEntity(id); // Clean Destruction Hook
      }
    }
  }
}

app.world.addSystem(new HealthSystem());
```

---

## 🎨 4. Adding Built-in Visual Shaders

Custom graphics take zero extra GLSL boilerplate in Kairo. Use built-in material shader presets:

```typescript
import { ShaderPresets, Material } from '@kairo/renderer';

// Create procedural water material
const waterMat = ShaderPresets.createWaterShader();
waterMat.setUniform('u_waveHeight', 0.3);
waterMat.setUniform('u_waveSpeed', 2.0);

// Apply Dissolve Noise shader to boss enemy
const bossMat = new Material('BossMaterial');
bossMat.setShaderPreset('dissolve');
```

---

## 🎬 5. Cutscenes & Camera Choreography

Add cinematic cutscenes in single-line async commands:

```typescript
// Cutscene sequence with zero callback nesting
app.cutscene.runSequence(async () => {
  await app.cameraController.panTo([0, 10, 20], [0, 0, 0], [0, 2, 0], 2.0);
  app.ui.showToast('⚠️ Defeat the Dungeon Guardian!');
  await app.cameraController.dollyZoom(45, 1.5);
});
```

---

## 🎒 6. Inventory & Equipment System

Easily manage player loot, equipment slots, and stat bonuses:

```typescript
// 1. Define items
app.inventory.defineItem({
  id: 'ancient_sword',
  name: 'Ancient Sword',
  slotType: 'weapon',
  stats: { attack: 25 }
});

// 2. Add to player bag and equip
app.inventory.player.addItem('ancient_sword', 1);
app.inventory.player.equip(0); // Equips item from slot 0 to weapon slot

// 3. Read aggregated stats
const totalStats = app.inventory.player.getTotalStats();
console.log(totalStats.attack); // 25
```

---

## 🤖 7. Finite State Machines & Combo Inputs

Create clean, bug-free enemy and character controllers:

```typescript
import { StateMachine } from '@kairo/ai';

// Finite State Machine
const fsm = new StateMachine(enemy)
  .state('patrol', { onUpdate: (e, dt) => e.patrol() })
  .state('chase', { onUpdate: (e, dt) => e.chasePlayer(dt) })
  .state('attack', { onEnter: (e) => e.playAttackAnim() })
  .transition('patrol', 'chase', (e) => e.canSeePlayer)
  .transition('chase', 'attack', (e) => e.distanceToPlayer < 2)
  .transition('*', 'dead', (e) => e.health <= 0);

// Fighting Game Combos & Dash Sequences
app.input.registerCombo('double_dash', ['KeyD', 'KeyD'], () => {
  player.dash(15);
});
```

---

## 🎙️ 8. Character Voices & Text Line Management

Give characters unique procedural typewriter voices (Undertale / Animal Crossing style) and manage localization:

```typescript
// 1. Register speaker profile with custom voice
app.text.registerSpeaker({
  id: 'elder_owl',
  name: 'Elder Owl',
  avatar: 'assets/owl.png',
  voice: 'owl', // Built-in preset ('owl', 'fox', 'wisp', 'duck', 'robot', 'chime')
  color: '#a855f7'
});

// 2. Register localized string table
app.text.registerStrings('en', {
  shrine: {
    welcome: 'Welcome, {player}! The <color=#10b981>Ancient Shrine</color> is restored.'
  }
});

// 3. Play dialogue with typewriter sound blips and rich formatting
app.dialogue.play([
  {
    speakerId: 'elder_owl',
    text: app.text.t('shrine.welcome', { player: 'Fox' }),
    typewriterCps: 35
  }
]);

// 4. Voice narration / Text-to-Speech (optional)
await app.voices.speak('Welcome to the Ancient Grove!', 'fox');
```

---

## 📋 Best Practices Summary

| Goal | Principle | Code Example |
| :--- | :--- | :--- |
| **Less Code** | Use `buildEntity()` and `EasyScript` | `world.buildEntity('Hero').with(comp).tag('player').build()` |
| **High Performance** | Use `spawnBatch()` and pre-allocate vectors | `world.spawnBatch(100, (b, i) => ...)` |
| **Versatility** | Separate Data from System Logic | Systems query components, logic never hardcoded into meshes |
| **Clean Locomotion** | Use `StateMachine` and `ComboDetector` | `fsm.transition('idle', 'run', (ctx) => ctx.speed > 0)` |
| **Immersive Audio** | Speaker Profiles & Voice Blips | `app.text.registerSpeaker({ id: 'owl', voice: 'owl' })` |
