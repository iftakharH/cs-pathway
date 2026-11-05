# AGENTS.md — cs-pathway

This file is the contract for anyone (human or agent) changing this repository.
Read it before touching code or content. The source spec is `cs-pathway-build-prompt-v3.md`.

## 1. Hard constraints (spec §0)

- **Total cost is zero.** Free tiers only, no credit card, no paid API, no paid email.
  Planned services: Vercel Hobby, Neon Free, Better Auth, GitHub. Nothing else without approval.
- **Vercel Hobby is non-commercial, personal use only.**
  https://vercel.com/docs/limits/fair-use-guidelines
  Therefore: no ads, no payments, no paid tiers, no affiliate links, no sponsorships, no client work.
- **Neon Free is small.** Record the current limits from https://neon.com/pricing with the date
  checked before publishing any number. Design for scale-to-zero and a cold first query.
- **No email provider in v1.** No email verification, no password reset. Say so in the UI.
- **Truth rule.** If a fact cannot be linked to a source we published, it does not ship.
  Unverifiable content goes to `content/_quarantine/` with a reason.
- **No placeholders.** No `TODO`, lorem ipsum, fake data, invented statistics, quotes, salaries,
  funding amounts or dates. Never copy source text; paraphrase, or quote under 15 words once.
- **Public content stays public.** Modules, cheatsheets, claims and sources are readable without
  an account. Login only unlocks tracking and personalisation.

## 2. Trust system (spec §2)

Every factual statement is a `Claim` with at least one `Source` in `/content`.
Rules enforced by `npm run validate` (the build fails when broken):

- `observed-data` and `spec-fact` need one `primary` source, or two independent `secondary` sources.
- A `community` source is never sufficient on its own.
- `forecast` must name the forecaster and show a "Forecast — not data" badge.
- A claim past `reviewAfter` renders "Needs re-check"; it is not silently trusted.
- Banned phrases: "guaranteed", "get hired in N days", "secret", "10x", "passive income".
- Every displayed number/claim has a source chip that opens a drawer: title, publisher, tier,
  retrieval date, link.
- Evidence labels are text + icon, never colour alone: Observed data, Official docs,
  Editorial opinion, Forecast.
- Harness records live in `content/harnesses.yaml`. Each must link the vendor's Skills, MCP and
  instruction docs, record the exact config path, and state its limitations. Mark a harness
  `legacy` when the vendor has replaced it rather than silently deleting the row.
- Run `npm run check:versions` before changing a tool stamp. A version stamp may move only after
  the entry has been re-read against the new docs and, where applicable, its snippets re-run.
- Startup funding content uses worldwide sources and worldwide figures. Do not publish a
  single-country programme amount, a named accelerator's deal terms, or a local-currency figure
  without its own official page and a review date tied to the policy cycle.

## 3. Stack and architecture (spec §7)

- One Vercel project, one repository. React + Vite + TypeScript (strict) + Tailwind + React Router.
- API: Express (or Hono) as a Vercel function under `/api/*`; Better Auth mounts at `/api/auth/*`.
- Database: Neon Postgres via the **pooled** URL, Drizzle ORM, `drizzle-kit` migrations.
  The direct/unpooled URL is only for migrations.
- Auth: Better Auth with the Drizzle adapter (`provider: "pg"`). Generate core tables with the
  official Better Auth CLI. Pin the current stable version, never a beta.
- Content: YAML/Markdown in git, validated at build. No CMS, no content in the database.
- Search: client-side (MiniSearch or Fuse) over modules, cheatsheets, claims, glossary.
- No analytics, no third-party scripts, no tracking cookies. Only the session cookie.
- Env vars are server-only: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`,
  `BETTER_AUTH_URL`, OAuth client IDs/secrets. `.env.example` lists names only.
- Public pages are static and must survive a cold or unavailable database.
- Quality gates: ESLint, Prettier, `tsc --noEmit`, Vitest, Playwright, axe-core, `npm audit`.
- Never accept a `userId` from the client. Every query filters on the session user.

## 4. Accounts (spec §9)

- Sign-in: Google OAuth, GitHub OAuth, email + password. No email verification or reset in v1.
- Pages: `/signin`, `/signup`, `/account` (profile, hours, target phase, providers, sessions,
  **Export my data**, **Delete my account**).
- Keep Better Auth CSRF/origin checks and rate limiting **enabled**. Set `trustedOrigins` to the
  production domain and local dev only. Secure cookies in production. Sessions in the database.
- Protected: `/dashboard`, `/account`, `/proof/*`, `/notes`, `/pins`. Everything else public.
- Guest mode works without login; on first sign-in offer to import guest progress without
  overwriting newer server data.
- Privacy: only name, email/OAuth identity, and the app tables. Nothing sold or shared.
  Account deletion removes all rows within the request.

## 5. Definition of done (spec §13)

Report every command actually run. Never claim a check that was skipped; mark it `UNVERIFIED`.

- `npm run lint && npm run typecheck && npm test && npm run validate && npm run test:snippets && npm run build`
- Playwright e2e: guest flow, signed-in flow, each phase flow.
- Authorization tests prove no cross-user read or write on any table.
- 0 broken links, or documented exceptions, plus a weekly link-check workflow.
- axe-core: 0 serious/critical issues on every route.
- Lighthouse mobile: Performance >= 90, Accessibility >= 95 on public pages.
- No ads, payments, affiliate links, tracking scripts or paid dependencies (prove by repo search).
- No secrets in the repo; `.env.example` complete; CSRF/origin/rate limit confirmed enabled.
- Export and delete account work and are tested. Per-user storage caps enforced and tested.
- README covers setup, adding content, running checks and deploying to Vercel Hobby.
- Final report: what shipped, what was quarantined, what is unverified, current limits with dates.

## 6. Project layout

```
content/              sources, claims, modules, cheatsheets, playbook, glossary, trends
content/_quarantine/  unverifiable material, with a reason file
scripts/              content build, validator, snippet tests, link check
src/content/          Zod schemas + generated typed content (do not edit generated files)
src/components/       design-system and shared UI
src/pages/            one file per route, lazy-loaded
src/lib/              store, planner, calculations, search, formatting
tests/                Vitest unit + UI tests
```

Rules for contributors:

- Content edits go in `/content`; never edit `src/content/generated/*` by hand.
- Every snippet marked `runnable: true` must pass `npm run test:snippets`.
- New route: add it to `src/App.tsx`, `src/pages`, and the sitemap list in
  `scripts/build-content.ts` if public.
- Keep lines under 120 characters in Markdown. Use sentence case headings.
- Conventional commits: `feat:`, `fix:`, `content:`, `docs:`, `test:`, `chore:`.
