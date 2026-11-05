import { useState } from 'react'
import { BookOpen, ExternalLink, ShieldAlert } from 'lucide-react'
import type { Claim } from '@/content/schema'
import { getClaim, isStale, sourcesForClaim } from '@/lib/claims'
import { formatDate } from '@/lib/format'
import { Drawer } from '@/components/ui/Drawer'
import { EvidenceBadge, StaleBadge, TierBadge } from '@/components/ui/Badge'

export function SourceChip({ claimId, label }: { claimId: string; label?: string }) {
  const claim = getClaim(claimId)
  const [open, setOpen] = useState(false)
  if (!claim) return null
  const count = claim.sourceIds.length

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 align-baseline text-[11px] font-medium text-muted hover:border-accent hover:text-accent"
        aria-label={`Open ${count} source${count === 1 ? '' : 's'} for claim ${claim.id}`}
      >
        <BookOpen size={11} aria-hidden="true" />
        <span className="mono">{label ?? claim.id}</span>
      </button>
      <ClaimDrawer claim={claim} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function ClaimDrawer({
  claim,
  open,
  onClose,
}: {
  claim: Claim
  open: boolean
  onClose: () => void
}) {
  const sources = sourcesForClaim(claim)
  const stale = isStale(claim)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Claim ${claim.id}`}
      subtitle={`Checked ${formatDate(claim.verifiedAt)} · review after ${formatDate(claim.reviewAfter)}`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <EvidenceBadge kind={claim.kind} />
          <span className="mono rounded border border-line px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
            Confidence: {claim.confidence}
          </span>
          {stale ? <StaleBadge /> : null}
        </div>

        <p className="text-[0.9375rem] leading-relaxed text-ink">{claim.statement}</p>

        <dl className="grid gap-3 border-y border-line py-4 text-sm">
          <div>
            <dt className="eyebrow mb-1">Scope</dt>
            <dd className="text-muted">{claim.scope}</dd>
          </div>
          {claim.forecastBy ? (
            <div>
              <dt className="eyebrow mb-1">Forecast by</dt>
              <dd className="text-muted">{claim.forecastBy}</dd>
            </div>
          ) : null}
          {claim.falsifiedBy ? (
            <div>
              <dt className="eyebrow mb-1">What would prove this wrong</dt>
              <dd className="text-muted">{claim.falsifiedBy}</dd>
            </div>
          ) : null}
        </dl>

        <div>
          <h3 className="eyebrow mb-3">Sources ({sources.length})</h3>
          {sources.length === 0 ? (
            <p className="flex items-start gap-2 rounded-lg border border-line bg-surface-2 p-3 text-sm text-muted">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              This is an editorial claim. It is labelled as opinion and is not presented as data.
            </p>
          ) : (
            <ul className="space-y-3">
              {sources.map((source) => (
                <li key={source.id} className="rounded-lg border border-line bg-surface p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <TierBadge tier={source.tier} />
                    {source.publishedAt ? (
                      <span className="mono text-[10px] uppercase tracking-wider text-faint">
                        Published {formatDate(source.publishedAt)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">{source.title}</p>
                  <p className="text-xs text-muted">{source.publisher}</p>
                  <p className="mono mt-1 text-[10px] text-faint">
                    Retrieved {formatDate(source.retrievedAt)}
                  </p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent link-underline"
                  >
                    Read the source
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs leading-relaxed text-faint">
          Source tiers: a primary source is the original document or dataset. A secondary source
          reports on it. A community source is never enough on its own. A claim past its review date
          shows “Needs re-check” until it is verified again.
        </p>
      </div>
    </Drawer>
  )
}
