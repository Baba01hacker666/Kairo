import * as THREE from 'three';
import { Color } from '../../core/src/Math.ts';

export type UniformType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'texture' | 'int';

export interface UniformDefinition {
  value: any;
  type: UniformType;
}

export interface CustomShaderMaterialOptions {
  name?: string;
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: Record<string, UniformDefinition>;
  transparent?: boolean;
  wireframe?: boolean;
  side?: 'front' | 'back' | 'double';
  blending?: 'normal' | 'additive' | 'subtractive' | 'multiply';
  depthWrite?: boolean;
  depthTest?: boolean;
}

interface ThreeUniform {
  value: any;
}

export class CustomShaderMaterial {
  public id: string;
  public name: string;
  public vertexShader: string;
  public fragmentShader: string;
  public uniforms: Record<string, UniformDefinition> = {};
  public transparent: boolean = false;
  public wireframe: boolean = false;
  public side: 'front' | 'back' | 'double' = 'front';
  public blending: 'normal' | 'additive' | 'subtractive' | 'multiply' = 'normal';
  public depthWrite: boolean = true;
  public depthTest: boolean = true;

  private threeMaterial: THREE.ShaderMaterial | null = null;

  constructor(name: string = 'Custom Shader Material', options: CustomShaderMaterialOptions = {}) {
    this.id = `shader_${Math.random().toString(36).substring(2, 9)}`;
    this.name = name;

    this.vertexShader = options.vertexShader || CustomShaderMaterial.DEFAULT_VERTEX_SHADER;
    this.fragmentShader = options.fragmentShader || CustomShaderMaterial.DEFAULT_FRAGMENT_SHADER;

    this.transparent = options.transparent ?? false;
    this.wireframe = options.wireframe ?? false;
    this.side = options.side || 'front';
    this.blending = options.blending || 'normal';
    this.depthWrite = options.depthWrite ?? true;
    this.depthTest = options.depthTest ?? true;

    // Standard default uniforms
    this.uniforms = {
      u_time: { value: 0.0, type: 'float' },
      u_resolution: { value: [1000, 800], type: 'vec2' },
      u_color: { value: new Color(1, 1, 1, 1), type: 'color' },
      ...(options.uniforms || {})
    };
  }

  public setUniform(name: string, value: any, type?: UniformType): void {
    if (!this.uniforms[name]) {
      this.uniforms[name] = {
        value,
        type: type || (typeof value === 'number' ? 'float' : Array.isArray(value) ? `vec${value.length}` as UniformType : 'float')
      };
    } else {
      this.uniforms[name].value = value;
      if (type) this.uniforms[name].type = type;
    }

    // Reuse the existing THREE uniform value object in place instead of
    // allocating a fresh THREE.Color / Vector* on every setUniform call.
    if (this.threeMaterial && this.threeMaterial.uniforms[name]) {
      const u: ThreeUniform = this.threeMaterial.uniforms[name];
      u.value = this.syncThreeUniformValue(u.value, value, this.uniforms[name].type);
    }
  }

  public getUniform(name: string): any {
    return this.uniforms[name] ? this.uniforms[name].value : undefined;
  }

  public update(dt: number, elapsedTime: number): void {
    this.setUniform('u_time', elapsedTime);
  }

