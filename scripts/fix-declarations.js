// Make emitted declarations resolvable by consumers without this repo's TS aliases.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist/types');
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await visit(file); continue; }
    if (!entry.name.endsWith('.d.ts')) continue;
    let text = await readFile(file, 'utf8');
    text = text.replace(/(['"])(@kairo\/([\w-]+))\1/g, (_match, quote, _alias, pkg) => {
      let relative = path.relative(path.dirname(file), path.join(root, 'packages', pkg, 'src', 'index.js')).replaceAll(path.sep, '/');
      if (!relative.startsWith('.')) relative = './' + relative;
      return quote + relative + quote;
    });
    text = text.replace(/(['"])(\.{1,2}\/[^'"]+)\.ts\1/g, '$1$2.js$1');
    await writeFile(file, text);
  }
}
await visit(root);
