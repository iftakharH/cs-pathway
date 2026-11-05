import { SITE } from '@/content/generated/site'
import { MODULES } from '@/content/generated/modules'
import { CHEATSHEETS } from '@/content/generated/cheatsheets'
import { PLAYBOOK } from '@/content/generated/playbook'
import { HARNESSES } from '@/content/generated/harnesses'
import { GLOSSARY } from '@/content/generated/glossary'
import { TRENDS } from '@/content/generated/trends'
import { CONTENT_MANIFEST } from '@/content/generated/manifest'
import { PHASE_ORDER } from '@/lib/phases'
import { claims } from '@/lib/claims'
import type {
  CheatEntry,
  Claim,
  Module,
  PlaybookEntry,
  Trend,
} from '@/content/schema'

/**
 * Full content accessors. Import this from lazy routes that need complete records
 * (module pages, cheatsheet detail, pins, search). Public landing/path pages should
 * import from `catalog`, `claims`, `phases` and `site` to keep the initial bundle small.
 */
export const site = SITE
export { phases, PHASE_ORDER, getPhase } from '@/lib/phases'
export { claims, sources, getClaim, getSource, sourcesForClaim, isStale } from '@/lib/claims'
export { todayIso } from '@/lib/dates'
export { slugify } from '@/lib/catalog'

export const modules: Module[] = MODULES
export const cheatsheets: CheatEntry[] = CHEATSHEETS
export const playbook: PlaybookEntry[] = PLAYBOOK
export const harnesses = HARNESSES
export const glossary = GLOSSARY
export const trends: Trend[] = TRENDS
export const manifest = CONTENT_MANIFEST

const moduleById = new Map(modules.map((module) => [module.id, module]))
const cheatById = new Map(cheatsheets.map((entry) => [entry.id, entry]))
const playbookById = new Map(playbook.map((entry) => [entry.id, entry]))
const claimById = new Map(claims.map((claim) => [claim.id, claim]))

export function getModule(id: string | undefined): Module | undefined {
  return id ? moduleById.get(id) : undefined
}

export function getCheat(id: string | undefined): CheatEntry | undefined {
  return id ? cheatById.get(id) : undefined
}

export function getPlaybook(id: string): PlaybookEntry | undefined {
  return playbookById.get(id)
}

export function claimsForModule(module: Module): Claim[] {
  return module.claimIds
    .map((id) => claimById.get(id))
    .filter((claim): claim is Claim => Boolean(claim))
}

export function cheatsheetsForModule(module: Module): CheatEntry[] {
  return module.cheatsheetIds
    .map((id) => cheatById.get(id))
    .filter((entry): entry is CheatEntry => Boolean(entry))
}

export function orderedModules(): Module[] {
  return [...modules].sort((a, b) => {
    const phaseDiff = PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase)
    return phaseDiff !== 0 ? phaseDiff : a.order - b.order
  })
}

export function nextModule(id: string): Module | undefined {
  const ordered = orderedModules()
  const index = ordered.findIndex((module) => module.id === id)
  return index >= 0 ? ordered[index + 1] : undefined
}

export function previousModule(id: string): Module | undefined {
  const ordered = orderedModules()
  const index = ordered.findIndex((module) => module.id === id)
  return index > 0 ? ordered[index - 1] : undefined
}

export function trendLevelLabel(level: Trend['level']): string {
  return level === 'observed' ? 'Observed in 2026' : level === 'emerging' ? 'Emerging' : 'Forecast'
}

export function moduleStatusLabel(status: string): string {
  switch (status) {
    case 'skipped':
      return 'Skipped'
    case 'in_progress':
      return 'In progress'
    case 'proof_submitted':
      return 'Proof submitted'
    case 'done':
      return 'Done'
    default:
      return 'Not started'
  }
}
