import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth-schema.js'

export const profile = pgTable(
  'profile',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull().default(''),
    hoursPerWeek: integer('hours_per_week').notNull(),
    targetPhase: text('target_phase').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    placement: jsonb('placement'),
    streakEnabled: boolean('streak_enabled').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('profile_user_idx').on(table.userId)],
)

export const moduleProgress = pgTable(
  'module_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    moduleId: text('module_id').notNull(),
    status: text('status').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.moduleId] }),
    index('module_progress_user_idx').on(table.userId),
  ],
)

export const quizAttempt = pgTable(
  'quiz_attempt',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    moduleId: text('module_id').notNull(),
    score: integer('score').notNull(),
    total: integer('total').notNull(),
    answers: jsonb('answers').$type<number[]>().notNull(),
    takenAt: timestamp('taken_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('quiz_attempt_user_idx').on(table.userId, table.takenAt)],
)

export const proofSubmission = pgTable(
  'proof_submission',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    moduleId: text('module_id').notNull(),
    repoUrl: text('repo_url').notNull(),
    demoUrl: text('demo_url').notNull(),
    selfRubric: jsonb('self_rubric').$type<Record<string, number>>().notNull(),
    notes: text('notes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('proof_submission_user_idx').on(table.userId, table.createdAt)],
)

export const note = pgTable(
  'note',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    moduleId: text('module_id'),
    cheatId: text('cheat_id'),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('note_user_idx').on(table.userId)],
)

export const cheatPin = pgTable(
  'cheat_pin',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    cheatId: text('cheat_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.cheatId] }),
    index('cheat_pin_user_idx').on(table.userId),
  ],
)

export const flashcardState = pgTable(
  'flashcard_state',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    cardId: text('card_id').notNull(),
    moduleId: text('module_id').notNull(),
    box: integer('box').notNull(),
    dueAt: date('due_at', { mode: 'string' }).notNull(),
    lastReviewedAt: date('last_reviewed_at', { mode: 'string' }),
    misses: integer('misses').notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.cardId] }),
    index('flashcard_state_user_idx').on(table.userId, table.dueAt),
  ],
)

export const toolState = pgTable(
  'tool_state',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    toolId: text('tool_id').notNull(),
    data: jsonb('data').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.toolId] }),
    index('tool_state_user_idx').on(table.userId),
  ],
)

export const activity = pgTable(
  'activity',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    refId: text('ref_id').notNull(),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('activity_user_idx').on(table.userId, table.at)],
)

export const weeklyReview = pgTable('weekly_review', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  shipped: text('shipped').notNull().default(''),
  blocked: text('blocked').notNull().default(''),
  next: text('next').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const appSchema = {
  profile,
  moduleProgress,
  quizAttempt,
  proofSubmission,
  note,
  cheatPin,
  flashcardState,
  toolState,
  activity,
  weeklyReview,
}
