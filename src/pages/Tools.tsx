import { Link, useSearchParams } from 'react-router-dom'
import { Calculator, ChartNoAxesCombined, MessageSquare, Send, FileSignature, CalendarRange, Info, ArrowRight } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { DilutionTool, PricingTool, RunwayTool, UnitEconomicsTool } from '@/components/tools/FinanceTools'
import { InterviewTool, OutreachTool } from '@/components/tools/TrackerTools'
import { PitchTool, Plan90Tool } from '@/components/tools/PitchTools'
import { cx } from '@/lib/format'

const tools = [
  { id: 'dilution', label: 'Dilution', Icon: Calculator },
  { id: 'runway', label: 'Runway', Icon: CalendarRange },
  { id: 'pricing', label: 'Pricing', Icon: ChartNoAxesCombined },
  { id: 'unit-economics', label: 'Unit economics', Icon: ChartNoAxesCombined },
  { id: 'interviews', label: 'Interview log', Icon: MessageSquare },
  { id: 'outreach', label: 'Outreach', Icon: Send },
  { id: 'pitch', label: 'Pitch', Icon: FileSignature },
  { id: 'plan-90', label: '90-day plan', Icon: CalendarRange },
]

export default function Tools() {
  const [params, setParams] = useSearchParams()
  const active = params.get('tool') ?? 'dilution'

  return (
    <div className="container-page">
      <PageHeader
        title="Numbers and conversations, in one place"
        lede="These tools work without an account and save in this browser. They are calculators and logs, not advice, and they do not promise an outcome."
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Startup', to: '/startup' },
          { label: 'Tools' },
        ]}
        actions={
          <Link to="/startup" className="inline-flex items-center gap-1 text-sm font-medium text-accent">
            Startup phase
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Tools" className="min-w-0 no-print">
          <ul className="flex min-w-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {tools.map((tool) => (
              <li key={tool.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setParams({ tool: tool.id }, { replace: true })}
                  className={cx(
                    'flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 text-sm',
                    active === tool.id
                      ? 'border-accent bg-accent-soft text-ink'
                      : 'border-line bg-surface text-muted hover:text-ink',
                  )}
                  aria-current={active === tool.id ? 'page' : undefined}
                >
                  <tool.Icon size={15} aria-hidden="true" />
                  {tool.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {active === 'dilution' ? <DilutionTool /> : null}
          {active === 'runway' ? <RunwayTool /> : null}
          {active === 'pricing' ? <PricingTool /> : null}
          {active === 'unit-economics' ? <UnitEconomicsTool /> : null}
          {active === 'interviews' ? <InterviewTool /> : null}
          {active === 'outreach' ? <OutreachTool /> : null}
          {active === 'pitch' ? <PitchTool /> : null}
          {active === 'plan-90' ? <Plan90Tool /> : null}

          <div className="mt-6 space-y-3">
            <Callout tone="warn" title="General information, not legal or financial advice">
              Tax, company registration and cross-border payment rules depend on your jurisdiction
              and change. Check the official page for your country and date it. This site does not
              list a provider or a fee until that check is done.
            </Callout>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-faint">
              <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Tools save to this browser after a short delay. Use the dashboard to export all data
              as JSON before clearing site storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
