#!/bin/bash

echo "🚀 测试 Claude Code + MCP 自然语言操作 - 10轮测试"
echo "=================================================="

# 统计变量
TOTAL_RUNS=5
SUCCESS_COUNT=0
FAILED_COUNT=0

# 创建日志文件
LOG_FILE="test_results_$(date +%Y%m%d_%H%M%S).log"
echo "测试开始时间: $(date)" > "$LOG_FILE"
echo "===========================================" >> "$LOG_FILE"

# 定义自然语言任务
TASK="使用 Playwright MCP 工具完成以下任务：

1. 导航到 http://localhost:3000
2. 使用 admin/password 登录系统
3. 创建一个新员工：
   - 姓名：测试员工$(date +%H%M%S)
   - 薪水：88000
   - 工作时长：30
   - 级别：Middle
   - 邮箱：test$(date +%H%M%S)@company.com
4. 验证创建成功并截图保存

请使用 Playwright MCP 工具完成所有操作，并提供详细的执行报告。"

echo "📝 将要执行的任务："
echo "$TASK"
echo ""
echo "🎯 开始进行 $TOTAL_RUNS 轮测试..."
echo ""

# 循环执行10次
for i in $(seq 1 $TOTAL_RUNS); do
    echo "=========================================="
    echo "🔄 第 $i/$TOTAL_RUNS 轮测试 - $(date +%H:%M:%S)"
    echo "=========================================="
    
    # 记录到日志文件
    echo "第 $i 轮测试开始: $(date)" >> "$LOG_FILE"
    
    # 创建当前轮次的任务（每次使用不同的员工名和邮箱）
    CURRENT_TASK="使用 Playwright MCP 工具完成以下任务：

1. 导航到 http://localhost:3000
2. 使用 admin/password 登录系统
3. 创建一个新员工：
   - 姓名：测试员工_第${i}轮_$(date +%H%M%S)
   - 薪水：88000
   - 工作时长：30
   - 级别：Middle
   - 邮箱：test_${i}_$(date +%H%M%S)@company.com
4. 验证创建成功并截图保存

请使用 Playwright MCP 工具完成所有操作，并提供详细的执行报告。"
    
    # 执行任务并捕获结果
    echo "🎯 执行中..."
    START_TIME=$(date +%s)
    
    # 调用 Claude Code 并捕获退出码
    claude "$CURRENT_TASK" 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    # 检查执行结果
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ 第 $i 轮测试成功！耗时: ${DURATION}秒"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo "第 $i 轮测试: 成功 (耗时: ${DURATION}秒)" >> "$LOG_FILE"
    else
        echo "❌ 第 $i 轮测试失败！退出码: $EXIT_CODE"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        echo "第 $i 轮测试: 失败 (退出码: $EXIT_CODE)" >> "$LOG_FILE"
    fi
    
    echo "当前成功率: $(( SUCCESS_COUNT * 100 / i ))% ($SUCCESS_COUNT/$i)"
    echo ""
    
    # 轮次间延迟（避免过快连续请求）
    if [ $i -lt $TOTAL_RUNS ]; then
        echo "⏳ 等待 3 秒后开始下一轮..."
        sleep 3
    fi
done

echo "=================================================="
echo "🏁 测试完成！最终统计结果："
echo "=================================================="
echo "总轮次: $TOTAL_RUNS"
echo "成功次数: $SUCCESS_COUNT"
echo "失败次数: $FAILED_COUNT"
echo "成功率: $(( SUCCESS_COUNT * 100 / TOTAL_RUNS ))%"

# 写入最终结果到日志文件
echo "===========================================" >> "$LOG_FILE"
echo "最终统计结果:" >> "$LOG_FILE"
echo "总轮次: $TOTAL_RUNS" >> "$LOG_FILE"
echo "成功次数: $SUCCESS_COUNT" >> "$LOG_FILE"
echo "失败次数: $FAILED_COUNT" >> "$LOG_FILE"
echo "成功率: $(( SUCCESS_COUNT * 100 / TOTAL_RUNS ))%" >> "$LOG_FILE"
echo "测试结束时间: $(date)" >> "$LOG_FILE"

echo ""
echo "📋 详细日志已保存到: $LOG_FILE"
echo "✅ 测试完成！"
