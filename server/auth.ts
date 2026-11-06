import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { authSchema } from './auth-schema'
import { authSecret, authUrl, isProduction, oauth, trustedOrigins } from './env'

const socialProviders = {
  ...(oauth.google ? { google: oauth.google } : {}),
  ...(oauth.github ? { github: oauth.github } : {}),
}

export const auth = betterAuth({
  appName: 'cs-pathway',
  baseURL: authUrl,
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
  socialProviders,
  trustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
  },
  advanced: {
    useSecureCookies: isProduction,
    ipAddress: {
      // Vercel sets x-real-ip at the proxy; the dev server overwrites it too.
      ipAddressHeaders: ['x-real-ip'],
    },
  },
})
