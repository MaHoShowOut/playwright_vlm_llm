/**
 * 中文点击验证码LVM实验
 * 利用Qwen-VL的物体定位功能进行精确识别
 */

const { chromium } = require('playwright');
const { VisualAIDetector } = require('./visual-ai-detector');
const path = require('path');

async function chineseCaptchaExperiment() {
  console.log('🔬 开始中文点击验证码LVM实验...');
  
  const browser = await chromium.launch({ headless: true, slowMo: 500 });
  const page = await browser.newPage();
  const detector = new VisualAIDetector(); // 使用环境变量 DASHSCOPE_API_KEY
  
  try {
    await page.goto('file://' + path.resolve(__dirname, 'chinese-click-captcha.html'));
    await page.waitForSelector('.captcha-container', { timeout: 5000 });

    // 等待JavaScript执行完成，字符按钮生成
    await page.waitForFunction(() => {
      const grid = document.querySelector('.captcha-grid');
      return grid && grid.children.length === 16; // 等待16个字符按钮生成
    }, { timeout: 10000 });
    
    // 步骤1: 截图保存
    const screenshotPath = 'screenshots/chinese-experiment-before.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 保存before截图: ${screenshotPath}`);
    
    // 步骤2: 获取页面实际信息（用于对比验证）
    const pageInfo = await page.evaluate(() => {
      const targetElement = document.querySelector('#targetChars');
      const targetText = targetElement ? targetElement.textContent : '';
      const targetChars = targetText.split('→').map(c => c.trim()).filter(c => c);
      
      const grid = document.querySelector('.captcha-grid');
      const cells = grid ? grid.querySelectorAll('.captcha-cell') : [];
      const gridChars = [];
      
      if (cells.length === 0) {
        console.log('未找到.captcha-cell，尝试其他选择器...');
        // 备用选择器
        const allDivs = grid ? grid.querySelectorAll('div') : [];
        allDivs.forEach((cell, index) => {
          if (cell.textContent.trim()) {
            gridChars.push({
              char: cell.textContent.trim(),
              position: index + 1,
              element: `cell-${index + 1}`
            });
          }
        });
      } else {
        cells.forEach((cell, index) => {
          gridChars.push({
            char: cell.textContent.trim(),
            position: index + 1,
            element: `cell-${index + 1}`
          });
        });
      }
      
      return { targetChars, gridChars };
    });
    
    console.log('🎯 页面实际信息:');
    console.log('目标字符:', pageInfo.targetChars);
    console.log('网格字符:', pageInfo.gridChars.map(c => `${c.char}(${c.position})`).join(' '));
    
    // 步骤3: LVM识别 - 使用改进的提示词
    const lvmPrompt = `请分析这个中文点击验证码图片：

1. 识别顶部蓝色区域显示的目标字符序列（"请依次点击："后面的字符）
2. 识别4x4网格中的所有中文字符及其位置
3. 以JSON格式返回结果，不要输出代码段标记

请按以下格式返回：
{
  "targetChars": ["字符1", "字符2", "字符3"],
  "gridMapping": {
    "字符1": 位置编号,
    "字符2": 位置编号,
    "字符3": 位置编号
  }
}`;
    
    const lvmResult = await detector.analyzeUIScreenshot(screenshotPath, lvmPrompt);
    
    console.log('🤖 LVM原始识别结果:');
    console.log(lvmResult.analysis);
    
    // 步骤4: 解析LVM结果
    let parsedResult = null;
    try {
      const jsonMatch = lvmResult.analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON解析成功:', parsedResult);

        // 检查LVM返回的位置索引是0-based还是1-based
        const positions = Object.values(parsedResult.gridMapping);
        const minPosition = Math.min(...positions);
        const isZeroBased = minPosition === 0;
        console.log(`📍 LVM位置索引: ${isZeroBased ? '0-based' : '1-based'} (最小值: ${minPosition})`);

        // 如果是0-based，转换为1-based以匹配DOM
        if (isZeroBased) {
          for (const char in parsedResult.gridMapping) {
            parsedResult.gridMapping[char] += 1;
          }
          console.log('🔄 已转换为1-based索引');
        }
      } else {
        console.log('⚠️ 未找到JSON格式，尝试文本解析...');
        // 备用文本解析
        const analysis = lvmResult.analysis;
        const targetMatch = analysis.match(/目标字符.*?[：:]\s*\[(.*?)\]/);
        const mappingMatches = [...analysis.matchAll(/(\S)\s*[:：]\s*位置\s*(\d+)/g)];

        if (targetMatch && mappingMatches.length > 0) {
          parsedResult = {
            targetChars: targetMatch[1].split(',').map(c => c.trim().replace(/['"]/g, '')),
            gridMapping: {}
          };

          mappingMatches.forEach(match => {
            parsedResult.gridMapping[match[1]] = parseInt(match[2]);
          });

          console.log('✅ 文本解析成功:', parsedResult);
        }
      }
    } catch (error) {
      console.log('❌ LVM结果解析失败:', error.message);
    }
    
    // 步骤5: 验证LVM识别准确性
    if (parsedResult) {
      console.log('\n🔍 验证LVM识别准确性:');
      
      // 验证目标字符
      const targetMatch = JSON.stringify(parsedResult.targetChars) === JSON.stringify(pageInfo.targetChars);
      console.log(`目标字符识别: ${targetMatch ? '✅正确' : '❌错误'}`);
      console.log(`LVM: ${JSON.stringify(parsedResult.targetChars)}`);
      console.log(`实际: ${JSON.stringify(pageInfo.targetChars)}`);
      
      // 验证位置映射 (现在已经是统一的1-based索引)
      let positionCorrect = 0;
      let totalPositions = 0;

      for (const char of pageInfo.targetChars) {
        const actualPosition = pageInfo.gridChars.find(c => c.char === char)?.position;
        const lvmPosition = parsedResult.gridMapping[char]; // 已经是1-based

        totalPositions++;
        if (actualPosition === lvmPosition) {
          positionCorrect++;
          console.log(`字符"${char}": ✅正确 (位置${actualPosition})`);
        } else {
          console.log(`字符"${char}": ❌错误 - LVM:${lvmPosition}, 实际:${actualPosition}`);
        }
      }
      
      const accuracy = (positionCorrect / totalPositions * 100).toFixed(1);
      console.log(`\n📊 位置识别准确率: ${positionCorrect}/${totalPositions} (${accuracy}%)`);
      
      // 步骤6: 如果识别正确，执行点击
      if (targetMatch && positionCorrect === totalPositions) {
        console.log('\n🎯 开始执行点击操作...');

        // 调试：检查网格元素 (HTML中使用div.char-button)
        const gridButtons = await page.$$('.captcha-grid .char-button');
        console.log(`📊 找到 ${gridButtons.length} 个字符按钮元素`);

        for (const char of parsedResult.targetChars) {
          const position = parsedResult.gridMapping[char]; // 已经是1-based
          const selector = `.captcha-grid .char-button:nth-child(${position})`;

          console.log(`点击: ${char} (位置${position})`);

          // 检查元素是否存在
          const elementExists = await page.locator(selector).count() > 0;
          if (!elementExists) {
            console.log(`❌ 元素不存在: ${selector}`);
            continue;
          }

          try {
            await page.click(selector, { timeout: 2000 });
            await page.waitForTimeout(300);
          } catch (error) {
            console.log(`❌ 点击失败 ${selector}: ${error.message}`);
          }
        }
        
        // After clicking all characters, click the "Validate" button
        await page.click('button.btn-primary');

        // 步骤7: 截图验证结果
        await page.waitForTimeout(1000);
        const afterPath = 'screenshots/chinese-experiment-after.png';
        await page.screenshot({ path: afterPath });
        console.log(`📸 保存after截图: ${afterPath}`);
        
        // 获取验证结果
        const resultText = await page.locator('#result').textContent({ timeout: 5000 });
        const success = resultText.includes('成功');
        
        console.log(`\n🎉 验证结果: ${resultText}`);
        console.log(`✅ 最终成功率: ${success ? '100%' : '失败'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 实验失败:', error);
  } finally {
    await browser.close();
  }
  
  console.log('\n🔬 中文点击验证码LVM实验完成！');
}

// 运行实验
chineseCaptchaExperiment().catch(console.error);