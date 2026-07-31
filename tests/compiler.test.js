import test from 'node:test';
import assert from 'node:assert';
import { EngineCompiler } from '../packages/tools/src/Compiler.ts';

test('EngineCompiler AOT game compilation and binary bundling', () => {
  const mockLevels = [
    {
      id: 1,
      name: 'Test Level 1',
      world: 1,
      gridSize: [10, 10],
      startPos: [1, 1],
      goalPos: [8, 8],
      parMoves: 12,
      hint: 'Move forward',
      elements: [
        { type: 'crate', pos: [3, 3] },
        { type: 'avocado', pos: [5, 5] }
      ]
    },
    {
      id: 2,
      name: 'Test Level 2',
      world: 1,
      gridSize: [12, 12],
      startPos: [2, 2],
      goalPos: [10, 10],
      parMoves: 15,
      hint: 'Push crate',
      elements: [
        { type: 'crate', pos: [4, 4] },
        { type: 'tnt', pos: [6, 6] }
      ]
    }
  ];

  const result = EngineCompiler.compileGame(mockLevels, {
    targetPlatform: 'mobile',
    compressBinaryLevels: true,
    prebakeSpatialHash: true,
    minifyShaders: true
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.levelsCompiled, 2);
  assert.strictEqual(result.compiledLevels.length, 2);
  assert.ok(result.totalCompiledSizeBytes > 0);
  assert.ok(result.compiledLevels[0].spatialHashBake.length > 0);
  assert.ok(result.compiledLevels[0].binaryPayload.length > 0);
  assert.strictEqual(typeof result.compiledLevels[0].checksum, 'number');
});

test('EngineCompiler shader minification', () => {
  const rawShader = `
    // Main fragment shader
    void main() {
      /* Calculate color */
      vec4 color = vec4(1.0, 0.5, 0.0, 1.0);
      gl_FragColor = color;
    }
  `;

  const minified = EngineCompiler.minifyShader(rawShader);
  assert.ok(!minified.includes('//'));
  assert.ok(!minified.includes('/*'));
  assert.strictEqual(minified, 'void main(){vec4 color=vec4(1.0,0.5,0.0,1.0);gl_FragColor=color;}');
});
