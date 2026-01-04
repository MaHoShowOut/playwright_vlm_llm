/**
 * 中文点击验证码10次实验
 * 每次都生成before/after对比截图
 */

const { chromium } = require('playwright');
const { VisualAIDetector } = require('./visual-ai-detector');
const path = require('path');

async function chineseCaptcha10Experiments() {
  console.log('🔬 开始中文点击验证码10次实验...');
  console.log('📊 每次实验都将生成before/after对比截图');
  
  const results = [];
  const detector = new VisualAIDetector('sk-f582ca48b59f40f5bc40db5558e9610b-');
  
  for (let round = 1; round <= 10; round++) {
    console.log(`\n🎯 第${round}/10次实验开始...`);
    
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();
    
    try {
      await page.goto('file://' + path.resolve(__dirname, 'chinese-click-captcha.html'));
      await page.waitForSelector('.captcha-grid', { timeout: 5000 });
      await page.waitForTimeout(1000); // 等待验证码生成
      
      const experimentResult = {
        round: round,
        success: false,
        targetChars: [],
        recognizedChars: [],
        positionAccuracy: 0,
        lvmAccuracy: 0,
        executionSuccess: false,
        timestamp: new Date().toISOString()
      };
      
      // 步骤1: 截图before
      const beforePath = `screenshots/chinese-round-${round}-before.png`;
      await page.screenshot({ path: beforePath });
      console.log(`📸 Round ${round} Before: ${beforePath}`);
      
      // 步骤2: 获取页面实际信息
      const pageInfo = await page.evaluate(() => {
        const targetElement = document.querySelector('#targetChars');
        const targetText = targetElement ? targetElement.textContent : '';
        const targetChars = targetText.split('→').map(c => c.trim()).filter(c => c);
        
        const grid = document.querySelector('.captcha-grid');
        const allDivs = grid ? grid.querySelectorAll('div') : [];
        const gridChars = [];
        
        allDivs.forEach((cell, index) => {
          if (cell.textContent.trim()) {
            gridChars.push({
              char: cell.textContent.trim(),
              position: index + 1
            });
          }
        });
        
        return { targetChars, gridChars };
      });
      
      experimentResult.targetChars = pageInfo.targetChars;
      console.log(`目标字符: ${pageInfo.targetChars.join(' → ')}`);
      
      // 步骤3: LVM识别
      const lvmPrompt = `请分析这个中文点击验证码图片：

1. 识别顶部蓝色区域显示的目标字符序列
2. 识别4x4网格中的所有中文字符及其位置
3. 以JSON格式返回结果

请按以下格式返回：
{
  "targetChars": ["字符1", "字符2", "字符3"],
  "gridMapping": {
    "字符1": 位置编号,
    "字符2": 位置编号,
    "字符3": 位置编号
  }
}`;
      
      const lvmResult = await detector.analyzeUIScreenshot(beforePath, lvmPrompt);
      
      // 步骤4: 解析LVM结果
      let parsedResult = null;
      try {
        const jsonMatch = lvmResult.analysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
          console.log(`LVM识别: ${parsedResult.targetChars ? parsedResult.targetChars.join(' → ') : '解析失败'}`);
          experimentResult.recognizedChars = parsedResult.targetChars || [];
        }
      } catch (error) {
        console.log(`❌ Round ${round} LVM解析失败: ${error.message}`);
      }
      
      // 步骤5: 验证识别准确性
      if (parsedResult && parsedResult.targetChars) {
        // 验证目标字符
        const targetMatch = JSON.stringify(parsedResult.targetChars) === JSON.stringify(pageInfo.targetChars);
        experimentResult.lvmAccuracy = targetMatch ? 100 : 0;
        
        // 验证位置映射
        let positionCorrect = 0;
        for (const char of pageInfo.targetChars) {
          const actualPosition = pageInfo.gridChars.find(c => c.char === char)?.position;
          const lvmPosition = parsedResult.gridMapping[char];
          
          if (actualPosition === lvmPosition) {
            positionCorrect++;
          }
        }
        
        experimentResult.positionAccuracy = (positionCorrect / pageInfo.targetChars.length * 100);
        
        console.log(`字符识别准确率: ${experimentResult.lvmAccuracy}%`);
        console.log(`位置识别准确率: ${experimentResult.positionAccuracy.toFixed(1)}%`);
        
        // 步骤6: 执行点击操作
        if (targetMatch && positionCorrect === pageInfo.targetChars.length) {
          try {
            for (const char of parsedResult.targetChars) {
              const position = parsedResult.gridMapping[char];
              const selector = `.captcha-grid div:nth-child(${position})`;
              
              await page.click(selector);
              await page.waitForTimeout(300);
              console.log(`点击: ${char} (位置${position})`);
            }
            
            experimentResult.executionSuccess = true;
            experimentResult.success = true;
            console.log(`✅ Round ${round} 执行成功`);
            
          } catch (clickError) {
            console.log(`❌ Round ${round} 点击失败: ${clickError.message}`);
          }
        }
      }
      
      // 步骤7: 截图after
      await page.waitForTimeout(1000);
      const afterPath = `screenshots/chinese-round-${round}-after.png`;
      await page.screenshot({ path: afterPath });
      console.log(`📸 Round ${round} After: ${afterPath}`);
      
      results.push(experimentResult);
      
    } catch (error) {
      console.log(`❌ Round ${round} 实验失败: ${error.message}`);
      results.push({
        round: round,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      await browser.close();
    }
    
    // 等待下次实验
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 生成统计报告
  console.log('\n📊 10次实验统计结果:');
  console.log('==========================================');
  
  const successCount = results.filter(r => r.success).length;
  const avgLvmAccuracy = results.reduce((sum, r) => sum + (r.lvmAccuracy || 0), 0) / results.length;
  const avgPositionAccuracy = results.reduce((sum, r) => sum + (r.positionAccuracy || 0), 0) / results.length;
  
  console.log(`总实验次数: 10次`);
  console.log(`成功次数: ${successCount}次`);
  console.log(`成功率: ${(successCount / 10 * 100).toFixed(1)}%`);
  console.log(`平均LVM字符识别准确率: ${avgLvmAccuracy.toFixed(1)}%`);
  console.log(`平均位置识别准确率: ${avgPositionAccuracy.toFixed(1)}%`);
  
  console.log('\n📸 生成截图列表:');
  for (let i = 1; i <= 10; i++) {
    console.log(`Round ${i}:`);
    console.log(`  - Before: screenshots/chinese-round-${i}-before.png`);
    console.log(`  - After:  screenshots/chinese-round-${i}-after.png`);
  }
  
  // 保存详细结果
  const fs = require('fs');
  const reportPath = `experiment-results/chinese-captcha-10-experiments-${Date.now()}.json`;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    experiment: {
      title: "中文点击验证码10次实验",
      totalRounds: 10,
      successCount: successCount,
      successRate: (successCount / 10 * 100).toFixed(1) + '%',
      avgLvmAccuracy: avgLvmAccuracy.toFixed(1) + '%',
      avgPositionAccuracy: avgPositionAccuracy.toFixed(1) + '%',
      experimentTime: new Date().toISOString()
    },
    results: results
  }, null, 2));
  
  console.log(`\n📁 详细结果已保存: ${reportPath}`);
  console.log('\n🎉 中文点击验证码10次实验完成！');
}

// 运行实验
chineseCaptcha10Experiments().catch(console.error);