
const { chromium, firefox, webkit } = require('playwright');
const { CaptchaOCR } = require('./ocr-toolkit-example'); // Reusing your existing OCR code
const path = require('path');
const fs = require('fs');

// --- Configuration ---
const TOTAL_RUNS_PER_BROWSER = 30;
const BROWSERS = ['chromium', 'firefox', 'webkit'];
// --- End Configuration ---

/**
 * Runs a single instance of the OCR test on the login page's alphanumeric captcha.
 * @param {string} browserType - 'chromium', 'firefox', or 'webkit'
 * @param {number} runIndex - The index of the current run for logging
 * @returns {Promise<{success: boolean, reason?: string, ocrText?: string, actual?: string}>}
 */
async function runSingleTest(browserType, runIndex) {
  console.log(`  ${browserType} - 第${runIndex + 1}/${TOTAL_RUNS_PER_BROWSER}次测试`);
  let browser;
  try {
    // Launch Playwright browser
    const browserLaunchers = { chromium, firefox, webkit };
    browser = await browserLaunchers[browserType].launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('file://' + path.resolve(__dirname, 'login.html'));
    await page.waitForSelector('#captchaCode', { timeout: 10000 });

    // Get ground truth for verification from the data-value attribute
    const actualCaptcha = await page.locator('#captchaCode').getAttribute('data-value');
    
    // Use the existing CaptchaOCR class from your code
    // It is designed for this type of alphanumeric captcha
    const ocr = new CaptchaOCR({ 
        maxRetries: 1, // We handle retries externally if needed; for now, just test once.
        expectedLength: actualCaptcha.length // Set expected length dynamically
    });
    const ocrResult = await ocr.recognizeCaptcha(page, '#captchaCode');

    if (!ocrResult.success) {
        return { success: false, reason: 'OCR识别失败或质量不佳', ocrText: ocrResult.text, actual: actualCaptcha };
    }
    
    const ocrText = ocrResult.text;

    // Verify if the recognized text matches the actual captcha value
    if (ocrText === actualCaptcha) {
        return { success: true, ocrText: ocrText };
    } else {
        return { success: false, reason: '识别结果不匹配', ocrText: ocrText, actual: actualCaptcha };
    }

  } catch (error) {
    return { success: false, reason: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Main function to run the entire experiment suite.
 */
async function runExperiment() {
  console.log('🚀 开始Tesseract.js OCR登录页验证码大规模实验...');
  
  try {
    require.resolve("tesseract.js");
  } catch (e) {
    console.error("❌ 错误: tesseract.js 未安装。请运行 'npm install tesseract.js' 后重试。");
    process.exit(1);
  }

  const results = [];
  let totalSuccess = 0;
  const startTime = Date.now();

  for (const browserType of BROWSERS) {
    console.log(`\n开始 ${browserType} 浏览器测试...`);
    let browserSuccess = 0;
    for (let i = 0; i < TOTAL_RUNS_PER_BROWSER; i++) {
      const result = await runSingleTest(browserType, i);
      results.push({ browser: browserType, run: i + 1, ...result });
      if (result.success) {
        totalSuccess++;
        browserSuccess++;
        console.log(`    ✅ 成功 ${browserSuccess}/${i + 1} (OCR: '${result.ocrText}')`);
      } else {
        console.log(`    ❌ 失败 ${browserSuccess}/${i + 1} - 原因: ${result.reason} (OCR: '${result.ocrText}', 实际: '${result.actual}')`);
      }
    }
    console.log(`✅ ${browserType} 浏览器测试完成`);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const totalRuns = TOTAL_RUNS_PER_BROWSER * BROWSERS.length;
  const accuracy = totalRuns > 0 ? (totalSuccess / totalRuns * 100).toFixed(2) : 0;

  console.log('\n\n--- 📊 实验总结 ---');
  console.log(`总测试次数: ${totalRuns}`);
  console.log(`成功次数: ${totalSuccess}`);
  console.log(`失败次数: ${totalRuns - totalSuccess}`);
  console.log(`总体准确率: ${accuracy}%`);
  console.log(`总耗时: ${duration.toFixed(2)}秒`);

  const report = {
    title: 'Tesseract.js OCR登录页验证码实验报告',
    date: new Date().toISOString(),
    duration,
    accuracy,
    totalRuns,
    totalSuccess,
    totalFailures: totalRuns - totalSuccess,
    config: {
      totalRunsPerBrowser: TOTAL_RUNS_PER_BROWSER,
      browsers: BROWSERS,
    },
    results,
  };

  const timestamp = new Date().getTime();
  const jsonReportPath = path.join(__dirname, 'experiment-results', `ocr-login-experiment-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`\n详细报告已保存: ${jsonReportPath}`);
}

runExperiment().catch(console.error);
