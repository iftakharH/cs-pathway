import { Download, Pin, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, EmptyState } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { CodeBlock } from '@/components/CodeBlock'
import { PinButton } from '@/components/PinButton'
import { getCheat } from '@/lib/content'
import { downloadFile, formatDate, plural } from '@/lib/format'
import { useGuestState } from '@/lib/store'

function toMarkdown(entries: NonNullable<ReturnType<typeof getCheat>>[]): string {
  const lines = ['# My cs-pathway sheet', '', `Exported ${new Date().toISOString().slice(0, 10)}`, '']
  for (const entry of entries) {
    lines.push(`## ${entry.title}`, '')
    lines.push(`_${entry.topic} · checked with ${entry.tool.name} ${entry.tool.version} on ${entry.tool.verifiedOn}_`, '')
    lines.push(entry.whenToUse, '')
    for (const snippet of entry.snippets) {
      lines.push(`\`\`\`${snippet.lang}`, snippet.code.trimEnd(), '```', '')
    }
    if (entry.notes.length > 0) {
      lines.push('**Do**', ...entry.notes.map((note) => `- ${note}`), '')
    }
    if (entry.gotchas.length > 0) {
      lines.push('**Avoid**', ...entry.gotchas.map((note) => `- ${note}`), '')
    }
    lines.push(`Source: ${entry.sourceUrl}`, '')
  }
  return lines.join('\n')
}

export default function Pins() {
  const state = useGuestState()
  const entries = Object.entries(state.pins)
    .sort(([, a], [, b]) => b.localeCompare(a))
    .flatMap(([id]) => {
      const entry = getCheat(id)
      return entry ? [entry] : []
    })

  return (
    <div className="container-page">
      <PageHeader
        kicker="Your sheet"
        title="Pinned cheatsheets"
        lede="The entries you marked for the job. Export them as Markdown, or print a two-column A4 sheet and keep it next to the keyboard."
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Cheatsheets', to: '/cheatsheets' },
          { label: 'Pinned' },
        ]}
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
            <Button
              size="sm"
              onClick={() => downloadFile('cs-pathway-pins.md', toMarkdown(entries), 'text/markdown')}
              disabled={entries.length === 0}
              className="no-print"
            >
              <Download size={14} aria-hidden="true" />
              Export Markdown
            </Button>
          </>
        }
      />

      <div className="py-8">
        {entries.length === 0 ? (
          <EmptyState
            icon={<Pin size={22} aria-hidden="true" />}
            title="Nothing pinned yet"
            body="Open a cheatsheet entry and press Pin. Pinned entries stay in this browser and can be exported or printed."
            action={<ButtonLink to="/cheatsheets">Browse the library</ButtonLink>}
          />
        ) : (
          <>
            <p className="mb-5 text-xs text-faint no-print">
              {plural(entries.length, 'entry', 'entries')} · newest first · saved in this browser
            </p>
            <div className="print-columns space-y-6">
              {entries.map((entry) => (
                <article key={entry.id} className="cheat-entry card p-5">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="eyebrow mb-1">{entry.topic}</p>
                      <h2 className="text-lg leading-snug">
                        <Link to={`/cheatsheet/${entry.id}`} className="hover:text-accent">
                          {entry.title}
                        </Link>
                      </h2>
                    </div>
                    <div className="no-print">
                      <PinButton cheatId={entry.id} />
                    </div>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-muted">{entry.whenToUse}</p>
                  {entry.snippets.map((snippet, index) => (
                    <CodeBlock
                      key={`${entry.id}-${index}`}
                      code={snippet.code}
                      lang={snippet.lang}
                      caption={snippet.caption}
                      executed={snippet.runnable && snippet.checked === 'executed'}
                      compact
                    />
                  ))}
                  <p className="mono mt-3 text-[9px] text-faint">
                    {entry.tool.name} {entry.tool.version} · verified {formatDate(entry.tool.verifiedOn)}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
