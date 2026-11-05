import { useRef, useState } from 'react'
import { ArrowRight, Check, Info, RotateCcw } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { PhaseBadge } from '@/components/ui/Badge'
import { moduleSummaries } from '@/lib/catalog'
import { phases, getPhase } from '@/lib/phases'
import { todayIso } from '@/lib/dates'
import { buildPlan } from '@/lib/planner'
import {
  placementScenarios,
  recommendPhase,
  type PlacementResult,
} from '@/lib/placement'
import { setPlacement, setProfile, useGuestState } from '@/lib/store'
import { cx } from '@/lib/format'
import type { PhaseId } from '@/content/schema'

const ratingsLabels = [
  'New to it',
  'I have read about it',
  'I have used it',
  'I can explain it',
]

const targets: Array<{ id: PhaseId; title: string; body: string }> = [
  { id: '1', title: 'Ship a full-stack app', body: 'React, an API, Postgres, auth, deploy.' },
  { id: '2', title: 'Build reliable AI features', body: 'Retrieval, evals, tools, cost.' },
  { id: '3', title: 'Train and evaluate models', body: 'Math, metrics, PyTorch, transformers.' },
  { id: 'S', title: 'Start a company', body: 'Customers, a small product, funding basics.' },
]

function emptyRatings(): Record<PhaseId, number> {
  return { F: 0, '1': 0, '2': 0, '3': 0, S: 0 }
}

