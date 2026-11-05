import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = [
  ['/', 'home'],
  ['/start', 'placement'],
  ['/path', 'path'],
  ['/cheatsheets', 'cheatsheet library'],
  ['/cheatsheet/git-undo', 'cheatsheet detail'],
  ['/module/f-git', 'module'],
  ['/phase/F', 'phase'],
  ['/playbook', 'playbook'],
  ['/glossary', 'glossary'],
  ['/claims', 'claims'],
  ['/sources', 'sources'],
  ['/trends', 'trends'],
  ['/methodology', 'methodology'],
  ['/verification', 'verification'],
  ['/harnesses', 'harnesses'],
  ['/tools', 'tools'],
  ['/dashboard', 'dashboard'],
  ['/review', 'review'],
  ['/privacy', 'privacy'],
] as const

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    for (const [route, label] of routes) {
      test(`axe: no serious or critical issues on ${label}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
        await page.goto(route)
        const results = await new AxeBuilder({ page }).analyze()
        const serious = results.violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        )
        expect(
          serious,
          serious
            .map(
              (violation) =>
                `${violation.id} (${violation.impact}): ${violation.help}\n${violation.nodes
                  .map((node) => `  ${node.target.join(' ')}`)
                  .join('\n')}`,
            )
            .join('\n\n'),
        ).toEqual([])
      })
    }
  })
}
