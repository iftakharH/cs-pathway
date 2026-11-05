import { ArrowLeft, ArrowRight, Clock3, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader, Callout } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EvidenceBadge, PhaseBadge, StaleBadge, StatusBadge } from '@/components/ui/Badge'
import { SourceChip } from '@/components/SourceChip'
import { Quiz } from '@/components/Quiz'
import { ProofWorkflow } from '@/components/ProofWorkflow'
import { NoteEditor } from '@/components/NoteEditor'
import {
  claimsForModule,
  cheatsheetsForModule,
  getModule,
  getPhase,
  nextModule,
  previousModule,
  getPlaybook,
  isStale,
} from '@/lib/content'
import { formatDate, formatHours } from '@/lib/format'
import { setModuleStatus, useGuestState } from '@/lib/store'
import { InlineText } from '@/components/InlineText'
import { useActiveSection } from '@/lib/useActiveSection'

const SECTION_IDS = ['objectives', 'why', 'resources', 'sheets', 'quiz', 'proof', 'notes'] as const

export default function ModulePage() {
  const { id } = useParams()
  const module = getModule(id)
  const state = useGuestState()
  const activeSection = useActiveSection(SECTION_IDS)

  if (!module) {
    return (
      <div className="container-page py-20">
        <p className="eyebrow mb-3">Not found</p>
        <h1 className="text-3xl">That module does not exist.</h1>
        <p className="mt-2 text-muted">Browse the path to find a module that does.</p>
        <div className="mt-6">
          <ButtonLink to="/path">Back to the path</ButtonLink>
        </div>
      </div>
    )
  }

  const phase = getPhase(module.phase)
  const claims = claimsForModule(module)
  const sheets = cheatsheetsForModule(module)
  const status = state.progress[module.id]?.status
  const previous = previousModule(module.id)
  const next = nextModule(module.id)
  const playbookEntries = module.playbookIds.flatMap((entryId) => {
    const entry = getPlaybook(entryId)
    return entry ? [entry] : []
  })

  return (
    <div className="container-page">
      <PageHeader
        title={module.title}
        lede={module.summary}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'The path', to: '/path' },
          { label: phase?.name ?? 'Phase', to: `/phase/${module.phase}` },
          { label: module.title },
        ]}
        actions={
          <>
            <StatusBadge status={status} />
            <Button
              variant={status === 'in_progress' ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setModuleStatus(module.id, 'in_progress')}
            >
              <Clock3 size={14} aria-hidden="true" />
              {status === 'in_progress'
                ? 'Continue'
                : status === 'done' || status === 'proof_submitted'
                  ? 'Reopen module'
                  : 'Start module'}
            </Button>
          </>
        }
      />

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 space-y-10">
          <section id="objectives" className="scroll-mt-24">
            <h2 className="mb-3 text-xl">What you will be able to do</h2>
            <ul className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
              {module.objectives.map((objective) => (
                <li
                  key={objective}
                  className="flex items-start gap-2 border-t border-line py-2.5 text-sm leading-relaxed text-muted"
                >
                  <span className="mono mt-0.5 shrink-0 text-[10px] text-accent">→</span>
                  <span>
                    <InlineText text={objective} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="why" className="scroll-mt-24">
            <h2 className="mb-3 text-xl">Why this matters</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">{module.whyItMatters}</p>
            {claims.length > 0 ? (
              <div className="mt-4 border-t border-line">
                {claims.map((claim) => (
                  <div key={claim.id} className="border-b border-line py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <EvidenceBadge kind={claim.kind} />
                      {isStale(claim) ? <StaleBadge /> : null}
                      <span className="mono text-[10px] text-faint">
                        checked {formatDate(claim.verifiedAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {claim.statement}{' '}
                      <span className="inline-flex align-baseline">
                        <SourceChip claimId={claim.id} />
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-faint">
                This module is mostly practice. Its facts live in the linked cheatsheets and
                official resources, each with its own source link.
              </p>
            )}
            {module.riskNote ? (
              <div className="mt-4">
                <Callout tone="warn" title="One honest risk">
                  {module.riskNote}
                </Callout>
              </div>
            ) : null}
          </section>

          <section id="resources" className="scroll-mt-24">
            <h2 className="mb-1 text-xl">Resources</h2>
            <p className="mb-3 text-sm text-muted">
              Two or more options, at least one free and one from the official vendor. Prices and
              availability were checked on the date shown.
            </p>
            <ul className="border-t border-line">
              {module.resources.map((resource) => (
                <li key={resource.url} className="border-b border-line py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent"
                      >
                        {resource.title}
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                      <p className="text-xs text-muted">{resource.publisher}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <span
                        className={`mono rounded border px-2 py-1 text-[9px] uppercase tracking-wider ${
                          resource.price === 'free'
                            ? 'border-accent/30 bg-accent-soft text-accent'
                            : resource.price === 'paid'
                              ? 'border-warn/30 bg-warn-soft text-warn'
                              : 'border-line bg-surface-2 text-muted'
                        }`}
                      >
                        {resource.price}
                      </span>
                      {resource.officialVendor ? (
                        <span className="mono inline-flex items-center gap-1 rounded border border-line bg-surface-2 px-2 py-1 text-[9px] uppercase tracking-wider text-muted">
                          <ShieldCheck size={10} aria-hidden="true" />
                          Official
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{resource.why}</p>
                  <p className="mono mt-2 text-[10px] text-faint">
                    {resource.format} · checked {formatDate(resource.lastVerifiedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section id="sheets" className="scroll-mt-24">
            <h2 className="mb-1 text-xl">Cheatsheets for this module</h2>
            <p className="mb-3 text-sm text-muted">
              Short, copyable answers with a version stamp and an official source.
            </p>
            {sheets.length > 0 ? (
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {sheets.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      to={`/cheatsheet/${entry.id}`}
                      className="flex h-full flex-col border-t border-line py-3 hover:text-accent"
                    >
                      <span className="text-sm font-medium text-ink">{entry.title}</span>
                      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                        {entry.whenToUse}
                      </span>
                      <span className="mono mt-auto pt-3 text-[10px] text-faint">
                        {entry.topic} · {entry.tool.name} {entry.tool.version}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No cheatsheets are linked to this module yet.</p>
            )}
          </section>

          {playbookEntries.length > 0 ? (
            <section id="playbook" className="scroll-mt-24">
              <h2 className="mb-3 text-xl">Playbook</h2>
              <ul className="border-t border-line">
                {playbookEntries.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      to={`/playbook/${entry.id}`}
                      className="flex items-center gap-3 border-b border-line py-3 hover:text-accent"
                    >
                      <FileText size={16} className="shrink-0 text-accent" aria-hidden="true" />
                      <span>
                        <span className="block text-sm font-medium text-ink">{entry.task}</span>
                        <span className="block text-xs text-muted">{entry.summary}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section id="quiz" className="scroll-mt-24 border-t border-line pt-8">
            <Quiz module={module} />
          </section>

          <section id="proof" className="scroll-mt-24 border-t border-line pt-8">
            <ProofWorkflow module={module} />
          </section>

          <section id="notes" className="scroll-mt-24 border-t border-line pt-8">
            <NoteEditor
              key={module.id}
              storageKey={`module:${module.id}`}
              title="Notes for this module"
              description="Write the thing you want to remember in six months. Notes stay in this browser."
              placeholder="The part that surprised me was…"
            />
          </section>

          <nav className="flex items-center justify-between gap-4 border-t border-line pt-6" aria-label="Module navigation">
            {previous ? (
              <Link
                to={`/module/${previous.id}`}
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/module/${next.id}`}
                className="inline-flex items-center gap-2 text-right text-sm text-muted hover:text-ink"
              >
                {next.title}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : null}
          </nav>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <p className="eyebrow mb-2">Module facts</p>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Estimate</dt>
                <dd className="mono text-ink">{formatHours(module.estHours.min, module.estHours.max)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Quiz</dt>
                <dd className="mono text-ink">{module.quiz.length} questions</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Proof rubric</dt>
                <dd className="mono text-ink">{module.proof.rubric.length} criteria</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Cheatsheets</dt>
                <dd className="mono text-ink">{sheets.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Phase</dt>
                <dd>
                  <PhaseBadge phase={module.phase} />
                </dd>
              </div>
            </dl>
            <p className="mono mt-3 border-t border-line pt-2 text-[9px] uppercase leading-relaxed tracking-wider text-faint">
              Time is an editorial estimate, not a promise.
            </p>
          </div>

          <nav aria-label="On this page" className="card p-4">
            <p className="mb-2 text-xs font-semibold text-ink">On this page</p>
            <ul className="space-y-1.5 text-sm">
              {[
                ['objectives', 'Objectives'],
                ['why', 'Why it matters'],
                ['resources', 'Resources'],
                ['sheets', 'Cheatsheets'],
                ['quiz', 'Quiz'],
                ['proof', 'Proof'],
                ['notes', 'Notes'],
              ].map(([anchor, label]) => {
                const isActive = activeSection === anchor
                return (
                  <li key={anchor}>
                    <a
                      href={`#${anchor}`}
                      aria-current={isActive ? 'location' : undefined}
                      className={
                        isActive
                          ? 'inline-flex items-center gap-2 font-medium text-accent'
                          : 'inline-flex items-center gap-2 text-muted hover:text-accent'
                      }
                    >
                      <span
                        className={
                          isActive
                            ? 'h-1.5 w-1.5 rounded-full bg-accent'
                            : 'h-1.5 w-1.5 rounded-full bg-line-strong'
                        }
                        aria-hidden="true"
                      />
                      {label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {module.prerequisites.length > 0 ? (
            <div className="card p-4">
              <p className="eyebrow mb-2">Assumes you can</p>
              <ul className="space-y-1 text-xs text-muted">
                {module.prerequisites.map((prerequisiteId) => {
                  const prerequisite = getModule(prerequisiteId)
                  return prerequisite ? (
                    <li key={prerequisiteId}>
                      <Link to={`/module/${prerequisiteId}`} className="link-underline">
                        {prerequisite.title}
                      </Link>
                    </li>
                  ) : null
                })}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
