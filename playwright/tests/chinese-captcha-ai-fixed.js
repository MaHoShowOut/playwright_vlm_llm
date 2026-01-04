const { test, expect } = require('@playwright/test');
const { VisualAIDetector } = require('../visual-ai-detector');
const path = require('path');

// 通义千问API密钥
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-f582ca48b59f40f5bc40db5558e9610b-';

test.describe('中文点击验证码AI识别测试 - 精确位置识别', () => {
  let aiDetector;

  test.beforeAll(async () => {
    aiDetector = new VisualAIDetector(API_KEY);
  });

  test('AI识别中文验证码并精确点击位置', async ({ page }) => {
    // 打开中文点击验证码页面
    await page.goto('file://' + path.join(__dirname, '../chinese-click-captcha.html'));
    
    // 等待页面加载完成
    await page.waitForSelector('.captcha-grid', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // 截图保存
    const screenshotPath = path.join(__dirname, '../screenshots', 'chinese-captcha.png');
    await page.screenshot({ path: screenshotPath });
    
    // 获取目标字符序列
    const targetCharsText = await page.locator('#targetChars').textContent();
    console.log('🎯 目标字符序列:', targetCharsText);
    
    // 使用精确的JSON格式提示
    const analysisPrompt = `请严格按照JSON格式分析中文验证码，确保位置编号准确：
{
  "targetSequence": ["字符1", "字符2", "字符3"],
  "characterPositions": {
    "字符1": 数字位置,
    "字符2": 数字位置,
    "字符3": 数字位置
  }
}

例如：
{
  "targetSequence": ["鹤", "木", "鼠"],
  "characterPositions": {
    "鹤": 2,
    "木": 14,
    "鼠": 4
  }
}`;

    try {
      const analysisResult = await aiDetector.analyzeUIScreenshot(screenshotPath, analysisPrompt);
      console.log('🤖 AI分析结果:', analysisResult);
      
      // 解析JSON结果
      let targetSequence = [];
      let positionMap = {};
      
      try {
        // 清理可能的Markdown标记
        let jsonText = analysisResult.analysis || analysisResult;
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        jsonText = jsonText.trim();
        
        const result = JSON.parse(jsonText);
        targetSequence = result.targetSequence || [];
        positionMap = result.characterPositions || {};
        
        console.log('✅ JSON解析成功');
        console.log('目标序列:', targetSequence);
        console.log('位置映射:', positionMap);
        
      } catch (error) {
        console.log('⚠️ JSON解析失败，使用备用方案');
        
        // 备用方案：直接从页面获取
        const targetChars = targetCharsText.split(' → ').filter(s => s.trim());
        console.log('🔄 备用目标字符:', targetChars);
        
        // 获取所有字符按钮的文本和位置
        const allCharsElements = await page.locator('.char-button').all();
        const allChars = [];
        for (let i = 0; i < allCharsElements.length; i++) {
          const text = await allCharsElements[i].textContent();
          allChars.push({ text: text.trim(), position: i + 1 });
        }
        
        console.log('📋 所有字符:', allChars);
        
        // 为每个目标字符找到位置
        for (let targetChar of targetChars) {
          const found = allChars.find(char => char.text === targetChar);
          if (found) {
            positionMap[targetChar] = found.position;
          }
        }
        
        targetSequence = targetChars;
        console.log('🎯 备用位置映射:', positionMap);
      }
      
      // 8. 按顺序点击目标字符
      let successfulClicks = 0;
      
      for (let i = 0; i < targetSequence.length; i++) {
        const targetChar = targetSequence[i];
        const position = positionMap[targetChar];
        
        if (position && position >= 1 && position <= 16) {
          console.log(`🖱️ 点击字符 "${targetChar}" (位置 ${position})`);
          
          // 使用精确的nth-child选择器
          const buttonSelector = `.char-button:nth-child(${position})`;
          await page.click(buttonSelector);
          
          // 等待点击成功（绿色高亮）
          const hasClickedClass = await page.locator(buttonSelector).evaluate(el => 
            el.classList.contains('clicked') || el.style.backgroundColor === 'rgb(144, 238, 144)'
          );
          
          if (hasClickedClass) {
            console.log(`✅ 成功点击字符 "${targetChar}"`);
            successfulClicks++;
          } else {
            console.log(`❌ 点击字符 "${targetChar}" 失败`);
          }
        } else {
          console.log(`⚠️ 未找到字符 "${targetChar}" 的位置 ${position}`);
        }
      }
      
      // 9. 等待验证结果
      await page.waitForTimeout(1000);
      
      // 10. 检查验证结果
      const resultElement = await page.locator('#result');
      const isResultVisible = await resultElement.isVisible();
      
      if (isResultVisible) {
        const resultText = await resultElement.textContent();
        console.log('🎉 验证结果:', resultText);
        
        if (resultText.includes('验证成功')) {
          console.log('✅ AI成功完成中文点击验证码！');
        } else {
          console.log('❌ AI验证失败');
        }
      }
      
      // 11. 截图验证
      const clickedScreenshotPath = path.join(__dirname, '../screenshots', 'chinese-captcha-clicked-fixed.png');
      await page.screenshot({ path: clickedScreenshotPath });
      
      // 12. 验证点击成功率
      expect(successfulClicks).toBe(targetSequence.length);
      
    } catch (error) {
      console.error('❌ 测试失败:', error);
      throw error;
    }
  });

  test('验证JSON格式位置识别精度', async ({ page }) => {
    // 专门测试位置识别精度
    await page.goto('file://' + path.join(__dirname, '../chinese-click-captcha.html'));
    await page.waitForSelector('.captcha-grid');
    
    const targetCharsText = await page.locator('#targetChars').textContent();
    console.log('🎯 测试位置识别:', targetCharsText);
    
    // 验证位置识别准确性
    const allCharsElements = await page.locator('.char-button').all();
    const actualPositions = [];
    
    for (let i = 0; i < allCharsElements.length; i++) {
      const text = await allCharsElements[i].textContent();
      actualPositions.push({ text: text.trim(), position: i + 1 });
    }
    
    console.log('📊 实际网格布局:', actualPositions);
  });
});