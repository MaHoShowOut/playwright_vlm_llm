const { chromium } = require('playwright');

async function inspectPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  const html = await page.content();
  console.log('Page HTML:', html);

  await page.waitForTimeout(5000);
  await browser.close();
}

inspectPage();
