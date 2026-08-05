# ⚡ Kairo EasyScript Master API Reference

**EasyScript** is the unified, beginner-friendly entry point for every subsystem in Kairo Engine! Whether you are building 3D physics games, character animations, HTML5 video editing timelines, image overlay masking, camera shots, particle bursts, audio synthesized effects, Sketchfab & Blender model loading, camera controls, or multiplayer state sync, you can access every engine API with single, intuitive 1-line commands.

---

## 🎬 Video Editing & Cinematic Keyframing API
- `this.createVideoTimeline(durationSeconds)` - Creates a custom multi-track video timeline.
- `this.addCameraShot(time, duration, type, config)` - Keyframes camera shots (`'orbit'`, `'pan'`, `'dolly'`, `'crane'`).
- `this.addVideoOverlay(time, duration, url, maskConfig)` - Adds image/video overlay graphics with CSS masks (`'circle'`, `'rounded'`, `'hexagon'`, `'vignette'`).
- `this.addVideoText(time, duration, text)` - Adds title cards, lower-thirds, and subtitles.
- `this.addVideoTransition(time, duration, type)` - Adds video transition cuts (`'wipeLeft'`, `'wipeRight'`, `'circleWipe'`, `'glitch'`).
- `this.addVideoColorGrading(time, duration, preset)` - Applies color grading filter presets (`'cinematicWarm'`, `'cyberpunkNeon'`, `'noir'`, `'vintage'`).
- `this.playVideoTimeline()` - Plays the active video editing timeline.
- `this.exportVideoFile(filename)` - Exports the video timeline to a 60 FPS WebM video file.

---

## 🛠️ Complete EasyScript Unified API Reference

### 🎥 Cinematic Camera Shots & Movements
- `this.cutToShot(pos, lookAtTarget)` - Hard cut immediately to 3D position & lookAt target.
- `this.panCamera(fromPos, toPos, lookAtTarget, duration)` - Smooth 3D panning camera shot.
- `this.orbitCamera(centerTarget, radius, speed, duration)` - 360° orbital camera shot around target.
- `this.dollyZoom(targetFov, duration)` - Hitchcock Vertigo Dolly Zoom effect.
- `this.craneShot(startPos, endPos, duration)` - Crane / Jib camera shot rising or falling.
- `this.trackObject(targetObj)` - Camera tracking following an entity.

### 🖼️ Video Overlay, Masking & Color Grading
- `this.showOverlayImage(url, options)` - Displays floating image graphics with masking (`circle`, `rounded`, `hexagon`).
- `this.removeOverlayImage(id)` - Removes overlay image.
- `this.letterbox(enabled, barHeightPercent)` - Displays 21:9 cinematic black letterbox bars.
- `this.transitionCut(type, durationMs)` - Video transition cut (`wipeLeft`, `circleWipe`, `glitch`).
- `this.setColorGrading(preset)` - Color grading preset (`cinematicWarm`, `cyberpunkNeon`, `noir`, `vintage`).

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

---

## 🎨 Example: Video Editing Script in EasyScript

```js
EasyScript.createBehavior({
  onStart() {
    this.createVideoTimeline(12.0);
    this.addCameraShot(0.0, 4.0, 'orbit', { target: [0, 2, 0], radius: 8.0 });
    this.addVideoOverlay(1.0, 5.0, 'https://threejs.org/files/favicon.ico', { mask: 'circle', x: '80%', y: '20%' });
    this.addVideoColorGrading(0.0, 12.0, 'cyberpunkNeon');
    this.addVideoText(0.0, 3.0, '🎬 Kairo Engine Cinematic Video');
    this.playVideoTimeline();
  }
});
```
