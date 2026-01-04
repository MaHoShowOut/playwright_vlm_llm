
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set a consistent viewport for predictable screenshots
  await page.setViewportSize({ width: 800, height: 600 });

  // --- Screenshot for broken-layout.html ---
  const brokenLayoutUrl = `file://${path.resolve(process.cwd(), 'playwright/test-pages/broken-layout.html')}`;
  await page.goto(brokenLayoutUrl);
  // Wait for the gradient background to render
  await page.waitForTimeout(500); 
  await page.screenshot({ path: 'playwright/screenshots/thesis-broken-layout.png' });
  console.log('Screenshot saved to playwright/screenshots/thesis-broken-layout.png');

  // --- Screenshot for color-broken.html ---
  const colorBrokenUrl = `file://${path.resolve(process.cwd(), 'playwright/test-pages/color-broken.html')}`;
  await page.goto(colorBrokenUrl);
  // Wait for the gradient background to render
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'playwright/screenshots/thesis-color-broken.png' });
  console.log('Screenshot saved to playwright/screenshots/thesis-color-broken.png');

  await browser.close();
})();
