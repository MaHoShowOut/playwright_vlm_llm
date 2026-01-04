/**
 * 演示报告生成器
 * 基于现有截图和模拟数据生成示例报告
 */

const fs = require('fs');
const path = require('path');

function generateDemoReports() {
  console.log('🎨 生成演示报告...');

  // 创建目录
  const visualResultsDir = path.join(__dirname, 'visual-test-results');
  const comprehensiveResultsDir = path.join(__dirname, 'comprehensive-test-results');
  
  if (!fs.existsSync(visualResultsDir)) {
    fs.mkdirSync(visualResultsDir, { recursive: true });
  }
  
  if (!fs.existsSync(comprehensiveResultsDir)) {
    fs.mkdirSync(comprehensiveResultsDir, { recursive: true });
  }

  // 生成视觉测试报告数据
  const visualTestData = {
    generated_at: new Date().toISOString(),
    test_suite: 'visual_ai_regression',
    total_images: 7,
    summary: {
      passed: 6,
      failed: 1
    },
    results: [
      {
        success: true,
        analysis: `### UI可访问性分析结果

**验证码设计分析:**
- ✅ 字体大小适中，符合可读性要求
- ⚠️ 建议增加颜色对比度以符合WCAG AA标准  
- ✅ 布局清晰，元素间距合理
- 💡 建议：添加音频验证码选项提升无障碍体验

**改进建议:**
1. 调整验证码背景色，提高对比度到4.5:1以上
2. 增加刷新验证码的键盘快捷键支持
3. 为视觉障碍用户提供替代验证方式`,
        imagePath: './screenshots/captcha.png',
        analysisType: 'accessibility',
        timestamp: new Date().toISOString()
      },
      {
        success: true,
        analysis: `### 视觉布局分析

**页面整体评估:**
- ✅ 登录表单居中对齐，视觉层次清晰
- ✅ 色彩搭配协调，符合现代设计趋势
- ✅ 响应式布局表现良好
- ⚠️ 验证码刷新按钮可以增大点击区域

**用户体验评分: 85/100**`,
        imagePath: './screenshots/final-result.png',
        analysisType: 'general',
        timestamp: new Date().toISOString()
      },
      {
        success: true,
        comparison: `### 验证码刷新前后对比分析

**检测到的变化:**
- ✅ 验证码文字已正确更新
- ✅ 没有检测到布局移位
- ✅ 动画过渡自然流畅
- ℹ️ 建议：可以增加刷新时的视觉反馈

**对比结果: 符合预期的正常变化**`,
        baselineImage: './screenshots/captcha-before.png',
        currentImage: './screenshots/captcha-after.png',
        timestamp: new Date().toISOString()
      },
      {
        success: false,
        error: '网络连接超时，AI分析暂时不可用',
        imagePath: './screenshots/captcha.png',
        analysisType: 'mobile',
        timestamp: new Date().toISOString()
      },
      {
        success: true,
        analysis: `### 中文点击验证码AI识别结果

**识别分析:**
- ✅ 成功识别目标字符序列: "春 → 山 → 红"
- ✅ 准确定位16个字符的网格布局
- ✅ AI自动点击准确率: 95%
- 💡 字符识别耗时: 2.3秒

**技术突破:**
1. 实现了中文字符的精确识别和定位
2. 成功处理网格布局的坐标映射
3. 自动化点击序列完美执行
4. 抗干扰能力强，无视背景干扰元素`,
        imagePath: './screenshots/chinese-captcha.png',
        analysisType: 'chinese_click',
        timestamp: new Date().toISOString()
      },
      {
        success: true,
        analysis: `### 数学题验证码AI识别结果

**计算分析:**
- ✅ 成功识别数学表达式: "15 × 7 = ?"
- ✅ AI计算结果: 105
- ✅ 验证结果: 正确
- 💡 计算耗时: 1.8秒

**AI能力展示:**
1. 准确识别数学运算符号 (×, ÷, +, -)
2. 自动过滤背景干扰线条和噪点
3. 精确计算多种数学运算
4. 智能输入答案并验证成功`,
        imagePath: './screenshots/math-captcha.png',
        analysisType: 'math_calculation',
        timestamp: new Date().toISOString()
      },
      {
        success: true,
        analysis: `### 验证码准确率测试结果

**测试统计:**
- 🎯 中文点击验证码: 4/5 次成功 (80%准确率)
- 🧮 数学题验证码: 5/5 次成功 (100%准确率)
- ⚡ 平均识别时间: 2.1秒
- 🔄 多轮测试稳定性: 优秀

**创新成果:**
1. 首次实现中文字符验证码的AI自动识别
2. 数学题验证码100%准确率突破
3. 验证了AI在复杂视觉任务中的可靠性
4. 为验证码自动化处理提供了完整解决方案`,
        imagePath: './screenshots/captcha-accuracy-test.png',
        analysisType: 'accuracy_test',
        timestamp: new Date().toISOString()
      }
    ]
  };

  // 生成综合测试报告数据
  const comprehensiveTestData = {
    generated_at: new Date().toISOString(),
    test_suite: 'comprehensive_visual_regression',
    summary: {
      total_tests: 10,
      baseline_pages: 5,
      pixel_comparisons: 2,
      ai_analyses: 8,
      device_tests: 4,
      state_captures: 5
    },
    results: {
      'baseline-info': {
        created_at: new Date().toISOString(),
        pages: [
          {
            name: 'normal',
            description: '正常登录页面',
            desktopScreenshot: './screenshots/final-result.png',
            mobileScreenshot: './screenshots/captcha.png'
          },
          {
            name: 'broken-layout',
            description: '布局破损版本',
            desktopScreenshot: './test-pages/broken-layout.html',
            mobileScreenshot: './test-pages/broken-layout.html'
          },
          {
            name: 'color-broken',
            description: '颜色破损版本',
            desktopScreenshot: './test-pages/color-broken.html',
            mobileScreenshot: './test-pages/color-broken.html'
          },
          {
            name: 'chinese-captcha',
            description: '中文点击验证码',
            desktopScreenshot: './screenshots/chinese-captcha.png',
            mobileScreenshot: './screenshots/chinese-captcha-result.png'
          },
          {
            name: 'math-captcha',
            description: '数学题验证码',
            desktopScreenshot: './screenshots/math-captcha.png',
            mobileScreenshot: './screenshots/math-captcha-result.png'
          }
        ]
      },
      'pixel-comparison-result': {
        success: true,
        comparison: {
          totalPixels: 921600,
          diffPixels: 2847,
          diffPercentage: 0.31,
          dimensions: { width: 1280, height: 720 },
          status: 'minor_differences',
          diffRegions: [
            {
              minX: 450, maxX: 550, minY: 300, maxY: 350,
              width: 100, height: 50, pixelCount: 2847,
              center: { x: 500, y: 325 }
            }
          ]
        }
      },
      'ai-analysis-results': [
        {
          type: 'layout_comparison',
          result: {
            success: true,
            comparison: `### AI对比分析: 正常版本 vs 布局破损版本

**检测到的关键差异:**
1. **容器尺寸异常**: 登录容器宽度从400px压缩到150px，导致内容挤压
2. **元素位置偏移**: 检测到5度倾斜变换，影响视觉稳定性
3. **可用性问题**: 验证码区域层级异常，可能影响用户交互
4. **用户体验影响**: 严重 - 布局变化会导致用户困惑和操作困难

**建议修复优先级: 高 - 需要立即修复布局问题**`
          }
        },
        {
          type: 'accessibility_analysis',
          page: 'normal',
          result: {
            success: true,
            analysis: `### 正常页面可访问性评估

**WCAG 2.1 合规性检查:**
- ✅ AA级颜色对比度: 通过 (4.7:1)
- ✅ 键盘导航: 支持Tab键顺序导航
- ✅ 表单标签: 所有输入框均有明确标签
- ⚠️ 验证码可访问性: 建议增加音频替代方案

**整体可访问性评分: B+ (建议改进验证码部分)**`
          }
        },
        {
          type: 'chinese_captcha_analysis',
          page: 'chinese-captcha',
          result: {
            success: true,
            analysis: `### 中文点击验证码AI识别分析

**识别能力评估:**
- ✅ 中文字符识别准确率: 95%
- ✅ 网格布局坐标映射: 100%准确
- ✅ 点击序列自动化: 完美执行
- ✅ 抗干扰能力: 强 - 成功过滤背景噪点

**技术创新价值:**
1. 首次实现中文验证码的端到端AI自动化
2. 解决了字符定位和点击序列的技术挑战
3. 为多语言验证码处理提供了技术范例
4. 验证了AI在复杂交互任务中的可靠性

**应用前景: 可广泛应用于各类中文验证码场景**`
          }
        },
        {
          type: 'math_captcha_analysis',
          page: 'math-captcha',
          result: {
            success: true,
            analysis: `### 数学题验证码AI识别分析

**计算能力评估:**
- ✅ 数学表达式识别: 100%准确
- ✅ 运算符号识别: 支持 +、-、×、÷
- ✅ 计算结果准确性: 100%
- ✅ 背景干扰过滤: 优秀

**AI数学能力展示:**
1. 准确识别带干扰的数学表达式
2. 支持多种难度级别的数学运算
3. 自动输入答案并验证成功
4. 展现了AI在OCR+计算复合任务中的优势

**实用价值: 为数学验证码自动化提供了完整解决方案**`
          }
        }
      ]
    },
    recommendations: [
      "建立自动化视觉回归测试流水线，及时发现UI变化",
      "定期进行可访问性审计，确保符合WCAG 2.1标准",
      "使用AI分析结合像素对比，获得更全面的视觉质量洞察",
      "为验证码等特殊组件提供无障碍替代方案",
      "在不同设备和浏览器上验证视觉一致性",
      "扩展AI验证码识别能力，支持更多语言和题型",
      "建立验证码自动化测试的标准流程和最佳实践",
      "开发验证码识别准确率的持续监控机制",
      "探索AI在更复杂交互验证场景中的应用潜力"
    ]
  };

  // 保存JSON报告
  fs.writeFileSync(
    path.join(visualResultsDir, 'final-visual-report.json'),
    JSON.stringify(visualTestData, null, 2)
  );

  fs.writeFileSync(
    path.join(comprehensiveResultsDir, 'comprehensive-report.json'),
    JSON.stringify(comprehensiveTestData, null, 2)
  );

  // 生成HTML报告
  generateVisualHTML(visualTestData, visualResultsDir);
  generateComprehensiveHTML(comprehensiveTestData, comprehensiveResultsDir);

  console.log('✅ 演示报告生成完成！');
  console.log(`📄 视觉测试报告: ${path.join(visualResultsDir, 'final-visual-report.html')}`);
  console.log(`📄 综合测试报告: ${path.join(comprehensiveResultsDir, 'comprehensive-report.html')}`);
}

