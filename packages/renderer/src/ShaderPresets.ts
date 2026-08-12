import { CustomShaderMaterial } from './ShaderMaterial.ts';
import { Color } from '../../core/src/Math.ts';

export type ShaderPresetName = 'water' | 'dissolve' | 'hologram' | 'toon' | 'fresnel';

export const SHADER_PRESETS: ShaderPresetName[] = ['water', 'dissolve', 'hologram', 'toon', 'fresnel'];

export class ShaderPresets {
  /**
   * Water Wave Shader: Procedural wave displacement using Local Space or World Space matrices, color depth gradient, specular highlights & foam rim.
   */
  public static createWaterShader(): CustomShaderMaterial {
    const mat = new CustomShaderMaterial('Water Wave Shader', {
      transparent: true,
      uniforms: {
        u_time: { value: 0.0, type: 'float' },
        u_useWorldSpace: { value: 1.0, type: 'float' }, // 1.0 = World Space matrix waves (seamless tiling across meshes), 0.0 = Local Space
        u_shallowColor: { value: new Color(0.1, 0.7, 0.9, 0.8), type: 'color' },
        u_deepColor: { value: new Color(0.01, 0.15, 0.45, 0.95), type: 'color' },
        u_waveSpeed: { value: 1.5, type: 'float' },
        u_waveHeight: { value: 0.12, type: 'float' },
        u_waveFrequency: { value: 4.0, type: 'float' },
        u_foamColor: { value: new Color(1.0, 1.0, 1.0, 0.9), type: 'color' }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_useWorldSpace;
        uniform float u_waveSpeed;
        uniform float u_waveHeight;
        uniform float u_waveFrequency;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;
        varying float vWaveHeight;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          
          // Local Space -> World Space Matrix Transform
          vec4 worldPos = modelMatrix * vec4(position, 1.0);

          // Select space coordinates for wave evaluation (World Space vs Local Space)
          vec2 calcCoords = mix(position.xz, worldPos.xz, step(0.5, u_useWorldSpace));

          float wave1 = sin(calcCoords.x * u_waveFrequency + u_time * u_waveSpeed) * cos(calcCoords.y * u_waveFrequency * 0.8 + u_time * u_waveSpeed * 1.2);
          float wave2 = sin(calcCoords.y * u_waveFrequency * 1.5 + u_time * u_waveSpeed * 0.9) * 0.5;
          float displacement = (wave1 + wave2) * u_waveHeight;

          vec3 pos = position;
          pos.y += displacement;
          vWaveHeight = displacement;

          // Compute perturbed normal matrix transform
          vec3 modifiedNormal = normal;
          modifiedNormal.x -= cos(calcCoords.x * u_waveFrequency + u_time * u_waveSpeed) * u_waveHeight;
          modifiedNormal.z -= sin(calcCoords.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveHeight;
          
          vNormal = normalize(normalMatrix * modifiedNormal);
          vWorldNormal = normalize(mat3(modelMatrix) * modifiedNormal);

          vec4 finalWorldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = finalWorldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * finalWorldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_shallowColor;
        uniform vec4 u_deepColor;
        uniform vec4 u_foamColor;
        uniform float u_time;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying float vWaveHeight;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), 2.5);

          float t = clamp((vWaveHeight + 0.1) / 0.25, 0.0, 1.0);
          vec4 waterColor = mix(u_deepColor, u_shallowColor, t);
          waterColor = mix(waterColor, vec4(0.1, 0.8, 1.0, 1.0), fresnel * 0.4);

          // Specular highlight in world space
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vWorldNormal, halfDir), 0.0), 64.0);

          // Foam peak
          float foam = smoothstep(0.08, 0.12, vWaveHeight);
          vec4 finalColor = mix(waterColor, u_foamColor, foam * 0.6);
          finalColor.rgb += vec3(spec * 0.8);

