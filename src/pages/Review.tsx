import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ExternalLink, RotateCcw, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { InlineText } from '@/components/InlineText'
import { MODULES } from '@/content/generated/modules'
import type { QuizQuestion } from '@/content/schema'
import {
  dueReviewItems,
  recordReviewAnswer,
  useGuestState,
} from '@/lib/store'
import { cx, formatDate } from '@/lib/format'
import { todayIso } from '@/lib/dates'

type ReviewQuestion = QuizQuestion & { moduleId: string; moduleTitle: string }

const questionById = new Map<string, ReviewQuestion>(
  MODULES.flatMap((module) =>
    module.quiz.map((question) => [
      question.id,
      { ...question, moduleId: module.id, moduleTitle: module.title },
    ] as const),
  ),
)

export default function Review() {
  const state = useGuestState()
  const due = dueReviewItems(state)
  const [queue] = useState(() => due.map((item) => item.questionId))
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)

  const total = queue.length
  const questionId = queue[index]
  const question = questionId ? questionById.get(questionId) : undefined
  const scheduled = Object.values(state.reviews)
  const nextDue = scheduled
    .map((item) => item.dueAt)
    .filter((dueAt) => dueAt > todayIso())
    .sort()[0]

  const answered = chosen !== null

  function choose(choiceIndex: number) {
    if (!question || chosen !== null) return
    setChosen(choiceIndex)
    recordReviewAnswer(question.id, choiceIndex === question.answerIndex)
  }

  function next() {
    setChosen(null)
    setIndex((current) => current + 1)
  }

  if (total === 0 || !question) {
    return (
      <div className="container-page">
        <PageHeader
          title="Review what you missed"
          lede="Wrong quiz answers return here on a spaced schedule. Correct answers move further out; a miss brings the question back tomorrow."
          breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Review' }]}
          actions={<ButtonLink to="/dashboard" variant="secondary">Dashboard</ButtonLink>}
        />
        <div className="border-y border-line py-12 text-center">
          <CheckCircle2 size={28} className="mx-auto text-accent" aria-hidden="true" />
          <h2 className="mt-3 text-2xl">
            {scheduled.length === 0 ? 'Nothing scheduled yet' : 'Nothing due right now'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            {scheduled.length === 0
              ? 'Finish a module quiz. Any answer you miss enters the review queue automatically.'
              : `You have ${scheduled.length} question${scheduled.length === 1 ? '' : 's'} scheduled. The next one is due ${nextDue ? formatDate(nextDue) : 'later'}.`}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/path">Open the path</ButtonLink>
            {scheduled.length > 0 ? (
              <ButtonLink to="/dashboard" variant="secondary">
                See the dashboard
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const isLast = index === total - 1

  return (
    <div className="container-page">
      <PageHeader
        title="Review what you missed"
        lede="A wrong answer comes back tomorrow. Each correct answer moves the question further out. This is recall practice, not a second certificate."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Review' }]}
        actions={<ButtonLink to="/dashboard" variant="secondary">Dashboard</ButtonLink>}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3 text-xs text-faint">
        <span className="mono">
          {index + 1} / {total}
        </span>
        <span>
          From <Link to={`/module/${question.moduleId}`} className="text-accent underline decoration-line underline-offset-4">{question.moduleTitle}</Link>
        </span>
      </div>

      <fieldset className="border-b border-line py-6">
        <legend className="sr-only">Review question</legend>
        <p className="max-w-3xl text-lg leading-relaxed text-ink">
          <InlineText text={question.question} />
        </p>
        <div className="mt-5 space-y-2">
          {question.choices.map((choice, choiceIndex) => {
            const isChosen = chosen === choiceIndex
            const isAnswer = question.answerIndex === choiceIndex
            const revealed = answered
            return (
              <label
                key={choice}
                className={cx(
                  'flex min-h-11 cursor-pointer items-start gap-3 border px-3 py-2.5 text-sm transition-colors',
                  !revealed && 'border-line text-muted hover:border-accent hover:text-ink',
                  revealed && isAnswer && 'border-accent bg-accent-soft text-ink',
                  revealed && isChosen && !isAnswer && 'border-danger/50 bg-danger-soft text-ink',
                  revealed && !isChosen && !isAnswer && 'border-line text-faint',
                  revealed && 'cursor-default',
                )}
              >
                <input
                  type="radio"
                  name={`review-${question.id}`}
                  checked={isChosen}
                  disabled={revealed}
                  onChange={() => choose(choiceIndex)}
                  className="mt-1 accent-[var(--accent)]"
                />
                <span>{choice}</span>
                {revealed && isAnswer ? (
                  <CheckCircle2 size={15} className="ml-auto mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                ) : null}
                {revealed && isChosen && !isAnswer ? (
                  <XCircle size={15} className="ml-auto mt-0.5 shrink-0 text-danger" aria-hidden="true" />
                ) : null}
              </label>
            )
          })}
        </div>

        {answered ? (
          <div
            role="status"
            className={cx(
              'mt-5 border-l-2 p-4',
              chosen === question.answerIndex
                ? 'border-accent bg-accent-soft/60'
                : 'border-warn bg-warn-soft/60',
            )}
          >
            <p className="text-sm leading-relaxed text-ink">
              <InlineText text={question.explanation} />
            </p>
            <a
              href={question.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent"
            >
              Read the page that states this
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 py-5">
        <p className="text-xs text-faint">
          {answered
            ? 'This answer is scheduled from today.'
            : 'Choose one answer. The explanation appears immediately.'}
        </p>
        {answered ? (
          isLast ? (
            <ButtonLink to="/dashboard">
              Finish review
              <ArrowRight size={15} aria-hidden="true" />
            </ButtonLink>
          ) : (
            <Button onClick={next}>
              Next question
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          )
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-faint">
            <RotateCcw size={13} aria-hidden="true" />
            {due.length} due today
          </span>
        )}
      </div>
    </div>
  )
}
