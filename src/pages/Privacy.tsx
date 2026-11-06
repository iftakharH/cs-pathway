import { Link } from 'react-router-dom'
import { PageHeader, Callout } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { site } from '@/lib/site'

const serverRows = [
  ['Account', 'Name, email, hashed password, OAuth identity, profile image URL if the provider sends one.'],
  ['Sessions', 'Session id, token, expiry, IP address, user agent and timestamps.'],
  ['Profile', 'Weekly hours, target phase, start date, placement answers, optional streak setting.'],
  ['Progress', 'Module status (in progress, proof submitted, done, skipped) and timestamps.'],
  ['Quizzes', 'Score, total, answers and the date of the attempt.'],
  ['Notes', 'The text you write on a module or a cheatsheet, up to 5,000 characters per note.'],
  ['Proofs', 'Repository URL, demo URL, rubric self-scores and your notes.'],
  ['Pins', 'Cheatsheet ids and the date you pinned them.'],
  ['Tools', 'Interview log, outreach list, pricing and dilution inputs, pitch and 90-day plan.'],
  ['Review', 'Your weekly review answers and the last update date.'],
  ['Spaced review', 'Question ids, box, due date, last review date and miss count.'],
  ['Activity', 'A short log used for the optional streak, trimmed to the most recent 200 records.'],
]

const localOnly = [
  ['Theme', 'Light or dark, in localStorage.'],
  ['Guest progress', 'The same records, in localStorage, only when you use the site without signing in.'],
  ['Sync preference', 'Whether this browser syncs with the signed-in account.'],
]

export default function Privacy() {
  return (
    <div className="container-page">
      <PageHeader
        title="Local by default. An account is optional."
        lede="You can read and use the site without signing in. If you create an account, the records you choose to sync are stored in the connected Neon Postgres database. Nothing is sold, shared or sent to a model provider."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Privacy' }]}
        actions={<ButtonLink to="/account" variant="secondary">Manage my data</ButtonLink>}
      />

      <div className="grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-xl">What is stored on the server</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The Neon project connected to this deployment is in the provider's{' '}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-xs">us-east-1</code>{' '}
            region. Rows are keyed to your user id and deleted with your account. Content pages
            remain static and readable when the database is cold or unavailable.
          </p>
          <div className="mt-4 overflow-x-auto border-y border-line">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] text-faint">
                  <th scope="col" className="py-2 pr-3 font-medium">Record</th>
                  <th scope="col" className="px-3 py-2 font-medium">What it contains</th>
                </tr>
              </thead>
              <tbody>
                {serverRows.map(([name, description]) => (
                  <tr key={name} className="border-b border-line last:border-0">
                    <th scope="row" className="py-2.5 pr-3 text-left font-medium text-ink">{name}</th>
                    <td className="px-3 py-2.5 text-muted">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-8 text-xl">What stays only in this browser</h2>
          <ul className="mt-2 border-t border-line">
            {localOnly.map(([name, description]) => (
              <li key={name} className="border-b border-line py-2 text-sm">
                <span className="font-medium text-ink">{name}</span>
                <span className="text-muted"> — {description}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl">What is not collected</h2>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
            <li>— No analytics, session recording, heatmaps or advertising pixels.</li>
            <li>— No third-party scripts and no external font requests.</li>
            <li>— No tracking cookies. The only cookie is the Better Auth session cookie.</li>
            <li>— No data is sold, shared or sent to a model provider.</li>
          </ul>

          <h2 className="mt-8 text-xl">Export and deletion</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The account page downloads a complete JSON copy of your account and state. It also
            deletes the account and every attached row in the same request. Guests can export from
            the dashboard and reset the local copy there. Clearing site data has the same effect
            locally.
          </p>

          <h2 className="mt-8 text-xl">Accounts and email</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Sign-in supports email and password, and Google or GitHub when those providers are
            configured for the deployment. There is no email verification and no password reset in
            v1, so no email is sent. Use a password manager, or sign in with an OAuth provider.
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
          <Callout tone="accent" title="Guests keep the local-only path">
            Without an account, progress, notes and tools stay in this browser. A new device sees
            an empty dashboard until you sign in and choose to sync.
          </Callout>
          <Callout tone="warn" title="Shared computers">
            Anyone with access to this browser profile can read unsynced local data. Sign out and
            clear site data before leaving a shared machine.
          </Callout>
          <div className="border-t border-line pt-4">
            <p className="text-xs font-semibold text-ink">Storage limits</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
              <li>— Note: 5,000 characters.</li>
              <li>— Notes per account: 200 KB total.</li>
              <li>— Each tool state: 100 KB.</li>
              <li>— Activity: most recent 200 records.</li>
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
