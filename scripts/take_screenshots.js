import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const VIEWS = [
  { name: 'hub', url: 'http://localhost:4173/Kairo/' },
  { name: 'go-wasm', url: 'http://localhost:4173/Kairo/examples/go-wasm/index.html' },
  { name: 'go-runner', url: 'http://localhost:4173/Kairo/examples/go-runner/index.html' },
  { name: 'stickman', url: 'http://localhost:4173/Kairo/examples/stickman-game/index.html' },
  { name: 'cherry-blossoms', url: 'http://localhost:4173/Kairo/examples/cherry-blossoms/index.html' },
  { name: 'high-quality-render', url: 'http://localhost:4173/Kairo/examples/high-quality-render/index.html' },
  { name: 'fox-game', url: 'http://localhost:4173/Kairo/examples/fox-game/index.html' },
  { name: 'go-fox', url: 'http://localhost:4173/Kairo/examples/go-fox/index.html' }
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
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Executable doesn't exist") && !message.includes('Please run the following command to download new browsers')) {
      throw error;
    }

    console.log('Playwright Chromium is not installed; running `npx playwright install chromium` and retrying...');
    execFileSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' });
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  for (const view of VIEWS) {
    console.log(`Taking screenshot for ${view.name}...`);
    try {
      await page.goto(view.url, { waitUntil: 'load', timeout: 10000 }).catch(e => console.error("Navigation timeout, proceeding anyway...", e));
      // Wait 4 seconds for WebGL/WASM canvases to fully render
      await new Promise(r => setTimeout(r, 4000));
      
      const screenshotPath = path.join('screenshots', `${view.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved ${screenshotPath}`);
    } catch (e) {
      console.error(`Failed to screenshot ${view.name}:`, e);
    }
  }

  await browser.close();
  console.log('All screenshots completed.');
})();
