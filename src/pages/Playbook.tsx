import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, Callout, SectionHeader } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { PLAYBOOK as playbook } from '@/content/generated/playbook'
import { getPhase } from '@/lib/phases'

const riskStyles = {
  low: 'border-line bg-surface-2 text-muted',
  medium: 'border-warn/30 bg-warn-soft text-warn',
  high: 'border-danger/30 bg-danger-soft text-danger',
}

export default function Playbook() {
  return (
    <div className="container-page">
      <PageHeader
        title="Use agents like a senior engineer would delegate"
        lede="A task, the tools that fit it, a copy-ready prompt, a verification checklist and the pitfalls. Risk is stated before the install line."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Playbook' }]}
        actions={
          <ButtonLink to="/playbook/security" variant="secondary">
            <ShieldCheck size={15} aria-hidden="true" />
            Agent security
          </ButtonLink>
        }
      />

      <div className="grid gap-4 py-8 md:grid-cols-2">
        {playbook.map((entry) => (
          <article key={entry.id} className="card flex h-full flex-col p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`mono rounded border px-2 py-1 text-[9px] uppercase tracking-wider ${riskStyles[entry.risk]}`}
              >
                {entry.risk} risk
              </span>
              {entry.phase ? (
                <span className="mono text-[10px] text-faint">Phase {entry.phase}</span>
              ) : null}
              <span className="mono text-[10px] text-faint">
                {entry.tools.length} tool{entry.tools.length === 1 ? '' : 's'}
              </span>
            </div>
            <h2 className="text-lg leading-snug">
              <Link to={`/playbook/${entry.id}`} className="hover:text-accent">
                {entry.task}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{entry.summary}</p>
            <Link
              to={`/playbook/${entry.id}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent"
            >
              Open the playbook
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <section className="pb-12">
        <SectionHeader
          title="An install line is not a fact"
          lede="Tools are marked as verified only when the vendor's current docs were checked and dated. Unverified install lines are hidden rather than guessed."
          action={<ButtonLink to="/methodology" variant="ghost" size="sm">Methodology</ButtonLink>}
        />
        <div className="mt-6">
          <Callout tone="warn" title="Tool output is untrusted input">
            A skill, MCP server or document can carry instructions aimed at your agent. Read the
            source, scope the credentials, and never auto-approve a write or a payment. The
            security page is the checklist.
          </Callout>
        </div>
      </section>

      <section className="pb-12">
        <h2 className="text-xl">By phase</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...new Set(playbook.map((entry) => entry.phase).filter(Boolean))].map((phase) => (
            <Link
              key={phase}
              to={`/phase/${phase}`}
              className="mono rounded border border-line bg-surface px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-muted hover:text-accent"
            >
              {getPhase(phase ?? '')?.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
