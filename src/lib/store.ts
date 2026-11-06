import { useSyncExternalStore } from 'react'
import type { PhaseId } from '@/content/schema'

export type ModuleStatus = 'skipped' | 'in_progress' | 'proof_submitted' | 'done'

export type QuizRecord = {
  score: number
  total: number
  takenAt: string
  answers: number[]
}

export type NoteRecord = { body: string; updatedAt: string }

export type ProofRecord = {
  repoUrl: string
  demoUrl: string
  selfRubric: Record<string, number>
  notes: string
  createdAt: string
}

export type ActivityRecord = { at: string; kind: string; refId: string }

export type ReviewItem = {
  questionId: string
  moduleId: string
  /** Leitner box, 0 to 5. A miss resets to 0. */
  box: number
  dueAt: string
  lastReviewedAt: string | null
  misses: number
}

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60] as const

export type GuestState = {
  version: 1
  profile: { hoursPerWeek: number; targetPhase: PhaseId; startedAt: string } | null
  placement: {
    ratings: Record<PhaseId, number>
    answers: Record<string, number>
    recommendedPhase: PhaseId
    completedAt: string
  } | null
  progress: Record<string, { status: ModuleStatus; updatedAt: string }>
  quizzes: Record<string, QuizRecord>
  notes: Record<string, NoteRecord>
  proofs: Record<string, ProofRecord>
  pins: Record<string, string>
  tools: Record<string, unknown>
  review: { shipped: string; blocked: string; next: string; updatedAt: string } | null
  streakEnabled: boolean
  activity: ActivityRecord[]
  reviews: Record<string, ReviewItem>
}

const STORAGE_KEY = 'cs-pathway:v1'
const MAX_NOTE_LENGTH = 5000
const MAX_ACTIVITY = 200

