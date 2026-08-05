# ⚡ Kairo EasyScript Beginner Guide

Welcome to **EasyScript**! EasyScript is the super simple, beginner-friendly scripting language for Kairo Engine. You can create animated items, player movement, jumping, AI chaser bots, interactive collectibles, sound effects, and particle bursts without writing complex math or boilerplate code!

---

## 🚀 Quick Start Example

To make any 3D object spin, bob, and react to interactions:

```js
EasyScript.createBehavior({
  onStart() {
    this.spin(); // Spins continuously!
    this.bob();  // Bobs up & down!
    this.pulse(); // Pulse scales rhythmically!
  },
  onInteract() {
    this.jump(8.0); // Jumps into the air!
    this.sparkle(40); // Spawns golden sparkles!
    this.playSound('coin');
    this.say('You unlocked a secret powerup! ⭐');
  }
});
```

---

## 🛠️ Complete EasyScript Commands Reference

### 🔄 Automatic Motion Commands (No Math Required!)
| Command | Description | Example |
| :--- | :--- | :--- |
| `this.spin(speed?)` | Spins the object around Y axis | `this.spin(2.0)` |
| `this.bob(amount?, speed?)` | Bobs the object up and down smoothly | `this.bob(0.3)` |
| `this.patrol(distance?, speed?)` | Patrols back and forth along X axis | `this.patrol(6.0)` |
| `this.pulse(minScale?, maxScale?, speed?)` | Rhythmically expands and shrinks size | `this.pulse(0.8, 1.3)` |
| `this.stop()` | Stops all automatic motion behaviors | `this.stop()` |

### 🏃 Easy Movement & Steering
| Command | Description | Example |
| :--- | :--- | :--- |
| `this.jump(force?)` | Makes object jump up with gravity & dust landing | `this.jump(8.0)` |
| `this.move(dx, dy, dz)` | Moves relative by (x, y, z) | `this.move(0, 1, 0)` |
| `this.moveForward(distance)` | Moves forward in facing direction | `this.moveForward(0.1)` |
| `this.moveBackward(distance)` | Moves backward in facing direction | `this.moveBackward(0.1)` |
| `this.moveLeft(distance)` / `moveRight(distance)` | Moves left / right | `this.moveLeft(0.1)` |
| `this.moveUp(distance)` / `moveDown(distance)` | Moves up / down | `this.moveUp(0.1)` |
| `this.turnLeft(degrees)` / `turnRight(degrees)` | Rotates left or right by degrees | `this.turnLeft(45)` |
| `this.chase(targetPosition, speed, dt)` | Smoothly chases towards a 3D target | `this.chase(targetPos, 4.0, dt)` |
| `this.setPosition(x, y, z)` | Sets exact 3D position | `this.setPosition(0, 2, 0)` |
| `this.getPosition()` | Gets 3D position vector | `const pos = this.getPosition()` |

### 🎨 Visual & Audio Effects
| Command | Description | Example |
| :--- | :--- | :--- |
| `this.changeColor('#ff0000')` | Changes material color | `this.changeColor('#10b981')` |
| `this.randomColor()` | Sets a random bright neon color | `this.randomColor()` |
| `this.hide()` / `this.show()` | Toggles visibility | `this.hide()` |
| `this.say('Hello!')` | Displays a friendly toast message | `this.say('Welcome to Kairo!')` |
| `this.playSound('name')` | Plays sound (`'coin'`, `'jump'`, `'explosion'`, `'key'`, `'fanfare'`) | `this.playSound('fanfare')` |
| `this.sparkle(count?)` | Emits golden sparkle particles | `this.sparkle(30)` |
| `this.explode(count?)` | Emits fiery explosion particles | `this.explode(50)` |
| `this.dustBurst(count?)` | Emits dust footstep particles | `this.dustBurst(15)` |
| `this.teleportEffect()` | Spawns purple portal warp FX & sound | `this.teleportEffect()` |
| `this.destroy()` | Destroys object and removes from scene | `this.destroy()` |

### 🧠 Logic & Distance Helpers
| Command | Description | Example |
| :--- | :--- | :--- |
| `this.getDistanceTo(other)` | Gets 3D distance to another object | `if (this.getDistanceTo(player) < 2)` |
| `this.isNear(other, maxDistance)` | Returns true if near object | `if (this.isNear(player, 1.5))` |

---

## 🎨 Creative Beginner Presets

### 1. 🎈 Magic Gem Collectible
```js
EasyScript.createBehavior({
  onStart() {
    this.spin(2.5);
    this.bob(0.3, 4.0);
    this.pulse(0.9, 1.2, 3.0);
  },
  onInteract() {
    this.sparkle(40);
    this.playSound('coin');
    this.say('Collected Magic Gem! +100 PTS 🥑', 2000, 'success');
    this.destroy();
  }
});
```

### 2. 🎯 AI Enemy Chaser Bot
```js
EasyScript.createBehavior({
  onUpdate(dt) {
    // Chase target if near
    if (this.isNear(app.player, 8.0)) {
      this.chase(app.player.position, 3.5, dt);
    } else {
      this.spin(1.0);
    }
  },
  onCollision(other) {
    this.explode(50);
    this.playSound('explosion');
    this.say('BOOM! Hit by enemy bot! 💥', 2000, 'warning');
  }
});
```

### 3. 🏃 Simple Player WASD & Jump Controls
```js
EasyScript.createBehavior({
  onUpdate(dt) {
    const speed = 5.0;
    if (app.keys.KeyW) this.moveForward(speed * dt);
    if (app.keys.KeyS) this.moveBackward(speed * dt);
    if (app.keys.KeyA) this.turnLeft(90 * dt);
    if (app.keys.KeyD) this.turnRight(90 * dt);
    if (app.keys.Space) this.jump(8.0);
  }
});
```

---

## ⚡ Using EasyScript in Kairo Studio Editor

1. Open **Kairo Studio & Web Editor** (`editor/index.html`).
2. Open the **Bottom Drawer** and click the **`⚡ Easy Scripting`** tab.
3. Select any entity in the **Hierarchy Panel**, choose a preset, and click **`⚡ Attach Script to Active Entity`**.
4. Watch your 3D object animate, jump, and respond to interactions live in the viewport!
