#!/usr/bin/env node

/**
 * 直接运行的 MCP 客户端
 * 可以在命令行中直接执行批量员工创建任务
 */

const { spawn } = require('child_process');

class DirectMCPClient {
  constructor() {
    this.messageId = 1;
    this.server = null;
    this.pendingRequests = new Map();
  }

  async start() {
    console.log('🚀 启动直接 MCP 客户端...');
    
    // 启动 MCP 服务器
    this.server = spawn('npx', ['@playwright/mcp@latest'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    // 处理服务器输出
    this.server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            this.handleResponse(response);
          } catch (e) {
            // 忽略非JSON输出
            console.log('服务器输出:', line);
          }
        }
      }
    });

    this.server.stderr.on('data', (data) => {
      console.log('MCP 服务器日志:', data.toString());
    });

    this.server.on('close', (code) => {
      console.log(`MCP 服务器退出，代码: ${code}`);
    });

    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 初始化 MCP 连接
    await this.initialize();
    console.log('✅ MCP 客户端启动成功！');
  }

  async initialize() {
    try {
      // 发送初始化请求
      await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'direct-employee-creator',
          version: '1.0.0'
        }
      });

      // 发送 initialized 通知
      await this.sendNotification('initialized', {});
      
    } catch (error) {
      console.error('初始化失败:', error);
      throw error;
    }
  }

  handleResponse(response) {
    if (response.id && this.pendingRequests.has(response.id)) {
      const { resolve, reject } = this.pendingRequests.get(response.id);
      this.pendingRequests.delete(response.id);
      
      if (response.error) {
        reject(new Error(response.error.message || '服务器错误'));
      } else {
        resolve(response.result);
      }
    }
  }

  async sendRequest(method, params) {
    const id = this.messageId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const requestLine = JSON.stringify(request) + '\n';
      this.server.stdin.write(requestLine);
      
      // 设置超时
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`请求超时: ${method}`));
        }
      }, 30000); // 30秒超时
    });
  }

  async sendNotification(method, params) {
    const notification = {
      jsonrpc: '2.0',
      method,
      params
    };

    const notificationLine = JSON.stringify(notification) + '\n';
    this.server.stdin.write(notificationLine);
  }

  async callTool(name, args) {
    try {
      const result = await this.sendRequest('tools/call', {
        name,
        arguments: args || {}
      });
      return result;
    } catch (error) {
      console.error(`工具调用失败 (${name}):`, error.message);
      throw error;
    }
  }

  async close() {
    if (this.server) {
      this.server.kill('SIGTERM');
      
      // 等待进程结束
      await new Promise(resolve => {
        this.server.on('close', resolve);
        setTimeout(resolve, 5000); // 最多等待5秒
      });
    }
  }
}

