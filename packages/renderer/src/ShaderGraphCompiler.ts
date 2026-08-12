import { CustomShaderMaterial, UniformDefinition } from './ShaderMaterial.ts';
import { Color } from '../../core/src/Math.ts';

export type ShaderNodeType =
  | 'input_time'
  | 'input_uv'
  | 'input_local_pos'
  | 'input_world_pos'
  | 'input_view_pos'
  | 'input_world_normal'
  | 'input_color'
  | 'input_noise'
  | 'input_float'
  | 'space_conversion'
  | 'matrix_transform'
  | 'fresnel'
  | 'math_add'
  | 'math_multiply'
  | 'math_sin'
  | 'math_step'
  | 'master_output';

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

export class ShaderGraphCompiler {
  /**
   * Compiles a visual node graph into vertex & fragment GLSL code supporting Local Space, World Space, View Space, and Matrix transforms.
   */
  public static compile(graph: ShaderGraphData): {
    vertexShader: string;
    fragmentShader: string;
    uniforms: Record<string, UniformDefinition>;
  } {
    const uniforms: Record<string, UniformDefinition> = {
      u_time: { value: 0.0, type: 'float' },
      u_resolution: { value: [1000, 800], type: 'vec2' }
    };

    const masterNode = graph.nodes.find(n => n.type === 'master_output');

    let fragmentBody = '';
    let noiseHelperAdded = false;

    // Helper map to store variable expression names for node output ports
    const portVarMap = new Map<string, string>();

    const visited = new Set<string>();

    const getIncomingConnection = (toNodeId: string, toPortId: string) => {
      return graph.connections.find(c => c.toNodeId === toNodeId && c.toPortId === toPortId);
    };

    const resolveNode = (nodeId: string): void => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graph.nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Resolve input dependencies first
      for (const input of node.inputs) {
        const conn = getIncomingConnection(node.id, input.id);
        if (conn) {
          resolveNode(conn.fromNodeId);
        }
      }

      const getInputValue = (portId: string, fallback: string = '0.0'): string => {
        const conn = getIncomingConnection(node.id, portId);
        if (conn && portVarMap.has(`${conn.fromNodeId}_${conn.fromPortId}`)) {
          return portVarMap.get(`${conn.fromNodeId}_${conn.fromPortId}`)!;
        }
        if (node.properties && node.properties[portId] !== undefined) {
          const val = node.properties[portId];
          return typeof val === 'number' ? val.toFixed(3) : fallback;
        }
        return fallback;
      };

      switch (node.type) {
        case 'input_time': {
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, 'u_time');
          break;
        }
        case 'input_uv': {
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, 'vUv');
          break;
        }
        case 'input_local_pos': {
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, 'vLocalPosition');
          break;
        }
        case 'input_world_pos': {
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, 'vWorldPosition');
          break;
        }
        case 'input_view_pos': {
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, 'vViewPosition');
          break;
        }
        case 'input_world_normal': {
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, 'vWorldNormal');
          break;
        }
        case 'space_conversion': {
          const mode = node.properties?.mode || 'localToWorld'; // localToWorld | worldToView | viewToClip
          const posVal = getInputValue('in', 'vLocalPosition');
          const varName = `space_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          
          if (mode === 'localToWorld') {
            fragmentBody += `  vec3 ${varName} = vWorldPosition;\n`;
          } else if (mode === 'worldToView') {
            fragmentBody += `  vec3 ${varName} = vViewPosition;\n`;
          } else {
            fragmentBody += `  vec3 ${varName} = ${posVal};\n`;
          }
          
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, varName);
          break;
        }
        case 'matrix_transform': {
          const matType = node.properties?.matrix || 'modelMatrix'; // modelMatrix | viewMatrix | normalMatrix
          const inVec = getInputValue('in', 'vec4(vLocalPosition, 1.0)');
          const varName = `matTx_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          
          if (matType === 'normalMatrix') {
            fragmentBody += `  vec3 ${varName} = normalize(vNormal);\n`;
          } else {
            fragmentBody += `  vec4 ${varName} = ${matType} * vec4(${inVec});\n`;
          }
          
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, varName);
          break;
        }
        case 'input_color': {
          const colorHex = node.properties?.color || '#38bdf8';
          const uniformName = `u_color_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          uniforms[uniformName] = { value: new Color().setHex(colorHex), type: 'color' };
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, uniformName);
          break;
        }
        case 'input_float': {
          const val = node.properties?.value ?? 1.0;
          const uniformName = `u_float_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          uniforms[uniformName] = { value: val, type: 'float' };
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, uniformName);
          break;
        }
        case 'input_noise': {
          if (!noiseHelperAdded) {
            noiseHelperAdded = true;
          }
          const uvVal = getInputValue('uv', 'vUv');
          const scaleVal = getInputValue('scale', '8.0');
          const varName = `noise_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          fragmentBody += `  float ${varName} = noise(${uvVal} * ${scaleVal});\n`;
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, varName);
          break;
        }
        case 'fresnel': {
          const powerVal = getInputValue('power', '2.0');
          const varName = `fresnel_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          fragmentBody += `  vec3 V_${node.id} = normalize(cameraPosition - vWorldPosition);\n`;
          fragmentBody += `  float ${varName} = pow(1.0 - max(dot(V_${node.id}, vWorldNormal), 0.0), ${powerVal});\n`;
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, varName);
          break;
        }
        case 'math_add': {
          const a = getInputValue('a', '0.0');
          const b = getInputValue('b', '0.0');
          const varName = `add_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          fragmentBody += `  vec4 ${varName} = vec4(${a}) + vec4(${b});\n`;
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, `${varName}`);
          break;
        }
        case 'math_multiply': {
          const a = getInputValue('a', '1.0');
          const b = getInputValue('b', '1.0');
          const varName = `mul_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          fragmentBody += `  vec4 ${varName} = vec4(${a}) * vec4(${b});\n`;
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, `${varName}`);
          break;
        }
        case 'math_sin': {
          const val = getInputValue('in', 'u_time');
          const varName = `sin_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          fragmentBody += `  float ${varName} = sin(${val}) * 0.5 + 0.5;\n`;
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, varName);
          break;
        }
        case 'math_step': {
          const edge = getInputValue('edge', '0.5');
          const val = getInputValue('in', '0.0');
          const varName = `step_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
          fragmentBody += `  float ${varName} = step(${edge}, ${val});\n`;
          const outPort = node.outputs[0]?.id || 'out';
          portVarMap.set(`${node.id}_${outPort}`, varName);
          break;
        }
        case 'master_output': {
          const colorVal = getInputValue('color', 'vec4(0.2, 0.6, 1.0, 1.0)');
          const alphaVal = getInputValue('alpha', '1.0');
          fragmentBody += `  vec4 finalCol = vec4(${colorVal});\n`;
          fragmentBody += `  finalCol.a *= ${alphaVal};\n`;
          fragmentBody += `  gl_FragColor = finalCol;\n`;
          break;
        }
      }
    };

    if (masterNode) {
      resolveNode(masterNode.id);
    } else {
      fragmentBody += `  gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0);\n`;
    }

    const noiseFunctionDef = noiseHelperAdded ? `
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
    ` : '';

    const uniformDeclarations = Object.keys(uniforms).map(key => {
      const type = uniforms[key].type;
      const glslType = type === 'color' ? 'vec4' : type === 'float' ? 'float' : type === 'vec2' ? 'vec2' : type === 'vec3' ? 'vec3' : 'vec4';
      return `uniform ${glslType} ${key};`;
    }).join('\n');

    const vertexShader = CustomShaderMaterial.DEFAULT_VERTEX_SHADER;

    const fragmentShader = `
      ${uniformDeclarations}
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vLocalPosition;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;

      ${noiseFunctionDef}

      void main() {
${fragmentBody}
      }
    `;

    return { vertexShader, fragmentShader, uniforms };
  }

  /**
   * Generates a starter graph featuring Space & Matrix transformations.
   */
  public static createDefaultGraph(): ShaderGraphData {
    return {
      nodes: [
        {
          id: 'n_world_pos',
          type: 'input_world_pos',
          title: 'World Space Position',
          x: 40,
          y: 40,
          inputs: [],
          outputs: [{ id: 'out', name: 'WorldPos', type: 'vec3' }]
        },
        {
          id: 'n_uv',
          type: 'input_uv',
          title: 'UV Coordinates',
          x: 40,
          y: 140,
          inputs: [],
          outputs: [{ id: 'uv', name: 'UV', type: 'vec2' }]
        },
        {
          id: 'n_noise',
          type: 'input_noise',
          title: 'Procedural Noise',
          x: 260,
          y: 60,
          inputs: [
            { id: 'uv', name: 'UV', type: 'vec2' },
            { id: 'scale', name: 'Scale', type: 'float' }
          ],
          outputs: [{ id: 'out', name: 'Noise', type: 'float' }],
          properties: { scale: 10.0 }
        },
        {
          id: 'n_color',
          type: 'input_color',
          title: 'Base Color',
          x: 260,
          y: 220,
          inputs: [],
          outputs: [{ id: 'out', name: 'Color', type: 'color' }],
          properties: { color: '#38bdf8' }
        },
        {
          id: 'n_mul',
          type: 'math_multiply',
          title: 'Color Multiply',
          x: 500,
          y: 120,
          inputs: [
            { id: 'a', name: 'A', type: 'float' },
            { id: 'b', name: 'B', type: 'color' }
          ],
          outputs: [{ id: 'out', name: 'Out', type: 'color' }]
        },
        {
          id: 'n_master',
          type: 'master_output',
          title: 'Master Shader Output',
          x: 740,
          y: 120,
          inputs: [
            { id: 'color', name: 'Base Color', type: 'color' },
            { id: 'alpha', name: 'Alpha', type: 'float' }
          ],
          outputs: []
        }
      ],
      connections: [
        { fromNodeId: 'n_uv', fromPortId: 'uv', toNodeId: 'n_noise', toPortId: 'uv' },
        { fromNodeId: 'n_noise', fromPortId: 'out', toNodeId: 'n_mul', toPortId: 'a' },
        { fromNodeId: 'n_color', fromPortId: 'out', toNodeId: 'n_mul', toPortId: 'b' },
        { fromNodeId: 'n_mul', fromPortId: 'out', toNodeId: 'n_master', toPortId: 'color' }
      ]
    };
  }
}
