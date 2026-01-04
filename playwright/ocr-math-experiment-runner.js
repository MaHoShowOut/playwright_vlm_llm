
const { chromium, firefox, webkit } = require('playwright');
const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// --- Configuration ---
const TOTAL_RUNS_PER_BROWSER = 30;
const BROWSERS = ['chromium', 'firefox', 'webkit'];
// --- End Configuration ---

/**
 * A simple and safe evaluation function for basic math expressions.
 * @param {string} expression - The math expression string, e.g., "5+3"
 * @returns {number} The result of the calculation.
 */
function safeEval(expression) {
    try {
        // This regex is specifically for math expressions, allowing only numbers and operators.
        const sanitized = expression.replace(/[^0-9+\-*().]/g, '');
        if (sanitized !== expression) {
            return NaN; // OCR read an invalid character
        }
        return new Function('return ' + sanitized)();
    } catch (e) {
        return NaN; // Expression was not valid, e.g., "5++3"
    }
}

/**
 * Runs a single instance of the OCR math captcha test using a specifically
 * configured Tesseract.js instance for this task.
 * @param {string} browserType - 'chromium', 'firefox', or 'webkit'
 * @param {number} runIndex - The index of the current run for logging
 * @returns {Promise<{success: boolean, reason?: string, ocrText?: string, actual?: string, calculated?: number}>}
 */
async function runSingleTest(browserType, runIndex) {
  console.log(`  ${browserType} - 第${runIndex + 1}/${TOTAL_RUNS_PER_BROWSER}次测试`);
  let browser;
  let worker;
  try {
    // Initialize Tesseract worker with a configuration optimized for math captchas.
    // This is crucial for a fair comparison.
    worker = await createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789+-*=', // Whitelist only relevant characters
    });

    // Launch Playwright browser
    const browserLaunchers = { chromium, firefox, webkit };
    browser = await browserLaunchers[browserType].launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('file://' + path.resolve(__dirname, 'math-captcha.html'));
    await page.waitForSelector('#captcha-image', { timeout: 10000 });

    // Get ground truth for verification
    const actualAnswer = await page.evaluate(() => window.currentAnswer);
    
    // Take screenshot of the captcha element
    const captchaElement = await page.$('#captcha-image');
    const screenshotBuffer = await captchaElement.screenshot();

    // Perform OCR
    const { data: { text } } = await worker.recognize(screenshotBuffer);
    const ocrText = text.trim().replace('=', '');

    // Calculate result from OCR text
    const calculatedResult = safeEval(ocrText);
    if (isNaN(calculatedResult)) {
        return { success: false, reason: '无法计算表达式', ocrText: ocrText, actual: actualAnswer };
    }

    // Verify
    if (String(calculatedResult) === String(actualAnswer)) {
        return { success: true, ocrText: ocrText };
    } else {
        return { success: false, reason: '计算结果错误', ocrText: ocrText, calculated: calculatedResult, actual: actualAnswer };
    }

  } catch (error) {
    return { success: false, reason: error.message };
  } finally {
    if (worker) await worker.terminate();
    if (browser) await browser.close();
  }
}

/**
 * Main function to run the entire experiment suite.
 */
async function runExperiment() {
  console.log('🚀 开始Tesseract.js OCR数学验证码大规模实验 (优化配置)...');
  
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
        console.log(`    ❌ 失败 ${browserSuccess}/${i + 1} - 原因: ${result.reason} (OCR: '${result.ocrText}', 实际: ${result.actual})`);
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
    title: 'Tesseract.js OCR数学验证码实验报告 (优化配置)',
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
  const jsonReportPath = path.join(__dirname, 'experiment-results', `ocr-math-experiment-optimized-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`\n详细报告已保存: ${jsonReportPath}`);
}

runExperiment().catch(console.error);
