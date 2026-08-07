import { Color } from '@kairo/core';
import { CustomShaderMaterial } from './ShaderMaterial.ts';
import { ShaderPresetName } from './ShaderPresets.ts';
export declare const RenderQueue: {
    readonly Opaque: 2000;
    readonly AlphaTest: 2450;
    readonly Transparent: 3000;
};
export declare class Material {
    id: string;
    name: string;
    color: Color;
    roughness: number;
    metalness: number;
    emissive: Color;
    wireframe: boolean;
    transparent: boolean;
    opacity: number;
    mapUrl: string | null;
    normalMapUrl: string | null;
    shaderGraphNodes: any[];
    isShaderMaterial: boolean;
    customShaderMaterial: CustomShaderMaterial | null;
    constructor(name?: string);
    setShaderPreset(presetName: ShaderPresetName): CustomShaderMaterial;
    setCustomShader(shaderMaterial: CustomShaderMaterial): void;
    clone(): Material;
}