          gl_FragColor = finalColor;
        }
      `
    });
    return mat;
  }

  /**
   * Dissolve Shader: Procedural noise cutoff operating in Local Space or World Space matrix coordinates.
   */
  public static createDissolveShader(): CustomShaderMaterial {
    const mat = new CustomShaderMaterial('Dissolve Noise Shader', {
      transparent: true,
      uniforms: {
        u_time: { value: 0.0, type: 'float' },
        u_useWorldSpace: { value: 1.0, type: 'float' },
        u_dissolve: { value: 0.35, type: 'float' },
        u_edgeWidth: { value: 0.08, type: 'float' },
        u_edgeColor: { value: new Color(1.0, 0.4, 0.0, 1.0), type: 'color' },
        u_baseColor: { value: new Color(0.2, 0.6, 1.0, 1.0), type: 'color' },
        u_noiseScale: { value: 8.0, type: 'float' }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float u_dissolve;
        uniform float u_edgeWidth;
        uniform float u_useWorldSpace;
        uniform vec4 u_edgeColor;
        uniform vec4 u_baseColor;
        uniform float u_noiseScale;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        // Procedural 2D Noise
        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 noiseCoords = mix(vUv, vWorldPosition.xz, step(0.5, u_useWorldSpace));
          float n = noise(noiseCoords * u_noiseScale);
          
          if (n < u_dissolve) {
            discard;
          }

          vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
          float diff = max(dot(vWorldNormal, lightDir), 0.3);
          vec4 color = vec4(u_baseColor.rgb * diff, u_baseColor.a);

          if (n < u_dissolve + u_edgeWidth) {
            float edgeT = (n - u_dissolve) / u_edgeWidth;
            color = mix(u_edgeColor * 2.0, color, edgeT);
          }

          gl_FragColor = color;
        }
      `
    });
    return mat;
  }

  /**
   * Hologram Shader: Scanlines, fresnel rim, local position glitch offset, translucent cyber grid.
   */
  public static createHologramShader(): CustomShaderMaterial {
    const mat = new CustomShaderMaterial('Cyber Hologram Shader', {
      transparent: true,
      side: 'double',
      blending: 'additive',
      uniforms: {
        u_time: { value: 0.0, type: 'float' },
        u_hologramColor: { value: new Color(0.0, 0.9, 1.0, 0.85), type: 'color' },
        u_fresnelPower: { value: 2.0, type: 'float' },
        u_scanlineSpeed: { value: 6.0, type: 'float' },
        u_scanlineCount: { value: 40.0, type: 'float' },
        u_glitchIntensity: { value: 0.03, type: 'float' }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_glitchIntensity;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          
          vec3 pos = position;
          // Local Space glitch displacement transform
          float glitch = sin(pos.y * 30.0 + u_time * 10.0) * u_glitchIntensity * step(0.85, sin(u_time * 4.0));
          pos.x += glitch;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_hologramColor;
        uniform float u_time;
        uniform float u_fresnelPower;
        uniform float u_scanlineSpeed;
        uniform float u_scanlineCount;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), u_fresnelPower);

          float scanline = sin(vUv.y * u_scanlineCount - u_time * u_scanlineSpeed) * 0.5 + 0.5;
          scanline = smoothstep(0.2, 0.8, scanline);

          float alpha = (fresnel * 0.7 + scanline * 0.3) * u_hologramColor.a;
          vec3 finalColor = u_hologramColor.rgb * (fresnel + scanline * 0.6 + 0.2);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });
    return mat;
  }

  /**
   * Toon / Cel Shader: Discrete light banding steps in world space with outline rim glow.
   */
  public static createToonShader(): CustomShaderMaterial {
    const mat = new CustomShaderMaterial('Toon Cel Shader', {
      uniforms: {
        u_time: { value: 0.0, type: 'float' },
        u_baseColor: { value: new Color(0.9, 0.3, 0.2, 1.0), type: 'color' },
        u_shadowColor: { value: new Color(0.3, 0.1, 0.2, 1.0), type: 'color' },
        u_lightDirection: { value: [0.5, 1.0, 0.5], type: 'vec3' },
        u_steps: { value: 3.0, type: 'float' },
        u_rimPower: { value: 3.0, type: 'float' }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_baseColor;
        uniform vec4 u_shadowColor;
        uniform vec3 u_lightDirection;
        uniform float u_steps;
        uniform float u_rimPower;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 L = normalize(u_lightDirection);
          float NdotL = max(dot(vWorldNormal, L), 0.0);

          // Step lighting calculation in world space
          float toonLight = floor(NdotL * u_steps) / u_steps;
          toonLight = max(toonLight, 0.15);

          vec3 toonColor = mix(u_shadowColor.rgb, u_baseColor.rgb, toonLight);

          // Rim outline glow
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float rim = 1.0 - max(dot(V, vWorldNormal), 0.0);
          rim = pow(rim, u_rimPower);
          rim = step(0.65, rim);

          vec3 finalColor = toonColor + vec3(rim * 0.4);
          gl_FragColor = vec4(finalColor, u_baseColor.a);
        }
      `
    });
    return mat;
  }

  /**
   * Glowing Rim / Fresnel Aura Shader: Dynamic pulsing edge illumination in world space.
   */
  public static createFresnelGlowShader(): CustomShaderMaterial {
    const mat = new CustomShaderMaterial('Glowing Fresnel Rim Shader', {
      transparent: true,
      blending: 'additive',
      uniforms: {
        u_time: { value: 0.0, type: 'float' },
        u_innerColor: { value: new Color(0.1, 0.1, 0.3, 0.5), type: 'color' },
        u_glowColor: { value: new Color(0.9, 0.2, 1.0, 1.0), type: 'color' },
        u_fresnelPower: { value: 2.5, type: 'float' },
        u_pulseSpeed: { value: 3.0, type: 'float' }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_innerColor;
        uniform vec4 u_glowColor;
        uniform float u_fresnelPower;
        uniform float u_pulseSpeed;
        uniform float u_time;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(V, vWorldNormal), 0.0), u_fresnelPower);

          float pulse = (sin(u_time * u_pulseSpeed) * 0.5 + 0.5) * 0.4 + 0.8;
          fresnel *= pulse;

          vec4 color = mix(u_innerColor, u_glowColor, fresnel);
          color.rgb *= fresnel * 2.0;

          gl_FragColor = vec4(color.rgb, fresnel * u_glowColor.a);
        }
      `
    });
    return mat;
  }

  public static getPreset(preset: ShaderPresetName): CustomShaderMaterial {
    switch (preset) {
      case 'water': return ShaderPresets.createWaterShader();
      case 'dissolve': return ShaderPresets.createDissolveShader();
      case 'hologram': return ShaderPresets.createHologramShader();
      case 'toon': return ShaderPresets.createToonShader();
      case 'fresnel': return ShaderPresets.createFresnelGlowShader();
      default: return ShaderPresets.createWaterShader();
    }
  }
}
