import { PHASES } from '@/content/generated/phases'
import type { Phase, PhaseId } from '@/content/schema'

export const phases: Phase[] = PHASES
export const PHASE_ORDER: PhaseId[] = ['F', '1', '2', '3', 'S']

const byId = new Map(phases.map((phase) => [phase.id, phase]))

export function getPhase(id: string): Phase | undefined {
  return byId.get(id as PhaseId)
}
