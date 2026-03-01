# LLM Game Backend API

后端 API 服务，为前端游戏提供 LLM 代理和存档管理功能。

## 功能

- **LLM 代理**: 安全地转发 LLM API 请求，保护 API Key
- **存档管理**: 服务端游戏存档存储
- **CORS 支持**: 允许 GitHub Pages 前端访问

## 安装

```bash
npm install
```

## 配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
LLM_API_KEY=your_actual_api_key_here
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-3.5-turbo
LLM_MAX_TOKENS=500
LLM_TEMPERATURE=0.7
CORS_ORIGIN=*
```

## 运行

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API 接口

### POST /api/llm
调用 LLM API 获取响应

**请求:**
```json
{
  "prompt": "Hello, world!",
  "history": [],
  "model": "gpt-3.5-turbo"
}
```

**响应:**
```json
{
  "content": "Response from LLM",
  "finishReason": "stop"
}
```

### POST /api/save
保存游戏存档

**请求:**
```json
{
  "playerId": "player123",
  "saveData": {
    "name": "Player Name",
    "score": 100,
    "inventory": [],
    "gameState": {}
  }
}
```

**响应:**
```json
{
  "success": true,
  "saveId": "1709280000000-abc123",
  "timestamp": "2026-03-01T12:00:00.000Z"
}
```

### GET /api/load?playerId=xxx
加载游戏存档

**响应:**
```json
{
  "success": true,
  "saveData": {
    "name": "Player Name",
    "score": 100,
    "inventory": [],
    "gameState": {}
  },
  "timestamp": "2026-03-01T12:00:00.000Z",
  "saveId": "1709280000000-abc123"
}
```

### GET /health
健康检查

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T12:00:00.000Z"
}
```

## 部署

部署到您的自有服务器：

1. 将代码上传到服务器
2. 运行 `npm install` 安装依赖
3. 配置 `.env` 文件
4. 使用 PM2 或 systemd 管理进程

### 使用 PM2

```bash
npm install -g pm2
pm2 start main.js --name llm-game-backend
pm2 save
pm2 startup
```

### 使用 systemd

创建 `/etc/systemd/system/llm-game-backend.service`:

```ini
[Unit]
Description=LLM Game Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node /path/to/backend/main.js
Restart=always

[Install]
WantedBy=multi-user.target
```

然后：

```bash
sudo systemctl enable llm-game-backend
sudo systemctl start llm-game-backend
```

## 存档存储

存档以 JSON 文件形式存储在 `saves/` 目录，文件名为 `{playerId}.json`。

## 安全建议

1. 使用 HTTPS 部署
2. 限制 CORS origin 为您的 GitHub Pages 域名
3. 定期备份存档数据
4. 使用环境变量存储敏感信息

## 许可证

MIT
