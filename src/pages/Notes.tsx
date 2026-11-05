import { Download, NotebookPen, Printer, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, EmptyState } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { getCheat, getModule } from '@/lib/content'
import { downloadFile, formatDate, plural } from '@/lib/format'
import { deleteNote, useGuestState } from '@/lib/store'

function labelFor(key: string): { label: string; to?: string } {
  if (key.startsWith('module:')) {
    const id = key.replace('module:', '')
    const module = getModule(id)
    return { label: module?.title ?? id, to: `/module/${id}` }
  }
  if (key.startsWith('cheat:')) {
    const id = key.replace('cheat:', '')
    const entry = getCheat(id)
    return { label: entry?.title ?? id, to: `/cheatsheet/${id}` }
  }
  return { label: key }
}

export default function Notes() {
  const state = useGuestState()
  const entries = Object.entries(state.notes).sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt))

  function exportMarkdown() {
    const lines = ['# My cs-pathway notes', '', `Exported ${new Date().toISOString().slice(0, 10)}`, '']
    for (const [key, note] of entries) {
      const { label } = labelFor(key)
      lines.push(`## ${label}`, '', note.body, '', `_Updated ${note.updatedAt.slice(0, 10)}_`, '')
    }
    downloadFile('cs-pathway-notes.md', lines.join('\n'), 'text/markdown')
  }

  return (
    <div className="container-page">
      <PageHeader
        kicker="Notes"
        title="What you wrote down"
        lede="Notes are attached to a module or a cheatsheet and stored in this browser. Export them before clearing site data."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Notes' }]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              disabled={entries.length === 0}
              className="no-print"
            >
              <Printer size={14} aria-hidden="true" />
              Print
            </Button>
            <Button size="sm" onClick={exportMarkdown} disabled={entries.length === 0} className="no-print">
              <Download size={14} aria-hidden="true" />
              Export Markdown
            </Button>
          </>
        }
      />

      <div className="py-8">
        {entries.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={22} aria-hidden="true" />}
            title="No notes yet"
            body="Each module and cheatsheet has a note field. Write the thing you will want in six months, not a summary of the page."
            action={<ButtonLink to="/path">Open a module</ButtonLink>}
          />
        ) : (
          <>
            <p className="mb-5 text-xs text-faint no-print">
              {plural(entries.length, 'note')} · newest first
            </p>
            <div className="space-y-4">
              {entries.map(([key, note]) => {
                const { label, to } = labelFor(key)
                return (
                  <article key={key} className="card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="eyebrow mb-1">Note</p>
                        <h2 className="text-lg">
                          {to ? (
                            <Link to={to} className="hover:text-accent">
                              {label}
                            </Link>
                          ) : (
                            label
                          )}
                        </h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Delete this note?')) deleteNote(key)
                        }}
                        className="no-print"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{note.body}</p>
                    <p className="mono mt-3 text-[10px] text-faint">
                      Updated {formatDate(note.updatedAt.slice(0, 10))}
                    </p>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