// 批量创建员工的主要逻辑
async function createEmployees() {
  const client = new DirectMCPClient();
  
  try {
    await client.start();
    
    // 定义要创建的员工数据
    const employees = [
      {
        name: '张三',
        salary: '75000',
        duration: '24',
        grade: 'Senior',
        email: 'zhang.san@company.com'
      },
      {
        name: '李四',
        salary: '90000',
        duration: '36',
        grade: 'Middle',
        email: 'li.si@company.com'
      },
      {
        name: '王五',
        salary: '65000',
        duration: '18',
        grade: 'Junior',
        email: 'wang.wu@company.com'
      }
    ];

    console.log('\n🌐 步骤 1: 导航到员工管理系统...');
    await client.callTool('browser_navigate', {
      url: 'http://eaapp.somee.com'
    });
    console.log('✅ 导航完成');

    console.log('\n📸 步骤 2: 获取页面快照...');
    await client.callTool('browser_snapshot', {});
    console.log('✅ 快照获取完成');

    console.log('\n🔐 步骤 3: 开始登录流程...');
    
    // 查找并点击登录链接
    try {
      await client.callTool('browser_click', {
        element: '登录链接',
        ref: 'text=Login'
      });
      console.log('✅ 点击登录链接成功');
    } catch (error) {
      console.log('⚠️ 直接查找登录表单...');
    }

    // 等待页面加载
    await client.callTool('browser_wait_for', { time: 2 });

    // 填写登录信息
    console.log('⌨️ 填写用户名...');
    await client.callTool('browser_type', {
      element: '用户名输入框',
      ref: 'input[name="UserName"]',
      text: 'admin'
    });

    console.log('⌨️ 填写密码...');
    await client.callTool('browser_type', {
      element: '密码输入框',
      ref: 'input[name="Password"]',
      text: 'password'
    });

    console.log('🔘 点击登录按钮...');
    await client.callTool('browser_click', {
      element: '登录按钮',
      ref: 'input[type="submit"]'
    });

    // 等待登录完成
    await client.callTool('browser_wait_for', { time: 5 });
    console.log('✅ 登录完成');

    console.log('\n👥 步骤 4: 开始批量创建员工...');

    // 循环创建每个员工
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      console.log(`\n📝 创建员工 ${i + 1}/${employees.length}: ${employee.name}`);

      try {
        // 点击创建新员工按钮
        console.log('🔗 点击"Create New"按钮...');
        await client.callTool('browser_click', {
          element: '创建新员工按钮',
          ref: 'text=Create New'
        });

        // 等待表单加载
        await client.callTool('browser_wait_for', { time: 3 });

        // 填写员工信息
        console.log(`⌨️ 填写姓名: ${employee.name}`);
        await client.callTool('browser_type', {
          element: '姓名输入框',
          ref: 'input[name="Name"]',
          text: employee.name
        });

        console.log(`⌨️ 填写薪水: ${employee.salary}`);
        await client.callTool('browser_type', {
          element: '薪水输入框',
          ref: 'input[name="Salary"]',
          text: employee.salary
        });

        console.log(`⌨️ 填写工作时长: ${employee.duration}`);
        await client.callTool('browser_type', {
          element: '工作时长输入框',
          ref: 'input[name="DurationWorked"]',
          text: employee.duration
        });

        console.log(`⌨️ 填写级别: ${employee.grade}`);
        await client.callTool('browser_type', {
          element: '级别输入框',
          ref: 'input[name="Grade"]',
          text: employee.grade
        });

        console.log(`⌨️ 填写邮箱: ${employee.email}`);
        await client.callTool('browser_type', {
          element: '邮箱输入框',
          ref: 'input[name="Email"]',
          text: employee.email
        });

        // 提交表单
        console.log('✅ 提交员工信息...');
        await client.callTool('browser_click', {
          element: '提交按钮',
          ref: 'input[type="submit"]'
        });

        // 等待页面跳转
        await client.callTool('browser_wait_for', { time: 3 });

        console.log(`✅ 员工 ${employee.name} 创建成功！`);

      } catch (error) {
        console.error(`❌ 创建员工 ${employee.name} 失败:`, error.message);
        
        // 截图保存错误状态
        await client.callTool('browser_take_screenshot', {
          filename: `error-employee-${i + 1}.png`
        });
      }
    }

    console.log('\n📸 步骤 5: 保存最终结果截图...');
    await client.callTool('browser_take_screenshot', {
      filename: 'employees-created-final.png'
    });

    console.log('\n🎉 所有员工创建完成！');
    console.log('✅ 结果截图已保存为: employees-created-final.png');

  } catch (error) {
    console.error('\n❌ 执行过程中出现错误:', error.message);
    
    // 尝试截图保存错误状态
    try {
      await client.callTool('browser_take_screenshot', {
        filename: 'final-error-state.png'
      });
      console.log('❌ 错误状态截图已保存');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError.message);
    }
  } finally {
    console.log('\n🔄 清理资源...');
    await client.close();
    console.log('✅ 客户端已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🚀 启动直接 MCP 员工创建任务...');
  console.log('========================================');
  
  createEmployees()
    .then(() => {
      console.log('\n✅ 任务执行完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 任务执行失败:', error);
      process.exit(1);
    });
}

module.exports = { DirectMCPClient, createEmployees };