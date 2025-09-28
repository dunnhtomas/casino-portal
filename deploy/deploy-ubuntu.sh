#!/usr/bin/env bash
# Deploy script for Ubuntu 24.04 (run from CI or admin workstation)
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 user@host /path/to/site-root (e.g. user@server:/var/www/bcp)"
  exit 2
fi

REMOTE=$1
REMOTE_PATH=${2:-/var/www/bcp}
SITE_DOMAIN=${3:-example.com}

echo "Building static site..."
npm ci
npm run build

echo "Syncing dist/ to ${REMOTE}:${REMOTE_PATH}"
rsync -avz --delete dist/ ${REMOTE}:${REMOTE_PATH}/

echo "Syncing backend (if exists)"
rsync -avz --delete deploy/backend/ ${REMOTE}:${REMOTE_PATH}/backend/

echo "Installing backend deps and enabling service on remote"
ssh ${REMOTE} <<'EOF'
  if [ -d "${REMOTE_PATH}/backend" ]; then
    cd ${REMOTE_PATH}/backend
    sudo npm ci --production
    sudo mv /etc/systemd/system/bcp-backend.service /etc/systemd/system/bcp-backend.service || true
    sudo systemctl daemon-reload
    sudo systemctl enable --now bcp-backend.service || true
  fi
EOF

# If SENTRY_DSN is provided in the local environment, create a systemd drop-in to set it for the service
if [ -n "${SENTRY_DSN:-}" ]; then
  echo "Configuring SENTRY_DSN for backend service"
  ssh ${REMOTE} <<EOF
    sudo mkdir -p /etc/systemd/system/bcp-backend.service.d
    echo -e "[Service]\nEnvironment=SENTRY_DSN='${SENTRY_DSN}'" | sudo tee /etc/systemd/system/bcp-backend.service.d/override.conf
    sudo systemctl daemon-reload
    sudo systemctl restart bcp-backend.service || true
EOF
fi

echo "Installing nginx and certbot on remote"
ssh ${REMOTE} <<'EOF'
  sudo apt-get update
  sudo apt-get install -y nginx certbot python3-certbot-nginx
  sudo mkdir -p ${REMOTE_PATH}
  sudo chown -R $USER:www-data ${REMOTE_PATH}
EOF

echo "Uploading nginx site config"
rsync -avz deploy/nginx/bcp.conf ${REMOTE}:/tmp/bcp.conf
ssh ${REMOTE} sudo mv /tmp/bcp.conf /etc/nginx/sites-available/bcp.conf || true
ssh ${REMOTE} sudo ln -sf /etc/nginx/sites-available/bcp.conf /etc/nginx/sites-enabled/bcp.conf

echo "Reloading nginx"
ssh ${REMOTE} sudo nginx -t && sudo systemctl reload nginx

echo "Requesting TLS cert via certbot (interactive)"
if [ "${SKIP_CERTBOT:-0}" != "1" ]; then
  ssh ${REMOTE} sudo certbot --nginx -d ${SITE_DOMAIN}
else
  echo "SKIP_CERTBOT set — skipping certbot step"
fi

echo "Deploy complete. Verify site at: https://${SITE_DOMAIN}"

echo "If you have a backend API, upload and enable the systemd service: deploy/backend.service"

echo "Deploying logrotate rules and tmpfiles for log directory"
rsync -avz deploy/logrotate/bcp ${REMOTE}:/tmp/bcp-logrotate
rsync -avz deploy/tmpfiles/bcp.conf ${REMOTE}:/tmp/bcp-tmpfiles.conf
ssh ${REMOTE} <<'EOF'
  # Create log dir and set permissions
  sudo mkdir -p /var/log/bcp
  sudo chown www-data:adm /var/log/bcp
  sudo chmod 0755 /var/log/bcp

  # Install tmpfiles entry
  sudo mv /tmp/bcp-tmpfiles.conf /etc/tmpfiles.d/bcp.conf
  sudo systemd-tmpfiles --create /etc/tmpfiles.d/bcp.conf || true

  # Install logrotate rule
  sudo mv /tmp/bcp-logrotate /etc/logrotate.d/bcp
  sudo chmod 0644 /etc/logrotate.d/bcp
  # Force a logrotate run to create rotated files if needed
  sudo logrotate -f /etc/logrotate.d/bcp || true
EOF
