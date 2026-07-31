/**
 * Headless QA Script: Launches Fox's Puzzle Quest, triggers AI Auto-Play on Level 1,
 * captures screenshot and video recording artifacts.
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import path from 'path';

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

  // Listen for browser downloads and save directly to project root
  page.on('download', async (download) => {
    const filename = download.suggestedFilename() || 'fox-level1-qa-gameplay-recording.webm';
    const targetPath = path.join(process.cwd(), filename);
    await download.saveAs(targetPath);
    console.log(`📥 Saved downloaded recording artifact: ${targetPath}`);
  });

  // Real URL with Vite base '/Kairo/' prefix
  const targetUrl = 'http://localhost:4173/Kairo/examples/fox-game/index.html';
  console.log(`Opening Fox Game at real URL: ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Take initial loading screenshot
  await page.screenshot({ path: path.join(process.cwd(), 'fox-level1-qa-start.png') });

  console.log('🤖 Triggering AI Test & Record button...');
  await page.evaluate(() => {
    if (typeof window.runAiTestLevel1Record === 'function') {
      window.runAiTestLevel1Record();
    } else {
      document.getElementById('btn-ai-autoplay')?.click();
    }
  });

  console.log('Waiting for Level 1 AI clearance...');
  await page.waitForTimeout(14000);

  // Take Level 1 clearance screenshot
  const screenshotPath = path.join(process.cwd(), 'fox-level1-qa-cleared.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Saved Level 1 QA Screenshot artifact to: ${screenshotPath}`);

  await page.waitForTimeout(1000);
  console.log('✅ QA Run Complete! Closing browser...');
  await browser.close();
  await server.close();
  process.exit(0);
}

run().catch(err => {
  console.error('QA Recording script error:', err);
  process.exit(1);
});
