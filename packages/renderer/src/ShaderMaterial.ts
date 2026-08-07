import * as THREE from 'three';
import { Color } from '@kairo/core';

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

    if (this.threeMaterial && this.threeMaterial.uniforms[name]) {
      this.threeMaterial.uniforms[name].value = this.formatThreeUniformValue(value, this.uniforms[name].type);
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

    const threeUniforms: Record<string, { value: any }> = {};
    for (const [key, def] of Object.entries(this.uniforms)) {
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
    for (const [key, def] of Object.entries(this.uniforms)) {
      if (!this.threeMaterial.uniforms[key]) {
        this.threeMaterial.uniforms[key] = { value: this.formatThreeUniformValue(def.value, def.type) };
      } else {
        this.threeMaterial.uniforms[key].value = this.formatThreeUniformValue(def.value, def.type);
      }
    }
    this.threeMaterial.vertexShader = this.vertexShader;
    this.threeMaterial.fragmentShader = this.fragmentShader;
    this.threeMaterial.needsUpdate = true;
  }

  private formatThreeUniformValue(val: any, type: UniformType): any {
    if (val instanceof Color) {
      return new THREE.Color(val.r, val.g, val.b);
    }
    if (type === 'color' && typeof val === 'string') {
      return new THREE.Color(val);
    }
    if (type === 'color' && Array.isArray(val)) {
      return new THREE.Color(val[0], val[1], val[2]);
    }
    if (type === 'vec2' && Array.isArray(val)) {
      return new THREE.Vector2(val[0], val[1]);
    }
    if (type === 'vec3' && Array.isArray(val)) {
      return new THREE.Vector3(val[0], val[1], val[2]);
    }
    if (type === 'vec4' && Array.isArray(val)) {
      return new THREE.Vector4(val[0], val[1], val[2], val[3]);
    }
    return val;
  }

  public clone(): CustomShaderMaterial {
    const clonedUniforms: Record<string, UniformDefinition> = {};
    for (const [k, v] of Object.entries(this.uniforms)) {
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
      uniforms: Object.fromEntries(
        Object.entries(this.uniforms).map(([k, v]) => [
          k,
          {
            type: v.type,
            value: v.value instanceof Color ? v.value.toHex() : v.value
          }
        ])
      )
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

    if (json.uniforms) {
      for (const [k, v] of Object.entries(json.uniforms as Record<string, UniformDefinition>)) {
        if (v.type === 'color' && typeof v.value === 'string') {
          mat.setUniform(k, new Color().setHex(v.value), 'color');
        } else {
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
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;

    void main() {
      vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
      float diff = max(dot(vWorldNormal, lightDir), 0.2);
      gl_FragColor = vec4(u_color.rgb * diff, u_color.a);
    }
  `;
}
