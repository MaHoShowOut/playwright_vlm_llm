# 通过 npm 安装与使用 @playwright/mcp，并在 Cursor 中配置 MCP

> 目标：将 Playwright 团队维护的 MCP 服务（`@playwright/mcp`）安装到本机或项目中，并在 Cursor 中接入，使 LLM 能直接调用浏览器工具（navigate/click/type/snapshot 等）。

---

## 1. 前置条件
- Node.js 与 npm（建议 Node ≥ 18）
- 网络可访问 npm Registry

验证环境：
```bash
node -v
npm -v
```

---

## 2. 安装方式（任选其一）

### 方式 A：项目内安装（推荐，可复现、可锁版本）
```bash
# 在项目根目录执行
npm i -D @playwright/mcp@latest

# 指定固定版本（推荐生产/教学演示固定版本）
npm i -D @playwright/mcp@0.x.y
```
启动（项目内）：
```bash
npx @playwright/mcp@0.x.y
# 或使用已安装版本
npx @playwright/mcp
```

### 方式 B：全局安装（多项目复用）
```bash
npm i -g @playwright/mcp@latest
# 固定版本
npm i -g @playwright/mcp@0.x.y
```
启动（全局）：
```bash
playwright-mcp  # 某些版本提供可执行名
# 或
npx @playwright/mcp
```

### 方式 C：临时运行（npx，不写入依赖）
```bash
npx @playwright/mcp@latest
# 或固定版本
npx @playwright/mcp@0.x.y
```
说明：npx 会将包解压到 npm 缓存目录（macOS 常见路径：`~/.npm/_npx/<随机ID>/node_modules/@playwright/mcp`）。

---

## 3. 启动与验证
启动：
```bash
npx @playwright/mcp@latest
```
预期输出（示意）：
```
🚀 启动Playwright MCP服务器...
Starting Playwright MCP server...
Waiting for connections...
```
若看到“Waiting for connections...”，表示服务已就绪，等待 MCP 客户端（如 Cursor）连接。

---

## 4. 在 Cursor 中配置 MCP

Cursor 支持以 MCP 客户端连接外部 MCP 服务器。配置思路：让 Cursor 用“命令行（stdio）”方式启动 `@playwright/mcp`，并与之建立 MCP 连接。

### 4.1 打开 MCP 设置
- 打开 Cursor
- 进入设置（Settings）→ MCP Servers（或“Model Context Protocol”相关设置）

### 4.2 新增一个 MCP Server（Command/stdio）
- Type/Transport：选择 `Command`（基于 stdio）
- Command：
  - 项目内安装（推荐）：`npx`
  - 参数（Args）：`@playwright/mcp@0.x.y`
  - 也可直接写绝对路径的 node/npm/npx，可提升稳定性
- Working Directory：选择你的项目根（可选）
- Env（可选）：按需补充（例如代理设置或 DISPLAY 等）
- 保存配置

示例（项目内固定版本，确保可复现）：
```
Command: npx
Args: @playwright/mcp@0.1.0
```
或已本地安装：
```
Command: npx
Args: @playwright/mcp
```

保存后，Cursor 会尝试启动该命令并通过 stdio 建立 MCP 连接。成功后，Cursor 的 LLM 即可调用 `browser_navigate`、`browser_click`、`browser_type`、`browser_snapshot`、`browser_select_option`、`browser_take_screenshot` 等工具。

---

## 5. 快速连通性测试（在 Cursor 内）
- 让 Cursor 触发一个简单任务，例如：
  - “打开 `http://localhost:3000` 并截图页面标题区域”
- 观察工具调用日志或输出，确认出现 `browser_navigate`、`browser_snapshot` 等调用且无错误。

---

## 6. 常见问题排查

### 6.1 无法启动/找不到命令
- 确认 Node/npm 在 PATH 中：
  ```bash
  which node
  which npm
  which npx
  ```
- 在 Cursor 的 MCP 设置中使用绝对路径：
  - 例如：`/Users/<you>/.nvm/versions/node/vXX/bin/npx`

### 6.2 npx 版本漂移
- 使用固定版本：`@playwright/mcp@0.x.y`
- 或改为项目内安装并锁定 `package-lock.json`

### 6.3 端口占用/多实例冲突（少见）
- 关闭已有的 MCP 进程，或在新 Terminal 中单独启动，确保只有一个实例在运行。

### 6.4 权限受限
- macOS 下若提示权限问题，考虑通过 `xattr -d com.apple.quarantine` 清除隔离标记（谨慎执行）。

---

## 7. 推荐实践
- 固定版本并项目内安装，保障团队可复现：
  ```bash
  npm i -D @playwright/mcp@0.x.y
  ```
- 在 README 中记录 Cursor 的 MCP 配置（Command/Args/工作目录），将其纳入团队上手手册。
- 将 `@playwright/mcp` 的启动脚本化（如 `automation/start-mcp-server.sh`），便于一键运行。

---

## 8. 参考命令速查
```bash
# 项目内安装 + 固定版本
npm i -D @playwright/mcp@0.x.y

# 启动（项目内/固定版本）
npx @playwright/mcp@0.x.y

# 全局安装
npm i -g @playwright/mcp@0.x.y

# 查看 npm 缓存位置（定位 npx 解压目录）
npm config get cache
```

