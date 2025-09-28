Production deployment guide — Ubuntu 24.04 + Nginx

Overview
- Build the Astro static site and serve it with Nginx.
- Optionally run a small Node backend for /api routes (systemd sample provided).
- Enable gzip and brotli compression, set long cache headers for assets, and secure HTTP headers.

1) Server prerequisites (Ubuntu 24.04)
- Create a non-root user with sudo privileges.
- Install required packages:
  sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx nodejs npm

2) Build locally and upload
- Locally run:
  npm ci
  npm run build
- Copy artifacts to server (example uses rsync):
  rsync -avz --delete dist/ user@yourserver:/var/www/bcp/

3) Nginx configuration
- Copy deploy/nginx/bcp.conf to /etc/nginx/sites-available/bcp.conf and enable it:
  sudo ln -s /etc/nginx/sites-available/bcp.conf /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx

4) TLS with Certbot
- Install certbot and run:
  sudo certbot --nginx -d example.com

5) Optional: Backend API
- If you need the /api/perf endpoint, run the Node backend as a systemd service (sample in deploy/backend.service).
- Place your backend code in /var/www/bcp/backend and enable the service:
  sudo mv deploy/backend.service /etc/systemd/system/bcp-backend.service
  sudo systemctl daemon-reload
  sudo systemctl enable --now bcp-backend.service

6) Compression & cache
- The nginx config already sets cache-control headers for static assets. For Brotli, enable the nginx brotli module or use ngx_brotli.
- Add logrotate rules for logs (nginx and perf logs), e.g., /etc/logrotate.d/bcp
- The deploy scripts now install a logrotate rule for /var/log/bcp and a systemd tmpfiles.d entry to ensure the directory exists with correct ownership/permissions.
- Ensure /var/log/bcp is writable by the backend user (www-data) and configure /etc/logrotate.d/bcp if you want different rotation frequency.

7) Security hardening
- Set strict CSP headers carefully to allow fonts and analytics.
- Use HSTS via nginx if site is HTTPS-only.

8) Sanity checks
- Verify that /index.html returns 200 and sitemap.xml exists.
- Validate schema.org using Google's Rich Results test.
- Run a Lighthouse audit against the production URL.

9) Rollback
- Keep previous dist copies in a versioned directory or use simple symlink switches:
  /var/www/bcp/releases/2025-09-28/
  current -> releases/2025-09-28

Manual GitHub Actions deploy

- The repository includes a manual deploy workflow (`.github/workflows/manual-deploy.yml`) that
  rsyncs the built `dist/` to your server and runs smoke checks. To use it, add the following
  repository secrets in GitHub:
  - SSH_PRIVATE_KEY: the private key for a user with SSH access to the server
  - DEPLOY_HOST: the server host or IP
  - DEPLOY_USER: the SSH username
  - DEPLOY_PATH: the target path on the server (e.g., /var/www/bcp)
  - SITE_DOMAIN: the canonical domain used to verify health and perf endpoints
  - SENTRY_DSN: (optional) the Sentry DSN for error reporting. If provided as a secret, the deploy workflow will set SENTRY_DSN in the backend systemd service drop-in.

- The deploy workflow is manual (workflow_dispatch) and will run the following steps:
  - Build and upload assets via rsync
  - Upload backend and deploy configs
  - Run post-deploy remote steps: install backend deps, enable service, reload nginx
  - Run smoke checks against https://<SITE_DOMAIN>/health and POST to https://<SITE_DOMAIN>/api/perf

- If you have TLS provisioning steps (certbot), ensure these are completed before running the manual
  deploy workflow. The deploy script supports skipping certbot by setting SKIP_CERTBOT=1 in the environment.

Contact
- For assistance with automation, CI/CD, or non-root deployment, contact the devops owner.