export const EMPTY_STATE: GuestState = {
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

const phaseIdValues = ['F', '1', '2', '3', 'S'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isPhase(value: unknown): value is PhaseId {
  return typeof value === 'string' && (phaseIdValues as readonly string[]).includes(value)
}

function isProfile(value: unknown): value is GuestState['profile'] {
  if (value === null) return true
  if (!isRecord(value)) return false
  return (
    typeof value.hoursPerWeek === 'number' &&
    value.hoursPerWeek >= 1 &&
    value.hoursPerWeek <= 80 &&
    isPhase(value.targetPhase) &&
    typeof value.startedAt === 'string'
  )
}

function isPlacement(value: unknown): value is GuestState['placement'] {
  if (value === null) return true
  if (!isRecord(value)) return false
  if (!isRecord(value.ratings) || !isRecord(value.answers)) return false
  const ratings = value.ratings
  if (!isPhase(value.recommendedPhase) || typeof value.completedAt !== 'string') return false
  return phaseIdValues.every((phase) => {
    const rating = ratings[phase]
    return typeof rating === 'number' && rating >= 0 && rating <= 3
  })
}

function normaliseImport(raw: unknown): GuestState | null {
  if (!isRecord(raw) || raw.version !== 1) return null

  const progress: GuestState['progress'] = {}
  if (isRecord(raw.progress)) {
    for (const [key, value] of Object.entries(raw.progress)) {
      if (!isRecord(value)) return null
      const status = value.status
      if (
        status !== 'skipped' &&
        status !== 'in_progress' &&
        status !== 'proof_submitted' &&
        status !== 'done'
      ) {
        return null
      }
      if (typeof value.updatedAt !== 'string') return null
      progress[key] = { status, updatedAt: value.updatedAt }
    }
  }

  const quizzes: GuestState['quizzes'] = {}
  if (isRecord(raw.quizzes)) {
    for (const [key, value] of Object.entries(raw.quizzes)) {
      if (!isRecord(value)) return null
      if (
        typeof value.score !== 'number' ||
        typeof value.total !== 'number' ||
        value.total < 1 ||
        typeof value.takenAt !== 'string' ||
        !Array.isArray(value.answers)
      ) {
        return null
      }
      quizzes[key] = {
        score: value.score,
        total: value.total,
        takenAt: value.takenAt,
        answers: value.answers.map((answer) => (typeof answer === 'number' ? answer : -1)),
      }
    }
  }

  const notes: GuestState['notes'] = {}
  if (isRecord(raw.notes)) {
    for (const [key, value] of Object.entries(raw.notes)) {
      if (!isRecord(value) || typeof value.body !== 'string' || typeof value.updatedAt !== 'string') {
        return null
      }
      if (value.body.length > MAX_NOTE_LENGTH) return null
      notes[key] = { body: value.body, updatedAt: value.updatedAt }
    }
  }

  const proofs: GuestState['proofs'] = {}
  if (isRecord(raw.proofs)) {
    for (const [key, value] of Object.entries(raw.proofs)) {
      if (!isRecord(value)) return null
      if (
        typeof value.repoUrl !== 'string' ||
        typeof value.demoUrl !== 'string' ||
        !isRecord(value.selfRubric) ||
        typeof value.notes !== 'string' ||
        typeof value.createdAt !== 'string'
      ) {
        return null
      }
      proofs[key] = {
        repoUrl: value.repoUrl,
        demoUrl: value.demoUrl,
        selfRubric: Object.fromEntries(
          Object.entries(value.selfRubric).map(([criterion, score]) => [
            criterion,
            typeof score === 'number' ? Math.min(3, Math.max(0, score)) : 0,
          ]),
        ),
        notes: value.notes,
        createdAt: value.createdAt,
      }
    }
  }

  const pins: GuestState['pins'] = {}
  if (isRecord(raw.pins)) {
    for (const [key, value] of Object.entries(raw.pins)) {
      if (typeof value !== 'string') return null
      pins[key] = value
    }
  }

  const activity: GuestState['activity'] = []
  if (Array.isArray(raw.activity)) {
    for (const item of raw.activity) {
      if (
        isRecord(item) &&
        typeof item.at === 'string' &&
        typeof item.kind === 'string' &&
        typeof item.refId === 'string'
      ) {
        activity.push({ at: item.at, kind: item.kind, refId: item.refId })
      }
    }
  }

  let review: GuestState['review'] = null
  if (isRecord(raw.review)) {
    review = {
      shipped: typeof raw.review.shipped === 'string' ? raw.review.shipped : '',
      blocked: typeof raw.review.blocked === 'string' ? raw.review.blocked : '',
      next: typeof raw.review.next === 'string' ? raw.review.next : '',
      updatedAt: typeof raw.review.updatedAt === 'string' ? raw.review.updatedAt : new Date().toISOString(),
    }
  }

  const reviews: GuestState['reviews'] = {}
  if (isRecord(raw.reviews)) {
    for (const [key, value] of Object.entries(raw.reviews)) {
      if (!isRecord(value)) return null
      if (
        typeof value.questionId !== 'string' ||
        value.questionId !== key ||
        typeof value.moduleId !== 'string' ||
        typeof value.box !== 'number' ||
        value.box < 0 ||
        value.box >= REVIEW_INTERVALS.length ||
        typeof value.dueAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value.dueAt) ||
        (value.lastReviewedAt !== null && typeof value.lastReviewedAt !== 'string') ||
        typeof value.misses !== 'number' ||
        value.misses < 0
      ) {
        return null
      }
      reviews[key] = {
        questionId: value.questionId,
        moduleId: value.moduleId,
        box: Math.floor(value.box),
        dueAt: value.dueAt,
        lastReviewedAt: value.lastReviewedAt,
        misses: Math.floor(value.misses),
      }
    }
  }

  return {
    version: 1,
    profile: isProfile(raw.profile) ? raw.profile : null,
    placement: isPlacement(raw.placement) ? raw.placement : null,
    progress,
    quizzes,
    notes,
    proofs,
    pins,
    tools: isRecord(raw.tools) ? raw.tools : {},
    review,
    streakEnabled: raw.streakEnabled === true,
    activity: activity.slice(0, MAX_ACTIVITY),
    reviews,
  }
}

const listeners = new Set<() => void>()
let state: GuestState = EMPTY_STATE
let loaded = false

function load(): GuestState {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    return normaliseImport(JSON.parse(raw)) ?? EMPTY_STATE
  } catch {
    return EMPTY_STATE
  }
}

