import { loadContent } from './lib/load-content'

function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const { content, errors } = loadContent()

if (!content || errors.length > 0) {
  console.error('Content is invalid; run npm run validate first.')
  process.exit(1)
}

const now = today()
const stale = content.claims.filter((claim) => claim.reviewAfter < now)

if (stale.length === 0) {
  console.log(`No claims past their review date as of ${now}.`)
  process.exit(0)
}

console.error(`${stale.length} claim(s) need re-checking as of ${now}:`)
for (const claim of stale) {
  console.error(`  ${claim.id} — reviewAfter ${claim.reviewAfter} — ${claim.statement.slice(0, 120)}`)
}
process.exit(1)
