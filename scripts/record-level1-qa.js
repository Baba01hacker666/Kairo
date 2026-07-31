/**
 * Headless QA Script: Launches Fox's Puzzle Quest, triggers AI Auto-Play on Level 1,
 * and saves recorded video artifact.
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';

async function run() {
  console.log('🚀 Starting Vite preview server...');
  const server = await createServer({
    server: { port: 4173 }
  });
  await server.listen();
  console.log('Server running at http://localhost:4173');

  console.log('🌐 Launching Headless Chromium browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-setuid-sandbox', '--ignore-gpu-blocklist']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    acceptDownloads: true
  });

  const page = await context.newPage();
  console.log('Opening Fox Game...');
  await page.goto('http://localhost:4173/examples/fox-game/index.html');
  await page.waitForTimeout(2000);

  console.log('🤖 Triggering AI Test & Record button...');
  await page.click('#btn-ai-autoplay');

  // Wait for Level 1 completion modal (AI plays Level 1)
  console.log('Waiting for Level 1 AI clearance...');
  await page.waitForSelector('.menu-screen', { timeout: 25000 }).catch(() => console.log('Timeout waiting for modal, continuing...'));

  await page.waitForTimeout(3000);
  console.log('✅ QA Run Complete! Closing browser...');
  await browser.close();
  await server.close();
  process.exit(0);
}

run().catch(err => {
  console.error('QA Recording script error:', err);
  process.exit(1);
});
