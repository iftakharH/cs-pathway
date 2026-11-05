import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, TextArea } from '@/components/ui/Field'
import { ToolPanel, useToolState } from './shared'

type Pitch = {
  problem: string
  customer: string
  insight: string
  solution: string
  evidence: string
  business: string
  ask: string
}

const emptyPitch: Pitch = {
  problem: '',
  customer: '',
  insight: '',
  solution: '',
  evidence: '',
  business: '',
  ask: '',
}

const pitchFields: Array<{ key: keyof Pitch; label: string; hint: string }> = [
  { key: 'problem', label: 'The problem', hint: 'One sentence a customer would recognise.' },
  { key: 'customer', label: 'Who has it', hint: 'The narrow group, not "everyone".' },
  { key: 'insight', label: 'What you learned', hint: 'The non-obvious thing from customer conversations.' },
  { key: 'solution', label: 'What you built', hint: 'The smallest thing that changes the workflow.' },
  { key: 'evidence', label: 'Evidence', hint: 'Usage, payment, a repeated behaviour. Not a compliment.' },
  { key: 'business', label: 'How it makes money', hint: 'Who pays, how much, how often.' },
  { key: 'ask', label: 'The ask', hint: 'Intro, advice, pilot, or money — be specific.' },
]

export function PitchTool() {
  const [pitch, setPitch] = useToolState<Pitch>('pitch', emptyPitch)

  return (
    <ToolPanel
      title="One-page pitch"
      description="Seven blocks that fit on one page. Write the version you would send to a busy person, not the deck you would present."
      note="No projections, no invented market size, no logos you do not have permission to use. If an evidence block is empty, leave it empty and say what you are testing."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 no-print">
          {pitchFields.map((field) => (
            <Field key={field.key} label={field.label} htmlFor={`pitch-${field.key}`} hint={field.hint}>
              <TextArea
                id={`pitch-${field.key}`}
                value={pitch[field.key]}
                onChange={(event) => setPitch({ ...pitch, [field.key]: event.target.value })}
                className="min-h-16"
              />
            </Field>
          ))}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2 no-print">
            <p className="eyebrow">Preview</p>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" />
              Print
            </Button>
          </div>
          <article className="rounded-lg border border-line bg-surface p-5">
            <p className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-faint">
              One-page pitch
            </p>
            <div className="space-y-3">
              {pitchFields.map((field) => (
                <div key={field.key}>
                  <p className="eyebrow mb-0.5">{field.label}</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {pitch[field.key].trim() || <span className="text-faint">Not written yet.</span>}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </ToolPanel>
  )
}

type Plan90 = {
  goal30: string
  goal60: string
  goal90: string
  weekly: [string, string, string]
}

const emptyPlan: Plan90 = {
  goal30: '',
  goal60: '',
  goal90: '',
  weekly: ['', '', ''],
}

export function Plan90Tool() {
  const [plan, setPlan] = useToolState<Plan90>('plan-90', emptyPlan)

  return (
    <ToolPanel
      title="90-day plan"
      description="Three outcomes and three recurring actions. The actions are what you do on a normal Tuesday, not a launch day."
      note="A plan is a hypothesis. If the first 30 days disprove it, change the plan rather than defending it."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 no-print">
          <Field label="By day 30" htmlFor="plan-30" hint="One outcome you can verify.">
            <TextArea
              id="plan-30"
              value={plan.goal30}
              onChange={(event) => setPlan({ ...plan, goal30: event.target.value })}
              className="min-h-16"
            />
          </Field>
          <Field label="By day 60" htmlFor="plan-60" hint="What must be true to keep going.">
            <TextArea
              id="plan-60"
              value={plan.goal60}
              onChange={(event) => setPlan({ ...plan, goal60: event.target.value })}
              className="min-h-16"
            />
          </Field>
          <Field label="By day 90" htmlFor="plan-90" hint="The decision this quarter is buying you.">
            <TextArea
              id="plan-90"
              value={plan.goal90}
              onChange={(event) => setPlan({ ...plan, goal90: event.target.value })}
              className="min-h-16"
            />
          </Field>
          <div>
            <p className="eyebrow mb-2">Weekly actions</p>
            <div className="space-y-2">
              {plan.weekly.map((action, index) => (
                <Field key={index} label={`Action ${index + 1}`} htmlFor={`plan-weekly-${index}`}>
                  <TextArea
                    id={`plan-weekly-${index}`}
                    value={action}
                    onChange={(event) => {
                      const weekly = [...plan.weekly] as Plan90['weekly']
                      weekly[index] = event.target.value
                      setPlan({ ...plan, weekly })
                    }}
                    className="min-h-12"
                  />
                </Field>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2 no-print">
            <p className="eyebrow">Preview</p>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" />
              Print
            </Button>
          </div>
          <article className="rounded-lg border border-line bg-surface p-5">
            <p className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-faint">90-day plan</p>
            <ol className="space-y-3">
              {([
                ['30', plan.goal30],
                ['60', plan.goal60],
                ['90', plan.goal90],
              ] as const).map(([day, value]) => (
                <li key={day}>
                  <p className="eyebrow mb-0.5">Day {day}</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {value.trim() || <span className="text-faint">Not written yet.</span>}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-4 border-t border-line pt-3">
              <p className="eyebrow mb-1">Every week</p>
              <ul className="space-y-1 text-sm text-muted">
                {plan.weekly.map((action, index) => (
                  <li key={index}>{action.trim() || `Action ${index + 1} not written yet.`}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </ToolPanel>
  )
}
