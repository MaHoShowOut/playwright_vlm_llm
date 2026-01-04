/**
 * 数学题验证码识别实验 - 3×30次验证
 * 基于Qwen-VL的纯视觉识别能力验证
 */

const { chromium, firefox, webkit } = require('playwright');
const { VisualAIDetector } = require('./visual-ai-detector');
const path = require('path');
const fs = require('fs');

class MathCaptchaExperiment {
  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY || 'sk-f582ca48b59f40f5bc40db5558e9610b-';
    this.aiDetector = new VisualAIDetector(this.apiKey);
    this.results = {
      chromium: [],
      firefox: [],
      webkit: []
    };
    this.experimentStartTime = new Date();
  }

  async runExperiment() {
    console.log('🔬 开始数学题验证码识别实验');
    console.log('📊 实验规模：3个浏览器 × 30次测试 = 90次总测试');
    console.log('🤖 技术：Qwen-VL纯视觉识别（无OCR/DOM提取）');
    console.log();

    const browsers = [
      { name: 'chromium', instance: chromium },
      { name: 'firefox', instance: firefox },
      { name: 'webkit', instance: webkit }
    ];

    for (const browser of browsers) {
      console.log(`🚀 开始${browser.name}浏览器测试...`);
      await this.runBrowserTests(browser);
      console.log(`✅ ${browser.name}浏览器测试完成`);
      console.log();
    }

    await this.generateExperimentReport();
  }

  async runBrowserTests(browser) {
    for (let i = 1; i <= 30; i++) {
      console.log(`  📋 ${browser.name} - 第${i}/30次测试`);
      
      try {
        const result = await this.runSingleTest(browser, i);
        this.results[browser.name].push(result);
        
        // 显示实时进度
        const successCount = this.results[browser.name].filter(r => r.success).length;
        const accuracy = (successCount / i * 100).toFixed(1);
        console.log(`     ✅ 成功 ${successCount}/${i} (${accuracy}%)`);
        
      } catch (error) {
        console.log(`     ❌ 失败: ${error.message}`);
        this.results[browser.name].push({
          testNumber: i,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      // 避免API频率限制
      await this.sleep(2000);
    }
  }

  async runSingleTest(browser, testNumber) {
        const browserInstance = await browser.instance.launch({ headless: true });
    const context = await browserInstance.newContext();
    const page = await context.newPage();
    
    try {
      // 1. 打开数学题验证码页面
      await page.goto('file://' + path.join(__dirname, 'math-captcha.html'));
      await page.waitForSelector('.math-expression', { timeout: 5000 });
      
      // 2. 随机选择难度
      const difficulties = ['easy', 'medium', 'hard'];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      await page.selectOption('#difficulty', difficulty);
      await page.waitForTimeout(1000);
      
      // 3. 获取正确答案（用于验证）
      const correctAnswer = await page.evaluate(() => {
        return typeof currentAnswer !== 'undefined' ? currentAnswer.toString() : '0';
      });
      
      // 4. 截图
      const screenshotPath = path.join(__dirname, 'screenshots', `experiment-${browser.name}-${testNumber}.png`);
      await page.screenshot({ path: screenshotPath });
      
      // 5. 使用AI视觉识别
      const analysisResult = await this.aiDetector.analyzeUIScreenshot(screenshotPath, 
        "请分析这个数学题验证码图片，识别数学表达式并计算答案。请只返回最终的数字答案。");
      
      // 6. 提取AI答案
      const aiResult = String(analysisResult.analysis || '');
      const aiAnswerMatch = aiResult.match(/\d+/);
      const aiAnswer = aiAnswerMatch ? aiAnswerMatch[0] : '';
      
      // 7. 验证结果
      const success = aiAnswer === correctAnswer;
      
      return {
        testNumber,
        success,
        difficulty,
        correctAnswer,
        aiAnswer,
        recognizedExpression: aiResult.match(/数学表达式:\s*([^\n]+)/)?.[1] || '识别失败',
        calculation: aiResult.match(/计算过程:\s*([^\n]+)/)?.[1] || '未提供',
        timestamp: new Date().toISOString(),
        responseTime: analysisResult.responseTime || 'N/A'
      };
      
    } finally {
      await browserInstance.close();
    }
  }

  async generateExperimentReport() {
    const report = {
      experiment: {
        title: "数学题验证码AI识别实验报告",
        description: "基于Qwen-VL的纯视觉识别能力验证",
        totalTests: 90,
        browsers: ['chromium', 'firefox', 'webkit'],
        testsPerBrowser: 30,
        experimentStart: this.experimentStartTime,
        experimentEnd: new Date(),
        duration: (new Date() - this.experimentStartTime) / 1000 / 60
      },
      results: {},
      statistics: {}
    };

    // 计算统计结果
    for (const browser of ['chromium', 'firefox', 'webkit']) {
      const browserResults = this.results[browser];
      const successCount = browserResults.filter(r => r.success).length;
      const accuracy = (successCount / browserResults.length * 100).toFixed(1);
      
      report.results[browser] = {
        total: browserResults.length,
        success: successCount,
        failed: browserResults.length - successCount,
        accuracy: parseFloat(accuracy)
      };

      // 按难度统计
      const byDifficulty = {};
      ['easy', 'medium', 'hard'].forEach(diff => {
        const diffResults = browserResults.filter(r => r.difficulty === diff);
        const diffSuccess = diffResults.filter(r => r.success).length;
        byDifficulty[diff] = {
          total: diffResults.length,
          success: diffSuccess,
          accuracy: (diffSuccess / diffResults.length * 100).toFixed(1)
        };
      });
      report.results[browser].byDifficulty = byDifficulty;
    }

    // 总体统计
    const allResults = Object.values(this.results).flat();
    const totalSuccess = allResults.filter(r => r.success).length;
    report.statistics = {
      overallAccuracy: (totalSuccess / allResults.length * 100).toFixed(1),
      totalTests: allResults.length,
      totalSuccess,
      totalFailed: allResults.length - totalSuccess,
      crossBrowserConsistency: this.calculateConsistency()
    };

    // 保存详细结果
    const reportPath = path.join(__dirname, 'experiment-results', `math-captcha-experiment-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成可视化报告
    this.generateVisualReport(report, reportPath.replace('.json', '.html'));
    
    console.log('\n🎯 实验完成！');
    console.log(`📊 总体准确率: ${report.statistics.overallAccuracy}%`);
    console.log(`📁 详细报告: ${reportPath}`);
    console.log(`🌐 可视化报告: ${reportPath.replace('.json', '.html')}`);
  }

  calculateConsistency() {
    const accuracies = Object.values(this.results).map(results => 
      (results.filter(r => r.success).length / results.length * 100).toFixed(1)
    );
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - accuracies.reduce((a,b) => a + b) / 3, 2), 0) / 3;
    return Math.sqrt(variance).toFixed(2);
  }

  generateVisualReport(report, htmlPath) {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数学题验证码AI识别实验报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-box { padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
        .browser-results { margin: 20px 0; }
        .browser-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .success { color: #28a745; }
        .failed { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 数学题验证码AI识别实验报告</h1>
            <p>基于Qwen-VL的纯视觉识别能力验证</p>
            <p>实验规模：90次测试（3个浏览器 × 30次）</p>
        </div>
        
        <div class="stats">
            <div class="stat-box">
                <h3>${report.statistics.overallAccuracy}%</h3>
                <p>总体准确率</p>
            </div>
            <div class="stat-box">
                <h3>${report.statistics.totalTests}</h3>
                <p>总测试次数</p>
            </div>
            <div class="stat-box">
                <h3>${report.statistics.totalSuccess}</h3>
                <p>成功次数</p>
            </div>
            <div class="stat-box">
                <h3>${report.statistics.crossBrowserConsistency}</h3>
                <p>跨浏览器一致性</p>
            </div>
        </div>
        
        <div class="browser-results">
            <h2>📊 各浏览器详细结果</h2>
            ${Object.entries(report.results).map(([browser, data]) => `
                <div class="browser-section">
                    <h3>${browser.toUpperCase()}</h3>
                    <p><strong>准确率:</strong> ${data.accuracy}%</p>
                    <p><strong>成功/总测试:</strong> ${data.success}/${data.total}</p>
                    <h4>按难度分布:</h4>
                    ${Object.entries(data.byDifficulty).map(([diff, stats]) => 
                        `<p>${diff}: ${stats.accuracy}% (${stats.success}/${stats.total})</p>`
                    ).join('')}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(htmlPath, html);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行实验
async function main() {
  const experiment = new MathCaptchaExperiment();
  await experiment.runExperiment();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MathCaptchaExperiment };