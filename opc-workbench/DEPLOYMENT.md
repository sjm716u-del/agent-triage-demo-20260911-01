# OPC 一人公司工作台 — 部署文档

> 本文档说明如何将 OPC 工作台部署到生产环境，涵盖 GitHub Pages（推荐）、Nginx、CDN 等多种方案。

---

## 1. 部署方式总览

| 方案 | 适用场景 | 难度 | 成本 |
|------|---------|------|------|
| GitHub Pages（推荐） | 原型/演示/小型项目 | ⭐ | 免费 |
| Nginx 静态托管 | 自有服务器/生产环境 | ⭐⭐ | 服务器成本 |
| CDN（Cloudflare/阿里云） | 高并发/全球分发 | ⭐⭐⭐ | 按流量计费 |
| Vercel / Netlify | 一键部署/HTTPS 自动 | ⭐ | 免费额度 |

本项目为**纯静态站点**（HTML/CSS/JS），无服务端运行时，任意静态托管方案均可。

---

## 2. 方案一：GitHub Pages（已配置）

仓库已内置 `.github/workflows/deploy.yml`，推送 `main` 分支即自动部署。

### 2.1 开启 Pages

1. 进入仓库 → **Settings** → **Pages**
2. **Build and deployment** → **Source** 选择 **GitHub Actions**
3. 保存后自动触发首次部署

### 2.2 访问地址

```
https://<你的用户名>.github.io/<仓库名>/
```

当前仓库地址：
```
https://sjm716u-del.github.io/agent-triage-demo-20260911-01/
```

### 2.3 部署工作流说明

`.github/workflows/deploy.yml` 关键步骤：

```yaml
on:
  push:
    branches: [main]        # 推送到 main 自动触发
  workflow_dispatch:        # 支持手动触发

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4                    # 拉取代码
      - uses: actions/configure-pages@v5             # 配置 Pages
      - uses: actions/upload-pages-artifact@v3        # 打包整个仓库
        with: { path: '.' }
      - uses: actions/deploy-pages@v4                 # 部署到 Pages
```

### 2.4 自定义域名（可选）

1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名（如 `opc.example.com`）
2. 在域名服务商添加 CNAME 记录指向 `<用户名>.github.io`
3. 等待 DNS 生效（通常几分钟到几小时）

---

## 3. 方案二：Nginx 静态托管

适用于自有 Linux 服务器，性能与可控性最佳。

### 3.1 环境要求

- Ubuntu 20.04+ / CentOS 7+
- Nginx 1.18+

### 3.2 安装 Nginx

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y nginx

# CentOS / RHEL
sudo yum install -y nginx
sudo systemctl enable --now nginx
```

### 3.3 上传项目文件

```bash
# 在本地打包
tar -czf opc-workbench.tar.gz *.html *.css *.js .github

# 上传到服务器
scp opc-workbench.tar.gz user@your-server:/tmp/

