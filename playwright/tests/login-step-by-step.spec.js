const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Login Step by Step Guide', () => {
  test('step by step manual login', async ({ page }) => {
    console.log('🚀 步骤1: 打开登录页面...');
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    console.log('✅ 步骤2: 自动填写用户名和密码...');
    await page.fill('#username', 'admin');
    await page.fill('#password', '123456');

    console.log('👀 步骤3: 获取验证码...');
    const captchaText = await page.locator('#captchaCode').textContent();
    
    console.log('==========================================');
    console.log(`🔢 当前验证码是: ${captchaText}`);
    console.log('==========================================');
    console.log('📝 请在浏览器中手动输入验证码:');
    console.log(`   1. 找到验证码输入框`);
    console.log(`   2. 输入: ${captchaText}`);
    console.log(`   3. 不要点击登录按钮!`);
    console.log(`   4. 在 Playwright Inspector 中点击 Resume 继续`);
    console.log('==========================================');
    
    // ⭐ 暂停，等待手动输入
    await page.pause();

    console.log('🎯 步骤4: 自动点击登录按钮...');
    await page.click('#loginBtn');

    console.log('⏳ 步骤5: 等待登录结果...');
    await expect(page.locator('.message')).toBeVisible({ timeout: 3000 });
    
    const messageText = await page.locator('.message').textContent();
    console.log(`📊 登录结果: ${messageText}`);
    
    if (messageText.includes('成功')) {
      console.log('🎉 登录成功！测试通过！');
    } else {
      console.log('❌ 登录失败，请检查验证码输入');
    }
  });
});