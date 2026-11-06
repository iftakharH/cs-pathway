import { asc, desc, eq } from 'drizzle-orm'
import { db } from './db'
import {
  activity,
  cheatPin,
  flashcardState,
  moduleProgress,
  note,
  profile,
  proofSubmission,
  quizAttempt,
  toolState,
  weeklyReview,
} from './app-schema'
import { type ServerState, stateSchema } from './state-schema'

export function emptyState(): ServerState {
  return {
    version: 1,
    profile: null,
    placement: null,
    progress: {},
    quizzes: {},
    notes: {},
    proofs: {},
    pins: {},
    tools: {},
    review: null,
    streakEnabled: false,
    activity: [],
    reviews: {},
  }
}

export async function getState(userId: string): Promise<{
  state: ServerState
  updatedAt: string | null
}> {
  const [profileRow] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  if (!profileRow) return { state: emptyState(), updatedAt: null }

  const [progressRows, quizRows, proofRows, noteRows, pinRows, reviewRows, toolRows, activityRows] =
    await Promise.all([
      db.select().from(moduleProgress).where(eq(moduleProgress.userId, userId)),
      db
        .select()
        .from(quizAttempt)
        .where(eq(quizAttempt.userId, userId))
        .orderBy(asc(quizAttempt.takenAt)),
      db
        .select()
        .from(proofSubmission)
        .where(eq(proofSubmission.userId, userId))
        .orderBy(asc(proofSubmission.createdAt)),
      db.select().from(note).where(eq(note.userId, userId)),
      db.select().from(cheatPin).where(eq(cheatPin.userId, userId)),
      db.select().from(flashcardState).where(eq(flashcardState.userId, userId)),
      db.select().from(toolState).where(eq(toolState.userId, userId)),
      db
        .select()
        .from(activity)
        .where(eq(activity.userId, userId))
        .orderBy(desc(activity.at))
        .limit(200),
    ])

  const [weekly] = await db
    .select()
    .from(weeklyReview)
    .where(eq(weeklyReview.userId, userId))
    .limit(1)

  const progress: ServerState['progress'] = {}
  for (const row of progressRows) {
    progress[row.moduleId] = { status: row.status as never, updatedAt: row.updatedAt.toISOString() }
  }

  const quizzes: ServerState['quizzes'] = {}
  for (const row of quizRows) {
    quizzes[row.moduleId] = {
      score: row.score,
      total: row.total,
      takenAt: row.takenAt.toISOString(),
      answers: row.answers,
    }
  }

  const proofs: ServerState['proofs'] = {}
  for (const row of proofRows) {
    proofs[row.moduleId] = {
      repoUrl: row.repoUrl,
      demoUrl: row.demoUrl,
      selfRubric: row.selfRubric,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
    }
  }

  const notes: ServerState['notes'] = {}
  for (const row of noteRows) {
    const key = row.moduleId ? `module:${row.moduleId}` : row.cheatId ? `cheat:${row.cheatId}` : null
    if (key) notes[key] = { body: row.body, updatedAt: row.updatedAt.toISOString() }
  }

  const pins: ServerState['pins'] = {}
  for (const row of pinRows) pins[row.cheatId] = row.createdAt.toISOString()

  const reviews: ServerState['reviews'] = {}
  for (const row of reviewRows) {
    reviews[row.cardId] = {
      questionId: row.cardId,
      moduleId: row.moduleId,
      box: row.box,
      dueAt: row.dueAt,
      lastReviewedAt: row.lastReviewedAt,
      misses: row.misses,
    }
  }

  const tools: ServerState['tools'] = {}
  for (const row of toolRows) tools[row.toolId] = row.data

  const state: ServerState = {
    version: 1,
    profile: {
      hoursPerWeek: profileRow.hoursPerWeek,
      targetPhase: profileRow.targetPhase as NonNullable<ServerState['profile']>['targetPhase'],
      startedAt: profileRow.startedAt.toISOString(),
    },
    placement: (profileRow.placement as ServerState['placement']) ?? null,
    progress,
    quizzes,
    notes,
    proofs,
    pins,
    tools,
    review: weekly
      ? {
          shipped: weekly.shipped,
          blocked: weekly.blocked,
          next: weekly.next,
          updatedAt: weekly.updatedAt.toISOString(),
        }
      : null,
    streakEnabled: profileRow.streakEnabled,
    activity: activityRows.map((row) => ({
      at: row.at.toISOString(),
      kind: row.kind,
      refId: row.refId,
    })),
    reviews,
  }

  return { state: stateSchema.parse(state), updatedAt: profileRow.updatedAt.toISOString() }
}

function asDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date in state')
  return date
}

