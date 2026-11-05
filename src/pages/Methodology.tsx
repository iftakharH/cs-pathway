import { Link } from 'react-router-dom'
import { PageHeader, Callout } from '@/components/ui/Section'
import { EvidenceBadge, StaleBadge } from '@/components/ui/Badge'
import { SourceChip } from '@/components/SourceChip'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'

export default function Methodology() {
  return (
    <div className="container-page">
      <PageHeader
        title="How a fact gets onto this site"
        lede="A short, boring process: write the claim, find the source, record the date, and let the build fail if the evidence is thin. The goal is not to sound certain. It is to make uncertainty visible."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Methodology' }]}
      />

      <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-4">
        {[
          ['Claims', manifest.counts.claims],
          ['Sources', manifest.counts.sources],
          ['Modules', manifest.counts.modules],
          ['Cheatsheets', manifest.counts.cheatsheets],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="eyebrow mb-1">{label}</p>
            <p className="mono tabular text-xl text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="prose-csp max-w-3xl py-8">
        <h2>1. A claim is a record, not a sentence</h2>
        <p>
          Every factual statement is stored as a claim with an id, a kind, a confidence level, a
          scope, the ids of its sources, the date it was checked and a date it must be reviewed
          again. The page renders the statement and a source chip. The chip opens the evidence,
          including the publisher, tier and retrieval date.
        </p>

        <h2>2. Evidence labels are explicit</h2>
        <div className="not-prose my-4 flex flex-wrap gap-2">
          <EvidenceBadge kind="observed-data" />
          <EvidenceBadge kind="spec-fact" />
          <EvidenceBadge kind="editorial" />
          <EvidenceBadge kind="forecast" />
          <StaleBadge />
        </div>
        <ul>
          <li>
            <strong>Observed data</strong> comes from a survey, dataset or measurement. It is not a
            prediction.
          </li>
          <li>
            <strong>Official docs</strong> records a specification, a limit or a documented
            behaviour from the body that maintains it.
          </li>
          <li>
            <strong>Editorial</strong> is an argument. It is labelled as opinion wherever it appears
            and is never used as a statistic.
          </li>
          <li>
            <strong>Forecast — not data</strong> is a prediction by a named institution, with the
            author, the date and a statement of what would prove it wrong.
          </li>
          <li>
            <strong>Needs re-check</strong> means the review date has passed. The claim stays
            visible, with the warning, until it is checked again.
          </li>
        </ul>

        <h2>3. The build enforces the rules</h2>
        <p>
          <code>npm run validate</code> fails when a factual claim has no primary source or two
          independent secondary sources. A community source is never enough alone. A forecast
          without a named author or a falsification condition is rejected. Every module must have at
          least one free resource, one official resource, five quiz questions with a source URL and
          a proof rubric.
        </p>
        <div className="not-prose my-4 rounded-lg border border-line bg-surface p-4">
          <p className="eyebrow mb-2">Also enforced</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li>— Unique ids across claims, modules, cheatsheets and sources.</li>
            <li>— No module may reference a missing claim, cheatsheet or prerequisite.</li>
            <li>— Every quiz answer index must point at an existing choice.</li>
            <li>— A runnable snippet must declare its expected output and be marked executed.</li>
            <li>— Hype phrases are rejected in claims, module summaries and trend copy.</li>
          </ul>
        </div>

        <h2>4. Cheatsheets have two verification levels</h2>
        <p>
          An entry with a <strong>runnable</strong> snippet is executed by{' '}
          <code>npm run test:snippets</code> on every push: JavaScript and TypeScript under Node,
          Python under the local interpreter, SQL against an in-process PostgreSQL. The expected
          output is part of the entry. If it changes without the expectation changing, the build
          fails.
        </p>
        <p>
          Everything else — shell commands, config files, vendor request shapes — is marked
          “checked against docs, not executed”, with a link to the exact documentation section. We
          do not claim that a command was run when it was only read.
        </p>

        <h2>5. Review windows</h2>
        <div className="not-prose overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-faint">
                <th scope="col" className="py-2 pr-4 font-medium">Content</th>
                <th scope="col" className="px-4 py-2 font-medium">Review window</th>
                <th scope="col" className="px-4 py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-line">
                <td className="py-2.5 pr-4">Survey and dataset claims</td>
                <td className="px-4 py-2.5">Quarterly</td>
                <td className="px-4 py-2.5">New editions replace old figures.</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2.5 pr-4">Plan limits and pricing</td>
                <td className="px-4 py-2.5">Monthly</td>
                <td className="px-4 py-2.5">Free tiers change without notice.</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2.5 pr-4">Cheatsheet tool version</td>
                <td className="px-4 py-2.5">Weekly check</td>
                <td className="px-4 py-2.5">A new release can change a command.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4">Editorial</td>
                <td className="px-4 py-2.5">Quarterly</td>
                <td className="px-4 py-2.5">An argument can age badly even without new data.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>6. Hosting constraints are stated, not hidden</h2>
        <p>
          This project runs on free plans. Vercel's Hobby plan is restricted to non-commercial
          personal use, so there are no ads, payments, affiliate links or paid tiers. Neon's Free
          plan has small limits, so the design expects a cold first query and a database that can be
          unavailable without taking the public pages down. <SourceChip claimId="V1" />{' '}
          <SourceChip claimId="N1" />
        </p>

        <h2>7. What is deliberately excluded</h2>
        <ul>
          <li>Income promises, hiring guarantees and “get hired in N days” claims.</li>
          <li>Forecasts without a named author and a falsification condition.</li>
          <li>Copied source text. Quotes, when used, stay under 15 words and are attributed.</li>
          <li>Sponsorship, affiliate links and tracking scripts.</li>
          <li>A claim without a link, hidden in a page that looks authoritative.</li>
        </ul>

        <div className="not-prose mt-6">
          <Callout tone="warn" title="A source is evidence, not proof">
            A primary source can still be wrong, out of date, or misread. The claim records what was
            checked and when. If you find a mistake, the corrections process exists to keep the
            record visible.
          </Callout>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-line py-6">
        <Link to="/claims" className="text-sm text-accent link-underline">
          Browse the claims
        </Link>
        <Link to="/sources" className="text-sm text-accent link-underline">
          Browse the sources
        </Link>
        <Link to="/corrections" className="text-sm text-accent link-underline">
          Report a correction
        </Link>
      </div>
    </div>
  )
}
