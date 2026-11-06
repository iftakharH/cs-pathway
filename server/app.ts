import express, { type NextFunction, type Request, type Response } from 'express'
import { eq } from 'drizzle-orm'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import { db } from './db.js'
import { user } from './auth-schema.js'
import { oauth, trustedOrigins } from './env.js'
import { getState, replaceState, stateSummary } from './state-store.js'
import { assertStateCaps, StateLimitError, stateSchema } from './state-schema.js'
import { CONTENT_MANIFEST } from '../src/content/generated/manifest.js'

const moduleIds: Set<string> = new Set(CONTENT_MANIFEST.moduleIds)
const cheatIds: Set<string> = new Set(CONTENT_MANIFEST.cheatIds)

function json(res: Response, status: number, body: unknown) {
  res.status(status).json(body)
}

function sameOrigin(req: Request, res: Response): boolean {
  const origin = req.headers.origin
  if (!origin || !trustedOrigins.includes(origin)) {
    json(res, 403, { error: 'Request origin is not allowed.' })
    return false
  }
  return true
}

async function userIdFor(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  return session?.user.id ?? null
}

async function requireUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await userIdFor(req)
    if (!userId) {
      json(res, 401, { error: 'Sign in to use this endpoint.' })
      return
    }
    res.locals.userId = userId
    next()
  } catch (error) {
    next(error)
  }
}

function validateContentIds(state: ReturnType<typeof stateSchema.parse>): string | null {
  for (const moduleId of [
    ...Object.keys(state.progress),
    ...Object.keys(state.quizzes),
    ...Object.keys(state.proofs),
    ...Object.values(state.reviews).map((item) => item.moduleId),
  ]) {
    if (!moduleIds.has(moduleId)) return `Unknown module id: ${moduleId}`
  }

  for (const [key, value] of Object.entries(state.notes)) {
    if (value.body.length > 5000) return `Note ${key} is too long.`
    if (key.startsWith('module:') && !moduleIds.has(key.slice(7))) return `Unknown module id in ${key}`
    if (key.startsWith('cheat:') && !cheatIds.has(key.slice(6))) return `Unknown cheat id in ${key}`
    if (!key.startsWith('module:') && !key.startsWith('cheat:')) return `Unknown note key: ${key}`
  }

  for (const cheatId of Object.keys(state.pins)) {
    if (!cheatIds.has(cheatId)) return `Unknown cheat id: ${cheatId}`
  }

  return null
}

export function createApp() {
  const app = express()
  app.disable('x-powered-by')

  app.use((req, _res, next) => {
    if (!process.env.VERCEL) {
      req.headers['x-real-ip'] = req.socket.remoteAddress ?? '127.0.0.1'
    }
    next()
  })

  // Vercel's file-based API route only matches one segment. The rewrite in
  // vercel.json sends the rest of the path here as __path; restore it before
  // Express or Better Auth sees the request.
  app.use((req, _res, next) => {
    const raw = req.query.__path
    if (typeof raw !== 'string') {
      next()
      return
    }

    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(req.query)) {
      if (key === '__path' || value === undefined) continue
      if (Array.isArray(value)) {
        for (const item of value) params.append(key, String(item))
      } else {
        params.append(key, String(value))
      }
    }

    const query = params.toString()
    req.url = `/api/${raw}${query ? `?${query}` : ''}`
    next()
  })

  app.all('/api/auth/{*any}', toNodeHandler(auth))

  app.get('/api/health', (_req, res) => {
    json(res, 200, { ok: true })
  })

  app.get('/api/config', (_req, res) => {
    json(res, 200, { google: Boolean(oauth.google), github: Boolean(oauth.github) })
  })

  app.use(express.json({ limit: '256kb' }))

  app.get('/api/state', requireUser, async (_req, res, next) => {
    try {
      const result = await getState(res.locals.userId)
      json(res, 200, result)
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/state/summary', requireUser, async (_req, res, next) => {
    try {
      const summary = await stateSummary(res.locals.userId)
      json(res, 200, summary)
    } catch (error) {
      next(error)
    }
  })

  app.put('/api/state', requireUser, async (req, res, next) => {
    try {
      if (!sameOrigin(req, res)) return
      const parsed = stateSchema.safeParse(req.body?.state)
      if (!parsed.success) {
        json(res, 400, {
          error: 'The saved state is not valid.',
          issues: parsed.error.issues.slice(0, 5).map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const contentError = validateContentIds(parsed.data)
      if (contentError) {
        json(res, 400, { error: contentError })
        return
      }

      assertStateCaps(parsed.data)
      const updatedAt = await replaceState(res.locals.userId, parsed.data)
      json(res, 200, { ok: true, updatedAt })
    } catch (error) {
      if (error instanceof StateLimitError) {
        json(res, 413, { error: error.message })
        return
      }
      next(error)
    }
  })

  app.get('/api/account/export', requireUser, async (_req, res, next) => {
    try {
      const [account] = await db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, res.locals.userId))
        .limit(1)
      const { state, updatedAt } = await getState(res.locals.userId)
      json(res, 200, {
        exportedAt: new Date().toISOString(),
        account: account ?? null,
        stateUpdatedAt: updatedAt,
        state,
      })
    } catch (error) {
      next(error)
    }
  })

  app.delete('/api/account', requireUser, async (req, res, next) => {
    try {
      if (!sameOrigin(req, res)) return
      await db.delete(user).where(eq(user.id, res.locals.userId))
      json(res, 200, { ok: true })
    } catch (error) {
      next(error)
    }
  })

  app.use('/api', (_req, res) => {
    json(res, 404, { error: 'Unknown API route.' })
  })

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API error', error)
    if (res.headersSent) return
    json(res, 500, { error: 'The request failed. Try again.' })
  })

  return app
}
