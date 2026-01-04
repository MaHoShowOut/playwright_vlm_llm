const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { VisualAIDetector } = require('../visual-ai-detector');

test.describe('智能视觉回归测试', () => {
  let detector;
  let screenshotDir;

  test.beforeAll(async () => {
    // 初始化AI检测器
    detector = new VisualAIDetector('sk-f582ca48b59f40f5bc40db5558e9610b-');
    
    // 确保截图目录存在
    screenshotDir = path.join(__dirname, '..', 'visual-test-results');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test('建立基线截图 - 正常登录页面', async ({ page }) => {
    console.log('\n📸 建立视觉基线...');
    
    // 打开正常的登录页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 截取全页面作为基线
    const baselinePath = path.join(screenshotDir, 'baseline-login.png');
    await page.screenshot({ 
      path: baselinePath, 
      fullPage: true 
    });
    
    console.log(`✅ 基线截图已保存: ${baselinePath}`);
    
    // 使用AI分析基线截图质量
    console.log('🤖 AI分析基线截图质量...');
    const analysis = await detector.analyzeUIScreenshot(baselinePath, 'general');
    
    if (analysis.success) {
      console.log('🎯 AI分析结果:');
      console.log(analysis.analysis);
      
      // 保存分析结果
      const analysisPath = path.join(screenshotDir, 'baseline-analysis.json');
      fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    } else {
      console.log('❌ AI分析失败:', analysis.error);
    }
  });

  test('检测布局破损 - 容器尺寸异常', async ({ page }) => {
    console.log('\n🔍 测试布局破损检测...');
    
    // 打开布局破损的页面
    const brokenLayoutPath = path.join(__dirname, '..', 'test-pages', 'broken-layout.html');
    await page.goto(`file://${brokenLayoutPath}`);
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 截取破损页面
    const brokenScreenshotPath = path.join(screenshotDir, 'broken-layout.png');
    await page.screenshot({ 
      path: brokenScreenshotPath, 
      fullPage: true 
    });
    
    console.log(`📸 破损页面截图: ${brokenScreenshotPath}`);
    
    // AI分析破损页面
    console.log('🤖 AI分析破损页面...');
    const brokenAnalysis = await detector.analyzeUIScreenshot(brokenScreenshotPath, 'general');
    
    if (brokenAnalysis.success) {
      console.log('🎯 破损页面AI分析:');
      console.log(brokenAnalysis.analysis);
    }
    
    // 对比基线和破损页面
    const baselinePath = path.join(screenshotDir, 'baseline-login.png');
    if (fs.existsSync(baselinePath)) {
      console.log('🔄 对比基线和当前版本...');
      const comparison = await detector.compareScreenshots(baselinePath, brokenScreenshotPath);
      
      if (comparison.success) {
        console.log('🎯 AI对比分析:');
        console.log(comparison.comparison);
        
        // 保存对比结果
        const comparisonPath = path.join(screenshotDir, 'layout-comparison.json');
        fs.writeFileSync(comparisonPath, JSON.stringify(comparison, null, 2));
      }
    }
  });

  test('检测颜色和样式问题', async ({ page }) => {
    console.log('\n🎨 测试颜色样式检测...');
    
    // 动态创建颜色错误页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    
    // 通过JavaScript动态修改样式，模拟CSS错误
    await page.addStyleTag({
      content: `
        .login-container {
          background: red !important;
          transform: rotate(10deg) !important;
        }
        .captcha-code {
          color: yellow !important;
          background: black !important;
          font-size: 8px !important;
        }
        .login-btn {
          background: lime !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
        .form-group input {
          border: 5px solid magenta !important;
          background: cyan !important;
        }
      `
    });
    
    await page.waitForTimeout(1000);
    
    // 截取样式错误页面
    const colorErrorPath = path.join(screenshotDir, 'color-error.png');
    await page.screenshot({ 
      path: colorErrorPath, 
      fullPage: true 
    });
    
    console.log(`📸 颜色错误截图: ${colorErrorPath}`);
    
    // AI分析颜色问题
    console.log('🤖 AI分析颜色可访问性...');
    const colorAnalysis = await detector.analyzeUIScreenshot(colorErrorPath, 'accessibility');
    
    if (colorAnalysis.success) {
      console.log('🎯 颜色可访问性分析:');
      console.log(colorAnalysis.analysis);
      
      // 保存分析结果
      const analysisPath = path.join(screenshotDir, 'color-analysis.json');
      fs.writeFileSync(analysisPath, JSON.stringify(colorAnalysis, null, 2));
    }
  });

  test('检测移动端适配问题', async ({ page }) => {
    console.log('\n📱 测试移动端适配...');
    
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 截取移动端视图
    const mobilePath = path.join(screenshotDir, 'mobile-view.png');
    await page.screenshot({ 
      path: mobilePath, 
      fullPage: true 
    });
    
    console.log(`📸 移动端截图: ${mobilePath}`);
    
    // AI分析移动端适配
    console.log('🤖 AI分析移动端适配...');
    const mobileAnalysis = await detector.analyzeUIScreenshot(mobilePath, 'mobile');
    
    if (mobileAnalysis.success) {
      console.log('🎯 移动端适配分析:');
      console.log(mobileAnalysis.analysis);
      
      // 保存分析结果
      const analysisPath = path.join(screenshotDir, 'mobile-analysis.json');
      fs.writeFileSync(analysisPath, JSON.stringify(mobileAnalysis, null, 2));
    }
    
    // 恢复桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('验证码区域专项检测', async ({ page }) => {
    console.log('\n🔢 验证码专项检测...');
    
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 截取验证码区域
    const captchaElement = page.locator('.captcha-container');
    const captchaPath = path.join(screenshotDir, 'captcha-area.png');
    await captchaElement.screenshot({ path: captchaPath });
    
    console.log(`📸 验证码区域截图: ${captchaPath}`);
    
    // AI分析验证码可读性
    console.log('🤖 AI分析验证码可读性...');
    const captchaAnalysis = await detector.analyzeUIScreenshot(captchaPath, 'accessibility');
    
    if (captchaAnalysis.success) {
      console.log('🎯 验证码可读性分析:');
      console.log(captchaAnalysis.analysis);
    }
    
    // 刷新验证码并再次检测
    await page.click('#refreshCaptcha');
    await page.waitForTimeout(500);
    
    const captchaRefreshedPath = path.join(screenshotDir, 'captcha-refreshed.png');
    await captchaElement.screenshot({ path: captchaRefreshedPath });
    
    // 对比刷新前后的验证码
    console.log('🔄 对比验证码刷新前后...');
    const captchaComparison = await detector.compareScreenshots(captchaPath, captchaRefreshedPath);
    
    if (captchaComparison.success) {
      console.log('🎯 验证码对比分析:');
      console.log(captchaComparison.comparison);
    }
  });

  test('批量页面状态检测', async ({ page }) => {
    console.log('\n📊 批量页面状态检测...');
    
    const states = [
      { name: 'initial', description: '初始状态' },
      { name: 'filled', description: '填写完成状态' },
      { name: 'error', description: '错误状态' },
      { name: 'success', description: '成功状态' }
    ];
    
    const screenshotPaths = [];
    
    for (const state of states) {
      console.log(`📸 捕获${state.description}...`);
      
      const filePath = path.join(__dirname, '..', 'login.html');
      await page.goto(`file://${filePath}`);
      await page.waitForLoadState('networkidle');
      
      // 根据状态设置页面
      switch (state.name) {
        case 'filled':
          await page.fill('#username', 'admin');
          await page.fill('#password', '123456');
          await page.fill('#captcha', 'TEST');
          break;
        
        case 'error':
          await page.fill('#username', 'admin');
          await page.fill('#password', '123456');
          await page.fill('#captcha', 'WRONG');
          await page.click('#loginBtn');
          await page.waitForTimeout(1000);
          break;
        
        case 'success':
          await page.fill('#username', 'admin');
          await page.fill('#password', '123456');
          const captcha = await page.locator('#captchaCode').getAttribute('data-value');
          await page.fill('#captcha', captcha);
          await page.click('#loginBtn');
          await page.waitForTimeout(1000);
          break;
      }
      
      await page.waitForTimeout(500);
      
      const screenshotPath = path.join(screenshotDir, `state-${state.name}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      screenshotPaths.push(screenshotPath);
    }
    
    // 批量AI分析
    console.log('🤖 批量AI分析页面状态...');
    const batchResults = await detector.batchAnalyze(screenshotPaths, 'general');
    
    // 生成综合报告
    const reportPath = path.join(screenshotDir, 'batch-analysis-report.json');
    await detector.generateReport(batchResults, reportPath);
    
    console.log(`📄 批量分析报告已生成: ${reportPath}`);
    console.log(`📄 HTML报告: ${reportPath.replace('.json', '.html')}`);
  });

  test.afterAll(async () => {
    console.log(`\n📁 所有视觉测试结果保存在: ${screenshotDir}`);
    console.log('🎉 智能视觉回归测试完成！');
    
    // 生成最终的综合报告
    const allFiles = fs.readdirSync(screenshotDir)
      .filter(file => file.endsWith('.json') && file.includes('analysis'))
      .map(file => path.join(screenshotDir, file));
    
    if (allFiles.length > 0) {
      const allResults = allFiles.map(file => {
        try {
          return JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      const finalReportPath = path.join(screenshotDir, 'final-visual-report.json');
      await detector.generateReport(allResults, finalReportPath);
      
      console.log(`📄 最终综合报告: ${finalReportPath}`);
      console.log(`📄 最终HTML报告: ${finalReportPath.replace('.json', '.html')}`);
    }
  });
});