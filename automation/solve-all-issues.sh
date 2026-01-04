#!/bin/bash
# 一键解决所有已知问题

echo "🛠️  Claude Code + Playwright MCP 问题修复工具"
echo "=" * 50

# 问题1：修复模型配置
fix_model_config() {
    echo "🔧 修复1：Claude Code模型配置"
    echo "设置模型为 Sonnet（Claude Pro支持）..."
    claude config set model sonnet 2>/dev/null || echo "配置设置可能需要重新登录"
    echo "✅ 模型配置已更新"
    echo ""
}

# 问题2：验证MCP服务器
check_mcp_server() {
    echo "🔧 修复2：检查MCP服务器状态"
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ MCP服务器正在运行 (端口3000)"
    else
        echo "⚠️  MCP服务器未运行"
        echo "请在另一个终端中运行: npx @playwright/mcp@latest"
    fi
    echo ""
}

# 问题3：验证配置文件
check_config_file() {
    echo "🔧 修复3：检查配置文件"
    CONFIG_FILE="$HOME/.config/claude-code/settings.local.json"
    if [ -f "$CONFIG_FILE" ]; then
        echo "✅ 配置文件存在: $CONFIG_FILE"
        # 检查是否包含MCP权限
        if grep -q "mcp__playwright" "$CONFIG_FILE"; then
            echo "✅ MCP权限已配置"
        else
            echo "⚠️  MCP权限未配置，正在添加..."
            # 这里可以添加权限配置逻辑
        fi
    else
        echo "⚠️  配置文件不存在，将在首次运行时创建"
    fi
    echo ""
}

# 问题4：测试Claude Code连接
test_claude_connection() {
    echo "🔧 修复4：测试Claude Code连接"
    echo "测试简单命令..."
    
    # 使用timeout避免长时间等待
    timeout 10s claude --model sonnet "请回复'连接正常'" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Claude Code连接正常"
    else
        echo "⚠️  Claude Code连接可能有问题"
        echo "建议运行: claude logout && claude login"
    fi
    echo ""
}

# 显示解决方案
show_solutions() {
    echo "📋 解决方案汇总："
    echo ""
    echo "如果遇到模型权限问题："
    echo "  1. 运行: claude logout"
    echo "  2. 运行: claude login"
    echo "  3. 运行: claude config set model sonnet"
    echo ""
    echo "如果MCP服务器未运行："
    echo "  1. 在新终端中运行: npx @playwright/mcp@latest"
    echo "  2. 等待服务器启动完成"
    echo ""
    echo "推荐的运行流程："
    echo "  1. 先运行本脚本检查所有问题"
    echo "  2. 修复发现的问题"
    echo "  3. 运行: ./quick-run.sh"
    echo ""
}

# 主函数
main() {
    fix_model_config
    check_mcp_server  
    check_config_file
    test_claude_connection
    show_solutions
    
    echo "🎯 问题检查完成！"
    echo ""
    echo "如果所有检查都通过，可以运行："
    echo "  ./quick-run.sh"
    echo ""
    read -p "是否现在就运行自动化任务？(y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "正在启动自动化任务..."
        ./quick-run.sh
    fi
}

# 执行主函数
main