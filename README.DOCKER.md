Development using Docker Desktop

1. Build and run the dev container (Docker Desktop):
   docker compose up --build

2. The dev server will be available at http://localhost:3000 on your host machine.

Run Lighthouse audit in Docker

1. Start the dev server in Docker Desktop as above (docker compose up --build).
2. In another terminal, run the Lighthouse audit container which will run once against the running dev service and write a report to ./reports:
   docker compose run --rm lighthouse

3. Open ./reports/lighthouse.html in your browser to review the results.

Preview production build in Docker Desktop

1. Build and run the production preview (multi-stage build + nginx) and the backend microservice together:
   docker compose up --build preview backend

2. The site will be available at http://localhost:8080 and the backend will listen on port 4000 inside the compose network (also exposed on host at :4000).

3. The preview nginx config proxies /api/ calls to the backend service, enabling end-to-end testing of the perf logging endpoint.

4. To stop the preview and backend: docker compose down

Notes:
- The preview uses `deploy/nginx/preview.conf` mounted into the nginx container so API proxying targets the `backend` service.
- Logs from the backend are written to `./logs/perf.log` on the host via a volume mount.
- Optionally set SENTRY_DSN as an environment variable when running compose to enable Sentry in the backend and frontend (example below).

Example: run with Sentry enabled (if you have a DSN):
  SENTRY_DSN=your_dsn_here docker compose up --build preview backend
