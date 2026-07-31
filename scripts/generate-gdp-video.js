const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

const server = app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1920,1080'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });

  const page = await browser.newPage();
  
  // Set download behavior to save to the current directory
  const downloadPath = path.resolve(__dirname, '../output');
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);
  
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });

  console.log('Navigating to GDP Explainer...');
  await page.goto(`http://localhost:${PORT}/examples/gdp-explainer/index.html`, { waitUntil: 'networkidle2' });

  console.log('Starting video sequence...');
  // Click the start button which triggers KairoAPI and the video sequence
  await page.click('#btn-start');

  console.log('Waiting for video recording to complete (approx 20 seconds)...');
  // Wait until the webm file appears in the download folder
  let fileFound = false;
  let attempts = 0;
  while (!fileFound && attempts < 30) {
    await new Promise(r => setTimeout(r, 1000));
    const files = fs.readdirSync(downloadPath);
    if (files.some(f => f.endsWith('.webm') && !f.endsWith('.crdownload'))) {
      fileFound = true;
      console.log('Video downloaded successfully:', files.find(f => f.endsWith('.webm')));
    }
    attempts++;
  }

  if (!fileFound) {
    console.error('Failed to download video within the timeout.');
  }

  await browser.close();
  server.close();
  process.exit(fileFound ? 0 : 1);
});
