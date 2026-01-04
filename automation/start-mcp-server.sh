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
