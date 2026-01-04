const { spawn } = require('child_process');
const { EOL } = require('os');

class SimpleMCPClient {
  constructor() {
    this.messageId = 1;
    this.server = null;
    this.pendingRequests = new Map();
  }

  async start() {
    console.log('🚀 启动 MCP 服务器...');
    
    this.server = spawn('npx', ['@playwright/mcp@latest'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.server.stdout.on('data', (data) => {
      const lines = data.toString().split(EOL);
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id && this.pendingRequests.has(response.id)) {
              const { resolve, reject } = this.pendingRequests.get(response.id);
              this.pendingRequests.delete(response.id);
              
              if (response.error) {
                reject(new Error(response.error.message));
              } else {
                resolve(response.result);
              }
            }
          } catch (e) {
            // 忽略非JSON行
          }
        }
      }
    });

    this.server.stderr.on('data', (data) => {
      console.error('MCP 服务器错误:', data.toString());
    });

    // 初始化握手
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: 'employee-creator',
        version: '1.0.0',
      },
    });

    await this.sendRequest('initialized', {});
    console.log('✅ MCP 服务器启动成功！');
  }

  async sendRequest(method, params) {
    const id = this.messageId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const requestLine = JSON.stringify(request) + EOL;
      this.server.stdin.write(requestLine);
      
      // 超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('请求超时'));
        }
      }, 10000);
    });
  }

  async callTool(name, args) {
    return await this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
  }

  async close() {
    if (this.server) {
      this.server.kill();
    }
  }
}

async function createEmployees() {
  const client = new SimpleMCPClient();
  
  try {
    await client.start();
    
    const employees = [
      {
        name: '张三',
        position: '软件工程师',
        salary: '75000',
        duration: '24',
        grade: 'Senior',
        email: 'zhang.san@company.com'
      },
      {
        name: '李四',
        position: '产品经理',
        salary: '90000',
        duration: '36',
        grade: 'Middle',
        email: 'li.si@company.com'
      },
      {
        name: '王五',
        position: 'UI设计师',
        salary: '65000',
        duration: '18',
        grade: 'Junior',
        email: 'wang.wu@company.com'
      }
    ];

    console.log('🔐 开始登录过程...');
    
    // 1. 导航到网站
    await client.callTool('browser_navigate', {
      url: 'http://eaapp.somee.com'
    });
    
    // 2. 等待页面加载
    await client.callTool('browser_wait_for', { time: 3 });
    
    // 3. 获取页面快照以查看元素
    const snapshot = await client.callTool('browser_snapshot', {});
    console.log('页面快照获取成功');
    
    // 4. 输入用户名
    await client.callTool('browser_type', {
      element: '用户名输入框',
      ref: 'input[name="UserName"]',
      text: 'admin'
    });
    
    // 5. 输入密码
    await client.callTool('browser_type', {
      element: '密码输入框',
      ref: 'input[name="Password"]',
      text: 'password'
    });
    
    // 6. 点击登录按钮
    await client.callTool('browser_click', {
      element: '登录按钮',
      ref: 'input[type="submit"]'
    });
    
    // 7. 等待登录完成
    await client.callTool('browser_wait_for', { time: 5 });
    
    console.log('✅ 登录成功！开始创建员工...');
    
    // 8. 创建每个员工
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      console.log(`👤 创建员工 ${i + 1}: ${employee.name} (${employee.position})`);
      
      // 点击创建新员工按钮
      await client.callTool('browser_click', {
        element: '创建新员工按钮',
        ref: 'a[href*="Create"]'
      });
      
      // 等待表单加载
      await client.callTool('browser_wait_for', { time: 2 });
      
      // 填写员工信息
      await client.callTool('browser_type', {
        element: '姓名输入框',
        ref: 'input[name="Name"]',
        text: employee.name
      });
      
      await client.callTool('browser_type', {
        element: '薪水输入框',
        ref: 'input[name="Salary"]',
        text: employee.salary
      });
      
      await client.callTool('browser_type', {
        element: '工作时长输入框',
        ref: 'input[name="DurationWorked"]',
        text: employee.duration
      });
      
      await client.callTool('browser_type', {
        element: '级别输入框',
        ref: 'input[name="Grade"]',
        text: employee.grade
      });
      
      await client.callTool('browser_type', {
        element: '邮箱输入框',
        ref: 'input[name="Email"]',
        text: employee.email
      });
      
      // 提交表单
      await client.callTool('browser_click', {
        element: '提交按钮',
        ref: 'input[type="submit"]'
      });
      
      // 等待页面跳转
      await client.callTool('browser_wait_for', { time: 3 });
      
      console.log(`✅ 员工 ${employee.name} 创建成功！`);
    }
    
    console.log('🎉 所有员工创建完成！');
    
    // 9. 截图保存结果
    await client.callTool('browser_take_screenshot', {
      filename: 'employees-created-final.png'
    });
    
    console.log('📸 结果截图已保存！');
    
  } catch (error) {
    console.error('❌ 错误:', error);
    
    // 出错时也截图
    try {
      await client.callTool('browser_take_screenshot', {
        filename: 'error-screenshot.png'
      });
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError);
    }
  } finally {
    await client.close();
  }
}

// 运行主函数
createEmployees();