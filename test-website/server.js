const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// 中间件配置
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'mcp-ai-captcha-demo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 模拟员工数据库
let employees = [
  { 
    id: 1, 
    name: 'John Smith', 
    salary: 150000, 
    duration: '3年', 
    grade: 'manager', 
    email: 'john.smith@company.com' 
  },
  { 
    id: 2, 
    name: 'Sarah Chen', 
    salary: 200000, 
    duration: '5年', 
    grade: 'cLevel', 
    email: 'sarah.chen@company.com' 
  }
];

// 模拟用户数据
const users = {
  'admin': { password: 'password', role: 'administrator' },
  'user': { password: '123456', role: 'user' }
};

// 生成验证码的函数
function generateCaptcha() {
  const types = ['math', 'chinese', 'text'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  switch(type) {
    case 'math':
      const num1 = Math.floor(Math.random() * 20) + 1;
      const num2 = Math.floor(Math.random() * 20) + 1;
      const operators = ['+', '-', '*'];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      
      let answer;
      switch(operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = Math.max(num1, num2) - Math.min(num1, num2); break;
        case '*': answer = num1 * num2; break;
      }
      
      return {
        type: 'math',
        question: `${Math.max(num1, num2)} ${operator} ${Math.min(num1, num2)} = ?`,
        answer: answer.toString()
      };
      
    case 'chinese':
      const chineseChars = ['加法', '减法', '乘法', '除法', '开始', '结束', '确认', '取消'];
      const targetChar = chineseChars[Math.floor(Math.random() * chineseChars.length)];
      const options = [targetChar];
      
      // 添加3个干扰项
      while(options.length < 4) {
        const randomChar = chineseChars[Math.floor(Math.random() * chineseChars.length)];
        if(!options.includes(randomChar)) {
          options.push(randomChar);
        }
      }
      
      // 打乱顺序
      options.sort(() => Math.random() - 0.5);
      
      return {
        type: 'chinese',
        question: `请点击：${targetChar}`,
        options: options,
        answer: targetChar
      };
      
    case 'text':
      const length = 4;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for(let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return {
        type: 'text',
        question: `请输入图片中的字符：${result}`,
        answer: result
      };
  }
}

// 路由定义

// 首页
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>员工管理系统 - MCP AI测试平台</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .nav { 
            background: white;
            padding: 20px; 
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .nav a { 
            color: #667eea; 
            text-decoration: none; 
            margin: 0 20px; 
            font-weight: bold;
            padding: 10px 15px;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .nav a:hover {
            background-color: #f0f0f0;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .feature-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏢 员工管理系统</h1>
        <p>基于 MCP 协议与 AI 验证码识别的智能测试平台</p>
    </div>
    
    <div class="nav">
        <a href="/">首页</a>
        <a href="/login">登录</a>
        ${req.session.user ? `
            <a href="/dashboard">员工管理</a>
            <a href="/logout">退出登录</a>
            <span style="color: #28a745; margin-left: 20px;">欢迎，${req.session.user}</span>
        ` : ''}
    </div>
    
    <div class="content">
        <h2>🎯 系统功能特性</h2>
        <div class="feature-list">
            <div class="feature-item">
                <h3>🔐 智能验证码</h3>
                <p>支持数学计算、中文字符、图像识别等多种验证码类型，测试AI识别能力</p>
            </div>
            <div class="feature-item">
                <h3>👥 员工管理</h3>
                <p>完整的CRUD操作，包含表单验证、数据持久化等真实业务场景</p>
            </div>
            <div class="feature-item">
                <h3>🤖 MCP协议</h3>
                <p>支持自然语言控制，自动发现网站功能，生成测试用例</p>
            </div>
            <div class="feature-item">
                <h3>📊 测试数据</h3>
                <p>完整的操作记录，支持性能分析和准确率统计</p>
            </div>
        </div>
        
        <h2>🚀 快速开始</h2>
        <p>1. 点击<a href="/login" style="color: #667eea;">登录</a>进入系统</p>
        <p>2. 使用账号：<strong>admin</strong> / 密码：<strong>password</strong></p>
        <p>3. 体验AI验证码识别和员工管理功能</p>
        
        <h2>🎓 毕业设计说明</h2>
        <p>本系统专为"基于Playwright MCP与Qwen-VL的Web验证码识别与自动化测试系统"毕业论文设计，
        演示了AI驱动的自动化测试技术在实际业务场景中的应用。</p>
    </div>
</body>
</html>
  `);
});

// 登录页面
app.get('/login', (req, res) => {
  if(req.session.user) {
    return res.redirect('/dashboard');
  }
  
  const captcha = generateCaptcha();
  req.session.captcha = captcha;
  
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>用户登录 - 员工管理系统</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 400px;
        }
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .login-header h2 {
            color: #333;
            margin-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: bold;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .captcha-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .captcha-question {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .chinese-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 15px;
        }
        .chinese-option {
            padding: 15px;
            background: white;
            border: 2px solid #ddd;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 16px;
        }
        .chinese-option:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        .chinese-option.selected {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s;
        }
        .login-btn:hover {
            transform: translateY(-2px);
        }
        .back-link {
            text-align: center;
            margin-top: 20px;
        }
        .back-link a {
            color: #667eea;
            text-decoration: none;
        }
        .error {
            color: #dc3545;
            background: #f8d7da;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h2>🔐 系统登录</h2>
            <p style="color: #666;">请输入您的登录凭据</p>
        </div>
        
        ${req.query.error ? '<div class="error">登录失败：用户名、密码或验证码错误</div>' : ''}
        
        <form action="/login" method="POST" id="loginForm">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" name="username" required placeholder="请输入用户名">
            </div>
            
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" name="password" required placeholder="请输入密码">
            </div>
            
            <div class="captcha-section">
                <div class="captcha-question">${captcha.question}</div>
                
                ${captcha.type === 'chinese' ? `
                    <div class="chinese-options">
                        ${captcha.options.map(option => `
                            <div class="chinese-option" onclick="selectChineseOption('${option}')">
                                ${option}
                            </div>
                        `).join('')}
                    </div>
                    <input type="hidden" id="captcha_answer" name="captcha_answer" required>
                ` : `
                    <input type="text" id="captcha_answer" name="captcha_answer" required 
                           placeholder="请输入答案" style="margin-top: 10px;">
                `}
            </div>
            
            <button type="submit" class="login-btn">立即登录</button>
        </form>
        
        <div class="back-link">
            <a href="/">← 返回首页</a>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; font-size: 14px;">
            <strong>测试账号：</strong><br>
            用户名：admin<br>
            密码：password
        </div>
    </div>
    
    <script>
        function selectChineseOption(option) {
            // 清除之前的选择
            document.querySelectorAll('.chinese-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 选中当前选项
            event.target.classList.add('selected');
            document.getElementById('captcha_answer').value = option;
        }
    </script>
</body>
</html>
  `);
});

// 处理登录
app.post('/login', (req, res) => {
  const { username, password, captcha_answer } = req.body;
  const sessionCaptcha = req.session.captcha;
  
  // 验证用户名密码和验证码
  if(users[username] && 
     users[username].password === password && 
     sessionCaptcha && 
     sessionCaptcha.answer === captcha_answer) {
    
    req.session.user = username;
    req.session.role = users[username].role;
    delete req.session.captcha; // 清除验证码
    
    res.redirect('/dashboard');
  } else {
    res.redirect('/login?error=1');
  }
});

// 员工管理主页
app.get('/dashboard', (req, res) => {
  if(!req.session.user) {
    return res.redirect('/login');
  }
  
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>员工管理 - 员工管理系统</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .nav { 
            background: white;
            padding: 20px; 
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .nav a { 
            color: #667eea; 
            text-decoration: none; 
            margin: 0 20px; 
            font-weight: bold;
            padding: 10px 15px;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .nav a:hover {
            background-color: #f0f0f0;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .create-btn {
            background: #28a745;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin-bottom: 20px;
            display: inline-block;
            transition: background-color 0.3s;
        }
        .create-btn:hover {
            background: #218838;
        }
        .employee-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .employee-table th,
        .employee-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .employee-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        .employee-table tr:hover {
            background-color: #f5f5f5;
        }
        .action-btn {
            padding: 6px 12px;
            margin: 0 3px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: bold;
        }
        .edit-btn {
            background: #007bff;
            color: white;
        }
        .delete-btn {
            background: #dc3545;
            color: white;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-number {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>👥 员工管理系统</h1>
        <p>欢迎回来，${req.session.user}！</p>
    </div>
    
    <div class="nav">
        <a href="/">首页</a>
        <a href="/dashboard">员工管理</a>
        <a href="/logout">退出登录</a>
    </div>
    
    <div class="content">
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${employees.length}</div>
                <div>总员工数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length)}</div>
                <div>平均薪资</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${employees.filter(emp => emp.grade === 'cLevel').length}</div>
                <div>高管人数</div>
            </div>
        </div>
        
        <h2>员工列表</h2>
        <a href="/employee/create" class="create-btn">+ 添加新员工</a>
        
        <table class="employee-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>姓名</th>
                    <th>薪资</th>
                    <th>工作时长</th>
                    <th>级别</th>
                    <th>邮箱</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${employees.map(emp => `
                    <tr>
                        <td>${emp.id}</td>
                        <td>${emp.name}</td>
                        <td>¥${emp.salary.toLocaleString()}</td>
                        <td>${emp.duration}</td>
                        <td>${emp.grade}</td>
                        <td>${emp.email}</td>
                        <td>
                            <a href="/employee/edit/${emp.id}" class="action-btn edit-btn">编辑</a>
                            <a href="/employee/delete/${emp.id}" class="action-btn delete-btn" 
                               onclick="return confirm('确定要删除这个员工吗？')">删除</a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `);
});

// 创建员工页面
app.get('/employee/create', (req, res) => {
  if(!req.session.user) {
    return res.redirect('/login');
  }
  
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>添加员工 - 员工管理系统</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .form-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 25px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: bold;
        }
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-group small {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
            display: block;
        }
        .submit-btn {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s;
            margin-right: 15px;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
        }
        .cancel-btn {
            background: #6c757d;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .cancel-btn:hover {
            background: #545b62;
        }
        .error {
            color: #dc3545;
            background: #f8d7da;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>➕ 添加新员工</h1>
        <p>请填写员工基本信息</p>
    </div>
    
    <div class="form-container">
        ${req.query.error ? '<div class="error">请检查输入信息：所有字段都是必填项，邮箱格式需正确</div>' : ''}
        
        <form action="/employee/create" method="POST" id="createForm">
            <div class="form-group">
                <label for="name">员工姓名 *</label>
                <input type="text" id="name" name="name" required placeholder="请输入员工姓名">
                <small>例如：张三、Michael Chen</small>
            </div>
            
            <div class="form-group">
                <label for="salary">薪资 *</label>
                <input type="number" id="salary" name="salary" required min="1000" max="1000000" 
                       placeholder="请输入年薪金额">
                <small>请输入年薪，范围：1,000 - 1,000,000</small>
            </div>
            
            <div class="form-group">
                <label for="duration">工作时长 *</label>
                <input type="text" id="duration" name="duration" required placeholder="请输入工作经验">
                <small>例如：2年、3年6个月、应届毕业生</small>
            </div>
            
            <div class="form-group">
                <label for="grade">职级 *</label>
                <select id="grade" name="grade" required>
                    <option value="">请选择职级</option>
                    <option value="intern">实习生</option>
                    <option value="junior">初级员工</option>
                    <option value="senior">高级员工</option>
                    <option value="manager">经理</option>
                    <option value="cLevel">高管</option>
                </select>
                <small>请根据员工实际职位选择对应级别</small>
            </div>
            
            <div class="form-group">
                <label for="email">邮箱地址 *</label>
                <input type="email" id="email" name="email" required placeholder="请输入邮箱地址">
                <small>例如：zhangsan@company.com</small>
            </div>
            
            <div style="margin-top: 40px;">
                <button type="submit" class="submit-btn">保存员工信息</button>
                <a href="/dashboard" class="cancel-btn">取消</a>
            </div>
        </form>
    </div>
    
    <script>
        // 表单验证
        document.getElementById('createForm').addEventListener('submit', function(e) {
            const salaryValue = document.getElementById('salary').value;
            const emailInput = document.getElementById('email');
            const rawEmail = emailInput.value || '';
            const normalizedEmail = rawEmail.trim().toLowerCase();
            emailInput.value = normalizedEmail; // 规范化输入，避免因空格/大小写导致校验失败
            
            const salary = Number(salaryValue);
            if(Number.isNaN(salary) || salary < 1000 || salary > 1000000) {
                alert('薪资范围应在 1,000 到 1,000,000 之间');
                e.preventDefault();
                return false;
            }
            
            // 使用浏览器内置校验，避免与后端规则重复/不一致
            if(!emailInput.checkValidity()) {
                alert('请输入有效的邮箱地址');
                e.preventDefault();
                return false;
            }
        });
    </script>
</body>
</html>
  `);
});

// 处理创建员工
app.post('/employee/create', (req, res) => {
  if(!req.session.user) {
    return res.redirect('/login');
  }
  
  const { name, salary, duration, grade, email } = req.body;
  const normalizedName = (name || '').trim();
  const normalizedDuration = (duration || '').trim();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedSalary = Number(salary);
  
  // 兼容前端可能传入的中文职级，做一次标准化映射
  const gradeMap = {
    '实习生': 'intern',
    '初级员工': 'junior',
    '高级员工': 'senior',
    '经理': 'manager',
    '高管': 'cLevel'
  };
  const normalizedGrade = gradeMap[grade] || grade; // 若已是英文值则保持不变
  
  // 简单验证
  if(!normalizedName || Number.isNaN(normalizedSalary) || !normalizedDuration || !normalizedGrade || !normalizedEmail) {
    return res.redirect('/employee/create?error=1');
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if(!emailRegex.test(normalizedEmail)) {
    return res.redirect('/employee/create?error=1');
  }
  
  // 创建新员工
  const newEmployee = {
    id: employees.length + 1,
    name: normalizedName,
    salary: Math.trunc(normalizedSalary),
    duration: normalizedDuration,
    grade: normalizedGrade,
    email: normalizedEmail
  };
  
  employees.push(newEmployee);
  
  res.redirect('/dashboard?success=created');
});

// 退出登录
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/?message=logout');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 员工管理系统启动成功！`);
  console.log(`📱 访问地址: http://localhost:${PORT}`);
  console.log(`🔐 测试账号: admin / password`);
  console.log(`🎯 用于MCP与AI验证码识别集成演示`);
});

module.exports = app;