import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, ExternalLink, Filter } from 'lucide-react'
import { PageHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { EvidenceBadge, StaleBadge } from '@/components/ui/Badge'
import { ClaimDrawer } from '@/components/SourceChip'
import { claims, getClaim, isStale, sourcesForClaim } from '@/lib/claims'
import { phases } from '@/lib/phases'
import { downloadFile, formatDate, toCsv } from '@/lib/format'
import { cx } from '@/lib/format'

const kinds = ['observed-data', 'spec-fact', 'forecast', 'editorial'] as const

export default function Claims() {
  const [params] = useSearchParams()
  const initial = params.get('claim')
  const [openId, setOpenId] = useState<string | null>(initial && getClaim(initial) ? initial : null)
  const [kind, setKind] = useState('all')
  const [confidence, setConfidence] = useState('all')
  const [phase, setPhase] = useState('all')
  const [staleOnly, setStaleOnly] = useState(false)

  const filtered = useMemo(
    () =>
      claims
        .filter((claim) => (kind === 'all' ? true : claim.kind === kind))
        .filter((claim) => (confidence === 'all' ? true : claim.confidence === confidence))
        .filter((claim) => (phase === 'all' ? true : claim.phase === phase))
        .filter((claim) => (staleOnly ? isStale(claim) : true))
        .sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt)),
    [kind, confidence, phase, staleOnly],
  )

  const openClaim = openId ? getClaim(openId) : undefined

  function exportCsv() {
    downloadFile(
      'cs-pathway-claims.csv',
      toCsv(
        filtered.map((claim) => ({
          id: claim.id,
          statement: claim.statement,
          kind: claim.kind,
          confidence: claim.confidence,
          scope: claim.scope,
          verifiedAt: claim.verifiedAt,
          reviewAfter: claim.reviewAfter,
          sourceIds: claim.sourceIds.join(' | '),
          sourceUrls: sourcesForClaim(claim).map((source) => source.url).join(' | '),
        })),
      ),
      'text/csv',
    )
  }

  return (
    <div className="container-page">
      <PageHeader
        title="Every factual statement, with its evidence"
        lede="Filter by kind, confidence or phase. “Needs re-check” means the review date has passed; the claim stays visible but is not presented as fresh."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Claims' }]}
        actions={
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <Download size={14} aria-hidden="true" />
            Export CSV
          </Button>
        }
      />

      <div className="border-b border-line py-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Kind" id="claim-kind" value={kind} onChange={setKind}>
            <option value="all">All kinds</option>
            {kinds.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Confidence" id="claim-confidence" value={confidence} onChange={setConfidence}>
            <option value="all">All confidence</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </FilterSelect>
          <FilterSelect label="Phase" id="claim-phase" value={phase} onChange={setPhase}>
            <option value="all">All phases</option>
            {phases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.name}
              </option>
            ))}
          </FilterSelect>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={staleOnly}
              onChange={(event) => setStaleOnly(event.target.checked)}
              className="accent-[var(--accent)]"
            />
            Needs re-check only
          </label>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-faint" aria-live="polite">
          <Filter size={12} aria-hidden="true" />
          {filtered.length} of {claims.length} claims
        </p>
      </div>

      <ul className="space-y-3 py-6">
        {filtered.map((claim) => {
          const sourceCount = claim.sourceIds.length
          return (
            <li key={claim.id}>
              <button
                type="button"
                onClick={() => setOpenId(claim.id)}
                className="card w-full p-4 text-left hover:border-accent"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono rounded border border-line bg-surface-2 px-2 py-1 text-[10px] font-semibold text-muted">
                    {claim.id}
                  </span>
                  <EvidenceBadge kind={claim.kind} />
                  <span className="mono text-[10px] uppercase tracking-wider text-faint">
                    {claim.confidence} confidence
                  </span>
                  {isStale(claim) ? <StaleBadge /> : null}
                  {claim.phase ? (
                    <span className="mono text-[10px] text-faint">phase {claim.phase}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink">{claim.statement}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-faint">
                  <span className="mono">
                    {sourceCount} source{sourceCount === 1 ? '' : 's'}
                  </span>
                  <span className="mono">checked {formatDate(claim.verifiedAt)}</span>
                  <span className="mono">review after {formatDate(claim.reviewAfter)}</span>
                  <span className="mono">{claim.scope}</span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="pb-12 text-sm text-muted">No claim matches those filters.</p>
      ) : null}

      <div className={cx('border-t border-line py-6 text-xs leading-relaxed text-muted', 'print:hidden')}>
        <p>
          Source records are public on the{' '}
          <a href="/sources" className="text-accent link-underline">
            sources page
          </a>
          . A claim marked “editorial” is an argument, not a measurement, and is labelled that way
          wherever it appears. A forecast must name its author and state what would prove it wrong.
        </p>
        <p className="mt-2 inline-flex items-center gap-1">
          <ExternalLink size={11} aria-hidden="true" />
          Corrections go through the{' '}
          <a href="/corrections" className="text-accent link-underline">
            corrections process
          </a>
          .
        </p>
      </div>

      {openClaim ? (
        <ClaimDrawer claim={openClaim} open onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  )
}

function FilterSelect({
  label,
  id,
  value,
  onChange,
  children,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
      >
        {children}
      </select>
    </div>
  )
}
