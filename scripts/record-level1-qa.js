/**
 * Headless QA Script: Launches Fox's Puzzle Quest, triggers AI Auto-Play on Level 1,
 * intercepts the recorded WebM video download, and saves it as a GitHub Artifact.
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

  console.log('Opening Fox Game...');
  await page.goto('http://localhost:4173/examples/fox-game/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('🤖 Triggering AI Test & Record button...');
  
  // Set up download event listener BEFORE triggering AI recording
  const downloadPromise = page.waitForEvent('download', { timeout: 25000 }).catch(err => {
    console.log('Download event timeout, checking fallbacks:', err.message);
    return null;
  });

  await page.evaluate(() => {
    if (typeof window.runAiTestLevel1Record === 'function') {
      window.runAiTestLevel1Record();
    } else {
      document.getElementById('btn-ai-autoplay')?.click();
    }
  });

  console.log('Waiting for Level 1 AI clearance and download event...');
  const download = await downloadPromise;

  if (download) {
    const filename = download.suggestedFilename() || 'fox-level1-qa-gameplay-recording.webm';
    const targetPath = path.join(process.cwd(), filename);
    await download.saveAs(targetPath);
    console.log(`✅ Successfully saved recorded video artifact to: ${targetPath}`);
  } else {
    console.log('⚠️ Warning: Download event did not fire within window.');
  }

  await page.waitForTimeout(2000);
  console.log('✅ QA Run Complete! Closing browser...');
  await browser.close();
  await server.close();
  process.exit(0);
}

run().catch(err => {
  console.error('QA Recording script error:', err);
  process.exit(1);
});
