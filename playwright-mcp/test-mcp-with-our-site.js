/**
 * 测试MCP探索我们自建的员工管理网站
 * 演示完整的发现->识别->操作流程
 */

import { chromium } from 'playwright';

async function testMCPWithOurSite() {
  console.log('🚀 开始测试MCP与自建网站的集成...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // === 阶段1: MCP探索网站首页 ===
    console.log('\n📍 阶段1: MCP探索网站首页');
    await page.goto('http://localhost:3000');
    
    const title = await page.title();
    const url = page.url();
    console.log(`✅ 页面标题: ${title}`);
    console.log(`✅ 当前URL: ${url}`);
    
    // 分析页面结构
    const links = await page.locator('a').allTextContents();
    const headings = await page.locator('h1, h2, h3').allTextContents();
    
    console.log(`✅ 发现的链接: ${links.join(', ')}`);
    console.log(`✅ 发现的标题: ${headings.join(', ')}`);
    
    // === 阶段2: MCP发现登录功能 ===
    console.log('\n🔗 阶段2: MCP发现并点击登录功能');
    const loginLink = page.locator('a[href="/login"]').first();
    await loginLink.click();
    console.log('✅ 成功点击登录链接');
    
    await page.waitForLoadState('networkidle');
    
    // === 阶段3: MCP分析登录页面结构 ===
    console.log('\n📸 阶段3: MCP分析登录页面');
    const loginTitle = await page.title();
    const loginUrl = page.url();
    
    console.log(`✅ 登录页面标题: ${loginTitle}`);
    console.log(`✅ 登录页面URL: ${loginUrl}`);
    
    // 发现表单字段
    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');
    const captchaField = page.locator('#captcha_answer');
    
    const hasUsername = await usernameField.count() > 0;
    const hasPassword = await passwordField.count() > 0;
    const hasCaptcha = await captchaField.count() > 0;
    
    console.log(`✅ 发现用户名字段: ${hasUsername}`);
    console.log(`✅ 发现密码字段: ${hasPassword}`);
    console.log(`✅ 发现验证码字段: ${hasCaptcha}`);
    
    // === 阶段4: 检测验证码类型 ===
    console.log('\n🤖 阶段4: AI检测验证码类型');
    const captchaText = await page.locator('.captcha-question').textContent();
    console.log(`✅ 验证码问题: ${captchaText}`);
    
    let captchaType = 'unknown';
    let captchaAnswer = '';
    
    if(captchaText.includes('=')) {
      captchaType = 'math';
      // 简单的数学题求解
      const mathMatch = captchaText.match(/(\d+)\s*([+\-*])\s*(\d+)/);
      if(mathMatch) {
        const num1 = parseInt(mathMatch[1]);
        const operator = mathMatch[2];
        const num2 = parseInt(mathMatch[3]);
        
        switch(operator) {
          case '+': captchaAnswer = (num1 + num2).toString(); break;
          case '-': captchaAnswer = (num1 - num2).toString(); break;
          case '*': captchaAnswer = (num1 * num2).toString(); break;
        }
        console.log(`🧮 数学验证码识别: ${num1} ${operator} ${num2} = ${captchaAnswer}`);
      }
    } else if(captchaText.includes('请点击')) {
      captchaType = 'chinese';
      // 提取目标中文字符
      const chineseMatch = captchaText.match(/请点击：(.+)/);
      if(chineseMatch) {
        captchaAnswer = chineseMatch[1];
        console.log(`🀄 中文验证码识别: 需要点击 "${captchaAnswer}"`);
        
        // 查找对应的选项
        const options = page.locator('.chinese-option');
        const optionCount = await options.count();
        
        for(let i = 0; i < optionCount; i++) {
          const optionText = await options.nth(i).textContent();
          if(optionText === captchaAnswer) {
            await options.nth(i).click();
            console.log(`✅ 成功点击中文选项: ${optionText}`);
            break;
          }
        }
      }
    } else {
      captchaType = 'text';
      // 简单的文本验证码
      const textMatch = captchaText.match(/：([A-Z0-9]+)/);
      if(textMatch) {
        captchaAnswer = textMatch[1];
        console.log(`🔤 文本验证码识别: ${captchaAnswer}`);
      }
    }
    
    // === 阶段5: MCP执行登录操作 ===
    console.log('\n⌨️ 阶段5: MCP执行登录操作');
    
    // 填写用户名和密码
    await usernameField.fill('admin');
    console.log('✅ 填写用户名: admin');
    
    await passwordField.fill('password');
    console.log('✅ 填写密码: password');
    
    // 填写验证码（如果不是中文点击类型）
    if(captchaType !== 'chinese' && captchaAnswer) {
      await captchaField.fill(captchaAnswer);
      console.log(`✅ 填写验证码: ${captchaAnswer}`);
    }
    
    // 点击登录按钮
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    console.log('✅ 点击登录按钮');
    
    await page.waitForLoadState('networkidle');
    
    // === 阶段6: 验证登录结果 ===
    console.log('\n🎯 阶段6: 验证登录结果');
    const currentUrl = page.url();
    const currentTitle = await page.title();
    
    if(currentUrl.includes('/dashboard')) {
      console.log('🎉 登录成功！进入员工管理页面');
      console.log(`✅ 当前页面: ${currentTitle}`);
      
      // === 阶段7: 探索员工管理功能 ===
      console.log('\n👥 阶段7: 探索员工管理功能');
      
      // 查找员工列表
      const employeeTable = page.locator('.employee-table');
      const hasTable = await employeeTable.count() > 0;
      console.log(`✅ 发现员工列表表格: ${hasTable}`);
      
      // 查找创建按钮
      const createBtn = page.locator('.create-btn');
      const hasCreateBtn = await createBtn.count() > 0;
      console.log(`✅ 发现创建员工按钮: ${hasCreateBtn}`);
      
      if(hasCreateBtn) {
        await createBtn.click();
        console.log('✅ 点击创建员工按钮');
        
        await page.waitForLoadState('networkidle');
        
        // === 阶段8: 测试员工创建表单 ===
        console.log('\n📝 阶段8: 测试员工创建表单');
        const formTitle = await page.title();
        console.log(`✅ 表单页面标题: ${formTitle}`);
        
        // 填写员工信息（这就是您论文要展示的MCP能力）
        await page.fill('#name', 'Michael Chen');
        console.log('✅ 填写姓名: Michael Chen');
        
        await page.fill('#salary', '180000');
        console.log('✅ 填写薪资: 180000');
        
        await page.fill('#duration', '3年');
        console.log('✅ 填写工作时长: 3年');
        
        await page.selectOption('#grade', 'cLevel');
        console.log('✅ 选择职级: cLevel');
        
        await page.fill('#email', 'michael.chen@company.com');
        console.log('✅ 填写邮箱: michael.chen@company.com');
        
        // 提交表单
        const submitBtn = page.locator('.submit-btn');
        await submitBtn.click();
        console.log('✅ 提交员工信息');
        
        await page.waitForLoadState('networkidle');
      }
    } else {
      console.log('❌ 登录失败，可能验证码识别有误');
    }
    
    // === 阶段9: 截图保存证据 ===
    console.log('\n📷 阶段9: 保存测试证据');
    await page.screenshot({ 
      path: 'mcp-integration-test-result.png',
      fullPage: true 
    });
    console.log('✅ 测试结果截图已保存');
    
    // === 阶段10: 生成测试代码 ===
    console.log('\n📝 阶段10: 生成对应的Playwright测试代码');
    const generatedCode = `
// 基于MCP探索自动生成的员工管理系统测试
import { test, expect } from '@playwright/test';

test('员工管理系统完整流程测试', async ({ page }) => {
  // 1. 导航到首页
  await page.goto('http://localhost:3000');
  
  // 2. 点击登录链接
  await page.click('a[href="/login"]');
  
  // 3. 填写登录信息
  await page.fill('#username', 'admin');
  await page.fill('#password', 'password');
  
  // 4. 处理验证码（需要AI识别模块）
  const captchaText = await page.textContent('.captcha-question');
  const captchaAnswer = await solveCaptcha(captchaText); // 调用AI识别
  
  if(captchaText.includes('请点击')) {
    // 中文点击验证码
    await page.click(\`.chinese-option:has-text("\${captchaAnswer}")\`);
  } else {
    // 数学或文本验证码
    await page.fill('#captcha_answer', captchaAnswer);
  }
  
  // 5. 提交登录
  await page.click('button[type="submit"]');
  
  // 6. 验证登录成功
  await expect(page).toHaveURL(/dashboard/);
  
  // 7. 创建新员工
  await page.click('.create-btn');
  await page.fill('#name', 'Michael Chen');
  await page.fill('#salary', '180000');
  await page.fill('#duration', '3年');
  await page.selectOption('#grade', 'cLevel');
  await page.fill('#email', 'michael.chen@company.com');
  
  // 8. 提交员工信息
  await page.click('.submit-btn');
  
  // 9. 验证创建成功
  await expect(page).toHaveURL(/dashboard/);
});

// AI验证码识别函数（集成您的现有系统）
async function solveCaptcha(captchaText) {
  // 这里调用您在playwright/目录下的AI识别系统
  const { VisualAIDetector } = require('../playwright/visual-ai-detector.js');
  const detector = new VisualAIDetector();
  return await detector.recognizeCaptcha(captchaText);
}`;
    
    console.log(generatedCode);
    
    console.log('\n⏰ 测试完成，5秒后关闭浏览器...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ MCP集成测试完成！');
  }
}

// 运行测试
testMCPWithOurSite().catch(console.error);