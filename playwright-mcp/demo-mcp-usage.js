/**
 * MCP Playwright 演示脚本
 * 展示如何使用MCP工具来操作网站
 */

import { createConnection } from './index.js';

async function demonstrateMCP() {
  console.log('🚀 启动MCP演示...');
  
  try {
    // 创建MCP连接
    const connection = await createConnection({
      browser: {
        launchOptions: {
          headless: false, // 显示浏览器界面
          slowMo: 1000     // 慢动作演示
        }
      }
    });

    console.log('✅ MCP连接已建立');

    // 演示1: 导航到网站
    console.log('\n📍 演示1: 导航到EA Employee App');
    const navigateResult = await connection.server.request({
      method: 'tools/call',
      params: {
        name: 'browser_navigate',
        arguments: {
          url: 'http://eaapp.somee.com'
        }
      }
    });
    
    console.log('导航结果:', navigateResult.result?.content?.[0]?.text || '导航完成');

    // 演示2: 获取页面快照
    console.log('\n📸 演示2: 获取页面结构');
    const snapshotResult = await connection.server.request({
      method: 'tools/call',
      params: {
        name: 'browser_snapshot',
        arguments: {}
      }
    });
    
    console.log('页面快照:', snapshotResult.result?.content?.[0]?.text?.substring(0, 500) + '...');

    // 演示3: 点击登录链接
    console.log('\n🔗 演示3: 查找并点击登录链接');
    
    // 先等待一下页面加载
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const clickResult = await connection.server.request({
      method: 'tools/call',
      params: {
        name: 'browser_click',
        arguments: {
          element: 'Login link',
          ref: 'login'  // 这里需要根据实际的页面快照来调整
        }
      }
    });
    
    console.log('点击结果:', clickResult.result?.content?.[0]?.text || '点击完成');

    // 演示4: 截图
    console.log('\n📷 演示4: 截取当前页面');
    const screenshotResult = await connection.server.request({
      method: 'tools/call',
      params: {
        name: 'browser_take_screenshot',
        arguments: {
          filename: 'mcp-demo-screenshot.png'
        }
      }
    });
    
    console.log('截图结果:', screenshotResult.result?.content?.[0]?.text || '截图完成');

    // 等待一下让用户看到效果
    console.log('\n⏰ 等待5秒钟以观察浏览器状态...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 关闭浏览器
    console.log('\n🔚 关闭浏览器');
    await connection.server.request({
      method: 'tools/call',
      params: {
        name: 'browser_close',
        arguments: {}
      }
    });

    console.log('✅ MCP演示完成！');

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行演示
demonstrateMCP().catch(console.error);