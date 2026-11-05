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
        kicker="Phase S · from idea to customers"
        title="Starting a company is a process, not a personality trait"
        lede={phase?.description}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Startup' }]}
        actions={<ButtonLink to="/tools">Open the tools</ButtonLink>}
      />

      <div className="grid gap-4 py-6 sm:grid-cols-3">
        <div className="card p-4">
          <p className="eyebrow mb-1">Time</p>
          <p className="mono text-lg text-ink">
            {phase ? formatHours(
              modules.reduce((total, module) => total + module.estHours.min, 0),
              modules.reduce((total, module) => total + module.estHours.max, 0),
            ) : '—'}
          </p>
        </div>
        <div className="card p-4">
          <p className="eyebrow mb-1">Modules</p>
          <p className="mono text-lg text-ink">{modules.length}</p>
        </div>
        <div className="card p-4">
          <p className="eyebrow mb-1">The proof</p>
          <p className="text-xs leading-relaxed text-muted">20 conversations · 3 insights · 5 users</p>
        </div>
      </div>

      <section className="py-6">
        <div className="rounded-xl border border-accent/30 bg-accent-soft p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-1">Your next 7 days</p>
              <h2 className="text-2xl">Three actions, no fundraising required</h2>
            </div>
            <CalendarDays size={22} className="text-accent" aria-hidden="true" />
          </div>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {nextSevenDays.map((action, index) => (
              <li key={action.title}>
                <p className="mono mb-1 text-[10px] uppercase tracking-wider text-accent">
                  Action {index + 1}
                </p>
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
          eyebrow="The honest version"
          title="What this phase can and cannot do"
          lede="A path can teach the process. It cannot make a market want the product."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="eyebrow mb-2 text-accent">What it can do</p>
            <ul className="space-y-2 text-sm leading-relaxed text-muted">
              <li>— Show the steps: customers, a small product, pricing, a 90-day plan.</li>
              <li>— Give you a place to record evidence instead of opinions.</li>
              <li>— Explain the arithmetic behind dilution, runway and unit economics.</li>
              <li>— State one honest risk per module.</li>
            </ul>
          </div>
          <div className="card p-5">
            <p className="eyebrow mb-2 text-warn">What it cannot do</p>
            <ul className="space-y-2 text-sm leading-relaxed text-muted">
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
          eyebrow="Modules"
          title="Nine steps from a problem to a plan"
          lede="Each module has resources, a sourced quiz, a proof and one risk note. Start at S1 if you have not shipped to a user yet."
        />
        {modules.length > 0 ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module.id}
                to={`/module/${module.id}`}
                className="card flex h-full flex-col p-4 hover:border-accent"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <PhaseBadge phase="S" />
                  <span className="mono text-[10px] text-faint">
                    {module.estHours.min}–{module.estHours.max} h
                  </span>
                </div>
                <h3 className="text-base leading-snug">{module.title}</h3>
                <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-muted">
                  {module.summary}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  Open
                  <ArrowRight size={12} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="border-y border-line py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow mb-3">Funding, without the hype</p>
            <h2 className="text-2xl sm:text-3xl">Two verified examples, not a promise</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Most companies do not raise venture capital. If you do, the terms matter more than the
              headline amount. These records are dated and linked; check the official page before
              relying on a number.
            </p>
            <div className="mt-5 space-y-3">
              <div className="card p-4">
                <p className="text-sm font-medium text-ink">Y Combinator standard deal</p>
                <p className="mt-1 text-sm text-muted">
                  $500,000: $125,000 on a post-money SAFE for 7%, plus $375,000 on an uncapped MFN
                  SAFE. YC's example converts the $375,000 at a $15M cap to 2.5%.{' '}
                  <SourceChip claimId="S1" />
                </p>
              </div>
              <div className="card p-4">
                <p className="text-sm font-medium text-ink">Startup Bangladesh Limited</p>
                <p className="mt-1 text-sm text-muted">
                  A government-backed venture capital company. On 9 June 2026 the ICT Minister told
                  Parliament it had invested about Tk 109 crore in 36 approved startups.
                  <span className="ml-1 inline-flex gap-1">
                    <SourceChip claimId="S2" />
                    <SourceChip claimId="S3" />
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Callout tone="warn" title="One honest risk for the whole phase">
              Most startups fail. Talking to customers reduces the chance of building something
              nobody wants; it does not remove the risk. Do not borrow money you cannot repay, and
              do not drop out of a degree on the strength of a single good conversation.
            </Callout>
            <div className="card p-5">
              <p className="eyebrow mb-2">The phase proof</p>
              <p className="text-sm leading-relaxed text-ink">{phase?.proofSummary}</p>
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
              payment rules are jurisdiction-specific and are not listed here until each official
              page has been checked and dated.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Before you start</p>
            <h2 className="text-2xl">Check that the problem is real, not that the idea is clever.</h2>
          </div>
          <ButtonLink to="/module/s1-should-i-start">Open S1</ButtonLink>
        </div>
      </section>
    </div>
  )
}
