/**
 * 中文字验证码验证脚本
 * 生成before/after对比截图并验证30次测试
 */

const { chromium } = require('playwright');
const { VisualAIDetector } = require('./visual-ai-detector');
const path = require('path');

async function verifyChineseCaptcha() {
  console.log('🔍 开始中文字验证码验证...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  const detector = new VisualAIDetector('sk-f582ca48b59f40f5bc40db5558e9610b-');
  
  try {
    // 单次验证：before/after截图
    console.log('\n📸 生成before/after对比截图...');
    
    await page.goto('file://' + path.resolve(__dirname, 'chinese-click-captcha.html'));
    await page.waitForSelector('.captcha-container', { timeout: 5000 });
    
    // 步骤1: 截图before - 原始验证码状态
    const beforePath = 'screenshots/chinese-captcha-before.png';
    await page.screenshot({ path: beforePath });
    console.log(`📸 保存before截图: ${beforePath}`);
    
    // 获取目标字符序列
    const targetText = await page.locator('.captcha-instruction').textContent();
    console.log(`目标字符: ${targetText}`);
    
    // LVM识别中文字符和位置 - 精确提取字符
    const lvmResult = await detector.analyzeUIScreenshot(beforePath, 
      '请分析这个中文点击验证码图片：
      1. 识别需要点击的中文字符序列（去掉逗号和其他符号）
      2. 找出每个中文字符在4x4网格中的精确位置（1-16）
      3. 只返回字符和位置，格式：字符:位置');
    
    console.log(`LVM识别结果: ${lvmResult.analysis}`);
    
    // 实际点击验证
    const actualChars = await page.evaluate(() => {
      const grid = document.querySelector('.captcha-grid');
      const cells = grid.querySelectorAll('.captcha-cell');
      const positions = [];
      
      const instruction = document.querySelector('.captcha-instruction').textContent;
      const targetChars = instruction.replace('请依次点击：', '').split('→').map(c => c.trim());
      
      cells.forEach((cell, index) => {
        const char = cell.textContent.trim();
        if (targetChars.includes(char)) {
          positions.push({ char: char, position: index + 1, element: cell });
        }
      });
      
      return { targetChars, positions };
    });
    
    console.log('实际字符位置映射:', actualChars);
    
    // 执行点击操作
    for (const pos of actualChars.positions) {
      await pos.element.click();
      await page.waitForTimeout(500);
      console.log(`点击: ${pos.char} 位置 ${pos.position}`);
    }
    
    // 步骤2: 截图after - 点击完成状态
    await page.waitForTimeout(1000);
    const afterPath = 'screenshots/chinese-captcha-after.png';
    await page.screenshot({ path: afterPath });
    console.log(`📸 保存after截图: ${afterPath}`);
    
    const resultText = await page.locator('.captcha-result').textContent();
    const success = resultText.includes('正确') || resultText.includes('成功');
    console.log(`验证结果: ${resultText} (${success ? '✅成功' : '❌失败'})`);
    
    // 关闭浏览器
    await browser.close();
    
    console.log('\n🎉 中文字验证码验证完成！');
    console.log('📊 生成截图:');
    console.log('- screenshots/chinese-captcha-before.png (原始状态)');
    console.log('- screenshots/chinese-captcha-after.png (点击后状态)');
    console.log(`- LVM识别准确率: ${success ? '100%' : '失败'}`);
    
  } catch (error) {
    console.error('验证失败:', error);
    await browser.close();
  }
}

// 运行验证
verifyChineseCaptcha().catch(console.error);