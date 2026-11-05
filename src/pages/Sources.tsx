import { ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { TierBadge } from '@/components/ui/Badge'
import { claims, sources } from '@/lib/claims'
import { formatDate, plural } from '@/lib/format'

export default function Sources() {
  const groups: Array<{ tier: 'primary' | 'secondary' | 'community'; title: string; note: string }> = [
    {
      tier: 'primary',
      title: 'Primary sources',
      note: 'The original document, dataset or specification. One primary source can support a factual claim on its own.',
    },
    {
      tier: 'secondary',
      title: 'Secondary sources',
      note: 'Reporting or analysis that describes a primary source. Two independent secondary sources can support a claim; one cannot.',
    },
    {
      tier: 'community',
      title: 'Community sources',
      note: 'Forums, wikis and individual posts. Useful for leads, never sufficient as evidence on their own.',
    },
  ]

  return (
    <div className="container-page">
      <PageHeader
        title="The bibliography behind the claims"
        lede="Each record shows the publisher, tier, retrieval date and the URL. Source records are public even when the claim they support is not on the current page."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Sources' }]}
        actions={<ButtonLink to="/claims" variant="secondary">Claim explorer</ButtonLink>}
      />

      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line py-4">
        <p className="text-xs text-faint">
          <span className="mono text-ink">{sources.length}</span> sources
        </p>
        <p className="text-xs text-faint">
          <span className="mono text-ink">{claims.length}</span> claims
        </p>
        <p className="text-xs text-faint">
          <span className="mono text-ink">
            {sources.filter((source) => source.tier === 'primary').length}
          </span>{' '}
          primary
        </p>
      </div>

      <div className="space-y-10 py-8">
        {groups.map((group) => {
          const list = sources.filter((source) => source.tier === group.tier)
          if (list.length === 0) return null
          return (
            <section key={group.tier}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl">{group.title}</h2>
                <TierBadge tier={group.tier} />
                <span className="mono text-[10px] text-faint">{plural(list.length, 'record')}</span>
              </div>
              <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted">{group.note}</p>
              <ul className="space-y-3">
                {list.map((source) => (
                  <li key={source.id} className="card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent"
                        >
                          {source.title}
                          <ExternalLink size={12} aria-hidden="true" />
                        </a>
                        <p className="text-xs text-muted">{source.publisher}</p>
                      </div>
                      <span className="mono shrink-0 text-[10px] text-faint">{source.id}</span>
                    </div>
                    <div className="mono mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-faint">
                      {source.publishedAt ? <span>published {formatDate(source.publishedAt)}</span> : null}
                      <span>retrieved {formatDate(source.retrievedAt)}</span>
                      <span>{claims.filter((claim) => claim.sourceIds.includes(source.id)).length} linked claims</span>
                    </div>
                    {source.note ? <p className="mt-2 text-xs leading-relaxed text-muted">{source.note}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <p className="pb-12 text-xs leading-relaxed text-faint">
        A link being live is not proof that a claim is correct. Each claim records what was checked,
        when, and by whom the source was published. If a link dies, the weekly link check opens an
        issue and the claim is marked for review.
      </p>
    </div>
  )
}
