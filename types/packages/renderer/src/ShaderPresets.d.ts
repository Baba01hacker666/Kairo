import { CustomShaderMaterial } from './ShaderMaterial.ts';
export type ShaderPresetName = 'water' | 'dissolve' | 'hologram' | 'toon' | 'fresnel';
export declare const SHADER_PRESETS: ShaderPresetName[];
export declare class ShaderPresets {
    /**
     * Water Wave Shader: Procedural wave displacement using Local Space or World Space matrices, color depth gradient, specular highlights & foam rim.
     */
    static createWaterShader(): CustomShaderMaterial;
    /**
     * Dissolve Shader: Procedural noise cutoff operating in Local Space or World Space matrix coordinates.
     */
    static createDissolveShader(): CustomShaderMaterial;
    /**
     * Hologram Shader: Scanlines, fresnel rim, local position glitch offset, translucent cyber grid.
     */
    static createHologramShader(): CustomShaderMaterial;
    /**
     * Toon / Cel Shader: Discrete light banding steps in world space with outline rim glow.
     */
    static createToonShader(): CustomShaderMaterial;
    /**
     * Glowing Rim / Fresnel Aura Shader: Dynamic pulsing edge illumination in world space.
     */
    static createFresnelGlowShader(): CustomShaderMaterial;
    static getPreset(preset: ShaderPresetName): CustomShaderMaterial;
}
