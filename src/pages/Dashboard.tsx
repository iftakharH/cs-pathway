import { useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  Pin,
  RotateCcw,
  Upload,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, ProgressBar, Callout } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { PhaseBadge } from '@/components/ui/Badge'
import { Field, TextArea, Toggle } from '@/components/ui/Field'
import {
  getCheat,
  getModule,
} from '@/lib/content'
import { moduleSummaries } from '@/lib/catalog'
import { phases } from '@/lib/phases'
import { todayIso } from '@/lib/dates'
import { buildPlan, nextUnfinishedModule, phaseCompletion } from '@/lib/planner'
import {
  exportGuestJson,
  importGuestJson,
  resetGuestData,
  saveReview,
  setStreakEnabled,
  useGuestState,
} from '@/lib/store'
import { downloadFile, formatDate, plural } from '@/lib/format'

function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function currentStreak(activity: Array<{ at: string }>): number {
  const days = new Set(activity.map((item) => item.at.slice(0, 10)))
  const cursor = new Date()
  if (!days.has(localIso(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(localIso(cursor)) && streak < 400) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function Dashboard() {
  const state = useGuestState()
  const [dataMessage, setDataMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const evidenceCount = Object.values(state.progress).filter(
    (item) => item.status === 'done' || item.status === 'proof_submitted',
  ).length
  const quizCount = Object.keys(state.quizzes).length
  const proofCount = Object.keys(state.proofs).length
  const startPhase = state.placement?.recommendedPhase ?? 'F'
  const next = nextUnfinishedModule(moduleSummaries, state.progress, startPhase)
  const streak = currentStreak(state.activity)
  const empty =
    !state.profile &&
    Object.keys(state.progress).length === 0 &&
    Object.keys(state.quizzes).length === 0 &&
    Object.keys(state.pins).length === 0

  const plan = state.profile
    ? buildPlan({
        modules: moduleSummaries,
        hoursPerWeek: state.profile.hoursPerWeek,
        startPhase,
        targetPhase: state.profile.targetPhase,
        completed: Object.entries(state.progress)
          .filter(([, value]) => value.status === 'done' || value.status === 'proof_submitted')
          .map(([id]) => id),
        skipped: Object.entries(state.progress)
          .filter(([, value]) => value.status === 'skipped')
          .map(([id]) => id),
        startDate: todayIso(),
      })
    : null

  const recentQuizzes = Object.entries(state.quizzes)
    .sort(([, a], [, b]) => b.takenAt.localeCompare(a.takenAt))
    .slice(0, 5)

  const weakModules = Object.entries(state.quizzes)
    .filter(([, record]) => record.score / Math.max(1, record.total) < 0.8)
    .slice(0, 3)

  const pinned = Object.entries(state.pins)
    .sort(([, a], [, b]) => b.localeCompare(a))
    .slice(0, 3)
    .flatMap(([id]) => {
      const entry = getCheat(id)
      return entry ? [entry] : []
    })

  function onExport() {
    downloadFile('cs-pathway-data.json', exportGuestJson(), 'application/json')
    setDataMessage('Export downloaded.')
  }

  async function onImport(file: File | undefined) {
    if (!file) return
    const text = await file.text()
    const result = importGuestJson(text)
    setDataMessage(result.ok ? 'Progress restored from the file.' : (result.error ?? 'Import failed.'))
  }

  function onReset() {
    if (!window.confirm('Delete all progress, notes, proofs and pins from this browser?')) return
    resetGuestData()
    setDataMessage('Local data deleted.')
  }

  if (empty) {
    return (
      <div className="container-page">
        <PageHeader
          kicker="Dashboard"
          title="Your plan starts with three minutes"
          lede="This page becomes your weekly view: what to do next, what you have proved, and what is blocked. It needs one input first — your starting point."
          breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Dashboard' }]}
        />
        <div className="grid gap-4 py-10 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Place yourself',
              body: 'Five scenario questions and a self-rating. No account, no score shared anywhere.',
              to: '/start',
              cta: 'Take the check',
            },
            {
              step: '02',
              title: 'Set the pace',
              body: 'Choose weekly hours and a target phase. The planner turns them into weeks.',
              to: '/plan',
              cta: 'Build a plan',
            },
            {
              step: '03',
              title: 'Do the first module',
              body: 'Take the quiz, write a note, then submit the proof. Progress is measured by evidence.',
              to: '/module/f-git',
              cta: 'Open a module',
            },
          ].map((item) => (
            <div key={item.step} className="card p-5">
              <p className="mono mb-4 text-[10px] uppercase tracking-[0.14em] text-faint">{item.step}</p>
              <h2 className="text-lg">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              <Link to={item.to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                {item.cta}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        <Callout title="Saved in this browser, not on a server">
          There are no accounts in this build. Progress, notes and proofs live in localStorage on
          this device. You can export everything as JSON from this dashboard once you start, and
          the <Link to="/privacy" className="text-accent link-underline">privacy page</Link> lists
          exactly what is stored.
        </Callout>
      </div>
    )
  }

  return (
    <div className="container-page">
      <PageHeader
        kicker={state.profile ? `${state.profile.hoursPerWeek} h/week plan` : 'Dashboard'}
        title={next ? `Next: ${next.title}` : 'You have finished every module in range'}
        lede={
          next
            ? 'One module at a time. The proof is what moves the phase, not the page view.'
            : 'Submit a proof for anything you skipped, or move the target to the startup phase.'
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Dashboard' }]}
        actions={
          <>
            <ButtonLink to="/plan" variant="secondary" size="sm">
              <CalendarDays size={14} aria-hidden="true" />
              This week’s plan
            </ButtonLink>
            {next ? (
              <ButtonLink to={`/module/${next.id}`} size="sm">
                Open module
              </ButtonLink>
            ) : (
              <ButtonLink to="/startup" size="sm">
                Explore startup
              </ButtonLink>
            )}
          </>
        }
      />

      <div className="grid gap-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Modules with evidence" value={`${evidenceCount}/${moduleSummaries.length}`} />
        <Metric label="Quizzes taken" value={String(quizCount)} />
        <Metric label="Proofs submitted" value={String(proofCount)} />
        <Metric label="Notes and pins" value={String(Object.keys(state.notes).length + Object.keys(state.pins).length)} />
      </div>

      <div className="grid gap-6 pb-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="border-b border-line px-5 py-3">
              <p className="eyebrow">This week</p>
              {plan ? (
                <p className="mt-1 text-xs text-faint">
                  {plan.weeks[0]?.hours ?? 0} h planned · {plural(plan.weeks[0]?.modules.length ?? 0, 'module')}
                </p>
              ) : (
                <p className="mt-1 text-xs text-faint">Set a pace in the planner.</p>
              )}
            </div>
            {plan && plan.weeks[0] ? (
              <ul className="divide-y divide-line">
                {plan.weeks[0].modules.map(({ module, hours }) => (
                  <li key={module.id}>
                    <Link to={`/module/${module.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2">
                      <PhaseBadge phase={module.phase} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{module.title}</span>
                        <span className="mono block text-[10px] text-faint">{hours.toFixed(1)} h</span>
                      </span>
                      <ArrowRight size={14} className="shrink-0 text-faint" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-6 text-sm text-muted">
                Every module in your range already has evidence.{' '}
                <Link to="/plan" className="text-accent link-underline">
                  Change the target
                </Link>
                .
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg">Progress by phase</h2>
              <span className="mono text-[10px] uppercase tracking-wider text-faint">by evidence</span>
            </div>
            <div className="space-y-4">
              {phases.map((phase) => {
                const stats = phaseCompletion(moduleSummaries, state.progress, state.quizzes, phase.id)
                return (
                  <div key={phase.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <Link to={`/phase/${phase.id}`} className="text-sm text-ink hover:text-accent">
                        <span className="mono mr-2 text-[10px] text-faint">{phase.id}</span>
                        {phase.name}
                      </Link>
                      <span className="mono text-[10px] text-faint">
                        {stats.done}/{stats.total}
                      </span>
                    </div>
                    <ProgressBar
                      value={stats.ratio}
                      label={`${phase.name} progress`}
                      showPercent={false}
                      showLabel={false}
                    />
                  </div>
                )
              })}
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg">Weekly review</h2>
              <span className="mono text-[10px] uppercase tracking-wider text-faint">one honest paragraph</span>
            </div>
            <ReviewForm />
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="text-lg">Next proof</h2>
            {next ? (
              <>
                <p className="mt-2 text-sm text-muted">{next.proofTitle}</p>
                <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-faint">{next.proofBrief}</p>
                <div className="mt-4">
                  <ButtonLink to={`/module/${next.id}#proof`} size="sm">
                    Read the rubric
                  </ButtonLink>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">Nothing pending. Choose a target phase in the planner.</p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-lg">Quiz history</h2>
            {recentQuizzes.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No quizzes yet. Each module has five sourced questions.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentQuizzes.map(([moduleId, record]) => {
                  const module = getModule(moduleId)
                  const ratio = record.score / Math.max(1, record.total)
                  return (
                    <li key={moduleId} className="flex items-center justify-between gap-3 text-sm">
                      <Link to={`/module/${moduleId}`} className="min-w-0 truncate text-muted hover:text-accent">
                        {module?.title ?? moduleId}
                      </Link>
                      <span
                        className={`mono shrink-0 text-[11px] ${
                          ratio >= 0.8 ? 'text-accent' : 'text-warn'
                        }`}
                      >
                        {record.score}/{record.total}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            {weakModules.length > 0 ? (
              <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
                Review:{' '}
                {weakModules.map(([moduleId], index) => {
                  const module = getModule(moduleId)
                  return (
                    <span key={moduleId}>
                      {index > 0 ? ', ' : ''}
                      <Link to={`/module/${moduleId}`} className="link-underline">
                        {module?.title ?? moduleId}
                      </Link>
                    </span>
                  )
                })}
              </p>
            ) : null}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg">Pinned sheets</h2>
              <Link to="/pins" className="text-xs font-medium text-accent">
                All pins
              </Link>
            </div>
            {pinned.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Pin an entry from the{' '}
                <Link to="/cheatsheets" className="text-accent link-underline">
                  library
                </Link>{' '}
                and it appears here.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {pinned.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      to={`/cheatsheet/${entry.id}`}
                      className="flex items-center gap-2 text-sm text-muted hover:text-accent"
                    >
                      <Pin size={12} aria-hidden="true" />
                      <span className="truncate">{entry.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-lg">Optional streak</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Off by default. A streak measures activity, not progress. Missing a day is not a
              failure.
            </p>
            <div className="mt-3">
              <Toggle
                checked={state.streakEnabled}
                onChange={setStreakEnabled}
                label={state.streakEnabled ? `${streak}-day streak` : 'Show a streak'}
                description="Counts consecutive days with a saved quiz, note or proof."
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-lg">Your data</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Everything is local to this browser. Export before clearing site data.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={onExport}>
                <Download size={14} aria-hidden="true" />
                Export JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload size={14} aria-hidden="true" />
                Restore
              </Button>
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw size={14} aria-hidden="true" />
                Reset
              </Button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="sr-only"
              aria-label="Restore progress from a JSON export"
              onChange={(event) => void onImport(event.target.files?.[0])}
            />
            {dataMessage ? (
              <p role="status" className="mt-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-xs text-muted">
                {dataMessage}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3 border-t border-line pt-3 text-xs">
              <Link to="/notes" className="inline-flex items-center gap-1 text-accent">
                <BookOpen size={12} aria-hidden="true" />
                {plural(Object.keys(state.notes).length, 'note')}
              </Link>
              <Link to="/pins" className="inline-flex items-center gap-1 text-accent">
                <Pin size={12} aria-hidden="true" />
                {plural(Object.keys(state.pins).length, 'pin')}
              </Link>
              <Link to="/privacy" className="inline-flex items-center gap-1 text-accent">
                <CheckCircle2 size={12} aria-hidden="true" />
                What is stored
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="eyebrow mb-1">{label}</p>
      <p className="mono tabular text-xl text-ink">{value}</p>
    </div>
  )
}

function ReviewForm() {
  const state = useGuestState()
  const [shipped, setShipped] = useState(state.review?.shipped ?? '')
  const [blocked, setBlocked] = useState(state.review?.blocked ?? '')
  const [next, setNext] = useState(state.review?.next ?? '')
  const [saved, setSaved] = useState(false)

  function save() {
    saveReview({ shipped, blocked, next })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <Field label="What shipped?" htmlFor="review-shipped">
        <TextArea
          id="review-shipped"
          value={shipped}
          maxLength={500}
          onChange={(event) => setShipped(event.target.value)}
          placeholder="One merge, one test, one customer conversation."
          className="min-h-16"
        />
      </Field>
      <Field label="What blocked you?" htmlFor="review-blocked">
        <TextArea
          id="review-blocked"
          value={blocked}
          maxLength={500}
          onChange={(event) => setBlocked(event.target.value)}
          placeholder="The unclear part, not the whole week."
          className="min-h-16"
        />
      </Field>
      <Field label="Next action" htmlFor="review-next">
        <TextArea
          id="review-next"
          value={next}
          maxLength={500}
          onChange={(event) => setNext(event.target.value)}
          placeholder="Small enough to finish in one sitting."
          className="min-h-16"
        />
      </Field>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save}>
          Save review
        </Button>
        {saved ? (
          <span role="status" className="text-xs text-accent">
            Saved
          </span>
        ) : state.review ? (
          <span className="text-xs text-faint">
            Last saved {formatDate(state.review.updatedAt.slice(0, 10))}
          </span>
        ) : null}
      </div>
    </div>
  )
}
