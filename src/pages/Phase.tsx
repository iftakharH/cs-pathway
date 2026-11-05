import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader, Callout, ProgressBar } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { PhaseBadge, StatusBadge } from '@/components/ui/Badge'
import { getModuleSummary, moduleSummaries, phaseHours, phaseModules } from '@/lib/catalog'
import { phases, getPhase } from '@/lib/phases'
import { formatHours } from '@/lib/format'
import { phaseCompletion } from '@/lib/planner'
import { useGuestState } from '@/lib/store'

export default function Phase() {
  const { id } = useParams()
  const phase = getPhase(id ?? '')
  const state = useGuestState()

  if (!phase) {
    return (
      <div className="container-page py-20">
        <p className="eyebrow mb-3">Not found</p>
        <h1 className="text-3xl">That phase does not exist.</h1>
        <p className="mt-2 text-muted">The path has five phases: F, 1, 2, 3 and S.</p>
        <div className="mt-6">
          <ButtonLink to="/path">Back to the path</ButtonLink>
        </div>
      </div>
    )
  }

  const inPhase = phaseModules(phase.id)
  const hours = phaseHours(phase.id)
  const progress = phaseCompletion(moduleSummaries, state.progress, state.quizzes, phase.id)
  const index = phases.findIndex((candidate) => candidate.id === phase.id)
  const previous = phases[index - 1]
  const next = phases[index + 1]
  const lastModule = inPhase[inPhase.length - 1]

  return (
    <div className="container-page">
      <PageHeader
        title={phase.name}
        lede={phase.description}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'The path', to: '/path' },
          { label: phase.name },
        ]}
        actions={<ButtonLink to={`/start`} variant="secondary">Check my placement</ButtonLink>}
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[1fr_17rem]">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-faint">
            <PhaseBadge phase={phase.id} showName />
            <span className="mono uppercase tracking-wider">{formatHours(hours.min, hours.max)}</span>
            <span className="mono uppercase tracking-wider">{inPhase.length} modules</span>
            <span className="mono uppercase tracking-wider">{phase.proofSummary.split('.')[0]}</span>
          </div>

          <div className="mb-8 max-w-md">
            <ProgressBar value={progress.ratio} label="Phase progress, by evidence" />
          </div>

          <ol className="space-y-3">
            {inPhase.map((module, moduleIndex) => {
              const status = state.progress[module.id]?.status
              const done = status === 'done' || status === 'proof_submitted'
              const prerequisites = module.prerequisites
                .map((prerequisiteId) => getModuleSummary(prerequisiteId))
                .filter(Boolean)
              return (
                <li key={module.id}>
                  <article className="card p-5">
                    <div className="flex items-start gap-3">
                      <span className="mono mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-surface-2 text-[11px] text-muted">
                        {module.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h2 className="text-lg leading-snug">
                            <Link to={`/module/${module.id}`} className="hover:text-accent">
                              {module.title}
                            </Link>
                          </h2>
                          <StatusBadge status={status} />
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">{module.summary}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-faint">
                          <span className="mono">
                            {module.estHours.min}–{module.estHours.max} h
                          </span>
                          <span className="mono">{module.quizCount} questions</span>
                          <span className="mono">{module.cheatsheetIds.length} sheets</span>
                          {prerequisites.length > 0 ? (
                            <span>
                              Assumes:{' '}
                              {prerequisites.map((prerequisite, prerequisiteIndex) => (
                                <span key={prerequisite?.id}>
                                  {prerequisiteIndex > 0 ? ', ' : ''}
                                  <Link
                                    to={`/module/${prerequisite?.id}`}
                                    className="link-underline text-muted"
                                  >
                                    {prerequisite?.title}
                                  </Link>
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Link
                            to={`/module/${module.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-accent"
                          >
                            {done ? 'Review module' : 'Open module'}
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                          {moduleIndex === 0 && !status ? (
                            <span className="mono text-[10px] uppercase tracking-wider text-faint">
                              start here
                            </span>
                          ) : null}
                          {done ? (
                            <CheckCircle2 size={14} className="text-accent" aria-hidden="true" />
                          ) : status === 'in_progress' ? (
                            <Clock3 size={14} className="text-warn" aria-hidden="true" />
                          ) : (
                            <Circle size={14} className="text-faint" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ol>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
            {previous ? (
              <Link
                to={`/phase/${previous.id}`}
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Phase {previous.id}: {previous.name}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/phase/${next.id}`}
                className="inline-flex items-center gap-2 text-right text-sm text-muted hover:text-ink"
              >
                Phase {next.id}: {next.name}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <p className="eyebrow mb-2">What you can do after</p>
            <p className="text-sm leading-relaxed text-ink">{phase.outcome}</p>
          </div>
          <div className="card p-4">
            <p className="eyebrow mb-2">The gate</p>
            <p className="text-sm leading-relaxed text-muted">{phase.gate}</p>
          </div>
          <div className="card p-4">
            <p className="eyebrow mb-2">What you leave with</p>
            <p className="text-sm leading-relaxed text-muted">{phase.proofSummary}</p>
            {lastModule ? (
              <Link
                to={`/module/${lastModule.id}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent"
              >
                Final module: {lastModule.title}
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
          <Callout tone="warn" title="No outcome promises">
            This phase cannot guarantee a job, a salary or funding. It can give you evidence that
            you did the work.
          </Callout>
        </aside>
      </div>
    </div>
  )
}
