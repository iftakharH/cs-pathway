import { useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Check, ExternalLink, ShieldCheck } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { CodeBlock } from '@/components/CodeBlock'
import { PLAYBOOK } from '@/content/generated/playbook'
import { getPhase } from '@/lib/phases'
import { formatDate } from '@/lib/format'
import { InlineText } from '@/components/InlineText'

const riskStyles = {
  low: 'border-line bg-surface-2 text-muted',
  medium: 'border-warn/30 bg-warn-soft text-warn',
  high: 'border-danger/30 bg-danger-soft text-danger',
}

export default function PlaybookEntry() {
  const { id } = useParams()
  const entry = PLAYBOOK.find((item) => item.id === id)

  if (!entry) {
    return (
      <div className="container-page py-20">
        <p className="eyebrow mb-3">Not found</p>
        <h1 className="text-3xl">That playbook entry does not exist.</h1>
        <div className="mt-6">
          <ButtonLink to="/playbook">Back to the playbook</ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page">
      <PageHeader
        kicker={`Playbook · ${entry.risk} risk`}
        title={entry.task}
        lede={entry.summary}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Playbook', to: '/playbook' },
          { label: entry.task },
        ]}
        actions={<ButtonLink to="/playbook/security" variant="secondary">Security checklist</ButtonLink>}
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="mb-3 text-xl">Tools</h2>
            <ul className="space-y-3">
              {entry.tools.map((tool) => (
                <li key={tool.name} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink">{tool.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{tool.what}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <span
                        className={`mono rounded border px-2 py-1 text-[9px] uppercase tracking-wider ${
                          tool.verified
                            ? 'border-accent/30 bg-accent-soft text-accent'
                            : 'border-warn/30 bg-warn-soft text-warn'
                        }`}
                      >
                        {tool.verified ? 'Docs verified' : 'Install line not verified'}
                      </span>
                      {tool.officialVendor ? (
                        <span className="mono rounded border border-line bg-surface-2 px-2 py-1 text-[9px] uppercase tracking-wider text-muted">
                          Official
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {tool.install && tool.verified ? (
                    <p className="mono mt-2 rounded border border-line bg-surface-2 px-2.5 py-1.5 text-[11px] text-ink">
                      {tool.install}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-faint">
                    {tool.licence ? <span>Licence: {tool.licence}</span> : null}
                    <span className="mono">checked {formatDate(tool.verifiedOn)}</span>
                    <a
                      href={tool.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-accent link-underline"
                    >
                      Source
                      <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {entry.agentsMd ? (
            <section>
              <h2 className="mb-2 text-xl">Copy-ready AGENTS.md section</h2>
              <CodeBlock code={entry.agentsMd} lang="text" caption="Project instructions" />
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-xl">Starter prompt</h2>
            <CodeBlock code={entry.starterPrompt} lang="text" caption="Paste after the spec" />
          </section>

          <section>
            <h2 className="mb-3 text-xl">Verification checklist</h2>
            <ul className="space-y-2">
              {entry.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <span>
                    <InlineText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl">Pitfalls</h2>
            <ul className="space-y-2">
              {entry.pitfalls.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex items-center gap-3 border-t border-line pt-5 text-sm">
            <ShieldCheck size={16} className="text-accent" aria-hidden="true" />
            <a href="/playbook/security" className="text-accent link-underline">
              Read the agent security checklist before installing anything
            </a>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <p className="eyebrow mb-2">Risk</p>
            <span
              className={`mono inline-flex rounded border px-2 py-1 text-[10px] uppercase tracking-wider ${riskStyles[entry.risk]}`}
            >
              {entry.risk}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Risk reflects the worst plausible failure, not the likelihood. Database and auth work
              is high risk because a mistake can expose or destroy data.
            </p>
          </div>
          {entry.phase ? (
            <div className="card p-4">
              <p className="eyebrow mb-2">Phase</p>
              <p className="text-sm text-ink">{getPhase(entry.phase)?.name}</p>
              <ButtonLink to={`/phase/${entry.phase}`} variant="ghost" size="sm" className="mt-2 -ml-2">
                <ArrowLeft size={12} aria-hidden="true" />
                Back to phase
              </ButtonLink>
            </div>
          ) : null}
          <Callout tone="warn" title="Never auto-approve">
            Read-only by default. Separate dev and production credentials. Review third-party
            skills before installing. Tool output can carry prompt injection.
          </Callout>
        </aside>
      </div>
    </div>
  )
}
