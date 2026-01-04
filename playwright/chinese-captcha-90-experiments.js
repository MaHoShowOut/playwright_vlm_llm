
const { chromium, firefox, webkit } = require('playwright');
const { VisualAIDetector } = require('./visual-ai-detector');
const path = require('path');
const fs = require('fs');

const TOTAL_RUNS_PER_BROWSER = 30;
const BROWSERS = ['chromium', 'firefox', 'webkit'];

async function runChineseCaptchaTest(browserType, runIndex) {
  console.log(`  ${browserType} - 第${runIndex + 1}/${TOTAL_RUNS_PER_BROWSER}次测试`);
  let browser;
  try {
    const browserLaunchers = { chromium, firefox, webkit };
    browser = await browserLaunchers[browserType].launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 800, height: 600 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await page.goto('file://' + path.resolve(__dirname, 'chinese-click-captcha.html'));
    await page.waitForSelector('.captcha-container', { timeout: 10000 });

    const screenshotPath = `screenshots/chinese_exp_${browserType}_${runIndex}.png`;
    await page.screenshot({ path: screenshotPath });

    const pageInfo = await page.evaluate(() => {
      const targetElement = document.querySelector('#targetChars');
      const targetText = targetElement ? targetElement.textContent : '';
      const targetChars = targetText.split('→').map(c => c.trim()).filter(c => c);
      
      const grid = document.querySelector('.captcha-grid');
      const cells = grid ? grid.querySelectorAll('.captcha-cell') : [];
      const gridChars = [];
      cells.forEach((cell, index) => {
        gridChars.push({
          char: cell.textContent.trim(),
          position: index + 1,
        });
      });
      return { targetChars, gridChars };
    });

    const detector = new VisualAIDetector(); // API Key should be loaded from environment variables
    const lvmPrompt = `请分析这个中文点击验证码图片：
1. 识别顶部蓝色区域显示的目标字符序列（"请依次点击："后面的字符）
2. 识别4x4网格中的所有中文字符及其位置
3. 以JSON格式返回结果，不要输出代码段标记
请按以下格式返回：
{
  "targetChars": ["字符1", "字符2", "字符3"],
  "gridMapping": {
    "字符1": 位置编号,
    "字符2": 位置编号,
    "字符3": 位置编号
  }
}`;
    
    const lvmResult = await detector.analyzeUIScreenshot(screenshotPath, lvmPrompt);
    let parsedResult = null;
    try {
      const jsonMatch = lvmResult.analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // JSON parsing failed
    }

    if (!parsedResult || !parsedResult.targetChars || !parsedResult.gridMapping) {
      return { success: false, reason: 'LVM结果解析失败', lvmResponse: lvmResult.analysis, actual: pageInfo };
    }

    const targetMatch = JSON.stringify(parsedResult.targetChars) === JSON.stringify(pageInfo.targetChars);
    if (!targetMatch) {
        return { success: false, reason: '目标字符识别错误', lvmResponse: parsedResult, actual: pageInfo };
    }

    let positionCorrect = 0;
    for (const char of pageInfo.targetChars) {
      const actualPosition = pageInfo.gridChars.find(c => c.char === char)?.position;
      const lvmPosition = parsedResult.gridMapping[char];
      if (actualPosition === lvmPosition) {
        positionCorrect++;
      }
    }

    if (positionCorrect !== pageInfo.targetChars.length) {
        return { success: false, reason: '字符位置识别错误', lvmResponse: parsedResult, actual: pageInfo };
    }

    for (const char of parsedResult.targetChars) {
        const position = parsedResult.gridMapping[char];
        const selector = `.captcha-grid div:nth-child(${position})`;
        await page.click(selector);
        await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);
    const resultText = await page.locator('.captcha-result').textContent({ timeout: 5000 });
    const finalSuccess = resultText.includes('正确') || resultText.includes('成功');
    
    if (finalSuccess) {
        return { success: true };
    } else {
        return { success: false, reason: '点击后验证失败', lvmResponse: parsedResult, actual: pageInfo, resultText };
    }

  } catch (error) {
    return { success: false, reason: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function runExperiment() {
  console.log('开始中文点击验证码3x30大规模实验...');
  const results = [];
  let totalSuccess = 0;
  const startTime = Date.now();

  for (const browserType of BROWSERS) {
    console.log(`\n开始${browserType}浏览器测试...`);
    let browserSuccess = 0;
    for (let i = 0; i < TOTAL_RUNS_PER_BROWSER; i++) {
      const result = await runChineseCaptchaTest(browserType, i);
      results.push({ browser: browserType, run: i + 1, ...result });
      if (result.success) {
        totalSuccess++;
        browserSuccess++;
        console.log(`    ✅ 成功 ${browserSuccess}/${i + 1}`);
      } else {
        console.log(`    ❌ 失败 ${browserSuccess}/${i + 1} - 原因: ${result.reason}`);
      }
    }
    console.log(`✅ ${browserType}浏览器测试完成`);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const totalRuns = TOTAL_RUNS_PER_BROWSER * BROWSERS.length;
  const accuracy = (totalSuccess / totalRuns * 100).toFixed(2);

  console.log('\n\n--- 实验完成 ---');
  console.log(`总测试次数: ${totalRuns}`);
  console.log(`成功次数: ${totalSuccess}`);
  console.log(`失败次数: ${totalRuns - totalSuccess}`);
  console.log(`总体准确率: ${accuracy}%`);
  console.log(`总耗时: ${duration.toFixed(2)}秒`);

  const report = {
    title: '中文点击验证码大规模实验报告 (3x30)',
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
  const jsonReportPath = path.join(__dirname, 'experiment-results', `chinese-captcha-90-experiments-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`\n详细报告已保存: ${jsonReportPath}`);
  
  // (Optional) Generate HTML report here if needed
}

runExperiment().catch(console.error);
