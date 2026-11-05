import { loadContent } from './lib/load-content'

const { content, errors, warnings } = loadContent()

for (const warning of warnings) console.warn(`warning: ${warning}`)

if (!content || errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`)
  console.error(`\nValidation failed: ${errors.length} error(s), ${warnings.length} warning(s).`)
  process.exit(1)
}

const sources = content.sources
const primaries = sources.filter((source) => source.tier === 'primary').length
const secondaries = sources.filter((source) => source.tier === 'secondary').length
const community = sources.filter((source) => source.tier === 'community').length
const runnable = content.cheatsheets.reduce(
  (total, entry) => total + entry.snippets.filter((snippet) => snippet.runnable).length,
  0,
)
const quizzes = content.modules.reduce((total, module) => total + module.quiz.length, 0)

console.log('Content validation passed.')
console.log(
  `  ${content.modules.length} modules · ${content.cheatsheets.length} cheatsheets · ` +
    `${quizzes} quiz questions · ${runnable} executable snippets`,
)
console.log(
  `  ${content.claims.length} claims · ${sources.length} sources ` +
    `(${primaries} primary, ${secondaries} secondary, ${community} community)`,
)
if (warnings.length > 0) console.log(`  ${warnings.length} warning(s) — see above.`)
