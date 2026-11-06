# Maintenance

A quarterly refresh, plus a weekly automated check once the repository has a remote.

## Every push (automated)

- `npm run validate` — claims, sources, references and quiz shape.
- `npm run lint`, `npm run typecheck`, `npm test`.
- `npm run test:snippets` — every executable snippet with its expected output.
- `npm run build`.
- `npm run e2e` — guest journey, every phase, 19 routes in both themes for axe serious/critical.
- Check `/verification` still lists every claim, source, harness row and tool stamp.

## Every week (automated once GitHub Actions is enabled)

- `npm run check:links` — re-crawl every source, resource and quiz URL. The current reachable and
  bot-blocked counts are recorded in the README's verification table.
- `npm run check:stale` — fails when a claim passes its `reviewAfter` date.
- `npm run check:versions -- --strict` — fails when a non-baseline tool stamp is behind its
  registry. Docker 28 and TypeScript 6.0.3 were flagged on 6 Nov 2026.
- The workflow opens an issue with the output. It does not edit content.

## Every quarter (manual)

1. Re-read each source in `content/sources.yaml`. Update `retrievedAt` only after reading.
2. Re-check survey figures, plan limits and prices. Update the claim text and `reviewAfter`.
3. Re-check cheatsheet tool versions. If the upstream release changed a command, update the
   entry, the `tool.version` and `verifiedOn`.
4. Re-run `npm run test:snippets` after any snippet change.
5. Re-test the Vercel preview for sign-up, sign-in, state write, export and delete. Keep the API
   as one function at `api/index.ts`: Hobby allows 12 functions and its file matcher only covers
   one path segment. The `/api?__path=...` rewrite is intentional.
6. Check the harness table against vendor docs for the current version. Add a row only when
   the docs were read. For Antigravity, re-check the skills, MCP and rules pages together, then run
   one workspace skill and one AGENTS.md check with `agy`.
7. Re-check the worldwide funding sources (`src-kpmg-venture-pulse`, `src-gem-2026`) and replace
   the quarterly KPMG figure with the latest completed quarter. Do not add a single-country
   programme without its own official page and policy-cycle review date.
8. Read the quarantine folder. Restore an item only with a new source record.
9. Add a dated `changelog` entry for every change that affects what a page claims.
10. Re-run Lighthouse mobile on the public pages and record the result in the final report.
11. Confirm the Vercel Hobby plan is still non-commercial and the Neon Free limits still match
    `content/claims.yaml` (N1, V1).
12. Check `npm audit`. Production dependencies were clean on 5 Nov 2026; the dev-only
    `typescript-eslint` chain reported 10 moderate advisories at that time.

## If a source dies

- A 404 on a source: mark the claim `reviewAfter` today, add a changelog entry, and replace the
  source or remove the claim from every page that uses it.
- A 403 to bots but a working page in a browser: record it as a link-check exception in the
  README; do not silently remove the URL.

## OAuth

Google and GitHub remain disabled until the steps in `docs/oauth-setup.md` are completed. Do not
claim a provider login without a real redirect and a session on `/account`.
