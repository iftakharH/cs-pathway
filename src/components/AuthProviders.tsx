import { useEffect, useState } from 'react'
import { GitBranch, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { fetchAuthConfig } from '@/lib/api'

export function AuthProviders({ next }: { next: string }) {
  const [config, setConfig] = useState<{ google: boolean; github: boolean } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchAuthConfig()
      .then((value) => {
        if (active) setConfig(value)
      })
      .catch(() => {
        if (active) setConfig({ google: false, github: false })
      })
    return () => {
      active = false
    }
  }, [])

  async function start(provider: 'google' | 'github') {
    setBusy(provider)
    setError('')
    const result = await authClient.signIn.social({ provider, callbackURL: next })
    if (result.error) {
      setError(result.error.message ?? 'Could not start that sign-in.')
      setBusy(null)
    }
  }

  if (!config) return null

  const enabled = [
    config.google ? 'google' : null,
    config.github ? 'github' : null,
  ].filter((value): value is 'google' | 'github' => Boolean(value))

  if (enabled.length === 0) {
    return (
      <p className="border-t border-line pt-4 text-xs leading-relaxed text-faint">
        Google and GitHub sign-in are not configured on this deployment. Email and password works
        without them. Password reset is not available in v1.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] text-faint">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      {enabled.map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="secondary"
          className="w-full"
          disabled={busy !== null}
          onClick={() => start(provider)}
        >
          {provider === 'google' ? (
            <Globe size={16} aria-hidden="true" />
          ) : (
            <GitBranch size={16} aria-hidden="true" />
          )}
          Continue with {provider === 'google' ? 'Google' : 'GitHub'}
        </Button>
      ))}
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
