import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MiniSearch from 'minisearch'
import { CornerDownLeft, Search, X } from 'lucide-react'
import { cheatsheets, claims, glossary, modules, phases, playbook } from '@/lib/content'

type Result = {
  id: string
  title: string
  subtitle: string
  url: string
}

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const index = useMemo(() => {
    const mini = new MiniSearch<Result & { body: string; tags: string }>({
      fields: ['title', 'body', 'tags'],
      storeFields: ['title', 'subtitle', 'url'],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2.5, tags: 1.2 } },
    })
    mini.addAll([
      ...modules.map((module) => ({
        id: `module:${module.id}`,
        title: module.title,
        subtitle: `Module · ${phases.find((phase) => phase.id === module.phase)?.name ?? module.phase}`,
        url: `/module/${module.id}`,
        body: `${module.summary} ${module.objectives.join(' ')}`,
        tags: module.phase,
      })),
      ...cheatsheets.map((entry) => ({
        id: `cheat:${entry.id}`,
        title: entry.title,
        subtitle: `Cheatsheet · ${entry.topic}`,
        url: `/cheatsheet/${entry.id}`,
        body: `${entry.whenToUse} ${entry.notes.join(' ')} ${entry.gotchas.join(' ')}`,
        tags: entry.tags.join(' '),
      })),
      ...glossary.map((term) => ({
        id: `term:${term.term}`,
        title: term.term,
        subtitle: 'Glossary',
        url: `/glossary#${term.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        body: term.definition,
        tags: 'definition',
      })),
      ...claims.map((claim) => ({
        id: `claim:${claim.id}`,
        title: `Claim ${claim.id}`,
        subtitle: 'Claim explorer',
        url: `/claims?claim=${claim.id}`,
        body: claim.statement,
        tags: claim.topics?.join(' ') ?? '',
      })),
      ...playbook.map((entry) => ({
        id: `playbook:${entry.id}`,
        title: entry.task,
        subtitle: 'Playbook',
        url: `/playbook/${entry.id}`,
        body: `${entry.summary} ${entry.checklist.join(' ')}`,
        tags: 'agent',
      })),
      ...phases.map((phase) => ({
        id: `phase:${phase.id}`,
        title: phase.name,
        subtitle: `Phase ${phase.id}`,
        url: `/phase/${phase.id}`,
        body: `${phase.description} ${phase.gate}`,
        tags: 'roadmap',
      })),
    ])
    return mini
  }, [])

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    return index.search(query).slice(0, 9) as unknown as Result[]
  }, [index, query])

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function choose(result: Result | undefined) {
    if (!result) return
    navigate(result.url)
    onClose()
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => Math.min(results.length - 1, current + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(0, current - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(results[active])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search cs-pathway"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="shrink-0 text-faint" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onInputKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-autocomplete="list"
            placeholder="Search modules, cheatsheets, claims…"
            className="h-14 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-faint hover:bg-surface-2 hover:text-ink"
            aria-label="Close search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {query.trim().length < 2 ? (
          <div className="px-4 py-5 text-sm text-muted">
            <p className="mb-3">Type at least two characters. Try:</p>
            <div className="flex flex-wrap gap-2">
              {['git rebase', 'window function', 'CORS', 'RAG', 'SAFE', 'auth'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-xs text-muted hover:border-accent hover:text-accent"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            No result for “{query}”. Try a shorter term.
          </p>
        ) : (
          <ul ref={listRef} id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto py-2">
            {results.map((result, index) => (
              <li key={result.id} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(result)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left ${
                    index === active ? 'bg-accent-soft' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{result.title}</span>
                    <span className="block truncate text-xs text-faint">{result.subtitle}</span>
                  </span>
                  {index === active ? (
                    <CornerDownLeft size={14} className="shrink-0 text-accent" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[10px] text-faint">
          <span className="mono">↑↓ to move · Enter to open · Esc to close</span>
          <span className="mono">Search runs in your browser</span>
        </div>
      </div>
    </div>
  )
}
