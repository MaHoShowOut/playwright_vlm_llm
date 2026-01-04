/**
 * 简单的MCP功能演示
 * 展示MCP的核心工具能力
 */

import { createConnection } from './index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function simpleMCPDemo() {
  console.log('🚀 开始MCP功能演示...');
  
  try {
    // 创建连接
    const connection = await createConnection({
      browser: {
        launchOptions: {
          headless: false
        }
      }
    });

    // 创建transport并连接
    const transport = new StdioServerTransport();
    await connection.server.connect(transport);

    console.log('✅ MCP服务器已启动并连接');
    console.log('📋 可用的工具:');
    
    // 列出可用工具
    const tools = await connection.server.listTools();
    tools.tools?.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
    });

    console.log('\n🎯 现在您可以在Claude App中使用这些MCP工具了！');
    console.log('例如可以说："请访问 http://eaapp.somee.com 并截图"');
    
    // 保持服务器运行
    process.on('SIGINT', async () => {
      console.log('\n👋 正在关闭MCP服务器...');
      process.exit(0);
    });

    // 保持进程运行
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行演示
simpleMCPDemo().catch(console.error);