  public toThreeMaterial(): THREE.ShaderMaterial {
    if (this.threeMaterial) {
      this.updateThreeUniforms();
      return this.threeMaterial;
    }

    const threeUniforms: Record<string, ThreeUniform> = {};
    for (const key in this.uniforms) {
      if (!Object.prototype.hasOwnProperty.call(this.uniforms, key)) continue;
      const def = this.uniforms[key];
      threeUniforms[key] = { value: this.formatThreeUniformValue(def.value, def.type) };
    }

    let sideEnum: THREE.Side = THREE.FrontSide;
    if (this.side === 'back') sideEnum = THREE.BackSide;
    if (this.side === 'double') sideEnum = THREE.DoubleSide;

    let blendingEnum: THREE.Blending = THREE.NormalBlending;
    if (this.blending === 'additive') blendingEnum = THREE.AdditiveBlending;
    if (this.blending === 'subtractive') blendingEnum = THREE.SubtractiveBlending;
    if (this.blending === 'multiply') blendingEnum = THREE.MultiplyBlending;

    this.threeMaterial = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: threeUniforms,
      transparent: this.transparent,
      wireframe: this.wireframe,
      side: sideEnum,
      blending: blendingEnum,
      depthWrite: this.depthWrite,
      depthTest: this.depthTest
    });

    return this.threeMaterial;
  }

  private updateThreeUniforms(): void {
    if (!this.threeMaterial) return;
    const threeUniforms = this.threeMaterial.uniforms;

    // Zero-allocation hot path: iterate with for...in + hasOwnProperty and
    // mutate the existing THREE uniform value in place. No new arrays or
    // THREE.Color/Vector* objects are allocated on the per-frame sync.
    for (const key in this.uniforms) {
      if (!Object.prototype.hasOwnProperty.call(this.uniforms, key)) continue;
      const def = this.uniforms[key];
      const existing = threeUniforms[key];
      if (existing && existing.value !== undefined) {
        existing.value = this.syncThreeUniformValue(existing.value, def.value, def.type);
      } else {
        threeUniforms[key] = { value: this.formatThreeUniformValue(def.value, def.type) };
      }
    }

    this.threeMaterial.vertexShader = this.vertexShader;
    this.threeMaterial.fragmentShader = this.fragmentShader;
    this.threeMaterial.needsUpdate = true;
  }

  /**
   * Returns a THREE-compatible value for the given source value + type.
   * If `target` is an existing THREE value of the correct type, it is mutated
   * IN PLACE and returned (zero allocation); otherwise a new THREE object is
   * allocated (fallback used only when a uniform was just created).
   */
  private syncThreeUniformValue(target: any, val: any, type: UniformType): any {
    switch (type) {
      case 'color':
        if (target instanceof THREE.Color) {
          if (val instanceof Color) target.setRGB(val.r, val.g, val.b);
          else if (val instanceof THREE.Color) target.copy(val);
          else if (typeof val === 'string') target.set(val);
          else if (Array.isArray(val)) target.setRGB(val[0], val[1], val[2]);
          else if (val && typeof val === 'object') target.setRGB(val.r ?? 1, val.g ?? 1, val.b ?? 1);
          else return this.formatThreeUniformValue(val, type);
          return target;
        }
        break;
      case 'vec2':
        if (target instanceof THREE.Vector2) {
          if (Array.isArray(val)) target.set(val[0], val[1]);
          else if (val && typeof val === 'object') target.set(val.x ?? val[0] ?? 0, val.y ?? val[1] ?? 0);
          else return this.formatThreeUniformValue(val, type);
          return target;
        }
        break;
      case 'vec3':
        if (target instanceof THREE.Vector3) {
          if (Array.isArray(val)) target.set(val[0], val[1], val[2]);
          else if (val && typeof val === 'object') target.set(val.x ?? val.r ?? 0, val.y ?? val.g ?? 0, val.z ?? val.b ?? 0);
          else return this.formatThreeUniformValue(val, type);
          return target;
        }
        break;
      case 'vec4':
        if (target instanceof THREE.Vector4) {
          if (Array.isArray(val)) target.set(val[0], val[1], val[2], val[3] ?? 1.0);
          else if (val && typeof val === 'object') target.set(val.x ?? val.r ?? 0, val.y ?? val.g ?? 0, val.z ?? val.b ?? 0, val.w ?? val.a ?? 1.0);
          else return this.formatThreeUniformValue(val, type);
          return target;
        }
        break;
    }
    return this.formatThreeUniformValue(val, type);
  }

  private formatThreeUniformValue(val: any, type: UniformType): any {
    if (val instanceof Color) {
      if (type === 'vec4') {
        return new THREE.Vector4(val.r, val.g, val.b, val.a ?? 1.0);
      }
      return new THREE.Color(val.r, val.g, val.b);
    }
    if (val instanceof THREE.Color) {
      if (type === 'vec4') {
        return new THREE.Vector4(val.r, val.g, val.b, 1.0);
      }
      return val;
    }
    if (type === 'color') {
      if (typeof val === 'string') return new THREE.Color(val);
      if (Array.isArray(val)) return new THREE.Color(val[0], val[1], val[2]);
      if (val && typeof val === 'object') {
        return new THREE.Color(val.r ?? 1, val.g ?? 1, val.b ?? 1);
      }
    }
    if (type === 'vec2') {
      if (Array.isArray(val)) return new THREE.Vector2(val[0], val[1]);
      if (val && typeof val === 'object') return new THREE.Vector2(val.x ?? val[0] ?? 0, val.y ?? val[1] ?? 0);
    }
    if (type === 'vec3') {
      if (Array.isArray(val)) return new THREE.Vector3(val[0], val[1], val[2]);
      if (val && typeof val === 'object') return new THREE.Vector3(val.x ?? val.r ?? 0, val.y ?? val.g ?? 0, val.z ?? val.b ?? 0);
    }
    if (type === 'vec4') {
      if (Array.isArray(val)) return new THREE.Vector4(val[0], val[1], val[2], val[3] ?? 1.0);
      if (val && typeof val === 'object') {
        return new THREE.Vector4(val.x ?? val.r ?? 0, val.y ?? val.g ?? 0, val.z ?? val.b ?? 0, val.w ?? val.a ?? 1.0);
      }
    }
    return val;
  }

  public clone(): CustomShaderMaterial {
    const clonedUniforms: Record<string, UniformDefinition> = {};
    for (const k in this.uniforms) {
      if (!Object.prototype.hasOwnProperty.call(this.uniforms, k)) continue;
      const v = this.uniforms[k];
      clonedUniforms[k] = {
        type: v.type,
        value: Array.isArray(v.value) ? [...v.value] : v.value instanceof Color ? new Color(v.value.r, v.value.g, v.value.b, v.value.a) : v.value
      };
    }

    return new CustomShaderMaterial(`${this.name} Copy`, {
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: clonedUniforms,
      transparent: this.transparent,
      wireframe: this.wireframe,
      side: this.side,
      blending: this.blending,
      depthWrite: this.depthWrite,
      depthTest: this.depthTest
    });
  }

  public toJSON(): any {
    const serializedUniforms: Record<string, { type: UniformType; value: any }> = {};
    for (const k in this.uniforms) {
      if (!Object.prototype.hasOwnProperty.call(this.uniforms, k)) continue;
      const v = this.uniforms[k];
      serializedUniforms[k] = {
        type: v.type,
        value: v.value instanceof Color ? v.value.toHex() : v.value
      };
    }

    return {
      id: this.id,
      name: this.name,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: this.transparent,
      wireframe: this.wireframe,
      side: this.side,
      blending: this.blending,
      depthWrite: this.depthWrite,
      depthTest: this.depthTest,
      uniforms: serializedUniforms
    };
  }

  public static fromJSON(json: any): CustomShaderMaterial {
    const mat = new CustomShaderMaterial(json.name, {
      vertexShader: json.vertexShader,
      fragmentShader: json.fragmentShader,
      transparent: json.transparent,
      wireframe: json.wireframe,
      side: json.side,
      blending: json.blending,
      depthWrite: json.depthWrite,
      depthTest: json.depthTest
    });

    // Iterate defensively with hasOwnProperty so a malicious/odd payload cannot
    // inject prototype properties (prototype-pollution safe).
    if (json.uniforms) {
      const uniformsObj = json.uniforms as Record<string, UniformDefinition>;
      for (const k in uniformsObj) {
        if (!Object.prototype.hasOwnProperty.call(uniformsObj, k)) continue;
        const v = uniformsObj[k];
        if (v && v.type === 'color' && typeof v.value === 'string') {
          mat.setUniform(k, new Color().setHex(v.value), 'color');
        } else if (v) {
          mat.setUniform(k, v.value, v.type);
        }
      }
    }

    return mat;
  }

  /**
   * Default Vertex Shader supporting Local Space, World Space, View/Camera Space transforms & Matrices
   */
  public static DEFAULT_VERTEX_SHADER = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vLocalPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vWorldNormal = normalize(mat3(modelMatrix) * normal);

      // Local Space -> World Space Matrix Transform
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;

      // World Space -> View/Camera Space Matrix Transform
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      // View Space -> Clip Space Projection Matrix Transform
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  public static DEFAULT_FRAGMENT_SHADER = `
    uniform vec4 u_color;
    uniform float u_time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
      float diff = max(dot(vWorldNormal, lightDir), 0.2);
      gl_FragColor = vec4(u_color.rgb * diff, u_color.a);
    }
  `;
}
