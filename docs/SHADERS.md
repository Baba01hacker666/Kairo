# Kairo Engine - Shader System & Visual Shader Graph Guide

The **Kairo Engine Shader System** is a modular, high-performance GLSL/WGSL custom shader and material architecture built for `@kairo/renderer` and the **Kairo Studio Web Editor**.

---

## 🎨 Overview

Kairo Engine provides three tiers of shader functionality:

1. **`CustomShaderMaterial`**: programmatic API for custom vertex and fragment GLSL code strings, uniform state management, and Three.js integration.
2. **`ShaderPresets`**: 5 built-in procedural shader presets (Water Waves, Dissolve Noise, Cyber Hologram, Toon Cel, and Glowing Fresnel Rim).
3. **Visual Shader Graph Compiler (`ShaderGraphCompiler`)**: node-based visual graph compilation system converting node flow charts into GLSL code.

---

## 🌊 Built-In Shader Presets

| Preset | Description | Key Uniforms |
| :--- | :--- | :--- |
| 🌊 **Water Wave** | Animated sine wave vertex displacement, shallow/deep color gradient, specular highlights & foam peak. | `u_waveSpeed`, `u_waveHeight`, `u_shallowColor`, `u_deepColor` |
| 🔥 **Dissolve Noise** | Procedural Perlin noise alpha cutoff with customizable fiery glowing border threshold. | `u_dissolve`, `u_edgeWidth`, `u_edgeColor`, `u_baseColor` |
| 🤖 **Cyber Hologram** | Additive translucent hologram with animated scanlines, fresnel rim, and vertex position glitch. | `u_hologramColor`, `u_scanlineSpeed`, `u_fresnelPower`, `u_glitchIntensity` |
| 🎨 **Toon Cel** | Stepped light intensity calculation, quantized shading bands, and rim lighting. | `u_baseColor`, `u_shadowColor`, `u_steps`, `u_lightDirection` |
| ✨ **Glowing Fresnel Rim** | Dynamic pulsing edge illumination and rim aura glow. | `u_innerColor`, `u_glowColor`, `u_fresnelPower`, `u_pulseSpeed` |

---

## 💻 Programmatic Usage Example

```typescript
import { CustomShaderMaterial, ShaderPresets, Material } from '@kairo/renderer';
import { Color } from '@kairo/core';

// 1. Using a Built-in Preset
const waterMat = ShaderPresets.createWaterShader();
waterMat.setUniform('u_waveHeight', 0.25);
waterMat.setUniform('u_waveSpeed', 2.0);

// 2. Applying Preset to Engine Material
const mat = new Material('My Water Sphere');
mat.setShaderPreset('water');

// 3. Creating a Custom GLSL Shader Material
const customShader = new CustomShaderMaterial('Pulsing Glow', {
  transparent: true,
  uniforms: {
    u_time: { value: 0.0, type: 'float' },
    u_pulseColor: { value: new Color(0.2, 0.8, 1.0, 1.0), type: 'color' }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float u_time;
    uniform vec4 u_pulseColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float glow = sin(u_time * 4.0) * 0.5 + 0.5;
      gl_FragColor = vec4(u_pulseColor.rgb * glow, u_pulseColor.a);
    }
  `
});

// Update in game loop
customShader.update(dt, elapsedTime);
```

---

## ⚡ Visual Shader Graph Studio (`/editor/`)

The **Shader Graph** tab inside Kairo Studio provides:

- **Preset Selector**: Instantly load Water, Dissolve, Hologram, Toon, or Fresnel graphs.
- **Node Graph Canvas**: Visual node flow editor supporting node dragging, custom port handles (`float`, `vec2`, `color`), and SVG connection wires.
- **Real-Time WebGL Preview**: Live 60 FPS 3D spinning sphere preview viewport.
- **GLSL Drawer**: Real-time view of generated fragment GLSL shader code.
- **1-Click Apply**: Assign compiled shaders to selected scene entities directly from the editor or Inspector panel.
