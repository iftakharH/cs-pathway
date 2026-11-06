import { config } from 'dotenv'

// Local development only. Vercel injects the same names at runtime.
config({ path: '.env.local' })
config()

export const isProduction = process.env.NODE_ENV === 'production'

export const authUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:5173'

export const trustedOrigins = (() => {
  const origins = new Set([
    authUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ])
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }
  return [...origins]
})()

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

export const databaseUrl = requireEnv('DATABASE_URL')
export const databaseUrlUnpooled = process.env.DATABASE_URL_UNPOOLED ?? databaseUrl
export const authSecret = requireEnv('BETTER_AUTH_SECRET')

if (authSecret.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be at least 32 characters')
}

export const oauth = {
  google:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
      : null,
  github:
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }
      : null,
}
