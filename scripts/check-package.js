// Run after build:package to catch regressions in the distributable, not just source tests.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const manifest = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' }))[0];
const files = new Set(manifest.files.map(file => file.path));
for (const file of ['bin/kairo.js', 'dist/cli/cli.js', 'dist/lib/kairo.mjs', 'dist/types/packages/core/src/index.d.ts']) {
  assert.ok(files.has(file), `Package is missing ${file}`);
}
execFileSync(process.execPath, ['bin/kairo.js', 'doctor'], { stdio: 'pipe' });
async function checkDeclarations(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await checkDeclarations(file);
    else if (file.endsWith('.d.ts')) {
      const text = await readFile(file, 'utf8');
      assert.doesNotMatch(text, /['"]@kairo\//, `${file} contains an internal alias`);
      assert.doesNotMatch(text, /['"]\.{1,2}\/[^'"]+\.ts['"]/, `${file} contains a TypeScript source import`);
    }
  }
}
await checkDeclarations('dist/types');
console.log('Package smoke checks passed.');
