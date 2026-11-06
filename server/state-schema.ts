import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
const isoDateTime = z.string().min(10).max(40)
const phase = z.enum(['F', '1', '2', '3', 'S'])
const moduleStatus = z.enum(['skipped', 'in_progress', 'proof_submitted', 'done'])

const quizSchema = z.strictObject({
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  takenAt: isoDateTime,
  answers: z.array(z.number().int()).max(20),
})

const noteSchema = z.strictObject({
  body: z.string().min(1).max(5000),
  updatedAt: isoDateTime,
})

const proofSchema = z.strictObject({
  repoUrl: z.string().min(1).max(500),
  demoUrl: z.string().min(1).max(500),
  selfRubric: z.record(z.string(), z.number().min(0).max(3)),
  notes: z.string().max(5000),
  createdAt: isoDateTime,
})

const activitySchema = z.strictObject({
  at: isoDateTime,
  kind: z.string().min(2).max(60),
  refId: z.string().min(1).max(200),
})

const reviewItemSchema = z.strictObject({
  questionId: z.string().min(1).max(200),
  moduleId: z.string().min(1).max(200),
  box: z.number().int().min(0).max(5),
  dueAt: isoDate,
  lastReviewedAt: isoDate.nullable(),
  misses: z.number().int().min(0),
})

export const stateSchema = z.strictObject({
  version: z.literal(1),
  profile: z
    .strictObject({
      hoursPerWeek: z.number().int().min(1).max(80),
      targetPhase: phase,
      startedAt: isoDateTime,
    })
    .nullable(),
  placement: z
    .strictObject({
      ratings: z.record(z.string(), z.number().int().min(0).max(3)),
      answers: z.record(z.string(), z.number().int()),
      recommendedPhase: phase,
      completedAt: isoDateTime,
    })
    .nullable(),
  progress: z.record(z.string(), z.strictObject({ status: moduleStatus, updatedAt: isoDateTime })),
  quizzes: z.record(z.string(), quizSchema),
  notes: z.record(z.string(), noteSchema),
  proofs: z.record(z.string(), proofSchema),
  pins: z.record(z.string(), isoDateTime),
  tools: z.record(z.string(), z.unknown()),
  review: z
    .strictObject({
      shipped: z.string().max(500),
      blocked: z.string().max(500),
      next: z.string().max(500),
      updatedAt: isoDateTime,
    })
    .nullable(),
  streakEnabled: z.boolean(),
  activity: z.array(activitySchema).max(200),
  reviews: z.record(z.string(), reviewItemSchema),
})

export type ServerState = z.infer<typeof stateSchema>

export function assertStateCaps(state: ServerState) {
  const noteBytes = Object.values(state.notes).reduce(
    (total, note) => total + new TextEncoder().encode(note.body).length,
    0,
  )
  if (noteBytes > 200_000) {
    throw new StateLimitError('Notes are limited to 200 KB per account.')
  }

  for (const [toolId, value] of Object.entries(state.tools)) {
    const bytes = new TextEncoder().encode(JSON.stringify(value)).length
    if (bytes > 100_000) {
      throw new StateLimitError(`The saved state for ${toolId} is limited to 100 KB.`)
    }
  }
}

export class StateLimitError extends Error {}
