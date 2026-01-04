#!/bin/bash
# Claude Code + Playwright MCP 自动化脚本
# 用于执行批量员工创建任务

set -e

echo "🤖 Claude Code + Playwright MCP 自动化脚本"
echo "=" * 60

# 检查Claude Code是否安装
check_claude_code() {
    if ! command -v claude &> /dev/null; then
        echo "❌ Claude Code未安装，请先安装Claude Code"
        echo "安装地址: https://claude.ai/code"
        exit 1
    fi
    echo "✅ Claude Code已安装"
}

# 创建配置文件
create_settings() {
    SETTINGS_DIR="$HOME/.config/claude-code"
    SETTINGS_FILE="$SETTINGS_DIR/settings.local.json"

    if [ ! -f "$SETTINGS_FILE" ]; then
        echo "⚠️  创建Claude Code配置文件..."
        mkdir -p "$SETTINGS_DIR"

        cat > "$SETTINGS_FILE" << 'EOF'
{
  "mcpServers": {
    "playwright": {
      "command": "npm",
      "args": ["exec", "@playwright/mcp@latest", "--browser", "chrome", "--vision"]
    }
  },
  "permissions": {
    "allow": [
      "Bash(npm install:*)",
      "Bash(npx:*)",
      "Bash(mkdir:*)",
      "Bash(npm test:*)",
      "Bash(npm run test:debug:*)",
      "Bash(npm run test:headed:*)",
      "Bash(npm run test:report:*)",
      "Bash(node:*)",
      "Bash(timeout 60s npm run test:visual:headed)",
      "Bash(git init:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git checkout:*)",
      "Bash(rm:*)",
      "WebFetch(domain:)",
      "Bash(find:*)",
      "Bash(ls:*)",
      "Bash(export:*)",
      "Bash(DASHSCOPE_API_KEY=sk-f582ca48b59f40f5bc40db5558e9610b- npx playwright test tests/chinese-captcha-ai.spec.js:16 --headed --timeout=120000)",
      "Bash(DASHSCOPE_API_KEY=sk-f582ca48b59f40f5bc40db5558e9610b- npx playwright test tests/chinese-captcha-ai.spec.js --reporter=line)",
      "Bash(open:*)",
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
EOF
        echo "✅ 配置文件已创建: $SETTINGS_FILE"
    else
        echo "✅ 配置文件已存在: $SETTINGS_FILE"
    fi
}

# 创建自动化任务prompt
create_prompt() {
    cat > automation_prompt.txt << 'EOF'
使用playwright MCP工具执行完整的批量员工创建任务：

1. 确保已登录到 http://localhost:3000 (admin/password)
2. 依次创建以下员工：

第一个员工：
- 姓名：张三
- 薪水：75000
- 工作时长：24
- 级别：Senior
- 邮箱：zhang.san@company.com

第二个员工：
- 姓名：李四
- 薪水：90000
- 工作时长：36
- 级别：Middle
- 邮箱：li.si@company.com

第三个员工：
- 姓名：王五
- 薪水：65000
- 工作时长：18
- 级别：Junior
- 邮箱：wang.wu@company.com

每创建一个员工后都要验证成功，最后提供完整的创建结果报告。
EOF
    echo "✅ 自动化任务prompt已创建"
}

# 创建MCP服务器启动脚本
create_mcp_start_script() {
    cat > start-mcp-server.sh << 'EOF'
#!/bin/bash
echo "🚀 启动Playwright MCP服务器..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要安装Node.js"
    exit 1
fi

# 启动MCP服务器
echo "启动命令: npx @playwright/mcp@latest"
npx @playwright/mcp@latest
EOF
    chmod +x start-mcp-server.sh
    echo "✅ MCP服务器启动脚本已创建: start-mcp-server.sh"
}

# 运行自动化任务
run_automation() {
    echo "🚀 开始执行自动化任务..."
    echo "📝 调用Claude Code执行批量员工创建..."
    
    # 读取prompt内容
    PROMPT_CONTENT=$(cat automation_prompt.txt)
    
    # 使用Claude Code执行自动化任务，指定Sonnet模型
    if claude --model sonnet "$PROMPT_CONTENT"; then
        echo "✅ 自动化任务执行完成!"
        echo "📊 任务已完成，请查看上方输出了解执行结果"
    else
        echo "❌ 自动化任务执行失败"
        exit 1
    fi
}

# 清理临时文件
cleanup() {
    rm -f automation_prompt.txt
    echo "🧹 临时文件已清理"
}

# 主函数
main() {
    echo "开始环境检查..."
    check_claude_code
    create_settings
    create_prompt
    create_mcp_start_script
    
    echo ""
    echo "=" * 60
    echo "📋 使用说明:"
    echo "1. 首先在另一个终端中运行MCP服务器:"
    echo "   ./start-mcp-server.sh"
    echo "2. 等待MCP服务器启动完成"
    echo "3. 然后按回车键继续执行自动化任务"
    echo "=" * 60
    echo ""
    
    read -p "按回车键继续..." -r
    
    run_automation
    
    # 设置清理函数在退出时执行
    trap cleanup EXIT
    
    echo "🎉 所有任务执行完成!"
}

# 执行主函数
main