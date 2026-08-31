import * as THREE from 'three';
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
export declare class CustomShaderMaterial {
    id: string;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    uniforms: Record<string, UniformDefinition>;
    transparent: boolean;
    wireframe: boolean;
    side: 'front' | 'back' | 'double';
    blending: 'normal' | 'additive' | 'subtractive' | 'multiply';
    depthWrite: boolean;
    depthTest: boolean;
    private threeMaterial;
    constructor(name?: string, options?: CustomShaderMaterialOptions);
    setUniform(name: string, value: any, type?: UniformType): void;
    getUniform(name: string): any;
    update(dt: number, elapsedTime: number): void;
    toThreeMaterial(): THREE.ShaderMaterial;
    private updateThreeUniforms;
    /**
     * Returns a THREE-compatible value for the given source value + type.
     * If `target` is an existing THREE value of the correct type, it is mutated
     * IN PLACE and returned (zero allocation); otherwise a new THREE object is
     * allocated (fallback used only when a uniform was just created).
     *
     * `any` is required here: shader uniform values are intentionally polymorphic
     * (number | number[] | Color | THREE.Color | THREE.Vector* | string), and the
     * helper branches on runtime `instanceof` / `typeof` checks rather than a
     * single static type.
     */
    private syncThreeUniformValue;
    private formatThreeUniformValue;
    clone(): CustomShaderMaterial;
    toJSON(): any;
    static fromJSON(json: any): CustomShaderMaterial;
    /**
     * Default Vertex Shader supporting Local Space, World Space, View/Camera Space transforms & Matrices
     */
    static DEFAULT_VERTEX_SHADER: string;
    static DEFAULT_FRAGMENT_SHADER: string;
}
