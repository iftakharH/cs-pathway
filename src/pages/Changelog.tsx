import { PageHeader } from '@/components/ui/Section'
import { Link } from 'react-router-dom'
import { SourceChip } from '@/components/SourceChip'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'

const entries = [
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
      'Antigravity CLI is not in the matrix. Its primary documentation was not checked, so an entry would be a guess.',
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
      'Added the startup tools: SAFE dilution, runway, cost-plus pricing, unit economics, interview log, outreach tracker, one-page pitch and 90-day plan.',
      'Added the trust pages: methodology, sources, claim explorer, trends, changelog, corrections, about and privacy.',
    ],
    verified: [
      'Read the DeepLearning.AI skills map, Stack Overflow 2026 survey post, MCP 2026-07-28 specification, MCP Registry page, Agent Skills specification, YC deal page, Neon pricing page, Vercel fair-use page and Better Auth security page on 5 Nov 2026.',
      'Corrected a seed figure: the source attribution number is 93% in the Stack Overflow post, not the 78.7% given in the build brief. The published claim uses 93%.',
      'Resolved the Neon storage conflict from the brief: the pricing page states 1 GB per project and 20 GB per account, last updated 31 Oct 2026.',
      'Replaced the Y Combinator funding claim with the exact structure on the deal page: $125,000 for 7% plus $375,000 on an uncapped MFN SAFE.',
    ],
    quarantined: [
      'A seed claim about an April 2026 Stack Overflow pulse survey was not verified against the linked post and is not published.',
      'A seed claim about July 2026 Bangladesh startup grants and a national platform was not verified against an official programme page and is not published.',
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
          <article key={`${entry.date}-${entry.version}`} className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <div>
                <p className="eyebrow mb-1">{entry.date}</p>
                <h2 className="text-2xl">{entry.title}</h2>
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
