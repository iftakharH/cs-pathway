import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { CHEATSHEETS } from '@/content/generated/cheatsheets'
import { HARNESSES } from '@/content/generated/harnesses'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'
import { claims, isStale, sources } from '@/lib/claims'
import { todayIso } from '@/lib/dates'
import { formatDate, plural } from '@/lib/format'

const checkCommands = [
  ['npm run validate', 'Schema, sources, review dates and banned phrases.'],
  ['npm run test:snippets', 'Executes every runnable snippet and compares its output.'],
  ['npm run check:links', 'Fetches every source, resource and quiz URL.'],
  ['npm run check:stale', 'Fails when a claim is past its review date.'],
  ['npm run check:versions -- --strict', 'Compares tool stamps with npm, PyPI, endoflife.date and GitHub.'],
]

const kindLabel: Record<string, string> = {
  'observed-data': 'Observed data',
  'spec-fact': 'Official docs',
  forecast: 'Forecast',
  editorial: 'Editorial',
}

export default function Verification() {
  const today = todayIso()
  const stale = claims.filter((claim) => isStale(claim, today))
  const runnable = CHEATSHEETS.flatMap((entry) => entry.snippets).filter(
    (snippet) => snippet.runnable,
  ).length
  const tools = [...new Set(CHEATSHEETS.map((entry) => entry.tool.name))].sort()
  const latestHarnessCheck = [...HARNESSES].map((harness) => harness.verifiedOn).sort()[
    HARNESSES.length - 1
  ]

  return (
    <div className="container-page">
      <PageHeader
        title="What is verified, and when"
        lede="Every claim, source, harness row and tool stamp has a date. This page is the audit trail: what was checked, how to reproduce it, and what is due for review."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Verification' }]}
        actions={
          <Link
            to="/methodology"
            className="text-sm font-medium text-accent underline decoration-line underline-offset-4"
          >
            Read the method
          </Link>
        }
      />

      <div className="grid gap-6 border-b border-line py-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-faint">Sources</p>
          <p className="mono mt-1 text-2xl text-ink">{sources.length}</p>
          <p className="mt-0.5 text-[11px] text-faint">
            {sources.filter((source) => source.tier === 'primary').length} primary
          </p>
        </div>
        <div>
          <p className="text-xs text-faint">Claims</p>
          <p className="mono mt-1 text-2xl text-ink">{claims.length}</p>
          <p className="mt-0.5 text-[11px] text-faint">
            {stale.length === 0 ? 'None past review' : `${stale.length} past review`}
          </p>
        </div>
        <div>
          <p className="text-xs text-faint">Executed snippets</p>
          <p className="mono mt-1 text-2xl text-ink">{runnable}</p>
          <p className="mt-0.5 text-[11px] text-faint">
            of {manifest.counts.cheatsheets} cheatsheets
          </p>
        </div>
        <div>
          <p className="text-xs text-faint">Harnesses checked</p>
          <p className="mono mt-1 text-2xl text-ink">{HARNESSES.length}</p>
          <p className="mt-0.5 text-[11px] text-faint">
            last {latestHarnessCheck ? formatDate(latestHarnessCheck) : '—'}
          </p>
        </div>
      </div>

      <Callout tone={stale.length > 0 ? 'warn' : 'accent'} title="The build fails on an unsourced claim">
        A factual claim needs a primary source, or two independent secondary sources. A claim past
        its review date is shown with a warning rather than silently trusted. The validator runs
        before every build, so a broken source link or missing review date cannot ship.
      </Callout>

      <section className="py-8" aria-labelledby="claims-check">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
          <h2 id="claims-check" className="text-2xl">
            Claims and review dates
          </h2>
          <Link to="/claims" className="text-xs font-medium text-accent">
            Open the claim explorer
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] text-faint">
                <th scope="col" className="py-2 pr-3 font-medium">Claim</th>
                <th scope="col" className="px-3 py-2 font-medium">Kind</th>
                <th scope="col" className="px-3 py-2 font-medium">Confidence</th>
                <th scope="col" className="px-3 py-2 font-medium">Checked</th>
                <th scope="col" className="px-3 py-2 font-medium">Review after</th>
                <th scope="col" className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => {
                const overdue = isStale(claim, today)
                return (
                  <tr key={claim.id} className="border-b border-line last:border-0">
                    <td className="max-w-[26rem] py-2.5 pr-3">
                      <span className="mono mr-2 text-[10px] text-accent">{claim.id}</span>
                      <span className="line-clamp-2 text-xs leading-relaxed text-muted">
                        {claim.statement}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">
                      {kindLabel[claim.kind] ?? claim.kind}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">{claim.confidence}</td>
                    <td className="mono px-3 py-2.5 text-[11px] text-faint">
                      {formatDate(claim.verifiedAt)}
                    </td>
                    <td className="mono px-3 py-2.5 text-[11px] text-faint">
                      {formatDate(claim.reviewAfter)}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {overdue ? (
                        <span className="font-medium text-warn">Needs re-check</span>
                      ) : (
                        <span className="text-accent">Current</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="py-8" aria-labelledby="sources-check">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
          <h2 id="sources-check" className="text-2xl">
            Source records
          </h2>
          <Link to="/sources" className="text-xs font-medium text-accent">
            Open the bibliography
          </Link>
        </div>
        <ul className="border-t border-line">
          {sources.map((source) => (
            <li key={source.id} className="border-b border-line py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent"
                >
                  {source.title}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
                <span className="mono text-[10px] text-faint">
                  {source.tier} · retrieved {formatDate(source.retrievedAt)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{source.publisher}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-8" aria-labelledby="harness-check">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
          <h2 id="harness-check" className="text-2xl">
            Harness rows
          </h2>
          <Link to="/harnesses" className="text-xs font-medium text-accent">
            Compare the matrix
          </Link>
        </div>
        <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
          {HARNESSES.map((harness) => (
            <li
              key={harness.id}
              className="flex items-baseline justify-between gap-3 border-b border-line py-2.5"
            >
              <span className="text-sm text-ink">
                {harness.name}
                {harness.status === 'legacy' ? (
                  <span className="ml-1.5 text-[10px] text-warn">legacy</span>
                ) : null}
              </span>
              <span className="mono text-[10px] text-faint">
                {formatDate(harness.verifiedOn)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-8">
        <h2 className="text-2xl">Tool stamps</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          {plural(tools.length, 'tool')} across the cheatsheet library. A stamp moves only after the
          entry is re-read against the newer docs and, where applicable, its snippets are re-run.
        </p>
        <details className="mt-4 border-y border-line py-3">
          <summary className="cursor-pointer text-sm font-medium text-accent">
            Show all {tools.length} stamped tools
          </summary>
          <ul className="mt-3 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const entries = CHEATSHEETS.filter((entry) => entry.tool.name === tool)
              const stamp = entries[0]?.tool
              return (
                <li
                  key={tool}
                  className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-xs last:border-0"
                >
                  <span className="min-w-0 truncate text-muted">{tool}</span>
                  <span className="mono shrink-0 text-[10px] text-faint">
                    {stamp ? `${stamp.version} · ${formatDate(stamp.verifiedOn)}` : '—'}
                  </span>
                </li>
              )
            })}
          </ul>
        </details>
      </section>

      <section className="border-t border-line py-8">
        <h2 className="text-2xl">How to reproduce the checks</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          These commands run locally and in the weekly workflow. If one fails, the fix is a
          correction or a quarantine entry, not a silenced warning.
        </p>
        <dl className="mt-4 border-t border-line">
          {checkCommands.map(([command, description]) => (
            <div
              key={command}
              className="grid gap-1 border-b border-line py-2.5 sm:grid-cols-[16rem_1fr] sm:gap-4"
            >
              <dt className="mono text-[11px] text-ink">{command}</dt>
              <dd className="text-xs leading-relaxed text-muted">{description}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-faint">
          Two remote pages return 403 to automated clients. The link check reports them as
          blocked-by-host and names them, instead of counting them as broken or silently passing.
          Manual-review tools with no registry mapping are reported by the version check and must be
          read by a person.
        </p>
      </section>
    </div>
  )
}
