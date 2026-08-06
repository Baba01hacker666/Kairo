/**
 * Record The Arrival cinematic using Playwright's native video capture.
 * Runs a local Vite preview server, loads the scene, waits for the full
 * cinematic to play through, then saves the .webm to the artifacts dir.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'scripts', 'artifacts');
const VIDEO_PATH  = path.join(ARTIFACT_DIR, 'the-arrival.webm');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function record() {

  console.log('Launching headless Chromium with video recording...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=swiftshader',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--enable-webgl',
    ]
  });

  // Playwright writes video to a temp dir; we move it afterwards.
  const tmpVideoDir = path.join(ARTIFACT_DIR, 'tmp_video');
  if (!fs.existsSync(tmpVideoDir)) fs.mkdirSync(tmpVideoDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    // Playwright native video recording — records everything rendered.
    recordVideo: {
      dir: tmpVideoDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  page.on('console', m => console.log('  [browser]', m.text()));
  page.on('pageerror', e => console.error('  [browser ERROR]', e.message));

  const URL = 'http://localhost:4173/examples/the-arrival/index.html';
  console.log(`Opening: ${URL}`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

  // The cinematic auto-starts after 750 ms. Total runtime is ~50 s.
  // We wait 65 s to capture everything including fade-out + end card.
  console.log('Recording cinematic (65 seconds)...');
  await page.waitForTimeout(65000);

  // Take a mid-point screenshot for quick inspection.
  const screenshotPath = path.join(ARTIFACT_DIR, 'the-arrival-frame.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved: ${screenshotPath}`);

  console.log('Closing browser and flushing video...');
  const video = page.video();
  await context.close(); // flushes the video file
  await browser.close();

  // Move the written video to a predictable path.
  if (video) {
    const savedPath = await video.path();
    if (savedPath && fs.existsSync(savedPath)) {
      fs.copyFileSync(savedPath, VIDEO_PATH);
      console.log(`Video saved: ${VIDEO_PATH}`);
    }
  } else {
    // Fallback: find any .webm in the tmp dir.
    const files = fs.readdirSync(tmpVideoDir).filter(f => f.endsWith('.webm'));
    if (files.length) {
      fs.copyFileSync(path.join(tmpVideoDir, files[0]), VIDEO_PATH);
      console.log(`Video saved (fallback): ${VIDEO_PATH}`);
    }
  }

  console.log('Done.');
  process.exit(0);
}

record().catch(err => {
  console.error('Recording failed:', err);
  process.exit(1);
});
