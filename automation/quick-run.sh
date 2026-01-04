#!/bin/bash
# 快速运行自动化任务脚本 - 修复版本

echo "🚀 快速启动自动化任务"
echo "=" * 40

# 检查MCP服务器是否在运行
check_mcp_server() {
    # 在沙箱环境中暂时跳过MCP服务器检查
    echo "✅ MCP服务器检查已跳过（沙箱环境）"
    return 0
}

# 直接运行自动化任务
run_direct() {
    echo "📝 直接调用Claude Code执行自动化任务..."
    
    # 定义自动化任务
    AUTOMATION_TASK="使用playwright MCP工具执行完整的批量员工创建任务：

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

每创建一个员工后都要验证成功，最后提供完整的创建结果报告。"

    echo "🎯 开始执行自动化任务..."
    echo ""
    
    # 直接运行Claude Code，使用MCP工具
    claude "$AUTOMATION_TASK"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 自动化任务执行完成!"
    else
        echo ""
        echo "❌ 自动化任务执行失败"
        exit 1
    fi
}

# 主函数
main() {
    # 检查MCP服务器状态（已跳过）
    check_mcp_server

    echo ""
    echo "准备执行自动化任务..."
    echo "任务内容：批量创建3个员工（张三、李四、王五）"
    echo ""

    echo "自动开始执行..."
    run_direct

    echo ""
    echo "🎉 任务完成!"
}

# 执行主函数
main