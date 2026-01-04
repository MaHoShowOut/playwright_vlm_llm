const { test, expect } = require('@playwright/test');
const { VisualAIDetector } = require('../visual-ai-detector');
const path = require('path');

// 通义千问API密钥
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-f582ca48b59f40f5bc40db5558e9610b-';

test.describe('中文点击验证码AI识别测试', () => {
  let aiDetector;

  test.beforeAll(async () => {
    aiDetector = new VisualAIDetector(API_KEY);
  });

  test('中文验证码位置识别验证', async ({ page }) => {
    // 打开中文点击验证码页面
    await page.goto('file://' + path.join(__dirname, '../chinese-click-captcha.html'));
    
    // 等待页面加载完成
    await page.waitForSelector('.captcha-grid', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // 截图保存
    const screenshotPath = path.join(__dirname, '../screenshots', 'chinese-captcha-test.png');
    await page.screenshot({ path: screenshotPath });
    
    // 获取目标字符序列
    const targetCharsText = await page.locator('#targetChars').textContent();
    console.log('🎯 目标字符序列:', targetCharsText);
    
    // 使用精确的JSON格式提示
    const analysisPrompt = '请严格按照JSON格式分析中文验证码：{"targetSequence": ["字符1", "字符2", "字符3"], "characterPositions": {"字符1": 位置编号, "字符2": 位置编号, "字符3": 位置编号}}';
    
    try {
      const result = await aiDetector.analyzeUIScreenshot(screenshotPath, analysisPrompt);
      
      // 解析JSON结果
      let jsonResult = {};
      try {
        let jsonText = result.analysis || result;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        jsonResult = JSON.parse(jsonText);
      } catch (e) {
        // 备用解析
        console.log('使用备用解析方案');
        const targetChars = targetCharsText.split(' → ').filter(s => s.trim());
        jsonResult = { targetSequence: targetChars, characterPositions: {} };
      }
      
      console.log('🤖 AI分析结果:', jsonResult);
      
      // 验证目标序列和位置
      expect(jsonResult.targetSequence).toBeDefined();
      expect(jsonResult.characterPositions).toBeDefined();
      
      // 执行点击验证
      let successfulClicks = 0;
      for (const char of jsonResult.targetSequence) {
        const position = jsonResult.characterPositions[char];
        if (position && position >= 1 && position <= 16) {
          console.log(`点击字符 ${char} 在位置 ${position}`);
          
          const button = page.locator(`.char-button:nth-child(${position})`);
          await button.click();
          
          // 验证点击成功
          const hasClicked = await button.evaluate(el => el.classList.contains('clicked'));
          if (hasClicked) successfulClicks++;
        }
      }
      
      // 验证成功点击数量
      expect(successfulClicks).toBe(jsonResult.targetSequence.length);
      
    } catch (error) {
      console.error('测试失败:', error);
      throw error;
    }
  });

  test('数学验证码计算验证', async ({ page }) => {
    await page.goto('file://' + path.join(__dirname, '../math-captcha.html'));
    await page.waitForSelector('.math-captcha-container');
    
    const screenshotPath = path.join(__dirname, '../screenshots', 'math-captcha-test.png');
    await page.screenshot({ path: screenshotPath });
    
    const mathPrompt = '请分析数学验证码：{"expression": "识别的表达式", "result": "计算结果"}';
    const result = await aiDetector.analyzeUIScreenshot(screenshotPath, mathPrompt);
    
    console.log('🔢 数学验证码结果:', result);
  });
});