function ensureLoaded() {
  if (loaded) return
  state = load()
  loaded = true
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Could not save progress in this browser.', error)
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function update(updater: (current: GuestState) => GuestState) {
  ensureLoaded()
  state = updater(state)
  persist()
  emit()
}

function record(kind: string, refId: string, current: GuestState): GuestState {
  return {
    ...current,
    activity: [{ at: new Date().toISOString(), kind, refId }, ...current.activity].slice(0, MAX_ACTIVITY),
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): GuestState {
  ensureLoaded()
  return state
}

export function getServerSnapshot(): GuestState {
  return EMPTY_STATE
}

export function useGuestState(): GuestState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function setProfile(hoursPerWeek: number, targetPhase: PhaseId) {
  update((current) => ({
    ...current,
    profile: {
      hoursPerWeek: Math.min(80, Math.max(1, Math.round(hoursPerWeek))),
      targetPhase,
      startedAt: current.profile?.startedAt ?? new Date().toISOString(),
    },
  }))
}

export function setPlacement(placement: GuestState['placement']) {
  update((current) => ({ ...current, placement }))
}

export function setModuleStatus(moduleId: string, status: ModuleStatus) {
  update((current) =>
    record(
      `module:${status}`,
      moduleId,
      {
        ...current,
        progress: {
          ...current.progress,
          [moduleId]: { status, updatedAt: new Date().toISOString() },
        },
      },
    ),
  )
}

function localIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function reviewDueDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return localIsoDate(date)
}

function nextReviewItem(
  existing: ReviewItem | undefined,
  moduleId: string,
  questionId: string,
  correct: boolean,
): ReviewItem {
  const box = correct ? Math.min((existing?.box ?? 0) + 1, REVIEW_INTERVALS.length - 1) : 0
  return {
    questionId,
    moduleId,
    box,
    dueAt: reviewDueDate(REVIEW_INTERVALS[box] ?? REVIEW_INTERVALS[0]),
    lastReviewedAt: existing?.lastReviewedAt ?? null,
    misses: (existing?.misses ?? 0) + (correct ? 0 : 1),
  }
}

export function recordQuiz(
  moduleId: string,
  score: number,
  total: number,
  answers: number[],
  questions: Array<{ id: string; answerIndex: number }> = [],
) {
  update((current) => {
    const reviews = { ...current.reviews }
    questions.forEach((question, index) => {
      const correct = answers[index] === question.answerIndex
      const existing = reviews[question.id]
      if (!existing && correct) return
      reviews[question.id] = nextReviewItem(existing, moduleId, question.id, correct)
    })
    return record('quiz:completed', moduleId, {
      ...current,
      quizzes: {
        ...current.quizzes,
        [moduleId]: { score, total, takenAt: new Date().toISOString(), answers },
      },
      progress: {
        ...current.progress,
        [moduleId]: {
          status: current.progress[moduleId]?.status === 'done' ? 'done' : 'in_progress',
          updatedAt: new Date().toISOString(),
        },
      },
      reviews,
    })
  })
}

export function recordReviewAnswer(questionId: string, correct: boolean) {
  update((current) => {
    const existing = current.reviews[questionId]
    if (!existing) return current
    return record(correct ? 'review:correct' : 'review:missed', completeQuestionRef(existing), {
      ...current,
      reviews: {
        ...current.reviews,
        [questionId]: {
          ...nextReviewItem(existing, existing.moduleId, questionId, correct),
          lastReviewedAt: localIsoDate(new Date()),
        },
      },
    })
  })
}

function completeQuestionRef(item: ReviewItem): string {
  return `${item.moduleId}:${item.questionId}`
}

export function dueReviewItems(
  current: GuestState,
  today = localIsoDate(new Date()),
): ReviewItem[] {
  return Object.values(current.reviews)
    .filter((item) => item.dueAt <= today)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

export function saveNote(key: string, body: string): { ok: boolean; error?: string } {  const trimmed = body.trim()
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return { ok: false, error: `Notes are limited to ${MAX_NOTE_LENGTH.toLocaleString()} characters.` }
  }
  update((current) => {
    const notes = { ...current.notes }
    if (trimmed.length === 0) {
      delete notes[key]
    } else {
      notes[key] = { body: trimmed, updatedAt: new Date().toISOString() }
    }
    return record(trimmed.length ? 'note:saved' : 'note:deleted', key, { ...current, notes })
  })
  return { ok: true }
}

export function deleteNote(key: string) {
  saveNote(key, '')
}

export function saveProof(
  moduleId: string,
  proof: { repoUrl: string; demoUrl: string; selfRubric: Record<string, number>; notes: string },
) {
  update((current) =>
    record('proof:submitted', moduleId, {
      ...current,
      proofs: {
        ...current.proofs,
        [moduleId]: { ...proof, createdAt: new Date().toISOString() },
      },
      progress: {
        ...current.progress,
        [moduleId]: { status: 'proof_submitted', updatedAt: new Date().toISOString() },
      },
    }),
  )
}

export function togglePin(cheatId: string) {
  update((current) => {
    const pins = { ...current.pins }
    if (pins[cheatId]) {
      delete pins[cheatId]
    } else {
      pins[cheatId] = new Date().toISOString()
    }
    return record(pins[cheatId] ? 'cheat:pinned' : 'cheat:unpinned', cheatId, { ...current, pins })
  })
}

export function setToolState(toolId: string, data: unknown) {
  update((current) => ({
    ...current,
    tools: { ...current.tools, [toolId]: data },
  }))
}

export function saveReview(review: { shipped: string; blocked: string; next: string }) {
  update((current) =>
    record('review:saved', 'weekly', {
      ...current,
      review: { ...review, updatedAt: new Date().toISOString() },
    }),
  )
}

export function setStreakEnabled(enabled: boolean) {
  update((current) => ({ ...current, streakEnabled: enabled }))
}

export function resetGuestData() {
  update(() => ({ ...EMPTY_STATE }))
}

export function replaceGuestState(next: GuestState): boolean {
  const normalised = normaliseImport(next)
  if (!normalised) return false
  update(() => normalised)
  return true
}

export function exportGuestJson(): string {
  ensureLoaded()
  return JSON.stringify(state, null, 2)
}

export function importGuestJson(raw: string): { ok: boolean; error?: string } {
  try {
    const parsed = normaliseImport(JSON.parse(raw))
    if (!parsed) {
      return { ok: false, error: 'That file does not look like a cs-pathway export.' }
    }
    update(() => parsed)
    return { ok: true }
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }
}

export function hasProgress(current: GuestState): boolean {
  return (
    Object.keys(current.progress).length > 0 ||
    Object.keys(current.quizzes).length > 0 ||
    Object.keys(current.notes).length > 0 ||
    Object.keys(current.proofs).length > 0 ||
    Object.keys(current.pins).length > 0 ||
    Object.keys(current.reviews).length > 0 ||
    current.profile !== null
  )
}

export function exportNotesMarkdown(current: GuestState, moduleTitle: (id: string) => string): string {
  const entries = Object.entries(current.notes)
  if (entries.length === 0) return ''
  return [
    '# My cs-pathway notes',
    '',
    ...entries.map(([key, note]) => {
      const label = key.startsWith('module:') ? moduleTitle(key.replace('module:', '')) : key
      return `## ${label}\n\n${note.body}\n\n_Updated ${note.updatedAt.slice(0, 10)}_\n`
    }),
  ].join('\n')
}

if (typeof window !== 'undefined') {
  ensureLoaded()
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    state = load()
    emit()
  })
}
