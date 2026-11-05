import { loadContent } from './lib/load-content'

/**
 * Compare tool versions stamped on cheatsheets with the current release from a
 * registry. This is a review trigger, not an auto-updater: a flagged entry must
 * be re-read against the vendor docs before the stamp changes.
 *
 * Baseline tools are executed on a pinned version in CI. They are reported as
 * `baseline` rather than `behind`, so the weekly job does not chase a runtime
 * upgrade that would change what the snippets actually ran on.
 */

type Kind = 'npm' | 'pypi' | 'endoflife' | 'github'

const NPM: Record<string, string> = {
  React: 'react',
  TypeScript: 'typescript',
  Express: 'express',
  Zod: 'zod',
  'Drizzle ORM': 'drizzle-orm',
  'Drizzle Kit': 'drizzle-kit',
  'Better Auth': 'better-auth',
  Vitest: 'vitest',
  Playwright: '@playwright/test',
}

const PYPI: Record<string, string> = {
  PyTorch: 'torch',
  'scikit-learn': 'scikit-learn',
  pandas: 'pandas',
  Transformers: 'transformers',
  PEFT: 'peft',
}

const EOL: Record<string, string> = {
  'Node.js': 'nodejs',
  PostgreSQL: 'postgresql',
  Python: 'python',
  Docker: 'docker-engine',
}

const GITHUB: Record<string, string> = {
  pgvector: 'pgvector/pgvector',
}

const BASELINE = new Set(['Python', 'Node.js', 'PostgreSQL'])

type Result = {
  tool: string
  stamped: string
  latest: string
  kind: Kind | 'manual'
  status: 'current' | 'behind' | 'baseline' | 'manual' | 'error'
  entries: string[]
}

function majorMinor(version: string): [number, number] | null {
  const match = version.replace(/^v/, '').match(/(\d+)(?:\.(\d+))?/)
  if (!match) return null
  return [Number(match[1]), Number(match[2] ?? 0)]
}

function isBehind(stamped: string, latest: string): boolean {
  const a = majorMinor(stamped)
  const b = majorMinor(latest)
  if (!a || !b) return false
  return b[0] > a[0] || (b[0] === a[0] && b[1] > a[1])
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'cs-pathway-version-check/1.0 (+https://github.com/iftakharH)',
        accept: 'application/json',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function latestVersion(tool: string): Promise<{ version: string; kind: Kind } | null> {
  const npm = NPM[tool]
  if (npm) {
    const data = (await fetchJson(`https://registry.npmjs.org/${npm}/latest`)) as { version?: string }
    return data.version ? { version: data.version, kind: 'npm' } : null
  }

  const pypi = PYPI[tool]
  if (pypi) {
    const data = (await fetchJson(`https://pypi.org/pypi/${pypi}/json`)) as {
      info?: { version?: string }
    }
    return data.info?.version ? { version: data.info.version, kind: 'pypi' } : null
  }

  const eol = EOL[tool]
  if (eol) {
    const data = (await fetchJson(`https://endoflife.date/api/${eol}.json`)) as Array<{
      latest?: string
      lts?: string | boolean
    }>
    const latest = data[0]?.latest
    return latest ? { version: latest, kind: 'endoflife' } : null
  }

  const github = GITHUB[tool]
  if (github) {
    const data = (await fetchJson(`https://api.github.com/repos/${github}/tags`)) as Array<{
      name?: string
    }>
    const tag = data[0]?.name
    return tag ? { version: tag.replace(/^v/, ''), kind: 'github' } : null
  }

  return null
}

async function main() {
  const strict = process.argv.includes('--strict')
  const { content, errors } = loadContent()
  if (!content || errors.length > 0) {
    console.error('Content is invalid; run npm run validate first.')
    process.exit(1)
  }

  const byTool = new Map<string, { stamped: string; entries: string[] }>()
  for (const entry of content.cheatsheets) {
    const existing = byTool.get(entry.tool.name)
    if (existing) {
      existing.entries.push(entry.id)
      continue
    }
    byTool.set(entry.tool.name, { stamped: entry.tool.version, entries: [entry.id] })
  }

  const results: Result[] = []
  for (const [tool, info] of byTool) {
    try {
      const latest = await latestVersion(tool)
      if (!latest) {
        results.push({ tool, ...info, latest: '—', kind: 'manual', status: 'manual' })
        continue
      }
      const behind = isBehind(info.stamped, latest.version)
      const status = behind ? (BASELINE.has(tool) ? 'baseline' : 'behind') : 'current'
      results.push({ tool, ...info, latest: latest.version, kind: latest.kind, status })
    } catch (error) {
      results.push({
        tool,
        ...info,
        latest: `error: ${(error as Error).message.slice(0, 40)}`,
        kind: 'manual',
        status: 'error',
      })
    }
  }

  results.sort((a, b) => {
    const rank = { behind: 0, baseline: 1, error: 2, current: 3, manual: 4 }
    return rank[a.status] - rank[b.status] || a.tool.localeCompare(b.tool)
  })

  const pad = Math.max(...results.map((result) => result.tool.length), 10)
  console.log(`${'tool'.padEnd(pad)}  ${'stamped'.padEnd(12)} ${'latest'.padEnd(16)} status`)
  for (const result of results) {
    console.log(
      `${result.tool.padEnd(pad)}  ${result.stamped.padEnd(12)} ${result.latest.padEnd(16)} ${result.status}`,
    )
  }

  const behind = results.filter((result) => result.status === 'behind')
  const baseline = results.filter((result) => result.status === 'baseline')
  const manual = results.filter((result) => result.status === 'manual' || result.status === 'error')

  console.log('')
  console.log(
    `${results.filter((result) => result.status === 'current').length} current · ` +
      `${behind.length} behind · ${baseline.length} baseline · ${manual.length} manual`,
  )
  if (baseline.length > 0) {
    console.log(
      `Baseline (executed in CI, intentionally pinned): ${baseline.map((item) => item.tool).join(', ')}`,
    )
  }
  if (manual.length > 0) {
    console.log(
      `Manual review (no registry mapping or fetch failed): ${manual.map((item) => item.tool).join(', ')}`,
    )
  }

  if (strict && behind.length > 0) {
    console.error('')
    for (const result of behind) {
      console.error(`${result.tool}: stamped ${result.stamped}, latest ${result.latest}`)
      console.error(`  entries: ${result.entries.join(', ')}`)
    }
    console.error(`\n${behind.length} cheatsheet tool(s) are behind the latest release.`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
