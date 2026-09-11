# OPC 一人公司工作台 — 开发文档

> 本文档面向前端开发者，说明项目技术栈、目录结构、编码规范与扩展方式。

---

## 1. 项目概述

OPC（One Person Company）一人公司工作台是一个面向独立创作者、自由职业者、个人创业者的 AI 驱动一站式工作平台。当前阶段为**纯前端静态原型**，所有页面由 HTML + CSS + JavaScript 构成，不依赖任何构建工具或框架，可直接在浏览器中打开。

- **版本**：v1.0.0
- **技术栈**：HTML5 / CSS3 / 原生 JavaScript (ES6+)
- **图标**：内联 SVG（Lucide 风格），零外部 CDN 依赖
- **数据层**：集中式 Mock 数据 + API 桩函数（`mock.js` / `api.js`）
- **部署**：GitHub Pages（静态托管）

---

## 2. 目录结构

```
opc-workbench/
├── index.html              # 前台：工作台 Dashboard（首页）
├── creation.html           # 前台：AI 创作引擎
├── workflow.html           # 前台：工作流编辑器
├── distribute.html         # 前台：一键多平台分发
├── inbox.html              # 前台：统一消息中枢
├── analytics.html          # 前台：数据分析看板
├── vivo.html               # 前台：vivo 办公套件（小V Claw）
├── admin-users.html        # 后台：用户管理
├── admin-platforms.html    # 后台：平台账号管理
├── admin-ai-tools.html     # 后台：AI 工具配置
├── admin-workflows.html    # 后台：工作流管理
├── admin-orders.html       # 后台：订单管理
├── admin-settings.html     # 后台：系统设置
├── admin-logs.html         # 后台：系统日志
├── styles.css              # 共享样式（含 4 套主题 + 后台组件）
├── mock.js                 # 集中式 Mock 数据源
├── api.js                  # API 桩函数（异步、签名匹配未来后端）
├── DEVELOPMENT.md          # 本文档
├── DEPLOYMENT.md           # 部署文档
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages 自动部署工作流
```

**页面总数**：14 个 HTML 页面（7 前台 + 7 后台，其中 `vivo.html` 归前台但有独立生态入口）。

---

## 3. 架构设计

### 3.1 三层结构

每个页面遵循统一的三层结构：

```
<body data-page="PAGE_KEY" data-theme="indigo">
  <div class="app-shell">
    <aside class="app-nav">  <!-- 左侧导航栏 -->
    <div class="app-main">
      <header class="app-topbar">  <!-- 顶部栏 -->
      <div class="page-content">   <!-- 页面主体内容 -->
```

- **App Shell**：`app-shell` + `app-nav` + `app-main` 构成统一布局骨架
- **左侧导航栏**（`app-nav`）：前台与后台各自一套完整导航，通过 `data-nav` 属性标记当前页
- **顶部栏**（`app-topbar`）：搜索框、主题切换器、操作按钮
- **页面主体**（`page-content`）：各页面独有的卡片、表格、图表等

### 3.2 主题系统

通过 `<body data-theme="...">` 切换 4 套主题，所有颜色使用 CSS 变量：

| 主题 | data-theme | 主色 | 辅色 |
|------|-----------|------|------|
| 靛蓝夜空（默认） | `indigo` | `#6366F1` | `#06B6D4` |
| 霓虹紫 | `neon` | `#A855F7` | `#EC4899` |
| 赛博青 | `cyber` | `#14B8A6` | `#8B5CF6` |
| 深海蔚蓝 | `ocean` | `#0EA5E9` | `#2DD4BF` |

新增主题步骤：
1. 在 `styles.css` 中添加 `[data-theme="xxx"] { ... }` 块，覆盖全部颜色变量
2. 在 `.theme-dot[data-set="xxx"]` 中定义圆点颜色
3. 在所有页面的主题切换器中增加对应 `.theme-dot` 元素

### 3.3 数据层

**Mock 数据**（`mock.js`）：
- 统一导出为 `DB` 对象，所有页面共享
- 按模块分组：`stats`、`tasks`、`aiTools`、`adminUsers`、`platformAccounts` 等
- 添加新数据时，在 `DB` 对象内新增属性即可

**API 桩函数**（`api.js`）：
- 每个函数返回 `Promise`，签名为 `async function xxx()`
- 内部用 `await delay(ms)` 模拟网络延迟
- 返回统一格式：`{ code: 0, data: ... }` 或 `{ code: 非0, msg: "错误信息" }`
- 函数内标注 `// TODO: replace with real fetch() calls to backend`

**替换为真实后端**：
将 `api.js` 中每个函数体替换为 `fetch()` 调用，返回结构保持不变，前端页面无需改动。

---

## 4. 编码规范

### 4.1 HTML
- 使用语义化标签，`<header>` / `<main>` / `<aside>` / `<section>`
- 类名采用 BEM 风格：`.nav-item`、`.stat-card-label`、`.wf-node-icon`
- 所有图标使用内联 SVG，禁止 `<img>` 引入外部图标
- `data-page` 属性标识当前页面，配合导航高亮

