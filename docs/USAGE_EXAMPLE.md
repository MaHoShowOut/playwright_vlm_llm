# Claude Code + Playwright MCP 使用示例

## 完整的使用流程演示

### 1. 环境准备

首先确保您的系统已经安装了必要的工具：

```bash
# 检查环境
./test-environment.sh
```

预期输出：
```
🔍 Claude Code + Playwright MCP 环境检查
==================================================
1. 检查Claude Code...
✅ Claude Code已安装
1.0.51 (Claude Code)

2. 检查Node.js...
✅ Node.js已安装
版本: v24.3.0

3. 检查npm...
✅ npm已安装
版本: 11.4.2

4. 检查配置文件...
⚠️  配置文件不存在，将在首次运行时创建

5. 检查网络连接...
✅ 目标网站可访问: http://eaapp.somee.com

6. 测试Playwright MCP...
✅ Playwright MCP可用
```

### 2. 配置权限

脚本会自动创建配置文件 `~/.config/claude-code/settings.local.json`：

```json
{
  "permissions": {
    "allow": [
      "mcp__playwright__browser_navigate",
      "mcp__playwright__browser_click",
      "mcp__playwright__browser_type",
      "mcp__playwright__browser_snapshot",
      "mcp__playwright__browser_select_option",
      "mcp__playwright__browser_take_screenshot"
    ],
    "deny": []
  }
}
```

### 3. 启动MCP服务器

在**第一个终端**中启动MCP服务器：

```bash
# 方法1：使用一键启动脚本
./start-automation.sh
# 选择选项3：仅启动MCP服务器

# 方法2：直接运行MCP服务器
./start-mcp-server.sh
```

预期输出：
```
🚀 启动Playwright MCP服务器...
启动命令: npx @playwright/mcp@latest
Starting Playwright MCP server...
Server running on port 3000
Waiting for connections...
```

### 4. 运行自动化任务

在**第二个终端**中运行自动化任务：

```bash
# 方法1：使用一键启动脚本
./start-automation.sh
# 选择选项2：运行自动化任务

# 方法2：直接运行自动化脚本
./run-automation.sh
```

### 5. 执行流程演示

当您运行自动化任务后，系统会执行以下步骤：

#### 步骤1：环境检查和准备
```
🤖 Claude Code + Playwright MCP 自动化脚本
============================================================
开始环境检查...
✅ Claude Code已安装
✅ 配置文件已创建: ~/.config/claude-code/settings.local.json
✅ 自动化任务prompt已创建
✅ MCP服务器启动脚本已创建: start-mcp-server.sh
```

#### 步骤2：用户确认
```
============================================================
📋 使用说明:
1. 首先在另一个终端中运行MCP服务器:
   ./start-mcp-server.sh
2. 等待MCP服务器启动完成
3. 然后按回车键继续执行自动化任务
============================================================

按回车键继续...
```

#### 步骤3：Claude Code执行
```
🚀 开始执行自动化任务...
📝 调用Claude Code执行批量员工创建...
提示: 请确保已经启动了Playwright MCP服务器
执行命令: claude --file automation_prompt.txt
==================================================
```

#### 步骤4：自动化任务执行
Claude Code会开始执行自动化任务，您会看到类似以下的输出：

```
我将使用Playwright MCP工具执行完整的批量员工创建任务。

📋 创建任务清单:
1. 验证登录状态
2. 导航到员工创建页面
3. 创建员工1：张三
4. 验证员工1创建成功
5. 创建员工2：李四
6. 验证员工2创建成功
7. 创建员工3：王五
8. 验证员工3创建成功
9. 生成完整报告

🚀 开始执行任务...

✅ 已成功导航到 http://eaapp.somee.com
✅ 已成功登录（用户名：admin）
✅ 已导航到员工创建页面

📝 创建员工1：张三
- 输入姓名：张三
- 输入薪水：75000
- 输入工作时长：24
- 选择级别：Senior
- 输入邮箱：zhang.san@company.com
- 提交表单
✅ 员工1创建成功（ID: 65）

📝 创建员工2：李四
- 输入姓名：李四
- 输入薪水：90000
- 输入工作时长：36
- 选择级别：Middle
- 输入邮箱：li.si@company.com
- 提交表单
✅ 员工2创建成功（ID: 66）

📝 创建员工3：王五
- 输入姓名：王五
- 输入薪水：65000
- 输入工作时长：18
- 选择级别：Junior
- 输入邮箱：wang.wu@company.com
- 提交表单
✅ 员工3创建成功（ID: 67）

📊 执行结果报告：
==================================================
✅ 任务完成率：100% (3/3)
✅ 数据准确性：所有字段信息完全匹配
✅ 系统响应：所有操作均成功执行
✅ 验证通过：所有员工均出现在列表中

创建的员工详情：
1. 张三 (ID: 65) - Senior - 75,000 - zhang.san@company.com
2. 李四 (ID: 66) - Middle - 90,000 - li.si@company.com  
3. 王五 (ID: 67) - Junior - 65,000 - wang.wu@company.com

批量员工创建任务已完美完成！
```

