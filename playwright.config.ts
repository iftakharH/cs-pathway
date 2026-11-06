import { config } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'

config({ path: '.env.local' })
config()

const hasDatabase = Boolean(process.env.DATABASE_URL)

const preview = {
  command: 'npm run build && npm run preview -- --port 4173 --host 127.0.0.1',
  url: 'http://127.0.0.1:4173',
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
}

const api = {
  command: 'npm run dev:api',
  url: 'http://127.0.0.1:3101/api/health',
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: hasDatabase ? [preview, api] : preview,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
