import { useState } from 'react'
import { CircleCheck, ExternalLink, Info } from 'lucide-react'
import type { Module } from '@/content/schema'
import { saveProof, setModuleStatus, useGuestState } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput } from '@/components/ui/Field'
import { cx } from '@/lib/format'

function isValidHttps(value: string): boolean {
  if (!value.trim()) return true
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

export function ProofWorkflow({ module }: { module: Module }) {
  const state = useGuestState()
  const previous = state.proofs[module.id]
  const status = state.progress[module.id]?.status
  const [rubric, setRubric] = useState<Record<string, number>>(previous?.selfRubric ?? {})
  const [repoUrl, setRepoUrl] = useState(previous?.repoUrl ?? '')
  const [demoUrl, setDemoUrl] = useState(previous?.demoUrl ?? '')
  const [notes, setNotes] = useState(previous?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const scoredCount = module.proof.rubric.filter(
    (criterion) => rubric[criterion.criterion] !== undefined,
  ).length
  const total = module.proof.rubric.reduce(
    (sum, criterion) => sum + (rubric[criterion.criterion] ?? 0),
    0,
  )
  const max = module.proof.rubric.length * 3

  function persist(markDone: boolean) {
    setError(null)
    setSaved(null)

    if (!isValidHttps(repoUrl) || !isValidHttps(demoUrl)) {
      setError('Links must be full https:// URLs. Leave a field empty if you do not have it.')
      return
    }
    if (markDone) {
      if (!repoUrl.trim() && !demoUrl.trim()) {
        setError('Add at least one link — a repository or a live demo — before marking the module done.')
        return
      }
      if (scoredCount < module.proof.rubric.length) {
        setError('Score every rubric criterion before marking the module done.')
        return
      }
    }

    saveProof(module.id, { repoUrl, demoUrl, selfRubric: rubric, notes })
    if (markDone) {
      setModuleStatus(module.id, 'done')
      setSaved('Proof saved and module marked done.')
    } else {
      setSaved('Proof draft saved.')
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl">{module.proof.title}</h2>
      </div>

      {status === 'done' ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2.5 text-sm text-ink">
          <CircleCheck size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          You marked this module done. The proof stays editable if you improve it.
        </div>
      ) : null}

      <div className="card p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-muted">{module.proof.brief}</p>
        <p className="mt-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
          <span className="font-medium text-ink">What a reviewer looks for:</span>{' '}
          {module.proof.evidence}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Score yourself against the rubric</h3>
            <span className="mono text-[10px] uppercase tracking-wider text-faint">
              {total}/{max} · self-scored
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[46rem] text-left text-xs">
              <caption className="sr-only">
                Rubric for {module.proof.title}. Choose a level from 0 to 3 for each criterion.
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  <th scope="col" className="w-40 px-3 py-2 font-medium text-muted">
                    Criterion
                  </th>
                  {['0', '1', '2', '3'].map((level) => (
                    <th key={level} scope="col" className="px-3 py-2 font-medium text-muted">
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {module.proof.rubric.map((criterion) => (
                  <tr key={criterion.criterion} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-3 align-top font-medium text-ink">
                      {criterion.criterion}
                    </th>
                    {([0, 1, 2, 3] as const).map((level) => {
                      const selected = rubric[criterion.criterion] === level
                      return (
                        <td key={level} className="px-2 py-2 align-top">
                          <label
                            className={cx(
                              'flex h-full cursor-pointer gap-2 rounded-md border p-2 leading-snug',
                              selected
                                ? 'border-accent bg-accent-soft text-ink'
                                : 'border-transparent text-muted hover:border-line',
                            )}
                          >
                            <input
                              type="radio"
                              name={`rubric-${module.id}-${criterion.criterion}`}
                              checked={selected}
                              onChange={() =>
                                setRubric((current) => ({
                                  ...current,
                                  [criterion.criterion]: level,
                                }))
                              }
                              className="mt-0.5 accent-[var(--accent)]"
                            />
                            <span>{criterion.levels[level]}</span>
                          </label>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-faint">
            {scoredCount}/{module.proof.rubric.length} criteria scored. Self-scoring is not
            verification; it is a record of what you can defend.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Repository URL"
            htmlFor={`repo-${module.id}`}
            hint="https:// only. Leave empty if the proof is not code."
          >
            <TextInput
              id={`repo-${module.id}`}
              type="url"
              inputMode="url"
              placeholder="https://github.com/you/project"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              aria-describedby={`repo-${module.id}-hint`}
            />
          </Field>
          <Field
            label="Live demo URL"
            htmlFor={`demo-${module.id}`}
            hint="A link a reviewer can open without installing anything."
          >
            <TextInput
              id={`demo-${module.id}`}
              type="url"
              inputMode="url"
              placeholder="https://your-demo.vercel.app"
              value={demoUrl}
              onChange={(event) => setDemoUrl(event.target.value)}
              aria-describedby={`demo-${module.id}-hint`}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="What should a reviewer know?"
            htmlFor={`proof-notes-${module.id}`}
            hint="Trade-offs, what broke, what you would do next. Up to 3,000 characters."
          >
            <TextArea
              id={`proof-notes-${module.id}`}
              value={notes}
              maxLength={3000}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="One paragraph on the decisions and the evidence."
            />
          </Field>
        </div>

        {error ? (
          <p role="alert" className="mt-3 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p role="status" className="mt-3 rounded-md border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-ink">
            {saved}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => persist(true)}>Save and mark done</Button>
          <Button variant="secondary" onClick={() => persist(false)}>
            Save draft
          </Button>
          {status === 'done' ? (
            <Button variant="ghost" onClick={() => setModuleStatus(module.id, 'in_progress')}>
              Reopen module
            </Button>
          ) : null}
        </div>

        {previous ? (
          <p className="mt-3 text-[11px] text-faint">
            Saved {formatDate(previous.createdAt.slice(0, 10))}. Editing and saving replaces the
            previous version.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-muted">
        <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Nothing here is sent to a server. The links and self-scores stay in this browser, and you
          can export them. A reviewer — a mentor, a hiring manager, you in six months — is the real
          check, not this form.
        </p>
      </div>

      {previous?.repoUrl || previous?.demoUrl ? (
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          {previous.repoUrl ? (
            <a
              href={previous.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-accent link-underline"
            >
              Your repository
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          ) : null}
          {previous.demoUrl ? (
            <a
              href={previous.demoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-accent link-underline"
            >
              Your demo
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