#### 步骤5：任务完成
```
==================================================
✅ 自动化任务执行完成!
📊 任务已完成，请查看上方输出了解执行结果
🧹 临时文件已清理
🎉 所有任务执行完成!
```

## 实际演示截图

### MCP服务器运行状态
```
Terminal 1:
🚀 启动Playwright MCP服务器...
启动命令: npx @playwright/mcp@latest
Starting Playwright MCP server...
✅ Browser context created
✅ Server running on port 3000
📡 Waiting for connections...
🔗 Client connected from Claude Code
```

### 自动化任务执行
```
Terminal 2:
🤖 Claude Code + Playwright MCP 自动化脚本
============================================================
🚀 开始执行自动化任务...
📝 调用Claude Code执行批量员工创建...

[Claude Code 输出]
我将使用Playwright MCP工具执行批量员工创建任务...
✅ 已成功导航到 http://eaapp.somee.com
✅ 已成功登录
✅ 员工创建任务全部完成

📊 最终报告：
- 成功创建3个员工
- 所有数据验证通过
- 执行时间：约2分钟
```

## 常见问题排除

### Q1: MCP服务器无法启动
```bash
# 检查Node.js版本
node --version

# 清理npm缓存
npm cache clean --force

# 重新安装MCP包
npm install -g @playwright/mcp@latest
```

### Q2: Claude Code无法连接到MCP服务器
```bash
# 检查MCP服务器是否运行
netstat -an | grep 3000

# 检查配置文件权限
ls -la ~/.config/claude-code/settings.local.json
```

### Q3: 自动化任务执行失败
```bash
# 检查网络连接
ping eaapp.somee.com

# 检查Claude Code版本
claude --version

# 重新生成配置文件
rm ~/.config/claude-code/settings.local.json
./run-automation.sh
```

## 高级用法

### 自定义员工数据

编辑 `automation_prompt.txt` 文件来修改要创建的员工信息：

```
使用playwright MCP工具执行完整的批量员工创建任务：

1. 确保已登录到 http://eaapp.somee.com (admin/password)
2. 依次创建以下员工：

第一个员工：
- 姓名：自定义姓名
- 薪水：自定义薪水
- 工作时长：自定义时长
- 级别：自定义级别
- 邮箱：自定义邮箱
```

### 添加更多MCP权限

在 `settings.local.json` 中添加更多权限：

```json
{
  "permissions": {
    "allow": [
      "mcp__playwright__browser_navigate",
      "mcp__playwright__browser_click",
      "mcp__playwright__browser_type",
      "mcp__playwright__browser_snapshot",
      "mcp__playwright__browser_select_option",
      "mcp__playwright__browser_take_screenshot",
      "mcp__playwright__browser_wait_for",
      "mcp__playwright__browser_hover"
    ]
  }
}
```

## 性能优化建议

1. **并行执行**: 可以同时运行多个自动化任务
2. **缓存优化**: 保持MCP服务器运行以减少启动时间
3. **网络优化**: 确保稳定的网络连接
4. **资源管理**: 定期清理临时文件和缓存

## 总结

这个自动化脚本展示了如何将Claude Code与Playwright MCP结合使用，实现复杂的Web自动化任务。通过自然语言描述，可以轻松地执行批量数据操作，大大提高了工作效率。