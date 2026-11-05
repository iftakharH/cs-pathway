import { expect, test } from '@playwright/test'

test('guest can place, learn, quiz, submit a proof, pin and keep notes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stop collecting tutorials')

  await page.getByRole('link', { name: 'Find my starting point' }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find your first module')

  await page.getByRole('radio', { name: /git rebase origin\/main/ }).check()
  await page.getByRole('radio', { name: /dependency array is missing/ }).check()
  await page.getByRole('radio', { name: /Retrieval recall on a labelled set/ }).check()
  await page.getByRole('radio', { name: /Precision, recall and a majority-class baseline/ }).check()
  await page.getByRole('radio', { name: /They have already paid/ }).check()
  await page.getByRole('button', { name: 'Show my starting point' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Start at phase F')
  await page.getByRole('link', { name: /Start “Git: changes you can undo”/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Git: changes you can undo')

  // Answer every quiz question by choosing the first option.
  const quizGroups = page.locator('fieldset').filter({ has: page.getByText(/^Question \d of 5$/) })
  const count = await quizGroups.count()
  expect(count).toBe(5)
  for (let index = 0; index < count; index += 1) {
    await quizGroups.nth(index).getByRole('radio').first().check()
  }
  await expect(page.getByText(/You scored \d\/5/)).toBeVisible()

  // Score the three rubric criteria at level 2 and submit a proof.
  const proof = page.locator('#proof')
  for (const offset of [2, 6, 10]) {
    await proof.getByRole('radio').nth(offset).check()
  }
  await proof.locator('#repo-f-git').fill('https://github.com/example/recovery')
  await proof.getByRole('button', { name: 'Save and mark done' }).click()
  await expect(proof.getByText('You marked this module done.')).toBeVisible()

  await page.goto('/dashboard')
  await expect(page.getByText('Modules with evidence')).toBeVisible()
  await expect(page.getByText('1/31')).toBeVisible()

  await page.goto('/cheatsheet/git-undo')
  await page.getByRole('button', { name: 'Pin git-undo' }).click()
  await page.goto('/pins')
  await expect(page.getByText('Undo a change without losing the wrong thing').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export Markdown' })).toBeEnabled()

  await page.goto('/module/f-git')
  await page.getByLabel('Your note').fill('The reflog saved me after a hard reset.')
  await page.getByRole('button', { name: 'Save note' }).click()
  await expect(page.getByText('Note saved in this browser.')).toBeVisible()
  await page.goto('/notes')
  await expect(page.getByText('The reflog saved me after a hard reset.')).toBeVisible()
})

test('every phase has modules and every module has a proof', async ({ page }) => {
  for (const phase of ['F', '1', '2', '3', 'S']) {
    await page.goto(`/phase/${phase}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const moduleLinks = page.locator('a[href^="/module/"]')
    expect(await moduleLinks.count()).toBeGreaterThan(0)
  }

  const modules = ['f-git', 'p1-react', 'p2-rag', 'p3-pytorch', 's1-should-i-start']
  for (const id of modules) {
    await page.goto(`/module/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('#proof')).toContainText('Score yourself against the rubric')
  }
})

test('cheatsheet search narrows the library and opens an entry', async ({ page }) => {
  await page.goto('/cheatsheets')
  await expect(page.getByText(/\d+ entries/).first()).toBeVisible()
  await page.locator('#cheat-search').fill('rebase')
  await expect(page.getByText('Choose rebase or merge').first()).toBeVisible()
  await page.getByRole('link', { name: 'Choose rebase or merge' }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Choose rebase or merge')
  await expect(page.getByText('Executed by the snippet test suite on every push.').or(page.getByText('Checked against the official docs, not executed.'))).toBeVisible()
})

test('harness matrix filters and exposes file paths', async ({ page }) => {
  await page.goto('/harnesses')
  const table = page.locator('table')
  await expect(table.getByText('Claude Code')).toBeVisible()
  await expect(table.getByText('Gemini CLI')).toBeVisible()

  await page.getByRole('button', { name: 'Hide legacy' }).click()
  await expect(table.getByText('Gemini CLI')).toHaveCount(0)
  await expect(table.getByText('Codex CLI')).toBeVisible()

  await page.getByRole('button', { name: 'Reset' }).click()
  await table.getByRole('button', { name: /Codex CLI/ }).click()
  await expect(page.getByRole('heading', { name: 'Codex CLI' })).toBeVisible()
  await expect(page.getByText('.agents/skills or $HOME/.agents/skills')).toBeVisible()
})

test('startup tools calculate and persist', async ({ page }) => {
  await page.goto('/tools?tool=dilution')
  await expect(page.getByText('2.5%', { exact: true })).toBeVisible()
  await page.locator('#dilution-investment').fill('100000')
  await expect(page.getByText('0.67%', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Pricing' }).click()
  await expect(page.getByText('$40')).toBeVisible()
  await expect(page.getByText('70%', { exact: true }).last()).toBeVisible()

  await page.getByRole('button', { name: 'Interview log' }).click()
  await page.locator('#interview-person').fill('Ada')
  await page.locator('#interview-problem').fill('Loses track of invoices')
  await page.getByRole('button', { name: 'Add conversation' }).click()
  await expect(page.getByText('Loses track of invoices')).toBeVisible()
})
