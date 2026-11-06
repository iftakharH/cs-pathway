import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Download, LogOut, Trash2, Upload } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Field, SelectInput, TextInput } from '@/components/ui/Field'
import { authClient, useSession } from '@/lib/auth-client'
import {
  deleteAccount,
  exportAccount,
  fetchServerState,
  fetchStateSummary,
  pushServerState,
} from '@/lib/api'
import { replaceGuestState, resetGuestData, setProfile, useGuestState } from '@/lib/store'
import { setSyncEnabled } from '@/components/SyncBridge'
import { formatDate, plural } from '@/lib/format'

type PhaseId = 'F' | '1' | '2' | '3' | 'S'

type AccountRow = { providerId: string; accountId: string }
type SessionRow = { id: string; token: string; createdAt: string | Date; userAgent?: string | null }

export default function Account() {
  const session = useSession()
  const navigate = useNavigate()
  const state = useGuestState()
  const [name, setName] = useState('')
  const [hours, setHours] = useState(state.profile?.hoursPerWeek ?? 10)
  const [phase, setPhase] = useState<PhaseId>(state.profile?.targetPhase ?? 'F')
  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [summary, setSummary] = useState<{ hasData: boolean; updatedAt: string | null } | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [deleteWord, setDeleteWord] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  const user = session.data?.user

  useEffect(() => {
    if (!user) return
    queueMicrotask(() => setName(user.name ?? ''))
    authClient.listAccounts().then((result) => {
      if (result.data) setAccounts(result.data)
    })
    authClient.listSessions().then((result) => {
      if (result.data) setSessions(result.data as SessionRow[])
    })
    fetchStateSummary().then(setSummary).catch(() => setSummary(null))
  }, [user])

  if (session.isPending) {
    return (
      <div className="container-page max-w-3xl">
        <PageHeader title="Your account" lede="Loading your session…" />
      </div>
    )
  }

  if (!user && !signingOut) return <Navigate to="/signin?next=%2Faccount" replace />
  if (!user) {
    return (
      <div className="container-page max-w-3xl">
        <PageHeader title="Signing out?" lede="Clearing the session on this device." />
      </div>
    )
  }

  const userId = user.id

  async function saveName() {
    setBusy('name')
    setError('')
    setMessage('')
    const result = await authClient.updateUser({ name })
    if (result.error) setError(result.error.message ?? 'Could not update your name.')
    else setMessage('Name updated.')
    setBusy('')
  }

  function saveProfile() {
    setProfile(hours, phase)
    setMessage('Plan settings saved in this browser and queued for sync.')
  }

  async function upload() {
    setBusy('upload')
    setError('')
    setMessage('')
    try {
      const result = await pushServerState(state)
      setSyncEnabled(userId, true)
      window.dispatchEvent(new Event('cs-pathway:sync'))
      setSummary({ hasData: true, updatedAt: result.updatedAt })
      setMessage('This browser’s data is now saved to your account.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sync this browser.')
    } finally {
      setBusy('')
    }
  }

  async function pull() {
    setBusy('pull')
    setError('')
    setMessage('')
    try {
      const server = await fetchServerState()
      if (!replaceGuestState(server.state)) {
        setError('The account data could not be read.')
        return
      }
      setSyncEnabled(userId, true)
      window.dispatchEvent(new Event('cs-pathway:sync'))
      setSummary({ hasData: server.updatedAt !== null, updatedAt: server.updatedAt })
      setMessage('Account data loaded into this browser.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the account.')
    } finally {
      setBusy('')
    }
  }

  async function exportData() {
    setBusy('export')
    setError('')
    try {
      const blob = await exportAccount()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `cs-pathway-account-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setMessage('Account export downloaded.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not export the account.')
    } finally {
      setBusy('')
    }
  }

  async function remove() {
    if (deleteWord !== 'delete') {
      setError('Type delete to confirm.')
      return
    }
    setBusy('delete')
    setSigningOut(true)
    setError('')
    try {
      await deleteAccount()
      resetGuestData()
      await authClient.signOut()
      navigate('/', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the account.')
      setBusy('')
    }
  }

  async function signOutOtherDevices() {
    setBusy('sessions')
    setError('')
    const result = await authClient.revokeOtherSessions()
    if (result.error) setError(result.error.message ?? 'Could not sign out other sessions.')
    else setMessage('Other sessions signed out.')
    setBusy('')
  }

  return (
    <div className="container-page max-w-3xl">
      <PageHeader
        title="Your account"
        lede={`Signed in as ${user.email}. Export or delete everything from this page; nothing is sold or shared.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Account' }]}
        actions={
          <Button
            variant="secondary"
            onClick={async () => {
              setSigningOut(true)
              await authClient.signOut()
              navigate('/', { replace: true })
            }}
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </Button>
        }
      />

      {message ? (
        <p role="status" className="mt-4 border-l-2 border-accent bg-accent-soft/60 p-3 text-sm text-ink">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 border-l-2 border-warn bg-warn-soft/60 p-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <section className="border-t border-line py-6">
        <h2 className="text-xl">Profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Display name" htmlFor="account-name">
            <TextInput
              id="account-name"
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Button variant="secondary" onClick={saveName} disabled={busy === 'name'}>
            Save name
          </Button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3 sm:items-end">
          <Field label="Weekly hours" htmlFor="account-hours">
            <TextInput
              id="account-hours"
              type="number"
              min={1}
              max={80}
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
            />
          </Field>
          <Field label="Target phase" htmlFor="account-phase">
            <SelectInput
              id="account-phase"
              value={phase}
              onChange={(event) => setPhase(event.target.value as PhaseId)}
            >
              <option value="F">F — Foundations</option>
              <option value="1">1 — Full-stack</option>
              <option value="2">2 — AI engineer</option>
              <option value="3">3 — ML engineer</option>
              <option value="S">S — Startup</option>
            </SelectInput>
          </Field>
          <Button variant="secondary" onClick={saveProfile}>
            Save plan
          </Button>
        </div>
      </section>

      <section className="border-t border-line py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl">Saved data</h2>
          <span className="mono text-[10px] text-faint">
            {summary?.updatedAt ? `synced ${formatDate(summary.updatedAt.slice(0, 10))}` : 'not synced yet'}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {summary?.hasData
            ? 'Your account has a saved state. Loading it replaces what is in this browser.'
            : 'Your account has no saved state yet. Upload this browser to start the backup.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={upload} disabled={busy === 'upload'}>
            <Upload size={15} aria-hidden="true" />
            Save this browser to account
          </Button>
          <Button variant="secondary" onClick={pull} disabled={busy === 'pull'}>
            <Download size={15} aria-hidden="true" />
            Load account into this browser
          </Button>
          <Button variant="secondary" onClick={exportData} disabled={busy === 'export'}>
            <Download size={15} aria-hidden="true" />
            Export my data (JSON)
          </Button>
        </div>
      </section>

      <section className="border-t border-line py-6">
        <h2 className="text-xl">Connected sign-in methods</h2>
        <p className="mt-2 text-sm text-muted">
          {accounts.length > 0
            ? accounts
                .map((account) =>
                  account.providerId === 'credential' ? 'Email and password' : account.providerId,
                )
                .join(', ')
            : 'Email and password'}
        </p>
        <p className="mt-1 text-xs text-faint">
          Google and GitHub appear here after they are configured and linked.
        </p>
      </section>

      <section className="border-t border-line py-6">
        <h2 className="text-xl">Active sessions</h2>
        <p className="mt-2 text-sm text-muted">
          {plural(sessions.length, 'session')} across your devices.
        </p>
        <ul className="mt-3 border-t border-line">
          {sessions.map((item) => (
            <li key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-muted">{item.userAgent ?? 'Unknown device'}</span>
              <span className="mono text-faint">{formatDate(new Date(item.createdAt).toISOString().slice(0, 10))}</span>
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={signOutOtherDevices}
          disabled={busy === 'sessions' || sessions.length < 2}
        >
          Sign out other devices
        </Button>
      </section>

      <section className="border-t border-line py-6">
        <h2 className="text-xl">Delete account</h2>
        <Callout tone="warn" title="This removes the account and every row attached to it">
          Notes, proof records, quiz attempts, pins, reviews and tool state are deleted immediately.
          This cannot be undone. Export first if you want a copy.
        </Callout>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Type delete to confirm" htmlFor="account-delete">
            <TextInput
              id="account-delete"
              value={deleteWord}
              onChange={(event) => setDeleteWord(event.target.value)}
            />
          </Field>
          <Button variant="danger" onClick={remove} disabled={busy === 'delete'}>
            <Trash2 size={15} aria-hidden="true" />
            Delete my account
          </Button>
        </div>
      </section>
    </div>
  )
}
