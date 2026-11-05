import { ExternalLink, ShieldCheck } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'
import { site } from '@/lib/site'
import { SourceChip } from '@/components/SourceChip'

export default function About() {
  return (
    <div className="container-page">
      <PageHeader
        title="A single-author project about checking the work"
        lede="cs-pathway is a source-verified roadmap, tracker and cheatsheet library for people heading into software and AI work in 2027. It is built and maintained by one person."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="prose-csp max-w-2xl">
          <h2>Who runs it</h2>
          <p>
            {site.ownerName}. Contact through{' '}
            <a
              href={site.ownerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-accent link-underline"
            >
              GitHub
              <ExternalLink size={11} aria-hidden="true" />
            </a>
            . There is no team, no agency and no hidden editor. That is also why the site has a
            corrections process instead of a support inbox.
          </p>

          <h2>Why this exists</h2>
          <p>
            Most study plans are a list of links with confident captions. The captions are often
            unsourced, the time estimates are invented, and the advice is hard to disprove. This
            project takes the opposite constraint: if a number or a specification cannot be linked
            to a record, it is not published.
          </p>
          <p>
            The path is deliberately practical. Foundations, a full-stack phase, AI engineering, ML
            engineering, then the startup phase. Each phase ends with a proof — a repository, a
            measurement, a customer conversation — because completion is a weak signal and evidence
            is a strong one.
          </p>

          <h2>What it is not</h2>
          <ul>
            <li>Not a job guarantee, a salary forecast or a funding promise.</li>
            <li>Not a replacement for a degree, a mentor or a lawyer.</li>
            <li>Not a content farm. There is no AI-generated filler and no sponsored placement.</li>
            <li>Not free of mistakes. It is free of hidden mistakes, which is different.</li>
          </ul>

          <h2>How it is built</h2>
          <p>
            React, Vite and TypeScript with strict types. Content lives in YAML in the repository and
            is validated at build time; the build fails when a claim lacks a primary source or two
            independent secondary sources. Cheatsheet snippets are executed in CI where possible.
            The public pages do not need a database.
          </p>
          <p>
            Accounts are not enabled in this build. Progress saves in the browser and can be
            exported as JSON. If accounts are added, the privacy page will list exactly what is
            stored on the server before they are switched on.
          </p>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="eyebrow mb-3">At a glance</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-faint">Started</dt>
                <dd className="text-ink">5 Nov 2026</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-faint">Cheatsheets</dt>
                <dd className="mono text-ink">{manifest.counts.cheatsheets}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-faint">Modules</dt>
                <dd className="mono text-ink">{manifest.counts.modules}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-faint">Claims</dt>
                <dd className="mono text-ink">{manifest.counts.claims}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-faint">Sources</dt>
                <dd className="mono text-ink">{manifest.counts.sources}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={site.ownerUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2"
              >
                <ExternalLink size={15} aria-hidden="true" />
                GitHub
              </a>
              <ButtonLink to="/corrections" variant="secondary">
                Report a correction
              </ButtonLink>
            </div>
          </div>

          <Callout tone="accent" title="Non-commercial by design">
            No ads, no payments, no affiliate links, no sponsorships. The site runs within Vercel's
            Hobby limits, which restrict it to non-commercial personal use.{' '}
            <SourceChip claimId="V1" />
          </Callout>

          <div className="card p-4">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              No analytics, no tracking cookies and no third-party scripts. The only stored
              preferences are a theme choice and your local progress.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
