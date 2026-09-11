#!/usr/bin/env bash
# =============================================================================
# OPC Workbench — 远程服务器一键部署脚本（Nginx）
# 适用：将本地项目上传到远程 Linux 服务器并通过 Nginx 托管
# 用法：
#   ./deploy/server-deploy.sh user@your-server.com
#   ./deploy/server-deploy.sh user@your-server.com --port 8080
# =============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="${PROJECT_DIR}/opc-workbench"
REMOTE="${1:-}"
REMOTE_PORT="${2:-80}"
WEBROOT="/var/www/opc-workbench"
TMP_PKG="/tmp/opc-workbench-$(date +%Y%m%d%H%M%S).tar.gz"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
log_info() { echo -e "${CYAN}[INFO]${NC} $*"; }
log_ok()   { echo -e "${GREEN}[OK]${NC}   $*"; }
log_err()  { echo -e "${RED}[ERR]${NC}  $*"; }

if [[ -z "$REMOTE" ]]; then
  echo "用法: $0 <user@host> [--port <port>]"
  echo "示例: $0 deploy@192.168.1.100 --port 8080"
  exit 1
fi

# 解析可选参数
shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) REMOTE_PORT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

log_info "打包部署产物..."
cd "$SRC_DIR"
tar -czf "$TMP_PKG" --exclude='*.md' .
log_ok "打包完成: $TMP_PKG ($(du -h "$TMP_PKG" | cut -f1))"

log_info "上传到远程服务器: $REMOTE"
scp "$TMP_PKG" "${REMOTE}:/tmp/"

log_info "在远程服务器执行部署..."
ssh "$REMOTE" bash -s <<REMOTE_SCRIPT
  set -e
  echo "[远程] 停止旧版本备份..."
  sudo mkdir -p ${WEBROOT}
  if [[ -d ${WEBROOT} && \$(ls -A ${WEBROOT} 2>/dev/null) ]]; then
    sudo tar -czf /tmp/opc-workbench-backup-\$(date +%Y%m%d%H%M%S).tar.gz -C ${WEBROOT} .
  fi

  echo "[远程] 解压新版本..."
  sudo rm -rf ${WEBROOT}/*
  sudo tar -xzf ${TMP_PKG} -C ${WEBROOT}
  sudo chown -R www-data:www-data ${WEBROOT} 2>/dev/null || sudo chown -R nginx:nginx ${WEBROOT} 2>/dev/null

  echo "[远程] 写入 Nginx 配置..."
  sudo tee /etc/nginx/sites-available/opc-workbench > /dev/null <<'NGINX'
server {
    listen ${REMOTE_PORT};
    server_name _;
    root ${WEBROOT};
    index index.html;
    charset utf-8;

    location ~* \.html\$ {
        add_header Cache-Control "no-cache, must-revalidate";
    }
    location ~* \.(css|js|svg|png|jpg|jpeg|gif|ico|woff2?)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1024;
}
NGINX

  sudo ln -sf /etc/nginx/sites-available/opc-workbench /etc/nginx/sites-enabled/ 2>/dev/null || true
  sudo nginx -t && sudo systemctl reload nginx
  echo "[远程] 部署完成，健康检查..."
  sleep 1
  curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:${REMOTE_PORT}/index.html
REMOTE_SCRIPT

log_ok "远程部署完成！"
log_info "访问: http://$(echo "$REMOTE" | cut -d@ -f2):${REMOTE_PORT}/index.html"
rm -f "$TMP_PKG"
