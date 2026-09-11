#!/usr/bin/env bash
# =============================================================================
# OPC 一人公司工作台 — 一键自动化部署脚本
# 支持：本地静态服务器部署 / Nginx 服务器部署 / Docker 容器部署
# 用法：
#   ./deploy.sh              # 使用默认本地服务器部署 (python3 http.server)
#   ./deploy.sh --server nginx   # 部署到本机 Nginx
#   ./deploy.sh --port 8080      # 指定端口
#   ./deploy.sh --stop           # 停止本地服务
#   ./deploy.sh --status         # 查看运行状态
# =============================================================================
set -euo pipefail

# ---------- 配置 ----------
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="${PROJECT_DIR}/opc-workbench"
DEPLOY_ROOT="${PROJECT_DIR}/.deploy"
PORT="${PORT:-8080}"
SERVER_MODE="local"
PID_FILE="${DEPLOY_ROOT}/server.pid"
LOG_FILE="${DEPLOY_ROOT}/server.log"
HOST="${HOST:-0.0.0.0}"

# ---------- 颜色输出 ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log_info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_err()   { echo -e "${RED}[ERR]${NC}  $*"; }

# ---------- 用法 ----------
usage() {
  cat <<EOF
OPC Workbench 自动化部署脚本

用法: $0 [选项]

选项:
  --server <mode>   部署模式: local (默认) | nginx | docker
  --port <port>     监听端口 (默认: 8080)
  --host <host>     监听地址 (默认: 0.0.0.0)
  --stop            停止本地服务
  --status          查看运行状态
  --build           构建部署产物（压缩 CSS/JS，可选）
  --help            显示此帮助

示例:
  $0                          # 本地启动，端口 8080
  $0 --port 9000              # 本地启动，端口 9000
  $0 --server nginx           # 部署到本机 Nginx (/var/www/opc-workbench)
  $0 --stop                   # 停止服务
EOF
  exit 0
}

# ---------- 参数解析 ----------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --server) SERVER_MODE="$2"; shift 2 ;;
    --port)   PORT="$2"; shift 2 ;;
    --host)   HOST="$2"; shift 2 ;;
    --stop)   ACTION="stop"; shift ;;
    --status) ACTION="status"; shift ;;
    --build)  ACTION="build"; shift ;;
    --help)   usage ;;
    *) log_err "未知参数: $1"; usage ;;
  esac
done
ACTION="${ACTION:-start}"

# ---------- 环境检查 ----------
check_env() {
  log_info "检查部署环境..."
  if [[ ! -d "$SRC_DIR" ]]; then
    log_err "源目录不存在: $SRC_DIR"
    exit 1
  fi
  if [[ ! -f "$SRC_DIR/index.html" ]]; then
    log_err "index.html 不存在，源目录内容异常"
    exit 1
  fi
  log_ok "源目录校验通过: $SRC_DIR"
}

