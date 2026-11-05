import { useState } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/Section'
import { GLOSSARY as glossary } from '@/content/generated/glossary'

function anchor(term: string) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export default function Glossary() {
  const [query, setQuery] = useState('')
  const filtered = glossary
    .filter((item) =>
      `${item.term} ${item.definition}`.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => a.term.localeCompare(b.term))

  return (
    <div className="container-page">
      <PageHeader
        title="The words, defined once"
        lede="Each definition links to a primary explanation from the body that maintains the idea — not to another glossary."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Glossary' }]}
      />

      <div className="py-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <label htmlFor="glossary-search" className="sr-only">
            Search the glossary
          </label>
          <input
            id="glossary-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a term or definition…"
            className="min-h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <p className="mt-2 text-xs text-faint" aria-live="polite">
          {filtered.length} of {glossary.length} terms
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={22} aria-hidden="true" />}
          title="No term matches"
          body="Try a shorter word, or browse the list with an empty search."
        />
      ) : (
        <dl className="grid gap-4 pb-12 md:grid-cols-2">
          {filtered.map((item) => (
            <div key={item.term} id={anchor(item.term)} className="card scroll-mt-24 p-4">
              <dt className="text-lg">{item.term}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                {item.definition}
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent link-underline"
                >
                  {item.sourceTitle}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
