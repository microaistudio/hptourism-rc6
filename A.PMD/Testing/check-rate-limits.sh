#!/usr/bin/env bash
set -euo pipefail

# Usage: bash check-rate-limits.sh [/path/to/app] [pm2_app_name] [systemd_service_name]
APP_DIR="${1:-$(pwd)}"
APP_NAME="${2:-hptourism-rc5}"
SERVICE_NAME="${3:-hptourism}"

KEYS=(
  SECURITY_ENABLE_RATE_LIMIT
  RATE_LIMIT_WINDOW_MS
  RATE_LIMIT_MAX_REQUESTS
  RATE_LIMIT_AUTH_WINDOW_MS
  RATE_LIMIT_AUTH_MAX_REQUESTS
  RATE_LIMIT_UPLOAD_WINDOW_MS
  RATE_LIMIT_UPLOAD_MAX_REQUESTS
)

echo "app_dir=$APP_DIR"
echo "app_name=$APP_NAME"
echo "service_name=$SERVICE_NAME"

show_file() {
  local file="$1"
  local label="$2"
  echo "[$label] $file"
  if command -v rg >/dev/null 2>&1; then
    if ! rg -n "^(SECURITY_ENABLE_RATE_LIMIT|RATE_LIMIT_)" "$file"; then
      echo "  (no rate-limit keys set)"
    fi
  else
    if ! grep -nE "^(SECURITY_ENABLE_RATE_LIMIT|RATE_LIMIT_)" "$file"; then
      echo "  (no rate-limit keys set)"
    fi
  fi
}

echo "[shell env]"
for k in "${KEYS[@]}"; do
  if [ -n "${!k:-}" ]; then
    echo "$k=${!k}"
  fi
done
if [ -n "${HPT_ENV_FILE:-}" ]; then
  echo "HPT_ENV_FILE=${HPT_ENV_FILE}"
  if [ -f "$HPT_ENV_FILE" ]; then
    show_file "$HPT_ENV_FILE" "shell_env_file"
  fi
fi

if command -v pm2 >/dev/null 2>&1; then
  PM2_INFO="$(node - "$APP_NAME" <<'NODE'
const { execSync } = require("child_process");
const appName = process.argv[2];
let list = [];
try {
  list = JSON.parse(execSync("pm2 jlist", { encoding: "utf8" }));
} catch {
  process.exit(0);
}
if (!Array.isArray(list) || list.length === 0) process.exit(0);

let app = list.find((a) => a?.name === appName);
if (!app) app = list.find((a) => a?.name?.includes("hptourism"));
if (!app) app = list[0];

const env = app?.pm2_env?.env || {};
const cwd = app?.pm2_env?.pm_cwd || "";
const keys = [
  "SECURITY_ENABLE_RATE_LIMIT",
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX_REQUESTS",
  "RATE_LIMIT_AUTH_WINDOW_MS",
  "RATE_LIMIT_AUTH_MAX_REQUESTS",
  "RATE_LIMIT_UPLOAD_WINDOW_MS",
  "RATE_LIMIT_UPLOAD_MAX_REQUESTS",
];

const lines = [];
lines.push(`PM2_APP=${app?.name || ""}`);
if (cwd) lines.push(`PM2_CWD=${cwd}`);
if (env.HPT_ENV_FILE) lines.push(`PM2_HPT_ENV_FILE=${env.HPT_ENV_FILE}`);
for (const k of keys) {
  if (env[k] !== undefined) lines.push(`PM2_ENV_${k}=${env[k]}`);
}
process.stdout.write(lines.join("\n"));
NODE
)"
  if [ -n "$PM2_INFO" ]; then
    echo "[pm2]"
    echo "$PM2_INFO"
    PM2_ENV_FILE="$(echo "$PM2_INFO" | awk -F= '/^PM2_HPT_ENV_FILE=/{print $2; exit}')"
    PM2_CWD="$(echo "$PM2_INFO" | awk -F= '/^PM2_CWD=/{print $2; exit}')"
    if [ -n "$PM2_ENV_FILE" ] && [ -f "$PM2_ENV_FILE" ]; then
      show_file "$PM2_ENV_FILE" "pm2_env_file"
    elif [ -n "$PM2_CWD" ] && [ -f "$PM2_CWD/.env" ]; then
      show_file "$PM2_CWD/.env" "pm2_cwd_env"
    fi
  fi
fi

if command -v systemctl >/dev/null 2>&1; then
  if systemctl list-units --all --type=service 2>/dev/null | grep -q "$SERVICE_NAME"; then
    echo "[systemd]"
    env_files="$(systemctl show -p EnvironmentFile "$SERVICE_NAME" 2>/dev/null | cut -d= -f2-)"
    if [ -n "$env_files" ]; then
      echo "EnvironmentFile=$env_files"
      for f in $env_files; do
        f="${f#-}"
        [ -f "$f" ] && show_file "$f" "systemd_env_file"
      done
    else
      systemctl show -p Environment "$SERVICE_NAME" 2>/dev/null || true
    fi
  fi
fi

for f in "$APP_DIR/.env" "$APP_DIR/.env.production" "$APP_DIR/.env.local" "$APP_DIR/.env.staging"; do
  if [ -f "$f" ]; then
    show_file "$f" "env_file"
  fi
done

echo "[defaults]"
echo "SECURITY_ENABLE_RATE_LIMIT=true"
echo "RATE_LIMIT_WINDOW_MS=900000"
echo "RATE_LIMIT_MAX_REQUESTS=500"
echo "RATE_LIMIT_AUTH_WINDOW_MS=600000"
echo "RATE_LIMIT_AUTH_MAX_REQUESTS=20"
echo "RATE_LIMIT_UPLOAD_WINDOW_MS=600000"
echo "RATE_LIMIT_UPLOAD_MAX_REQUESTS=30"
