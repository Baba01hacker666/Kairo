# Kairo Engine - API Reference Guide

This document provides a comprehensive reference for all core packages in the Kairo Game Engine monorepo.

---

## 1. `@kairo/core`

### `EasyScript` Master API & `ScriptBehavior`
Unified, beginner-friendly single-line API unifying all Kairo Engine packages & subsystems into 1 interface:
- `EasyScript.createBehavior({ onStart?, onUpdate?, onInteract?, onCollision? })`: Create custom behavior.
- **Video Editing**: `createVideoTimeline(duration)`, `addCameraShot(time, duration, type, config)`, `addVideoOverlay(time, duration, url, maskConfig)`, `addVideoText(time, duration, text)`, `addVideoTransition(time, duration, type)`, `addVideoColorGrading(time, duration, preset)`, `playVideoTimeline()`, `exportVideoFile(filename)`.
- **Cinematic Shots**: `cutToShot(pos, lookAtTarget)`, `panCamera(fromPos, toPos, lookAtTarget, duration)`, `orbitCamera(centerTarget, radius, speed, duration)`, `dollyZoom(targetFov, duration)`, `craneShot(startPos, endPos, duration)`, `trackObject(targetObj)`.
- **Overlay & Masking**: `showOverlayImage(url, options)`, `removeOverlayImage(id)`, `letterbox(enabled, barHeightPercent)`, `transitionCut(type, durationMs)`, `setColorGrading(preset)`.
- **Motions**: `spin(speed?)`, `bob(amount?, speed?)`, `patrol(dist?, speed?)`, `pulse(min?, max?, speed?)`, `jump(force?)`, `stop()`.
- **Steering & Movement**: `move(dx, dy, dz)`, `moveForward(dist)`, `moveBackward(dist)`, `moveLeft(dist)`, `moveRight(dist)`, `turnLeft(deg)`, `turnRight(deg)`, `chase(targetPos, speed, dt)`, `navigateTo(targetPos, speed, dt)`.
- **SFX & Particles**: `playSound(type)`, `sparkle(count?)`, `explode(count?)`, `dustBurst(count?)`, `teleportEffect()`.
- **Animations & IK**: `playAnimation(stateName, fadeDuration?)`, `setIKHeight(height)`.
- **Assets**: `streamSketchfab(urlOrUid)`, `loadBlenderModel(blendUrl)`.
- **Multiplayer**: `syncState(stateData)`, `sendRPC(rpcName, payload)`.

### `KairoApp`
- `new KairoApp(config?: KairoAppConfig)`: Create high-level engine wrapper.
- `app.videoTimeline`: `VideoTimeline` multitrack video editor engine instance.
- `createVideoTimeline(duration)`: Instantiate new video editing timeline.
- `addCameraShot(time, duration, shotType, config)`: Add keyframed camera shot clip.
- `addVideoOverlay(time, duration, url, maskConfig)`: Add image/video overlay clip with masking.
- `addVideoText(time, duration, text)`: Add title card / subtitle clip.
- `addVideoTransition(time, duration, transitionType)`: Add transition cut clip.
- `addVideoColorGrading(time, duration, preset)`: Add color grading preset filter clip.
- `playVideo()` / `pauseVideo()` / `seekVideo(time)` / `exportVideo(filename)`: Control video timeline playback and export.

---

## 2. `@kairo/tools`

### `VideoTimeline`
- `new VideoTimeline(app?, totalDuration?)`: Multi-track HTML5 video editing timeline engine.
- `addTrack(name, type)`: Add video track (`'camera'`, `'overlay'`, `'text'`, `'transition'`, `'audio'`, `'colorGrade'`).
- `addClip(trackId, clipData)`: Add clip to track with keyframes and parameters.
- `seek(time)`: Scrub playhead to timestamp.
- `play()` / `pause()`: Play or pause timeline.
- `evaluateAt(time)`: Evaluate active clips, camera shots, image overlays, transitions & color grading.
- `exportVideo(filename)`: Record and export full WebM video file.
- `toJSON()` / `fromJSON(data)`: Serialize / deserialize video timeline project.

---

## 3. `@kairo/ui`

### `CinematicOverlayManager`
- `showImageOverlay(url, options)`: Floating image graphic overlays with CSS masks (`circle`, `rounded`, `hexagon`, `vignette`).
- `setLetterbox(enabled, barHeightPercent)`: 21:9 Widescreen letterbox black bars.
- `transitionCut(type, durationMs)`: Video transition cuts (`wipeLeft`, `wipeRight`, `circleWipe`, `glitch`).
- `setColorGrading(preset)`: Color grading filter presets (`cinematicWarm`, `cyberpunkNeon`, `noir`, `vintage`).
