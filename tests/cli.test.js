import assert from 'node:assert';
import test from 'node:test';
import { CodeBugAuditor, runCLI } from '../packages/tools/src/cli.ts';

test('Kairo CLI - Detects GC allocations inside update loops', () => {
  const badCode = `
    app.onUpdate((dt) => {
      const tempPos = new THREE.Vector3(1, 2, 3);
      player.position.add(tempPos);
    });
  `;

  const issues = CodeBugAuditor.scanFileContent('test-game.ts', badCode);
  const gcIssue = issues.find(i => i.code === 'GC_CHURN_IN_LOOP');
  assert.notStrictEqual(gcIssue, undefined);
  assert.strictEqual(gcIssue?.severity, 'warning');
  assert.ok(gcIssue?.suggestedFix.includes('scratch object'));
});

test('Kairo CLI - Detects unchecked division by magnitude (NaN risk)', () => {
  const badCode = `
    function move(x, z) {
      const mag = Math.hypot(x, z);
      const nx = x / mag;
      const nz = z / mag;
    }
  `;

  const issues = CodeBugAuditor.scanFileContent('movement.ts', badCode);
  const nanIssue = issues.find(i => i.code === 'NAN_DIV_ZERO_RISK');
  assert.notStrictEqual(nanIssue, undefined);
  assert.strictEqual(nanIssue?.severity, 'critical');
});

test('Kairo CLI - Detects hardcoded absolute asset paths', () => {
  const badCode = `
    const loader = new GLTFLoader();
    loader.load('/models/Character.glb', (gltf) => {});
  `;

  const issues = CodeBugAuditor.scanFileContent('player.ts', badCode);
  const assetIssue = issues.find(i => i.code === 'HARDCODED_ABSOLUTE_ASSET_PATH');
  assert.notStrictEqual(assetIssue, undefined);
  assert.strictEqual(assetIssue?.severity, 'warning');
});

test('Kairo CLI - Detects shader uniform type mismatches', () => {
  const badCode = `
    material.setUniform('u_shallowColor', { r: 0.2, g: 0.8, b: 0.9 }, 'color');
  `;

  const issues = CodeBugAuditor.scanFileContent('world.ts', badCode);
  const shaderIssue = issues.find(i => i.code === 'SHADER_UNIFORM_TYPE_MISMATCH');
  assert.notStrictEqual(shaderIssue, undefined);
  assert.strictEqual(shaderIssue?.severity, 'critical');
});

test('Kairo CLI - Directory scan & Markdown report generation', () => {
  const report = CodeBugAuditor.scanDirectory('examples/fox-odyssey/src');
  assert.ok(report.filesScanned > 0);
  assert.ok(report.healthScore >= 80);

  const md = CodeBugAuditor.formatMarkdown(report);
  assert.ok(md.includes('# 🐞 Kairo CLI - Game Bug Audit Report'));
  assert.ok(md.includes('Health Score:'));
});

test('Kairo CLI - Command line execution doctor and audit', async () => {
  const doctorExit = await runCLI(['doctor']);
  assert.strictEqual(doctorExit, 0);

  const auditExit = await runCLI(['audit', 'examples/fox-odyssey/src']);
  assert.strictEqual(auditExit, 0);
});
