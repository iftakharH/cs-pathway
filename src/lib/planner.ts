import type { PhaseId } from '@/content/schema'
import { addDays, daysBetween } from '@/lib/format'
import { PHASE_ORDER } from '@/lib/phases'

export type PlanModule = {
  id: string
  phase: PhaseId
  order: number
  title: string
  estHours: { min: number; max: number }
}

export type PlannedModule = { module: PlanModule; hours: number }

export type PlanWeek = {
  index: number
  startDate: string
  modules: PlannedModule[]
  hours: number
}

export type Plan = {
  weeks: PlanWeek[]
  totalHours: number
  moduleCount: number
  minWeeks: number
  maxWeeks: number
  empty: boolean
}

export type PlannerInput = {
  modules: PlanModule[]
  hoursPerWeek: number
  startPhase: PhaseId
  targetPhase: PhaseId
  completed?: Iterable<string>
  skipped?: Iterable<string>
  startDate?: string
}

function phaseRank(phase: PhaseId): number {
  return PHASE_ORDER.indexOf(phase)
}

export function modulesInScope<T extends PlanModule>(
  modules: T[],
  startPhase: PhaseId,
  targetPhase: PhaseId,
): T[] {
  const start = phaseRank(startPhase)
  const end = phaseRank(targetPhase)
  const low = Math.min(start, end)
  const high = Math.max(start, end)
  return modules
    .filter((module) => {
      const rank = phaseRank(module.phase)
      return rank >= low && rank <= high
    })
    .sort((a, b) => {
      const phaseDiff = phaseRank(a.phase) - phaseRank(b.phase)
      return phaseDiff !== 0 ? phaseDiff : a.order - b.order
    })
}

export function buildPlan(input: PlannerInput): Plan {
  const completed = new Set(input.completed ?? [])
  const skipped = new Set(input.skipped ?? [])
  const hoursPerWeek = Math.max(1, Math.min(80, input.hoursPerWeek))
  const startDate = input.startDate ?? new Date().toISOString().slice(0, 10)

  const scope = modulesInScope(input.modules, input.startPhase, input.targetPhase).filter(
    (module) => !completed.has(module.id) && !skipped.has(module.id),
  )

  if (scope.length === 0) {
    return {
      weeks: [],
      totalHours: 0,
      moduleCount: 0,
      minWeeks: 0,
      maxWeeks: 0,
      empty: true,
    }
  }

  const weeks: PlanWeek[] = []
  let current: PlanWeek = { index: 1, startDate, modules: [], hours: 0 }

  for (const module of scope) {
    const hours = (module.estHours.min + module.estHours.max) / 2
    if (current.modules.length > 0 && current.hours + hours > hoursPerWeek) {
      weeks.push(current)
      current = {
        index: weeks.length + 1,
        startDate: addDays(startDate, weeks.length * 7),
        modules: [],
        hours: 0,
      }
    }
    current.modules.push({ module, hours })
    current.hours = Math.round((current.hours + hours) * 10) / 10
  }
  weeks.push(current)

  const totalHours = scope.reduce(
    (total, module) => total + (module.estHours.min + module.estHours.max) / 2,
    0,
  )
  const minHours = scope.reduce((total, module) => total + module.estHours.min, 0)
  const maxHours = scope.reduce((total, module) => total + module.estHours.max, 0)

  return {
    weeks,
    totalHours: Math.round(totalHours),
    moduleCount: scope.length,
    minWeeks: Math.max(1, Math.ceil(minHours / hoursPerWeek)),
    maxWeeks: Math.max(1, Math.ceil(maxHours / hoursPerWeek)),
    empty: false,
  }
}

export type DeadlineCheck = {
  weeksAvailable: number
  requiredHoursPerWeek: number
  onTrack: boolean
  message: string
}

export function checkDeadline(
  plan: Plan,
  hoursPerWeek: number,
  today: string,
  deadline: string,
): DeadlineCheck | null {
  if (!deadline || plan.empty) return null
  const days = daysBetween(today, deadline)
  if (days <= 0) {
    return {
      weeksAvailable: 0,
      requiredHoursPerWeek: Number.POSITIVE_INFINITY,
      onTrack: false,
      message: 'That date has already passed.',
    }
  }
  const weeksAvailable = Math.floor(days / 7)
  const requiredHoursPerWeek = plan.totalHours / Math.max(1, weeksAvailable)
  const onTrack = plan.totalHours <= hoursPerWeek * Math.max(1, weeksAvailable)
  return {
    weeksAvailable,
    requiredHoursPerWeek: Math.ceil(requiredHoursPerWeek * 10) / 10,
    onTrack,
    message: onTrack
      ? `Your current pace fits in ${weeksAvailable} week${weeksAvailable === 1 ? '' : 's'}.`
      : `At ${hoursPerWeek} h/week you need about ${weeksAvailable} week${weeksAvailable === 1 ? '' : 's'}; ` +
        `the plan needs roughly ${requiredHoursPerWeek} h/week to hit that date.`,
  }
}

export function phaseCompletion(
  modules: PlanModule[],
  progress: Record<string, { status: string }>,
  quizzes: Record<string, { score: number; total: number }>,
  phase: PhaseId,
): { done: number; total: number; ratio: number } {
  const inPhase = modules.filter((module) => module.phase === phase)
  const total = inPhase.length
  const done = inPhase.filter((module) => {
    const status = progress[module.id]?.status
    const quiz = quizzes[module.id]
    return status === 'done' || status === 'proof_submitted' || (quiz ? quiz.score / quiz.total >= 0.8 : false)
  }).length
  return { done, total, ratio: total === 0 ? 0 : done / total }
}

export function nextUnfinishedModule<T extends PlanModule>(
  modules: T[],
  progress: Record<string, { status: string }>,
  startPhase: PhaseId = 'F',
): T | undefined {
  const scope = modulesInScope(modules, startPhase, 'S')
  return scope.find((module) => {
    const status = progress[module.id]?.status
    return status !== 'done' && status !== 'skipped'
  })
}

export function firstWeek(plan: Plan): PlanWeek | undefined {
  return plan.weeks[0]
}
