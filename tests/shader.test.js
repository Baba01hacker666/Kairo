import test from 'node:test';
import assert from 'node:assert';
import {
  CustomShaderMaterial,
  ShaderPresets,
  ShaderGraphCompiler,
  Material,
  SHADER_PRESETS
} from '../packages/renderer/src/index.ts';
import { Color } from '../packages/core/src/Math.ts';

test('CustomShaderMaterial uniform management and updating', () => {
  const mat = new CustomShaderMaterial('Test Shader', {
    transparent: true,
    uniforms: {
      u_speed: { value: 2.5, type: 'float' },
      u_tint: { value: new Color(1, 0, 0, 1), type: 'color' }
    }
  });

  assert.strictEqual(mat.name, 'Test Shader');
  assert.strictEqual(mat.transparent, true);
  assert.strictEqual(mat.getUniform('u_speed'), 2.5);

  mat.setUniform('u_speed', 5.0);
  assert.strictEqual(mat.getUniform('u_speed'), 5.0);

  mat.update(0.016, 1.5);
  assert.strictEqual(mat.getUniform('u_time'), 1.5);
});

test('CustomShaderMaterial Three.js conversion, cloning and JSON serialization', () => {
  const mat = new CustomShaderMaterial('Custom Glitch', {
    vertexShader: CustomShaderMaterial.DEFAULT_VERTEX_SHADER,
    fragmentShader: CustomShaderMaterial.DEFAULT_FRAGMENT_SHADER,
    wireframe: true,
    side: 'double'
  });

  const threeMat = mat.toThreeMaterial();
  assert.ok(threeMat);
  assert.strictEqual(threeMat.wireframe, true);

  const cloned = mat.clone();
  assert.strictEqual(cloned.name, 'Custom Glitch Copy');
  assert.strictEqual(cloned.wireframe, true);
  assert.strictEqual(cloned.side, 'double');

  const json = mat.toJSON();
  assert.strictEqual(json.name, 'Custom Glitch');
  assert.strictEqual(json.wireframe, true);

  const restored = CustomShaderMaterial.fromJSON(json);
  assert.strictEqual(restored.name, 'Custom Glitch');
  assert.strictEqual(restored.wireframe, true);
});

test('ShaderPresets creation for built-in shader presets with Local & World Space matrices', () => {
  assert.strictEqual(SHADER_PRESETS.length, 5);

  for (const presetName of SHADER_PRESETS) {
    const presetMat = ShaderPresets.getPreset(presetName);
    assert.ok(presetMat);
    assert.ok(presetMat.vertexShader.length > 0);
    assert.ok(presetMat.fragmentShader.length > 0);
    assert.ok(presetMat.uniforms.u_time !== undefined);
  }

  const water = ShaderPresets.createWaterShader();
  assert.ok(water.vertexShader.includes('modelMatrix'));
  assert.ok(water.vertexShader.includes('u_useWorldSpace'));

  const dissolve = ShaderPresets.createDissolveShader();
  assert.ok(dissolve.fragmentShader.includes('u_useWorldSpace'));

  const hologram = ShaderPresets.createHologramShader();
  assert.ok(hologram.vertexShader.includes('u_glitchIntensity'));

  const toon = ShaderPresets.createToonShader();
  assert.ok(toon.fragmentShader.includes('vWorldNormal'));

  const fresnel = ShaderPresets.createFresnelGlowShader();
  assert.ok(fresnel.fragmentShader.includes('vWorldNormal'));
});

test('ShaderGraphCompiler visual node graph compilation with Local/World/View space nodes', () => {
  const graph = ShaderGraphCompiler.createDefaultGraph();
  assert.ok(graph.nodes.length >= 4);

  const compiled = ShaderGraphCompiler.compile(graph);
  assert.ok(compiled.vertexShader.length > 0);
  assert.ok(compiled.fragmentShader.length > 0);
  assert.ok(compiled.fragmentShader.includes('gl_FragColor'));
  assert.ok(compiled.fragmentShader.includes('vWorldPosition'));
  assert.ok(compiled.uniforms.u_time !== undefined);
});

test('Material integration with custom shader materials', () => {
  const mat = new Material('Standard Box');
  assert.strictEqual(mat.isShaderMaterial, false);

  mat.setShaderPreset('water');
  assert.strictEqual(mat.isShaderMaterial, true);
  assert.ok(mat.customShaderMaterial);
  assert.strictEqual(mat.customShaderMaterial.uniforms.u_shallowColor !== undefined, true);
});
