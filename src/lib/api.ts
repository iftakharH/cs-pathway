import type { GuestState } from './store'

export type ServerStateResponse = {
  state: GuestState
  updatedAt: string | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed with ${response.status}.`
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // Keep the status message.
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

export function fetchServerState(): Promise<ServerStateResponse> {
  return request<ServerStateResponse>('/api/state')
}

export function fetchStateSummary(): Promise<{ hasData: boolean; updatedAt: string | null }> {
  return request('/api/state/summary')
}

export function pushServerState(state: GuestState): Promise<{ ok: boolean; updatedAt: string }> {
  return request('/api/state', {
    method: 'PUT',
    body: JSON.stringify({ state }),
  })
}

export function fetchAuthConfig(): Promise<{ google: boolean; github: boolean }> {
  return request('/api/config')
}

export function deleteAccount(): Promise<{ ok: boolean }> {
  return request('/api/account', { method: 'DELETE' })
}

export async function exportAccount(): Promise<Blob> {
  const response = await fetch('/api/account/export', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not export your account.')
  return response.blob()
}