export async function replaceState(userId: string, state: ServerState): Promise<string> {
  const updatedAt = new Date()

  await db.transaction(async (tx) => {
    await tx.delete(moduleProgress).where(eq(moduleProgress.userId, userId))
    await tx.delete(quizAttempt).where(eq(quizAttempt.userId, userId))
    await tx.delete(proofSubmission).where(eq(proofSubmission.userId, userId))
    await tx.delete(note).where(eq(note.userId, userId))
    await tx.delete(cheatPin).where(eq(cheatPin.userId, userId))
    await tx.delete(flashcardState).where(eq(flashcardState.userId, userId))
    await tx.delete(toolState).where(eq(toolState.userId, userId))
    await tx.delete(activity).where(eq(activity.userId, userId))
    await tx.delete(weeklyReview).where(eq(weeklyReview.userId, userId))

    if (!state.profile) {
      await tx.delete(profile).where(eq(profile.userId, userId))
      return
    }

    await tx
      .insert(profile)
      .values({
        userId,
        hoursPerWeek: state.profile.hoursPerWeek,
        targetPhase: state.profile.targetPhase,
        startedAt: asDate(state.profile.startedAt),
        placement: state.placement,
        streakEnabled: state.streakEnabled,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: profile.userId,
        set: {
          hoursPerWeek: state.profile.hoursPerWeek,
          targetPhase: state.profile.targetPhase,
          startedAt: asDate(state.profile.startedAt),
          placement: state.placement,
          streakEnabled: state.streakEnabled,
          updatedAt,
        },
      })

    const progressValues = Object.entries(state.progress).map(([moduleId, value]) => ({
      userId,
      moduleId,
      status: value.status,
      updatedAt: asDate(value.updatedAt),
    }))
    if (progressValues.length) await tx.insert(moduleProgress).values(progressValues)

    const quizValues = Object.entries(state.quizzes).map(([moduleId, value]) => ({
      userId,
      moduleId,
      score: value.score,
      total: value.total,
      answers: value.answers,
      takenAt: asDate(value.takenAt),
    }))
    if (quizValues.length) await tx.insert(quizAttempt).values(quizValues)

    const proofValues = Object.entries(state.proofs).map(([moduleId, value]) => ({
      userId,
      moduleId,
      repoUrl: value.repoUrl,
      demoUrl: value.demoUrl,
      selfRubric: value.selfRubric,
      notes: value.notes,
      createdAt: asDate(value.createdAt),
    }))
    if (proofValues.length) await tx.insert(proofSubmission).values(proofValues)

    const noteValues = Object.entries(state.notes).map(([key, value]) => {
      const moduleId = key.startsWith('module:') ? key.slice(7) : null
      const cheatId = key.startsWith('cheat:') ? key.slice(6) : null
      return {
        userId,
        moduleId,
        cheatId,
        body: value.body,
        createdAt: asDate(value.updatedAt),
        updatedAt: asDate(value.updatedAt),
      }
    })
    if (noteValues.length) await tx.insert(note).values(noteValues)

    const pinValues = Object.entries(state.pins).map(([cheatId, value]) => ({
      userId,
      cheatId,
      createdAt: asDate(value),
    }))
    if (pinValues.length) await tx.insert(cheatPin).values(pinValues)

    const reviewValues = Object.entries(state.reviews).map(([cardId, value]) => ({
      userId,
      cardId,
      moduleId: value.moduleId,
      box: value.box,
      dueAt: value.dueAt,
      lastReviewedAt: value.lastReviewedAt,
      misses: value.misses,
    }))
    if (reviewValues.length) await tx.insert(flashcardState).values(reviewValues)

    const toolValues = Object.entries(state.tools).map(([toolId, data]) => ({
      userId,
      toolId,
      data,
      updatedAt,
    }))
    if (toolValues.length) await tx.insert(toolState).values(toolValues)

    if (state.review) {
      await tx.insert(weeklyReview).values({
        userId,
        shipped: state.review.shipped,
        blocked: state.review.blocked,
        next: state.review.next,
        updatedAt: asDate(state.review.updatedAt),
      })
    }

    if (state.activity.length) {
      await tx.insert(activity).values(
        state.activity.map((item) => ({
          userId,
          kind: item.kind,
          refId: item.refId,
          at: asDate(item.at),
        })),
      )
    }
  })

  return updatedAt.toISOString()
}

export async function deleteUserData(userId: string): Promise<void> {
  await db.delete(profile).where(eq(profile.userId, userId))
  await db.delete(moduleProgress).where(eq(moduleProgress.userId, userId))
  await db.delete(quizAttempt).where(eq(quizAttempt.userId, userId))
  await db.delete(proofSubmission).where(eq(proofSubmission.userId, userId))
  await db.delete(note).where(eq(note.userId, userId))
  await db.delete(cheatPin).where(eq(cheatPin.userId, userId))
  await db.delete(flashcardState).where(eq(flashcardState.userId, userId))
  await db.delete(toolState).where(eq(toolState.userId, userId))
  await db.delete(activity).where(eq(activity.userId, userId))
  await db.delete(weeklyReview).where(eq(weeklyReview.userId, userId))
}


export async function stateSummary(
  userId: string,
): Promise<{ hasData: boolean; updatedAt: string | null }> {
  const [row] = await db
    .select({ updatedAt: profile.updatedAt })
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1)
  return row
    ? { hasData: true, updatedAt: row.updatedAt.toISOString() }
    : { hasData: false, updatedAt: null }
}
