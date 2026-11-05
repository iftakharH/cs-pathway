import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { PhaseExplorer } from '@/components/PhaseExplorer'
import { moduleSummaries, phaseHours, phaseModules } from '@/lib/catalog'
import { phases, getPhase } from '@/lib/phases'
import { formatHours, plural } from '@/lib/format'
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
        title="Five phases. Each one ends with proof."
        lede={`${moduleSummaries.length} modules from the first commit to a product real people use. The time estimates are editorial, not a promise, and you can skip a module by showing the proof instead.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'The path' }]}
        actions={<ButtonLink to="/start">Find my starting point</ButtonLink>}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line py-4 text-xs text-faint">
        <span>{formatHours(totalHours.min, totalHours.max)} total estimate</span>
        <span>{plural(moduleSummaries.length, 'module')}</span>
        <span>5 proofs</span>
        {recommended ? (
          <span>
            Your placement starts at phase {recommended} ·{' '}
            {getPhase(recommended)?.name}.{' '}
            <Link to="/start" className="text-accent underline decoration-line underline-offset-4">
              Retake
            </Link>
          </span>
        ) : null}
      </div>

      <div className="py-8">
        <PhaseExplorer />
      </div>

      <section className="pb-12" aria-labelledby="all-modules">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-3">
          <h2 id="all-modules" className="text-2xl">
            All modules
          </h2>
          <p className="text-xs text-faint">Open a row to see the module, quiz and proof.</p>
        </div>

        <div className="space-y-8 pt-6">
          {phases.map((phase) => {
            const modules = phaseModules(phase.id)
            const hours = phaseHours(phase.id)
            return (
              <section key={phase.id} aria-labelledby={`index-${phase.id}`}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 id={`index-${phase.id}`} className="text-lg">
                    <span className="mono mr-2 text-xs text-faint">{phase.id}</span>
                    {phase.name}
                  </h3>
                  <span className="text-xs text-faint">
                    {plural(modules.length, 'module')} · {formatHours(hours.min, hours.max)}
                  </span>
                </div>
                <div className="sm:hidden">
                  <ul className="border-t border-line">
                    {modules.map((module) => {
                      const status = state.progress[module.id]?.status
                      return (
                        <li key={module.id} className="border-b border-line py-3">
                          <Link
                            to={`/module/${module.id}`}
                            className="block text-sm font-medium text-ink hover:text-accent"
                          >
                            {module.title}
                          </Link>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                            {module.summary}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
                            <span>{module.estHours.min}–{module.estHours.max} h</span>
                            <span>{module.quizCount} questions</span>
                            <span>{module.cheatsheetIds.length} sheets</span>
                            <StatusBadge status={status} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[40rem] text-left text-sm">
                    <thead>
                      <tr className="border-y border-line text-[11px] text-faint">
                        <th scope="col" className="py-2 pr-3 font-medium">Module</th>
                        <th scope="col" className="px-3 py-2 font-medium">Estimate</th>
                        <th scope="col" className="px-3 py-2 font-medium">Quiz</th>
                        <th scope="col" className="px-3 py-2 font-medium">Sheets</th>
                        <th scope="col" className="px-3 py-2 font-medium">Status</th>
                        <th scope="col" className="px-3 py-2 font-medium">
                          <span className="sr-only">Open</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((module) => {
                        const status = state.progress[module.id]?.status
                        return (
                          <tr key={module.id} className="border-b border-line last:border-0">
                            <td className="py-2.5 pr-3">
                              <Link
                                to={`/module/${module.id}`}
                                className="font-medium text-ink hover:text-accent"
                              >
                                {module.title}
                              </Link>
                              <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                                {module.summary}
                              </p>
                            </td>
                            <td className="mono px-3 py-2.5 text-xs text-muted">
                              {module.estHours.min}–{module.estHours.max} h
                            </td>
                            <td className="mono px-3 py-2.5 text-xs text-muted">
                              {module.quizCount}
                            </td>
                            <td className="mono px-3 py-2.5 text-xs text-muted">
                              {module.cheatsheetIds.length}
                            </td>
                            <td className="px-3 py-2.5">
                              <StatusBadge status={status} />
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <Link
                                to={`/module/${module.id}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-faint hover:bg-surface-2 hover:text-accent"
                                aria-label={`Open ${module.title}`}
                              >
                                <ArrowRight size={14} aria-hidden="true" />
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          })}
        </div>
      </section>

      <section className="border-t border-line py-10">
        <h2 className="text-2xl">The rule</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          {[
            [
              'Start one phase earlier than you think',
              'The first module is short. If it is too easy, submit the proof and skip it.',
            ],
            [
              'A quiz is a check, not a certificate',
              'Quizzes use sourced questions. A high score shows recall; the proof shows application.',
            ],
            [
              'Time is an estimate',
              'Every range is editorial and recalculated by the planner when your pace changes.',
            ],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-ink pt-3">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/start">Find my starting point</ButtonLink>
          <ButtonLink to="/plan" variant="secondary">Build a weekly plan</ButtonLink>
          <ButtonLink to="/cheatsheets" variant="ghost">Browse cheatsheets</ButtonLink>
        </div>
      </section>
    </div>
  )
}
