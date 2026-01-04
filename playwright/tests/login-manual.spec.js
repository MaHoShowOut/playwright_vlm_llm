const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Login Page - Manual Testing', () => {
  test('manual login with captcha input', async ({ page }) => {
    // 导航到登录页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    // 验证页面基本元素
    await expect(page.getByText('用户登录')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#captcha')).toBeVisible();

    // 填写用户名和密码
    await page.fill('#username', 'admin');
    await page.fill('#password', '123456');

    // 获取验证码显示的值
    const captchaText = await page.locator('#captchaCode').textContent();
    console.log(`当前验证码是: ${captchaText}`);

    // ⭐ 关键：暂停测试，允许人工输入验证码
    console.log('测试已暂停，请手动输入验证码然后继续...');
    await page.pause();

    // 暂停后继续执行 - 点击登录按钮
    await page.click('#loginBtn');

    // 等待并检查登录结果
    await expect(page.locator('.message')).toBeVisible({ timeout: 2000 });
    
    // 检查是否显示成功消息
    const messageText = await page.locator('.message').textContent();
    console.log(`登录结果: ${messageText}`);
    
    if (messageText.includes('成功')) {
      await expect(page.locator('.message.success')).toBeVisible();
      console.log('✅ 登录成功！');
    } else {
      console.log('❌ 登录失败，可能是验证码错误');
    }
  });

  test('auto refresh captcha test', async ({ page }) => {
    // 导航到登录页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    // 获取初始验证码
    const initialCaptcha = await page.locator('#captchaCode').textContent();
    console.log(`初始验证码: ${initialCaptcha}`);

    // 点击刷新按钮
    await page.click('#refreshCaptcha');

    // 等待一下让验证码更新
    await page.waitForTimeout(100);

    // 获取新验证码
    const newCaptcha = await page.locator('#captchaCode').textContent();
    console.log(`新验证码: ${newCaptcha}`);

    // 验证验证码确实改变了
    expect(newCaptcha).not.toBe(initialCaptcha);

    // 验证验证码输入框被清空了
    await expect(page.locator('#captcha')).toHaveValue('');
  });

  test('wrong captcha error handling', async ({ page }) => {
    // 导航到登录页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    // 填写正确的用户名密码，但错误的验证码
    await page.fill('#username', 'admin');
    await page.fill('#password', '123456');
    await page.fill('#captcha', 'WRONG');

    // 点击登录
    await page.click('#loginBtn');

    // 验证错误消息
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message')).toHaveText('验证码错误，请重新输入');

    // 验证验证码输入框被清空
    await expect(page.locator('#captcha')).toHaveValue('');
  });

  test('login with invalid password', async ({ page }) => {
    // 导航到登录页面
    const filePath = path.join(__dirname, '..', 'login.html');
    await page.goto(`file://${filePath}`);

    // 填写正确的用户名和错误的密码
    await page.fill('#username', 'admin');
    await page.fill('#password', 'wrongpassword');

    // 获取并输入正确的验证码
    const captchaText = await page.locator('#captchaCode').textContent();
    await page.fill('#captcha', captchaText);

    // 点击登录
    await page.click('#loginBtn');

    // 验证错误消息
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message')).toHaveText('用户名或密码错误');
  });
});