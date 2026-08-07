import { UniformDefinition } from './ShaderMaterial.ts';
export type ShaderNodeType = 'input_time' | 'input_uv' | 'input_local_pos' | 'input_world_pos' | 'input_view_pos' | 'input_world_normal' | 'input_color' | 'input_noise' | 'input_float' | 'space_conversion' | 'matrix_transform' | 'fresnel' | 'math_add' | 'math_multiply' | 'math_sin' | 'math_step' | 'master_output';
export interface ShaderNodePort {
    id: string;
    name: string;
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'mat4';
}
export interface ShaderGraphNode {
    id: string;
    type: ShaderNodeType;
    title: string;
    x: number;
    y: number;
    inputs: ShaderNodePort[];
    outputs: ShaderNodePort[];
    properties?: Record<string, any>;
}
export interface ShaderGraphConnection {
    fromNodeId: string;
    fromPortId: string;
    toNodeId: string;
    toPortId: string;
}
export interface ShaderGraphData {
    nodes: ShaderGraphNode[];
    connections: ShaderGraphConnection[];
}
export declare class ShaderGraphCompiler {
    /**
     * Compiles a visual node graph into vertex & fragment GLSL code supporting Local Space, World Space, View Space, and Matrix transforms.
     */
    static compile(graph: ShaderGraphData): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: Record<string, UniformDefinition>;
    };
    /**
     * Generates a starter graph featuring Space & Matrix transformations.
     */
    static createDefaultGraph(): ShaderGraphData;
}
