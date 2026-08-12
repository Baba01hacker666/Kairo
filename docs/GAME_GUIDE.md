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

## 📋 Best Practices Summary

| Goal | Principle | Code Example |
| :--- | :--- | :--- |
| **Less Code** | Use `buildEntity()` and `EasyScript` | `world.buildEntity('Hero').with(comp).tag('player').build()` |
| **High Performance** | Use `spawnBatch()` and pre-allocate vectors | `world.spawnBatch(100, (b, i) => ...)` |
| **Versatility** | Separate Data from System Logic | Systems query components, logic never hardcoded into meshes |