# ---------- 构建产物（可选压缩） ----------
build_artifact() {
  log_info "准备部署产物到: $DEPLOY_ROOT"
  mkdir -p "$DEPLOY_ROOT"
  rm -rf "${DEPLOY_ROOT:?}"/*
  cp -r "$SRC_DIR"/* "$DEPLOY_ROOT/"

  # 尝试压缩 JS/CSS（若工具可用）
  if command -v npx &>/dev/null; then
    if npx --no-install terser --version &>/dev/null 2>&1; then
      log_info "压缩 JS 文件..."
      for f in "$DEPLOY_ROOT"/*.js; do
        [[ -f "$f" ]] || continue
        npx --no-install terser "$f" -c -m -o "${f%.js}.min.js" 2>/dev/null && mv "${f%.js}.min.js" "$f" && log_ok "  压缩: $(basename "$f")"
      done
    fi
    if npx --no-install clean-css-cli --version &>/dev/null 2>&1; then
      log_info "压缩 CSS 文件..."
      for f in "$DEPLOY_ROOT"/*.css; do
        [[ -f "$f" ]] || continue
        npx --no-install cleancss "$f" -o "${f%.css}.min.css" 2>/dev/null && mv "${f%.css}.min.css" "$f" && log_ok "  压缩: $(basename "$f")"
      done
    fi
  fi
  log_ok "部署产物准备完成"
}

# ---------- 本地服务器部署 ----------
deploy_local() {
  build_artifact
  # 停止已有服务
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    log_warn "停止已有服务 (PID: $(cat "$PID_FILE"))..."
    kill "$(cat "$PID_FILE")" 2>/dev/null || true
    sleep 1
  fi

  log_info "启动本地静态服务器 (端口: $PORT)..."
  cd "$DEPLOY_ROOT"

  if command -v python3 &>/dev/null; then
    nohup python3 -m http.server "$PORT" --bind "$HOST" > "$LOG_FILE" 2>&1 &
  elif command -v node &>/dev/null; then
    cat > /tmp/opc-serve.js <<'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = process.cwd();
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, HOST, () => console.log(`OPC Workbench serving at http://${HOST}:${PORT}`));
EOF
    PORT="$PORT" HOST="$HOST" nohup node /tmp/opc-serve.js > "$LOG_FILE" 2>&1 &
  else
    log_err "未找到 python3 或 node，请安装其一"
    exit 1
  fi

  echo $! > "$PID_FILE"
  sleep 2

  # 健康检查
  health_check "http://127.0.0.1:${PORT}/index.html"

  log_ok "部署成功！"
  log_info "访问地址: http://127.0.0.1:${PORT}/index.html"
  log_info "日志文件: $LOG_FILE"
  log_info "停止服务: $0 --stop"
}

# ---------- Nginx 部署 ----------
deploy_nginx() {
  if ! command -v nginx &>/dev/null; then
    log_err "未安装 Nginx，请先安装: sudo apt install -y nginx"
    exit 1
  fi
  build_artifact
  local webroot="/var/www/opc-workbench"
  log_info "部署到 Nginx 目录: $webroot"
  sudo mkdir -p "$webroot"
  sudo rm -rf "${webroot:?}"/*
  sudo cp -r "$DEPLOY_ROOT"/* "$webroot"/
  sudo chown -R www-data:www-data "$webroot" 2>/dev/null || sudo chown -R nginx:nginx "$webroot" 2>/dev/null || true

  # 写入 Nginx 配置
  local conf="/etc/nginx/sites-available/opc-workbench"
  log_info "写入 Nginx 配置: $conf"
  sudo tee "$conf" > /dev/null <<EOF
server {
    listen ${PORT};
    server_name _;
    root ${webroot};
    index index.html;

    location ~* \.(css|js|svg|png|jpg|jpeg|gif|ico|woff2?)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    location ~* \.html\$ {
        add_header Cache-Control "no-cache, must-revalidate";
    }
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1024;
}
EOF
  sudo ln -sf "$conf" /etc/nginx/sites-enabled/opc-workbench 2>/dev/null || true
  sudo nginx -t && sudo systemctl reload nginx
  health_check "http://127.0.0.1:${PORT}/index.html"
  log_ok "Nginx 部署成功！监听端口: $PORT"
}

# ---------- Docker 部署 ----------
deploy_docker() {
  if ! command -v docker &>/dev/null; then
    log_err "未安装 Docker，请先安装 Docker"
    exit 1
  fi
  log_info "构建 Docker 镜像并启动容器 (端口: $PORT)..."
  docker build -t opc-workbench:latest "$PROJECT_DIR"
  docker rm -f opc-workbench 2>/dev/null || true
  docker run -d --name opc-workbench -p "${PORT}:80" opc-workbench:latest
  sleep 2
  health_check "http://127.0.0.1:${PORT}/index.html"
  log_ok "Docker 部署成功！容器: opc-workbench, 端口: $PORT"
}

# ---------- 健康检查 ----------
health_check() {
  local url="$1"
  log_info "健康检查: $url"
  local max_retries=10
  local i=0
  while [[ $i -lt $max_retries ]]; do
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    if [[ "$code" == "200" ]]; then
      local title
      title=$(curl -s "$url" 2>/dev/null | grep -oP '<title>\K[^<]+' | head -1)
      log_ok "HTTP 200 — 页面标题: ${title}"
      return 0
    fi
    i=$((i+1))
    log_warn "尝试 $i/$max_retries — HTTP $code，等待..."
    sleep 1
  done
  log_err "健康检查失败，服务未正常启动"
  if [[ -f "$LOG_FILE" ]]; then
    log_err "日志:"; tail -20 "$LOG_FILE"
  fi
  exit 1
}

# ---------- 停止 ----------
stop_service() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      log_ok "已停止服务 (PID: $pid)"
    else
      log_warn "进程 $pid 已不存在"
    fi
    rm -f "$PID_FILE"
  else
    log_warn "未找到 PID 文件，尝试按端口查找..."
    local pid
    pid=$(lsof -ti:"$PORT" 2>/dev/null || true)
    if [[ -n "$pid" ]]; then
      kill "$pid" && log_ok "已停止端口 $PORT 上的进程"
    else
      log_warn "端口 $PORT 上未发现运行中的服务"
    fi
  fi
}

# ---------- 状态 ----------
show_status() {
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    log_ok "服务运行中 — PID: $(cat "$PID_FILE"), 端口: $PORT"
    log_info "访问: http://127.0.0.1:${PORT}/index.html"
  else
    log_warn "服务未运行"
  fi
}

# ---------- 主流程 ----------
main() {
  check_env
  case "$ACTION" in
    start)
      case "$SERVER_MODE" in
        local)  deploy_local ;;
        nginx)  deploy_nginx ;;
        docker) deploy_docker ;;
        *) log_err "未知部署模式: $SERVER_MODE"; exit 1 ;;
      esac
      ;;
    stop)   stop_service ;;
    status) show_status ;;
    build)  build_artifact; log_ok "构建完成，产物目录: $DEPLOY_ROOT" ;;
  esac
}

main "$@"
