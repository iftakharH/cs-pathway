import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { AuthProviders } from '@/components/AuthProviders'
import { Field, TextInput } from '@/components/ui/Field'
import { authClient, useSession } from '@/lib/auth-client'
import { safeNext } from '@/lib/auth-ui'

export default function SignIn() {
  const session = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!session.isPending && session.data) return <Navigate to={next} replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const result = await authClient.signIn.email({ email, password, callbackURL: next })
    if (result.error) {
      setError(result.error.message ?? 'That email and password did not match.')
      setBusy(false)
      return
    }
    navigate(next, { replace: true })
  }

  return (
    <div className="container-page max-w-2xl">
      <PageHeader
        title="Sign in to sync your work"
        lede="Your modules, quizzes, notes and proof records follow you to another browser. Public learning content stays readable without an account."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Sign in' }]}
      />

      <form onSubmit={submit} className="mt-6 space-y-4 border-y border-line py-6">
        <Field label="Email" htmlFor="signin-email">
          <TextInput
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="signin-password">
          <TextInput
            id="signin-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={10}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="py-6">
        <AuthProviders next={next} />
      </div>

      <p className="border-t border-line py-5 text-sm text-muted">
        No account yet?{' '}
        <Link to={`/signup?next=${encodeURIComponent(next)}`} className="font-medium text-accent">
          Create one
        </Link>
        . Password reset is not available in v1; use a password manager.
      </p>
    </div>
  )
}
