import { Link } from 'react-router-dom'
import { PageHeader, Callout } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { site } from '@/lib/site'

const stored = [
  ['Profile', 'Weekly hours, target phase, start date.'],
  ['Placement', 'Your self-ratings, scenario answers, recommended phase and the date.'],
  ['Progress', 'Module status (in progress, proof submitted, done, skipped) and timestamps.'],
  ['Quizzes', 'Score, total, answers and the date of the attempt.'],
  ['Notes', 'The text you write on a module or a cheatsheet, up to 5,000 characters per note.'],
  ['Proofs', 'Repository URL, demo URL, rubric self-scores and your notes.'],
  ['Pins', 'Cheatsheet ids and the date you pinned them.'],
  ['Tools', 'Interview log, outreach list, pricing and dilution inputs, pitch and 90-day plan.'],
  ['Review', 'Your weekly review answers and the last update date.'],
  ['Activity', 'A short local log used for the optional streak.'],
]

export default function Privacy() {
  return (
    <div className="container-page">
      <PageHeader
        title="No account. No server copy. No tracking."
        lede="This build has no authentication and no database. Everything you enter is stored in your browser's localStorage, on this device. It is not transmitted to cs-pathway."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Privacy' }]}
        actions={<ButtonLink to="/dashboard" variant="secondary">Manage my data</ButtonLink>}
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-xl">What is stored</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Two localStorage keys are used:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-xs">cs-pathway:v1</code>{' '}
              — the data below.
            </li>
            <li>
              <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-xs">cs-pathway:theme</code>{' '}
              — light or dark.
            </li>
          </ul>

          <div className="mt-5 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-xs text-faint">
                  <th scope="col" className="px-3 py-2 font-medium">Record</th>
                  <th scope="col" className="px-3 py-2 font-medium">What it contains</th>
                </tr>
              </thead>
              <tbody>
                {stored.map(([name, description]) => (
                  <tr key={name} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-2.5 text-left font-medium text-ink">{name}</th>
                    <td className="px-3 py-2.5 text-muted">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-8 text-xl">What is not collected</h2>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
            <li>— No analytics, session recording, heatmaps or advertising pixels.</li>
            <li>— No third-party scripts and no external font requests.</li>
            <li>— No application cookies in this build. The theme is a localStorage value.</li>
            <li>— No email address, phone number or real name is required.</li>
            <li>— No data is sold, shared or sent to a model provider.</li>
          </ul>

          <h2 className="mt-8 text-xl">Export and deletion</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The dashboard has <strong className="text-ink">Export JSON</strong> and{' '}
            <strong className="text-ink">Reset</strong>. Export downloads a complete copy of the
            stored object. Reset deletes it from this browser. Clearing site data in your browser
            has the same effect. Notes and pinned sheets can also be exported as Markdown.
          </p>

          <h2 className="mt-8 text-xl">If accounts are added later</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This build has no sign-in and no server database, so there is nothing to delete on a
            server. If accounts are added, this page must list the exact rows, the database region,
            the retention period and the deletion path before they are enabled. The current policy
            is that public content never sits behind a login.
          </p>

          <h2 className="mt-8 text-xl">Contact</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Privacy questions or a correction:{' '}
            <a
              href={site.contactUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent link-underline"
            >
              {site.ownerName} on GitHub
            </a>
            . Do not send personal data or credentials.
          </p>
        </div>

        <aside className="space-y-4">
          <Callout tone="accent" title="Your browser is the database, for now">
            That means a new device sees an empty dashboard. Export the JSON before switching
            devices and restore it from the dashboard.
          </Callout>
          <Callout tone="warn" title="Shared computers">
            Anyone with access to this browser profile can read your notes and progress. Use Reset
            before leaving a shared machine.
          </Callout>
          <div className="card p-4">
            <p className="eyebrow mb-2">Storage limits</p>
            <ul className="space-y-1.5 text-xs leading-relaxed text-muted">
              <li>— Note: 5,000 characters.</li>
              <li>— Proof note: 3,000 characters.</li>
              <li>— Weekly review: 500 characters per field.</li>
              <li>— Older activity is trimmed to the most recent 200 records.</li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-faint">
            Read the{' '}
            <Link to="/methodology" className="text-accent link-underline">
              methodology
            </Link>{' '}
            for how claims and sources are handled.
          </p>
        </aside>
      </div>
    </div>
  )
}
