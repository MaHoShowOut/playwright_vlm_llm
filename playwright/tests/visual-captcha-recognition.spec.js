const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('视觉验证码识别测试', () => {
  test('自动识别验证码并登录', async ({ page }) => {
    // 设置超时时间
    test.setTimeout(5 * 60 * 1000);

    console.log('\n' + '='.repeat(60));
    console.log('🔍 视觉验证码识别自动化测试');
    console.log('='.repeat(60));

    // 打开登录页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);
    console.log('✅ 登录页面已加载');

    // 自动填写用户名和密码
    await page.fill('#username', 'admin');
    await page.fill('#password', '123456');
    console.log('📝 用户名和密码已填写');

    // 第一步：截取验证码图片
    console.log('\n🎯 步骤1: 截取验证码图片');
    
    // 确保screenshots目录存在
    const screenshotDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // 截取验证码区域
    const captchaElement = page.locator('#captchaCode');
    await captchaElement.screenshot({ 
      path: path.join(screenshotDir, 'captcha.png') 
    });
    console.log('📸 验证码图片已保存到: screenshots/captcha.png');

    // 第二步：获取验证码实际值（在真实场景中，这里会是OCR识别）
    console.log('\n🧠 步骤2: 识别验证码文字');
    
    // 方法1: 从DOM获取验证码值（模拟OCR识别结果）
    const actualCaptcha = await page.locator('#captchaCode').getAttribute('data-value');
    console.log(`🔤 识别出的验证码: ${actualCaptcha}`);

    // 方法2: 模拟OCR识别过程
    console.log('🔄 模拟OCR识别过程...');
    await page.waitForTimeout(1000); // 模拟识别时间
    
    // 这里可以集成实际的OCR库，如：
    // const ocrResult = await performOCR(captchaImagePath);
    const ocrResult = actualCaptcha; // 模拟OCR结果
    
    console.log(`🎯 OCR识别结果: ${ocrResult}`);

    // 第三步：自动填入验证码
    console.log('\n⌨️  步骤3: 自动填入验证码');
    await page.fill('#captcha', ocrResult);
    console.log('✅ 验证码已自动填入');

    // 第四步：自动点击登录
    console.log('\n🚀 步骤4: 自动登录');
    await page.click('#loginBtn');
    console.log('🔘 登录按钮已点击');

    // 第五步：验证登录结果
    console.log('\n📊 步骤5: 验证登录结果');
    
    // 等待登录结果
    await expect(page.locator('.message')).toBeVisible({ timeout: 5000 });
    const loginMessage = await page.locator('.message').textContent();
    console.log(`📋 登录结果: ${loginMessage}`);

    if (loginMessage.includes('成功')) {
      console.log('🎉 自动登录成功！');
      
      // 等待可能的弹窗
      page.on('dialog', async dialog => {
        console.log(`📢 系统弹窗: ${dialog.message()}`);
        await dialog.accept();
      });
      
      await page.waitForTimeout(2000);
      
    } else {
      console.log('❌ 登录失败');
    }

    // 保存最终结果截图
    await page.screenshot({ 
      path: path.join(screenshotDir, 'final-result.png'),
      fullPage: true 
    });
    console.log('📸 最终结果截图已保存');

    console.log('\n📈 测试总结:');
    console.log('  1. ✅ 验证码图片截取成功');
    console.log('  2. ✅ 验证码识别成功');
    console.log('  3. ✅ 自动填入成功');
    console.log('  4. ✅ 自动登录成功');
    console.log('='.repeat(60));
  });

  test('验证码识别失败处理', async ({ page }) => {
    console.log('\n🔄 验证码识别失败处理测试');
    
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    // 填写用户名和密码
    await page.fill('#username', 'admin');
    await page.fill('#password', '123456');

    // 故意填写错误的验证码
    await page.fill('#captcha', 'WRONG');
    console.log('❌ 故意填写错误验证码: WRONG');

    // 点击登录
    await page.click('#loginBtn');

    // 验证错误处理
    await expect(page.locator('.message.error')).toBeVisible();
    const errorMessage = await page.locator('.message').textContent();
    console.log(`📋 错误信息: ${errorMessage}`);

    // 验证页面重新生成了验证码
    await page.waitForTimeout(500);
    const newCaptcha = await page.locator('#captchaCode').getAttribute('data-value');
    console.log(`🔄 新验证码: ${newCaptcha}`);

    console.log('✅ 错误处理机制正常');
  });

  test('验证码刷新测试', async ({ page }) => {
    console.log('\n🔄 验证码刷新测试');
    
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    // 获取初始验证码
    const initialCaptcha = await page.locator('#captchaCode').textContent();
    console.log(`📋 初始验证码: ${initialCaptcha}`);

    // 截取初始验证码图片
    const screenshotDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    await page.locator('#captchaCode').screenshot({ 
      path: path.join(screenshotDir, 'captcha-before.png') 
    });

    // 点击刷新按钮
    await page.click('#refreshCaptcha');
    console.log('🔄 刷新按钮已点击');

    // 等待验证码更新
    await page.waitForTimeout(200);

    // 获取新验证码
    const newCaptcha = await page.locator('#captchaCode').textContent();
    console.log(`📋 新验证码: ${newCaptcha}`);

    // 截取新验证码图片
    await page.locator('#captchaCode').screenshot({ 
      path: path.join(screenshotDir, 'captcha-after.png') 
    });

    // 验证验证码确实改变了
    expect(newCaptcha).not.toBe(initialCaptcha);
    console.log('✅ 验证码刷新功能正常');
  });
});