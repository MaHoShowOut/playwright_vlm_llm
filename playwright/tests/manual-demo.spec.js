const { test, expect } = require('@playwright/test');
const path = require('path');

test('简单的人工输入演示', async ({ page }) => {
  // 打开登录页面
  const filePath = path.join(__dirname, '..', 'login.html');
  await page.goto(`file://${filePath}`);

  // 获取验证码
  const captcha = await page.locator('#captchaCode').textContent();
  
  console.log('='.repeat(50));
  console.log('🎯 人工输入演示');
  console.log('='.repeat(50));
  console.log(`当前验证码: ${captcha}`);
  console.log('请按以下步骤操作:');
  console.log('1. 在浏览器中填写用户名: admin');
  console.log('2. 在浏览器中填写密码: 123456');
  console.log(`3. 在浏览器中填写验证码: ${captcha}`);
  console.log('4. 点击登录按钮');
  console.log('5. 在 Playwright Inspector 中点击 Resume');
  console.log('='.repeat(50));

  // 暂停测试，让用户手动操作
  await page.pause();

  // 验证登录结果
  await expect(page.locator('.message')).toBeVisible({ timeout: 5000 });
  const result = await page.locator('.message').textContent();
  console.log(`登录结果: ${result}`);
});