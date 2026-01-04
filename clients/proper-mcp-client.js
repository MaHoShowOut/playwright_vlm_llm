import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class EmployeeCreator {
  constructor() {
    this.client = null;
    this.transport = null;
  }

  async start() {
    console.log('🚀 启动 MCP 客户端...');
    
    // 创建子进程
    const serverProcess = spawn('npx', ['@playwright/mcp@latest'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // 创建传输层
    this.transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin,
    });

    // 创建客户端
    this.client = new Client({
      name: 'employee-creator',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    // 连接到服务器
    await this.client.connect(this.transport);
    console.log('✅ MCP 客户端连接成功！');
  }

  async callTool(name, args) {
    if (!this.client) {
      throw new Error('客户端未连接');
    }

    const result = await this.client.callTool({
      name,
      arguments: args,
    });

    return result;
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
    if (this.transport) {
      await this.transport.close();
    }
  }
}

async function createEmployees() {
  const creator = new EmployeeCreator();
  
  try {
    await creator.start();
    
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
    await creator.callTool('browser_navigate', {
      url: 'http://eaapp.somee.com'
    });
    
    // 2. 等待页面加载
    await creator.callTool('browser_wait_for', { time: 3 });
    
    // 3. 获取页面快照
    const snapshot = await creator.callTool('browser_snapshot', {});
    console.log('页面快照获取成功');
    
    // 4. 输入用户名
    await creator.callTool('browser_type', {
      element: '用户名输入框',
      ref: 'input[name="UserName"]',
      text: 'admin'
    });
    
    // 5. 输入密码
    await creator.callTool('browser_type', {
      element: '密码输入框',
      ref: 'input[name="Password"]',
      text: 'password'
    });
    
    // 6. 点击登录按钮
    await creator.callTool('browser_click', {
      element: '登录按钮',
      ref: 'input[type="submit"]'
    });
    
    // 7. 等待登录完成
    await creator.callTool('browser_wait_for', { time: 5 });
    
    console.log('✅ 登录成功！开始创建员工...');
    
    // 8. 创建每个员工
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      console.log(`👤 创建员工 ${i + 1}: ${employee.name} (${employee.position})`);
      
      // 点击创建新员工按钮
      await creator.callTool('browser_click', {
        element: '创建新员工按钮',
        ref: 'a[href*="Create"]'
      });
      
      // 等待表单加载
      await creator.callTool('browser_wait_for', { time: 2 });
      
      // 填写员工信息
      await creator.callTool('browser_type', {
        element: '姓名输入框',
        ref: 'input[name="Name"]',
        text: employee.name
      });
      
      await creator.callTool('browser_type', {
        element: '薪水输入框',
        ref: 'input[name="Salary"]',
        text: employee.salary
      });
      
      await creator.callTool('browser_type', {
        element: '工作时长输入框',
        ref: 'input[name="DurationWorked"]',
        text: employee.duration
      });
      
      await creator.callTool('browser_type', {
        element: '级别输入框',
        ref: 'input[name="Grade"]',
        text: employee.grade
      });
      
      await creator.callTool('browser_type', {
        element: '邮箱输入框',
        ref: 'input[name="Email"]',
        text: employee.email
      });
      
      // 提交表单
      await creator.callTool('browser_click', {
        element: '提交按钮',
        ref: 'input[type="submit"]'
      });
      
      // 等待页面跳转
      await creator.callTool('browser_wait_for', { time: 3 });
      
      console.log(`✅ 员工 ${employee.name} 创建成功！`);
    }
    
    console.log('🎉 所有员工创建完成！');
    
    // 9. 截图保存结果
    await creator.callTool('browser_take_screenshot', {
      filename: 'employees-created-final.png'
    });
    
    console.log('📸 结果截图已保存！');
    
  } catch (error) {
    console.error('❌ 错误:', error);
    
    // 出错时也截图
    try {
      await creator.callTool('browser_take_screenshot', {
        filename: 'error-screenshot.png'
      });
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError);
    }
  } finally {
    await creator.close();
  }
}

// 运行主函数
createEmployees();