import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { CodeBlock } from '@/components/CodeBlock'
import { SourceChip } from '@/components/SourceChip'
import { PhaseExplorer } from '@/components/PhaseExplorer'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'
import { TRENDS as trends } from '@/content/generated/trends'
import { featuredCheat } from '@/lib/catalog'
import { formatDate } from '@/lib/format'

export default function Home() {
  const counts = manifest.counts
  const sample = featuredCheat

  return (
    <>
      <section className="border-b border-line">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-14 lg:py-20">
          <div>
            <h1 className="max-w-[14ch] text-[clamp(2.9rem,7vw,5.3rem)] font-normal leading-[0.95] tracking-[-0.035em]">
              Stop collecting tutorials.
              <br />
              Start proving you can build.
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
            <p className="mt-4 text-xs text-faint">
              3 minutes · no account · progress saved in this browser
            </p>

            <p className="mt-10 max-w-xl border-t border-line pt-4 text-sm leading-relaxed text-muted">
              {counts.modules} modules, {counts.cheatsheets} cheatsheets, {manifest.quizCount} sourced
              questions. Every statistic opens to its evidence.{' '}
              <span className="inline-flex align-baseline">
                <SourceChip claimId="C4" />
              </span>
            </p>
          </div>

          <PhaseExplorer />
        </div>
      </section>

      <section className="container-page py-14 sm:py-18">
        <div className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <h2 className="max-w-[15ch] text-3xl leading-tight sm:text-4xl">
            A roadmap, a tracker and a library that agree with each other.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="border-t border-ink pt-3">
              <h3 className="text-base font-semibold">Start where you are</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A placement check sets your first module. A planner turns weekly hours into a
                week-by-week schedule and recalculates as you finish.
              </p>
              <Link
                to="/start"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent"
              >
                Take the check
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
            <div className="border-t border-ink pt-3">
              <h3 className="text-base font-semibold">Count proof, not views</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Phase progress counts quizzes and submitted proofs. Every module ends with a brief
                and a rubric you score yourself against.
              </p>
              <Link
                to="/dashboard"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent"
              >
                See the dashboard
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
            <div className="border-t border-ink pt-3">
              <h3 className="text-base font-semibold">Use it on the job</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                One task per entry, one to three snippets, a version stamp and a link to the exact
                docs section. Copy it, print it, pin it.
              </p>
              <Link
                to="/cheatsheets"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent"
              >
                Open the library
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-14">
          <div className="min-w-0">
            <h2 className="max-w-[12ch] text-3xl leading-tight sm:text-4xl">
              Specific enough to use on a bad day.
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted">
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
                  <Check size={15} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink to={`/cheatsheet/${sample.id}`} variant="secondary">
                Open this entry
                <ArrowRight size={15} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <div>
                <p className="text-xs text-muted">{sample.topic}</p>
                <h3 className="mt-1 text-xl leading-snug">{sample.title}</h3>
              </div>
              <span className="mono text-[10px] text-faint">
                {sample.tool.name} {sample.tool.version}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">{sample.whenToUse}</p>
            <div className="mt-4">
              <CodeBlock
                code={sample.snippets[0]?.code ?? ''}
                lang={sample.snippets[0]?.lang ?? 'bash'}
                caption={sample.snippets[0]?.caption}
                compact
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-faint">Checked {formatDate(sample.tool.verifiedOn)}</span>
              <a
                href={sample.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-accent underline decoration-line underline-offset-4"
              >
                Official docs
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-18">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 className="max-w-[14ch] text-3xl leading-tight sm:text-5xl">
              If we cannot link it, it is not here.
            </h2>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-muted">
              Every statistic and specification is a claim with a source record. The build fails
              when a claim has no primary source. Forecasts are labelled as forecasts, and claims
              past their review date show a warning instead of quietly staying up.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to="/methodology" variant="secondary" size="sm">
                Read the methodology
              </ButtonLink>
              <ButtonLink to="/sources" variant="ghost" size="sm">
                See the sources
              </ButtonLink>
            </div>
          </div>

          <div className="border-t border-ink">
            <p className="mt-4 text-base leading-relaxed text-ink">
              SQL passed HTML/CSS as the second most-used language in the 2026 Stack Overflow
              survey.
              <span className="ml-1.5 inline-flex align-baseline">
                <SourceChip claimId="C5" />
              </span>
            </p>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['Observed data', 'Survey, dataset'],
                ['Official docs', 'Spec, pricing'],
                ['Editorial', 'Opinion, labelled'],
              ].map(([label, note]) => (
                <div key={label} className="border-t border-line pt-2">
                  <dt className="text-xs font-medium text-ink">{label}</dt>
                  <dd className="mt-0.5 text-[11px] text-faint">{note}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-faint">
              {counts.claims} claims across {counts.sources} sources. No analytics, no tracking
              cookies, no third-party scripts.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line">
        <div className="container-page py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl leading-tight sm:text-4xl">What changed, and what is still uncertain</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Three levels: observed in 2026, emerging, and forecast. A forecast is published only
                when a named institution made it and said what would prove it wrong.
              </p>
            </div>
            <ButtonLink to="/trends" variant="secondary" size="sm">
              Read the trends
            </ButtonLink>
          </div>

          <div className="mt-8">
            {trends.slice(0, 3).map((trend) => (
              <article
                key={trend.id}
                className="grid gap-3 border-t border-line py-5 md:grid-cols-[8rem_1fr]"
              >
                <p className="text-xs font-medium text-accent">
                  {trend.level === 'observed' ? 'Observed' : 'Emerging'}
                </p>
                <div>
                  <h3 className="text-lg leading-snug">{trend.title}</h3>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">{trend.body}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {trend.claimIds.map((id) => (
                      <SourceChip key={id} claimId={id} />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-bg">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-xs text-bg/60">The last phase</p>
            <h2 className="mt-3 max-w-[20ch] text-3xl leading-tight text-bg sm:text-5xl">
              The goal is not to finish a path. It is to build something people use.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-bg/70">
              The startup phase turns the skills into a process: talk to customers, ship a small
              product, price it, and understand the money. Every module states one honest risk.
              Nothing here promises an outcome.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <ButtonLink to="/startup" size="md" className="bg-bg text-ink hover:bg-bg/90">
              Explore the startup phase
            </ButtonLink>
            <ButtonLink to="/tools" size="md" variant="ghost" className="text-bg hover:bg-white/10">
              Open the tools
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-ink pt-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="max-w-[22ch] text-2xl leading-tight sm:text-3xl">
              Three minutes now. One proof in a few weeks.
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              You do not need an account to start. Progress saves in this browser, and you can export
              it whenever you want.
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
