import { useState } from 'react'
import { ArrowRight, CalendarDays, Printer, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, Callout } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Field, SelectInput } from '@/components/ui/Field'
import { moduleSummaries } from '@/lib/catalog'
import { phases, getPhase } from '@/lib/phases'
import { todayIso } from '@/lib/dates'
import { buildPlan, checkDeadline } from '@/lib/planner'
import { setProfile, useGuestState } from '@/lib/store'
import { addDays, formatDate, plural } from '@/lib/format'
import type { PhaseId } from '@/content/schema'

export default function Plan() {
  const state = useGuestState()
  const [hours, setHours] = useState(state.profile?.hoursPerWeek ?? 10)
  const [target, setTarget] = useState<PhaseId>(state.profile?.targetPhase ?? '1')
  const [start, setStart] = useState<PhaseId>(state.placement?.recommendedPhase ?? 'F')
  const [deadline, setDeadline] = useState('')
  const [saved, setSaved] = useState(false)

  const completed = Object.entries(state.progress)
    .filter(([, value]) => value.status === 'done' || value.status === 'proof_submitted')
    .map(([id]) => id)
  const skipped = Object.entries(state.progress)
    .filter(([, value]) => value.status === 'skipped')
    .map(([id]) => id)

  const plan = buildPlan({
    modules: moduleSummaries,
    hoursPerWeek: hours,
    startPhase: start,
    targetPhase: target,
    completed,
    skipped,
    startDate: todayIso(),
  })
  const deadlineCheck = deadline ? checkDeadline(plan, hours, todayIso(), deadline) : null

  function save() {
    setProfile(hours, target)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="container-page">
      <PageHeader
        kicker="Fast-track planner"
        title="Turn weekly hours into a week-by-week plan"
        lede="The estimate uses the midpoint of each module's editorial hour range, skips what you have already proved, and recalculates when your pace changes."
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'The path', to: '/path' },
          { label: 'Plan' },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="no-print">
              <Printer size={14} aria-hidden="true" />
              Print plan
            </Button>
            <Button size="sm" onClick={save}>
              <Save size={14} aria-hidden="true" />
              {saved ? 'Saved' : 'Save to this browser'}
            </Button>
          </>
        }
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-4 no-print">
          <div className="card space-y-4 p-4">
            <div>
              <label htmlFor="plan-hours" className="flex items-baseline justify-between text-sm font-medium text-ink">
                Hours per week
                <output className="mono tabular text-lg text-accent">{hours} h</output>
              </label>
              <input
                id="plan-hours"
                type="range"
                min={2}
                max={40}
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
                className="mt-2 h-2 w-full cursor-pointer accent-[var(--accent)]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-faint">
                <span>2 h</span>
                <span>40 h</span>
              </div>
            </div>

            <Field label="Start at phase" htmlFor="plan-start" hint="Your placement result sets this by default.">
              <SelectInput
                id="plan-start"
                value={start}
                onChange={(event) => setStart(event.target.value as PhaseId)}
              >
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.id} · {phase.name}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Target phase" htmlFor="plan-target" hint="The plan stops after this phase.">
              <SelectInput
                id="plan-target"
                value={target}
                onChange={(event) => setTarget(event.target.value as PhaseId)}
              >
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.id} · {phase.name}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field
              label="Optional deadline"
              htmlFor="plan-deadline"
              hint="Used only to show the pace required. No outcome is promised."
            >
              <input
                id="plan-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </Field>
          </div>

          <Callout tone="warn" title="Your inputs control the plan">
            Changing the target earlier is a legitimate move. If you already have the proof, submit
            it and the planner drops the module.
          </Callout>

          <div className="card p-4">
            <p className="eyebrow mb-2">Already done</p>
            <p className="text-sm text-muted">
              {completed.length + skipped.length} module
              {completed.length + skipped.length === 1 ? '' : 's'} excluded from this plan.
            </p>
            <Link to="/dashboard" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
              Review progress
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </aside>

        <div>
          {plan.empty ? (
            <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
              <CalendarDays size={24} className="mx-auto mb-3 text-faint" aria-hidden="true" />
              <h2 className="text-xl">Nothing left in this range</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Either every module between {start} and {target} has evidence, or the range is
                empty. Move the target later, or start a new phase.
              </p>
              <div className="mt-5">
                <ButtonLink to="/path">Choose another phase</ButtonLink>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Modules" value={String(plan.moduleCount)} />
                <Metric
                  label="Weeks"
                  value={
                    plan.minWeeks === plan.maxWeeks ? String(plan.minWeeks) : `${plan.minWeeks}–${plan.maxWeeks}`
                  }
                />
                <Metric label="Hours" value={`${plan.totalHours} h`} />
                <Metric
                  label="Finishes around"
                  value={formatDate(addDays(todayIso(), plan.weeks.length * 7))}
                  small
                />
              </div>

              {deadlineCheck ? (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    deadlineCheck.onTrack
                      ? 'border-accent/30 bg-accent-soft text-ink'
                      : 'border-warn/30 bg-warn-soft text-warn'
                  }`}
                >
                  {deadlineCheck.message}
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                {plan.weeks.map((week) => (
                  <section key={week.index} className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5">
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-sm font-semibold text-ink">Week {week.index}</h2>
                        <span className="mono text-[10px] text-faint">
                          starts {formatDate(week.startDate)}
                        </span>
                      </div>
                      <span className="mono text-[10px] uppercase tracking-wider text-faint">
                        {week.hours} h · {plural(week.modules.length, 'module')}
                      </span>
                    </div>
                    <ul className="divide-y divide-line">
                      {week.modules.map(({ module, hours: moduleHours }) => (
                        <li key={module.id}>
                          <Link
                            to={`/module/${module.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2"
                          >
                            <span className="mono flex h-6 min-w-6 items-center justify-center rounded border border-line bg-surface-2 text-[10px] text-muted">
                              {module.phase}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm text-ink">{module.title}</span>
                              <span className="mono block text-[10px] text-faint">
                                {getPhase(module.phase)?.name} · {moduleHours.toFixed(1)} h
                              </span>
                            </span>
                            <ArrowRight size={14} className="shrink-0 text-faint" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}

          <p className="mt-5 text-xs leading-relaxed text-faint">
            Time ranges shown on each module are editorial estimates, not measured completion
            times. The plan does not promise a job, a salary or a deadline.
          </p>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="card p-4">
      <p className="eyebrow mb-1">{label}</p>
      <p className={`mono tabular text-ink ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
    </div>
  )
}
