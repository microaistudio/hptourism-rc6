#!/bin/bash
# HP Tourism Portal - Upgrade Script
# Upgrades existing installation while preserving data
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${HPTOURISM_INSTALL_DIR:-/opt/hptourism}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "============================================"
echo "  HP Tourism Portal - Upgrade"
echo "  Version: 0.6.1"
echo "============================================"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

# Check existing installation - support both old and new structure
if [ -d "$APP_DIR/app" ]; then
    # New structure
    CODE_DIR="$APP_DIR/app"
    log_info "Detected new directory structure (app/ subdirectory)"
elif [ -d "$APP_DIR/dist" ]; then
    # Old flat structure
    CODE_DIR="$APP_DIR"
    log_warn "Detected old flat structure - will upgrade in place"
else
    log_error "No existing installation found at $APP_DIR"
    log_info "Run setup-fresh.sh for new installation"
    exit 1
fi

# Backup existing .env
if [ -f "$CODE_DIR/.env" ]; then
    log_info "Backing up .env..."
    cp "$CODE_DIR/.env" "$CODE_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Stop application
log_info "Stopping application..."
pm2 stop hptourism 2>/dev/null || true

# Backup existing installation to backups folder
BACKUP_NAME="app-$(date +%Y%m%d_%H%M%S).tar.gz"
mkdir -p "$APP_DIR/backups/app"
log_info "Backing up to $APP_DIR/backups/app/$BACKUP_NAME..."
tar -czf "$APP_DIR/backups/app/$BACKUP_NAME" -C "$CODE_DIR" .

# Update application files
log_info "Updating application files..."
cp -r dist/* "$CODE_DIR/dist/"
cp -r shared/* "$CODE_DIR/shared/"
cp -r migrations/* "$CODE_DIR/migrations/" 2>/dev/null || true
cp -r node_modules/* "$CODE_DIR/node_modules/"
cp package.json "$CODE_DIR/"
cp ecosystem.config.cjs "$CODE_DIR/"
cp drizzle.config.ts "$CODE_DIR/"

# Run database migrations
log_info "Running database migrations..."
cd "$CODE_DIR"
npx drizzle-kit push

# Restart application
log_info "Starting application..."
pm2 restart hptourism

# Health check
log_info "Waiting for application to start..."
sleep 5

APP_PORT=$(grep PORT "$CODE_DIR/.env" | cut -d'=' -f2 | tr -d ' ')
APP_PORT="${APP_PORT:-5050}"

if curl -s http://localhost:$APP_PORT/api/health > /dev/null; then
    log_success "Application health check passed!"
else
    log_warn "Health check failed - application may still be starting"
    log_info "Check logs with: pm2 logs hptourism"
fi

echo ""
echo "============================================"
echo "  ✅ Upgrade Complete!"
echo "============================================"
echo ""
echo "Backup saved to: $APP_DIR/backups/app/$BACKUP_NAME"
echo ""
echo "To rollback:"
echo "  pm2 stop hptourism"
echo "  cd $CODE_DIR && tar -xzf $APP_DIR/backups/app/$BACKUP_NAME"
echo "  pm2 restart hptourism"
echo ""

