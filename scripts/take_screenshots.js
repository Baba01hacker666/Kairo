import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const VIEWS = [
  { name: 'hub', url: 'http://localhost:4173/Kairo/' },
  { name: 'go-wasm', url: 'http://localhost:4173/Kairo/examples/go-wasm/index.html' },
  { name: 'stickman', url: 'http://localhost:4173/Kairo/examples/stickman-game/index.html' },
  { name: 'cherry-blossoms', url: 'http://localhost:4173/Kairo/examples/cherry-blossoms/index.html' }
];

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
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
      await page.goto(view.url, { waitUntil: 'networkidle0', timeout: 15000 });
      // Wait 3 seconds for WebGL/WASM canvases to fully render
      await new Promise(r => setTimeout(r, 3000));
      
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
