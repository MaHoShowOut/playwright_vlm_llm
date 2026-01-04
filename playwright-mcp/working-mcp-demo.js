/**
 * 可以实际运行的MCP演示
 * 直接使用Playwright API演示MCP的核心概念
 */

import { chromium } from 'playwright';

async function mcpStyleDemo() {
  console.log('🚀 启动MCP风格的演示...');
  
  // 启动浏览器 (相当于MCP的browser_navigate)
  const browser = await chromium.launch({ 
    headless: false,  // 显示浏览器界面
    slowMo: 1000      // 慢动作演示
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // === 模拟MCP: browser_navigate ===
    console.log('\n📍 MCP工具: browser_navigate');
    console.log('参数: { url: "http://eaapp.somee.com" }');
    
    await page.goto('http://eaapp.somee.com');
    console.log('✅ 导航完成');
    
    // === 模拟MCP: browser_snapshot ===
    console.log('\n📸 MCP工具: browser_snapshot');
    console.log('获取页面结构...');
    
    // 获取页面基本信息
    const title = await page.title();
    const url = page.url();
    
    // 获取主要元素 (模拟可访问性快照)
    const links = await page.locator('a').allTextContents();
    const buttons = await page.locator('button').allTextContents();
    const headings = await page.locator('h1, h2, h3').allTextContents();
    
    console.log(`页面标题: ${title}`);
    console.log(`当前URL: ${url}`);
    console.log(`发现的链接: ${links.slice(0, 5).join(', ')}...`);
    console.log(`发现的按钮: ${buttons.join(', ')}`);
    console.log(`发现的标题: ${headings.join(', ')}`);
    
    // === 模拟MCP: browser_click (找到Login链接) ===
    console.log('\n🔗 MCP工具: browser_click');
    console.log('参数: { element: "Login link", ref: "login-link" }');
    
    // 智能查找登录链接
    const loginLink = page.locator('a').filter({ hasText: /login/i }).first();
    const loginExists = await loginLink.count() > 0;
    
    if (loginExists) {
      await loginLink.click();
      console.log('✅ 点击登录链接成功');
      
      // 等待页面加载
      await page.waitForLoadState('networkidle');
      
      // === 模拟MCP: browser_snapshot (登录页面) ===
      console.log('\n📸 MCP工具: browser_snapshot (登录页面)');
      const newTitle = await page.title();
      const newUrl = page.url();
      
      // 查找表单元素
      const formFields = await page.locator('input[type="text"], input[type="password"], input[type="email"]').count();
      
      console.log(`新页面标题: ${newTitle}`);
      console.log(`新页面URL: ${newUrl}`);
      console.log(`发现 ${formFields} 个输入字段`);
      
      // === 模拟MCP: browser_type (填写表单) ===
      if (formFields >= 2) {
        console.log('\n⌨️  MCP工具: browser_type');
        console.log('参数: { element: "username field", text: "admin" }');
        
        const usernameField = page.locator('input[type="text"], input[name*="user"], input[id*="user"]').first();
        const passwordField = page.locator('input[type="password"]').first();
        
        if (await usernameField.count() > 0) {
          await usernameField.fill('admin');
          console.log('✅ 用户名填写完成');
        }
        
        if (await passwordField.count() > 0) {
          await passwordField.fill('password');
          console.log('✅ 密码填写完成');
        }
        
        // === 模拟MCP: browser_click (提交按钮) ===
        console.log('\n🔘 MCP工具: browser_click');
        console.log('参数: { element: "login button", ref: "submit-btn" }');
        
        const submitBtn = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /login|submit|sign/i }).first();
        
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          console.log('✅ 点击登录按钮');
          
          // 等待响应
          await page.waitForTimeout(3000);
        }
      }
    } else {
      console.log('❌ 未找到登录链接');
    }
    
    // === 模拟MCP: browser_take_screenshot ===
    console.log('\n📷 MCP工具: browser_take_screenshot');
    console.log('参数: { filename: "demo-result.png" }');
    
    await page.screenshot({ 
      path: 'demo-result.png',
      fullPage: true 
    });
    console.log('✅ 截图保存为 demo-result.png');
    
    // === 生成的Playwright代码 ===
    console.log('\n📝 MCP生成的Playwright代码:');
    console.log(`
// 基于MCP探索自动生成的代码
test('EA Employee App登录流程', async ({ page }) => {
  // Navigate to http://eaapp.somee.com
  await page.goto('http://eaapp.somee.com');
  
  // Click login link
  await page.click('text=Login');
  
  // Fill username
  await page.fill('input[type="text"]', 'admin');
  
  // Fill password  
  await page.fill('input[type="password"]', 'password');
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Take screenshot
  await page.screenshot({ path: 'result.png' });
});`);
    
    console.log('\n⏰ 演示将在5秒后结束...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ MCP演示完成！');
  }
}

// 运行演示
mcpStyleDemo().catch(console.error);