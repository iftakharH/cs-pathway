# BUILD PROMPT v3 — "cs-pathway": a professional, account-based, source-verified roadmap and cheatsheet library for CS students heading into 2027

Path: Foundations check → Phase 1 AI-native full-stack developer → Phase 2 AI engineer → Phase 3 ML engineer → **Startup phase**.

This replaces v2. Paste the whole file into your coding agent (OpenCode, Claude Code, Cursor Agent, Codex). Written 5 November 2026.

Labels:
- **VERIFIED SEED** = checked against a primary or near-primary source on 5 Nov 2026. Re-check before publishing.
- **CANDIDATE** = plausible but unverified. Verify at build time or leave out.

---

## 0. Hard constraints

1. **Total cost: 0.** Free tiers only, no credit card, no paid API. Services: Vercel Hobby (hosting), Neon Free (Postgres), Better Auth (open-source auth library), GitHub (public repo + Actions), OAuth apps from Google/GitHub (free to create; verify).
2. **Vercel Hobby is non-commercial, personal use only** (https://vercel.com/docs/limits/fair-use-guidelines). Therefore: no ads, no payments, no paid tiers, no affiliate links, no sponsorships, no client work. Put this in `AGENTS.md`. Re-check Vercel's limits before launch.
3. **Neon Free limits are small.** Published figures vary between sources (VERIFIED SEED, see N1), so read https://neon.com/pricing at build time and record the numbers with the date. Design for: ~0.5–1 GB storage per project, 100 CU-hours/month, scale-to-zero after 5 minutes idle (first query after idle can take a few seconds), 6-hour point-in-time restore window on Free.
4. **No email provider in v1.** Do not depend on email sending. Sign-in methods: Google OAuth, GitHub OAuth, and email + password. Email verification and password reset are **deferred** (they need an email sender; add later only if a free tier is confirmed). Tell users on the sign-up page: "Password reset is not available yet; use Google or GitHub sign-in for account recovery."
5. **Truth rule:** if you cannot verify a fact from a source you can link, do not publish it. Put it in `content/_quarantine/` with the reason.
6. No placeholders, no `TODO`, no lorem ipsum, no fake data, no invented statistics, quotes, salaries, funding amounts, or dates. Never copy source text (paraphrase; a quote must be under 15 words, one per source).
7. **Public content stays public:** every module, cheatsheet, claim and source page is readable without an account. Login unlocks tracking and personalisation only. (This also keeps the site fast, SEO-friendly, and usable when the database is cold or down.)

First action: create `AGENTS.md` summarising sections 0, 2, 7, 9 and 13.

---

## 1. Product

**Name:** cs-pathway. **Audience:** any CS student or graduate who wants an honest, professional path to a career or a company in 2027. Starts with the owner as the first user, then a few people who asked for a pathway.

**Promise:** "Tell us your level and weekly hours. Get a step-by-step path. Every claim has a source. Every phase ends with proof you built something. Every topic has a cheatsheet you can use on the job."

**Three things the site is:**
1. A **roadmap** (phases, modules, proof projects, a fast-track planner).
2. A **tracker** (account-based: progress, quizzes, notes, proofs, weekly reviews).
3. A **cheatsheet library** (specific, copyable, version-stamped, source-linked).

**Principles:** proof over completion; fast-track by skipping; honest about uncertainty (forecasts labelled); motivation through evidence and small next steps, never income promises.

---

## 2. Trust system (build first, keep it small)

### 2.1 Content records (YAML in `/content`, validated with Zod by `npm run validate`)

```ts
Source = { id, title, publisher, url, tier: "primary"|"secondary"|"community", publishedAt?, retrievedAt }
Claim  = { id, statement /* own words */, kind: "observed-data"|"spec-fact"|"forecast"|"editorial",
           confidence: "high"|"medium"|"low", sourceIds: string[] /* min 1 unless editorial */,
           scope, verifiedAt, reviewAfter }
```

Validator rules (build fails if broken):
- `observed-data` and `spec-fact` need one `primary` source, or two independent `secondary` sources.
- A `community` source is never enough alone.
- `forecast` names who made it and renders a "Forecast — not data" badge.
- Past `reviewAfter` → "Needs re-check" badge.
- Banned phrases: "guaranteed", "get hired in N days", "secret", "10x", "passive income".

### 2.2 What users see
- Every statistic/fact has a **source chip** → drawer (title, publisher, tier, date, "checked on <date>", link).
- Evidence labels (text + icon, never colour only): **Observed data / Official docs / Editorial opinion / Forecast**.
- Pages: `/methodology`, `/sources`, `/claims`, `/changelog`, `/corrections`, `/about` (single-author site, owner's name and contact; no fake team).
- Resources show price (free/paid), licence if known, `lastVerifiedAt`, `officialVendor` yes/no.

### 2.3 Free automation
- **Every push:** validate + typecheck + build + tests + **snippet tests** (section 5.3).
- **Weekly (GitHub Actions, public repo):** link check; open a GitHub issue listing dead links, claims past `reviewAfter`, and cheatsheet entries whose tool version is behind the latest release. (Verify GitHub's current free terms for public repos; otherwise provide `npm run check:links` for local use.)

---

## 3. VERIFIED SEED DATA (first Claim/Source records)

| ID | Claim (paraphrase) | Kind | Primary source |
|---|---|---|---|
| C1 | DeepLearning.AI (Andrew Ng) published an AI Engineering Skills Map on 14 Aug 2026, from 10,000+ job postings, dozens of interviews with experts/hiring managers/recruiters, and surveys. Four skills: building and deploying AI applications, software-engineering fundamentals, using coding agents, shaping the build. Ng stresses AI outputs are unpredictable. | observed-data | https://www.deeplearning.ai/the-batch/the-ai-engineering-skills-map |
| C2 | Stack Overflow 2026 Developer Survey: 30,000+ responses, 169 countries. | observed-data | https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/ (confirm on https://survey.stackoverflow.co) |
| C3 | Among AI users in that survey, coding agents were used by about two-thirds; most-used agents Claude Code (66%) and GitHub Copilot (59%); 73% of coding-assistant/agent users use them daily. | observed-data | same as C2 |
| C4 | 6.6% would trust AI for important decisions; 78.7% say source attribution matters for AI-generated code/answers. | observed-data | same as C2 (secondary cross-check: IT Brief UK, 6–7 Oct 2026) |
| C5 | JavaScript most-used language for the twelfth year (62%); Python 58%; SQL 58.4%; PostgreSQL led databases (58%). | observed-data | same as C2 |
| C6 | April 2026 Stack Overflow pulse survey: agent use roughly doubled vs 2025 (31% → 59%). Smaller sample. | observed-data | https://stackoverflow.blog/2026/09/30/getting-ready-for-2026-results-a-look-back-on-developer-survey-findings/ |
| C7 | MCP released its 2026-07-28 spec as stable on 28 Jul 2026; headline change is a stateless core. Specs are versioned by date. | spec-fact | https://modelcontextprotocol.io/specification/2026-07-28 |
| C8 | The official MCP Registry (registry.modelcontextprotocol.io) is the public catalogue of MCP servers with a REST API; preview launched 8 Sep 2025. | spec-fact | https://modelcontextprotocol.io/registry |
| C9 | Agent Skills: a folder with `SKILL.md` (required `name` ≤64 chars, `description` ≤1,024 chars); open standard at agentskills.io; skills load on demand while `AGENTS.md` is always-on guidance; several tools support it. | spec-fact | https://agentskills.io ; https://code.visualstudio.com/docs/agent-customization/agent-skills |
| S1 | Y Combinator's standard deal: $500,000 = $125,000 for 7% on a post-money SAFE + $375,000 on an uncapped MFN SAFE. | spec-fact | https://ycombinator.com/deal |
| S2 | Startup Bangladesh Limited (founded March 2020) is a venture capital company under the ICT Division making equity/quasi-equity investments in seed, early and growth-stage startups. | spec-fact | https://www.startupbangladesh.vc (FAQ) |
| S3 | On 9 Jun 2026 the ICT Minister told Parliament Startup Bangladesh had invested about Tk 109 crore in 36 approved startups and does not give direct loans. | observed-data | BSS News, 9 Jun 2026 (secondary; find a primary record) |
| S4 | On 14 Jul 2026 the government announced grants for young startups from Tk 5 lakh to Tk 5 crore with about Tk 500 crore allocated by the ICT Division, and launched a "National Startup and Entrepreneur Platform". Treat as an **announcement**; show eligibility only from the official program page. | observed-data | BSS News, 14 Jul 2026 (secondary; find the official ICT Division page) |
| V1 | Vercel Hobby is restricted to non-commercial personal use. | spec-fact | https://vercel.com/docs/limits/fair-use-guidelines |
| N1 | Neon's Free plan: no credit card, 100 projects, 100 CU-hours per project per month, autoscaling up to 2 CU, 10 branches, scale to zero after 5 minutes idle, 6-hour restore window, 5 GB egress. **Storage figures conflict between sources** (0.5 GB vs 1 GB per project) — use only what https://neon.com/pricing shows on the day you check, and record the date. | spec-fact | https://neon.com/pricing (secondary comparisons exist; do not cite them for numbers) |
| B1 | Better Auth documents: scrypt password hashing by default; sessions stored in the database (or secondary storage); built-in rate limiting (stricter on sign-in/sign-up/change-password routes); CSRF protection via `trustedOrigins` checks, SameSite=Lax cookies by default and Fetch Metadata checks. | spec-fact | https://www.better-auth.com/docs/reference/security (check the current stable docs version; v1.6/v1.8-beta docs both exist) |

**Low-trust leads (find primary sources through them, never cite as evidence):** Medium/DEV.to roadmaps, "N job postings" blog analyses, GitHub roadmap READMEs, vendor "top skills" posts without methods, starter-template READMEs.

**CANDIDATE primary sources to add:** Stanford HAI AI Index 2026, US BLS Occupational Outlook Handbook, WEF Future of Jobs, GitHub Octoverse 2026, official docs of Anthropic/OpenAI/Google/Hugging Face/PostgreSQL/MDN/React/Node/Python/PyTorch/scikit-learn, iDEA (https://idea.gov.bd), YC Startup School/Library and SAFE documents, Bangladesh company-registration and tax authority pages, Stripe/Payoneer/Wise country-availability pages (list a provider only after confirming Bangladesh support on its official page).

---

## 4. The "2027 trends" page — honest version

`/trends` has three levels: **Observed in 2026** (C1–C6), **Emerging** (C7–C9), **Forecast** (only from a named analyst/institution, with author, date and "what would prove this wrong"). Seed topics need ≥2 sources each or go to quarantine: agentic coding becoming normal; verification as the scarce skill (C4); evals and context engineering (C1); MCP and portable skills maturing (C7, C9); small/open models for cost control; AI security. Add `/docs/maintenance.md` with a quarterly refresh checklist.

---

## 5. Learning content and CHEATSHEETS

### 5.1 Records

```ts
Module = { id, phase: "F"|"1"|"2"|"3"|"S", title, summary, objectives: string[] /* observable */,
           prerequisites: string[], estHours: {min, max} /* "editorial estimate" */,
           claimIds: string[], resources: Resource[] /* ≥2, ≥1 free, ≥1 official */,
           cheatsheetIds: string[], quiz: QuizQ[] /* ≥5 */,
           proof: { title, brief, rubric: {criterion, levels: {0:string,1:string,2:string,3:string}}[] },
           playbookIds: string[] }
QuizQ = { id, question, choices: string[], answerIndex, explanation, sourceUrl /* page that states the answer */ }
Resource = { title, publisher, url, format, price: "free"|"paid"|"freemium", lastVerifiedAt, officialVendor: boolean, why }

CheatEntry = { id, phase, topic /* e.g. "Git" */, title /* e.g. "Undo the last commit" */,
               whenToUse, snippets: [{ lang, code, caption, runnable: boolean }],
               notes: string[], gotchas: string[], seeAlso: string[],
               tool: { name, version, verifiedOn },    // version-stamped
               sourceUrl /* official docs section */, tags: string[] }
```

**Quiz rule:** a question exists only if its answer is stated on the page in `sourceUrl`.

### 5.2 Cheatsheet rules (this is what makes the site professional)
- **Atomic and specific:** one task per entry, written as "When you need to X, do Y". Not essays. Typical entry: 1–3 snippets, ≤5 notes, ≤3 gotchas.
- **Own examples, verified:** write minimal original examples based on official docs; do not paste long doc passages. Every entry links the official docs section it came from.
- **Version-stamped:** show tool name + version + "verified on <date>". Weekly job flags entries whose version is behind the latest release.
- **Tested where possible:** `runnable: true` snippets (JS/TS, Python, SQL against a throwaway Postgres in CI) are executed by `npm run test:snippets`; the build fails if they fail. Non-runnable snippets (shell, config, vendor API shapes) must be checked against official docs and marked "Checked against docs, not executed".
- **No invented numbers:** parameter "recommended values" appear only if an official source states them; otherwise write "depends on your data — measure it".
- **UX:** copy button on every snippet, language tabs where relevant, print-friendly stylesheet (A4, two columns), keyboard shortcut `/` to search, filter by phase/topic/tag, permalink per entry, "Pin to my sheet" (logged-in).

### 5.3 Required cheatsheet topics (write at least these entries; each topic → multiple atomic entries)

**Foundations (F)**
- Git: init/clone/branch/switch, stage and commit, amend, rebase vs merge, stash, reflog recovery, undo (restore/revert/reset), resolve conflicts, `.gitignore`, tags.
- Terminal/Linux: navigation, grep/find, pipes and redirects, permissions (chmod/chown), processes, ssh keys, env vars, curl.
- HTTP: methods, status-code table, headers, cookies, CORS, caching headers, REST conventions.
- SQL: select/join types, group by/having, subqueries/CTEs, window functions, indexes, `EXPLAIN`, transactions.
- JavaScript/TypeScript: async/await and promises, array/object methods, destructuring, modules, narrowing, generics, utility types.
- Python: venv, typing, dataclasses, async basics, pytest, comprehensions, file I/O.
- Data structures and Big-O comparison table; regex essentials.

**Phase 1 — AI-native full-stack**
- React: hooks (state, effect, memo, ref, reducer), effect pitfalls, forms, data-fetching patterns, accessibility basics.
- Node/Express: routing, middleware order, error handling, validation with Zod, env config.
- Postgres + Drizzle (or Prisma): schema, migrations, relations, transactions, pooled vs direct connections.
- Auth concepts: sessions vs JWT, OAuth/OIDC flow, password hashing, CSRF, XSS, secure cookies, rate limiting. (Better Auth setup snippets verified against its docs.)
- OWASP Top 10 table (verify the current edition) with one mitigation per item.
- Docker (Dockerfile, compose), GitHub Actions workflow (test + deploy), Vitest and Playwright basics.
- Working with coding agents: `AGENTS.md` template, spec-first prompt template, small-diff review checklist, "verify dependency exists" checklist, context checklist.
- Agent tooling shapes: MCP client config per harness, `SKILL.md` template (fields from C9) — verify each harness's current config format.

**Phase 2 — AI engineer**
- LLM API call shapes: messages, system prompt, tool/function calling, structured output, streaming (one entry per provider, from official docs).
- Token and cost arithmetic (formula only, with the provider's current pricing page linked, never hard-coded).
- Prompt patterns: role/context/task/format, few-shot, decomposition, output constraints; common failure modes.
- RAG: pipeline diagram, chunking trade-offs, embeddings, hybrid search, reranking, citations, pgvector SQL (extension, vector column, distance operators, index types — verify against pgvector docs).
- Evals: golden-set template, precision/recall@k, MRR, faithfulness/groundedness checks, LLM-as-judge rubric template and its known biases, regression-test pattern.
- Agent loop pseudo-code, tool-design checklist, human-in-the-loop checkpoints.
- MCP server skeleton in the official TypeScript SDK (per 2026-07-28 spec — verify).
- Reliability: retries with backoff, timeouts, rate-limit handling, caching, tracing fields.
- Security: prompt-injection defences checklist, least-privilege tool permissions, PII handling.

**Phase 3 — ML engineer**
- Linear algebra and calculus identities used in ML; probability rules, Bayes, expectation/variance, MLE.
- Metrics: confusion matrix, precision/recall/F1, ROC-AUC, RMSE/MAE, calibration; when to use which.
- Bias–variance, overfitting, cross-validation, data leakage checklist.
- scikit-learn pipeline template; pandas/NumPy operations; train/validation/test split code.
- PyTorch: tensor shapes, training loop, device handling, common shape errors, saving/loading.
- Transformers: attention formula, tokenisation, Hugging Face `transformers`/`datasets` snippets.
- Fine-tuning vs RAG vs prompting decision table; LoRA/PEFT parameters explained (meaning only, no "best values" unless sourced).
- MLOps: experiment tracking fields, model registry flow, serving container skeleton, drift metrics (PSI, KS) with formulas.

**Startup phase (S)**
- SAFE and dilution math: post-money SAFE ownership = investment ÷ post-money cap (verify against YC's SAFE documentation), worked example matching ycombinator.com/deal ($375,000 at a $15M post-money cap = 2.5%).
- Funding-stage table (bootstrapping, grants, accelerator, angel, seed, Series A): what it gives, what it costs, typical signals, sources.
- Startup metrics formulas: MRR, churn, activation, retention, CAC, LTV, payback period — standard definitions with sources.
- Customer-interview question bank and "bad vs good question" table (paraphrase published guidance; cite).
- Pricing: cost-plus vs value-based formulas, simple willingness-to-pay questions.
- One-page pitch outline; landing-page checklist; outreach message structure.
- Company-setup checklist for Bangladesh (include only items confirmed on official pages, each dated).

---

## 6. Agent Playbook (skills, plugins, MCPs per task) — v1 scope

Static pages from YAML: tools/skills for a task, copy-ready `AGENTS.md` snippet, starter prompt, verification checklist, pitfalls, risk level. Seed tasks (**CANDIDATE**, verify existence, licence, activity within 12 months, and install line; else show "Install line not verified"):

| Task | Candidate tools/skills | Safety note |
|---|---|---|
| Plan a feature from a spec | harness plan mode + `AGENTS.md` | small diffs, require tests |
| Build/redesign UI | Anthropic `frontend-design` skill, Playwright MCP, Figma MCP | automate localhost only |
| Library docs lookup | docs-retrieval MCP (e.g., Context7) | prefer official docs |
| Database work | Neon MCP/CLI (verify), Drizzle docs | dev branch only, read-only first |
| Deploy/inspect hosting | Vercel MCP | scope tokens to one project |
| PR/code review | GitHub MCP, code-review skill | fine-grained token, no admin |
| Auth implementation | Better Auth official skills/MCP (verify) | never disable CSRF/origin checks |
| Documents/spreadsheets | Anthropic `docx`, `pdf`, `pptx`, `xlsx` skills | treat uploaded files as untrusted |
| Create a skill / MCP server | `skill-creator`, `mcp-builder`, official MCP SDKs | test on 3+ real tasks |
| Model/dataset work | Hugging Face MCP/Hub tooling | check dataset licences |

Build the catalogue from the official MCP Registry API (C8): vendor-verified namespaces → `officialVendor: true`; require OSI licence, recent commit, not archived (GitHub REST API at build time, store the date). Write original one-sentence descriptions. Add `/playbook/security`: least privilege, read-only by default, separate dev/prod credentials, review third-party skills before installing, pin versions, never auto-approve writes or spending, tool output can carry prompt injection. Add `/harnesses` comparing Claude Code, OpenCode, Cursor, Codex CLI, Gemini CLI, GitHub Copilot on skills/MCP/`AGENTS.md` support; link vendor pricing pages, never hard-code prices.

---

## 7. Stack and architecture

One Vercel project, one repo.

- **Frontend:** React 18+/19, Vite, TypeScript (strict), TailwindCSS, React Router; accessible component primitives (shadcn/ui or Radix). Prerender public pages (modules, cheatsheets, claims, methodology) to static HTML for speed and SEO (pick a maintained Vite SSG approach at build time; note why).
- **API:** Express 5 (or Hono) exposed as Vercel function(s) under `/api/*`. Mount Better Auth at `/api/auth/*`. Verify Vercel's current Express/Node function support and config format at build time.
- **Database:** Neon Postgres (Free) via the **pooled** connection string for app traffic; Drizzle ORM; migrations with `drizzle-kit`. Use the Neon serverless driver or `pg` as Neon's current docs recommend for Vercel functions (verify). Direct (unpooled) URL only for migrations.
- **Auth:** Better Auth with the Drizzle adapter (`provider: "pg"`). Generate its core tables with the official Better Auth CLI (verify the current command) instead of hand-writing them. Pin the current **stable** Better Auth version; do not use beta docs.
- **Content:** Git-based YAML/MD, validated at build. No CMS. Content never goes into the database.
- **Search:** client-side (MiniSearch or Fuse.js) over modules, cheatsheets, claims, glossary.
- **No analytics, no third-party scripts, no tracking cookies.** Only Better Auth's session cookie.
- **Env/secrets:** `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (migrations), `BETTER_AUTH_SECRET` (≥32 random chars; confirm in docs), `BETTER_AUTH_URL`, OAuth client IDs/secrets. Server-only; none in the client bundle; `.env.example` lists names only.
- **Quality:** ESLint, Prettier, `tsc --noEmit`, Vitest (validator, planner, calculators, authorization), Playwright (one e2e per flow), axe-core, `npm audit`, pinned dependencies, secret scanning.
- **Resilience to cold starts / DB downtime:** public pages are static; logged-in pages show skeletons, retry once with backoff, then show a friendly "Database is waking up" message. Never lose user input: queue writes locally and retry.

---

## 8. Data model (Drizzle, Neon Postgres)

Better Auth core tables (user, session, account, verification) come from its CLI. App tables, all keyed to `user.id` with `ON DELETE CASCADE`:

```ts
profile(userId pk, displayName, hoursPerWeek int check 1..80, targetPhase text check in ('1','2','3','S'), startedAt timestamptz default now())
module_progress(userId, moduleId text, status text check in ('skipped','in_progress','proof_submitted','done'), updatedAt, primary key(userId, moduleId))
quiz_attempt(id uuid pk, userId, moduleId, score int, total int, answers jsonb, takenAt)
proof_submission(id uuid pk, userId, moduleId, repoUrl, demoUrl, selfRubric jsonb, notes text, createdAt)
note(id uuid pk, userId, moduleId nullable, cheatId nullable, body text check length <= 5000, createdAt, updatedAt)
cheat_pin(userId, cheatId text, createdAt, primary key(userId, cheatId))
flashcard_state(userId, cardId text, box int check 1..5, dueAt, primary key(userId, cardId))
tool_state(userId, toolId text, data jsonb, updatedAt, primary key(userId, toolId))   // startup tools
activity(id bigserial pk, userId, kind text, refId text, at timestamptz default now())  // for streaks/history
```

**Storage protection (free tier):** per-user caps enforced server-side (notes ≤ 200 KB total, `tool_state` ≤ 100 KB each, activity retained 12 months then pruned); reject oversize writes with a clear message. Add an index on every `userId` foreign key. Content IDs (`moduleId`, `cheatId`) are strings validated against the build-time content manifest.

**Authorization:** every query filters by the session's `userId`; there is no endpoint that accepts a `userId` from the client. Write automated tests proving user A cannot read or write user B's rows. Validate all inputs with Zod. Cap request body size.

---

## 9. Authentication and account spec

- Sign-in methods: Google OAuth, GitHub OAuth, email + password (name, email, password; minimum length per Better Auth defaults, show a strength hint). No email verification and no password reset in v1 (see section 0.4); state this plainly in the UI.
- Pages: `/signin`, `/signup`, `/account` (profile, hours/week, target phase, connected providers, active sessions with "sign out other devices", **Export my data (JSON)**, **Delete my account**).
- Security configuration, each item checked against https://www.better-auth.com/docs/reference/security (B1): set `trustedOrigins` to the production domain and local dev only; keep CSRF and origin checks **enabled**; keep built-in rate limiting enabled (verify its behaviour behind Vercel's proxy and configure the trusted IP header as the docs describe); secure cookies in production; strong random `BETTER_AUTH_SECRET`; sessions in the database.
- Protected routes: `/dashboard`, `/account`, `/proof/*`, `/notes`, `/pins`. Public routes remain public.
- **Guest mode:** progress, quizzes and startup tools work in the browser without login (localStorage). On first sign-in, offer "Import my guest progress" (merge with Zod validation; never overwrite newer server data without confirmation).
- Privacy: collect only name, email (or OAuth identity), and the app tables above. `/privacy` page states exactly what is stored, where (Neon, region as configured), that nothing is sold or shared, how to export and delete. Deleting an account removes all rows within the request.
- Add `/security.txt`-style contact on `/about`.

---

## 10. Pages and features

Public: `/` (professional landing: promise, how it works, phase overview, sample cheatsheet, trust section) · `/path` · `/phase/:id` · `/module/:id` · `/cheatsheets` · `/cheatsheets/:topic` · `/cheatsheet/:id` · `/startup` (Startup phase home) · `/tools` (startup tools; work as guest) · `/glossary` · `/playbook*` · `/harnesses` · `/trends` · `/claims` · `/sources` · `/methodology` · `/changelog` · `/corrections` · `/about` · `/privacy`.
Account: `/signin` · `/signup` · `/dashboard` · `/account` · `/notes` · `/pins`.

Features:
1. **Placement check:** 5–7 min scenario questions per phase gate + self-rating → start module and skips; states self-ratings are unverified and proofs are the real test. Result saved to profile when signed in.
2. **Fast-track planner:** hours/week, target phase, optional deadline → week-by-week plan from `estHours` ("editorial estimate"), recalculated as progress changes. No outcome promises.
3. **Journey dashboard (the account-based core):** current phase and module, % per phase (by proofs and quizzes, not page views), this week's plan, quiz history and weak topics, next proof, weekly review prompt (what shipped / what blocked / next action), optional streak (off by default), "recently pinned cheatsheets".
4. **Module page:** objectives, why-it-matters claims with source chips, resources, linked cheatsheets, 5+ sourced quiz questions, notes, proof brief.
5. **Quizzes + flashcards:** immediate feedback with explanation and "read the source" link; Leitner-box spaced repetition built from cheatsheet entries; state in DB when signed in, localStorage as guest.
6. **Proof workflow:** brief → build → self-score vs rubric → paste repo/demo links → mark done. Rubrics reward verification evidence (tests, evals, threat model, customer conversations).
7. **Cheatsheet library:** search, filters (phase/topic/tag), copy buttons, print stylesheet, permalinks, pin/unpin, personal notes per entry, "Export my pinned sheet" as Markdown and print-to-PDF.
8. **Startup tools (guest-usable; persisted when signed in):** interview log, outreach tracker, pricing calculator, dilution calculator (formula shown, unit-tested against the YC example), one-page pitch builder (print to PDF), 90-day plan.
9. **Glossary:** each term links to a primary definition.
10. **Claim explorer:** filter by phase/kind/confidence/freshness; export CSV with sources.

**Startup phase content (final phase — "From idea to customers to funding")**
Purpose: show that starting a company is a learnable process with real steps, real numbers and real risks. Motivate with evidence, small actions and honest base rates. Never promise outcomes.
- S1 Should I start one? (fit, student constraints, risk-and-runway worksheet)
- S2 Find a problem worth solving (narrow customer, painful workflows; YC Startup School/Library and Paul Graham essays — verify each URL; *The Mom Test* is a paid book, label it)
- S3 Customer discovery (find 20 people, questions that avoid false praise, insight log)
- S4 Build the smallest product with AI agents (link to Phase 1 and the Playbook; one-week MVP; ship to 5 users)
- S5 Get the first customers (outreach, communities, pricing basics, landing page + waitlist, activation measures)
- S6 Legal, money and company basics (company vs sole proprietor, equity, SAFE, contracts/IP basics, international payments from Bangladesh — list only providers confirmed on official pages, dated). Visible note: "General information, not legal or financial advice."
- S7 Funding paths (bootstrapping, grants, accelerators, angels, VC): comparison table with sources; seed facts S1–S4; for eligibility/amounts link the official program page and show "checked on <date>"
- S8 Pitch and metrics (one-page pitch, early metrics, what investors ask)
- S9 Why startups fail and how to avoid it (sourced failure-reason data or clearly labelled first-person accounts; ethics, security, burnout awareness)
- **Proof:** log of 20 real customer conversations with 3 documented insights; MVP used by ≥5 real people; one-page pitch; 90-day plan. Rubric rewards customer contact over polish.
- **"Your next 7 days"** card: three concrete actions achievable in a week.
- **Founder stories:** only from primary interviews/articles with link, source, year, and a survivorship-bias note.

**Deferred (do NOT build in v1):** email verification/password reset, AI mentor chat (cost), leaderboards, comments, teams, Bangla translation, extra career tracks (design the schema so new `phase` values can be added without code changes).

---

## 11. Design, accessibility, performance

- **Professional look:** consistent design system (tokens for colour, type scale, spacing, radius, elevation), restrained palette, one accent colour, high-quality typography with a system-font fallback, light and dark themes via CSS variables, clear empty/loading/error states, polished auth pages, skeleton loaders, toast feedback, no stock-photo clutter. Brand: wordmark "cs-pathway" (text-based logo; no fake imagery).
- **Mobile-first:** bottom nav on small screens, tap targets ≥44px, drawers for sources and modules.
- **WCAG 2.2 AA:** keyboard operable, visible focus, contrast ≥4.5:1, no colour-only meaning, reduced-motion, labelled inputs, accessible code blocks (copy buttons have text labels).
- **Performance:** LCP < 2.5 s on a mid-range phone over 4G, CLS < 0.1, initial JS < 200 KB gzip on public pages, lazy-load tools and dashboard.
- **Writing:** plain English, short sentences, no hype. Startup phase tone: encouraging and realistic, one honest risk note per module.

---

## 12. Build order and acceptance criteria

**Step 0 — Foundation:** repo, tooling, `AGENTS.md`, Zod schemas, `validate`, CI, Vercel deploy of a static page. *Accept:* validator fails on a claim without a source.

**Step 1 — Trust spine + landing:** source chips/drawer, methodology/sources/claims/changelog/corrections pages, seed records C1–C9, S1–S4, V1, N1, B1, professional landing page. *Accept:* every shown number has a working source chip.

**Step 2 — Neon + Better Auth:** Drizzle schema + migrations on a Neon dev branch, Better Auth with Google/GitHub/email-password, protected routes, account page (export/delete), authorization tests, cold-start handling. *Accept:* cross-user access tests pass; sign-up → sign-in → sign-out → delete-account works end to end in Playwright; CSRF/origin/rate-limit settings confirmed on in a test.

**Step 3 — Cheatsheet library:** schema, UI (search/filter/copy/print/pin), first 60 entries across phases F–1 with tested snippets. *Accept:* `npm run test:snippets` green; every entry has a source link and version stamp.

**Step 4 — Phases 1–3 modules + planner + quizzes + dashboard:** all modules, proofs, rubrics, ≥2 verified resources each, ≥5 sourced quiz questions each, cheatsheets for Phases 2–3 (remaining topics in section 5.3). *Accept:* e2e for placement → plan → quiz → mark module done → dashboard reflects it.

**Step 5 — Startup phase + tools:** S1–S9, proof, "next 7 days", six tools, cheatsheets for S. *Accept:* dilution calculator unit-tested against the YC example; every funding statement has a dated source; disclaimer visible; tools work as guest and persist when signed in.

**Step 6 — Playbook + trends + hardening:** playbook, security page, harness comparison, trends page, privacy page, CSP/security headers via `vercel.json`, 404/500 pages, sitemap, OpenGraph tags, Neon backup note in README (Free restore window is 6 hours; users can export their own data), final audit. *Accept:* section 13 fully green.

---

## 13. Definition of done (report each item)

- [ ] `npm run lint && npm run typecheck && npm test && npm run validate && npm run test:snippets && npm run build` pass
- [ ] Playwright e2e passes for guest flow, signed-in flow, and each phase flow
- [ ] Authorization tests: no cross-user reads/writes on any table
- [ ] 0 broken links (or documented exceptions); weekly link-check workflow exists
- [ ] axe-core: 0 serious/critical issues on every route
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95 on public pages
- [ ] No ads, payments, affiliate links, tracking scripts or paid dependencies (repo search proves it)
- [ ] No secrets in repo; `.env.example` complete; CSRF/origin checks and rate limiting confirmed enabled
- [ ] Export my data and Delete my account work and are tested
- [ ] Per-user storage caps enforced and tested
- [ ] README: setup (Neon, Better Auth, OAuth apps, Vercel env vars), how to add a claim/module/cheatsheet, how to run validation/snippet tests/link checks, how to deploy on Vercel Hobby
- [ ] Final report: what shipped, what was quarantined and why, every unverified item, current Neon/Vercel limits with check dates, known gaps

## 14. Forbidden

Fabricated data or sources; copied text; income, job or funding guarantees; hard-coded vendor prices; tracking scripts; monetization of any kind (Vercel Hobby rule); paid APIs or paid email; disabling Better Auth's CSRF/origin checks; accepting a `userId` from the client; storing passwords yourself; putting public content behind login; building deferred features; skipping tests to hit a deadline.
