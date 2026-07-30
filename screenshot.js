import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  console.log("Navigating to local preview server...");
  await page.goto('http://localhost:4173/examples/go-wasm/index.html', { waitUntil: 'networkidle0' });
  
  console.log("Waiting 2 seconds for engine to render...");
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
  console.log('Screenshot saved to screenshot.png');
})();
