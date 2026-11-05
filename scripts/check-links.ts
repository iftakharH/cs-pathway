import { loadContent } from './lib/load-content'

type LinkRecord = { url: string; where: string }

const TIMEOUT_MS = 20_000
const CONCURRENCY = 6

function collect(): LinkRecord[] {
  const { content, errors } = loadContent()
  if (!content || errors.length > 0) {
    console.error('Content is invalid; run npm run validate first.')
    process.exit(1)
  }

  const links: LinkRecord[] = []
  const push = (url: string, where: string) => links.push({ url, where })

  for (const source of content.sources) push(source.url, `source ${source.id}`)
  for (const claim of content.claims) {
    for (const id of claim.sourceIds) {
      const source = content.sources.find((item) => item.id === id)
      if (source) push(source.url, `claim ${claim.id}`)
    }
  }
  for (const module of content.modules) {
    for (const resource of module.resources) push(resource.url, `module ${module.id} resource`)
    for (const question of module.quiz) push(question.sourceUrl, `module ${module.id} quiz ${question.id}`)
  }
  for (const entry of content.cheatsheets) push(entry.sourceUrl, `cheatsheet ${entry.id}`)
  for (const entry of content.playbook) {
    for (const tool of entry.tools) push(tool.sourceUrl, `playbook ${entry.id}`)
  }
  for (const harness of content.harnesses) {
    push(harness.url, `harness ${harness.id}`)
    push(harness.pricingUrl, `harness ${harness.id} pricing`)
  }
  for (const term of content.glossary) push(term.sourceUrl, `glossary ${term.term}`)

  const unique = new Map<string, string[]>()
  for (const link of links) {
    const list = unique.get(link.url) ?? []
    list.push(link.where)
    unique.set(link.url, list)
  }
  return [...unique.entries()].map(([url, where]) => ({ url, where: where.join(', ') }))
}

async function check(link: LinkRecord): Promise<{ link: LinkRecord; status: number | string; ok: boolean }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(link.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'cs-pathway-link-check/1.0 (+https://github.com/iftakharH; source verification)',
        accept: 'text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5',
      },
    })
    // Release the body; we only need the status.
    await response.body?.cancel()
    return { link, status: response.status, ok: response.status < 400 }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { link, status: message.slice(0, 80), ok: false }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const links = collect()
  console.log(`Checking ${links.length} unique links…`)

  const results: Array<{ link: LinkRecord; status: number | string; ok: boolean }> = []
  let cursor = 0

  async function worker() {
    while (cursor < links.length) {
      const index = cursor
      cursor += 1
      const link = links[index]
      if (!link) return
      results.push(await check(link))
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  const broken = results.filter((result) => !result.ok)
  const blocked = broken.filter(
    (result) => typeof result.status === 'number' && [401, 403, 429].includes(result.status),
  )
  const dead = broken.filter((result) => !blocked.includes(result))

  console.log(`  ${results.length - broken.length} reachable`)
  if (blocked.length > 0) {
    console.log(`  ${blocked.length} blocked by the host (401/403/429) — check manually:`)
    for (const result of blocked) console.log(`    ${result.status} ${result.link.url}`)
  }
  if (dead.length > 0) {
    console.error(`  ${dead.length} broken:`)
    for (const result of dead) {
      console.error(`    ${result.status} ${result.link.url}`)
      console.error(`      used by ${result.link.where}`)
    }
    process.exit(1)
  }
  console.log('No broken links found.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
