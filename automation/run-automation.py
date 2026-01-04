#!/usr/bin/env python3
"""
自动化员工批量创建脚本
使用Claude Code和Playwright MCP执行Web自动化任务
"""

import subprocess
import json
import os
import sys
from pathlib import Path

def check_requirements():
    """检查必要的依赖和环境"""
    print("🔍 检查环境依赖...")
    
    # 检查Claude Code是否安装
    try:
        result = subprocess.run(['claude', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ Claude Code版本: {result.stdout.strip()}")
        else:
            print("❌ Claude Code未安装或无法访问")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("❌ Claude Code未安装，请先安装Claude Code")
        return False
    
    # 检查settings.local.json配置
    settings_path = Path.home() / ".config" / "claude-code" / "settings.local.json"
    if not settings_path.exists():
        print(f"⚠️  未找到配置文件: {settings_path}")
        print("将创建推荐的配置文件...")
        create_settings_file(settings_path)
    else:
        print(f"✅ 配置文件存在: {settings_path}")
    
    return True

def create_settings_file(settings_path):
    """创建Claude Code配置文件"""
    settings_path.parent.mkdir(parents=True, exist_ok=True)
    
    config = {
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
    
    with open(settings_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"✅ 配置文件已创建: {settings_path}")

def create_prompt():
    """创建自动化任务的prompt"""
    return """使用playwright MCP工具执行完整的批量员工创建任务：

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

每创建一个员工后都要验证成功，最后提供完整的创建结果报告。"""

def run_claude_code_automation():
    """运行Claude Code自动化任务"""
    print("🚀 开始执行自动化任务...")
    
    # 创建prompt
    prompt = create_prompt()
    
    # 创建临时文件存储prompt
    prompt_file = Path("automation_prompt.txt")
    with open(prompt_file, 'w', encoding='utf-8') as f:
        f.write(prompt)
    
    try:
        # 运行Claude Code
        print("📝 正在调用Claude Code...")
        print("提示: 请确保已经启动了Playwright MCP服务器")
        
        # 使用claude命令执行自动化任务，指定Sonnet模型
        cmd = ['claude', '--model', 'sonnet', prompt]
        
        print(f"执行命令: {' '.join(cmd)}")
        print("=" * 50)
        
        # 运行命令并实时显示输出
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # 实时显示输出
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(output.strip())
        
        return_code = process.poll()
        
        if return_code == 0:
            print("\n" + "=" * 50)
            print("✅ 自动化任务执行完成!")
        else:
            print(f"\n❌ 任务执行失败，返回码: {return_code}")
            return False
            
    except KeyboardInterrupt:
        print("\n⚠️  用户中断了任务执行")
        return False
    except Exception as e:
        print(f"❌ 执行过程中发生错误: {e}")
        return False
    finally:
        # 清理临时文件
        if prompt_file.exists():
            prompt_file.unlink()
    
    return True

def create_mcp_server_start_script():
    """创建MCP服务器启动脚本"""
    script_content = """#!/bin/bash
# Playwright MCP服务器启动脚本

echo "🚀 启动Playwright MCP服务器..."

# 检查是否已安装Playwright MCP
if ! command -v npx &> /dev/null; then
    echo "❌ 需要安装Node.js和npm"
    exit 1
fi

# 启动MCP服务器
echo "启动命令: npx @playwright/mcp@latest"
npx @playwright/mcp@latest
"""
    
    script_path = Path("start-mcp-server.sh")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    # 设置执行权限
    os.chmod(script_path, 0o755)
    
    print(f"✅ MCP服务器启动脚本已创建: {script_path}")
    return script_path

def main():
    """主函数"""
    print("=" * 60)
    print("🤖 Claude Code + Playwright MCP 自动化脚本")
    print("=" * 60)
    
    # 检查环境
    if not check_requirements():
        print("\n❌ 环境检查失败，请解决上述问题后重试")
        sys.exit(1)
    
    # 创建MCP服务器启动脚本
    mcp_script = create_mcp_server_start_script()
    
    print("\n" + "=" * 60)
    print("📋 使用说明:")
    print("1. 首先在另一个终端中运行MCP服务器:")
    print(f"   ./{mcp_script}")
    print("2. 然后按回车键继续执行自动化任务")
    print("=" * 60)
    
    # 等待用户确认
    input("按回车键继续...")
    
    # 执行自动化任务
    success = run_claude_code_automation()
    
    if success:
        print("\n🎉 所有任务执行完成!")
        print("📊 查看详细报告以了解执行结果")
    else:
        print("\n❌ 任务执行失败，请检查错误信息")
        sys.exit(1)

if __name__ == "__main__":
    main()