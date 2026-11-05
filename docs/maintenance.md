# Maintenance

A quarterly refresh, plus a weekly automated check once the repository has a remote.

## Every push (automated)

- `npm run validate` — claims, sources, references and quiz shape.
- `npm run lint`, `npm run typecheck`, `npm test`.
- `npm run test:snippets` — every executable snippet with its expected output.
- `npm run build`.
- `npm run e2e` — guest journey, every phase, axe serious/critical.

## Every week (automated once GitHub Actions is enabled)

- `npm run check:links` — 187 of 188 URLs reachable on 5 Nov 2026; one OpenAI docs page
  returns 403 to automated requests and is a documented exception.
- `npm run check:stale` — fails when a claim passes its `reviewAfter` date.
- The workflow opens an issue with the output. It does not edit content.

## Every quarter (manual)

1. Re-read each source in `content/sources.yaml`. Update `retrievedAt` only after reading.
2. Re-check survey figures, plan limits and prices. Update the claim text and `reviewAfter`.
3. Re-check cheatsheet tool versions. If the upstream release changed a command, update the
   entry, the `tool.version` and `verifiedOn`.
4. Re-run `npm run test:snippets` after any snippet change.
5. Check the harness table against vendor docs for the current version. Add a row only when
   the docs were read.
6. Read the quarantine folder. Restore an item only with a new source record.
7. Add a dated `changelog` entry for every change that affects what a page claims.
8. Re-run Lighthouse mobile on the public pages and record the result in the final report.
9. Confirm the Vercel Hobby plan is still non-commercial and the Neon Free limits still match
   `content/claims.yaml` (N1, V1).
10. Check `npm audit`. Production dependencies were clean on 5 Nov 2026; the dev-only
    `typescript-eslint` chain reported 10 moderate advisories at that time.

## If a source dies

- A 404 on a source: mark the claim `reviewAfter` today, add a changelog entry, and replace the
  source or remove the claim from every page that uses it.
- A 403 to bots but a working page in a browser: record it as a link-check exception in the
  README; do not silently remove the URL.
