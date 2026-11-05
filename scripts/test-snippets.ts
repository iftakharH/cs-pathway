import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { loadContent } from './lib/load-content'
import type { CheatEntry, Snippet } from '../src/content/schema'

const TMP_DIR = join(process.cwd(), '.tmp-snippets')
const TSX = join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs')
const TSC = join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc')

type RunResult = { code: number; stdout: string; stderr: string; timedOut: boolean }

function run(command: string, args: string[], timeoutMs = 30_000): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutMs)

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code: code ?? 1, stdout, stderr, timedOut })
    })
    child.on('error', (error) => {
      clearTimeout(timer)
      resolve({ code: 1, stdout, stderr: `${stderr}${String(error)}`, timedOut: false })
    })
  })
}

function extensionFor(lang: Snippet['lang']): string {
  switch (lang) {
    case 'js':
      return 'mjs'
    case 'ts':
    case 'tsx':
      return 'ts'
    case 'python':
      return 'py'
    default:
      return 'txt'
  }
}

function rowsOf(results: unknown): unknown[][] {
  const list = Array.isArray(results) ? results : []
  type ResultShape = { rows?: Record<string, unknown>[]; fields?: { name: string }[] }
  const withRows = (list as ResultShape[]).filter(
    (result) => Array.isArray(result.rows) && (result.rows?.length ?? 0) > 0,
  )
  const last = withRows[withRows.length - 1]
  if (!last?.rows) return []
  return last.rows.map((row) =>
    (last.fields ?? []).map((field) => row[field.name]),
  )
}

async function testSnippet(entry: CheatEntry, snippet: Snippet, index: number): Promise<string[]> {
  const failures: string[] = []
  const label = `${entry.id} [${index + 1}] ${snippet.lang}`
  const file = join(TMP_DIR, `${entry.id}-${index}.${extensionFor(snippet.lang)}`)

  if (snippet.lang === 'sql') {
    const db = new PGlite()
    try {
      const results = await db.exec(snippet.code)
      const actual = rowsOf(results)
      const expected = snippet.expectRows
      if (!expected) {
        failures.push(`${label}: no expectRows declared`)
      } else if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        failures.push(
          `${label}: rows differ\n  expected ${JSON.stringify(expected)}\n  actual   ${JSON.stringify(actual)}`,
        )
      }
    } catch (error) {
      failures.push(`${label}: SQL failed — ${(error as Error).message}`)
    } finally {
      await db.close()
    }
    return failures
  }

  writeFileSync(file, snippet.code, 'utf8')

  if (snippet.lang === 'ts' || snippet.lang === 'tsx') {
    const typecheck = await run(process.execPath, [
      TSC,
      '--noEmit',
      '--strict',
      '--ignoreConfig',
      '--target',
      'ES2022',
      '--module',
      'ESNext',
      '--moduleResolution',
      'Bundler',
      '--skipLibCheck',
      '--types',
      'node',
      file,
    ])
    if (typecheck.code !== 0) {
      failures.push(`${label}: typecheck failed\n${typecheck.stdout}${typecheck.stderr}`)
      return failures
    }
  }

  const result =
    snippet.lang === 'python'
      ? await run(process.platform === 'win32' ? 'python' : 'python3', [file])
      : snippet.lang === 'js'
        ? await run(process.execPath, [file])
        : await run(process.execPath, [TSX, file])

  if (result.timedOut) {
    failures.push(`${label}: timed out after 30s`)
    return failures
  }
  if (result.code !== 0) {
    failures.push(`${label}: exited ${result.code}\n${result.stdout}${result.stderr}`)
    return failures
  }

  const expected = snippet.expectStdout ?? ''
  const actual = result.stdout.trim()
  if (actual !== expected.trim()) {
    failures.push(`${label}: stdout differs\n  expected ${JSON.stringify(expected)}\n  actual   ${JSON.stringify(actual)}`)
  }
  return failures
}

async function main() {
  const { content, errors } = loadContent()
  if (!content || errors.length > 0) {
    console.error('Content is invalid; run npm run validate first.')
    process.exit(1)
  }

  const runnable: Array<{ entry: CheatEntry; snippet: Snippet; index: number }> = []
  for (const entry of content.cheatsheets) {
    entry.snippets.forEach((snippet, index) => {
      if (snippet.runnable) runnable.push({ entry, snippet, index })
    })
  }

  if (runnable.length === 0) {
    console.error('No runnable snippets found. That is a failure, not a pass.')
    process.exit(1)
  }

  rmSync(TMP_DIR, { recursive: true, force: true })
  mkdirSync(TMP_DIR, { recursive: true })

  const failures: string[] = []
  for (const item of runnable) {
    const result = await testSnippet(item.entry, item.snippet, item.index)
    if (result.length > 0) {
      failures.push(...result)
      console.log(`FAIL ${item.entry.id} [${item.index + 1}] ${item.snippet.lang}`)
    } else {
      console.log(`PASS ${item.entry.id} [${item.index + 1}] ${item.snippet.lang}`)
    }
  }

  rmSync(TMP_DIR, { recursive: true, force: true })

  console.log('')
  if (failures.length > 0) {
    for (const failure of failures) console.error(failure)
    console.error(`\n${failures.length} snippet failure(s) across ${runnable.length} executable snippets.`)
    process.exit(1)
  }
  console.log(`${runnable.length} executable snippets passed.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
