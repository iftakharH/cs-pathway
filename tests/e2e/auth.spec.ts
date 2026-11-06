import { test, expect } from '@playwright/test'
import { Pool } from 'pg'

const hasDatabase = Boolean(process.env.DATABASE_URL)
const email = `e2e-auth-${Date.now()}@example.com`
const password = 'correct-horse-battery-staple'

test.describe('accounts', () => {
  test.skip(!hasDatabase, 'Requires DATABASE_URL and the local API')

  test.afterAll(async () => {
    if (!hasDatabase) return
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    await pool.query('delete from "user" where email = $1', [email]).catch(() => undefined)
    await pool.end()
  })

  test('sign up, sync, sign out, sign in and delete', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('#signup-name').fill('E2E Account')
    await page.locator('#signup-email').fill(email)
    await page.locator('#signup-password').fill(password)
    await page.locator('#signup-confirm').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/\/dashboard/)

    await page.goto('/account')
    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible()
    await page.locator('#account-hours').fill('8')
    await page.getByRole('button', { name: 'Save plan' }).click()
    await page.getByRole('button', { name: 'Save this browser to account' }).click()
    await expect(page.getByText('This browser’s data is now saved to your account.')).toBeVisible({
      timeout: 25_000,
    })

    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page).toHaveURL('http://127.0.0.1:4173/')

    await page.goto('/signin')
    await page.locator('#signin-email').fill(email)
    await page.locator('#signin-password').fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard/)

    await page.goto('/account')
    await expect(page.getByText('Your account has a saved state.')).toBeVisible()
    await page.locator('#account-delete').fill('delete')
    await page.getByRole('button', { name: 'Delete my account' }).click()
    await expect(page).toHaveURL('http://127.0.0.1:4173/')
  })
})
