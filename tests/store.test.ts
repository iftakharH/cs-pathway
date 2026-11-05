// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  EMPTY_STATE,
  dueReviewItems,
  exportGuestJson,
  getSnapshot,
  importGuestJson,
  recordQuiz,
  recordReviewAnswer,
  resetGuestData,
  saveNote,
  setPlacement,
  setProfile,
  togglePin,
} from '@/lib/store'

beforeEach(() => {
  resetGuestData()
  window.localStorage.clear()
})

describe('guest store', () => {
  it('saves a profile and persists it', () => {
    setProfile(12, '2')
    expect(getSnapshot().profile?.hoursPerWeek).toBe(12)
    expect(getSnapshot().profile?.targetPhase).toBe('2')
    const raw = window.localStorage.getItem('cs-pathway:v1')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw ?? '{}').profile.hoursPerWeek).toBe(12)
  })

  it('clamps hours into the allowed range', () => {
    setProfile(0, 'F')
    expect(getSnapshot().profile?.hoursPerWeek).toBe(1)
    setProfile(1000, 'F')
    expect(getSnapshot().profile?.hoursPerWeek).toBe(80)
  })

  it('round-trips an export through import', () => {
    setProfile(9, 'S')
    setPlacement({
      ratings: { F: 1, '1': 1, '2': 1, '3': 1, S: 1 },
      answers: { 'scenario-git': 0 },
      recommendedPhase: 'F',
      completedAt: new Date().toISOString(),
    })
    const exported = exportGuestJson()
    resetGuestData()
    expect(getSnapshot().profile).toBeNull()
    const result = importGuestJson(exported)
    expect(result.ok).toBe(true)
    expect(getSnapshot().profile?.hoursPerWeek).toBe(9)
    expect(getSnapshot().placement?.recommendedPhase).toBe('F')
  })

  it('rejects an invalid export without destroying current data', () => {
    setProfile(7, '1')
    const result = importGuestJson('{"version":2,"profile":null}')
    expect(result.ok).toBe(false)
    expect(getSnapshot().profile?.hoursPerWeek).toBe(7)
  })

  it('rejects malformed JSON', () => {
    const result = importGuestJson('not json')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('not valid JSON')
  })

  it('adds missing collections from older exports', () => {
    setProfile(5, 'F')
    const data = JSON.parse(exportGuestJson()) as Record<string, unknown>
    delete data.proofs
    delete data.quizzes
    const result = importGuestJson(JSON.stringify(data))
    expect(result.ok).toBe(true)
    expect(getSnapshot().proofs).toEqual({})
    expect(getSnapshot().quizzes).toEqual({})
  })

  it('enforces the note length cap', () => {
    const tooLong = 'a'.repeat(5001)
    const rejected = saveNote('module:f-git', tooLong)
    expect(rejected.ok).toBe(false)
    expect(rejected.error).toContain('5,000')

    const accepted = saveNote('module:f-git', 'A useful note about rebasing.')
    expect(accepted.ok).toBe(true)
    expect(getSnapshot().notes['module:f-git']?.body).toContain('rebasing')
  })

  it('deletes a note when saved empty', () => {
    saveNote('module:f-git', 'temporary')
    saveNote('module:f-git', '   ')
    expect(getSnapshot().notes['module:f-git']).toBeUndefined()
  })

  it('toggles a pin and records activity', () => {
    togglePin('git-undo')
    expect(getSnapshot().pins['git-undo']).toBeDefined()
    expect(getSnapshot().activity[0]?.kind).toBe('cheat:pinned')
    togglePin('git-undo')
    expect(getSnapshot().pins['git-undo']).toBeUndefined()
  })

  it('records a quiz and moves an untouched module to in progress', () => {
    recordQuiz('f-git', 4, 5, [0, 1, 2, 0, 1])
    expect(getSnapshot().quizzes['f-git']?.score).toBe(4)
    expect(getSnapshot().progress['f-git']?.status).toBe('in_progress')
  })

  it('does not downgrade a done module when a quiz is retaken', () => {
    recordQuiz('f-git', 5, 5, [])
    const store = getSnapshot()
    expect(store.progress['f-git']?.status).toBe('in_progress')
    expect(EMPTY_STATE.profile).toBeNull()
  })

  it('schedules only the missed quiz questions for review', () => {
    recordQuiz(
      'f-git',
      1,
      2,
      [0, 1],
      [
        { id: 'f-git-q1', answerIndex: 0 },
        { id: 'f-git-q2', answerIndex: 0 },
      ],
    )
    const reviews = getSnapshot().reviews
    expect(reviews['f-git-q1']).toBeUndefined()
    expect(reviews['f-git-q2']?.box).toBe(0)
    expect(reviews['f-git-q2']?.misses).toBe(1)
    expect(dueReviewItems(getSnapshot(), '2099-01-01')).toHaveLength(1)
  })

  it('moves a correct review further out and resets a miss', () => {
    recordQuiz('f-git', 0, 1, [1], [{ id: 'f-git-q1', answerIndex: 0 }])
    recordReviewAnswer('f-git-q1', true)
    expect(getSnapshot().reviews['f-git-q1']?.box).toBe(1)

    recordReviewAnswer('f-git-q1', false)
    const reset = getSnapshot().reviews['f-git-q1']
    expect(reset?.box).toBe(0)
    expect(reset?.misses).toBe(2)
    expect(reset?.lastReviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
