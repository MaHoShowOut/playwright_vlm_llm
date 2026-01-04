const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { VisualAIDetector } = require('../visual-ai-detector');
const { PixelComparator } = require('../pixel-comparator');

test.describe('🎯 综合视觉回归测试套件', () => {
  let aiDetector;
  let pixelComparator;
  let testResultsDir;

  test.beforeAll(async () => {
    // 初始化工具
    aiDetector = new VisualAIDetector(process.env.DASHSCOPE_API_KEY || 'sk-ae04b567e20c4e29904817d505f51fb0');
    pixelComparator = new PixelComparator({
      threshold: 0.1,
      diffColor: [255, 0, 0],
      aaColor: [255, 255, 0]
    });

    // 创建测试结果目录
    testResultsDir = path.join(__dirname, '..', 'comprehensive-test-results');
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    console.log('\n🚀 综合视觉测试套件启动');
    console.log(`📁 结果目录: ${testResultsDir}`);
  });

  test('🏗️ 建立多版本基线库', async ({ page }) => {
    console.log('\n📸 建立多版本基线截图...');

    const pages = [
      { name: 'normal', path: '../login.html', description: '正常登录页面' },
      { name: 'broken-layout', path: '../test-pages/broken-layout.html', description: '布局破损版本' },
      { name: 'color-broken', path: '../test-pages/color-broken.html', description: '颜色破损版本' }
    ];

    const baselineResults = [];

    for (const pageInfo of pages) {
      console.log(`📷 捕获 ${pageInfo.description}...`);
      
      const filePath = path.join(__dirname, pageInfo.path);
      await page.goto(`file://${filePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // 桌面版截图
      const desktopPath = path.join(testResultsDir, `baseline-${pageInfo.name}-desktop.png`);
      await page.screenshot({ path: desktopPath, fullPage: true });

      // 移动版截图
      await page.setViewportSize({ width: 375, height: 667 });
      const mobilePath = path.join(testResultsDir, `baseline-${pageInfo.name}-mobile.png`);
      await page.screenshot({ path: mobilePath, fullPage: true });

      // 恢复桌面视口
      await page.setViewportSize({ width: 1280, height: 720 });

      baselineResults.push({
        name: pageInfo.name,
        description: pageInfo.description,
        desktopScreenshot: desktopPath,
        mobileScreenshot: mobilePath
      });

      console.log(`✅ ${pageInfo.description} 基线建立完成`);
    }

    // 保存基线信息
    const baselineInfo = {
      created_at: new Date().toISOString(),
      pages: baselineResults,
      viewport: {
        desktop: { width: 1280, height: 720 },
        mobile: { width: 375, height: 667 }
      }
    };

    fs.writeFileSync(
      path.join(testResultsDir, 'baseline-info.json'),
      JSON.stringify(baselineInfo, null, 2)
    );

    console.log('📋 基线信息已保存');
  });

  test('🔍 像素级差异检测', async ({ page }) => {
    console.log('\n🎯 执行像素级差异检测...');

    // 读取基线信息
    const baselineInfoPath = path.join(testResultsDir, 'baseline-info.json');
    if (!fs.existsSync(baselineInfoPath)) {
      console.log('⚠️ 基线信息不存在，请先运行基线建立测试');
      return;
    }

    const baselineInfo = JSON.parse(fs.readFileSync(baselineInfoPath, 'utf8'));
    const normalBaseline = baselineInfo.pages.find(p => p.name === 'normal');

    if (!normalBaseline) {
      console.log('⚠️ 正常页面基线不存在');
      return;
    }

    // 重新截取当前正常页面作为对比
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const currentPath = path.join(testResultsDir, 'current-normal-desktop.png');
    await page.screenshot({ path: currentPath, fullPage: true });

    // 执行像素对比
    console.log('🔬 进行像素级对比...');
    const diffPath = path.join(testResultsDir, 'pixel-diff-normal.png');
    const pixelResult = await pixelComparator.compareImages(
      normalBaseline.desktopScreenshot,
      currentPath,
      diffPath
    );

    if (pixelResult.success) {
      console.log('📊 像素对比结果:');
      console.log(`- 总像素: ${pixelResult.comparison.totalPixels.toLocaleString()}`);
      console.log(`- 差异像素: ${pixelResult.comparison.diffPixels.toLocaleString()}`);
      console.log(`- 差异百分比: ${pixelResult.comparison.diffPercentage}%`);
      console.log(`- 状态: ${pixelResult.comparison.status}`);
      
      if (pixelResult.comparison.diffRegions.length > 0) {
        console.log(`- 差异区域: ${pixelResult.comparison.diffRegions.length}个`);
        pixelResult.comparison.diffRegions.slice(0, 3).forEach((region, i) => {
          console.log(`  区域${i + 1}: ${region.width}×${region.height} at (${region.minX}, ${region.minY})`);
        });
      }
    } else {
      console.log('❌ 像素对比失败:', pixelResult.error);
    }

    // 保存像素对比结果
    fs.writeFileSync(
      path.join(testResultsDir, 'pixel-comparison-result.json'),
      JSON.stringify(pixelResult, null, 2)
    );
  });

  test('🤖 AI智能差异分析', async ({ page }) => {
    console.log('\n🧠 执行AI智能差异分析...');

    // 读取基线信息
    const baselineInfoPath = path.join(testResultsDir, 'baseline-info.json');
    if (!fs.existsSync(baselineInfoPath)) {
      console.log('⚠️ 基线信息不存在，请先运行基线建立测试');
      return;
    }

    const baselineInfo = JSON.parse(fs.readFileSync(baselineInfoPath, 'utf8'));
    
    // 对比正常版本 vs 破损版本
    const normalBaseline = baselineInfo.pages.find(p => p.name === 'normal');
    const brokenBaseline = baselineInfo.pages.find(p => p.name === 'broken-layout');
    const colorBrokenBaseline = baselineInfo.pages.find(p => p.name === 'color-broken');

    const aiComparisons = [];

    if (normalBaseline && brokenBaseline) {
      console.log('🔄 AI分析: 布局破损页面...');
      const layoutAnalysis = await aiDetector.analyzeUIScreenshot(
        brokenBaseline.desktopScreenshot,
        '分析这个页面的布局问题，识别所有视觉异常和可用性问题。请详细描述发现的问题。'
      );

      if (layoutAnalysis.success) {
        console.log('📝 布局分析结果:');
        console.log(layoutAnalysis.analysis);
        aiComparisons.push({
          type: 'layout_comparison',
          result: {
            success: true,
            comparison: layoutAnalysis.analysis
          }
        });
      }
    }

    if (normalBaseline && colorBrokenBaseline) {
      console.log('🔄 AI分析: 颜色破损页面...');
      const colorAnalysis = await aiDetector.analyzeUIScreenshot(
        colorBrokenBaseline.desktopScreenshot,
        '分析这个页面的颜色和对比度问题，识别所有视觉可读性问题和可访问性问题。请详细描述颜色相关的异常。'
      );

      if (colorAnalysis.success) {
        console.log('📝 颜色分析结果:');
        console.log(colorAnalysis.analysis);
        aiComparisons.push({
          type: 'color_comparison',
          result: {
            success: true,
            comparison: colorAnalysis.analysis
          }
        });
      }
    }

    // 单独分析每个页面的可访问性
    for (const pageInfo of baselineInfo.pages) {
      console.log(`🔍 AI分析: ${pageInfo.description} 可访问性...`);
      
      const accessibilityAnalysis = await aiDetector.analyzeUIScreenshot(
        pageInfo.desktopScreenshot,
        'accessibility'
      );
      
      if (accessibilityAnalysis.success) {
        console.log(`📋 ${pageInfo.description} 可访问性分析:`);
        console.log(accessibilityAnalysis.analysis);
        
        aiComparisons.push({
          type: 'accessibility_analysis',
          page: pageInfo.name,
          result: accessibilityAnalysis
        });
      }
    }

    // 保存AI分析结果
    fs.writeFileSync(
      path.join(testResultsDir, 'ai-analysis-results.json'),
      JSON.stringify(aiComparisons, null, 2)
    );

    console.log('🎯 AI分析完成');
  });

  test('📱 跨设备视觉一致性检测', async ({ page }) => {
    console.log('\n📱 跨设备视觉一致性检测...');

    const devices = [
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'large-desktop', width: 1920, height: 1080 }
    ];

    const deviceScreenshots = [];

    for (const device of devices) {
      console.log(`📷 捕获 ${device.name} 视图 (${device.width}x${device.height})...`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      
      const filePath = path.join(__dirname, '..', 'login.html');
      await page.goto(`file://${filePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(testResultsDir, `device-${device.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      deviceScreenshots.push({
        device: device.name,
        dimensions: device,
        screenshot: screenshotPath
      });
    }

    // AI分析每个设备的适配情况
    const deviceAnalyses = [];
    for (const deviceInfo of deviceScreenshots) {
      console.log(`🤖 AI分析 ${deviceInfo.device} 适配情况...`);
      
      const analysisType = deviceInfo.device.includes('mobile') ? 'mobile' : 'general';
      const analysis = await aiDetector.analyzeUIScreenshot(
        deviceInfo.screenshot,
        analysisType
      );
      
      if (analysis.success) {
        deviceAnalyses.push({
          device: deviceInfo.device,
          dimensions: deviceInfo.dimensions,
          analysis: analysis
        });
      }
    }

    // 保存跨设备分析结果
    fs.writeFileSync(
      path.join(testResultsDir, 'cross-device-analysis.json'),
      JSON.stringify(deviceAnalyses, null, 2)
    );

    console.log('📊 跨设备一致性检测完成');
  });

  test('🎨 动态UI状态捕获与分析', async ({ page }) => {
    console.log('\n🎨 动态UI状态捕获与分析...');

    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    await page.waitForLoadState('networkidle');

    const states = [
      {
        name: 'initial',
        description: '初始加载状态',
        actions: []
      },
      {
        name: 'focused',
        description: '输入框聚焦状态',
        actions: [
          () => page.focus('#username')
        ]
      },
      {
        name: 'filled',
        description: '表单填写状态',
        actions: [
          () => page.fill('#username', 'admin'),
          () => page.fill('#password', '123456')
        ]
      },
      {
        name: 'captcha-focus',
        description: '验证码输入聚焦',
        actions: [
          () => page.fill('#username', 'admin'),
          () => page.fill('#password', '123456'),
          () => page.focus('#captcha')
        ]
      },
      {
        name: 'hover-button',
        description: '登录按钮悬停状态',
        actions: [
          () => page.fill('#username', 'admin'),
          () => page.fill('#password', '123456'),
          () => page.hover('#loginBtn')
        ]
      }
    ];

    const stateScreenshots = [];

    for (const state of states) {
      console.log(`📸 捕获状态: ${state.description}...`);
      
      // 重新加载页面以确保干净状态
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 执行状态设置动作
      for (const action of state.actions) {
        await action();
        await page.waitForTimeout(200);
      }

      const screenshotPath = path.join(testResultsDir, `state-${state.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      stateScreenshots.push({
        name: state.name,
        description: state.description,
        screenshot: screenshotPath
      });
    }

    // AI分析每个状态的用户体验
    console.log('🤖 AI分析各状态用户体验...');
    const stateAnalyses = [];

    for (const stateInfo of stateScreenshots) {
      const analysis = await aiDetector.analyzeUIScreenshot(
        stateInfo.screenshot,
        'general'
      );
      
      if (analysis.success) {
        stateAnalyses.push({
          state: stateInfo.name,
          description: stateInfo.description,
          analysis: analysis
        });
      }
    }

    // 保存动态状态分析
    fs.writeFileSync(
      path.join(testResultsDir, 'dynamic-states-analysis.json'),
      JSON.stringify(stateAnalyses, null, 2)
    );

    console.log('🎯 动态状态分析完成');
  });

  test('📊 生成综合测试报告', async () => {
    console.log('\n📊 生成综合测试报告...');

    // 收集所有测试结果
    const resultFiles = [
      'baseline-info.json',
      'pixel-comparison-result.json',
      'ai-analysis-results.json',
      'cross-device-analysis.json',
      'dynamic-states-analysis.json'
    ];

    const allResults = {};
    
    for (const fileName of resultFiles) {
      const filePath = path.join(testResultsDir, fileName);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          allResults[fileName.replace('.json', '')] = data;
        } catch (error) {
          console.log(`⚠️ 读取 ${fileName} 失败:`, error.message);
        }
      }
    }

    // 生成综合报告
    const comprehensiveReport = {
      generated_at: new Date().toISOString(),
      test_suite: 'comprehensive_visual_regression',
      summary: {
        total_tests: Object.keys(allResults).length,
        baseline_pages: allResults['baseline-info']?.pages?.length || 0,
        pixel_comparisons: allResults['pixel-comparison-result']?.success ? 1 : 0,
        ai_analyses: allResults['ai-analysis-results']?.length || 0,
        device_tests: allResults['cross-device-analysis']?.length || 0,
        state_captures: allResults['dynamic-states-analysis']?.length || 0
      },
      results: allResults,
      recommendations: [
        "定期运行视觉回归测试以检测意外的UI变化",
        "使用像素级对比检测精确的视觉差异",
        "结合AI分析获得更深入的用户体验洞察",
        "测试多设备兼容性确保一致的用户体验",
        "捕获动态状态以验证交互设计的正确性"
      ]
    };

    // 保存综合报告
    const reportPath = path.join(testResultsDir, 'comprehensive-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(comprehensiveReport, null, 2));

    // 生成HTML报告
    await generateHTMLReport(comprehensiveReport, testResultsDir);

    console.log('✅ 综合报告生成完成');
    console.log(`📄 JSON报告: ${reportPath}`);
    console.log(`📄 HTML报告: ${path.join(testResultsDir, 'comprehensive-report.html')}`);
  });

  test.afterAll(async () => {
    console.log(`\n🎉 综合视觉回归测试套件完成！`);
    console.log(`📁 所有结果保存在: ${testResultsDir}`);
    console.log(`📊 查看报告: ${path.join(testResultsDir, 'comprehensive-report.html')}`);
  });
});

// 简单的Markdown转HTML函数
function markdownToHtml(markdown) {
    return markdown
        // 标题
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // 粗体
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // 斜体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 列表
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // 代码块
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // 内联代码
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // 引用块
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // 分割线
        .replace(/^---$/gim, '<hr>')
        // 段落
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim() && !paragraph.includes('<') && !paragraph.includes('---')) {
                return '<p>' + paragraph.replace(/\n/g, '<br>') + '</p>';
            }
            return paragraph;
        })
        .join('\n');
}

// 生成HTML综合报告的辅助函数
async function generateHTMLReport(reportData, outputDir) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>综合视觉回归测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; background: white; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .content { padding: 2rem; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .summary-card { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: center; border-left: 5px solid #667eea; }
        .section { margin: 2rem 0; padding: 1.5rem; border: 1px solid #e9ecef; border-radius: 8px; background: #fdfdfd; }
        .section h3 { color: #495057; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem; }
        .image-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .image-item { text-align: center; }
        .image-item img { max-width: 100%; height: auto; border: 1px solid #dee2e6; border-radius: 4px; }
        .result-item { margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 4px; }
        .analysis-content { margin-top: 0.5rem; }
        .analysis-content h4 { margin: 0 0 0.5rem 0; color: #495057; font-size: 1.1em; }
        .analysis-content h1, .analysis-content h2, .analysis-content h3 { margin-top: 1rem; margin-bottom: 0.5rem; color: #495057; }
        .analysis-content h1 { font-size: 1.5em; }
        .analysis-content h2 { font-size: 1.3em; }
        .analysis-content h3 { font-size: 1.1em; }
        .analysis-content p { margin: 0.5rem 0; line-height: 1.6; }
        .analysis-content ul, .analysis-content ol { margin: 0.5rem 0; padding-left: 1.5rem; }
        .analysis-content li { margin: 0.25rem 0; }
        .analysis-content blockquote { border-left: 4px solid #ddd; padding-left: 1rem; margin: 1rem 0; color: #666; }
        .analysis-content code { background: #f1f1f1; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace; }
        .analysis-content pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 0.5rem 0; overflow-x: auto; max-height: 300px; overflow-y: auto; }
        .analysis-content pre code { background: none; padding: 0; }
        .analysis-content hr { border: none; border-top: 1px solid #eee; margin: 1rem 0; }
        .success { border-left: 5px solid #28a745; }
        .warning { border-left: 5px solid #ffc107; }
        .error { border-left: 5px solid #dc3545; }
        .recommendations { background: #e7f3ff; padding: 1.5rem; border-radius: 8px; border-left: 5px solid #0066cc; }
        .recommendations ul { margin: 0; padding-left: 1.5rem; }
        pre { background: #f1f1f1; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 综合视觉回归测试报告</h1>
            <p>基于 Playwright + AI + 像素对比的智能UI测试</p>
            <p>生成时间: ${reportData.generated_at}</p>
        </div>
        
        <div class="content">
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>${reportData.summary.total_tests}</h3>
                    <p>总测试项目</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.baseline_pages}</h3>
                    <p>基线页面</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.ai_analyses}</h3>
                    <p>AI分析</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.device_tests}</h3>
                    <p>设备测试</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.state_captures}</h3>
                    <p>状态捕获</p>
                </div>
            </div>

            ${reportData.results['pixel-comparison-result'] ? `
                <div class="section">
                    <h3>🔬 像素级差异检测</h3>
                    <div class="result-item ${reportData.results['pixel-comparison-result'].success ? 'success' : 'error'}">
                        ${reportData.results['pixel-comparison-result'].success ? `
                            <p><strong>差异百分比:</strong> ${reportData.results['pixel-comparison-result'].comparison.diffPercentage}%</p>
                            <p><strong>状态:</strong> ${reportData.results['pixel-comparison-result'].comparison.status}</p>
                            <p><strong>差异像素:</strong> ${reportData.results['pixel-comparison-result'].comparison.diffPixels?.toLocaleString() || 0}</p>
                        ` : `
                            <p><strong>错误:</strong> ${reportData.results['pixel-comparison-result'].error}</p>
                        `}
                    </div>
                </div>
            ` : ''}

            ${reportData.results['ai-analysis-results'] && reportData.results['ai-analysis-results'].length > 0 ? `
                <div class="section">
                    <h3>🤖 AI智能分析结果</h3>
                    ${reportData.results['ai-analysis-results'].map((analysis, index) => `
                        <div class="result-item success">
                            <h4>${analysis.type === 'layout_comparison' ? '🏗️ 布局问题分析' : analysis.type === 'color_comparison' ? '🎨 色彩问题分析' : '🔍 可访问性分析'}</h4>
                            <div class="analysis-content">
                                ${markdownToHtml(analysis.result.comparison || '暂无详细分析结果')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="section">
                <h3>🖼️ 基线截图库</h3>
                <div class="image-gallery">
                    ${reportData.results['baseline-info']?.pages?.map(page => `
                        <div class="image-item">
                            <h4>${page.description}</h4>
                            <img src="${path.basename(page.desktopScreenshot)}" alt="${page.description}" onerror="this.style.display='none'">
                        </div>
                    `).join('') || ''}
                </div>
            </div>

            <div class="recommendations">
                <h3>💡 测试建议</h3>
                <ul>
                    ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>📋 详细测试数据</h3>
                <pre>${JSON.stringify(reportData.summary, null, 2)}</pre>
            </div>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(outputDir, 'comprehensive-report.html'), htmlContent);
}