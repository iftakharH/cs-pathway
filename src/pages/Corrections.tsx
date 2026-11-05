import { PageHeader, Callout } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { site } from '@/lib/site'

export default function Corrections() {
  return (
    <div className="container-page">
      <PageHeader
        title="A wrong claim is a bug, and it stays in the record"
        lede="Report a mistake with the claim id and a link to a better source. If it changes what the page says, the old statement moves to the changelog instead of disappearing."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Corrections' }]}
        actions={<ButtonLink to="/claims" variant="secondary">Claim explorer</ButtonLink>}
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="prose-csp max-w-2xl">
          <h2>What counts as a correction</h2>
          <ul>
            <li>A statement that the cited source does not support.</li>
            <li>A number that has changed since the retrieval date.</li>
            <li>A link that no longer resolves to the cited record.</li>
            <li>A cheatsheet snippet that fails on the stated tool version.</li>
            <li>A quiz answer that is not stated on its source page.</li>
          </ul>

          <h2>What happens next</h2>
          <ol className="list-decimal pl-5 text-muted">
            <li>The claim is marked “under review” and its review date is set to today.</li>
            <li>The source is checked. If it does not support the statement, the claim is rewritten or removed from every page that uses it.</li>
            <li>A changelog entry records the old statement, the new statement and the date.</li>
            <li>If the claim supported a trend card or a quiz answer, that content is rechecked in the same pass.</li>
          </ol>

          <h2>How to report</h2>
          <p>
            Send the claim id (for example C4), the page you saw it on, and a link to a primary
            source. A screenshot is useful but not a substitute for a link.
          </p>
          <p>
            Contact:{' '}
            <a
              href={site.contactUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent link-underline"
            >
              {site.ownerName} on GitHub
            </a>
            .
          </p>

          <h2>Published corrections</h2>
          <p>No corrections have been published yet. The first build quarantined two seed claims before publication; both are listed in the changelog.</p>
        </div>

        <aside className="space-y-4">
          <Callout tone="warn" title="No silent edits">
            A number may change because the world changed. That is a revision, not a correction, and
            it still gets a dated changelog entry so the history is readable.
          </Callout>
          <div className="card p-4">
            <p className="eyebrow mb-2">Response target</p>
            <p className="text-sm leading-relaxed text-muted">
              This is a single-author, non-commercial project. Reports are read in order; a wrong
              claim or a broken security instruction is treated first.
            </p>
          </div>
          <div className="card p-4">
            <p className="eyebrow mb-2">Do not send</p>
            <p className="text-sm leading-relaxed text-muted">
              Personal data, credentials or confidential material. A public source link is enough.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