function generateVisualHTML(reportData, outputDir) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 AI视觉测试报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 2rem; 
            text-align: center; 
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .content { padding: 2rem; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1rem; 
            margin: 2rem 0; 
        }
        .summary-card { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 1.5rem; 
            border-radius: 12px; 
            text-align: center; 
            border-left: 5px solid #667eea;
            transition: transform 0.2s;
        }
        .summary-card:hover { transform: translateY(-2px); }
        .summary-card h3 { font-size: 2rem; color: #667eea; margin-bottom: 0.5rem; }
        .summary-card p { color: #6c757d; font-weight: 500; }
        .result-item { 
            margin: 2rem 0; 
            padding: 1.5rem; 
            border: 1px solid #e9ecef; 
            border-radius: 12px; 
            background: #fdfdfd;
        }
        .result-item.success { border-left: 5px solid #28a745; }
        .result-item.error { border-left: 5px solid #dc3545; }
        .result-item h3 { color: #495057; margin-bottom: 1rem; }
        .analysis { 
            background: #f8f9fa; 
            padding: 1.5rem; 
            border-radius: 8px; 
            margin: 1rem 0;
            border-left: 4px solid #17a2b8;
        }
        .timestamp { color: #6c757d; font-size: 0.9em; margin-top: 0.5rem; }
        pre { 
            background: #f1f1f1; 
            padding: 1rem; 
            border-radius: 6px; 
            overflow-x: auto; 
            font-size: 0.9em;
            line-height: 1.4;
        }
        .badge { 
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge.success { background: #d4edda; color: #155724; }
        .badge.error { background: #f8d7da; color: #721c24; }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        .feature-card {
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            transition: all 0.3s;
        }
        .feature-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI视觉测试报告</h1>
            <p>基于通义千问视觉模型的智能UI分析系统</p>
            <p class="timestamp">生成时间: ${reportData.generated_at}</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>${reportData.total_images}</h3>
                    <p>分析图片</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.passed}</h3>
                    <p>成功分析</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.failed}</h3>
                    <p>分析失败</p>
                </div>
                <div class="summary-card">
                    <h3>${Math.round((reportData.summary.passed / reportData.total_images) * 100)}%</h3>
                    <p>成功率</p>
                </div>
            </div>

            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">🧠</div>
                    <h3>AI智能分析</h3>
                    <p>使用通义千问视觉模型进行深度UI分析，提供专业的设计建议和可访问性评估。</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <h3>精确检测</h3>
                    <p>结合像素级对比和AI语义理解，实现多维度的视觉质量检测。</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>智能报告</h3>
                    <p>自动生成详细的分析报告，包含具体的改进建议和问题定位。</p>
                </div>
            </div>
            
            <h2>📋 详细分析结果</h2>
            
            ${reportData.results.map((result, index) => `
                <div class="result-item ${result.success ? 'success' : 'error'}">
                    <h3>
                        分析 #${index + 1} 
                        <span class="badge ${result.success ? 'success' : 'error'}">
                            ${result.success ? '✅ 成功' : '❌ 失败'}
                        </span>
                    </h3>
                    
                    ${result.success ? `
                        <p><strong>分析类型:</strong> ${result.analysisType || '对比分析'}</p>
                        <div class="analysis">
                            <h4>🔍 AI分析结果:</h4>
                            <pre>${result.analysis || result.comparison}</pre>
                        </div>
                    ` : `
                        <div class="analysis">
                            <h4>❌ 错误信息:</h4>
                            <pre>${result.error}</pre>
                        </div>
                    `}
                    
                    <div class="timestamp">${result.timestamp}</div>
                </div>
            `).join('')}

            <div class="feature-card" style="margin-top: 2rem; text-align: center;">
                <div class="feature-icon">🚀</div>
                <h3>技术优势</h3>
                <p><strong>AI + 像素双重检测</strong>：结合人工智能的语义理解和像素级的精确对比</p>
                <p><strong>全面覆盖</strong>：布局、颜色、可访问性、响应式设计全维度检测</p>
                <p><strong>智能建议</strong>：不仅发现问题，更提供专业的改进方案</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'final-visual-report.html'), html);
}

function generateComprehensiveHTML(reportData, outputDir) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 综合视觉回归测试报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 3rem 2rem; 
            text-align: center; 
        }
        .header h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
        .header p { opacity: 0.9; font-size: 1.2rem; margin-bottom: 0.5rem; }
        .content { padding: 2rem; }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
            gap: 1.5rem; 
            margin: 2rem 0; 
        }
        .summary-card { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 2rem; 
            border-radius: 16px; 
            text-align: center; 
            border-left: 6px solid #667eea;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        .summary-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        .summary-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        .summary-card h3 { 
            font-size: 2.5rem; 
            color: #667eea; 
            margin-bottom: 0.5rem; 
            font-weight: 700;
        }
        .summary-card p { color: #495057; font-weight: 600; font-size: 1.1rem; }
        .section { 
            margin: 3rem 0; 
            padding: 2rem; 
            border: 1px solid #e9ecef; 
            border-radius: 16px; 
            background: linear-gradient(135deg, #fdfdfd 0%, #f8f9fa 100%);
        }
        .section h3 { 
            color: #495057; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 1rem; 
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
        }
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        .comparison-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .pixel-stats {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 1.5rem;
            border-radius: 12px;
            margin: 1rem 0;
            border-left: 5px solid #2196f3;
        }
        .pixel-stats h4 { color: #1976d2; margin-bottom: 1rem; }
        .pixel-stats .stat-item {
            display: flex;
            justify-content: space-between;
            margin: 0.5rem 0;
            font-weight: 500;
        }
        .recommendations {
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
            padding: 2rem;
            border-radius: 16px;
            border-left: 6px solid #4caf50;
            margin: 2rem 0;
        }
        .recommendations h3 { 
            color: #2e7d32; 
            margin-bottom: 1rem;
            border: none;
            padding: 0;
        }
        .recommendations ul { 
            list-style: none;
            padding: 0;
        }
        .recommendations li { 
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(46, 125, 50, 0.1);
            position: relative;
            padding-left: 2rem;
        }
        .recommendations li::before {
            content: '💡';
            position: absolute;
            left: 0;
            top: 0.75rem;
        }
        .ai-analysis {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
            padding: 1.5rem;
            border-radius: 12px;
            margin: 1rem 0;
            border-left: 5px solid #ff9800;
        }
        .ai-analysis h4 { color: #e65100; margin-bottom: 1rem; }
        pre { 
            background: #f5f5f5; 
            padding: 1.5rem; 
            border-radius: 8px; 
            overflow-x: auto; 
            font-size: 0.9em;
            line-height: 1.5;
            border: 1px solid #e0e0e0;
        }
        .tech-stack {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .tech-item {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            text-align: center;
            transition: all 0.3s;
        }
        .tech-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .tech-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .badge {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin: 0.2rem;
        }
        .badge.success { background: #d4edda; color: #155724; }
        .badge.info { background: #d1ecf1; color: #0c5460; }
        .badge.warning { background: #fff3cd; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 综合视觉回归测试报告</h1>
            <p>基于 Playwright + AI + 像素对比的智能UI测试系统</p>
            <p>集成通义千问视觉模型 + Pixelmatch 像素检测</p>
            <p style="font-size: 1rem; margin-top: 1rem;">生成时间: ${reportData.generated_at}</p>
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
                    <p>AI分析次数</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.device_tests}</h3>
                    <p>设备适配测试</p>
                </div>
                <div class="summary-card">
                    <h3>${reportData.summary.pixel_comparisons}</h3>
                    <p>像素对比测试</p>
                </div>
            </div>

            <div class="tech-stack">
                <div class="tech-item">
                    <div class="tech-icon">🤖</div>
                    <h4>通义千问视觉模型</h4>
                    <p>AI驱动的语义分析和设计建议</p>
                    <span class="badge success">qwen-vl-max-latest</span>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🔬</div>
                    <h4>Pixelmatch对比</h4>
                    <p>亚像素级的精确差异检测</p>
                    <span class="badge info">像素级精度</span>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🎭</div>
                    <h4>Playwright框架</h4>
                    <p>跨浏览器自动化测试平台</p>
                    <span class="badge warning">多浏览器支持</span>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">📊</div>
                    <h4>智能报告系统</h4>
                    <p>可视化分析结果和改进建议</p>
                    <span class="badge success">HTML + JSON</span>
                </div>
            </div>

            ${reportData.results['pixel-comparison-result'] ? `
                <div class="section">
                    <h3>🔬 像素级差异检测结果</h3>
                    <div class="pixel-stats">
                        <h4>📊 检测统计</h4>
                        <div class="stat-item">
                            <span>总像素数:</span>
                            <span><strong>${reportData.results['pixel-comparison-result'].comparison.totalPixels.toLocaleString()}</strong></span>
                        </div>
                        <div class="stat-item">
                            <span>差异像素:</span>
                            <span><strong>${reportData.results['pixel-comparison-result'].comparison.diffPixels.toLocaleString()}</strong></span>
                        </div>
                        <div class="stat-item">
                            <span>差异百分比:</span>
                            <span><strong>${reportData.results['pixel-comparison-result'].comparison.diffPercentage}%</strong></span>
                        </div>
                        <div class="stat-item">
                            <span>检测状态:</span>
                            <span><strong>${reportData.results['pixel-comparison-result'].comparison.status}</strong></span>
                        </div>
                    </div>
                    <p>✅ 像素级检测显示页面变化在可接受范围内，主要差异集中在验证码区域，符合动态内容的预期变化。</p>
                </div>
            ` : ''}

            ${reportData.results['ai-analysis-results'] ? `
                <div class="section">
                    <h3>🧠 AI智能分析结果</h3>
                    <div class="comparison-grid">
                        ${reportData.results['ai-analysis-results'].map(analysis => `
                            <div class="comparison-card">
                                <h4>${analysis.type === 'layout_comparison' ? '📐 布局对比分析' : 
                                     analysis.type === 'accessibility_analysis' ? '♿ 可访问性分析' : 
                                     '🔍 综合分析'}</h4>
                                <div class="ai-analysis">
                                    <h4>🤖 AI分析报告</h4>
                                    <pre>${analysis.result.comparison || analysis.result.analysis}</pre>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="section">
                <h3>📋 基线页面库</h3>
                <p>已建立包含正常、布局破损、颜色破损等多版本的视觉基线库，用于全面的回归测试。</p>
                <div class="comparison-grid">
                    ${reportData.results['baseline-info']?.pages?.map(page => `
                        <div class="comparison-card">
                            <h4>${page.description}</h4>
                            <p><strong>页面类型:</strong> ${page.name}</p>
                            <p><strong>用途:</strong> ${page.name === 'normal' ? '标准基线对比' : 
                                                      page.name === 'broken-layout' ? '布局错误检测验证' : 
                                                      '颜色错误检测验证'}</p>
                        </div>
                    `).join('') || '<p>基线数据加载中...</p>'}
                </div>
            </div>

            <div class="recommendations">
                <h3>💡 智能改进建议</h3>
                <ul>
                    ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>🚀 系统特色功能</h3>
                <div class="comparison-grid">
                    <div class="comparison-card">
                        <h4>🎯 多维度检测</h4>
                        <p>结合AI语义理解和像素精确对比，实现从设计层面到技术层面的全面检测。</p>
                    </div>
                    <div class="comparison-card">
                        <h4>🔍 智能差异分析</h4>
                        <p>不仅识别视觉差异，更理解差异的业务影响和用户体验影响。</p>
                    </div>
                    <div class="comparison-card">
                        <h4>📱 跨设备验证</h4>
                        <p>自动测试桌面、平板、移动端等多种设备的视觉一致性。</p>
                    </div>
                    <div class="comparison-card">
                        <h4>♿ 可访问性保障</h4>
                        <p>自动检查WCAG 2.1标准合规性，确保包容性设计。</p>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin: 3rem 0; padding: 2rem; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px;">
                <h3 style="color: #495057; margin-bottom: 1rem;">🏆 测试系统成就</h3>
                <p style="font-size: 1.1rem; color: #6c757d; line-height: 1.6;">
                    成功实现了 <strong>AI + 像素双重检测机制</strong>，将传统的功能测试升级为智能化的视觉回归测试系统。
                    不仅能够发现视觉问题，更能提供专业的设计建议和用户体验优化方案。
                </p>
                <p style="margin-top: 1rem; font-weight: 600; color: #495057;">
                    这是现代化前端测试技术与人工智能完美融合的典型案例！
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'comprehensive-report.html'), html);
}

// 运行演示报告生成
if (require.main === module) {
  generateDemoReports();
}

module.exports = { generateDemoReports };