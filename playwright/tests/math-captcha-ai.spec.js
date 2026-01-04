const { test, expect } = require('@playwright/test');
const { VisualAIDetector } = require('../visual-ai-detector');
const path = require('path');

// 通义千问API密钥 - 实际使用时请使用环境变量
const API_KEY = 'sk-f582ca48b59f40f5bc40db5558e9610b-';

test.describe('数学题验证码AI识别测试', () => {
  let aiDetector;
  let screenshotPath;

  test.beforeAll(async () => {
    aiDetector = new VisualAIDetector(API_KEY);
  });

  test('AI识别数学题验证码并自动输入答案', async ({ page }) => {
    // 1. 打开数学题验证码页面
    await page.goto('file://' + path.join(__dirname, '../math-captcha.html'));
    
    // 2. 等待页面加载完成
    await page.waitForSelector('.math-expression', { timeout: 5000 });
    
    // 3. 等待验证码生成完成
    await page.waitForTimeout(2000);
    
    // 4. 截图保存
    screenshotPath = path.join(__dirname, '../screenshots', 'math-captcha.png');
    await page.screenshot({ path: screenshotPath });
    
    // 5. 使用AI分析数学题验证码（不再从DOM获取文本，完全依赖视觉识别）
    const analysisPrompt = "请仔细分析这个数学题验证码图片，完全基于视觉识别："
      + "\n\n1. 仔细观察图片，找到数学表达式区域"
      + "\n2. 通过OCR技术识别出完整的数学表达式（包括数字和运算符）"
      + "\n3. 数学题可能包含加法(+)、减法(-)、乘法(×)、除法(÷)运算"
      + "\n4. 请识别出完整的数学表达式并计算出正确的答案"
      + "\n5. 请忽略图片中的干扰元素（干扰线条、干扰点、干扰文字等）"
      + "\n\n重要：必须从图片中视觉识别数学表达式，不要依赖任何外部文本信息。"
      + "\n\n请按以下格式返回："
      + "\n数学表达式: [从图片中识别出的完整表达式]"
      + "\n计算过程: [详细的计算步骤]"
      + "\n最终答案: [数字答案]"
      + "\n\n注意："
      + "\n- 只返回最终的数字答案，不要包含任何符号"
      + "\n- 如果是除法，请确保结果是整数"
      + "\n- 乘法符号可能显示为 × 或 *"

    try {
      const analysisResult = await aiDetector.analyzeUIScreenshot(screenshotPath, analysisPrompt);
      console.log('🤖 AI分析结果:');
      console.log(analysisResult);
      
      // 7. 解析AI分析结果，提取答案
      let analysisText = '';
      if (typeof analysisResult === 'string') {
        analysisText = analysisResult;
      } else if (analysisResult.analysis) {
        analysisText = String(analysisResult.analysis);
      } else {
        analysisText = String(analysisResult);
      }
      
      console.log('📄 解析文本:', analysisText);
      const lines = analysisText.split('\n');
      
      let recognizedExpression = '';
      let calculationProcess = '';
      let finalAnswer = '';
      
      // 解析AI返回的结果
      for (let line of lines) {
        if (line.includes('数学表达式:')) {
          const match = line.match(/数学表达式:\s*(.+)/);
          if (match) {
            recognizedExpression = match[1].trim();
          }
        } else if (line.includes('计算过程:')) {
          const match = line.match(/计算过程:\s*(.+)/);
          if (match) {
            calculationProcess = match[1].trim();
          }
        } else if (line.includes('最终答案:')) {
          const match = line.match(/最终答案:\s*(.+)/);
          if (match) {
            finalAnswer = match[1].trim();
            // 提取数字
            const numberMatch = finalAnswer.match(/\d+/);
            if (numberMatch) {
              finalAnswer = numberMatch[0];
            }
          }
        }
      }
      
      console.log('📝 解析结果:');
      console.log('识别表达式:', recognizedExpression);
      console.log('计算过程:', calculationProcess);
      console.log('AI答案:', finalAnswer);
      
      // 8. 如果AI解析失败，使用备用方案（重新截图并尝试更简单的视觉识别）
      if (!finalAnswer) {
        console.log('⚠️ AI解析失败，使用备用方案');
        
        // 备用方案：重新截图并尝试更简单的视觉识别
        const backupScreenshotPath = path.join(__dirname, '../screenshots', 'math-captcha-backup.png');
        await page.screenshot({ path: backupScreenshotPath });
        
        try {
          const backupAnalysis = await aiDetector.analyzeUIScreenshot(backupScreenshotPath, 
            `请简单识别这个数学题验证码中的数学表达式并计算答案。只返回数字答案即可。`);
          
          const backupText = backupAnalysis.analysis || backupAnalysis;
          const numberMatch = backupText.match(/\d+/);
          if (numberMatch) {
            finalAnswer = numberMatch[0];
            console.log('🧮 备用视觉识别结果:', finalAnswer);
          }
        } catch (error) {
          console.error('❌ 备用视觉识别失败:', error);
        }
      }
      
      // 9. 输入答案
      if (finalAnswer) {
        console.log(`⌨️ 输入答案: ${finalAnswer}`);
        
        // 清空输入框
        await page.fill('#answerInput', '');
        
        // 输入答案
        await page.fill('#answerInput', finalAnswer);
        
        // 等待输入完成
        await page.waitForTimeout(500);
        
        // 10. 点击验证按钮
        await page.click('.btn-primary');
        
        // 11. 等待验证结果
        await page.waitForTimeout(1000);
        
        // 12. 检查验证结果
        const resultElement = await page.locator('#result');
        const isResultVisible = await resultElement.isVisible();
        
        if (isResultVisible) {
          const resultText = await resultElement.textContent();
          console.log('🎉 验证结果:', resultText);
          
          if (resultText.includes('🎉 正确答案')) {
            console.log('✅ AI成功完成数学题验证码！');
          } else {
            console.log('❌ AI验证失败');
            
            // 显示正确答案
            const correctAnswer = await page.locator('#correctAnswer').textContent();
            console.log('💡 正确答案:', correctAnswer);
            console.log('🤖 AI答案:', finalAnswer);
          }
        } else {
          console.log('⚠️ 验证结果不可见');
        }
        
        // 13. 截图：输入答案后的状态
        const inputScreenshotPath = path.join(__dirname, '../screenshots', 'math-captcha-input.png');
        await page.screenshot({ path: inputScreenshotPath });
        
        // 14. 截图：验证成功后的最终状态
        const finalScreenshotPath = path.join(__dirname, '../screenshots', 'math-captcha-success.png');
        await page.waitForTimeout(500);
        await page.screenshot({ path: finalScreenshotPath });
        
        console.log('📸 已保存截图：');
        console.log('- 输入答案：math-captcha-input.png');
        console.log('- 验证成功：math-captcha-success.png');
        
      } else {
        console.log('❌ 无法获取答案，测试失败');
      }
      
    } catch (error) {
      console.error('❌ AI分析失败:', error);
      
      // 如果AI分析失败，至少截图保存状态
      const errorScreenshotPath = path.join(__dirname, '../screenshots', 'math-captcha-error.png');
      await page.screenshot({ path: errorScreenshotPath });
      
      throw error;
    }
  });

  test('AI识别不同难度的数学题', async ({ page }) => {
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (let difficulty of difficulties) {
      console.log(`\n🎯 测试难度: ${difficulty}`);
      
      // 1. 打开页面
      await page.goto('file://' + path.join(__dirname, '../math-captcha.html'));
      await page.waitForSelector('.math-expression', { timeout: 5000 });
      
      // 2. 选择难度
      await page.selectOption('#difficulty', difficulty);
      await page.waitForTimeout(1000);
      
      // 3. 截图
      const screenshotPath = path.join(__dirname, '../screenshots', `math-captcha-${difficulty}.png`);
      await page.screenshot({ path: screenshotPath });
      
      // 4. 使用AI视觉识别数学题（不依赖DOM文本）
      try {
        const analysisResult = await aiDetector.analyzeUIScreenshot(screenshotPath, 
          "请分析这个数学题验证码图片，识别数学表达式并计算答案。请返回识别出的数学表达式和最终数字答案。");
        
        console.log(`🤖 ${difficulty} 难度AI分析:`, analysisResult.analysis || analysisResult);
        
        // 提取答案
        const result = String(analysisResult.analysis || analysisResult);
        const aiAnswerMatch = result.match(/\d+/);
        const aiAnswer = aiAnswerMatch ? aiAnswerMatch[0] : '';
        
        if (aiAnswer) {
          console.log(`📝 ${difficulty} 难度AI答案:`, aiAnswer);
          
          // 如果是简单难度，尝试完整的输入和验证流程
          if (difficulty === 'easy') {
            await page.fill('#answerInput', aiAnswer);
            await page.click('.btn-primary');
            await page.waitForTimeout(1000);
            
            const resultText = await page.locator('#result').textContent();
            console.log(`✅ ${difficulty} 难度验证结果:`, resultText);
          }
        }
        
      } catch (error) {
        console.error(`❌ ${difficulty} 难度AI分析失败:`, error);
      }
    }
  });

  test('AI识别数学题验证码的准确率测试', async ({ page }) => {
    let totalTests = 5;
    let successCount = 0;
    
    for (let round = 1; round <= totalTests; round++) {
      console.log(`\n🔄 第 ${round}/${totalTests} 轮准确率测试`);
      
      try {
        // 1. 打开页面并生成新题
        await page.goto('file://' + path.join(__dirname, '../math-captcha.html'));
        await page.waitForSelector('.math-expression', { timeout: 5000 });
        await page.waitForTimeout(2000);
        
        // 2. 截图
        const screenshotPath = path.join(__dirname, '../screenshots', `math-accuracy-${round}.png`);
        await page.screenshot({ path: screenshotPath });
        
        // 3. 使用AI视觉识别数学题并计算答案（不依赖DOM文本）
        const analysisResult = await aiDetector.analyzeUIScreenshot(screenshotPath, 
          `请仔细分析这个数学题验证码图片，完全基于视觉识别：

1. 通过OCR技术识别图片中的数学表达式
2. 数学题可能包含加法(+)、减法(-)、乘法(×)、除法(÷)运算
3. 计算并返回最终答案

请只返回数字答案即可。`);
        
        // 4. 获取正确答案（从页面中提取用于验证）
        let correctAnswer = '0';
        try {
          // 尝试从页面隐藏的correctAnswer元素获取正确答案
          const correctAnswerText = await page.locator('#correctAnswer').textContent();
          if (correctAnswerText && correctAnswerText !== '***') {
            correctAnswer = correctAnswerText;
          } else {
            // 如果隐藏答案不可用，使用页面JavaScript变量
            correctAnswer = await page.evaluate(() => {
              return typeof currentAnswer !== 'undefined' ? currentAnswer.toString() : '0';
            });
          }
        } catch (e) {
          console.log('无法获取正确答案，跳过验证');
          correctAnswer = '0'; // 跳过这一轮验证
        }
        
        // 6. 提取AI答案
        const aiResult = String(analysisResult.analysis || analysisResult);
        const aiAnswerMatch = aiResult.match(/\d+/);
        const aiAnswer = aiAnswerMatch ? aiAnswerMatch[0] : '';
        
        console.log(`🤖 AI答案: ${aiAnswer}`);
        console.log(`✅ 正确答案: ${correctAnswer}`);
        
        // 7. 比较答案
        if (aiAnswer === correctAnswer) {
          successCount++;
          console.log(`✅ 第 ${round} 轮：正确`);
        } else {
          console.log(`❌ 第 ${round} 轮：错误`);
        }
        
      } catch (error) {
        console.error(`❌ 第 ${round} 轮测试失败:`, error);
      }
    }
    
    const accuracy = (successCount / totalTests * 100).toFixed(1);
    console.log(`\n📊 AI准确率统计: ${successCount}/${totalTests} (${accuracy}%)`);
    
    // 准确率应该达到60%以上
    expect(successCount).toBeGreaterThan(totalTests * 0.6);
  });
});