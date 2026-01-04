const { test, expect } = require('@playwright/test');
const path = require('path');

test('慢速人工输入演示 - 有充足时间', async ({ page }) => {
  // 设置较长的测试超时时间
  test.setTimeout(5 * 60 * 1000); // 5分钟超时

  // 打开登录页面
  const filePath = path.join(__dirname, '..', 'login.html');
  await page.goto(`file://${filePath}`);

  // 获取验证码
  const captcha = await page.locator('#captchaCode').textContent();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 慢速人工输入演示 - 您有充足的时间操作');
  console.log('='.repeat(60));
  console.log(`📋 当前验证码: ${captcha}`);
  console.log('\n📝 请按以下步骤操作:');
  console.log('  1. 在浏览器中填写用户名: admin');
  console.log('  2. 在浏览器中填写密码: 123456');
  console.log(`  3. 在浏览器中填写验证码: ${captcha}`);
  console.log('  4. 点击登录按钮');
  console.log('  5. 在 Playwright Inspector 中点击 ▶️ Resume 按钮');
  console.log('\n⏰ 您有充足的时间，不用着急！');
  console.log('🔧 如果需要刷新验证码，点击页面上的"刷新"按钮');
  console.log('='.repeat(60));

  // 暂停测试，让用户有充足时间手动操作
  await page.pause();

  // 等待登录结果，给予更长的超时时间
  console.log('⏳ 等待登录结果...');
  
  // 等待消息出现，最多等待30秒
  try {
    await expect(page.locator('.message')).toBeVisible({ timeout: 30000 });
    const result = await page.locator('.message').textContent();
    console.log(`\n✅ 登录结果: ${result}`);
    
    if (result.includes('成功')) {
      console.log('🎉 恭喜！登录成功！');
      
      // 等待可能出现的弹窗
      page.on('dialog', async dialog => {
        console.log(`📢 弹窗内容: ${dialog.message()}`);
        await dialog.accept();
      });
      
      // 等待一下看是否有弹窗
      await page.waitForTimeout(2000);
      
    } else {
      console.log('❌ 登录失败，可能原因:');
      console.log('   - 验证码输入错误');
      console.log('   - 用户名或密码错误');
    }
  } catch (error) {
    console.log('⚠️  没有检测到登录结果，可能还没有点击登录按钮');
  }
  
  console.log('\n🏁 测试完成！');
});