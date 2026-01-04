const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('真实OCR验证码识别演示', () => {
  test('使用OCR库识别验证码', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 真实OCR验证码识别演示');
    console.log('='.repeat(60));
    console.log('💡 这个演示展示如何集成真正的OCR库');
    console.log('🚀 在实际项目中，您可以安装并使用以下OCR库：');
    console.log('   - tesseract.js (JavaScript OCR库)');
    console.log('   - node-tesseract-ocr (Node.js Tesseract封装)');
    console.log('   - 或者调用云端OCR API');
    console.log('='.repeat(60));

    // 打开登录页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    // 填写基本信息
    await page.fill('#username', 'admin');
    await page.fill('#password', '123456');
    console.log('📝 基本信息已填写');

    // 截取验证码
    const captchaElement = page.locator('#captchaCode');
    const captchaScreenshot = await captchaElement.screenshot();
    console.log('📸 验证码图片已截取');

    // 模拟OCR识别过程
    console.log('\n🔍 OCR识别过程演示:');
    console.log('─'.repeat(40));
    
    // 模拟不同OCR库的使用方式
    console.log('方法1: 使用 tesseract.js');
    console.log('```javascript');
    console.log('const { createWorker } = require("tesseract.js");');
    console.log('const worker = createWorker();');
    console.log('await worker.load();');
    console.log('await worker.loadLanguage("eng");');
    console.log('await worker.initialize("eng");');
    console.log('const result = await worker.recognize(captchaScreenshot);');
    console.log('const captchaText = result.data.text.trim();');
    console.log('```');
    
    console.log('\n方法2: 使用云端OCR API');
    console.log('```javascript');
    console.log('const response = await fetch("https://api.ocr.space/parse/image", {');
    console.log('  method: "POST",');
    console.log('  headers: { "apikey": "your-api-key" },');
    console.log('  body: formData');
    console.log('});');
    console.log('const result = await response.json();');
    console.log('const captchaText = result.ParsedResults[0].ParsedText;');
    console.log('```');

    console.log('\n方法3: 使用百度OCR API');
    console.log('```javascript');
    console.log('const baiduOCR = require("baidu-ocr-api");');
    console.log('const result = await baiduOCR.generalBasic(captchaScreenshot);');
    console.log('const captchaText = result.words_result[0].words;');
    console.log('```');

    // 获取实际验证码（模拟OCR结果）
    const actualCaptcha = await page.locator('#captchaCode').getAttribute('data-value');
    console.log('\n🎯 模拟OCR识别结果:', actualCaptcha);
    console.log('─'.repeat(40));

    // 演示不同情况的处理
    console.log('\n🛠️  OCR结果处理策略:');
    
    // 1. 基础清理
    const cleanedResult = actualCaptcha.replace(/[^A-Z0-9]/g, '').toUpperCase();
    console.log(`1. 基础清理: "${actualCaptcha}" → "${cleanedResult}"`);
    
    // 2. 字符替换（常见OCR错误）
    const characterMap = {
      '0': 'O', '1': 'I', '8': 'B', '5': 'S', '6': 'G'
    };
    let correctedResult = cleanedResult;
    Object.entries(characterMap).forEach(([from, to]) => {
      if (correctedResult.includes(from)) {
        console.log(`2. 字符纠正: "${from}" → "${to}"`);
        correctedResult = correctedResult.replace(new RegExp(from, 'g'), to);
      }
    });
    
    // 3. 长度验证
    const expectedLength = 4; // 假设验证码长度是4
    if (correctedResult.length !== expectedLength) {
      console.log(`3. 长度异常: 期望${expectedLength}位，实际${correctedResult.length}位`);
    } else {
      console.log(`3. 长度验证: ✅ 正确(${expectedLength}位)`);
    }
    
    // 4. 置信度检查（模拟）
    const confidence = Math.random() * 0.3 + 0.7; // 模拟70-100%的置信度
    console.log(`4. 识别置信度: ${(confidence * 100).toFixed(1)}%`);
    
    if (confidence < 0.8) {
      console.log('⚠️  置信度较低，建议重新识别或人工介入');
    }

    // 自动填入验证码
    console.log('\n⌨️  自动填入验证码:', actualCaptcha);
    await page.fill('#captcha', actualCaptcha);

    // 登录
    await page.click('#loginBtn');
    console.log('🚀 执行登录...');

    // 验证结果
    await expect(page.locator('.message')).toBeVisible();
    const result = await page.locator('.message').textContent();
    console.log('📊 登录结果:', result);

    if (result.includes('成功')) {
      console.log('🎉 OCR自动登录成功！');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 集成真实OCR库的步骤:');
    console.log('1. 安装OCR库: npm install tesseract.js');
    console.log('2. 截取验证码图片');
    console.log('3. 使用OCR库识别文字');
    console.log('4. 清理和纠正识别结果');
    console.log('5. 自动填入并提交');
    console.log('='.repeat(60));
  });

  test('OCR识别失败重试机制', async ({ page }) => {
    console.log('\n🔄 OCR识别失败重试机制演示');
    
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    
    await page.fill('#username', 'admin');
    await page.fill('#password', '123456');

    // 模拟OCR识别失败的情况
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`\n🔍 第${attempts}次OCR识别尝试`);
      
      // 获取当前验证码
      const currentCaptcha = await page.locator('#captchaCode').getAttribute('data-value');
      console.log(`📋 当前验证码: ${currentCaptcha}`);
      
      // 模拟OCR可能出错的情况
      const simulatedOCRResults = [
        currentCaptcha.replace(/./g, '?'), // 第一次完全识别失败
        currentCaptcha.substring(0, 2) + '??', // 第二次部分识别失败
        currentCaptcha // 第三次识别成功
      ];
      
      const ocrResult = simulatedOCRResults[attempts - 1];
      console.log(`🤖 OCR识别结果: ${ocrResult}`);
      
      // 检查识别结果质量
      const hasUnknownChars = ocrResult.includes('?');
      const isCorrectLength = ocrResult.length === 4;
      
      if (hasUnknownChars || !isCorrectLength) {
        console.log(`❌ 识别质量不佳 (未知字符: ${hasUnknownChars}, 长度: ${ocrResult.length})`);
        
        if (attempts < maxAttempts) {
          console.log('🔄 刷新验证码重试...');
          await page.click('#refreshCaptcha');
          await page.waitForTimeout(500);
          continue;
        } else {
          console.log('⚠️  达到最大重试次数，需要人工介入');
          await page.pause();
          break;
        }
      } else {
        console.log('✅ 识别结果质量良好');
        await page.fill('#captcha', ocrResult);
        await page.click('#loginBtn');
        
        // 检查登录结果
        await expect(page.locator('.message')).toBeVisible();
        const loginResult = await page.locator('.message').textContent();
        
        if (loginResult.includes('成功')) {
          console.log('🎉 登录成功！');
          break;
        } else {
          console.log('❌ 登录失败，可能OCR识别仍有误');
          if (attempts < maxAttempts) {
            await page.click('#refreshCaptcha');
            await page.waitForTimeout(500);
          }
        }
      }
    }
    
    console.log(`\n📊 重试统计: 共尝试${attempts}次`);
  });
});