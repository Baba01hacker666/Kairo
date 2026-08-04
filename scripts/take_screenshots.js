import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const BASE = process.env.BASE_URL || 'http://localhost:4173';

const VIEWS = [
  { name: 'hub', url: `${BASE}/` },
  { name: 'go-wasm', url: `${BASE}/examples/go-wasm/index.html` },
  { name: 'go-runner', url: `${BASE}/examples/go-runner/index.html` },
  { name: 'stickman', url: `${BASE}/examples/stickman-game/index.html` },
  { name: 'cherry-blossoms', url: `${BASE}/examples/cherry-blossoms/index.html` },
  { name: 'high-quality-render', url: `${BASE}/examples/high-quality-render/index.html` },
  { name: 'fox-game', url: `${BASE}/examples/fox-game/index.html` },
  { name: 'go-fox', url: `${BASE}/examples/go-fox/index.html` },
  { name: 'the-arrival', url: `${BASE}/examples/the-arrival/index.html`, wait: 18000 }
];

(async () => {
  console.log('Launching browser...');
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Playwright is not installed. Run `npm install` before taking screenshots.');
    throw new Error(message);
  }

  let browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader']
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Executable doesn't exist") && !message.includes('Please run the following command to download new browsers')) {
      throw error;
    }

    console.log('Playwright Chromium is not installed; running `npx playwright install chromium` and retrying...');
    execFileSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' });
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader']
    });
  }
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  for (const view of VIEWS) {
    console.log(`Taking screenshot for ${view.name} at ${view.url}...`);
    try {
      await page.goto(view.url, { waitUntil: 'networkidle', timeout: 10000 }).catch(e => console.error("Navigation timeout, proceeding anyway...", e.message));
      // Wait for WebGL/WASM canvases to fully render (per-view configurable)
      await new Promise(r => setTimeout(r, view.wait || 3000));
      
      const screenshotPath = path.join('screenshots', `${view.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved ${screenshotPath}`);
    } catch (e) {
      console.error(`Failed to screenshot ${view.name}:`, e);
    }
  }

  await browser.close();
  console.log('All screenshots completed successfully.');
})();
