import { useEffect, useRef, useState } from 'react'
import { CloudDownload, CloudUpload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSession } from '@/lib/session'
import { fetchServerState, pushServerState } from '@/lib/api'
import {
  getSnapshot,
  hasProgress,
  replaceGuestState,
  subscribe,
  type GuestState,
} from '@/lib/store'

const FLAG_PREFIX = 'cs-pathway:sync:'

function flagKey(userId: string) {
  return `${FLAG_PREFIX}${userId}`
}

export function setSyncEnabled(userId: string, enabled: boolean) {
  if (enabled) window.localStorage.setItem(flagKey(userId), 'on')
  else window.localStorage.removeItem(flagKey(userId))
}

function isSyncEnabled(userId: string) {
  return window.localStorage.getItem(flagKey(userId)) === 'on'
}

function latestLocalMoment(state: GuestState): number {
  const moments = [
    ...Object.values(state.progress).map((item) => item.updatedAt),
    ...Object.values(state.quizzes).map((item) => item.takenAt),
    ...Object.values(state.notes).map((item) => item.updatedAt),
    ...Object.values(state.proofs).map((item) => item.createdAt),
    ...Object.values(state.pins),
    state.review?.updatedAt ?? '',
    state.activity[0]?.at ?? '',
  ]
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value))
  return moments.length ? Math.max(...moments) : 0
}

type Status = 'idle' | 'checking' | 'choice' | 'ready' | 'error'

export function SyncBridge() {
  const session = useSession()
  const userId = session.data?.user.id ?? null
  const [status, setStatus] = useState<Status>('idle')
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null)
  const [serverState, setServerState] = useState<GuestState | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [revision, setRevision] = useState(0)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setStatus('idle')
        setServerState(null)
      })
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      setStatus('checking')
      setError('')
    })

    fetchServerState()
      .then((server) => {
        if (cancelled) return
        setServerUpdatedAt(server.updatedAt)
        setServerState(server.state)
        const local = getSnapshot()
        const localHasData = hasProgress(local)

        if (!server.updatedAt) {
          if (!localHasData) {
            setSyncEnabled(userId, true)
            setStatus('ready')
          } else {
            setStatus('choice')
          }
          return
        }

        if (!localHasData) {
          replaceGuestState(server.state)
          setSyncEnabled(userId, true)
          setStatus('ready')
          return
        }

        if (isSyncEnabled(userId)) {
          const localMoment = latestLocalMoment(local)
          const serverMoment = new Date(server.updatedAt).getTime()
          if (Number.isFinite(serverMoment) && serverMoment > localMoment + 5000) {
            replaceGuestState(server.state)
          }
          setStatus('ready')
          return
        }

        setStatus('choice')
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause instanceof Error ? cause.message : 'Could not reach the sync service.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [userId, revision])

  useEffect(() => {
    const onChange = () => setRevision((value) => value + 1)
    window.addEventListener('cs-pathway:sync', onChange)
    return () => window.removeEventListener('cs-pathway:sync', onChange)
  }, [])

  useEffect(() => {
    if (!userId || status !== 'ready') return
    const unsubscribe = subscribe(() => {
      if (pending.current) clearTimeout(pending.current)
      pending.current = setTimeout(() => {
        pending.current = null
        pushServerState(getSnapshot()).catch(() => {
          setError('Could not save the latest change. It stays in this browser.')
        })
      }, 900)
    })

    function flush() {
      if (!pending.current) return
      clearTimeout(pending.current)
      pending.current = null
      fetch('/api/state', {
        method: 'PUT',
        credentials: 'same-origin',
        keepalive: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state: getSnapshot() }),
      }).catch(() => undefined)
    }

    function onVisibility() {
      if (document.visibilityState === 'hidden') flush()
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
      if (pending.current) clearTimeout(pending.current)
    }
  }, [status, userId])

  if (!userId || status === 'idle' || status === 'checking') return null

  if (status === 'error') {
    return (
      <div className="no-print border-b border-warn/40 bg-warn-soft/60">
        <div className="container-page py-2 text-xs text-ink">
          {error} Your work is still saved in this browser.
        </div>
      </div>
    )
  }

  if (status === 'choice') {
    const local = getSnapshot()
    const hasServer = Boolean(serverUpdatedAt)
    return (
      <div className="no-print border-b border-accent/30 bg-accent-soft">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">
              {hasServer ? 'This account already has saved data' : 'Save this browser’s progress?'}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {hasServer
                ? 'Choose which copy to keep. Loading the account replaces this browser; uploading replaces the account.'
                : 'You are signed in. Save your modules, notes and proof records to the account.'}
            </p>
            {error ? (
              <p role="alert" className="mt-1 text-xs font-medium text-danger">
                {error}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {hasServer ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy !== ''}
                onClick={() => {
                  if (!serverState) return
                  setBusy('load')
                  const ok = replaceGuestState(serverState)
                  setBusy('')
                  if (!ok) {
                    setError('The account data could not be read.')
                    return
                  }
                  setSyncEnabled(userId, true)
                  setStatus('ready')
                }}
              >
                <CloudDownload size={14} aria-hidden="true" />
                Load account
              </Button>
            ) : null}
            <Button
              size="sm"
              disabled={busy !== ''}
              onClick={async () => {
                setBusy('upload')
                try {
                  await pushServerState(local)
                  setSyncEnabled(userId, true)
                  setStatus('ready')
                  setServerUpdatedAt(new Date().toISOString())
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : 'Could not upload this browser.')
                } finally {
                  setBusy('')
                }
              }}
            >
              {busy === 'upload' ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <CloudUpload size={14} aria-hidden="true" />
              )}
              {hasServer ? 'Keep this browser and replace account' : 'Import my progress'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
