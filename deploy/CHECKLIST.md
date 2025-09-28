Production verification checklist — BestCasinoPortal

Acceptance criteria (must pass):
- Lighthouse Performance >= 95 (mobile) for homepage and a representative top-list page.
- Sitemap exists at /sitemap.xml and robots.txt references it.
- Schema.org JSON-LD present for Homepage (ItemList), reviews (Review), and FAQs (FAQPage) and passes basic structure checks.
- 5+ review pages available and returning 200.
- 3 region hubs available and returning 200.
- Sticky CTA visible and functional on main pages (sanity click opens outbound UTM link).
- Perf logging endpoint /api/perf accepts a POST and appends to perf.log (smoke test).
- Accessibility: no critical a11y violations (run axe or pa11y).
- Build artifacts in /dist are served correctly by the web server.
- Log rotation in place for /var/log/bcp and tmpfiles ensures directory exists on boot.

Verification steps
1) Run Lighthouse (local or via GitHub Actions):
   - Use the CI job or docker lighthouse: docker compose run --rm lighthouse
   - Parse the JSON at ./reports/lighthouse.json with scripts/parse-lighthouse.js
   - Confirm reports/lighthouse-summary.json shows performance >= 95

2) Verify sitemap and robots:
   - curl -fsS https://<SITE_DOMAIN>/sitemap.xml
   - curl -fsS https://<SITE_DOMAIN>/robots.txt | grep sitemap

3) Verify schema presence (manual):
   - Inspect page source for <script type="application/ld+json"> sections on homepage, a review page and FAQ sections.

4) Verify pages up (smoke):
   - curl -fsS https://<SITE_DOMAIN>/
   - curl -fsS https://<SITE_DOMAIN>/best/fast-withdrawals
   - curl -fsS https://<SITE_DOMAIN>/reviews/readycasino

5) Verify perf endpoint:
   - curl -fsS -X POST https://<SITE_DOMAIN>/api/perf -H "Content-Type: application/json" -d '{"smoke":"ok"}'
   - Check server /var/log/bcp/perf.log contains a recent entry

6) Accessibility:
   - Run axe or pa11y for the homepage; address any violations above severity threshold

7) Finalize:
   - If everything passes, mark Phase 7 complete and publish release notes and changelog.

Report artifacts to collect:
- reports/lighthouse.html
- reports/lighthouse.json
- reports/lighthouse-summary.json
- smoke-checks.log (curl outputs)
- schema-checks.log (manual verification notes)

Sign-off
- Project owner: ___________ (sign/date)
- QA lead: _______ (sign/date)
- DevOps: _______ (sign/date)
