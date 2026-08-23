# WPS WebOffice 在线文档预览/编辑对接总结文档

> **文档目的**：系统性记录本次对接 WPS WebOffice 开放平台的完整过程，供后续维护人员和新加入的开发者快速了解对接全貌、复用经验、规避已踩过的坑。
>
> **对接时间**：2026-08-23
> **对接结果**：✅ 全链路验证通过（签名验签、控制台调试、在线预览、在线编辑、三阶段保存、多人协作、动态水印）

---

## 1. 对接背景与目标

### 1.1 业务背景

业务系统需要在自有 Web 应用中提供 **Office 文档（docx/xlsx/pptx/pdf）的在线预览与编辑** 能力，无需用户本地安装 Office/WPS 客户端，也无需自建文档渲染引擎。

### 1.2 技术方案选型

采用 **WPS WebOffice 开放平台（v3 回调服务模式）**：

- **前端**：官方 JSSDK（`web-office-sdk-solution-v1.1.27.umd.js`）以 iframe 形式嵌入 WPS 云端编辑器
- **后端**：Node.js + Express 实现 WPS 规定的全套服务端回调接口（`/v3/3rd/*`）
- **存储**：本地磁盘 + 文件版本管理（Demo 实现，生产可替换为对象存储）

**核心架构思想：WPS 负责文档渲染，我方负责文件存储与权限，两者通过回调接口打通。**

```
浏览器(业务系统前端)           WPS WebOffice 云端              我方服务端(本项目)
┌──────────────────┐        ┌──────────────────┐         ┌──────────────────────┐
│ index.html       │        │                  │         │ /v3/3rd/* 回调接口    │
│  文件上传/列表    │        │  文档渲染引擎     │  ──────▶│  文件信息/下载地址     │
│                  │        │  (打开/编辑/协作) │  WPS-2  │  权限/用户信息        │
│ editor.html ─────┼───────▶│                  │  签名    │  保存(三阶段/单阶段)  │
│  JSSDK 初始化    │ iframe │                  │         │  历史版本/水印        │
└──────────────────┘        └──────────────────┘         ├──────────────────────┤
                                                         │ /api/* 业务接口       │
                                                         │  登录/文件CRUD/下载   │
                                                         └──────────────────────┘
```

### 1.3 对接目标（验收标准）

| # | 目标 | 状态 |
|---|------|------|
| 1 | 控制台全部回调接口在线调试通过 | ✅ |
| 2 | 浏览器内完整打开并渲染 docx 文档（预览模式） | ✅ |
| 3 | 浏览器内编辑文档并保存，产生新版本 | ✅ |
| 4 | 上传文件（含中文名）正常入库与显示 | ✅ |
| 5 | 公网回调链路稳定可用 | ✅（natapp 隧道，小文件正常） |

---

## 2. 对接前的准备工作

### 2.1 账号与权限申请

