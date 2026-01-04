#!/bin/bash
# 一键启动自动化脚本

echo "🤖 Claude Code + Playwright MCP 一键启动脚本"
echo "=" * 60

# 显示菜单
show_menu() {
    echo ""
    echo "请选择要执行的操作："
    echo "1. 环境检查"
    echo "2. 运行自动化任务"
    echo "3. 仅启动MCP服务器"
    echo "4. 查看使用说明"
    echo "5. 退出"
    echo ""
}

# 环境检查
check_environment() {
    echo "🔍 正在检查环境..."
    ./test-environment.sh
    
    echo ""
    read -p "按回车键返回主菜单..." -r
}

# 运行自动化任务
run_automation() {
    echo "🚀 准备运行自动化任务..."
    echo ""
    echo "⚠️  重要提醒："
    echo "1. 请确保您已经阅读了使用说明"
    echo "2. 需要在另一个终端窗口中启动MCP服务器"
    echo "3. 确保网络连接正常"
    echo ""
    
    read -p "确认继续？(y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./run-automation.sh
    else
        echo "已取消执行"
    fi
    
    echo ""
    read -p "按回车键返回主菜单..." -r
}

# 启动MCP服务器
start_mcp_server() {
    echo "🚀 启动MCP服务器..."
    echo ""
    echo "这将启动Playwright MCP服务器，请保持此窗口打开"
    echo "在另一个终端中运行自动化任务"
    echo ""
    
    read -p "按回车键开始启动MCP服务器..." -r
    
    # 创建MCP服务器启动脚本（如果不存在）
    if [ ! -f "start-mcp-server.sh" ]; then
        cat > start-mcp-server.sh << 'EOF'
#!/bin/bash
echo "🚀 启动Playwright MCP服务器..."

if ! command -v node &> /dev/null; then
    echo "❌ 需要安装Node.js"
    exit 1
fi

echo "启动命令: npx @playwright/mcp@latest"
npx @playwright/mcp@latest
EOF
        chmod +x start-mcp-server.sh
    fi
    
    ./start-mcp-server.sh
}

# 显示使用说明
show_help() {
    echo "📖 使用说明"
    echo "=" * 40
    
    if [ -f "README-automation.md" ]; then
        echo "详细说明请查看: README-automation.md"
        echo ""
        echo "快速使用步骤："
        echo "1. 先运行环境检查"
        echo "2. 在一个终端中启动MCP服务器"
        echo "3. 在另一个终端中运行自动化任务"
        echo ""
        echo "自动化任务内容："
        echo "- 登录 http://localhost:3000"
        echo "- 批量创建3个员工（张三、李四、王五）"
        echo "- 验证创建结果"
        echo "- 生成执行报告"
    else
        echo "README-automation.md 文件不存在"
    fi
    
    echo ""
    read -p "按回车键返回主菜单..." -r
}

# 主循环
main() {
    while true; do
        show_menu
        read -p "请输入选项 (1-5): " choice
        
        case $choice in
            1)
                check_environment
                ;;
            2)
                run_automation
                ;;
            3)
                start_mcp_server
                ;;
            4)
                show_help
                ;;
            5)
                echo "👋 再见！"
                exit 0
                ;;
            *)
                echo "❌ 无效选项，请重新选择"
                sleep 1
                ;;
        esac
    done
}

# 检查必要文件
check_files() {
    local missing_files=()
    
    if [ ! -f "run-automation.sh" ]; then
        missing_files+=("run-automation.sh")
    fi
    
    if [ ! -f "test-environment.sh" ]; then
        missing_files+=("test-environment.sh")
    fi
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        echo "❌ 缺少必要文件："
        printf '%s\n' "${missing_files[@]}"
        echo ""
        echo "请确保所有脚本文件都在当前目录中"
        exit 1
    fi
}

# 启动
echo "正在初始化..."
check_files
main