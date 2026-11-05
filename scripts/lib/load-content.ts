import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import type { ZodType } from 'zod'
import {
  BANNED_PHRASES,
  CheatsheetsFileSchema,
  ClaimsFileSchema,
  GlossaryFileSchema,
  HarnessesFileSchema,
  ModulesFileSchema,
  PhasesFileSchema,
  PlaybookFileSchema,
  SiteSchema,
  SourcesFileSchema,
  TrendsFileSchema,
  type Claim,
  type Content,
  type PhaseId,
  type Source,
} from '../../src/content/schema'

const CONTENT_DIR = join(process.cwd(), 'content')
const PHASE_ORDER: Record<PhaseId, number> = { F: 0, '1': 1, '2': 2, '3': 3, S: 4 }

export type LoadResult = {
  content: Content | null
  errors: string[]
  warnings: string[]
}

function readYaml(path: string): unknown {
  const raw = readFileSync(path, 'utf8')
  try {
    return parse(raw)
  } catch (error) {
    throw new Error(`${path}: invalid YAML — ${(error as Error).message}`, { cause: error })
  }
}

function readCollection<T>(
  file: string,
  schema: ZodType<T>,
  label: string,
  errors: string[],
): T | null {
  const path = join(CONTENT_DIR, file)
  if (!existsSync(path)) {
    errors.push(`${label}: missing file content/${file}`)
    return null
  }
  const result = schema.safeParse(readYaml(path))
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${label} (content/${file}): ${issue.path.join('.') || '(root)'} — ${issue.message}`)
    }
    return null
  }
  return result.data
}

function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function independentSecondary(sources: Source[]): number {
  const publishers = new Set(
    sources.filter((source) => source.tier === 'secondary').map((source) => source.publisher),
  )
  return publishers.size
}

function checkClaimRules(claims: Claim[], sources: Source[], errors: string[], warnings: string[]) {
  const byId = new Map(sources.map((source) => [source.id, source]))
  const seen = new Set<string>()

  for (const claim of claims) {
    if (seen.has(claim.id)) errors.push(`claims: duplicate id ${claim.id}`)
    seen.add(claim.id)

    if (claim.reviewAfter < claim.verifiedAt) {
      errors.push(`claims: ${claim.id} reviewAfter is before verifiedAt`)
    }
    if (claim.verifiedAt > today()) {
      errors.push(`claims: ${claim.id} verifiedAt is in the future`)
    }

    const linked = claim.sourceIds.map((id) => byId.get(id))
    for (const [index, source] of linked.entries()) {
      if (!source) {
        errors.push(`claims: ${claim.id} references unknown source ${claim.sourceIds[index]}`)
      }
    }
    const found = linked.filter((source): source is Source => Boolean(source))

    if (claim.kind === 'editorial') {
      if (claim.sourceIds.length > 0 && found.length !== claim.sourceIds.length) {
        errors.push(`claims: ${claim.id} has broken editorial source references`)
      }
      continue
    }

    if (found.length === 0) {
      errors.push(`claims: ${claim.id} is ${claim.kind} but has no source`)
      continue
    }

    const primaries = found.filter((source) => source.tier === 'primary')
    const secondaries = independentSecondary(found)
    if (primaries.length === 0 && secondaries < 2) {
      errors.push(
        `claims: ${claim.id} needs one primary source or two independent secondary sources ` +
          `(found ${found.length} source(s))`,
      )
    }
    if (found.length === 1 && found[0]?.tier === 'community') {
      errors.push(`claims: ${claim.id} cannot rely on a single community source`)
    }

    if (claim.kind === 'forecast') {
      if (!claim.forecastBy) errors.push(`claims: ${claim.id} is a forecast without forecastBy`)
      if (!claim.falsifiedBy) {
        errors.push(`claims: ${claim.id} is a forecast without falsifiedBy (what would disprove it)`)
      }
    }

    for (const source of found) {
      if (source.retrievedAt < claim.verifiedAt) {
        warnings.push(
          `claims: ${claim.id} verified after source ${source.id} was retrieved — re-check the source`,
        )
      }
    }
  }
}

function scanBannedPhrases(content: Content, errors: string[]) {
  const surfaces: Array<{ where: string; text: string }> = [
    { where: 'site.tagline', text: content.site.tagline },
    { where: 'site.statement', text: content.site.statement },
    ...content.claims.map((claim) => ({ where: `claim ${claim.id}`, text: claim.statement })),
    ...content.modules.flatMap((module) => [
      { where: `module ${module.id} summary`, text: module.summary },
      { where: `module ${module.id} whyItMatters`, text: module.whyItMatters },
    ]),
    ...content.trends.map((trend) => ({ where: `trend ${trend.id}`, text: trend.body })),
    ...content.playbook.map((entry) => ({ where: `playbook ${entry.id}`, text: entry.summary })),
  ]

  for (const surface of surfaces) {
    const haystack = surface.text.toLowerCase()
    for (const phrase of BANNED_PHRASES) {
      if (phrase === 'secret') continue // legitimate in "secrets management"
      const pattern = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'i')
      if (pattern.test(haystack)) {
        errors.push(`copy: banned phrase "${phrase}" in ${surface.where}`)
      }
    }
  }
}

export function loadContent(): LoadResult {
  const errors: string[] = []
  const warnings: string[] = []

  const site = (() => {
    const path = join(CONTENT_DIR, 'site.yaml')
    if (!existsSync(path)) {
      errors.push('site: missing file content/site.yaml')
      return null
    }
    const result = SiteSchema.safeParse(readYaml(path))
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`site (content/site.yaml): ${issue.path.join('.')} — ${issue.message}`)
      }
      return null
    }
    return result.data
  })()

  const phases = readCollection('phases.yaml', PhasesFileSchema, 'phases', errors)?.phases ?? null
  const sources = readCollection('sources.yaml', SourcesFileSchema, 'sources', errors)?.sources ?? null
  const claims = readCollection('claims.yaml', ClaimsFileSchema, 'claims', errors)?.claims ?? null
  const playbook = readCollection('playbook.yaml', PlaybookFileSchema, 'playbook', errors)?.entries ?? null
  const harnesses =
    readCollection('harnesses.yaml', HarnessesFileSchema, 'harnesses', errors)?.harnesses ?? null
  const glossary =
    readCollection('glossary.yaml', GlossaryFileSchema, 'glossary', errors)?.terms ?? null
  const trends = readCollection('trends.yaml', TrendsFileSchema, 'trends', errors)?.trends ?? null

  const modules = readDirCollection('modules', ModulesFileSchema, 'modules', errors, (data) => data.modules)
  const cheatsheets = readDirCollection(
    'cheatsheets',
    CheatsheetsFileSchema,
    'cheatsheets',
    errors,
    (data) => data.entries,
  )

  if (!site || !phases || !sources || !claims || !modules || !cheatsheets || !playbook || !harnesses || !glossary || !trends) {
    return { content: null, errors, warnings }
  }

  const content: Content = { site, phases, sources, claims, modules, cheatsheets, playbook, harnesses, glossary, trends }

  // ---- unique ids and references ----
  const sourceIds = new Set<string>()
  for (const source of sources) {
    if (sourceIds.has(source.id)) errors.push(`sources: duplicate id ${source.id}`)
    sourceIds.add(source.id)
  }

  checkClaimRules(claims, sources, errors, warnings)

  const claimIds = new Set(claims.map((claim) => claim.id))
  const moduleIds = new Set<string>()
  const cheatIds = new Set<string>()
  const playbookIds = new Set(playbook.map((entry) => entry.id))

  const phaseIds = new Set(phases.map((phase) => phase.id))
  if (phases.length !== 5) errors.push(`phases: expected 5 phases, found ${phases.length}`)
  for (const phase of phases) {
    if (!phaseIds.has(phase.id)) errors.push(`phases: unknown phase ${phase.id}`)
  }
  if (new Set(phases.map((phase) => phase.order)).size !== phases.length) {
    errors.push('phases: duplicate order values')
  }

  for (const module of modules) {
    if (moduleIds.has(module.id)) errors.push(`modules: duplicate id ${module.id}`)
    moduleIds.add(module.id)
  }

  for (const entry of cheatsheets) {
    if (cheatIds.has(entry.id)) errors.push(`cheatsheets: duplicate id ${entry.id}`)
    cheatIds.add(entry.id)
  }

  const ordersByPhase = new Map<PhaseId, Set<number>>()
  for (const module of modules) {
    const orders = ordersByPhase.get(module.phase) ?? new Set<number>()
    if (orders.has(module.order)) {
      errors.push(`modules: ${module.id} reuses order ${module.order} in phase ${module.phase}`)
    }
    orders.add(module.order)
    ordersByPhase.set(module.phase, orders)

    if (!phaseIds.has(module.phase)) errors.push(`modules: ${module.id} has unknown phase ${module.phase}`)

    for (const claimId of module.claimIds) {
      if (!claimIds.has(claimId)) errors.push(`modules: ${module.id} references unknown claim ${claimId}`)
    }
    for (const cheatId of module.cheatsheetIds) {
      if (!cheatIds.has(cheatId)) {
        errors.push(`modules: ${module.id} references unknown cheatsheet ${cheatId}`)
      }
    }
    for (const playbookId of module.playbookIds) {
      if (!playbookIds.has(playbookId)) {
        errors.push(`modules: ${module.id} references unknown playbook entry ${playbookId}`)
      }
    }
    for (const prerequisite of module.prerequisites) {
      if (prerequisite === module.id) errors.push(`modules: ${module.id} lists itself as a prerequisite`)
      const target = modules.find((candidate) => candidate.id === prerequisite)
      if (!target) {
        errors.push(`modules: ${module.id} references unknown prerequisite ${prerequisite}`)
        continue
      }
      if (PHASE_ORDER[target.phase] > PHASE_ORDER[module.phase]) {
        errors.push(`modules: ${module.id} depends on later-phase module ${prerequisite}`)
      }
    }

    const free = module.resources.filter((resource) => resource.price === 'free')
    const official = module.resources.filter((resource) => resource.officialVendor)
    if (free.length === 0) errors.push(`modules: ${module.id} needs at least one free resource`)
    if (official.length === 0) errors.push(`modules: ${module.id} needs at least one official resource`)
    if (new Set(module.quiz.map((q) => q.id)).size !== module.quiz.length) {
      errors.push(`modules: ${module.id} has duplicate quiz ids`)
    }
    if (module.phase === 'S' && !module.riskNote) {
      errors.push(`modules: ${module.id} is a startup module and needs a riskNote`)
    }
    if (module.proof.rubric.length < 3) errors.push(`modules: ${module.id} needs at least 3 rubric criteria`)
  }

  for (const entry of cheatsheets) {
    for (const other of entry.seeAlso) {
      if (!cheatIds.has(other)) errors.push(`cheatsheets: ${entry.id} seeAlso references unknown ${other}`)
    }
    for (const tag of entry.tags) {
      if (tag.trim() !== tag) errors.push(`cheatsheets: ${entry.id} has a tag with stray whitespace`)
    }
    if (entry.tool.verifiedOn > today()) {
      errors.push(`cheatsheets: ${entry.id} tool verifiedOn is in the future`)
    }
  }

  for (const entry of playbook) {
    for (const tool of entry.tools) {
      if (tool.verifiedOn > today()) errors.push(`playbook: ${entry.id} tool ${tool.name} verified in the future`)
      if (!tool.verified && tool.install) {
        warnings.push(`playbook: ${entry.id} hides an unverified install line for ${tool.name}`)
      }
    }
  }

  for (const trend of trends) {
    for (const claimId of trend.claimIds) {
      if (!claimIds.has(claimId)) errors.push(`trends: ${trend.id} references unknown claim ${claimId}`)
    }
    if (trend.level === 'forecast' && !trend.falsifiedBy) {
      errors.push(`trends: ${trend.id} is a forecast and needs falsifiedBy`)
    }
  }

  for (const term of glossary) {
    if (term.sourceUrl && !term.sourceUrl.startsWith('https://')) {
      errors.push(`glossary: ${term.term} source must be https`)
    }
  }

  if (new Set(glossary.map((term) => term.term.toLowerCase())).size !== glossary.length) {
    errors.push('glossary: duplicate terms')
  }

  scanBannedPhrases(content, errors)

  const stale = claims.filter((claim) => claim.reviewAfter < today())
  if (stale.length > 0) {
    warnings.push(
      `claims: ${stale.length} claim(s) past reviewAfter and showing as needs-re-check: ` +
        stale.map((claim) => claim.id).join(', '),
    )
  }

  return { content, errors, warnings }
}

function readDirCollection<T, U>(
  dir: string,
  schema: ZodType<T>,
  label: string,
  errors: string[],
  pick: (data: T) => U[],
): U[] | null {
  const path = join(CONTENT_DIR, dir)
  if (!existsSync(path)) {
    errors.push(`${label}: missing directory content/${dir}`)
    return null
  }
  const files = readdirSync(path).filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
  if (files.length === 0) {
    errors.push(`${label}: no YAML files in content/${dir}`)
    return null
  }
  const all: U[] = []
  for (const file of files) {
    const result = schema.safeParse(readYaml(join(path, file)))
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${label} (content/${dir}/${file}): ${issue.path.join('.')} — ${issue.message}`)
      }
      continue
    }
    all.push(...pick(result.data))
  }
  return all
}
