import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, Check, ExternalLink, Link2, Printer, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { PhaseBadge } from '@/components/ui/Badge'
import { CodeBlock } from '@/components/CodeBlock'
import { PinButton } from '@/components/PinButton'
import { NoteEditor } from '@/components/NoteEditor'
import { getCheat, slugify } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { InlineText } from '@/components/InlineText'

export default function Cheatsheet() {
  const { id } = useParams()
  const entry = getCheat(id)
  const [linkCopied, setLinkCopied] = useState(false)

  if (!entry) {
    return (
      <div className="container-page py-20">
        <p className="eyebrow mb-3">Not found</p>
        <h1 className="text-3xl">That cheatsheet entry does not exist.</h1>
        <p className="mt-2 text-muted">Browse the library to find one that does.</p>
        <div className="mt-6">
          <ButtonLink to="/cheatsheets">Back to the library</ButtonLink>
        </div>
      </div>
    )
  }

  const related = entry.seeAlso.flatMap((relatedId) => {
    const relatedEntry = getCheat(relatedId)
    return relatedEntry ? [relatedEntry] : []
  })

  async function copyPermalink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 1800)
    } catch {
      setLinkCopied(false)
    }
  }

  return (
    <div className="container-page">
      <PageHeader
        kicker={`${entry.topic} · Phase ${entry.phase}`}
        title={entry.title}
        lede={entry.whenToUse}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Cheatsheets', to: '/cheatsheets' },
          { label: entry.topic, to: `/cheatsheets/${slugify(entry.topic)}` },
          { label: entry.title },
        ]}
      />

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <article className="min-w-0">
          <div className="mb-5 flex flex-wrap gap-2 no-print">
            <PinButton cheatId={entry.id} />
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" />
              Print
            </Button>
            <Button variant="ghost" size="sm" onClick={copyPermalink}>
              <Link2 size={14} aria-hidden="true" />
              {linkCopied ? 'Link copied' : 'Copy link'}
            </Button>
          </div>

          <div className="space-y-4">
            {entry.snippets.map((snippet, index) => (
              <div key={`${entry.id}-snippet-${index}`}>
                <CodeBlock
                  code={snippet.code}
                  lang={snippet.lang}
                  caption={snippet.caption}
                  executed={snippet.runnable && snippet.checked === 'executed'}
                />
                <p className="mt-1.5 text-[11px] text-faint">
                  {snippet.runnable
                    ? 'Executed by the snippet test suite on every push.'
                    : 'Checked against the official docs, not executed.'}
                </p>
              </div>
            ))}
          </div>

          {entry.notes.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-2 text-lg">Do</h2>
              <ul className="space-y-2">
                {entry.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                    <Check size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    <span>
                      <InlineText text={note} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {entry.gotchas.length > 0 ? (
            <section className="mt-6">
              <h2 className="mb-2 text-lg">Avoid</h2>
              <ul className="space-y-2">
                {entry.gotchas.map((gotcha) => (
                  <li key={gotcha} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                    <span>
                      <InlineText text={gotcha} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-8 rounded-lg border border-line bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow mb-1">Source</p>
                <p className="text-sm text-ink">
                  Checked against the official documentation for {entry.tool.name}{' '}
                  {entry.tool.version}.
                </p>
                <p className="mono mt-1 text-[10px] text-faint">
                  Verified {formatDate(entry.tool.verifiedOn)}
                </p>
              </div>
              <a
                href={entry.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-accent hover:border-accent"
              >
                Open the docs
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>
          </section>

          {related.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-2 text-lg">See also</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {related.map((relatedEntry) => (
                  <li key={relatedEntry.id}>
                    <Link
                      to={`/cheatsheet/${relatedEntry.id}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-muted hover:border-accent hover:text-ink"
                    >
                      <span>{relatedEntry.title}</span>
                      <span className="mono shrink-0 text-[9px] uppercase tracking-wider text-faint">
                        {relatedEntry.topic}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-8 border-t border-line pt-8 no-print">
            <NoteEditor
              key={entry.id}
              storageKey={`cheat:${entry.id}`}
              title="Your note on this entry"
              description="A project-specific detail, a version quirk, or the command you always forget. Saved in this browser."
              placeholder="On our Postgres 17 cluster, this needs…"
            />
          </section>
        </article>

        <aside className="space-y-4 no-print lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <p className="eyebrow mb-2">Version stamp</p>
            <p className="text-sm font-medium text-ink">
              {entry.tool.name} {entry.tool.version}
            </p>
            <p className="mt-1 text-xs text-muted">
              Verified {formatDate(entry.tool.verifiedOn)}
            </p>
          </div>
          <div className="card p-4">
            <p className="eyebrow mb-2">Phase</p>
            <PhaseBadge phase={entry.phase} showName />
          </div>
          <div className="card p-4">
            <p className="eyebrow mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/cheatsheets?tag=${encodeURIComponent(tag)}`}
                  className="mono rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[9px] text-faint hover:text-accent"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <p className="eyebrow mb-2">Trust</p>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              Every snippet is either executed in CI or marked as checked against docs only.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
