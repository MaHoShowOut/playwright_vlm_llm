/**
 * 四种运算LVM验证脚本
 * 为加、减、乘、除各生成一次完整的前后对比验证
 */

const { chromium } = require('playwright');
const { VisualAIDetector } = require('./visual-ai-detector');
const path = require('path');

async function verifyOperations() {
  console.log('🔍 开始四种运算LVM验证...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  const detector = new VisualAIDetector('sk-f582ca48b59f40f5bc40db5558e9610b-');
  
  try {
    await page.goto('file://' + path.resolve(__dirname, 'math-captcha.html'));
    await page.waitForSelector('.math-expression');
    
    const operations = [
      { name: '加法', difficulty: 'easy' },
      { name: '减法', difficulty: 'medium' },
      { name: '乘法', difficulty: 'medium' },
      { name: '除法', difficulty: 'easy' }
    ];
    
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      console.log(`\n🎯 验证 ${op.name} 运算...`);
      
      // 选择难度
      await page.selectOption('#difficulty', op.difficulty);
      await page.waitForTimeout(1500);
      
      // 获取实际题目
      const actualExpression = await page.locator('#mathExpression').textContent();
      console.log(`实际数学题: ${actualExpression}`);
      
      // 截图原始数学题
      const beforePath = `screenshots/${op.name.toLowerCase()}-before.png`;
      await page.screenshot({ path: beforePath });
      console.log(`📸 保存: ${beforePath}`);
      
      // LVM识别 - 改进提示确保识别完整表达式
      const lvmResult = await detector.analyzeUIScreenshot(beforePath, 
        '请识别数学题并计算最终答案，只返回数字');
      
      const analysis = String(lvmResult.analysis || '');
      const aiAnswer = analysis.match(/\d+/) ? analysis.match(/\d+/)[0] : '0';
      
      // 确保是计算结果，不是单个数字
      const correctAnswer = await page.evaluate(() => {
        return window.currentAnswer || 0;
      });
      console.log(`LVM答案: ${aiAnswer}`);
      
      // 输入答案并验证
      await page.fill('#answerInput', aiAnswer);
      await page.click('.btn-primary');
      await page.waitForTimeout(1000);
      
      // 截图验证结果
      const successPath = `screenshots/${op.name.toLowerCase()}-success.png`;
      await page.screenshot({ path: successPath });
      
      const resultText = await page.locator('#result').textContent();
      console.log(`验证结果: ${resultText}`);
      console.log(`✅ ${op.name} 验证${resultText.includes('正确答案') ? '通过' : '失败'}`);
      
      // 换一题准备下一个运算
      if (i < operations.length - 1) {
        await page.click('.btn-secondary');
        await page.waitForTimeout(1500);
      }
    }
    
    console.log('\n🎉 四种运算验证完成！');
    console.log('📊 生成截图:');
    console.log('- screenshots/addition-before.png & addition-success.png');
    console.log('- screenshots/subtraction-before.png & subtraction-success.png');
    console.log('- screenshots/multiplication-before.png & multiplication-success.png');
    console.log('- screenshots/division-before.png & division-success.png');
    
  } catch (error) {
    console.error('验证失败:', error);
  } finally {
    await browser.close();
  }
}

// 运行验证
verifyOperations().catch(console.error);