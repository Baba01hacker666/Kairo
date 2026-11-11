#!/usr/bin/env node

import { runCLI } from '../dist/cli/cli.js';

runCLI().then(exitCode => {
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}).catch(err => {
  console.error('[Kairo CLI Error]', err);
  process.exit(1);
});
