import { describe, expect, it } from 'vitest'
import type { PhaseId } from '@/content/schema'
import { placementScenarios, recommendPhase, placementSummary } from '@/lib/placement'

const allCorrect = Object.fromEntries(
  placementScenarios.map((scenario) => [scenario.id, scenario.answerIndex]),
)

const allWrong = Object.fromEntries(
  placementScenarios.map((scenario) => [scenario.id, (scenario.answerIndex + 1) % 4]),
)

const ratings = (value: number): Record<PhaseId, number> => ({
  F: value,
  '1': value,
  '2': value,
  '3': value,
  S: value,
})

describe('placement scenarios', () => {
  it('has one scenario per phase with four choices', () => {
    expect(placementScenarios).toHaveLength(5)
    for (const scenario of placementScenarios) {
      expect(scenario.options).toHaveLength(4)
      expect(scenario.answerIndex).toBeLessThan(scenario.options.length)
    }
  })
})

describe('recommendPhase', () => {
  it('starts at the target when the rating and scenario agree', () => {
    const result = recommendPhase({ ratings: ratings(3), answers: allCorrect, targetPhase: '2' })
    expect(result.recommendedPhase).toBe('2')
    expect(result.confidence).toBe('high')
  })

  it('starts at foundations when that phase is rated low', () => {
    const result = recommendPhase({
      ratings: { ...ratings(3), F: 0 },
      answers: allCorrect,
      targetPhase: '3',
    })
    expect(result.recommendedPhase).toBe('F')
  })

  it('never recommends a phase after the target', () => {
    const result = recommendPhase({ ratings: ratings(0), answers: allWrong, targetPhase: '1' })
    expect(result.recommendedPhase).toBe('F')
  })

  it('moves the start forward when a phase is strong but the next one is weak', () => {
    const result = recommendPhase({
      ratings: { ...ratings(0), F: 3, '1': 3, '2': 3 },
      answers: allCorrect,
      targetPhase: '3',
    })
    expect(result.recommendedPhase).toBe('3')
  })

  it('marks the result as unverified', () => {
    const result = recommendPhase({ ratings: ratings(2), answers: allCorrect, targetPhase: 'S' })
    expect(result.unverified).toBe(true)
    expect(result.total).toBe(5)
  })

  it('writes an honest summary', () => {
    const result = recommendPhase({ ratings: ratings(1), answers: allWrong, targetPhase: 'S' })
    expect(placementSummary(result)).toContain('self-assessment, not a test')
    expect(placementSummary(result)).toContain('0/5')
  })
})
