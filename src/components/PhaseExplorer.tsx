import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock3, Circle } from 'lucide-react'
import type { PhaseId } from '@/content/schema'
import { moduleSummaries, phaseHours, phaseModules } from '@/lib/catalog'
import { phases, getPhase } from '@/lib/phases'
import { phaseCompletion } from '@/lib/planner'
import { useGuestState } from '@/lib/store'
import { cx, formatHours, plural } from '@/lib/format'

const shortName: Record<PhaseId, string> = {
  F: 'Foundations',
  '1': 'Full-stack',
  '2': 'AI engineer',
  '3': 'ML engineer',
  S: 'Startup',
}

export function PhaseExplorer() {
  const state = useGuestState()
  const [activeId, setActiveId] = useState<PhaseId>(
    () => state.placement?.recommendedPhase ?? 'F',
  )
  const phase = getPhase(activeId)
  const modules = phaseModules(activeId)
  const hours = phaseHours(activeId)
  const progress = phaseCompletion(moduleSummaries, state.progress, state.quizzes, activeId)

  function select(id: PhaseId, focus = false) {
    setActiveId(id)
    if (focus) document.getElementById(`phase-tab-${id}`)?.focus()
  }

  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let targetIndex: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      targetIndex = (index + 1) % phases.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      targetIndex = (index - 1 + phases.length) % phases.length
    } else if (event.key === 'Home') {
      targetIndex = 0
    } else if (event.key === 'End') {
      targetIndex = phases.length - 1
    }
    if (targetIndex === null) return
    event.preventDefault()
    const target = phases[targetIndex]
    if (target) select(target.id, true)
  }

  return (
    <section aria-label="The path, phase by phase" className="min-w-0 border-y border-line">
      <div
        role="tablist"
        aria-label="Phases"
        aria-orientation="horizontal"
        className="flex min-w-0 overflow-x-auto border-b border-line sm:grid sm:grid-cols-5 sm:overflow-visible"
      >
        {phases.map((item, index) => {
          const isActive = item.id === activeId
          const itemHours = phaseHours(item.id)
          return (
            <button
              key={item.id}
              id={`phase-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`phase-panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(event) => onTabKey(event, index)}
              className={cx(
                'flex min-h-16 w-32 shrink-0 flex-col items-start justify-center gap-0.5 border-r border-line px-3 py-2 text-left transition-colors last:border-r-0 sm:w-auto',
                isActive
                  ? 'bg-ink text-bg'
                  : 'text-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              <span className="flex w-full items-baseline justify-between gap-2">
                <span className={cx('serif text-xl leading-none', isActive ? 'text-bg' : 'text-ink')}>
                  {item.id}
                </span>
                <span className={cx('text-[10px]', isActive ? 'text-bg/60' : 'text-faint')}>
                  {plural(phaseModules(item.id).length, 'module')}
                </span>
              </span>
              <span className="text-[11px] font-medium leading-tight">{shortName[item.id]}</span>
              <span className={cx('text-[10px]', isActive ? 'text-bg/60' : 'text-faint')}>
                {formatHours(itemHours.min, itemHours.max)}
              </span>
            </button>
          )
        })}
      </div>

      {phase ? (
        <div
          key={phase.id}
          id={`phase-panel-${phase.id}`}
          role="tabpanel"
          aria-labelledby={`phase-tab-${phase.id}`}
          className="phase-panel p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="mt-1 text-3xl">{phase.name}</h2>
            </div>
            <span className="serif text-5xl leading-none text-accent" aria-hidden="true">
              {phase.id}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{phase.description}</p>

          <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3">
            <div>
              <dt className="text-[11px] text-faint">Modules</dt>
              <dd className="mono tabular text-sm text-ink">{modules.length}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-faint">Estimate</dt>
              <dd className="mono tabular text-sm text-ink">
                {formatHours(hours.min, hours.max)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-faint">Evidence</dt>
              <dd className="mono tabular text-sm text-ink">
                {progress.done}/{progress.total}
              </dd>
            </div>
          </dl>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-ink">The gate</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{phase.gate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">What you leave with</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{phase.proofSummary}</p>
            </div>
          </div>

          <ul className="mt-4 border-t border-line">
            {modules.slice(0, 4).map((module) => {
              const status = state.progress[module.id]?.status
              const done = status === 'done' || status === 'proof_submitted'
              return (
                <li key={module.id} className="border-b border-line">
                  <Link
                    to={`/module/${module.id}`}
                    className="group flex items-center gap-3 py-2.5"
                  >
                    {done ? (
                      <CheckCircle2 size={14} className="shrink-0 text-accent" aria-hidden="true" />
                    ) : status === 'in_progress' ? (
                      <Clock3 size={14} className="shrink-0 text-warn" aria-hidden="true" />
                    ) : (
                      <Circle size={14} className="shrink-0 text-faint" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1 text-sm leading-snug text-muted group-hover:text-accent">
                      {module.title}
                    </span>
                    <span className="mono shrink-0 text-[10px] text-faint">
                      {module.estHours.min}–{module.estHours.max} h
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              to={`/phase/${phase.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
            >
              Open phase {phase.id}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link
              to="/plan"
              className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-ink"
            >
              Put it in a weekly plan
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
