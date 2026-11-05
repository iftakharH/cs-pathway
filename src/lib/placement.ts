import type { PhaseId } from '@/content/schema'
import { PHASE_ORDER } from '@/lib/phases'

export type PlacementScenario = {
  id: string
  phase: PhaseId
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export const placementScenarios: PlacementScenario[] = [
  {
    id: 'scenario-git',
    phase: 'F',
    question:
      'Your branch is three commits ahead of main, and main has moved on. You want your commits to sit on top of the latest main before a pull request.',
    options: [
      'git rebase origin/main, then resolve any conflicts',
      'git reset --hard origin/main',
      'git push --force origin main',
      'Delete the branch and start again',
    ],
    answerIndex: 0,
    explanation: 'A rebase replays your own commits on the current main without rewriting main.',
  },
  {
    id: 'scenario-react',
    phase: '1',
    question:
      'A React component fetches data inside useEffect, and the network tab shows a new request after every render. What is the most likely cause?',
    options: [
      'The dependency array is missing, so the effect runs after every render',
      'The API is too slow',
      'React cannot fetch data',
      'The component has too many props',
    ],
    answerIndex: 0,
    explanation: 'Without a dependency array the effect runs after every render, and each state update causes another one.',
  },
  {
    id: 'scenario-rag',
    phase: '2',
    question:
      'Your retrieval system cites a document that does not contain the answer. What do you measure first?',
    options: [
      'Retrieval recall on a labelled set of questions',
      'The colour contrast of the citation card',
      'The model temperature',
      'The number of documents in the index',
    ],
    answerIndex: 0,
    explanation: 'If the right passage is never retrieved, no prompt change can fix the answer. Measure retrieval before generation.',
  },
  {
    id: 'scenario-ml',
    phase: '3',
    question:
      'A fraud classifier reports 98% accuracy on a dataset where 98% of rows are legitimate. What should you report instead?',
    options: [
      'Precision, recall and a majority-class baseline',
      'Only accuracy, because it is high',
      'The training loss',
      'The number of features',
    ],
    answerIndex: 0,
    explanation: 'Accuracy hides failure on the minority class. A baseline and class-aware metrics show whether the model learned anything useful.',
  },
  {
    id: 'scenario-startup',
    phase: 'S',
    question:
      'Ten people tell you your idea is exciting. Which evidence is strongest that they would pay?',
    options: [
      'They have already paid, or committed real time or money to use it',
      'They said they would probably use it',
      'They asked for a demo',
      'They joined a waitlist',
    ],
    answerIndex: 0,
    explanation: 'Stated interest is cheap. A payment or a costly commitment is much stronger evidence of demand.',
  },
]

export type PlacementInput = {
  ratings: Record<PhaseId, number>
  answers: Record<string, number>
  targetPhase: PhaseId
}

export type PlacementResult = {
  recommendedPhase: PhaseId
  confidence: 'low' | 'medium' | 'high'
  correct: number
  total: number
  unverified: true
}

function scenarioCorrect(id: PhaseId, answers: Record<string, number>): boolean {
  const scenario = placementScenarios.find((candidate) => candidate.phase === id)
  if (!scenario) return false
  return answers[scenario.id] === scenario.answerIndex
}

export function recommendPhase(input: PlacementInput): PlacementResult {
  let recommended: PhaseId = input.targetPhase
  let correct = 0

  for (const phase of PHASE_ORDER) {
    const passed = scenarioCorrect(phase, input.answers)
    if (passed) correct += 1
    const rating = input.ratings[phase] ?? 0
    const score = rating + (passed ? 1 : 0)
    if (score < 3 && PHASE_ORDER.indexOf(phase) <= PHASE_ORDER.indexOf(input.targetPhase)) {
      recommended = phase
      break
    }
  }

  const confidence = correct >= 4 ? 'high' : correct >= 2 ? 'medium' : 'low'
  return {
    recommendedPhase: recommended,
    confidence,
    correct,
    total: placementScenarios.length,
    unverified: true,
  }
}

export function placementSummary(result: PlacementResult): string {
  return (
    `Start at phase ${result.recommendedPhase}. ` +
    `${result.correct}/${result.total} scenario answers were correct. ` +
    'This is a self-assessment, not a test: start one phase earlier if you are unsure.'
  )
}
