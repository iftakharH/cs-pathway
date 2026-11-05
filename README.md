# cs-pathway

A source-verified roadmap, tracker and cheatsheet library for CS students heading into 2027.

**Promise:** tell us your level and weekly hours. Get a step-by-step path, cheatsheets tested
in CI, and a proof project at the end of every phase — with a source behind every claim.

- Public content needs no account.
- Every factual claim has a source record, a kind and a review date.
- Every runnable snippet is executed in CI against an expected output.
- No analytics, no tracking cookies, no third-party scripts, no paid tiers.

## Status

This repository contains the **credential-free public core and the complete guest journey**:
placement check → weekly plan → module → quiz → proof → dashboard, plus the cheatsheet library,
startup tools and trust pages.

**Accounts are not enabled in this build.** There is no server database, no sign-in and no API
function yet. Progress, notes, proofs and tools are stored in `localStorage`. See
[Accounts (planned)](#accounts-planned) for what remains and the exact environment variables.

## What is in the build

| Area | Count |
| --- | --- |
| Phases | 5 (F, 1, 2, 3, S) |
| Modules | 31 |
| Quiz questions | 155, each with a source page |
| Cheatsheets | 108 |
| Executable snippets | 23 |
| Claims | 14 |
| Sources | 12 (all primary) |
| Harnesses verified | 7 |
| Playbook entries | 4 |
| Startup tools | 8 |

The counts come from `src/content/generated/manifest.ts`, produced by the content build.

`/verification` is the public audit trail: every claim and review date, every source and retrieval
date, the seven harness checks, the tool stamps, and the commands that reproduce them. `/review`
turns missed quiz answers into a spaced queue: a miss returns tomorrow, and each correct answer
moves the question further out.

## Quick start

Requires Node 22+ and Python 3.11+ (Python is only needed for `npm run test:snippets`).

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. No environment variables are needed for the public build.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Build content, then start Vite. |
| `npm run content` | Validate YAML and generate typed content. |
| `npm run validate` | Run the full content rules. Fails on an unsourced claim. |
| `npm run lint` | ESLint, including React hooks rules. |
| `npm run typecheck` | `tsc --noEmit`, strict. |
| `npm test` | Vitest unit and UI tests. |
| `npm run test:snippets` | Execute every `runnable` snippet and compare output. |
| `npm run build` | Validate, generate, typecheck and build to `dist/`. |
| `npm run e2e` | Playwright: guest journey, every phase, axe scans. |
| `npm run check:links` | Fetch every source, resource and quiz URL. |
| `npm run check:stale` | Fail when a claim is past `reviewAfter`. |
| `npm run check:versions` | Compare tool stamps with npm, PyPI, endoflife.date and GitHub. `--strict` fails on drift. |
| `npm run verify` | Lint, types, unit tests, snippets and build in one command. |

## Content: how to add a claim, module or cheatsheet

Everything is YAML in `/content`. Generated files in `/src/content/generated` are written by
`npm run content`; never edit them by hand.

### A source and a claim

```yaml
# content/sources.yaml
sources:
  - id: src-example-docs
    title: The page title
    publisher: The organisation
    url: https://example.com/docs/page
    tier: primary
    publishedAt: 2026-11-05
    retrievedAt: 2026-11-05
```

```yaml
# content/claims.yaml
claims:
  - id: C10
    statement: One sentence in your own words, linked to the source.
    kind: spec-fact
    confidence: high
    sourceIds: [src-example-docs]
    scope: What the claim covers
    verifiedAt: 2026-11-05
    reviewAfter: 2027-02-05
```

Rules enforced by `npm run validate`:

- `observed-data` and `spec-fact` need one primary source or two independent secondary sources.
- A community source is never enough on its own.
- A `forecast` needs `forecastBy` and `falsifiedBy`.
- `reviewAfter` must not be before `verifiedAt`.
- Hype phrases are rejected in claims, module summaries and trend copy.
- Every module needs at least one free resource, one official resource, five sourced quiz
  questions and a proof rubric with at least three criteria.
- Every reference to a claim, module, cheatsheet or prerequisite must resolve.

### A cheatsheet

Add an entry to `content/cheatsheets/*.yaml`. For a runnable snippet, declare both the code and
the exact output:

```yaml
snippets:
  - lang: js
    caption: What the snippet proves
    runnable: true
    checked: executed
    expectStdout: '42'
    code: |
      console.log(40 + 2)
```

SQL uses `expectRows: [[1, 'a']]` and runs against an in-process PostgreSQL (PGlite). Anything
that cannot be executed must be `runnable: false`, `checked: docs`, with a link to the exact
documentation section.

### A module

Add a YAML file under `content/modules/`. Required fields include phase, order, objectives,
prerequisites, an editorial hour range, resources, cheatsheet ids, five or more quiz questions
with `sourceUrl`, a proof brief and a rubric. Startup modules also need a `riskNote`.

Content that cannot be verified goes to `content/_quarantine/` with a reason. Nothing is deleted
to hide a mistake; it is moved and dated.

## Trust system

- Every number or specification shown on a page is a claim with a source chip.
- Evidence labels are text plus icon: Observed data, Official docs, Editorial, Forecast.
- A claim past `reviewAfter` shows “Needs re-check” instead of quietly staying authoritative.
- Cheatsheet snippets are either executed in CI or explicitly marked “Checked against docs,
  not executed”.
- The weekly workflow checks links and stale claims and opens a GitHub issue. It does not edit
  content automatically.

Read `/methodology`, `/claims` and `/sources` in the app for the public version.

## Architecture

```
content/                  YAML sources, claims, modules, cheatsheets, playbook, glossary, trends
scripts/                  content build, validator, snippet runner, link and staleness checks
src/content/schema.ts     Zod schemas shared by the build and the app
src/content/generated/    typed content produced by the build
src/lib/                  store, planner, placement, calculators, search helpers
src/components/           design system, code blocks, source drawer, quiz, proof workflow
src/pages/                one lazy-loaded component per route
tests/                    Vitest units and Playwright e2e
docs/maintenance.md       quarterly refresh checklist
```

- React 19 + Vite + TypeScript strict + Tailwind 4 + React Router 7.
- Public pages are static; the app is a client-rendered SPA. All content is compiled into the
  bundle at build time, so a database outage cannot take the public site down.
- Search is client-side (MiniSearch), loaded only when the search dialog opens.
- The guest store is a small `useSyncExternalStore` store persisted to `localStorage`, with a
  hand-written import validator (no Zod in the initial bundle).
- No API routes and no Express function in this build.

## Accounts (planned)

Not implemented. The specification calls for Neon Postgres, Drizzle, Better Auth with Google,
GitHub and email/password, and an `/api/auth/*` function on Vercel. Until that code exists,
these items are **UNVERIFIED**:

- sign-up, sign-in, sign-out, delete-account and data export on the server;
- cross-user authorization tests;
- CSRF, origin and rate-limit configuration in a live deployment;
- guest-progress import on first sign-in.

The environment variable names are reserved in `.env.example`:

```
DATABASE_URL=            # Neon pooled
DATABASE_URL_UNPOOLED=   # migrations only
BETTER_AUTH_SECRET=      # at least 32 random characters
BETTER_AUTH_URL=         # https://<domain>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

When implementing, follow the security reference at
<https://www.better-auth.com/docs/reference/security>: keep CSRF and origin checks enabled,
keep built-in rate limiting enabled, use database sessions, secure cookies in production, and
never accept a `userId` from the client.

Google redirect URI: `<BETTER_AUTH_URL>/api/auth/callback/google`.
GitHub callback: `<BETTER_AUTH_URL>/api/auth/callback/github`.

## Deploy to Vercel Hobby

Vercel Hobby is for **non-commercial personal use only**. Do not add ads, payments, affiliate
links, sponsorship or client work while on this plan.

```bash
npx vercel link
npx vercel --prod
```

- Build command: `npm run build`.
- Output directory: `dist`.
- `vercel.json` adds the SPA rewrite, a strict CSP, HSTS and long-lived caching for hashed assets.
- If the deployed domain is not `cs-pathway.vercel.app`, update `content/site.yaml`,
  `index.html`, `public/robots.txt` and `public/sitemap.xml` (the sitemap is regenerated on the
  next content build).
- No environment variables are required for the public build. Do not add any provider key to the
  client bundle.

### Free-tier limits (checked 5 Nov 2026)

- **Vercel Hobby** — non-commercial personal use only. 100 GB fast data transfer and
  1,000,000 function invocations per month.
  Source: <https://vercel.com/docs/limits/fair-use-guidelines> (updated 2026-09-14).
- **Neon Free** — 100 projects; 1 GB storage per project and 20 GB per account; 100 CU-hours per
  project; 10 branches; scale-to-zero after 5 minutes; 6-hour restore; 5 GB egress per project;
  no card.
  Source: <https://neon.com/pricing> (updated 2026-10-31).

Re-check both pages before launch and record the new date.

## Harness verification

`/harnesses` compares seven agent harnesses: Claude Code, OpenCode, Cursor, Codex CLI, Gemini CLI,
GitHub Copilot and Antigravity CLI. Each row was read from the vendor's own docs on 6 Nov 2026 and
records:

- native, partial or no support for Skills, MCP and `AGENTS.md`;
- the exact file path or config location for each primitive;
- a five-minute setup path with the real commands and file names;
- the limitations that a green checkmark would hide;
- links to the skills, MCP, instruction and pricing pages.

Three findings matter more than the table:

- **Claude Code** reads `AGENTS.md` only as a fallback when no `CLAUDE.md` exists, and direct
  support requires v2.1.277+. The matrix marks it Partial, not Native.
- **Gemini CLI** is marked Legacy. Google says it was replaced by Antigravity CLI for unpaid and
  Google One users on 18 June 2026. The row stays visible for existing setups, with a warning.
- **Antigravity CLI** is now covered as the supported replacement: `.agents/skills/`,
  `.agents/mcp_config.json` and `AGENTS.md`, with the 24 KB per-rule limit and the 20,000-token
  aggregate rule budget named as limitations.

`npm run check:versions` compares every stamped tool with its registry. It flags Docker 28 and
TypeScript 6.0.3 as behind the current releases; neither stamp was changed because the Dockerfile
and the TypeScript snippets have not been re-verified against the newer versions. That is a review
item, not an automatic upgrade.

## Worldwide startup sources

The startup phase uses worldwide data, not a single national programme or accelerator:

- **KPMG Venture Pulse Q3 2026** reports $170.9 billion of global venture capital investment across
  8,341 deals.
- **GEM 2025/2026** draws on more than 160,000 responses across 53 economies and names access to
  finance and entrepreneurial education as constraints on startups becoming established firms.

Both are linked from `/startup` with a source chip and a retrieval date. The dilution calculator
uses an illustrative post-money conversion, not a named accelerator's terms. Company registration,
tax and payment rules are explicitly left to the official page for the reader's jurisdiction,
because those rules cannot be stated accurately worldwide.

## Verification (6 Nov 2026)

| Check | Result |
| --- | --- |
| `npm run validate` | 31 modules, 108 cheatsheets, 155 questions, 14 claims, 12 sources, 7 harnesses |
| `npm run lint` | Pass, 0 warnings |
| `npm run typecheck` | Pass, strict |
| `npm test` | 60 tests pass |
| `npm run test:snippets` | 23/23 executable snippets pass |
| `npm run build` | Pass |
| `npm run e2e` | 44/44 Playwright tests pass (6 journey + 38 axe: 19 routes × light/dark) |
| axe-core | 0 serious/critical on 19 representative routes in both themes |
| Lighthouse mobile | Performance: home 92–100, other four 99–100; accessibility 100 on all five |
| `npm run check:links` | 198/200 reachable; 2 bot-blocked (OpenAI docs and pricing return 403) |
| `npm run check:stale` | No claims past review on 6 Nov 2026 |
| `npm run check:versions` | 13 current, 2 behind, 3 intentional baselines, 40 manual review |
| `npm audit --omit=dev` | 0 vulnerabilities in production dependencies |

Home's score varies with cold-run main-thread time. The slower runs show a 3.3 s LCP while both
font files arrive in under 40 ms, so the delay is JavaScript execution on a throttled mobile CPU,
not a late font swap.

Not run or not verified on that date: a signed-in flow, live OAuth, a live Neon database,
GitHub Actions (no remote yet), and Antigravity CLI behaviour on a real machine. Its documentation
was read; the entry is a docs claim, not an executed test.

## Known gaps

- Accounts, Neon, Better Auth and OAuth are deferred. The schema and env names are reserved, but
  no server code exists.
- Gemini CLI is marked legacy and Antigravity CLI is covered for skills, MCP and rules. Feature
  parity across the Antigravity app, CLI and IDE can change; the row records what the docs said on
  6 Nov 2026.
- `check:versions` flags Docker 28 and TypeScript 6.0.3 as behind current releases. They remain
  at the versions the docs and snippets were actually verified against.
- Email verification and password reset are out of scope until a free sender is confirmed.
- Two links are blocked to automated checkers; both are valid pages in a browser.
- `npm audit` reports 10 moderate dev-only advisories in the `typescript-eslint` chain. Production
  dependencies are clean.
- The GitHub Actions workflows exist but have not run in CI because the repository has no remote.

## License and ownership

Single-author, non-commercial project by Iftakhar Hossain.
Corrections: <https://github.com/iftakharH>.
