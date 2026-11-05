import { ArrowRight, BookOpen, Check, Map, ShieldCheck, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/Section'
import { CodeBlock } from '@/components/CodeBlock'
import { SourceChip } from '@/components/SourceChip'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'
import { TRENDS as trends } from '@/content/generated/trends'
import { featuredCheat, moduleSummaries, phaseHours, phaseModules } from '@/lib/catalog'
import { phases } from '@/lib/phases'
import { formatHours, plural } from '@/lib/format'
import { nextUnfinishedModule } from '@/lib/planner'
import { useGuestState } from '@/lib/store'

export default function Home() {
  const state = useGuestState()
  const startPhase = state.placement?.recommendedPhase ?? 'F'
  const next =
    nextUnfinishedModule(moduleSummaries, state.progress, startPhase) ?? moduleSummaries[0]
  const sample = featuredCheat
  const counts = manifest.counts

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-page relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              A source-verified path into software and AI · 2027
            </p>
            <h1 className="max-w-3xl text-[2.6rem] leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[4.15rem]">
              Stop collecting tutorials.
              <br />
              Start <span className="text-accent">proving</span> you can build.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Tell us your level and weekly hours. Get a step-by-step path, cheatsheets tested in
              CI, and a proof project at the end of every phase — with a source behind every claim.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/start" size="lg">
                Find my starting point
                <ArrowRight size={17} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/cheatsheets" size="lg" variant="secondary">
                Browse cheatsheets
              </ButtonLink>
            </div>
            <p className="mono mt-4 text-[10px] uppercase tracking-wider text-faint">
              3 minutes · no account · works in this browser
            </p>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-5">
              <Stat value={counts.cheatsheets} label="tested cheatsheets" />
              <Stat value={counts.claims} label="claims with sources" />
              <Stat value={counts.sources} label="primary sources" />
              <Stat value={manifest.quizCount} label="sourced questions" />
            </dl>
          </div>

          <div className="relative">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <p className="eyebrow">The path</p>
                  <p className="mt-1 text-sm text-muted">Five phases. One proof each.</p>
                </div>
                <span className="mono text-[10px] text-faint">
                  {counts.modules} modules
                </span>
              </div>
              <ol className="divide-y divide-line">
                {phases.map((phase, index) => {
                  const isCurrent = phase.id === startPhase
                  const hours = phaseHours(phase.id)
                  const count = phaseModules(phase.id).length
                  return (
                    <li key={phase.id}>
                      <Link
                        to={`/phase/${phase.id}`}
                        className={`group flex items-center gap-4 px-5 py-3.5 transition-colors ${
                          isCurrent ? 'bg-accent-soft' : 'hover:bg-surface-2'
                        }`}
                      >
                        <span
                          className={`mono flex h-8 w-8 shrink-0 items-center justify-center rounded border text-[11px] font-semibold ${
                            isCurrent
                              ? 'border-accent bg-accent text-accent-ink'
                              : 'border-line bg-surface text-muted'
                          }`}
                        >
                          {phase.id}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-ink">{phase.name}</span>
                            {isCurrent ? (
                              <span className="mono shrink-0 text-[9px] uppercase tracking-wider text-accent">
                                start here
                              </span>
                            ) : null}
                          </span>
                          <span className="mono block text-[10px] text-faint">
                            {count} modules · {formatHours(hours.min, hours.max)}
                          </span>
                        </span>
                        <span className="mono shrink-0 text-[10px] text-faint">0{index + 1}</span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
              <div className="border-t border-line px-5 py-3">
                <p className="text-xs leading-relaxed text-muted">
                  Every phase ends with something you can show a person, not a certificate.
                </p>
              </div>
            </div>
            {next ? (
              <Link
                to={`/module/${next.id}`}
                className="card mt-3 flex items-center gap-3 px-5 py-3.5 hover:border-accent"
              >
                <Target size={17} className="shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block">Your next step</span>
                  <span className="block truncate text-sm font-medium text-ink">{next.title}</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-faint" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeader
          eyebrow="Three things, one system"
          title="A roadmap, a tracker and a cheatsheet library that agree with each other"
          lede="Most study plans are a list of links. This one connects the plan to the work, the work to a proof, and every factual claim to a source."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Feature
            icon={<Map size={19} aria-hidden="true" />}
            title="A plan you can start today"
            body="A placement check sets your first module. A planner turns your weekly hours into a week-by-week schedule and recalculates as you finish work."
            to="/start"
            link="Take the placement check"
          />
          <Feature
            icon={<Target size={19} aria-hidden="true" />}
            title="Progress measured by proof"
            body="Phase progress counts quizzes and submitted proofs, not page views. Every module ends with a brief and a rubric you score yourself against."
            to="/dashboard"
            link="See the dashboard"
          />
          <Feature
            icon={<BookOpen size={19} aria-hidden="true" />}
            title="Cheatsheets for the job"
            body="One task per entry, one to three snippets, a version stamp and a link to the official docs section it came from. Copy it, print it, pin it."
            to="/cheatsheets"
            link="Open the library"
          />
        </div>
      </section>

      <section className="border-y border-line bg-surface/50">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow mb-3">Sample entry</p>
            <h2 className="text-3xl sm:text-4xl">Specific enough to use on a bad day</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              No essays. Each entry answers one question: when you need to do this, run that. The
              code is short, the gotchas are real, and the source link points at the docs section
              the entry was checked against.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'Version-stamped and dated',
                'Copy button on every snippet',
                'Runnable examples executed in CI',
                'Print-friendly, A4, two columns',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink to="/cheatsheet/git-undo" variant="secondary">
                Open this entry
                <ArrowRight size={15} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          {sample ? (
            <div className="card overflow-hidden p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="eyebrow mb-1">{sample.topic}</p>
                  <h3 className="text-xl">{sample.title}</h3>
                </div>
                <span className="mono rounded border border-line bg-surface-2 px-2 py-1 text-[10px] text-muted">
                  {sample.tool.name} {sample.tool.version}
                </span>
              </div>
              <p className="mb-4 text-sm text-muted">{sample.whenToUse}</p>
              <CodeBlock
                code={sample.snippets[0]?.code ?? ''}
                lang={sample.snippets[0]?.lang ?? 'bash'}
                caption={sample.snippets[0]?.caption}
                compact
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <span className="mono text-[10px] text-faint">
                  Checked {sample.tool.verifiedOn}
                </span>
                <a
                  href={sample.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs font-medium text-accent link-underline"
                >
                  Official docs
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow mb-3">Trust, by construction</p>
            <h2 className="text-3xl sm:text-4xl">If we cannot link it, it is not here</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              Every statistic and specification is a claim with a source record. The build fails
              when a claim has no primary source. Forecasts are labelled as forecasts, and claims
              past their review date show a warning instead of quietly staying up.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink to="/methodology" variant="secondary" size="sm">
                Read the methodology
              </ButtonLink>
              <ButtonLink to="/sources" variant="ghost" size="sm">
                See the sources
              </ButtonLink>
            </div>
          </div>

          <div className="card divide-y divide-line">
            <div className="flex items-start gap-3 p-4">
              <span className="mt-0.5 rounded border border-accent/30 bg-accent-soft p-1.5 text-accent">
                <ShieldCheck size={15} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">A claim you can check</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  SQL passed HTML/CSS as the second most-used language in the 2026 Stack Overflow
                  survey.
                  <span className="ml-1.5 inline-flex align-baseline">
                    <SourceChip claimId="C5" />
                  </span>
                </p>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              <LabelRow label="Observed data" note="Survey, dataset" />
              <LabelRow label="Official docs" note="Spec, pricing" />
              <LabelRow label="Editorial" note="Opinion, labelled" />
            </div>
            <div className="p-4">
              <p className="text-xs leading-relaxed text-faint">
                {plural(counts.claims, 'claim')} across {plural(counts.sources, 'source')}. No
                analytics, no tracking cookies, no third-party scripts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/50">
        <div className="container-page py-16 sm:py-20">
          <SectionHeader
            eyebrow="2026 → 2027"
            title="What changed, and what is still uncertain"
            lede="Three levels: what was observed in 2026, what is emerging, and what is only a forecast. We only publish a forecast when a named institution made it and said what would prove it wrong."
            action={
              <ButtonLink to="/trends" variant="secondary" size="sm">
                Read the trends
              </ButtonLink>
            }
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {trends.slice(0, 3).map((trend) => (
              <article key={trend.id} className="card p-5">
                <p className="mono mb-3 inline-flex rounded border border-line bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
                  {trend.level === 'observed' ? 'Observed' : 'Emerging'}
                </p>
                <h3 className="text-lg leading-snug">{trend.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">{trend.body}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trend.claimIds.map((id) => (
                    <SourceChip key={id} claimId={id} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-8 rounded-xl border border-line bg-ink p-7 text-bg sm:p-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="mono mb-3 text-[10px] uppercase tracking-[0.14em] opacity-70">
              The last phase
            </p>
            <h2 className="text-3xl text-bg sm:text-4xl">The goal is not to finish a path. It is to build something people use.</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-75">
              The startup phase turns the skills into a process: talk to customers, ship a small
              product, price it, and understand the money. Every module states one honest risk.
              Nothing here promises an outcome.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <ButtonLink to="/startup" size="md" className="bg-bg text-ink hover:bg-bg/90">
              Explore the startup phase
            </ButtonLink>
            <ButtonLink
              to="/tools"
              size="md"
              variant="ghost"
              className="text-bg hover:bg-white/10"
            >
              Open the tools
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-line pt-10 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow mb-2">Start small</p>
            <h2 className="text-2xl sm:text-3xl">Three minutes now. One proof in a few weeks.</h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              You do not need an account to start. Progress saves in this browser, and you can
              export it whenever you want.
            </p>
          </div>
          <ButtonLink to="/start" size="lg">
            Find my starting point
            <ArrowRight size={17} aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="mono tabular text-2xl text-ink">{value}</dt>
      <dd className="text-[11px] leading-tight text-faint">{label}</dd>
    </div>
  )
}

function Feature({
  icon,
  title,
  body,
  to,
  link,
}: {
  icon: React.ReactNode
  title: string
  body: string
  to: string
  link: string
}) {
  return (
    <div className="card flex flex-col p-5">
      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface-2 text-accent">
        {icon}
      </span>
      <h3 className="text-lg">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{body}</p>
      <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
        {link}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  )
}

function LabelRow({ label, note }: { label: string; note: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2.5">
      <p className="text-xs font-medium text-ink">{label}</p>
      <p className="mono mt-0.5 text-[9px] uppercase tracking-wider text-faint">{note}</p>
    </div>
  )
}
