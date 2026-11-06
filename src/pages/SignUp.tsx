import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { AuthProviders } from '@/components/AuthProviders'
import { Field, TextInput } from '@/components/ui/Field'
import { authClient, useSession } from '@/lib/auth-client'
import { safeNext } from '@/lib/auth-ui'

export default function SignUp() {
  const session = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!session.isPending && session.data) return <Navigate to={next} replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    setError('')
    const result = await authClient.signUp.email({ name, email, password, callbackURL: next })
    if (result.error) {
      setError(result.error.message ?? 'Could not create that account.')
      setBusy(false)
      return
    }
    navigate(next, { replace: true })
  }

  return (
    <div className="container-page max-w-2xl">
      <PageHeader
        title="Create an account"
        lede="Keep your progress across browsers and devices. Your notes and proof records stay private to your account."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Create account' }]}
      />

      <div className="mt-6 border-y border-line py-5 text-sm leading-relaxed text-muted">
        <p className="font-medium text-ink">Before you sign up</p>
        <ul className="mt-2 space-y-1.5">
          <li>— There is no email verification in v1.</li>
          <li>— There is no password reset in v1. Use a password manager.</li>
          <li>— Your name, email and the records you create are stored in the database.</li>
          <li>— You can export or delete everything from the account page.</li>
        </ul>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4 py-2">
        <Field label="Name" htmlFor="signup-name">
          <TextInput
            id="signup-name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Email" htmlFor="signup-email">
          <TextInput
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="signup-password"
          hint="At least 10 characters. A passphrase is easier to remember than a short password."
        >
          <TextInput
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Field label="Confirm password" htmlFor="signup-confirm">
          <TextInput
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </Field>
        {error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <div className="py-6">
        <AuthProviders next={next} />
      </div>

      <p className="border-t border-line py-5 text-sm text-muted">
        Already have an account?{' '}
        <Link to={`/signin?next=${encodeURIComponent(next)}`} className="font-medium text-accent">
          Sign in
        </Link>
        .
      </p>
    </div>
  )
}
