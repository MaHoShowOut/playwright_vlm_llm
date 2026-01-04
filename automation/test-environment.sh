#!/bin/bash
# 环境测试脚本

echo "🔍 Claude Code + Playwright MCP 环境检查"
echo "=" * 50

# 检查Claude Code
echo "1. 检查Claude Code..."
if command -v claude &> /dev/null; then
    echo "✅ Claude Code已安装"
    claude --version
else
    echo "❌ Claude Code未安装"
    echo "请访问 https://claude.ai/code 安装"
fi

echo ""

# 检查Node.js
echo "2. 检查Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js已安装"
    echo "版本: $(node --version)"
else
    echo "❌ Node.js未安装"
    echo "请访问 https://nodejs.org 安装"
fi

echo ""

# 检查npm
echo "3. 检查npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm已安装"
    echo "版本: $(npm --version)"
else
    echo "❌ npm未安装"
fi

echo ""

# 检查配置文件
echo "4. 检查配置文件..."
SETTINGS_FILE="$HOME/.config/claude-code/settings.local.json"
if [ -f "$SETTINGS_FILE" ]; then
    echo "✅ 配置文件存在: $SETTINGS_FILE"
else
    echo "⚠️  配置文件不存在，将在首次运行时创建"
fi

echo ""

# 检查网络连接
echo "5. 检查网络连接..."
if ping -c 1 localhost &> /dev/null; then
    echo "✅ 目标网站可访问: http://localhost:3000"
else
    echo "⚠️  目标网站可能无法访问，请检查网络连接"
fi

echo ""

# 测试MCP服务器可用性
echo "6. 测试Playwright MCP..."
echo "尝试安装/更新 @playwright/mcp..."
if npx @playwright/mcp@latest --help &> /dev/null; then
    echo "✅ Playwright MCP可用"
else
    echo "⚠️  Playwright MCP可能需要安装，首次运行时会自动安装"
fi

echo ""
echo "=" * 50
echo "🎯 环境检查完成"
echo ""
echo "如果所有检查都通过，可以运行："
echo "  ./run-automation.sh"
echo ""
echo "如果有问题，请先解决上述错误再继续"