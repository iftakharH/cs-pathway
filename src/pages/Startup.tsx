import { ArrowRight, CalendarDays, MessageSquare, ShieldAlert, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, Callout, SectionHeader } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { PhaseBadge } from '@/components/ui/Badge'
import { SourceChip } from '@/components/SourceChip'
import { phaseModules } from '@/lib/catalog'
import { getPhase } from '@/lib/phases'
import { formatHours } from '@/lib/format'

const nextSevenDays = [
  {
    title: 'List 20 people who have the problem',
    body: 'Names, roles, where to reach them. Not a market segment — people you could message this week.',
  },
  {
    title: 'Ask five what they did last time',
    body: 'The last time the problem happened, what did they do? Past behaviour beats a prediction about the future.',
  },
  {
    title: 'Write their exact words',
    body: 'One line each, in the interview log. Do not pitch yet. The words become your landing page and your pitch.',
  },
]

export default function Startup() {
  const phase = getPhase('S')
  const modules = phaseModules('S')

  return (
    <div className="container-page">
      <PageHeader
        title="Starting a company is a process, not a personality trait"
        lede={phase?.description}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Startup' }]}
        actions={<ButtonLink to="/tools">Open the tools</ButtonLink>}
      />

      <div className="grid gap-6 border-b border-line py-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-faint">Time</p>
          <p className="mono mt-1 text-lg text-ink">
            {phase ? formatHours(
              modules.reduce((total, module) => total + module.estHours.min, 0),
              modules.reduce((total, module) => total + module.estHours.max, 0),
            ) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-faint">Modules</p>
          <p className="mono mt-1 text-lg text-ink">{modules.length}</p>
        </div>
        <div>
          <p className="text-xs text-faint">The proof</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            20 conversations · 3 insights · 5 users
          </p>
        </div>
      </div>

      <section className="py-8">
        <div className="border-l-2 border-accent bg-accent-soft/60 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl">Three actions, no fundraising required</h2>
            </div>
            <CalendarDays size={22} className="text-accent" aria-hidden="true" />
          </div>
          <ol className="mt-5 grid gap-5 md:grid-cols-3">
            {nextSevenDays.map((action, index) => (
              <li key={action.title}>
                <p className="mono mb-1 text-[10px] text-accent">Action {index + 1}</p>
                <p className="text-sm font-medium text-ink">{action.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{action.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink to="/tools?tool=interviews" size="sm">
              <MessageSquare size={14} aria-hidden="true" />
              Open the interview log
            </ButtonLink>
            <ButtonLink to="/tools?tool=outreach" size="sm" variant="secondary">
              <Users size={14} aria-hidden="true" />
              Track outreach
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="py-8">
        <SectionHeader
          title="What this phase can and cannot do"
          lede="A path can teach the process. It cannot make a market want the product."
        />
        <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          <div>
            <p className="border-t border-ink pt-2 text-xs font-semibold text-accent">
              What it can do
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              <li>— Show the steps: customers, a small product, pricing, a 90-day plan.</li>
              <li>— Give you a place to record evidence instead of opinions.</li>
              <li>— Explain the arithmetic behind dilution, runway and unit economics.</li>
              <li>— State one honest risk per module.</li>
            </ul>
          </div>
          <div>
            <p className="border-t border-ink pt-2 text-xs font-semibold text-warn">
              What it cannot do
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              <li>— Promise that a company will succeed or raise money.</li>
              <li>— Replace a lawyer, accountant or tax authority.</li>
              <li>— Validate an idea for you. Only real customers can do that.</li>
              <li>— Make a founder’s life easy. It is still work with uncertainty.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-8">
        <SectionHeader
          title="Nine steps from a problem to a plan"
          lede="Each module has resources, a sourced quiz, a proof and one risk note. Start at S1 if you have not shipped to a user yet."
        />
        {modules.length > 0 ? (
          <div className="mt-6 border-t border-line">
            {modules.map((module) => (
              <Link
                key={module.id}
                to={`/module/${module.id}`}
                className="group grid gap-2 border-b border-line py-4 hover:text-accent md:grid-cols-[1fr_2fr_auto] md:items-baseline md:gap-6"
              >
                <div className="flex items-baseline gap-3">
                  <PhaseBadge phase="S" />
                  <h3 className="text-base leading-snug">{module.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {module.summary}
                </p>
                <span className="mono text-[10px] text-faint">
                  {module.estHours.min}–{module.estHours.max} h
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="border-y border-line py-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl sm:text-3xl">Worldwide numbers, dated and linked</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Venture capital is one path, not the default. These figures describe the global
              market and the conditions around it. They are not a target, and they do not predict
              what will happen to one company.
            </p>
            <div className="mt-5 border-t border-ink">
              <div className="border-b border-line py-4">
                <p className="text-sm font-medium text-ink">Global venture capital, Q3 2026</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  KPMG’s Venture Pulse reports $170.9 billion invested worldwide across 8,341 deals.
                  Investment cooled from an exceptional first half but stayed well above historical
                  norms. <SourceChip claimId="S1" />
                </p>
              </div>
              <div className="border-b border-line py-4">
                <p className="text-sm font-medium text-ink">What constrains the transition to a firm</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  GEM’s 2025/2026 Global Report draws on more than 160,000 responses across 53
                  economies. It names access to finance and entrepreneurial education as structural
                  constraints on startups becoming established businesses. <SourceChip claimId="S2" />
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <Link
                to="/sources"
                className="font-medium text-accent underline decoration-line underline-offset-4"
              >
                Every source and retrieval date
              </Link>
              <Link
                to="/claims"
                className="font-medium text-accent underline decoration-line underline-offset-4"
              >
                Claim explorer
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <Callout tone="warn" title="One honest risk for the whole phase">
              Most startups fail. Talking to customers reduces the chance of building something
              nobody wants; it does not remove the risk. Do not borrow money you cannot repay, and
              do not drop out of a degree on the strength of a single good conversation.
            </Callout>
            <div className="border-t border-line pt-4">
              <p className="text-xs font-semibold text-ink">The phase proof</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{phase?.proofSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink to="/tools?tool=interviews" size="sm" variant="secondary">
                  Interview log
                </ButtonLink>
                <ButtonLink to="/tools?tool=pitch" size="sm" variant="secondary">
                  One-page pitch
                </ButtonLink>
                <ButtonLink to="/tools?tool=plan-90" size="sm" variant="secondary">
                  90-day plan
                </ButtonLink>
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-faint">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              General information, not legal or financial advice. Company registration, tax and
              payment rules vary by jurisdiction and are not listed here. Check the official page
              for your jurisdiction and record the date.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl">Check that the problem is real, not that the idea is clever.</h2>
          </div>
          <ButtonLink to="/module/s1-should-i-start">
            Open S1
            <ArrowRight size={15} aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
