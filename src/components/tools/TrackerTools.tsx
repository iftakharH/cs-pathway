import { useState } from 'react'
import { Download, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/Field'
import { downloadFile, toCsv } from '@/lib/format'
import { ToolPanel, useToolState } from './shared'

type InterviewEntry = {
  id: string
  date: string
  person: string
  role: string
  problem: string
  quote: string
  insight: string
}

type OutreachEntry = {
  id: string
  name: string
  channel: string
  status: string
  nextDate: string
  notes: string
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const interviewPrompts = [
  'What did you do the last time this problem came up?',
  'What did that cost you — time, money, or attention?',
  'What have you already tried, and why did it stop working?',
  'Who else deals with this?',
  'If this disappeared tomorrow, what would you do instead?',
]

function todayInput(): string {
  return new Date().toISOString().slice(0, 10)
}

export function InterviewTool() {
  const [data, setData] = useToolState<{ entries: InterviewEntry[] }>('interviews', { entries: [] })
  const [form, setForm] = useState<Omit<InterviewEntry, 'id'>>({
    date: todayInput(),
    person: '',
    role: '',
    problem: '',
    quote: '',
    insight: '',
  })
  const [error, setError] = useState<string | null>(null)

  function add() {
    if (!form.person.trim() || !form.problem.trim()) {
      setError('Add at least a name and the problem in their words.')
      return
    }
    setError(null)
    setData({ entries: [{ ...form, id: newId() }, ...data.entries] })
    setForm({ date: todayInput(), person: '', role: '', problem: '', quote: '', insight: '' })
  }

  const withInsight = data.entries.filter((entry) => entry.insight.trim()).length

  return (
    <ToolPanel
      title="Customer interview log"
      description="Record what people did, not what they said they would do. The goal is 20 conversations and a small number of insights you can defend."
      note="Treat quotes as data from one person, not proof of a market. Remove names if you would not want them published."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date" htmlFor="interview-date">
          <TextInput
            id="interview-date"
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />
        </Field>
        <Field label="Person" htmlFor="interview-person">
          <TextInput
            id="interview-person"
            value={form.person}
            onChange={(event) => setForm({ ...form, person: event.target.value })}
            placeholder="First name or initials"
          />
        </Field>
        <Field label="Role or context" htmlFor="interview-role">
          <TextInput
            id="interview-role"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            placeholder="Final-year student, freelance designer…"
          />
        </Field>
        <Field label="Problem in their words" htmlFor="interview-problem">
          <TextInput
            id="interview-problem"
            value={form.problem}
            onChange={(event) => setForm({ ...form, problem: event.target.value })}
            placeholder="I lose track of which invoice is overdue"
          />
        </Field>
      </div>
      <div className="mt-3 grid gap-3">
        <Field label="Exact quote" htmlFor="interview-quote" hint="Use their words, not your summary.">
          <TextInput
            id="interview-quote"
            value={form.quote}
            onChange={(event) => setForm({ ...form, quote: event.target.value })}
          />
        </Field>
        <Field label="Insight" htmlFor="interview-insight" hint="What changed in your understanding?">
          <TextArea
            id="interview-insight"
            value={form.insight}
            onChange={(event) => setForm({ ...form, insight: event.target.value })}
            className="min-h-16"
          />
        </Field>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={add}>
          <Plus size={14} aria-hidden="true" />
          Add conversation
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={data.entries.length === 0}
          onClick={() =>
            downloadFile(
              'interviews.csv',
              toCsv(
                data.entries.map((entry) => ({
                  date: entry.date,
                  person: entry.person,
                  role: entry.role,
                  problem: entry.problem,
                  quote: entry.quote,
                  insight: entry.insight,
                })),
              ),
              'text/csv',
            )
          }
        >
          <Download size={14} aria-hidden="true" />
          Export CSV
        </Button>
        <span className="mono text-[10px] uppercase tracking-wider text-faint">
          {data.entries.length} conversations · {withInsight} with insights
        </span>
      </div>

      {data.entries.length > 0 ? (
        <ul className="mt-5 divide-y divide-line border-t border-line">
          {data.entries.map((entry) => (
            <li key={entry.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {entry.person}
                    {entry.role ? <span className="font-normal text-muted"> · {entry.role}</span> : null}
                  </p>
                  <p className="mono mt-0.5 text-[10px] text-faint">{entry.date}</p>
                  <p className="mt-1.5 text-sm text-muted">{entry.problem}</p>
                  {entry.quote ? <p className="mt-1 border-l-2 border-line pl-2 text-xs italic text-muted">“{entry.quote}”</p> : null}
                  {entry.insight ? <p className="mt-1 text-xs text-accent">Insight: {entry.insight}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => setData({ entries: data.entries.filter((item) => item.id !== entry.id) })}
                  className="shrink-0 rounded p-2 text-faint hover:text-danger"
                  aria-label={`Delete conversation with ${entry.person}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 rounded-lg border border-line bg-surface-2/60 p-3">
        <p className="eyebrow mb-2">Questions that avoid false praise</p>
        <ul className="space-y-1 text-xs leading-relaxed text-muted">
          {interviewPrompts.map((prompt) => (
            <li key={prompt}>— {prompt}</li>
          ))}
        </ul>
      </div>
    </ToolPanel>
  )
}

const statuses = ['To contact', 'Contacted', 'Replied', 'Call booked', 'Closed']

export function OutreachTool() {
  const [data, setData] = useToolState<{ entries: OutreachEntry[] }>('outreach', { entries: [] })
  const [form, setForm] = useState<Omit<OutreachEntry, 'id'>>({
    name: '',
    channel: '',
    status: 'To contact',
    nextDate: '',
    notes: '',
  })

  function add() {
    if (!form.name.trim()) return
    setData({ entries: [{ ...form, id: newId() }, ...data.entries] })
    setForm({ name: '', channel: '', status: 'To contact', nextDate: '', notes: '' })
  }

  function update(id: string, patch: Partial<OutreachEntry>) {
    setData({ entries: data.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) })
  }

  const counts = statuses.map((status) => ({
    status,
    count: data.entries.filter((entry) => entry.status === status).length,
  }))

  return (
    <ToolPanel
      title="Outreach tracker"
      description="A small list beats a big list you never update. Add the person, the channel and the next date, then close the loop."
      note="Do not send automated bulk messages. A short, specific message that shows you read their work will outperform volume."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" htmlFor="outreach-name">
          <TextInput
            id="outreach-name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Person or company"
          />
        </Field>
        <Field label="Channel" htmlFor="outreach-channel">
          <TextInput
            id="outreach-channel"
            value={form.channel}
            onChange={(event) => setForm({ ...form, channel: event.target.value })}
            placeholder="Email, LinkedIn, community…"
          />
        </Field>
        <Field label="Status" htmlFor="outreach-status">
          <SelectInput
            id="outreach-status"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Next follow-up" htmlFor="outreach-next">
          <TextInput
            id="outreach-next"
            type="date"
            value={form.nextDate}
            onChange={(event) => setForm({ ...form, nextDate: event.target.value })}
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Notes" htmlFor="outreach-notes">
          <TextArea
            id="outreach-notes"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="min-h-16"
            placeholder="What you asked, what they said, what happens next."
          />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={add}>
          <Plus size={14} aria-hidden="true" />
          Add contact
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={data.entries.length === 0}
          onClick={() => downloadFile('outreach.csv', toCsv(data.entries), 'text/csv')}
        >
          <Download size={14} aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {counts.map((item) => (
          <span
            key={item.status}
            className="mono rounded border border-line bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted"
          >
            {item.status}: {item.count}
          </span>
        ))}
      </div>

      {data.entries.length > 0 ? (
        <>
          <ul className="mt-4 space-y-2 sm:hidden">
            {data.entries.map((entry) => (
              <li key={entry.id} className="border-t border-line pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{entry.name}</p>
                    <p className="text-xs text-muted">{entry.channel || 'No channel'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setData({ entries: data.entries.filter((item) => item.id !== entry.id) })}
                    className="shrink-0 rounded p-2 text-faint hover:text-danger"
                    aria-label={`Delete ${entry.name}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    value={entry.status}
                    onChange={(event) => update(entry.id, { status: event.target.value })}
                    aria-label={`Status for ${entry.name}`}
                    className="min-h-9 rounded border border-line bg-surface px-2 text-xs text-ink"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <span className="mono text-[10px] text-faint">
                    {entry.nextDate ? `Next ${entry.nextDate}` : 'No follow-up date'}
                  </span>
                </div>
                {entry.notes ? <p className="mt-1.5 text-xs text-muted">{entry.notes}</p> : null}
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-faint">
                <th scope="col" className="py-2 pr-3 font-medium">Name</th>
                <th scope="col" className="px-3 py-2 font-medium">Channel</th>
                <th scope="col" className="px-3 py-2 font-medium">Status</th>
                <th scope="col" className="px-3 py-2 font-medium">Next</th>
                <th scope="col" className="px-3 py-2 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id} className="border-b border-line last:border-0">
                  <td className="py-2 pr-3 text-ink">{entry.name}</td>
                  <td className="px-3 py-2 text-muted">{entry.channel || '—'}</td>
                  <td className="px-3 py-2">
                    <select
                      value={entry.status}
                      onChange={(event) => update(entry.id, { status: event.target.value })}
                      aria-label={`Status for ${entry.name}`}
                      className="min-h-9 rounded border border-line bg-surface px-2 text-xs text-ink"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="mono px-3 py-2 text-xs text-muted">{entry.nextDate || '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setData({ entries: data.entries.filter((item) => item.id !== entry.id) })}
                      className="rounded p-2 text-faint hover:text-danger"
                      aria-label={`Delete ${entry.name}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      ) : null}
    </ToolPanel>
  )
}
