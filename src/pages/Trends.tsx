import { PageHeader, Callout } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { SourceChip } from '@/components/SourceChip'
import { TRENDS as trends } from '@/content/generated/trends'

function trendLevelLabel(level: 'observed' | 'emerging' | 'forecast') {
  return level === 'observed' ? 'Observed in 2026' : level === 'emerging' ? 'Emerging' : 'Forecast'
}

const levels = ['observed', 'emerging', 'forecast'] as const

export default function Trends() {
  return (
    <div className="container-page">
      <PageHeader
        title="What changed, what is emerging, and what is only a guess"
        lede="Three labels, used strictly. Observed means a survey or dataset. Emerging means a specification or behaviour with early evidence. Forecast means a named institution made a prediction that could be proven wrong."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Trends' }]}
      />

      <div className="space-y-10 py-8">
        {levels.map((level) => {
          const items = trends.filter((trend) => trend.level === level)
          return (
            <section key={level}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl">{trendLevelLabel(level)}</h2>
                <span className="mono text-[10px] uppercase tracking-wider text-faint">
                  {items.length} {items.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {items.length === 0 ? (
                <Callout tone="warn" title="No forecast has met the bar">
                  A forecast is published only when a named analyst or institution made it, the
                  date is known, and the claim states what would prove it wrong. None met that bar
                  at this build, so this section is empty by design. An empty section is more
                  honest than a confident guess.
                </Callout>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((trend) => (
                    <article key={trend.id} className="card flex h-full flex-col p-5">
                      <p className="mono mb-2 inline-flex w-fit rounded border border-line bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
                        {trendLevelLabel(trend.level)}
                      </p>
                      <h3 className="text-lg leading-snug">{trend.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{trend.body}</p>
                      {trend.falsifiedBy ? (
                        <p className="mt-3 rounded-md border border-warn/30 bg-warn-soft px-3 py-2 text-xs leading-relaxed text-warn">
                          What would prove this wrong: {trend.falsifiedBy}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="mono text-[9px] uppercase tracking-wider text-faint">
                          Evidence
                        </span>
                        {trend.claimIds.map((claimId) => (
                          <SourceChip key={claimId} claimId={claimId} />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <section className="border-t border-line py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Trends are a reading aid, not a syllabus. The path teaches the skills that survive a
            change in tooling: fundamentals, measurement and verification.
          </p>
          <div className="flex gap-2">
            <ButtonLink to="/claims" variant="secondary" size="sm">
              Claim explorer
            </ButtonLink>
            <ButtonLink to="/methodology" variant="ghost" size="sm">
              Methodology
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
