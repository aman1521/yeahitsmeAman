#!/usr/bin/env bash
# Turnkey Deployment Script for DigitalOcean Droplet (159.65.148.246)
# Runs pythonFlask_MySQL.py as a persistent systemd service connected to MySQL

set -e

APP_DIR="/var/www/ecommerce-admin"
echo "=== Step 1: Preparing directory $APP_DIR ==="
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo "=== Step 2: Creating Python virtualenv and installing dependencies ==="
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Step 3: Setting up systemd service ==="
cat << 'EOF' > /etc/systemd/system/peenakaa-api.service
[Unit]
Description=Peenakaa Ecommerce Flask API Backend
After=network.target mysql.service

[Service]
User=root
WorkingDirectory=/var/www/ecommerce-admin
Environment="PATH=/var/www/ecommerce-admin/venv/bin"
EnvironmentFile=/var/www/ecommerce-admin/.env
ExecStart=/var/www/ecommerce-admin/venv/bin/gunicorn --workers 2 --bind 0.0.0.0:8800 pythonFlask_MySQL:app --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo "=== Step 4: Reloading systemd and enabling service ==="
systemctl daemon-reload
systemctl enable peenakaa-api
systemctl restart peenakaa-api
systemctl status peenakaa-api --no-pager

echo "=== Peenakaa API is LIVE on port 8800! ==="
echo "Test endpoint: curl http://127.0.0.1:8800/api/dashboard/stats"