### 4.2 CSS
- 所有颜色、圆角、间距、阴影、字体使用 CSS 变量（`:root` 定义）
- 新组件样式追加到 `styles.css` 末尾，按模块用注释分隔
- 动画用 `@keyframes` 定义，复用 `.animate-in` 入场动画
- 禁止硬编码颜色值（vivo 品牌色 `#415FFF` 等除外）

### 4.3 JavaScript
- 页面逻辑放在 `<script>` 内，用 IIFE `(function() { ... })();` 隔离作用域
- 优先使用 DOM API，不引入 jQuery 等库
- 事件绑定用 `addEventListener`，避免内联 `onclick`（主题切换等全局函数除外）
- 异步操作统一用 `async/await`

---

## 5. 新增页面指引

以新增一个"素材资产管理"页面 `assets.html` 为例：

### 步骤 1：复制模板
复制 `index.html` 为 `assets.html`，修改：
- `<title>` 为新页面标题
- `<body data-page="assets" data-theme="indigo">`
- 顶部 `<style>` 中导航高亮选择器改为 `[data-nav="assets"]`

### 步骤 2：添加导航项
在所有需要出现该入口的页面的 `<aside class="app-nav">` 中添加：
```html
<a href="assets.html" class="nav-item" data-nav="assets">
  <svg>...图标...</svg>
  <span class="nav-item-text">素材资产</span>
</a>
```

### 步骤 3：填充页面内容
在 `.page-content` 内编写卡片、表格等，复用已有组件类（`.card`、`.stat-card`、`.table`、`.tag` 等）。

### 步骤 4：添加 Mock 数据
在 `mock.js` 的 `DB` 对象中新增 `assets: [...]`，在 `api.js` 中新增 `fetchAssets()` 桩函数。

### 步骤 5：编写页面 JS
在 `<script>` 内渲染数据、绑定交互。

---

## 6. 组件库速查

| 组件 | 类名 | 说明 |
|------|------|------|
| 卡片 | `.card` / `.glass-card` | 基础卡片 / 玻璃拟态卡片 |
| 统计卡 | `.stat-card` | 含 icon、数值、趋势 |
| 按钮 | `.btn` + `.btn-primary`/`.btn-secondary`/`.btn-ghost`/`.btn-danger` + `.btn-sm`/`.btn-lg` | |
| 标签 | `.tag` + `.tag-primary`/`.tag-success`/`.tag-warning`/`.tag-danger`/`.tag-info`/`.tag-neutral` | |
| 表格 | `.table` + `thead`/`tbody` | |
| 进度条 | `.progress` > `.progress-bar` | |
| 头像 | `.avatar` + `.avatar-sm`/`.avatar-lg` | |
| 标签页 | `.tabs` > `.tab.active` | |
| 开关 | `.toggle` + `.toggle.on` | |
| 表单 | `.form-group` > `.form-label` + `.form-input`/`.form-select`/`.form-textarea` | |
| 主题切换 | `.theme-switcher` > `.theme-dot` | |
| 平台图标 | `.platform-icon` | 带背景色的小方块 |
| 状态点 | `.status-dot` + `.online`/`.offline`/`.warning`/`.error` | |

---

## 7. 本地开发

### 7.1 直接打开
```bash
# 双击 index.html 即可，零依赖
```

### 7.2 本地静态服务器（推荐，避免跨域）
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .
```
访问 http://localhost:8080

### 7.3 代码检查
- 无构建步骤，直接浏览器打开即可调试
- 建议使用 VS Code + Live Server 插件热刷新

---

## 8. 前后端对接计划

当前为纯前端原型，后续接入后端时的约定：

| 模块 | 接口前缀 | 说明 |
|------|---------|------|
| 工作台 | `/api/dashboard/*` | 统计、任务、工作流状态 |
| AI 创作 | `/api/ai/*`、`/api/assets/*` | 工具列表、执行、素材库 |
| 工作流 | `/api/workflows/*` | 模板、节点、运行记录 |
| 分发 | `/api/distribution/*` | 平台列表、发布 |
| 消息 | `/api/messages/*` | 消息列表、回复 |
| 数据 | `/api/analytics/*` | 内容趋势、收入、效率 |
| 后台 | `/api/admin/*` | 用户、平台、AI 工具、订单、系统 |

后端只需实现 `api.js` 中已定义的函数签名，前端将 `api.js` 中的 mock 实现替换为真实 `fetch` 即可。

---

## 9. 浏览器兼容

- 目标浏览器：Chrome 90+、Edge 90+、Firefox 90+、Safari 14+
- 使用特性：CSS 变量、Flexbox、Grid、`backdrop-filter`、`ResizeObserver`、`localStorage`
- 不做 IE 兼容

---

## 10. 已知限制

1. 当前所有数据为 Mock，刷新页面后不持久化
2. 工作流编辑器的拖拽连线为视觉演示，未实现真正的节点拖拽
3. AI 对话、消息回复等为模拟响应，无真实 AI 调用
4. 主题切换通过 `localStorage` 保存，不与账号关联
5. 页面间数据不共享（各自独立读取 `DB`）
