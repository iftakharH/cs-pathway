import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Filter, Printer, Search, X } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { PhaseBadge } from '@/components/ui/Badge'
import { PinButton } from '@/components/PinButton'
import {
  cheatsheetIndex,
  cheatsheetsByTopic,
  tags as allTags,
  topics as allTopics,
} from '@/lib/catalog'
import { phases } from '@/lib/phases'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'
import { cx, plural } from '@/lib/format'

export default function Cheatsheets() {
  const { topic: topicParam } = useParams()
  const topicsWithSlug = cheatsheetsByTopic()
  const topicFromRoute = topicParam
    ? topicsWithSlug.find((group) => group.slug === topicParam)?.topic
    : undefined

  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') ?? ''
  const phase = params.get('phase') ?? 'all'
  const topic = topicFromRoute ?? params.get('topic') ?? 'all'
  const tag = params.get('tag') ?? 'all'

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  function setTopic(value: string) {
    if (topicFromRoute) {
      navigate(value === 'all' ? '/cheatsheets' : `/cheatsheets?topic=${encodeURIComponent(value)}`)
      return
    }
    setParam('topic', value)
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return cheatsheetIndex
      .filter((entry) => (phase === 'all' ? true : entry.phase === phase))
      .filter((entry) => (topic === 'all' ? true : entry.topic === topic))
      .filter((entry) => (tag === 'all' ? true : entry.tags.includes(tag)))
      .filter((entry) => {
        if (!needle) return true
        return [entry.title, entry.whenToUse, entry.topic, entry.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
      .sort((a, b) => {
        const phaseDiff = phases.findIndex((p) => p.id === a.phase) - phases.findIndex((p) => p.id === b.phase)
        return phaseDiff !== 0 ? phaseDiff : a.title.localeCompare(b.title)
      })
  }, [phase, topic, tag, q])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const entry of filtered) {
      const list = map.get(entry.topic) ?? []
      list.push(entry)
      map.set(entry.topic, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const hasFilters = Boolean(q || phase !== 'all' || topic !== 'all' || tag !== 'all')

  function clearFilters() {
    if (topicFromRoute) {
      navigate('/cheatsheets')
      return
    }
    setParams(new URLSearchParams(), { replace: true })
  }

  return (
    <div className="container-page">
      <PageHeader
        kicker="Cheatsheet library"
        title="One task. One answer. One source."
        lede={`${manifest.counts.cheatsheets} atomic entries, ${manifest.runnableSnippets} of them executed in CI. Copy a snippet, print a sheet, or pin the entries you use on the job.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Cheatsheets' }]}
        actions={
          <ButtonLink to="/pins" variant="secondary">
            <Printer size={15} aria-hidden="true" />
            My pinned sheet
          </ButtonLink>
        }
      />

      <div className="border-b border-line py-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setParam('phase', 'all')}
            className={cx(
              'mono min-h-9 rounded-md border px-2.5 text-[10px] uppercase tracking-wider',
              phase === 'all' ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:text-ink',
            )}
          >
            All phases
          </button>
          {phases.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setParam('phase', item.id)}
              className={cx(
                'mono min-h-9 rounded-md border px-2.5 text-[10px] uppercase tracking-wider',
                phase === item.id
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line bg-surface text-muted hover:text-ink',
              )}
            >
              {item.id} · {item.name}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <label htmlFor="cheat-search" className="sr-only">
              Search cheatsheets
            </label>
            <input
              id="cheat-search"
              type="search"
              value={q}
              onChange={(event) => setParam('q', event.target.value)}
              placeholder="Search titles, notes, tags…"
              className="min-h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="topic-filter" className="sr-only">
              Topic
            </label>
            <select
              id="topic-filter"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 pr-8 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All topics</option>
              {allTopics().map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tag-filter" className="sr-only">
              Tag
            </label>
            <select
              id="tag-filter"
              value={tag}
              onChange={(event) => setParam('tag', event.target.value)}
              className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 pr-8 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All tags</option>
              {allTags().map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-faint">
          <span aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            {hasFilters ? ' matching' : ''}
          </span>
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-accent">
              <X size={12} aria-hidden="true" />
              Clear filters
            </button>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Filter size={12} aria-hidden="true" />
            Filters are in the URL, so you can share them
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<Search size={22} aria-hidden="true" />}
            title="No entries match"
            body="Try a shorter search, another phase, or clear the filters."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-2"
              >
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-10 py-8">
          {grouped.map(([topicName, entries]) => (
            <section key={topicName} id={`topic-${topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <h2 className="text-xl">{topicName}</h2>
                <span className="mono text-[10px] uppercase tracking-wider text-faint">
                  {plural(entries.length, 'entry', 'entries')}
                </span>
              </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <article className="card flex h-full flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/cheatsheet/${entry.id}`}
                          className="text-sm font-medium leading-snug text-ink hover:text-accent"
                        >
                          {entry.title}
                        </Link>
                        <PinButton cheatId={entry.id} compact />
                      </div>
                      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">{entry.whenToUse}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <PhaseBadge phase={entry.phase} />
                        {entry.tags.slice(0, 3).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setParam('tag', item)}
                            className="mono rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[9px] text-faint hover:text-accent"
                          >
                            {item}
                          </button>
                        ))}
                        <span className="mono ml-auto text-[9px] text-faint">
                          {entry.tool.name} {entry.tool.version}
                        </span>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
