#!/usr/bin/env bash
set -euo pipefail

# Usage: bash set-rate-limits-high.sh [/path/to/app-or-envfile] [pm2_app_name] [systemd_service_name]
APP_DIR="${1:-$(pwd)}"
APP_NAME="${2:-hptourism-rc5}"
SERVICE_NAME="${3:-hptourism}"

# High preset (override by exporting these before running)
RATE_LIMIT_WINDOW_MS="${RATE_LIMIT_WINDOW_MS:-900000}"          # 15m
RATE_LIMIT_MAX_REQUESTS="${RATE_LIMIT_MAX_REQUESTS:-5000}"
RATE_LIMIT_AUTH_WINDOW_MS="${RATE_LIMIT_AUTH_WINDOW_MS:-600000}" # 10m
RATE_LIMIT_AUTH_MAX_REQUESTS="${RATE_LIMIT_AUTH_MAX_REQUESTS:-200}"
RATE_LIMIT_UPLOAD_WINDOW_MS="${RATE_LIMIT_UPLOAD_WINDOW_MS:-600000}" # 10m
RATE_LIMIT_UPLOAD_MAX_REQUESTS="${RATE_LIMIT_UPLOAD_MAX_REQUESTS:-200}"

ENV_FILE=""

if [ -f "$APP_DIR" ]; then
  ENV_FILE="$APP_DIR"
else
  if [ -n "${HPT_ENV_FILE:-}" ] && [ -f "$HPT_ENV_FILE" ]; then
    ENV_FILE="$HPT_ENV_FILE"
  fi

  if [ -z "$ENV_FILE" ] && command -v pm2 >/dev/null 2>&1; then
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

const lines = [];
if (env.HPT_ENV_FILE) lines.push(`PM2_HPT_ENV_FILE=${env.HPT_ENV_FILE}`);
if (cwd) lines.push(`PM2_CWD=${cwd}`);
process.stdout.write(lines.join("\n"));
NODE
)"
    PM2_ENV_FILE="$(echo "$PM2_INFO" | awk -F= '/^PM2_HPT_ENV_FILE=/{print $2; exit}')"
    PM2_CWD="$(echo "$PM2_INFO" | awk -F= '/^PM2_CWD=/{print $2; exit}')"
    if [ -n "$PM2_ENV_FILE" ] && [ -f "$PM2_ENV_FILE" ]; then
      ENV_FILE="$PM2_ENV_FILE"
    elif [ -n "$PM2_CWD" ] && [ -f "$PM2_CWD/.env" ]; then
      ENV_FILE="$PM2_CWD/.env"
    fi
  fi

  if [ -z "$ENV_FILE" ] && command -v systemctl >/dev/null 2>&1; then
    if systemctl list-units --all --type=service 2>/dev/null | grep -q "$SERVICE_NAME"; then
      env_files="$(systemctl show -p EnvironmentFile "$SERVICE_NAME" 2>/dev/null | cut -d= -f2-)"
      for f in $env_files; do
        f="${f#-}"
        if [ -f "$f" ]; then
          ENV_FILE="$f"
          break
        fi
      done
    fi
  fi

  if [ -z "$ENV_FILE" ]; then
    for f in "$APP_DIR/.env" "$APP_DIR/.env.production" "$APP_DIR/.env.local" "$APP_DIR/.env.staging"; do
      if [ -f "$f" ]; then
        ENV_FILE="$f"
        break
      fi
    done
  fi
fi

if [ -z "$ENV_FILE" ]; then
  echo "Could not locate env file. Pass the env file path as the first arg." >&2
  exit 1
fi

export RATE_LIMIT_WINDOW_MS RATE_LIMIT_MAX_REQUESTS RATE_LIMIT_AUTH_WINDOW_MS \
  RATE_LIMIT_AUTH_MAX_REQUESTS RATE_LIMIT_UPLOAD_WINDOW_MS RATE_LIMIT_UPLOAD_MAX_REQUESTS

node - "$ENV_FILE" <<'NODE'
const fs = require("fs");

const envPath = process.argv[2];
const updates = {
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_AUTH_WINDOW_MS: process.env.RATE_LIMIT_AUTH_WINDOW_MS,
  RATE_LIMIT_AUTH_MAX_REQUESTS: process.env.RATE_LIMIT_AUTH_MAX_REQUESTS,
  RATE_LIMIT_UPLOAD_WINDOW_MS: process.env.RATE_LIMIT_UPLOAD_WINDOW_MS,
  RATE_LIMIT_UPLOAD_MAX_REQUESTS: process.env.RATE_LIMIT_UPLOAD_MAX_REQUESTS,
};

const input = fs.readFileSync(envPath, "utf8");
const lines = input.split(/\r?\n/);
const seen = new Set();

const out = lines.map((line) => {
  if (!line || line.trim().startsWith("#") || !line.includes("=")) {
    return line;
  }
  const idx = line.indexOf("=");
  const key = line.slice(0, idx);
  if (Object.prototype.hasOwnProperty.call(updates, key)) {
    seen.add(key);
    return `${key}=${updates[key]}`;
  }
  return line;
});

for (const [key, value] of Object.entries(updates)) {
  if (!seen.has(key)) {
    out.push(`${key}=${value}`);
  }
}

let output = out.join("\n");
if (!output.endsWith("\n")) output += "\n";
fs.writeFileSync(envPath, output);
NODE

echo "Updated $ENV_FILE"
if command -v rg >/dev/null 2>&1; then
  rg -n "^(SECURITY_ENABLE_RATE_LIMIT|RATE_LIMIT_)" "$ENV_FILE" || true
else
  grep -nE "^(SECURITY_ENABLE_RATE_LIMIT|RATE_LIMIT_)" "$ENV_FILE" || true
fi
