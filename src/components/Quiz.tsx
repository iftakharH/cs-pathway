import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ExternalLink, RotateCcw, XCircle } from 'lucide-react'
import type { Module } from '@/content/schema'
import { recordQuiz, useGuestState } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { cx } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { InlineText } from '@/components/InlineText'

export function Quiz({ module }: { module: Module }) {
  const state = useGuestState()
  const previous = state.quizzes[module.id]
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const recorded = useRef(false)

  const answeredCount = module.quiz.filter((question) => answers[question.id] !== undefined).length
  const complete = answeredCount === module.quiz.length
  const score = module.quiz.reduce(
    (total, question) => total + (answers[question.id] === question.answerIndex ? 1 : 0),
    0,
  )

  useEffect(() => {
    if (!complete || recorded.current) return
    recorded.current = true
    recordQuiz(
      module.id,
      score,
      module.quiz.length,
      module.quiz.map((question) => answers[question.id] ?? -1),
    )
  }, [answers, complete, module, score])

  function retake() {
    recorded.current = false
    setAnswers({})
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl">Check your understanding</h2>
        </div>
        <span className="mono text-[10px] uppercase tracking-wider text-faint">
          {answeredCount}/{module.quiz.length} answered
        </span>
      </div>

      {previous ? (
        <p className="mb-4 text-xs text-faint">
          Last attempt: <span className="text-muted">{previous.score}/{previous.total}</span> on{' '}
          {formatDate(previous.takenAt.slice(0, 10))}.
        </p>
      ) : null}

      <div className="space-y-4">
        {module.quiz.map((question, questionIndex) => {
          const chosen = answers[question.id]
          const revealed = chosen !== undefined
          const correct = chosen === question.answerIndex
          return (
            <fieldset key={question.id} className="card p-4 sm:p-5">
              <legend className="mono px-1 text-[10px] uppercase tracking-wider text-faint">
                Question {questionIndex + 1} of {module.quiz.length}
              </legend>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-ink">
                <InlineText text={question.question} />
              </p>
              <div className="mt-3 space-y-1.5">
                {question.choices.map((choice, choiceIndex) => {
                  const isChosen = chosen === choiceIndex
                  const isAnswer = question.answerIndex === choiceIndex
                  const badge = revealed && isAnswer
                    ? { label: 'Correct', className: 'text-accent', Icon: CheckCircle2 }
                    : revealed && isChosen && !isAnswer
                      ? { label: 'Your answer', className: 'text-danger', Icon: XCircle }
                      : null
                  return (
                    <div
                      key={choice}
                      className={cx(
                        'flex items-start gap-2 rounded-md border transition-colors',
                        !revealed && 'border-line',
                        revealed && isAnswer && 'border-accent bg-accent-soft',
                        revealed && isChosen && !isAnswer && 'border-danger/50 bg-danger-soft',
                        revealed && !isChosen && !isAnswer && 'border-line',
                      )}
                    >
                      <label
                        className={cx(
                          'flex min-h-11 flex-1 cursor-pointer items-start gap-2.5 px-3 py-2.5 text-sm',
                          !revealed && 'text-muted hover:text-ink',
                          revealed && isAnswer && 'text-ink',
                          revealed && isChosen && !isAnswer && 'text-ink',
                          revealed && !isChosen && !isAnswer && 'text-faint',
                          revealed && 'cursor-default',
                        )}
                      >
                        <input
                          type="radio"
                          name={`quiz-${question.id}`}
                          checked={isChosen}
                          disabled={revealed}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))
                          }
                          className="mt-1 accent-[var(--accent)]"
                        />
                        <span>{choice}</span>
                      </label>
                      {badge ? (
                        <span
                          className={cx(
                            'mr-3 mt-2.5 inline-flex shrink-0 items-center gap-1 text-[10px] font-medium',
                            badge.className,
                          )}
                        >
                          <badge.Icon size={13} aria-hidden="true" />
                          {badge.label}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              {revealed ? (
                <div
                  className={cx(
                    'mt-3 rounded-md border p-3 text-sm leading-relaxed',
                    correct ? 'border-accent/30 bg-accent-soft' : 'border-warn/30 bg-warn-soft',
                  )}
                >
                  <p className="text-ink">
                    <InlineText text={question.explanation} />
                  </p>
                  <a
                    href={question.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent link-underline"
                  >
                    Read the page that states this
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              ) : null}
            </fieldset>
          )
        })}
      </div>

      {complete ? (
        <div
          role="status"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-ink">
              You scored {score}/{module.quiz.length}.
            </p>
            <p className="text-xs text-muted">
              {score === module.quiz.length
                ? 'Every answer matched. Now do the proof; recall is not application.'
                : score >= Math.ceil(module.quiz.length * 0.8)
                  ? 'Enough to move on. Read the sources you missed, then start the proof.'
                  : 'Read the linked sources before the proof. A low score is information, not a verdict.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={retake}>
            <RotateCcw size={14} aria-hidden="true" />
            Retake
          </Button>
        </div>
      ) : null}
    </div>
  )
}
