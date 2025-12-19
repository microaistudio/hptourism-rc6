# HP Tourism Portal - Installation Prerequisites

**Version:** 0.6.1  
**Last Updated:** December 14, 2024

---

## System Requirements

### Operating System
- **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS** (recommended)
- **Minimum:** 2 CPU cores, 4GB RAM, 20GB disk space
- **Recommended:** 4 CPU cores, 8GB RAM, 50GB disk space

### Network Requirements
- **Internet access** (for initial package installation)
- **Open ports:** 80 (HTTP), 443 (HTTPS), 5050 (application)
- **Domain name** (optional, for production deployment)

---

## Required Software (Must Install Before Running Installer)

### 1. Node.js v20+ (CRITICAL - Must be installed first)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Verify installation
node -v    # Should show v20.x or higher
npm -v     # Should show v10.x or higher
```

**Why required:** The application is built on Node.js and requires v20+ for compatibility.

---

## Auto-Installed Components

The installer will automatically install the following if not present:

### 2. PostgreSQL 16
- **Purpose:** Database server
- **Auto-installed:** Yes (via apt-get)
- **Configuration:** Automatic (database, user, extensions)

### 3. Nginx
- **Purpose:** Web server and reverse proxy
- **Auto-installed:** Yes (via apt-get)
- **Configuration:** Automatic (site config, proxy to port 5050)

### 4. PM2
- **Purpose:** Process manager for Node.js
- **Auto-installed:** Yes (via npm global)
- **Configuration:** Automatic (startup script, monitoring)

---

## Optional Post-Installation

### 5. SSL Certificate (Recommended for Production)

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com
```

### 6. Firewall Configuration (Recommended)

```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Pre-Installation Checklist

- [ ] Ubuntu 22.04 or 24.04 installed
- [ ] System has internet access
- [ ] Node.js v20+ installed and verified
- [ ] Domain name configured (if using)
- [ ] DNS A record pointing to server IP (if using domain)
- [ ] Firewall allows ports 80, 443
- [ ] Root/sudo access available

---

## Installation Command

Once prerequisites are met:

```bash
# Extract installer package
tar -xzf hptourism-v0.6.1-offline.tar.gz
cd hptourism-v0.6.1-offline

# Run installer (requires sudo)
sudo ./install.sh
```

---

## Verification

After installation completes:

```bash
# Check PM2 status
sudo pm2 list

# Check application health
curl http://localhost:5050/api/health

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql
```

---

## Default Credentials

**Super Admin:**
- Username: `superadmin`
- Password: `Ulan@2025`

**Admin:**
- Username: `admin`
- Password: `Admin@2025`

---

## Directory Structure

```
/opt/hptourism/
├── app/                    # Application code
│   ├── dist/              # Compiled application
│   ├── node_modules/      # Dependencies
│   ├── migrations/        # Database migrations
│   ├── Database/          # Seed scripts
│   └── .env              # Configuration
├── data/                  # Persistent data
│   ├── uploads/          # User document uploads
│   └── logs/             # Application logs
└── backups/              # Automated backups
    ├── db/               # Database dumps
    └── app/              # App version snapshots
```

---

## Support

For issues or questions:
- Check logs: `sudo pm2 logs hptourism-rc5`
- View PM2 status: `sudo pm2 list`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Database logs: `sudo tail -f /var/log/postgresql/postgresql-16-main.log`