# 在服务器解压到 Nginx 目录
sudo mkdir -p /var/www/opc-workbench
sudo tar -xzf /tmp/opc-workbench.tar.gz -C /var/www/opc-workbench
sudo chown -R www-data:www-data /var/www/opc-workbench
```

### 3.4 Nginx 配置

创建 `/etc/nginx/sites-available/opc-workbench`：

```nginx
server {
    listen 80;
    server_name opc.example.com;   # 替换为你的域名或 IP

    root /var/www/opc-workbench;
    index index.html;

    # 静态资源缓存策略
    location ~* \.(css|js|svg|png|jpg|jpeg|gif|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # HTML 不缓存，确保更新即时生效
    location ~* \.html$ {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # SPA 回退（本项目为多页，按需启用）
    # try_files $uri $uri/ =404;

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1024;
}
```

启用并重启：

```bash
sudo ln -s /etc/nginx/sites-available/opc-workbench /etc/nginx/sites-enabled/
sudo nginx -t          # 测试配置
sudo systemctl reload nginx
```

### 3.5 配置 HTTPS（推荐）

使用 Certbot 免费申请 Let's Encrypt 证书：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d opc.example.com
```

Certbot 会自动修改 Nginx 配置并配置自动续期。

---

## 4. 方案三：CDN 加速

将静态资源托管到 CDN，提升全球访问速度。

### 4.1 Cloudflare Pages

1. 登录 Cloudflare → **Workers & Pages** → **Create** → **Pages**
2. 连接 GitHub 仓库
3. 构建命令留空，输出目录设为 `/`（根目录）
4. 部署完成后获得 `*.pages.dev` 域名

### 4.2 阿里云 OSS + CDN

1. 创建 OSS Bucket，开启静态网站托管
2. 上传所有 HTML/CSS/JS 文件
3. 配置 CDN 加速域名，回源指向 OSS
4. 设置缓存规则：HTML 不缓存，CSS/JS 缓存 30 天

---

## 5. 方案四：Vercel / Netlify

### 5.1 Vercel

```bash
npm i -g vercel
cd opc-workbench
vercel --prod
```

或在 vercel.com 导入 GitHub 仓库，框架预设选 **Other**，构建命令留空，输出目录 `.`。

### 5.2 Netlify

在 netlify.com 拖拽项目文件夹到部署区，或连接 GitHub 仓库，构建命令留空，发布目录 `.`。

---

## 6. 部署验证清单

部署完成后，按以下清单逐项验证：

- [ ] 首页 `index.html` 可正常加载，样式与 JS 无 404
- [ ] 左侧导航栏各页面可正常跳转
- [ ] 顶部主题切换器 4 个圆点可切换主题
- [ ] `vivo.html` 小V Claw 对话可发送消息并收到模拟回复
- [ ] 后台 `admin-users.html` 等页面表格数据正常渲染
- [ ] 浏览器控制台无 JS 报错
- [ ] 页面在 1920×1080 分辨率下布局无错位
- [ ] 移动端（375px 宽度）下可正常浏览（响应式适配）

---

## 7. 更新与回滚

### 7.1 更新内容

**GitHub Pages**：直接推送 `main` 分支，1-2 分钟自动生效。

**Nginx**：覆盖 `/var/www/opc-workbench` 下对应文件即可，无需重启 Nginx（静态文件变更即时生效）。

### 7.2 回滚

**Git 回滚**：
```bash
git log --oneline                    # 查看提交历史
git revert <commit-hash>             # 撤销指定提交
git push origin main
```

**Nginx 回滚**：将备份的旧版本文件覆盖回 `/var/www/opc-workbench`。

---

## 8. 性能优化建议

### 8.1 资源压缩

部署前对 CSS/JS 进行压缩：

```bash
# 使用 terser 压缩 JS
npx terser mock.js api.js -c -m -o mock.min.js

# 使用 clean-css 压缩 CSS
npx clean-css-cli styles.css -o styles.min.css
```

压缩后需更新 HTML 中的 `<script src>` 和 `<link href>` 引用。

### 8.2 缓存策略

| 资源类型 | 缓存时间 | 说明 |
|---------|---------|------|
| HTML | 不缓存 | 确保更新即时生效 |
| CSS / JS | 30 天 | 文件名加 hash 后可设更长 |
| 图片 / SVG | 30 天 | |
| 字体 | 一年 | |

### 8.3 图片优化

当前项目使用内联 SVG 图标，无外部图片。如后续添加图片，建议：
- 使用 WebP/AVIF 格式
- 图片宽度不超过展示尺寸的 2 倍
- 列表页使用懒加载（`loading="lazy"`）

---

## 9. 安全建议

1. **HTTPS 强制**：生产环境必须启用 HTTPS，Nginx 配置 HTTP 自动跳转 HTTPS
2. **CSP 头**：可添加 Content-Security-Policy 限制脚本来源
3. **依赖审计**：本项目无外部 JS 依赖，无供应链风险
4. **敏感信息**：`mock.js` 中的 API Key 为脱敏演示数据，真实接入后端后前端不存储任何密钥

---

## 10. 监控与运维

### 10.1 可用性监控

- 使用 UptimeRobot / 阿里云云监控定时访问首页，检测 HTTP 200
- 配置邮件/短信告警

### 10.2 访问统计

- GitHub Pages：仓库 Insights → Traffic 查看访问量
- Nginx：分析 `/var/log/nginx/access.log`
- 可接入百度统计 / Google Analytics（在 HTML 中添加统计代码）

### 10.3 日志轮转（Nginx）

```bash
sudo logrotate -f /etc/logrotate.d/nginx
```

默认 Nginx 日志已配置轮转，无需额外操作。

---

## 11. 常见问题

**Q：GitHub Pages 部署后页面 404？**
A：确认 Settings → Pages → Source 已设为 "GitHub Actions"，且 `deploy.yml` 工作流已成功运行（Actions 页签查看）。

**Q：页面样式丢失，控制台报 `styles.css` 404？**
A：确认 `styles.css` 与 HTML 在同一目录，且文件名大小写正确（GitHub Pages 区分大小写）。

**Q：主题切换不生效？**
A：检查 `localStorage` 是否被禁用，或 `styles.css` 中 `[data-theme="..."]` 选择器是否存在。

**Q：Nginx 部署后页面空白？**
A：检查 `nginx -t` 配置是否正确，确认 `root` 路径与文件实际位置一致，查看 `/var/log/nginx/error.log`。

**Q：如何将前端对接真实后端？**
A：参见 `DEVELOPMENT.md` 第 8 节，将 `api.js` 中的 mock 函数替换为 `fetch()` 调用，接口前缀按约定实现。
