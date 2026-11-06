import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { databaseUrl } from './env.js'
import { authSchema } from './auth-schema.js'
import { appSchema } from './app-schema.js'

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30_000,
})

export const db = drizzle(pool, { schema: { ...authSchema, ...appSchema } })
