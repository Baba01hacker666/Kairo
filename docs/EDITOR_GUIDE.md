# Kairo Engine Studio & Web Editor User Guide

The Kairo Engine Web Editor is a browser-based, desktop-ready game creation studio inspired by Unity, Unreal Engine, and Godot.

---

## 🎨 Interface Overview

1. **Top Bar**:
   - **Demo Selector**: Switch instantly between pre-built demos (3D Sci-Fi Explorer, 2D Platformer, AI NavMesh, GPU Particles).
   - **Play Controls**: ▶ Play, ⏸ Pause, ⏹ Stop buttons to simulate real-time engine runtime.
   - **Gizmo Tools**: Toggle Translate (W), Rotate (E), Scale (R).
   - **Physics Wireframe**: Toggle physics colliders overlay.
   - **Export Project**: Export project build to standalone WebGL / PWA bundle.

2. **Left Panel**:
   - **Scene Hierarchy**: Tree view of active entities. Click to select, or click "+ Add Entity" to instantiate new GameObjects.
   - **Project Assets**: Drag-and-drop assets, prefabs, materials, and sound clips.

3. **Center Viewport**:
   - High performance 3D/2D WebGL canvas.
   - **Camera Controls**:
     - Right Drag / Middle Drag: Orbit view around scene origin.
     - Scroll Wheel: Zoom in / zoom out.
   - **Real-Time Statistics Overlay**: Live display of FPS, Draw Calls, Polygons, Active Entities, and Physics substep rate.

4. **Right Panel**:
   - **Entity Inspector**: Edit name, position, rotation, scale, color, PBR roughness/metalness, and physics rigidbodies in real-time.

5. **Bottom Multi-Tab Panel**:
   - **Console Log**: View live engine logs, warnings, and errors.
   - **Performance Profiler**: Monitor CPU frame time breakdown and memory heap usage.
   - **Shader Graph**: Visual node graph preview for GLSL/WGSL shaders.
   - **Particle Editor**: Adjust particle spawn rate, speed, lifetime, and colors.
   - **Animation Timeline**: Inspect keyframes and animation tracks.
   - **Physics Debugger**: Physics solver stats, gravity vector, and colliders.
