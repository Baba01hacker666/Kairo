# ⚡ Kairo EasyScript Master API Reference

**EasyScript** is the unified, beginner-friendly entry point for every subsystem in Kairo Engine! Whether you are building 3D physics games, character animations, particle bursts, audio synthesized effects, Sketchfab & Blender model loading, camera controls, or multiplayer state sync, you can access every engine API with single, intuitive 1-line commands.

---

## 🛠️ Complete EasyScript Unified API Reference

### 🔄 Automatic Motions & Controls (No Math!)
- `this.spin(speed?)` - Continuously rotates object around Y axis.
- `this.bob(amount?, speed?)` - Gently bobs object up and down.
- `this.patrol(distance?, speed?)` - Patrols back and forth along X axis.
- `this.pulse(minScale?, maxScale?, speed?)` - Rhythmically expands and shrinks size.
- `this.stop()` - Stops all automatic motion behaviors.

### 🏃 Directional Movement & Steering
- `this.move(dx, dy, dz)` - Relative movement vector.
- `this.moveForward(distance)` / `moveBackward(distance)` - Moves in facing direction.
- `this.moveLeft(dist)` / `moveRight(dist)` / `moveUp(dist)` / `moveDown(dist)` - Directional movement.
- `this.turnLeft(degrees)` / `turnRight(degrees)` - Rotates by angle degrees.
- `this.jump(force?)` - Makes object jump up with gravity & dust landing.
- `this.chase(targetPos, speed, dt)` - Smoothly chases towards a 3D target.
- `this.navigateTo(targetPos, speed, dt)` - AI pathfinding navigation.

### 🎥 Camera & UI Tools
- `this.shakeCamera(intensity?, duration?)` - Triggers screen shake effect.
- `this.setCameraDistance(distance)` - Sets camera distance behind character.
- `this.say(message, duration?, type?)` - Displays a pop-up toast notification.
- `this.showModal(title, content, buttons?)` - Displays an interactive UI dialogue modal.
- `this.takeScreenshot()` - Takes a 60 FPS WebGL screenshot.
- `this.recordVideo(seconds)` - Records a WebGL video clip.

### 🎨 Visual & Audio Effects
- `this.changeColor('#ff0000')` - Changes material color.
- `this.randomColor()` - Sets a random bright neon color.
- `this.hide()` / `this.show()` - Toggles object visibility.
- `this.playSound(name)` - Plays sound (`'coin'`, `'jump'`, `'explosion'`, `'hit'`, `'teleport'`, `'key'`, `'fanfare'`, `'push'`, `'hint'`, `'switch'`).
- `this.sparkle(count?)` - Emits golden sparkle particles.
- `this.explode(count?)` - Emits fiery explosion particles.
- `this.dustBurst(count?)` - Emits footstep dust particles.
- `this.teleportEffect()` - Spawns purple portal warp FX & sound.

### 🕺 Character Animation & IK
- `this.playAnimation(clipName, fadeDuration?)` - Plays character skeletal animation (`'Idle'`, `'Walk'`, `'Run'`, `'Jump'`).
- `this.setIKHeight(height)` - Adjusts Inverse Kinematics (IK) elevation.

### 📦 Assets & Model Streamers
- `this.streamSketchfab(urlOrUid)` - Streams 3D model directly from Sketchfab API.
- `this.loadBlenderModel(blendUrl)` - Loads native Blender `.blend` model file.

### 🌐 Multiplayer Network Sync
- `this.syncState(stateData)` - Broadcasts state replication over network.
- `this.sendRPC(name, payload)` - Sends Remote Procedure Call (RPC).

---

## 🎨 Example: Complete Game Entity in EasyScript

```js
EasyScript.createBehavior({
  onStart() {
    this.spin(2.0);
    this.bob(0.3);
    this.say('Welcome to Kairo Engine! 🚀', 2500, 'success');
  },
  onUpdate(dt) {
    if (this.isNear(player.position, 5.0)) {
      this.chase(player.position, 3.5, dt);
    }
  },
  onInteract() {
    this.shakeCamera(0.6, 0.4);
    this.sparkle(50);
    this.playSound('fanfare');
    this.showModal('🎉 Level Complete!', 'You collected all gems!', [
      { text: 'Play Again', primary: true, onClick: () => location.reload() }
    ]);
  }
});
```
