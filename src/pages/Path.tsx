import { ArrowRight, CheckCircle2, Circle, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, ProgressBar, Callout, SectionHeader } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { moduleSummaries, phaseHours, phaseModules } from '@/lib/catalog'
import { phases, getPhase } from '@/lib/phases'
import { formatHours, plural } from '@/lib/format'
import { phaseCompletion } from '@/lib/planner'
import { useGuestState } from '@/lib/store'

export default function Path() {
  const state = useGuestState()
  const recommended = state.placement?.recommendedPhase
  const totalHours = phases.reduce(
    (total, phase) => {
      const hours = phaseHours(phase.id)
      return { min: total.min + hours.min, max: total.max + hours.max }
    },
    { min: 0, max: 0 },
  )

  return (
    <div className="container-page">
      <PageHeader
        kicker="The route"
        title="Five phases. Each one ends with proof."
        lede={`${moduleSummaries.length} modules from the first commit to a product real people use. The time estimates are editorial, not a promise, and you can skip a module by showing the proof instead.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'The path' }]}
        actions={<ButtonLink to="/start">Find my starting point</ButtonLink>}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line py-4 text-xs text-faint">
        <span className="mono uppercase tracking-wider">
          {formatHours(totalHours.min, totalHours.max)} total estimate
        </span>
        <span className="mono uppercase tracking-wider">{plural(moduleSummaries.length, 'module')}</span>
        <span className="mono uppercase tracking-wider">5 proofs</span>
      </div>

      {recommended ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="text-sm text-ink">
            Your placement result starts you at phase {recommended} — {getPhase(recommended)?.name}.
          </p>
          <Link to="/start" className="text-sm font-medium text-accent link-underline">
            Retake the check
          </Link>
        </div>
      ) : null}

      <div className="space-y-4 py-8">
        {phases.map((phase) => {
          const inPhase = phaseModules(phase.id)
          const hours = phaseHours(phase.id)
          const progress = phaseCompletion(moduleSummaries, state.progress, state.quizzes, phase.id)
          const isRecommended = recommended === phase.id

          return (
            <section
              key={phase.id}
              className={`card overflow-hidden ${isRecommended ? 'border-accent/50' : ''}`}
              aria-labelledby={`phase-${phase.id}-title`}
            >
              <div className="grid gap-0 md:grid-cols-[7rem_1fr]">
                <div className="flex items-start justify-between gap-3 border-b border-line bg-surface-2/60 p-4 md:flex-col md:border-b-0 md:border-r md:p-5">
                  <div>
                    <span className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      Phase
                    </span>
                    <p className="serif text-4xl leading-none text-ink">{phase.id}</p>
                  </div>
                  <span className="mono text-[10px] text-faint md:mt-4">
                    {inPhase.length} modules
                    <br />
                    {formatHours(hours.min, hours.max)}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow mb-1">{phase.kicker}</p>
                      <h2 id={`phase-${phase.id}-title`} className="text-2xl">
                        <Link to={`/phase/${phase.id}`} className="hover:text-accent">
                          {phase.name}
                        </Link>
                      </h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isRecommended ? (
                        <span className="mono rounded border border-accent bg-accent px-2 py-1 text-[9px] uppercase tracking-wider text-accent-ink">
                          your start
                        </span>
                      ) : null}
                      <span className="mono text-[10px] text-faint">
                        {progress.done}/{progress.total} with evidence
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                    {phase.description}
                  </p>

                  <div className="mt-4 max-w-md">
                    <ProgressBar value={progress.ratio} label="Phase progress" />
                  </div>

                  <ul className="mt-5 divide-y divide-line border-y border-line">
                    {inPhase.map((module) => {
                      const status = state.progress[module.id]?.status
                      const done = status === 'done' || status === 'proof_submitted'
                      return (
                        <li key={module.id}>
                          <Link
                            to={`/module/${module.id}`}
                            className="group flex items-center gap-3 py-2.5"
                          >
                            {done ? (
                              <CheckCircle2 size={15} className="shrink-0 text-accent" aria-hidden="true" />
                            ) : status === 'in_progress' ? (
                              <Clock3 size={15} className="shrink-0 text-warn" aria-hidden="true" />
                            ) : (
                              <Circle size={15} className="shrink-0 text-faint" aria-hidden="true" />
                            )}
                            <span className="min-w-0 flex-1 text-sm text-ink group-hover:text-accent">
                              {module.title}
                            </span>
                            <span className="mono hidden shrink-0 text-[10px] text-faint sm:inline">
                              {module.estHours.min}–{module.estHours.max} h
                            </span>
                            <StatusBadge status={status} />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/phase/${phase.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-accent"
                    >
                      Open phase
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                    <span className="text-xs text-faint">{phase.gate}</span>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <section className="pb-12">
        <SectionHeader
          eyebrow="The rule"
          title="Completion is not the goal. Evidence is."
          lede="You can skip any module by submitting the proof. The proof is scored against a rubric that rewards tests, measurements and customer contact — not hours watched."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Callout title="Start one phase earlier than you think">
            The first module is short. If it is too easy, submit the proof and skip it.
          </Callout>
          <Callout title="A quiz is a check, not a certificate">
            Quizzes use sourced questions. A high score shows recall; the proof shows application.
          </Callout>
          <Callout title="Time is an estimate">
            Every estimate is editorial, marked as such, and recalculated by the planner when your
            pace changes.
          </Callout>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/start">Find my starting point</ButtonLink>
          <ButtonLink to="/plan" variant="secondary">
            Build a weekly plan
          </ButtonLink>
          <ButtonLink to="/cheatsheets" variant="ghost">
            Browse cheatsheets
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
