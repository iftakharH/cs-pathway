// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Quiz } from '@/components/Quiz'
import { getModule } from '@/lib/content'
import { getSnapshot, resetGuestData } from '@/lib/store'

beforeEach(() => {
  resetGuestData()
})

afterEach(() => {
  cleanup()
})

describe('module quiz', () => {
  it('reveals feedback per question, scores the attempt and stores it', async () => {
    const module = getModule('f-git')
    expect(module).toBeDefined()
    if (!module) return

    render(<Quiz module={module} />)
    const user = userEvent.setup()

    expect(screen.getAllByRole('group')).toHaveLength(module.quiz.length)

    for (const [index, question] of module.quiz.entries()) {
      const group = screen.getAllByRole('group')[index]
      expect(group).toBeDefined()
      if (!group) continue
      const correct = question.choices[question.answerIndex]
      expect(correct).toBeDefined()
      if (!correct) continue
      await user.click(within(group).getByLabelText(correct))
    }

    expect(await screen.findByText(/You scored 5\/5/)).toBeTruthy()
    expect(getSnapshot().quizzes['f-git']?.score).toBe(5)
    expect(getSnapshot().quizzes['f-git']?.total).toBe(5)
  })

  it('does not let a second answer replace the first', async () => {
    const module = getModule('f-git')
    expect(module).toBeDefined()
    if (!module) return

    render(<Quiz module={module} />)
    const user = userEvent.setup()
    const group = screen.getAllByRole('group')[0]
    expect(group).toBeDefined()
    if (!group) return
    const question = module.quiz[0]
    expect(question).toBeDefined()
    if (!question) return

    const first = question.choices[(question.answerIndex + 1) % question.choices.length]
    const second = question.choices[question.answerIndex]
    expect(first).toBeDefined()
    expect(second).toBeDefined()
    if (!first || !second) return

    await user.click(within(group).getByLabelText(first))
    await user.click(within(group).getByLabelText(second))

    expect(getSnapshot().quizzes['f-git']).toBeUndefined()
    expect(screen.getByText('Your answer')).toBeTruthy()
    expect(screen.getByText('Correct')).toBeTruthy()
  })
})
