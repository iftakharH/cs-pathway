import { PageHeader } from '@/components/ui/Section'
import { Link } from 'react-router-dom'
import { SourceChip } from '@/components/SourceChip'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'

const entries = [
  {
    date: '2026-11-06',
    version: '0.4.0',
    title: 'Accounts, Neon sync and a verified preview deployment',
    changes: [
      'Added email/password accounts with Better Auth 1.7.18, Neon Postgres, Drizzle migrations and a 14-table schema. Google and GitHub are wired but wait for provider credentials.',
      'Added `/signin`, `/signup` and `/account`, with guest-import choices, debounced sync, session management, JSON export and account deletion.',
      'Added a single Express function at `/api/index.ts` with a path-preserving Vercel rewrite, required by the 12-function Hobby limit.',
      'Moved the session check to a small fetch-backed hook, keeping Better Auth out of the initial page bundle (123 KB → 112 KB gzip).',
      'Converted four more cheatsheets to executed snippets: TypeScript generics, TypeScript utility types, Python typing and the retry delay schedule. The library now has 27 executed snippets.',
      'Executed the Antigravity CLI quickstart with agy 1.5.2: a workspace skill and AGENTS.md were discovered in print mode.',
      'Verified TypeScript 7.0.2 against the whole repository and PostgreSQL 18.6 against all seven SQL snippets on Neon. TypeScript stays at 6.0.3 in the dev toolchain because typescript-eslint requires <6.1.',
    ],
    verified: [
      'Preview deployment: `/api/auth/ok`, sign-up, sign-in, session, state PUT/GET and account deletion all passed against the Vercel function and Neon.',
      '`npm run test:auth`: cross-user isolation, export and delete passed.',
      '`npm run e2e`: 49/49 passed, including the account journey and 21 axe routes in two themes.',
      'TypeScript 7.0.2 typechecked the repository and the snippets; PostgreSQL 18.6 matched all seven SQL snippet outputs.',
    ],
    quarantined: [
      'Google and GitHub OAuth are not live. No client IDs or secrets are configured, so no provider login is claimed.',
    ],
    deferred: [
      'Docker 28 stays pinned. Docker 29.7.2 is installed but the daemon was unavailable, so the Dockerfile was not executed.',
      'A production deployment has not run. The preview deployment is verified.',
      'GitHub Actions has not run yet; the repository is being pushed now.',
    ],
  },
  {
    date: '2026-11-06',
    version: '0.3.0',
    title: 'Worldwide funding sources, a public verification page and spaced review',
    changes: [
      'Replaced the accelerator-specific funding arithmetic and single-country programme with worldwide sources: KPMG Venture Pulse for global venture capital and GEM 2025/2026 for entrepreneurship across 53 economies.',
      'Added Antigravity CLI and a verified five-minute setup path for all seven harnesses, including the exact skills, MCP and instruction file locations.',
      'Added `/verification`, a public audit page for claims, sources, harness checks, tool stamps and the commands that reproduce them.',
      'Added a spaced review queue: missed quiz answers return tomorrow, correct answers move further out, and the dashboard shows what is due.',
      'Expanded the axe scan from 10 to 19 routes, including phase, playbook, glossary, sources, trends, verification, dashboard and review.',
    ],
    verified: [
      'Read the KPMG Q3 2026 global Venture Pulse page and the GEM 2025/2026 Global Report on 6 Nov 2026. Only worldwide figures and findings are published.',
      'Read the Antigravity documentation for skills, MCP and rules on 6 Nov 2026, including file locations and the 24 KB per-rule limit.',
      'Replaced the accelerator-specific worked example with an illustrative post-money conversion at a $10M cap, and updated the calculator tests to match.',
    ],
    quarantined: [
      'No country-specific grant amounts or national programme figures are published. A single-country claim would need its own official page and policy-cycle review date.',
    ],
    deferred: [
      'Docker 28 and TypeScript 6.0.3 remain stamped despite newer releases. Re-verify the Dockerfile and the TypeScript snippets before bumping them.',
      'Accounts, OAuth and Neon remain deferred.',
    ],
  },
  {
    date: '2026-11-06',
    version: '0.2.0',
    title: 'Harness verification, version drift and a field-manual rebuild',
    changes: [
      `Replaced the two-entry harness table with six harnesses verified against vendor docs, with filters, exact file paths, limitations and doc links.`,
      'Added `npm run check:versions`, which compares stamped tool versions with npm, PyPI, endoflife.date and GitHub tags. The weekly workflow fails when a non-baseline tool is behind.',
      `Added two harness cheatsheets: a portable SKILL.md and the MCP config shape for each harness. The library is now ${manifest.counts.cheatsheets} entries.`,
      'Rebuilt the public visual system: self-hosted Fraunces and Instrument Sans, a horizontal interactive phase explorer, scrollspy on module pages, ruled layouts instead of card stacks, and no eyebrow labels above headings.',
    ],
    verified: [
      'Read the primary documentation for Claude Code, OpenCode, Cursor, Codex CLI, Gemini CLI and GitHub Copilot on 6 Nov 2026.',
      "Recorded Claude Code's AGENTS.md fallback rule and Google's notice that Gemini CLI was replaced by Antigravity CLI for unpaid and Google One users on 18 June 2026.",
      'Corrected the Drizzle Kit stamp: 0.31.11 is the kit version, not the Drizzle ORM version.',
      'Re-crawled 198 links: 196 reachable; the two OpenAI URLs return 403 to automated clients but are valid in a browser.',
    ],
    quarantined: [
      'Antigravity CLI was not in the matrix at this release. Its primary docs were checked before the 0.3.0 entry.',
    ],
    deferred: [
      'Docker 28 and TypeScript 6.0.3 remain stamped despite newer releases. Re-verify the Dockerfile and the TypeScript snippets before bumping them.',
      'Accounts, OAuth and Neon remain deferred.',
    ],
  },
  {
    date: '2026-11-05',
    version: '0.1.0',
    title: 'First public build',
    changes: [
      'Added 106 atomic cheatsheets across 31 modules, with 15 sourced claims and 13 source records.',
      'Added the placement check, fast-track planner, guest dashboard, quiz runner, proof workflow and notes.',
      'Added the startup tools: dilution, runway, cost-plus pricing, unit economics, interview log, outreach tracker, one-page pitch and 90-day plan.',
      'Added the trust pages: methodology, sources, claim explorer, trends, changelog, corrections, about and privacy.',
    ],
    verified: [
      'Read the DeepLearning.AI skills map, Stack Overflow 2026 survey post, MCP 2026-07-28 specification, MCP Registry page, Agent Skills specification, Neon pricing page, Vercel fair-use page and Better Auth security page on 5 Nov 2026.',
      'Corrected a seed figure: the source attribution number is 93% in the Stack Overflow post, not the 78.7% given in the build brief. The published claim uses 93%.',
      'Resolved the Neon storage conflict from the brief: the pricing page states 1 GB per project and 20 GB per account, last updated 31 Oct 2026.',
      'Published only funding arithmetic that could be checked against a primary document at the time; the worldwide rewrite landed in 0.3.0.',
    ],
    quarantined: [
      'A seed claim about an April 2026 Stack Overflow pulse survey was not verified against the linked post and is not published.',
      'A seed claim about a national startup grant programme and platform was not verified against an official programme page and is not published.',
    ],
    deferred: [
      'Accounts, Neon, Better Auth and OAuth are not enabled in this build. Public content and the guest tracker work without them.',
      'The harness comparison contains only entries whose vendor docs were checked; it is intentionally incomplete.',
      'Email verification and password reset remain out of scope until a free sender is confirmed.',
    ],
  },
]

export default function Changelog() {
  return (
    <div className="container-page">
      <PageHeader
        title="What changed, including what was removed"
        lede="Newest first. A correction keeps the old statement visible instead of quietly rewriting it; a quarantined item says why it is not published."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Changelog' }]}
        actions={
          <Link to="/corrections" className="text-sm font-medium text-accent link-underline">
            Corrections
          </Link>
        }
      />

      <div className="space-y-8 py-8">
        {entries.map((entry) => (
          <article key={`${entry.date}-${entry.version}`} className="border-t border-ink pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <div>
                <p className="text-xs text-faint">{entry.date}</p>
                <h2 className="mt-1 text-2xl">{entry.title}</h2>
              </div>
              <span className="mono text-[10px] uppercase tracking-wider text-faint">
                v{entry.version}
              </span>
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold text-ink">Added</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-muted">
                  {entry.changes.map((change) => (
                    <li key={change}>— {change}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold text-ink">Verified</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-muted">
                  {entry.verified.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold text-ink">Quarantined</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-muted">
                  {entry.quarantined.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold text-ink">Deferred</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-muted">
                  {entry.deferred.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-faint">
              <span>Hosting noted:</span>
              <SourceChip claimId="V1" />
              <SourceChip claimId="N1" />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
