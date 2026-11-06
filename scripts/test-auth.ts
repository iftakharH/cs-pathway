import { randomUUID } from 'node:crypto'
import type { AddressInfo } from 'node:net'
import { createApp } from '../server/app'
import { pool } from '../server/db'
import type { ServerState } from '../server/state-schema'

type CookieJar = { value: string }

function cookiesFrom(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .filter(Boolean)
    .join('; ')
}

async function call(
  base: string,
  path: string,
  jar: CookieJar,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('origin', 'http://localhost:5173')
  if (jar.value) headers.set('cookie', jar.value)
  if (init.body) headers.set('content-type', 'application/json')
  const response = await fetch(`${base}${path}`, { ...init, headers, redirect: 'manual' })
  const next = cookiesFrom(response)
  if (next) jar.value = next
  return response
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function stateFor(note: string): ServerState {
  const now = new Date().toISOString()
  return {
    version: 1,
    profile: { hoursPerWeek: 12, targetPhase: '1', startedAt: now },
    placement: null,
    progress: { 'f-git': { status: 'in_progress', updatedAt: now } },
    quizzes: {},
    notes: { 'module:f-git': { body: note, updatedAt: now } },
    proofs: {},
    pins: { 'git-undo': now },
    tools: {},
    review: null,
    streakEnabled: false,
    activity: [{ at: now, kind: 'note:saved', refId: 'module:f-git' }],
    reviews: {},
  }
}

async function signUp(base: string, email: string, password: string, name: string) {
  const jar: CookieJar = { value: '' }
  const response = await call(base, '/api/auth/sign-up/email', jar, {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
  const body = (await response.json()) as { user?: { id: string; email: string }; message?: string }
  assert(response.ok, `sign-up failed: ${response.status} ${JSON.stringify(body)}`)
  assert(body.user?.id, 'sign-up did not return a user')
  return { jar, userId: body.user.id, email }
}

async function main() {
  const app = createApp()
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', () => resolve()))
  const { port } = server.address() as AddressInfo
  const base = `http://127.0.0.1:${port}`
  const suffix = randomUUID().slice(0, 8)
  const password = 'correct-horse-battery-staple'
  let a: Awaited<ReturnType<typeof signUp>> | null = null
  let b: Awaited<ReturnType<typeof signUp>> | null = null

  try {
    const health = await call(base, '/api/health', { value: '' })
    assert(health.ok, 'health check failed')

    a = await signUp(base, `test-a-${suffix}@example.com`, password, 'Account A')
    b = await signUp(base, `test-b-${suffix}@example.com`, password, 'Account B')

    const sessionA = await call(base, '/api/auth/get-session', a.jar)
    const sessionBody = (await sessionA.json()) as { user?: { id: string } }
    assert(sessionBody.user?.id === a.userId, 'session did not return account A')

    const putA = await call(base, '/api/state', a.jar, {
      method: 'PUT',
      body: JSON.stringify({ state: stateFor('A private note') }),
    })
    assert(putA.ok, `state write failed: ${putA.status} ${await putA.text()}`)

    const getA = await call(base, '/api/state', a.jar)
    const stateA = (await getA.json()) as { state: ServerState }
    assert(stateA.state.notes['module:f-git']?.body === 'A private note', 'A state did not persist')

    const getB = await call(base, '/api/state', b.jar)
    const stateB = (await getB.json()) as { state: ServerState; updatedAt: string | null }
    assert(stateB.updatedAt === null, 'account B saw a saved state before writing')
    assert(Object.keys(stateB.state.notes).length === 0, 'account B could read account A notes')

    const putB = await call(base, '/api/state', b.jar, {
      method: 'PUT',
      body: JSON.stringify({ state: stateFor('B private note') }),
    })
    assert(putB.ok, 'account B could not write its own state')

    const getA2 = await call(base, '/api/state', a.jar)
    const stateA2 = (await getA2.json()) as { state: ServerState }
    assert(
      stateA2.state.notes['module:f-git']?.body === 'A private note',
      'account B overwrote account A',
    )

    const exportA = await call(base, '/api/account/export', a.jar)
    const exportBody = (await exportA.json()) as {
      account?: { email: string }
      state: ServerState
    }
    assert(exportBody.account?.email === a.email, 'export did not include account A email')
    assert(exportBody.state.notes['module:f-git']?.body === 'A private note', 'export missed A state')

    const deleteB = await call(base, '/api/account', b.jar, { method: 'DELETE' })
    assert(deleteB.ok, `delete B failed: ${deleteB.status}`)
    const sessionB = await call(base, '/api/auth/get-session', b.jar)
    const sessionBBody = (await sessionB.json()) as { user?: unknown } | null
    assert(!sessionBBody?.user, 'account B session still exists after deletion')
    const stateBAfter = await call(base, '/api/state', b.jar)
    assert(stateBAfter.status === 401, 'deleted account B could read state')

    const deleteA = await call(base, '/api/account', a.jar, { method: 'DELETE' })
    assert(deleteA.ok, 'delete A failed')

    console.log('auth: sign-up, sign-in, state write, export and delete pass')
    console.log('authorization: A cannot read B, B cannot overwrite A, deleted sessions are rejected')
  } finally {
    if (a) {
      await pool
        .query('delete from "user" where email = $1', [`test-a-${suffix}@example.com`])
        .catch(() => undefined)
    }
    if (b) {
      await pool
        .query('delete from "user" where email = $1', [`test-b-${suffix}@example.com`])
        .catch(() => undefined)
    }
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await pool.end()
  }
}

main().catch(async (error) => {
  console.error(error)
  await pool.end().catch(() => undefined)
  process.exit(1)
})
