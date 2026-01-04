/**
 * 视觉AI检测系统演示脚本
 * 快速演示如何使用通义千问视觉模型分析UI截图
 */

const path = require('path');
const { VisualAIDetector } = require('./visual-ai-detector');

async function demoVisualAI() {
  console.log('\n🚀 视觉AI检测系统演示');
  console.log('=' .repeat(50));

  try {
    // 初始化AI检测器
    const detector = new VisualAIDetector('sk-f582ca48b59f40f5bc40db5558e9610b-');
    console.log('✅ AI检测器初始化成功');

    // 检查是否有现有的验证码截图
    const screenshotPath = path.join(__dirname, 'screenshots', 'captcha.png');
    const fs = require('fs');
    
    if (fs.existsSync(screenshotPath)) {
      console.log('\n📸 发现现有验证码截图，开始AI分析...');
      
      // 分析验证码的可读性和设计
      const analysis = await detector.analyzeUIScreenshot(screenshotPath, 'accessibility');
      
      if (analysis.success) {
        console.log('\n🎯 AI分析结果:');
        console.log('-'.repeat(40));
        console.log(analysis.analysis);
        console.log('-'.repeat(40));
        
        // 保存分析结果
        const resultPath = path.join(__dirname, 'demo-ai-analysis.json');
        fs.writeFileSync(resultPath, JSON.stringify(analysis, null, 2));
        console.log(`📄 分析结果已保存到: ${resultPath}`);
        
      } else {
        console.log('❌ AI分析失败:', analysis.error);
      }
    } else {
      console.log('⚠️  未找到验证码截图，请先运行验证码测试');
      console.log('💡 运行命令: npm test -- tests/visual-captcha-recognition.spec.js');
    }

    // 演示如何分析网页设计的一般性问题
    console.log('\n💡 演示完成！');
    console.log('\n📋 使用说明:');
    console.log('1. 运行 npm test -- tests/visual-ai-regression.spec.js 进行完整的AI视觉测试');
    console.log('2. 运行 npm test -- tests/comprehensive-visual-test.spec.js 进行综合测试');
    console.log('3. 查看生成的HTML报告了解详细分析结果');

  } catch (error) {
    console.log('❌ 演示过程中出现错误:', error.message);
    console.log('\n💡 可能的解决方案:');
    console.log('1. 检查API Key是否正确设置');
    console.log('2. 确保网络连接正常');
    console.log('3. 检查依赖是否正确安装 (npm install)');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  demoVisualAI().catch(console.error);
}

module.exports = { demoVisualAI };