# OPC 一人公司工作台 — Docker 部署文件
# 多阶段构建：最终镜像仅包含 Nginx + 静态资源，体积最小化

# ===== 阶段 1：构建（压缩静态资源，可选） =====
FROM node:20-alpine AS builder
WORKDIR /build
COPY opc-workbench/ ./

# 若 terser / clean-css 可用则压缩，否则跳过（不阻塞构建）
RUN npm install -g terser clean-css-cli 2>/dev/null \
  && for f in *.js; do [ -f "$f" ] && terser "$f" -c -m -o "${f%.js}.min.js" && mv "${f%.js}.min.js" "$f"; done 2>/dev/null || true \
  && for f in *.css; do [ -f "$f" ] && cleancss "$f" -o "${f%.css}.min.css" && mv "${f%.css}.min.css" "$f"; done 2>/dev/null || true

# ===== 阶段 2：运行（Nginx 托管静态资源） =====
FROM nginx:1.27-alpine
LABEL maintainer="OPC Workbench"
LABEL description="OPC 一人公司工作台 — 静态站点镜像"

# 复制 Nginx 配置
COPY nginx/opc-workbench.conf /etc/nginx/conf.d/default.conf

# 复制静态资源
COPY --from=builder /build/ /usr/share/nginx/html/

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/index.html || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
