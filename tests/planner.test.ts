import { describe, expect, it } from 'vitest'
import type { Module, PhaseId } from '@/content/schema'
import { buildPlan, checkDeadline, phaseCompletion, modulesInScope } from '@/lib/planner'

function mod(id: string, phase: PhaseId, order: number, min: number, max = min): Module {
  return {
    id,
    phase,
    order,
    title: id,
    summary: 'A synthetic module used only by the planner tests.',
    objectives: ['one', 'two', 'three'],
    prerequisites: [],
    estHours: { min, max },
    claimIds: [],
    resources: [],
    cheatsheetIds: [],
    quiz: [],
    proof: { title: 'proof', brief: 'brief', evidence: 'evidence', rubric: [] },
    playbookIds: [],
    whyItMatters: 'Synthetic reason for the planner test.',
  } as Module
}

const modules = [
  mod('f-1', 'F', 1, 5),
  mod('f-2', 'F', 2, 5),
  mod('f-3', 'F', 3, 10),
  mod('p1-1', '1', 1, 8),
  mod('p2-1', '2', 1, 4),
  mod('s-1', 'S', 1, 6),
]

describe('buildPlan', () => {
  it('schedules the requested phase range in order', () => {
    const plan = buildPlan({ modules, hoursPerWeek: 10, startPhase: 'F', targetPhase: '2' })
    expect(plan.moduleCount).toBe(5)
    expect(plan.weeks[0]?.modules.map((item) => item.module.id)).toEqual(['f-1', 'f-2'])
    const ids = plan.weeks.flatMap((week) => week.modules.map((item) => item.module.id))
    expect(ids).toEqual(['f-1', 'f-2', 'f-3', 'p1-1', 'p2-1'])
  })

  it('excludes completed and skipped modules', () => {
    const plan = buildPlan({
      modules,
      hoursPerWeek: 10,
      startPhase: 'F',
      targetPhase: '1',
      completed: ['f-1'],
      skipped: ['f-2'],
    })
    expect(plan.moduleCount).toBe(2)
    expect(plan.weeks.flatMap((week) => week.modules.map((item) => item.module.id))).toEqual([
      'f-3',
      'p1-1',
    ])
  })

  it('moves a module that does not fit to a new week', () => {
    const plan = buildPlan({ modules, hoursPerWeek: 10, startPhase: 'F', targetPhase: 'F' })
    expect(plan.weeks.length).toBe(2)
    expect(plan.weeks[0]?.hours).toBe(10)
    expect(plan.weeks[1]?.modules[0]?.module.id).toBe('f-3')
  })

  it('returns an empty plan when nothing is left', () => {
    const plan = buildPlan({
      modules,
      hoursPerWeek: 10,
      startPhase: 'F',
      targetPhase: 'F',
      completed: ['f-1', 'f-2', 'f-3'],
    })
    expect(plan.empty).toBe(true)
    expect(plan.weeks).toEqual([])
  })

  it('computes a min and max week range from the hour estimates', () => {
    const plan = buildPlan({ modules, hoursPerWeek: 6, startPhase: 'F', targetPhase: 'F' })
    expect(plan.minWeeks).toBeLessThanOrEqual(plan.maxWeeks)
    expect(plan.totalHours).toBeGreaterThan(0)
  })

  it('clamps absurd hour input instead of dividing by zero', () => {
    const plan = buildPlan({ modules, hoursPerWeek: 0, startPhase: 'F', targetPhase: 'F' })
    expect(plan.weeks.length).toBeGreaterThan(0)
    const high = buildPlan({ modules, hoursPerWeek: 500, startPhase: 'F', targetPhase: 'F' })
    expect(high.weeks.length).toBe(1)
  })
})

describe('modulesInScope', () => {
  it('works when start and target are reversed', () => {
    const result = modulesInScope(modules, '1', 'F')
    expect(result.map((module) => module.id)).toEqual(['f-1', 'f-2', 'f-3', 'p1-1'])
  })
})

describe('checkDeadline', () => {
  it('says a deadline is on track when the pace is enough', () => {
    const plan = buildPlan({ modules, hoursPerWeek: 20, startPhase: 'F', targetPhase: 'F' })
    const check = checkDeadline(plan, 20, '2026-11-05', '2026-12-31')
    expect(check?.onTrack).toBe(true)
  })

  it('states the required pace when behind', () => {
    const plan = buildPlan({ modules, hoursPerWeek: 2, startPhase: 'F', targetPhase: 'S' })
    const check = checkDeadline(plan, 2, '2026-11-05', '2026-11-19')
    expect(check?.onTrack).toBe(false)
    expect(check?.requiredHoursPerWeek).toBeGreaterThan(2)
    expect(check?.message).toContain('h/week')
  })

  it('rejects a past date', () => {
    const plan = buildPlan({ modules, hoursPerWeek: 10, startPhase: 'F', targetPhase: 'F' })
    const check = checkDeadline(plan, 10, '2026-11-05', '2026-11-01')
    expect(check?.onTrack).toBe(false)
  })
})

describe('phaseCompletion', () => {
  it('counts a done module or a quiz at 80% or more', () => {
    const result = phaseCompletion(
      modules,
      { 'f-1': { status: 'done' } },
      { 'f-2': { score: 4, total: 5 } },
      'F',
    )
    expect(result.done).toBe(2)
    expect(result.total).toBe(3)
    expect(result.ratio).toBeCloseTo(2 / 3)
  })

  it('does not count a low quiz score', () => {
    const result = phaseCompletion(modules, {}, { 'f-1': { score: 2, total: 5 } }, 'F')
    expect(result.done).toBe(0)
  })
})
