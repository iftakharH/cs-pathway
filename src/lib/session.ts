import { useEffect, useSyncExternalStore } from 'react'

export type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

export type SessionData = {
  user: SessionUser
  session: {
    id: string
    expiresAt: string
  }
}

type Snapshot = SessionData | null | undefined

let snapshot: Snapshot = undefined
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Snapshot {
  return snapshot
}

function getServerSnapshot(): Snapshot {
  return undefined
}

export function refreshSession(): Promise<void> {
  if (inflight) return inflight
  inflight = fetch('/api/auth/get-session', { credentials: 'same-origin' })
    .then(async (response) => {
      if (!response.ok) return null
      const body = (await response.json()) as SessionData | null
      return body?.user ? body : null
    })
    .then((data) => {
      snapshot = data
      emit()
    })
    .catch(() => {
      snapshot = null
      emit()
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

export function clearSession() {
  snapshot = null
  emit()
}

export function useSession(): { data: SessionData | null; isPending: boolean } {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (value === undefined) void refreshSession()
  }, [value])

  return { data: value ?? null, isPending: value === undefined }
}