export default function Start() {
  const state = useGuestState()
  const [hours, setHours] = useState(state.profile?.hoursPerWeek ?? 10)
  const [target, setTarget] = useState<PhaseId>(state.profile?.targetPhase ?? '1')
  const [ratings, setRatings] = useState<Record<PhaseId, number>>(
    state.placement?.ratings ?? emptyRatings(),
  )
  const [answers, setAnswers] = useState<Record<string, number>>(state.placement?.answers ?? {})
  const [showResult, setShowResult] = useState(Boolean(state.placement))
  const [result, setResult] = useState<PlacementResult | null>(() =>
    state.placement ? recommendPhase({ ratings: state.placement.ratings, answers: state.placement.answers, targetPhase: state.profile?.targetPhase ?? '1' }) : null,
  )
  const [error, setError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const justSubmitted = useRef(false)

  const answeredCount = placementScenarios.filter(
    (scenario) => answers[scenario.id] !== undefined,
  ).length

  function submit() {
    const missing = placementScenarios.filter((scenario) => answers[scenario.id] === undefined)
    if (missing.length > 0) {
      setError(`Answer ${missing.length} more scenario question${missing.length === 1 ? '' : 's'} to see your result.`)
      document.getElementById(`scenario-${missing[0]?.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setError(null)
    const next = recommendPhase({ ratings, answers, targetPhase: target })
    setProfile(hours, target)
    setPlacement({
      ratings,
      answers,
      recommendedPhase: next.recommendedPhase,
      completedAt: new Date().toISOString(),
    })
    setResult(next)
    setShowResult(true)
    justSubmitted.current = true
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  if (showResult && result) {
    const startPhase = result.recommendedPhase
    const phase = getPhase(startPhase)
    const plan = buildPlan({
      modules: moduleSummaries,
      hoursPerWeek: hours,
      startPhase,
      targetPhase: target,
      startDate: todayIso(),
    })
    const first = plan.weeks[0]?.modules[0]?.module

    return (
      <div className="container-page">
        <PageHeader
          title={`Start at phase ${startPhase} — ${phase?.name ?? ''}`}
          lede="Your starting point is based on five scenario answers and your own rating. Start one phase earlier if you are unsure; the first module is short enough to check."
          breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Placement' }]}
          actions={
            <Button
              variant="ghost"
              onClick={() => {
                setShowResult(false)
                setError(null)
              }}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Retake
            </Button>
          }
        />

        <div ref={resultRef} className="grid scroll-mt-24 gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <PhaseBadge phase={startPhase} showName />
                <span className="mono rounded border border-line bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
                  {result.correct}/{result.total} scenario answers correct
                </span>
                <span className="mono rounded border border-line bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
                  confidence: {result.confidence}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{phase?.description}</p>
              <p className="mt-4 rounded-lg border border-line bg-surface-2 p-3 text-sm text-ink">
                <strong className="font-medium">The gate:</strong> {phase?.gate}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Modules to go" value={String(plan.moduleCount)} />
              <Metric
                label="Weeks at your pace"
                value={
                  plan.minWeeks === plan.maxWeeks
                    ? String(plan.minWeeks)
                    : `${plan.minWeeks}–${plan.maxWeeks}`
                }
              />
              <Metric label="Total estimate" value={`${plan.totalHours} h`} />
            </div>

            <Callout tone="warn" title="This is self-reported, not verified">
              A self-rating can be wrong in both directions. The proof at the end of each phase is
              the real test, and the planner recalculates whenever you finish or skip a module.
            </Callout>
          </div>

          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <p className="eyebrow">Your first weeks</p>
                <p className="mt-1 text-sm text-muted">
                  At {hours} h/week. Editorial estimates, not a promise.
                </p>
              </div>
              <ol className="divide-y divide-line">
                {plan.weeks.slice(0, 4).map((week) => (
                  <li key={week.index} className="px-5 py-3.5">
                    <p className="mono mb-1.5 text-[10px] uppercase tracking-wider text-faint">
                      Week {week.index} · {week.hours} h
                    </p>
                    <ul className="space-y-1">
                      {week.modules.map(({ module }) => (
                        <li key={module.id}>
                          <ButtonLink
                            to={`/module/${module.id}`}
                            variant="ghost"
                            size="sm"
                            className="-ml-2 justify-start px-2 text-left"
                          >
                            {module.title}
                          </ButtonLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              {first ? (
                <ButtonLink to={`/module/${first.id}`} size="lg">
                  Start “{first.title}”
                  <ArrowRight size={17} aria-hidden="true" />
                </ButtonLink>
              ) : (
                <ButtonLink to="/dashboard" size="lg">
                  Open the dashboard
                </ButtonLink>
              )}
              <ButtonLink to="/plan" variant="secondary">
                See the full plan
              </ButtonLink>
            </div>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-faint">
              <Check size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              Saved in this browser. No account, no email, no tracking.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page">
      <PageHeader
        title="Find your first module in about three minutes"
        lede="Five scenario questions and a quick self-rating. There is no pass or fail, no account, and you can change the answer later."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Placement' }]}
      />

      <div className="max-w-3xl py-8">
        <nav aria-label="Check sections" className="mb-8 flex flex-wrap gap-2">
          {[
            { href: '#hours', label: '1. Your time' },
            { href: '#ratings', label: '2. Your level' },
            { href: '#scenarios', label: '3. Five scenarios' },
          ].map((step) => (
            <a
              key={step.href}
              href={step.href}
              className="mono rounded-md border border-line bg-surface px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-muted hover:border-accent hover:text-accent"
            >
              {step.label}
            </a>
          ))}
        </nav>

        <section id="hours" className="scroll-mt-24 border-b border-line pb-8">
          <h2 className="text-xl">How much time can you give this each week?</h2>
          <p className="mt-1 text-sm text-muted">
            Be honest. A plan built on ten hours you do not have is worse than a plan built on
            four hours you do.
          </p>
          <div className="mt-5 flex items-center gap-4">
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
              className="h-2 w-full cursor-pointer accent-[var(--accent)]"
              aria-label="Hours per week"
              aria-valuetext={`${hours} hours per week`}
            />
            <output className="mono tabular w-20 shrink-0 text-right text-lg text-ink">
              {hours} h
            </output>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-faint">
            <span>2 h</span>
            <span>40 h</span>
          </div>

          <h2 className="mt-8 text-xl">Where do you want this to lead?</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {targets.map((option) => (
              <label
                key={option.id}
                className={cx(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors',
                  target === option.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface hover:border-line-strong',
                )}
              >
                <input
                  type="radio"
                  name="target-phase"
                  value={option.id}
                  checked={target === option.id}
                  onChange={() => setTarget(option.id)}
                  className="mt-1 accent-[var(--accent)]"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{option.title}</span>
                  <span className="block text-xs text-muted">{option.body}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section id="ratings" className="scroll-mt-24 border-b border-line py-8">
          <h2 className="text-xl">Rate yourself honestly, phase by phase</h2>
          <p className="mt-1 text-sm text-muted">
            “Can explain it” means you could teach it without notes. Nothing here is sent anywhere.
          </p>
          <div className="mt-5 space-y-4">
            {phases.map((phase) => (
              <fieldset key={phase.id} className="rounded-lg border border-line bg-surface p-4">
                <legend className="px-1">
                  <PhaseBadge phase={phase.id} showName />
                </legend>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-4">
                  {ratingsLabels.map((label, level) => (
                    <label
                      key={label}
                      className={cx(
                        'flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-xs',
                        ratings[phase.id] === level
                          ? 'border-accent bg-accent-soft text-ink'
                          : 'border-line bg-surface text-muted hover:border-line-strong',
                      )}
                    >
                      <input
                        type="radio"
                        name={`rating-${phase.id}`}
                        checked={ratings[phase.id] === level}
                        onChange={() => setRatings((current) => ({ ...current, [phase.id]: level }))}
                        className="accent-[var(--accent)]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section id="scenarios" className="scroll-mt-24 py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl">Five scenarios, no feedback until the end</h2>
              <p className="mt-1 text-sm text-muted">
                Pick the answer you would actually give. Guessing is fine; the result is a starting
                point, not a grade.
              </p>
            </div>
            <span className="mono shrink-0 text-[10px] uppercase tracking-wider text-faint">
              {answeredCount}/5 answered
            </span>
          </div>

          <div className="mt-5 space-y-5">
            {placementScenarios.map((scenario) => {
              const phase = getPhase(scenario.phase)
              return (
                <fieldset
                  key={scenario.id}
                  id={`scenario-${scenario.id}`}
                  className="scroll-mt-24 rounded-lg border border-line bg-surface p-4"
                >
                  <legend className="flex flex-wrap items-center gap-2 px-1">
                    <PhaseBadge phase={scenario.phase} />
                    <span className="text-xs text-faint">{phase?.name}</span>
                  </legend>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink">
                    {scenario.question}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {scenario.options.map((option, index) => (
                      <label
                        key={option}
                        className={cx(
                          'flex min-h-11 cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm',
                          answers[scenario.id] === index
                            ? 'border-accent bg-accent-soft text-ink'
                            : 'border-line text-muted hover:border-line-strong',
                        )}
                      >
                        <input
                          type="radio"
                          name={scenario.id}
                          checked={answers[scenario.id] === index}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [scenario.id]: index }))
                          }
                          className="mt-1 accent-[var(--accent)]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )
            })}
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={submit}>
              Show my starting point
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <p className="flex items-center gap-2 text-xs text-faint">
              <Info size={14} aria-hidden="true" />
              No account. Saved in this browser.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="eyebrow mb-1">{label}</p>
      <p className="mono tabular text-xl text-ink">{value}</p>
    </div>
  )
}