1. 在 [WebOffice 开放平台控制台](https://solution.wps.cn/console) 注册账号并完成企业认证
2. 创建**测试应用**，类型选择「在线预览编辑」（免费，认证后限制：≤100 次调用、10M 文件、页面带水印）
3. 获取应用凭证 `AppID` / `AppSecret`（本项目实际凭证配置于 `.env`，模板见 `.env.example`）

> 正式上线需创建**正式应用**：上传系统截图审核 + 账户充值（按量计费），测试应用禁止商业用途。

### 2.2 环境配置

| 项 | 要求 |
|----|------|
| Node.js | ≥ 18 |
| 操作系统 | macOS / Linux / Windows 均可（本次在 macOS 验证） |
| 依赖包 | `express@4`、`multer@1.4`、`busboy@1.6`、`dotenv`（见 `package.json`） |
| 网络 | 服务端需**公网可达**（WPS 云端主动回调），本地开发需内网穿透 |

### 2.3 关键配置参数（`.env`）

```bash
APP_ID=SX20260823JREJSE          # 应用 ID
APP_SECRET=********              # 应用密钥（勿提交代码库）
PORT=3000                        # 服务端口
PUBLIC_URL=http://xxx.natappfree.cc  # 公网回调地址（穿透域名）
SIGNATURE_CHECK=true             # 是否校验 WPS-2 回调签名（上线务必 true）
WATERMARK=true                   # 动态水印开关
```

> `PUBLIC_URL`：WPS 回调下载/上传接口时，WPS 云端会用它拼接文件下载地址，必须指向公网可达的域名。

### 2.4 内网穿透方案（本次实测对比）

| 方案 | 域名稳定性 | 实测表现 | 结论 |
|------|-----------|---------|------|
| cloudflared quick tunnel | ❌ 每次重启域名变化，当天崩溃 2 次 | 延迟 ~1.5s，崩溃后公网 530 | 不推荐用于调试 |
| **natapp 免费版** | ✅ 固定域名 | 延迟 ~0.15s，但限速 ~100KB/s | **本次采用**，小文件够用 |
| natapp VIP / 生产环境 | — | 无限速 | 大文件场景必需 |

> WPS 回调**接受 http 协议**（已在 natapp 的 http 地址上全链路验证通过），本地调试无需配置 https。

---

## 3. 核心对接流程（按时间顺序）

### 阶段一：本地服务搭建

1. 初始化 Node.js 项目，Express 挂载两组路由：
   - `routes/callback.js` — WPS 回调接口（`/v3/3rd/*`，核心）
   - `routes/api.js` — 业务接口（登录/上传/列表/下载，模拟真实业务系统）
2. 实现文件存储与版本管理（`lib/store.js`）、模拟用户库（`lib/users.js`）
3. 前端两页面：`public/index.html`（文件管理）+ `public/editor.html`（编辑器嵌入）
4. JSSDK 从官方 CDN 下载至本地 `public/sdk/`（避免 CDN 波动）

### 阶段二：WPS-2 回调签名实现（`lib/sign.js`）

WPS 每次回调请求携带鉴权头，服务端必须校验：

```
Authorization: WPS-2:{APP_ID}:{sign}
sign = SHA1(APP_SECRET + Content-Md5 + Content-Type + Date)
```

| 参数 | 取值规则 |
|------|---------|
| `Content-Md5` | Body 的 MD5 小写 hex；**Body 为空时改用完整 URI path 计算**（陷阱见 4.2 节） |
| `Content-Type` | 请求头原值，无则空串 |
| `Date` | RFC1123 格式时间头，服务端校验 ±10 分钟防重放（陷阱见 4.1 节） |

### 阶段三：公网隧道打通

1. 安装 natapp 客户端并配置隧道指向 `localhost:3000`
2. 获得**固定域名**（本次：`http://m5a24a8a.natappfree.cc`）
3. `.env` 中设置 `PUBLIC_URL` 为该域名，重启服务

### 阶段四：控制台回调配置与在线调试

1. 控制台 → 应用详情 → **回调配置**，回调网关填公网域名（**不带** `/v3/3rd` 后缀）
2. 使用每个接口旁的「调试」按钮在线测试。调试时会传真实 `file_id`、`user_id` 参数与签名请求头，需逐个通过后打开接口开关

**本项目实现的回调接口清单**（前缀 `/v3/3rd`）：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/files/:file_id` | GET | 文件元信息 |
| `/files/:file_id/download` | GET | 文件下载地址（返回 `PUBLIC_URL` 拼接的直链） |
| `/files/:file_id/permission(s)` | GET | 当前用户权限（按预览/编辑模式返回） |
| `/users/:user_id`、`/users` | GET | 用户信息（协作头像/名字，⚠️ 见 4.3 节） |
| `/files/:file_id/name` | PUT | 文档重命名 |
| `/files/:file_id/upload` | POST | 保存-单阶段提交（兼容保留） |
| `/files/:file_id/upload/prepare` | GET | 保存-三阶段① 协商校验算法 |
| `/files/:file_id/upload/address` | POST | 保存-三阶段② 获取上传地址（发一次性 `upload_token`） |
| `/files/:file_id/upload/complete` | POST | 保存-三阶段③ 携 token 提交新版本 |
| `/files/:file_id/versions...` | GET | 历史版本列表/详情/下载 |
| `/files/:file_id/extra` | GET | 扩展信息 |
| `/files/:file_id/watermark` | GET | 动态水印（显示当前用户名） |

### 阶段五：浏览器端全链路验证

1. 打开 `http://localhost:3000`，模拟登录（多用户协作测试用）
2. 上传 docx/xlsx/pptx/pdf 文件
3. 「编辑」→ WPS 编辑器完整渲染，修改后 Ctrl+S → 回调收到三阶段保存请求，版本号 v1 → v2
4. 「预览」→ 只读模式打开（`customArgs` 透传 + 权限回调联动实现）
5. 双窗口不同用户名打开同一文档 → 多人实时协作

### 核心数据交互流程（打开文档）

```
浏览器 JSSDK.init({appId, fileId, token})
   → WPS 云端收到打开请求
   → WPS 回调 GET /v3/3rd/files/:id          （验签→返回文件元信息+用户权限）
   → WPS 回调 GET /v3/3rd/files/:id/download （返回下载直链）
   → WPS 回调 GET /v3/3rd/users?user_ids=xx  （返回用户名/头像）
   → WPS 云端从下载直链拉取文件 → 渲染到 iframe
```

**用户识别 Token 流转**：前端 `init({token})` 传入业务 token → WPS 回调时经 `X-WebOffice-Token` 头原样带回 → 服务端解析出用户，用于权限判断、保存人记录、水印显示。

### 前端初始化关键代码（`public/editor.html`）

```js
const jssdk = WebOfficeSDK.init({
  officeType: WebOfficeSDK.OfficeType.Writer,  // 按文件扩展名映射
  appId: '你的AppID',
  fileId: '业务文件ID',
  mount: document.getElementById('office-container'),
  token: user.token,
  customArgs: { demo_mode: 'preview' }  // 透传到回调的 X-User-Query
})
await jssdk.ready()
// jssdk.Application 可调用 1000+ JSAPI
```

---

## 4. 对接过程中遇到的问题及解决方案（⚠️ 经验沉淀，重点阅读）

### 4.1 控制台调试报「参数无效」— JS Date 时区误判（最隐蔽的坑）

- **现象**：控制台在线调试 `/v3/3rd/files/:file_id` 接口，参数正确却始终报「参数无效」；但验签逻辑本地自测通过。
- **排查思路**：在 `lib/sign.js` 打印 `Date` 头与计算出的时间差，发现 WPS 发送的 `Date` 头以 `CST`（China Standard Time）结尾，而 **JS `Date.parse` 把 `CST` 解析为美国中部时间（UTC-6）**，导致与真实时间相差 14 小时，触发 ±10 分钟防重放校验失败。
- **解决方案**：解析前将 `CST` 归一化为 `+0800`：

```js
const dateStr = (date || '').replace(/CST$/, '+0800')
const reqTime = Date.parse(dateStr)
if (Number.isFinite(reqTime) && Math.abs(Date.now() - reqTime) > 10 * 60 * 1000) {
  return { ok: false, reason: 'date expired' }
}
```

### 4.2 签名校验失败 — Express 路由挂载后 `req.path` 丢失前缀

- **现象**：回调全部 401，日志显示服务端计算的签名与 WPS 传入的不一致。
- **排查思路**：对比签名五要素，发现 **Body 为空时** Content-Md5 应使用完整 URI（`/v3/3rd/files/xxx`）计算，但路由以 `app.use('/v3/3rd', callbackRouter)` 挂载后，**`req.path` 只剩 `/files/xxx`**，丢失了 `/v3/3rd` 前缀，导致 MD5 计算源不对。
- **解决方案**：统一改用 `req.originalUrl`：

```js
const contentMd5 = req.headers['content-md5'] || md5hex(req.originalUrl)
```

### 4.3 Error Code 10000「用户 u1 信息不存在」— 批量用户接口格式不符

- **现象**：控制台调试用户接口报 Error 10000。
- **排查思路**：抓请求发现两个问题——
  1. WPS 批量查询实际传的参数名是 **`user_ids`（复数）**，代码里读的却是 `user_id`
  2. 官方规范要求返回的 `data` 是**裸数组**，代码返回的是 `{users: []}`
- **解决方案**：

```js
router.get('/users', (req, res) => {
  const ids = [].concat(req.query.user_ids || req.query.user_id || [])
  res.json({
    code: 0,
    data: ids.map(id => {  // data 必须是数组本身
      const u = users.getById(id)
      return { id, name: u ? u.name : id, avatar_url: u && u.avatar_url || '' }
    })
  })
})
```

### 4.4 上传文件中文文件名乱码（`åç«¯æ§è½ä¼å.pptx`）

- **现象**：上传「前端性能优化.pptx」后文件名显示为乱码。
- **排查思路**：multer 底层的 busboy 默认以 **latin1** 解码 multipart 文件名，而浏览器按 UTF-8 编码发送，多字节中文被拆散。
- **解决方案**：拿到原始名后二次转码：

```js
function normalizeFilename(name) {
  return Buffer.from(name, 'latin1').toString('utf8')
}
const meta = store.createFile(normalizeFilename(req.file.originalname), req.file.buffer, userId)
```

历史乱码记录已手工修正。

### 4.5 服务意外停止 / 公网 530 — 隧道与进程稳定性

- **现象**：服务跑一段时间后停止；cloudflared 隧道当天崩溃 2 次，公网返回 530，文档打开失败。
- **根因**：① 后台子进程方式启动服务，Bash 会话结束进程被回收；② cloudflared quick tunnel 本身不稳定且每次重启域名变化，需到控制台重新配置回调网关。
- **解决方案**：服务改用持久化后台任务方式运行；隧道整体切换为 **natapp 固定域名**，域名不再变化，控制台只需配置一次。切换后实测延迟从 ~1.5s 降至 **0.15s**（快 10 倍），全部回调 200。

### 4.6 大文件（7.6MB pptx）一直「正在打开」— 隧道带宽限制（遗留限制）

- **现象**：natapp 隧道下小文件秒开，7.6MB 文件永远打不开。
- **排查思路**：服务端日志显示下载请求在 **0.1s 内被客户端主动断开**——natapp 免费版限速 ~100KB/s，WPS 云端拉取文件超时后主动放弃，**属隧道带宽瓶颈而非代码问题**（本地 localhost 打开同一文件正常）。
- **建议方案**：natapp VIP 隧道，或生产环境将文件放对象存储（OSS/COS/S3）、`/download` 回调直接返回带签名的存储桶直链，彻底绕过业务服务器带宽。

### 问题速查表

| # | 现象 | 根因 | 修复 |
|---|------|------|------|
| 1 | 控制台调试「参数无效」 | JS 把 `CST` 误判为 UTC-6，差 14 小时 | `date.replace(/CST$/,'+0800')` |
| 2 | 回调全部 401 | `req.path` 丢 `/v3/3rd` 前缀，MD5 源错 | 改用 `req.originalUrl` |
| 3 | Error 10000 用户不存在 | 参数名 `user_ids`；返回需裸数组 | 改参数名 + 改返回结构 |
| 4 | 中文文件名乱码 | busboy latin1 解码 | `Buffer.from(name,'latin1').toString('utf8')` |
| 5 | 服务停止 / 公网 530 | 子进程被回收；cloudflared 崩溃 | 持久化运行 + 切 natapp |
| 6 | 大文件打不开 | natapp 免费限速 ~100KB/s | VIP 隧道或对象存储直链（待落地） |

---

## 5. 对接结果与验证情况

### 5.1 功能验证清单

| 验证项 | 验证方式 | 结果 |
|--------|---------|------|
| WPS-2 签名校验 | 控制台在线调试（真实签名请求） | ✅ 全部通过 |
| 无效签名拒绝 | 伪造签名请求 | ✅ 正确返回 401 |
| 文件元信息/权限/下载地址/用户信息 | 控制台逐接口调试 | ✅ 全部 200 |
| 在线预览（只读） | 浏览器打开 demo.docx（21KB） | ✅ 完整渲染，工具栏正常 |
| 在线编辑 + 保存 | 编辑文档 Ctrl+S | ✅ 三阶段保存 v1 → v2 成功 |
| 预览/编辑权限切换 | `customArgs` + 权限回调 | ✅ 生效 |
| 中文文件名上传 | 上传「前端性能优化.pptx」 | ✅ 正常显示 |
| 公网链路稳定性 | natapp 固定域名多次开关文档 | ✅ 稳定，延迟 ~0.15s |
| 大文件（7.6MB pptx） | natapp 免费隧道 | ⚠️ 受隧道带宽限制无法打开（见 4.6） |

### 5.2 当前运行状态

- 服务地址：`http://localhost:3000`（业务前端）
- 公网回调：`http://m5a24a8a.natappfree.cc`（natapp 固定隧道，客户端在开发机运行）
- 控制台回调网关已配置为上述 natapp 地址，全部接口开关已打开
- 测试应用水印「SX20260823JREJSE 禁止用于商业用途」为平台限制，转正式应用后消除

### 5.3 已知限制与遗留事项

1. **大文件打开**：受 natapp 免费隧道限速影响，>1MB 文件在隧道下大概率超时；生产环境需对象存储直链方案
2. **测试应用配额**：≤100 次调用、10M 文件上限；商用需转正式应用（审核 + 充值）
3. **Demo 简化点**（生产必须替换）：登录体系为本地 JSON 模拟、`/api/files/:id/raw` 下载接口未鉴权、存储为本地磁盘

---

## 附录 A：项目目录结构

```
├── server.js              # 服务入口：挂载路由、请求/连接中断日志
├── package.json           # Node ≥18, express/multer/busboy/dotenv
├── .env / .env.example    # 应用凭证与服务配置
├── lib/
│   ├── config.js          # 配置加载
│   ├── sign.js            # ★ WPS-2 签名校验（含 CST 时区修复）
│   ├── store.js           # 文件存储 + 版本管理 + md5
│   └── users.js           # 模拟用户库
├── routes/
│   ├── callback.js        # ★ WPS 回调接口 /v3/3rd/*
│   └── api.js             # 业务接口 /api/*（含中文文件名修复）
├── public/
│   ├── index.html         # 文件管理页（登录/上传/列表）
│   ├── editor.html        # WebOffice 编辑器页（JSSDK 初始化）
│   └── sdk/               # 官方 JSSDK v1.1.27 本地副本
└── data/files.json        # 文件元数据
```

**启动方式**：

```bash
npm install
cp .env.example .env   # 填入凭证与 PUBLIC_URL
npm start              # http://localhost:3000
```

## 附录 B：文件类型 → OfficeType 映射

| OfficeType | 扩展名 |
|------------|--------|
| Writer | docx doc dot dotx xml rtf txt html mht odt |
| Spreadsheet | xlsx xls xlt xltx csv ods et ett |
| Presentation | pptx ppt pot potx pps ppsx odp dps dpt |
| Pdf | pdf ofd |
| Otl / Dbt | otl / dbt（智能文档/多维表格） |

## 附录 C：常见问题速答

**Q: 文档打开失败 / 一直转圈？**
按顺序检查：① 控制台回调调试是否通过；② 服务是否公网可达（`curl {PUBLIC_URL}/v3/3rd/files/1` 返回 401 说明链路通、签名不对；超时说明不通）；③ `APP_ID/APP_SECRET/`PUBLIC_URL` 是否正确；④ 大文件考虑隧道带宽（见 4.6）。

**Q: 保存没生效？**
检查控制台「保存」相关接口（单阶段/三阶段）是否开启并调试通过；看服务日志有无 `/upload` 请求。

**Q: 权限不生效？**
权限由 `/permission` 回调返回，依赖 `X-WebOffice-Token` 识别用户，确认前端 `init` 传了 token。

## 附录 D：上线生产前检查清单

- [ ] 创建正式应用（上传系统截图审核 + 充值，按量计费）
- [ ] `.env` 确认 `SIGNATURE_CHECK=true`
- [ ] `/api/files/:id/raw` 下载接口加鉴权（建议回调返回带签名的临时下载 URL）
- [ ] 文件存储换对象存储，三阶段保存直传存储桶（同时解决大文件问题）
- [ ] 登录体系替换为真实账号体系
- [ ] 回调接口监控告警（WPS 控制台亦有日志查询）

## 附录 E：参考文档

- 接入流程：https://solution.wps.cn/docs/editing/flow.html
- 回调服务：https://solution.wps.cn/docs/callback/summary.html
- 回调接口列表：https://developer.kdocs.cn/server/provider/api.html
- 前端 JSSDK：https://solution.wps.cn/docs/web/quick-start
- JSAPI（文档内高级操作）：https://solution.wps.cn/docs/client/api/summary.html
- 控制台：https://solution.wps.cn/console
