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

test('updateThreeUniforms syncs uniform values into the THREE material without Object.entries', () => {
  const mat = new CustomShaderMaterial('Synced', {
    uniforms: {
      u_speed: { value: 1.0, type: 'float' },
      u_tint: { value: new Color(0, 0, 1, 1), type: 'color' },
      u_offset: { value: [1, 2], type: 'vec2' }
    }
  });

  const threeMat = mat.toThreeMaterial();
  const tintUniform = threeMat.uniforms['u_tint'];
  const originalTintValue = tintUniform.value; // capture the THREE.Color instance
  const offsetUniform = threeMat.uniforms['u_offset'];
  const originalOffsetValue = offsetUniform.value; // capture the THREE.Vector2 instance

  // Mutate the source uniforms and ensure the hot-path sync writes into the
  // already-allocated THREE objects (no fresh allocation, no Object.entries).
  mat.setUniform('u_speed', 42.0);
  mat.setUniform('u_tint', new Color(1, 0, 0, 1));
  mat.setUniform('u_offset', [9, 8]);
  mat.toThreeMaterial(); // triggers updateThreeUniforms on the cached material

  assert.strictEqual(threeMat.uniforms['u_speed'].value, 42.0);

  // color wrote into the SAME THREE.Color instance (in-place, zero allocation).
  assert.strictEqual(threeMat.uniforms['u_tint'].value, originalTintValue);
  assert.strictEqual(threeMat.uniforms['u_tint'].value.r, 1);
  assert.strictEqual(threeMat.uniforms['u_tint'].value.g, 0);
  assert.strictEqual(threeMat.uniforms['u_tint'].value.b, 0);

  // vec2 wrote into the SAME THREE.Vector2 instance.
  assert.strictEqual(threeMat.uniforms['u_offset'].value.x, 9);
  assert.strictEqual(threeMat.uniforms['u_offset'].value.y, 8);
});

test('clone performs a deep copy of uniform definitions including arrays and colors', () => {
  const source = new CustomShaderMaterial('Source', {
    uniforms: {
      u_tint: { value: new Color(0.2, 0.4, 0.6, 1), type: 'color' },
      u_offset: { value: [3, 4], type: 'vec2' },
      u_label: { value: 7, type: 'float' }
    }
  });

  const cloned = source.clone();
  assert.strictEqual(cloned.name, 'Source Copy');
  assert.notStrictEqual(cloned.uniforms, source.uniforms);

  // Color is a new instance, not shared by reference.
  assert.ok(source.uniforms['u_tint'].value instanceof Color);
  assert.notStrictEqual(cloned.uniforms['u_tint'].value, source.uniforms['u_tint'].value);
  assert.deepStrictEqual(
    [cloned.uniforms['u_tint'].value.r, cloned.uniforms['u_tint'].value.g, cloned.uniforms['u_tint'].value.b, cloned.uniforms['u_tint'].value.a],
    [0.2, 0.4, 0.6, 1]
  );

  // Array is a copy, not the same reference.
  assert.notStrictEqual(cloned.uniforms['u_offset'].value, source.uniforms['u_offset'].value);
  assert.deepStrictEqual(cloned.uniforms['u_offset'].value, [3, 4]);

  // Mutating the clone does not affect the source.
  cloned.uniforms['u_label'].value = 99;
  assert.strictEqual(source.uniforms['u_label'].value, 7);
});

test('toJSON and fromJSON round-trip preserves all uniform types', () => {
  const mat = new CustomShaderMaterial('RoundTrip', {
    transparent: true,
    side: 'double',
    uniforms: {
      u_speed: { value: 3.5, type: 'float' },
      u_tint: { value: new Color(1, 0.5, 0, 1), type: 'color' },
      u_offset: { value: [5, 6], type: 'vec2' },
      u_pos: { value: [1, 2, 3], type: 'vec3' },
      u_full: { value: [1, 2, 3, 4], type: 'vec4' },
      u_count: { value: 9, type: 'int' }
    }
  });

  const json = mat.toJSON();
  assert.strictEqual(json.name, 'RoundTrip');
  assert.strictEqual(typeof json.uniforms['u_tint'].value, 'string'); // color serialized to hex
  assert.strictEqual(json.uniforms['u_tint'].value, '#ff8000');

  const restored = CustomShaderMaterial.fromJSON(json);
  assert.strictEqual(restored.name, 'RoundTrip');
  assert.strictEqual(restored.transparent, true);
  assert.strictEqual(restored.side, 'double');

  assert.strictEqual(restored.getUniform('u_speed'), 3.5);
  assert.strictEqual(restored.getUniform('u_count'), 9);
  assert.deepStrictEqual(restored.getUniform('u_offset'), [5, 6]);
  assert.deepStrictEqual(restored.getUniform('u_pos'), [1, 2, 3]);
  assert.deepStrictEqual(restored.getUniform('u_full'), [1, 2, 3, 4]);

  const restoredColor = restored.getUniform('u_tint');
  assert.ok(restoredColor instanceof Color);
  // Round-trip integrity is best asserted on the serialized hex (avoids float
  // quantization noise from 128/255 ~= 0.5019607843137255).
  assert.strictEqual(restoredColor.toHex(), '#ff8000');
});

test('fromJSON is immune to prototype-pollution payloads', () => {
  const malicious = {
    name: 'Evil',
    uniforms: {
      __proto__: { polluted: 'yes' },
      u_speed: { value: 1.0, type: 'float' }
    }
  };
  const mat = CustomShaderMaterial.fromJSON(malicious);
  assert.strictEqual(mat.getUniform('u_speed'), 1.0);
  // ensure no pollution leaked onto Object.prototype
  assert.strictEqual(({}).polluted, undefined);
});

test('Material integration with custom shader materials', () => {
  const mat = new Material('Standard Box');
  assert.strictEqual(mat.isShaderMaterial, false);

  mat.setShaderPreset('water');
  assert.strictEqual(mat.isShaderMaterial, true);
  assert.ok(mat.customShaderMaterial);
  assert.strictEqual(mat.customShaderMaterial.uniforms.u_shallowColor !== undefined, true);
});
