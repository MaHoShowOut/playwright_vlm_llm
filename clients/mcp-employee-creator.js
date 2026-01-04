const http = require('http');

// MCP服务器配置
const MCP_HOST = 'localhost';
const MCP_PORT = 3001;

// 员工数据
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

// 发送MCP请求的函数
function sendMCPRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: method,
      params: params
    });

    const options = {
      hostname: MCP_HOST,
      port: MCP_PORT,
      path: '/sse',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Accept': 'application/json, text/event-stream'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function createEmployees() {
  try {
    console.log('🚀 开始导航到员工管理系统...');
    
    // 1. 导航到网站
    await sendMCPRequest('tools/call', {
      name: 'browser_navigate',
      arguments: {
        url: 'http://eaapp.somee.com'
      }
    });
    
    console.log('📸 获取页面快照...');
    
    // 2. 获取页面快照
    const snapshot = await sendMCPRequest('tools/call', {
      name: 'browser_snapshot',
      arguments: {}
    });
    
    console.log('🔐 开始登录...');
    
    // 3. 输入用户名
    await sendMCPRequest('tools/call', {
      name: 'browser_type',
      arguments: {
        element: '用户名输入框',
        ref: 'input[name="UserName"]',
        text: 'admin'
      }
    });
    
    // 4. 输入密码
    await sendMCPRequest('tools/call', {
      name: 'browser_type',
      arguments: {
        element: '密码输入框',
        ref: 'input[name="Password"]',
        text: 'password'
      }
    });
    
    // 5. 点击登录按钮
    await sendMCPRequest('tools/call', {
      name: 'browser_click',
      arguments: {
        element: '登录按钮',
        ref: 'input[type="submit"]'
      }
    });
    
    console.log('✅ 登录成功！开始创建员工...');
    
    // 6. 为每个员工创建记录
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      console.log(`👤 创建员工 ${i + 1}: ${employee.name} (${employee.position})`);
      
      // 点击创建新员工按钮
      await sendMCPRequest('tools/call', {
        name: 'browser_click',
        arguments: {
          element: '创建新员工按钮',
          ref: 'text=Create New'
        }
      });
      
      // 等待表单加载
      await sendMCPRequest('tools/call', {
        name: 'browser_wait_for',
        arguments: {
          time: 2
        }
      });
      
      // 填写员工信息
      await sendMCPRequest('tools/call', {
        name: 'browser_type',
        arguments: {
          element: '姓名输入框',
          ref: 'input[name="Name"]',
          text: employee.name
        }
      });
      
      await sendMCPRequest('tools/call', {
        name: 'browser_type',
        arguments: {
          element: '薪水输入框',
          ref: 'input[name="Salary"]',
          text: employee.salary
        }
      });
      
      await sendMCPRequest('tools/call', {
        name: 'browser_type',
        arguments: {
          element: '工作时长输入框',
          ref: 'input[name="DurationWorked"]',
          text: employee.duration
        }
      });
      
      await sendMCPRequest('tools/call', {
        name: 'browser_type',
        arguments: {
          element: '级别输入框',
          ref: 'input[name="Grade"]',
          text: employee.grade
        }
      });
      
      await sendMCPRequest('tools/call', {
        name: 'browser_type',
        arguments: {
          element: '邮箱输入框',
          ref: 'input[name="Email"]',
          text: employee.email
        }
      });
      
      // 提交表单
      await sendMCPRequest('tools/call', {
        name: 'browser_click',
        arguments: {
          element: '提交按钮',
          ref: 'input[type="submit"]'
        }
      });
      
      // 等待页面跳转
      await sendMCPRequest('tools/call', {
        name: 'browser_wait_for',
        arguments: {
          time: 3
        }
      });
      
      console.log(`✅ 员工 ${employee.name} 创建成功！`);
    }
    
    console.log('🎉 所有员工创建完成！');
    
    // 7. 截图保存结果
    await sendMCPRequest('tools/call', {
      name: 'browser_take_screenshot',
      arguments: {
        filename: 'employees-created-mcp.png'
      }
    });
    
    console.log('📸 结果截图已保存！');
    
  } catch (error) {
    console.error('❌ 错误:', error);
    
    // 出错时也截图
    try {
      await sendMCPRequest('tools/call', {
        name: 'browser_take_screenshot',
        arguments: {
          filename: 'error-screenshot-mcp.png'
        }
      });
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError);
    }
  }
}

// 运行主函数
createEmployees();