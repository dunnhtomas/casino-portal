Backend microservice (Perf logging)

This small Express app accepts POST /api/perf and appends JSON telemetry to /var/log/bcp/perf.log.

Local run:
  cd deploy/backend
  npm ci
  npm start

Deploy details
- The systemd unit `deploy/backend.service` is provided; during deployment the backend folder is copied to /var/www/bcp/backend and the service is enabled.
- The deploy script tries to run `npm ci --production` and enable the systemd service.

Logs
- Perf logs are written to /var/log/bcp/perf.log. Ensure logrotate is configured on the server to prevent uncontrolled growth.
