import { CATALOG } from '@/content/generated/catalog'
import type { CheatEntry, CheatIndexEntry, ModuleSummary, PhaseId } from '@/content/schema'

export const moduleSummaries: ModuleSummary[] = CATALOG.modules
export const cheatsheetIndex: CheatIndexEntry[] = CATALOG.cheatsheets
export const featuredCheat: CheatEntry = CATALOG.featuredCheat

const summaryById = new Map(moduleSummaries.map((module) => [module.id, module]))

export function getModuleSummary(id: string | undefined): ModuleSummary | undefined {
  return id ? summaryById.get(id) : undefined
}

export function phaseModules(id: PhaseId): ModuleSummary[] {
  return moduleSummaries
    .filter((module) => module.phase === id)
    .sort((a, b) => a.order - b.order)
}

export function phaseHours(id: PhaseId): { min: number; max: number } {
  return phaseModules(id).reduce(
    (total, module) => ({
      min: total.min + module.estHours.min,
      max: total.max + module.estHours.max,
    }),
    { min: 0, max: 0 },
  )
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function cheatsheetsByTopic(): Array<{
  topic: string
  slug: string
  entries: CheatIndexEntry[]
}> {
  const byTopic = new Map<string, CheatIndexEntry[]>()
  for (const entry of cheatsheetIndex) {
    const list = byTopic.get(entry.topic) ?? []
    list.push(entry)
    byTopic.set(entry.topic, list)
  }
  return [...byTopic.entries()]
    .map(([topic, entries]) => ({
      topic,
      slug: slugify(topic),
      entries: [...entries].sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.topic.localeCompare(b.topic))
}

export function topics(): string[] {
  return [...new Set(cheatsheetIndex.map((entry) => entry.topic))].sort()
}

export function tags(): string[] {
  return [...new Set(cheatsheetIndex.flatMap((entry) => entry.tags))].sort()
}
